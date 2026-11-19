import type { Metadata } from "next";
import { LEADS } from "@/shared/config/leads";
import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { ReceiptView } from "@/widgets/receipt/ReceiptView";

export const metadata: Metadata = {
  title: "کارنامه و استعلام",
  description: "مشاهده و استعلام کارنامهٔ مسابقهٔ کتاب‌خوانی کاوه ۱۸۵ با کد رهگیری.",
  alternates: { canonical: "/receipt" },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
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
          <span className="text-text-muted">کارنامه</span>
        </nav>

        <header className="border-border mb-5 border-b pb-4">
          <p className="text-verde text-[11.5px] font-extrabold tracking-wide">
            سند شرکت در مسابقه
          </p>
          <h1 className="text-text mt-1.5 text-[clamp(21px,3.2vw,28px)] font-extrabold">
            کارنامه و استعلام
          </h1>
          <p className="text-text-muted mt-2 max-w-[62ch] text-[13px] leading-[2]">
            {LEADS.receipt.lead}
          </p>
        </header>

        <Suspense fallback={<div className="bg-surface-2 h-40 animate-pulse rounded-2xl" />}>
          <ReceiptView />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
