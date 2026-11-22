"use client";

import { z } from "zod";
import { apiPost } from "./client";
import { participantProfileSchema, examEligibilitySchema } from "./participant";

/**
 * «قبلاً ثبت‌نام کرده‌ام» — یافتنِ پرونده با شمارهٔ همراه.
 *
 * ══ چرا این لایه لازم شد؟ ═════════════════════════════════════════════════
 * کاربری که فرم را پر می‌کرد ولی دکمهٔ «ورود به آزمون» را نمی‌زد، بار بعد
 * دوباره فرمِ خالی می‌دید و همه‌چیز را از نو می‌زد. حالا به‌محضِ تکمیلِ
 * شماره (یا کدملی)، فرم می‌پرسد «این شماره را می‌شناسیم؟» و:
 *
 *   • `session_ready`  ⇒ فرم خودش پر می‌شود و دکمه به «ادامهٔ آزمون» تبدیل
 *     می‌شود؛ با یک کلیک، نشستِ تازه گرفته می‌شود.
 *   • `exam_completed` ⇒ پیوندِ کارنامه، نه فرمِ تازه.
 *   • `not_found`      ⇒ هیچ‌چیز عوض نمی‌شود؛ ثبت‌نامِ تازه مثلِ قبل.
 *
 * ── چرا zod؟ ──────────────────────────────────────────────────────────────
 * بک‌اند ممکن است فیلدی اضافه کند؛ ما فقط چیزی را می‌خوانیم که مطمئنیم.
 * `` عمدی است: داده‌ی ناشناخته دور ریخته نمی‌شود، ولی مصرف‌کننده
 * به آن تکیه هم نمی‌کند.
 */

export const lookupResultSchema = z
  .looseObject({
    found: z.boolean(),
    state: z.enum(["not_found", "session_ready", "exam_completed"]).catch("not_found"),
    access: z.string().optional(),
    refresh: z.string().optional(),
    session_uid: z.string().optional(),
    is_phone_verified: z.boolean().optional(),
    tracking_code: z.string().nullable().optional(),
    user: participantProfileSchema.partial().optional(),
    exam_eligibility: examEligibilitySchema.optional(),
  });

export type LookupResult = z.infer<typeof lookupResultSchema>;

/**
 * پرسشِ «این شماره را می‌شناسی؟».
 *
 * هیچ‌وقت خطا پرتاب نمی‌کند: این یک پرسشِ کمکی است و اگر شبکه یا سرور مشکل
 * داشت، باید فقط «نشناختم» برگردد تا کاربر بتواند ثبت‌نامِ عادی را ادامه دهد.
 * برعکسش (بلاک‌کردنِ فرم به‌خاطرِ خطای یک مسیرِ کمکی) بدترین حالت است.
 */
export async function lookupParticipant(phoneNumber: string): Promise<LookupResult> {
  try {
    const raw = await apiPost("/api/v1/auth/lookup/", { phone_number: phoneNumber });
    return lookupResultSchema.parse(raw);
  } catch {
    return { found: false, state: "not_found" };
  }
}
