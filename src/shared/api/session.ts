"use client";

/**
 * نگه‌داری نشست شرکت‌کننده در مرورگر.
 *
 * ── چرا `localStorage` و نه کوکی؟ ─────────────────────────────────────────
 * سایت ایستاست و API روی زیردامنهٔ دیگری (`api.kaveh185.ir`) است. کوکیِ
 * cross-site نیازمند `SameSite=None; Secure` و CORS با اعتبارنامه است؛ یعنی
 * سطح حملهٔ بزرگ‌تر و تنظیم شکننده‌تر. این‌جا توکن Bearer در `localStorage`
 * است و فقط با هدر `Authorization` فرستاده می‌شود — همان الگویی که بک‌اند
 * برایش طراحی شده (JWT + session_uid).
 *
 * ── محدودیت و تصمیم صادقانه ──────────────────────────────────────────────
 * `localStorage` در برابر XSS مقاوم نیست. به همین دلیل هیچ‌جا
 * `dangerouslySetInnerHTML` نداریم و همهٔ متن‌ها به‌صورت متن رندر می‌شوند.
 * توکن هم کوتاه‌عمر است (access) و نشست از سمت سرور قابل ابطال است.
 */

const KEY = "k185-session-v1";

export type Session = {
  access: string;
  refresh?: string;
  fullName: string;
  mosqueName?: string | null;
  trackingCode?: string | null;
  /** آخرین کارنامهٔ دیده‌شده — برای نمایش سریع در ورود بعدی */
  lastScore?: number | null;
};

function read(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Session).access === "string" &&
      (parsed as Session).access.length > 20
    ) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return read();
}

export function saveSession(next: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // حالت پر شدن حافظه یا حالت ناشناس با ذخیره‌سازی مسدود — آزمون باید
    // در همان نشست جاری کار کند، پس خطا را بالا نمی‌دهیم.
  }
}

export function patchSession(patch: Partial<Session>): Session | null {
  const cur = read();
  if (!cur) return null;
  const next = { ...cur, ...patch };
  saveSession(next);
  return next;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* بی‌اهمیت */
  }
}

export function hasSession(): boolean {
  return read() !== null;
}
