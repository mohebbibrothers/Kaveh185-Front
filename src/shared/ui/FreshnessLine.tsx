import { toFa } from "@/shared/lib/fa";
import type { DataFreshness } from "@/shared/api/bootstrap";

/**
 * یک خطِ آرام که می‌گوید دادهٔ روی صفحه چقدر تازه است.
 *
 * چرا لازم است؟ چون سایت ایستاست و اعداد صفحه از «زمان ساخت» می‌آیند تا
 * وقتی که مرورگر خودش تازه‌سازی کند. پنهان‌کردن این واقعیت یعنی کاربر
 * نداند جدولِ مساجد ممکن است چند دقیقه عقب باشد. این خط جای «ادعای
 * تازگی» و «سکوت» را می‌گیرد: صادق، کوچک، بدون هشدار قرمز.
 *
 * `shell` ⇒ هنوز پاسخ سرور نرسیده. صفحه ساختار و متن ثابت را نشان می‌دهد
 *           و هیچ عددی روی آن نیست؛ پس «زمان ساخت» هم وجود ندارد.
 * `live`  ⇒ همین حالا از سرور گرفته شد.
 * `stale` ⇒ تازه‌سازی شکست خورد؛ عددِ نمایش‌داده‌شده آخرین دادهٔ سالم است.
 *
 * ⚠️ حالت `build` حذف شد. وجودش یعنی باور به این‌که داده‌ای در HTML پخته
 * شده — همان باگی که اعداد seed را به سایت واقعی برد.
 */
export function FreshnessLine({
  freshness,
  lastOk,
  className = "",
}: {
  freshness: DataFreshness;
  /** ISO — زمان مرجع داده از ساعت سرور */
  lastOk: string;
  className?: string;
}) {
  const label =
    freshness === "live"
      ? "به‌روز"
      : freshness === "stale"
        ? "اتصال برقرار نشد — آخرین دادهٔ سالم"
        : "در حال دریافت از سرور…";

  // ساعت سرور ممکن است ISO باشد؛ فقط بخش تاریخ/ساعت را نشان می‌دهیم
  const when = (() => {
    // پوستهٔ خالی زمان مرجع «۱۹۷۰» دارد (یعنی هیچ سروری دیده نشده)؛
    // نمایش آن به‌شکل تاریخ، عددی بی‌معنا روی صفحه می‌گذارد.
    if (!lastOk || freshness === "shell") return "";
    const t = Date.parse(lastOk);
    if (Number.isNaN(t) || t <= 0) return "";
    return new Intl.DateTimeFormat("fa-IR", {
      timeZone: "Asia/Tehran",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(t));
  })();

  return (
    <p
      className={`text-text-subtle flex items-center gap-1.5 text-[10.5px] ${className}`}
      // نقش «وضعیت» تا صفحه‌خوان تغییر را اعلام کند، ولی بدون مزاحمتِ live-region
      role="status"
    >
      <span
        aria-hidden="true"
        className={`inline-block size-1.5 rounded-full ${
          freshness === "live"
            ? "bg-verde"
            : freshness === "stale"
              ? "bg-brick/70"
              : "bg-gold-strong/70"
        }`}
      />
      <span>{label}</span>
      {when ? (
        <>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span className="tabular-nums">{toFa(when)}</span>
        </>
      ) : null}
    </p>
  );
}
