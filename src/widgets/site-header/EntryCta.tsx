"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/shared/api/session";

/**
 * دکمهٔ اصلیِ هدر — «ثبت‌نام و شرکت» / «ادامهٔ آزمون».
 *
 * ══ مشکلی که حل می‌کند ════════════════════════════════════════════════════
 * کاربر ثبت‌نام کرده بود ولی دکمهٔ «ورود به آزمون» را نزده بود؛ بعد از رفتن
 * به صفحهٔ دیگر، دوباره «ثبت‌نام و شرکت» را زد و فرمِ خالی دید (شکایتِ
 * واقعی). دلیل: این دکمه همیشه به `/register` می‌رفت، بی‌خبر از اینکه روی
 * همین دستگاه نشستی هست.
 *
 * حالا دکمه «وضعیت‌آگاه» است:
 *   • نشست هست  ⇒ «ادامهٔ آزمون» به `/exam` (مستقیم سرِ آزمون).
 *   • نشست نیست ⇒ «ثبت‌نام و شرکت» به `/register` (همان رفتارِ قبل).
 *
 * ── چرا بدونِ پرشِ چشمی؟ ─────────────────────────────────────────────────
 * `localStorage` در رندرِ سرور خوانده نمی‌شود، پس اولین رندر همیشه حالتِ
 * «نشست نیست» است. اگر مستقیم بر اساسِ آن رندر می‌کردیم، کاربرِ واردشده یک
 * پرشِ متنی می‌دید. راه‌حل: تا وقتی `mounted` نشده، همان متنِ پیش‌فرض با
 * `aria-hidden` نمایش داده می‌شود و فقط عرضِ دکمه با `min-width` قفل است تا
 * هیچ جهشی در چیدمان رخ ندهد.
 */
export function EntryCta({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [hasSession, setHasSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const s = getSession();
    // یک تیکِ صفر تا مقدارِ localStorage بعد از hydration خوانده شود و
    // رندرِ سرور و کلاینت دقیقاً یکی بمانند (بدونِ hydration mismatch).
    const id = window.setTimeout(() => {
      setHasSession(Boolean(s?.access));
      setMounted(true);
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const href = hasSession ? "/exam" : "/register";
  const label = hasSession ? "ادامهٔ آزمون" : "ثبت‌نام و شرکت";

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset] transition-colors"
        aria-live={mounted ? "polite" : undefined}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-[13px] font-bold whitespace-nowrap shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors sm:px-4"
      aria-live={mounted ? "polite" : undefined}
    >
      {/* زیر ۳۸۰px متن کوتاه تا دکمه نشکند. */}
      <span className="min-[380px]:hidden">{hasSession ? "آزمون" : "ثبت‌نام"}</span>
      <span className="hidden min-[380px]:inline">{label}</span>
    </Link>
  );
}
