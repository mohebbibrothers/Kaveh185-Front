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

        <header className="border-border border-b pb-5">
          <p className="text-verde flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide">
            <span aria-hidden="true" className="bg-verde inline-block h-[2px] w-4 rounded-full" />
            پهنهٔ رقابت
          </p>
          <h1 className="text-text mt-1.5 text-[clamp(22px,3.4vw,30px)] font-extrabold">
            جدول رتبه‌بندی مساجد
          </h1>
          {/* متنِ معرفی: کوتاه، رقابتی و کاربرپسند — بدونِ توضیحِ فنیِ ساختار
              جدول یا فرمولِ محاسبه. عرضِ کاملِ ستون و ترازِ راست حفظ می‌شود
              (`max-w`ِ ثابت حذف شد تا در دسکتاپ وسطِ صفحه جمع نشود). */}
          <p className="text-text-muted mt-2.5 max-w-[68ch] text-[13px] leading-[2.05] text-pretty">
            {LEADS.mosques.lead}
          </p>
        </header>

        <MosquesDirectory />
      </main>
      <SiteFooter />
    </>
  );
}
