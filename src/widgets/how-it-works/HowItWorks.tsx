import { SectionTitle } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";

/**
 * «سه گام تا کارنامه» — تنها جای صفحه که **اعداد** آزمون را می‌گوید.
 *
 * ── دو تغییر عمدی ─────────────────────────────────────────────────────────
 * ۱) **بلوک چهارعددی زیر گام‌ها حذف شد.** همان اعداد (پرسش هر آزمون،
 *    دقیقهٔ فرصت، یک‌بار شرکت) در هیرو به‌صورت یک ردیف کوتاه آمده‌اند و
 *    تکرارشان در دو بخش پشت‌سرهم، صفحه را شلوغ می‌کرد. این‌جا عدد فقط
 *    جایی می‌آید که **معنایش با گام گره خورده**: «۱ دقیقه» برای ثبت‌نام،
 *    «۵ دقیقه» برای پاسخ، «بی‌درنگ» برای کارنامه.
 * ۲) **برچسب زمان، از دادهٔ واقعی می‌آید** (تعداد پرسش × زمان آزمون)، نه
 *    از یک عدد ثابت در متن. اگر ادمین مدت آزمون را عوض کند، متن گام دوم
 *    خودش عوض می‌شود.
 *
 * نتیجه: سه کارتِ کوتاه، هر کدام یک جمله دربارهٔ «چه می‌شود»، و یک خط
 * پایانی که کاربر را به گام اول می‌برد.
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

      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="group border-border bg-surface hover:border-brand/35 hover:shadow-1 relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 sm:p-5"
          >
            <span
              aria-hidden="true"
              className="text-brand/[0.06] pointer-events-none absolute -top-3 left-2 text-[64px] leading-none font-black tabular-nums select-none"
            >
              {toFa(s.n)}
            </span>
            <div className="relative">
              <span className="text-on-gold bg-gold inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-extrabold">
                {s.time}
              </span>
              <h3 className="text-text mt-2.5 text-[14.5px] leading-6 font-extrabold">{s.title}</h3>
              <p className="text-text-muted mt-1.5 text-[12.5px] leading-7">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
