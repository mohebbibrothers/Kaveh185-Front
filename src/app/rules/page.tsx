import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";

export const metadata: Metadata = { title: "قوانین و شرایط" };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-[clamp(22px,3.4vw,30px)] font-extrabold">قوانین و شرایط</h1>
        <p className="text-text-muted mt-3 max-w-[60ch] text-[13.5px] leading-8">
          این صفحه در گام بعدی ساخته می‌شود. اسکلت، مسیر و متادیتای آن آماده است.
        </p>
        <Link
          href="/"
          className="bg-surface-2 text-text mt-6 inline-flex h-11 items-center rounded-md px-5 text-[13.5px] font-bold"
        >
          بازگشت به خانه
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
