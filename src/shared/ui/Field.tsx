"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * فیلد فرم — یک‌بار نوشته، همه‌جا یکسان.
 *
 * ── چه چیزی را حل می‌کند؟ ─────────────────────────────────────────────────
 * خطای اعتبارسنجی سمت سرور به یک کلید فیلد اشاره می‌کند (`errors.national_id`).
 * اگر هر فیلد دست‌ساز باشد، اتصال «پیام خطا به کادر» هر بار دوباره اختراع
 * می‌شود و یک‌جا از قلم می‌افتد. این‌جا `aria-invalid` و `aria-describedby`
 * خودکار ست می‌شوند، پس صفحه‌خوان هم خطا را می‌خواند.
 *
 * ── چرا ورودی عددی با `inputMode` و نه `type="number"`؟ ───────────────────
 * `type="number"` در موبایل چرخ‌فلش می‌سازد، صفرِ ابتدای کد ملی را حذف
 * می‌کند و با اسکرول ماوس عوض می‌شود. کد ملی و شماره تماس متن‌اند، نه عدد.
 */
export type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  /** نمایش ارقام فارسی هنگام تایپ */
  ltr?: boolean;
  optional?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "className">;

export function Field({ label, error, hint, value, onChange, ltr, optional, ...rest }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label
        htmlFor={id}
        className="text-text mb-1.5 flex items-baseline gap-1.5 text-[12.5px] font-bold"
      >
        {label}
        {optional ? (
          <span className="text-text-subtle text-[10.5px] font-normal">(اختیاری)</span>
        ) : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : hint ? hintId : undefined}
        className={[
          "bg-surface text-text placeholder:text-text-subtle h-11 w-full rounded-xl border px-3 text-[13px] transition-colors outline-none",
          "focus:ring-2",
          ltr ? "text-left tabular-nums" : "",
          error
            ? "border-brick/60 focus:border-brick focus:ring-brick/15"
            : "border-border-strong focus:border-brand/55 focus:ring-brand/15",
        ].join(" ")}
        {...rest}
      />
      {error ? (
        <p
          id={errId}
          role="alert"
          className="text-brick mt-1.5 flex items-start gap-1 text-[11.5px] leading-5"
        >
          <span aria-hidden="true">▲</span>
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-text-subtle mt-1.5 text-[11px] leading-5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** دکمهٔ اصلی — یکی، با حالت بارگذاری که عرض را نمی‌پراند. */
export function PrimaryButton({
  children,
  loading,
  loadingLabel = "در حال انجام…",
  ...rest
}: {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "bg-brand text-on-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-extrabold transition-all",
        "hover:bg-brand-hover active:scale-[0.99]",
        "focus-visible:ring-focus/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-55",
        rest.className ?? "",
      ].join(" ")}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** هشدار سراسری فرم — خطای کل درخواست، نه خطای یک فیلد. */
export function FormAlert({
  tone = "error",
  title,
  children,
}: {
  tone?: "error" | "info";
  title: string;
  children?: ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-brick/30 bg-brick/[0.06] text-brick"
      : "border-brand/25 bg-brand/[0.06] text-brand";
  return (
    <div role="alert" className={`rounded-xl border px-3.5 py-3 ${cls}`}>
      <p className="text-[12.5px] font-extrabold">{title}</p>
      {children ? (
        <div className="text-text-muted mt-1 text-[11.5px] leading-6">{children}</div>
      ) : null}
    </div>
  );
}
