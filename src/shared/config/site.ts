/**
 * پیکربندی ثابت سایت — تنها منبع حقیقتِ متن‌های غیر-عددی.
 *
 * چرا این‌جا و نه در کامپوننت‌ها؟ چون این مقادیر در چند جا تکرار می‌شوند
 * (هدر، فوتر، متادیتا، JSON-LD). پراکنده‌بودن‌شان یعنی یک روز نام کانال در
 * فوتر عوض می‌شود و در سه جای دیگر نه.
 *
 * ⚠️ هیچ عددی این‌جا نیست. عددها فقط از API می‌آیند.
 */
export const SITE = {
  name: "کاوه ۱۸۵",
  fullName: "مسابقهٔ کتاب‌خوانی هفتهٔ بسیج — کاوه ۱۸۵",
  organizer: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kaveh185.ir",
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000",
  locale: "fa-IR",
  dir: "rtl",
  /** کتاب مسابقه — «شهادت آیه‌ها (۲)»، ۳۰ داستان کوتاه */
  bookTitle: "شهادت آیه‌ها (۲)",
  bookStories: 30,
  event: {
    title: "هفتهٔ بسیج ۱۴۰۵",
    startsLabel: "۲۹ آبان ۱۴۰۵",
    endsLabel: "۵ آذر ۱۴۰۵",
  },
  /**
   * کانال رسمی — حوزه فقط همین یک کانال را دارد.
   * هر لینک تازه این‌جا باید واقعاً وجود داشته باشد؛ لینک مرده بدتر از
   * نبودِ لینک است.
   */
  channel: {
    platform: "بله",
    name: "خبرگزاری میدان نامجو",
    handle: "@NamjooNewsAgency",
    url: "https://ble.ir/NamjooNewsAgency",
  },
} as const;

export const NAV = [
  { href: "/#about", label: "دربارهٔ مسابقه" },
  { href: "/#steps", label: "چگونه شرکت کنم" },
  { href: "/#board", label: "جدول مساجد" },
  { href: "/#mosques", label: "مساجد حوزه" },
  { href: "/#rules", label: "قوانین" },
] as const;
