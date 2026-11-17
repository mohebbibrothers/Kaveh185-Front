"use client";

import { useEffect, useRef, useState } from "react";
import { faDuration, toFa } from "@/shared/lib/fa";
import { usePageVisible, usePrefersReducedMotion } from "@/shared/lib/motion";

/**
 * شمارش معکوس — نسخهٔ پنجم: **«حلقهٔ زمان»**.
 *
 * ── چرا نسخهٔ چهارم هم نپسندیدی؟ (نکتهٔ ۲ کاربر) ─────────────────────────
 * «نمی‌دونم چرا با روزشمار حال نمی‌کنم؛ شاید فونتشه، شاید استایلشه.»
 * و این دقیقاً تشخیصِ درست بود: چهار کاشیِ هم‌اندازه، تایمر را به یک
 * «جدولِ عدد» تبدیل می‌کرد. مشکل، جذابیتِ فونت تنها نبود؛ **سلسله‌مراتب**
 * نبود. روز و ثانیه هم‌وزن بودند، در حالی که معنا یکی نیست: یک عدد
 * «چقدر مانده» است و سه عدد «جزئیات».
 *
 * ── زبانِ تازه: یک ساعتِ جواهر، نه چهار جعبه ──────────────────────────────
 *
 *  ۱) **حلقهٔ پیشرفتِ زنده** دورِ کاشیِ روز: یک `conic-gradient` که هر
 *     ثانیه یک پله جلو می‌رود و می‌گوید «چقدر از این مرحله گذشته». بدون
 *     آن، چهار عددِ ساکن بودند؛ با آن، تایمر «کار می‌کند» و چشم می‌فهمد.
 *  ۲) **سلسله‌مراتب**: روز در کاشیِ پیشرو بزرگ و با شمارهٔ سه‌رقمی (یا
 *     چهاررقمی)؛ ساعت/دقیقه/ثانیه در یک نوارِ افقیِ کاشی‌های کوچک، با
 *     جداکنندهٔ «:» که در فارسی نقطه‌چینِ طلایی است.
 *  ۳) **فونتِ اعداد**: ارقام فارسی با `Vazirmatn` وزن ۹۰۰ + `tabular-nums`
 *     + `font-variant-numeric` + `letter-spacing` منفی. ارقام فارسی در
 *     وزیرمتن `tabular` نیستند (پهنای ۱ و ۳ فرق دارد) و همین باعث می‌شد
 *     تایمر «بلرزد» و ارزان به نظر برسد؛ برای همین هر رقم را در یک
 *     **سلولِ عرض‌ثابت** می‌نشانیم و عرضِ کل را با `ch` قفل می‌کنیم.
 *     نتیجه: هیچ پرشی در عرض، و ریتمِ یکنواختِ عددی.
 *  ۴) **تیکِ نرمِ تک‌رقمی**: فقط رقمی که عوض می‌شود یک «برشِ» کوتاه
 *     می‌گیرد (بدون `blur`، بدون جابه‌جایی عمودیِ بلند) تا در تبِ پشتِ
 *     سر صحنه هم آرام باشد.
 *  ۵) **حالتِ پایان و حالتِ بدونِ زمان‌بندی** هر دو طراحی‌شده‌اند؛ هیچ‌وقت
 *     یک قابِ خالی نمی‌بینید.
 *  ۶) **تم روز/شب**: رنگ‌ها از توکن‌های `surface`/`gold`/`brand` می‌آیند،
 *     پس در هر دو تم درست است — نه یک جعبهٔ سفیدِ ثابت.
 *
 * ── دسترس‌پذیری ───────────────────────────────────────────────────────────
 * `role="timer"` + `aria-live="off"` (اعلام هر ثانیه صفحه‌خوان را قطع
 * می‌کند) + یک `sr-only` با مدتِ کامل. هر کاشی برچسبِ `sr-only` دارد، پس
 * «۰۲» تنها خوانده نمی‌شود، «۲ روز» خوانده می‌شود.
 */

/** کاشیِ پیشرو: حداکثر روزی که حلقه را «پر» نشان می‌دهد. */
const RING_SCALE_DAYS = 30;

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
  /** «upcoming» = تا شروع؛ «open» = تا پایان */
  tone?: "upcoming" | "open";
  /** پیام جایگزین وقتی تایمر صفر شد */
  endMessage?: string;
}) {
  const mountedAt = useRef<number | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, targetSeconds));
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    mountedAt.current = Date.now();
    const deadline = mountedAt.current + Math.max(0, targetSeconds) * 1000;
    const tick = () => {
      setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    // تب پنهان ⇒ تیک متوقف می‌شود؛ با بازگشت، مقدار فوراً همگام می‌شود.
    if (!visible) return;
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [targetSeconds, visible]);

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const isDark = variant === "dark";
  const finished = left <= 0;
  const accent = tone === "upcoming" ? "gold" : "verde";

  if (finished) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 ${
          isDark
            ? "border-white/12 bg-white/[0.06] text-white"
            : "border-border bg-surface text-text"
        }`}
      >
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full ${
            isDark ? "bg-verde/15 text-verde" : "bg-verde-soft text-verde"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
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

  /** پرشِ حلقه: نسبتِ گذشتِ زمان از مقیاسِ روزهای همین مرحله. */
  const totalDays = Math.max(1, Math.ceil(targetSeconds / 86400));
  const progress = Math.min(
    1,
    Math.max(0, 1 - Math.min(d + (h * 60 + m) / 1440 + s / 86400, RING_SCALE_DAYS) / totalDays),
  );

  const small: { value: number; label: string }[] = [
    { value: h, label: "ساعت" },
    { value: m, label: "دقیقه" },
    { value: s, label: "ثانیه" },
  ];

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${d} روز و ${h} ساعت و ${m} دقیقه`}
      className="inline-flex max-w-full items-center"
      data-variant={variant}
      data-tone={tone}
    >
      <div
        className={`k185-clock flex items-center gap-2 rounded-[20px] border py-1.5 ps-1.5 pe-3 sm:gap-2.5 sm:rounded-[24px] sm:py-2 sm:ps-2 sm:pe-3.5 ${
          isDark
            ? "border-white/10 bg-white/[0.05]"
            : "border-border/80 bg-surface/95 shadow-[0_1px_0_oklch(100%_0_0/0.9)_inset,0_18px_44px_-34px_oklch(26%_0.05_260/0.75)]"
        }`}
      >
        {/* ── کاشیِ پیشرو: روز، با حلقهٔ پیشرفت ──
            حلقه با SVG رسم می‌شود، نه `conic-gradient` + ماسک: ماسکِ
            `exclude` در برخی مرورگرها/حالت‌ها به‌جای حلقه، یک گوهِ توپر
            می‌کشد (همان چیزی که در پیش‌نمایش دیده شد). SVG قطعی است. */}
        <div
          className={`relative flex min-w-[4.6rem] flex-col items-center justify-center rounded-[14px] px-2 py-2 sm:min-w-[5.2rem] sm:rounded-[17px] ${
            isDark ? "bg-white/[0.07]" : "bg-gold-soft/60"
          }`}
        >
          <ProgressRing progress={progress} accent={accent} />
          <span className="sr-only">روز</span>
          <span
            className={`k185-num relative text-[clamp(25px,6.6vw,32px)] leading-none ${
              isDark ? "text-white" : "text-text"
            }`}
          >
            <Digits value={toFa(String(d).padStart(2, "0"))} animate={!reduced} />
          </span>
          <span
            aria-hidden="true"
            className={`relative mt-1 text-[9px] font-extrabold tracking-[0.16em] ${
              accent === "gold" ? "text-gold-strong" : "text-verde"
            }`}
          >
            روز
          </span>
        </div>

        {/* جداکنندهٔ نازک */}
        <span
          aria-hidden="true"
          className={`h-9 w-px shrink-0 ${isDark ? "bg-white/12" : "bg-border/80"}`}
        />

        {/* ── سه واحدِ دقیق‌تر: عدد + برچسب، بدونِ جعبهٔ جدا ── */}
        <div className="flex items-end gap-1.5 sm:gap-2.5">
          {small.map((u, index) => (
            <div key={u.label} className="flex items-end">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`mb-3 px-0.5 text-[15px] leading-none font-black ${
                    isDark ? "text-white/25" : "text-gold/60"
                  }`}
                >
                  :
                </span>
              ) : null}
              <div className="flex flex-col items-center pb-0.5">
                <span className="sr-only">{u.label}</span>
                <span
                  className={`k185-num text-[clamp(18px,4.9vw,23px)] leading-none ${
                    isDark ? "text-white" : "text-text"
                  }`}
                >
                  <Digits value={toFa(String(u.value).padStart(2, "0"))} animate={!reduced} />
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-1 text-[8.5px] font-bold ${
                    isDark ? "text-on-stage-muted" : "text-text-subtle"
                  }`}
                >
                  {u.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{faDuration(left)} باقی مانده</span>
    </div>
  );
}

/**
 * حلقهٔ پیشرفتِ کاشیِ روز.
 *
 * دو دایره: مسیرِ کم‌رنگ و کمانِ رنگی. کمان با `strokeDasharray` رسم
 * می‌شود، پس هیچ ماسک، `conic-gradient` یا `mask-composite`ی در کار نیست
 * و در همهٔ مرورگرها یکسان است.
 */
function ProgressRing({ progress, accent }: { progress: number; accent: "gold" | "verde" }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, progress)) * circumference;

  return (
    <svg
      viewBox="0 0 60 60"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
    >
      <rect
        x="1"
        y="1"
        width="58"
        height="58"
        rx="13"
        stroke={`color-mix(in oklab, var(--c-${accent}) 18%, transparent)`}
        strokeWidth="1.5"
      />
      <rect
        x="1"
        y="1"
        width="58"
        height="58"
        rx="13"
        stroke={`var(--c-${accent})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        pathLength={circumference}
        style={{ transition: "stroke-dashoffset 900ms linear" }}
        // مسیرِ کمان از گوشهٔ بالا-راست شروع می‌شود و در جهتِ ساعت می‌رود
        transform="rotate(-90 30 30)"
        opacity="0.75"
      />
    </svg>
  );
}

/**
 * ارقامِ عرض‌ثابت.
 *
 * چرا هر رقم در یک سلول؟ ارقامِ فارسیِ وزیرمتن `tabular` نیستند؛ «۱» از
 * «۳» باریک‌تر است و در شمارنده، عرضِ کلِ عدد با هر تیک کمی می‌پرید —
 * همان «لرزش» که تایمر را ارزان نشان می‌داد. با عرضِ ثابت (`1ch` + کمی
 * فاصله) عدد مثل یک صفحهٔ ساعتِ واقعی می‌نشیند.
 */
function Digits({ value, animate }: { value: string; animate: boolean }) {
  return (
    <span
      className="inline-flex items-baseline"
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
    >
      {Array.from({ length: value.length }, (_, i) => value.charAt(i)).map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className={`inline-block text-center ${animate ? "k185-digit-in" : ""}`}
          style={{ width: "0.62em" }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
