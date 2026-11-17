"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

/**
 * آیکون‌های ناوبری — SVG درون‌خطی، بدون فونت آیکون و بدون درخواست شبکه.
 *
 * چرا آیکون؟ پنج لینکِ متنی پشت‌سرهم در هدر، «فهرست» است نه «ناوبری».
 * آیکون کوچک (۱۵px) قبل از هر برچسب، اسکنِ سریع را ممکن می‌کند و در
 * نوار پایین موبایل هم لازم است. همه با `currentColor` رنگ می‌گیرند.
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
      <path d="M6.5 3.6h8.2L19 7.9v12.5H6.5Z" strokeLinejoin="round" />
      <path d="M9.4 11.4h6.4M9.4 14.6h6.4M9.4 17.8h3.8" strokeLinecap="round" />
    </>
  ),
  ranking: (
    <>
      <path
        d="M4.6 20.4V13h3.6v7.4M10.2 20.4V5.6h3.6v14.8M15.8 20.4v-5.2H19.4v5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.6h12v16.8l-3-1.6-3 1.6-3-1.6-3 1.6Z" strokeLinejoin="round" />
      <path d="M9.2 8.4h5.6M9.2 12.2h5.6" strokeLinecap="round" />
    </>
  ),
};

export function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {ICONS[name] ?? null}
    </svg>
  );
}

/**
 * لینک ناوبری با نشانگر صفحهٔ جاری.
 *
 * ── چرا فایل جدا؟ ─────────────────────────────────────────────────────────
 * `usePathname` فقط در کامپوننت کلاینت کار می‌کند و هدر عمداً *سرور*
 * است (تا در HTML بماند و بدون جاوااسکریپت هم دیده شود). اگر همان
 * `usePathname` را به هدر می‌بردیم، کل هدر کلاینت می‌شد. پس فقط همین
 * تک‌لینک کلاینت است و بقیهٔ هدر سرور می‌ماند.
 *
 * ── «خانه» چطور فعال می‌شود؟ ────────────────────────────────────────────
 * `href === "/"` حالت خاص است: `startsWith("/")` روی همهٔ مسیرها true
 * می‌شود و اگر با همان قاعدهٔ بقیه سنجیده شود، «خانه» در همهٔ صفحه‌ها
 * فعال می‌ماند. پس برای ریشه فقط تطابق دقیق پذیرفته می‌شود.
 */
export function NavLink({ href, label, icon }: { href: Route; label: string; icon?: string }) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`after:bg-brand group relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[12.5px] font-semibold transition-colors after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-[2px] after:origin-right after:rounded-full after:transition-transform ${
        active
          ? "text-text after:scale-x-100"
          : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100"
      }`}
    >
      {icon ? (
        <span
          className={
            active ? "text-brand" : "text-text-subtle group-hover:text-brand transition-colors"
          }
        >
          <NavIcon name={icon} />
        </span>
      ) : null}
      {label}
    </Link>
  );
}
