import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapSchema } from "../landing";
import { FALLBACK_BOOTSTRAP } from "../fallback";

/**
 * چرا import دینامیک؟
 *
 * openapi-fetch در لحظهٔ ساخت کلاینت، ارجاعی به `globalThis.fetch` می‌گیرد.
 * پس اگر ماژول پیش از نصبِ mock وارد شود، همهٔ تست‌ها به شبکهٔ واقعی می‌زنند
 * (و در این سندباکس، به یک سرور Django که هنوز بالاست!). با resetModules و
 * import دینامیک، هر تست کلاینت تازه‌ای با fetch مورد انتظار خودش می‌سازد.
 */
import type * as ClientNs from "../client";

type ClientModule = typeof ClientNs;
type ClientApiError = ClientNs.ApiError;

async function loadClient(): Promise<ClientModule> {
  vi.resetModules();
  return import("../client");
}

const envelope = (data: unknown, over: Record<string, unknown> = {}) => ({
  success: true,
  status_code: 200,
  code: "ok",
  message: "",
  trace_id: "t-1",
  data,
  ...over,
});

/** openapi-fetch درخواست را به Request تبدیل می‌کند؛ تست باید از خودِ Request بخواند. */
async function requestOf(fn: ReturnType<typeof mockFetch>): Promise<Request> {
  const arg = fn.mock.calls[0]?.[0] as unknown;
  return arg instanceof Request ? arg : new Request(String(arg), fn.mock.calls[0]?.[1]);
}

function mockFetch(payload: unknown, status = 200) {
  const fn = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify(payload), { status }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("resolveBase", () => {
  it("در مرورگر مسیر نسبی می‌دهد", async () => {
    const saved = process.env.K185_ABSOLUTE_BASE;
    delete process.env.K185_ABSOLUTE_BASE;
    try {
      const { resolveBase } = await loadClient();
      expect(resolveBase()).toBe("");
    } finally {
      process.env.K185_ABSOLUTE_BASE = saved;
    }
  });

  it("در سرور origin مطلق می‌دهد", async () => {
    const original = globalThis.window;
    // @ts-expect-error — حذف موقت window برای شبیه‌سازی محیط سرور
    delete globalThis.window;
    try {
      const { resolveBase } = await loadClient();
      const base = resolveBase();
      expect(base.startsWith("http")).toBe(true);
      expect(base.endsWith("/")).toBe(false);
    } finally {
      globalThis.window = original;
    }
  });
});

describe("apiGet", () => {
  it("پاکت را باز می‌کند و فقط data برمی‌گرداند", async () => {
    mockFetch(envelope({ hello: "دنیا" }));
    const { apiGet } = await loadClient();
    await expect(apiGet("/api/v1/core/")).resolves.toEqual({ hello: "دنیا" });
  });

  it("خطای HTTP را به ApiError تبدیل می‌کند", async () => {
    mockFetch(
      envelope(null, {
        success: false,
        status_code: 409,
        code: "exam_already_completed",
        message: "قبلاً شرکت کرده‌اید",
        trace_id: "trace-9",
      }),
      409,
    );
    const { apiGet, ApiError } = await loadClient();
    const err = await apiGet("/api/v1/exam/start/").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const api = err as ClientApiError;
    expect(api.code).toBe("exam_already_completed");
    expect(api.status).toBe(409);
    expect(api.message).toBe("قبلاً شرکت کرده‌اید");
    expect(api.traceId).toBe("trace-9");
  });

  it("success:false با HTTP 200 را هم خطا می‌داند", async () => {
    mockFetch(envelope(null, { success: false, code: "soft_fail", message: "ناموفق" }));
    const { apiGet, ApiError } = await loadClient();
    const err = await apiGet("/api/v1/x/").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as { code: string }).code).toBe("soft_fail");
  });

  it("رسانهٔ غیر-JSON (مثلاً HTML خطای پروکسی) خطای صریح می‌دهد", async () => {
    // سناریوی واقعی: پروکسی Vercel به‌جای JSON، صفحهٔ HTML خطا برمی‌گرداند
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>Bad Gateway</html>", { status: 502 })),
    );
    const { apiGet, ApiError } = await loadClient();
    const err = (await apiGet("/api/v1/core/").catch((e: unknown) => e)) as ClientApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.code).toBe("invalid_response");
  });

  it("پاسخ خالی با کد ۲۰۰ → null (نه undefined گمراه‌کننده)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 200 })),
    );
    const { apiGet } = await loadClient();
    // هیچ داده‌ای نیست؛ null صریح بهتر از undefined است و با zod قابل تشخیص است
    await expect(apiGet("/api/v1/core/")).resolves.toBeNull();
  });

  it("بدنهٔ خالی با کد ۵۰۰ → پیام فارسی دوستانه و کد صریح", async () => {
    mockFetch({}, 500);
    const { apiGet } = await loadClient();
    const err = (await apiGet("/api/v1/x/").catch((e: unknown) => e)) as ClientApiError;
    expect(err.code).toBe("invalid_response");
    expect(err.status).toBe(500);
    expect(err.message).toContain("در دسترس نیست");
  });

  it("پاکت با پیام خالی → پیام پیش‌فرض فارسی", async () => {
    mockFetch(envelope(null, { success: false, message: "", code: "" }), 400);
    const { apiGet } = await loadClient();
    const err = (await apiGet("/api/v1/x/").catch((e: unknown) => e)) as ClientApiError;
    expect(err.message).toBe("خطای نامشخص در ارتباط با سرور");
    expect(err.code).toBe("unknown_error");
  });
});

describe("ApiError.fieldError", () => {
  it("پیام فیلد آرایه‌ای و رشته‌ای را بیرون می‌کشد", async () => {
    const { ApiError } = await loadClient();
    const e = new ApiError({
      message: "خطای اعتبارسنجی",
      code: "validation_error",
      status: 400,
      errors: { national_id: ["کد ملی نامعتبر است"], phone: "شماره نامعتبر" },
    });
    expect(e.fieldError("national_id")).toBe("کد ملی نامعتبر است");
    expect(e.fieldError("phone")).toBe("شماره نامعتبر");
    expect(e.fieldError("missing")).toBeUndefined();
  });

  it("آرایهٔ خالی و نوع نامعتبر را نادیده می‌گیرد", async () => {
    const { ApiError } = await loadClient();
    const e = new ApiError({ message: "m", code: "c", status: 400, errors: { a: [], b: 42 } });
    expect(e.fieldError("a")).toBeUndefined();
    expect(e.fieldError("b")).toBeUndefined();
  });
});

describe("apiPost", () => {
  it("هدر Idempotency-Key را می‌فرستد", async () => {
    const fn = mockFetch(envelope({ ok: true }));
    const { apiPost } = await loadClient();
    await apiPost("/api/v1/auth/register/", { name: "x" }, { idempotencyKey: "key-123" });
    const req = await requestOf(fn);
    expect(req.headers.get("Idempotency-Key")).toBe("key-123");
    expect(req.method).toBe("POST");
  });

  it("بدون کلید، هدر اضافه نمی‌کند", async () => {
    const fn = mockFetch(envelope({ ok: true }));
    const { apiPost } = await loadClient();
    await apiPost("/api/v1/auth/register/", { name: "x" });
    const req = await requestOf(fn);
    expect(req.headers.has("Idempotency-Key")).toBe(false);
  });

  it("بدنه را JSON می‌فرستد", async () => {
    const fn = mockFetch(envelope({ ok: true }));
    const { apiPost } = await loadClient();
    await apiPost("/api/v1/x/", { a: 1 });
    const req = await requestOf(fn);
    expect(await req.json()).toEqual({ a: 1 });
  });
});

describe("قراردادهای zod", () => {
  it("دادهٔ جایگزین با اسکیما می‌خواند", () => {
    const parsed = bootstrapSchema.safeParse(FALLBACK_BOOTSTRAP);
    expect(parsed.success).toBe(true);
  });

  it("پاسخ ناقص را رد می‌کند", () => {
    expect(bootstrapSchema.safeParse({ exam_status: {} }).success).toBe(false);
  });

  it("window_state نامعتبر را رد می‌کند", () => {
    const bad = JSON.parse(JSON.stringify(FALLBACK_BOOTSTRAP)) as typeof FALLBACK_BOOTSTRAP;
    (bad.exam_status as unknown as { window_state: string }).window_state = "paused";
    expect(bootstrapSchema.safeParse(bad).success).toBe(false);
  });
});
