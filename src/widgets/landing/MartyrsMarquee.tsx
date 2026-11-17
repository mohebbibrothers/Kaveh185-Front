"use client";

import Image from "next/image";
import { Girih } from "@/shared/ui/Ornament";
import type { Martyr } from "@/shared/api/landing";

/**
 * نوار شهدا — «زیرنویسِ تصویری» بالای فوتر.
 *
 * ── خواستهٔ کاربر ────────────────────────────────────────────────────────
 * «تصویر گِرد + عنوان زیرش، کاملاً پویا جابه‌جا شود و رد شود، حالتی مثل
 * زیرنویس؛ و ادمین بخش شهدا را مدیریت کند.» یعنی یک ریلِ افقی متحرک،
 * نه یک گرید ایستا.
 *
 * ── چطور بی‌درز حرکت می‌کند؟ ─────────────────────────────────────────────
 * فهرست دو بار پشتِ‌سرهم رندر می‌شود و کل ریل به اندازهٔ ۵۰٪ عرضش جابه‌جا
 * می‌شود؛ در پایانِ حرکت، نسخهٔ دوم دقیقاً جای نسخهٔ اول است ⇒ حلقه بدون
 * «پرش». (پرش، ایرادِ رایجِ مارکی‌های ساده است.)
 *
 * ── دو حالتی که عمداً متفاوت‌اند ──────────────────────────────────────────
 * ۱) **کمتر از ۶ شهید** ⇒ ریل حرکت نمی‌کند؛ یک ردیفِ وسط‌چین و ثابت.
 *    دلیلش تجربهٔ واقعیِ این نسخه بود: با دادهٔ نمونهٔ تک‌نفره، ریلِ متحرک
 *    همان یک چهره را سه‌بار پشتِ‌سرهم نشان می‌داد — هم بدشکل، هم دروغِ
 *    دیداری (بیننده فکر می‌کرد سه نفرند).
 * ۲) **۶ شهید یا بیشتر** ⇒ دو نسخه + حرکتِ پیوسته (سرعت از تعداد:
 *    `max(28s, n×6s)` تا با ۶ نفر تند و با ۲۰ نفر کند نباشد).
 *
 * ── دسترس‌پذیری و احترام به تنظیمات ─────────────────────────────────────
 * مکث روی هاور/فوکوس (تا کاربر بتواند یک چهره را بخواند)، و با
 * `prefers-reduced-motion` حرکت خاموش می‌شود و ردیف به یک گریدِ ثابت
 * تبدیل می‌شود — محتوا همیشه در دسترس است، فقط حرکت ندارد.
 *
 * ── اصل صداقت ────────────────────────────────────────────────────────────
 * هیچ شهیدی در کد نیست. `items` خالی ⇒ کل بخش رندر نمی‌شود؛ نه تصویر
 * جعلی، نه عنوان ساختگی.
 */
export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  if (items.length === 0) return null;

  const animated = items.length >= 6;
  const duration = `${Math.max(28, items.length * 6)}s`;
  const lane = animated ? [...items, ...items] : items;

  const card = (m: Martyr, i: number) => (
    <li
      key={`${m.image_url}-${i}`}
      className="group flex w-[110px] shrink-0 flex-col items-center gap-1.5 sm:w-[132px]"
    >
      <span className="from-gold/70 to-gold/25 relative grid size-[58px] place-items-center rounded-full bg-gradient-to-b p-[2px] transition-transform duration-300 group-hover:scale-[1.06] sm:size-[68px]">
        <span className="bg-surface ring-border/60 relative size-full overflow-hidden rounded-full ring-1">
          <Image
            src={m.image_url}
            alt={m.alt || m.title}
            fill
            sizes="72px"
            className="object-cover object-[center_20%] grayscale-[35%] transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        </span>
      </span>
      <span className="text-text line-clamp-1 w-full text-center text-[10.5px] leading-5 font-extrabold">
        {m.title}
      </span>
      {m.subtitle ? (
        <span className="text-text-subtle -mt-1 line-clamp-1 w-full text-center text-[9px] leading-4">
          {m.subtitle}
        </span>
      ) : null}
    </li>
  );

  return (
    <section aria-labelledby="martyrs-title" className="border-border bg-surface-2/50 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-6 sm:px-6">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span
            className="from-gold/50 h-px w-8 bg-gradient-to-l to-transparent"
            aria-hidden="true"
          />
          <h2
            id="martyrs-title"
            className="text-text-subtle flex items-center gap-1.5 text-[11px] font-extrabold"
          >
            <span className="text-gold-strong" aria-hidden="true">
              <Girih size={9} />
            </span>
            یادِ شهیدان — به نامِ کاوه ۱۸۵
          </h2>
          <span
            className="from-gold/50 h-px w-8 bg-gradient-to-r to-transparent"
            aria-hidden="true"
          />
        </div>

        <div
          className="k185-marquee relative overflow-hidden"
          style={
            // ماسکِ دو طرف فقط در حالتِ متحرک معنا دارد: آیتم‌ها «از داخلِ
            // نوار» می‌آیند و لبهٔ برنده دیده نمی‌شود. در حالتِ ثابت، ماسک
            // فقط چهره‌های کناری را بی‌دلیل محو می‌کرد.
            animated
              ? {
                  maskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }
              : undefined
          }
        >
          <ul
            className={
              animated
                ? "k185-marquee-track flex w-max items-start gap-3 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center sm:gap-4"
                : "flex w-full flex-wrap justify-center gap-3 sm:gap-4"
            }
            style={animated ? { ["--marquee-duration" as string]: duration } : undefined}
          >
            {lane.map((m, i) => card(m, i))}
          </ul>
        </div>
      </div>
    </section>
  );
}
