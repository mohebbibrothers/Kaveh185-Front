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

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${label} — برای تغییر کلیک کنید`}
      title={label}
      className={`border-border-strong text-text-muted hover:bg-surface-2 hover:text-text focus-visible:ring-focus/60 grid shrink-0 place-items-center rounded-md border transition-colors focus-visible:ring-2 ${
        compact ? "size-9" : "h-9 gap-2 px-3"
      }`}
    >
      {/* آیکون: خورشید / ماه / خودکار. تا هیدریشن، جای خالی با همان ابعاد
          تا چیدمان نپرد. */}
      <span aria-hidden="true" className="grid size-[18px] place-items-center">
        {mode === null ? null : mode === "light" ? (
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="12" cy="12" r="4.2" />
            <path
              d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : mode === "dark" ? (
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2Z"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <rect x="3" y="5" width="18" height="12.5" rx="2" />
            <path d="M8.5 21h7" strokeLinecap="round" />
            <path d="M12 17.5V21" strokeLinecap="round" />
            {/* نیمهٔ روشن/تیره — نماد «هماهنگ با سیستم» */}
            <path d="M12 5v12.5" strokeLinecap="round" opacity=".45" />
          </svg>
        )}
      </span>
      {compact ? null : <span className="text-[12px] font-bold">{label}</span>}
    </button>
  );
}
