"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";
import { usePageVisible, usePrefersReducedMotion } from "@/shared/lib/motion";

/**
 * شمارش معکوس — نسخهٔ چهارم: «چهار کاشیِ نفس‌کشنده».
 *
 * ── چه ایرادی گرفته شد و چه شد؟ ───────────────────────────────────────────
 * کاربر گفت «فونت تایمر جذاب نیست، کادر به اعداد چسبیده، خوش‌فرم نیست».
 * سه ایرادِ واقعی پشتِ این جمله بود:
 *
 * ۱) **قاب به رقم چسبیده بود.** رقم‌ها با `leading-none` در قابی با
 *    `py-2` می‌نشستند؛ در فارسی، کرسیِ حروف (ascender/descender) از
 *    `leading-none` بیرون می‌زند و دقیقاً حسِ «چسبیده» می‌دهد. حالا هر
 *    رقم در **کاشی مستقل** با نسبتِ ابعاد ثابت و فاصلهٔ داخلیِ واقعی
 *    (`px-3 pt-2.5 pb-1`) می‌نشیند، و کاشی‌ها با `gap` از هم جدا هستند.
 *
 * ۲) **رقم‌ها یکنواخت نبودند.** وزن ۸۰۰ + اندازهٔ ۲۲px کافی نبود. حالا
 *    وزن ۹۰۰، `font-variant-numeric: tabular-nums` صریح، `letter-spacing`
 *    منفیِ ملایم (−۰٫۰۲em) و اندازهٔ `clamp(24px, 5.2vw, 34px)` — یعنی در
 *    موبایل بزرگ و خوانا، در دسکتاپ بزرگ‌تر ولی نه غول.
 *
 * ۳) **کاشی روز بی‌ربط بود.** «روز» پس‌زمینهٔ رنگ‌دار داشت و مثل یک
 *    تبلیغ جدا می‌افتاد. حالا هر چهار کاشی یک خانواده‌اند و تفکیک با
 *    **وزن و رنگِ برچسب** انجام می‌شود، نه با جعبهٔ رنگیِ متفاوت.
 *
 * ── چرا فونت عوض نشد؟ ─────────────────────────────────────────────────────
 * وزیرمتن قانونِ هویت بصری پروژه است. «جذابیتِ فونتِ اعداد» با وزن،
 * `tabular-nums`، فاصلهٔ حروف و کاشی‌بندی حل شد — نه با یک فونت لاتینِ
 * عددی که کل صفحه را غیرفارسی نشان می‌داد.
 *
 * ── تیکِ هر رقم ────────────────────────────────────────────────────────────
 * فقط رقمی که واقعاً عوض شده، یک پرش کوتاه می‌گیرد (`key` روی همان رقم).
 * نسخهٔ قبل کلِ واحد را دوباره mount می‌کرد و تایمر «می‌لرزید».
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `role="timer"` + `aria-live="off"` (اعلام هر ثانیه، صفحه‌خوان را قطع
 * می‌کند) + یک `sr-only` با کل مدت. برچسبِ هر کاشی هم `sr-only` است، پس
 * «۴۲» تنها خوانده نمی‌شود، «۴۲ ثانیه» خوانده می‌شود.
 */
export function Countdown({
  targetSeconds,
  label,
  variant = "light",
  tone = "upcoming",
  endMessage,
}: {
  targetSeconds: number;
  label: string;
  variant?: "dark" | "light";
  /** «upcoming» = تا شروع؛ «open» = تا پایان */
  tone?: "upcoming" | "open";
  /** پیام جایگزین وقتی تایمر صفر شد */
  endMessage?: string;
}) {
  const mountedAt = useRef<number | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, targetSeconds));
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    mountedAt.current = Date.now();
    const deadline = mountedAt.current + Math.max(0, targetSeconds) * 1000;
    const tick = () => {
      setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    // تب پنهان ⇒ تیک متوقف می‌شود؛ با بازگشت، مقدار فوراً همگام می‌شود.
    if (!visible) return;
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [targetSeconds, visible]);

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const isDark = variant === "dark";
  const finished = left <= 0;

  const accent = tone === "upcoming" ? "gold" : "verde";

  if (finished) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 ${
          isDark
            ? "border-white/12 bg-white/[0.06] text-white"
            : "border-border bg-surface text-text"
        }`}
      >
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full ${
            isDark ? "bg-verde/15 text-verde" : "bg-verde-soft text-verde"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            aria-hidden="true"
          >
            <path d="M5 12.5 10 17l9-9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[12.5px] font-extrabold">
          {endMessage ?? "زمان این مرحله به پایان رسید"}
        </span>
      </div>
    );
  }

  const units: { value: number; label: string; pad: number }[] = [
    { value: d, label: "روز", pad: d > 99 ? 3 : 2 },
    { value: h, label: "ساعت", pad: 2 },
    { value: m, label: "دقیقه", pad: 2 },
    { value: s, label: "ثانیه", pad: 2 },
  ];

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className="inline-flex max-w-full items-stretch"
      data-variant={variant}
      data-tone={tone}
    >
      <div
        className={`flex items-stretch gap-1.5 rounded-[18px] border p-1.5 sm:gap-2 sm:rounded-[20px] sm:p-2 ${
          isDark
            ? "border-white/10 bg-white/[0.05] shadow-[inset_0_1px_0_oklch(100%_0_0/0.07)]"
            : "border-border/90 bg-surface-2/60 shadow-[inset_0_1px_0_oklch(100%_0_0/0.8),0_10px_30px_-24px_oklch(28%_0.06_260/0.8)]"
        }`}
      >
        {units.map((u, index) => {
          const text = toFa(String(u.value).padStart(u.pad, "0"));
          const isLead = index === 0;
          return (
            <span
              key={u.label}
              className={`relative flex min-w-[3.1rem] flex-col items-center justify-center rounded-[13px] px-2 pt-2 pb-1.5 sm:min-w-[3.55rem] sm:rounded-[15px] ${
                isDark
                  ? isLead
                    ? "bg-white/[0.09]"
                    : "bg-white/[0.045]"
                  : isLead
                    ? "bg-gold-soft/70"
                    : "bg-surface"
              } ${
                !isDark && !isLead
                  ? "shadow-[inset_0_0_0_1px_oklch(88%_0.016_252/0.9)]"
                  : isLead
                    ? ""
                    : "shadow-[inset_0_0_0_1px_oklch(100%_0_0/0.08)]"
              }`}
            >
              {/* خطِ طلاییِ بالای کاشی — همیشه، برای خواندنِ سطرِ رقم‌ها */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 top-0 h-px ${
                  isLead
                    ? accent === "gold"
                      ? "bg-gold/70"
                      : "bg-verde/60"
                    : isDark
                      ? "bg-white/12"
                      : "bg-border-strong/40"
                }`}
              />
              <span className="sr-only">{u.label}</span>
              <Digit value={text} isLead={isLead} isDark={isDark} animate={!reduced} />
              <span
                className={`mt-0.5 text-[9.5px] font-bold tracking-wide ${
                  isDark
                    ? "text-on-stage-muted"
                    : isLead
                      ? accent === "gold"
                        ? "text-gold-strong"
                        : "text-verde"
                      : "text-text-subtle"
                }`}
                aria-hidden="true"
              >
                {u.label}
              </span>
            </span>
          );
        })}
      </div>
      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}

/**
 * یک کاشیِ رقم.
 *
 * چرا جدا شد؟ چون `key` روی هر رقم باعث می‌شود فقط همان رقم دوباره
 * mount شود و انیمیشن بگیرد؛ اگر `key` روی کل کاشی بود، برچسب واحد هم
 * می‌پرید.
 */
function Digit({
  value,
  isLead,
  isDark,
  animate,
}: {
  value: string;
  isLead: boolean;
  isDark: boolean;
  animate: boolean;
}) {
  const color = isDark ? "text-white" : isLead ? "text-text" : "text-text";
  return (
    <span
      className={`k185-num text-[clamp(24px,5.4vw,33px)] leading-[1.05] font-black tabular-nums ${color}`}
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
    >
      {Array.from({ length: value.length }, (_, i) => value.charAt(i)).map((ch, i) => (
        <span key={`${i}-${ch}`} className={animate ? "k185-digit-in" : undefined}>
          {ch}
        </span>
      ))}
    </span>
  );
}
