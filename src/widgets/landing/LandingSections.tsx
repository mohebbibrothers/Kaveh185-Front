"use client";

import { ReadingSection } from "@/widgets/landing/ReadingSection";
import { LeaderboardTeaser } from "@/widgets/landing/LeaderboardTeaser";
import { ClosingBand } from "@/widgets/landing/ClosingBand";
import { HowItWorks } from "@/widgets/how-it-works/HowItWorks";
import { SectionTitle } from "@/shared/ui/Ornament";
import { FreshnessLine } from "@/shared/ui/FreshnessLine";
import { useData } from "@/shared/api/data-context";
import { SITE } from "@/shared/config/site";
import { faJalali } from "@/shared/lib/fa";
import type { Bootstrap } from "@/shared/api/landing";

/**
 * بخش‌های صفحهٔ اول — زیر هیرو.
 *
 * ── نقشهٔ صفحه و منطقِ حذف‌ها ─────────────────────────────────────────────
 *
 *   ۱. **سه گام تا کارنامه**  → «چه کاری باید بکنم؟»
 *   ۲. **کتاب و تصویر مطالعه** → «چه چیزی باید بخوانم و چرا؟»
 *   ۳. **دربارهٔ مسابقه**      → «این چه رویدادی است و چه کسی برگزار می‌کند؟»
 *   ۴. **پیش‌نمایش جدول**      → «رقابت چطور است؟» (سه نفر، نه جدول کامل)
 *   ۵. **بنر پایانی**          → یک اقدام
 *
 * چه چیزی از صفحه حذف شد و **کجا رفت**:
 *   • فهرست ۲۴ مسجد با کد و محله  → صفحهٔ `/mosques` (جست‌وجو + آمار کامل)
 *   • جدول هشت‌ردیفهٔ کامل          → همان صفحه، پیش‌نمایش سه‌ردیفه این‌جا ماند
 *   • چهار قاعدهٔ مسابقه           → صفحهٔ `/rules` (با توضیح و دلیل کامل)
 *   • بلوک چهارعددی آمار           → یک ردیف کوتاه در هیرو، بقیه در گام‌ها
 *
 * دلیل: صفحهٔ اول باید «تصمیم بگیر» را بفروشد، نه این‌که همهٔ محتوای سایت
 * را یک‌جا تحویل بدهد. اگر کاربر همه‌چیز را همین‌جا داشته باشد، صفحات
 * دیگر مرده‌اند و سایت به یک صفحهٔ بلند تبدیل می‌شود.
 *
 * ترتیب، روایت است: انگیزه → کتاب → رویداد → رقابت → اقدام.
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
        <div className="border-border bg-surface rounded-2xl border p-5 sm:p-6">
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

      <div className="k185-reveal mt-14 scroll-mt-24">
        <LeaderboardTeaser board={data.leaderboard} />
      </div>

      <div className="k185-reveal">
        <ClosingBand />
      </div>
    </div>
  );
}
