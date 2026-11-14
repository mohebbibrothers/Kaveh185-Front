import Link from "next/link";
import { PersianPattern } from "@/shared/ui/PersianPattern";
import { Star } from "@/shared/ui/Ornament";
import { Countdown } from "@/widgets/countdown/Countdown";
import { faNumber, toFa } from "@/shared/lib/fa";
import type { ExamStatus, Leaderboard } from "@/shared/api/landing";

const STATE: Record<ExamStatus["window_state"], { text: string; cls: string }> = {
  upcoming: { text: "به‌زودی آغاز می‌شود", cls: "border-gold/45 bg-gold/15 text-gold" },
  open: { text: "آزمون فعال است", cls: "border-verde/45 bg-verde/15 text-verde-soft" },
  ended: { text: "مهلت پایان یافت", cls: "border-brick/45 bg-brick/15 text-brick-soft" },
};

/** قاب تشریفاتی: خط طلایی دوتایی با شمسه در گوشه‌ها — امضای صفحه‌آرایی ایرانی */
function Frame() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
      <div className="border-gold/25 absolute inset-4 rounded-xl border lg:inset-6" />
      <div className="border-gold/10 absolute inset-[22px] rounded-lg border lg:inset-[30px]" />
      {[
        "top-4 left-4 -translate-x-1/2 -translate-y-1/2 lg:top-6 lg:left-6",
        "top-4 right-4 translate-x-1/2 -translate-y-1/2 lg:top-6 lg:right-6",
        "bottom-4 left-4 -translate-x-1/2 translate-y-1/2 lg:bottom-6 lg:left-6",
        "bottom-4 right-4 translate-x-1/2 translate-y-1/2 lg:bottom-6 lg:right-6",
      ].map((pos) => (
        <span
          key={pos}
          className={`bg-stage-2 text-gold absolute grid size-6 place-items-center ${pos}`}
        >
          <Star size={11} />
        </span>
      ))}
    </div>
  );
}

export function Hero({ status, leaderboard }: { status: ExamStatus; leaderboard: Leaderboard }) {
  const state = STATE[status.window_state];
  const secondsLeft =
    status.window_state === "upcoming" ? status.seconds_until_start : status.seconds_until_end;
  const total = leaderboard.total_completed_participants;
  const questionPreview = status.active_question_bank_size || 0;

  return (
    <section className="bg-stage text-on-stage relative overflow-hidden">
      <PersianPattern className="text-gold absolute inset-0" opacity={0.13} />
      <div
        aria-hidden="true"
        className="via-gold/60 absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="bg-gold/[0.09] absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full blur-3xl"
      />
      <Frame />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-extrabold ${state.cls}`}
              >
                <span className="relative flex size-1.5" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                </span>
                {status.window_state_label || state.text}
              </span>
              <span className="text-on-stage/65 text-[12px] font-semibold tracking-tight">
                {toFa(status.starts_at_jalali)} تا {toFa(status.ends_at_jalali)}
              </span>
            </div>

            <h1 className="mt-4 text-[clamp(27px,4.8vw,47px)] leading-[1.24] font-extrabold tracking-[-0.02em]">
              پنج سؤال، یک کتاب،
              <br />
              <span className="relative inline-block">
                <span className="text-gold relative z-10">هفده مسجد</span>
                <span
                  aria-hidden="true"
                  className="bg-gold/18 absolute inset-x-0 bottom-1 z-0 h-[7px] sm:h-[9px]"
                />
              </span>{" "}
              در یک رقابت.
            </h1>

            <p className="text-on-stage/78 mt-3.5 max-w-[48ch] text-[13.5px] leading-[2.05] sm:text-[15px]">
              {status.description}
            </p>

            <div className="mt-6 max-w-[380px]">
              <p className="text-gold/90 mb-2 flex items-center gap-1.5 text-[11.5px] font-bold">
                <Star size={8} />
                {status.window_state === "upcoming" ? "تا آغاز آزمون" : "تا پایان مهلت"}
              </p>
              <Countdown targetSeconds={Math.max(0, secondsLeft)} label="زمان باقی‌مانده" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/register"
                className="group bg-gold text-on-gold shadow-2 hover:bg-gold-strong inline-flex h-12 items-center gap-2.5 rounded-lg px-6 text-[14.5px] font-extrabold transition-all duration-200 hover:shadow-[0_10px_30px_-8px_oklch(66%_0.135_80/0.55)]"
              >
                {status.can_participate ? "ورود به آزمون" : "ثبت‌نام و رزرو جای من"}
                <span
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                >
                  ←
                </span>
              </Link>
              <Link
                href="/rules"
                className="text-on-stage hover:border-gold/45 inline-flex h-12 items-center rounded-lg border border-white/22 px-5 text-[13.5px] font-bold transition-colors hover:bg-white/[0.07]"
              >
                قوانین در ۳۰ ثانیه
              </Link>
            </div>

            <dl className="mt-7 grid max-w-lg grid-cols-3 divide-x divide-white/12 border-t border-white/12 pt-4">
              {[
                { k: "مشارکت‌کننده", v: faNumber(total), suffix: "نفر" },
                { k: "مسجد", v: faNumber(leaderboard.total_active_mosques), suffix: "مسجد" },
                {
                  k: "فرصت پاسخ",
                  v: toFa(Math.round(status.duration_seconds / 60)),
                  suffix: "دقیقه",
                },
              ].map((x) => (
                <div key={x.k} className="px-2 first:pr-0">
                  <dd className="flex items-baseline gap-1 tabular-nums">
                    <span className="text-gold text-[19px] font-extrabold">{x.v}</span>
                    <span className="text-on-stage/55 text-[10.5px]">{x.suffix}</span>
                  </dd>
                  <dt className="text-on-stage/55 mt-0.5 text-[10.5px]">{x.k}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* پیش‌نمایش واقعی جلسهٔ آزمون */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="from-gold/12 absolute -inset-3 rounded-2xl bg-gradient-to-b to-transparent blur-xl"
            />
            <div className="relative rounded-xl border border-white/[0.14] bg-white/[0.06] p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-5">
              <div className="text-on-stage/65 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5">
                  <Star size={8} className="text-gold" />
                  نمونهٔ جلسهٔ آزمون
                </span>
                <span className="text-gold rounded bg-white/10 px-1.5 py-0.5 font-extrabold tabular-nums">
                  {toFa(String(Math.floor(status.duration_seconds / 60)).padStart(2, "0"))}:۰۰
                </span>
              </div>

              <div className="mt-3 flex gap-1 overflow-hidden" aria-hidden="true">
                {Array.from({ length: status.questions_per_attempt }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] flex-1 rounded-full ${
                      i === 0
                        ? "bg-gold"
                        : i === 1
                          ? "from-gold/60 bg-gradient-to-l to-white/20"
                          : "bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <p className="text-on-stage mt-3.5 text-[13px] leading-7 font-bold">
                فرمان تاریخی تشکیل بسیج مستضعفین در چه تاریخی و توسط چه کسی صادر شد؟
              </p>

              <ul className="mt-2.5 space-y-1.5 text-[12px] leading-6">
                {[
                  { n: "۱", t: "۵ آذر ۱۳۵۸ — حضرت امام خمینی (ره)", sel: true },
                  { n: "۲", t: "۲۲ بهمن ۱۳۵۷ — شورای انقلاب", sel: false },
                  { n: "۳", t: "۳ خرداد ۱۳۶۱ — ستاد کل نیروهای مسلح", sel: false },
                  { n: "۴", t: "۱۴ اسفند ۱۳۵۷ — شورای انقلاب اسلامی", sel: false },
                ].map((o) => (
                  <li
                    key={o.n}
                    className={`flex items-start gap-2.5 rounded-md border px-2.5 py-2 transition-colors ${
                      o.sel ? "border-gold/50 bg-gold/14" : "border-white/[0.09] bg-white/[0.045]"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded text-[10.5px] font-extrabold ${
                        o.sel ? "bg-gold text-on-gold" : "text-on-stage/65 bg-white/10"
                      }`}
                    >
                      {o.n}
                    </span>
                    <span className="text-on-stage/90 min-w-0 flex-1 break-words">{o.t}</span>
                  </li>
                ))}
              </ul>

              <div className="text-on-stage/55 mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px]">
                <span>ترتیب گزینه‌ها برای هر شرکت‌کننده تصادفی است</span>
                <span className="tabular-nums">
                  نمونهٔ نمایشی — {toFa(questionPreview || "—")} سؤال در بانک
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
