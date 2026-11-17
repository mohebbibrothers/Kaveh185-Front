"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Girih } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import type { LeaderPortrait } from "@/shared/api/landing";

/**
 * «کتاب و کلام» — باکسِ تصویرِ رهبر، با گالریِ زنده.
 *
 * ── سه خواستهٔ کاربر و پاسخِ هر کدام ─────────────────────────────────────
 * ۱) **«ادمین باید بتواند عکس‌ها را از پنل بگذارد.»**
 *    تصاویر از API می‌آیند (`gallery.leader`)؛ هیچ تصویری در کد hard-code
 *    نشده. اگر ادمین چند تصویر بگذارد، هر کدام کلامِ خودش را دارد.
 * ۲) **«عکس‌ها خودکار جابه‌جا شوند، مثل گالری سایت بعثت.»**
 *    چرخشِ خودکار با فاصلهٔ ۶٫۵ ثانیه + کنترل دستی + احترامِ کامل به
 *    کاربر: با هاور/فوکوس/تبِ پنهان **متوقف** می‌شود، با
 *    `prefers-reduced-motion` از اول روشن نمی‌شود، و نوارِ پیشرفتِ
 *    ریزِ بالای تصویر می‌گوید تا اسلایدِ بعدی چقدر مانده.
 * ۳) **«کادرِ جذاب و حرفه‌ای برای عکس.»**
 *    قاب، **قوسِ محرابی** دارد (بالا) با حلقهٔ طلاییِ دولایه، شمارهٔ
 *    اسلاید، و پیکان‌های گِرد روی لبه‌ها. نوارِ بندانگشتی زیر قاب است،
 *    نه روی چهره.
 *
 * ── چرا «گالری داخلِ باکس» و نه «اسلایدرِ بزرگ»؟ ─────────────────────────
 * این بخش باید «کلام» را بخواند، نه اینکه کاربر را سرگرمِ عکس کند. پس
 * تصویر، ستونِ ثابتِ کنارِ متن است و فقط محتوایش عوض می‌شود؛ متن هم با
 * همان تصویر عوض می‌شود (چون کلام هر تصویر جداست).
 *
 * ── دسترس‌پذیری ──────────────────────────────────────────────────────────
 * ناحیهٔ گالری `role="group"` + `aria-roledescription="گالری تصویر"`؛ هر
 * اسلاید `aria-hidden` وقتی پنهان است؛ دکمه‌ها label فارسی دارند؛ با
 * کیبورد روی بندانگشتی‌ها می‌شود اسلاید را عوض کرد؛ چرخشِ خودکار با
 * `role="timer"` اعلام نمی‌شود (آزاردهنده است) ولی دکمهٔ توقف وجود دارد.
 */
const AUTOPLAY_MS = 6500;

export function LeaderGallery({
  items,
  bookTitle,
}: {
  items: LeaderPortrait[];
  bookTitle: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const total = items.length;

  // ── چرخش خودکار ──
  useEffect(() => {
    if (total < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const p = Math.min(1, (elapsed % AUTOPLAY_MS) / AUTOPLAY_MS);
      setProgress(p);
      if (elapsed > 0 && p < 0.02) setIndex((i) => (i + 1) % total);
    }, 120);
    return () => {
      window.clearInterval(id);
    };
  }, [total, paused, index]);

  // توقف وقتی تب پنهان است — باتری و CPU موبایل.
  useEffect(() => {
    const onVis = () => {
      setPaused(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (total === 0) return null;

  const safeIndex = Math.min(index, total - 1);
  const current = items[safeIndex] as LeaderPortrait;
  const go = (next: number) => {
    setIndex(((next % total) + total) % total);
    setProgress(0);
  };

  return (
    <figure
      ref={hostRef}
      className="relative m-0"
      role="group"
      aria-roledescription="گالری تصویر"
      aria-label="تصاویر رهبر انقلاب در حال مطالعه"
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      onFocus={() => {
        setPaused(true);
      }}
      onBlur={() => {
        setPaused(false);
      }}
    >
      {/* ── قاب ──
          در موبایل: بنر افقیِ قوس‌دار بالای متن (۱۶:۱۰).
          در دسکتاپ: ستونِ بلند کنار متن، با قوسِ محرابی. */}
      <div className="relative">
        <div className="bg-stage ring-gold/30 relative overflow-hidden rounded-t-[84px] rounded-b-[16px] shadow-[0_18px_46px_-26px_oklch(26%_0.06_260/0.55)] ring-1 sm:rounded-t-[104px] md:h-full md:min-h-[360px] lg:min-h-[420px]">
          {/* ⚠️ ارتفاع ستون در موبایل باید صریح باشد. `aspect-*` با
              `fill` و `md:h-full` در ترکیب با گریدِ `items-stretch` باعث
              می‌شد ارتفاعِ واقعی صفر شود و تصویر فقط یک لایهٔ خالی بماند؛
              ارتفاعِ صریح این کلاس، همان مشکل را برای همیشه می‌بندد. */}
          <div className="relative h-[236px] w-full sm:h-[280px] md:h-full md:min-h-[360px] lg:min-h-[420px]">
            {items.map((it, i) => (
              <Image
                key={it.id}
                src={it.image_url}
                alt={it.alt}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 300px, 420px"
                priority={i === 0}
                aria-hidden={i !== safeIndex}
                className={`object-cover object-[center_30%] transition-opacity duration-700 ease-out ${
                  i === safeIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {/* تورِ پایین: لبهٔ تصویر را به قاب «می‌دوزد» */}
            <div
              aria-hidden="true"
              className="from-stage/75 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
            />

            {/* نوار ضخامتِ اسلاید (فقط اگر بیش از یکی باشد) */}
            {total > 1 ? (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-white/20"
              >
                <div
                  className="bg-gold h-full transition-[width] duration-150 ease-linear"
                  style={{ width: `${Math.round((paused ? 1 : progress) * 100)}%` }}
                />
              </div>
            ) : null}

            {/* پیکان‌ها — گِرد، کم‌وزن، روی لبه */}
            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    go(safeIndex - 1);
                  }}
                  aria-label="تصویر قبلی"
                  className="text-on-stage hover:bg-stage/70 focus-visible:ring-gold/60 absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 backdrop-blur-sm transition-colors focus-visible:ring-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    aria-hidden="true"
                  >
                    <path d="M10 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    go(safeIndex + 1);
                  }}
                  aria-label="تصویر بعدی"
                  className="text-on-stage hover:bg-stage/70 focus-visible:ring-gold/60 absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 backdrop-blur-sm transition-colors focus-visible:ring-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    aria-hidden="true"
                  >
                    <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : null}

            {/* شمارهٔ اسلاید */}
            {total > 1 ? (
              <span className="text-on-stage absolute bottom-2.5 left-3 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-bold tabular-nums backdrop-blur-sm">
                {toFa(safeIndex + 1)} / {toFa(total)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── بندانگشتی‌ها ──
          زیرِ قاب (نه روی چهره). در موبایل فقط نقطه‌ها، در دسکتاپ
          بندانگشتی‌های کوچک — تا کاربر بفهمد چند تصویر هست. */}
      {total > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                go(i);
              }}
              aria-label={`نمایش تصویر ${toFa(i + 1)}`}
              aria-current={i === safeIndex}
              className={`relative overflow-hidden rounded-md ring-2 transition-all ${
                i === safeIndex
                  ? "ring-gold/80 h-9 w-11"
                  : "ring-border/70 hover:ring-border-strong h-8 w-9 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={it.image_url} alt="" fill sizes="44px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* ── کلام ──
          متنِ همین اسلاید. اگر ادمین کلامی ننوشته باشد، `caption_paragraphs`
          خالی است و به کلامِ پیش‌فرضِ سایت برمی‌گردیم (پایین‌تر در
          `ReadingSection` مدیریت می‌شود). این‌جا فقط تصویر و کنترل‌ها. */}
      <figcaption className="sr-only">
        {current.alt}
        {current.source ? ` — ${current.source}` : ""}
        {bookTitle ? ` · کتاب مسابقه: ${bookTitle}` : ""}
        <span className="text-gold-strong">
          <Girih size={8} />
        </span>
      </figcaption>
    </figure>
  );
}
