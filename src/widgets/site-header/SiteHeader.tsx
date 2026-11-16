import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { NAV, SITE } from "@/shared/config/site";
import { MobileMenu } from "./MobileMenu";

/**
 * هدر سایت — سه ناحیه، یک خط، بی‌شلوغی.
 *
 * ── تصمیم‌ها ────────────────────────────────────────────────────────────
 * • **نشان**: در دسکتاپ شمسهٔ کامل (`variant="emblem"`) که تاج و پرچمش
 *   بریده نمی‌شود؛ در موبایل چهرهٔ گردِ مرکزچین تا فضای کم هدر را نخورد.
 *   این تفکیک عمدی است: قاب کامل در ۳۲px فقط «لکه» می‌شود.
 * • **ناوبری**: پنج مقصد، با خط زیرینِ نازکی که فقط روی هاور/بخش فعال
 *   ظاهر می‌شود. در نسخهٔ قبل لینک‌ها دکمه‌های خاکستری بودند و سلسله‌مراتب
 *   نداشتند.
 * • **تم**: کلید روز/شب کنار «ورود» — جایی که کاربر انتظارش را دارد، نه
 *   گوشهٔ دور.
 * • **ارتفاع**: ۶۴px موبایل، ۷۲px دسکتاپ. چسبیده به بالا با شیشهٔ مات تا
 *   محتوا زیرش زنده بماند.
 */
export function SiteHeader() {
  const links = NAV.filter((n) => n.href.startsWith("/#"));

  return (
    <header className="border-border/70 bg-canvas/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px]">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg py-1"
          aria-label={SITE.name}
        >
          <span className="hidden sm:block">
            <Logo size={42} variant="emblem" />
          </span>
          <span className="sm:hidden">
            <Logo size={38} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-text text-[15px] font-extrabold tracking-tight">{SITE.name}</span>
            <span className="text-text-subtle hidden text-[10.5px] font-medium sm:block">
              مسابقهٔ کتاب‌خوانی هفتهٔ بسیج
            </span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 lg:flex">
          {links.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-text-muted hover:text-text after:bg-brand relative rounded-md px-3 py-2 text-[13px] font-semibold transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-right after:scale-x-0 after:rounded-full after:transition-transform hover:after:scale-x-100"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle compact />
          <Link
            href="/login"
            className="text-text-muted hover:bg-surface-2 hover:text-text hidden h-9 items-center rounded-md px-3 text-[13px] font-bold transition-colors sm:inline-flex"
          >
            ورود
          </Link>
          <Link
            href="/register"
            className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-bold shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors"
          >
            ثبت‌نام و شرکت
          </Link>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
