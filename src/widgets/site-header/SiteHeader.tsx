import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { NAV, SITE } from "@/shared/config/site";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  const links = NAV.filter((n) => n.href.startsWith("/#"));

  return (
    <header className="border-border/70 bg-canvas/85 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label={SITE.name}>
          <Logo size={40} />
          <span className="flex flex-col leading-tight">
            <span className="text-text text-[15px] font-extrabold tracking-tight">{SITE.name}</span>
            <span className="text-text-subtle hidden text-[10.5px] font-medium sm:block">
              مسابقهٔ کتابخوانی هفتهٔ بسیج
            </span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 lg:flex">
          {links.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-text-muted hover:bg-surface-2 hover:text-text rounded-md px-3 py-2 text-[13px] font-semibold transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className="text-text-muted hover:bg-surface-2 hover:text-text hidden h-9 items-center rounded-md px-3 text-[13px] font-bold transition-colors sm:inline-flex"
          >
            ورود
          </Link>
          <Link
            href="/register"
            className="bg-brick text-on-brand hover:bg-brand inline-flex h-9 items-center rounded-md px-4 text-[13px] font-bold transition-colors"
          >
            ثبت‌نام و شرکت
          </Link>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
