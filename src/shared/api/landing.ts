import { z } from "zod";

/**
 * قرارداد صفحهٔ اول (bootstrap) — zod برای اعتبارسنجی زمان اجرا.
 * چرا zod روی داده‌ای که تایپ دارد؟ چون تایپ در زمان کامپایل محو می‌شود و
 * اگر بک‌اند فردا فیلدی را تغییر دهد، ما می‌خواهیم پیام روشن ببینیم، نه
 * صفحهٔ سفید.
 */
export const communicationChannelSchema = z.object({
  platform: z.string(),
  title: z.string(),
  url: z.string(),
  handle: z.string().optional(),
});

export const examStatusSchema = z.object({
  title: z.string(),
  book_title: z.string(),
  organizer_name: z.string(),
  description: z.string(),
  window_state: z.enum(["upcoming", "open", "ended"]),
  window_state_label: z.string(),
  can_participate: z.boolean(),
  status_message: z.string(),
  server_time: z.string(),
  server_time_jalali: z.string(),
  starts_at: z.string(),
  starts_at_jalali: z.string(),
  ends_at: z.string(),
  ends_at_jalali: z.string(),
  seconds_until_start: z.number(),
  seconds_until_end: z.number(),
  duration_seconds: z.number(),
  questions_per_attempt: z.number(),
  require_otp_before_exam: z.boolean(),
  active_question_bank_size: z.number(),
  communication_channels: z.array(communicationChannelSchema),
});

export const mosqueSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  neighborhood: z.string(),
  address: z.string().optional(),
  display_order: z.number().optional(),
  completed_participants_count: z.number().optional(),
});

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  mosque_id: z.number(),
  code: z.string(),
  name: z.string(),
  neighborhood: z.string(),
  tier: z.string().optional(),
  tier_label: z.string().optional(),
  completed_participants_count: z.number().default(0),
  participants_count: z.number().default(0),
  registered_users_count: z.number().default(0),
  target_participants: z.number().optional(),
  target_progress_percent: z.number().optional(),
  participation_share_percent: z.number().optional(),
  average_score: z.number().optional(),
  average_correct_answers: z.number().optional(),
  average_duration_seconds: z.number().optional(),
});

export const leaderboardSchema = z.object({
  organizer: z.string().optional(),
  total_mosques: z.number(),
  total_active_mosques: z.number(),
  total_completed_participants: z.number(),
  total_exam_participants: z.number(),
  total_registered_users: z.number().optional(),
  total_registered_participants: z.number(),
  updated_at: z.string().optional(),
  updated_at_jalali: z.string().optional(),
  leaderboard: z.array(leaderboardEntrySchema),
});

/**
 * گالری محتوایی — تصاویر رهبر (باکس «کتاب و کلام») و نوار شهدا (بالای فوتر).
 *
 * ⚠️ هر دو آرایه `.default([])` دارند: نسخهٔ قدیمی بک‌اند این کلید را
 * نمی‌دهد و فرانت نباید بشکند — صفحه باید بدون گالری هم کامل باشد.
 * (اصل سازگاری رو‌به‌عقب: استقرار بک و فرانت همیشه هم‌زمان نیست.)
 */
export const leaderPortraitSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  alt: z.string(),
  caption: z.string().default(""),
  caption_paragraphs: z.array(z.string()).default([]),
  source: z.string().default(""),
  show_in_box: z.boolean().default(true),
});
export const martyrSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  alt: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
});
export const gallerySchema = z.object({
  leader: z.array(leaderPortraitSchema).default([]),
  martyrs: z.array(martyrSchema).default([]),
});

export const bootstrapSchema = z.object({
  server_time: z.string(),
  server_time_jalali: z.string(),
  exam_status: examStatusSchema,
  mosques: z.array(mosqueSchema),
  leaderboard: leaderboardSchema,
  gallery: gallerySchema.default({ leader: [], martyrs: [] }),
});

export type Bootstrap = z.infer<typeof bootstrapSchema>;
export type LeaderPortrait = z.infer<typeof leaderPortraitSchema>;
export type Martyr = z.infer<typeof martyrSchema>;
export type ExamStatus = z.infer<typeof examStatusSchema>;
export type Mosque = z.infer<typeof mosqueSchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type CommunicationChannel = z.infer<typeof communicationChannelSchema>;
