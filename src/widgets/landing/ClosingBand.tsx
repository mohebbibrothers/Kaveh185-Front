import Image from "next/image";
import Link from "next/link";
import { Girih } from "@/shared/ui/Ornament";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

/**
 * بنر پایانی — یک جمله، یک دکمه.
 *
 * ── چرا بازنویسی شد؟ ──────────────────────────────────────────────────────
 * نسخهٔ قبل سه دکمهٔ هم‌وزن داشت («ثبت‌نام و شرکت»، «استعلام کارنامه»،
 * «مطالعهٔ کتاب») و همهٔ آن‌ها پیش‌تر در صفحه آمده بودند. سه دکمهٔ هم‌وزن
 * یعنی هیچ‌کدام «راهِ اصلی» نیست؛ و تکرارِ دکمه، اعتماد را کم می‌کند نه
 * بیشتر: کاربر فکر می‌کند صفحه می‌خواهد او را به زور جایی ببرد.
 *
 * اکنون: یک جملهٔ انسانی، یک دکمهٔ طلایی (تنها دکمهٔ طلایی صفحه، برای
 * تمایز آخرین قدم)، و یک لینکِ متنی برای کسی که فقط می‌خواهد کارنامه‌اش
 * را ببیند. تصویر پوستر هم فقط به‌عنوان بافتِ سمت چپ می‌ماند، نه موضوع.
 */
export function ClosingBand() {
  return (
    <section className="mt-14 mb-4" aria-labelledby="closing-title">
      <div className="bg-stage relative overflow-hidden rounded-2xl">
        <Image
          src="/img/kaveh-poster.jpg"
          alt=""
          aria-hidden="true"
          width={1254}
          height={1792}
          sizes="(max-width: 767px) 100vw, 1100px"
          loading="lazy"
          className="absolute inset-y-0 left-0 h-full w-auto object-cover opacity-20"
        />
        <div
          aria-hidden="true"
          className="from-stage via-stage/92 to-stage/50 absolute inset-0 bg-gradient-to-l"
        />
        <div className="relative px-5 py-9 sm:px-9 sm:py-11">
          <p className="text-gold flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide">
            <Girih size={11} />
            کمتر از ۱۰ دقیقه، از خانه
          </p>
          <h2
            id="closing-title"
            className="text-on-stage mt-2.5 max-w-[34ch] text-[clamp(19px,2.8vw,27px)] leading-snug font-extrabold"
          >
            سهم مسجد محله‌ات را از یک کارنامه شروع کن.
          </h2>
          <p className="text-on-stage-muted mt-2.5 max-w-[50ch] text-[13px] leading-[2]">
            پرسش‌ها از کتاب «{SITE.bookTitle}» است؛ {toFa(SITE.bookStories)} داستان کوتاه که همین‌جا
            قابل مطالعه است. هزینه‌ای ندارد.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/register"
              className="bg-gold text-on-gold hover:bg-gold-strong inline-flex h-11 items-center gap-2 rounded-xl px-6 text-[13.5px] font-extrabold transition-colors"
            >
              ثبت‌نام و شرکت
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
            <Link
              href="/receipt"
              className="text-on-stage-muted hover:text-on-stage text-[12.5px] font-bold underline decoration-current/30 decoration-1 underline-offset-4 transition-colors hover:decoration-current"
            >
              قبلاً شرکت کرده‌ام — استعلام کارنامه
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
