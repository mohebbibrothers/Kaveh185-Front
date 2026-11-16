/**
 * محاسبهٔ زمان باقی‌مانده بر پایهٔ **تاریخ مطلق**، نه ثانیهٔ نسبی.
 *
 * چرا؟ سایت ایستاست و HTML در زمان ساخت پخته می‌شود. اگر شمارش معکوس به
 * `seconds_until_start` (که هنگام ساخت محاسبه شده) تکیه کند، ممکن است
 * ساعت‌ها کهنه باشد: مثلاً سایت ساعت ۹ ساخته شده و کاربر ساعت ۱۴ باز
 * می‌کند؛ عدد پخته ۵ ساعت عقب است و «۴ روز مانده» نشان می‌دهد در حالی
 * که ۳ روز و ۱۹ ساعت مانده.
 *
 * `starts_at`/`ends_at` تاریخ مطلق ISO هستند و با ساعتِ **سرور** (که در
 * همان پاسخ آمده) مقایسه می‌شوند — پس ساعتِ غلطِ دستگاه کاربر هم روی
 * نتیجه اثر ندارد.
 *
 * @returns ثانیهٔ باقی‌مانده یا `null` اگر تاریخ نامعتبر بود (← مصرف‌کننده
 *          باید به مقدار پخته‌شدهٔ سرور بازگردد)
 */
export function secondsUntil(deadlineIso: string, nowIso: string): number | null {
  const deadline = Date.parse(deadlineIso);
  const now = Date.parse(nowIso);
  if (Number.isNaN(deadline) || Number.isNaN(now)) return null;
  return Math.max(0, Math.round((deadline - now) / 1000));
}
