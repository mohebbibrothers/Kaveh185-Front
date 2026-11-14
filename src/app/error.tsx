"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="text-brick text-[11.5px] font-extrabold tracking-wide">خطای غیرمنتظره</p>
        <h1 className="mt-1 text-[clamp(20px,3vw,28px)] font-extrabold">یک لحظه اختلال پیش آمد</h1>
        <p className="text-text-muted mt-2 text-[13.5px] leading-7">
          اگر دوباره تلاش کردی و درست نشد، کمی بعد سر بزن. دادهٔ ثبت‌نام و آزمون تو از بین نمی‌رود.
        </p>
        <button
          onClick={reset}
          className="bg-brand text-on-brand hover:bg-brand-hover mt-6 inline-flex h-11 items-center rounded-md px-6 text-[14px] font-bold"
        >
          تلاش دوباره
        </button>
      </div>
    </main>
  );
}
