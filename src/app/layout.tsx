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
  /**
   * آیکون‌ها — صریح و کامل (نکتهٔ ۶، دورِ ۱۶).
   *
   * ⚠️ Next به‌طورِ خودکار `src/app/icon.png` را به‌عنوان `sizes="512x512"`
   * اعلام می‌کند، ولی **`favicon.ico` و `apple-icon` را در `<head>` نمی‌آورد**
   * (فایل ساخته می‌شود، لینک نمی‌شود). نتیجه: سافاری و برخی نسخه‌های کروم
   * به `/favicon.ico` پیش‌فرض می‌رفتند و نشانِ کهنه/خالی می‌دیدند.
   * این‌جا هر سه نسلِ آیکون صریح اعلام می‌شود — همه از یک سورس (مشتِ
   * سبزِ `image-46`) ساخته شده‌اند.
   */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-64.png", type: "image/png", sizes: "64x64" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
          /* ⚠️ `sr-only` با `position:absolute` کار می‌کند و در ۲۸۰px یک
             پیکسل سرریزِ افقی می‌ساخت (نوارِ اسکرولِ بی‌مورد در فولدبل).
             `overflow-x-clip` روی `body` جلوی آن را می‌گیرد، ولی چون
             می‌تواند `position: sticky` هدر را بشکند، به‌جایش خودِ لینک
             را با `clip-path` پنهان و در فوکوس آزاد می‌کنیم. */
          className="focus:bg-stage focus:text-on-brand sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
        >
          پرش به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
