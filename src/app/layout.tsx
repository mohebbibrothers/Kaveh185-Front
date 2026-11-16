import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.fullName}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "مسابقهٔ کتابخوانی هفتهٔ بسیج حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه — ثبت‌نام، انتخاب مسجد، پاسخ به پنج سؤال و رقابت ۱۷ مسجد در جدول زنده.",
  applicationName: SITE.name,
  keywords: ["هفته بسیج", "مسابقه کتابخوانی", "کاوه ۱۸۵", "حوزه ۱۸۵ شهید کاوه", "بسیج"],
  authors: [{ name: SITE.organizer }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.fullName}`,
    description: "پنج سؤال، یک کتاب، هفده مسجد. هفتهٔ بسیج ۱۴۰۵ — حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.fullName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.fullName}`,
    description: "پنج سؤال، یک کتاب، هفده مسجد.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#141a2b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* رنگ‌بندی اولیه پیش از رندر — جلوگیری از پرش تم */}
        <script
          dangerouslySetInnerHTML={{
            // سه حالت: مقدار ذخیره‌شده (روز/شب) یا «خودکار».
            // در حالت خودکار هیچ `data-theme` ست نمی‌شود تا مدیاکوئری
            // `prefers-color-scheme` در tokens.css تصمیم بگیرد — این تنها
            // راهی است که تمِ سیستم بدون جاوااسکریپت هم دنبال شود.
            __html: `(function(){try{var t=localStorage.getItem('k185-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}else{document.documentElement.style.colorScheme='light dark'}}catch(e){}})()`,
          }}
        />
        <link
          rel="preload"
          href="/fonts/vazirmatn-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a
          href="#main"
          className="focus:bg-stage focus:text-on-brand sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
        >
          پرش به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
