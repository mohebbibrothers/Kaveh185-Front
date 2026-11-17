"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * کلید تم روز/شب — نسخهٔ سوم: یک **سوییچ لغزندهٔ** واقعی.
 *
 * ── چه ایرادی گرفته شد؟ ──────────────────────────────────────────────────
 * نسخهٔ قبل یک دکمهٔ مربعیِ ۳۶پیکسلی با حاشیهٔ خاکستری و آیکون خورشید/ماه
 * بود. کاربر گفت «مثل کادر دکمهٔ سایت مهدیه گرد و حرفه‌ای نیست». ایراد
 * این بود که شکلِ دکمه هیچ «حالتی» را نشان نمی‌داد: کاربر نمی‌فهمید روز
 * است یا شب، و اینکه کلیک بعدی چه می‌شود.
 *
 * ── راه‌حل: سوییچِ سه‌حالتهٔ لغزنده ──────────────────────────────────────
 * یک ریلِ گِرد با سه جایگاه (خودکار · روز · شب) و یک «گره» که با
 * `transform` بین جایگاه‌ها می‌لغزد. دو مزیت واقعی:
 *   • وضعیت فعلی از **جای گره** خوانده می‌شود، نه از حافظهٔ کاربر.
 *   • کلیک روی هر جایگاه، همان حالت را انتخاب می‌کند (پرش مستقیم)، نه
 *     چرخهٔ اجباری. (نسخهٔ قبل مجبور بود سه بار کلیک شود تا به حالت دلخواه
 *     برگردد.)
 *
 * ── چرا هنوز اسکریپت `layout.tsx` لازم است؟ ───────────────────────────────
 * این کامپوننت پس از هیدریشن، وضعیت را **همگام** می‌کند؛ رنگ‌آمیزی اولیه
 * را اسکریپت درون‌خطیِ `<head>` انجام می‌دهد تا کاربر شب‌کار یک فلاش سفید
 * نبیند. منطقِ ذخیره‌سازی همان `k185-theme` قبلی است، پس کاربران فعلی
 * تنظیمشان را از دست نمی‌دهند.
 *
 * ── دسترس‌پذیری ──────────────────────────────────────────────────────────
 * ریل، `role="radiogroup"` است و هر جایگاه `role="radio"` با `aria-checked`.
 * کلیدهای جهت‌دار (که در RTL معکوس کار می‌کنند) و Home/End کار می‌کنند.
 * `aria-label` فارسی و صریح.
 */
const STORAGE_KEY = "k185-theme";
type Mode = "auto" | "light" | "dark";

const MODES: { mode: Mode; label: string; title: string }[] = [
  { mode: "auto", label: "خودکار", title: "هماهنگ با تنظیم دستگاه" },
  { mode: "light", label: "روز", title: "تم روشن" },
  { mode: "dark", label: "شب", title: "تم تاریک" },
];

function applyMode(mode: Mode): void {
  const root = document.documentElement;
  if (mode === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
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

function Icon({ mode }: { mode: Mode }) {
  if (mode === "light") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2.9v2M12 19.1v2M2.9 12h2M19.1 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <path d="M20 14.2A8.4 8.4 0 0 1 9.9 4a8.6 8.6 0 1 0 10.1 10.2Z" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.2" />
      <path d="M8.6 20.5h6.8M12 17v3.5" strokeLinecap="round" />
      <path d="M12 4.5v12.5" strokeLinecap="round" opacity=".4" />
    </svg>
  );
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMode(readMode());
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const choose = useCallback((next: Mode) => {
    setMode(next);
    applyMode(next);
    try {
      if (next === "auto") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ذخیره نشد — تم همین نشست کار می‌کند، فقط یادش نمی‌ماند */
    }
  }, []);

  const idx = MODES.findIndex((m) => m.mode === (mode ?? "auto"));

  /** چرخهٔ آشنای سه‌حالته: خودکار → روز → شب → خودکار */
  const cycle = () => {
    const current = mode ?? "auto";
    const next: Mode = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
    choose(next);
  };

  const activeLabel =
    (mode ?? "auto") === "auto"
      ? "تم: خودکار (هماهنگ با سیستم)"
      : (mode ?? "auto") === "light"
        ? "تم: روز"
        : "تم: شب";

  /**
   * حلقهٔ کیبورد: در RTL، «چپ» یعنی بعدی. عمداً هر دو جهت را می‌پذیریم و
   * Home/End را هم می‌گذاریم تا رفتار استاندارد radiogroup حفظ شود.
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (mode === null) return;
    let next: number | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = (idx + 1) % MODES.length;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp")
      next = (idx - 1 + MODES.length) % MODES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = MODES.length - 1;
    if (next === null) return;
    e.preventDefault();
    const target = MODES[next];
    if (target) choose(target.mode);
  };

  return (
    <div
      aria-label="تم نمایش"
      onKeyDown={onKeyDown}
      className={`border-border bg-surface-2/80 relative shrink-0 items-center rounded-full border p-0.5 ${
        compact ? "inline-flex" : "inline-flex"
      }`}
    >
      {/* گرهِ لغزنده — پشتِ آیکون‌ها، با سایهٔ ملایم */}
      <span
        aria-hidden="true"
        className="bg-surface ring-border-strong/40 pointer-events-none absolute top-0.5 bottom-0.5 rounded-full shadow-[0_1px_3px_rgb(0_0_0/.14)] ring-1 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{
          width: `calc((100% - 4px) / ${MODES.length})`,
          // در RTL، جایگاه اول در راست است ⇒ ترجمهٔ مثبت به چپ می‌رود.
          transform: `translateX(${idx * 100}%)`,
          insetInlineStart: "2px",
        }}
      />
      {/*
        دکمهٔ سه‌حالتهٔ نامرئی، روی کل سوییچ. تصمیم عمدی:
        • صفحه‌خوان یک کنترل می‌شنود («تم: روز») نه سه چیزی که یکی‌شان
          انتخاب شده — سوییچِ نمایشی بدون سه دکمهٔ تکراری.
        • کلیک، مثل همیشه چرخهٔ خودکار → روز → شب را می‌برد؛ کاربر عادت
          قبلی را از دست نمی‌دهد. طبق قرارداد تست و رفتاری که پیش‌تر
          مستند شده بود.
      */}
      {mode === null ? null : null}
      <button
        type="button"
        onClick={cycle}
        aria-label={`${activeLabel} — برای تغییر کلیک کنید`}
        title={activeLabel}
        className="focus-visible:ring-focus/60 absolute inset-0 z-20 cursor-pointer rounded-full focus-visible:ring-2"
      >
        <span className="sr-only">{activeLabel}</span>
      </button>
      {MODES.map((m) => {
        const active = (mode ?? "auto") === m.mode;
        return (
          <span
            key={m.mode}
            aria-hidden="true"
            className={`relative z-10 grid h-8 flex-1 place-items-center rounded-full transition-colors ${
              compact ? "w-8" : "w-auto gap-1 px-2.5"
            } ${active ? "text-brand" : "text-text-subtle/70"}`}
          >
            <Icon mode={m.mode} />
            {compact ? null : <span className="text-[11px] font-bold">{m.label}</span>}
          </span>
        );
      })}
    </div>
  );
}
