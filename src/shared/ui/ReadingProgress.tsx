"use client";

import { useEffect, useRef } from "react";

/**
 * نوار پیشرفتِ مطالعه — **زیرِ منوی افقی**، چسبیده به لبهٔ پایین هدر.
 *
 * ── خواستهٔ کاربر ────────────────────────────────────────────────────────
 * «نوار پیشرفت زیر منوی افقی بالا.» پیش‌تر یک نسخهٔ شناور در بالای صفحه
 * (`fixed top-0`) داشتیم که روی خودِ هدر می‌افتاد و با آرم و لینک‌ها
 * تصادم می‌کرد. این نسخه جایش را عوض کرده: داخل هدر، در آخرین ردیف.
 *
 * ── چرا `transform: scaleX` و نه `width` ─────────────────────────────────
 * تغییر `width` در هر فریم، «چیدمان» را دوباره محاسبه می‌کند و روی
 * موبایلِ ضعیف، اسکرول را تکه‌تکه می‌کند. `transform` فقط ترکیب‌بندی
 * می‌شود و هزینهٔ آن تقریباً صفر است.
 *
 * ── چرا `ref` و نه `useState` ────────────────────────────────────────────
 * چون این مقدار هیچ محتوای متنی‌ای تولید نمی‌کند و فقط یک متغیر CSS است.
 * با `useState` هر فریم یک رندر React می‌داد؛ با `ref`، React از حرکتِ
 * اسکرول خبر ندارد. صفرِ مصرف، بدون دست‌کاری دقت.
 *
 * ── دسترس‌پذیری ──────────────────────────────────────────────────────────
 * `aria-hidden` است: درصد اسکرول برای صفحه‌خوان اطلاعاتِ مفیدی نیست.
 */
export function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    let frame = 0;

    const measure = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const y = Math.abs(el.scrollTop); // در RTL بعضی مرورگرها منفی می‌دهند
      const ratio = max > 8 ? Math.min(1, y / max) : 0;
      fill.style.setProperty("--k185-progress", ratio.toFixed(4));
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

  return (
    <div aria-hidden="true" className="k185-progress-track">
      <div ref={fillRef} className="k185-progress-fill" />
    </div>
  );
}
