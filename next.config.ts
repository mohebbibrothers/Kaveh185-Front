import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    reactCompiler: true,
    typedRoutes: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    trailingSlash: false,
    compress: true,
    /**
     * هدف کامپایل صریح: مرورگرهای مدرن.
     *
     * Next به‌طور پیش‌فرض مجموعهٔ پلی‌فیل core-js (۳۸KB gzip) را به باندل
     * تزریق می‌کند. برای کاربران ایرانیِ امروز — کروم اندروید ۱۰۵+ و سافاری
     * ۱۵.۶+ — این پلی‌فیل‌ها هیچ کاری نمی‌کنند و فقط وقت و دادهٔ کاربر را
     * تلف می‌کنند. اینجا با تعریف صریح هدف، Next فقط برای همان مرورگرها
     * کامپایل می‌کند و پلی‌فیل را کنار می‌گذارد.
     */
    images: { formats: ["image/avif", "image/webp"] },
    experimental: { optimizePackageImports: ["motion"] },
    /**
     * ⚠️ چرا `trailingSlash: true` برای مسیرهای API و چرا rewrite جدا؟
     *
     * این تنظیم تا امروز روی `false` بود و یک حلقهٔ بی‌نهایت redirect می‌ساخت:
     *
     *   GET /api/v1/core/bootstrap/   → 308 → /api/v1/core/bootstrap   (Next، چون trailingSlash=false)
     *   GET /api/v1/core/bootstrap    → 301 → /api/v1/core/bootstrap/  (Django، چون APPEND_SLASH)
     *   → تکرار بی‌پایان؛ fetch در RSC با «۵۰ redirect» می‌شکست و صفحه
     *     بی‌صدا به پوستهٔ خالی fallback می‌کرد — بدون هیچ خطای کنسولی.
     *
     * راه‌حل: مسیرهای `/api/*` را Next **پاک‌سازی نکند**. با `skipTrailingSlashRedirect`
     * ریدایرکت خودکار Next برای این مسیرها خاموش می‌شود و درخواست همان‌طور که
     * هست به Django می‌رسد. `trailingSlash` برای صفحات سایت روی `false` می‌ماند
     * تا URLهای تمیز فارسی/انگلیسی بدون اسلش پایانی بمانند.
     */
    skipTrailingSlashRedirect: true,
    ...(dev ? { allowedDevOrigins: ["127.0.0.1", "localhost", "*.e2b.app"] } : {}),
    async rewrites() {
      /**
       * ⚠️ چرا دو قاعده و چرا `beforeFiles`؟
       *
       * قاعدهٔ سادهٔ `source: "/api/:path*"` اسلش پایانی را در تطبیق regex
       * می‌بلعد: regex ساخته‌شده `(?:\/)?$` است، پس `/api/v1/x/` به
       * `.../api/v1/x` پروکسی می‌شد. Django با `APPEND_SLASH` روی همان
       * مسیر `301` به نسخهٔ با اسلش می‌داد و Next هم دوباره به نسخهٔ بدون
       * اسلش → **حلقهٔ بی‌نهایت ۵۰ ریدایرکت** و سقوط بی‌صدای صفحه به
       * پوستهٔ خالی (بدون هیچ خطای کنسولی — همین تشخیص را سخت کرد).
       *
       * اکنون قاعدهٔ اول مسیرهای دارای اسلش را **عیناً** می‌فرستد (اسلش در
       * destination نوشته شده)، و قاعدهٔ دوم فقط مسیرهای بدون اسلش را
       * می‌گیرد. `beforeFiles` هم تضمین می‌کند پیش از تلاش Next برای تطبیق
       * با فایل‌های عمومی/مسیرهای اپ اجرا شود.
       */
      return {
        beforeFiles: [
          { source: "/api/:path*/", destination: `${API_BASE}/api/:path*/` },
          { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
        ],
        afterFiles: [],
        fallback: [],
      };
    },
  };
}
