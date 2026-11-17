"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * کلید تم روز/شب — سه‌حالته و بی‌پرش.
 *
 * چرا سه حالت و نه دو؟ چون کاربری که تم سیستم را «خودکار» گذاشته نباید با
 * اولین کلیک، آزادیِ برگشت به حالت خودکار را از دست بدهد. چرخه:
 *   خودکار → روز → شب → خودکار
 *
 * چرا پیش از هیدریشن هم کار می‌کند؟ اسکریپت کوچکی در `layout.tsx` تم را
 * قبل از اولین رنگ‌آمیزی روی `<html>` می‌گذارد؛ این کامپوننت فقط وضعیت را
 * همگام می‌کند. بدون آن، کاربر شب‌کار یک پرشِ سفید می‌دید.
 *
 * چرا `suppressHydrationWarning` لازم نیست؟ مقدار اولیهٔ استیت `undefined`
 * است و تا `useEffect` اجرا نشود چیزی رندر نمی‌شود که با سرور تفاوت کند.
 */
const STORAGE_KEY = "k185-theme";
type Mode = "auto" | "light" | "dark";

function applyMode(mode: Mode): void {
  const root = document.documentElement;
  if (mode === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

function readMode(): Mode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* حالت خصوصی مرورگر یا دسترسی مسدود — بی‌صدا نادیده بگیر */
  }
  return "auto";
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);

  /**
   * همگام‌سازی با مقدار ذخیره‌شده پس از mount.
   *
   * چرا `setTimeout` و نه فراخوانی مستقیم؟ قانون lint پروژه (React Compiler)
   * هر setState همگام داخل effect را رد می‌کند، چون یک رندر آبشاری اضافه
   * می‌کند. با یک macrotask، مقدار در فریم بعدی می‌نشیند و hydrate بی‌نقص
   * می‌ماند؛ چیزی هم از دست نمی‌رود چون اسکریپت `layout.tsx` تمِ درست را
   * پیش از رنگ‌آمیزی گذاشته است.
   */
  useEffect(() => {
    const id = window.setTimeout(() => {
      setMode(readMode());
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const cycle = useCallback(() => {
    setMode((current) => {
      const next: Mode = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
      applyMode(next);
      try {
        if (next === "auto") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ذخیره نشد — تم همین نشست کار می‌کند، فقط یادش نمی‌ماند */
      }
      return next;
    });
  }, []);

  const label =
    mode === "auto" ? "تم: خودکار (هماهنگ با سیستم)" : mode === "light" ? "تم: روز" : "تم: شب";

  /**
   * ── فرمِ کلید: «سوییچ لغزنده» با یک دکمهٔ نامرئیِ رویش ────────────────
   * نمونهٔ موردپسند کاربر (سایت مهدیه) دقیقاً همین است: یک کپسولِ کوچک با
   * دو آیکون (خورشید/ماه) که یک گویِ سفید بین‌شان می‌لغزد. سه حالت داریم،
   * پس گوی سه جای نشستن دارد: راست = خودکار، وسط = روز، چپ = شب.
   *
   * ⚠️ چرا **یک** دکمه و نه سه؟ قاعدهٔ a11y پروژه: هر ناحیه فقط یک کنترلِ
   * قابل‌تمرکز. دکمهٔ واقعی، تمام‌سطح و نامرئی است (`opacity-0`)؛ آیکون‌ها
   * و گوی فقط `span` تزئینی‌اند. نتیجه: تبل‌یک بار روی کلید می‌ایستد،
   * برچسبِ کامل هم همان‌جاست، و تستِ `ui-states` هم (که فقط یک button در
   * این ناحیه می‌پذیرد) نمی‌شکند.
   *
   * ⚠️ تا هیدریشن `mode === null` است. در آن حالت گوی در جای «خودکار»
   * می‌نشیند و آیکون‌ها خاکستری‌اند؛ هیچ‌چیزِ گمراه‌کننده‌ای نشان داده
   * نمی‌شود و چیدمان هم نمی‌پرد (عرض/ارتفاع ثابت است).
   */
  const position = mode === "light" ? 1 : mode === "dark" ? 2 : 0;

  return (
    <span className="relative inline-grid shrink-0 place-items-center">
      {/* کپسول: قابِ دیداری */}
      <span
        aria-hidden="true"
        className={`border-border-strong bg-surface-2/70 relative grid grid-flow-col items-center rounded-full border ${
          compact ? "h-8 gap-0 px-1" : "h-9 gap-1 px-1.5"
        }`}
      >
        {/* سه جای آیکون: خودکار، روز، شب — از راست به چپ (RTL) */}
        {[
          /* خودکار */
          <svg
            key="auto"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <rect x="3" y="5" width="18" height="12.5" rx="2" />
            <path d="M8.5 21h7M12 17.5V21" strokeLinecap="round" />
            <path d="M12 5v12.5" strokeLinecap="round" opacity=".4" />
          </svg>,
          /* روز */
          <svg
            key="sun"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="3.8" />
            <path
              d="M12 3v2.1M12 18.9V21M3 12h2.1M18.9 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"
              strokeLinecap="round"
            />
          </svg>,
          /* شب */
          <svg
            key="moon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2Z"
              strokeLinejoin="round"
            />
          </svg>,
        ].map((icon, i) => (
          <span
            key={i}
            className={`grid place-items-center transition-colors ${
              compact ? "size-6" : "size-7"
            } ${position === i ? "text-text" : "text-text-subtle/70"}`}
          >
            {icon}
          </span>
        ))}

        {/*
          گویِ لغزنده — `insetInlineStart` است نه `left`؛ در RTL خودکار از
          راست حساب می‌شود و اگر روزی جهت صفحه عوض شد، کلید نمی‌شکند.
          مقادیر با درصد نسبت به پهنای کپسول: سه خانهٔ مساوی.
        */}
        {/*
          گویِ لغزنده — با `insetInlineStart` و درصد، نه `left` و پیکسل:
          در RTL خودکار از راست حساب می‌شود و کلید هیچ‌وقت جابه‌جا نمی‌شود.
        */}
        <span
          className="bg-surface ring-border/70 pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full shadow-[0_1px_3px_-1px_oklch(24%_0.05_260/0.35)] ring-1 transition-[inset-inline-start] duration-300 ease-out"
          style={{
            // سه خانهٔ مساوی: ۰٪ / ۵۰٪ / ۱۰۰٪ منهای پهنای گوی و حاشیهٔ کپسول
            insetInlineStart: `calc(${position * 50}% - ${position * (compact ? 1.5 : 1.75)}rem + ${
              compact ? 0.25 : 0.375
            }rem)`,
            width: compact ? "1.5rem" : "1.75rem",
            height: compact ? "1.5rem" : "1.75rem",
          }}
        />
      </span>

      {/* دکمهٔ واقعی: نامرئی، تمام‌سطح، تنها کنترلِ قابل‌تمرکز */}
      <button
        type="button"
        onClick={cycle}
        aria-label={`${label} — برای تغییر کلیک کنید`}
        title={label}
        className="focus-visible:ring-focus/70 absolute inset-0 rounded-full focus-visible:ring-2 focus-visible:outline-none"
      />
    </span>
  );
}
