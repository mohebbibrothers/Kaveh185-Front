import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * آدرس بک‌اند برای پروکسیِ محیط توسعه.
 *
 * در تولید هیچ پروکسی‌ای وجود ندارد: سایت ایستا از همان میزانی سرو می‌شود
 * که API روی آن است (`https://kaveh185.ir/api/...`)، پس مرورگر هم‌مبدأ
 * درخواست می‌دهد و نه CORS لازم است نه توکنی در HTML جاسازی می‌شود.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    reactCompiler: true,
    typedRoutes: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    compress: true,
    /**
     * ── چرا خروجی ایستا و نه سرور Node؟ ────────────────────────────────
     *
     * میزبان cPanel (حساب `kavehir`) فرآیند Node دائمی ندارد: سقف فرآیند
     * LVE و نبودِ systemd. چیزی که دارد Apache + Passenger + پایتون است و
     * همان چیزی که برای بک‌اند استفاده می‌شود. راه دیگر — نگه‌داشتن یک
     * `next start` زنده — در این میزبان با هر ری‌استارت سرویس کشته
     * می‌شود و سایت بی‌صدا می‌افتد.
     *
     * پس فرانت به HTML/JS/CSS ایستا بدل می‌شود و **از درون خود جنگو** سرو
     * می‌شود (`apps/core/frontend.py`). نتیجه:
     *   • یک مبدأ: کوکی نشست، JWT کوکی‌محور و API بدون CORS.
     *   • هیچ راز/توکنی در HTML نیست.
     *   • استقرار فرانت جدا از بک‌اند و بی‌نیاز از ری‌استارت Passenger.
     *
     * بهایش: هیچ رندر سمت سرورِ پویا نداریم. دادهٔ صفحهٔ اول در **زمان
     * ساخت** از API خوانده و در HTML پخته می‌شود؛ سپس کلاینت آن را هر
     * ۶۰ ثانیه تازه می‌کند (← `src/shared/api/live.ts`). عددها و تاریخ‌ها
     * همیشه واقعی‌اند: اگر هنگام ساخت API در دسترس نباشد، پوستهٔ خالیِ
     * صادقانه جای دادهٔ ساختگی می‌نشیند.
     */
    output: "export",
    trailingSlash: true,
    /**
     * بهینه‌سازی تصویر Next به یک فرآیند سرور نیاز دارد (`/_next/image`).
     * در خروجی ایستا چنین چیزی نیست، پس تصاویر همان‌طور که ساخته شده‌اند
     * سرو می‌شوند. اندازه‌ها از پیش بهینه شده‌اند (AVIF/WebP نه، ولی
     * JPEG با کیفیت ۸۰ و ابعاد دقیقِ نمایش) و `sizes` می‌ماند تا مرورگر
     * نسخهٔ کوچک را برای موبایل انتخاب کند.
     */
    images: { unoptimized: true },
    ...(dev
      ? {
          /**
           * فقط در توسعه: `/api` به جنگوی محلی پروکسی می‌شود تا کلاینت
           * بتواند مسیر نسبی `/api/v1/...` بدهد و همان کدی که در تولید
           * اجرا می‌شود، در توسعه هم بی‌تغییر بماند.
           *
           * دو قاعده لازم است: قاعدهٔ سادهٔ `/api/:path*` اسلش پایانی را
           * می‌بلعد، جنگو با APPEND_SLASH آن را ۳۰۱ می‌کند و Next دوباره
           * به نسخهٔ بی‌اسلش برمی‌گرداند ⇒ حلقهٔ ۵۰ ریدایرکتی و سقوط
           * بی‌صدای صفحه به پوستهٔ خالی. `skipTrailingSlashRedirect`
           * به‌تنهایی کافی نیست؛ قاعدهٔ اول اسلش را عیناً می‌فرستد.
           */
          skipTrailingSlashRedirect: true,
          allowedDevOrigins: ["127.0.0.1", "localhost", "*.e2b.app"],
          async rewrites() {
            return {
              beforeFiles: [
                { source: "/api/:path*/", destination: `${API_BASE}/api/:path*/` },
                { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
              ],
              afterFiles: [],
              fallback: [],
            };
          },
        }
      : {}),
  };
}
