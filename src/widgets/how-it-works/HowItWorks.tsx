import { faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { SectionTitle } from "@/shared/ui/Ornament";

/**
 * «چگونه شرکت کنم» — سه گام، هر گام با زمان و نتیجهٔ مشخص.
 *
 * ── چرا بازنویسی شد؟ ──────────────────────────────────────────────────────
 * متن‌های قبلی کار را توصیف می‌کردند ولی «چقدر طول می‌کشد» و «چه چیزی
 * دستم می‌آید» را نه. کاربرِ موبایل قبل از شروع، دقیقاً همین دو چیز را
 * می‌خواهد بداند. هر گام حالا سه بخش دارد: شماره، عنوان کوتاه، و یک جملهٔ
 * «چه می‌شود» + برچسب زمان.
 */
const STEPS = [
  {
    n: 1,
    time: "۱ دقیقه",
    title: "مشخصات و مسجدت را انتخاب کن",
    body: "نام، کد ملی، شمارهٔ تماس و تاریخ تولد؛ بعد مسجد محله‌ات را از فهرست انتخاب کن.",
  },
  {
    n: 2,
    time: "۵ دقیقه",
    title: "به پرسش‌های کتاب پاسخ بده",
    body: "پرسش‌ها از کتاب «شهادت آیه‌ها (۲)» است. ترتیب پرسش‌ها و گزینه‌ها برای هر نفر متفاوت است.",
  },
  {
    n: 3,
    time: "بی‌درنگ",
    title: "کارنامه و سهم مسجدت را بگیر",
    body: "کد رهگیری می‌گیری و نام مسجدت در جدول مشارکت بالا می‌رود.",
  },
] as const;

export function HowItWorks({ status }: { status: ExamStatus }) {
  return (
    <section id="steps" aria-labelledby="steps-title" className="mt-14">
      <SectionTitle
        id="steps-title"
        eyebrow="راهِ کوتاه"
        title="سه گام تا کارنامه"
        index="۰۲"
        action={
          <span className="border-gold/40 bg-gold-soft text-gold-strong rounded-full border px-3 py-1.5 text-[12px] font-bold">
            ثبت‌نام کمتر از یک دقیقه
          </span>
        }
      />

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="group border-border bg-surface hover:border-brand/35 shadow-1 ease-standard relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 sm:p-5"
          >
            {/* شمارهٔ بزرگِ پس‌زمینه — تزئین بی‌شلوغی */}
            <span
              aria-hidden="true"
              className="text-brand/[0.07] pointer-events-none absolute -top-3 left-2 text-[64px] leading-none font-black tabular-nums select-none"
            >
              {toFa(s.n)}
            </span>
            <div className="relative">
              <span className="text-gold-strong bg-gold-soft border-gold/25 inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-bold">
                {s.time}
              </span>
              <h3 className="text-text mt-2.5 text-[14.5px] font-extrabold">{s.title}</h3>
              <p className="text-text-muted mt-1.5 text-[12.5px] leading-7">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <dl className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { k: "پرسش در هر آزمون", v: toFa(status.questions_per_attempt) },
          { k: "دقیقه فرصت پاسخ", v: toFa(Math.round(status.duration_seconds / 60)) },
          { k: "بار مجاز شرکت", v: "۱" },
          {
            k: "پرسش در بانک آزمون",
            // صفر یعنی «هنوز از API خوانده نشده»، نه «بانک خالی است».
            v:
              status.active_question_bank_size > 0
                ? faNumber(status.active_question_bank_size)
                : "—",
          },
        ].map((x) => (
          <div
            key={x.k}
            className="border-border bg-surface rounded-xl border px-3 py-2.5 text-center"
          >
            <dd className="text-text text-[clamp(18px,2.4vw,22px)] font-extrabold tabular-nums">
              {x.v}
            </dd>
            <dt className="text-text-subtle mt-0.5 text-[10.5px]">{x.k}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
