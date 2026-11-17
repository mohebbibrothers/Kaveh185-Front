import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs } from "@/widgets/site-footer/SiteFooterWithMartyrs";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

/**
 * صفحهٔ ۴۰۴ — با **نشانِ بدونِ پس‌زمینه** و مشتِ شهید کاوه.
 *
 * ── نکتهٔ ۱ و ۱۱ کاربر ───────────────────────────────────────────────────
 * ۱) لوگوی ۴۰۴ حالا همان نشانِ کاملِ بدونِ بک‌گراند است (پیش‌تر یک آواتارِ
 *    کوچکِ گرد بود).
 * ۲) **مشتِ شهید کاوه** برای اولین بار جایی نشسته که معنا دارد: «راه را
 *    پیدا نکردی، ولی جا نمی‌زنی». مشت در یک قابِ تیرهٔ محرابی، کنارِ متن،
 *    با ماسکِ محو در لبه — و در موبایل بالای متن، وسط‌چین و کوچک‌تر، تا
 *    صفحه را نبلعد.
 *
 * ساختار: هدر + بدنه + فوتر (با یادوارهٔ شهدا) — همان اسکلتِ بقیهٔ صفحات،
 * چون کاربری که به ۴۰۴ می‌رسد باید بتواند بدونِ «تله» بیرون بیاید.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.04]"
        />

        <div className="relative mx-auto grid w-full max-w-4xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[minmax(0,1fr)_260px] md:gap-10">
          {/* ── متن ── */}
          <div className="order-2 text-center md:order-1 md:text-start">
            <p className="text-gold-strong flex items-center justify-center gap-2 text-[11px] font-extrabold tracking-[0.2em] md:justify-start">
              <span aria-hidden="true" className="bg-gold/50 h-px w-8" />
              خطای ۴۰۴
              <span aria-hidden="true" className="bg-gold/50 h-px w-8" />
            </p>
            <h1 className="text-text mt-2.5 text-[clamp(23px,6vw,34px)] leading-tight font-extrabold">
              این صفحه پیدا نشد
            </h1>
            <p className="text-text-muted mx-auto mt-2.5 max-w-[42ch] text-[13px] leading-[2] md:mx-0">
              ممکن است آدرس را دستی عوض کرده باشی، یا این صفحه جابه‌جا شده باشد. راهِ برگشت همیشه باز
              است.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
              <Link
                href="/"
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset] transition-colors"
              >
                بازگشت به خانه
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/rules"
                className="border-border-strong/80 text-text hover:border-brand/50 hover:bg-surface inline-flex h-11 items-center rounded-xl border px-4 text-[12.5px] font-bold transition-colors"
              >
                مشاهدهٔ قوانین
              </Link>
            </div>
          </div>

          {/* ── نشان + مشت ── */}
          <div className="order-1 flex items-center justify-center gap-3 md:order-2 md:flex-col">
            <div className="relative">
              <div
                aria-hidden="true"
                className="bg-gold/20 absolute -inset-4 rounded-full blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- نشانِ ثابتِ بهینه */}
              <img
                src="/img/emblem-mark.webp"
                alt="نشان یادبود شهید محمود کاوه، حوزهٔ مقاومت بسیج ۱۸۵"
                width={190}
                height={311}
                className="relative h-[150px] w-auto drop-shadow-[0_14px_30px_oklch(24%_0.05_260/0.3)] sm:h-[190px]"
              />
            </div>

            <div className="border-gold/35 from-gold-soft/70 to-sunken/40 relative hidden h-[190px] w-[130px] overflow-hidden rounded-t-[999px] rounded-b-2xl border bg-gradient-to-b md:block">
              {/* eslint-disable-next-line @next/next/no-img-element -- تصویر ثابت */}
              <img
                src="/img/punch-fist.webp"
                alt="نماد مشت گره‌کردهٔ شهید کاوه"
                className="absolute inset-0 size-full object-contain p-1.5"
                style={{
                  maskImage: "linear-gradient(to bottom, black 72%, transparent)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooterWithMartyrs />
    </>
  );
}
