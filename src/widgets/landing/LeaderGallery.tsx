"use client";

import Image from "next/image";
import { toFa } from "@/shared/lib/fa";
import type { LeaderPortrait } from "@/shared/api/landing";
import { useGallery } from "./useGallery";

/**
 * گالری تصاویر رهبر انقلاب — ستون تصویرِ باکس «کتاب و کلام».
 *
 * ── خواستهٔ کاربر ────────────────────────────────────────────────────────
 * «گالریِ رهبر در باکس صفحهٔ اول باشد و ادمین بتواند تصویر آپلود کند.»
 * یعنی سه چیز هم‌زمان: چند تصویر، انتخاب دستی، و محتوای هر تصویر.
 *
 * ── تصمیم‌های طراحی ──────────────────────────────────────────────────────
 * ۱) **قابِ آرکِ محرابی** (همان زبانِ بصریِ کاشی/محراب) دست‌نخورده ماند؛
 *    فقط لایه‌های تصویر زیرش عوض می‌شوند. تغییرِ فرمِ قاب، صفحه را با
 *    بقیهٔ بخش‌ها ناهمخوان می‌کرد.
 * ۲) **کراس‌فید ساده** (اپسیتی + `aria-hidden`) جای اسلایدرِ کشویی:
 *    در RTL، `translateX` گالری را یک فریم به سمت غلط می‌پراند و در
 *    مرورگرهای موبایل لرزش ایجاد می‌کند.
 * ۳) **شمارندهٔ «۲ / ۳»** بالای قاب: کاربر می‌فهمد چند تصویر هست، بی‌آنکه
 *    لازم باشد نقطه‌ها را بشمارد.
 * ۴) **دکمه‌ها روی خود قاب**، با پس‌زمینهٔ نیمه‌شفافِ سرمه‌ای — روی
 *    تصویرهایی که روشن‌اند هم خوانا می‌مانند.
 * ۵) **یک تصویر ⇒ بدون دکمه و نقطه.** کنترلِ بی‌فایده، شلوغی است.
 *
 * ── اصل صداقت ────────────────────────────────────────────────────────────
 * `items` خالی ⇒ این کامپوننت `null` می‌دهد و والد به تصویرِ استاتیکِ
 * پیش‌فرضِ سایت برمی‌گردد. هیچ تصویر و هیچ کلامِ ساختگی‌ای ساخته نمی‌شود.
 */
export function LeaderGallery({
  items,
  onPauseChange,
}: {
  items: LeaderPortrait[];
  /** تا ستونِ متن هم با هاور/فوکوسِ گالری متوقف شود */
  onPauseChange?: (paused: boolean) => void;
}) {
  const count = items.length;
  const { index, go, pauseHandlers } = useGallery(count);

  if (count === 0) return null;

  const multiple = count > 1;

  return (
    <div className="relative">
      <div
        role="group"
        aria-roledescription="گالری"
        aria-label="تصاویر همراهِ کلام"
        tabIndex={multiple ? 0 : -1}
        onKeyDown={(event) => {
          if (!multiple) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index + 1); // در RTL، ← یعنی تصویر بعدی
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index - 1);
          }
        }}
        {...pauseHandlers}
        onMouseEnter={() => {
          onPauseChange?.(true);
        }}
        onMouseLeave={() => {
          onPauseChange?.(false);
        }}
        onFocus={() => {
          onPauseChange?.(true);
        }}
        onBlur={() => {
          onPauseChange?.(false);
        }}
        className="relative"
      >
        <div className="bg-stage relative overflow-hidden rounded-t-[92px] rounded-b-[18px] shadow-[0_18px_44px_-28px_oklch(28%_0.06_260/0.55)] md:h-full md:rounded-t-[118px]">
          <div className="relative aspect-[16/11] w-full sm:aspect-[16/9] md:aspect-auto md:h-full md:min-h-[340px] lg:min-h-[400px]">
            {items.map((item, i) => (
              <div
                key={`${item.image_url}-${i}`}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={item.image_url}
                  alt={i === index ? item.alt : ""}
                  fill
                  // تصویر اول هنگام اسکرول باید آماده باشد؛ `priority`
                  // فقط برای اولین است، نه هر سه (وگرنه رقابت با هیرو).
                  priority={i === 0}
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 300px, 420px"
                  className="object-cover object-[center_24%]"
                />
              </div>
            ))}

            {/* تورِ نرم لبهٔ پایین — تصویر لبهٔ برنده ندارد */}
            <div
              aria-hidden="true"
              className="from-stage/70 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"
            />
            {/* قوس طلایی */}
            <div
              aria-hidden="true"
              className="ring-gold/25 pointer-events-none absolute inset-0 rounded-t-[92px] rounded-b-[18px] ring-1 ring-inset md:rounded-t-[118px]"
            />

            {multiple ? (
              <span className="bg-stage/70 text-cream absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums backdrop-blur-sm">
                {toFa(index + 1)} / {toFa(count)}
              </span>
            ) : null}

            {multiple ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    go(index - 1);
                  }}
                  aria-label="تصویر قبلی"
                  className="bg-stage/55 text-cream hover:bg-stage/80 absolute top-1/2 right-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
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
                    go(index + 1);
                  }}
                  aria-label="تصویر بعدی"
                  className="bg-stage/55 text-cream hover:bg-stage/80 absolute top-1/2 left-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
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
          </div>
        </div>
      </div>

      {multiple ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={`dot-${item.image_url}-${i}`}
              type="button"
              onClick={() => {
                go(i);
              }}
              aria-label={`نمایش تصویر ${toFa(i + 1)}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                i === index
                  ? "bg-gold-strong w-6"
                  : "bg-border-strong/60 hover:bg-border-strong w-1.5"
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* متنِ تصویر برای صفحه‌خوان — دیداری نیست چون متن اصلی در ستون
          کنارِ باکس است؛ ولی کسی که فقط با شنوایی دنبال می‌کند باید
          بداند تصویر عوض شد. */}
      <p className="sr-only" aria-live="polite">
        {items[index]?.caption_paragraphs[0] ?? items[index]?.alt ?? ""}
      </p>
    </div>
  );
}
