import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { faJalali, faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";

/**
 * هیروی صفحهٔ اول — یک تصویر، یک پیام، دو دکمه.
 *
 * چرا این ساختار؟
 * ────────────────
 * نسخهٔ قبلی سه لایهٔ تزئین روی هم داشت (الگوی هندسی + قاب دوتایی + چهار
 * شمسه) و کنارش یک «شبیه‌ساز جلسهٔ آزمون» با سؤال ساختگی می‌گذاشت. نتیجه:
 * صفحه شلوغ بود و کاربر نمی‌دانست اول کجا را بخواند.
 *
 * این نسخه بر پایهٔ تصویر رسمی رویداد ساخته شده و چهار چیز را به ترتیب
 * چشم می‌چیند: چهره → نام رویداد → زمان → دکمه. هر چیز دیگری حذف شد.
 * عدد و آمار واقعی از API می‌آید؛ هیچ سؤال یا آمار ساختگی نمایش داده نمی‌شود.
 */
export function Hero({ status }: { status: ExamStatus }) {
  const state = status.window_state;
  const secondsLeft = state === "upcoming" ? status.seconds_until_start : status.seconds_until_end;

  const stateChip =
    state === "upcoming"
      ? "border-gold/45 bg-gold-soft text-gold-strong"
      : state === "open"
        ? "border-verde/40 bg-verde-soft text-verde"
        : "border-brick/35 bg-brick-soft text-brick";

  return (
    <section className="bg-surface-2/60 border-border/70 relative overflow-hidden border-b">
      {/* کاغذ کرم با بافتِ خیلی ملایم — بدون الگوی شلوغ */}
      <div
        aria-hidden="true"
        className="from-gold-soft/50 pointer-events-none absolute inset-0 bg-gradient-to-bl via-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="grid items-center gap-9 md:grid-cols-[1fr_auto] md:gap-12">
          {/* ── متن: راست در RTL ── */}
          <div className="order-2 md:order-1">
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="text-text-subtle text-[12px] font-medium">
                {faJalali(status.starts_at_jalali)} تا {faJalali(status.ends_at_jalali)}
              </span>
            </div>

            <h1 className="text-text mt-4 text-[clamp(26px,4.2vw,42px)] leading-[1.3] font-extrabold tracking-tight">
              مسابقهٔ کتابخوانی
              <br />
              <span className="text-brick">هفتهٔ بسیج</span> — کاوه ۱۸۵
            </h1>

            <p className="text-text-muted mt-3.5 max-w-[46ch] text-[13.5px] leading-[2.05] sm:text-[14.5px]">
              {status.description}
            </p>

            {/* ── شمارش معکوس: یک ردیف تمیز ── */}
            <div className="mt-6 max-w-[340px]">
              <p className="text-text-subtle mb-2 text-[11px] font-bold">
                {state === "upcoming" ? "تا آغاز مهلت آزمون" : "تا پایان مهلت آزمون"}
              </p>
              <Countdown
                targetSeconds={Math.max(0, secondsLeft)}
                label="زمان باقی‌مانده"
                variant="light"
              />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link
                href="/register"
                className="bg-brick text-on-brand hover:bg-brand inline-flex h-12 items-center rounded-lg px-6 text-[14.5px] font-extrabold shadow-sm transition-colors"
              >
                {state === "open" ? "ورود به آزمون" : "ثبت‌نام و شرکت"}
              </Link>
              <Link
                href="/rules"
                className="border-border-strong text-text hover:bg-surface inline-flex h-12 items-center rounded-lg border px-5 text-[13.5px] font-bold transition-colors"
              >
                قوانین مسابقه
              </Link>
            </div>

            {/* ── سه عدد واقعی، بدون تزئین ── */}
            <dl className="border-border/80 mt-8 grid max-w-md grid-cols-3 gap-4 border-t pt-4">
              {[
                { k: "سؤال در هر آزمون", v: faNumber(status.questions_per_attempt) },
                { k: "فرصت پاسخ", v: `${toFa(Math.round(status.duration_seconds / 60))} دقیقه` },
                { k: "هزینهٔ شرکت", v: "رایگان" },
              ].map((x) => (
                <div key={x.k}>
                  <dd className="text-text text-[15px] font-extrabold tabular-nums">{x.v}</dd>
                  <dt className="text-text-subtle mt-0.5 text-[11px]">{x.k}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* ── تصویر رسمی رویداد ── */}
          <div className="order-1 md:order-2 md:w-[318px] lg:w-[356px]">
            <figure className="relative">
              {/* هالهٔ نرم طلایی پشت تصویر — نه قاب دوتایی */}
              <div
                aria-hidden="true"
                className="bg-gold/12 absolute -inset-4 rounded-[28px] blur-2xl"
              />
              <div className="ring-gold/35 relative overflow-hidden rounded-2xl shadow-[0_18px_50px_-20px_oklch(35%_0.06_60/0.35)] ring-1">
                <Image
                  src="/media/kaveh-hero.jpg"
                  alt="تصویر شهید محمود کاوه، فرمانده لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
                  width={900}
                  height={1286}
                  priority
                  sizes="(max-width: 767px) 80vw, 356px"
                  className="h-auto w-full"
                />
                <figcaption className="from-stage via-stage/80 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-4 pt-14 pb-3.5 backdrop-blur-[1px]">
                  <p className="text-on-stage text-[12.5px] font-extrabold">شهید محمود کاوه</p>
                  <p className="text-on-stage-muted text-[10.5px]">
                    فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا — ۱۳۴۱ تا ۱۳۶۵
                  </p>
                </figcaption>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
