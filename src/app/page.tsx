import type { Metadata } from "next";
import { fetchBootstrap } from "@/shared/api/bootstrap";
import { SITE } from "@/shared/config/site";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { Hero } from "@/widgets/hero/Hero";
import { HowItWorks } from "@/widgets/how-it-works/HowItWorks";
import { Leaderboard } from "@/widgets/leaderboard/Leaderboard";
import { Rules } from "@/widgets/how-it-works/Rules";
import { Mosques } from "@/widgets/mosques/Mosques";

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
        <Hero status={data.exam_status} leaderboard={data.leaderboard} />

        <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-8 sm:px-6">
          <HowItWorks status={data.exam_status} />

          <section
            id="about"
            aria-labelledby="about-title"
            className="mt-12 grid gap-3 lg:grid-cols-[1.25fr_.75fr]"
          >
            <div className="border-border bg-surface-2 rounded-xl border p-5 sm:p-6">
              <p className="text-verde text-[11.5px] font-extrabold tracking-wide">کتاب مسابقه</p>
              <h2 id="about-title" className="mt-1 text-[clamp(19px,2.6vw,26px)] font-extrabold">
                {data.exam_status.book_title}
              </h2>
              <p className="text-text-muted mt-2 max-w-[62ch] text-[13.5px] leading-8">
                سؤال‌ها از کتابِ معرفی‌شدهٔ هفتهٔ بسیج انتخاب می‌شوند. نسخهٔ چاپی از طریق مسجد محله در
                اختیار شرکت‌کنندگان قرار می‌گیرد. هدف این مسابقه، همراهی خانواده‌ها با مطالعه و
                آشنایی نسل نوجوان و جوان با فرهنگ و سیرهٔ بسیجی است.
              </p>
              <p className="text-text-subtle mt-3 text-[12.5px]">
                برگزارکننده: {data.exam_status.organizer_name} — {SITE.event.title} (
                {SITE.event.startsLabel} تا {SITE.event.endsLabel})
              </p>
            </div>
            <Leaderboard board={data.leaderboard} />
          </section>

          <Mosques mosques={data.mosques} totalActive={data.leaderboard.total_active_mosques} />

          <Rules status={data.exam_status} />
        </div>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema(data) }} />
    </>
  );
}
