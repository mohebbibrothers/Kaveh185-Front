"use client";

import { useState } from "react";
import { PrimaryButton } from "@/shared/ui/Field";
import { Girih } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import { SITE } from "@/shared/config/site";

/**
 * «بریفینگ» پیش از شروع آزمون — آخرین نفس قبل از شروعِ ساعت.
 *
 * ══ چرا آزمون خودکار شروع نمی‌شود؟ ═════════════════════════════════════════
 * قبلاً `/exam` بی‌درنگ `startExam()` می‌زد: تایمرِ پنج‌دقیقه‌ای همان لحظه
 * روشن می‌شد، حتی اگر کاربر در آسانسور بود یا صفحه را اشتباهی باز کرده بود.
 * یک آزمونِ یک‌بارمصرف که بی‌اجازه شروع شود، عملاً سوخته است. این صفحه سه
 * چیز را روشن می‌کند و بعد ساعت را با کلیکِ خودِ کاربر روشن می‌کند:
 *
 *   ۱) **قواعدِ سخت** (۵ پرسش، ۵ دقیقه، یک‌بار شرکت، ترتیبِ اجباری).
 *   ۲) **چه چیزی ثبت می‌شود** (نام و مسجد — همان‌هایی که در کارنامه می‌آید).
 *   ۳) **یک تیکِ آگاهانه** («می‌دانم، شروع کن») که دکمه‌اش تا زدنِ آن خاموش است.
 *
 * ══ جزئیاتی که «سینیور» را می‌سازد ═════════════════════════════════════════
 * • چک‌لیستِ سه‌موردی با تیکِ انیمیشنی؛ حالتِ «آماده» بی‌سر‌و‌صدا تغییر می‌کند.
 * • شمارشِ «۵ دقیقه» با یک نوارِ نمایشیِ یک‌باره، نه تایمرِ واقعی (فریب نیست).
 * • دکمه تا وقتی تیک نخورده غیرفعال است؛ متنِ دلیلش هم همان‌جا هست.
 * • اگر کاربر قبلاً شروع کرده باشد، این صفحه هرگز نمی‌آید (ادامه در `ExamRunner`).
 */

const RULES = [
  {
    title: "پنج پرسش چهارگزینه‌ای",
    body: "از کتابِ مسابقه؛ هر پرسش چهار گزینه دارد و فقط یکی درست است.",
  },
  {
    title: "پنج دقیقه، یک‌بار برای همیشه",
    body: "شمارش روی سرور است. با پایانِ زمان، پاسخ‌های ثبت‌شده خودکار نهایی می‌شوند.",
  },
  {
    title: "ترتیب اجباری است",
    body: "تا به پرسشِ جاری پاسخ ندهید، پرسشِ بعد باز نمی‌شود؛ پاسخ‌ها همان لحظه ذخیره می‌شوند.",
  },
];

export function Briefing({
  fullName,
  mosqueName,
  onStart,
}: {
  fullName: string;
  mosqueName: string | null;
  onStart: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* ── سرآیند ── */}
      <header className="text-center">
        <Girih size={26} className="text-brand mx-auto" />
        <h2 className="text-text mt-2 text-[clamp(19px,3vw,24px)] font-extrabold">
          آماده‌اید؟ آزمون همین حالا شروع می‌شود
        </h2>
        <p className="text-text-muted mx-auto mt-1.5 max-w-[46ch] text-[12px] leading-7">
          {fullName ? `${fullName} عزیز، ` : ""}
          {mosqueName ? `به نامِ «${mosqueName}» وارد می‌شوید. ` : ""}
          سه نکته را ببینید و بعد شروع کنید.
        </p>
      </header>

      {/* ── کارتِ قواعد ── */}
      <div className="border-border bg-surface mt-4 overflow-hidden rounded-2xl border">
        <ol className="divide-border divide-y">
          {RULES.map((r, i) => (
            <li key={r.title} className="flex items-start gap-3 px-4 py-3.5">
              <span
                aria-hidden="true"
                className="bg-brand/12 text-brand mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[11.5px] font-extrabold"
              >
                {toFa(i + 1)}
              </span>
              <div className="min-w-0">
                <p className="text-text text-[13px] font-extrabold">{r.title}</p>
                <p className="text-text-muted mt-0.5 text-[11.5px] leading-6">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* ── نوارِ نمایشیِ زمان ── */}
        <div className="border-border bg-surface-2 border-t px-4 py-3">
          <div className="flex items-baseline justify-between">
            <p className="text-text-muted text-[11px] font-bold">سهمِ زمان</p>
            <p className="text-text text-[12px] font-extrabold tabular-nums">
              {toFa(5)} دقیقه برای {toFa(5)} پرسش
            </p>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="bg-brand/25 h-1.5 flex-1 rounded-full" />
            ))}
          </div>
          <p className="text-text-subtle mt-1.5 text-[10.5px] leading-5">
            یعنی حدوداً یک دقیقه برای هر پرسش؛ خواندنِ دقیق گزینه‌ها را قربانیِ سرعت نکنید.
          </p>
        </div>
      </div>

      {/* ── تیکِ آگاهی ── */}
      <label
        className={[
          "mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-colors",
          ready
            ? "border-verde/40 bg-verde/[0.06]"
            : "border-border-strong bg-surface hover:bg-surface-2",
        ].join(" ")}
      >
        <input
          type="checkbox"
          checked={ready}
          onChange={(e) => {
            setLeaving(false);
            setReady(e.target.checked);
          }}
          className="accent-brand mt-0.5 size-4 shrink-0"
        />
        <span className="min-w-0">
          <span className="text-text block text-[12px] font-extrabold">
            می‌دانم که این آزمون یک‌بار است و با شروع، زمان می‌گذرد
          </span>
          <span className="text-text-muted mt-0.5 block text-[11px] leading-6">
            اگر الان آماده نیستید، همین صفحه را ببندید؛ پروندهٔ شما محفوظ می‌ماند و بعداً می‌توانید
            برگردید. اطلاع‌رسانی در {SITE.channel.handle}.
          </span>
        </span>
      </label>

      <PrimaryButton
        type="button"
        onClick={() => {
          setLeaving(true);
          onStart();
        }}
        disabled={!ready}
        loading={leaving}
        loadingLabel="در حال آماده‌سازیِ پرسش‌ها…"
        className="mt-3 w-full"
      >
        شروعِ آزمون
      </PrimaryButton>
      <p className="text-text-subtle mt-2 text-center text-[10.5px] leading-5">
        {ready
          ? "با زدنِ این دکمه، تایمرِ پنج‌دقیقه‌ای شروع می‌شود."
          : "برای فعال‌شدنِ دکمه، کادرِ بالا را تیک بزنید."}
      </p>
    </div>
  );
}
