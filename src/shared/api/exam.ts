"use client";

import { ApiError, apiGet, apiPost } from "./client";
import {
  attemptSchema,
  otpInfoSchema,
  otpVerifyResultSchema,
  registerResultSchema,
  reportCardSchema,
  type Attempt,
  type OtpInfo,
  type OtpVerifyResult,
  type RegisterResult,
  type ReportCard,
} from "./participant";
import { getSession } from "./session";

/**
 * لایهٔ فراخوانی مسیر شرکت‌کننده.
 *
 * ── چرا این پوشش نازک لازم است؟ ───────────────────────────────────────────
 * ۱) هدر `Authorization` یک‌جا اضافه می‌شود، نه در هر کامپوننت.
 * ۲) پاسخ با zod اعتبارسنجی می‌شود، پس خطای قرارداد همان‌جا و با پیام روشن
 *    ظاهر می‌شود، نه به شکل «صفحهٔ سفید» وسط آزمون.
 * ۳) خطای ۴۰۱ به یک معنا ترجمه می‌شود: «نشست تمام شده» — که رابط کاربری
 *    باید با آن یک کار مشخص کند (بازگشت به ثبت‌نام)، نه پیام عمومی.
 */

export class SessionExpiredError extends Error {
  constructor() {
    super("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
    this.name = "SessionExpiredError";
  }
}

function authHeaders(): Record<string, string> {
  const s = getSession();
  return s ? { Authorization: `Bearer ${s.access}` } : {};
}

function normalizeError(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) throw new SessionExpiredError();
  throw err;
}

export async function registerParticipant(input: {
  first_name: string;
  last_name: string;
  national_id: string;
  phone_number: string;
  birth_date: string;
  mosque_id: number;
}): Promise<RegisterResult> {
  try {
    const raw = await apiPost("/api/v1/auth/register/", input, {
      headers: { "Content-Type": "application/json" },
    });
    return registerResultSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

/**
 * درخواستِ دوبارهٔ کدِ تأیید.
 *
 * چرا این مسیر و نه ثبت‌نامِ دوباره؟ اگر کاربر کد را دیر ببیند یا کد منقضی
 * شود، ثبت‌نامِ دوباره او را به «شما قبلاً ثبت‌نام کرده‌اید» می‌بَرد. این مسیر
 * فقط چالشِ تازه می‌سازد و همان پاسخِ ثبت‌نام را برمی‌گرداند.
 */
export async function requestOtp(phoneNumber: string): Promise<OtpInfo> {
  try {
    const raw = await apiPost("/api/v1/auth/otp/request/", { phone_number: phoneNumber });
    return otpInfoSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

/** تأییدِ کدِ ۶ رقمی و گرفتنِ نشست — همان توکنی که مسیرِ ورودِ مستقیم می‌داد. */
export async function verifyOtp(phoneNumber: string, code: string): Promise<OtpVerifyResult> {
  try {
    const raw = await apiPost("/api/v1/auth/otp/verify/", { phone_number: phoneNumber, code });
    return otpVerifyResultSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

export async function startExam(): Promise<Attempt> {
  try {
    const raw = await apiPost("/api/v1/exam/start/", undefined, {
      headers: authHeaders(),
      // کلید یکتاسازی: اگر کاربر دوبار کلیک کند یا شبکه دوباره بفرستد،
      // دو جلسهٔ آزمون ساخته نمی‌شود.
      idempotencyKey: `start-${getSession()?.access.slice(-16) ?? "anon"}`,
    });
    return attemptSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

export async function fetchCurrentAttempt(): Promise<Attempt | null> {
  try {
    const raw = await apiGet("/api/v1/exam/current/", { headers: authHeaders() });
    const parsed = attemptSchema.safeParse(raw);
    // اگر آزمون در حال اجرا نبود، بک‌اند شکل دیگری می‌دهد؛ این‌جا «هیچ» یعنی null
    return parsed.success ? parsed.data : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    normalizeError(err);
  }
}

export async function submitAnswer(questionNumber: number, position: number): Promise<Attempt> {
  try {
    const raw = await apiPost(
      "/api/v1/exam/answer/",
      { question_number: questionNumber, selected_position: position },
      { headers: { ...authHeaders(), "Content-Type": "application/json" } },
    );
    return attemptSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

export async function finishExam(): Promise<ReportCard> {
  try {
    const raw = await apiPost(
      "/api/v1/exam/finish/",
      {},
      {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        idempotencyKey: `finish-${getSession()?.access.slice(-16) ?? "anon"}`,
      },
    );
    return reportCardSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

export async function fetchReportCard(): Promise<ReportCard> {
  try {
    const raw = await apiGet("/api/v1/exam/report-card/", { headers: authHeaders() });
    return reportCardSchema.parse(raw);
  } catch (err) {
    normalizeError(err);
  }
}

/** استعلام عمومی کد رهگیری — بدون نیاز به نشست. */
export async function verifyReceipt(trackingCode: string): Promise<ReportCard> {
  const code = trackingCode.trim().toUpperCase();
  const raw = await apiGet(`/api/v1/exam/receipt/${encodeURIComponent(code)}/`, {
    cache: "no-store",
  });
  return reportCardSchema.parse(raw);
}
