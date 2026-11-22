"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * پیش‌نویسِ فرمِ ثبت‌نام — «کارِ نیمه‌تمامِ کاربر گم نمی‌شود».
 *
 * ══ چرا این فایل وجود دارد؟ ══════════════════════════════════════════════
 * بخشی از گزارشِ «اطلاعاتم ذخیره نشد» این نبود که سرور داده را نگه ندارد؛
 * این بود که کاربر فرم را نیمه‌کاره رها می‌کرد (برای خواندنِ قوانین، دیدنِ
 * رتبه‌بندی مساجد، یا فقط سؤالی که یادش آمد) و **همان چیزی که تایپ کرده
 * بود** از بین می‌رفت. ثبت‌نام یک‌بار می‌شود و کاربر باید بتواند بترسد که
 * با یک کلیک همه‌اش را از دست داده باشد.
 *
 * ── چهار قاعده‌ای که رعایت شده ───────────────────────────────────────────
 *  ۱) **هیچ‌وقت مسدودکننده نیست:** ذخیره در `localStorage` با `try/catch`؛
 *     حالتِ ناشناس یا حافظهٔ پر، فرم را نمی‌شکند.
 *  ۲) **هیچ‌وقت دادهٔ حساس ذخیره نمی‌شود:** کد ملی و تاریخ تولد ذخیره
 *     **نمی‌شوند** — نه به‌خاطرِ حجم، به‌خاطرِ اینکه روی دستگاهِ اشتراکی
 *     نباید بمانند. نام، شماره و مسجد کافی است تا کاربر «جایِ خودش» را
 *     پیدا کند؛ کد ملی را دوباره می‌زند و همان، یک لایهٔ تأییدِ هویت است.
 *  ۳) **هیچ‌وقت روی دادهٔ کهنه نمی‌نویسد:** پیش‌نویس فقط اگر تازه باشد
 *     (کمتر از ۳ روز) بازیابی می‌شود.
 *  ۴) **پاک‌شدنِ قطعی:** بعد از ثبت‌نامِ موفق یا «خروج از این دستگاه»،
 *     پیش‌نویس پاک می‌شود تا نفرِ بعدی روی همان دستگاه چیزی نبیند.
 */

const KEY = "k185-register-draft-v1";
/** عمرِ پیش‌نویس: سه روز. بعد از آن، «آنچه تایپ کرده بودم» به «آشغال» تبدیل می‌شود. */
const MAX_AGE_MS = 3 * 86_400_000;

export type RegisterDraft = {
  first: string;
  last: string;
  phone: string;
  mosqueId: number | null;
  /** برای پیامِ «خوش برگشتید» — نامِ کوچک هم کافی است. */
  savedAt: number;
};

export function readDraft(): RegisterDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const d = parsed as Partial<RegisterDraft>;
    if (typeof d.savedAt !== "number" || Date.now() - d.savedAt > MAX_AGE_MS) return null;
    if (!d.first && !d.last && !d.phone && !d.mosqueId) return null;
    return {
      first: typeof d.first === "string" ? d.first : "",
      last: typeof d.last === "string" ? d.last : "",
      phone: typeof d.phone === "string" ? d.phone : "",
      mosqueId: typeof d.mosqueId === "number" ? d.mosqueId : null,
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

export function writeDraft(draft: RegisterDraft): void {
  if (typeof window === "undefined") return;
  try {
    /*
     * ⚠️ فقط چهار فیلدِ مجاز نوشته می‌شود — نه `JSON.stringify(draft)`.
     * اگر روزی کسی کد ملی یا تاریخ تولد را به آبجکت اضافه کند، این
     * allowlist مانعِ نشستنِ آن روی دیسک می‌شود. حریم خصوصیِ دستگاهِ
     * اشتراکی (کتابخانه، کافی‌نت، گوشیِ امانی) همین‌جا حفظ می‌شود.
     */
    const safe: RegisterDraft = {
      first: String(draft.first ?? "").slice(0, 80),
      last: String(draft.last ?? "").slice(0, 100),
      phone: String(draft.phone ?? "").slice(0, 15),
      mosqueId: typeof draft.mosqueId === "number" ? draft.mosqueId : null,
      savedAt: Number(draft.savedAt) || Date.now(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(safe));
  } catch {
    /* پر یا مسدود — فرم باید کار کند، پیش‌نویس «امتیاز» است. */
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* بی‌اثر */
  }
}

/**
 * قلابِ پیش‌نویس: مقدارِ اولیه را از حافظه می‌دهد و تغییرات را با تأخیر
 * می‌نویسد (debounce) تا هر حرف یک نوشتنِ دیسک نسازد.
 */
export function useRegisterDraft<T extends Omit<RegisterDraft, "savedAt">>(
  value: T,
  enabled = true,
): { restored: RegisterDraft | null; forget: () => void } {
  const [restored] = useState<RegisterDraft | null>(() =>
    typeof window === "undefined" ? null : readDraft(),
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const { first, last, phone, mosqueId } = value;
    if (!first && !last && !phone && !mosqueId) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      writeDraft({ first, last, phone, mosqueId, savedAt: Date.now() });
    }, 500);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [value, enabled]);

  const forget = useCallback(() => {
    clearDraft();
  }, []);

  return { restored, forget };
}
