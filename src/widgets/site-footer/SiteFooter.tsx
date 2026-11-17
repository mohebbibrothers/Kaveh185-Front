import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";

/**
 * فوتر — سه لایهٔ معنادار، نه یک ردیف لینک.
 *
 * ── چه چیزی این فوتر را از نسخهٔ قبل جدا می‌کند؟ ──────────────────────────
 * ۱) **لایهٔ «فراخوان»**: فوتر فقط جایی برای «حقوق محفوظ» نیست؛ آخرین
 *    نقطه‌ای است که کاربر ممکن است تصمیم بگیرد. پس یک فراخوان روشن دارد.
 * ۲) **ستون کانال رسمی، صادقانه**: حوزه فقط یک کانال دارد — بله،
 *    `@NamjooNewsAgency`. نسخهٔ قبل سه دکمهٔ ایتا/بله/روبیکا داشت که دو
 *    تای آن‌ها وجود نداشت. لینک مرده بدتر از نبودِ لینک است.
 * ۳) **ستون «دربارهٔ کتاب»**: نام کتاب مسابقه یکی از پرجست‌وجوترین
 *    پرسش‌های کاربر است؛ باید در فوتر هم باشد، نه فقط در هدر صفحه.
 * ۴) **نوار پایانی با شناسهٔ برگزارکننده و نسخهٔ محتوا** — بدون عدد ساختگی.
 */
export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  return (
    <footer className="border-border bg-surface-2/70 mt-20 border-t">
      {/* ── یادآوریِ پایانی ──
          ⚠️ این‌جا قبلاً یک فراخوان کامل با دو دکمه بود («ثبت‌نام و شرکت» +
          «قوانین مسابقه»). چون صفحهٔ اول پیش از فوتر یک بنرِ اقدام دارد،
          آن دکمه‌ها **چهارمین تکرار** فراخوان در یک صفحه می‌شدند. اکنون
          فقط یک جملهٔ گرم و یک لینکِ متنی می‌ماند؛ فوتر وظیفهٔ «حتماً کلیک
          کن» ندارد، وظیفهٔ «اگر گم شدی، راه این‌جاست» دارد. */}
      <div className="border-border/70 border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-text-muted flex items-start gap-2.5 text-[12.5px] leading-7">
            <span className="text-gold-strong mt-1 shrink-0" aria-hidden="true">
              <Girih size={16} />
            </span>
            <span>
              مسابقه رایگان است و ثبت‌نامش فقط نام، کد ملی، شمارهٔ تماس و انتخاب مسجد می‌خواهد.
            </span>
          </p>
          <Link
            href="/register"
            className="text-brand shrink-0 text-[12.5px] font-extrabold underline decoration-current/30 decoration-1 underline-offset-4 transition-colors hover:decoration-current"
          >
            رفتن به فرم ثبت‌نام
          </Link>
        </div>
      </div>

      {/* ── ستون‌ها ── */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={38} variant="emblem" />
            <span className="flex flex-col leading-tight">
              <span className="text-[14.5px] font-extrabold">{SITE.name}</span>
              <span className="text-text-subtle text-[10.5px]">{SITE.event.title}</span>
            </span>
          </div>
          <p className="text-text-muted mt-3 max-w-sm text-[12.5px] leading-7">
            مسابقهٔ کتاب‌خوانی {SITE.bookTitle} به مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج ۱۸۵
            شهید کاوه.
          </p>
        </div>

        <nav aria-label="دسترسی سریع">
          <h2 className="text-text-subtle mb-3 text-[12px] font-extrabold tracking-wide">
            دسترسی سریع
          </h2>
          <ul className="space-y-1.5 text-[12.5px]">
            {(
              [
                { href: "/register", label: "ثبت‌نام در مسابقه" },
                { href: "/book", label: "مطالعهٔ کتاب" },
                { href: "/rules", label: "قوانین و شرایط" },
                { href: "/receipt", label: "استعلام کارنامه" },
                { href: "/mosques", label: "فهرست مساجد" },
              ] as const
            ).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-text-muted hover:text-text -my-0.5 inline-flex min-h-[32px] items-center transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-text-subtle mb-3 text-[12px] font-extrabold tracking-wide">
            دربارهٔ مسابقه
          </h2>
          <ul className="text-text-muted space-y-1.5 text-[12.5px]">
            <li>
              کتاب: <span className="text-text font-bold">{SITE.bookTitle}</span>
            </li>
            <li className="leading-6">
              ۳۰ داستان کوتاه؛ پرسش‌ها از همین داستان‌ها انتخاب می‌شوند.
            </li>
            <li className="leading-6">شرکت رایگان و یک‌بار برای هر کد ملی.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-text-subtle mb-3 text-[12px] font-extrabold tracking-wide">
            کانال رسمی
          </h2>
          <a
            href={SITE.channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border-strong bg-surface hover:border-brand/40 hover:bg-canvas flex items-center gap-2.5 rounded-xl border p-3 transition-colors"
          >
            <span className="bg-verde/12 text-verde grid size-9 shrink-0 place-items-center rounded-lg">
              {/* نشان بله — ساده و بدون وابستگی به CDN */}
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="currentColor"
              >
                <path
                  d="M4.6 3.4h14.8A1.6 1.6 0 0 1 21 5v9.6a1.6 1.6 0 0 1-1.6 1.6h-1.1v3.2a.5.5 0 0 1-.83.37L14.1 16.2H4.6A1.6 1.6 0 0 1 3 14.6V5a1.6 1.6 0 0 1 1.6-1.6Z"
                  opacity=".22"
                />
                <path
                  d="M8.1 8.3v3.4M8.1 8.3c1.6-.6 3 .1 3 1.7s-1.4 2.3-3 1.7M13.2 8.3v3.4M13.2 11.7c0-2.3 2.9-2.3 2.9 0"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="text-text block truncate text-[12.5px] font-extrabold">
                خبرگزاری میدان نامجو
              </span>
              <span className="text-text-subtle block truncate text-[11px]" dir="ltr">
                {SITE.channel.handle}
              </span>
            </span>
          </a>
          <p className="text-text-subtle mt-2 text-[11px] leading-5">
            اطلاع‌رسانی رسمی مسابقه فقط در این کانال است.
          </p>
        </div>
      </div>

      {/* ── نوار پایانی ── */}
      <div className="border-border/70 border-t">
        <div className="text-text-subtle mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1.5 px-4 py-4 text-center text-[11px] sm:flex-row sm:px-6 sm:text-right">
          <p>
            © {year} — {SITE.organizer}
          </p>
          <p className="flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-verde inline-block size-1.5 rounded-full" />
            سامانهٔ رسمی برگزاری مسابقهٔ کتاب‌خوانی
          </p>
        </div>
      </div>
    </footer>
  );
}
