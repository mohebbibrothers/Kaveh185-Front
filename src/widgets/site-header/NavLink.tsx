"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href as never}
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
