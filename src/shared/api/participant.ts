import { z } from "zod";

/**
 * قرارداد مسیر شرکت‌کننده: ثبت‌نام، آزمون، کارنامه، استعلام.
 *
 * ── چرا این‌جا zod هست و در مسیر «تازه‌سازی صفحهٔ اول» نه؟ ──────────────────
 * `bootstrap` را در زمان ساخت اعتبارسنجی می‌کنیم و در مرورگر فقط یک گارد
 * سبک می‌زنیم تا بستهٔ اولیه سنگین نشود. اما این‌جا داده *مالکیت کاربر* را
 * تعیین می‌کند (توکن، کد رهگیری، شمارهٔ سؤال). اگر شکلی غیرمنتظره بیاید،
 * نمی‌خواهیم با `undefined` جلو برویم و کاربر پیام مبهم ببیند؛ می‌خواهیم
 * همان‌جا با پیام روشن متوقف شویم.
 */
export const tokensSchema = z.object({
  access: z.string(),
  refresh: z.string().optional(),
  session_uid: z.string().optional(),
});

export const participantProfileSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  birth_date_jalali: z.string().optional(),
  mosque_id: z.number().nullable().optional(),
  mosque_name: z.string().nullable().optional(),
  mosque_code: z.string().nullable().optional(),
  role: z.string(),
  is_phone_verified: z.boolean().optional(),
});

export const examEligibilitySchema = z.object({
  can_start: z.boolean().optional(),
  has_active_attempt: z.boolean().optional(),
  has_completed_attempt: z.boolean().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

export const registerResultSchema = z.object({
  is_new_user: z.boolean(),
  otp_required: z.boolean(),
  tokens: tokensSchema.optional().nullable(),
  access: z.string().optional().nullable(),
  user: participantProfileSchema,
  exam_eligibility: examEligibilitySchema.optional(),
});

export const optionSchema = z.object({
  position: z.number(),
  text: z.string(),
});

export const attemptQuestionSchema = z.object({
  question_number: z.number(),
  question_text: z.string(),
  selected_position: z.number().nullable(),
  is_answered: z.boolean(),
  options: z.array(optionSchema).min(2),
});

export const attemptSchema = z.object({
  attempt_id: z.number(),
  tracking_code: z.string(),
  status: z.string(),
  started_at: z.string(),
  started_at_jalali: z.string(),
  expires_at: z.string(),
  remaining_seconds: z.number(),
  duration_limit_seconds: z.number(),
  total_questions: z.number(),
  answered_count: z.number(),
  unanswered_count: z.number(),
  all_answered: z.boolean(),
  can_finish_now: z.boolean(),
  current_question_number: z.number(),
  questions: z.array(attemptQuestionSchema),
});

export const reportCardSchema = z.object({
  tracking_code: z.string(),
  receipt_signature: z.string().optional(),
  participant: z.object({
    full_name: z.string(),
    national_id_masked: z.string().optional(),
    phone_masked: z.string().optional(),
    mosque_name: z.string().nullable().optional(),
    mosque_code: z.string().nullable().optional(),
  }),
  summary: z.object({
    status: z.string(),
    status_label: z.string(),
    finished_reason: z.string().optional(),
    total_questions: z.number(),
    correct_count: z.number(),
    wrong_count: z.number(),
    unanswered_count: z.number(),
    accuracy_percent: z.union([z.number(), z.string()]).optional(),
    duration_seconds: z.number().optional(),
    duration_display: z.string().optional(),
    total_score: z.number().optional(),
    started_at_jalali: z.string().optional(),
    completed_at_jalali: z.string().optional(),
  }),
  thank_you_message: z.string().optional(),
  communication_channels: z
    .array(
      z.object({
        platform: z.string(),
        title: z.string(),
        url: z.string(),
        handle: z.string().optional(),
      }),
    )
    .optional(),
});

export type RegisterResult = z.infer<typeof registerResultSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type AttemptQuestion = z.infer<typeof attemptQuestionSchema>;
export type ReportCard = z.infer<typeof reportCardSchema>;
export type ParticipantProfile = z.infer<typeof participantProfileSchema>;
