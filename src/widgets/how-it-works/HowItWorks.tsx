import { SectionTitle } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";

/**
 * «سه گام تا کارنامه» — تنها جای صفحه که اعداد آزمون را می‌گوید.
 *
 * ── ایرادِ نسخهٔ قبل (که کاربر در تم روز و شب دید) ───────────────────────
 * شمارهٔ گام‌ها یک عدد ۶۴پیکسلی در گوشهٔ کارت با شفافیت ۶٪ بود. دو مشکل:
 *   • با `-top-3` از لبهٔ کارت بیرون می‌زد و `overflow-hidden` آن را از
 *     بالا می‌برید — «۱» و «۲» و «۳» نصفه دیده می‌شدند.
 *   • شفافیت ۶٪ در تم روز عملاً نامرئی بود و در تم شب هم لکه‌ای بی‌معنی.
 * یعنی عنصری که باید «ترتیب» را می‌گفت، خودش خراب بود.
 *
 * ── راه‌حل ───────────────────────────────────────────────────────────────
 * شماره از پس‌زمینه به **پیش‌زمینه** آمد: یک نشانِ کاشی‌مانند کوچک و
 * تمام‌رنگ در ردیف اول کارت، کنار «برچسب زمان» — با کنتراست کافی در هر
 * دو تم (رنگ متن `brand` روی پس‌زمینهٔ روشنِ برند، حاشیهٔ برند).
 * هیچ عددی از کادر بیرون نمی‌زند، و ترتیب در یک نگاه خوانده می‌شود:
 *   [۱] کمتر از ۱ دقیقه   →   [۲] ۵ دقیقه   →   [۳] بی‌درنگ
 *
 * ── چرا اعداد این‌جا هستند و در هیرو نه؟ ─────────────────────────────────
 * عدد وقتی معنا دارد که به یک گام گره بخورد. «۵ پرسش» و «۵ دقیقه» در
 * هیرو، دو عددِ شناور بودند؛ این‌جا هر عدد کنار کاری است که کاربر باید
 * بکند. برچسب زمان هم از دادهٔ زندهٔ سرور ساخته می‌شود، نه از متن ثابت.
 */
export function HowItWorks({ status }: { status: ExamStatus }) {
  const minutes = Math.max(1, Math.round(status.duration_seconds / 60));
  const count = status.questions_per_attempt;

  const steps = [
    {
      n: 1,
      time: "کمتر از ۱ دقیقه",
      title: "مشخصاتت را بنویس و مسجدت را انتخاب کن",
      body: "نام، کد ملی، شمارهٔ همراه و تاریخ تولد. مسجد محله‌ات را از فهرست انتخاب می‌کنی تا نتیجه به نام همان مسجد ثبت شود.",
    },
    {
      n: 2,
      time: `${toFa(minutes)} دقیقه`,
      title: `${toFa(count)} پرسش کوتاه از دلِ کتاب`,
      body: "ترتیب پرسش‌ها و جای گزینه‌ها برای هر نفر متفاوت است؛ پس پاسخِ نفر قبلی به کار کسی نمی‌آید.",
    },
    {
      n: 3,
      time: "بی‌درنگ",
      title: "کارنامه و کد رهگیری بگیر",
      body: "همان لحظه کارنامه صادر می‌شود؛ با کد رهگیری هر کسی می‌تواند اصالتش را استعلام کند.",
    },
  ] as const;

  return (
    <section id="steps" aria-labelledby="steps-title" className="k185-reveal mt-14 scroll-mt-24">
      <SectionTitle id="steps-title" eyebrow="راهِ کوتاه" title="سه گام تا کارنامه" index="۰۱" />

      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-3.5">
        {steps.map((s) => (
          <li
            key={s.n}
            className="group border-border bg-surface hover:border-brand/40 relative rounded-2xl border p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-24px_oklch(30%_0.08_258/0.5)] sm:p-5"
          >
            {/* ردیف اول: شمارهٔ گام + برچسب زمان، دو سرِ یک خط */}
            <div className="flex items-center justify-between gap-2">
              {/* شمارهٔ گام: کاشیِ ریز با گرادیان برند + حلقهٔ طلایی. تمام‌رنگ،
                  تا در تم روز هم دیده شود؛ و داخل کادر، تا هیچ‌جا بریده نشود. */}
              <span className="from-brand to-brand/85 text-on-brand ring-gold/35 relative grid size-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br text-[13px] font-extrabold tabular-nums ring-1">
                {toFa(s.n)}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[11px] shadow-[inset_0_1px_0_oklch(100%_0_0/0.22)]"
                />
              </span>
              <span className="text-on-gold bg-gold inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-extrabold">
                {s.time}
              </span>
            </div>

            <h3 className="text-text mt-3 text-[14.5px] leading-6 font-extrabold">{s.title}</h3>
            <p className="text-text-muted mt-1.5 text-[12.5px] leading-7">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
