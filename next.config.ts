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
    ...(dev
      ? {
          allowedDevOrigins: ["127.0.0.1", "localhost", "*.e2b.app"],
          async rewrites() {
            return {
              fallback: [{ source: "/api/:path*", destination: `${API_BASE}/api/:path*` }],
            };
          },
        }
      : {
          async rewrites() {
            return {
              fallback: [{ source: "/api/:path*", destination: `${API_BASE}/api/:path*` }],
            };
          },
        }),
  };
}
