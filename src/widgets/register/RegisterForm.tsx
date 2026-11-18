"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerParticipant } from "@/shared/api/exam";
import { ApiError } from "@/shared/api/client";
import { saveSession } from "@/shared/api/session";
import { useBootstrap } from "@/shared/api/use-bootstrap";
import { Field, FormAlert, PrimaryButton } from "@/shared/ui/Field";
import { MosqueMark, Girih } from "@/shared/ui/Ornament";
import { toSearch } from "@/shared/lib/fa";
import { normalizePhone } from "@/shared/lib/validate";
import {
  birthDateError,
  birthDateString,
  nameError,
  nationalIdError,
  phoneError,
} from "@/shared/lib/validate";
import { SITE } from "@/shared/config/site";

/**
 * فرم ثبت‌نام — جایی که کل مسابقه یا شروع می‌شود یا تمام.
 *
 * ── تصمیم‌های طراحی و دلیلشان ─────────────────────────────────────────────
 * ۱) **اعتبارسنجی در لحظهٔ خروج از فیلد، نه در هر کلید.** اگر با هر حرف
 *    خطا نشان دهیم، کاربر هنگام تایپ کد ملی سه بار خطای قرمز می‌بیند.
 *    پس خطا وقتی ظاهر می‌شود که کاربر از فیلد رد شده باشد، و بعد از آن
 *    با اولین اصلاح پاک می‌شود.
 * ۲) **انتخاب مسجد جست‌وجوشونده.** ۱۷ مسجد در یک `<select>` بومی روی
 *    موبایل به لیست بلندِ ناخوانا تبدیل می‌شود؛ این‌جا می‌شود تایپ کرد.
 * ۳) **یک دکمه.** نه «ثبت‌نام» و «ورود» جدا. بک‌اند خودش تشخیص می‌دهد
 *    کاربر تازه است یا برمی‌گردد — پس دو دکمه فقط کاربر را مردد می‌کند.
 * ۴) **کاربر برمی‌گردد؟** اگر قبلاً آزمون داده باشد، سرور ۴۰۹ با کد رهگیری
 *    می‌دهد؛ همان را به پیوند کارنامه تبدیل می‌کنیم، نه به پیام بن‌بست.
 */
type Values = {
  first: string;
  last: string;
  nid: string;
  phone: string;
  day: string;
  month: string;
  year: string;
  mosqueId: number | null;
};

type Errors = Partial<Record<keyof Values | "form" | "mosque", string>>;

export function RegisterForm() {
  const router = useRouter();
  const boot = useBootstrap();
  const [v, setV] = useState<Values>({
    first: "",
    last: "",
    nid: "",
    phone: "",
    day: "",
    month: "",
    year: "",
    mosqueId: null,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [existingCode, setExistingCode] = useState<string | null>(null);
  const [mq, setMq] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const mosques = useMemo(() => (boot.phase === "ready" ? boot.data.mosques : []), [boot]);
  const filtered = useMemo(() => {
    const n = toSearch(mq);
    if (!n) return mosques;
    return mosques.filter((m) => toSearch(`${m.name} ${m.neighborhood} ${m.code}`).includes(n));
  }, [mosques, mq]);

  const selected = mosques.find((m) => m.id === v.mosqueId) ?? null;

  function localErrors(): Errors {
    const e: Errors = {};
    const n1 = nameError(v.first, "نام");
    const n2 = nameError(v.last, "نام خانوادگی");
    const n3 = nationalIdError(v.nid);
    const n4 = phoneError(v.phone);
    const n5 = birthDateError(v.day, v.month, v.year);
    if (n1) e.first = n1;
    if (n2) e.last = n2;
    if (n3) e.nid = n3;
    if (n4) e.phone = n4;
    if (n5) e.day = n5;
    if (v.mosqueId === null) e.mosque = "مسجد محلهٔ خود را انتخاب کنید.";
    return e;
  }

  const err = (k: keyof Values | "mosque"): string | undefined =>
    serverErrors[k] ?? (k !== "mosque" && touched[k] ? localErrors()[k] : undefined);

  function set<K extends keyof Values>(k: K, val: Values[K]) {
    setV((p) => ({ ...p, [k]: val }));
    if (serverErrors[k]) setServerErrors((p) => ({ ...p, [k]: undefined }));
    if (serverErrors.form) setServerErrors((p) => ({ ...p, form: undefined }));
  }

  const blur = (k: keyof Values) => () => {
    setTouched((p) => ({ ...p, [k]: true }));
  };

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setExistingCode(null);
    const eMap = localErrors();
    setTouched({ first: true, last: true, nid: true, phone: true, day: true });
    if (Object.keys(eMap).length > 0) {
      setServerErrors({});
      // نخستین فیلد خطادار را فوکوس می‌دهیم تا کاربر دنبالش نگردد
      const firstKey = (["first", "last", "nid", "phone", "day"] as const).find((k) => eMap[k]);
      if (firstKey)
        formRef.current?.querySelector<HTMLInputElement>(`[data-k="${firstKey}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerParticipant({
        first_name: v.first.trim(),
        last_name: v.last.trim(),
        national_id: v.nid.replace(/\D/g, ""),
        phone_number: normalizePhone(v.phone),
        birth_date: birthDateString(v.day, v.month, v.year),
        mosque_id: v.mosqueId as number,
      });

      if (res.otp_required || !res.access) {
        // مسیر OTP در این نسخه فعال نیست؛ صادقانه می‌گوییم چه شده.
        setServerErrors({
          form: "برای ورود به آزمون باید شمارهٔ همراه شما تأیید شود. با پشتیبانی حوزه تماس بگیرید.",
        });
        return;
      }

      saveSession({
        access: res.access,
        fullName: res.user.full_name,
        mosqueName: res.user.mosque_name ?? null,
      });

      if (res.exam_eligibility?.has_completed_attempt) {
        router.push("/receipt");
      } else {
        router.push("/exam");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const map: Errors = {};
        if (error.errors && typeof error.errors === "object") {
          for (const key of [
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "birth_date",
            "mosque_id",
          ]) {
            const msg = error.fieldError(key);
            if (!msg) continue;
            const local =
              key === "first_name"
                ? "first"
                : key === "last_name"
                  ? "last"
                  : key === "national_id"
                    ? "nid"
                    : key === "phone_number"
                      ? "phone"
                      : key === "birth_date"
                        ? "day"
                        : "mosque";
            map[local as keyof Values] = msg;
          }
        }
        // کد رهگیریِ کارنامهٔ قبلی داخل errors می‌آید — به بن‌بست تبدیلش نکنیم
        const code = (error.errors?.tracking_code as string | undefined) ?? undefined;
        if (code) setExistingCode(code);
        setServerErrors(Object.keys(map).length > 0 ? map : { form: error.message });
      } else {
        setServerErrors({
          form: "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید و دوباره بزنید.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        void onSubmit(e);
      }}
      noValidate
      className="space-y-4"
    >
      {existingCode ? (
        <div className="border-verde/30 bg-verde/[0.07] rounded-xl border px-3.5 py-3">
          <p className="text-verde text-[12.5px] font-extrabold">
            شما قبلاً در این مسابقه شرکت کرده‌اید
          </p>
          <p className="text-text-muted mt-1 text-[11.5px] leading-6">
            هر کد ملی فقط یک بار می‌تواند آزمون بدهد. کارنامهٔ شما با کد رهگیری زیر قابل مشاهده است.
          </p>
          <Link
            href={`/receipt?code=${encodeURIComponent(existingCode)}`}
            className="text-brand mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold underline underline-offset-4"
          >
            مشاهدهٔ کارنامه · <span dir="ltr">{existingCode}</span>
          </Link>
        </div>
      ) : serverErrors.form ? (
        <FormAlert title="ثبت‌نام انجام نشد">{serverErrors.form}</FormAlert>
      ) : null}

      {/* ── هویت ── */}
      <fieldset className="space-y-3">
        <legend className="text-text-subtle mb-1 text-[11px] font-extrabold tracking-wide">
          ۱ · مشخصات شما
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="نام"
            value={v.first}
            onChange={(x) => {
              set("first", x);
            }}
            onBlur={blur("first")}
            error={err("first")}
            autoComplete="given-name"
            data-k="first"
            placeholder="مثلاً محمد"
          />
          <Field
            label="نام خانوادگی"
            value={v.last}
            onChange={(x) => {
              set("last", x);
            }}
            onBlur={blur("last")}
            error={err("last")}
            autoComplete="family-name"
            data-k="last"
            placeholder="مثلاً رضایی"
          />
        </div>
        <Field
          label="کد ملی"
          value={v.nid}
          onChange={(x) => {
            set("nid", x.replace(/[^\d۰-۹٠-٩]/g, "").slice(0, 10));
          }}
          onBlur={blur("nid")}
          error={err("nid")}
          inputMode="numeric"
          autoComplete="off"
          data-k="nid"
          ltr
          placeholder="0012345678"
          hint="همان کد ملی شناسنامه؛ برای یکتایی شرکت‌کننده لازم است و منتشر نمی‌شود."
        />
        <Field
          label="شمارهٔ همراه"
          value={v.phone}
          onChange={(x) => {
            set("phone", x.replace(/[^\d۰-۹٠-٩]/g, "").slice(0, 11));
          }}
          onBlur={blur("phone")}
          error={err("phone")}
          inputMode="tel"
          autoComplete="tel"
          data-k="phone"
          ltr
          placeholder="09xxxxxxxxx"
        />

        <div>
          <span className="text-text mb-1.5 block text-[12.5px] font-bold">تاریخ تولد</span>
          <div className="grid grid-cols-3 gap-2" onBlur={blur("day")}>
            {(
              [
                ["day", "روز", "۱۵"],
                ["month", "ماه", "۰۶"],
                ["year", "سال", "۱۳۸۲"],
              ] as const
            ).map(([k, ph, sample]) => (
              <input
                key={k}
                aria-label={ph}
                data-k={k === "day" ? "day" : undefined}
                value={v[k]}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/[^\d۰-۹٠-٩]/g, "")
                    .slice(0, k === "year" ? 4 : 2);
                  set(k, digits);
                  if (k === "day") {
                    setTouched((p) => ({ ...p, day: true }));
                  }
                }}
                inputMode="numeric"
                placeholder={`${ph} — ${sample}`}
                aria-invalid={err("day") ? true : undefined}
                className={`bg-surface text-text placeholder:text-text-subtle h-11 w-full rounded-xl border px-2.5 text-center text-[13px] tabular-nums outline-none focus:ring-2 ${
                  err("day")
                    ? "border-brick/60 focus:border-brick focus:ring-brick/15"
                    : "border-border-strong focus:border-brand/55 focus:ring-brand/15"
                }`}
              />
            ))}
          </div>
          {err("day") ? (
            <p role="alert" className="text-brick mt-1.5 flex items-start gap-1 text-[11.5px]">
              <span aria-hidden="true">▲</span>
              {err("day")}
            </p>
          ) : (
            <p className="text-text-subtle mt-1.5 text-[11px]">
              به تاریخ شمسی — سال تولد چهاررقمی.
            </p>
          )}
        </div>
      </fieldset>

      {/* ── مسجد ── */}
      <fieldset className="border-border space-y-2 border-t pt-4">
        <legend className="text-text-subtle mb-1 text-[11px] font-extrabold tracking-wide">
          ۲ · مسجد محلهٔ شما
        </legend>

        {selected ? (
          <div className="border-brand/25 bg-brand/[0.05] flex items-center gap-3 rounded-xl border px-3 py-2.5">
            <MosqueMark name={selected.name} order={selected.display_order} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-text truncate text-[13px] font-extrabold">{selected.name}</p>
              <p className="text-text-subtle text-[10.5px]">
                {selected.neighborhood} · <span dir="ltr">{selected.code}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                set("mosqueId", null);
                setMq("");
              }}
              className="text-brand shrink-0 text-[11.5px] font-bold underline underline-offset-4"
            >
              تغییر
            </button>
          </div>
        ) : (
          <>
            <label className="relative block">
              <span className="sr-only">جست‌وجوی مسجد</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="text-text-subtle pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" strokeLinecap="round" />
              </svg>
              <input
                value={mq}
                onChange={(e) => {
                  setMq(e.target.value);
                }}
                placeholder={
                  boot.phase === "ready"
                    ? "نام مسجد یا محله را بنویسید…"
                    : "در حال دریافت فهرست مساجد…"
                }
                disabled={boot.phase !== "ready"}
                className="border-border-strong bg-surface text-text placeholder:text-text-subtle focus:border-brand/55 focus:ring-brand/15 h-11 w-full rounded-xl border pr-9 pl-3 text-[12.5px] outline-none focus:ring-2 disabled:opacity-60"
              />
            </label>

            <div
              role="listbox"
              aria-label="فهرست مساجد"
              className="border-border bg-surface max-h-56 overflow-y-auto rounded-xl border"
            >
              {boot.phase === "error" ? (
                <p className="text-text-muted px-3 py-5 text-center text-[12px]">
                  فهرست مساجد خوانده نشد. صفحه را دوباره باز کنید.
                </p>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-5 text-center">
                  <Girih size={18} className="text-text-subtle mx-auto" />
                  <p className="text-text-muted mt-2 text-[12px]">مسجدی با این نام پیدا نشد.</p>
                </div>
              ) : (
                <ul className="divide-border divide-y">
                  {filtered.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          set("mosqueId", m.id);
                        }}
                        className="hover:bg-surface-2 focus-visible:bg-surface-2 flex w-full items-center gap-2.5 px-3 py-2 text-right transition-colors outline-none"
                      >
                        <MosqueMark name={m.name} order={m.display_order} size={30} />
                        <span className="min-w-0 flex-1">
                          <span className="text-text block truncate text-[12.5px] font-bold">
                            {m.name}
                          </span>
                          <span className="text-text-subtle text-[10.5px]">{m.neighborhood}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {err("mosque") ? (
              <p role="alert" className="text-brick flex items-start gap-1 text-[11.5px]">
                <span aria-hidden="true">▲</span>
                {err("mosque")}
              </p>
            ) : (
              <p className="text-text-subtle text-[11px] leading-5">
                بعد از ثبت‌نام، مسجد انتخابی قفل می‌شود؛ نتیجهٔ آزمون به نام همین مسجد ثبت خواهد شد.
              </p>
            )}
          </>
        )}
      </fieldset>

      <div className="border-border space-y-2.5 border-t pt-4">
        <PrimaryButton
          type="submit"
          loading={submitting}
          loadingLabel="در حال ثبت…"
          className="w-full"
        >
          ثبت‌نام و ورود به آزمون
        </PrimaryButton>
        <p className="text-text-subtle text-center text-[11px] leading-6">
          با ثبت‌نام،{" "}
          <Link
            href="/rules"
            className="text-brand inline-flex min-h-[28px] items-center font-bold underline underline-offset-4"
          >
            قوانین مسابقه
          </Link>{" "}
          را می‌پذیرید. اطلاع‌رسانی رسمی در کانال {SITE.channel.handle} انجام می‌شود.
        </p>
      </div>
    </form>
  );
}
