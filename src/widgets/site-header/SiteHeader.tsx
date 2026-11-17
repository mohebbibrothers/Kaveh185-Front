import Link from "next/link";
import { NavLink } from "./NavLink";
import { Logo } from "@/shared/ui/Logo";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { ANCHORS, PRIMARY, SITE } from "@/shared/config/site";
import { MobileMenu } from "./MobileMenu";
import { ReadingProgress } from "@/shared/ui/ReadingProgress";

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
  // دسکتاپ: فقط مقصدهای واقعی. لنگرهای صفحهٔ اول در منوی موبایل می‌آیند
  // تا نوار بالا شلوغ نشود و روی صفحه‌های داخلی هم لینکِ بی‌ربط نباشد.
  const links = PRIMARY;
  const anchors = ANCHORS;

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
            <span className="text-text text-[14px] font-extrabold tracking-tight whitespace-nowrap min-[380px]:text-[15px]">
              {SITE.name}
            </span>
            <span className="text-text-subtle hidden text-[10.5px] font-medium sm:block">
              مسابقهٔ کتاب‌خوانی هفتهٔ بسیج
            </span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 lg:flex">
          {links.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
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
          {/*
            ⚠️ در ۳۲۰px این دکمه به دو خط می‌شکست و هدر را بلند می‌کرد
            (در تست واقعیِ ۳۲۰px دیده شد). حالا زیر ۳۸۰px متنِ کوتاه
            «ثبت‌نام» نشان می‌دهد و از ۳۸۰px به بالا متنِ کامل؛ دو span،
            یک دکمه — بدون منطق JS و بدون پرشِ چیدمان.
          */}
          <Link
            href="/register"
            className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-[12.5px] font-bold whitespace-nowrap shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors min-[380px]:px-4 min-[380px]:text-[13px]"
          >
            <span className="min-[380px]:hidden">ثبت‌نام</span>
            <span className="hidden min-[380px]:inline">ثبت‌نام و شرکت</span>
          </Link>
          <MobileMenu links={links} anchors={anchors} />
        </div>
      </div>

      {/* نوار پیشرفت — چسبیده به لبهٔ پایین هدر، «زیر منوی افقی بالا».
          `dir` لازم نیست: عرضِ نوار با direction صفحه هم‌جهت است و مبدأ در
          RTL خودکار سمت راست می‌شود. */}
      <ReadingProgress />
    </header>
  );
}
