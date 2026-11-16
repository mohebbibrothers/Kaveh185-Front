import { afterEach, describe, expect, it, vi } from "vitest";
import type * as ExamNs from "../exam";

/**
 * لایهٔ `exam.ts` — همان کدی که وسط آزمون اجرا می‌شود.
 *
 * سه چیزی که این‌جا قفل می‌شود و اگر بشکند کاربر در بدترین لحظه گیر می‌کند:
 *
 * ۱) **۴۰۱ یعنی «نشست تمام شد»**، نه پیام عمومی. رابط کاربری با
 *    `SessionExpiredError` می‌فهمد باید کاربر را به ثبت‌نام برگرداند.
 * ۲) **پاسخ نامعتبر قرارداد، جای دیگری منفجر نشود**: zod همان‌جا خطا می‌دهد.
 * ۳) **آزمون در جریان با ۴۰۴ یعنی `null`** — نه خطا؛ چون «هنوز آزمونی نیست»
 *    یک حالت طبیعی است، نه شکست.
 */

type ExamModule = typeof ExamNs;
let exam: ExamModule;

const session = {
  access: "x".repeat(48),
  fullName: "محمد رضایی",
};

/** شکل دقیق `attemptSchema` — عمداً کامل، چون قرارداد همین است. */
const attemptPayload = {
  attempt_id: 1,
  tracking_code: "KV185-ZZZZ1111",
  status: "in_progress",
  started_at: "2026-11-14T10:00:00Z",
  started_at_jalali: "1405/08/23",
  expires_at: "2026-11-14T10:05:00Z",
  remaining_seconds: 240,
  duration_limit_seconds: 300,
  total_questions: 5,
  answered_count: 0,
  unanswered_count: 5,
  all_answered: false,
  can_finish_now: false,
  current_question_number: 1,
  questions: [
    {
      question_number: 1,
      question_text: "کدام گزینه درست است؟",
      selected_position: null,
      is_answered: false,
      options: [
        { position: 1, text: "الف" },
        { position: 2, text: "ب" },
      ],
    },
  ],
};

/** پاسخ پاکت‌دار بک‌اند؛ `data` همان چیزی است که کلاینت باز می‌کند. */
const ok = (data: unknown) =>
  new Response(
    JSON.stringify({
      success: true,
      status_code: 200,
      code: "ok",
      message: "",
      trace_id: "t",
      data,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

const fail = (status: number, code = "error") =>
  new Response(
    JSON.stringify({
      success: false,
      status_code: status,
      code,
      message: "خطا",
      trace_id: "t",
      data: null,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );

function mockFetch(handler: () => Response) {
  const fn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => handler());
  vi.stubGlobal("fetch", fn);
  return fn;
}

const lastRequest = (fn: ReturnType<typeof mockFetch>): Request => {
  const arg = fn.mock.calls.at(-1)?.[0] as unknown;
  return arg instanceof Request ? arg : new Request(String(arg), fn.mock.calls.at(-1)?.[1]);
};

/**
 * هر تست ماژول را تازه بار می‌کند.
 *
 * چرا؟ `openapi-fetch` در لحظهٔ ساخت کلاینت به `globalThis.fetch` ارجاع
 * می‌گیرد. اگر ماژول پیش از نصب mock وارد شود، درخواست‌ها به شبکهٔ واقعی
 * می‌روند و تست بی‌آنکه بفهمیم سبز/قرمز می‌شود. پس ترتیب همیشه:
 * mock → import.
 */
async function loadExam(): Promise<ExamModule> {
  vi.resetModules();
  const { saveSession } = await import("../session");
  saveSession(session);
  return import("../exam");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("احراز هویت", () => {
  it("توکن نشست در هدر Authorization فرستاده می‌شود", async () => {
    const fn = mockFetch(() => ok(attemptPayload));
    exam = await loadExam();
    await exam.startExam();
    const req = lastRequest(fn);
    expect(req.headers.get("Authorization")).toBe(`Bearer ${session.access}`);
    expect(new URL(req.url).pathname).toBe("/api/v1/exam/start/");
  });

  it("۴۰۱ به SessionExpiredError ترجمه می‌شود", async () => {
    mockFetch(() => fail(401, "unauthorized"));
    exam = await loadExam();
    await expect(exam.fetchReportCard()).rejects.toBeInstanceOf(exam.SessionExpiredError);
  });

  it("۴۰۱ در شروع آزمون هم همان خطای نشست است", async () => {
    mockFetch(() => fail(401));
    exam = await loadExam();
    await expect(exam.startExam()).rejects.toBeInstanceOf(exam.SessionExpiredError);
  });

  it("خطای غیر۴۰۱ همان‌طور بالا می‌رود", async () => {
    mockFetch(() => fail(500, "server_error"));
    exam = await loadExam();
    await expect(exam.startExam()).rejects.not.toBeInstanceOf(exam.SessionExpiredError);
  });
});

describe("startExam", () => {
  it("پاسخ معتبر را با نوع درست برمی‌گرداند", async () => {
    mockFetch(() => ok(attemptPayload));
    exam = await loadExam();
    const attempt = await exam.startExam();
    expect(attempt.tracking_code).toBe("KV185-ZZZZ1111");
    expect(attempt.questions).toHaveLength(1);
    expect(attempt.questions[0]?.options).toHaveLength(2);
  });

  it("کلید یکتاسازی از توکن ساخته می‌شود تا دوبار کلیک آزمون دوم نسازد", async () => {
    const fn = mockFetch(() => ok(attemptPayload));
    exam = await loadExam();
    await exam.startExam();
    const req = lastRequest(fn);
    const key = req.headers.get("Idempotency-Key") ?? req.headers.get("X-Idempotency-Key");
    expect(key).toContain("start-");
  });

  it("پاسخ ناقص قرارداد را رد می‌کند", async () => {
    mockFetch(() => ok({ attempt_id: 1 }));
    exam = await loadExam();
    await expect(exam.startExam()).rejects.toBeTruthy();
  });
});

describe("fetchCurrentAttempt", () => {
  it("۴۰۴ یعنی «آزمونی در جریان نیست» و null می‌دهد", async () => {
    mockFetch(() => fail(404, "not_found"));
    exam = await loadExam();
    await expect(exam.fetchCurrentAttempt()).resolves.toBeNull();
  });

  it("پاسخ بی‌ساختار هم null می‌دهد، نه استثنا", async () => {
    mockFetch(() => ok({ something: "else" }));
    exam = await loadExam();
    await expect(exam.fetchCurrentAttempt()).resolves.toBeNull();
  });

  it("آزمون در جریان را برمی‌گرداند", async () => {
    mockFetch(() => ok(attemptPayload));
    exam = await loadExam();
    const attempt = await exam.fetchCurrentAttempt();
    expect(attempt?.status).toBe("in_progress");
  });
});

describe("submitAnswer", () => {
  it("شماره پرسش و گزینه را در بدنه می‌فرستد", async () => {
    const fn = mockFetch(() => ok(attemptPayload));
    exam = await loadExam();
    await exam.submitAnswer(2, 3);
    const body = JSON.parse(await lastRequest(fn).text()) as Record<string, unknown>;
    expect(body).toEqual({ question_number: 2, selected_position: 3 });
  });

  it("خطای قاعده «بدون رد کردن پرسش» بالا می‌رود تا فرم نمایش دهد", async () => {
    mockFetch(() => fail(400, "cannot_skip_question"));
    exam = await loadExam();
    await expect(exam.submitAnswer(3, 1)).rejects.toBeTruthy();
  });
});

/** شکل دقیق `reportCardSchema` — بین تست‌های کارنامه و استعلام مشترک است. */
const reportCard = {
  tracking_code: "KV185-ZZZZ1111",
  participant: {
    full_name: "محمد رضایی",
    national_id_masked: "***99000**2",
    mosque_name: "مسجد جامع",
    mosque_code: "MSQ-01",
  },
  summary: {
    status: "completed",
    status_label: "پایان‌یافته",
    total_questions: 5,
    correct_count: 4,
    wrong_count: 1,
    unanswered_count: 0,
    accuracy_percent: 80,
    duration_seconds: 180,
    total_score: 4,
    completed_at_jalali: "1405/08/23",
  },
};

describe("finishExam و کارنامه", () => {
  it("پایان آزمون کارنامه می‌دهد", async () => {
    mockFetch(() => ok(reportCard));
    exam = await loadExam();
    const card = await exam.finishExam();
    expect(card.tracking_code).toBe("KV185-ZZZZ1111");
    expect(card.summary.correct_count).toBe(4);
  });

  it("کارنامه با توکن خوانده می‌شود", async () => {
    const fn = mockFetch(() => ok(reportCard));
    exam = await loadExam();
    await exam.fetchReportCard();
    expect(lastRequest(fn).headers.get("Authorization")).toBe(`Bearer ${session.access}`);
  });
});

describe("verifyReceipt", () => {
  it("کد رهگیری پاک‌سازی و بزرگ‌حرف می‌شود", async () => {
    const fn = mockFetch(() => ok({ ...reportCard, tracking_code: "KV185-ABC12345" }));
    exam = await loadExam();
    await exam.verifyReceipt("  kv185-abc12345  ");
    const url = new URL(lastRequest(fn).url);
    expect(url.pathname).toBe("/api/v1/exam/receipt/KV185-ABC12345/");
  });

  it("استعلام عمومی بدون هدر احراز هویت می‌رود", async () => {
    const fn = mockFetch(() => fail(404, "not_found"));
    exam = await loadExam();
    await expect(exam.verifyReceipt("kv185-nope1234")).rejects.toBeTruthy();
    expect(lastRequest(fn).headers.get("Authorization")).toBeNull();
  });
});

describe("registerParticipant", () => {
  const registerPayload = {
    is_new_user: true,
    otp_required: false,
    tokens: { access: "a".repeat(40), refresh: "r".repeat(40) },
    user: {
      id: 7,
      first_name: "محمد",
      last_name: "رضایی",
      full_name: "محمد رضایی",
      role: "participant",
    },
  };

  it("فرم ثبت‌نام را می‌فرستد و نتیجه را می‌دهد", async () => {
    const fn = mockFetch(() => ok(registerPayload));
    exam = await loadExam();
    const result = await exam.registerParticipant({
      first_name: "محمد",
      last_name: "رضایی",
      national_id: "0009900012",
      phone_number: "09120000000",
      birth_date: "1387/01/01",
      mosque_id: 3,
    });
    const body = JSON.parse(await lastRequest(fn).text()) as Record<string, unknown>;
    expect(body.mosque_id).toBe(3);
    expect(result.is_new_user).toBe(true);
    expect(result.user.full_name).toBe("محمد رضایی");
  });

  it("پاسخ بدون کاربر را رد می‌کند", async () => {
    mockFetch(() => ok({ is_new_user: true, otp_required: false }));
    exam = await loadExam();
    await expect(
      exam.registerParticipant({
        first_name: "م",
        last_name: "ر",
        national_id: "0009900012",
        phone_number: "09120000000",
        birth_date: "1387/01/01",
        mosque_id: 3,
      }),
    ).rejects.toBeTruthy();
  });
});
