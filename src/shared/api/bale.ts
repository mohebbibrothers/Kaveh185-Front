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
 *   • `bot_username` — نامِ ربات از **خودِ بله** (نه از تنظیماتِ سایت)، چون اگر
 *     تنظیمات با نامِ واقعیِ ربات یکی نباشد، همان پیوندی که به کاربر می‌دهیم
 *     به رباتِ اشتباه می‌رود و کاربر کد نمی‌گیرد.
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

/**
 * پیوندهای «اتصال با یک ضربه» — قلبِ تجربهٔ بدونِ مکالمه.
 *
 * ── مسئله‌ای که حل می‌کند ─────────────────────────────────────────────────
 * کاربر نباید در بله چیزی تایپ کند: نه شماره، نه کدِ اتصال. سرور یک شناسهٔ
 * کوتاهِ یک‌بارمصرف می‌سازد و ما دو نشانی می‌گیریم:
 *
 *   • `start_link` — `ble.ir/<bot>?start=<intent>`: بله همان لحظه پیامِ شروع
 *     را با آن شناسه به ربات می‌دهد؛ سرور گفتگو را به شماره وصل می‌کند و کدِ
 *     ورود را همان‌جا می‌فرستد. کاربر فقط یک پیوند را باز می‌کند.
 *   • `contact_link` — گفتگوی ربات را باز می‌کند؛ اگر بله پارامتر را منتقل
 *     نکرد، کاربر دکمهٔ «ارسالِ شمارهٔ من» را می‌بیند و یک ضربه می‌زند.
 *
 * هر دو مسیر بدونِ تایپ به همان نتیجه می‌رسند؛ برای همین هر دو را نگه می‌داریم.
 */
export type BaleStartLink = {
  eligible: boolean;
  start_link: string;
  contact_link: string;
  bot_username: string;
  expires_in_seconds: number;
  already_linked: boolean;
  message?: string;
};

const NOT_ELIGIBLE: BaleStartLink = {
  eligible: false,
  start_link: "",
  contact_link: "",
  bot_username: "",
  expires_in_seconds: 0,
  already_linked: false,
};

export async function fetchBaleStartLink(phoneNumber: string): Promise<BaleStartLink> {
  try {
    const raw = (await apiGet(
      `/api/v1/notifications/bale/start-link/?phone_number=${encodeURIComponent(phoneNumber)}`,
    )) as { data?: Partial<BaleStartLink> } | null;
    const data = raw?.data;
    if (!data) return NOT_ELIGIBLE;
    return {
      eligible: Boolean(data.eligible),
      start_link: typeof data.start_link === "string" ? data.start_link : "",
      contact_link: typeof data.contact_link === "string" ? data.contact_link : "",
      bot_username: typeof data.bot_username === "string" ? data.bot_username : "",
      expires_in_seconds: typeof data.expires_in_seconds === "number" ? data.expires_in_seconds : 0,
      already_linked: Boolean(data.already_linked),
      message: typeof data.message === "string" ? data.message : undefined,
    };
  } catch {
    return NOT_ELIGIBLE;
  }
}
