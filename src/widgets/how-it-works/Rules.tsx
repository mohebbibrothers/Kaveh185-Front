import { toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";

export function Rules({ status }: { status: ExamStatus }) {
  const rules = [
    {
      ok: true,
      title: "هر نفر فقط یک بار",
      body: "پس از تکمیل آزمون، امکان شرکت دوباره وجود ندارد؛ کد ملی و شمارهٔ تماس یکتا هستند.",
    },
    {
      ok: true,
      title: `همهٔ ${toFa(status.questions_per_attempt)} سؤال باید پاسخ داده شوند`,
      body: "میان سؤال نمی‌توان جابه‌جا شد یا سؤالی را بی‌پاسخ گذاشت؛ مگر اینکه زمان آزمون تمام شود.",
    },
    {
      ok: false,
      title: "پاسخ درست و غلط، نمایش داده نمی‌شود",
      body: "برای حفظ عدالت و جلوگیری از لو رفتن سؤال‌ها، نتیجهٔ تک‌تک سؤال‌ها نه در حین آزمون و نه در کارنامه اعلام نمی‌شود.",
    },
    {
      ok: true,
      title: "تایمر سرور، ملاک است",
      body: "زمان از لحظهٔ شروع روی سرور ثبت می‌شود؛ با بستن یا رفرش صفحه تایمر متوقف نمی‌شود.",
    },
  ];

  return (
    <section id="rules" aria-labelledby="rules-title" className="mt-12">
      <div className="mb-5">
        <p className="text-brick text-[11.5px] font-extrabold tracking-wide">قوانین</p>
        <h2 id="rules-title" className="mt-1 text-[clamp(19px,2.6vw,26px)] font-extrabold">
          چهار قاعدهٔ ساده، برای رقابتی عادلانه
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {rules.map((r) => (
          <li key={r.title} className="border-border bg-surface flex gap-3 rounded-xl border p-4">
            <span
              aria-hidden="true"
              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[13px] font-extrabold ${
                r.ok ? "bg-verde-soft text-verde" : "bg-brick-soft text-brick"
              }`}
            >
              {r.ok ? "✓" : "×"}
            </span>
            <div>
              <h3 className="text-[14px] font-extrabold">{r.title}</h3>
              <p className="text-text-muted mt-1 text-[12.5px] leading-7">{r.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
