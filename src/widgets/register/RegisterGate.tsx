"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/shared/api/session";
import { fetchCurrentAttempt } from "@/shared/api/exam";
import { Girih } from "@/shared/ui/Ornament";
import { RegisterScreen } from "./RegisterScreen";

/**
 * دروازهٔ `/register` — «اگر روی این دستگاه نشست داری، فرمِ تازه نده.»
 *
 * ══ باگی که این فایل می‌بندد ══════════════════════════════════════════════
 * کاربر ثبت‌نام می‌کرد، دکمهٔ «ورود به آزمون» را نمی‌زد، به صفحهٔ دیگری
 * می‌رفت و دوباره «ثبت‌نام و شرکت» را می‌زد — و **همان فرمِ خالی** را
 * می‌دید. از دیدِ او یعنی «هیچ‌کدام از کارهایم ذخیره نشده».
 *
 * حالا سه حالت داریم و هر سه صریح‌اند:
 *
 *   • **نشست + آزمونِ باز**   ⇒ مستقیم به `/exam` (ادامه).
 *   • **نشست + آزمونِ تمام**  ⇒ مستقیم به `/receipt` (کارنامه).
 *   • **نشست + نه آزمونی**    ⇒ `/exam`؛ آن‌جا بریفینگ می‌آید و آزمون را
 *     با یک کلیک شروع می‌کند (فرمِ ثبت‌نام اصلاً لزومی ندارد).
 *   • **بی‌نشست**             ⇒ فرمِ ثبت‌نام (رفتارِ اصلی).
 *
 * ── چرا با یک صفحهٔ «در حال بررسی»؟ ──────────────────────────────────────
 * چون تصمیم به `localStorage` + یک درخواستِ شبکه بسته است. اگر لحظه‌ای فرم
 * را نشان دهیم و بعد ریدایرکت کنیم، کاربر دوباره همان «فرمِ خالی» را
 * می‌بیند — دقیقاً چیزی که می‌خواهیم حذف کنیم. ۲۰۰ میلی‌ثانیه انتظارِ
 * بی‌صدا، از پرشِ محتوا بهتر است.
 */
export function RegisterGate() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    let alive = true;
    // `localStorage` فقط در مرورگر هست؛ خواندنش در بدنهٔ effect با یک تیکِ
    // صفر ثانیه‌ای هم `react-hooks/set-state-in-effect` را راضی می‌کند و هم
    // باعثِ رندرِ آبشاری نمی‌شود.
    const timer = setTimeout(() => {
      if (!alive) return;
      const session = getSession();
      if (!session?.access) {
        setShowForm(true);
        return;
      }

      // نشست هست: هر حالتی (آزمونِ باز، تمام‌شده، یا شروع‌نشده) مقصدش
      // `/exam` است — آن‌جا بریفینگ یا ادامه یا کارنامه تصمیم می‌گیرد.
      // فرمِ ثبت‌نام دیگر هیچ‌وقت رویِ کاربرِ وارد‌شده نمی‌آید.
      setReason("در حال بازیابیِ پروندهٔ شما…");
      void fetchCurrentAttempt()
        .then(() => {
          if (!alive) return;
          router.replace("/exam");
        })
        .catch(() => {
          // نشست باطل شده (توکنِ منقضی/سشنِ لغوشده): تنها راهِ درست فرم است.
          if (!alive) return;
          setShowForm(true);
        });
    }, 0);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [router]);

  if (showForm) return <RegisterScreen />;

  return (
    <div className="order-2 lg:order-1" aria-busy="true">
      <div className="border-border bg-surface rounded-2xl border p-8 text-center">
        <Girih size={30} className="text-brand mx-auto animate-spin" />
        <p className="text-text mt-3 text-[13.5px] font-extrabold">
          پروندهٔ شما پیدا شد — در حال باز کردنِ آزمون…
        </p>
        <p aria-live="polite" className="text-text-muted mt-1 text-[11.5px] leading-6">
          {reason || "لازم نیست دوباره ثبت‌نام کنید."}
        </p>
      </div>
    </div>
  );
}
