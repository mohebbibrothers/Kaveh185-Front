/**
 * نشان کاوه ۱۸۵ — پرترهٔ شهید کاوه در قاب طلایی، الهام‌گرفته از تصویر رسمی رویداد.
 *
 * چرا تصویر و نه SVG هندسی؟ چون این مسابقه به نام یک شهید است و چهرهٔ او
 * هویت اصلی رویداد است. کاربر نباید دنبال ارتباط بگردد؛ باید فوراً بفهمد
 * این‌جا چه خبر است. قاب دایره‌ای طلایی، همان زبانِ تصویر منبع را نگه می‌دارد
 * ولی در ابعاد کوچک (favicon، هدر) خوانا و تمیز می‌ماند.
 *
 * برای حالت‌های تک‌رنگ (چاپ، فوتر تیره) از variant="mark" استفاده می‌شود
 * که فقط شمسهٔ هندسی است و رنگ‌پذیر با currentColor.
 */
export function Logo({
  size = 44,
  className = "",
  variant = "portrait",
}: {
  size?: number;
  className?: string;
  variant?: "portrait" | "mark";
}) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="نشان کاوه ۱۸۵"
      >
        <defs>
          <linearGradient id="k185-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--c-gold)" }} />
            <stop offset="1" style={{ stopColor: "var(--c-gold-strong)" }} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="none" stroke="url(#k185-g)" strokeWidth="1.4" />
        <polygon
          points="24,8 27.1,15.6 34.9,12.6 31.9,20.4 39,24 31.9,27.6 34.9,35.4 27.1,32.4 24,40 20.9,32.4 13.1,35.4 16.1,27.6 9,24 16.1,20.4 13.1,12.6 20.9,15.6"
          fill="none"
          stroke="url(#k185-g)"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <text
          x="24"
          y="27.2"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="800"
          fill="url(#k185-g)"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ۱۸۵
        </text>
      </svg>
    );
  }

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* حلقهٔ طلایی بیرونی — همان زبان قابِ تصویر منبع */}
      <span
        aria-hidden="true"
        className="ring-gold/70 ring-offset-canvas absolute inset-0 rounded-full ring-[1.5px] ring-offset-[1.5px]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- تصویر ۴۰px با
          ابعاد ثابت است؛ next/image برای این اندازه فقط یک لایهٔ resize اضافه
          می‌کند و LCP را بهتر نمی‌کند. فایل از قبل بهینه (PNG ۹۶KB، ۲۵۶px). */}
      <img
        src="/img/icon-face.png"
        alt=""
        width={size}
        height={size}
        className="size-full rounded-full object-cover"
        decoding="async"
      />
    </span>
  );
}
