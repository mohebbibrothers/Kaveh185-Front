"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestOtp, verifyOtp } from "@/shared/api/exam";
import { ApiError } from "@/shared/api/client";
import type { OtpInfo } from "@/shared/api/participant";
import {
  fetchBaleStartLink,
  fetchBaleStatus,
  type BaleStartLink,
  type BaleStatus,
} from "@/shared/api/bale";
import { FormAlert, PrimaryButton } from "@/shared/ui/Field";
import { faClock, toEn, toFa } from "@/shared/lib/fa";
import { maskPhone } from "@/shared/lib/validate";

/**
 * گام دومِ ثبت‌نام: تأییدِ شماره با کدی که رباتِ بله می‌فرستد.
 *
 * ══ تصمیمِ طراحی: صفر مکالمه ══════════════════════════════════════════════
 * کاربر قرار نیست با ربات حرف بزند. نه شماره تایپ می‌کند، نه کدِ اتصال. کل
 * تعاملِ او با بله **یک ضربه** است:
 *
 *   ۱) شماره را در سامانه وارد می‌کند (همین صفحه، قبل از این گام).
 *   ۲) دکمهٔ «ارسالِ کد در بله» را می‌زند ⇒ پیوندِ `?start=<intent>` باز
 *      می‌شود؛ بله خودش پیامِ شروع را با آن شناسه به ربات می‌دهد، سرور گفتگو
 *      را به شماره وصل می‌کند و کدِ ورود را همان‌جا می‌فرستد.
 *   ۳) به سامانه برمی‌گردد؛ همین صفحه **خودش** وضعیت را می‌پرسد و کد را که
 *      دید، با یک پیامِ روشن می‌گوید «کد در بله است».
 *
 * ── چرا ورودیِ کد هنوز هست؟ ──────────────────────────────────────────────
 * وگرنه بن‌بست می‌شود: اگر بله پیوند را باز نکرد، یا کاربر از دستگاهِ دیگری
 * وارد شد، بدونِ ورودیِ دستی هیچ راهی برای ادامه ندارد. ولی ورودی **پیش‌فرض
 * پنهان** است و فقط با «کد را دارم» باز می‌شود؛ کاربرِ معمولی هرگز آن را
 * نمی‌بیند.
 *
 * ── چهار محافظِ تجربه ─────────────────────────────────────────────────────
 * ۱) شمارشِ معکوسِ واقعی از سرور (نه حدسِ ۱۸۰ ثانیه).
 * ۲) پرسشِ خودکار هر ۴ ثانیه تا وقتی کاربر بمیرد یا کد برسد («چشمِ ناظر»).
 * ۳) هر خطا در جای خودش؛ هیچ خطایی کاربر را از صفحه بیرون نمی‌اندازد.
 * ۴) همهٔ متن‌ها بدونِ اصطلاحِ فنی؛ «کدِ اتصال» فقط در مسیرِ پشتیبان.
 */

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const WATCH_INTERVAL_MS = 4000;

type Props = {
  phoneNumber: string;
  initial: OtpInfo | null;
  /** بعد از تأیید موفق، والد نشست را ذخیره و کاربر را جابه‌جا می‌کند. */
  onVerified: (access: string) => void;
  onBack: () => void;
};

function digitsOnly(v: string): string {
  return toEn(v).replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export function OtpStep({ phoneNumber, initial, onVerified, onBack }: Props) {
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<OtpInfo | null>(initial);
  const [bale, setBale] = useState<BaleStatus | null>(null);
  const [link, setLink] = useState<BaleStartLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(initial?.expires_in_seconds ?? 180);
  const [cooldown, setCooldown] = useState(0);
  const [manual] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── شمارشِ معکوسِ اعتبارِ کد ─────────────────────────────────────────── */
  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(t);
    };
  }, [seconds]);

  /* ── شمارشِ معکوسِ «ارسال دوباره» (ضدِ اسپم) ─────────────────────────── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(t);
    };
  }, [cooldown]);

  /* ── وضعیتِ کانال + پیوندِ یک‌ضربه (یک‌بار) ───────────────────────────── */
  useEffect(() => {
    let alive = true;
    void fetchBaleStatus(phoneNumber).then((s) => {
      if (alive) setBale(s);
    });
    void fetchBaleStartLink(phoneNumber).then((l) => {
      if (!alive) return;
      setLink(l);
      if (l.already_linked) setWaiting(true);
    });
    return () => {
      alive = false;
    };
  }, [phoneNumber]);

  /* ── «چشمِ ناظر»: تا وقتی منتظریم، وضعیت را می‌پرسیم ──────────────────── */
  useEffect(() => {
    if (!waiting) return;
    let alive = true;
    const tick = async () => {
      const s = await fetchBaleStatus(phoneNumber);
      if (!alive) return;
      setBale(s);
      if (s.linked) {
        setNotice("شمارهٔ شما در بله تأیید شد ✅ کدِ ورود در همان گفتگو است.");
      }
    };
    const id = window.setInterval(() => {
      void tick();
    }, WATCH_INTERVAL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [waiting, phoneNumber]);

  const delivery = info?.delivery ?? "none";
  const linkedNow = Boolean(bale?.linked) || Boolean(link?.already_linked);
  // ⚠️ ورودیِ کد **همیشه** دیده می‌شود: اگر کاربر کد را در بله ببیند ولی جای
  // واردکردنش را پیدا نکند، تمامِ «یک ضربه» بی‌فایده می‌شود. مسیرِ اصلی
  // بدونِ تایپ است، ولی میدانِ ورود دمِ دست می‌ماند تا هیچ بن‌بستی نباشد.
  const showCodeField = manual || linkedNow || Boolean(info);

  const headline = useMemo(() => {
    if (linkedNow && delivery === "bale") return "کد در بله است — آن را وارد کنید";
    if (linkedNow) return "اتصال برقرار شد ✅ — منتظرِ کد بمانید";
    return "یک ضربه، و کد در بله";
  }, [linkedNow, delivery]);

  const subline = useMemo(() => {
    if (delivery === "bale") {
      return `کد به بلهٔ شمارهٔ ${toFa(maskPhone(phoneNumber))} رفت. اگر پیام را نمی‌بینید، بخشِ «ربات‌ها» را در بله باز کنید.`;
    }
    if (linkedNow) {
      return "شمارهٔ شما به ربات وصل است. در سامانه «ارسال دوبارهٔ کد» را بزنید تا کد تازه در بله بیاید.";
    }
    return "شماره‌تان را وارد کرده‌اید؛ فقط کافی است دکمهٔ پایین را بزنید تا کد در بله برایتان بیاید. لازم نیست چیزی تایپ کنید.";
  }, [delivery, linkedNow, phoneNumber]);

  const openBale = useCallback(() => {
    const target = link?.start_link || link?.contact_link || "";
    setWaiting(true);
    setNotice("بله باز شد. بعد از دیدنِ کد، به این صفحه برگردید و آن را وارد کنید.");
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  }, [link]);

  async function submit() {
    if (code.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await verifyOtp(phoneNumber, code);
      onVerified(res.access);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.fieldError("code") ?? err.message);
      } else {
        setError("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
      }
      setCode("");
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const next = await requestOtp(phoneNumber);
      setInfo(next);
      setCode("");
      setSeconds(next.expires_in_seconds ?? 180);
      setCooldown(RESEND_COOLDOWN);
      setNotice("کد تازه صادر شد. کد قبلی دیگر معتبر نیست.");
      setWaiting(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 429) setCooldown(RESEND_COOLDOWN);
      } else {
        setError("ارتباط با سرور برقرار نشد. کمی بعد دوباره بزنید.");
      }
    } finally {
      setResending(false);
    }
  }

  const expired = seconds <= 0;

  return (
    <section aria-labelledby="otp-title" className="space-y-4">
      <header className="space-y-1.5">
        <p className="text-brand text-[11.5px] font-extrabold tracking-wide">تأییدِ شماره همراه</p>
        <h2 id="otp-title" className="text-text text-[clamp(18px,2.6vw,22px)] font-extrabold">
          {headline}
        </h2>
        <p className="text-text-muted text-[12.5px] leading-7">{subline}</p>
      </header>

      {error ? (
        <FormAlert title="تأیید انجام نشد">{error}</FormAlert>
      ) : notice ? (
        <FormAlert tone="info" title="خبر">
          {notice}
        </FormAlert>
      ) : null}

      {/* ── دکمهٔ اصلی: یک ضربه، بدونِ تایپ ── */}
      {!linkedNow || delivery !== "bale" ? (
        <div className="space-y-2">
          <PrimaryButton
            type="button"
            onClick={openBale}
            disabled={!link?.eligible && Boolean(link)}
            className="w-full"
          >
            {link?.eligible === false
              ? "برای این شماره پروندهٔ ثبت‌نام پیدا نشد"
              : "دریافتِ کد در بله — یک ضربه"}
          </PrimaryButton>
          {waiting ? (
            <p className="text-text-subtle flex items-center gap-2 text-[11px] leading-5">
              <span
                aria-hidden="true"
                className="border-brand/30 border-t-brand inline-block h-3 w-3 animate-spin rounded-full border-2"
              />
              منتظرِ تأییدِ بله هستیم… همین صفحه خودش به‌روز می‌شود؛ لازم نیست کاری کنید.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ── ورودیِ کد: پیش‌فرض پنهان، با یک کلیک باز می‌شود ── */}
      {showCodeField ? (
        <div>
          <label htmlFor="otp-code" className="text-text mb-1.5 block text-[12.5px] font-bold">
            کدِ تأیید
          </label>
          <div className="relative">
            <input
              id="otp-code"
              ref={inputRef}
              value={toFa(code)}
              onChange={(e) => {
                setCode(digitsOnly(e.target.value));
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCorrect="off"
              spellCheck={false}
              dir="ltr"
              aria-invalid={error ? true : undefined}
              aria-describedby="otp-help"
              placeholder="— — — — — —"
              className={[
                "bg-surface text-text h-14 w-full rounded-xl border px-3 text-center text-[24px] font-extrabold tracking-[0.55em] tabular-nums transition-colors outline-none",
                "placeholder:text-text-subtle/60 placeholder:tracking-[0.35em] focus:ring-2",
                error
                  ? "border-brick/60 focus:border-brick focus:ring-brick/15"
                  : "border-border-strong focus:border-brand/55 focus:ring-brand/15",
              ].join(" ")}
            />
            <span
              aria-hidden="true"
              className="text-text-subtle pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px]"
            >
              {toFa(code.length)} از {toFa(CODE_LENGTH)}
            </span>
          </div>
          <p id="otp-help" className="text-text-subtle mt-1.5 text-[11px] leading-5">
            {expired
              ? "زمانِ این کد تمام شد؛ کدِ تازه بگیرید."
              : `اعتبارِ کد تا ${faClock(seconds)} دیگر.`}{" "}
            فقط رقم؛ فاصله و خط تیره لازم نیست.
          </p>

          <PrimaryButton
            type="button"
            loading={verifying}
            loadingLabel="در حال بررسی…"
            onClick={() => {
              void submit();
            }}
            disabled={code.length !== CODE_LENGTH}
            className="mt-3 w-full"
          >
            تأیید و ورود به آزمون
          </PrimaryButton>
        </div>
      ) : null}

      {/* ── ارسال دوباره / اصلاح ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            void resend();
          }}
          disabled={resending || cooldown > 0}
          className="text-brand inline-flex min-h-[36px] items-center gap-1.5 text-[12px] font-extrabold underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {resending
            ? "در حال ارسال…"
            : cooldown > 0
              ? `ارسال دوباره تا ${faClock(cooldown)}`
              : "ارسال دوبارهٔ کد"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-text-muted hover:text-text inline-flex min-h-[36px] items-center text-[11.5px] font-bold transition-colors"
        >
          اصلاحِ اطلاعاتِ ثبت‌نام
        </button>
      </div>

      <BaleHelp link={link} notice={notice} />
    </section>
  );
}

/**
 * راهنمای کوچکِ بله — فقط یک جملهٔ اطمینان‌بخش.
 *
 * ── چرا این‌جا خالی از دستورِ «کد را بفرست» است؟ ──────────────────────────
 * چون آن دستور، همان مکالمه‌ای است که حذفش کردیم. این بلوک فقط می‌گوید کد
 * کجا می‌آید و اگر نیامد چه کارِ کوچکی کمک می‌کند.
 */
function BaleHelp({ link, notice }: { link: BaleStartLink | null; notice: string | null }) {
  const username = link?.bot_username || "";
  if (!username) return null;
  return (
    <div className="border-border bg-surface-2 rounded-xl border px-3.5 py-3">
      <p className="text-text text-[12px] font-extrabold">کد کجا می‌آید؟</p>
      <p className="text-text-muted mt-1 text-[11.5px] leading-6">
        در گفتگوی ربات{" "}
        <a
          href={`https://ble.ir/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand font-bold underline underline-offset-4"
          dir="ltr"
        >
          @{username}
        </a>{" "}
        در بله. اگر پیام را ندیدید، در بله بخشِ «ربات‌ها» را باز کنید و همان گفتگو را ببینید. هیچ
        نیازی به نوشتنِ پیام نیست.
      </p>
      {notice ? null : (
        <p className="text-text-subtle border-border mt-2.5 border-t pt-2 text-[10.5px] leading-6">
          این کد فقط برای شماست؛ آن را در اختیارِ دیگران نگذارید.
        </p>
      )}
    </div>
  );
}
