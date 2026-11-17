"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITE } from "@/shared/config/site";
import { Logo } from "@/shared/ui/Logo";

/**
 * منوی موبایل — **برگهٔ پایین‌کشویی (bottom sheet)**، به سبک سایت مهدیه.
 *
 * ── ایرادِ نسخهٔ قبل که کاربر دید (نکتهٔ ۸) ──────────────────────────────
 * منو یک جعبهٔ کوچک بود که *زیرِ* آیکون همبرگری باز می‌شد، با پس‌زمینهٔ
 * نیمه‌شفاف و بدون هیچ حسِ «ورق خوردن». کاربر گفت «اصلاً حرفه‌ای نیست».
 * سه مشکلِ واقعیِ آن طرح:
 *   ۱) جعبه از لبه‌ها فاصله داشت و «شناور» بود، درحالی‌که منوی موبایل
 *      باید مثل یک ورق از پایین بیاید و تمام‌عرض باشد.
 *   ۲) هیچ‌کدام از ناحیه‌های لمس (۴۴px) را رعایت نمی‌کرد.
 *   ۳) **باگ واقعی:** `fixed` داخل هدری بود که `backdrop-blur` دارد. در
 *      CSS، هر عنصر با `backdrop-filter` مبدأِ موقعیت‌یابیِ `fixed` برای
 *      فرزندانش می‌شود؛ نتیجه این بود که برگه به کادرِ ۶۴پیکسلیِ هدر
 *      مقید می‌شد و فقط یک نوار از آن دیده می‌شد. **رفع:** `createPortal`
 *      روی `body`.
 *
 * ── طراحی تازه ────────────────────────────────────────────────────────────
 * • ورق از پایین بالا می‌آید (`translateY`)، با دستگیرهٔ ۴۰×۴px.
 * • لایهٔ تیره با محوشدگی، و کلیک روی آن می‌بندد.
 * • سه گروه: مقصدهای اصلی، بخش‌های همین صفحه، حساب.
 * • ردیف اقدام چسبیده به پایین با `env(safe-area-inset-bottom)` برای
 *   آیفون‌هایی که نوار خانه دارند.
 * • هر ردیف حداقل ۴۸px ارتفاع لمسی؛ آیکون کنار هر مقصد برای اسکن سریع.
 * • چرخهٔ فوکوس داخل برگه قفل می‌شود (Tab از آخر به اول برمی‌گردد)،
 *   `Escape` می‌بندد، و با تغییر مسیر خودش بسته می‌شود.
 */
export function MobileMenu({
  links,
  // ⚠️ `anchors` عمداً پذیرفته و نادیده گرفته می‌شود: نکتهٔ ۶ کاربر حذفِ
  // بخشِ «در همین صفحه» بود. امضا حفظ شده تا `SiteHeader` و تست‌های قبلی
  // نشکنند و اگر روزی برگرداندیم، جای اضافه‌کردنش همین‌جاست.
  anchors: _anchors = [],
}: {
  links: readonly { href: string; label: string }[];
  anchors?: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  // ⚠️ بدون effect: پرتال فقط در مرورگر معنا دارد. `typeof window` در
  // رندرِ سرور `false` می‌دهد و در کلاینت `true`؛ هیدریشن هم چون تا
  // باز شدنِ منو چیزی رندر نمی‌شود، ناسازگاری ندارد.
  const [mounted] = useState(() => typeof window !== "undefined");
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const firstFocusable = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = sheetRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingInlineEnd;
    // قفل اسکرول بدون پرش: عرض نوار اسکرول (اگر مرورگر نشانش می‌دهد)
    // به‌صورت padding جبران می‌شود.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingInlineEnd = `${gap}px`;

    const id = window.setTimeout(() => {
      firstFocusable.current?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingInlineEnd = prevPadding;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
  };

  const sheet = (
    <div
      className="fixed inset-0 z-[70] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="منوی سایت"
    >
      {/* لایهٔ تیره — کلیک = بستن. `tabIndex=-1` چون دکمهٔ بستنِ واقعی در
          گوشهٔ برگه هست و این فقط یک سطح لمسی است. */}
      <button
        type="button"
        aria-label="بستن منو"
        tabIndex={-1}
        onClick={close}
        className="k185-scrim bg-stage/55 absolute inset-0 h-full w-full cursor-default backdrop-blur-[2px]"
      />

      <div
        ref={sheetRef}
        className="k185-sheet border-border/80 bg-surface absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[26px] border-t shadow-[0_-30px_70px_-30px_oklch(20%_0.05_262/0.6)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* دستگیره */}
        <div className="flex shrink-0 items-center justify-center pt-2.5 pb-1">
          <span aria-hidden="true" className="bg-border-strong/70 h-[4px] w-10 rounded-full" />
        </div>

        {/* ⚠️ نکتهٔ ۶ کاربر: عنوانِ «منو» برداشته شد.
            برگهٔ پایین‌کشویی خودش می‌گوید منو است؛ یک برچسبِ اضافه فقط
            یک ردیف از ارتفاعِ ارزشمندِ موبایل را می‌گرفت. دکمهٔ بستن
            می‌ماند (لمسِ بزرگ، سمتِ شروعِ RTL) و کنارش نشانِ سایت آمده
            تا برگه هویت داشته باشد. */}
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2">
          <span className="flex items-center gap-2">
            <Logo size={26} />
            <span className="text-text text-[12.5px] font-extrabold">{SITE.name}</span>
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="بستن منو"
            className="border-border bg-surface-2 text-text-muted hover:text-text grid size-9 place-items-center rounded-full border transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav
          aria-label="ناوبری موبایل"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2"
        >
          <ul className="space-y-0.5">
            {links.map((n, i) => (
              <li key={n.href}>
                <Link
                  ref={i === 0 ? firstFocusable : undefined}
                  href={n.href as Route}
                  onClick={close}
                  className="k185-sheet-item group text-text hover:bg-surface-2 flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[14px] font-bold transition-colors"
                  style={{ animationDelay: `${i * 36}ms` }}
                >
                  <span className="bg-surface-2 text-brand group-hover:bg-brand group-hover:text-on-brand grid size-8 shrink-0 place-items-center rounded-lg transition-colors">
                    <NavGlyph href={n.href} />
                  </span>
                  {n.label}
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-text-subtle/60 ms-auto"
                    aria-hidden="true"
                  >
                    <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

        </nav>

        {/* ردیف اقدام — همیشه پایین برگه، بی‌نیاز از اسکرول */}
        <div className="border-border/70 bg-surface/95 shrink-0 border-t px-3 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              onClick={close}
              className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[13.5px] font-extrabold shadow-[0_1px_0_oklch(100%_0_0/0.16)_inset] transition-colors"
            >
              ثبت‌نام و شرکت
            </Link>
            <Link
              href="/login"
              onClick={close}
              className="border-border-strong text-text hover:bg-surface-2 inline-flex h-11 items-center justify-center rounded-xl border px-4 text-[13px] font-bold transition-colors"
            >
              ورود
            </Link>
          </div>
          <a
            href={SITE.channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-subtle mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold"
          >
            <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
            اطلاع‌رسانی رسمی: {SITE.channel.name} در {SITE.channel.platform}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="باز کردن منو"
        className="border-border-strong text-text hover:bg-surface-2 grid size-9 place-items-center rounded-lg border transition-colors active:scale-95 lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 7h16M4 12h16M4 17h11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {mounted && open ? createPortal(sheet, document.body) : null}
    </>
  );
}

/** آیکونِ کوچکِ هر مقصد — بدون وابستگی به کتابخانهٔ آیکون. */
function NavGlyph({ href }: { href: string }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (href === "/") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (href === "/book") {
    return (
      <svg {...common}>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
      </svg>
    );
  }
  if (href === "/rules") {
    return (
      <svg {...common}>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M9 12h7M9 16h5" />
      </svg>
    );
  }
  if (href === "/mosques") {
    return (
      <svg {...common}>
        <path d="M5 20V11h3v9M16 20V11h3v9M9 20v-5a3 3 0 0 1 6 0v5" />
        <path d="M12 3v3" />
      </svg>
    );
  }
  if (href === "/receipt") {
    return (
      <svg {...common}>
        <path d="M7 3h10v18l-2.5-1.6L12 21l-2.5-1.6L7 21z" />
        <path d="M10 8h4M10 12h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
