"use client";

import { useEffect, useState } from "react";

/**
 * سه قلاب کوچک که پرکاربردترین رفتارهای این صفحه را جمع می‌کنند.
 *
 * ⚠️ چرا همه در یک فایل؟ چون هر سه یک تصمیمِ مشترک دارند — «به کاربر
 * احترام بگذار و در مرورگر کارِ اضافه نکن» — و پخش‌کردن‌شان در سه فایل،
 * این تصمیم را سه بار تکرار می‌کرد.
 */

/**
 * خواندنِ امنِ یک media query.
 *
 * ⚠️ jsdom (و مرورگرهای خیلی قدیمی) `window.matchMedia` را ندارند. اگر
 * بدون بررسی صدا بزنیم، کل کامپوننت در تست/محیط محدود می‌شکند — درحالی‌که
 * «نبودِ پشتیبانی» باید یعنی «حالت پیش‌فرض»، نه «خطا».
 */
function matches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(query).matches;
}

/** اشتراک در تغییرِ یک media query، با بازگشت‌دهندهٔ لغو. */
function subscribe(query: string, onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(query);
  // `addEventListener` روی `MediaQueryList` از Safari ۱۴ به بعد هست و
  // همان چیزی است که MDN توصیه می‌کند؛ `addListener` منسوخ است.
  mq.addEventListener("change", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
  };
}

/** آیا کاربر انیمیشن کمتر خواسته است؟ (WCAG 2.3.3) */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const sync = () => {
      setReduced(matches("(prefers-reduced-motion: reduce)"));
    };
    sync();
    return subscribe("(prefers-reduced-motion: reduce)", sync);
  }, []);

  return reduced;
}

/**
 * آیا صفحه دیده می‌شود؟ (تب پنهان = کار نکن)
 *
 * ⚠️ بدون این، تایمر و نوار گردانِ گالری وقتی کاربر در تب دیگری است
 * هم ثانیه‌شماری و انیمیشن می‌کنند: باتری موبایل می‌رود و کارِ بی‌فایده
 * انجام می‌شود. مرورگرها خودشان `requestAnimationFrame` را متوقف می‌کنند
 * ولی `setInterval` را نه.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => {
      setVisible(document.visibilityState !== "hidden");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return visible;
}

/**
 * آیا کاربر با ماوس/قلم دقیق کار می‌کند؟
 *
 * برای «مکث روی هاور» لازم است: روی صفحهٔ لمسی، هاور وجود ندارد و اگر
 * فقط `onMouseEnter` را گوش کنیم، نوار گردان هیچ‌وقت روی موبایل مکث
 * نمی‌کند — رفتارِ درست هم همین است.
 */
export function useHoverCapable(): boolean {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCapable(matches("(hover: hover) and (pointer: fine)"));
    };
    sync();
    return subscribe("(hover: hover) and (pointer: fine)", sync);
  }, []);

  return capable;
}
