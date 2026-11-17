"use client";

import { ReadingSection } from "@/widgets/landing/ReadingSection";
import { HowItWorks } from "@/widgets/how-it-works/HowItWorks";
import { SectionTitle } from "@/shared/ui/Ornament";
import { FreshnessLine } from "@/shared/ui/FreshnessLine";
import { useData } from "@/shared/api/data-context";
import { SITE } from "@/shared/config/site";
import { faJalali } from "@/shared/lib/fa";
import type { Bootstrap } from "@/shared/api/landing";

/**
 * بخش‌های صفحهٔ اول — زیر هیرو. سه بخش، هر کدام یک کار.
 *
 * ── نقشهٔ صفحه ────────────────────────────────────────────────────────────
 *
 *   هیرو            «این چیست، تا کِی، از کجا شروع کنم؟»
 *   ۰۱ سه گام        «چه کاری باید بکنم؟»
 *   —  کتاب + کلام   «چه بخوانم و چرا؟»
 *   ۰۲ دربارهٔ مسابقه «چه رویدادی است، کِی، برگزارکننده کیست؟»
 *   فوتر
 *
 * ── چرا صفحه این‌قدر کوتاه شد؟ ────────────────────────────────────────────
 * این نوبت، سه بخشِ کامل حذف شد به درخواست کاربر:
 *   • **جدول مساجد** (پیش‌نمایش سه‌نفره + لینک) → کل جدول فقط در `/mosques`.
 *   • **بنر پایانی «سهم مسجد محله‌ات را از یک کارنامه شروع کن»** → با هیرو
 *     هم‌پیام و هم‌اقدام بود؛ تکرارِ اقدام در انتهای صفحه، صفحه را «فروشنده»
 *     نشان می‌داد. اکنون صفحه با «دربارهٔ مسابقه» تمام می‌شود — آرام.
 *   • **نوارِ «مسابقه رایگان است…» بالای فوتر** → همان اطلاعات در گام اول
 *     آمده است؛ حذف شد.
 *
 * نتیجه: از «شش بلوک سنگین» به «سه بلوک + هیرو». هر بلوک یک تصمیم می‌گیرد
 * و هیچ بلوکی تکرارِ بلوکِ دیگر نیست.
 *
 * ⚠️ دربارهٔ عددِ مشارکت: صفحهٔ اول دیگر هیچ آمارِ زنده‌ای نشان نمی‌دهد،
 * پس بارِ شبکه‌ای اضافه هم ندارد؛ اما وضعیتِ آزمون و بازهٔ زمانی همچنان
 * از همان `/api/v1/core/bootstrap/` می‌آید و در هیرو و این بخش استفاده
 * می‌شود — یک درخواست، دو مصرف.
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

      <ReadingSection bookStories={SITE.bookStories} />

      {/* ── دربارهٔ مسابقه ──
          کوتاه و انسانی: یک پاراگراف «چرا» + یک ردیف «چه/کِی/کجا».
          بازه از دادهٔ زنده می‌آید؛ پیش از رسیدن آن «در حال دریافت…». */}
      <section id="about" aria-labelledby="about-title" className="k185-reveal mt-14 scroll-mt-24">
        <SectionTitle
          id="about-title"
          eyebrow="دربارهٔ مسابقه"
          title="مسابقه‌ای که از مسجد شروع می‌شود"
          index="۰۲"
        />
        <div className="border-border bg-surface relative overflow-hidden rounded-2xl border p-5 sm:p-6">
          <div
            aria-hidden="true"
            className="k185-girih-veil pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] opacity-[0.16] lg:block"
          />
          <p className="text-text-muted relative max-w-[46rem] text-[13.5px] leading-[2.1] sm:text-[14px]">
            هفتهٔ بسیج هر سال فرصتی است برای برگشتن به مسجد و محله. این مسابقه همان فرصت را به یک
            کتاب کوتاه و چند پرسش ساده تبدیل کرده است: هر شرکت‌کننده مسجد خودش را انتخاب می‌کند و
            نتیجه به نام همان مسجد ثبت می‌شود. جایزه‌ای جای مطالعه را نمی‌گیرد؛ اما مطالعهٔ مشترک،
            محله را به هم نزدیک‌تر می‌کند.
          </p>

          <dl className="border-border relative mt-5 grid gap-x-6 gap-y-4 border-t pt-4 text-[12.5px] sm:grid-cols-3">
            <div>
              <dt className="text-text-subtle">کتاب مسابقه</dt>
              <dd className="text-text mt-0.5 font-bold">{status.book_title || SITE.bookTitle}</dd>
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
              <dt className="text-text-subtle">برگزارکننده</dt>
              <dd className="text-text mt-0.5 font-bold">
                {status.organizer_name || SITE.organizer}
              </dd>
            </div>
          </dl>

          <div className="border-border relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3.5">
            <p className="text-text-subtle text-[11px] leading-6">
              اطلاع‌رسانی رسمی فقط در{" "}
              <a
                href={SITE.channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold hover:underline"
              >
                {SITE.channel.name}
              </a>{" "}
              در پیام‌رسان {SITE.channel.platform}.
            </p>
            <FreshnessLine freshness={freshness} lastOk={lastOk} />
          </div>
        </div>
      </section>
    </div>
  );
}
