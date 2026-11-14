/**
 * کاشی هندسی (گره‌چینی) — SVG درون‌خطی، الگوی تکرارشونده.
 * چرا SVG و نه تصویر؟ حجم صفر، رنگ‌پذیر با currentColor، بدون درخواست شبکه.
 * برای LCP: هیچ تصویری در بالای صفحه بارگذاری نمی‌شود.
 */
export function PersianPattern({
  opacity = 0.07,
  size = 120,
  className = "",
}: {
  opacity?: number;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern id={`k185-pat-${size}`} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {[0, 1].map((gy) =>
              [0, 1].map((gx) => {
                const cx = gx * (size / 2) + size / 4;
                const cy = gy * (size / 2) + size / 4;
                const points: string[] = [];
                for (let i = 0; i < 16; i++) {
                  const ang = (Math.PI * 2 * i) / 16 - Math.PI / 2;
                  const r = i % 2 === 0 ? size * 0.21 : size * 0.092;
                  points.push(
                    `${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`,
                  );
                }
                return (
                  <g key={`${gx}-${gy}`}>
                    <polygon points={points.join(" ")} strokeWidth="1.1" />
                    <circle cx={cx} cy={cy} r={size * 0.028} strokeWidth="0.9" opacity="0.7" />
                  </g>
                );
              }),
            )}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#k185-pat-${size})`} />
    </svg>
  );
}
