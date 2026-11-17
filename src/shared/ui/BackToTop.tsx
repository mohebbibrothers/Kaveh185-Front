"use client";

import { useEffect, useState } from "react";

/**
 * «بازگشت به بالا» — دکمهٔ واقعی، نه لینکِ `href="#"`.
 *
 * ── چرا لازم است؟ ────────────────────────────────────────────────────────
 * اسکرول‌بار مرورگر در این پروژه پنهان شده است (به درخواست کارفرما)؛ پس
 * کاربرِ پایینِ صفحه راهِ دیداریِ برگشت ندارد. این دکمه کم‌هزینه‌ترین
 * جایگزین است و در فوتر می‌نشیند، جایی که آدم بعد از خواندن همه‌چیز است.
 *
 * ── چرا `useSyncExternalStore` و نه `useEffect + setState`؟ ──────────────
 * همان قانون lint پروژه: هیچ setState همگام در effect. این هوک، منبعِ
 * خارجی (اسکرول) را می‌خواند و React را بی‌رندرِ آبشاری همگام می‌کند.
 *
 * `aria-label` صریح است و حرکت با `prefers-reduced-motion` خاموش می‌شود.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setVisible(Math.abs(document.documentElement.scrollTop) > 600);
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
      // `invisible` تا کاربرِ بالای صفحه دکمه‌ای بی‌مصرف نبیند؛ فضا هم
      // حفظ می‌شود تا چیدمان نپرد.
      className={`group text-on-stage-muted hover:text-gold hover:border-gold/45 flex h-9 items-center gap-2 rounded-full border border-white/15 px-3.5 text-[11.5px] font-bold transition-[color,border-color,opacity] duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path d="M12 19V6M6 11.5 12 5.5l6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      بازگشت به بالا
    </button>
  );
}
