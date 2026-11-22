"use client";

import { useState } from "react";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

/**
 * ستونِ اصلیِ صفحهٔ ثبت‌نام — تنها جایی که «گام» زنده است.
 *
 * ── چرا این لایهٔ نازک؟ ───────────────────────────────────────────────────
 * عنوانِ صفحه («گام ۱ از ۲») بیرون از فرم است و فرم بیرون از آن؛ اگر گام را
 * جایی نگه نداریم، کاربر در گامِ کد می‌بیند «گام ۱ از ۲» — یک تناقضِ کوچک که
 * اعتماد را می‌شکند. این‌جا عدد یک‌بار نگه داشته می‌شود و هم عنوان و هم کارت
 * از همان می‌خوانند.
 */
export function RegisterScreen() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="order-2 lg:order-1">
      <header className="mb-5">
        <p aria-live="polite" className="text-brand text-[11.5px] font-extrabold tracking-wide">
          گام {toFa(step)} از {toFa(2)}
        </p>
        <h1 className="text-text mt-1.5 text-[clamp(21px,3.2vw,28px)] font-extrabold">
          {step === 1 ? "ثبت‌نام و ورود به آزمون" : "پروندهٔ شما آماده است"}
        </h1>
        <p className="text-text-muted mt-2 max-w-[60ch] text-[13px] leading-[2]">
          {step === 1 ? (
            <>
              پنج پرسش چهارگزینه‌ای از کتاب «{SITE.bookTitle}»، پنج دقیقه فرصت پاسخ. همین‌جا ثبت‌نام
              کنید و آزمون را آغاز کنید — بدون نصب هیچ برنامه‌ای، بدون عضویت در جایی.
            </>
          ) : (
            <>
              ثبت‌نام‌تان ثبت شد. یک بار اطلاعات را ببینید و با دکمهٔ پایین، آزمون را خودتان شروع
              کنید — زمانِ آزمون تا وقتی دکمه را نزنید شروع نمی‌شود.
            </>
          )}
        </p>
      </header>
      <div className="border-border bg-surface rounded-2xl border p-4 sm:p-6">
        <RegisterForm onStepChange={setStep} />
      </div>
      <p className="text-text-subtle mt-3 text-[11px] leading-6">
        سؤالی دارید؟{" "}
        <Link
          href="/rules"
          className="text-brand inline-flex min-h-[28px] items-center font-bold underline underline-offset-4"
        >
          راهنمای شرکت
        </Link>{" "}
        را ببینید یا با پشتیبانیِ حوزه تماس بگیرید.
      </p>
    </div>
  );
}
