import Link from "next/link";
import { NavLink } from "./NavLink";
import { Logo } from "@/shared/ui/Logo";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { ReadingProgress } from "@/shared/ui/ReadingProgress";
import { ANCHORS, PRIMARY, SITE } from "@/shared/config/site";
import { MobileMenu } from "./MobileMenu";

/**
 * هدر سایت — سه ناحیه، یک خط، بی‌شلوغی، و نوار پیشرفت زیرِ خودش.
 *
 * ── تصمیم‌های این دور ─────────────────────────────────────────────────────
 * • **نوار پیشرفت زیر منو** (نکتهٔ ۴): پیش‌تر `fixed top-0` و بالای هدر
 *   بود. حالا فرزندِ خودِ هدر و چسبیده به لبهٔ پایینیِ آن است — همان جایی
 *   که در سایت مهدیه دید. برای این، هدر `relative` است و نوار
 *   `absolute inset-x-0 bottom-0`.
 * • **«خانه» + «رتبه‌بندی مساجد»** (نکتهٔ ۵): دو تغییر در فهرست ناوبری.
 *   «خانه» اول آمد چون راهِ برگشت باید همیشه دیده شود، حتی وسط `/rules`.
 * • **کلید تم سه‌خانه‌ای** (نکتهٔ ۶): جای دکمهٔ مربعی را گرفت؛ همیشه هر
 *   سه حالت را نشان می‌دهد، پس کاربر حدس نمی‌زند کلیک بعدی چه می‌کند.
 * • **نشان**: در دسکتاپ شمسهٔ کامل (`variant="emblem"`)، در موبایل چهرهٔ
 *   گردِ مرکزچین — قاب کامل در ۳۸px فقط «لکه» می‌شود.
 * • **ارتفاع ثابت**: ۶۴px موبایل، ۷۲px دسکتاپ. همهٔ عناصر در همین ارتفاع
 *   جا می‌شوند تا هدر هیچ‌وقت نپرد.
 *
 * ⚠️ `whitespace-nowrap` روی دکمهٔ ثبت‌نام عمدی است: در ۳۲۰px اگر متن
 * بشکند، هدر دو خطی می‌شود و کل صفحه می‌پرد.
 */
export function SiteHeader() {
  const links = PRIMARY;
  const anchors = ANCHORS;

  return (
    <header className="border-border/70 bg-canvas/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6 lg:h-[72px]">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg py-1"
          aria-label={`${SITE.name} — صفحهٔ اول`}
        >
          <span className="hidden sm:block">
            <Logo size={40} variant="emblem" />
          </span>
          <span className="sm:hidden">
            <Logo size={34} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-text text-[14px] font-extrabold tracking-tight min-[380px]:text-[15px]">
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
          <Link
            href="/register"
            className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-[13px] font-bold whitespace-nowrap shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors sm:px-4"
          >
            {/* زیر ۳۸۰px متن کوتاه: «ثبت‌نام و شرکت» در ۳۲۰px می‌شکست. */}
            <span className="min-[380px]:hidden">ثبت‌نام</span>
            <span className="hidden min-[380px]:inline">ثبت‌نام و شرکت</span>
          </Link>
          <MobileMenu links={links} anchors={anchors} />
        </div>
      </div>

      {/* نوار پیشرفت — لبهٔ پایینیِ هدر، درست زیر منوی افقی */}
      <ReadingProgress />
    </header>
  );
}
