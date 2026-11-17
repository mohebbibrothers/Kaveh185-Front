import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { SITE } from "@/shared/config/site";
import { BackToTop } from "./BackToTop";
import { ChannelCard } from "./ChannelCard";

/**
 * فوتر — «شبِ آرامِ» پایانِ صفحه.
 *
 * ── ایرادِ نسخهٔ قبل (نکتهٔ ۱۱ کاربر) ────────────────────────────────────
 * «اصلاً قشنگ طراحی نکردی و حتی پویانمایی قوی و حرفه‌ای براش انجام ندادی.»
 * ایراد درست بود: یک `div` با `border-t` و چهار ستون متن، بدون عمق، بدون
 * حرکت، و کارتِ کانال یک مستطیلِ تخت بود. کاربر دو مرجع داد: سایت «هم‌سهم»
 * (پویانمایی) و فوتر بعثت (عمق و ترکیب).
 *
 * ── زبانِ طراحیِ تازه ────────────────────────────────────────────────────
 *
 * ۱) **سرمایه‌ایِ لاجوردی (`bg-stage`)** — فوتر از بدنهٔ روشنِ صفحه جدا
 *    می‌شود و صفحه «بسته» به نظر می‌رسد، نه «قطع‌شده».
 * ۲) **لایه‌های عمق**: دو هالهٔ رنگِ نرم (طلایی و لاجوردی)، بافتِ گره‌چینیِ
 *    محو، و یک خطِ طلاییِ گرادیانی در لبهٔ بالا. هیچ تصویری در باندل نیست.
 * ۳) **پویانماییِ واقعی، نه تزئینی**:
 *    • ستون‌ها با تأخیرِ پله‌ای (`60ms`) بالا می‌آیند (`k185-rise`).
 *    • هر لینک در هاور: خطِ زیرینِ طلایی از راست رشد می‌کند و فلش کوچک
 *      جابه‌جا می‌شود — بازخوردِ فوری، بدون تغییرِ چیدمان.
 *    • نشانِ سایت در هاور یک چرخشِ ۶درجه می‌گیرد (کشفِ کوچک).
 *    • کارتِ کانال: حلقهٔ پالس، درخششِ لغزنده، و آیکونِ بله که در هاور
 *      «تکان می‌خورد» — دقیقاً همان چیزی که خواسته شد.
 * ۴) **سه ستون با وزنِ متفاوت** (`1.4fr 1fr 1.25fr`) — نه چهار ستونِ
 *    مساوی که همه‌چیز را هم‌وزن و بی‌سلسله‌مراتب می‌کند.
 * ۵) **«بازگشت به بالا»** با دکمهٔ واقعی و اسکرول‌محور (اسکرول‌بار پنهان
 *    است؛ بدون این، کاربر راهِ سریعِ برگشت ندارد).
 *
 * ⚠️ فقط یک کانال رسمی وجود دارد. لینکِ مرده بدتر از نبودِ لینک است.
 */
export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  const quick = [
    { href: "/register", label: "ثبت‌نام در مسابقه" },
    { href: "/book", label: "مطالعهٔ کتاب" },
    { href: "/rules", label: "قوانین و شرایط" },
    { href: "/receipt", label: "استعلام کارنامه" },
    { href: "/mosques", label: "رتبه‌بندی مساجد" },
  ] as const;

  return (
    <footer className="bg-stage text-on-stage relative mt-16 overflow-hidden">
      {/* ── لبهٔ بالایی: خطِ طلاییِ گرادیانی، نه قوسِ بریده ── */}
      <div
        aria-hidden="true"
        className="via-gold/55 absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent to-transparent"
      />

      {/* ── لایه‌های عمق ── */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.055]"
      />
      <div
        aria-hidden="true"
        className="bg-gold/[0.07] pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-accent/[0.05] pointer-events-none absolute -bottom-28 left-1/4 size-80 rounded-full blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-2 sm:px-6 sm:pt-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.25fr] lg:gap-12">
          {/* ── ستون ۱: هویت ── */}
          <div className="k185-footer-col" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center gap-3">
              <span className="k185-footer-badge transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-rotate-6">
                <Logo size={48} variant="emblem" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-extrabold">{SITE.name}</span>
                <span className="text-on-stage-muted text-[10.5px]">{SITE.event.title}</span>
              </span>
            </div>

            <p className="text-on-stage-muted mt-4 max-w-sm text-[12.5px] leading-[2]">
              مسابقهٔ کتاب‌خوانی {SITE.bookTitle} به مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج
              ۱۸۵ شهید کاوه.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px]">
              <span className="border-on-stage/12 text-on-stage-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold">
                <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
                شرکت رایگان
              </span>
              <span className="border-on-stage/12 text-on-stage-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold">
                <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
                یک‌بار برای هر کد ملی
              </span>
            </div>
          </div>

          {/* ── ستون ۲: دسترسی سریع ── */}
          <nav
            aria-label="دسترسی سریع"
            className="k185-footer-col"
            style={{ animationDelay: "70ms" }}
          >
            <h2 className="text-on-stage mb-3.5 flex items-center gap-2 text-[12px] font-extrabold tracking-wide">
              <span aria-hidden="true" className="bg-gold/70 h-3 w-[2px] rounded-full" />
              دسترسی سریع
            </h2>
            <ul className="space-y-0.5">
              {quick.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="k185-footer-link text-on-stage-muted group hover:text-on-stage inline-flex min-h-[34px] items-center gap-1.5 text-[12.5px] transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="11"
                      height="11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      aria-hidden="true"
                      className="-me-1 opacity-0 transition-all duration-300 group-hover:me-0 group-hover:opacity-100"
                    >
                      <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="k185-footer-link-text relative">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── ستون ۳: کانال رسمی ── */}
          <div className="k185-footer-col" style={{ animationDelay: "140ms" }}>
            <h2 className="text-on-stage mb-3.5 flex items-center gap-2 text-[12px] font-extrabold tracking-wide">
              <span aria-hidden="true" className="bg-gold/70 h-3 w-[2px] rounded-full" />
              کانال رسمی
            </h2>
            <ChannelCard />
            <p className="text-on-stage-muted/85 mt-2.5 text-[10.5px] leading-5">
              اطلاع‌رسانی رسمی مسابقه فقط در این کانال است.
            </p>
          </div>
        </div>

        {/* ── نوار پایانی ── */}
        <div className="border-on-stage/10 mt-8 flex flex-col items-center justify-between gap-3 border-t py-4 sm:flex-row">
          <p className="text-on-stage-muted/80 order-2 text-center text-[10.5px] sm:order-1 sm:text-right">
            © {year} — {SITE.organizer}
          </p>

          <div className="order-1 flex items-center gap-3 sm:order-2">
            <span className="text-on-stage-muted/70 hidden items-center gap-1.5 text-[10.5px] font-semibold sm:flex">
              <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
              سامانهٔ رسمی برگزاری
            </span>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
