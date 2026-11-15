import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchBootstrap } from "@/shared/api/bootstrap";
import { SITE } from "@/shared/config/site";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { Hero } from "@/widgets/hero/Hero";
import { HowItWorks } from "@/widgets/how-it-works/HowItWorks";
import { Leaderboard } from "@/widgets/leaderboard/Leaderboard";
import { Rules } from "@/widgets/how-it-works/Rules";
import { Mosques } from "@/widgets/mosques/Mosques";
import { Divider } from "@/shared/ui/Ornament";
import { faJalali, toFa } from "@/shared/lib/fa";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "مسابقهٔ کتابخوانی هفتهٔ بسیج",
  description:
    "ثبت‌نام رایگان در مسابقهٔ کتابخوانی هفتهٔ بسیج حوزهٔ ۱۸۵ شهید کاوه — پنج سؤال، یک کتاب، هفده مسجد.",
  alternates: { canonical: "/" },
};

const schema = (b: Awaited<ReturnType<typeof fetchBootstrap>>) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.organizer,
        url: SITE.url,
        logo: `${SITE.url}/icon-512.png`,
      },
      {
        "@type": "Event",
        name: b.exam_status.title,
        startDate: b.exam_status.starts_at,
        endDate: b.exam_status.ends_at,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: SITE.url },
        organizer: { "@id": `${SITE.url}/#org` },
        description: b.exam_status.description,
        inLanguage: "fa-IR",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "مسابقهٔ کتابخوانی",
            item: `${SITE.url}/#about`,
          },
        ],
      },
    ],
  });

export default async function HomePage() {
  const data = await fetchBootstrap();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero status={data.exam_status} />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <HowItWorks status={data.exam_status} />

          {/* ── دربارهٔ کتاب و مسابقه ── */}
          <section id="about" aria-labelledby="about-title" className="mt-14">
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="border-border bg-surface rounded-xl border p-5 sm:p-7">
                <p className="text-gold-strong text-[11.5px] font-extrabold tracking-wide">
                  کتاب مسابقه
                </p>
                <h2
                  id="about-title"
                  className="text-text mt-1.5 text-[clamp(19px,2.6vw,25px)] leading-snug font-extrabold"
                >
                  {data.exam_status.book_title}
                </h2>
                <p className="text-text-muted mt-3 max-w-[60ch] text-[13.5px] leading-[2.05]">
                  سؤال‌ها از کتابِ معرفی‌شدهٔ هفتهٔ بسیج انتخاب می‌شوند. نسخهٔ چاپی از طریق مسجد محله در
                  اختیار شرکت‌کنندگان قرار می‌گیرد. هدف این مسابقه، همراهی خانواده‌ها با مطالعه و
                  آشنایی نسل نوجوان و جوان با فرهنگ و سیرهٔ بسیجی است.
                </p>
                <dl className="border-border mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 text-[12.5px] sm:grid-cols-3">
                  <div>
                    <dt className="text-text-subtle">برگزارکننده</dt>
                    <dd className="text-text mt-0.5 font-bold">
                      {data.exam_status.organizer_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-subtle">بازهٔ مسابقه</dt>
                    <dd className="text-text mt-0.5 font-bold tabular-nums">
                      {faJalali(data.exam_status.starts_at_jalali)} —{" "}
                      {faJalali(data.exam_status.ends_at_jalali)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-subtle">سؤال در بانک</dt>
                    <dd className="text-text mt-0.5 font-bold tabular-nums">
                      {toFa(data.exam_status.active_question_bank_size)} سؤال
                    </dd>
                  </div>
                </dl>
              </div>

              <Leaderboard board={data.leaderboard} />
            </div>
          </section>

          <Mosques mosques={data.mosques} totalActive={data.leaderboard.total_active_mosques} />

          <Rules status={data.exam_status} />

          {/* ── بنر پایانی: تصویر پوستری با یک دعوت ساده ── */}
          <section className="mt-14 mb-12" aria-labelledby="closing-title">
            <div className="bg-stage relative overflow-hidden rounded-2xl">
              <Image
                src="/media/kaveh-poster.jpg"
                alt=""
                aria-hidden="true"
                width={1254}
                height={1792}
                sizes="(max-width: 767px) 100vw, 1100px"
                className="absolute inset-y-0 left-0 h-full w-auto object-cover opacity-30"
              />
              <div
                aria-hidden="true"
                className="from-stage via-stage/92 to-stage/40 absolute inset-0 bg-gradient-to-l"
              />
              <div className="relative px-5 py-9 sm:px-9 sm:py-11">
                <Divider className="mb-5 max-w-[190px]" />
                <h2
                  id="closing-title"
                  className="text-on-stage max-w-[38ch] text-[clamp(19px,2.8vw,27px)] leading-snug font-extrabold"
                >
                  پنج سؤال، کمتر از دو دقیقه — و سهم مسجد محلهٔ تو در جدول.
                </h2>
                <p className="text-on-stage-muted mt-2.5 max-w-[52ch] text-[13px] leading-[2]">
                  ثبت‌نام رایگان است و فقط به نام، کد ملی، شمارهٔ تماس و انتخاب مسجد نیاز دارد.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/register"
                    className="bg-gold text-on-gold hover:bg-gold-strong inline-flex h-11 items-center rounded-lg px-6 text-[13.5px] font-extrabold transition-colors"
                  >
                    ثبت‌نام و شرکت
                  </Link>
                  <Link
                    href="/receipt"
                    className="text-on-stage ring-on-stage/25 hover:bg-on-stage/10 inline-flex h-11 items-center rounded-lg px-5 text-[13px] font-bold ring-1 transition-colors"
                  >
                    استعلام کارنامه
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema(data) }} />
    </>
  );
}
