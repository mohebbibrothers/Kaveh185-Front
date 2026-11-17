"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * منطق گالری در یک هوک — تا «تصویر» و «کلام همراه» از یک منبع بخوانند.
 *
 * ── چرا هوک و نه کامپوننتِ گالری؟ ────────────────────────────────────────
 * در باکس «کتاب و کلام»، تصویر در یک ستون است و کلام در ستون دیگر. اگر
 * گالری یک کامپوننت مستقل بود، برای هم‌گام‌کردنِ متن با تصویرِ فعال مجبور
 * می‌شدیم پرچم‌ها را از والد به فرزند و برگردان بفرستیم (prop drilling +
 * دو منبع حقیقت). با هوک، هر دو ستون از یک `index` می‌خوانند.
 *
 * ── قواعد چرخش ───────────────────────────────────────────────────────────
 * • فقط با دو تصویر یا بیشتر. یک تصویر = بدون کنترلِ بی‌فایده.
 * • ۶.۵ ثانیه: کوتاه‌تر، خواندن پاراگراف اول را می‌بُرد.
 * • مکث روی هاور/فوکوس/برگهٔ پنهان/`prefers-reduced-motion`.
 */
const AUTOPLAY_MS = 6500;

export function useGallery(count: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.visibilityState === "hidden") return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [count, paused]);

  /** برگهٔ پنهان ⇒ مکث (باتری و درخواستِ بی‌مصرف). */
  useEffect(() => {
    const onVisibility = () => {
      setPaused(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  return {
    index: count === 0 ? 0 : index % count,
    go,
    /** برای اتصال به ریشهٔ گالری: هاور، فوکوس و کلیدهای جهت */
    pauseHandlers: {
      onMouseEnter: () => {
        setPaused(true);
      },
      onMouseLeave: () => {
        setPaused(false);
      },
      onFocus: () => {
        setPaused(true);
      },
      onBlur: () => {
        setPaused(false);
      },
    },
  };
}
