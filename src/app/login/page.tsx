import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooterWithMartyrs as SiteFooter } from "@/widgets/site-footer/SiteFooterWithMartyrs";
import { AccountView } from "@/widgets/account/AccountView";

export const metadata: Metadata = {
  title: "نشست من",
  description: "وضعیت نشست، ادامهٔ آزمون و دسترسی به کارنامه در مسابقهٔ کاوه ۱۸۵.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="border-border mb-5 border-b pb-4">
          <p className="text-brand text-[11.5px] font-extrabold tracking-wide">ورود و نشست</p>
          <h1 className="text-text mt-1.5 text-[clamp(21px,3.2vw,28px)] font-extrabold">نشست من</h1>
          <p className="text-text-muted mt-2 text-[13px] leading-[2]">
            برای این مسابقه رمز عبوری لازم نیست: هویت شما با کد ملی و شمارهٔ همراه ثبت می‌شود و
            کارنامه با کد رهگیری در دسترس است.
          </p>
        </header>

        <AccountView />

        <p className="text-text-subtle mt-5 text-center text-[11.5px]">
          مسجد یا اطلاعاتتان اشتباه ثبت شده؟{" "}
          <Link href="/rules" className="text-brand font-bold underline underline-offset-4">
            قوانین
          </Link>{" "}
          را ببینید.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
