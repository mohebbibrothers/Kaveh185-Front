import type { Bootstrap } from "./landing";

/**
 * دادهٔ «پوستهٔ خالی» — نقطهٔ شروع رندر، نه دادهٔ نمایشی.
 *
 * ⚠️ درسِ گران‌بها: پیش‌تر `fetchBootstrap` در زمان ساخت از API خوانده
 * می‌شد و نتیجه در HTML پخته می‌شد. هنگام ساخت، `apiGet` به
 * `127.0.0.1:3000` برمی‌گشت و در سندباکس به یک بک‌اند آزمایشی می‌رسید که
 * دادهٔ seed داشت: هر مسجد «۱ مشارکت»، نرخ ۵.۹٪ و وضعیت «آزمون فعال».
 * آن اعداد جعلی در بستهٔ منتشرشده ماندند و بازدیدکنندهٔ واقعی دید که
 * «۱۷ نفر شرکت کرده‌اند» در حالی که API واقعی صفر می‌گفت.
 *
 * قانون تازه، بدون استثنا:
 *   • خروجی ایستا **هیچ داده‌ای از API** در خود ندارد.
 *   • عدد، تاریخ و فهرست مساجد فقط از پاسخ زندهٔ مرورگر می‌آید.
 *   • تا رسیدن آن پاسخ، صفحه ساختار و متن ثابت را نشان می‌دهد و هر جا
 *     عدد لازم است، «—» می‌گذارد.
 *
 * این تنها راهی است که «هیچ دادهٔ ساختگی» واقعاً تضمین می‌شود؛ چون دیگر
 * هیچ مسیری برای ورود داده به مرحلهٔ ساخت باقی نمی‌ماند.
 */
export const FALLBACK_BOOTSTRAP: Bootstrap = {
  // زمان مرجع: epoch یعنی «هیچ سروری دیده نشده». کلاینت آن را با اولین
  // پاسخ زنده جایگزین می‌کند و برچسب «آخرین به‌روزرسانی» را از آن می‌سازد.
  server_time: "1970-01-01T00:00:00+00:00",
  server_time_jalali: "—",
  mosques: [],
  exam_status: {
    title: "مسابقهٔ کتابخوانی هفتهٔ بسیج",
    book_title: "شهادت آیه‌ها (۲)",
    organizer_name: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
    description:
      "پنج پرسش چهارگزینه‌ای از کتاب «شهادت آیه‌ها (۲)»؛ سی داستان کوتاه، در پنج دقیقه. مسجد محلهٔ خود را انتخاب کنید تا نام مسجدتان در جدول مشارکت بالا برود.",
    window_state: "upcoming",
    window_state_label: "وضعیت آزمون در حال دریافت است",
    can_participate: false,
    status_message: "در حال دریافت وضعیت آزمون از سرور…",
    server_time: "1970-01-01T00:00:00+00:00",
    server_time_jalali: "—",
    // رشتهٔ خالی یعنی «تاریخ نامعلوم»؛ هیچ تاریخ ساختگی‌ای ساخته نمی‌شود.
    starts_at: "",
    ends_at: "",
    starts_at_jalali: "",
    ends_at_jalali: "",
    seconds_until_start: 0,
    seconds_until_end: 0,
    duration_seconds: 300,
    questions_per_attempt: 5,
    require_otp_before_exam: false,
    // صفر یعنی «بانک سؤال هنوز خوانده نشده»؛ کلاینت آن را از API می‌گیرد.
    active_question_bank_size: 0,
    /*
      فقط یک کانال رسمی وجود دارد: بله، خبرگزاری میدان نامجو.
      نسخهٔ قبل سه کانال (ایتا/بله/روبیکا) با نام کاربری `kaveh185_ir` داشت
      که هیچ‌کدام وجود نداشتند؛ لینک مرده بدتر از نبودِ لینک است.
    */
    communication_channels: [
      {
        platform: "bale",
        title: "خبرگزاری میدان نامجو",
        url: "https://ble.ir/NamjooNewsAgency",
        handle: "@NamjooNewsAgency",
      },
    ],
  },
  gallery: { leader: [], martyrs: [] },
  leaderboard: {
    organizer: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
    total_mosques: 0,
    total_active_mosques: 0,
    total_completed_participants: 0,
    total_exam_participants: 0,
    total_registered_users: 0,
    total_registered_participants: 0,
    leaderboard: [],
  },
};
