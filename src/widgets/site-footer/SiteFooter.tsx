import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { SITE } from "@/shared/config/site";
import { BackToTop } from "./BackToTop";
import { ChannelCard } from "./ChannelCard";
import { MartyrsMarquee } from "@/widgets/landing/MartyrsMarquee";
import type { Martyr } from "@/shared/api/landing";

/**
 * فوتر — «شبِ آرامِ» پایانِ صفحه، حالا با یادوارهٔ شهدا در آستانهٔ آن.
 *
 * ── تغییرهای این دور (نکته‌های ۸، ۹، ۱۰، ۱۱) ────────────────────────────
 *
 * ۱) **یادوارهٔ شهدا داخلِ فوتر است، نه قبلِ آن** (نکتهٔ ۸).
 *    یک بخش با `-mt` یا `mt-0` سرِ جایش نمی‌نشیند؛ وقتی دو بخش از دو
 *    کامپوننتِ جدا بیایند، بالاخره یک روز یکی‌شان فاصله می‌گیرد. حالا
 *    مالکیت یکی است: یادواره اولِ فوتر است و بدونِ هیچ فاصله‌ای به بدنه
 *    می‌چسبد. `mt-16`ی که بین آخرین بخش و فوتر بود هم حذف شد.
 *
 * ۲) **تمِ نوار و فوتر با تمِ سایت** (نکتهٔ ۹).
 *    هر دو از توکنِ `band` می‌خوانند که در تم روز روشن و در تم شب تیره
 *    است. هیچ `bg-stage` ثابتی نمانده. کنتراستِ هر چهار جفت‌رنگِ
 *    `on-band`/`band`/`band-accent` در `build-tokens.mjs` سنجیده و در CI
 *    گِیت می‌شود، پس این یکپارچگی با CSS شکسته نمی‌شود.
 *
 * ۳) **چیدمانِ موبایل از نو** (نکتهٔ ۱۰).
 *    نسخهٔ قبل در موبایل ستون‌ها را پشتِ سرِ هم می‌چید و «کانالِ رسمی»
 *    به یک باکسِ پهنِ خسته‌کننده تبدیل می‌شد. حالا:
 *      • سربرگِ هویت وسط‌چین با نشان، و دو چیپِ کوتاه زیرش؛
 *      • دو ستونِ کوتاهِ «دسترسی سریع» و «قوانین» در دو ستونِ کنارِ هم
 *        (در ۳۲۰px هم جا می‌شود، چون متن‌ها کوتاه‌اند)؛
 *      • **کانال رسمی یک آیکونِ گردِ بزرگ** با پویانماییِ اختصاصی، نه یک
 *        باکسِ دراز — همان چیزی که خواسته شد؛
 *      • نوارِ پایانی با یک خطِ اعتبارِ کوتاه و «بازگشت به بالا».
 *
 * ۴) **پویانماییِ واقعی**: ستون‌ها با تأخیرِ پله‌ای، لنگرهای لینک با خطِ
 *    طلایی، نشان با چرخشِ کوچک، و آیکونِ بله با پالس و تکان.
 */
export function SiteFooter({ martyrs = [] }: { martyrs?: Martyr[] }) {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  const quick = [
    { href: "/register", label: "ثبت‌نام در مسابقه" },
    { href: "/book", label: "مطالعهٔ کتاب" },
    { href: "/mosques", label: "رتبه‌بندی مساجد" },
  ] as const;

  const legal = [
    { href: "/rules", label: "قوانین و شرایط" },
    { href: "/receipt", label: "استعلام کارنامه" },
    { href: "/login", label: "ورود به حساب" },
  ] as const;

  return (
    <footer className="bg-band text-on-band relative overflow-hidden">
      {/* ── یادوارهٔ شهدا — اولِ فوتر، بی‌فاصله ── */}
      <MartyrsMarquee items={martyrs} />

      {/* ── بدنهٔ فوتر ── */}
      <div className="relative">
        {/* خطِ نوریِ بالای بدنه؛ اگر یادواره خالی باشد، این تنها لبه است */}
        <div
          aria-hidden="true"
          className="via-band-accent/40 absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent to-transparent"
        />

        {/* لایه‌های عمق */}
        <div
          aria-hidden="true"
          className="k185-girih-veil pointer-events-none absolute inset-0 opacity-[0.05]"
        />
        <div
          aria-hidden="true"
          className="bg-band-accent/[0.08] pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="bg-brand/[0.06] pointer-events-none absolute -bottom-28 left-1/4 size-80 rounded-full blur-3xl"
        />

        {/* ── مشتِ شهید کاوه — واترمارکِ ساختارمند (نکتهٔ ۱۱) ──
            نه تصویرِ تصادفی: پشتِ ستونِ هویت، در ارتفاعِ کاملِ ستون، با
            ماسکِ محو و شفافیتِ بسیار کم. در دسکتاپ دیده می‌شود و در
            موبایل پنهان است (جایی که فقط شلوغی می‌شود). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-4 hidden w-[240px] opacity-[0.07] lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- واترمارکِ تزئینی */}
          <img
            src="/img/punch-fist.webp"
            alt=""
            className="size-full object-contain object-bottom"
            style={{
              maskImage: "linear-gradient(to top, black 55%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to top, black 55%, transparent 95%)",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-9 pb-2 sm:px-6 sm:pt-11">
          {/* ── سربرگِ هویت: در موبایل وسط‌چین، در دسکتاپ ستونِ اول ── */}
          <div className="k185-footer-col flex flex-col items-center text-center lg:grid lg:grid-cols-[1.5fr_1fr_1.1fr] lg:items-start lg:gap-10 lg:text-start">
            <div className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:items-center lg:gap-3">
                <span className="k185-footer-badge block transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-rotate-3">
                  <Logo size={64} variant="emblem" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[16px] font-extrabold">{SITE.name}</span>
                  <span className="text-on-band-muted mt-0.5 text-[10.5px]">
                    {SITE.event.title}
                  </span>
                </span>
              </div>

              <p className="text-on-band-muted mx-auto mt-3.5 max-w-sm text-[12.5px] leading-[2] lg:mx-0">
                مسابقهٔ کتاب‌خوانی {SITE.bookTitle} به مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج
                ۱۸۵ شهید کاوه.
              </p>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] lg:justify-start">
                <span className="border-on-band/15 text-on-band-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold">
                  <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
                  شرکت رایگان
                </span>
                <span className="border-on-band/15 text-on-band-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold">
                  <span aria-hidden="true" className="bg-band-accent size-1.5 rounded-full" />
                  یک‌بار برای هر کد ملی
                </span>
              </div>
            </div>

            {/* ── دو ستونِ کوتاه: در موبایل کنارِ هم، در دسکتاپ زیرِ هم نمی‌روند ── */}
            <div className="mt-7 grid w-full grid-cols-2 gap-4 lg:mt-0 lg:contents">
              <nav
                aria-label="دسترسی سریع"
                className="k185-footer-col"
                style={{ animationDelay: "70ms" }}
              >
                <h2 className="text-on-band mb-2.5 flex items-center justify-center gap-2 text-[11.5px] font-extrabold tracking-wide lg:justify-start">
                  <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
                  دسترسی سریع
                </h2>
                <ul className="space-y-0.5">
                  {quick.map((l) => (
                    <li key={l.href} className="text-center lg:text-start">
                      <Link
                        href={l.href}
                        className="k185-footer-link text-on-band-muted hover:text-on-band inline-flex min-h-[32px] items-center text-[12px] transition-colors"
                      >
                        <span className="k185-footer-link-text relative">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav
                aria-label="قوانین و حساب"
                className="k185-footer-col"
                style={{ animationDelay: "120ms" }}
              >
                <h2 className="text-on-band mb-2.5 flex items-center justify-center gap-2 text-[11.5px] font-extrabold tracking-wide lg:justify-start">
                  <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
                  قوانین و حساب
                </h2>
                <ul className="space-y-0.5">
                  {legal.map((l) => (
                    <li key={l.href} className="text-center lg:text-start">
                      <Link
                        href={l.href}
                        className="k185-footer-link text-on-band-muted hover:text-on-band inline-flex min-h-[32px] items-center text-[12px] transition-colors"
                      >
                        <span className="k185-footer-link-text relative">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* ── کانال رسمی: آیکونِ گردِ بزرگ، نه باکسِ دراز ── */}
            <div
              className="k185-footer-col mt-7 flex w-full flex-col items-center lg:mt-0 lg:items-start"
              style={{ animationDelay: "170ms" }}
            >
              <h2 className="text-on-band mb-2.5 flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide">
                <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
                کانال رسمی
              </h2>
              <ChannelCard />
            </div>
          </div>

          {/* ── نوار پایانی ── */}
          <div className="border-on-band/12 mt-7 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <p className="text-on-band-muted order-2 text-center text-[10.5px] sm:order-1 sm:text-start">
              © {year} — {SITE.organizer}
            </p>
            <div className="order-1 flex items-center gap-3 sm:order-2">
              <span className="text-on-band-muted hidden items-center gap-1.5 text-[10.5px] font-semibold sm:flex">
                <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
                سامانهٔ رسمی برگزاری
              </span>
              <BackToTop />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
