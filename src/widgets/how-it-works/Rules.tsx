import { toFa } from "@/shared/lib/fa";
import type { ExamStatus } from "@/shared/api/landing";
import { SectionTitle } from "@/shared/ui/Ornament";

/**
 * قوانین — چهار قاعده، هر کدام با یک دلیل.
 *
 * ── چرا بازنویسی شد؟ ──────────────────────────────────────────────────────
 * نسخهٔ قبل قاعده را می‌گفت ولی دلیلش را نه؛ و متن‌ها طولانی و پرِ
 * اصطلاح بودند («تایمر سرور ملاک است»). قاعده‌ای که کاربر دلیلش را
 * بفهمد، کمتر باعث پشتیبانی می‌شود. هر آیتم حالا دو بخش دارد: **قاعده**
 * (یک جمله، بی‌ابهام) و **دلیل** (یک جمله، به زبان کاربر).
 */
export function Rules({ status }: { status: ExamStatus }) {
  const count = toFa(status.questions_per_attempt);
  const rules = [
    {
      tone: "ok" as const,
      title: "هر کد ملی، یک بار",
      reason: "پس یک بار شانس، برای همه برابر — نه بیشتر برای کسی که سریع‌تر ثبت‌نام کرده.",
    },
    {
      tone: "ok" as const,
      title: `هر ${count} پرسش را پاسخ بده`,
      reason: "پرسش بی‌پاسخ، امتیازش را از دست می‌دهد؛ جابه‌جایی میان پرسش‌ها آزاد است.",
    },
    {
      tone: "warn" as const,
      title: "پاسخ درست هر پرسش، اعلام نمی‌شود",
      reason: "اگر اعلام شود، نفر بعدی می‌داند چه چیزی پرسیده شده؛ عدالت مسابقه حفظ نمی‌شود.",
    },
    {
      tone: "ok" as const,
      title: "زمانِ آزمون از سرور می‌آید",
      reason: "بستن صفحه یا خاموش‌کردن گوشی، تایمر را متوقف نمی‌کند.",
    },
  ];

  return (
    <section id="rules" aria-labelledby="rules-title" className="mt-14">
      <SectionTitle
        id="rules-title"
        eyebrow="قوانین"
        title="چهار قاعده، برای رقابتی که عادلانه بماند"
        tone="brick"
        index="۰۴"
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {rules.map((r) => (
          <li
            key={r.title}
            className="border-border bg-surface hover:border-border-strong rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg ${
                  r.tone === "ok" ? "bg-verde-soft text-verde" : "bg-brick-soft text-brick"
                }`}
              >
                {r.tone === "ok" ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                  >
                    <path d="M5 12.5 10 17l9-9.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                  >
                    <path d="M12 7v6M12 16.6v.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <div className="min-w-0">
                <h3 className="text-text text-[13.5px] font-extrabold">{r.title}</h3>
                <p className="text-text-muted mt-1 text-[12.5px] leading-7">{r.reason}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
