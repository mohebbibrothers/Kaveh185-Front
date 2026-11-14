import { toEn } from "./fa";

/**
 * اعتبارسنجی کد ملی ایران — الگوریتم رسمی رقمِ کنترل (mod 11).
 * نرمال‌سازی خودکار: ارقام فارسی/عربی و فاصله‌ها پذیرفته می‌شوند.
 * قواعد رد: طول ≠ ۱۰، همه ارقام یکسان (مثل ۱۱۱۱۱۱۱۱۱۱).
 */
export function isValidNationalId(raw: string): boolean {
  const id = toEn(raw).replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(id)) return false;
  if (/^(\d)\1{9}$/.test(id)) return false;

  const digits = Array.from({ length: 10 }, (_, i) => Number(id[i]));
  const check = digits[9];
  const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
  const rem = sum % 11;
  return check === (rem < 2 ? rem : 11 - rem);
}

/** موبایل ایران: 09xxxxxxxxx — با نرمال‌سازی +۹۸ / ۹۸ / ارقام فارسی */
export function normalizePhone(raw: string): string {
  let p = toEn(raw).replace(/[\s()-]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
  else if (/^9\d{9}$/.test(p)) p = "0" + p;
  return p;
}

export function isValidPhone(raw: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(raw));
}

/**
 * تاریخ تولد. ورودی شمسی، خروجی ISO میلادی برای API.
 * بک‌اند هم شمسی می‌پذیرد، ولی ما برای نمایشِ سن و اعتبارسنجی محلی، تبدیل را
 * همین‌جا انجام می‌دهیم تا کاربر پیام خطای فوری ببیند.
 */
export function isValidJalaliDate(raw: string): boolean {
  const s = toEn(raw).trim().replace(/[-.]/g, "/");
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  if (mo > 6 && d > 30) return false;
  if (y < 1300 || y > 1420) return false;
  return true;
}

/** جلالی → میلادی — الگوریتم قطعی بر پایهٔ روز جولیَن (بدون وابستگی) */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): { y: number; m: number; d: number } {
  // شمارهٔ روز جولیَن برای ۱/۱/۱ هجری شمسی = 1948320 (تصحیح‌شده)
  const jdnOfJalali = (y: number, m: number, d: number): number => {
    const epBase = y - (y >= 0 ? 474 : 473);
    const epYear = 474 + (epBase % 2820);
    return (
      d +
      (m <= 7 ? (m - 1) * 31 : (m - 1) * 30 + 6) +
      Math.floor((epYear * 682 - 110) / 2816) +
      (epYear - 1) * 365 +
      Math.floor(epBase / 2820) * 1029983 +
      (1948320 - 1) +
      2
    );
  };

  const jdnToGregorian = (jdn: number): { y: number; m: number; d: number } => {
    let j = jdn + 32044;
    const g = Math.floor(j / 146097);
    const dg = j % 146097;
    const c = Math.floor(((Math.floor(dg / 36524) + 1) * 3) / 4);
    const dc = dg - c * 36524;
    const b = Math.floor(dc / 1461);
    const db = dc % 1461;
    const a = Math.floor(((Math.floor(db / 365) + 1) * 3) / 4);
    const da = db - a * 365;
    const y = g * 400 + c * 100 + b * 4 + a;
    const m = Math.floor((da * 5 + 308) / 153) - 2;
    const d = da - Math.floor(((m + 4) * 153) / 5) + 122;
    j = y - 4800 + Math.floor((m + 2) / 12);
    const mm = ((m + 2) % 12) + 1;
    return { y: j, m: mm, d };
  };

  return jdnToGregorian(jdnOfJalali(jy, jm, jd));
}

/** سن به سال تمام‌شده از تاریخ جلالی */
export function ageFromJalali(
  raw: string,
  todayJalali: { y: number; m: number; d: number },
): number | null {
  const s = toEn(raw).trim().replace(/[-.]/g, "/");
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(s);
  if (!m) return null;
  const [jy, jm, jd] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = todayJalali.y - jy;
  if (todayJalali.m < jm || (todayJalali.m === jm && todayJalali.d < jd)) age--;
  return age;
}
