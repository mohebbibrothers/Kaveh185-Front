import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/widgets/countdown/Countdown";
import { faJalali, faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { secondsUntil } from "@/shared/lib/time";

/**
 * فقط همین چند فیلد از وضعیت آزمون لازم است.
 *
 * چرا نوع باریک و نه `ExamStatus` کامل؟ چون این کامپوننت در بستهٔ اولیهٔ
 * صفحه می‌ماند. «باریک‌کردن ورودی» به‌تنهایی حجم JS را کم نمی‌کند، ولی
 * مرزِ وابستگی را روشن نگه می‌دارد: هر فیلد تازه باید آگاهانه اضافه شود،
 * نه اینکه با یک import از قرارداد کامل، کل ماژول به بستهٔ اولیه بچسبد.
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
export function Hero({ status, serverNow }: { status: HeroStatus; serverNow?: string }) {
  const state = status.window_state;

  /**
   * مبنای شمارش: تاریخ مطلق، نه ثانیهٔ پخته‌شده در HTML.
   *
   * `seconds_until_*` هنگام ساخت محاسبه می‌شود؛ اگر صفحه ساعت‌ها بعد باز
   * شود، آن عدد عقب است. `starts_at`/`ends_at` مطلق‌اند و در برابر ساعتِ
   * سرور سنجیده می‌شوند (← `shared/lib/time.ts`). اگر تاریخ نامعتبر بود،
   * به همان عدد پخته برمی‌گردیم تا شمارنده هرگز خالی نماند.
   */
  const absolute = serverNow
    ? secondsUntil(state === "upcoming" ? status.starts_at : status.ends_at, serverNow)
    : null;
  const secondsLeft =
    absolute ?? (state === "upcoming" ? status.seconds_until_start : status.seconds_until_end);

  /** آیا تاریخ‌های واقعی رسیده‌اند؟ پوستهٔ خالی تاریخ ندارد. */
  const hasSchedule = Boolean(status.starts_at && status.ends_at);

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
          <div className="order-2 flex flex-col md:order-1">
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
                {/* تا وقتی API پاسخ نداده تاریخ نامعلوم است؛ «— تا —» نمی‌نویسیم. */}
                {status.starts_at_jalali && status.ends_at_jalali ? (
                  <>
                    {faJalali(status.starts_at_jalali)} تا {faJalali(status.ends_at_jalali)}
                  </>
                ) : (
                  <span className="text-text-subtle/80">بازهٔ زمانی در حال دریافت…</span>
                )}
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
            {/* ⚠️ شمارش معکوس در موبایل پیش از دکمه‌ها می‌آمد و دکمهٔ اصلی
                (ثبت‌نام) را زیر خط دید می‌انداخت: کاربر صفحه را باز می‌کرد و
                هیچ کاری برای انجام‌دادن نمی‌دید. اکنون دکمه‌ها اول می‌آیند و
                تایمر بعد از آن‌ها؛ در دسکتاپ `md:order-none` ترتیب اصلی را
                برمی‌گرداند. */}
            {/* شمارش معکوس فقط وقتی معنا دارد که تاریخ واقعی از سرور آمده
                باشد. پیش از آن، «۰۰:۰۰» نمایش دادن یعنی گفتن عددی که
                نمی‌دانیم — همان چیزی که اصل «هیچ عدد ساختگی» منع می‌کند. */}
            <div className="order-2 mt-6 max-w-[340px] md:order-none">
              <p className="text-text-subtle mb-2 text-[11px] font-bold">
                {state === "upcoming" ? "تا آغاز مهلت آزمون" : "تا پایان مهلت آزمون"}
              </p>
              {hasSchedule ? (
                <Countdown
                  targetSeconds={Math.max(0, secondsLeft)}
                  label="زمان باقی‌مانده"
                  variant="light"
                />
              ) : (
                <div className="border-border/70 bg-surface/60 text-text-subtle grid h-[68px] place-items-center rounded-lg border text-[12px]">
                  در حال دریافت زمان‌بندی از سرور…
                </div>
              )}
            </div>

            <div className="order-1 mt-7 flex flex-wrap items-center gap-2.5 md:order-none">
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

          {/* ── تصویر رسمی رویداد ──
              ⚠️ اندازه در موبایل عمداً کوچک است. در نسخهٔ اول تصویر تمام
              عرض و تمام قدِ صفحهٔ اول را می‌گرفت و عنوان و دکمه‌ها زیر خط
              دید می‌افتادند؛ کاربر باید اسکرول می‌کرد تا بفهمد صفحه چیست.
              حالا در موبایل تصویر یک «تمبر» عمودی است که هویت می‌دهد، و
              پیام و دکمه هم در همان صفحهٔ اول دیده می‌شوند. */}
          <div className="order-1 mx-auto w-[168px] shrink-0 sm:w-[210px] md:order-2 md:w-[318px] lg:w-[356px]">
            <figure className="relative">
              {/* هالهٔ نرم طلایی پشت تصویر — نه قاب دوتایی */}
              <div
                aria-hidden="true"
                className="bg-gold/12 absolute -inset-4 rounded-[28px] blur-2xl"
              />
              <div className="ring-gold/35 relative overflow-hidden rounded-2xl shadow-[0_18px_50px_-20px_oklch(35%_0.06_60/0.35)] ring-1">
                <Image
                  src="/img/kaveh-hero.jpg"
                  alt="تصویر شهید محمود کاوه، فرمانده لشکر ویژهٔ ۱۵۵ شهدا، در قاب تزئینی با پرچم ایران"
                  width={900}
                  height={1286}
                  priority
                  sizes="(max-width: 767px) 80vw, 356px"
                  className="h-auto w-full"
                />
                {/* ── زیرنویس تصویر: زیر آن در موبایل، روی آن در دسکتاپ ──
                    روی تصویر ۱۶۸ پیکسلی موبایل، این متن در دو خط می‌شکست
                    و چهره را می‌پوشاند. اکنون در موبایل زیر تصویر و
                    کوچک‌تر می‌آید و از `md` به بالا همان نوار شیشه‌ای
                    پایین قاب می‌شود. */}
                <figcaption className="md:from-stage md:via-stage/80 mt-2 text-center md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:bg-gradient-to-t md:to-transparent md:px-4 md:pt-14 md:pb-3.5 md:text-right md:backdrop-blur-[1px]">
                  <p className="text-text md:text-on-stage text-[12px] font-extrabold md:text-[12.5px]">
                    شهید محمود کاوه
                  </p>
                  <p className="text-text-muted md:text-on-stage-muted text-[10px] leading-5 md:text-[10.5px]">
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
