import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { Girih } from "@/shared/ui/Ornament";
import { BackToTop } from "@/shared/ui/BackToTop";
import { SITE } from "@/shared/config/site";

/**
 * فوتر — «پایانِ آرامِ صفحه»، نه یک ردیف لینک.
 *
 * ── چرا کامل بازنویسی شد؟ ────────────────────────────────────────────────
 * نسخهٔ قبل یک بلوکِ روشن با چهار ستونِ متنی بود: از هیرو جدا نمی‌شد،
 * سلسله‌مراتب نداشت، هیچ حرکتی در آن نبود و در موبایل به یک ستونِ بلندِ
 * خاکستری تبدیل می‌شد. کاربر گفت «فوتر را اصلاً قشنگ طراحی نکردی» — و
 * حق داشت؛ فوتر آخرین چیزی است که آدم می‌بیند و باید حسِ «تمام‌شدن»
 * بدهد، نه حسِ «فهرست ضمیمه».
 *
 * ── طرحِ تازه، پنج تصمیم ────────────────────────────────────────────────
 * ۱) **سرمه‌ایِ عمیق، هم‌خانوادهٔ هیرو.** صفحه با کاشیِ روشن شروع می‌شود و
 *    با شبِ سرمه‌ای تمام می‌شود؛ همان قوسی که نام «کاوه ۱۸۵» از آن آمده.
 *    فوترِ روشن، صفحه را «باز» می‌گذاشت.
 * ۲) **محرابِ بالای فوتر.** همان `MuqarnasArch` هیرو، این‌بار برعکس — یک
 *    نقلِ بصری که دو سرِ صفحه را به هم می‌دوزد.
 * ۳) **پویانماییِ هدفمند، نه تزئینی:**
 *    • هر لینک با هاور، یک خطِ طلایی از راست می‌گیرد و ۲px جابه‌جا می‌شود.
 *    • کارتِ کانال، یک حلقهٔ پالسِ آرام دارد (`.k185-pulse`) — نشانهٔ
 *      «زنده»، بی‌آنکه چشمک بزند.
 *    • ستون‌ها با `k185-reveal` یک‌بار ظاهر می‌شوند.
 *    • همه با `prefers-reduced-motion` خاموش.
 * ۴) **بازگشت به بالا** با دکمهٔ واقعی (نه لینکِ `#`) — چون اسکرول‌بار
 *    مرورگر پنهان است و کاربر باید راهِ برگشت داشته باشد.
 * ۵) **صداقت.** یک کانال (بله)، بدون شمارندهٔ ساختگی، بدون لینکِ مرده.
 */
const QUICK_LINKS = [
  { href: "/register", label: "ثبت‌نام در مسابقه" },
  { href: "/book", label: "مطالعهٔ کتاب" },
  { href: "/rules", label: "قوانین و شرایط" },
  { href: "/receipt", label: "استعلام کارنامه" },
  { href: "/mosques", label: "رتبه‌بندی مساجد" },
] as const;

export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  /** لینکِ ستونِ دسترسی — خطِ طلاییِ هاور + جابه‌جاییِ ۲px */
  const quickLink = (href: (typeof QUICK_LINKS)[number]["href"], label: string) => (
    <li key={href}>
      <Link
        href={href}
        className="group text-on-stage-muted hover:text-on-stage relative inline-flex min-h-[34px] items-center gap-2 text-[12.5px] transition-[color,transform] duration-200 hover:translate-x-[-3px]"
      >
        <span
          aria-hidden="true"
          className="bg-gold h-px w-0 transition-[width] duration-300 group-hover:w-3.5"
        />
        {label}
      </Link>
    </li>
  );

  return (
    <footer className="bg-stage text-on-stage relative mt-16 overflow-hidden">
      {/*
        ⚠️ نسخهٔ اول این‌جا `MuqarnasArch` را برعکس گذاشته بود. در هیرو آن
        کمان روی زمینهٔ روشن و با شفافیتِ ۱۲٪ دیده می‌شود؛ روی سرمه‌ای
        به‌صورت یک «خطِ سفیدِ تنها» در آمد که شبیه خطای رندر بود. جایش یک
        خطِ طلاییِ محو نشست: نشانهٔ «پایان»، بدون شکلِ مستقل.
      */}
      <div
        aria-hidden="true"
        className="via-gold/40 absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent to-transparent"
      />

      {/* بافتِ هندسیِ محو + دو هالهٔ رنگی. سه درصد شفافیت: دیده نمی‌شود، حس می‌شود. */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.06]"
      />
      <div
        aria-hidden="true"
        className="bg-gold/12 pointer-events-none absolute -top-24 right-1/4 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-brand/25 pointer-events-none absolute -bottom-32 left-0 size-80 rounded-full blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-16">
        {/* ── ردیفِ نشان و شعار ── */}
        <div className="flex flex-col items-start gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="ring-gold/30 relative grid size-12 place-items-center rounded-2xl bg-white/[0.06] ring-1">
              <Logo size={34} variant="emblem" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-on-stage text-[17px] font-extrabold tracking-tight">
                {SITE.name}
              </span>
              <span className="text-on-stage-muted text-[11px] font-medium">
                {SITE.event.title} · {SITE.organizer}
              </span>
            </span>
          </div>

          <p className="text-on-stage-muted max-w-md text-[12px] leading-7 sm:text-left">
            مسابقهٔ کتاب‌خوانی <span className="text-gold font-bold">{SITE.bookTitle}</span> به
            مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه.
          </p>
        </div>

        {/* ── سه ستون ── */}
        <div className="grid gap-9 pt-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.25fr]">
          <nav aria-labelledby="foot-quick">
            <h2
              id="foot-quick"
              className="text-gold mb-3.5 flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide"
            >
              <Girih size={9} />
              دسترسی سریع
            </h2>
            <ul className="space-y-0.5">{QUICK_LINKS.map((l) => quickLink(l.href, l.label))}</ul>
          </nav>

          <div>
            <h2 className="text-gold mb-3.5 flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide">
              <Girih size={9} />
              دربارهٔ مسابقه
            </h2>
            <ul className="text-on-stage-muted space-y-2 text-[12.5px] leading-7">
              <li>
                کتاب: <span className="text-on-stage font-bold">{SITE.bookTitle}</span>
              </li>
              <li>۳۰ داستان کوتاه؛ پرسش‌ها از همین داستان‌ها انتخاب می‌شوند.</li>
              <li>شرکت رایگان و یک‌بار برای هر کد ملی.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-gold mb-3.5 flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide">
              <Girih size={9} />
              کانال رسمی
            </h2>
            <a
              href={SITE.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:border-gold/45 relative flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08]"
            >
              {/*
                نشانِ بله + حلقهٔ پالس.
                ⚠️ پالس روی خودِ آیکون نبود: `::after` گوشهٔ گردِ والد را
                ارث نمی‌برد و به‌شکل یک «مربعِ سبزِ محو» دیده می‌شد. اکنون
                یک حلقهٔ مستقلِ `rounded-full` پشت آیکون است.
              */}
              <span className="relative grid size-10 shrink-0 place-items-center">
                <span
                  aria-hidden="true"
                  className="k185-pulse text-verde/40 absolute inset-0 rounded-full"
                />
                <span className="text-verde bg-verde/15 relative grid size-10 place-items-center rounded-xl">
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M4.8 4.4h14.4a1.5 1.5 0 0 1 1.5 1.5v9.3a1.5 1.5 0 0 1-1.5 1.5h-1.4v3.4l-3.9-3.4H4.8a1.5 1.5 0 0 1-1.5-1.5V5.9a1.5 1.5 0 0 1 1.5-1.5Z" />
                    <path d="M8.4 8.6v3.6M8.4 8.6c1.7-.7 3.2.2 3.2 1.8s-1.5 2.4-3.2 1.7M13.7 8.6v3.6M13.7 12.2c0-2.4 3.1-2.4 3.1 0" />
                  </svg>
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-on-stage block truncate text-[12.5px] font-extrabold">
                  {SITE.channel.name}
                </span>
                <span className="text-on-stage-muted block truncate text-[11px]" dir="ltr">
                  {SITE.channel.handle}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                aria-hidden="true"
                className="text-gold/70 shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
              >
                <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="text-on-stage-muted/80 mt-2.5 text-[11px] leading-5">
              اطلاع‌رسانی رسمی مسابقه فقط در این کانال است.
            </p>
          </div>
        </div>

        {/* ── نوار پایانی ── */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row">
          <p className="text-on-stage-muted/85 text-center text-[11px] leading-6 sm:text-right">
            © {year} — {SITE.organizer}
            <span className="mx-2 text-white/25" aria-hidden="true">
              ·
            </span>
            سامانهٔ رسمی برگزاری مسابقهٔ کتاب‌خوانی
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
