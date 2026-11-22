"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchCurrentAttempt } from "@/shared/api/exam";
import { clearSession, getSession, patchSession, type Session } from "@/shared/api/session";
import type { Attempt } from "@/shared/api/participant";
import { Girih } from "@/shared/ui/Ornament";
import { AccountPanel } from "./AccountPanel";
import { RecoverByPhone } from "./RecoverByPhone";
import { clearDraft } from "@/widgets/register/use-draft";
import { invalidateIdentity } from "@/shared/api/identity";

/**
 * صفحهٔ نشست («ورود»).
 *
 * ══ سه چیز که این صفحه باید حل کند ════════════════════════════════════════
 *  ۱) **کاربر عادی:** رمز عبور ندارد و نباید داشته باشد. این‌جا می‌بیند کی
 *     هست، اگر آزمونِ نیمه‌کاره دارد به آن برمی‌گردد، و راهِ کارنامه را دارد.
 *  ۲) **کاربری که فرم را رها کرده:** مشاهده‌اش این بود که بعد از رفتن به
 *     صفحهٔ دیگر و زدنِ «ثبت‌نام و شرکت»، دوباره فرمِ خالی می‌آید. برای همین
 *     اگر روی این دستگاه نشست باشد، مستقیم دکمهٔ **«ورود به آزمون»** را
 *     می‌بیند؛ اگر نباشد، همین‌جا با شمارهٔ همراه پرونده‌اش را پیدا می‌کنیم.
 *  ۳) **مدیر/اپراتور:** ⚠️ از دورِ ۵۰ بلوکِ «ورودِ مدیران و اپراتورها» از این
 *     صفحه **حذف شده** (درخواستِ صریحِ کارفرما): این صفحه برای شرکت‌کننده
 *     است و کادرِ رمز فقط او را گیج می‌کرد. مسیرِ مدیر همان پنلِ جنگو روی
 *     دامنهٔ API است (`/secure-kaveh185-admin/`) و بازنشانیِ رمز با
 *     `manage.py set_admin_password` — مستند در `docs/ADMIN_RECOVERY.md`.
 */

type Phase = "loading" | "anon" | "ready";

export function AccountView() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const load = useCallback(async () => {
    const s = getSession();
    setSession(s);
    if (s) {
      const a = await fetchCurrentAttempt().catch(() => null);
      setAttempt(a);
      if (a?.tracking_code) patchSession({ trackingCode: a.tracking_code });
    }
    setPhase(s ? "ready" : "anon");
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [load]);

  if (phase === "loading") {
    return (
      <div className="space-y-3">
        <div className="bg-surface-2 h-32 animate-pulse rounded-2xl" aria-busy="true" />
        <div className="bg-surface-2 h-24 animate-pulse rounded-2xl" aria-busy="true" />
      </div>
    );
  }

  if (phase === "anon" || !session) {
    return (
      <div className="space-y-3">
        <div className="border-border bg-surface rounded-2xl border p-5 text-center">
          <Girih size={26} className="text-text-subtle mx-auto" />
          <h2 className="text-text mt-3 text-[15px] font-extrabold">روی این دستگاه نشستی نیست</h2>
          <p className="text-text-muted mx-auto mt-2 max-w-[46ch] text-[12.5px] leading-7">
            اگر قبلاً ثبت‌نام کرده‌اید، همین‌جا شمارهٔ همراهتان را بزنید تا پرونده‌تان پیدا شود و
            مستقیم وارد آزمون شوید — لازم نیست فرم را دوباره پر کنید.
          </p>
        </div>
        <RecoverByPhone
          onRecovered={() => {
            void load();
          }}
        />
        <div className="text-center">
          <Link
            href="/receipt"
            className="text-brand inline-flex min-h-[36px] items-center text-[11.5px] font-extrabold underline underline-offset-4"
          >
            استعلامِ کارنامه با کد رهگیری
          </Link>
        </div>
      </div>
    );
  }

  const inProgress = attempt !== null;
  const finished = session.trackingCode ?? null;

  return (
    <div className="space-y-3">
      <div className="border-border bg-surface rounded-2xl border p-4">
        <p className="text-text-subtle text-[11px]">نشست فعال روی این دستگاه</p>
        <p className="text-text mt-1 text-[16px] font-extrabold">
          {session.fullName || "شرکت‌کننده"}
        </p>
        {session.mosqueName ? (
          <p className="text-text-muted mt-0.5 text-[12px]">{session.mosqueName}</p>
        ) : null}

        {/*
         * ⚠️ این دکمه همان چیزی است که کاربر می‌خواست: «وقتی ثبت‌نام کردم و
         * بعد صفحه را عوض کردم، باید دکمهٔ شرکت در آزمون بیاید، نه فرمِ خالی.»
         * برچسبش وضعیت را می‌گوید: شروع، ادامه، یا کارنامه.
         */}
        <div className="mt-3 flex flex-wrap gap-2">
          {finished ? (
            <Link
              href={`/receipt?code=${encodeURIComponent(finished)}`}
              className="bg-brand text-on-brand inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
            >
              کارنامهٔ من
            </Link>
          ) : (
            <Link
              href="/exam"
              className="bg-brand text-on-brand inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
            >
              {inProgress ? "ادامهٔ آزمون" : "ورود به آزمون"}
            </Link>
          )}
          <Link
            href="/receipt"
            className="border-border-strong text-text hover:bg-surface-2 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold"
          >
            استعلام با کد رهگیری
          </Link>
          <button
            type="button"
            onClick={() => {
              clearSession();
              // خروج باید هر سه لایهٔ حافظه را پاک کند: نشست، کشِ هویت و
              // پیش‌نویسِ فرم. وگرنه دکمهٔ هدر «ادامهٔ آزمون» می‌ماند.
              invalidateIdentity();
              clearDraft();
              setSession(null);
              setAttempt(null);
              setPhase("anon");
            }}
            className="text-text-subtle hover:text-brick ms-auto inline-flex h-10 items-center px-2 text-[12px] font-bold"
          >
            خروج از این دستگاه
          </button>
        </div>
        {attempt ? (
          <p className="text-text-subtle mt-2 text-[10.5px] leading-5">
            آزمونِ شما باز است و زمان روی سرور می‌گذرد؛ برای اینکه ثانیه‌ها هدر نرود، همین حالا ادامه
            دهید.
          </p>
        ) : null}
      </div>

      <AccountPanel session={session} />
    </div>
  );
}
