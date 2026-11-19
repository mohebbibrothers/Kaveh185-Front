import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { MosquesDirectory } from "@/widgets/mosques/MosquesDirectory";
import { SITE } from "@/shared/config/site";
import { LEADS } from "@/shared/config/leads";

export const metadata: Metadata = {
  title: "جدول رتبه‌بندی مساجد",
  description: `جدول زندهٔ رتبه‌بندی مساجد حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه در مسابقهٔ ${SITE.bookTitle} — کدام مسجد پیشتاز است؟`,
  alternates: { canonical: "/mosques" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <nav
          aria-label="مسیر"
          className="text-text-subtle mb-5 flex items-center gap-1.5 text-[11.5px]"
        >
          <Link
            href="/"
            className="hover:text-text -my-2 inline-flex min-h-[32px] items-center px-1 transition-colors"
          >
            خانه
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-muted">مساجد</span>
        </nav>

        {/* ═══ هدر ══════════════════════════════════════════════════════════
            نسخهٔ وسط‌چین بدتر شد (کاربر گفت): تیتر و متن رویِ محورِ مرکزی
            می‌نشستند و بلوکِ متن از تیتر جدا می‌افتاد. به ترازِ راست و
            چیدمانِ کلاسیک برگشت — همان که با بقیهٔ صفحه‌های سایت یکی است —
            ولی دو ایرادِ واقعیِ نسخهٔ قبلی هم اصلاح شد:
              ۱) متن دیگر در ستونِ باریکِ راست جمع نمی‌شود؛ تا `72ch` باز
                 می‌شود (در دسکتاپ دو خطِ متعادل، نه یک ستونِ بلند).
              ۲) فاصلهٔ تیتر/متن و خطِ جداکننده یک پله بازتر شد و `text-pretty`
                 از پرشِ تک‌کلمه در خطِ آخر جلوگیری می‌کند. */}
        <header className="border-border border-b pb-6">
          <p className="text-verde flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide">
            <span aria-hidden="true" className="bg-verde inline-block h-[2px] w-4 rounded-full" />
            پهنهٔ رقابت
          </p>
          <h1 className="text-text mt-2 text-[clamp(23px,3.4vw,31px)] font-extrabold">
            جدول رتبه‌بندی مساجد
          </h1>
          <p className="text-text-muted mt-3 max-w-[72ch] text-[13px] leading-[2.05] text-pretty">
            {LEADS.mosques.lead}
          </p>
        </header>

        <MosquesDirectory />
      </main>
      <SiteFooter />
    </>
  );
}
