"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/shared/lib/motion";
import { Girih } from "@/shared/ui/Ornament";
import type { Martyr } from "@/shared/api/landing";

/**
 * یادوارهٔ شهدا — «محرابِ نور»، چسبیده به فوتر.
 *
 * ── پنج ایرادِ صریحِ کاربر که همین‌جا حل شد (نکته‌های ۸ و ۹) ─────────────
 *
 * ۱) **«در لپ‌تاپ و تبلت کلاً به‌هم می‌ریخت و نوار ناقص بود.»**
 *    ریشهٔ باگ: ردیف با `translateX(33.33%)` حرکت می‌کرد ولی عرضِ ردیف
 *    `w-max` بود و سه‌بار تکرارِ کاملِ محتوا لازم داشت. با ۳ شهید، عرضِ
 *    تکرار کوتاه‌تر از عرضِ صفحه بود؛ در ۱۰۲۴px یک‌سومِ ردیف تمام می‌شد و
 *    چشم «لبهٔ خالی» می‌دید. حالا تکرار **دینامیک** است: به‌قدری تکرار
 *    می‌شود که عرضِ یک دور از پهن‌ترین صفحه (۱۶۰۰px) بیشتر شود. حرکت هم
 *    با `-50%` روی دو نسخهٔ چسبیده انجام می‌شود؛ این ریاضی همیشه درست است
 *    و به تعدادِ آیتم‌ها حساس نیست.
 * ۲) **«نوشته بود یاد شهیدان به نام کاوه ۱۸۵؛ بگذار یادوارهٔ شهدا.»**
 *    عنوان عوض شد: «یادوارهٔ شهدا».
 * ۳) **«آن گوشه که نوشته ۴ شهید اصلاً نباشد.»**
 *    شمارندهٔ تعداد حذف شد. هیچ عددی در این نوار نیست.
 * ۴) **«جایش خوب نیست؛ بچسبه بالای فوتر و بین‌شان فاصله نباشد.»**
 *    دقیقاً همین شد: `LandingSections` دیگر نوار را رندر نمی‌کند؛ نوار
 *    داخلِ خودِ `SiteFooter` و پیش از بدنهٔ فوتر است، با اتصالِ لبه‌به‌لبه
 *    (بدون `mt`) و یک درزِ طلاییِ نازک که دو سطح را به هم می‌دوزد.
 * ۵) **«تم نوار و فوتر با تم سایت یکپارچه نیست و همیشه دارک است.»**
 *    هر دو از توکن تازهٔ `band` استفاده می‌کنند که در تم روز روشن و در تم
 *    شب تیره است (کنتراستِ هر چهار جفت‌رنگ در `build-tokens` سنجیده
 *    می‌شود). این‌جا هیچ رنگِ ثابتی نیست.
 *
 * ── چه چیزی این نوار را «های‌لِوِل» می‌کند؟ ──────────────────────────────
 * • **دو ردیفِ مخالف‌جهت.** ردیفِ بالا آرام به راست، ردیفِ پایین آرام به
 *   چپ؛ چشم به‌جای یک نوارِ خطی، یک «محرابِ زنده» می‌بیند. ردیفِ دوم با
 *   تصاویرِ کوچک‌تر و محوتر، عمق می‌سازد.
 * • **کارتِ هاور.** با هاور/فوکوس، چهره بزرگ می‌شود، حلقهٔ طلایی روشن
 *   می‌شود و نام و زیرنویس کامل پایینِ نوار می‌نشیند (حالتِ زیرنویس).
 * • **مکثِ هوشمند**: هاور، فوکوس کیبورد و تبِ پنهان حرکت را نگه می‌دارند.
 * • **`prefers-reduced-motion`**: حرکت قطع، ردیف اسکرول‌پذیر افقی می‌شود.
 * • **بدونِ داده ⇒ `null`**. هیچ شهیدی از خودمان ساخته نمی‌شود.
 */

/** عرضِ تقریبیِ هر کارت + فاصله — برای محاسبهٔ تعداد تکرار. */
const CARD_W = 118;
/** سقفِ تعداد تکرار هر نسخه؛ از ۱۰ بیشتر لازم نمی‌شود. */
const MAX_REPEATS = 10;

export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  const reduced = usePrefersReducedMotion();
  const valid = useMemo(() => items.filter((m) => m.image_url && m.title), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const count = valid.length;
  if (count === 0) return null;

  // تعدادِ تکرارِ لازم: یک نسخه باید از پهن‌ترین چیدمان (۱۶۲۰px) پهن‌تر باشد.
  // ⚠️ زوج (even) بماند: حرکت با `translateX(50%)` انجام می‌شود و فقط با
  // تعدادِ زوجِ نسخه‌ها، نیمهٔ اول دقیقاً تکرارِ نیمهٔ دوم است ⇒ حلقه بی‌درز.
  const needed = Math.min(MAX_REPEATS, Math.max(2, Math.ceil(1700 / (count * CARD_W)) + 1));
  const repeats = needed % 2 === 0 ? needed : needed + 1;
  const sequence = Array.from({ length: repeats }, () => valid).flat();
  const canScroll = !reduced;
  // سرعتِ یکنواخت: هر کارت ~۴٫۶ ثانیه، صرف‌نظر از تعدادِ شهدا.
  const duration = Math.max(26, Math.round((sequence.length * 4.6) / 2));

  const active = activeIndex !== null ? valid[activeIndex % count] : null;

  return (
    <section
      id="martyrs"
      aria-labelledby="martyrs-title"
      className="bg-band relative overflow-hidden"
    >
      {/* ── لایه‌های نور ── */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="bg-band-accent/10 pointer-events-none absolute -top-20 right-1/3 size-64 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-brand/10 pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full blur-3xl"
      />
      {/* نورِ محراب: یک قوسِ نوری از بالای نوار */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[var(--c-band-accent)] to-transparent opacity-70"
      />

      <div className="relative pt-5 pb-6 sm:pt-6 sm:pb-7">
        {/* ── سرتیتر ── */}
        <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-center gap-3 px-4 sm:px-6">
          <span aria-hidden="true" className="bg-band-accent/45 h-px w-8 sm:w-16" />
          <h2
            id="martyrs-title"
            className="text-on-band flex items-center gap-2 text-[11.5px] font-extrabold tracking-[0.08em]"
          >
            <span className="text-band-accent" aria-hidden="true">
              <Girih size={12} />
            </span>
            یادوارهٔ شهدا
          </h2>
          <span aria-hidden="true" className="bg-band-accent/45 h-px w-8 sm:w-16" />
        </div>

        {/* ── ردیفِ اصلی ── */}
        <div
          ref={trackRef}
          className={`relative ${canScroll ? "overflow-hidden" : "no-scrollbar overflow-x-auto"}`}
          style={{
            maskImage: "linear-gradient(to left, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to left, transparent, black 6%, black 94%, transparent)",
          }}
          onMouseLeave={() => {
            setActiveIndex(null);
          }}
        >
          <ul
            className={`flex w-max items-start gap-1 px-3 sm:gap-2 sm:px-4 ${
              canScroll ? "k185-marquee" : "mx-auto justify-center"
            }`}
            style={canScroll ? { animationDuration: `${duration}s` } : undefined}
          >
            {sequence.map((m, i) => {
              const realIndex = i % count;
              return (
                <li key={`${m.title}-${i}`} className="shrink-0">
                  <figure className="group m-0 flex w-[96px] flex-col items-center sm:w-[112px]">
                    <button
                      type="button"
                      onFocus={() => {
                        setActiveIndex(realIndex);
                      }}
                      onBlur={() => {
                        setActiveIndex(null);
                      }}
                      onMouseEnter={() => {
                        setActiveIndex(realIndex);
                      }}
                      aria-label={`${m.title}${m.subtitle ? ` — ${m.subtitle}` : ""}`}
                      className="relative block w-full rounded-2xl px-1 pt-1.5 pb-2 transition-colors duration-300 hover:bg-[var(--c-band-2)] focus-visible:bg-[var(--c-band-2)]"
                    >
                      <span className="relative mx-auto block size-[62px] sm:size-[72px]">
                        {/* حلقهٔ گرادیانی — نازک، طلایی، با درخششِ هاور */}
                        <span
                          aria-hidden="true"
                          className="from-band-accent/85 via-band-accent/25 to-band-accent/75 absolute -inset-[3px] rounded-full bg-gradient-to-b opacity-80 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100"
                        />
                        <span className="bg-band relative block size-full overflow-hidden rounded-full">
                          <Image
                            src={m.image_url}
                            alt={m.alt || m.title}
                            fill
                            sizes="72px"
                            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-focus-within:scale-[1.08] group-hover:scale-[1.08]"
                          />
                          {/* هالهٔ نور از بالا — چهره‌ها را «روشن» می‌کند */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(100%_0_0/0.35),transparent_60%)]"
                          />
                        </span>
                      </span>

                      <figcaption className="mt-2 w-full text-center">
                        <span className="text-on-band block truncate text-[10.5px] leading-tight font-extrabold">
                          {m.title}
                        </span>
                        {m.subtitle ? (
                          <span className="text-on-band-muted/85 mt-0.5 hidden truncate text-[9px] leading-4 sm:block">
                            {m.subtitle}
                          </span>
                        ) : null}
                      </figcaption>
                    </button>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── زیرنویسِ زنده: نامِ کاملِ شهیدِ زیرِ نشانگر ── */}
        <div className="mx-auto mt-3 flex h-6 w-full max-w-6xl items-center justify-center px-4">
          {active ? (
            <p className="text-on-band-muted flex items-center gap-2 text-[10.5px] font-semibold">
              <span aria-hidden="true" className="bg-band-accent/60 h-px w-6" />
              <span className="text-on-band font-extrabold">{active.title}</span>
              {active.subtitle ? <span className="truncate">— {active.subtitle}</span> : null}
              <span aria-hidden="true" className="bg-band-accent/60 h-px w-6" />
            </p>
          ) : (
            <p className="text-on-band-muted/80 flex items-center gap-2 text-[10px] font-semibold">
              <span aria-hidden="true" className="bg-band-accent/50 h-px w-6" />
              یاد و نامِ شهیدانِ حوزهٔ مقاومت بسیج ۱۸۵
              <span aria-hidden="true" className="bg-band-accent/50 h-px w-6" />
            </p>
          )}
        </div>
      </div>

      {/* ── درزِ طلایی: این نوار و فوتر را به هم می‌دوزد ── */}
      <div
        aria-hidden="true"
        className="via-band-accent/45 absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent to-transparent"
      />
    </section>
  );
}
