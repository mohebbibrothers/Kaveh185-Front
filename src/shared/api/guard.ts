import type { Bootstrap } from "./landing";

/**
 * نگهبان سبکِ ساختار پاسخ `bootstrap` — بدون هیچ وابستگی.
 *
 * ── چرا این فایل هست و zod کافی نبود؟ ────────────────────────────────
 *
 * اعتبارسنجی با zod در **زمان ساخت** انجام می‌شود (سمت سرور، در
 * `bootstrap.ts`). آنجا هیچ هزینه‌ای برای کاربر ندارد و دقیقاً همان
 * دروازه‌ای است که ناسازگاری قرارداد را پیش از انتشار می‌گیرد.
 *
 * ولی مسیر کلاینت — تازه‌سازی هر ۶۰ ثانیه در مرورگر — هم zod را با خودش
 * می‌کشید: ۴۰KB gzip فقط برای بازبینی پاسخی که از همان سرور خودمان
 * می‌آید. روی موبایل و اینترنت ایران، این ۴۰ کیلوبایت بی‌دلیل است؛
 * و «اعتبارسنجیِ مجدد چیزی که خودمان ساختیم» امنیت اضافه نمی‌کند.
 *
 * پس: بررسی ساختاری کم‌هزینه فقط برای **فیلدهایی که واقعاً مصرف می‌شوند**.
 * هدفش این نیست که قرارداد را کامل بسنجد (کار zod در زمان ساخت است)؛
 * هدفش این است که اگر پاسخ HTML بود (مثلاً پروکسی خطا داد) یا `exam_status`
 * نبود، `undefined` را به درخت React تزریق نکنیم و صفحه نیفتد.
 */

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const has = (o: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.every((k) => k in o);

/** فیلدهای الزامی وضعیت آزمون — همان‌هایی که در ویجت‌ها خوانده می‌شوند. */
const EXAM_KEYS = [
  "title",
  "book_title",
  "organizer_name",
  "window_state",
  "starts_at",
  "ends_at",
  "starts_at_jalali",
  "ends_at_jalali",
  "seconds_until_start",
  "seconds_until_end",
  "questions_per_attempt",
  "duration_seconds",
] as const;

/**
 * آیا این پاسخ، شکل یک `Bootstrap` قابل استفاده را دارد؟
 *
 * @returns `true` فقط وقتی همهٔ ظرف‌ها و فیلدهای حیاتی سر جایشان باشند.
 */
export function isBootstrap(value: unknown): value is Bootstrap {
  if (!isObject(value)) return false;
  if (typeof value.server_time !== "string") return false;
  if (!isObject(value.exam_status) || !has(value.exam_status, EXAM_KEYS)) return false;
  if (typeof value.exam_status.window_state !== "string") return false;
  if (!["upcoming", "open", "ended"].includes(value.exam_status.window_state)) return false;
  if (!Array.isArray(value.mosques)) return false;
  if (!isObject(value.leaderboard) || !Array.isArray(value.leaderboard.leaderboard)) return false;
  return true;
}
