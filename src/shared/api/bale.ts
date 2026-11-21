"use client";

import { apiGet } from "./client";

/**
 * وضعیتِ کانالِ بله برای یک شماره — «آیا کد می‌تواند از بله بیاید؟»
 *
 * ── چرا این پرسش لازم است؟ ────────────────────────────────────────────────
 * تنها راهِ رساندنِ کد به کاربر، بله است (پنلِ پیامکی مجوز ندارد). اما بله
 * فقط وقتی می‌تواند پیام بدهد که کاربر قبلاً ربات را «شروع» کرده باشد. اگر
 * ندانیم، کاربر دکمه‌ای می‌بیند که کاری نمی‌کند. این پرسش پاسخ می‌دهد:
 *   • `bale_configured` — ربات در سرور تنظیم شده است؟
 *   • `bot_username` — نامِ ربات برای ساختنِ پیوندِ مستقیم بله
 *   • `linked` — این شماره قبلاً وصل شده است؟
 *
 * ── چرا خطا «خاموش» می‌شود؟ ───────────────────────────────────────────────
 * این یک پرسشِ جانبی است؛ اگر شبکه لنگید، نباید ثبت‌نام را متوقف کند. در
 * بدترین حالت کدِ تأیید را نشان می‌دهیم و کاربر خودش راهِ بله را می‌رود.
 */
export type BaleStatus = {
  bale_configured: boolean;
  bot_username: string;
  linked: boolean;
};

const UNKNOWN: BaleStatus = { bale_configured: false, bot_username: "", linked: false };

export async function fetchBaleStatus(phoneNumber: string): Promise<BaleStatus> {
  try {
    const raw = (await apiGet(
      `/api/v1/notifications/bale/status/?phone_number=${encodeURIComponent(phoneNumber)}`,
    )) as Partial<BaleStatus> | null;
    if (!raw || typeof raw !== "object") return UNKNOWN;
    return {
      bale_configured: Boolean(raw.bale_configured),
      bot_username: typeof raw.bot_username === "string" ? raw.bot_username : "",
      linked: Boolean(raw.linked),
    };
  } catch {
    return UNKNOWN;
  }
}
