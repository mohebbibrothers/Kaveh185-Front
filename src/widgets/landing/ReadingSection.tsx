"use client";

import Link from "next/link";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";
import { useData } from "@/shared/api/data-context";
import { LeaderGallery } from "./LeaderGallery";
import type { LeaderPortrait } from "@/shared/api/landing";
import { useState } from "react";

/**
 * «کتاب و کلام» — باکسِ تصویر رهبر + گالریِ خودکار + کلام.
 *
 * ── چه چیزی عوض شد؟ (نکتهٔ ۹) ────────────────────────────────────────────
 * نسخهٔ قبل یک تصویر **ثابت** با یک کلامِ **هاردکد** داشت. حالا:
 *
 *   • تصاویر از پنل ادمین می‌آیند (`LeaderPortrait` در بک‌اند).
 *   • هر تصویر کلامِ خودش را دارد؛ کلام با تصویر عوض می‌شود.
 *   • اگر ادمین چند تصویر بگذارد، گالری **خودکار** می‌گردد (۶٫۵ ثانیه).
 *   • قابِ تصویر بازطراحی شد: قوسِ محرابی + حلقهٔ طلایی + گوشه‌های تزئینی.
 *   • بدون داده از ادمین، یک **حالتِ پایه** («پایه») نمایش داده می‌شود:
 *     تصویر رسمیِ داخل بستهٔ فرانت + کلامِ رسمی. این همان اصلِ صداقت است
 *     در جهتِ درست: هیچ دادهٔ ساختگی‌ای جعل نمی‌شود، ولی صفحه هم خالی
 *     نمی‌ماند — چون این متن و تصویر، محتوای رسمیِ خودِ مسابقه‌اند و در
 *     مخزن فرانت نگهداری می‌شوند، نه دادهٔ جعلیِ ادمین.
 *
 * ── چرا «پایه» و نه «خالی»؟ ──────────────────────────────────────────────
 * در نکتهٔ ۹ صریحاً خواسته شد این باکس گالری داشته باشد. اگر ادمین هنوز
 * چیزی آپلود نکرده، پنهان‌کردنِ کلِ باکس یعنی صفحهٔ اول یک بخشِ مهم را از
 * دست می‌دهد. پس «پایه» می‌آید تا باکس کامل باشد، و به‌محضِ اولین رکوردِ
 * ادمین، جای آن را می‌گیرد. منبع (source) همیشه نوشته می‌شود، پس کاربر
 * می‌داند این کلام از کجاست.
 */
const BASE_QUOTE = [
  "برای یک ملّت، خسارتِ بزرگ است که افراد آن با کتاب سر و کاری نداشته باشند؛ و برای یک فرد، توفیقِ عظیمی است که با کتاب مأنوس و همواره در حال بهره‌گیری از آن، یعنی آموختن چیزهای تازه باشد.",
  "با این دیدگاه، به‌روشنی می‌توان ارزش و مفهومِ رمزیِ عمیق این حقیقتِ تاریخی را دریافت که اوّلین خطابِ خداوندِ متعال به پیامبرِ گرامی اسلام (صلّی‌الله‌علیه‌وآله) این است که: بخوان!",
  "و در اوّلین سوره‌ای که بر آن فرستادهٔ عظیم‌الشّأنِ خداوند فرود آمده، نامِ «قلم» به تجلیل یاد شده است.",
];

const BASE_SOURCE = "از بیانات رهبر انقلاب اسلامی دربارهٔ کتاب و کتاب‌خوانی";

/**
 * ── اسلایدِ «پایه» (دورِ ۱۸، نکتهٔ ۳) ────────────────────────────────────
 * کاربر گزارش داد با رفرش، اول نسخهٔ قدیمیِ باکس دیده می‌شد و بعد «می‌پرید»
 * به نسخهٔ تازه. ریشه: دو **چیدمانِ متفاوت** برای دو حالت وجود داشت —
 * حالتِ پایه تصویر را در ستونِ ۳۶٪ و سمتِ مقابل می‌گذاشت و گالری، تصویر را
 * در ستونِ ۴۶٪ سمتِ دیگر. پس با رسیدنِ دادهٔ ادمین، تصویر جابه‌جا و
 * اندازه‌اش عوض می‌شد ⇒ پرش.
 *
 * راهِ ریشه‌ای: **یک چیدمان، دو محتوا.** حالتِ پایه دیگر یک چیدمانِ جدا
 * نیست؛ همان `LeaderGallery` است با یک اسلاید (تصویرِ رسمیِ بستهٔ فرانت +
 * کلامِ رسمی). نتیجه: HTMLِ پیش‌رندر همان هندسهٔ نهایی را دارد، پس با
 * رسیدنِ دادهٔ ادمین فقط **محتوا** با یک گذارِ نرم عوض می‌شود و هیچ
 * جابه‌جاییِ چیدمانی رخ نمی‌دهد.
 */
const BASE_SLIDE: LeaderPortrait = {
  image_url: "/img/emam-reading.jpg",
  alt: "تصویر حضرت آیت‌الله خامنه‌ای در حال مطالعهٔ کتاب در کتابخانه",
  caption: BASE_QUOTE[0] ?? "",
  caption_paragraphs: BASE_QUOTE,
  source: BASE_SOURCE,
  show_in_box: true,
  order: 0,
};

export function ReadingSection({ bookStories }: { bookStories: number }) {
  const { data } = useData();
  const leader = data.gallery.leader;

  const hasAdminGallery = leader.length > 0;
  // شمارندهٔ اسلایدِ گالری: در سرتیترِ همین باکس، گوشهٔ بالا-چپ، هم‌ردیف با
  // برچسبِ «کتاب مسابقهٔ امسال» — خواستهٔ صریحِ کاربر (نکتهٔ ۷).
  const [slide, setSlide] = useState({ index: 0, count: 0 });

  return (
    <section id="book" aria-labelledby="book-title" className="k185-reveal mt-12 scroll-mt-24">
      <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
        {/* هالهٔ کرمِ گرم — سطح را از کارت سفید جدا می‌کند */}
        <div
          aria-hidden="true"
          className="from-gold/[0.07] pointer-events-none absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l to-transparent"
        />

        {/* ── سرتیترِ باکس ── */}
        <div className="relative flex flex-wrap items-end justify-between gap-2 px-4 pt-5 sm:px-7 sm:pt-7 md:px-8 md:pt-8 lg:px-10">
          <div>
            <p className="text-gold-strong flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide">
              <Girih size={11} />
              کتابِ مسابقهٔ امسال
            </p>
            <h2
              id="book-title"
              className="text-text mt-1.5 text-[clamp(19px,2.5vw,26px)] leading-tight font-extrabold"
            >
              {SITE.bookTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            {slide.count > 1 ? (
              /* موبایل: چسبیده به گوشهٔ بالا-چپِ خودِ باکس، هم‌ردیف با
                 «کتاب مسابقهٔ امسال». دسکتاپ: همان‌جا در ردیفِ سرتیتر. */
              <span
                className="border-gold/35 bg-band text-on-band absolute top-5 left-4 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold sm:static sm:top-auto sm:left-auto"
                aria-live="polite"
              >
                <span aria-hidden="true" className="bg-gold size-1 rounded-full" />
                {toFa(slide.index + 1)} از {toFa(slide.count)}
                <span className="sr-only">تصویر</span>
              </span>
            ) : null}
            <span className="text-text-subtle text-[10.5px] font-semibold">
              {toFa(bookStories)} داستان کوتاه
            </span>
          </div>
        </div>

        {/* ⚠️ یک چیدمان برای هر دو حالت (نکتهٔ ۳، دورِ ۱۸): دادهٔ ادمین
            نبود ⇒ همان گالری با یک اسلایدِ «پایه». یعنی حتی پیش از رسیدنِ
            پاسخِ سرور، HTMLِ پیش‌رندر هندسهٔ نهایی را دارد و «پرش» ناممکن
            است؛ فقط محتوا با گذارِ نرم عوض می‌شود. */}
        <div className="relative">
          <LeaderGallery items={hasAdminGallery ? leader : [BASE_SLIDE]} onProgress={setSlide} />
        </div>

        {/* نوارِ پایین: دکمه + توضیح — در هر دو حالت یکسان */}
        <div className="border-border/70 relative border-t px-4 py-3 sm:px-7 md:px-8 lg:px-10">
          <BookFacts bookStories={bookStories} inline />
        </div>
      </div>
    </section>
  );
}

/** دکمهٔ «مطالعهٔ کتاب» + توضیح کوتاه — سه چیدمان، یک محتوا. */
function BookFacts({
  bookStories,
  compact = false,
  inline = false,
}: {
  bookStories: number;
  compact?: boolean;
  inline?: boolean;
}) {
  const button = (
    <Link
      href="/book"
      className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[12.5px] font-extrabold transition-colors sm:h-11 sm:px-5 sm:text-[13.5px]"
    >
      مطالعهٔ کتاب
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden="true"
      >
        <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );

  if (inline) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-text-subtle text-[11px] font-semibold">
          {toFa(bookStories)} داستان کوتاه · مطالعهٔ آنلاین، بدون دانلود
        </span>
        {button}
      </div>
    );
  }

  if (compact) {
    return <div className="px-5 pt-1 pb-5">{button}</div>;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
      {button}
      <span className="text-text-subtle text-[11px] font-semibold">
        {toFa(bookStories)} داستان کوتاه · بدون دانلود
      </span>
    </div>
  );
}
