import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { RulesContent } from "@/widgets/rules/RulesContent";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "قوانین و شرایط",
  description: `قوانین شرکت در مسابقهٔ کتاب‌خوانی ${SITE.bookTitle} — حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه.`,
  alternates: { canonical: "/rules" },
};

/**
 * صفحهٔ قوانین — همان قواعد صفحهٔ اول، ولی کامل و با پاسخ به پرسش‌های رایج.
 *
 * چرا صفحهٔ جدا و نه فقط بخش صفحهٔ اول؟ چون این صفحه جایی است که کاربر
 * برای *اطمینان* می‌آید: «آیا می‌توانم دوباره شرکت کنم؟ نتیجه چه زمانی
 * می‌آید؟ اطلاعاتم چه می‌شود؟» این‌ها را نمی‌شود در چهار کارت خلاصه کرد.
 */
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav
          aria-label="مسیر"
          className="text-text-subtle mb-5 flex items-center gap-1.5 text-[11.5px]"
        >
          <Link href="/" className="hover:text-text transition-colors">
            خانه
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-muted">قوانین</span>
        </nav>

        <header className="border-border border-b pb-5">
          <p className="text-brick text-[11.5px] font-extrabold tracking-wide">قوانین و شرایط</p>
          <h1 className="text-text mt-1.5 text-[clamp(22px,3.4vw,30px)] font-extrabold">
            چهار قاعده، برای رقابتی که عادلانه بماند
          </h1>
          <p className="text-text-muted mt-2.5 max-w-[64ch] text-[13px] leading-[2]">
            این صفحه همان قواعدی است که هنگام ثبت‌نام می‌پذیرید — با دلیل هر قاعده. اگر پرسشی
            داشتید، پاسخ‌های رایج پایین‌تر آمده است.
          </p>
        </header>

        <RulesContent />

        <div className="border-border bg-surface-2 mt-8 rounded-2xl border p-5">
          <p className="text-text text-[13px] font-extrabold">پرسشی بی‌پاسخ ماند؟</p>
          <p className="text-text-muted mt-1 text-[12.5px] leading-7">
            اطلاع‌رسانی رسمی مسابقه فقط در کانال {SITE.channel.name} انجام می‌شود.
          </p>
          <a
            href={SITE.channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border-strong text-text hover:bg-surface mt-3 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold transition-colors"
          >
            {SITE.channel.handle} در {SITE.channel.platform}
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
