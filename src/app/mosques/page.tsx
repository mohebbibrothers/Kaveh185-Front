import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { MosquesDirectory } from "@/widgets/mosques/MosquesDirectory";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "مساجد حوزه",
  description: `فهرست مساجد حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه و جدول مشارکت هر مسجد در مسابقهٔ ${SITE.bookTitle}.`,
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
          <p className="text-verde text-[11.5px] font-extrabold tracking-wide">پهنهٔ رقابت</p>
          <h1 className="text-text mt-1.5 text-[clamp(22px,3.4vw,30px)] font-extrabold">
            مساجد حوزه
          </h1>
          <p className="text-text-muted mt-2.5 max-w-[64ch] text-[13px] leading-[2]">
            جدولِ زندهٔ رقابتِ مساجد: رتبهٔ هر مسجد بر اساسِ تعداد شرکت‌کنندهٔ کامل، و در تساوی بر اساسِ
            ترتیب الفبای نامِ مسجد. هنگام ثبت‌نام، مسجد محلهٔ خود را انتخاب می‌کنید و نتیجهٔ آزمون به
            نامِ همان مسجد ثبت می‌شود.
          </p>
        </header>

        <MosquesDirectory />
      </main>
      <SiteFooter />
    </>
  );
}
