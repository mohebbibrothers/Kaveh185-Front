"use client";

import Link from "next/link";
import { toFa } from "@/shared/lib/fa";
import type { Session } from "@/shared/api/session";
import { SITE } from "@/shared/config/site";

/**
 * پنلِ کوچکِ زیرِ کارتِ نشست: «چه چیزی از من ثبت شده و کجا می‌توانم ببینمش».
 *
 * ── چرا این پنل لازم است؟ ─────────────────────────────────────────────────
 * کاربری که آزمون داده، کارنامه‌اش را با «کد رهگیری» می‌گیرد و کد را گم
 * می‌کند. این‌جا سه چیز همیشه در دسترس است: کدِ رهگیریِ همین دستگاه، پیوندِ
 * استعلام، و کانالِ رسمیِ اطلاع‌رسانی.
 */
export function AccountPanel({ session }: { session: Session }) {
  const code = session.trackingCode ?? null;
  const score = session.lastScore ?? null;

  return (
    <div className="border-border bg-surface-2/60 rounded-2xl border px-4 py-3.5">
      <p className="text-text text-[12px] font-extrabold">کارنامه و کد رهگیری</p>
      {code ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-[11px]">کد رهگیریِ شما</span>
          <span
            dir="ltr"
            className="border-border bg-surface text-text rounded-md border px-2 py-0.5 text-[11.5px] font-extrabold tabular-nums"
          >
            {code}
          </span>
          {score !== null ? (
            <span className="text-verde text-[11px] font-extrabold">امتیازِ آخر: {toFa(score)}</span>
          ) : null}
        </div>
      ) : (
        <p className="text-text-muted mt-1 text-[11px] leading-6">
          وقتی آزمون را تمام کنید، کدِ رهگیریِ کارنامه‌تان همین‌جا و در صفحهٔ کارنامه می‌آید. کد را از
          دست دادید؟ با کد ملی و شمارهٔ همراه از صفحهٔ کارنامه بازیابی می‌شود.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          href="/receipt"
          className="text-brand inline-flex min-h-[30px] items-center text-[11px] font-extrabold underline underline-offset-4"
        >
          صفحهٔ کارنامه
        </Link>
        <a
          href={SITE.channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-text inline-flex min-h-[30px] items-center text-[11px] font-bold"
        >
          اطلاع‌رسانیِ رسمی: {SITE.channel.handle}
        </a>
      </div>
    </div>
  );
}
