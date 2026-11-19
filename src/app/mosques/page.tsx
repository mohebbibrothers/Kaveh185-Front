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
            ایرادِ دیداریِ نسخهٔ قبل: تیتر راست‌چین بود ولی متنِ معرفی هم راست‌چین
            و در یک ستونِ باریکِ چپ‌چسبیده جمع می‌شد؛ نتیجه این بود که پاراگراف
            «وسطِ صفحه معلق» دیده می‌شد و از تیتر جدا می‌افتاد.
            راهِ درست برای یک هدرِ کلاسیک: سه عنصر رویِ **یک محورِ مرکزی**
            (برچسب، تیتر، معرفی) با پهنای خوانای بیشتر (`62ch`) و ترازِ متعادل.
            متن همچنان راست‌به‌چپ و طبیعی است، ولی بلوکِ متن وسطِ صفحه می‌نشیند
            و از دو طرف هوا می‌گیرد؛ رویِ موبایل هم عرضِ کامل و ترازِ راست
            می‌ماند (چون وسط‌چینِ متنِ بلند در عرضِ کم خواندن را کند می‌کند). */}
        <header className="border-border border-b pb-6 text-center">
          <p className="text-verde inline-flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide">
            <span aria-hidden="true" className="bg-verde inline-block h-[2px] w-4 rounded-full" />
            پهنهٔ رقابت
            <span aria-hidden="true" className="bg-verde inline-block h-[2px] w-4 rounded-full" />
          </p>
          <h1 className="text-text mt-2 text-[clamp(23px,3.4vw,32px)] font-extrabold">
            جدول رتبه‌بندی مساجد
          </h1>
          <p className="text-text-muted mx-auto mt-3 max-w-[62ch] text-[13px] leading-[2.05] text-pretty max-sm:text-right">
            {LEADS.mosques.lead}
          </p>
        </header>

        <MosquesDirectory />
      </main>
      <SiteFooter />
    </>
  );
}
