import { faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";

const steps = [
  {
    n: 1,
    title: "مسجد خودت را انتخاب کن",
    body: "نام، نام خانوادگی، کد ملی، شمارهٔ تماس و تاریخ تولد را وارد کن و از فهرست، مسجد محلهٔ خودت را انتخاب کن.",
  },
  {
    n: 2,
    title: "به پنج سؤال پاسخ بده",
    body: "ترتیب سؤال‌ها و گزینه‌ها برای هر نفر متفاوت است. هر سؤال یک پاسخ صحیح دارد و باید همه را پاسخ دهی.",
  },
  {
    n: 3,
    title: "کارنامه‌ات را بگیر",
    body: "تعداد پاسخ‌های درست، نادرست و بی‌پاسخ را می‌بینی، کد رهگیری می‌گیری و در جدول مساجد سهیم می‌شوی.",
  },
] as const;

export function HowItWorks({ status }: { status: ExamStatus }) {
  return (
    <section id="steps" aria-labelledby="steps-title" className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold-strong text-[11.5px] font-extrabold tracking-wide">راهِ کوتاه</p>
          <h2 id="steps-title" className="mt-1 text-[clamp(19px,2.6vw,26px)] font-extrabold">
            در سه گام، پای کارت هستی
          </h2>
        </div>
        <span className="border-gold/40 bg-gold-soft text-gold-strong rounded-full border px-3 py-1.5 text-[12px] font-bold">
          کمتر از ۲ دقیقه برای ثبت‌نام
        </span>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="border-border bg-surface shadow-1 ease-standard rounded-xl border p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5"
          >
            <span className="bg-stage text-gold grid size-9 place-items-center rounded-lg text-[14px] font-extrabold">
              {toFa(s.n)}
            </span>
            <h3 className="mt-3 text-[15px] font-extrabold">{s.title}</h3>
            <p className="text-text-muted mt-1.5 text-[13px] leading-7">{s.body}</p>
          </li>
        ))}
      </ol>

      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "سؤال در هر آزمون", v: toFa(status.questions_per_attempt) },
          { k: "دقیقه فرصت پاسخ", v: toFa(Math.round(status.duration_seconds / 60)) },
          { k: "بار مجاز شرکت", v: "۱" },
          {
            k: "سؤال در بانک آزمون",
            // صفر یعنی «هنوز از API خوانده نشده»، نه «بانک خالی است».
            v:
              status.active_question_bank_size > 0
                ? faNumber(status.active_question_bank_size)
                : "—",
          },
        ].map((x) => (
          <div key={x.k} className="border-border bg-surface rounded-lg border p-3 text-center">
            <dt className="text-text-subtle order-2 mt-1 text-[11px]">{x.k}</dt>
            <dd className="text-text text-[clamp(19px,2.6vw,24px)] font-extrabold tabular-nums">
              {x.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
