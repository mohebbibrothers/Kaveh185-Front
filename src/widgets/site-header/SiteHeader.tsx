import Link from "next/link";
import { NavLink } from "./NavLink";
import { Logo } from "@/shared/ui/Logo";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { ANCHORS, PRIMARY, SITE } from "@/shared/config/site";
import { MobileMenu } from "./MobileMenu";
import { ReadingProgress } from "@/shared/ui/ReadingProgress";

/**
 * هدر سایت — یک خط، سه ناحیه، و نوارِ پیشرفتی که به لبهٔ پایینِ خودش چسبیده.
 *
 * ── دو تغییرِ مهمِ این نسخه ───────────────────────────────────────────────
 * ۱) **نوار پیشرفت از «بالای صفحه» به «زیر هدر» منتقل شد.** نسخهٔ قبل یک
 *    نوارِ `fixed` روی لبهٔ بالای مرورگر بود و از روی خودِ هدر رد می‌شد؛
 *    کاربر گفت باید مثل سایت مهدیه **از زیر منو** پر شود. اکنون نوار
 *    فرزندِ همین هدر است، با `absolute bottom-0`، پس همیشه دقیقاً روی
 *    خطِ جداکنندهٔ هدر می‌نشیند — نه بالای آن، نه روی محتوا — و با
 *    `position: sticky` هدر، همیشه در دید می‌ماند.
 * ۲) **نشان ثابت شد.** پیش‌تر `size` به `<Logo>` داده می‌شد ولی خودِ
 *    تصویر داخل آن با `object-contain` در همان مربع جا می‌شد و چون تصویر
 *    منبع نسبتش ۶۷۸×۷۸۰ بود (بلندتر از مربع)، ۱۳٪ ارتفاع پایین‌اش بیرون
 *    می‌زد و «بریده» دیده می‌شد. اکنون منبع، نسخهٔ **مربعِ از پیش بریده**
 *    (`emblem-square.png`) است؛ پس هیچ برشی رخ نمی‌دهد.
 *
 * ── چیدمان ───────────────────────────────────────────────────────────────
 * • **موبایل**: نشان + نام، سپس تم، دکمهٔ شرکت‌نام، و آیکون منو.
 * • **دسکتاپ**: نشان راست، پنج لینک با آیکون در میانه، تم/ورود/ثبت‌نام چپ.
 */
export function SiteHeader() {
  const links = PRIMARY;
  const anchors = ANCHORS;

  return (
    <header className="border-border/70 bg-canvas/85 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:px-5 lg:h-[72px] lg:gap-4">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-lg py-1"
          aria-label={SITE.name}
        >
          <Logo size={40} variant="emblem" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-text truncate text-[14.5px] font-extrabold tracking-tight sm:text-[15px]">
              {SITE.name}
            </span>
            <span className="text-text-subtle hidden truncate text-[10.5px] font-medium sm:block">
              مسابقهٔ کتاب‌خوانی هفتهٔ بسیج
            </span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 lg:flex">
          {links.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle compact />
          <Link
            href="/login"
            className="text-text-muted hover:bg-surface-2 hover:text-text hidden h-9 items-center rounded-md px-3 text-[13px] font-bold transition-colors lg:inline-flex"
          >
            ورود
          </Link>
          <Link
            href="/register"
            className="bg-brand text-on-brand hover:bg-brand-hover hidden h-9 items-center rounded-lg px-4 text-[13px] font-bold shadow-[0_1px_0_oklch(100%_0_0/0.14)_inset] transition-colors sm:inline-flex"
          >
            ثبت‌نام و شرکت
          </Link>
          <MobileMenu links={links} anchors={anchors} />
        </div>
      </div>

      {/* نوارِ پیشرفت: چسبیده به لبهٔ پایینِ هدر، از لبهٔ راست (شروع در RTL)
          تا چپ. `dir="ltr"` لازم است تا درصدِ پیشرفت در RTL معکوس نشود. */}
      <ReadingProgress />
    </header>
  );
}
