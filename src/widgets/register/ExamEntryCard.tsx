"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/shared/ui/Field";
import { MosqueMark } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";

/**
 * «پروندهٔ شما آماده است» — دروازهٔ ورود به آزمون پس از ثبت‌نام.
 *
 * ══ چرا این صفحه وجود دارد؟ ═══════════════════════════════════════════════
 * قبلاً بعد از ثبت‌نام، کاربر بی‌مقدمه به `/exam` پرت می‌شد. دو مشکل داشت:
 *
 *   ۱) **ناگهانی بودن.** آزمونِ زمان‌دار شروع می‌شد بدونِ اینکه کاربر بفهمد
 *      چه شد، چند سؤال است، چقدر وقت دارد و به نامِ کدام مسجد ثبت شده.
 *   ۲) **بدونِ بازبینی.** اگر کسی شماره یا مسجد را اشتباه زده بود، اولین
 *      جای فهمیدنش وسطِ آزمون بود — جایی که دیگر نمی‌شود کاری کرد
 *      (مسجد بعد از شروع آزمون قفل است).
 *
 * این صفحه همان یک نفسِ لازم را می‌دهد: «چه شد، چه چیزی ثبت شد، حالا
 * می‌خواهی شروع کنی؟»
 *
 * ══ تصمیم‌های طراحی ════════════════════════════════════════════════════════
 * • **شمارشِ معکوسِ اعتبارِ کدِ نشست** (۳۰ دقیقه) با نوارِ پیشرفت؛ کاربر
 *   می‌فهمد وقت دارد، و اگر تمام شد صادقانه می‌گوید «دوباره وارد شوید» نه
 *   اینکه وسطِ آزمون ۴۰۱ بخورد.
 * • **بازبینیِ اطلاعات** به‌شکلِ تعریف‌نامه (`dl`)، چون این‌ها داده‌اند نه فرم.
 * • **یک دکمهٔ اصلی، یک پیوندِ فرعی** — «اصلاحِ اطلاعات» فقط تا وقتی آزمون
 *   شروع نشده معنا دارد و همان‌جا هم همین را می‌گوید.
 * • **ورودِ خودکار با کلیدِ Enter** روی دکمهٔ اصلی (تمرکزِ پیش‌فرض) تا کسی که
 *   با کیبورد کار می‌کند گیر نکند.
 * • **هیچ ادعای بی‌پشتوانه**: اگر نشست با کد ساخته نشده، هیچ‌جا نمی‌گوییم
 *   «شماره تأیید شد». یک نشانِ بی‌طرف «ثبت‌نام انجام شد» می‌آید.
 */

const CODE_FIELD_MINUTES = 30;

export type EntrySummary = {
  fullName: string;
  phoneNumber: string;
  mosqueName: string;
  mosqueCode?: string;
  mosqueOrder?: number;
  nationalIdLast4?: string;
};

type Props = {
  summary: EntrySummary;
  /** آیا نشست با کدِ تأیید ساخته شد؟ فقط برای متنِ صادقانه. */
  verified: boolean;
  /** چه زمانی این نشست ساخته شد (ms) — برای شمارشِ معکوس. */
  issuedAt: number;
  onStart: () => void;
  onEdit: () => void;
  starting: boolean;
};

function mmss(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return toFa(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

export function ExamEntryCard({ summary, verified, issuedAt, onStart, onEdit, starting }: Props) {
  const total = CODE_FIELD_MINUTES * 60;
  const [left, setLeft] = useState(() =>
    Math.max(0, total - Math.floor((Date.now() - issuedAt) / 1000)),
  );

  // شمارشِ معکوس از زمانِ صدور، نه از لحظهٔ mount؛ پس رفرش صفحه وقت را
  // «ریست» نمی‌کند (که هم گمراه‌کننده بود هم قابلِ سوءاستفاده).
  useEffect(() => {
    const tick = () => {
      setLeft(Math.max(0, total - Math.floor((Date.now() - issuedAt) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [issuedAt, total]);

  /*
   * تمرکزِ اولیه روی دکمهٔ اصلی، ولی بدونِ `ref`:
   * `PrimaryButton` یک کامپوننت تابعی است و `ref` را عبور نمی‌دهد (و افزودنِ
   * forwardRef فقط برای این یک فوکوس، هزینه‌ای بی‌فایده بود). این‌جا از
   * `autoFocus` استفاده می‌کنیم — همان نتیجه، بدونِ دست‌زدن به UI مشترک.
   */

  const expired = left <= 0;
  const pct = Math.round((left / total) * 100);
  const urgent = left <= 300;

  return (
    <section aria-labelledby="entry-title" className="space-y-4">
      {/* ── سرآیندِ «انجام شد» ── */}
      <div className="border-verde/35 bg-verde/[0.07] rounded-2xl border px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="bg-verde/15 text-verde mt-0.5 grid size-8 shrink-0 place-items-center rounded-full"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="entry-title" className="text-text text-[14.5px] font-extrabold">
              پروندهٔ شما ثبت شد — آمادهٔ ورود به آزمون
            </h2>
            <p className="text-text-muted mt-1 text-[11.5px] leading-6">
              {verified
                ? "شمارهٔ شما با کدِ یک‌بارمصرف تأیید شده است."
                : "ثبت‌نام انجام شد. اطلاعات زیر را یک بار ببینید، بعد آزمون را شروع کنید."}
            </p>
          </div>
        </div>
      </div>

      {/* ── کاغذِ پرونده ── */}
      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center gap-3 border-b px-4 py-3">
          <MosqueMark name={summary.mosqueName} order={summary.mosqueOrder ?? 1} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-[13.5px] font-extrabold">{summary.fullName}</p>
            <p className="text-text-subtle mt-0.5 truncate text-[10.5px]" dir="ltr">
              {summary.phoneNumber}
            </p>
          </div>
          <span className="border-verde/40 text-verde shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold">
            ثبت‌نام‌شده
          </span>
        </div>

        <dl className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3">
            <dt className="text-text-subtle text-[10.5px] font-bold">مسجدِ شما</dt>
            <dd className="text-text mt-0.5 text-[12.5px] font-extrabold">
              {summary.mosqueName}
              {summary.mosqueCode ? (
                <span className="text-text-subtle mr-1.5 text-[10.5px] font-normal" dir="ltr">
                  {summary.mosqueCode}
                </span>
              ) : null}
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-text-subtle text-[10.5px] font-bold">نتیجه به نامِ</dt>
            <dd className="text-text mt-0.5 text-[12.5px] font-extrabold">
              همین مسجد ثبت و در جدولِ رده‌بندی شمرده می‌شود
            </dd>
          </div>
        </dl>

        {/* ── اعتبارِ نشست ── */}
        <div className="border-border bg-surface-2 border-t px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-text-muted text-[11px] font-bold">
              {expired ? "اعتبارِ این نشست تمام شد" : "اعتبارِ ورودِ شما"}
            </p>
            <p
              className={`text-[13px] font-extrabold tabular-nums ${urgent ? "text-brick" : "text-text"}`}
              dir="ltr"
            >
              {mmss(left)}
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="اعتبار ورود"
            className="bg-border mt-2 h-1.5 overflow-hidden rounded-full"
          >
            <span
              aria-hidden="true"
              className={`block h-full rounded-full transition-[width] duration-1000 ${
                urgent ? "bg-brick" : "bg-verde"
              }`}
              style={{ width: `${String(pct)}%` }}
            />
          </div>
          <p className="text-text-subtle mt-1.5 text-[10.5px] leading-5">
            {expired
              ? "برای ادامه، اطلاعات را دوباره ثبت کنید؛ نتیجه و آزمونِ نیمه‌کاره‌تان از بین نمی‌رود."
              : "لازم نیست جایی بروید: آزمون همین‌جا و در همین نشست باز می‌شود."}
          </p>
        </div>
      </div>

      {/* ── دکمهٔ اصلی ── */}
      <div className="space-y-2">
        <PrimaryButton
          type="button"
          autoFocus
          onClick={onStart}
          loading={starting}
          loadingLabel="در حال باز کردنِ دفترچهٔ آزمون…"
          disabled={expired}
          aria-describedby="entry-start-hint"
          className="w-full"
        >
          ورود به آزمون و شروع
        </PrimaryButton>
        <p id="entry-start-hint" className="text-text-subtle text-center text-[11px] leading-6">
          پنج پرسش چهارگزینه‌ای · پنج دقیقه · ترتیبِ پرسش‌ها برای هر نفر متفاوت است
        </p>
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onEdit}
          className="text-text-muted hover:text-text inline-flex min-h-[36px] items-center text-[11.5px] font-bold transition-colors"
        >
          نام یا تاریخ تولد را اشتباه زدم — اصلاح کن
        </button>
      </div>
    </section>
  );
}
