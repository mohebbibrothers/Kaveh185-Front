"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

/**
 * لینک ناوبری با نشانگر صفحهٔ جاری.
 *
 * ── چرا فایل جدا؟ ─────────────────────────────────────────────────────────
 * `usePathname` فقط در کامپوننت کلاینت کار می‌کند و هدر عمداً *سرور*
 * است (تا در HTML بماند و بدون جاوااسکریپت هم دیده شود). اگر همان
 * `usePathname` را به هدر می‌بردیم، کل هدر کلاینت می‌شد. پس فقط همین
 * تک‌لینک کلاینت است و بقیهٔ هدر سرور می‌ماند.
 *
 * پیش‌تر هیچ لینکی حالت فعال نداشت؛ کاربر در صفحهٔ «قوانین» نمی‌دانست
 * کجاست. این خط زیرین، جای فعلی را نشان می‌دهد و برای صفحه‌خوان هم
 * `aria-current="page"` می‌گذارد.
 */
export function NavLink({ href, label }: { href: Route; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`after:bg-brand relative rounded-md px-3 py-2 text-[13px] font-semibold transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-right after:rounded-full after:transition-transform ${
        active
          ? "text-text after:scale-x-100"
          : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * آیکون‌های ناوبری — SVG درون‌خطی، بدون فونت آیکون و بدون درخواست شبکه.
 *
 * چرا آیکون؟ چهار لینکِ متنی پشت‌سرهم در هدر «فهرست» است، نه «ناوبری».
 * آیکونِ کوچک (۱۵px) قبل از هر برچسب، اسکنِ سریع را ممکن می‌کند و در
 * منوی موبایل هم لازم است. همه با `currentColor` رنگ می‌گیرند تا در هر
 * زمینه‌ای (روشن/تیره) درست بنشینند.
 */
const ICONS: Record<string, React.ReactNode> = {
  home: (
    <path
      d="M4 10.6 12 4l8 6.6V19a1.4 1.4 0 0 1-1.4 1.4h-3.2v-5.1H8.6V20.4H5.4A1.4 1.4 0 0 1 4 19Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  book: (
    <>
      <path
        d="M4 5.4c2.7-1 5.3-1 8 .6 2.7-1.6 5.3-1.6 8-.6v13c-2.7-1-5.3-1-8 .6-2.7-1.6-5.3-1.6-8-.6Z"
        strokeLinejoin="round"
      />
      <path d="M12 6v13" strokeLinecap="round" />
    </>
  ),
  rules: (
    <>
      <path
        d="M6.5 3.8h8.2L19 8.1v11.1a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z"
        strokeLinejoin="round"
      />
      <path d="M14 4v4.3h4.6M8.7 12h6.6M8.7 15.4h4.4" strokeLinecap="round" />
    </>
  ),
  ranking: (
    <>
      <path d="M4.5 19.5h15" strokeLinecap="round" />
      <path d="M7 19.5v-5.2M12 19.5V8.4M17 19.5v-8.1" strokeLinecap="round" strokeWidth="2.1" />
    </>
  ),
  receipt: (
    <>
      <path
        d="M6 3.8h12v16.4l-2.4-1.6-1.8 1.6-1.8-1.6-1.8 1.6L8.4 18.6 6 20.2Z"
        strokeLinejoin="round"
      />
      <path d="M9 9h6M9 12.4h4.2" strokeLinecap="round" />
    </>
  ),
};

/** آیکونِ نام‌دار — اگر نامی ناشناخته بیاید، null (بدون شکستن چیدمان). */
export function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  const path = ICONS[name] ?? ICONS.book;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}
