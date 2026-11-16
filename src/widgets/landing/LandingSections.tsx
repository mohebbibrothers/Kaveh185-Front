"use client";

import Image from "next/image";
import Link from "next/link";
import { Leaderboard } from "@/widgets/leaderboard/Leaderboard";
import { HowItWorks } from "@/widgets/how-it-works/HowItWorks";
import { Mosques } from "@/widgets/mosques/Mosques";
import { Rules } from "@/widgets/how-it-works/Rules";
import { SectionTitle } from "@/shared/ui/Ornament";
import { FreshnessLine } from "@/shared/ui/FreshnessLine";
import { useData } from "@/shared/api/data-context";
import { SITE } from "@/shared/config/site";
import { faJalali, toFa } from "@/shared/lib/fa";
import type { Bootstrap } from "@/shared/api/landing";

/**
 * بخش‌های صفحهٔ اول — زیر هیرو.
 *
 * ترتیب، روایت صفحه است: «چطور شرکت کنم؟» → «کتاب کدام است و کجا
 * بخوانم؟» → «مسجد من کجاست؟» → «رقابت چطور است؟» → «قوانین چیست؟».
 *
 * چرا دربارهٔ مسابقه به دو کارت شکسته شد؟ کارت اول هویت رویداد (کتاب،
 * برگزارکننده، بازه) و کارت دوم جدول زنده است. قبلاً هر دو در یک ستون
 * بودند و جدول، قدِ کارت متن را تعیین می‌کرد.
 */
export function LandingSections({ initial }: { initial: Bootstrap }) {
  const { data, freshness, lastOk } = useData({
    data: initial,
    freshness: "shell",
    lastOk: initial.server_time,
  });
  const status = data.exam_status;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <HowItWorks status={status} />

      {/* ── کتاب مسابقه ──
          عمداً ایستا (بدون درخواست API): نام کتاب ثابت است و صفحهٔ /book
          خودش فایل را از API می‌گیرد. نسخهٔ اول این بخش با `useState` و
          `fetch` ساخته شده بود و ۴KB کد کلاینت به صفحهٔ اول اضافه می‌کرد
          برای چیزی که هیچ‌وقت عوض نمی‌شود. */}
      <section id="book" aria-labelledby="book-title" className="mt-14">
        <div className="border-border bg-surface relative overflow-hidden rounded-2xl border">
          <div
            aria-hidden="true"
            className="from-brand/[0.06] pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-l to-transparent"
          />
          <div className="relative grid items-center gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
            <div>
              <p className="text-gold-strong text-[11.5px] font-extrabold tracking-wide">
                کتاب مسابقه — قابل مطالعهٔ آنلاین
              </p>
              <h2
                id="book-title"
                className="text-text mt-1.5 text-[clamp(19px,2.6vw,25px)] font-extrabold"
              >
                {SITE.bookTitle}
              </h2>
              <p className="text-text-muted mt-2.5 max-w-[62ch] text-[13px] leading-[2]">
                مجموعه‌ای از {toFa(SITE.bookStories)} داستان کوتاه. پرسش‌های آزمون از همین داستان‌ها
                انتخاب می‌شوند؛ خواندن دقیق داستان‌ها کافی است و حفظ‌کردن لازم نیست.
              </p>
              <p className="text-text-subtle mt-3 flex items-center gap-1.5 text-[11.5px]">
                <span className="bg-verde inline-block size-1.5 rounded-full" aria-hidden="true" />
                متن کامل کتاب در همین سایت قابل مطالعه است.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:w-[176px]">
              <Link
                href="/book"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center justify-center rounded-xl px-5 text-[13.5px] font-extrabold transition-colors"
              >
                مطالعهٔ کتاب
              </Link>
              <Link
                href="/rules"
                className="border-border-strong text-text hover:bg-surface-2 inline-flex h-11 items-center justify-center rounded-xl border px-5 text-[12.5px] font-bold transition-colors"
              >
                قوانین مسابقه
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── دربارهٔ مسابقه ── */}
      <section id="about" aria-labelledby="about-title" className="mt-14">
        <SectionTitle
          id="about-title"
          eyebrow="دربارهٔ مسابقه"
          title="مسابقه‌ای که از مسجد شروع می‌شود"
          index="۰۱"
        />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="border-border bg-surface rounded-2xl border p-5 sm:p-6">
            <p className="text-text-muted max-w-[62ch] text-[13px] leading-[2.05]">
              هفتهٔ بسیج هر سال فرصتی است برای برگشتن به مسجد و محله. این مسابقه همان فرصت را به شکل
              مطالعهٔ یک کتاب کوتاه و چند پرسش ساده ساخته است: هر شرکت‌کننده مسجد خودش را انتخاب
              می‌کند و نتیجهٔ او به نام همان مسجد ثبت می‌شود. هیچ جایزه‌ای جای مطالعه را نمی‌گیرد؛
              اما مطالعهٔ مشترک، محله را به هم نزدیک‌تر می‌کند.
            </p>

            <dl className="border-border mt-5 grid grid-cols-2 gap-x-5 gap-y-3.5 border-t pt-4 text-[12.5px] sm:grid-cols-2">
              <div>
                <dt className="text-text-subtle">کتاب مسابقه</dt>
                <dd className="text-text mt-0.5 font-bold">{status.book_title}</dd>
              </div>
              <div>
                <dt className="text-text-subtle">برگزارکننده</dt>
                <dd className="text-text mt-0.5 font-bold">{status.organizer_name}</dd>
              </div>
              <div>
                <dt className="text-text-subtle">بازهٔ مسابقه</dt>
                <dd className="text-text mt-0.5 font-bold tabular-nums">
                  {status.starts_at_jalali && status.ends_at_jalali
                    ? `${faJalali(status.starts_at_jalali)} — ${faJalali(status.ends_at_jalali)}`
                    : "در حال دریافت…"}
                </dd>
              </div>
              <div>
                <dt className="text-text-subtle">پرسش در بانک</dt>
                <dd className="text-text mt-0.5 font-bold tabular-nums">
                  {status.active_question_bank_size > 0
                    ? `${toFa(status.active_question_bank_size)} پرسش`
                    : "—"}
                </dd>
              </div>
            </dl>

            <p className="text-text-subtle mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-6">
              اطلاع‌رسانی مسابقه فقط در
              <a
                href={SITE.channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold hover:underline"
              >
                {SITE.channel.name}
              </a>
              ({SITE.channel.handle}) در {SITE.channel.platform} است.
            </p>
            <FreshnessLine freshness={freshness} lastOk={lastOk} className="mt-3" />
          </div>

          <Leaderboard board={data.leaderboard} />
        </div>
      </section>

      <Mosques mosques={data.mosques} totalActive={data.leaderboard.total_active_mosques} />

      <Rules status={status} />

      {/* ── بنر پایانی ── */}
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
            className="absolute inset-y-0 left-0 h-full w-auto object-cover opacity-25"
          />
          <div
            aria-hidden="true"
            className="from-stage via-stage/90 to-stage/45 absolute inset-0 bg-gradient-to-l"
          />
          <div className="relative px-5 py-9 sm:px-9 sm:py-11">
            <h2
              id="closing-title"
              className="text-on-stage max-w-[36ch] text-[clamp(19px,2.8vw,27px)] leading-snug font-extrabold"
            >
              سهم مسجد محله‌ات را از یک کارنامه شروع کن.
            </h2>
            <p className="text-on-stage-muted mt-2.5 max-w-[52ch] text-[13px] leading-[2]">
              نام، کد ملی، شمارهٔ تماس و انتخاب مسجد — همین. پرسش‌ها از کتاب «{SITE.bookTitle}» است و
              هزینه‌ای ندارد.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/register"
                className="bg-gold text-on-gold hover:bg-gold-strong inline-flex h-11 items-center rounded-xl px-6 text-[13.5px] font-extrabold transition-colors"
              >
                ثبت‌نام و شرکت
              </Link>
              <Link
                href="/receipt"
                className="text-on-stage ring-on-stage/25 hover:bg-on-stage/10 inline-flex h-11 items-center rounded-xl px-5 text-[13px] font-bold ring-1 transition-colors"
              >
                استعلام کارنامه
              </Link>
              <Link
                href="/book"
                className="text-on-stage ring-on-stage/25 hover:bg-on-stage/10 inline-flex h-11 items-center rounded-xl px-5 text-[13px] font-bold ring-1 transition-colors"
              >
                مطالعهٔ کتاب
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
