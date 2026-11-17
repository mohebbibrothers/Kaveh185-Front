"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageVisible, usePrefersReducedMotion } from "@/shared/lib/motion";
import type { LeaderPortrait } from "@/shared/api/landing";

/**
 * گالری تصاویر رهبر انقلاب — **یک داده، دو نمایش**.
 *
 * ── نکتهٔ ۹ کاربر ────────────────────────────────────────────────────────
 * «می‌خوام این باکس یه گالری حرفه‌ای بشه؛ اگه بشه عکس‌ها خودکار هم جابه‌جا
 * بشن که چه بهتر؛ یه کادر جذاب هم برای عکس در نظر بگیر.»
 *
 * ── تصمیم‌های طراحی ──────────────────────────────────────────────────────
 *
 * ۱) **تصویر و کلام یک واحدند.** هر اسلاید = تصویر + کلامِ همان تصویر.
 *    اگر کلام را جدا می‌گذاشتیم، با چرخش تصویر، متن نمی‌فهمید دربارهٔ
 *    کدام تصویر است. ادمین برای هر تصویر متن خودش را می‌دهد.
 *
 * ۲) **قاب، نه حاشیه.** تصویر داخل یک قابِ **محرابی** (قوسِ بالا) با
 *    حلقهٔ طلاییِ دولایه و سایهٔ گرم می‌نشیند. سه لایه‌ی گوشه‌ی طلایی
 *    (بالا-راست، پایین-چپ) قاب را «کارشده» نشان می‌دهد بی‌آنکه شلوغ شود.
 *
 * ۳) **چرخشِ ۶٫۵ ثانیه‌ای با نوارِ زمان.** نوارِ نازکِ پایین قاب می‌گوید
 *    «چقدر مانده تا تصویر بعد». بدون آن، کاربر فکر می‌کند تصویر جامد است
 *    و یک دفعه می‌پرد.
 *
 * ۴) **مکث هوشمند.** روی هاور (فقط دستگاه‌های دقیق)، روی فوکوس کیبورد، و
 *    وقتی تب پنهان است، چرخش متوقف می‌شود. کاربری که دارد کلام را
 *    می‌خواند نباید تصویرش عوض شود. `prefers-reduced-motion` هم چرخش را
 *    کامل خاموش می‌کند و فقط نقطه‌ها می‌مانند.
 *
 * ۵) **حالت تک‌تصویری.** با یک تصویر، هیچ نشانگر و هیچ نوار زمانی‌ای
 *    نمایش داده نمی‌شود — یک گالریِ «تک‌عکس» با نقطه‌های بی‌فایده،
 *    کاربر را گمراه می‌کند که چیز دیگری هم هست.
 *
 * ۶) **پیش‌بارگذاری نرم.** تصویر بعدی با `new Image()` در پس‌زمینه
 *    بارگذاری می‌شود تا پرشِ سفید بین اسلایدها رخ ندهد.
 *
 * ⚠️ داده خالی ⇒ `null`. بخش «کتاب و کلام» بدون گالری هم کامل و معنادار
 * است؛ هیچ تصویر یا کلامی از خودمان نمی‌سازیم.
 */
const ROTATE_MS = 6500;

export function LeaderGallery({
  items,
  className = "",
  onProgress,
}: {
  items: LeaderPortrait[];
  className?: string;
  /**
   * تعداد اسلایدهای قابلِ نمایش را به والد می‌دهد تا شمارندهٔ «۱ از ۳» را
   * در گوشهٔ **بالا-چپِ خودِ باکس** (کنارِ «کتاب مسابقهٔ امسال») بگذارد —
   * نه شناور روی تصویر.
   */
  onProgress?: (state: { index: number; count: number }) => void;
}) {
  // فقط تصاویری که ادمین اجازهٔ نمایش در باکس را داده، و تصویر دارند.
  const slides = useMemo(() => items.filter((i) => i.image_url && i.show_in_box), [items]);

  const [rawIndex, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const visible = usePageVisible();
  const count = slides.length;

  // ⚠️ ایندکسِ «مؤثر» به‌جای اصلاحِ state در effect: اگر فهرست کوتاه‌تر
  // شود (ادمین یک تصویر را حذف کند) و `rawIndex` بیرون بزند، همان‌جا
  // نرمال می‌شود — بدون یک رندر آبشاریِ اضافه و بدون setState در effect.
  const index = count > 0 ? rawIndex % count : 0;

  // گزارشِ وضعیت به والد (برای شمارندهٔ گوشهٔ باکس). با `useEffect` بدنهٔ
  // رندر تمیز می‌ماند و رفرنسِ تابع در رندرِ بعدی دوباره اجرا نمی‌شود.
  useEffect(() => {
    onProgress?.({ index, count });
  }, [index, count, onProgress]);

  // پیش‌بارگذاری تصویر بعدی
  useEffect(() => {
    if (count < 2) return;
    const next = slides[(index + 1) % count];
    if (!next?.image_url) return;
    const img = new window.Image();
    img.src = next.image_url;
  }, [index, count, slides]);

  // چرخش خودکار
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (count < 2 || reduced || paused || !visible) return;
    timer.current = window.setTimeout(() => {
      setIndex((i) => i + 1);
    }, ROTATE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [count, reduced, paused, visible, index]);

  const go = useCallback((next: number) => {
    setPaused(true);
    setIndex(next);
  }, []);

  if (count === 0) return null;

  const active = slides[Math.min(index, count - 1)];
  // ⚠️ TypeScript نمی‌داند `count > 0` است (چون `slides` آرایه است). با
  // این بررسی، هم تایپ باریک می‌شود هم اگر روزی منطق بالا عوض شد، به‌جای
  // کرش در مرورگر، همان `null` امن برمی‌گردد.
  if (!active) return null;
  const paragraphs =
    active.caption_paragraphs.length > 0
      ? active.caption_paragraphs
      : active.caption
        ? [active.caption]
        : [];

  return (
    <div
      className={`relative grid gap-4 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-stretch md:gap-0 ${className}`}
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      onFocusCapture={() => {
        setPaused(true);
      }}
      onBlurCapture={() => {
        setPaused(false);
      }}
    >
      {/* ── قاب تصویر ── */}
      <div className="relative order-1 md:order-1">
        <div className="relative h-full p-2.5 md:p-3.5">
          <div className="bg-stage relative h-full overflow-hidden rounded-t-[78px] rounded-b-[20px] shadow-[0_24px_60px_-30px_oklch(24%_0.05_260/0.6)] md:rounded-t-[104px]">
            <div className="relative aspect-[16/12] w-full sm:aspect-[16/10] md:aspect-auto md:h-full md:min-h-[300px] lg:min-h-[340px]">
              {slides.map((slide, i) => (
                <Image
                  key={`${slide.image_url}-${i}`}
                  src={slide.image_url}
                  alt={slide.alt || "تصویر رهبر انقلاب اسلامی"}
                  fill
                  sizes="(max-width: 767px) 92vw, (max-width: 1200px) 340px, 480px"
                  priority={i === 0}
                  className={`object-cover object-[center_22%] transition-opacity duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {/* تورِ گرمِ پایین: تصویر «می‌نشیند»، لبهٔ برنده ندارد */}
              <div
                aria-hidden="true"
                className="from-stage/75 pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
              />

              {/* حلقهٔ طلاییِ دولایه */}
              <div
                aria-hidden="true"
                className="ring-gold/30 pointer-events-none absolute inset-0 rounded-t-[78px] rounded-b-[20px] ring-1 ring-inset md:rounded-t-[104px]"
              />

              {/* گوشه‌های طلایی */}
              <span
                aria-hidden="true"
                className="border-gold/55 pointer-events-none absolute top-3 right-3 size-6 rounded-tr-2xl border-t-2 border-r-2"
              />
              <span
                aria-hidden="true"
                className="border-gold/35 pointer-events-none absolute bottom-3 left-3 size-5 rounded-bl-xl border-b-2 border-l-2"
              />

              {/* نوارِ زمانِ اسلاید — فقط با ۲ تصویر یا بیشتر */}
              {count > 1 ? (
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                  <span
                    key={`${index}-${paused}-${reduced}`}
                    className="bg-gold block h-full origin-right"
                    style={
                      reduced || paused
                        ? { width: `${((index + 1) / count) * 100}%`, transition: "width 300ms" }
                        : {
                            width: "100%",
                            animation: `k185-slide-progress ${ROTATE_MS}ms linear both`,
                          }
                    }
                  />
                </div>
              ) : null}

              {/* نقطه‌ها — دکمهٔ واقعی، نه `div` با onClick */}
              {count > 1 ? (
                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={`dot-${i}`}
                      type="button"
                      onClick={() => {
                        go(i);
                      }}
                      aria-label={`تصویر ${i + 1} از ${count}`}
                      aria-current={i === index ? "true" : undefined}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index
                          ? "bg-gold w-5"
                          : "w-1.5 bg-white/50 hover:w-2.5 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              {/* فلش‌های قبلی/بعد — روی دسکتاپ با ماوس راحت‌تر از نقطه‌های ریز */}
              {count > 1 ? (
                <>
                  <GalleryArrow
                    dir="prev"
                    onClick={() => {
                      go((index - 1 + count) % count);
                    }}
                  />
                  <GalleryArrow
                    dir="next"
                    onClick={() => {
                      go((index + 1) % count);
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── کلام ── */}
      <div className="order-2 flex min-w-0 flex-col justify-center px-1 pb-2 md:order-2 md:py-6 md:ps-7 md:pe-2">
        {active.source ? (
          <p className="text-gold-strong mb-2 flex items-center gap-1.5 text-[10.5px] font-extrabold">
            <span
              aria-hidden="true"
              className="from-gold/60 h-px w-6 bg-gradient-to-l to-transparent"
            />
            {active.source}
          </p>
        ) : null}

        <blockquote
          key={index}
          className="border-0 p-0"
          style={{
            animation: reduced ? undefined : "k185-quote-in 520ms var(--ease-decelerate) both",
          }}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p
                key={i}
                className={`text-text text-[13px] leading-[2.15] sm:text-[14.5px] ${
                  i > 0 ? "mt-3" : ""
                }`}
              >
                {para}
              </p>
            ))
          ) : (
            <p className="text-text-subtle text-[12.5px] leading-[2.1]">
              متنِ کلام برای این تصویر ثبت نشده است.
            </p>
          )}
        </blockquote>

        {count > 1 && paused ? (
          <p className="text-text-subtle mt-3.5 flex items-center gap-1.5 text-[10.5px] font-semibold">
            <span aria-hidden="true" className="bg-gold/70 inline-block size-1 rounded-full" />
            چرخش خودکار متوقف است
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** فلشِ قبلی/بعد روی قابِ تصویر. */
function GalleryArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const isNext = dir === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isNext ? "تصویر بعد" : "تصویر قبل"}
      className={`bg-stage/55 hover:border-gold/60 hover:bg-stage/80 absolute top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white backdrop-blur-sm transition-all duration-300 sm:grid ${
        isNext ? "left-2.5" : "right-2.5"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      >
        <path
          d={isNext ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
