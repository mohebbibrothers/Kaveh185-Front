import type { Route } from "next";

/**
 * تبدیلِ «مسیری که سرور گفته» به مسیری که `typedRoutes` می‌پذیرد — بدونِ cast.
 *
 * ── چرا این فایل؟ ─────────────────────────────────────────────────────────
 * مقصدِ CTAها از `POST /auth/session/state/` می‌آید (`/exam`،
 * `/receipt?code=…`، `/register`). یعنی در زمانِ کامپایل یک لیترالِ ثابت
 * نیست، ولی Next با `typedRoutes` فقط مسیرهای شناخته‌شده را قبول می‌کند.
 *
 * راهِ رایج، `as Route` است — که در محیطی که تایپ‌های مسیر هنوز تولید نشده‌اند
 * (مثلِ مرحلهٔ لینت در CI) «assertionِ بی‌مصرف» شمرده می‌شود و گیت را
 * می‌شکند. راهِ این‌جا: یک **type guard** واقعی. هم تایپ‌چک را در هر دو محیط
 * راضی می‌کند و هم یک بررسیِ واقعیِ زمانِ اجرا انجام می‌دهد: رشته باید با
 * `/` شروع شود و `//` یا `://` نداشته باشد (وگرنه مقصدِ بیرونی می‌شد —
 * یک درِ باز برای open-redirect).
 */
export function isInternalRoute(path: string): path is Route {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

/**
 * مسیرِ امن برای ناوبری: اگر سرور چیزِ غیرمنتظره‌ای فرستاد، به مقصدِ
 * محافظه‌کارانه (`/register`) برمی‌گردیم — هرگز به یک URLِ بیرونی.
 */
export function resolveRoute(path: string, fallback = "/register"): Route {
  if (isInternalRoute(path)) return path;
  // یک پله محافظه‌کاری: اگر خودِ fallback هم امن نبود، ریشهٔ سایت.
  return isInternalRoute(fallback) ? fallback : "/";
}
