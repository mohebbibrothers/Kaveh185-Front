import Link from "next/link";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";
import { LeaderGallery } from "@/widgets/landing/LeaderGallery";
import type { LeaderPortrait } from "@/shared/api/landing";

/**
 * «کتاب و کلام» — بخشِ کتاب، با گالریِ تصاویر و کلامِ همراه.
 *
 * ── چه چیزی نسبت به نسخهٔ قبل عوض شد؟ ────────────────────────────────────
 * ۱) **گالری شد.** پیش‌تر یک تصویر ثابت (`emam-reading.jpg`) با یک متن
 *    ثابت بود. اکنون تصاویر از پنل ادمین می‌آیند و هر تصویر، کلامِ خودش
 *    را دارد؛ اگر ادمین چیزی آپلود نکرده باشد، به تصویر و کلامِ
 *    پیش‌فرضِ سایت برمی‌گردیم تا بخش هرگز خالی نماند.
 * ۲) **کادرِ حرفه‌ای.** قوسِ محرابی + حلقهٔ طلایی + بندانگشتی + شمارهٔ
 *    اسلاید (در `LeaderGallery`).
 * ۳) **متن، ستونِ اصلی شد.** کلام در دسکتاپ ستون بزرگ‌تر را می‌گیرد؛
 *    تصویر ستونِ کنار است. پیش‌تر تصویر نیمی از کارت را می‌بلعید و متن
 *    در گوشه‌ای کوچک می‌نشست.
 *
 * ── ترتیب در موبایل ──────────────────────────────────────────────────────
 * تصویر **اول** می‌آید (کارتِ قوس‌دار، افقی) و بعد برچسب، تیتر، کلام و
 * دکمه. دلیل: در گوشی، تصویر تنها چیزی است که در نگاه اول «چیستیِ» بخش
 * را می‌گوید؛ و چون افقی و کوتاه است، کاربر را از دکمه دور نمی‌کند.
 *
 * ── اصل صداقت ────────────────────────────────────────────────────────────
 * کلامِ پیش‌فرض، همان متنِ مستندِ «از بیانات رهبر انقلاب اسلامی دربارهٔ
 * کتاب و کتاب‌خوانی» است. برچسبِ منبع همیشه دیده می‌شود. اگر ادمین کلامِ
 * دیگری بگذارد، همان اولویت دارد.
 */
const DEFAULT_QUOTE = [
  "برای یک ملّت، خسارتِ بزرگ است که افراد آن با کتاب سر و کاری نداشته باشند؛ و برای یک فرد، توفیقِ عظیمی است که با کتاب مأنوس و همواره در حال بهره‌گیری از آن، یعنی آموختن چیزهای تازه باشد.",
  "با این دیدگاه، به‌روشنی می‌توان ارزش و مفهومِ رمزیِ عمیق این حقیقتِ تاریخی را دریافت که اوّلین خطابِ خداوندِ متعال به پیامبرِ گرامی اسلام (صلّی‌الله‌علیه‌وآله) این است که: بخوان!",
  "و در اوّلین سوره‌ای که بر آن فرستادهٔ عظیم‌الشّأنِ خداوند فرود آمده، نامِ «قلم» به تجلیل یاد شده است.",
];

const DEFAULT_SOURCE = "از بیانات رهبر انقلاب اسلامی دربارهٔ کتاب و کتاب‌خوانی";

/** تصویر پیش‌فرض اگر ادمین هنوز چیزی در پنل نگذاشته باشد. */
const FALLBACK_PORTRAIT: LeaderPortrait = {
  id: -1,
  image_url: "/img/emam-reading.jpg",
  alt: "تصویر حضرت آیت‌الله خامنه‌ای در حال مطالعهٔ کتاب در کتابخانه",
  caption: "",
  caption_paragraphs: [],
  source: "",
  show_in_box: true,
};

export function ReadingSection({
  bookStories,
  portraits,
}: {
  bookStories: number;
  portraits: LeaderPortrait[];
}) {
  const gallery = portraits.length > 0 ? portraits : [FALLBACK_PORTRAIT];
  const first = gallery[0] as LeaderPortrait;

  // کلام: اگر ادمین برای تصویر اول متنی نوشته، همان؛ وگرنه پیش‌فرض.
  const paragraphs = first.caption_paragraphs.length > 0 ? first.caption_paragraphs : DEFAULT_QUOTE;
  const source = first.source || DEFAULT_SOURCE;

  return (
    <section id="book" aria-labelledby="book-title" className="k185-reveal mt-14 scroll-mt-24">
      <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
        {/* هالهٔ کرمِ گرم پشتِ ستون متن */}
        <div
          aria-hidden="true"
          className="from-gold/[0.07] pointer-events-none absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l to-transparent"
        />

        <div className="relative grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(250px,36%)]">
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

            <div className="mt-4 flex items-center gap-2.5" aria-hidden="true">
              <span className="from-gold/60 h-px w-10 bg-gradient-to-l to-transparent" />
              <span className="text-gold/70">
                <Girih size={9} />
              </span>
              <span className="from-gold/30 h-px flex-1 bg-gradient-to-r to-transparent" />
            </div>

            <figure className="m-0 mt-3.5">
              <blockquote className="border-0 p-0">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={`text-text-muted text-[13px] leading-[2.15] sm:text-[13.5px] ${
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

          {/* ── گالری تصویر ── */}
          <div className="order-1 p-3 md:order-2 md:self-stretch md:p-4">
            <LeaderGallery items={gallery} bookTitle={SITE.bookTitle} />
          </div>
        </div>
      </div>
    </section>
  );
}
