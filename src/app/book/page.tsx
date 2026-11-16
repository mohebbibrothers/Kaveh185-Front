import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { BookReader } from "@/widgets/book/BookReader";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

export const metadata: Metadata = {
  title: "مطالعهٔ کتاب مسابقه",
  description: `کتاب «${SITE.bookTitle}» — منبع پرسش‌های مسابقهٔ کتاب‌خوانی هفتهٔ بسیج حوزهٔ ۱۸۵ شهید کاوه.`,
  alternates: { canonical: "/book" },
};

/**
 * صفحهٔ مطالعهٔ کتاب.
 *
 * تصمیم‌های ساختاری:
 * • **بدون رندر سمت سرورِ فایل**: صفحه ایستاست؛ فایل با درخواست مرورگر از
 *   نمای کنترل‌شده می‌آید. پس ساخت صفحه هرگز به وجود فایل وابسته نیست.
 * • **اگر کتابی منتشر نشده باشد**، `BookReader` حالت خالی صادقانه نشان
 *   می‌دهد: «کتاب هنوز منتشر نشده» + پیوند به کانال رسمی. هیچ PDF جعلی یا
 *   متن ساختگی جای کتاب نمی‌نشیند.
 * • **راهنمای مطالعه** بالای فایل: کاربر بداند پرسش‌ها از داستان‌ها می‌آید
 *   و لازم نیست کل کتاب را حفظ کند.
 */
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <nav
          aria-label="مسیر"
          className="text-text-subtle mb-5 flex items-center gap-1.5 text-[11.5px]"
        >
          <Link href="/" className="hover:text-text transition-colors">
            خانه
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-muted">کتاب مسابقه</span>
        </nav>

        <header className="border-border border-b pb-5">
          <p className="text-gold-strong text-[11.5px] font-extrabold tracking-wide">
            منبع پرسش‌های مسابقه
          </p>
          <h1 className="text-text mt-1.5 text-[clamp(22px,3.4vw,30px)] font-extrabold">
            {SITE.bookTitle}
          </h1>
          <p className="text-text-muted mt-2.5 max-w-[64ch] text-[13px] leading-[2]">
            این کتاب مجموعه‌ای از {toFa(SITE.bookStories)} داستان کوتاه است. پرسش‌های آزمون از همین
            داستان‌ها انتخاب می‌شوند؛ خواندن دقیق داستان‌ها کافی است و حفظ‌کردن لازم نیست.
          </p>
        </header>

        <BookReader />
      </main>
      <SiteFooter />
    </>
  );
}
