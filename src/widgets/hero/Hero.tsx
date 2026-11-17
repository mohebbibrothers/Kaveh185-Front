import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { Girih, MuqarnasArch } from "@/shared/ui/Ornament";
import { faJalali } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * هیروی صفحهٔ اول — یک قاب، یک پیام، یک اقدام.
 *
 * ── اصل حاکم بر این نسخه: «کم، ولی کامل» ────────────────────────────────
 * کاربر در سه ثانیهٔ اول فقط سه چیز می‌خواهد: **چه چیزی است**، **کِی
 * برگزار می‌شود**، **از کجا شروع کنم**. هر عنصری که به این سه پاسخ ندهد،
 * از هیرو حذف شده است:
 *
 * ۱) **پرسش/زمان/هزینه** از هیرو رفت. همان سه عدد در بخش «سه گام تا
 *    کارنامه» آمده بود و تکرارش صفحه را شلوغ می‌کرد. این‌جا فقط یک ردیف
 *    کوتاه «۵ پرسش · ۵ دقیقه · رایگان» به‌عنوان زیرنویسِ دکمه مانده که
 *    در همان سطح از توجه خوانده می‌شود، نه به‌عنوان یک بلوک مستقل.
 * ۲) **دکمهٔ دوم حذف شد.** «مطالعهٔ کتاب» سه بار در صفحه تکرار می‌شد؛
 *    این‌جا دکمهٔ اصلی می‌ماند و «کتاب» یک لینکِ متنیِ آرام کنارش است.
 *    دو دکمهٔ هم‌وزن در هیرو یعنی کاربر نمی‌داند کدام راهِ اصلی است.
 * ۳) **پرتره به جای خودش رفت.** تصویر شهید کاوه با پرچم، پیش‌تر این‌جا
 *    بود و تصویر «امام در حال مطالعه» باید در بخش کتاب می‌نشست؛ دو پرترهٔ
 *    بزرگ در یک صفحه، صفحه را به گالری تبدیل می‌کرد. اکنون هیرو یک
 *    ستون متنِ تنفس‌دار است و پرترهٔ کاوه به‌عنوان یک «تمبر» کوچک در
 *    بخش روایت (سمت چپِ عنوان) آمده — نه قاب رقیبِ محتوا.
 * ۴) **شمارش معکوس، تنها عنصر سنگین بصری** است؛ چون تنها چیزی است که
 *    هر ثانیه عوض می‌شود و صفحه را زنده نگه می‌دارد.
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

  /* یک ردیف کوتاه — سه چیزی که کاربر پیش از کلیک می‌پرسد.
     ⚠️ تعداد پرسش و مدت آزمون **عمداً این‌جا نیستند**: همان دو عدد در
     بخش «سه گام تا کارنامه» به گام‌های واقعی گره خورده‌اند (۱ دقیقه
     ثبت‌نام، ۵ دقیقه پاسخ). تکرارشان در هیرو، صفحه را شلوغ می‌کرد. */
  const facts = ["رایگان", "بدون نصب برنامه", "از خانه، در چند دقیقه"];

  return (
    <section className="k185-tile-bg bg-canvas border-border/70 relative overflow-hidden border-b">
      <MuqarnasArch className="text-brand/12 absolute inset-x-0 top-0 h-6 w-full" />

      {/* بافتِ بسیار محوِ هندسی — فقط برای این‌که سطح، «کاغذ تخت» نباشد.
          سه درصد شفافیت: دیده نمی‌شود، حس می‌شود. */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.035]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-9 pb-11 sm:px-6 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16">
          {/* ── متن ── */}
          <div className="order-1 flex flex-col lg:order-1">
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

            {/* تیتر دو خطی است و با <br> شکسته می‌شود، پس `aria-label` صریح
                می‌دهیم تا صفحه‌خوان یک جملهٔ روان بشنود، نه سه تکهٔ چسبیده. */}
            <h1
              aria-label={`مسابقهٔ کتاب‌خوانی هفتهٔ بسیج، کاوه ۱۸۵`}
              className="text-text mt-4 text-[clamp(27px,4.4vw,44px)] leading-[1.22] font-extrabold tracking-tight"
            >
              <span aria-hidden="true">
                مسابقهٔ کتاب‌خوانی
                <br />
                <span className="text-brand">هفتهٔ بسیج</span>
                <span className="text-text-subtle mx-2.5 font-light">|</span>
                <span className="text-gold-strong">کاوه ۱۸۵</span>
              </span>
            </h1>

            {/* شمارش معکوس — تنها عنصر سنگین بصری هیرو */}
            <div className="mt-6">
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

            {/* ── اقدام ──
                یک دکمهٔ اصلی، یک لینک آرام. سه واقعیتِ کوتاه زیرشان تا
                کاربر بدون رفتن به جای دیگر بداند با چه چیزی روبه‌روست. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
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
                className="text-text-muted hover:text-text group inline-flex items-center gap-1.5 text-[13px] font-bold transition-colors"
              >
                پیش از آزمون، کتاب را بخوانید
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-x-0.5"
                >
                  <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <p className="text-text-subtle mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] font-semibold tabular-nums">
              {facts.map((f, i) => (
                <span key={f} className="inline-flex items-center gap-2.5">
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="bg-border-strong/60 inline-block size-1 rounded-full"
                    />
                  ) : null}
                  {f}
                </span>
              ))}
              <span
                aria-hidden="true"
                className="bg-border-strong/60 inline-block size-1 rounded-full"
              />
            </p>
          </div>

          {/* ── پرترهٔ شهید کاوه، به‌عنوان «تمبرِ روایت» نه قابِ رقیب ──
              در موبایل کنار متن می‌نشیند (بالا) و در دسکتاپ ستون باریک
              سمت چپ. نسبت طبیعی تصویر حفظ می‌شود تا چهره یا شمسه بریده نشود. */}
          <div className="order-2 mx-auto w-[162px] shrink-0 sm:w-[196px] md:w-[228px] lg:order-2 lg:w-full">
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
                  sizes="(max-width: 1023px) 190px, 330px"
                  className="h-auto w-full"
                />
                {/* نوارِ نام، روی لبهٔ پایین تصویر — نه روی چهره */}
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
    </section>
  );
}
