"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchCurrentAttempt } from "@/shared/api/exam";
import { clearSession, getSession, patchSession, type Session } from "@/shared/api/session";
import type { Attempt } from "@/shared/api/participant";
import { Girih } from "@/shared/ui/Ornament";

/**
 * صفحهٔ نشست کاربر («ورود» سابق).
 *
 * ── چرا رمز عبور نداریم و این یک نقص نیست ────────────────────────────────
 * طراحی این مسابقه برای مشارکت حداکثری است: کاربر عادی یک بار ثبت‌نام
 * می‌کند، آزمون می‌دهد و کارنامه می‌گیرد. رمز عبور برای او فقط یک دیوار
 * اضافی است — و رمزی که کاربر برای یک مسابقه می‌سازد، رمز ضعیف است.
 * هویت با «کد ملی + شمارهٔ همراه» و یکتایی سمت سرور تأمین می‌شود و
 * بازیابی کارنامه با کد رهگیری ممکن است، بدون هیچ رمزی.
 *
 * پس این صفحه سه کار می‌کند: نشان می‌دهد کی هستید، اگر آزمون نیمه‌کاره
 * دارید به آن برگرداند، و راه استعلام کارنامه را نشان دهد.
 */
export function AccountView() {
  const [session, setSession] = useState<Session | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const s = getSession();
    setSession(s);
    if (s) {
      const a = await fetchCurrentAttempt().catch(() => null);
      setAttempt(a);
      if (a?.tracking_code) patchSession({ trackingCode: a.tracking_code });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [load]);

  if (loading) {
    return <div className="bg-surface-2 h-40 animate-pulse rounded-2xl" aria-busy="true" />;
  }

  if (!session) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-6 text-center">
        <Girih size={26} className="text-text-subtle mx-auto" />
        <h2 className="text-text mt-3 text-[15px] font-extrabold">روی این دستگاه نشستی نیست</h2>
        <p className="text-text-muted mx-auto mt-2 max-w-[44ch] text-[12.5px] leading-7">
          برای شرکت در آزمون، ثبت‌نام کنید. اگر قبلاً شرکت کرده‌اید، کارنامه‌تان با کد رهگیری در
          دسترس است و نیازی به ورود دوباره ندارید.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/register"
            className="bg-brand text-on-brand inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
          >
            ثبت‌نام و شرکت
          </Link>
          <Link
            href="/receipt"
            className="border-border-strong text-text hover:bg-surface-2 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold"
          >
            استعلام با کد رهگیری
          </Link>
        </div>
      </div>
    );
  }

  const inProgress = attempt !== null;

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

        <div className="mt-3 flex flex-wrap gap-2">
          {inProgress ? (
            <Link
              href="/exam"
              className="bg-brand text-on-brand inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
            >
              ادامهٔ آزمون
            </Link>
          ) : null}
          <Link
            href="/receipt"
            className="border-border-strong text-text hover:bg-surface-2 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold"
          >
            کارنامهٔ من
          </Link>
          <button
            type="button"
            onClick={() => {
              clearSession();
              setSession(null);
              setAttempt(null);
            }}
            className="text-text-subtle hover:text-brick ms-auto inline-flex h-10 items-center px-2 text-[12px] font-bold"
          >
            خروج از این دستگاه
          </button>
        </div>
      </div>

      <p className="text-text-subtle text-[11px] leading-6">
        خروج فقط نشست این مرورگر را پاک می‌کند؛ اطلاعات شما و کارنامه‌تان روی سرور دست‌نخورده
        می‌ماند و با کد رهگیری همیشه در دسترس است.
      </p>
    </div>
  );
}
