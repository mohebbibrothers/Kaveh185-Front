import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <div className="text-center">
        <Logo size={64} className="mx-auto" />
        <p className="text-gold-strong mt-5 text-[11.5px] font-extrabold tracking-wide">خطای ۴۰۴</p>
        <h1 className="mt-1 text-[clamp(22px,3.4vw,32px)] font-extrabold">این صفحه پیدا نشد</h1>
        <p className="text-text-muted mx-auto mt-2 max-w-sm text-[13.5px] leading-7">
          ممکن است آدرس را دستی عوض کرده باشی یا این صفحه جابه‌جا شده باشد. از خانه شروع کن.
        </p>
        <Link
          href="/"
          className="bg-brand text-on-brand hover:bg-brand-hover mt-6 inline-flex h-11 items-center rounded-md px-6 text-[14px] font-bold"
        >
          بازگشت به خانه
        </Link>
      </div>
    </main>
  );
}
