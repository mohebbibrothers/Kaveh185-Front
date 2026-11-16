"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchReportCard, verifyReceipt, SessionExpiredError } from "@/shared/api/exam";
import { ApiError } from "@/shared/api/client";
import { getSession } from "@/shared/api/session";
import type { ReportCard } from "@/shared/api/participant";
import { PrimaryButton } from "@/shared/ui/Field";
import { Divider, Girih } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import { SITE } from "@/shared/config/site";

/**
 * کارنامه و استعلام.
 *
 * ── دو کاربرد، یک صفحه ────────────────────────────────────────────────────
 * ۱) **شرکت‌کننده** بعد از آزمون می‌آید: کارنامهٔ خودش را می‌بیند — بدون
 *    کد رهگیری، از نشستش.
 * ۲) **هر کس دیگر** (خانواده، مسئول مسجد، داور) با کد رهگیری استعلام
 *    می‌کند که این کارنامه واقعی است. استعلام عمومی است و نشست نمی‌خواهد.
 *
 * همین دوگانگی، دلیل طراحی است: ورودی کد همیشه بالای صفحه هست، و اگر
 * کاربر کارنامهٔ خودش را دارد، آن را جای همان فرم می‌بینیم.
 */
type Mode = "auto" | "own" | "public";

export function ReceiptView() {
  const params = useSearchParams();
  const codeFromUrl = (params.get("code") ?? "").trim();

  const [mode, setMode] = useState<Mode>("auto");
  const [card, setCard] = useState<ReportCard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState(codeFromUrl);

  const loadPublic = useCallback(async (code: string) => {
    setBusy(true);
    setError(null);
    try {
      const c = await verifyReceipt(code);
      setCard(c);
      setMode("public");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 404
            ? "کارنامه‌ای با این کد رهگیری پیدا نشد. کد را با دقت بررسی کنید."
            : err.message,
        );
      } else {
        setError("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
      }
      setCard(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const loadOwn = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const c = await fetchReportCard();
      setCard(c);
      setMode("own");
    } catch (err) {
      if (err instanceof SessionExpiredError || err instanceof ApiError) {
        // آزمون هنوز تمام نشده یا نشستی نیست — این خطا را با صدای بلند
        // نشان نمی‌دهیم چون حالت عادی است، نه خرابی.
        setCard(null);
      } else {
        setError("ارتباط با سرور برقرار نشد.");
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (codeFromUrl) {
        void loadPublic(codeFromUrl);
        return;
      }
      if (getSession()) {
        void loadOwn();
        return;
      }
      setMode("public");
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [codeFromUrl, loadOwn, loadPublic]);

  return (
    <div className="space-y-5">
      {/* ── ورودی استعلام ── */}
      {mode !== "own" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const c = input.trim().toUpperCase();
            if (c.length < 4) {
              setError("کد رهگیری را کامل وارد کنید.");
              return;
            }
            void loadPublic(c);
          }}
          className="border-border bg-surface rounded-2xl border p-4"
        >
          <label htmlFor="tracking" className="text-text block text-[12.5px] font-extrabold">
            استعلام کارنامه با کد رهگیری
          </label>
          <p className="text-text-subtle mt-1 text-[11.5px] leading-6">
            کد رهگیری با حروف «KV185-» شروع می‌شود و در پایان آزمون به شما داده شده است.
          </p>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <input
              id="tracking"
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase());
                setError(null);
              }}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              placeholder="KV185-XXXXXXXX"
              className="border-border-strong bg-surface-2 text-text placeholder:text-text-subtle focus:border-brand/55 focus:ring-brand/15 h-11 flex-1 rounded-xl border px-3 text-left text-[13px] tracking-wider tabular-nums outline-none focus:ring-2"
            />
            <PrimaryButton type="submit" loading={busy} loadingLabel="در حال بررسی…">
              استعلام
            </PrimaryButton>
          </div>
        </form>
      ) : null}

      {error ? (
        <div role="alert" className="border-brick/30 bg-brick/[0.06] rounded-xl border px-3.5 py-3">
          <p className="text-brick text-[12.5px] font-extrabold">{error}</p>
        </div>
      ) : null}

      {busy && !card ? (
        <div
          className="border-border bg-surface rounded-2xl border p-10 text-center"
          aria-busy="true"
        >
          <span
            aria-hidden="true"
            className="border-brand/30 border-t-brand mx-auto block size-6 animate-spin rounded-full border-2"
          />
          <p className="text-text-muted mt-3 text-[12.5px]">در حال دریافت کارنامه…</p>
        </div>
      ) : null}

      {card ? <CardView card={card} own={mode === "own"} /> : null}
    </div>
  );
}

function CardView({ card, own }: { card: ReportCard; own: boolean }) {
  const s = card.summary;
  const accuracy =
    typeof s.accuracy_percent === "number" ? s.accuracy_percent : Number(s.accuracy_percent ?? 0);
  const total = s.total_questions || 0;
  const share = (n: number) => (total > 0 ? `${(n / total) * 100}%` : "0%");

  return (
    <article className="border-border bg-surface overflow-hidden rounded-2xl border">
      {/* سربرگ */}
      <header className="border-border bg-surface-2 border-b px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-verde text-[11px] font-extrabold tracking-wide">
              {own ? "کارنامهٔ شما" : "استعلام موفق — کارنامهٔ معتبر"}
            </p>
            <h2 className="text-text mt-1 text-[17px] font-extrabold">
              {card.participant.full_name}
            </h2>
            <p className="text-text-subtle mt-0.5 text-[11.5px]">
              {card.participant.mosque_name ?? "—"}
              {card.participant.mosque_code ? (
                <>
                  {" · "}
                  <span dir="ltr">{card.participant.mosque_code}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="border-border-strong bg-surface rounded-xl border px-3 py-2 text-left">
            <p className="text-text-subtle text-[9.5px]">کد رهگیری</p>
            <p
              className="text-text text-[12px] font-extrabold tracking-wider tabular-nums"
              dir="ltr"
            >
              {card.tracking_code}
            </p>
          </div>
        </div>
      </header>

      {/* نمره */}
      <div className="px-4 py-5 sm:px-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="پاسخ درست" value={toFa(s.correct_count)} tone="verde" />
          <Stat label="پاسخ نادرست" value={toFa(s.wrong_count)} tone="brick" />
          <Stat label="بی‌پاسخ" value={toFa(s.unanswered_count)} tone="muted" />
          <Stat label="دقت" value={`${toFa(Math.round(accuracy))}٪`} tone="brand" />
        </div>

        {/* نوار ترکیب پاسخ‌ها — یک نگاه، بدون خواندن عدد */}
        <div className="mt-4">
          <div
            className="bg-surface-2 flex h-2.5 overflow-hidden rounded-full"
            role="img"
            aria-label={`از ${toFa(total)} پرسش: ${toFa(s.correct_count)} درست، ${toFa(s.wrong_count)} نادرست، ${toFa(s.unanswered_count)} بی‌پاسخ`}
          >
            <span className="bg-verde" style={{ width: share(s.correct_count) }} />
            <span className="bg-brick/70" style={{ width: share(s.wrong_count) }} />
            <span className="bg-border-strong" style={{ width: share(s.unanswered_count) }} />
          </div>
          <div className="text-text-subtle mt-1.5 flex justify-between text-[10px]">
            <span>از {toFa(total)} پرسش</span>
            <span>
              {s.status_label}
              {s.finished_reason === "time_expired" ? " (اتمام زمان)" : ""}
            </span>
          </div>
        </div>

        <Divider className="my-4" />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11.5px] sm:grid-cols-4">
          <Row k="شروع" v={s.started_at_jalali ?? "—"} />
          <Row k="پایان" v={s.completed_at_jalali ?? "—"} />
          <Row k="مدت پاسخ" v={s.duration_display ?? "—"} />
          <Row k="امتیاز" v={typeof s.total_score === "number" ? toFa(s.total_score) : "—"} />
        </dl>

        {card.thank_you_message ? (
          <p className="border-verde/25 bg-verde/[0.06] text-text-muted mt-4 rounded-xl border px-3.5 py-3 text-[12px] leading-7">
            {card.thank_you_message}
          </p>
        ) : null}

        {card.receipt_signature ? (
          <p className="text-text-subtle mt-3 text-[10px] leading-5">
            امضای دیجیتال رسید:{" "}
            <span dir="ltr" className="break-all tabular-nums">
              {card.receipt_signature}
            </span>
          </p>
        ) : null}
      </div>

      {/* اقدام‌ها */}
      <footer className="border-border bg-surface-2 flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <Link
          href="/"
          className="bg-brand text-on-brand inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
        >
          بازگشت به صفحهٔ اصلی
        </Link>
        <a
          href={SITE.channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border-strong text-text hover:bg-surface inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold transition-colors"
        >
          کانال رسمی
        </a>
        <span className="text-text-subtle ms-auto text-[10.5px]">
          این کارنامه قابل استعلام عمومی است
        </span>
      </footer>
    </article>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "verde" | "brick" | "muted" | "brand";
}) {
  const color =
    tone === "verde"
      ? "text-verde"
      : tone === "brick"
        ? "text-brick"
        : tone === "brand"
          ? "text-brand"
          : "text-text-muted";
  return (
    <div className="border-border bg-surface-2 rounded-xl border px-3 py-2.5 text-center">
      <p className={`text-[19px] leading-none font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="text-text-subtle mt-1 text-[10px]">{label}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-text-subtle text-[10px]">{k}</dt>
      <dd className="text-text-muted mt-0.5 tabular-nums">{v}</dd>
    </div>
  );
}

/** کارت خالی برای وقتی نه کد آمده و نه نشستی هست. */
export function ReceiptIntro() {
  return (
    <div className="border-border bg-surface-2 rounded-2xl border border-dashed px-5 py-8 text-center">
      <Girih size={26} className="text-text-subtle mx-auto" />
      <p className="text-text mt-3 text-[13px] font-extrabold">کارنامه را با کد رهگیری ببینید</p>
      <p className="text-text-muted mx-auto mt-1.5 max-w-[46ch] text-[12px] leading-7">
        کد رهگیری در پایان آزمون به شما داده شده است. اگر آن را ندارید، با نشست خودتان به کارنامه
        دسترسی دارید — کافی است دوباره ثبت‌نام کنید.
      </p>
      <Link
        href="/register"
        className="border-border-strong text-text hover:bg-surface mt-3 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold transition-colors"
      >
        ورود به سامانه
      </Link>
    </div>
  );
}
