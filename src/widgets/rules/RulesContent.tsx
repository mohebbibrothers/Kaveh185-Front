"use client";

import { useBootstrap } from "@/shared/api/use-bootstrap";
import { toFa } from "@/shared/lib/fa";

/**
 * متن کامل قوانین + پرسش‌های رایج.
 *
 * ── چرا کلاینت؟ ────────────────────────────────────────────────────────────
 * سه عدد در متن هست (تعداد پرسش، مدت پاسخ، اندازهٔ بانک) و این اعداد نباید
 * در HTML ایستا پخته شوند؛ وگرنه اگر ادمین تنظیمات را عوض کند، صفحهٔ قوانین
 * عدد کهنه نشان می‌دهد — همان چیزی که اصل «هیچ عدد ساختگی» منع می‌کند.
 * عددها از API می‌آیند و تا رسیدنشان «—» است.
 */
const PRINCIPLES = [
  {
    n: "۰۱",
    title: "هر کد ملی، یک شرکت",
    body: "هر کد ملی فقط یک بار می‌تواند در آزمون شرکت کند. اگر آزمون نیمه‌کاره بماند و زمانش تمام شود، همان آزمون بسته می‌شود و فرصت تازه‌ای ساخته نمی‌شود. دلیلش ساده است: با فرصت چندباره، نتیجه به شانس و تکرار بستگی پیدا می‌کند، نه به مطالعه.",
  },
  {
    n: "۰۲",
    title: "پرسش‌ها به ترتیب پاسخ داده می‌شوند",
    body: "نمی‌توان از پرسشی گذشت و بعداً برگشت؛ تا پرسش جاری پاسخ نگیرد، پرسش بعد باز نمی‌شود. این قاعده از تقلب رایج جلوگیری می‌کند (کسی نمی‌تواند پرسش‌ها را ببیند، گزینه‌ها را بیرون بررسی کند و بعد برگردد). پرسشی که بی‌پاسخ بماند امتیاز نمی‌گیرد و در شمارش «بی‌پاسخ» می‌آید.",
  },
  {
    n: "۰۳",
    title: "پاسخ درست هر پرسش اعلام نمی‌شود",
    body: "کارنامه تعداد پاسخ‌های درست، نادرست و بی‌پاسخ را نشان می‌دهد، ولی نمی‌گوید کدام گزینه درست بود. اگر اعلام می‌شد، نفر بعدی می‌دانست چه پرسیده شده و عدالت مسابقه از بین می‌رفت.",
  },
  {
    n: "۰۴",
    title: "زمان، روی سرور اندازه گرفته می‌شود",
    body: "لحظهٔ شروع و پایان آزمون روی سرور ثبت می‌شود. بستن مرورگر، رفرش صفحه یا خاموش‌کردن گوشی، زمان را متوقف نمی‌کند. اگر اتصال کوتاه قطع شود، تا لحظهٔ اتمام زمان می‌توانید برگردید و ادامه دهید.",
  },
];

const FAQ = [
  {
    q: "پرسش‌ها از کجاست؟",
    a: "همهٔ پرسش‌ها از کتاب مسابقه انتخاب می‌شوند. متن کتاب در همین سایت، در صفحهٔ «مطالعهٔ کتاب» در دسترس است و پرسش‌ها فقط از داستان‌های همان کتاب طرح شده‌اند.",
  },
  {
    q: "آیا پرسش‌های همه یکسان است؟",
    a: "نه. پرسش‌ها از بانک پرسش و به‌صورت قرعه‌کشی منصفانه انتخاب می‌شوند؛ ترکیب سطح دشواری برای همه یکسان است و از هر داستان حداکثر یک پرسش می‌آید.",
  },
  {
    q: "ترتیب گزینه‌ها ثابت است؟",
    a: "نه؛ ترتیب گزینه‌های هر پرسش برای هر شرکت‌کننده متفاوت است. پس نمی‌توان از روی «گزینهٔ دوم» به جواب رسید.",
  },
  {
    q: "کارنامه چه زمانی صادر می‌شود؟",
    a: "بی‌درنگ پس از پاسخ به آخرین پرسش یا اتمام زمان. یک کد رهگیری می‌گیرید که با آن می‌توانید کارنامه را در صفحهٔ استعلام ببینید.",
  },
  {
    q: "اگر اینترنت قطع شود چه می‌شود؟",
    a: "پاسخ‌هایی که تا آن لحظه ثبت شده‌اند باقی می‌مانند. زمان آزمون متوقف نمی‌شود، ولی می‌توانید دوباره وارد شوید و ادامه دهید.",
  },
  {
    q: "اطلاعات شخصی من چه می‌شود؟",
    a: "کد ملی و شمارهٔ تماس فقط برای جلوگیری از شرکت تکراری و برقراری ارتباط دربارهٔ همان مسابقه استفاده می‌شوند. کد ملی در پایگاه‌داده به‌صورت رمزنگاری‌شده نگه‌داری می‌شود و در فهرست‌های عمومی نمایش داده نمی‌شود.",
  },
  {
    q: "می‌توانم مسجدم را بعداً عوض کنم؟",
    a: "خیر. مسجد انتخابی هنگام ثبت‌نام مشخص می‌شود و نتیجهٔ آزمون به نام همان مسجد ثبت می‌شود؛ تغییر بعدی، جدول مشارکت را بی‌معنی می‌کند.",
  },
];

export function RulesContent() {
  const state = useBootstrap();
  const status = state.phase === "ready" ? state.data.exam_status : null;
  const dash = "—";

  return (
    <div className="mt-6">
      {/* ── چهار اصل ── */}
      <ol className="space-y-3">
        {PRINCIPLES.map((p) => (
          <li key={p.n} className="border-border bg-surface rounded-2xl border p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="text-brand bg-brand/[0.08] border-brand/15 grid size-8 shrink-0 place-items-center rounded-lg border text-[11.5px] font-extrabold tabular-nums">
                {p.n}
              </span>
              <div className="min-w-0">
                <h2 className="text-text text-[14px] font-extrabold">{p.title}</h2>
                <p className="text-text-muted mt-1.5 text-[12.5px] leading-[2]">{p.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* ── عددهای واقعی ── */}
      <dl className="mt-6 grid grid-cols-3 gap-2.5">
        {[
          { k: "پرسش در هر آزمون", v: status ? toFa(status.questions_per_attempt) : dash },
          {
            k: "دقیقه فرصت پاسخ",
            v: status ? toFa(Math.round(status.duration_seconds / 60)) : dash,
          },
          {
            k: "پرسش در بانک",
            v:
              status && status.active_question_bank_size > 0
                ? toFa(status.active_question_bank_size)
                : dash,
          },
        ].map((x) => (
          <div
            key={x.k}
            className="border-border bg-surface rounded-xl border px-3 py-3 text-center"
          >
            <dd className="text-text text-[clamp(18px,2.4vw,22px)] font-extrabold tabular-nums">
              {x.v}
            </dd>
            <dt className="text-text-subtle mt-0.5 text-[10.5px]">{x.k}</dt>
          </div>
        ))}
      </dl>
      {state.phase === "error" ? (
        <p className="text-text-subtle mt-2 text-center text-[11px]">
          اعداد از سرور خوانده نشد؛ صفحه را دوباره باز کنید.
        </p>
      ) : null}

      {/* ── پرسش‌های رایج ── */}
      <h2 className="text-text mt-10 text-[clamp(19px,2.6vw,24px)] font-extrabold">
        پرسش‌های رایج
      </h2>
      <div className="mt-3 space-y-2">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group border-border bg-surface open:bg-surface-2/60 rounded-xl border p-4 transition-colors"
          >
            <summary className="text-text flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-extrabold">
              {f.q}
              <span
                aria-hidden="true"
                className="text-text-subtle shrink-0 transition-transform group-open:rotate-45"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="text-text-muted mt-2.5 text-[12.5px] leading-[2]">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
