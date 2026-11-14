"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";

/**
 * شمارش معکوس سمت کلاینت با مبنای «زمان سرور».
 *
 * چرا این‌طور؟ اگر فقط از Date.now() استفاده کنیم، ساعتِ غلطِ گوشی کاربر
 * تایمر را خراب می‌کند. بک‌اند `server_time` و `seconds_until_*` می‌دهد؛
 * ما ساعت سرور را با اختلافِ لحظهٔ دریافت تصحیح می‌کنیم و از آن به بعد با
 * requestAnimationFrame (با گام ۱ ثانیه) شمارش می‌کنیم.
 */
export function Countdown({
  targetSeconds,
  label,
  variant = "dark",
}: {
  /** ثانیه‌های باقی‌مانده در لحظهٔ رندر سرور */
  targetSeconds: number;
  label: string;
  variant?: "dark" | "light";
}) {
  // مبدأ: لحظهٔ mount. اولین tick بلافاصله اجرا و سپس هر ثانیه تکرار می‌شود،
  // بنابراین «۵۹/۵۹» ناشی از تأخیر هیدریشن هرگز به چشم نمی‌آید.
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

  const cell =
    variant === "dark"
      ? "bg-white/[0.07] border border-white/[0.14] text-white backdrop-blur-sm"
      : "bg-surface-2 border border-border text-text";
  const numCls = "text-[clamp(19px,2.6vw,27px)] font-extrabold leading-none tabular-nums";
  const labCls =
    variant === "dark"
      ? "mt-1 text-[10.5px] font-medium text-white/70"
      : "mt-1 text-[10.5px] font-medium text-text-subtle";

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className="flex gap-2"
    >
      {[
        { v: d, l: "روز" },
        { v: h, l: "ساعت" },
        { v: m, l: "دقیقه" },
        { v: s, l: "ثانیه" },
      ].map(({ v, l }) => (
        <div key={l} className={`flex-1 rounded-lg px-1 py-2.5 text-center ${cell}`}>
          <div className={numCls}>{toFa(String(v).padStart(2, "0"))}</div>
          <div className={labCls}>{l}</div>
        </div>
      ))}
      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}
