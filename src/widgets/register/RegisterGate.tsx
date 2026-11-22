"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useIdentity } from "@/shared/api/use-identity";
import { Girih } from "@/shared/ui/Ornament";
import { RegisterScreen } from "./RegisterScreen";

/**
 * دروازهٔ `/register` — «اگر روی این دستگاه پرونده‌ای هست، فرمِ تازه نده.»
 *
 * ══ باگی که این فایل می‌بندد ══════════════════════════════════════════════
 * کاربر ثبت‌نام می‌کرد، به خانه می‌رفت، و دوباره «ثبت‌نام و شرکت» را می‌زد:
 * **همان فرمِ خالی** بالا می‌آمد و از دیدِ او همه‌چیز پاک شده بود. پرونده
 * سرجایش بود؛ رابط راهش را نمی‌دانست.
 *
 * نسخهٔ اولِ این دروازه فقط `localStorage` را می‌دید و اگر توکن منقضی بود
 * بازهم فرم می‌داد (چون `fetchCurrentAttempt` ۴۰۱ می‌گرفت). نسخهٔ فعلی از
 * کشِ هویت می‌خواند که خودش نشست را با `refresh` تمدید می‌کند؛ پس
 * «توکنِ کهنه» دیگر به «کاربرِ تازه» ترجمه نمی‌شود.
 *
 * چهار حالت، هر چهار صریح:
 *   • `pending`            ⇒ صفحهٔ آرام «در حال بازیابی» (نه فرم).
 *   • `no_session`         ⇒ فرمِ ثبت‌نام (رفتارِ اصلی).
 *   • `session/revived`    ⇒ `/exam` (بریفینگ یا ادامه).
 *   • `completed`          ⇒ `/receipt?code=…`
 *   • `offline`            ⇒ `/exam` با نشستِ محلی — بهتر از فرمِ خالی.
 */
export function RegisterGate() {
  const router = useRouter();
  const { identity, status } = useIdentity();

  useEffect(() => {
    if (status !== "ready") return;
    if (identity.state === "no_session") return;
    // مقصد را سرور تعیین کرده است؛ ما فقط اجرا می‌کنیم.
    // مسیر از سرور می‌آید و در زمانِ کامپایل لیترال نیست؛ `typedRoutes`
    // آن را نمی‌شناسد. تبدیل یک‌بار و با توضیح، بهتر از پراکندگیِ `as` است.
    router.replace(identity.next.path as Route);
  }, [status, identity.state, identity.next.path, router]);

  if (status === "ready" && identity.state === "no_session") {
    return <RegisterScreen />;
  }

  return (
    <div className="order-2 lg:order-1" aria-busy="true">
      <div className="border-border bg-surface rounded-2xl border p-8 text-center">
        <Girih size={30} className="text-brand mx-auto animate-spin" />
        <p className="text-text mt-3 text-[13.5px] font-extrabold">
          {identity.state === "completed"
            ? "کارنامهٔ شما آماده است — در حال باز کردن…"
            : "پروندهٔ شما پیدا شد — در حال باز کردنِ آزمون…"}
        </p>
        <p aria-live="polite" className="text-text-muted mt-1 text-[11.5px] leading-6">
          لازم نیست دوباره ثبت‌نام کنید.
        </p>
        {/* راهِ فرار: اگر بازیابی گیر کرد، کاربر نباید زندانی شود. */}
        <button
          type="button"
          onClick={() => {
            router.refresh();
          }}
          className="text-text-subtle hover:text-text mt-3 inline-flex min-h-[32px] items-center text-[11px] font-bold underline underline-offset-4"
        >
          گیر کرده‌اید؟ دوباره تلاش کنید
        </button>
      </div>
    </div>
  );
}
