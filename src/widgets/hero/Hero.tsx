import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { Girih, MuqarnasArch } from "@/shared/ui/Ornament";
import { faJalali } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * هیروی صفحهٔ اول — یک پیام، یک زمان، یک اقدام.
 *
 * ── دو ایرادِ نسخهٔ قبل که کاربر دید و این‌جا حل شده ──────────────────────
 * ۱) **شمارش معکوسِ گشاد.** مشکل از کامپوننت تایمر بود (اصلاح شد: حالا
 *    `inline-flex` و به اندازهٔ محتوا). این‌جا هم دیگر در یک ستونِ تمام‌عرض
 *    کشیده نمی‌شود؛ با برچسبش در یک ردیف می‌نشیند.
 * ۲) **دکمه‌ها زیر تایمر.** دکمهٔ اصلی و «پیش از آزمون کتاب را بخوانید»
 *    مستقیم زیر شمارنده بودند و چشم بین «چه وقت است» و «چه کار کنم»
 *    گیر می‌کرد. اکنون ترتیبِ بصری: وضعیت → تیتر → تایمر (اطلاعات) →
 *    **یک فاصلهٔ معنادار** → اقدام.
 *
 * ── چرا فقط یک دکمه؟ ─────────────────────────────────────────────────────
 * در کل صفحه فقط دو اقدام هست: این دکمه و دکمهٔ طلایی بنر پایانی. لینکِ
 * متنی «کتاب» زیر دکمه می‌ماند چون مسیرِ دومِ واقعی است، ولی وزن دکمه
 * ندارد. تفکیک وزن = تفکیک تصمیم.
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

  return (
    <section className="k185-tile-bg bg-canvas border-border/70 relative overflow-hidden border-b">
      <MuqarnasArch className="text-brand/12 absolute inset-x-0 top-0 h-6 w-full" />

      {/* بافتِ بسیار محوِ هندسی — سه درصد شفافیت: دیده نمی‌شود، حس می‌شود. */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.035]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-10 sm:px-6 sm:pt-11 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="grid items-center gap-7 sm:gap-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          {/* ── متن ── */}
          <div className="order-1 flex min-w-0 flex-col">
            {/* چیپِ وضعیت + بازهٔ زمانی — در دسکتاپ این‌جاست (بالای تیتر).
                در موبایل همین محتوا در ردیفِ بالای هیرو، کنار تصویر می‌آید؛
                دو نسخهٔ هم‌زمان با `lg:hidden` و `hidden lg:flex` تفکیک
                می‌شوند — CSS، نه JS؛ پس بدون جاوااسکریپت هم درست است. */}
            <div className="hidden flex-wrap items-center gap-x-3 gap-y-2 lg:flex">
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
              <span className="text-text-muted text-[12px] font-semibold">
                {status.starts_at_jalali && status.ends_at_jalali ? (
                  <>
                    {faJalali(status.starts_at_jalali)}
                    <span className="text-text-subtle/70 mx-1.5" aria-hidden="true">
                      تا
                    </span>
                    {faJalali(status.ends_at_jalali)}
                  </>
                ) : (
                  <span className="text-text-subtle">بازهٔ زمانی در حال دریافت…</span>
                )}
              </span>
            </div>

            {/* تیتر دو خطی است و با <br> شکسته می‌شود، پس `aria-label` صریح
                می‌دهیم تا صفحه‌خوان یک جملهٔ روان بشنود، نه سه تکهٔ چسبیده. */}
            <h1
              aria-label="مسابقهٔ کتاب‌خوانی هفتهٔ بسیج، کاوه ۱۸۵"
              className="text-text mt-3.5 text-[clamp(26px,4.2vw,43px)] leading-[1.22] font-extrabold tracking-tight sm:mt-4"
            >
              <span aria-hidden="true">
                مسابقهٔ کتاب‌خوانی
                <br />
                <span className="text-brand">هفتهٔ بسیج</span>
                <span className="text-text-subtle mx-2.5 font-light">|</span>
                <span className="text-gold-strong">کاوه ۱۸۵</span>
              </span>
            </h1>

            <p className="text-text-muted mt-3 max-w-[46ch] text-[13px] leading-[2.05] sm:text-[14px]">
              {status.description}
            </p>

            {/* ── زمان ──
                برچسب و خودِ تایمر در یک ردیف؛ تایمر به اندازهٔ محتوا،
                نه کشیده تا انتهای ستون. */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-6">
              <span className="text-text-subtle inline-flex items-center gap-1.5 text-[11px] font-bold">
                <span className="text-gold-strong" aria-hidden="true">
                  <Girih size={10} />
                </span>
                {countdownLabel}
              </span>
              {hasSchedule ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Countdown
                    targetSeconds={Math.max(0, secondsLeft)}
                    label={countdownLabel}
                    variant="light"
                    tone={state === "upcoming" ? "upcoming" : "open"}
                    endMessage={countdownEndMessage}
                  />
                  {/* تاریخِ پایان، ریز و کنار تایمر: تایمر «چقدر مانده»
                      می‌گوید، این «کِی» — دو پرسشِ متفاوت، یک ردیف. */}
                  {state === "open" && status.ends_at_jalali ? (
                    <span className="text-text-subtle text-[10.5px] font-semibold tabular-nums">
                      پایان: {faJalali(status.ends_at_jalali)}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="border-border bg-surface/70 text-text-subtle inline-flex items-center rounded-lg border px-3 py-2 text-[11.5px]">
                  در حال دریافت زمان‌بندی از سرور…
                </span>
              )}
            </div>

            {/* ── اقدام ──
                یک دکمه، بدون لینکِ دوم. لینکِ «کتاب را بخوانید» حذف شد چون
                بخشِ بعدی صفحه (کتاب و کلام) بلافاصله همان اقدام را با وزن
                درست دارد؛ داشتنِ دو مسیر به یک مقصد در دو بلوکِ پشتِ‌سرهم
                همان «تکرار»ی است که کاربر ایراد گرفته بود. */}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:mt-8">
              <Link
                href="/register"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset,0_10px_24px_-14px_oklch(30%_0.08_258/0.6)] transition-colors sm:h-12 sm:px-6 sm:text-[14.5px]"
              >
                {state === "open" ? "ورود به آزمون" : "ثبت‌نام و شرکت"}
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
            </div>
          </div>

          {/* ── ردیفِ بالای هیرو: وضعیت + تصویر ──
              در موبایل تصویر سمتِ چپ و چیپ سمتِ راست می‌نشیند؛ در `lg`
              این بلوک به ستونِ کنارِ متن تبدیل می‌شود و چیپ به بالای متن
              برمی‌گردد (`lg:` زیر). */}
          <div className="order-0 flex min-w-0 items-start justify-between gap-3 sm:items-center lg:order-2 lg:block lg:w-full">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3 lg:hidden">
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
              <span className="text-text-muted text-[12px] font-semibold">
                {status.starts_at_jalali && status.ends_at_jalali ? (
                  <>
                    {faJalali(status.starts_at_jalali)}
                    <span className="text-text-subtle/70 mx-1.5" aria-hidden="true">
                      تا
                    </span>
                    {faJalali(status.ends_at_jalali)}
                  </>
                ) : (
                  <span className="text-text-subtle">بازهٔ زمانی در حال دریافت…</span>
                )}
              </span>
            </div>
            <div className="w-[112px] shrink-0 sm:w-[152px] md:w-[176px] lg:mt-6 lg:w-full">
              <figure className="relative">
                <div
                  aria-hidden="true"
                  className="bg-gold/12 absolute -inset-3 rounded-[26px] blur-2xl"
                />
                <div className="ring-gold/25 bg-surface relative overflow-hidden rounded-[20px] shadow-[0_20px_50px_-26px_oklch(28%_0.06_260/0.45)] ring-1">
                  <Image
                    src="/img/kaveh-hero.jpg"
                    alt="تصویر شهید محمود کاوه، فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
                    width={900}
                    height={1286}
                    priority
                    sizes="(max-width: 1023px) 200px, 300px"
                    className="h-auto w-full"
                  />
                  <div className="from-stage/92 via-stage/70 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-6 pb-2.5">
                    <p className="text-on-stage text-[11.5px] font-extrabold">شهید محمود کاوه</p>
                    <p className="text-on-stage-muted mt-0.5 text-[9.5px] tabular-nums">
                      فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا
                    </p>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
