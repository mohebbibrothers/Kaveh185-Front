"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MosqueMark, Girih } from "@/shared/ui/Ornament";
import { toSearch } from "@/shared/lib/fa";

/**
 * انتخابِ مسجد — یک comboboxِ واقعی، نه یک `<ul>`ِ بلند داخلِ صفحه.
 *
 * ══ چه چیزی خراب بود؟ ════════════════════════════════════════════════════
 * نسخهٔ قبل یک فهرستِ همیشه‌باز با `divide-y` و اسکرول‌بارِ مرورگر بود؛ با
 * ۱۷ مسجد، فرم را به یک ستونِ بلندِ خاکستری تبدیل می‌کرد که با زبانِ بصریِ
 * سایت (کارت‌های نرم، هالهٔ برند، نشانِ گرافیکیِ مسجد) هم‌خوان نبود.
 *
 * ══ چه چیزی ساخته شد ═════════════════════════════════════════════════════
 *   • **بسته تا وقتی لازم است:** فهرست فقط با کلیک/فوکوس باز می‌شود و با
 *     انتخاب یا `Escape` بسته می‌شود؛ فرم کوتاه می‌ماند.
 *   • **جست‌وجوی زنده** روی نام، محله و کدِ مسجد (نرمال‌سازیِ فارسی، پس
 *     «مهدي» و «مهدی» یکی‌اند و «ي»/«ی» فرقی نمی‌کند).
 *   • **ناوبریِ کامل با کیبورد:** ↑/↓ در فهرست، `Enter` انتخاب، `Escape`
 *     بستن، `Tab` خروج — یعنی برای کاربرِ کیبورد هم درست کار می‌کند، نه
 *     فقط برای ماوس.
 *   • **دسترسی‌پذیریِ درست:** `role="combobox"` با `aria-expanded`,
 *     `aria-controls`, `aria-activedescendant` و `role="option"` با
 *     `aria-selected` — چیزی که `<div>`های کلیک‌پذیر قبلی نداشتند.
 *   • **بصریِ هم‌خانوادهٔ سایت:** هالهٔ برند، نشانِ `MosqueMark`، ردیف‌های
 *     کارتی با `ring` روی گزینهٔ فعال، و اسکرول‌بارِ نازکِ اختصاصی
 *     (`.k185-thin-scroll`) که با پالتِ سایت هم‌رنگ است — نه نوارِ خاکستریِ
 *     پیش‌فرضِ ویندوز.
 *   • **پس از انتخاب:** یک کارتِ «تأیید» با نشانِ مسجد، محله، کد و دکمهٔ
 *     «تغییر» — کاربر می‌بیند چه چیزی ثبت خواهد شد.
 */

export type MosqueOption = {
  id: number;
  code: string;
  name: string;
  neighborhood: string;
  display_order?: number;
};

export function MosquePicker({
  mosques,
  value,
  onChange,
  loading,
  failed,
  error,
}: {
  mosques: MosqueOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  loading?: boolean;
  failed?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optId = (id: number) => `${listId}-opt-${String(id)}`;

  const filtered = useMemo(() => {
    const q = toSearch(query);
    if (!q) return mosques;
    return mosques.filter((m) => toSearch(`${m.name} ${m.neighborhood} ${m.code}`).includes(q));
  }, [mosques, query]);

  // با هر تغییرِ جست‌وجو، مکان‌نما روی اولین نتیجه برمی‌گردد.
  useEffect(() => {
    setCursor(0);
  }, [query]);

  // بستن با کلیکِ بیرون — ولی نه با کلیکِ داخلِ خودِ کامپوننت.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const selected = mosques.find((m) => m.id === value) ?? null;

  function choose(m: MosqueOption) {
    onChange(m.id);
    setOpen(false);
    setQuery("");
    // فوکوس به دکمهٔ «تغییر» می‌رود تا کاربرِ کیبورد جای خودش را گم نکند.
    window.setTimeout(() => {
      rootRef.current?.querySelector<HTMLButtonElement>("[data-change]")?.focus();
    }, 0);
  }

  /*
   * کیبورد. نکتهٔ ظریف: `open` در همان رویداد به‌روز نمی‌شود (state در
   * بستهٔ بعدی می‌نشیند)، پس «آیا فهرست باز است؟» را از یک ref می‌خوانیم —
   * وگرنه اولین `Enter` بعد از باز شدن، به‌جای انتخاب، دوباره «باز کن»
   * اجرا می‌کرد.
   */
  const openRef = useRef(false);
  openRef.current = open;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!openRef.current) {
        setOpen(true);
        return;
      }
      if (filtered.length === 0) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setCursor((c) => (c + delta + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      if (!openRef.current) {
        setOpen(true);
        e.preventDefault();
        return;
      }
      const pick = filtered[cursor];
      if (pick) {
        e.preventDefault();
        choose(pick);
      }
      return;
    }
    if (e.key === "Escape") {
      if (openRef.current) {
        e.preventDefault();
        setOpen(false);
      }
      return;
    }
    if (e.key === "Tab") {
      // خروجِ طبیعی: فهرست را می‌بندیم تا فوکوس روی چیزِ نامرئی نماند.
      setOpen(false);
    }
  }

  // ── حالتِ انتخاب‌شده ────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="border-brand/25 from-brand/[0.07] to-surface flex items-center gap-3 rounded-2xl border bg-gradient-to-l px-3.5 py-3">
        <MosqueMark name={selected.name} order={selected.display_order ?? undefined} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-text truncate text-[13px] leading-6 font-extrabold">{selected.name}</p>
          <p className="text-text-subtle mt-0.5 flex items-center gap-1.5 text-[10.5px]">
            <span className="truncate">{selected.neighborhood}</span>
            <span aria-hidden="true">·</span>
            <span dir="ltr" className="font-bold tabular-nums">
              {selected.code}
            </span>
          </p>
        </div>
        <button
          type="button"
          data-change
          onClick={() => {
            onChange(null);
            setOpen(true);
            window.setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          className="border-border-strong text-text hover:bg-surface-2 focus-visible:ring-focus/40 inline-flex h-9 shrink-0 items-center rounded-lg border px-3 text-[11.5px] font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          تغییر
        </button>
      </div>
    );
  }

  // ── حالتِ جست‌وجو/انتخاب ────────────────────────────────────────────────
  return (
    <div ref={rootRef} className="relative">
      <div
        className={`border-border-strong bg-surface flex items-center gap-2 rounded-xl border transition-shadow ${
          open ? "border-brand/55 ring-brand/15 ring-2" : ""
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="text-text-subtle ms-3 shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[cursor] ? optId(filtered[cursor]!.id) : undefined}
          aria-label="جست‌وجوی مسجد و انتخاب از فهرست"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={loading ? "در حال دریافت فهرست مساجد…" : "نام مسجد یا محله را بنویسید…"}
          disabled={loading}
          className="text-text placeholder:text-text-subtle h-11 w-full bg-transparent px-1 text-[12.5px] outline-none disabled:opacity-60"
        />
        <span
          className="text-text-subtle me-3 shrink-0 text-[10.5px] tabular-nums"
          aria-hidden="true"
        >
          {open ? `${String(filtered.length)}/${String(mosques.length)}` : ""}
        </span>
      </div>

      {open ? (
        <div className="border-border bg-surface absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border shadow-[0_18px_40px_-24px_oklch(0%_0_0/0.45)]">
          <div
            id={listId}
            role="listbox"
            aria-label="فهرست مساجد"
            className="k185-thin-scroll max-h-60 overflow-y-auto overscroll-contain p-1.5"
          >
            {failed ? (
              <p className="text-text-muted px-3 py-5 text-center text-[12px]">
                فهرست مساجد خوانده نشد. صفحه را دوباره باز کنید.
              </p>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-5 text-center">
                <Girih size={18} className="text-text-subtle mx-auto" />
                <p className="text-text-muted mt-2 text-[12px]">مسجدی با این نام پیدا نشد.</p>
                <p className="text-text-subtle mt-1 text-[10.5px]">
                  محله را جست‌وجو کنید یا «مسجد» را پاک کنید.
                </p>
              </div>
            ) : (
              filtered.map((m, i) => (
                <button
                  key={m.id}
                  id={optId(m.id)}
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  onMouseEnter={() => {
                    setCursor(i);
                  }}
                  onClick={() => {
                    choose(m);
                  }}
                  className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right transition-colors last:mb-0 ${
                    i === cursor ? "bg-brand/[0.09] ring-brand/25 ring-1" : "hover:bg-surface-2"
                  }`}
                >
                  <MosqueMark name={m.name} order={m.display_order ?? undefined} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="text-text block truncate text-[12.5px] font-bold">
                      {m.name}
                    </span>
                    <span className="text-text-subtle mt-0.5 flex items-center gap-1.5 text-[10.5px]">
                      <span className="truncate">{m.neighborhood}</span>
                      <span aria-hidden="true">·</span>
                      <span dir="ltr" className="tabular-nums">
                        {m.code}
                      </span>
                    </span>
                  </span>
                  {i === cursor ? (
                    <span aria-hidden="true" className="text-brand shrink-0 text-[11px]">
                      ↵
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
          <div className="border-border bg-surface-2/70 text-text-subtle flex items-center justify-between border-t px-3 py-1.5 text-[10px]">
            <span>↑ ↓ جابه‌جایی · Enter انتخاب · Esc بستن</span>
            <span dir="ltr">Esc</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-brick mt-1.5 flex items-start gap-1 text-[11.5px]">
          <span aria-hidden="true">▲</span>
          {error}
        </p>
      ) : (
        <p className="text-text-subtle mt-1.5 text-[11px] leading-5">
          بعد از ثبت‌نام، مسجد انتخابی قفل می‌شود؛ نتیجهٔ آزمون به نام همین مسجد ثبت خواهد شد.
        </p>
      )}
    </div>
  );
}
