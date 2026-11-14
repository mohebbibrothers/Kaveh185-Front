import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

/**
 * آدرس پایهٔ API.
 *
 * در مرورگر: مسیر نسبی `/api/...` تا درخواست از همان دامنه برود (بدون CORS،
 * بدون لو رفتن توکن). در سرور (RSC/SSG) `fetch` به URL مطلق نیاز دارد، پس
 * NEXT_PUBLIC_API_ORIGIN را جلو می‌گذاریم و اگر نبود، origin خودِ سایت.
 */
export function resolveBase(): string {
  /**
   * راه فرار برای محیط تست: jsdom پنجره دارد ولی Request آن (undici) آدرس
   * مطلق می‌خواهد و مسیر نسبی را رد می‌کند. این پرچم فقط در vitest ست
   * می‌شود، پس رفتار مرورگر (مسیر نسبی) دست‌نخورده می‌ماند.
   */
  if (typeof window !== "undefined" && !process.env.K185_ABSOLUTE_BASE) return "";
  const origin =
    process.env.NEXT_PUBLIC_API_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000");
  return origin.replace(/\/$/, "");
}

/**
 * پاکت یکنواخت بک‌اند: همهٔ پاسخ‌ها { success, status_code, code, message, trace_id, data }
 * کلاینت، `data` را باز می‌کند تا مصرف‌کننده با شکل دومرحله‌ای درگیر نشود.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  status_code: number;
  code: string;
  message: string;
  trace_id: string;
  data: T;
  errors?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly traceId: string;
  readonly errors?: Record<string, unknown>;

  constructor(init: {
    message: string;
    code: string;
    status: number;
    traceId?: string;
    errors?: Record<string, unknown>;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.code = init.code;
    this.status = init.status;
    this.traceId = init.traceId ?? "";
    this.errors = init.errors;
  }

  /** پیامِ مناسبِ نمایش روی فرم برای خطاهای اعتبارسنجی فیلد‌به‌فیلد */
  fieldError(field: string): string | undefined {
    const v = this.errors?.[field];
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    if (typeof v === "string") return v;
    return undefined;
  }
}

const traceMiddleware: Middleware = {
  onRequest({ request }) {
    // شناسهٔ همبستگی برای دیباگ بین فرانت و بک‌اند
    request.headers.set("X-Client", "kaveh185-front");
    return request;
  },
  onResponse({ response }) {
    return response;
  },
};

const base = createClient<paths>({
  baseUrl: resolveBase(),
  credentials: "same-origin",
  headers: { Accept: "application/json" },
});
base.use(traceMiddleware);

/**
 * GET با باز کردن پاکت و خطای دامنه‌ای.
 *
 * چرا `path: string` و نه `keyof paths`؟ چون openapi-fetch برای مسیرهای
 * پارامتری، تایپ‌های شرطی پیچیده می‌سازد که نتیجه‌اش در لایهٔ مصرف‌کننده
 * فقط نویز است. اعتبارسنجیِ واقعی قرارداد با zod انجام می‌شود (بند «landing.ts»)،
 * پس اینجا سادگی را انتخاب می‌کنیم و صحت را در زمان اجرا می‌سنجیم.
 */
export async function apiGet(path: string, init?: RequestInit): Promise<unknown> {
  const res = await base.GET(path as never, { ...(init ?? {}) } as never);
  return unwrap(res);
}

export async function apiPost(
  path: string,
  body?: unknown,
  init?: RequestInit & { idempotencyKey?: string },
): Promise<unknown> {
  const headers = new Headers(init?.headers);
  if (init?.idempotencyKey) headers.set("Idempotency-Key", init.idempotencyKey);
  // idempotencyKey یک گزینهٔ دامنه‌ای است، نه گزینهٔ fetch — نباید در RequestInit بماند
  const requestInit: RequestInit = { ...(init ?? {}) };
  if ("idempotencyKey" in requestInit) {
    delete (requestInit as RequestInit & { idempotencyKey?: string }).idempotencyKey;
  }
  const res = await base.POST(
    path as never,
    {
      ...requestInit,
      body: body as never,
      headers,
    } as never,
  );
  return unwrap(res);
}

function unwrap(res: { data?: unknown; error?: unknown; response: Response }): unknown {
  const { data, error, response } = res;

  /**
   * تشخیص «پاکت»: بک‌اند همیشه { success, code, message, trace_id, data } می‌دهد.
   * هر چیز دیگری (رشتهٔ HTML از یک پروکسی، بدنهٔ خالی، آرایه) پاکت نیست و
   * نباید با پیام گمراه‌کنندهٔ «خطای نامشخص» گزارش شود.
   */
  const payload = data ?? error;
  const isEnvelope =
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    "success" in payload;

  if (!isEnvelope) {
    if (!response.ok) {
      throw new ApiError({
        message:
          response.status >= 500
            ? "سرور موقتاً در دسترس نیست. چند لحظه بعد دوباره تلاش کنید."
            : "پاسخ سرور قابل خواندن نبود",
        code: "invalid_response",
        status: response.status,
        traceId: response.headers.get("X-Trace-ID") ?? "",
      });
    }
    // پاسخ سالم ولی بدون پاکت: همان دادهٔ خام؛ اعتبارسنجی نهایی با zod است.
    return data ?? null;
  }

  const env = payload as ApiEnvelope<unknown>;
  if (!response.ok || !env.success) {
    throw new ApiError({
      message: env.message || "خطای نامشخص در ارتباط با سرور",
      code: env.code || "unknown_error",
      status: response.status,
      traceId: env.trace_id,
      errors: env.errors,
    });
  }
  return env.data;
}
