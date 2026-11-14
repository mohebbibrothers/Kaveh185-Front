export const SITE = {
  name: "کاوه ۱۸۵",
  fullName: "مسابقهٔ کتابخوانی هفتهٔ بسیج — کاوه ۱۸۵",
  organizer: "حوزهٔ مقاومت بسیج ۱۸۵ شهید کاوه",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kaveh185.ir",
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000",
  locale: "fa-IR",
  dir: "rtl",
  event: {
    title: "هفتهٔ بسیج ۱۴۰۵",
    startsLabel: "۲۹ آبان ۱۴۰۵",
    endsLabel: "۵ آذر ۱۴۰۵",
  },
} as const;

export const NAV = [
  { href: "/", label: "خانه" },
  { href: "/#about", label: "دربارهٔ مسابقه" },
  { href: "/#steps", label: "چگونه شرکت کنم" },
  { href: "/#rules", label: "قوانین" },
  { href: "/#board", label: "جدول مساجد" },
] as const;
