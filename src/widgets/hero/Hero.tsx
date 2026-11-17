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
 * ── اصل حاکم: «کم، ولی کامل» ─────────────────────────────────────────────
 * کاربر در سه ثانیهٔ اول سه چیز می‌خواهد: **چه چیزی است**، **کِی برگزار
 * می‌شود**، **از کجا شروع کنم**. هر عنصری که به این سه پاسخ ندهد، این‌جا
 * نیست:
 *   • اعداد آزمون (۵ پرسش/۵ دقیقه) در بخش «سه گام» آمده‌اند، نه این‌جا.
 *   • لینک «کتاب را بخوانید» حذف شد؛ بخش بعدی صفحه همان را با وزنِ درست
 *     دارد و دو مسیر به یک مقصد در دو بلوکِ پشتِ‌سرهم، تکرار است.
 *   • تایمر تنها عنصر سنگینِ بصری است، چون تنها چیزی است که هر ثانیه
 *     عوض می‌شود.
 *
 * ── تصویر در موبایل — تصمیمِ مهمِ چیدمان ─────────────────────────────────
 * کاربر گفت: «در گوشی عکس شهید کاوه می‌رود پایین و ساختار را به‌هم
 * می‌ریزد؛ بهتر است گوشهٔ چپِ بالا باشد». پیش‌تر تصویر یک بلوکِ تمام‌عرض
 * **بعد از** دکمه بود و صفحه را دو تکه می‌کرد.
 *
 * اکنون در موبایل یک **شبکهٔ دو‌ستونی** داریم:
 *
 *     ┌──────────────┬────────┐
 *     │ چیپ وضعیت و │ تصویر  │   ← ردیف ۱ (تصویر گوشهٔ چپِ بالا)
 *     │ بازهٔ زمانی   │ (۹۲px) │
 *     ├──────────────┴────────┤
 *     │ تیتر · توضیح · تایمر  │   ← ردیف ۲ (تمام‌عرض)
 *     │ دکمه                  │
 *     └───────────────────────┘
 *
 * چرا این و نه «تصویر وسط بالای تیتر»؟ چون تصویرِ وسط، نگاه را از دکمه
 * می‌دزدد و تیتر را به دو تکه می‌شکند. تصویرِ گوشه‌ای هم ساختار را
 * می‌شکند نه، هم در ۳۲۰px جا می‌شود، هم تمرکز را از پیام نمی‌گیرد —
 * مثل «تمبر» عمل می‌کند.
 *
 * در `lg` همان شبکه، دو‌ستونیِ برعکس می‌شود (`متن | تصویرِ ۳۰۰px`) و
 * تصویر بلندتر می‌نشیند.
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

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-7 pb-9 sm:px-6 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3.5 sm:gap-x-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-14">
          {/* ── ردیف ۱ چپ/راست: چیپ وضعیت و بازه ── */}
          <div className="col-start-1 row-start-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 self-start">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-[11.5px] ${stateChip}`}
            >
              <span className="relative flex size-1.5" aria-hidden="true">
                {state === "open" && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
                )}
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
              {status.window_state_label}
            </span>
            <span className="text-text-muted text-[11px] font-semibold tabular-nums sm:text-[12px]">
              {status.starts_at_jalali && status.ends_at_jalali ? (
                <>
                  {faJalali(status.starts_at_jalali)}
                  <span className="text-text-subtle/70 mx-1" aria-hidden="true">
                    تا
                  </span>
                  {faJalali(status.ends_at_jalali)}
                </>
              ) : (
                <span className="text-text-subtle">بازهٔ زمانی در حال دریافت…</span>
              )}
            </span>
          </div>

          {/* ── تصویر شهید کاوه ──
              موبایل/تبلت: ستون دومِ ردیف اول، کوچک و بالاخُره‌چین (گوشهٔ
              چپِ بالا در RTL). دسکتاپ: ستون کاملِ کنار، از ردیف اول تا
              دوم کشیده. */}
          <div className="col-start-2 row-start-1 w-[88px] shrink-0 self-start sm:w-[118px] lg:row-span-2 lg:w-full lg:self-center">
            <figure className="relative m-0">
              <div
                aria-hidden="true"
                className="bg-gold/12 absolute -inset-2.5 rounded-[24px] blur-2xl lg:-inset-3 lg:rounded-[26px]"
              />
              <div className="ring-gold/25 bg-surface relative overflow-hidden rounded-[16px] shadow-[0_16px_40px_-24px_oklch(28%_0.06_260/0.5)] ring-1 lg:rounded-[20px]">
                <Image
                  src="/img/kaveh-hero-sm.jpg"
                  alt="تصویر شهید محمود کاوه، فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
                  width={495}
                  height={707}
                  priority
                  sizes="(max-width: 1023px) 118px, 300px"
                  className="h-auto w-full"
                />
                {/* نوارِ نام، روی لبهٔ پایین تصویر — نه روی چهره.
                    در موبایل حذف می‌شود: در ۸۸px فقط لکهٔ تیره است و
                    خوانده نمی‌شود؛ عنوان در بخش «دربارهٔ مسابقه» می‌آید. */}
                <div className="from-stage/92 via-stage/70 absolute inset-x-0 bottom-0 hidden bg-gradient-to-t to-transparent px-3 pt-6 pb-2.5 lg:block">
                  <p className="text-on-stage text-[11.5px] font-extrabold">شهید محمود کاوه</p>
                  <p className="text-on-stage-muted mt-0.5 text-[9.5px] tabular-nums">
                    فرماندهٔ لشکر ویژهٔ ۱۵۵ شهدا
                  </p>
                </div>
              </div>
            </figure>
          </div>

          {/* ── ردیف ۲: تیتر، توضیح، تایمر، اقدام (تمام‌عرض) ── */}
          <div className="col-span-2 row-start-2 mt-4 flex min-w-0 flex-col sm:mt-5 lg:col-span-1 lg:col-start-1 lg:mt-0">
            {/* تیتر دو خطی است و با <br> شکسته می‌شود، پس `aria-label` صریح
                می‌دهیم تا صفحه‌خوان یک جملهٔ روان بشنود، نه سه تکهٔ چسبیده. */}
            <h1
              aria-label="مسابقهٔ کتاب‌خوانی هفتهٔ بسیج، کاوه ۱۸۵"
              className="text-text text-[clamp(25px,4.2vw,43px)] leading-[1.24] font-extrabold tracking-tight"
            >
              <span aria-hidden="true">
                مسابقهٔ کتاب‌خوانی
                <br />
                <span className="text-brand">هفتهٔ بسیج</span>
                <span className="text-text-subtle mx-2.5 font-light">|</span>
                <span className="text-gold-strong">کاوه ۱۸۵</span>
              </span>
            </h1>

            <p className="text-text-muted mt-2.5 max-w-[46ch] text-[12.5px] leading-[2] sm:mt-3 sm:text-[14px]">
              {status.description}
            </p>

            {/* ── زمان ── */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-5">
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
                  {/* تاریخ پایان، ریز و کنار تایمر: تایمر «چقدر مانده»
                      می‌گوید، این «کِی» — دو پرسشِ متفاوت، یک ردیف. */}
                  {state === "open" && status.ends_at_jalali ? (
                    <span className="text-text-subtle hidden text-[10.5px] font-semibold tabular-nums sm:inline">
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
                جدا از بلوک زمان، با فاصلهٔ روشنِ عمودی. دکمهٔ اصلی: در
                حالت «آزمون فعال» به فرم شرکت، در غیر این صورت به قوانین.

                ⚠️ چرا «مشاهدهٔ قوانین» (خواستهٔ کاربر) و نه «ثبت‌نام»؟
                در حالتِ فعال، ثبت‌نام از خودِ صفحهٔ آزمون و از نوار بالای
                سایت در دسترس است؛ اما قوانین جای دیگری در دسترس نیست و
                کاربر پیش از شرکت باید بداند چه چیزی را می‌پذیرد. پس
                اقدامِ اصلیِ هیرو، **آگاهی** است، نه پرش به فرم. */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:mt-6">
              <Link
                href="/rules"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset,0_10px_24px_-14px_oklch(30%_0.08_258/0.6)] transition-colors sm:h-12 sm:px-6 sm:text-[14px]"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
