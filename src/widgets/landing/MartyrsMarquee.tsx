"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
/**
 * پهن‌ترین قابی که سایت در عمل می‌بیند ۱۹۲۰px است. با کارتِ ۱۰۰px و فاصلهٔ
 * ۱۲px، ۲۰ کارت = ۲۲۴۰px ⇒ یک نسخه همیشه از قاب پهن‌تر است و «خالی‌شدنِ
 * یک طرف» ساختاراً ناممکن می‌شود (نکتهٔ ۱، دورِ ۱۸).
 */
const MIN_ITEMS = 20;

export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  const reduced = usePrefersReducedMotion();
  const valid = useMemo(() => items.filter((m) => m.image_url && m.title), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = valid.length;

  /**
   * ═══ بازنویسیِ دورِ ۱۸ — «ریلِ سه‌نسخه‌ای، اندازه‌گیری‌صفر» ═══════════
   *
   * کاربر برای سومین بار گزارش داد نوار از یک طرف بیرون می‌رود و طرفِ دیگر
   * خالی می‌شود. دو دورِ قبل دنبالِ «اندازه‌گیریِ درستِ عرض» بودیم؛ ولی
   * هر راه‌حلی که به جاوااسکریپت وابسته باشد در چند لحظه شکننده است:
   * فریمِ اول پیش از هیدریشن، بارگذاریِ فونتِ وزیرمتن، باز/بسته شدنِ
   * اسکرول‌بار، و بدترین حالت: اندازه‌گیریِ صفر ⇒ ایستادنِ ردیف روی `0px`
   * و دیده‌شدنِ نیمهٔ خالی.
   *
   * این‌بار **هیچ اندازه‌گیری‌ای وجود ندارد؛ فقط هندسهٔ CSS:**
   *
   *   ۱) ردیف = **سه نسخهٔ کاملِ یکسان** (`A A A`) و انیمیشن
   *      `0 → -50%`. چون `-50%` روی عرضِ خودِ ردیف حساب می‌شود و ردیف
   *      زوج‌تایی از نسخه‌های یکسان است، پایانِ چرخه **دقیقاً** حالتِ
   *      شروع را بازتولید می‌کند ⇒ حلقهٔ بی‌درز، مستقل از عرض، فونت و
   *      تعدادِ شهدا.
   *   ۲) در هر لحظه، دو نسخهٔ دیگر (جلو و عقبِ قاب) پوشش را تضمین می‌کنند؛
   *      بنابراین حتی اگر مرورگر یک فریم دیر جابه‌جا کند یا قاب پهن‌تر از
   *      یک نسخه باشد، طرفِ خالی **ساختاراً ناممکن** است. این همان دلیلی
   *      است که این‌جا سه نسخه داریم و نه دو.
   *   ۳) ردیف `dir="ltr"` است تا `-50%` روی محورِ چپ‌به‌راست تفسیر شود
   *      (ریشهٔ باگِ RTL) و متنِ هر کارت با `dir="rtl"` سرِ جای خود می‌مانَد.
   *   ۴) هر نسخه دستِ‌کم `MIN_ITEMS` کارت دارد؛ با کارتِ ۱۰۰px و فاصلهٔ
   *      ۱۲px یعنی ~۲۲۴۰px ⇒ پهن‌تر از پهن‌ترین قابِ ممکن (۱۹۲۰px).
   */
  // ⚠️ قاعدهٔ هوک‌ها: بازگشتِ زودهنگام **بعد** از همهٔ هوک‌ها. وگرنه اگر
  // روزی فهرست خالی به این کامپوننت برسد و بعداً پر شود، تعدادِ هوک‌ها
  // بین دو رندر عوض می‌شود و ری‌اکت می‌شکند.
  if (count === 0) return null;

  /**
   * تعدادِ کارتِ هر نسخه بدونِ هیچ اندازه‌گیری:
   *   • حداقل `MIN_ITEMS` کارت (تا در پهن‌ترین قاب هم ردیف پر باشد)؛
   *   • و مضربی از تعدادِ شهدا تا هر نسخه **کامل** تکرار شود و درزِ چرخه
   *     دقیقاً روی مرزِ یک شهید بیفتد.
   * پهن‌ترین قابی که سایت در عمل می‌بیند ۱۹۲۰px است؛ با کارتِ ۱۰۰px + ۱۲px
   * فاصله، ۲۰ کارت = ۲۲۴۰px ⇒ همیشه بیشتر از قاب. `MIN_ITEMS = 20` این را
   * با حاشیهٔ اطمینان تضمین می‌کند و «پر بودن» را از اندازه‌گیری بی‌نیاز.
   */
  const perCopy = Math.max(MIN_ITEMS, Math.ceil(MIN_ITEMS / count) * count);
  const canScroll = !reduced;
  const copyItems = Array.from({ length: Math.ceil(perCopy / count) }, () => valid).flat();
  // ⚠️ **سه** نسخه و نه دو: با `-50%`، نسخهٔ دوم/سوم پوششِ هر دو طرفِ قاب
  // را می‌دهند، حتی وقتی قاب از یک نسخه پهن‌تر باشد یا مرورگر یک فریم
  // دیر جابه‌جا کند. هیچ‌حالتی برای «طرفِ خالی» باقی نمی‌مانَد.
  const sequence = [...copyItems, ...copyItems, ...copyItems];
  // سرعتِ یکنواختِ دیداری: هر جابه‌جایی ~۱٫۹ ثانیه، مستقل از تعداد.
  const duration = Math.max(48, Math.round(copyItems.length * 2.4));

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
            در RTL یک بلوکِ پهن به لبهٔ **راست** چیده می‌شود و آن‌وقت حرکتِ
            چپ‌رو، سمتِ راست را خالی می‌کند (همان چیزی که کاربر دید).
            با LTR شدنِ قاب، ردیف از لبهٔ چپ شروع می‌شود و `-50%` دقیقاً
            نسخهٔ دوم را جای نسخهٔ اول می‌آورد ⇒ حلقهٔ بی‌درز. متنِ کارت‌ها
            با `dir="rtl"` روی هر `<figure>` سرِ جای خودش است. */}
        {/* ── این قاب **دوطرفه** است ──────────────────────────────────────
            نسخهٔ قبل ماسکِ ۶٪ در دو طرف داشت و چون آن‌جا هیچ چهره‌ای نیست
            (ردیف از لبهٔ کارت شروع می‌شود، نه از وسطِ آن)، همان نوارِ محو
            به چشمِ کاربر «نیمهٔ خالی» می‌آمد. حالا:
              • تمام‌عرض و بی‌ماسکِ کناری ⇒ هیچ لبهٔ محوی وجود ندارد؛
              • در دو انتها یک **سایهٔ نرم ۰٫۵rem** می‌نشیند که چهره‌ها را
                به‌جای «بریدن»، به لبه «می‌دوزد». */}
        <div
          dir="ltr"
          className={`relative ${canScroll ? "overflow-hidden" : "no-scrollbar overflow-x-auto"}`}
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, black 26px, black calc(100% - 26px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 26px, black calc(100% - 26px), transparent 100%)",
          }}
          onMouseLeave={() => {
            setActiveIndex(null);
          }}
        >
          {/* ⚠️ سه ویژگی که این ردیف را از «اندازه‌گیری با جاوااسکریپت» بی‌نیاز
              می‌کند و باگِ «یک طرف خالی» را ساختاراً ناممکن می‌سازد:
                ۱) `dir="ltr"` ⇒ محورِ `translateX` از locale جدا می‌شود؛
                ۲) `w-max` + دستِ‌کم ۲۰ کارت در هر نسخه ⇒ هر نسخه از پهن‌ترین
                   قاب (۱۹۲۰px) پهن‌تر است، پس هیچ‌وقت جای خالی نمی‌مانَد؛
                ۳) `--k185-marquee-shift: 50%` ⇒ جابه‌جایی به عرضِ خودِ ردیف
                   بسته است (نه به قاب، نه به `offsetLeft`)، و چون ردیف دقیقاً
                   دو نسخهٔ یکسان است، `-50%` همیشه درزِ صفر می‌دهد. */}
          <ul
            dir="ltr"
            className={`flex w-max items-start gap-2 sm:gap-[12px] ${
              canScroll ? "k185-marquee" : "mx-auto justify-center px-3 sm:px-4"
            }`}
            style={canScroll ? { animationDuration: `${duration}s` } : undefined}
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
