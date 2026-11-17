"use client";

import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { Hero } from "@/widgets/hero/Hero";
import { useLiveBootstrap } from "@/shared/api/live";
import { useFooterMartyrs } from "@/shared/api/use-footer-martyrs";
import { DataContext } from "@/shared/api/data-context";
import type { Bootstrap } from "@/shared/api/landing";

/**
 * پوستهٔ صفحهٔ اول — تنها بخشی که در بستهٔ اولیه می‌ماند.
 *
 * ── چرا صفحه به دو نیم تقسیم شده؟ ──────────────────────────────────────
 *
 * پیش از این کل صفحه یک درخت کلاینت بود و Next ناچار می‌شد جاوااسکریپت
 * همهٔ ویجت‌ها را در بستهٔ اولیه بگذارد: ۲۳۲KB gzip فقط JS، در حالی که
 * سقف پروژه ۱۹۰KB است. برای کاربر ایرانی روی موبایل این تفاوت بین «دو
 * ثانیه» و «شش ثانیه» است — و کاربر دقیقاً همان لحظه تصمیم می‌گیرد بماند
 * یا برود.
 *
 * ⚠️ نوار پیشرفتِ مطالعه از این‌جا حذف شد: اکنون **داخل هدر** و چسبیده به
 * لبهٔ پایینیِ منوی افقی رندر می‌شود (`ReadingProgress` در `SiteHeader`)،
 * همان جایی که در سایت مهدیه دیده شد. نسخهٔ قبل آن را `fixed top-0` بالای
 * هدر می‌گذاشت و از هدر جدا به نظر می‌رسید.
 *
 * حالا:
 *   • این فایل (هدر + هیرو + فوتر) در HTML پیش‌رندر می‌شود؛ کاربر اول
 *     همین را می‌بیند: چهره، عنوان، تایمر واقعی، دو دکمه. بی‌انتظار.
 *   • بخش‌های سنگین‌تر (جدول مساجد، فهرست مساجد، قوانین، بنر پایانی) با
 *     `dynamic()` جدا شده‌اند و پس از هیدریشن می‌آیند؛ وزنشان در بستهٔ
 *     اولیه نیست و بارگذاری‌شان رقابتی با تصویر هیرو نمی‌کند.
 *
 * ⚠️ تازه‌سازی داده فقط همین‌جا انجام می‌شود. اگر هر بخش خودش polling
 * می‌کرد، یک صفحهٔ باز سه درخواست در دقیقه به API می‌زد. نتیجه از راه
 * `DataContext` به پایین می‌رود: یک درخواست، یک منبع حقیقت.
 */
export function LandingShell({
  initial,
  initialFetchedAt,
  children,
}: {
  initial: Bootstrap;
  initialFetchedAt: string;
  /** بخش‌های تنبل — از سرور تزریق می‌شوند تا HTML اولیه کامل بماند */
  children?: React.ReactNode;
}) {
  const { data, freshness, lastOk } = useLiveBootstrap(initial, initialFetchedAt);
  // تورِ ایمنیِ یادواره — بی‌صدا در خطا، بی‌داده یعنی «نوار مخفی».
  const liveMartyrs = useFooterMartyrs();

  return (
    <DataContext.Provider value={{ data, freshness, lastOk }}>
      <SiteHeader />
      <main id="main">
        <Hero status={data.exam_status} serverNow={data.server_time} />
        {children}
      </main>
      {/* یادوارهٔ شهدا داخلِ فوتر است، پس دادهٔ شهدا به فوتر می‌رود.
          ⚠️ نسخهٔ اول فقط `data.gallery.martyrs` بود. در خروجیِ ایستا این
          فهرست عمداً خالی است (اصلِ «هیچ دادهٔ ساختگی») و bootstrapِ زنده
          هم لزوماً گالری را همراه ندارد؛ نتیجه: HTMLِ منتشرشده نوارِ
          یادواره را **نداشت** و کاربر آن را نمی‌دید. حالا اگر bootstrap
          چیزی نداشت، همان مسیرِ صفحه‌های داخلی (`useFooterMartyrs`) شهدا
          را از `/api/v1/gallery/` می‌گیرد. */}
      <SiteFooter martyrs={data.gallery.martyrs.length > 0 ? data.gallery.martyrs : liveMartyrs} />
    </DataContext.Provider>
  );
}
