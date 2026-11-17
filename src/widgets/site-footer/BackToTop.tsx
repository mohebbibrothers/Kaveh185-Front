"use client";

import { useEffect, useState } from "react";

/**
 * «بازگشت به بالا» — دکمهٔ واقعی، نه یک لینکِ `#`.
 *
 * ── چرا لازم است؟ ────────────────────────────────────────────────────────
 * اسکرول‌بار مرورگر به درخواست کارفرما پنهان شده. با پنهان‌شدنِ نوار، یک
 * قابلیت هم از دست می‌رود: پرت‌کردنِ سریع به بالای صفحه. این دکمه همان
 * را برمی‌گرداند — و در فوتر است، جایی که کاربری که تا انتها خوانده
 * واقعاً به آن نیاز پیدا می‌کند.
 *
 * ── چرا فقط بعد از ۶۰۰px ظاهر می‌شود؟ ───────────────────────────────────
 * در بالای صفحه، دکمهٔ «برو بالا» بی‌معناست و فقط شلوغی است. با آستانهٔ
 * ۶۰۰px، همیشه وقتی معنا پیدا می‌کند که کاربر واقعاً پایین آمده.
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `aria-label` صریح، `focus-visible` دیدنی، و احترام به
 * `prefers-reduced-motion` (اسکرولِ نرم فقط اگر کاربر نخواسته باشد).
 */
const SHOW_AFTER = 600;

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      setShow(Math.abs(window.scrollY || 0) > SHOW_AFTER);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduced =
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        // فوکوس به ابتدای صفحه برمی‌گردد تا کاربر کیبورد از همان‌جا ادامه دهد.
        document.getElementById("main")?.focus();
      }}
      aria-label="بازگشت به بالای صفحه"
      className={`k185-back-to-top group border-on-band/20 bg-on-band/[0.05] text-on-band-muted hover:border-band-accent/50 hover:text-on-band inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-all duration-300 ${
        show ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      بازگشت به بالا
    </button>
  );
}
