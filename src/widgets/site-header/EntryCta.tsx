"use client";

import Link from "next/link";
import type { Route } from "next";
import { useIdentity } from "@/shared/api/use-identity";

/**
 * دکمهٔ اصلیِ هدر — «ثبت‌نام و شرکت» / «ادامهٔ آزمون» / «کارنامهٔ من».
 *
 * ══ مشکلی که حل می‌کند ════════════════════════════════════════════════════
 * کاربر ثبت‌نام می‌کرد، به صفحهٔ دیگری می‌رفت و دوباره «ثبت‌نام و شرکت» را
 * می‌زد و **فرمِ خالی** می‌دید. دو ریشه داشت و هر دو بسته شد:
 *
 *   ۱) **مسیر اشتباه:** دکمه همیشه به `/register` می‌رفت. حالا از کشِ
 *      هویت (`useIdentity`) می‌خواند و مقصدش `next.path` است — همان چیزی
 *      که **سرور** تصمیم گرفته: `/exam` یا `/receipt?code=…`.
 *   ۲) **تصمیمِ محلی:** قبلاً هر کامپوننت خودش `localStorage` را می‌خواند.
 *      حالا یک منبعِ حقیقت وجود دارد که با refresh هم زنده می‌ماند.
 *
 * ── سه حالتِ نمایش ───────────────────────────────────────────────────────
 *   • `pending` (پیش از خواندنِ اِسنپ‌شات): متنِ کوتاهِ بی‌طرف + قفلِ عرض،
 *     تا نه hydration mismatch باشد و نه پرشِ چیدمان.
 *   • `no_session`: «ثبت‌نام و شرکت» → `/register`.
 *   • هر حالتِ دیگر: برچسبِ سرور («ادامهٔ آزمون»، «ورود به آزمون»،
 *     «دیدنِ کارنامه») + نشانگرِ کوچکِ «بازیابی» وقتی نتیجه `offline` است.
 */
export function EntryCta({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { label, href, hasSession, status, identity } = useIdentity();
  const pending = status === "pending";
  const offline = identity.state === "offline";

  const short = pending ? "شرکت" : hasSession ? "آزمون" : "ثبت‌نام";

  if (variant === "mobile") {
    return (
      <Link
        href={href as Route}
        aria-busy={pending || undefined}
        className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset] transition-colors"
      >
        {pending ? <Dot /> : null}
        <span className={pending ? "opacity-70" : undefined}>
          {pending ? "شرکت در آزمون" : label}
        </span>
        {offline ? <span className="text-[10px] opacity-70">(آفلاین)</span> : null}
      </Link>
    );
  }

  return (
    <Link
      href={href as Route}
      aria-busy={pending || undefined}
      aria-live={pending ? undefined : "polite"}
      // آفلاین: برچسب همان «آزمون» می‌ماند (کاربر نباید به فرم پرت شود)،
      // ولی یک توضیحِ شفاف روی hover/خوانندهٔ صفحه می‌آید.
      title={
        offline
          ? "ارتباط با سرور برقرار نشد؛ از پروندهٔ ذخیره‌شده روی این دستگاه استفاده می‌کنیم."
          : undefined
      }
      data-identity={pending ? "pending" : identity.state}
      className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold whitespace-nowrap shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors sm:px-4"
    >
      {pending ? <Dot /> : null}
      {/* زیر ۳۸۰px متن کوتاه تا دکمه نشکند. */}
      <span className="min-[380px]:hidden">{short}</span>
      <span className="hidden min-[380px]:inline">{pending ? "شرکت در آزمون" : label}</span>
    </Link>
  );
}

/** نقطهٔ کوچکِ «در حال خواندنِ وضعیت» — سبک‌تر از اسپینر. */
function Dot() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current opacity-70"
    />
  );
}
