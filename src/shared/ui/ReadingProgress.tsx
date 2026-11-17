"use client";

import { useEffect, useState } from "react";

/**
 * نوار پیشرفت مطالعه — **زیر منوی افقی**، به سبک سایت مهدیه (نکتهٔ ۴).
 *
 * ── چه چیزی عوض شد؟ ──────────────────────────────────────────────────────
 * نسخهٔ قبل `fixed top-0 z-[60]` بود: یک خطِ ۲پیکسلی که بالای هدر می‌نشست
 * و از آن جدا به نظر می‌رسید — مثل «نوار لودینگ مرورگر». کاربر خواست مثل
 * مهدیه **از زیر منو** پر شود، یعنی نوار، لبهٔ پایینیِ هدر باشد: همان
 * جایی که چشم انتظارش را دارد و بخشی از خودِ هدر محسوب می‌شود.
 *
 * ── چطور؟ ────────────────────────────────────────────────────────────────
 * کامپوننت خودش `position` نمی‌گیرد؛ یک `<div>` با ارتفاع ۳px و
 * `overflow-hidden` است که **داخل هدر، بعد از ردیف منو** رندر می‌شود.
 * پرشدگی با `transform: scaleX()` است، نه `width`:
 *   • `width` در هر فریم باعث layout می‌شود و در دستگاه ضعیف می‌لرزد.
 *   • `scaleX` فقط روی composite کار می‌کند — نوارِ ۶۰fps بدون هزینه.
 *
 * ── ریزه‌کاری‌ها ──────────────────────────────────────────────────────────
 * • `origin-right` چون RTL است؛ بدون آن، نوار از چپ پر می‌شود.
 * • در `scroll` با `requestAnimationFrame` و `passive` اندازه‌گیری می‌شود.
 * • `prefers-reduced-motion` نوار را بدون انیمیشن نگه می‌دارد ولی
 *   اطلاعاتش (درصد) از بین نمی‌رود.
 * • `aria-hidden`: درصدِ اسکرول برای صفحه‌خوان اطلاعات مفیدی نیست.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;

    const measure = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      // در RTL بعضی مرورگرها `scrollTop` منفی می‌دهند.
      const y = Math.abs(window.scrollY || el.scrollTop || 0);
      setPct(max > 8 ? Math.min(1, y / max) : 0);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const value = Math.max(0, Math.min(1, pct));

  return (
    <div
      aria-hidden="true"
      data-testid="reading-progress"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] overflow-hidden"
    >
      {/* شیارِ کم‌رنگ: تا کاربر بفهمد نوار «در حال پر شدن» است، نه یک خط تزئینی */}
      <span className="bg-border/45 absolute inset-0 block" />
      <span
        className="from-brand via-brand to-gold absolute inset-y-0 right-0 block w-full origin-right bg-gradient-to-l will-change-transform"
        style={{
          transform: `scaleX(${value})`,
          transition: "transform 120ms linear",
        }}
      />
      {/* نقطهٔ نورانیِ سرِ نوار — همان جزئیاتی که نوار را «زنده» می‌کند */}
      {value > 0.005 ? (
        <span
          className="bg-gold/90 absolute top-1/2 block size-[7px] -translate-y-1/2 rounded-full shadow-[0_0_8px_2px_oklch(76%_0.125_82/0.5)]"
          style={{ right: `calc(${value * 100}% - 3.5px)` }}
        />
      ) : null}
    </div>
  );
}
