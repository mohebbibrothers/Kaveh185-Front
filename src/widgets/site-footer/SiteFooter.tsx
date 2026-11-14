import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { SITE } from "@/shared/config/site";

const channels = [
  { label: "ایتا", href: "https://eitaa.com/kaveh185_ir" },
  { label: "بله", href: "https://ble.ir/kaveh185_ir" },
  { label: "روبیکا", href: "https://rubika.ir/kaveh185_ir" },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface-2 mt-16 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-[14.5px] font-extrabold">{SITE.name}</span>
          </div>
          <p className="text-text-muted mt-3 max-w-sm text-[13px] leading-7">
            {SITE.organizer} — مسابقهٔ کتابخوانی به مناسبت هفتهٔ بسیج، با مشارکت ۱۷ مسجد محله‌های
            حوزه.
          </p>
        </div>

        <nav aria-label="پیوندهای سایت">
          <h2 className="text-text-subtle mb-3 text-[12.5px] font-extrabold">دسترسی</h2>
          <ul className="space-y-2 text-[13px]">
            {(
              [
                { href: "/register", label: "ثبت‌نام در مسابقه" },
                { href: "/rules", label: "قوانین و شرایط" },
                { href: "/receipt", label: "استعلام کارنامه" },
                { href: "/mosques", label: "مساجد حوزه" },
              ] as const
            ).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-text-muted hover:text-text -my-1 inline-flex min-h-[36px] items-center transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-text-subtle mb-3 text-[12.5px] font-extrabold">کانال‌های رسمی</h2>
          <ul className="flex flex-wrap gap-2">
            {channels.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border-strong bg-surface text-text hover:bg-canvas inline-flex h-9 items-center rounded-md border px-3.5 text-[12.5px] font-bold transition-colors"
                >
                  {c.label}
                  <span className="sr-only"> (باز شدن در پنجرهٔ جدید)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-border text-text-subtle border-t px-4 py-4 text-center text-[11.5px] sm:px-6">
        © ۱۴۰۵ — {SITE.organizer}. همهٔ حقوق محفوظ است.
      </div>
    </footer>
  );
}
