"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";

/**
 * شمارش معکوس — نسخهٔ چهارم.
 *
 * ── ایرادِ کاربر و پاسخِ این نسخه ─────────────────────────────────────────
 * «فونت اعداد جذاب نیست و کادر به اعداد چسبیده است.» هر دو ایراد واقعی
 * بودند و ریشهٔ فنیِ روشنی داشتند:
 *
 * ۱) **چسبیدنِ کادر به اعداد.** نسخهٔ قبل یک نوارِ یکپارچه با `px-3 py-2`
 *    بود؛ یعنی فقط ۸ پیکسل فاصلهٔ عمودی میان رقم و خطِ کادر، در حالی که
 *    برچسبِ واحد هم داخل همان نوار بود. چشم، کادر را «قابِ تنگ» می‌خواند.
 *    این نسخه چهار **کاشیِ جدا** است با `py-3`/`px-3.5`، گوشهٔ `rounded-2xl`
 *    و فاصلهٔ روشن بین رقم و برچسب؛ هر رقم در مرکزِ کاشیِ خودش نفس می‌کشد.
 *
 * ۲) **فونتِ بی‌شخصیت.** Vazirmatn ارقامش برای متن طراحی شده، نه برای
 *    نمایش. سه کارِ ارزان و مؤثر: وزنِ `black` (۹۰۰)، `tracking` منفی برای
 *    فشرده‌شدنِ رقم‌ها، و `tabular-nums` تا عرضِ هر رقم ثابت بماند و نوار
 *    هنگام شمارش نرقصد. کاشیِ «روز» رنگِ لهجه می‌گیرد تا عددِ اصلی وزنِ
 *    بصری داشته باشد و بقیه هم‌خانواده بمانند.
 *
 * ── یک بهبود که فقط با دقت دیده می‌شود ────────────────────────────────────
 * پیش‌تر کلاس انیمیشن روی هر چهار رقم بود و با هر tick هر چهار رقم از نو
 * می‌پریدند (چشمی شبیه لرزش). حالا `key={value}` روی خودِ رقم است؛
 * انیمیشن فقط روی رقمی اجرا می‌شود که واقعاً عوض شده.
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `role="timer"` + `aria-live="off"` (تغییر هر ثانیه نباید صفحه‌خوان را
 * قطع کند) + یک `sr-only` که کل مدت را یک‌جا می‌گوید. صفرِ پیشوند عمداً
 * حفظ شده: «۰۹» عرض را ثابت نگه می‌دارد و شمارشِ سریع را قابل‌اسکن می‌کند.
 */
export function Countdown({
  targetSeconds,
  label,
  variant = "light",
  tone = "upcoming",
  endMessage,
}: {
  targetSeconds: number;
  label: string;
  variant?: "dark" | "light";
  /** «upcoming» = شروع تا؛ «open» = پایان تا */
  tone?: "upcoming" | "open";
  /** پیام جایگزین وقتی تایمر صفر شد */
  endMessage?: string;
}) {
  const mountedAt = useRef<number | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, targetSeconds));

  useEffect(() => {
    mountedAt.current = Date.now();
    const deadline = mountedAt.current + Math.max(0, targetSeconds) * 1000;
    const tick = () => {
      setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [targetSeconds]);

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const isDark = variant === "dark";
  const finished = left <= 0;

  /** کاشیِ روز رنگِ لهجه می‌گیرد: طلایی برای «تا شروع»، سبز برای «تا پایان». */
  const leadTone =
    tone === "upcoming"
      ? isDark
        ? "border-gold/35 bg-gold/[0.13] text-gold"
        : "border-gold/45 bg-gold-soft/70 text-gold-strong"
      : isDark
        ? "border-verde/35 bg-verde/[0.14] text-verde"
        : "border-verde/40 bg-verde-soft/80 text-verde";

  const tileTone = isDark
    ? "border-white/12 bg-white/[0.07] text-white shadow-[inset_0_1px_0_oklch(100%_0_0/0.09)]"
    : "border-border bg-surface text-text shadow-[inset_0_1px_0_oklch(100%_0_0/0.9),0_1px_2px_oklch(24%_0.05_260/0.06)]";

  const unitTone = isDark ? "text-white/55" : "text-text-subtle";

  if (finished) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${
          isDark ? "border-white/12 bg-white/[0.06] text-white" : "border-border bg-surface"
        }`}
      >
        <span className={`grid size-7 shrink-0 place-items-center rounded-lg border ${leadTone}`}>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            aria-hidden="true"
          >
            <path d="M5 12.5 10 17l9-9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[12.5px] font-extrabold">
          {endMessage ?? "زمان این مرحله به پایان رسید"}
        </span>
      </div>
    );
  }

  /**
   * یک کاشی. `key={value}` عمدی است: انیمیشنِ پرشِ رقم فقط وقتی اجرا
   * می‌شود که خودِ رقم عوض شده باشد، نه در هر tickِ ثانیه‌ای.
   */
  const tile = (value: number, unit: string, accent = false) => (
    <span
      className={`flex min-w-[3.6rem] flex-col items-center justify-center rounded-2xl border px-3 py-3 sm:min-w-[4.25rem] sm:px-4 sm:py-3.5 ${
        accent ? leadTone : tileTone
      }`}
    >
      <span
        key={value}
        className="k185-tick text-[clamp(22px,2.9vw,28px)] leading-none font-black tracking-[-0.03em] tabular-nums"
      >
        {toFa(String(value).padStart(2, "0"))}
      </span>
      <span
        className={`mt-1.5 text-[9.5px] leading-none font-bold ${accent ? "opacity-75" : unitTone}`}
      >
        {unit}
      </span>
    </span>
  );

  /** جداکننده: دو نقطهٔ ریز عمودی‌وسط‌چین. سکوتِ بصری بهتر از «:»ِ پررنگ. */
  const sep = (
    <span aria-hidden="true" className="flex flex-col gap-1 self-center px-0.5">
      <span className={`size-[3px] rounded-full ${isDark ? "bg-white/30" : "bg-border-strong"}`} />
      <span className={`size-[3px] rounded-full ${isDark ? "bg-white/30" : "bg-border-strong"}`} />
    </span>
  );

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className="inline-flex max-w-full items-stretch gap-1.5 sm:gap-2"
    >
      {tile(d, "روز", true)}
      {sep}
      {tile(h, "ساعت")}
      {sep}
      {tile(m, "دقیقه")}
      {sep}
      {tile(s, "ثانیه")}
      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}
