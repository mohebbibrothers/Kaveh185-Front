"use client";

import { useEffect, useState } from "react";

/**
 * نوارِ پیشرفتِ مطالعه — روی لبهٔ پایینِ هدر، نه بالای صفحه.
 *
 * ── چه چیزی عوض شد و چرا؟ ───────────────────────────────────────────────
 * نسخهٔ قبل `fixed inset-x-0 top-0` بود: یک خط ۲پیکسلی روی لبهٔ بالای
 * مرورگر که از **روی** هدر عبور می‌کرد. دو ایراد داشت:
 *   • در RTL نوار از راست پر می‌شد ولی کاربر آن را «بالای سایت» می‌دید،
 *     جدا از ناوبری — مثل یک خطای رندر.
 *   • روی دسکتاپ با نوار عنوان مرورگر فاصلهٔ ناخوشایندی می‌ساخت.
 *
 * اکنون این کامپوننت **فرزندِ هدر** است (`absolute bottom-0`)، پس دقیقاً
 * روی خط جداکنندهٔ هدر می‌نشیند و با هدرِ `sticky` همیشه در دید می‌ماند —
 * همان چیزی که کاربر در سایت مهدیه دیده بود: زیر منو، چسبیده به آن.
 *
 * ── چرا `dir="ltr"`؟ ────────────────────────────────────────────────────
 * نوار با `width: %` پر می‌شود و در جهت `rtl`، لبهٔ رشد سمت چپ است. با
 * `dir="ltr"` رشد همیشه از چپِ ظرف (که در RTL یعنی سمت راستِ صفحه، جایی
 * که خواندن شروع می‌شود) اتفاق می‌افتد و با نوار پیشرفت مرورگر هم‌جهت است.
 *
 * ── کارایی ───────────────────────────────────────────────────────────────
 * شنوندهٔ `scroll` با `passive: true` و محاسبه در `requestAnimationFrame`؛
 * روی دستگاه‌های ضعیف هر فریم فقط یک بار استایل می‌نشیند.
 *
 * `aria-hidden` است: درصدِ اسکرول برای صفحه‌خوان اطلاعات مفیدی نیست و
 * اعلام مداومش آزاردهنده است.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const y = Math.abs(el.scrollTop); // در RTL برخی مرورگرها منفی می‌دهند
      setPct(max > 24 ? Math.min(1, y / max) : 0);
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
      dir="ltr"
      className="pointer-events-none absolute inset-x-0 -bottom-px h-[2.5px] overflow-hidden"
    >
      <div
        className="from-brand via-brand to-gold h-full bg-gradient-to-r transition-[width] duration-200 ease-out"
        style={{ width: `${Math.max(0, Math.round(pct * 100))}%` }}
      />
    </div>
  );
}
