"use client";

import { SiteFooter } from "./SiteFooter";
import { useFooterMartyrs } from "@/shared/api/use-footer-martyrs";

/**
 * فوتر + یادوارهٔ شهدا برای صفحه‌های داخلی.
 *
 * صفحهٔ اول داده را از قبل دارد و `SiteFooter` را مستقیم صدا می‌زند؛
 * صفحه‌های `/rules`، `/book`، `/mosques` و … ایستا هستند و باید شهدا را
 * هنگام نمایش بگیرند. این پوستهٔ نازکِ کلاینتی همان کار را می‌کند تا
 * هیچ صفحه‌ای فوترِ «نصفه» نداشته باشد.
 *
 * چرا فایلِ جدا و نه `"use client"` روی `SiteFooter`؟ تا فوترِ صفحهٔ اول
 * همچنان در HTML پیش‌رندر بماند و هیچ کامپوننتِ کلاینتی به بستهٔ اولیه
 * اضافه نشود.
 */
export function SiteFooterWithMartyrs() {
  const martyrs = useFooterMartyrs();
  return <SiteFooter martyrs={martyrs} />;
}
