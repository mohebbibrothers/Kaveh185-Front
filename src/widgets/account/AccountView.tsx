"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/shared/config/site";
import { fetchCurrentAttempt } from "@/shared/api/exam";
import { clearSession, getSession, patchSession, type Session } from "@/shared/api/session";
import type { Attempt } from "@/shared/api/participant";
import { Girih } from "@/shared/ui/Ornament";
import { PrimaryButton, Field, FormAlert } from "@/shared/ui/Field";
import { toFa } from "@/shared/lib/fa";
import { AccountPanel } from "./AccountPanel";

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
 *  ۳) **مدیر/اپراتور:** ورود با رمز عبور، بدونِ اینکه لازم باشد آدرسِ پنل را
 *     از حفظ بداند. (شکایتِ واقعی: «از پنل ادمین بیرون انداخته شدم و با همان
 *     یوزر/پس نمی‌توانم وارد شوم» — علتِ رایج: رمز هرگز ست نشده بود، چون
 *     `grant_admin` عمداً رمز نمی‌دهد و `reset_admin` رمز می‌دهد ولی حذف می‌کند.)
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
        <ResumeByPhone
          onResumed={() => {
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
        <AdminSignIn compact />
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

      <AdminSignIn compact />
    </div>
  );
}

/**
 * پیدا کردنِ پرونده با شمارهٔ همراه، روی همین صفحه.
 *
 * چرا این‌جا و نه فقط در فرمِ ثبت‌نام؟ چون کاربری که نشستش را پاک کرده (یا
 * دستگاه را عوض کرده) نباید برای «ادامه» مجبور شود فرمِ ثبت‌نام را باز کند.
 * همان مسیرِ `/auth/lookup/` است، فقط با یک ورودی و یک دکمه.
 */
function ResumeByPhone({ onResumed }: { onResumed: () => void }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setCode(null);
    try {
      const { lookupParticipant } = await import("@/shared/api/lookup");
      const res = await lookupParticipant(phone);
      if (!res.found) {
        setError("برای این شماره پرونده‌ای نیست. ثبت‌نامِ تازه بسازید.");
        return;
      }
      if (res.state === "exam_completed") {
        setCode(res.tracking_code ?? null);
        return;
      }
      if (res.access) {
        const { saveSession } = await import("@/shared/api/session");
        saveSession({
          access: res.access,
          fullName: res.user?.full_name ?? "شرکت‌کننده",
          mosqueName: res.user?.mosque_name ?? null,
        });
        onResumed();
      }
    } catch {
      setError("ارتباط برقرار نشد. کمی بعد دوباره بزنید.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-4">
      <p className="text-text text-[12.5px] font-extrabold">قبلاً ثبت‌نام کرده‌ام</p>
      <p className="text-text-muted mt-0.5 mb-2.5 text-[11px] leading-6">
        شمارهٔ همراهی که با آن ثبت‌نام کرده‌اید را بزنید.
      </p>
      <Field
        label="شمارهٔ همراه"
        value={phone}
        onChange={(x) => {
          setPhone(x.replace(/[^\d۰-۹٠-٩]/g, "").slice(0, 11));
          if (error) setError(null);
        }}
        inputMode="tel"
        autoComplete="tel"
        ltr
        placeholder="09xxxxxxxxx"
      />
      <PrimaryButton
        type="button"
        onClick={() => {
          void submit();
        }}
        loading={busy}
        loadingLabel="در حال بررسی…"
        disabled={phone.replace(/\D/g, "").length !== 11}
        className="mt-2.5 w-full"
      >
        پیدا کردنِ پروندهٔ من
      </PrimaryButton>
      {error ? (
        <div className="mt-2.5">
          <FormAlert title="پرونده پیدا نشد">{error}</FormAlert>
        </div>
      ) : null}
      {code ? (
        <div className="border-verde/35 bg-verde/[0.07] mt-2.5 rounded-xl border px-3 py-2.5">
          <p className="text-text text-[11.5px] font-extrabold">شما قبلاً در آزمون شرکت کرده‌اید</p>
          <Link
            href={`/receipt?code=${encodeURIComponent(code)}`}
            className="text-brand mt-1 inline-flex items-center gap-1 text-[11.5px] font-extrabold underline underline-offset-4"
          >
            مشاهدهٔ کارنامه · <span dir="ltr">{code}</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/**
 * ورودِ مدیران و اپراتورها.
 *
 * ── چرا در همین صفحه و به‌صورتِ جمع‌شونده؟ ─────────────────────────────────
 * کاربرِ عادی نباید با یک کادرِ «رمز عبور» گیج شود؛ ولی مدیر نباید آدرسِ
 * پنل را از حفظ باشد. راهِ میانه: یک بلوکِ بسته با عنوانِ روشن که با یک کلیک
 * باز می‌شود. رمز هرگز در `localStorage` نمی‌ماند؛ فقط توکنِ نشست.
 *
 * پشتِ سر: `POST /auth/login/password/` با «شماره یا کد ملی» + رمز. اگر
 * حساب رمزی نداشته باشد، همان ۴۰۱ می‌آید — و پیامِ راهنما دقیقاً همان
 * دستوری را می‌گوید که باید روی سرور اجرا شود.
 */
function AdminSignIn({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { adminSignIn, ADMIN_PATH } = await import("@/shared/api/admin-auth");
      const res = await adminSignIn(identifier, password);
      if (res.kind === "ok") {
        // رفتن به پنل، همان‌جایی که مدیر انتظار دارد.
        // پنل روی دامنهٔ API است، نه روی سایتِ ایستا؛ پس ناوبریِ کلاسیک.
        // (این آدرس خارج از Next است و `router.push` نسبی به ۴۰۴ می‌رفت.)
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`${SITE.apiBase.replace(/\/$/, "")}/${ADMIN_PATH}`);
        return;
      }
      if (res.kind === "no_password") {
        setError(
          "این حساب هنوز رمز عبور ندارد. روی سرور اجرا کنید: " +
            "python manage.py set_admin_password --phone <شماره>",
        );
        return;
      }
      setError(res.message);
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-border bg-surface-2/60 rounded-2xl border">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className="text-text-muted hover:text-text flex w-full items-center justify-between gap-2 px-4 py-3 text-[11.5px] font-extrabold"
      >
        <span>ورودِ مدیران و اپراتورها</span>
        <span aria-hidden="true" className="text-[13px]">
          {toFa(open ? "−" : "+")}
        </span>
      </button>
      {open ? (
        <div className="border-border space-y-2.5 border-t px-4 py-3.5">
          {!compact ? null : (
            <p className="text-text-subtle text-[10.5px] leading-5">
              مخصوصِ مدیران و اپراتورهای حوزه؛ کاربرانِ عادی به رمز نیازی ندارند.
            </p>
          )}
          <Field
            label="شمارهٔ همراه یا کد ملی"
            value={identifier}
            onChange={setIdentifier}
            inputMode="numeric"
            autoComplete="username"
            ltr
            placeholder="09xxxxxxxxx"
          />
          <Field
            label="رمز عبور"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete="current-password"
            ltr
            placeholder="••••••••"
          />
          <PrimaryButton
            type="button"
            onClick={() => {
              void submit();
            }}
            loading={busy}
            loadingLabel="در حال ورود…"
            disabled={identifier.trim().length < 4 || password.length < 4}
            className="w-full"
          >
            ورود به پنل مدیریت
          </PrimaryButton>
          {error ? (
            <FormAlert title="ورود انجام نشد">
              <span className="whitespace-pre-line">{error}</span>
            </FormAlert>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
