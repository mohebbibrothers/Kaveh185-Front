import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { SITE } from "@/shared/config/site";

/**
 * فوتر — بازطراحی‌شده با الهام از سایت‌های «هم‌سهم» و «بعثت» که کاربر
 * نمونه داد. پنج تصمیمِ عمدی این‌جا هست:
 *
 * ۱) **پس‌زمینهٔ تیرهٔ مرحله‌ای، نه یک نوارِ خاکستری.** فوتر روی
 *    `--c-stage` می‌نشیند (همان سرمهٔ هیرو) تا صفحه با یک «قوسِ بصری»
 *    تمام شود: روشن → روشن → تاریک. بافتِ گره‌چینیِ محو هم دارد تا سطح
 *    تخت نباشد.
 * ۲) **ستون نشان، پُر و روایی.** نشان بزرگ، نام، فهرست رویداد و یک خطِ
 *    انسانی — نه فقط «حقوق محفوظ».
 * ۳) **کانال رسمی، کارتِ تعاملی.** آیکون بله در یک دایرهٔ سبز که روی
 *    هاور **نفس می‌کشد** (پالسِ نرم + چرخشِ ریز) و فلش به بیرون حرکت
 *    می‌کند. دلیل: این تنها کانال رسمی است و باید «زنده» به نظر برسد.
 * ۴) **حرکت در فوتر.** ستون‌ها با تأخیرِ پله‌ای بالا می‌آیند
 *    (`.k185-reveal`)، لینک‌ها زیرشان خط می‌کشند و فلشِ «بازگشت به بالا»
 *    روی هاور بالا می‌رود. همه با `prefers-reduced-motion` خاموش.
 * ۵) **بدونِ نوارِ فراخوان.** نسخهٔ قبل یک نوارِ «مسابقه رایگان است…» با
 *    دکمهٔ ثبت‌نام داشت که چهارمین فراخوانِ صفحه بود؛ حذف شد.
 *
 * ── چرا لینک‌ها این‌جا هستند و در صفحهٔ اول نه؟ ─────────────────────────
 * فوتر جای «نقشه» است، نه جای «محتوا». هر لینک این‌جا یک مقصد است، نه
 * تکرارِ بلوکی از صفحهٔ اول.
 */

const QUICK_LINKS = [
  { href: "/", label: "صفحهٔ اول" },
  { href: "/book", label: "کتاب مسابقه" },
  { href: "/rules", label: "قوانین و شرایط" },
  { href: "/mosques", label: "رتبه‌بندی مساجد" },
  { href: "/receipt", label: "استعلام کارنامه" },
  { href: "/register", label: "ثبت‌نام در مسابقه" },
] as const;

/** نشان بله — SVG درون‌خطی، بی‌وابستگی به CDN (قاعدهٔ پیش‌نمایش آفلاین). */
function BaleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none">
      <path
        d="M4.6 3.4h14.8A1.6 1.6 0 0 1 21 5v9.6a1.6 1.6 0 0 1-1.6 1.6h-1.1v3.2a.5.5 0 0 1-.83.37L14.1 16.2H4.6A1.6 1.6 0 0 1 3 14.6V5a1.6 1.6 0 0 1 1.6-1.6Z"
        fill="currentColor"
        opacity=".2"
      />
      <path
        d="M8.1 8.3v3.4M8.1 8.3c1.6-.6 3 .1 3 1.7s-1.4 2.3-3 1.7M13.2 8.3v3.4M13.2 11.7c0-2.3 2.9-2.3 2.9 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      aria-hidden="true"
    >
      <path d="M12 19V6M6 12l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  return (
    <footer className="bg-stage text-on-stage relative mt-16 overflow-hidden">
      {/* بافتِ گره + هالهٔ طلاییِ گوشهٔ بالا-چپ */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.06]"
      />
      <div
        aria-hidden="true"
        className="bg-gold/10 pointer-events-none absolute -top-24 -left-24 size-64 rounded-full blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-11 pb-6 sm:px-6 sm:pt-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1.15fr] lg:gap-8">
          {/* ── نشان و روایت ── */}
          <div>
            <Link href="/" className="group inline-flex items-center gap-3" aria-label={SITE.name}>
              <span className="ring-gold/25 bg-on-stage/5 grid size-12 place-items-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-[1.04]">
                <Logo size={40} variant="emblem" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-on-stage text-[16px] font-extrabold">{SITE.name}</span>
                <span className="text-on-stage-muted text-[10.5px]">{SITE.event.title}</span>
              </span>
            </Link>
            <p className="text-on-stage-muted mt-3.5 max-w-[34ch] text-[12.5px] leading-[2]">
              مسابقهٔ کتاب‌خوانی «{SITE.bookTitle}» به مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج
              ۱۸۵ شهید کاوه.
            </p>
            <p className="text-on-stage-muted/80 mt-2 flex items-center gap-1.5 text-[11px] leading-6">
              <span aria-hidden="true" className="bg-verde inline-block size-1.5 rounded-full" />
              شرکت رایگان است؛ یک‌بار برای هر کد ملی.
            </p>
          </div>

          {/* ── نقشهٔ سایت ── */}
          <nav aria-label="دسترسی سریع">
            <h2 className="text-gold mb-3 text-[11.5px] font-extrabold tracking-wide">
              دسترسی سریع
            </h2>
            <ul className="space-y-0.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group text-on-stage-muted hover:text-on-stage inline-flex min-h-[30px] items-center gap-1.5 text-[12.5px] transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold/60 h-px w-0 transition-all duration-300 group-hover:w-3"
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── دربارهٔ کتاب ── */}
          <div>
            <h2 className="text-gold mb-3 text-[11.5px] font-extrabold tracking-wide">
              دربارهٔ کتاب
            </h2>
            <ul className="text-on-stage-muted space-y-2 text-[12.5px] leading-6">
              <li>
                کتاب: <span className="text-on-stage font-bold">{SITE.bookTitle}</span>
              </li>
              <li>۳۰ داستان کوتاه؛ پرسش‌ها از همین داستان‌ها انتخاب می‌شوند.</li>
              <li>مطالعهٔ آنلاین، بدون نصب و بدون دانلود.</li>
            </ul>
          </div>

          {/* ── کانال رسمی ── */}
          <div>
            <h2 className="text-gold mb-3 text-[11.5px] font-extrabold tracking-wide">
              کانال رسمی
            </h2>
            <a
              href={SITE.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-on-stage/15 bg-on-stage/[0.06] hover:border-verde/45 hover:bg-on-stage/[0.1] flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 hover:shadow-[0_14px_34px_-20px_oklch(70%_0.16_160/0.7)]"
            >
              {/* دایرهٔ سبز با پالسِ ملایم روی هاور — «زنده» بودن کانال */}
              <span className="relative grid size-10 shrink-0 place-items-center">
                <span
                  aria-hidden="true"
                  className="bg-verde/25 absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:animate-[k185-pulse_1.8s_ease-out_infinite] group-hover:opacity-100"
                />
                <span className="bg-verde/15 text-verde ring-verde/25 relative grid size-10 place-items-center rounded-full ring-1 transition-transform duration-300 group-hover:scale-[1.06]">
                  <BaleIcon />
                </span>
              </span>
              <span className="min-w-0">
                <span className="text-on-stage block truncate text-[12.5px] font-extrabold">
                  {SITE.channel.name}
                </span>
                <span className="text-on-stage-muted block truncate text-[11px]" dir="ltr">
                  {SITE.channel.handle}
                </span>
              </span>
              {/* فلشِ خروج — روی هاور به بیرون می‌رود */}
              <span className="text-verde mr-auto shrink-0 transition-transform duration-300 group-hover:translate-x-[-2px] group-hover:-translate-y-0.5">
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  aria-hidden="true"
                >
                  <path
                    d="M17 7H8m9 0v9m0-9-8.5 8.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
            <p className="text-on-stage-muted/80 mt-2 text-[10.5px] leading-5">
              اطلاع‌رسانی رسمی مسابقه فقط در این کانال است.
            </p>
          </div>
        </div>

        {/* ── نوار پایانی ── */}
        <div className="border-on-stage/15 mt-9 flex flex-col-reverse items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <p className="text-on-stage-muted/75 text-center text-[10.5px] sm:text-right">
            © {year} — {SITE.organizer} · سامانهٔ رسمی برگزاری مسابقهٔ کتاب‌خوانی
          </p>
          <a
            href="#main"
            className="group border-on-stage/20 text-on-stage-muted hover:text-on-stage hover:border-gold/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <ArrowUp />
            </span>
            بازگشت به بالا
          </a>
        </div>
      </div>
    </footer>
  );
}
