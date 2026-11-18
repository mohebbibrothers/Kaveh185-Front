import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { Girih } from "@/shared/ui/Ornament";
import { faJalali } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * هیروی صفحهٔ اول — یک پیام، یک زمان، یک تصمیم.
 *
 * ── چهار نکتهٔ کاربر که همین‌جا حل شد ────────────────────────────────────
 *
 * ۱) **موبایل و فولدِبل: همه‌چیز وسط‌چین** (نکتهٔ ۵).
 *    نسخهٔ قبل پرتره را در گوشهٔ بالا-چپ می‌گذاشت و متن را کنارِ آن؛ در
 *    ۳۲۰–۳۹۰px نتیجه یک «ستونِ چپ‌چین با گوشهٔ خالی» بود که خودِ کاربر
 *    گفت به‌دردنخور است. حالا در `lg` پایین، پرتره **بالای متن** و
 *    وسط‌چین است، بزرگ‌تر از قبل (۱۵۲px)، و تیتر/تایمر/دکمه‌ها هم همه
 *    وسط‌چین‌اند. از `lg` به بالا همان چیدمانِ دوستونیِ قبلی برمی‌گردد.
 *
 * ۲) **کادرِ پرتره: «طاقِ مینا»** (نکتهٔ ۳).
 *    نسخهٔ قبل تصویر را در یک مستطیلِ ۲۲px با حلقهٔ نازک می‌گذاشت؛ نتیجه
 *    «کادرِ عکسِ خام» بود. حالا قاب یک **طاقِ محرابی** است: قوسِ بالا،
 *    لایه‌های عمق (سایهٔ بیرونی + نورِ داخلی + هالهٔ طلایی)، یک لبهٔ
 *    براقِ لغزنده، و زیرنویسِ نام روی نوارِ شیشه‌ای. تصویر خودش
 *    **بدون پس‌زمینه** است، پس طاق روی زمینهٔ سایت می‌نشیند، نه روی یک
 *    مستطیلِ کرم.
 *
 * ۳) **دکمهٔ دوم: «مشاهدهٔ رتبه‌بندی مساجد»** (نکتهٔ ۴).
 *    «ثبت‌نام و شرکت» دو بار در صفحه بود (هدر + هیرو). حالا دکمهٔ دوم
 *    به `/mosques` می‌رود؛ ثبت‌نام یک بار در هدر و یک بار در پایانِ
 *    همین هیرو به‌صورت متنِ کم‌رنگ هست — بدون تکرارِ وزنِ بصری.
 *
 * ۴) **تایمر: «حلقهٔ زمان»** (نکتهٔ ۲) — جداگانه در `Countdown` توضیح داده
 *    شده؛ این‌جا فقط جای آن در ستونِ وسط‌چینِ موبایل است.
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
      {/* هالهٔ گرمِ پشتِ پرتره در دسکتاپ */}
      <div
        aria-hidden="true"
        className="bg-gold/10 pointer-events-none absolute -top-24 left-[18%] hidden size-[26rem] rounded-full blur-3xl lg:block"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-3 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          {/* ── متن و اقدام ── */}
          <div className="order-2 flex min-w-0 flex-col items-center text-center md:order-1 md:items-start md:text-start">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start">
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

            <h1
              aria-label="مسابقهٔ کتاب‌خوانی هفتهٔ بسیج، کاوه ۱۸۵"
              className="text-text mt-3 text-[clamp(23px,6.9vw,40px)] leading-[1.28] font-extrabold tracking-tight sm:mt-4 lg:text-[clamp(28px,3.4vw,42px)]"
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
            <div className="mt-4 flex w-full flex-col items-center sm:mt-6 md:items-start">
              <span className="text-text-subtle mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-bold">
                <span className="text-gold-strong" aria-hidden="true">
                  <Girih size={10} />
                </span>
                {countdownLabel}
              </span>
              {/* موبایل: تاریخِ پایان زیرِ تایمر می‌رود، نه کنارش — وگرنه
                  تایمر از مرکزِ ستون بیرون می‌زند (دیده‌شده در ۳۹۰px). */}
              {hasSchedule ? (
                <div className="flex flex-col items-center gap-1.5 md:flex-row md:items-center md:justify-start md:gap-x-3">
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

            {/* ── اقدام ──
                ⚠️ نکتهٔ ۱ کاربر (دورِ ۱۶): لینکِ کم‌رنگِ «ثبت‌نام در مسابقه» /
                «ورود به آزمون» زیرِ تایمر **کامل حذف شد**. دو دلیل:
                ۱) همان دکمه با همان مقصد در هدر، دو کلیک‌بالا‌تر، هست؛
                   تکرارش هم شلوغی بود و هم وزنِ بصریِ بی‌جا.
                ۲) زیرِ تایمر، کاربر دنبالِ «زمان» است نه یک لینکِ سوم؛
                   لینکِ کوچک آن‌جا فقط تمرکزِ شمارشِ معکوس را می‌شکست.
                پس اقدام‌های هیرو دقیقاً دو دکمه‌اند: قوانین و رتبه‌بندی مساجد. */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5 sm:mt-7 md:justify-start">
              <Link
                href="/rules"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset,0_10px_24px_-14px_oklch(30%_0.08_258/0.6)] transition-colors sm:h-12 sm:px-6 sm:text-[14.5px]"
              >
                مشاهدهٔ قوانین
                <Chevron />
              </Link>
              <Link
                href="/mosques"
                className="border-border-strong/80 text-text hover:border-brand/50 hover:bg-surface inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[13px] font-bold transition-colors sm:h-12 sm:px-5 sm:text-[13.5px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-gold-strong"
                >
                  <path d="M4 20h16" />
                  <path d="M7 20v-6M12 20V9M17 20v-9" />
                </svg>
                رتبه‌بندی مساجد
              </Link>
            </div>
          </div>

          {/* ── پرتره: در موبایل/تبلتِ عمودی بالای متن و وسط‌چین، در دسکتاپ ستونِ کنار ── */}
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <HeroPortrait priority />
          </div>
        </div>
      </div>
    </section>
  );
}

/** فلشِ کوچکِ «رفتن» — مشترک بین دکمه‌ها. */
function Chevron() {
  return (
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
  );
}

/**
 * قابِ پرتره — **«طاقِ مینا»**.
 *
 * ── چه چیزی این قاب را از «کادرِ عکس» جدا می‌کند؟ ────────────────────────
 * چهار لایهٔ مستقل، هر کدام یک کار:
 *   ۱) **هاله** — یک لکهٔ طلاییِ محو پشتِ قاب که آن را از سطح جدا می‌کند.
 *   ۲) **بدنهٔ طاق** — پس‌زمینهٔ گرادیانی تیره-به-روشن + سایهٔ دوگانه
 *      (سایهٔ عمیقِ بیرونی برای «بلندشدن» و نورِ داخلیِ بالا برای «براق
 *      بودن»). این همان حسِ سه‌بعدی است، بدون تصویر و بدون WebGL.
 *   ۳) **لبهٔ براق** — یک حلقهٔ نازکِ گرادیانی + یک خطِ نورِ مورب که فقط
 *      در هاور عبور می‌کند (کشفِ کوچک، نه شلوغی).
 *   ۴) **زیرنویسِ شیشه‌ای** — نام شهید روی نوارِ `backdrop-blur` پایینِ
 *      قاب، تا تصویر «بی‌نام» نماند.
 *
 * تصویر **بدون پس‌زمینه** است و با `object-contain` می‌نشیند، پس هیچ
 * بخشی از خوش‌نویسی یا پرچم بریده نمی‌شود.
 */
function HeroPortrait({ priority }: { priority: boolean }) {
  return (
    <figure className="k185-portrait m-0 w-[clamp(150px,44vw,190px)] shrink-0 lg:w-full lg:max-w-[300px]">
      <div className="relative">
        {/* ۱) هاله */}
        <div aria-hidden="true" className="bg-gold/25 absolute -inset-5 rounded-[46%] blur-3xl" />
        <div
          aria-hidden="true"
          className="bg-brand/12 absolute inset-x-6 -bottom-4 h-16 rounded-full blur-2xl"
        />

        {/* ۲) بدنهٔ طاق */}
        <div className="k185-arch via-gold-soft/45 to-gold-soft/15 relative overflow-hidden rounded-t-[999px] rounded-b-[26px] border border-white/25 bg-gradient-to-b from-white/55 p-[5px] shadow-[0_30px_60px_-30px_oklch(24%_0.06_260/0.65),0_2px_0_oklch(100%_0_0/0.75)_inset]">
          <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[22px] bg-[radial-gradient(120%_90%_at_50%_0%,oklch(100%_0_0/0.96),oklch(94%_0.03_86/0.9)_55%,oklch(90%_0.035_84/0.85))]">
            <Image
              src="/img/emblem-mark.webp"
              alt="نشان یادبود شهید محمود کاوه — پرتره در کادر گنبدی با پرچم ایران و خوش‌نویسی «به یاد شهید کاوه، حوزهٔ ۱۸۵»"
              width={420}
              height={688}
              priority={priority}
              sizes="(max-width: 1023px) 190px, 300px"
              className="h-auto w-full select-none"
            />

            {/* ۳) لبهٔ داخلی + براقیت */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-t-[999px] rounded-b-[22px] shadow-[inset_0_0_0_1px_oklch(100%_0_0/0.5),inset_0_-30px_40px_-30px_oklch(30%_0.05_80/0.55)]"
            />
            <span
              aria-hidden="true"
              className="k185-arch-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />

            {/* ۴) زیرنویسِ شیشه‌ای */}
            <figcaption className="bg-stage/55 absolute inset-x-2 bottom-2 rounded-xl border border-white/25 px-2.5 py-1.5 text-center backdrop-blur-md">
              <span className="text-on-stage block text-[10.5px] leading-tight font-extrabold">
                شهید محمود کاوه
              </span>
              <span className="text-on-stage-muted mt-0.5 block text-[8.5px] leading-tight">
                فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا
              </span>
            </figcaption>
          </div>
        </div>

        {/* گوشه‌های زرین — جزئیاتِ کوچکی که قاب را «کارشده» نشان می‌دهد */}
        <span
          aria-hidden="true"
          className="border-gold/60 pointer-events-none absolute -bottom-1 -left-1 size-5 rounded-bl-xl border-b-2 border-l-2"
        />
        <span
          aria-hidden="true"
          className="border-gold/60 pointer-events-none absolute -right-1 -bottom-1 size-5 rounded-br-xl border-r-2 border-b-2"
        />
      </div>
    </figure>
  );
}
