import type { Metadata } from "next";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { ExamRunner } from "@/widgets/exam/ExamRunner";

export const metadata: Metadata = {
  title: "آزمون",
  description: "پرسش‌های مسابقهٔ کتاب‌خوانی کاوه ۱۸۵.",
  // صفحهٔ آزمون هرگز نباید در نتیجهٔ جست‌وجو ظاهر شود: بدون داده کاربر،
  // فهرست خالی و بی‌معنی است و کاربر جست‌وجوکننده را گمراه می‌کند.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <ExamRunner />
      </main>
      <SiteFooter />
    </>
  );
}
