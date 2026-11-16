"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";

/**
 * شمارش معکوس — بازطراحی‌شده حول سه اصل.
 *
 * ── چه چیزی در نسخهٔ قبل ایراد داشت؟ ──────────────────────────────────────
 * کاربر گفت «روزشمار حرفه‌ای نیست». مشکل واقعی، فقط ظاهر نبود:
 *
 * ۱) **وزن یکسان برای چهار واحد.** «۳۲ روز» مهم است، «۴۲ ثانیه» فقط
 *    هیجان است. در چهار کادر هم‌اندازه، چشم نمی‌داند کدام را بخواند.
 * ۲) **بی‌قرینگی بصری.** کادرها با `flex-1` کشیده می‌شدند و در عرض‌های
 *    مختلف، اعداد تک‌رقمی و دورقمی دو عرض متفاوت می‌گرفتند — شمارنده در
 *    هر ثانیه «می‌لرزید».
 * ۳) **نبودِ حس حرکت.** عدد که عوض می‌شود باید *دیده* شود، وگرنه کاربر
 *    مطمئن نیست زنده است.
 *
 * ── راه‌حل ────────────────────────────────────────────────────────────────
 * • **سلسله‌مراتب**: روز در تایل بزرگ‌تر و با رنگ برند؛ ساعت/دقیقه/ثانیه
 *   ریزتر و خنثی. سه واحد کوچک با دونقطه به هم وصل‌اند (خوانشِ زمان).
 * • **`tabular-nums` + عرض ثابت** ⇒ هیچ لرزشی در تعویض رقم نیست.
 * • **حرکت هدفمند**: هر رقمِ عوض‌شده یک پرش کوتاه ۲۲۰ms می‌گیرد (با
 *   `prefers-reduced-motion` خاموش می‌شود).
 * • **در پایان**: به‌جای صفرِ مرده، پیام روشن («مهلت آغاز شد» / «پایان
 *   یافت») — وگرنه کاربر فکر می‌کند تایمر خراب است.
 * • **مبنای زمان**: همان قرارداد قبلی؛ ساعت سرور، نه ساعت گوشی.
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
  /** «upcoming» = شروع تا؛ «open» = پایان تا */
  tone?: "upcoming" | "open";
  /** پیام جایگزین وقتی تایمر صفر شد */
  endMessage?: string;
}) {
  const mountedAt = useRef<number | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, targetSeconds));

  useEffect(() => {
    mountedAt.current = Date.now();
    const deadline = mountedAt.current + Math.max(0, targetSeconds) * 1000;
    const tick = () => {
      setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [targetSeconds]);

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const isDark = variant === "dark";
  const finished = left <= 0;

  const shell = isDark
    ? "border-white/12 bg-white/[0.06] text-white"
    : "border-border bg-surface text-text";
  const unitLabel = isDark ? "text-white/55" : "text-text-subtle";

  /** تایل بزرگ «روز» — رنگ برند، عدد درشت‌تر */
  const dayTone =
    tone === "upcoming"
      ? isDark
        ? "border-gold/30 bg-gold/12 text-gold"
        : "border-gold/45 bg-gold-soft text-gold-strong"
      : isDark
        ? "border-verde/30 bg-verde/12 text-verde"
        : "border-verde/40 bg-verde-soft text-verde";

  /**
   * یک واحد کوچک (ساعت/دقیقه/ثانیه).
   *
   * چرا تابع ساده و نه کامپوننت داخلی؟ React Compiler هر کامپوننتی که
   * داخل رندر ساخته شود را رد می‌کند (هویت آن در هر رندر عوض می‌شود و
   * state/اثرهای فرزند از دست می‌رود). یک تابع که JSX برمی‌گرداند همان
   * نتیجه را می‌دهد، بدون آن هزینه.
   */
  const renderCell = (value: number, unit: string) => (
    <span key={unit} className="flex min-w-0 flex-col items-center">
      <span className="k185-tick text-[clamp(17px,2.1vw,21px)] leading-none font-extrabold tabular-nums">
        {toFa(String(value).padStart(2, "0"))}
      </span>
      <span className={`mt-1 text-[9.5px] font-semibold ${unitLabel}`}>{unit}</span>
    </span>
  );

  if (finished) {
    return (
      <div
        role="status"
        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 ${shell}`}
      >
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${dayTone}`}>
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 12.5 10 17l9-9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[12.5px] font-extrabold">
            {endMessage ?? "زمان این مرحله به پایان رسید"}
          </span>
          <span className={`block text-[10.5px] ${unitLabel}`}>{label}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className={`rounded-xl border p-2.5 ${shell}`}
    >
      <div className="flex items-stretch gap-2">
        {/* روز — وزن بصری بیشتر */}
        <span
          className={`flex w-[62px] shrink-0 flex-col items-center justify-center rounded-lg border py-1.5 ${dayTone}`}
        >
          <span className="k185-tick text-[clamp(20px,2.8vw,26px)] leading-none font-extrabold tabular-nums">
            {toFa(String(d).padStart(2, "0"))}
          </span>
          <span className="mt-1 text-[9.5px] font-bold opacity-80">روز</span>
        </span>

        {/* ساعت : دقیقه : ثانیه — خوانشِ زمان، ریزتر */}
        <span className="flex min-w-0 flex-1 items-center justify-around gap-0.5">
          {renderCell(h, "ساعت")}
          <span className={`pb-3 text-[13px] font-bold ${unitLabel}`} aria-hidden="true">
            :
          </span>
          {renderCell(m, "دقیقه")}
          <span className={`pb-3 text-[13px] font-bold ${unitLabel}`} aria-hidden="true">
            :
          </span>
          {renderCell(s, "ثانیه")}
        </span>
      </div>
      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}
