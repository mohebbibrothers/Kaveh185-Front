"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";

/**
 * شمارش معکوس — نسخهٔ سوم، این بار «فشرده و بی‌لرزش».
 *
 * ── چه ایرادی گرفته شد و چه شد؟ ───────────────────────────────────────────
 * کاربر گفت نسخهٔ قبل «گشاد و بدفرم» است. ایراد واقعی سه چیز بود:
 *
 * ۱) **عرضِ بی‌قید.** قاب `flex-1` تا انتهای ستون کشیده می‌شد و یک
 *    شمارندهٔ کوچک، نصف صفحه را می‌گرفت. اکنون قاب `inline-flex` است:
 *    به اندازهٔ محتوای خودش. هیچ فضای مرده‌ای داخلش نمی‌ماند.
 * ۲) **کادر روزِ ۶۲پیکسلی** جدا از بقیه و بی‌ربط. اکنون چهار واحد هم‌خانواده‌اند
 *    با یک سلسله‌مراتب ملایم: روز کمی بزرگ‌تر، ساعت/دقیقه/ثانیه کوچک‌تر —
 *    اما در یک نوارِ یکپارچه با جداکنندهٔ نازک، نه چهار جعبهٔ رقیب.
 * ۳) **پرشِ رقم بدون مهار.** در `clamp`، عرض عدد تغییر می‌کرد و نوار
 *    می‌رقصید. حالا هر خانه `min-w` ثابت دارد + `tabular-nums`.
 *
 * ── نکتهٔ فنی که به‌ظاهر مربوط نیست ولی مهم است ───────────────────────────
 * عدد صفرِ پیشوند («۰۹») عمداً حفظ شده: در فارسی، «۹» و «۰۹» هر دو خوانده
 * می‌شوند، ولی نوارِ ثابت‌عرض با صفر پیشوند، شمارش را قابل‌اسکن می‌کند.
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `role="timer"` + `aria-live="off"` (تغییر هر ثانیه نباید صفحه‌خوان را
 * قطع کند) + یک `sr-only` که کل مدت را یک‌جا می‌گوید.
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

  const shell = isDark ? "border-white/12 bg-white/[0.06] text-white" : "border-border bg-surface";
  const digits = isDark ? "text-white" : "text-text";
  const unitLabel = isDark ? "text-white/55" : "text-text-subtle";
  const lead =
    tone === "upcoming"
      ? isDark
        ? "text-gold"
        : "text-gold-strong"
      : isDark
        ? "text-verde"
        : "text-verde";
  const leadBg =
    tone === "upcoming"
      ? isDark
        ? "bg-gold/10"
        : "bg-gold-soft/70"
      : isDark
        ? "bg-verde/12"
        : "bg-verde-soft/80";

  if (finished) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${shell}`}
      >
        <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${lead} ${leadBg}`}>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
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

  /**
   * یک واحد. `min-w` ثابت مهم‌ترین بخش است: بدون آن، رفتن از «۰۹» به «۱۰»
   * عرض را عوض می‌کند و کل نوار تکان می‌خورد.
   */
  const cell = (value: number, unit: string) => (
    <span className="flex flex-col items-center">
      <span
        className={`k185-tick text-[clamp(18px,2.3vw,22px)] leading-none font-extrabold tabular-nums ${digits}`}
      >
        {toFa(String(value).padStart(2, "0"))}
      </span>
      <span className={`mt-1 text-[9px] font-semibold ${unitLabel}`}>{unit}</span>
    </span>
  );

  const sep = (
    <span
      aria-hidden="true"
      className={`mb-3.5 text-[11px] leading-none font-bold ${unitLabel} opacity-50`}
    >
      :
    </span>
  );

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className={`inline-flex max-w-full items-stretch gap-0 overflow-hidden rounded-xl border ${shell}`}
    >
      {/* روز — با پس‌زمینهٔ رنگ‌دار، تنها واحدی که وزن بصری بیشتر دارد */}
      <span className={`flex flex-col items-center justify-center px-3 py-2 ${leadBg}`}>
        <span
          className={`k185-tick text-[clamp(19px,2.5vw,24px)] leading-none font-extrabold tabular-nums ${lead}`}
        >
          {toFa(String(d).padStart(2, "0"))}
        </span>
        <span className={`mt-1 text-[9px] font-bold ${lead} opacity-80`}>روز</span>
      </span>

      {/* ساعت : دقیقه : ثانیه */}
      <span className="flex items-center gap-2 px-3 py-2">
        {cell(h, "ساعت")}
        {sep}
        {cell(m, "دقیقه")}
        {sep}
        {cell(s, "ثانیه")}
      </span>

      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}
