import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { fetchBootstrapWithMeta } from "@/shared/api/bootstrap";
import { SITE } from "@/shared/config/site";
import { LandingShell } from "@/widgets/landing/LandingShell";

/**
 * صفحهٔ اول — سند ایستا با محتوای پخته‌شده.
 *
 * ساختار سه‌لایه:
 *   ۱) این فایل داده را در **زمان ساخت** از API می‌گیرد (اگر در دسترس
 *      باشد) و JSON-LD را می‌سازد. نتیجه در HTML می‌نشیند: سئو، پیش‌نمایش
 *      پیام‌رسان‌ها و دیدنِ فوری محتوا سالم می‌ماند.
 *   ۲) `LandingShell` (کلاینت) هدر و هیرو را با تایمر واقعی نشان می‌دهد و
 *      تنها جایی است که داده تازه می‌شود.
 *   ۳) `LandingSections` با `ssr: true` و بارگذاری تنبل، بخش‌های پایین را
 *      می‌آورد تا وزن جاوااسکریپت‌شان از بستهٔ اولیه جدا شود.
 *
 * سایت ایستاست، پس `revalidate` معنا ندارد؛ تازگی با polling مرورگر
 * می‌آید (← `shared/api/live.ts`) — با احترام به «برگهٔ پنهان».
 */
export const metadata: Metadata = {
  title: "مسابقهٔ کتابخوانی هفتهٔ بسیج",
  description:
    "ثبت‌نام رایگان در مسابقهٔ کتابخوانی هفتهٔ بسیج حوزهٔ ۱۸۵ شهید کاوه — پنج سؤال، یک کتاب، هفده مسجد.",
  alternates: { canonical: "/" },
};

/**
 * بارگذاری تنبل بخش‌های پایین صفحه.
 *
 * `ssr: true` لازم است: می‌خواهیم محتوا در HTML اولیه باشد (سئو و نمایش
 * فوری). چیزی که به تأخیر می‌افتد فقط *جاوااسکریپت تعامل* است، نه محتوا.
 * بدون این، جدول مساجد و قوانین برای خزنده‌ها و برای کاربرِ بی‌JS غایب
 * می‌شدند — که با اصلِ «پوستهٔ صادقانه» می‌خواند، ولی با سئو نه.
 */
const LandingSections = dynamic(
  () => import("@/widgets/landing/LandingSections").then((m) => m.LandingSections),
  { ssr: true },
);

/** JSON-LD — از دادهٔ واقعی زمان ساخت، نه از عدد ثابت. */
function buildJsonLd(b: Awaited<ReturnType<typeof fetchBootstrapWithMeta>>["data"]): string {
  return JSON.stringify({
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
}

export default async function HomePage() {
  const { data, fetchedAt } = await fetchBootstrapWithMeta();

  return (
    <>
      <LandingShell initial={data} initialFetchedAt={fetchedAt}>
        <LandingSections initial={data} />
      </LandingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(data) }} />
    </>
  );
}
