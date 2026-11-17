"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * منوی موبایل.
 *
 * چرا نسخهٔ قبلی نداشت؟ ناوبری با `hidden lg:flex` پنهان می‌شد و هیچ جانشینی
 * نبود — کاربر موبایل (که اکثریت مخاطب این مسابقه است) نمی‌توانست به قوانین،
 * جدول مساجد یا بخش‌های صفحه برسد. این کامپوننت آن شکاف را پر می‌کند.
 *
 * دسترس‌پذیری: aria-expanded، aria-controls، بستن با Escape، قفل اسکرول
 * هنگام باز بودن، و بستن خودکار با تغییر مسیر.
 */
export function MobileMenu({
  links,
  anchors = [],
}: {
  links: readonly { href: string; label: string }[];
  anchors?: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        className="border-border-strong text-text hover:bg-surface-2 grid size-9 place-items-center rounded-md border transition-colors lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            tabIndex={-1}
            onClick={() => {
              setOpen(false);
            }}
            className="bg-stage/45 absolute inset-0 h-full w-full"
          />
          <nav
            id="mobile-nav"
            aria-label="ناوبری موبایل"
            className="bg-surface border-border relative mx-3 mt-2 rounded-xl border p-2 shadow-lg"
          >
            {links.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => {
                  setOpen(false);
                }}
                className="text-text hover:bg-surface-2 block rounded-lg px-3 py-3 text-[14px] font-bold transition-colors"
              >
                {n.label}
              </a>
            ))}
            {anchors.length > 0 ? (
              <div className="border-border mt-1 border-t pt-1">
                <p className="text-text-subtle px-3 pt-2 pb-1 text-[10.5px] font-bold">
                  بخش‌های صفحهٔ اول
                </p>
                {anchors.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="text-text-muted hover:bg-surface-2 block rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors"
                  >
                    {n.label}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="border-border mt-1 border-t pt-1">
              <Link
                href="/login"
                onClick={() => {
                  setOpen(false);
                }}
                className="text-text-muted hover:bg-surface-2 block rounded-lg px-3 py-3 text-[14px] font-bold transition-colors"
              >
                ورود
              </Link>
              {/* «استعلام کارنامه» عمداً اینجا نیست: «کارنامه» در بالای همین
                  منو هست و دو لینک با یک مقصد، فقط تردید می‌سازد. */}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
