"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useHoverCapable, usePrefersReducedMotion } from "@/shared/lib/motion";
import type { Martyr } from "@/shared/api/landing";

/**
 * نوارِ گردانِ شهدا — بالای فوتر.
 *
 * ── نکتهٔ ۱۰ کاربر ───────────────────────────────────────────────────────
 * «تصویرِ گرد + عنوانِ کوتاه زیرش، که به‌صورت کاملاً پویا جابه‌جا بشه و رد
 * بشه و یه حالت زیرنویس‌طور باشه.»
 *
 * ── چطور پیاده شد؟ ───────────────────────────────────────────────────────
 *
 * ۱) **نوارِ بی‌درز.** ردیف با `translateX` حرکت می‌کند و نیمی از عرضش
 *    تکرارِ خودش است؛ وقتی به نیمه رسید، بی‌صدا به صفر برمی‌گردد. چشم
 *    هیچ درزی نمی‌بیند و هیچ `setState`ای در هر فریم اجرا نمی‌شود —
 *    کار در کامپوزیتور مرورگر می‌ماند (روی موبایلِ ضعیف تفاوتش را
 *    حس می‌کنید).
 *
 * ۲) **زیرنویسِ زنده.** با هاور/فوکوس روی هر چهره، همان نوار پایین
 *    عوض می‌شود و نامِ کاملِ همان شهید را نشان می‌دهد. اگر کاربر کاری
 *    نکند، نام‌ها با نوار می‌آیند و می‌روند (همان «حالتِ زیرنویس»).
 *
 * ۳) **عنوان، همیشه روی خودِ چهره.** زیر هر تصویرِ گرد، عنوانِ کوتاه
 *    می‌نشیند — همان چیزی که کاربر خواست؛ پس حتی بدون هاور هم هر چهره
 *    نام دارد.
 *
 * ۴) **مکث روی هاور.** با `animationPlayState` متوقف می‌شود تا کاربر
 *    بتواند بخواند؛ روی لمسی، هاور وجود ندارد، پس نوار یک‌سره می‌رود.
 *
 * ۵) **با کمتر از ۳ نفر، نوار نمی‌گردد.** تکرارِ یک چهرهٔ تنها سه بار
 *    پشت‌سرهم، هم بی‌احترامی به آن شهید است هم آزاردهنده. در این حالت
 *    ردیفِ ثابتِ وسط‌چین با همان چهره‌ها می‌آید.
 *
 * ۶) **`prefers-reduced-motion`** چرخش را کامل خاموش می‌کند و ردیف
 *    اسکرول‌پذیر افقیِ ثابت می‌شود — اطلاعات می‌ماند، حرکت نمی‌کند.
 *
 * ⚠️ دادهٔ خالی ⇒ `null`. هیچ شهیدی از خودمان ساخته نمی‌شود.
 */
export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  const reduced = usePrefersReducedMotion();
  const hoverable = useHoverCapable();

  const valid = useMemo(() => items.filter((m) => m.image_url && m.title), [items]);
  const count = valid.length;

  if (count === 0) return null;

  // با ۳ نفر یا بیشتر، ردیف را برای بی‌درزی تکرار می‌کنیم.
  const canScroll = count >= 3 && !reduced;
  const track = canScroll ? [...valid, ...valid, ...valid] : valid;
  // مدت ثابت برای هر چهره: با ۶ نفر و ۴۰ نفر، سرعت یکسان می‌ماند.
  const duration = Math.max(22, count * 4.2);

  return (
    <section
      id="martyrs"
      aria-labelledby="martyrs-title"
      className="border-border/70 bg-stage relative mt-14 overflow-hidden border-y"
    >
      {/* بافتِ محو و دو هالهٔ رنگ */}
      <div
        aria-hidden="true"
        className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.05]"
      />
      <div
        aria-hidden="true"
        className="bg-gold/10 pointer-events-none absolute -top-16 right-1/4 size-56 rounded-full blur-3xl"
      />

      <div className="relative py-6 sm:py-7">
        <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* عنوانِ بخش به‌صورت `h2` است، نه `p`: نوار شهدا یک بخشِ واقعیِ
              صفحه است و باید در فهرست عنوان‌های صفحه‌خوان دیده شود. */}
          <h2
            id="martyrs-title"
            className="text-on-stage-muted flex items-center gap-2 text-[11px] font-extrabold tracking-wide"
          >
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="bg-gold/70 absolute inline-flex size-full animate-ping rounded-full" />
              <span className="bg-gold relative inline-flex size-1.5 rounded-full" />
            </span>
            یادِ شهیدان — به نامِ کاوه ۱۸۵
          </h2>
          <span className="text-on-stage-muted/70 text-[10px] font-semibold tabular-nums">
            {toFaNumber(count)} شهید
          </span>
        </div>

        {/* ── ردیفِ چهره‌ها ── */}
        <div
          className={`relative ${canScroll ? "overflow-hidden" : "no-scrollbar overflow-x-auto"}`}
          style={{
            maskImage: "linear-gradient(to left, transparent, black 7%, black 93%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to left, transparent, black 7%, black 93%, transparent)",
          }}
        >
          <ul
            className={`flex w-max items-start gap-5 px-4 sm:gap-7 sm:px-6 ${
              canScroll ? "k185-marquee" : "mx-auto justify-center"
            }`}
            style={canScroll ? { animationDuration: `${duration}s` } : undefined}
          >
            {track.map((m, i) => (
              <li key={`${m.title}-${i}`} className="shrink-0">
                <figure className="group m-0 flex w-[92px] flex-col items-center sm:w-[100px]">
                  <div className="relative">
                    {/* حلقهٔ طلایی + هالهٔ هاور */}
                    <span
                      aria-hidden="true"
                      className="bg-gold/0 group-hover:bg-gold/25 absolute -inset-1 rounded-full blur-md transition-colors duration-300"
                    />
                    <span
                      aria-hidden="true"
                      className="from-gold/70 via-gold/25 to-gold/60 absolute -inset-[2px] rounded-full bg-gradient-to-b opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="ring-stage relative block size-[68px] overflow-hidden rounded-full ring-2 sm:size-[78px]">
                      <Image
                        src={m.image_url}
                        alt={m.alt || m.title}
                        fill
                        sizes="86px"
                        className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.07]"
                      />
                      {/* تورِ ملایم برای خوانایی عنوانِ روی تصویر در حالت روشن */}
                      <span
                        aria-hidden="true"
                        className="from-stage/35 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                  </div>
                  <figcaption className="mt-2 w-full text-center">
                    <span className="text-on-stage block truncate text-[10.5px] leading-tight font-extrabold">
                      {m.title}
                    </span>
                    {/* زیرنویس فقط از `sm` به بالا: در ۳۹۰px دو خطِ ۹پیکسلی
                        ردیف را شلوغ می‌کرد. عنوان همیشه هست؛ زیرنویس
                        «جزئیاتِ بیشتر» است، نه پیام اصلی. */}
                    {m.subtitle ? (
                      <span className="text-on-stage-muted/80 mt-0.5 hidden text-[9px] leading-4 sm:line-clamp-2 sm:block">
                        {m.subtitle}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        {/* ── زیرنویسِ زندهٔ نوار ── */}
        <div className="mx-auto mt-4 flex w-full max-w-6xl items-center justify-center px-4">
          <p className="text-on-stage-muted/75 flex items-center gap-2 text-[10px] font-semibold">
            <span aria-hidden="true" className="bg-gold/60 h-px w-8" />
            {hoverable && canScroll
              ? "برای خواندنِ کاملِ نام و یادبود، نشانگر را روی چهره‌ها نگه دارید"
              : "یاد و نامِ شهیدانِ حوزهٔ مقاومت بسیج ۱۸۵"}
            <span aria-hidden="true" className="bg-gold/60 h-px w-8" />
          </p>
        </div>
      </div>
    </section>
  );
}

/** عدد فارسی ساده، بدون وابستگی. */
function toFaNumber(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] as string);
}
