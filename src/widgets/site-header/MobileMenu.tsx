"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { NavIcon } from "./NavLink";

/**
 * منوی موبایل — **برگهٔ پایین‌کشویی** (Bottom Sheet)، نه یک جعبهٔ بازشو.
 *
 * ── ایرادی که کاربر دید ─────────────────────────────────────────────────
 * نسخهٔ قبل یک `div` سفید بود که از زیر هدر باز می‌شد و پشتش لایهٔ تیره
 * بود. ایرادهای واقعی:
 *   • **محل باز شدن** غلط بود: برگه از بالا می‌آمد ولی کاربر انگشتش روی
 *     آیکونِ راستِ بالا بود و چشمش پایینِ صفحه — حرکتِ عمودی برخلافِ
 *     مسیرِ طبیعیِ دست روی موبایل.
 *   • **شکل** نداشت: یک مستطیل با گوشهٔ ۱۲px و ردیف‌های متنی؛ نه نشانگر
 *     کشیدن، نه گروه‌بندی، نه آیکون. با سایت مهدیه (که کاربر نمونه داد)
 *     فاصله داشت.
 *   • **بسته‌شدن** فقط با کلیک روی پس‌زمینه بود و دکمهٔ بستنِ دیداری نداشت.
 *
 * ── طرح جدید ─────────────────────────────────────────────────────────────
 * برگه از **پایین** می‌آید و با انیمیشن ۲۸۰ms بالا می‌خزد؛ پشتش لایهٔ
 * تیره با محو شدن. داخل برگه:
 *   • **دستگیرهٔ کشیدن** (نوارِ کوچک بالای برگه) — نشانهٔ دیداریِ «می‌شود
 *     پایین کشید».
 *   • **گروه مقصدها** با آیکون و شبکهٔ دوردیفه؛ «خانه» تمام‌عرض و با
 *     پس‌زمینهٔ برند روشن (چون بازگشت به خانه پرکاربردترین کار است).
 *   • **بخش‌های صفحهٔ اول** جدا و کم‌رنگ‌تر — لنگرها، نه مقصدهای اصلی.
 *   • **نوار اقدام** چسبیده به پایین: «ثبت‌نام و شرکت» (پُر) + «ورود» (خطی).
 *   • **دکمهٔ بستنِ گِرد** در گوشهٔ بالا-چپ برگه، با حلقهٔ طلایی.
 *
 * ── دسترس‌پذیری (بدون اغراق) ────────────────────────────────────────────
 * `role="dialog"` + `aria-modal`، تمرکز به اولین لینک می‌رود، Escape
 * می‌بندد، `Tab` داخل برگه می‌چرخد (focus trap ساده)، اسکرول بدنه قفل
 * می‌شود، و پس از بستن تمرکز به همان دکمهٔ همبرگری برمی‌گردد.
 * `padding-bottom: env(safe-area-inset-bottom)` برای آیفون‌های نوار‌دار.
 */
export function MobileMenu({
  links,
  anchors = [],
}: {
  /**
   * ⚠️ `href` از نوع `Route` است، نه `string` — و همین، یک خطای واقعیِ CI
   * را حل کرد: در این پروژه `typedRoutes` روشن است، پس `<Link href>` فقط
   * `Route` می‌پذیرد. کدِ قبلی `href as "/"` می‌نوشت تا تایپ‌چک راضی شود؛
   * ESLint روی همان کستِ زائدِ سه‌جا ایراد گرفت و لینت در CI شکست.
   * تایپ‌کردنِ خودِ پراپ، هم کست‌ها را حذف می‌کند و هم اجازه نمی‌دهد
   * آینده کسی مسیرِ ناموجود به منو اضافه کند.
   */
  links: readonly { href: Route; label: string; icon: string }[];
  anchors?: readonly { href: Route; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  /**
   * ⚠️ چرا `mounted` لازم است؟
   * برگه با `createPortal` روی `document.body` رندر می‌شود و `body` در
   * رندر سمت سرور وجود ندارد. تا هیدریشن کامل نشود، پورتال ساخته
   * نمی‌شود (وگرنه خطای hydration mismatch).
   */
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  /**
   * ⚠️ چرا `useSyncExternalStore` و نه `useEffect + setState`؟
   * پورتال به `document.body` نیاز دارد و در رندر سمت سرور `document`
   * وجود ندارد. راهِ رایج `useEffect(() => setMounted(true))` است، ولی
   * قانون lint پروژه (React Compiler) هر setState همگام در effect را رد
   * می‌کند. `useSyncExternalStore` همان کار را بدون رندر آبشاری انجام
   * می‌دهد: در سرور `false`، در کلاینت پس از هیدریشن `true`.
   */
  const mounted = useSyncExternalStore(
    () => () => {
      /* هیچ منبع خارجی‌ای عوض نمی‌شود؛ فقط «کلاینت هست یا نه» را می‌پرسیم */
    },
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      // حلقهٔ تمرکز: از آخرین عنصر به اولین و برعکس.
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // تمرکز به اولین لینک برگه — اما نه بلافاصله، تا انیمیشن ورود نپرد.
    const id = window.setTimeout(() => {
      sheetRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    }, 80);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const home = links.find((l) => l.href === "/");
  const rest = links.filter((l) => l.href !== "/");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="باز کردن منو"
        className="border-border-strong text-text hover:bg-surface-2 grid size-9 place-items-center rounded-md border transition-colors lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/*
        ⚠️ رندر با `createPortal` — و این یک وصلهٔ ظاهری نیست.
        هدر `sticky` + `backdrop-blur-xl` دارد و در CSS، هر عنصری با
        `backdrop-filter` (یا `filter`/`transform`) **مبدأِ موقعیت‌یابیِ
        `fixed`** فرزندانش می‌شود. نتیجه: برگهٔ `fixed inset-0` به‌جای
        کل صفحه، به کادرِ ۶۵پیکسلیِ هدر مقید می‌شد و فقط یک نوارِ سفید
        از آن دیده می‌شد. با پورتال به `body`، برگه واقعاً تمام‌صفحه
        می‌شود و لایهٔ تیره هم درست می‌نشیند.
      */}
      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
              {/* پس‌زمینهٔ تیره — کلیک = بستن */}
              <button
                type="button"
                aria-label="بستن منو"
                tabIndex={-1}
                onClick={close}
                className="k185-sheet-backdrop bg-stage/55 absolute inset-0 h-full w-full backdrop-blur-[2px]"
              />

              <div
                id="mobile-nav"
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label="منوی سایت"
                className="k185-sheet bg-surface border-border absolute inset-x-0 bottom-0 rounded-t-[26px] border-t shadow-[0_-18px_50px_-20px_oklch(24%_0.05_260/0.45)]"
                style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
              >
                {/* دستگیرهٔ کشیدن + دکمهٔ بستن */}
                {/*
                  دستگیرهٔ کشیدن وسط‌چینِ مطلق است و دکمهٔ بستن **در جریان
                  چیدمان** می‌نشیند؛ قبلاً دکمه `absolute` بود و روی گوشهٔ
                  ردیف «خانه» می‌افتاد. حالا ارتفاع ردیف را خودش تعیین
                  می‌کند و همپوشانی ممکن نیست.
                */}
                <div className="relative flex items-center px-4 pt-2 pb-1.5">
                  <span
                    aria-hidden="true"
                    className="bg-border-strong/70 absolute top-4 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full"
                  />
                  <button
                    type="button"
                    onClick={close}
                    aria-label="بستن منو"
                    className="border-border-strong text-text-muted hover:bg-surface-2 ms-auto grid size-8 place-items-center rounded-full border transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.1"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="px-4 pt-2 pb-3">
                  {/* خانه — تمام‌عرض */}
                  {home ? (
                    <Link
                      href={home.href}
                      onClick={close}
                      className="border-brand/25 bg-brand/[0.07] text-brand hover:bg-brand/[0.12] flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[14px] font-extrabold transition-colors"
                    >
                      <span className="bg-brand text-on-brand grid size-7 place-items-center rounded-lg">
                        <NavIcon name={home.icon} size={15} />
                      </span>
                      {home.label}
                    </Link>
                  ) : null}

                  {/* بقیهٔ مقصدها — شبکهٔ دوردیفه */}
                  <ul className="mt-2 grid grid-cols-2 gap-2">
                    {rest.map((n) => (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          onClick={close}
                          className="border-border bg-canvas/60 text-text hover:border-brand/35 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors"
                        >
                          <span className="text-brand">
                            <NavIcon name={n.icon} size={15} />
                          </span>
                          {n.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* لنگرهای صفحهٔ اول — کم‌رنگ‌تر، چون مقصد اصلی نیستند */}
                  {anchors.length > 0 ? (
                    <div className="border-border mt-3.5 border-t pt-2.5">
                      <p className="text-text-subtle px-1 pb-1 text-[10.5px] font-bold">
                        بخش‌های صفحهٔ اول
                      </p>
                      <ul>
                        {anchors.map((n) => (
                          <li key={n.href}>
                            <Link
                              href={n.href}
                              onClick={close}
                              className="text-text-muted hover:text-text flex items-center gap-2 rounded-lg px-1 py-2 text-[12.5px] font-semibold transition-colors"
                            >
                              <span aria-hidden="true" className="bg-border-strong/60 h-px w-2.5" />
                              {n.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* نوار اقدام */}
                  <div className="border-border mt-2 flex items-center gap-2 border-t pt-3">
                    <Link
                      href="/register"
                      onClick={close}
                      className="bg-brand text-on-brand hover:bg-brand-hover flex h-11 flex-1 items-center justify-center rounded-xl text-[13.5px] font-extrabold transition-colors"
                    >
                      ثبت‌نام و شرکت
                    </Link>
                    <Link
                      href="/login"
                      onClick={close}
                      className="border-border-strong text-text hover:bg-surface-2 flex h-11 items-center justify-center rounded-xl border px-5 text-[13px] font-bold transition-colors"
                    >
                      ورود
                    </Link>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
