"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestOtp, verifyOtp } from "@/shared/api/exam";
import { ApiError } from "@/shared/api/client";
import type { OtpInfo } from "@/shared/api/participant";
import { fetchBaleStatus, type BaleStatus } from "@/shared/api/bale";
import { FormAlert, PrimaryButton } from "@/shared/ui/Field";
import { faClock, toEn, toFa } from "@/shared/lib/fa";
import { maskPhone } from "@/shared/lib/validate";

/**
 * گام دومِ ثبت‌نام: تأییدِ شمارهٔ همراه با کدی که از **بله** می‌آید.
 *
 * ── چرا بله و نه پیامک؟ ───────────────────────────────────────────────────
 * ارسالِ پیامک در ایران نیازمندِ پنلِ رسمی و اینماد است؛ تا صادر شدنِ آن مجوز،
 * هیچ پیامکی بیرون نمی‌رود. بله (پیام‌رسانِ داخلی) همین کار را بی‌هزینه
 * انجام می‌دهد: یک رباتِ رسمی، کاربر یک‌بار ربات را «شروع» می‌کند، و از آن پس
 * کدها در همان گفتگوی بله می‌آیند. این کامپوننت دقیقاً همان پل را به کاربر
 * نشان می‌دهد — بدونِ اصطلاحِ فنی، بدونِ گامِ اضافه.
 *
 * ── چهار تصمیمِ طراحی ─────────────────────────────────────────────────────
 * ۱) **یک ورودی، نه شش خانه.** شش خانهٔ جدا روی موبایل با صفحه‌کلیدِ فارسی
 *    کابوس است (پریدنِ فوکوس، پاک‌کردنِ خانهٔ قبل، Paste نشدن). این‌جا یک
 *    ورودیِ بزرگ با `inputMode="numeric"` و فاصله‌گذاریِ دیداری داریم.
 * ۲) **شمارشِ معکوسِ واقعی.** کد ۱۸۰ ثانیه زنده است؛ همان عدد از سرور
 *    گرفته می‌شود، نه حدس. وقتی صفر شد، دکمهٔ «ارسال دوباره» روشن می‌شود.
 * ۳) **مسیرِ بله همیشه دیده می‌شود.** اگر شماره به ربات وصل نباشد، کدِ اتصال
 *    با دکمهٔ «کپی» و پیوندِ مستقیمِ بله می‌آید؛ کاربر با دو کلیک وصل می‌شود.
 * ۴) **خطای سرور در جای خودش.** «کد نادرست» زیرِ همان ورودی می‌آید، نه به
 *    شکلِ هشدارِ بالای صفحه که کاربر آن را به فیلدِ دیگری نسبت می‌دهد.
 */

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

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
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(initial?.expires_in_seconds ?? 180);
  const [cooldown, setCooldown] = useState(0);
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

  /* ── وضعیتِ کانالِ بله (یک‌بار) ──────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    void fetchBaleStatus(phoneNumber).then((s) => {
      if (alive) setBale(s);
    });
    return () => {
      alive = false;
    };
  }, [phoneNumber]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const baleLink = info?.bale_link ?? null;
  const delivery = info?.delivery ?? "none";

  const deliveryLine = useMemo(() => {
    if (delivery === "bale") {
      return `کد به بلهٔ شمارهٔ ${toFa(maskPhone(phoneNumber))} فرستاده شد.`;
    }
    if (delivery === "sms") {
      return `کد به شمارهٔ ${toFa(maskPhone(phoneNumber))} پیامک شد.`;
    }
    return "کد از راهِ بله می‌آید. برای وصل‌کردن، سه گامِ کوتاهِ پایین را انجام دهید — یک‌بار برای همیشه.";
  }, [delivery, phoneNumber]);

  const copyCode = useCallback(async () => {
    if (!baleLink?.code) return;
    try {
      await navigator.clipboard.writeText(baleLink.code);
      setCopied(true);
      setNotice("کد در حافظه کپی شد. حالا در بله برای ربات بفرستید.");
      window.setTimeout(() => {
        setCopied(false);
      }, 2600);
    } catch {
      setNotice("کپی نشد؛ کد را دستی انتخاب و در بله بفرستید.");
    }
  }, [baleLink]);

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
          کدِ ۶ رقمی را وارد کنید
        </h2>
        <p className="text-text-muted text-[12.5px] leading-7">{deliveryLine}</p>
      </header>

      {error ? (
        <FormAlert title="تأیید انجام نشد">{error}</FormAlert>
      ) : notice ? (
        <FormAlert tone="info" title="خبر">
          {notice}
        </FormAlert>
      ) : null}

      {/* ── ورودیِ کد ── */}
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
      </div>

      <PrimaryButton
        type="button"
        loading={verifying}
        loadingLabel="در حال بررسی…"
        onClick={() => {
          void submit();
        }}
        disabled={code.length !== CODE_LENGTH}
        className="w-full"
      >
        تأیید و ورود به آزمون
      </PrimaryButton>

      {/* ── ارسال دوباره ── */}
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

      {/* ── مسیرِ بله ── */}
      <BaleHelp
        bale={bale}
        link={baleLink}
        onCopy={() => {
          void copyCode();
        }}
        copied={copied}
        linkedHint={delivery === "bale"}
      />
    </section>
  );
}

/**
 * بلوکِ راهنمای بله.
 *
 * ── چرا این بلوک همیشه هست؟ ───────────────────────────────────────────────
 * حتی وقتی کد از بله آمده، کاربر باید بداند «اگر پیام را پیدا نکردم چه کنم».
 * اگر این بلوک فقط در حالتِ خطا ظاهر شود، همان لحظه‌ای که لازم است غایب است.
 */
function BaleHelp({
  bale,
  link,
  onCopy,
  copied,
  linkedHint,
}: {
  bale: BaleStatus | null;
  link: OtpInfo["bale_link"];
  onCopy: () => void;
  copied: boolean;
  linkedHint: boolean;
}) {
  const username = link?.bot_username || bale?.bot_username || "";
  const deepLink = username ? `https://ble.ir/${username}` : "";

  if (linkedHint) {
    return (
      <div className="border-verde/30 bg-verde/[0.06] rounded-xl border px-3.5 py-3">
        <p className="text-verde flex items-center gap-1.5 text-[12px] font-extrabold">
          <span aria-hidden="true">✓</span> کد در بله است
        </p>
        <p className="text-text-muted mt-1 text-[11.5px] leading-6">
          بله را باز کنید و پیامِ ربات
          {username ? (
            <>
              {" "}
              · <span dir="ltr">@{username}</span>
            </>
          ) : null}{" "}
          را ببینید. اگر پیدا نکردید، بخشِ «پیام‌های ذخیره‌شده» یا «ربات‌ها» را بگردید.
        </p>
      </div>
    );
  }

  if (!bale?.bale_configured && !link?.code) return null;

  return (
    <div className="border-border bg-surface-2 rounded-xl border px-3.5 py-3">
      <p className="text-text text-[12px] font-extrabold">دریافتِ کد از بله</p>
      <ol className="text-text-muted mt-2 space-y-1.5 text-[11.5px] leading-6">
        <li className="flex gap-1.5">
          <span aria-hidden="true" className="text-brand shrink-0 font-extrabold">
            ۱
          </span>
          رباتِ رسمی را در بله باز کنید
          {deepLink ? (
            <>
              :{" "}
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold underline underline-offset-4"
                dir="ltr"
              >
                @{username}
              </a>
            </>
          ) : (
            " (نشانیِ ربات را از پشتیبانیِ حوزه بگیرید)."
          )}
        </li>
        <li className="flex gap-1.5">
          <span aria-hidden="true" className="text-brand shrink-0 font-extrabold">
            ۲
          </span>
          {link?.code ? (
            <span>
              این کد را برای ربات بفرستید:
              <span
                dir="ltr"
                className="border-border-strong bg-surface text-text mx-1 inline-flex items-center rounded-lg border px-2 py-0.5 font-mono text-[13px] font-extrabold tracking-[0.14em]"
              >
                {link.code}
              </span>
              <button
                type="button"
                onClick={onCopy}
                className="text-brand ml-1 inline-flex min-h-[30px] items-center text-[11px] font-extrabold underline underline-offset-4"
              >
                {copied ? "کپی شد ✓" : "کپی"}
              </button>
            </span>
          ) : (
            <span>دستورِ «شروع» را بزنید و شمارهٔ همراه خود را بفرستید.</span>
          )}
        </li>
        <li className="flex gap-1.5">
          <span aria-hidden="true" className="text-brand shrink-0 font-extrabold">
            ۳
          </span>
          به همین صفحه برگردید و کدِ دریافتی را وارد کنید.
        </li>
      </ol>
      <p className="text-text-subtle border-border mt-2.5 border-t pt-2 text-[10.5px] leading-6">
        این کد فقط برای وصل‌کردنِ گفتگوی بله به شمارهٔ شماست؛ خودِ کدِ تأیید جای دیگری می‌آید و محرمانه
        است.
      </p>
    </div>
  );
}
