import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { RegisterGate } from "@/widgets/register/RegisterGate";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "ثبت‌نام و شرکت",
  description: `ثبت‌نام در مسابقهٔ کتاب‌خوانی ${SITE.bookTitle} — حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه. چند فیلد، کمتر از دو دقیقه.`,
  alternates: { canonical: "/register" },
};

const REASSURANCE = [
  "اطلاعات شما فقط برای یکتایی شرکت و ارتباط دربارهٔ همین مسابقه استفاده می‌شود.",
  "کد ملی رمزنگاری‌شده ذخیره می‌شود و در هیچ فهرست عمومی دیده نمی‌شود.",
  "هر کد ملی یک شرکت؛ نتیجهٔ شما قابل استعلام با کد رهگیری است.",
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <nav
          aria-label="مسیر"
          className="text-text-subtle mb-5 flex items-center gap-1.5 text-[11.5px]"
        >
          <Link
            href="/"
            className="hover:text-text -my-2 inline-flex min-h-[32px] items-center px-1 transition-colors"
          >
            خانه
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-muted">ثبت‌نام</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <RegisterGate />

          <aside className="order-1 space-y-3 lg:order-2">
            <div className="border-border bg-surface-2 rounded-2xl border p-4">
              <p className="text-text text-[12.5px] font-extrabold">پیش از شروع بدانید</p>
              <ul className="mt-2.5 space-y-2">
                {REASSURANCE.map((r) => (
                  <li
                    key={r}
                    className="text-text-muted flex items-start gap-1.5 text-[11.5px] leading-6"
                  >
                    <span aria-hidden="true" className="text-verde mt-0.5 shrink-0">
                      ✓
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border bg-surface rounded-2xl border p-4">
              <p className="text-text text-[12.5px] font-extrabold">کتاب را نخوانده‌اید؟</p>
              <p className="text-text-muted mt-1 text-[11.5px] leading-6">
                متن کامل کتاب در همین سایت است؛ می‌توانید الان بخوانید و بعد برگردید.
              </p>
              <Link
                href="/book"
                className="border-border-strong text-text hover:bg-surface-2 mt-2.5 inline-flex h-9 items-center rounded-lg border px-3 text-[12px] font-bold transition-colors"
              >
                مطالعهٔ کتاب
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
