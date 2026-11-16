"use client";

import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { Hero } from "@/widgets/hero/Hero";
import { useLiveBootstrap } from "@/shared/api/live";
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

  return (
    <DataContext.Provider value={{ data, freshness, lastOk }}>
      <SiteHeader />
      <main id="main">
        <Hero status={data.exam_status} serverNow={data.server_time} />
        {children}
      </main>
      <SiteFooter />
    </DataContext.Provider>
  );
}
