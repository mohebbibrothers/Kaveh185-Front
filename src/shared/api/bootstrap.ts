import { apiGet } from "./client";
import { bootstrapSchema, type Bootstrap } from "./landing";
import { FALLBACK_BOOTSTRAP } from "./fallback";

/**
 * وضعیت تازه‌سازی دادهٔ صفحهٔ اول.
 *
 * چرا این نوع لازم شد؟ چون خروجی سایت ایستاست: HTML در زمان ساخت پخته
 * می‌شود و «تازگی» را نمی‌توان به رندر سمت سرور سپرد. پس داده در دو جا
 * به‌دست می‌آید و فرانت باید بداند کدام تازه است:
 *
 *   • `build` — هنگام ساخت از API خوانده شد؛ عدد و تاریخ واقعی است، ولی
 *              ممکن است تا انتشار بعدی کهنه بماند.
 *   • `live`  — همین حالا از مرورگر از API گرفته شد.
 *   • `stale` — API پاسخ نداد؛ آنچه نمایش می‌دهیم آخرین دادهٔ سالم است و
 *              صادقانه برچسب «آخرین به‌روزرسانی» می‌خورد.
 *
 * هیچ حالتی دادهٔ ساختگی تولید نمی‌کند.
 */
export type DataFreshness = "build" | "live" | "stale";

export interface BootstrapResult {
  data: Bootstrap;
  /** زمان مرجع داده از ساعتِ سرور (ISO) — برای برچسب «آخرین به‌روزرسانی» */
  fetchedAt: string;
  /** آیا داده از API واقعی آمده یا پوستهٔ خالی است */
  fromApi: boolean;
}

/**
 * خواندن bootstrap در **زمان ساخت** (RSC؛ فقط چون سایت ایستاست).
 *
 * اینجا zod سوار است و هزینه‌اش صفر است: یک‌بار هنگام `next build` اجرا
 * می‌شود، نه در مرورگر. اگر پاسخ آمد و با قرارداد نخواند، بی‌صدا رد
 * نمی‌شود — به `console.warn` می‌رود تا در خروجی ساخت دیده شود. درسِ باگ
 * قبلی: ناسازگاری قرارداد بی‌صدا به پوستهٔ خالی تبدیل شده بود و کسی
 * نفهمید.
 *
 * هرگز خطا پرتاب نمی‌کند: نبودِ بک‌اند نباید ساخت را متوقف کند.
 */
export async function fetchBootstrap(): Promise<Bootstrap> {
  try {
    const raw = await apiGet("/api/v1/core/bootstrap/", {
      next: { revalidate: 60, tags: ["bootstrap"] },
    });
    const parsed = bootstrapSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn(
        `[kaveh185] قرارداد bootstrap با انتظار فرانت نمی‌خواند (پوستهٔ خالی نمایش داده می‌شود): ${parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" | ")}`,
      );
      return FALLBACK_BOOTSTRAP;
    }
    return parsed.data;
  } catch {
    // بک‌اند هنوز آنلاین نیست — صفحهٔ اول باید همیشه ساخته شود
    return FALLBACK_BOOTSTRAP;
  }
}

/** همان الگوی زمان ساخت، با متادیتای تازگی برای کلاینت. */
export async function fetchBootstrapWithMeta(): Promise<BootstrapResult> {
  const data = await fetchBootstrap();
  return {
    data,
    fetchedAt: data.server_time,
    // پوستهٔ خالی، هیچ مسجدی ندارد؛ دادهٔ واقعی همیشه دارد (۱۷ مسجد)
    fromApi: data.mosques.length > 0,
  };
}
