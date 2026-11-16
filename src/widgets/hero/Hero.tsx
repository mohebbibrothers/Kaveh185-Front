import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { Girih, MuqarnasArch } from "@/shared/ui/Ornament";
import { faJalali, faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * هیروی صفحهٔ اول — یک قاب، یک پیام، یک اقدام.
 *
 * ── چه چیزی عوض شد و چرا؟ ────────────────────────────────────────────────
 * ۱) **تصویر**: نسخهٔ قبل تصویر را با `object-cover` در یک قابِ
 *    `rounded-2xl` می‌گذاشت و زیرنویس روی آن می‌نشست؛ نتیجه این بود که
 *    کادر و پرچم و چهره در عرض‌های مختلف ناهم‌تراز می‌شدند. اکنون تصویر
 *    در نسبت طبیعی خودش (`h-auto w-full`) داخل یک قابِ محرابی می‌نشیند و
 *    زیرنویس در یک نوار مستقل **زیر** تصویر است، نه روی چهره.
 * ۲) **سلسله‌مراتب**: نشان وضعیت → عنوان → توضیح → شمارش معکوس → دو دکمه
 *    → سه عدد. ترتیب برای چشم است: «چی؟ کِی؟ چکار کنم؟».
 * ۳) **شمارش معکوس**: بازطراحی کامل (← `widgets/countdown`) با وزن بصری
 *    درست؛ «روز» بزرگ، بقیه ریز.
 * ۴) **رنگ**: لاجورد برند به‌جای قرمز-آجری. قرمز فقط جایی می‌آید که
 *    هشدار یا فوریت باشد.
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
      {/* خط تزئینی محرابی بالای بخش — لطیف، بی‌شلوغی */}
      <MuqarnasArch className="text-brand/12 absolute inset-x-0 top-0 h-6 w-full" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:pt-16 lg:pb-16">
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          {/* ── متن ── */}
          <div className="order-2 flex flex-col lg:order-1">
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

            <h1 className="text-text mt-4 text-[clamp(27px,4.4vw,44px)] leading-[1.22] font-extrabold tracking-tight">
              مسابقهٔ کتاب‌خوانی
              <br />
              <span className="text-brand">هفتهٔ بسیج</span>
              <span className="text-text-subtle mx-2.5 font-light">|</span>
              <span className="text-gold-strong">کاوه ۱۸۵</span>
            </h1>

            <p className="text-text-muted mt-4 max-w-[48ch] text-[13.5px] leading-[2.05] sm:text-[14.5px]">
              {status.description}
            </p>

            {/* ── نوار زمان و اقدام ──
                شمارنده و سه عدد در یک ردیف، دکمه‌ها بلافاصله زیرشان. در
                نسخهٔ اول شمارنده و دکمه‌ها هر کدام مستقل و راست‌چین بودند و
                ستون متن نیمه‌خالی می‌ماند؛ اکنون یک «نوار» منسجم ساخته‌اند. */}
            <div className="mt-7 grid gap-4 sm:grid-cols-[minmax(0,315px)_minmax(0,1fr)] sm:items-center">
              <div>
                <p className="text-text-subtle mb-2 flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="text-gold-strong" aria-hidden="true">
                    <Girih size={10} />
                  </span>
                  {countdownLabel}
                </p>
                {hasSchedule ? (
                  <Countdown
                    targetSeconds={Math.max(0, secondsLeft)}
                    label={countdownLabel}
                    variant="light"
                    tone={state === "upcoming" ? "upcoming" : "open"}
                    endMessage={countdownEndMessage}
                  />
                ) : (
                  <div className="border-border bg-surface/70 text-text-subtle grid h-[62px] place-items-center rounded-xl border text-[12px]">
                    در حال دریافت زمان‌بندی از سرور…
                  </div>
                )}
              </div>

              {/* سه عدد واقعی — کنار شمارنده، نه زیر آن */}
              <dl className="border-border/80 grid grid-cols-3 gap-3 border-t pt-3 sm:border-t-0 sm:border-r sm:pt-0 sm:pr-4">
                {[
                  { k: "پرسش در هر آزمون", v: faNumber(status.questions_per_attempt) },
                  {
                    k: "فرصت پاسخ",
                    v: `${toFa(Math.round(status.duration_seconds / 60))} دقیقه`,
                  },
                  { k: "هزینهٔ شرکت", v: "رایگان" },
                ].map((x) => (
                  <div key={x.k}>
                    <dd className="text-text text-[15.5px] font-extrabold tabular-nums">{x.v}</dd>
                    <dt className="text-text-subtle mt-0.5 text-[10.5px] leading-4">{x.k}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                href="/register"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[14.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset,0_10px_24px_-14px_oklch(30%_0.08_258/0.6)] transition-colors"
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
              <Link
                href="/book"
                className="border-border-strong bg-surface text-text hover:border-brand/40 hover:bg-canvas inline-flex h-12 items-center rounded-xl border px-5 text-[13.5px] font-bold transition-colors"
              >
                مطالعهٔ کتاب
              </Link>
            </div>
          </div>

          {/* ── تصویر رسمی ──
              ⚠️ نکتهٔ کلیدی: `object-cover` حذف شد. تصویر در نسبت طبیعی
              خودش و کامل دیده می‌شود؛ قاب گرد و محرابی است ولی هیچ بخشی از
              چهره یا تاج شمسه بریده نمی‌شود. زیرنویس زیر تصویر است، نه
              روی آن. */}
          <div className="order-1 mx-auto w-[196px] shrink-0 sm:w-[240px] lg:order-2 lg:w-full">
            <figure className="relative">
              <div
                aria-hidden="true"
                className="bg-gold/14 absolute -inset-3 rounded-[26px] blur-2xl"
              />
              <div className="ring-gold/30 bg-surface relative overflow-hidden rounded-[22px] shadow-[0_20px_50px_-24px_oklch(28%_0.06_260/0.45)] ring-1">
                <MuqarnasArch className="text-gold/25 absolute inset-x-0 top-0 z-10 h-5 w-full" />
                <Image
                  src="/img/kaveh-hero.jpg"
                  alt="تصویر شهید محمود کاوه، فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
                  width={900}
                  height={1286}
                  priority
                  sizes="(max-width: 1023px) 240px, 360px"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="text-center">
                <p className="text-text mt-2.5 text-[12.5px] font-extrabold">شهید محمود کاوه</p>
                <p className="text-text-muted mt-0.5 text-[10.5px] leading-5">
                  فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا — ۱۳۴۱ تا ۱۳۶۵
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
