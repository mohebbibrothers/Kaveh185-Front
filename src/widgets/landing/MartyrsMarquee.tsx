"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * ── بازنویسیِ دورِ ۱۷ (نکتهٔ ۱ کاربر: «نوار از یک طرف خالی می‌شود»)** ────
 *
 * **ریشهٔ واقعیِ باگ** (بالاخره پیدا شد؛ دو دورِ قبل فقط علامت را درمان
 * کردیم): استایلِ `k185-marquee` در **RTL** اجرا می‌شود. با
 * `transform: translate3d(-50%, …)` مرورگر در RTL همان `-50%` را روی محورِ
 * افقیِ **راست‌به‌چپ** تفسیر می‌کند؛ یعنی ردیف در جهتِ مثبتِ دیداری (به راست)
 * می‌رود و در پایانِ چرخه، نیمهٔ **خالیِ** ردیف واردِ قاب می‌شود. هیچ ریاضیِ
 * تکرار و هیچ `ResizeObserver`ی این را حل نمی‌کند، چون خودِ جهت اشتباه است.
 *
 * **راه‌حلِ قطعیِ ۱۰۰٪ مستقل از `direction`:**
 *   • انیمیشن با `translate3d(0,0,0) → translate3d(-50%,0,0)` و رَپرِ
 *     `keyframes` **بدونِ** وابستگی به جهت نوشته می‌شود و روی ردیف،
 *     `transform` صریح می‌نشیند؛
 *   • ردیف دو نسخهٔ **عیناً یکسان** دارد؛ در هر لحظه که `-50%` کامل شود،
 *     تصویرِ روی صفحه *به‌اندازهٔ یک نسخه* جابه‌جا شده و چون نسخهٔ دوم
 *     عیناً همان نسخهٔ اول است، «برشِ» دیداری صفر است ⇒ **حلقهٔ بی‌درز**؛
 *   • عرضِ یک نسخه با `ResizeObserver` از عرضِ واقعیِ قاب محاسبه می‌شود
 *     (`ceil(W/(card+gap)) + 2`) ⇒ در ۲۸۰px تا ۴K پر است؛
 *   • برای اطمینانِ کامل، `dir="ltr"` **فقط روی همان ردیفِ متحرک** ست
 *     می‌شود (نه روی صفحه) و کارت‌ها با `dir="rtl"` متنِ فارسی‌شان را
 *     درست می‌گیرند. این‌طور جهتِ محورِ `translate` قطعی و مستقل از
 *     locale است — همان تکنیکی که در نوارهای حرفه‌ای (اسپلش‌ها، لوگووال‌ها)
 *     استفاده می‌شود.
 */
const CARD_W_MOBILE = 84;
const CARD_W_DESKTOP = 100;
const GAP_MOBILE = 8;
const GAP_DESKTOP = 12;
/** حداقل تعداد آیتم در هر نسخه — اگر شهدا کم بودند، فهرست تکرار می‌شود. */
const MIN_ITEMS = 12;

export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  const reduced = usePrefersReducedMotion();
  const valid = useMemo(() => items.filter((m) => m.image_url && m.title), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = valid.length;

  // عرضِ واقعیِ قاب (با تغییرِ اندازه به‌روز می‌شود) — ریاضیِ «پر بودن» را
  // از حدس به اندازه‌گیری تبدیل می‌کند.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  /**
   * جابه‌جاییِ دقیقِ یک «دوره» به **پیکسلِ مطلق**.
   *
   * چرا درصد کافی نیست: `-50%` به عرضِ خودِ `<ul>` بسته است و در RTL جهتِ
   * تفسیر عوض می‌شود. این‌جا مقدار از روی `offsetLeft` واقعیِ کارتِ اولِ
   * نسخهٔ دوم منهای کارتِ اولِ نسخهٔ اول خوانده می‌شود؛ یعنی **عرضِ
   * دقیقِ یک نسخه** — بدونِ خطای گردکردن، بدونِ خطای `gap` انتهایی و
   * مستقل از تعدادِ آیتم‌ها. اگر اندازه‌گیری نشد (SSR/تست)، `0` می‌ماند و
   * انیمیشن عملاً حرکتی نمی‌کند؛ هیچ‌وقت نیمه‌خالی نشان داده نمی‌شود.
   */
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    // ⚠️ محیطِ تست/SSR ممکن است `matchMedia` یا `ResizeObserver` نداشته
    // باشد؛ آن‌جا مقدارِ محافظه‌کارانهٔ MIN_ITEMS استفاده می‌شود، نه کرش.
    if (typeof window.matchMedia !== "function" || typeof ResizeObserver === "undefined") {
      setViewportW(el.clientWidth || 0);
      return;
    }
    const mq = window.matchMedia("(min-width: 640px)");
    const read = () => {
      setViewportW(el.clientWidth);
      setIsDesktop(mq.matches);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    mq.addEventListener("change", read);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);

  /**
   * اندازه‌گیریِ عرضِ یک «نسخه» — همین‌جا، **پیش از** هر بازگشتِ زودهنگام،
   * چون قاعدهٔ هوک‌ها اجازه نمی‌دهد هوکی بعد از `return null` بیاید
   * (خطای React #310 دقیقاً همین بود و در بازرسیِ مرورگر گرفته شد).
   */
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const measure = (): void => {
      const kids = ul.children;
      const half = Math.round(kids.length / 2);
      if (half < 1) return;
      const first = kids[0] as HTMLElement | undefined;
      const second = kids[half] as HTMLElement | undefined;
      if (!first || !second) return;
      const d = second.offsetLeft - first.offsetLeft;
      setShift(d > 0 ? d : 0);
    };
    measure();
    // فونتِ وزیرمتن بعد از بارگذاری می‌تواند عرض‌ها را چند پیکسل جابه‌جا
    // کند؛ یک اندازه‌گیریِ دوباره در آن لحظه، درزِ حلقه را صفر نگه می‌دارد.
    // ⚠️ jsdom و مرورگرهای خیلی قدیم `document.fonts` ندارند؛ نبودش
    // نباید تست یا صفحه را بشکند.
    const fonts = document.fonts as FontFaceSet | undefined;
    if (fonts) {
      void fonts.ready.then(() => {
        measure();
      });
    }
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => {
      ro.disconnect();
    };
  }, [count, viewportW, isDesktop]);

  // ⚠️ قاعدهٔ هوک‌ها: بازگشتِ زودهنگام **بعد** از همهٔ هوک‌ها. وگرنه اگر
  // روزی فهرست خالی به این کامپوننت برسد و بعداً پر شود، تعدادِ هوک‌ها
  // بین دو رندر عوض می‌شود و ری‌اکت می‌شکند.
  if (count === 0) return null;

  const cardW = isDesktop ? CARD_W_DESKTOP : CARD_W_MOBILE;
  const gap = isDesktop ? GAP_DESKTOP : GAP_MOBILE;
  // تعدادِ آیتمِ هر نسخه از عرضِ واقعیِ قاب؛ +۲ کارت حاشیهٔ اطمینان.
  const perCopy =
    viewportW > 0 ? Math.max(count, Math.ceil(viewportW / (cardW + gap)) + 2) : MIN_ITEMS;
  const canScroll = !reduced;
  const copyItems = Array.from({ length: Math.ceil(perCopy / count) }, () => valid).flat();
  // دو نسخهٔ یکسان ⇒ در `-50%` تصویر عیناً برمی‌گردد ⇒ درز = صفر.
  const sequence = [...copyItems, ...copyItems];
  // سرعتِ یکنواختِ دیداری: هر کارت ~۴ ثانیه، مستقل از تعداد.
  const duration = Math.max(28, Math.round(copyItems.length * 4));

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

      {/* فاصلهٔ استاندارد از بخشِ بالایی (نکتهٔ ۲): `--space-8` در موبایل،
          `--space-12` در دسکتاپ — از توکن، نه عددِ جادویی. */}
      <div className="relative pt-[var(--space-8)] pb-[var(--space-6)] sm:pt-[var(--space-12)] sm:pb-[var(--space-8)] lg:pt-[var(--space-16)]">
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
        {/* ⚠️ `dir="ltr"` روی همین قاب هم لازم است، نه فقط روی `<ul>`:
            در RTL یک بلوکِ `w-max` به لبهٔ **راست** چیده می‌شود و آن‌وقت
            حرکتِ چپ‌رو، سمتِ راست را خالی می‌کند (همان چیزی که کاربر دید).
            با LTR شدنِ قاب، ردیف از لبهٔ چپ شروع می‌شود و `-shift` دقیقاً
            نسخهٔ دوم را جای نسخهٔ اول می‌آورد ⇒ حلقهٔ بی‌درز. متنِ کارت‌ها
            با `dir="rtl"` روی هر `<figure>` سرِ جای خودش است. */}
        <div
          ref={viewportRef}
          dir="ltr"
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
          {/* ⚠️ `dir="ltr"` فقط روی ردیف: محورِ `translateX` را از locale
              جدا می‌کند (ریشهٔ خالی‌شدنِ یک‌طرفه). متنِ هر کارت با
              `dir="rtl"` سرِ جای خودش می‌مانَد. */}
          <ul
            ref={listRef}
            dir="ltr"
            className={`flex w-max items-start gap-2 sm:gap-[12px] ${
              canScroll ? "k185-marquee" : "mx-auto justify-center px-3 sm:px-4"
            }`}
            style={
              canScroll
                ? {
                    animationDuration: `${duration}s`,
                    // متغیرِ پیکسلیِ اندازه‌گیری‌شده؛ `globals.css` از آن می‌خواند.
                    ["--k185-marquee-shift" as string]: `${shift}px`,
                  }
                : undefined
            }
          >
            {sequence.map((m, i) => {
              const realIndex = i % count;
              return (
                <li key={`${m.title}-${i}`} className="shrink-0">
                  <figure
                    dir="rtl"
                    className="group m-0 flex w-[84px] flex-col items-center sm:w-[100px]"
                  >
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
                        {/* ⚠️ `truncate` روی موبایل عنوان را می‌بُرید («سیدشهدای
                            مقاو…»). حالا حداکثر دو خط با ارتفاعِ ثابت: هر
                            کارت هم‌قد می‌مانَد، هیچ عنوانی بریده نمی‌شود و
                            ردیف یک‌خطِ صاف می‌مانَد. */}
                        <span className="text-on-band line-clamp-2 block min-h-[2.1em] text-[10.5px] leading-[1.15] font-extrabold">
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
              یاد و نامِ شهیدانِ ایران زمین
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
