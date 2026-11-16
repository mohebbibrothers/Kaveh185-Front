"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/shared/api/client";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

/**
 * خوانندهٔ کتاب — سه حالت، هیچ‌کدام ساختگی.
 *
 * ── چرا iframe و نه یک کتابخانهٔ PDF؟ ────────────────────────────────────
 * `pdf.js` حدود ۳۵۰KB gzip است و برای موبایل ضعیف، بار اول کند. مرورگرهای
 * امروزی PDF را بومی و با کنترل‌های آشنای خودشان نشان می‌دهند (زوم، جست‌وجو،
 * صفحه‌شمار). پوستهٔ ما فقط کادر و راهنماست. اگر مرورگر نتوانست، دکمهٔ
 * دانلود و باز کردن در تب تازه هست — همان فایل، بدون وابستگی اضافه.
 *
 * ── حالت‌ها ──────────────────────────────────────────────────────────────
 * ۱) `loading`  — در حال پرسیدن متادیتا از API
 * ۲) `none`     — ادمین کتاب را منتشر نکرده: پیام صادقانه + کانال رسمی
 * ۳) `ready`    — فایل هست: خواننده + دکمهٔ دانلود + برچسب فرمت/حجم
 * ۴) `error`    — API پاسخ نداد: پیام «دوباره تلاش کن»، نه صفحهٔ سفید
 */
interface BookMeta {
  title: string;
  slug: string;
  description: string;
  page_count: number | null;
  story_count: number | null;
  view_count: number;
  file_url: string;
  format_label: string;
  size_mb: number;
}

type Phase = "loading" | "none" | "ready" | "error";

export function BookReader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [book, setBook] = useState<BookMeta | null>(null);
  const [attempt, setAttempt] = useState(0);
  // حالت اولیه «loading» است؛ در effect فقط نتیجهٔ درخواست می‌نشیند.
  const counted = useRef(false);

  useEffect(() => {
    let alive = true;
    apiGet("/api/v1/exam/book/")
      .then((data: unknown) => {
        if (!alive) return;
        const meta = data as BookMeta;
        setBook(meta);
        setPhase("ready");
        // ثبت بازدید فقط یک بار در هر نشست صفحه — نه در هر رندر و نه در
        // اسکرول. شمارندهٔ بادکرده بی‌معنی است.
        if (!counted.current) {
          counted.current = true;
          apiPost(`/api/v1/exam/book/${meta.slug}/view/`).catch(() => {
            /* شمارنده شکست — تجربهٔ مطالعه نباید به آن گره بخورد */
          });
        }
      })
      .catch((error: unknown) => {
        if (!alive) return;
        // ۴۰۴ یعنی «کتاب منتشر نشده» — حالت عادی، نه خطا.
        const status = (error as { status?: number }).status;
        setPhase(status === 404 ? "none" : "error");
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setPhase("loading");
    setAttempt((n) => n + 1);
  }, []);

  if (phase === "loading") {
    return (
      <div className="border-border bg-surface mt-6 overflow-hidden rounded-2xl border">
        <div className="bg-surface-2 h-11 animate-pulse" />
        <div className="bg-canvas grid h-[62vh] min-h-[380px] place-items-center">
          <p className="text-text-subtle text-[12.5px]">در حال آماده‌سازی کتاب…</p>
        </div>
      </div>
    );
  }

  if (phase === "none") {
    return (
      <div className="border-border-strong bg-surface mt-6 rounded-2xl border border-dashed px-5 py-10 text-center">
        <span className="bg-gold-soft text-gold-strong mx-auto grid size-12 place-items-center rounded-xl">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
            <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5A1.5 1.5 0 0 0 20 18.5v-13Z" />
          </svg>
        </span>
        <p className="text-text mt-3.5 text-[14.5px] font-extrabold">
          فایل کتاب هنوز منتشر نشده است
        </p>
        <p className="text-text-muted mx-auto mt-2 max-w-[46ch] text-[12.5px] leading-7">
          به‌محض انتشار، همین صفحه امکان مطالعهٔ آنلاین کتاب را می‌دهد. اطلاع‌رسانی در کانال رسمی
          حوزه انجام می‌شود.
        </p>
        <a
          href={SITE.channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border-strong text-text hover:bg-surface-2 mt-5 inline-flex h-10 items-center rounded-xl border px-4 text-[12.5px] font-bold transition-colors"
        >
          {SITE.channel.name} در {SITE.channel.platform} ({SITE.channel.handle})
        </a>
      </div>
    );
  }

  if (phase === "error" || !book) {
    return (
      <div className="border-brick/30 bg-brick-soft/60 mt-6 rounded-2xl border px-5 py-8 text-center">
        <p className="text-text text-[13.5px] font-extrabold">دریافت کتاب انجام نشد</p>
        <p className="text-text-muted mx-auto mt-1.5 max-w-[42ch] text-[12.5px] leading-7">
          مشکل از اتصال یا سرور است؛ فایل کتاب از بین نرفته. یک بار دیگر تلاش کنید.
        </p>
        <button
          type="button"
          onClick={retry}
          className="bg-brand text-on-brand hover:bg-brand-hover mt-4 inline-flex h-10 items-center rounded-xl px-5 text-[12.5px] font-extrabold transition-colors"
        >
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="reader-title" className="mt-6">
      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        {/* نوار ابزار: عنوان، مشخصات، دانلود — همه از دادهٔ واقعی */}
        <div className="border-border/80 bg-surface-2/60 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5">
          <div className="min-w-0">
            <p id="reader-title" className="text-text truncate text-[12.5px] font-extrabold">
              {book.title}
            </p>
            <p className="text-text-subtle text-[10.5px]">
              {book.story_count ? `${toFa(book.story_count)} داستان · ` : ""}
              {toFa(book.format_label)}
              {book.size_mb ? ` · ${toFa(book.size_mb)} مگابایت` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={book.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border-strong text-text hover:bg-canvas inline-flex h-8 items-center rounded-lg border px-3 text-[11.5px] font-bold transition-colors"
            >
              باز کردن در تب تازه
            </a>
            <a
              href={book.file_url}
              download
              className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-8 items-center rounded-lg px-3 text-[11.5px] font-bold transition-colors"
            >
              دانلود
            </a>
          </div>
        </div>

        {/* خوانندهٔ بومی مرورگر */}
        <div className="bg-canvas">
          <iframe
            src={book.file_url}
            title={`کتاب ${book.title}`}
            className="h-[78vh] min-h-[460px] w-full"
            loading="lazy"
          />
        </div>
      </div>

      <p className="text-text-subtle mt-3 text-center text-[11px] leading-6">
        اگر کتاب در این کادر باز نشد، از «باز کردن در تب تازه» استفاده کنید.
      </p>
    </section>
  );
}
