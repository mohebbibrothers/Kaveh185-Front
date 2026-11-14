/**
 * نشان کاوه ۱۸۵ — شمسهٔ هشت‌پر (هندسهٔ اسلامی) با عدد ۱۸۵ در مرکز.
 * SVG خالص، بدون تصویر، مقیاس‌پذیر و قابل رنگ‌پذیری با currentColor.
 */
export function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
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
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="var(--c-brand)" />
      <polygon
        points="24,7 27.4,15.2 35.8,11.9 32.5,20.3 40.5,24 32.5,27.7 35.8,36.1 27.4,32.8 24,41 20.6,32.8 12.2,36.1 15.5,27.7 7.5,24 15.5,20.3 12.2,11.9 20.6,15.2"
        fill="none"
        stroke="url(#k185-g)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="5.4" fill="none" stroke="url(#k185-g)" strokeWidth="1.2" />
      <text
        x="24"
        y="27.4"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill="url(#k185-g)"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        ۱۸۵
      </text>
    </svg>
  );
}
