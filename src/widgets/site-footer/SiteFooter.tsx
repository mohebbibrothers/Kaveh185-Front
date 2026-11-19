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
 *    طلایی، نشان با چرخشِ کوچک، و آیکونِ بله با پالس و شناوری.
 *
 * ── تغییرهای دورِ ۱۶ (نکته‌های ۴، ۵ و ۹) ─────────────────────────────────
 *
 * ۵) **هرگز دو ردیفه نمی‌شود** (نکتهٔ ۵): نسخهٔ قبل از `lg` یک گریدِ
 *    سه‌ستونی می‌ساخت و ستونِ «کانال رسمی» را با `lg:contents` به ردیفِ
 *    دوم می‌انداخت؛ در لپ‌تاپ و تبلتِ افقی نتیجه یک فوترِ دوطبقه با
 *    ارتفاعِ زیاد بود. حالا از `md` به بالا **یک ردیفِ سه‌ستونی** است و
 *    بلوکِ کانال داخلِ ستونِ هویت (زیرِ چیپ‌ها) می‌نشیند — پس با هیچ
 *    عرضی به ردیفِ دوم نمی‌رود. فقط زیرِ `md` (موبایل/فولدبل) ستون‌ها
 *    پشتِ سرِ هم می‌آیند، که خودِ کاربر هم مجاز دانست.
 * ۶) **حذفِ باکسِ «کانال رسمی»** (نکتهٔ ۴): عنوانِ ستون و کارتِ دراز رفت؛
 *    فقط `ChannelCard` (آیکونِ سه‌بعدیِ بله + نام) مانده که یک لینکِ
 *    فشرده است، نه یک بلوکِ جداست.
 * ۷) **واترمارکِ مشت** — دورِ ۱۷، نکتهٔ ۲: کاربر خواست مشتِ رهبر به
 *    همان جای نسخهٔ قبل (گوشهٔ چپِ فوتر) و به همان شکل برگردد. فایلِ تازه
 *    `fist-watermark.webp` از تصویرِ خودِ کاربر (`image-41`) با آلفای
 *    تمیز ساخته شد؛ اندازه با `clamp` (۱۳۲px در تبلت تا ۲۴۸px در دسکتاپ)
 *    و شفافیت با کلاسِ `k185-fist-watermark` که در تمِ شب هم تنظیم می‌شود.
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
          className="k185-fist-watermark pointer-events-none absolute inset-y-0 -left-7 hidden md:block"
        >
          {/* مشتِ سیاه‌وسفید در گوشهٔ چپِ فوتر — همان جای نسخهٔ قبل
              (نکتهٔ ۲، دورِ ۱۷). فایل تازه از تصویرِ خودِ کاربر ساخته شده
              و آلفای تمیزی دارد؛ شفافیت و رنگِ وابسته به تم با کلاسِ
              `k185-fist-watermark`. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- واترمارکِ تزئینی */}
          <img
            src="/img/fist-watermark.webp"
            alt=""
            className="size-full object-contain object-bottom"
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-9 pb-2 sm:px-6 sm:pt-11">
          {/* ═══ چیدمانِ دورِ ۱۸ — «همیشه یک ردیف» ═══════════════════════════
              کاربر صریح گفت: در لپ‌تاپ «کانال رسمی» به ردیفِ دوم افتاده و
              باید همه‌چیز یک ردیف باشد — حتی اگر بخشی از محتوا روی واترمارکِ
              مشت (پس‌زمینه) بیفتد. پس نه گریدِ سه‌ستونیِ شکننده و نه
              `md:contents`؛ بلکه یک **ردیفِ واحدِ flex** از `md` به بالا:

                [ هویت: نشان + نام + توضیح + چیپ‌ها ]  [ دسترسی ]  [ قوانین ]  [ کانال ]

              و برای اینکه هیچ ستونی محتوا را نشکند، از `md` به بالا
              `min-w-0` + `whitespace-nowrap` روی لینک‌ها ست شده و اندازه‌ها
              با `clamp` کاهشی‌اند؛ در تبلت هم ردیف می‌مانَد، فقط فشرده‌تر.
              در موبایل (زیرِ `md`) مثل قبل ستونی می‌شود — همان‌جا هم
              «کانال» کنارِ چیپ‌ها می‌نشیند، نه در ته فوتر. */}
          {/* ═══ توزیعِ فاصله (نکتهٔ ۱، دورِ ۱۹) ═══════════════════════════
              ایرادِ کاربر: فاصلهٔ سه شیءِ سمت چپ از برند (آیکون + نوشته) زیاد بود.
              ریشه: ستونِ هویت `md:flex-1` داشت، ولی متنش با `max-w-[46ch]`
              کوتاه بود و به لبهٔ راست می‌چسبید ⇒ یک «حفرهٔ» خالی داخلِ خودِ
              ستونِ هویت می‌ماند (۲۶۰px در ۱۴۴۰) در حالی که فاصلهٔ خودِ سه
              ستونِ لینک فقط ۲۰px بود: یعنی فاصله‌ها ناهمگون بودند، نه فقط زیاد.
              راهکارِ استاندارد: ستونِ هویت با پهنای محتواییِ محدود
              (`max-w-[30rem]`) + پاراگرافی که همان پهنا را پر می‌کند (حفره حذف)
              + **یک بازهٔ فاصلهٔ یکسان** (`gap-x`) بین هر سه همسایگی؛ و
              `max-w-[46ch]` فقط تا موبایل. نتیجه: سه فاصلهٔ دقیقاً برابر در
              همهٔ عرض‌ها (۱۴۴۰: ۴۸/۴۸ — ۹۰۰: ۳۲/۳۲) و ردیفِ تک‌خطی از ۷۶۸ به بالا. */}
          <div className="k185-footer-row flex flex-col flex-wrap items-center text-center md:flex-row md:flex-nowrap md:items-start md:justify-start md:gap-x-8 md:text-start lg:gap-x-12">
            {/* ── ستونِ هویت ── */}
            <div className="k185-footer-anim w-full md:max-w-[30rem] md:min-w-0">
              <div className="flex flex-col items-center gap-2.5 md:flex-row md:items-center md:gap-3">
                <span className="k185-footer-badge block shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-rotate-3">
                  <Logo size={56} variant="emblem" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-[16px] font-extrabold">{SITE.name}</span>
                  <span className="text-on-band-muted mt-0.5 text-[10.5px]">
                    {SITE.event.title}
                  </span>
                </span>
              </div>

              <p className="text-on-band-muted mx-auto mt-3 max-w-[46ch] text-[12px] leading-[1.9] text-pretty md:mx-0 md:max-w-none">
                مسابقهٔ کتاب‌خوانی {SITE.bookTitle} به مناسبت هفتهٔ بسیج، میان مساجد حوزهٔ مقاومت بسیج
                ۱۸۵ شهید کاوه.
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] md:justify-start">
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

            {/* ── دو ستونِ کوتاه ── */}
            {/* ستونِ لینک‌ها: در موبایل گریدِ ۲ستونیِ تمام‌عرض، از `md` به بالا
                دو ستونِ جدا در ردیفِ اصلی. `md:contents` باعث می‌شد ناوبری‌ها
                به‌عنوانِ «فرزندِ flex» شناخته نشوند و فاصله‌ها اشتباه
                اندازه‌گیری/توزیع شوند؛ پس در حالتِ دسکتاپ هیچ گرهٔ میانی
                نمی‌گذاریم و خودِ ناوبری‌ها ستون می‌شوند. */}
            <div className="mt-6 grid w-full grid-cols-2 gap-4 md:mt-0 md:flex md:w-auto md:shrink-0 md:gap-x-8 lg:gap-x-11">
              <nav
                aria-label="دسترسی سریع"
                className="k185-footer-col"
                style={{ animationDelay: "70ms" }}
              >
                <h2 className="text-on-band mb-2 flex items-center justify-center gap-2 text-[11.5px] font-extrabold tracking-wide whitespace-nowrap md:justify-start">
                  <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
                  دسترسی سریع
                </h2>
                <ul className="space-y-0.5">
                  {quick.map((l) => (
                    <li key={l.href} className="text-center md:text-start">
                      <Link
                        href={l.href}
                        className="k185-footer-link text-on-band-muted hover:text-on-band inline-flex min-h-[36px] items-center px-1 text-[12px] whitespace-nowrap transition-colors"
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
                <h2 className="text-on-band mb-2 flex items-center justify-center gap-2 text-[11.5px] font-extrabold tracking-wide whitespace-nowrap md:justify-start">
                  <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
                  قوانین و حساب
                </h2>
                <ul className="space-y-0.5">
                  {legal.map((l) => (
                    <li key={l.href} className="text-center md:text-start">
                      <Link
                        href={l.href}
                        className="k185-footer-link text-on-band-muted hover:text-on-band inline-flex min-h-[36px] items-center px-1 text-[12px] whitespace-nowrap transition-colors"
                      >
                        <span className="k185-footer-link-text relative">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* ── کانالِ رسمی: ستونِ چهارم، در همان **یک ردیف** ── */}
            <div
              className="mt-6 w-full border-t border-[color-mix(in_oklab,var(--c-on-band)_10%,transparent)] pt-4 md:mt-0 md:w-auto md:shrink-0 md:border-s md:border-t-0 md:ps-5 md:pt-0 lg:ps-7"
              style={{ animationDelay: "170ms" }}
            >
              <ChannelCard />
            </div>
          </div>

          {/* ── نوارِ پایانی (نکتهٔ ۲، دورِ ۲۰) ────────────────────────────
              ایرادِ کاربر: محتوای این نوار نسبت به **خطِ خاکستریِ بالای خودش**
              راست‌چین دیده می‌شد (کپی‌رایت در راست، نشان‌ها در چپ) و وسطِ خط
              خالی می‌ماند؛ در تبلت/لپ‌تاپ ناتراز به‌نظر می‌رسید.
              راهکار: به‌جای `justify-between`، یک **گریدِ سه‌ناحیه‌ایِ هم‌عرض**
                [ راست: کپی‌رایت ]  [ وسط: سامانهٔ رسمی ]  [ چپ: بازگشت به بالا ]
              با `grid-cols-[1fr_auto_1fr]`. ناحیهٔ وسط دقیقاً روی **مرکزِ**
              خطِ خاکستری می‌نشیند — و چون دو ستونِ کناری `1fr` و هم‌عرض‌اند،
              مرکزِ ناحیهٔ وسط با مرکزِ نوار یکی است، مستقل از طولِ متنِ
              کپی‌رایت (اگر متن عوض شود، تراز به‌هم نمی‌ریزد).
              در موبایل همان ستونیِ وسط‌چین می‌مانَد، اما ترتیبِ DOM حفظ
              می‌شود (کپی‌رایت بالا، سپس نشان و دکمه) تا برای screen-reader
              منطقی بماند؛ دکمهٔ «بازگشت به بالا» تمام‌عرضِ ملایم می‌شود. */}
          <div className="border-on-band/12 mt-7 border-t pt-4">
            <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
              <p className="text-on-band-muted order-2 text-center text-[10.5px] sm:order-none sm:justify-self-start sm:text-start">
                © {year} — {SITE.organizer}
              </p>
              <span className="text-on-band-muted order-1 flex items-center justify-center gap-1.5 text-[10.5px] font-semibold sm:order-none sm:justify-self-center">
                <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
                سامانهٔ رسمی برگزاری
              </span>
              <div className="order-3 flex items-center justify-center sm:order-none sm:justify-self-end">
                <BackToTop />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
