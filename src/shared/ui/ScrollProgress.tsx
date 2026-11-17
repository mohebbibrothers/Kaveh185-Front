"use client";

import { useEffect, useState } from "react";

/**
 * نوارِ پیشرفتِ مطالعهٔ صفحه — جانشینِ اسکرول‌بارِ پنهان‌شده.
 *
 * ── چرا لازم شد؟ ──────────────────────────────────────────────────────────
 * کارفرما خواست اسکرول‌بار مرورگر کامل برداشته شود. با حذف آن، یک
 * قابلیت هم حذف می‌شود: کاربر نمی‌فهمد چقدر از صفحه را خوانده و چقدر
 * مانده. این نوارِ ۲پیکسلی همان اطلاعات را می‌دهد، بدون آنکه از عرضِ
 * صفحه چیزی بگیرد و بدون آنکه در RTL سمتِ راست را نامتقارن کند.
 *
 * ── چرا `scroll` و نه `scrollend` یا IntersectionObserver؟ ───────────────
 * ساده‌ترین چیزِ ممکن که کار می‌کند: یک شنوندهٔ `scroll` با `passive`.
 * محاسبه در `requestAnimationFrame` انجام می‌شود تا در دستگاه‌های ضعیف
 * (که اکثر کاربران همین هستند) هر فریم فقط یک بار استایل بنشیند.
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `aria-hidden` است: برای صفحه‌خوان، درصدِ اسکرول اطلاعات مفیدی نیست و
 * اعلامِ مداومش آزاردهنده است. نقشِ آن تزئینی/راهنماییِ بصری است.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const y = Math.abs(el.scrollTop); // در RTL برخی مرورگرها منفی می‌دهند
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

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="from-brand via-brand to-gold h-full origin-right bg-gradient-to-l transition-[width] duration-150 ease-out"
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
    </div>
  );
}
