import Image from "next/image";
import Link from "next/link";
import { Girih, MuqarnasArch } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

/**
 * «از کتاب تا کارنامه» — بخشِ کتاب، با تصویر رهبر در حال مطالعه.
 *
 * ── چرا این بخش ساخته شد و جای دیگری نه؟ ─────────────────────────────────
 * تصویری که کاربر داد (رهبر انقلاب در حال مطالعه) معنایش «کتاب‌خواندن
 * رسمِ این کار است»، نه «اینجا مسابقه است». پس جای درستش **کنار خودِ
 * کتاب** است، جایی که کاربر باید تصمیم بگیرد بخواند یا نه — نه در هیرو
 * (که جای پیام مسابقه است) و نه در بنر پایانی (که جای اقدام است).
 *
 * ── احترام به تصویر ──────────────────────────────────────────────────────
 * • نوارِ نشان و امضای گوشهٔ تصویر با **کراپ** حذف شده است (نه با
 *   پوشاندنِ تصویر در CSS)؛ فایلِ اصلی در `public/img/emam-reading.jpg`
 *   از بالای آن نوار بریده شده و نسبت تازه‌اش ۱۰:۱۳ است.
 * • قاب، محرابی است و از `object-cover` استفاده نمی‌شود مگر در حالت
 *   بنرِ تمام‌عرض که خودِ قاب، نسبت را تعیین می‌کند؛ در آن حالت هم
 *   نقطهٔ تمرکز روی چهره قفل شده (`object-[center_22%]`).
 * • هیچ متن یا دکمه‌ای روی چهره نمی‌نشیند؛ برچسب، زیرِ قاب است.
 *
 * ── متن ──────────────────────────────────────────────────────────────────
 * متن کتاب عمداً **کوتاه** است: یک جملهٔ ارزشی («۳۰ داستان کوتاه، هر
 * پرسش از دل همین داستان‌ها») و یک جملهٔ کاربردی («حفظ‌کردن لازم نیست»).
 * هرچه بیشتر توضیح می‌دادیم، صفحه به بروشور تبدیل می‌شد و کاربر فرار
 * می‌کرد. قوانین کتاب‌خوانی هم به صفحهٔ خودش (`/rules`) سپرده شده.
 */
export function ReadingSection({ bookStories }: { bookStories: number }) {
  return (
    <section id="book" aria-labelledby="book-title" className="k185-reveal mt-14 scroll-mt-24">
      <div className="k185-lift border-border bg-surface relative overflow-hidden rounded-2xl border">
        {/* هالهٔ لاجوردی سمت متن — سطح را از «کارت سفید» جدا می‌کند */}
        <div
          aria-hidden="true"
          className="from-brand/[0.055] pointer-events-none absolute inset-y-0 right-0 w-[58%] bg-gradient-to-l to-transparent"
        />

        <div className="relative grid items-stretch gap-0 sm:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* ── متن ── */}
          <div className="order-2 flex flex-col justify-center p-5 sm:order-1 sm:p-7 lg:p-8">
            <p className="text-gold-strong flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide">
              <span aria-hidden="true" className="text-gold-strong/80">
                <Girih size={11} />
              </span>
              کتاب مسابقهٔ امسال
            </p>

            <h2
              id="book-title"
              className="text-text mt-2 text-[clamp(22px,3.4vw,34px)] leading-[1.3] font-extrabold"
            >
              {SITE.bookTitle}
            </h2>

            <p className="text-text-muted mt-3 max-w-[34rem] text-[13.5px] leading-[2.1]">
              هر پرسش آزمون از دل یکی از همین داستان‌ها بیرون آمده است. لازم نیست چیزی را حفظ کنید —
              داستان‌ها را با حوصله بخوانید و بعد وارد آزمون شوید.
            </p>

            {/* ویژگی‌های واقعی کتاب، به‌جای جمله‌های تبلیغاتی */}
            <ul className="mt-5 flex flex-wrap gap-2">
              {[`${toFa(bookStories)} داستان کوتاه`, "مطالعهٔ آنلاین، بدون دانلود"].map((item) => (
                <li
                  key={item}
                  className="border-border bg-canvas/70 text-text-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                >
                  <span
                    className="bg-verde inline-block size-1.5 rounded-full"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="/book"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold transition-colors"
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
            </div>
          </div>

          {/* ── قاب تصویر ──
              در موبایل بالا و افقی (بنر)، در دسکتاپ ستون باریک و کامل.
              `sizes` درست است تا موبایل نسخهٔ ۵۲۰px را بگیرد، نه ۱۰۰۰px. */}
          <figure className="relative order-1 m-0 grid grid-rows-[1fr_auto] sm:order-2">
            <div className="relative h-[176px] w-full overflow-hidden sm:h-full sm:min-h-[360px] lg:min-h-[400px]">
              <MuqarnasArch className="text-gold/30 absolute inset-x-0 top-0 z-10 h-4 w-full sm:hidden" />
              <Image
                src="/img/emam-reading.jpg"
                alt="تصویر حضرت آیت‌الله خامنه‌ای در حال مطالعهٔ کتاب در کتابخانه"
                fill
                priority={false}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 240px, 420px"
                className="object-cover object-[center_26%]"
              />
              {/* پیوند نرمِ تصویر به کارت — لبهٔ محو، نه خط برنده */}
              <div
                aria-hidden="true"
                className="from-surface pointer-events-none absolute inset-x-0 -bottom-px h-10 bg-gradient-to-t to-transparent sm:inset-y-0 sm:right-auto sm:left-0 sm:h-full sm:w-10 sm:bg-gradient-to-r"
              />
            </div>
            <figcaption className="text-text-subtle border-border/70 relative border-t px-4 py-2.5 text-[10.5px] leading-5 sm:px-3 sm:py-3">
              کتاب‌خواندن، رسمِ این کار است — نه استثنای آن.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
