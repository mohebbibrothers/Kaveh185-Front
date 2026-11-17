"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * کلید تم — «سه‌حالتهٔ لغزنده» به سبک سایت مهدیه.
 *
 * ── چه چیزی عوض شد؟ (نکتهٔ ۶ کاربر) ──────────────────────────────────────
 * نسخهٔ قبل یک دکمهٔ مربعی با آیکونِ متغیر بود: کاربر نمی‌دانست با کلیک
 * بعدی چه می‌شود و کدام حالت فعال است. حالا یک **کپسول سه‌خانه‌ای** است
 * که هر سه حالت را همیشه نشان می‌دهد و یک **گویِ لغزنده** زیر حالتِ فعال
 * حرکت می‌کند — همان زبانی که در سایت مهدیه دید و پسندید.
 *
 * ── چرا هنوز فقط یک `<button>` واقعی؟ ──────────────────────────────────
 * اگر هر خانه یک دکمهٔ جدا باشد، صفحه‌خوان سه دکمه می‌شنود و کاربر با
 * Tab سه بار گیر می‌کند؛ و چیدمانِ `left` در RTL می‌شکند. پس:
 *   • یک `<button>` نامرئی روی کل کپسول (`inset-0`).
 *   • سه `<span aria-hidden>` برای دیدن.
 *   • گویِ لغزنده با `insetInlineStart` (نه `left`) تا در RTL درست بچرخد.
 *   • چرخهٔ کلیک: خودکار → روز → شب → خودکار.
 *
 * ⚠️ `mode` می‌تواند `null` باشد تا تایمر mount. هر زنجیرهٔ حالت **باید**
 * با `current ?? "auto"` نرمال کند؛ وگرنه اولین کلیک هیچ کاری نمی‌کند
 * (باگی که در نسخهٔ قبل تستِ CI را انداخت).
 */
const STORAGE_KEY = "k185-theme";
type Mode = "auto" | "light" | "dark";

const ORDER: readonly Mode[] = ["auto", "light", "dark"] as const;

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
    /* حالت خصوصی مرورگر — بی‌صدا نادیده بگیر */
  }
  return "auto";
}

const LABELS: Record<Mode, string> = {
  auto: "خودکار",
  light: "روز",
  dark: "شب",
};

const FULL_LABELS: Record<Mode, string> = {
  auto: "تم: خودکار (هماهنگ با سیستم)",
  light: "تم: روز",
  dark: "تم: شب",
};

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    // macrotask: قانون lint پروژه هر setState همگام داخل effect را رد می‌کند.
    const id = window.setTimeout(() => {
      setMode(readMode());
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const cycle = useCallback(() => {
    setMode((current) => {
      const normalized: Mode = current ?? "auto";
      const next = ORDER[(ORDER.indexOf(normalized) + 1) % ORDER.length] as Mode;
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

  const active: Mode = mode ?? "auto";
  const activeIndex = ORDER.indexOf(active);
  const label = FULL_LABELS[active];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${label} — برای تغییر کلیک کنید`}
      title={label}
      data-mode={active}
      className={`k185-theme group border-border-strong/70 bg-surface-2/80 hover:border-brand/45 focus-visible:ring-focus/60 relative isolate inline-flex shrink-0 items-center rounded-full border p-[3px] transition-colors focus-visible:ring-2 focus-visible:outline-none ${
        compact ? "" : "gap-0"
      }`}
    >
      {/* گویِ لغزنده — پشتِ سه خانه، با انتقال نرم */}
      <span
        aria-hidden="true"
        className="k185-theme-thumb bg-surface ring-border/70 absolute inset-y-[3px] w-[calc((100%-6px)/3)] rounded-full shadow-[0_1px_2px_oklch(24%_0.04_260/0.18),0_6px_14px_-8px_oklch(24%_0.04_260/0.4)] ring-1 transition-[inset-inline-start] duration-[320ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ insetInlineStart: `calc(3px + ${activeIndex} * ((100% - 6px) / 3))` }}
      />

      {ORDER.map((m) => (
        <span
          key={m}
          aria-hidden="true"
          className={`relative z-10 grid place-items-center rounded-full transition-colors ${
            compact ? "size-[26px]" : "h-[26px] w-[34px]"
          } ${active === m ? "text-brand" : "text-text-subtle group-hover:text-text-muted"}`}
        >
          <ThemeIcon mode={m} />
          {compact ? null : <span className="mt-0.5 text-[10px] font-bold">{LABELS[m]}</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** آیکونِ هر حالت — ساده، ۱۶px، با `currentColor`. */
function ThemeIcon({ mode }: { mode: Mode }) {
  if (mode === "light") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M20.3 14.6A8.8 8.8 0 0 1 9.4 3.7 8.8 8.8 0 1 0 20.3 14.6Z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M12 3.2v17.6" opacity=".5" />
      <path d="M12 3.2a8.8 8.8 0 0 1 0 17.6Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="8.8" />
    </svg>
  );
}
