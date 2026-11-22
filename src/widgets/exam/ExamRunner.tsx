"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchCurrentAttempt,
  finishExam,
  startExam,
  submitAnswer,
  SessionExpiredError,
} from "@/shared/api/exam";
import { ApiError } from "@/shared/api/client";
import { getSession, patchSession } from "@/shared/api/session";
import { useIdentity } from "@/shared/api/use-identity";
import type { Attempt, AttemptQuestion } from "@/shared/api/participant";
import { FormAlert, PrimaryButton } from "@/shared/ui/Field";
import { Girih } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import { Briefing } from "./Briefing";

/**
 * اجرای آزمون — قلب مسابقه.
 *
 * ── تصمیم‌های حیاتی و دلیلشان ─────────────────────────────────────────────
 * ۱) **زمان از سرور، نه از ساعت دستگاه.** ساعت گوشی می‌تواند عقب باشد یا
 *    کاربر عمداً عوضش کند. ما به `remaining_seconds` سرور لنگر می‌زنیم و
 *    با `performance.now()` (که مستقل از ساعت دیوار است) می‌شماریم.
 * ۲) **ذخیرهٔ خودکار با هر انتخاب.** اگر اتصال قطع شود، پاسخ نرود. پس هر
 *    انتخاب همان لحظه فرستاده می‌شود؛ حالت «در انتظار» کنار پرسش دیده
 *    می‌شود، نه در دیالوگ مسدودکننده.
 * ۳) **بدون افشای درست/غلط.** سرور هرگز کلید را نمی‌فرستد و ما هم چیزی
 *    حدس نمی‌زنیم؛ انتخاب‌شده فقط «انتخاب‌شده» است.
 * ۴) **رفرش نجات می‌دهد، نه از بین می‌برد.** `GET /current/` جلسه را
 *    برمی‌گرداند؛ پس رفرش = ادامه، نه شروع دوباره.
 * ۵) **زمان تمام شد؟** خودکار نهایی می‌کنیم و به کارنامه می‌رویم.
 */
type Phase =
  | "loading"
  | "ready"
  | "error"
  | "finishing"
  | "expired"
  | "no-session"
  /** نشست هست ولی آزمون هنوز شروع نشده — «بریفینگ» پیش از شروع. */
  | "briefing";

export function ExamRunner() {
  const router = useRouter();
  /*
   * کشِ هویت این‌جا **فقط** برای حالتِ `no-session` است: تفکیکِ «توکنِ
   * کهنه» از «کاربرِ تازه». برای همین `force` نمی‌زنیم و به کش بسنده
   * می‌کنیم (یک درخواستِ اضافه در هر بار ورودِ به آزمون لازم نیست).
   */
  const { identity, refresh: refreshIdentity } = useIdentity();
  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  /**
   * اطلاعاتِ نشست برای بریفینگ. عمداً `useState`ِ مقدارِ اولیه است، نه
   * `useEffect` + `setState`: خواندنِ `localStorage` در بدنهٔ رندر در محیطِ
   * سرور معنا ندارد، پس با تابعِ سازنده فقط یک‌بار سمتِ کلاینت خوانده می‌شود.
   */
  const [sessionInfo] = useState<{ fullName: string; mosqueName?: string | null }>(() => {
    const s = getSession();
    return { fullName: s?.fullName ?? "", mosqueName: s?.mosqueName ?? null };
  });

  /** لنگر زمان: `serverRemaining` در لحظهٔ `anchorMs` */
  const anchor = useRef<{ serverRemaining: number; at: number } | null>(null);
  const finishing = useRef(false);

  const enter = useCallback(async () => {
    if (!getSession()) {
      setPhase("no-session");
      return;
    }
    try {
      /*
       * ── تصمیمِ تجربه ──────────────────────────────────────────────────
       * اگر آزمونِ نیمه‌کاره‌ای هست، **مستقیم** ادامه می‌دهیم (کاربر وسطِ
       * کار است و توقف یعنی از دست رفتنِ تمرکز و ثانیه‌ها). ولی اگر تازه
       * وارد شده، آزمون را خودکار شروع **نمی‌کنیم**: اول بریفینگ می‌آید تا
       * کاربر بداند ۵ پرسش، ۵ دقیقه، یک‌بار شرکت، و بعد با کلیکِ خودش
       * ساعت را شروع کند. آزمونِ زمان‌دار بدونِ اجازهٔ کاربر شروع نمی‌شود.
       */
      const resumed = await fetchCurrentAttempt();
      if (!resumed) {
        setPhase("briefing");
        return;
      }
      setAttempt(resumed);
      anchor.current = { serverRemaining: resumed.remaining_seconds, at: performance.now() };
      setRemaining(resumed.remaining_seconds);
      setActive(Math.max(0, resumed.current_question_number - 1));
      setPhase("ready");
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setPhase("no-session");
        return;
      }
      setFatal(
        err instanceof ApiError ? err.message : "آزمون آغاز نشد. اتصال اینترنت را بررسی کنید.",
      );
      setPhase("error");
    }
  }, []);

  /** شروعِ آگاهانهٔ آزمون — فقط از دکمهٔ بریفینگ صدا زده می‌شود. */
  const launch = useCallback(async () => {
    setPhase("loading");
    try {
      const a = await startExam();
      setAttempt(a);
      anchor.current = { serverRemaining: a.remaining_seconds, at: performance.now() };
      setRemaining(a.remaining_seconds);
      setActive(Math.max(0, a.current_question_number - 1));
      setPhase("ready");
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setPhase("no-session");
        return;
      }
      setFatal(
        err instanceof ApiError ? err.message : "آزمون آغاز نشد. اتصال اینترنت را بررسی کنید.",
      );
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    // setState همگام در بدنهٔ effect توسط React Compiler رد می‌شود؛
    // یک تیک صفر کافی است تا فراخوانیِ async بیرون از بدنه اجرا شود.
    const id = window.setTimeout(() => {
      void enter();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [enter]);

  /** تیک یک‌ثانیه‌ای — از لنگر سرور مشتق می‌شود، پس drift جمع نمی‌شود. */
  useEffect(() => {
    if (phase !== "ready" || !anchor.current) return;
    const id = window.setInterval(() => {
      const a = anchor.current;
      if (!a) return;
      const elapsed = Math.floor((performance.now() - a.at) / 1000);
      const left = Math.max(0, a.serverRemaining - elapsed);
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        void finalize(true);
      }
    }, 500);
    return () => {
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, attempt?.attempt_id]);

  async function finalize(auto: boolean) {
    if (finishing.current) return;
    finishing.current = true;
    setPhase(auto ? "expired" : "finishing");
    try {
      const card = await finishExam();
      patchSession({
        trackingCode: card.tracking_code,
        lastScore: card.summary.total_score ?? null,
      });
      router.push(`/receipt?code=${encodeURIComponent(card.tracking_code)}`);
    } catch (err) {
      finishing.current = false;
      setFatal(
        err instanceof ApiError
          ? err.message
          : "ثبت نهایی انجام نشد. صفحه را دوباره باز کنید؛ پاسخ‌های شما ذخیره شده‌اند.",
      );
      setPhase("ready");
    }
  }

  async function choose(q: AttemptQuestion, position: number) {
    if (!attempt || saving !== null) return;
    if (q.selected_position === position) return;
    setSaving(q.question_number);
    setSaveError(null);

    // خوش‌بینانه: رابط فوراً واکنش می‌دهد، بعد تأیید سرور می‌آید.
    const optimistic: Attempt = {
      ...attempt,
      questions: attempt.questions.map((x) =>
        x.question_number === q.question_number
          ? { ...x, selected_position: position, is_answered: true }
          : x,
      ),
    };
    setAttempt(optimistic);

    try {
      const next = await submitAnswer(q.question_number, position);
      setAttempt(next);
      anchor.current = { serverRemaining: next.remaining_seconds, at: performance.now() };
    } catch (err) {
      // برگشت به وضعیت سرور — نه وضعیت خیالی خوش‌بینانه
      setAttempt((cur) =>
        cur
          ? {
              ...cur,
              questions: cur.questions.map((x) =>
                x.question_number === q.question_number
                  ? { ...x, selected_position: q.selected_position, is_answered: q.is_answered }
                  : x,
              ),
            }
          : cur,
      );
      setSaveError(
        err instanceof SessionExpiredError
          ? "نشست شما منقضی شد؛ دوباره وارد شوید."
          : "پاسخ ذخیره نشد. اتصال را بررسی کنید و دوباره بزنید.",
      );
    } finally {
      setSaving(null);
    }
  }

  /**
   * ── سرتیترِ پنهانِ دیداری ولی حاضر برای صفحه‌خوان ────────────────────────
   * صفحهٔ `/exam` هیچ `h1` نداشت (بازرسیِ دورِ ۱۸): ساختارِ عنوانِ صفحه
   * ناقص بود و صفحه‌خوان نمی‌دانست این صفحه چیست. `sr-only` فقط برای چشم
   * پنهان است، پس هیچ تغییری در طراحی ایجاد نمی‌کند ولی ساختار را کامل
   * می‌کند و صفحه به `aria-labelledby` هم وصل می‌شود.
   */
  const heading = (
    <h1 id="exam-title" className="sr-only">
      آزمون مسابقهٔ کتاب‌خوانی هفتهٔ بسیج
    </h1>
  );

  // ── حالت‌های مرزی ──────────────────────────────────────────────────────────
  if (phase === "loading")
    return (
      <>
        {heading}
        <Skeleton />
      </>
    );

  if (phase === "briefing")
    return (
      <>
        {heading}
        <Briefing
          fullName={sessionInfo.fullName}
          mosqueName={sessionInfo.mosqueName ?? null}
          onStart={() => {
            void launch();
          }}
        />
      </>
    );

  /*
   * ── نشستِ کهنه ≠ کاربرِ تازه ─────────────────────────────────────────────
   * اگر `fetchCurrentAttempt` ۴۰۱ داد، یعنی توکنِ دسترسی منقضی شده — نه
   * اینکه کاربر هرگز ثبت‌نام نکرده. قبلاً همین‌جا مستقیم «ثبت‌نام کنید»
   * نشان می‌دادیم و پروندهٔ سالمِ کاربر شبیهِ «پاک‌شده» می‌شد.
   *
   * حالا اول کشِ هویت را می‌پرسیم: اگر با refresh قابلِ احیا باشد، توکنِ
   * تازه می‌نشیند و دکمهٔ «دوباره تلاش» کارِ واقعی می‌کند. فقط اگر سرور
   * بگوید `no_session`، فرمِ ثبت‌نام پیشنهاد می‌شود.
   */
  if (phase === "no-session")
    return (
      <>
        {heading}
        <StateCard
          title={
            identity.state === "no_session"
              ? "برای شرکت در آزمون ابتدا ثبت‌نام کنید"
              : "نشست این دستگاه تازه شد"
          }
          body={
            identity.state === "no_session"
              ? "نشست شما روی این دستگاه نیست. ثبت‌نام کمتر از دو دقیقه وقت می‌گیرد و همان مسیر، آزمون را هم آغاز می‌کند."
              : "پروندهٔ شما هست؛ فقط توکن دسترسی کهنه بود و همان حالا تمدید شد. یک بار دیگر بزنید."
          }
          action={
            identity.state === "no_session" ? (
              <Link
                href="/register"
                className="bg-brand text-on-brand inline-flex h-11 items-center rounded-xl px-5 text-[13px] font-extrabold"
              >
                ثبت‌نام و شرکت
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  refreshIdentity();
                  setPhase("loading");
                  window.setTimeout(() => {
                    void enter();
                  }, 120);
                }}
                className="bg-brand text-on-brand inline-flex h-11 items-center rounded-xl px-5 text-[13px] font-extrabold"
              >
                ادامهٔ آزمون
              </button>
            )
          }
        />
      </>
    );

  if (phase === "error" || !attempt)
    return (
      <>
        {heading}
        <StateCard
          title="آزمون آغاز نشد"
          body={fatal ?? "ارتباط با سرور برقرار نشد."}
          action={
            <button
              type="button"
              onClick={() => {
                setPhase("loading");
                void enter();
              }}
              className="border-border-strong text-text hover:bg-surface-2 inline-flex h-11 items-center rounded-xl border px-5 text-[13px] font-extrabold"
            >
              تلاش دوباره
            </button>
          }
        />
      </>
    );

  if (phase === "expired" || phase === "finishing")
    return <FinishingCard expired={phase === "expired"} />;

  const answered = attempt.questions.filter((q) => q.is_answered).length;
  const total = attempt.questions.length;
  const q = attempt.questions[active] ?? attempt.questions[0];
  // پس از گاردهای بالا، آرایه هرگز خالی نیست؛ این خط برای تایپ است، نه رفتار.
  if (!q) return <Skeleton />;
  const danger = remaining <= 30;
  const warn = remaining <= 60 && !danger;

  return (
    <>
      {heading}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px] lg:items-start">
        {/* ── ستون پرسش ── */}
        <div className="order-2 lg:order-1">
          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
              <p className="text-text text-[13px] font-extrabold">
                پرسش {toFa(active + 1)}
                <span className="text-text-subtle font-normal"> از {toFa(total)}</span>
              </p>
              <span className="text-text-subtle text-[11px]" aria-live="polite" aria-atomic="true">
                {saving === q.question_number
                  ? "در حال ذخیره…"
                  : q.is_answered
                    ? "ذخیره شد"
                    : "بدون پاسخ"}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-text text-[14.5px] leading-[2.1] font-bold">{q.question_text}</p>

              <div
                role="radiogroup"
                aria-label={`پرسش ${toFa(active + 1)}`}
                className="mt-4 space-y-2"
              >
                {q.options.map((o) => {
                  const picked = q.selected_position === o.position;
                  return (
                    <button
                      key={o.position}
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      onClick={() => void choose(q, o.position)}
                      className={[
                        "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-right transition-all",
                        picked
                          ? "border-brand bg-brand/[0.07] ring-brand/20 ring-1"
                          : "border-border-strong bg-surface hover:border-brand/35 hover:bg-surface-2",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10.5px] font-extrabold",
                          picked
                            ? "border-brand bg-brand text-on-brand"
                            : "border-border-strong text-text-subtle",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {picked ? "✓" : toFa(o.position)}
                      </span>
                      <span
                        className={`text-[13px] leading-7 ${picked ? "text-text font-bold" : "text-text-muted"}`}
                      >
                        {o.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {saveError ? (
                <div className="mt-3">
                  <FormAlert title="پاسخ ذخیره نشد">{saveError}</FormAlert>
                </div>
              ) : null}

              <div className="border-border mt-4 flex items-center justify-between gap-2 border-t pt-4">
                <button
                  type="button"
                  disabled={active === 0}
                  onClick={() => {
                    setActive((i) => Math.max(0, i - 1));
                  }}
                  className="border-border-strong text-text hover:bg-surface-2 inline-flex h-10 items-center rounded-lg border px-3.5 text-[12.5px] font-bold disabled:opacity-40"
                >
                  پرسش قبل
                </button>
                {active < total - 1 ? (
                  <PrimaryButton
                    type="button"
                    disabled={!q.is_answered}
                    title={
                      q.is_answered
                        ? undefined
                        : "برای رفتن به پرسش بعد، ابتدا به این پرسش پاسخ دهید"
                    }
                    onClick={() => {
                      setActive((i) => Math.min(total - 1, i + 1));
                    }}
                  >
                    پرسش بعد
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    type="button"
                    onClick={() => void finalize(false)}
                    disabled={!attempt.all_answered}
                    loading={finishing.current}
                    loadingLabel="در حال ثبت…"
                  >
                    پایان و دریافت کارنامه
                  </PrimaryButton>
                )}
              </div>
              {active === total - 1 && !attempt.all_answered ? (
                <p className="text-text-subtle mt-2 text-center text-[11px]">
                  برای ثبت کارنامه باید به همهٔ پرسش‌ها پاسخ دهید ({toFa(total - answered)} پرسش
                  بی‌پاسخ).
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── ستون وضعیت ── */}
        <aside className="order-1 space-y-3 lg:sticky lg:top-20 lg:order-2">
          {/* تایمر */}
          <div
            className={[
              "rounded-2xl border p-4 text-center",
              danger
                ? "border-brick/40 bg-brick/[0.07]"
                : warn
                  ? "border-gold/45 bg-gold/[0.10]"
                  : "border-border bg-stage",
            ].join(" ")}
            role="timer"
            aria-live={danger ? "assertive" : "off"}
          >
            <p
              className={`text-[10.5px] font-extrabold tracking-wide ${
                danger || warn ? "" : "text-on-stage-muted"
              } ${danger ? "text-brick" : warn ? "text-gold-strong" : ""}`}
            >
              زمان باقی‌مانده
            </p>
            <p
              className={`mt-1 text-[34px] leading-none font-extrabold tabular-nums ${
                danger ? "text-brick" : warn ? "text-gold-strong" : "text-on-stage"
              }`}
              dir="ltr"
            >
              {clock(remaining)}
            </p>
            <p
              className={`mt-1.5 text-[10.5px] ${danger || warn ? "text-text-muted" : "text-on-stage-muted"}`}
            >
              {danger ? "زمان در حال پایان است" : "شمارش روی سرور انجام می‌شود"}
            </p>
          </div>

          {/* ناوبری پرسش‌ها */}
          <div className="border-border bg-surface rounded-2xl border p-3.5">
            <div className="flex items-baseline justify-between">
              <p className="text-text text-[12px] font-extrabold">پرسش‌ها</p>
              <p className="text-text-subtle text-[11px] tabular-nums">
                {toFa(answered)} / {toFa(total)}
              </p>
            </div>
            <div className="mt-2 flex gap-1.5">
              {attempt.questions.map((x, i) => {
                const isActive = i === active;
                // بک‌اند «رد کردن پرسش» را نمی‌پذیرد؛ پس فقط پرسش‌های رسیده
                // و پرسش جاری قابل کلیک‌اند و بقیه دیده می‌شوند ولی غیرفعال.
                const reachable = i <= answered;
                return (
                  <button
                    key={x.question_number}
                    type="button"
                    onClick={() => {
                      if (reachable) setActive(i);
                    }}
                    aria-disabled={!reachable}
                    aria-label={`پرسش ${toFa(i + 1)}${x.is_answered ? " — پاسخ داده شده" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                    className={[
                      "h-9 flex-1 rounded-lg border text-[12px] font-extrabold tabular-nums transition-colors",
                      isActive
                        ? "border-brand bg-brand text-on-brand"
                        : x.is_answered
                          ? "border-verde/40 bg-verde/[0.10] text-verde"
                          : reachable
                            ? "border-border-strong bg-surface-2 text-text hover:border-brand/35"
                            : "border-border/60 bg-surface-2/50 text-text-subtle/50 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {toFa(i + 1)}
                  </button>
                );
              })}
            </div>
            <div className="text-text-muted mt-2.5 space-y-1 text-[10.5px]">
              <p className="flex items-center gap-1.5">
                <span aria-hidden="true" className="bg-verde inline-block size-2 rounded-sm" />
                پاسخ داده‌شده
              </p>
              <p className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="bg-border-strong inline-block size-2 rounded-sm"
                />
                بی‌پاسخ
              </p>
              <p className="leading-5">
                ترتیب پاسخ‌ها اجباری است؛ نمی‌توان پرسشی را بی‌پاسخ رد کرد.
              </p>
            </div>
          </div>

          {attempt.all_answered ? (
            <PrimaryButton
              type="button"
              onClick={() => void finalize(false)}
              loading={finishing.current}
              loadingLabel="در حال ثبت…"
              className="w-full"
            >
              پایان و دریافت کارنامه
            </PrimaryButton>
          ) : null}

          <p className="text-text-subtle text-[10.5px] leading-5">
            بستن صفحه زمان را متوقف نمی‌کند. پاسخ‌ها همین‌جا ذخیره می‌شوند؛ می‌توانید برگردید.
          </p>
        </aside>
      </div>
    </>
  );
}

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Skeleton() {
  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-border bg-surface order-2 space-y-3 rounded-2xl border p-5 lg:order-1">
        <span className="sr-only">آزمون در حال آماده‌سازی است…</span>
        <div className="bg-surface-2 h-4 w-28 animate-pulse rounded" />
        <div className="bg-surface-2 h-5 w-4/5 animate-pulse rounded" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-2 h-12 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="order-1 space-y-3 lg:order-2">
        <div className="bg-surface-2 h-28 animate-pulse rounded-2xl" />
        <div className="bg-surface-2 h-24 animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}

function StateCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="border-border bg-surface mx-auto max-w-lg rounded-2xl border p-6 text-center">
      <Girih size={26} className="text-text-subtle mx-auto" />
      <h2 className="text-text mt-3 text-[16px] font-extrabold">{title}</h2>
      <p className="text-text-muted mx-auto mt-2 max-w-[42ch] text-[12.5px] leading-7">{body}</p>
      <div className="mt-4 flex justify-center">{action}</div>
    </div>
  );
}

function FinishingCard({ expired }: { expired: boolean }) {
  return (
    <div
      className="border-border bg-surface mx-auto max-w-lg rounded-2xl border p-8 text-center"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="border-brand/30 border-t-brand text-brand mx-auto block size-7 animate-spin rounded-full border-2"
      />
      <h2 className="text-text mt-4 text-[15px] font-extrabold">
        {expired ? "زمان آزمون به پایان رسید" : "کارنامه در حال صدور است"}
      </h2>
      <p className="text-text-muted mt-2 text-[12.5px] leading-7">
        پاسخ‌های شما ثبت شده است. چند لحظه صبر کنید تا به صفحهٔ کارنامه بروید.
      </p>
    </div>
  );
}
