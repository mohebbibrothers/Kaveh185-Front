"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/shared/api/client";
import { SITE } from "@/shared/config/site";
import { toFa } from "@/shared/lib/fa";

/**
 * بخش «کتاب مسابقه» در صفحهٔ اول.
 *
 * ── چرا این بخش اضافه شد؟ ────────────────────────────────────────────────
 * پرسش نخست هر شرکت‌کننده این است: «از چه کتابی؟ از کجا بخوانم؟». کتاب
 * «شهادت آیه‌ها (۲)» به‌صورت فیزیکی توزیع نشده و فقط در کانال بله منتشر
 * شده بود؛ یعنی عملاً هیچ راهی برای مطالعه وجود نداشت. اکنون ادمین فایل
 * را در پنل بارگذاری می‌کند و این بخش، دروازهٔ مطالعه است.
 *
 * ── رفتار صادقانه ────────────────────────────────────────────────────────
 * تا وقتی ادمین کتاب را منتشر نکرده، API پاسخ ۴۰۴ می‌دهد و این بخش
 * **پنهان می‌شود** — نه اینکه با جلد و دکمهٔ خالی ادای کتاب را در بیاورد.
 * پس هیچ‌وقت لینک مرده یا وعدهٔ توخالی ساخته نمی‌شود.
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

export function BookSection() {
  const [book, setBook] = useState<BookMeta | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet("/api/v1/exam/book/")
      .then((data: unknown) => {
        if (alive) setBook(data as BookMeta);
      })
      .catch(() => {
        // ۴۰۴ = کتابی منتشر نشده. این خطا، خطا نیست؛ حالت عادی است.
        if (alive) setBook(null);
      })
      .finally(() => {
        if (alive) setChecked(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!checked || !book) return null;

  return (
    <section id="book" aria-labelledby="book-title" className="mt-14">
      <div className="border-border bg-surface relative overflow-hidden rounded-2xl border">
        {/* نقش‌مایهٔ محرابی گوشه — بی‌شلوغی */}
        <div
          aria-hidden="true"
          className="from-brand/[0.06] pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-l to-transparent"
        />
        <div className="relative grid items-center gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
          <div>
            <p className="text-gold-strong text-[11.5px] font-extrabold tracking-wide">
              کتاب مسابقه — قابل مطالعهٔ آنلاین
            </p>
            <h2
              id="book-title"
              className="text-text mt-1.5 text-[clamp(19px,2.6vw,25px)] font-extrabold"
            >
              {book.title}
            </h2>
            {book.description ? (
              <p className="text-text-muted mt-2.5 max-w-[62ch] text-[13px] leading-[2]">
                {book.description}
              </p>
            ) : null}
            <dl className="border-border mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-[12px]">
              {book.story_count ? (
                <div className="flex items-center gap-1.5">
                  <dt className="text-text-subtle">داستان‌ها</dt>
                  <dd className="text-text font-bold tabular-nums">{toFa(book.story_count)}</dd>
                </div>
              ) : null}
              {book.page_count ? (
                <div className="flex items-center gap-1.5">
                  <dt className="text-text-subtle">صفحه</dt>
                  <dd className="text-text font-bold tabular-nums">{toFa(book.page_count)}</dd>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5">
                <dt className="text-text-subtle">فرمت</dt>
                <dd className="text-text font-bold">{book.format_label}</dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:w-[180px]">
            <Link
              href="/book"
              className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center justify-center rounded-xl px-5 text-[13.5px] font-extrabold transition-colors"
            >
              مطالعهٔ کتاب
            </Link>
            <a
              href={`${SITE.url}/book`}
              className="border-border-strong text-text hover:bg-surface-2 inline-flex h-11 items-center justify-center rounded-xl border px-5 text-[12.5px] font-bold transition-colors"
            >
              راهنمای مطالعه
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
