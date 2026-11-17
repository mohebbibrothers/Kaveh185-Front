"use client";

import Link from "next/link";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";
import { useData } from "@/shared/api/data-context";
import { LeaderGallery } from "./LeaderGallery";
import { useGallery } from "./useGallery";
import Image from "next/image";

/**
 * «کتاب و کلام» — قلبِ محتوایی صفحهٔ اول.
 *
 * ── ایرادهای نسخهٔ قبل که کاربر دید ──────────────────────────────────────
 * ۱) **قابِ بدشکل.** تصویر در ستونی با `overflow-hidden` و گردی ۱۶px
 *    می‌نشست، ولی هالهٔ گرادیانی و بریده‌شدنِ لبه‌ها گوشه‌ها را «نوک‌تیز»
 *    نشان می‌داد. اکنون قاب **قوسِ محرابی** دارد (`rounded-t-[92px]`) که
 *    هم با زبان بصری سایت (محراب/کاشی) می‌خواند، هم هیچ گوشهٔ تیزی
 *    نمی‌گذارد و در ۳۲۰/۳۹۰/۴۳۰+ درست می‌نشیند.
 * ۲) **متنِ تبلیغاتی.** پاراگراف «۳۰ داستان کوتاه… لازم نیست حفظ کنید»
 *    حذف شد. جایش **کلامِ رهبر انقلاب دربارهٔ کتاب و کتاب‌خوانی** آمد؛
 *    جمله‌ای که خودش دلیلِ خواندن است، نه توضیحی که کاربر را «بروشور»
 *    حس کند.
 * ۳) **هیچ متنی روی چهره.** برچسب و دکمه بیرونِ قاب‌اند.
 *
 * ── چیزی که در این نسخه اضافه شد: گالری ──────────────────────────────────
 * تصویر و کلام از **یک منبع** می‌خوانند (`useGallery`): با عوض شدن تصویر،
 * کلامِ همان تصویر هم عوض می‌شود. اگر ادمین برای تصویری متن نگذاشته
 * باشد، کلامِ پیش‌فرضِ زیر می‌آید — هیچ‌وقت جای خالی. اگر ادمین هیچ
 * تصویری آپلود نکرده باشد، به تصویرِ استاتیکِ خودِ سایت برمی‌گردیم تا
 * باکس هرگز خالی نماند.
 *
 * ⚠️ انتساب: برچسب «از بیانات رهبر انقلاب اسلامی» است و نامِ شخص در متن
 * نیامده. برای متن دقیق‌تر فقط `SOURCE_LABEL` را عوض کنید.
 */
const SOURCE_LABEL = "از بیانات رهبر انقلاب اسلامی دربارهٔ کتاب و کتاب‌خوانی";

const FALLBACK_QUOTE = [
  "برای یک ملّت، خسارتِ بزرگ است که افراد آن با کتاب سر و کاری نداشته باشند؛ و برای یک فرد، توفیقِ عظیمی است که با کتاب مأنوس و همواره در حال بهره‌گیری از آن، یعنی آموختن چیزهای تازه باشد.",
  "با این دیدگاه، به‌روشنی می‌توان ارزش و مفهومِ رمزیِ عمیق این حقیقتِ تاریخی را دریافت که اوّلین خطابِ خداوندِ متعال به پیامبرِ گرامی اسلام (صلّی‌الله‌علیه‌وآله) این است که: بخوان!",
  "و در اوّلین سوره‌ای که بر آن فرستادهٔ عظیم‌الشّأنِ خداوند فرود آمده، نامِ «قلم» به تجلیل یاد شده است.",
];

/** تصویرِ پیش‌فرضِ سایت وقتی ادمین هنوز چیزی آپلود نکرده است. */
const STATIC_FALLBACK = "/img/emam-reading.jpg";

export function ReadingSection({ bookStories }: { bookStories: number }) {
  const { data } = useData();
  const leader = data.gallery.leader;
  const { index } = useGallery(leader.length);
  const active = leader.length > 0 ? leader[index] : null;

  const paragraphs =
    active && active.caption_paragraphs.length > 0 ? active.caption_paragraphs : FALLBACK_QUOTE;
  const source = active?.source || SOURCE_LABEL;

  return (
    <section id="book" aria-labelledby="book-title" className="k185-reveal mt-14 scroll-mt-24">
      <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
        {/* هالهٔ کرمِ گرم در ستون متن — سطح را از کارت سفید جدا می‌کند */}
        <div
          aria-hidden="true"
          className="from-gold/[0.07] pointer-events-none absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l to-transparent"
        />

        <div className="relative grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(230px,34%)]">
          {/* ── متن / کلام ── */}
          <div className="order-2 flex min-w-0 flex-col justify-center p-5 sm:p-7 md:order-1 md:p-8 lg:p-10">
            <p className="text-gold-strong flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide">
              <Girih size={11} />
              کتابِ مسابقهٔ امسال
            </p>

            <h2
              id="book-title"
              className="text-text mt-2 text-[clamp(20px,2.6vw,27px)] leading-tight font-extrabold"
            >
              {SITE.bookTitle}
            </h2>

            {/* جداکنندهٔ نازک با گره — شروع «کلام» را نشان می‌دهد */}
            <div className="mt-4 flex items-center gap-2.5" aria-hidden="true">
              <span className="from-gold/60 h-px w-10 bg-gradient-to-l to-transparent" />
              <span className="text-gold/70">
                <Girih size={9} />
              </span>
              <span className="from-gold/30 h-px flex-1 bg-gradient-to-r to-transparent" />
            </div>

            <figure className="m-0 mt-3.5">
              {/* `key` روی index: با عوض شدن تصویر، متن هم با یک محوِ
                  کوتاه جابه‌جا می‌شود — حسِ «همان روایت، تصویر بعدی». */}
              <blockquote key={active ? `q-${index}` : "q-default"} className="border-0 p-0">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={`text-text-muted text-[13px] leading-[2.15] sm:text-[13.5px] ${
                      i > 0 ? "mt-2.5" : ""
                    } ${i > 1 ? "hidden sm:block" : ""}`}
                  >
                    {para}
                  </p>
                ))}
              </blockquote>
              <figcaption className="text-text-subtle mt-3.5 flex items-start gap-1.5 text-[10.5px] leading-6">
                <span className="text-gold-strong mt-1 shrink-0" aria-hidden="true">
                  <Girih size={8} />
                </span>
                {source}
              </figcaption>
            </figure>

            <div className="mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
              <Link
                href="/book"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold transition-colors sm:w-auto"
              >
                مطالعهٔ کتاب
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <span className="text-text-subtle order-first w-full text-[11px] font-semibold sm:order-none sm:w-auto">
                {toFa(bookStories)} داستان کوتاه · مطالعهٔ آنلاین، بدون دانلود
              </span>
            </div>
          </div>

          {/* ── قاب تصویر ──
              موبایل: قوس‌دار و تمام‌عرض، نسبت ۱۶/۱۱. دسکتاپ: ستون کامل و
              بلند با قوس در بالا. `sizes` دقیق است تا موبایل نسخهٔ کوچک را
              بگیرد، نه ۱۰۰۰ پیکسلی. */}
          <figure className="relative order-1 m-0 md:order-2 md:self-stretch">
            <div className="p-3 md:h-full md:p-4">
              {leader.length > 0 ? (
                <LeaderGallery items={leader} />
              ) : (
                <div className="bg-stage relative h-full overflow-hidden rounded-t-[92px] rounded-b-[18px] shadow-[0_18px_44px_-28px_oklch(28%_0.06_260/0.55)] md:rounded-t-[118px]">
                  <div className="relative aspect-[16/11] w-full sm:aspect-[16/9] md:aspect-auto md:h-full md:min-h-[340px] lg:min-h-[400px]">
                    <Image
                      src={STATIC_FALLBACK}
                      alt="تصویر حضرت آیت‌الله خامنه‌ای در حال مطالعهٔ کتاب در کتابخانه"
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 300px, 420px"
                      className="object-cover object-[center_24%]"
                    />
                    <div
                      aria-hidden="true"
                      className="from-stage/70 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"
                    />
                    <div
                      aria-hidden="true"
                      className="ring-gold/25 pointer-events-none absolute inset-0 rounded-t-[92px] rounded-b-[18px] ring-1 ring-inset md:rounded-t-[118px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
