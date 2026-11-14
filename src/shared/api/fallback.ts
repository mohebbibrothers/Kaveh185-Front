import type { Bootstrap } from "./landing";

/**
 * دادهٔ «پوستهٔ خالی» برای وقتی بک‌اند هنوز پاسخ نمی‌دهد.
 *
 * اصل طراحی: هیچ عدد یا نام جعلی ساخته نمی‌شود. اگر بک‌اند در دسترس نباشد،
 * صفحه باید صادقانه بگوید «آمار پس از آغاز به‌روزرسانی می‌شود»، نه اینکه
 * با دادهٔ ساختگی، جدولی نمایش دهد که وجود ندارد.
 */
export const FALLBACK_BOOTSTRAP: Bootstrap = {
  server_time: "2026-11-14T00:00:00+03:30",
  server_time_jalali: "۱۴۰۵/۰۸/۲۳",
  mosques: [],
  exam_status: {
    title: "مسابقهٔ کتابخوانی هفتهٔ بسیج",
    book_title: "کتاب مسابقهٔ هفتهٔ بسیج",
    organizer_name: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
    description:
      "پنج سؤال از کتابِ معرفی‌شده، در زمان محدود. کافی است مسجد محلهٔ خودت را انتخاب کنی تا نام مسجدت در جدول مشارکت بالا برود.",
    window_state: "upcoming",
    window_state_label: "به‌زودی آغاز می‌شود",
    can_participate: false,
    status_message: "مهلت شرکت در آزمون هنوز آغاز نشده است.",
    server_time: "2026-11-14T00:00:00+03:30",
    server_time_jalali: "۱۴۰۵/۰۸/۲۳",
    starts_at: "2026-11-20T00:00:00+03:30",
    ends_at: "2026-11-26T23:59:59+03:30",
    starts_at_jalali: "۱۴۰۵/۰۸/۲۹",
    ends_at_jalali: "۱۴۰۵/۰۹/۰۵",
    seconds_until_start: 6 * 86400,
    seconds_until_end: 12 * 86400,
    duration_seconds: 300,
    questions_per_attempt: 5,
    require_otp_before_exam: false,
    active_question_bank_size: 0,
    communication_channels: [
      {
        platform: "eitaa",
        title: "ایتا",
        url: "https://eitaa.com/kaveh185_ir",
        handle: "kaveh185_ir",
      },
      { platform: "bale", title: "بله", url: "https://ble.ir/kaveh185_ir", handle: "kaveh185_ir" },
      {
        platform: "rubika",
        title: "روبیکا",
        url: "https://rubika.ir/kaveh185_ir",
        handle: "kaveh185_ir",
      },
    ],
  },
  leaderboard: {
    organizer: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
    total_mosques: 17,
    total_active_mosques: 17,
    total_completed_participants: 0,
    total_exam_participants: 0,
    total_registered_users: 0,
    total_registered_participants: 0,
    leaderboard: [],
  },
};
