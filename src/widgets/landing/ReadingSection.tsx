"use client";

import Image from "next/image";
import Link from "next/link";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";
import { useData } from "@/shared/api/data-context";
import { LeaderGallery } from "./LeaderGallery";

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

export function ReadingSection({ bookStories }: { bookStories: number }) {
  const { data } = useData();
  const leader = data.gallery.leader;

  const hasAdminGallery = leader.length > 0;

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
          <span className="text-text-subtle text-[10.5px] font-semibold">
            {toFa(bookStories)} داستان کوتاه
          </span>
        </div>

        {hasAdminGallery ? (
          /* ── حالت گالری: خودِ گالری تمام‌عرضِ باکس است ──
             ⚠️ نسخهٔ اول گالری را داخل ستونِ ۳۶٪ می‌گذاشت و گالری هم
             خودش دو ستون بود؛ نتیجه: ستونِ متن به یک نوارِ باریک تبدیل
             می‌شد و نصفِ باکس خالی می‌ماند. گالری باید فضای کاملِ باکس را
             بگیرد. */
          <div className="relative">
            <LeaderGallery items={leader} />
          </div>
        ) : (
          <div className="relative grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(250px,36%)]">
            <div className="order-1 md:order-2 md:self-stretch">
              <BasePortrait />
            </div>

            <div className="order-2 flex min-w-0 flex-col justify-center p-5 sm:p-7 md:order-1 md:p-8 lg:p-10">
              <div className="flex items-center gap-2.5" aria-hidden="true">
                <span className="from-gold/60 h-px w-10 bg-gradient-to-l to-transparent" />
                <span className="text-gold/70">
                  <Girih size={9} />
                </span>
                <span className="from-gold/30 h-px flex-1 bg-gradient-to-r to-transparent" />
              </div>

              <figure className="m-0 mt-3.5">
                <blockquote className="border-0 p-0">
                  {BASE_QUOTE.map((para, i) => (
                    <p
                      key={i}
                      className={`text-text-muted text-[12.5px] leading-[2.15] sm:text-[13.5px] ${
                        i > 0 ? "mt-2.5" : ""
                      }`}
                    >
                      {para}
                    </p>
                  ))}
                </blockquote>
                <figcaption className="text-text-subtle mt-3.5 flex items-start gap-1.5 text-[10.5px] leading-6">
                  <span className="text-gold-strong mt-1 shrink-0" aria-hidden="true">
                    <Girih size={8} />
                  </span>
                  {BASE_SOURCE}
                </figcaption>
              </figure>

              <BookFacts bookStories={bookStories} />
            </div>
          </div>
        )}

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

/**
 * قابِ پایه — تصویر رسمیِ داخل بستهٔ فرانت، با همان زبانِ بصریِ گالری.
 * عمداً ساده است: هیچ نشانگر و نوار زمانی‌ای ندارد، چون فقط یک تصویر است.
 */
function BasePortrait() {
  return (
    <div className="relative p-2.5 md:p-3.5">
      <div className="bg-stage relative overflow-hidden rounded-t-[78px] rounded-b-[20px] shadow-[0_24px_60px_-30px_oklch(24%_0.05_260/0.6)] md:rounded-t-[104px]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] md:aspect-auto md:h-full md:min-h-[300px] lg:min-h-[360px]">
          <Image
            src="/img/emam-reading.jpg"
            alt="تصویر حضرت آیت‌الله خامنه‌ای در حال مطالعهٔ کتاب در کتابخانه"
            fill
            sizes="(max-width: 767px) 92vw, (max-width: 1200px) 320px, 420px"
            className="object-cover object-[center_22%]"
          />
          <div
            aria-hidden="true"
            className="from-stage/75 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
          />
          <div
            aria-hidden="true"
            className="ring-gold/30 pointer-events-none absolute inset-0 rounded-t-[78px] rounded-b-[20px] ring-1 ring-inset md:rounded-t-[104px]"
          />
          <span
            aria-hidden="true"
            className="border-gold/55 pointer-events-none absolute top-3 right-3 size-6 rounded-tr-2xl border-t-2 border-r-2"
          />
        </div>
      </div>
    </div>
  );
}
