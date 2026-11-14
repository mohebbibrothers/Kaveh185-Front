/** ابزارهای فارسی: ارقام، اعداد، زمان، نیم‌فاصله. همه خالص و تست‌پذیر. */

const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

/** تبدیل ارقام لاتین به فارسی — برای نمایش */
export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA[Number(d)] ?? d);
}

/** تبدیل ارقام فارسی/عربی به لاتین — برای ارسال به API و اعتبارسنجی */
export function toEn(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** جداکنندهٔ هزارگان با ارقام فارسی */
export function faNumber(n: number): string {
  // جداکنندهٔ هزارگانِ فارسی (U+066C) — نه کامای لاتین
  return toFa(new Intl.NumberFormat("en-US").format(Math.round(n))).replace(/,/g, "\u066C");
}

/** درصد با ارقام فارسی */
export function faPercent(n: number, digits = 0): string {
  return `${toFa(n.toFixed(digits))}٪`;
}

/** ثانیه → «مم:ثان» با ارقام فارسی (برای تایمر آزمون) */
export function faClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return toFa(`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`);
}

/** ثانیه → «۲ دقیقه و ۱۲ ثانیه» (برای کارنامه) */
export function faDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h) parts.push(`${toFa(h)} ساعت`);
  if (m) parts.push(`${toFa(m)} دقیقه`);
  if (sec || parts.length === 0) parts.push(`${toFa(sec)} ثانیه`);
  return parts.join(" و ");
}

/**
 * نرمال‌سازی متن فارسی برای جست‌وجو: ی/ک عربی، نیم‌فاصله، فاصله‌های تکراری.
 * (در جست‌وجوی مسجد و نام استفاده می‌شود)
 */
export function normalizeFa(input: string): string {
  return input
    .replace(/[ىي]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
