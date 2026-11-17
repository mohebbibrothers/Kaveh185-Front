import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { Girih } from "@/shared/ui/Ornament";
import { faJalali } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * هیروی صفحهٔ اول — یک پیام، یک زمان، یک اقدام.
 *
 * ── سه تغییرِ این دور ────────────────────────────────────────────────────
 *
 * ۱) **دکمهٔ «مشاهدهٔ قوانین»** (نکتهٔ ۲): دکمهٔ اصلی به `/rules` می‌رود و
 *    متنش دقیقاً همان چیزی است که خواسته شد. یک لینکِ متنیِ کم‌وزن کنارش
 *    «ورود به آزمون» را نگه می‌دارد، تا اقدام اصلی همیشه یک دکمه بماند و
 *    دو دکمهٔ هم‌وزن با هم رقابت نکنند.
 *
 * ۲) **پرتره در گوشهٔ بالا-چپ موبایل** (نکتهٔ ۷): نسخهٔ قبل تصویر را
 *    `order-2` می‌گذاشت، یعنی *زیر* متن و دکمه — و کاربر درست گفت که در
 *    موبایل «می‌رود پایین و ساختار را به‌هم می‌ریزد». حالا در موبایل یک
 *    **ردیفِ بالا** داریم: تصویرِ کوچکِ مربع در گوشهٔ بالا-چپ (شروعِ RTL)
 *    و چیپ وضعیت در گوشهٔ بالا-راست؛ متن زیرشان تمام‌عرض. این هم «گوشهٔ
 *    بالا» است که خواسته شد، هم هیچ چیز را نمی‌پوشاند. در `md` به بالا
 *    تصویر بزرگ می‌شود و ستونِ کنارِ متن می‌مانَد.
 *
 * ۳) **تایمرِ تازه**: `Countdown` بازنویسی شد (چهار کاشیِ نفس‌کشنده، رقم
 *    ۹۰۰، تیکِ تک‌رقمی). این‌جا فقط جایش عوض شد: تایمر در یک ردیفِ
 *    مستقل با فاصلهٔ واقعی از تیتر و از دکمه.
 *
 * ── چرا فقط یک دکمهٔ پررنگ؟ ───────────────────────────────────────────────
 * تفکیک وزن = تفکیک تصمیم. دکمهٔ پررنگ «قوانین» است، چون کاربری که نمی‌داند
 * چه خبر است باید اول بخواند؛ لینکِ کم‌رنگ «ورود به آزمون» برای کسی است
 * که از قبل می‌داند چه می‌خواهد.
 */
export interface HeroStatus {
  window_state: ExamStatus["window_state"];
  starts_at: string;
  ends_at: string;
  starts_at_jalali: string;
  ends_at_jalali: string;
  seconds_until_start: number;
  seconds_until_end: number;
  description: string;
  questions_per_attempt: number;
  duration_seconds: number;
  window_state_label: string;
}

export function Hero({ status, serverNow }: { status: HeroStatus; serverNow?: string }) {
  const state = status.window_state;

  const absolute = serverNow
    ? secondsUntil(state === "upcoming" ? status.starts_at : status.ends_at, serverNow)
    : null;
  const secondsLeft =
    absolute ?? (state === "upcoming" ? status.seconds_until_start : status.seconds_until_end);

  const hasSchedule = Boolean(status.starts_at && status.ends_at);

  const stateChip =
    state === "upcoming"
      ? "border-gold/45 bg-gold-soft text-gold-strong"
      : state === "open"
        ? "border-verde/40 bg-verde-soft text-verde"
        : "border-brick/35 bg-brick-soft text-brick";

  const countdownLabel =
    state === "upcoming" ? "تا آغاز مهلت پاسخ‌گویی" : "تا پایان مهلت پاسخ‌گویی";

  const countdownEndMessage =
    state === "upcoming" ? "مهلت پاسخ‌گویی آغاز شد" : "مهلت پاسخ‌گویی به پایان رسید";

  const dateRange =
    status.starts_at_jalali && status.ends_at_jalali ? (
      <>
        {faJalali(status.starts_at_jalali)}
        <span className="text-text-subtle/70 mx-1.5" aria-hidden="true">
          تا
        </span>
        {faJalali(status.ends_at_jalali)}
      </>
    ) : (
      <span className="text-text-subtle">بازهٔ زمانی در حال دریافت…</span>
    );

  return (
    <section className="k185-tile-bg bg-canvas border-border/70 relative overflow-hidden border-b">
      {/* بافتِ بسیار محوِ هندسی — دیده نمی‌شود، حس می‌شود */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.035]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-4 pb-9 sm:px-6 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="grid gap-4 sm:gap-8 md:grid-cols-[minmax(0,1fr)_240px] md:items-center lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-12">
          {/* ── متن و اقدام ── */}
          <div className="order-2 flex min-w-0 flex-col md:order-1">
            {/* ردیف بالا: در موبایل تصویر + چیپ؛ از md چیپ تنها می‌ماند */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-bold ${stateChip}`}
                >
                  <span className="relative flex size-1.5" aria-hidden="true">
                    {state === "open" && (
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
                    )}
                    <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                  </span>
                  {status.window_state_label}
                </span>
                <span className="text-text-muted hidden text-[12px] font-semibold min-[420px]:inline">
                  {dateRange}
                </span>
              </div>

              {/* ── پرتره: موبایل، گوشهٔ بالا-چپ ── */}
              <div className="md:hidden">
                <HeroPortrait size={104} priority />
              </div>
            </div>

            <h1
              aria-label="مسابقهٔ کتاب‌خوانی هفتهٔ بسیج، کاوه ۱۸۵"
              className="text-text mt-3 text-[clamp(24px,7.2vw,40px)] leading-[1.24] font-extrabold tracking-tight sm:mt-4 lg:text-[clamp(28px,3.4vw,42px)]"
            >
              <span aria-hidden="true">
                مسابقهٔ کتاب‌خوانی
                <br />
                <span className="text-brand">هفتهٔ بسیج</span>
                <span className="text-text-subtle mx-2 font-light">|</span>
                <span className="text-gold-strong">کاوه ۱۸۵</span>
              </span>
            </h1>

            <p className="text-text-muted mt-2.5 max-w-[46ch] text-[12.5px] leading-[2] sm:mt-3 sm:text-[14px]">
              {status.description}
            </p>

            <span className="text-text-muted mt-2 text-[11.5px] font-semibold min-[420px]:hidden">
              {dateRange}
            </span>

            {/* ── تایمر ── */}
            <div className="mt-4 sm:mt-6">
              <span className="text-text-subtle mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-bold">
                <span className="text-gold-strong" aria-hidden="true">
                  <Girih size={10} />
                </span>
                {countdownLabel}
              </span>
              {hasSchedule ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Countdown
                    targetSeconds={Math.max(0, secondsLeft)}
                    label={countdownLabel}
                    variant="light"
                    tone={state === "upcoming" ? "upcoming" : "open"}
                    endMessage={countdownEndMessage}
                  />
                  {state === "open" && status.ends_at_jalali ? (
                    <span className="text-text-subtle text-[10.5px] font-semibold tabular-nums">
                      پایان: {faJalali(status.ends_at_jalali)}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="border-border bg-surface/70 text-text-subtle inline-flex items-center rounded-xl border px-3 py-2 text-[11.5px]">
                  در حال دریافت زمان‌بندی از سرور…
                </span>
              )}
            </div>

            {/* ── اقدام ── */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:mt-7">
              <Link
                href="/rules"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset,0_10px_24px_-14px_oklch(30%_0.08_258/0.6)] transition-colors sm:h-12 sm:px-6 sm:text-[14.5px]"
              >
                مشاهدهٔ قوانین
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={state === "open" ? "/exam" : "/register"}
                className="text-brand group inline-flex items-center gap-1.5 text-[13px] font-bold underline-offset-4 hover:underline"
              >
                {state === "open" ? "ورود به آزمون" : "ثبت‌نام و شرکت"}
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-x-0.5"
                >
                  <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ── پرتره در تبلت و دسکتاپ ── */}
          <div className="order-1 hidden justify-end md:order-2 md:flex">
            <HeroPortrait size={null} priority={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * قابِ پرتره — یک کامپوننت، دو اندازه.
 *
 * چرا جدا شد؟ چون موبایل و دسکتاپ دو قابِ کاملاً متفاوت داشتند و تکرارِ
 * مارک‌آپ باعث می‌شد یک روز یکی از قاب‌ها عقب بماند. این‌جا قاب مشترک است
 * و فقط اندازه فرق می‌کند.
 */
function HeroPortrait({ size, priority }: { size: number | null; priority: boolean }) {
  const isSmall = size !== null;

  return (
    <figure className={isSmall ? "m-0 shrink-0" : "m-0 w-full max-w-[300px]"}>
      <div
        className={`relative ${isSmall ? "" : "k185-lift"}`}
        style={isSmall ? { width: size, height: size } : undefined}
      >
        {/* هالهٔ طلایی پشت قاب */}
        <div
          aria-hidden="true"
          className={`bg-gold/12 absolute rounded-[30%] blur-2xl ${isSmall ? "-inset-2" : "-inset-4"}`}
        />

        <div
          className={`ring-gold/35 bg-surface relative overflow-hidden shadow-[0_18px_44px_-24px_oklch(28%_0.06_260/0.5)] ring-1 ${
            isSmall ? "size-full rounded-[26%]" : "rounded-[22px]"
          }`}
        >
          <Image
            src={isSmall ? "/img/emblem-portrait-sm.jpg" : "/img/emblem-portrait.jpg"}
            alt="تصویر شهید محمود کاوه، فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
            width={isSmall ? 384 : 768}
            height={isSmall ? 512 : 1024}
            priority={priority}
            sizes={isSmall ? "104px" : "(max-width: 1023px) 240px, 300px"}
            className="h-auto w-full"
          />

          {/* برچسب نام — فقط در قاب بزرگ، و روی نوارِ خوانا */}
          {isSmall ? null : (
            // ⚠️ این نوار عمداً تیره و تقریباً مات است: زمینهٔ پایینِ تصویر
            // کرمِ روشن است و در نسخهٔ قبل متنِ سفید روی آن خوانده نمی‌شد.
            <figcaption className="from-stage via-stage/85 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3.5 pt-10 pb-3">
              <p className="text-on-stage text-[12.5px] font-extrabold">شهید محمود کاوه</p>
              <p className="text-on-stage-muted mt-0.5 text-[10px]">فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا</p>
            </figcaption>
          )}
        </div>

        {/* گوشهٔ طلایی — همان جزئیاتِ کوچکی که قاب را «طراحی‌شده» نشان می‌دهد */}
        <span
          aria-hidden="true"
          className="border-gold/45 pointer-events-none absolute -top-px -right-px size-4 rounded-tr-[26%] border-t-2 border-r-2"
        />
      </div>
    </figure>
  );
}
