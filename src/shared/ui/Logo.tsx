/**
 * نشان کاوه ۱۸۵ — دو حالت، یک هویت.
 *
 * ── چرا عوض شد؟ ────────────────────────────────────────────────────────
 * نسخهٔ قبل، چهرهٔ شهید را مستقیم در `object-cover` می‌گذاشت؛ نتیجه این بود
 * که در آیکون هدر، تاجِ شمسه از بالا بریده می‌شد و کادرِ گرد، وسطِ صورت
 * می‌افتاد — همان چیزی که کاربر در اسکرین‌شات نشان داد. ریشهٔ مشکل:
 * برشِ دایره‌ای روی تصویری اعمال می‌شد که خودش از قبل قابِ تزئینی داشت.
 *
 * نسخهٔ جدید دو چیز را جدا می‌کند:
 *   • **variant="portrait"** — تصویر از پیش برش‌خورده و در مرکز چهره
 *     (`/img/icon-face.png`، ۲۵۶px، تولیدشده دقیقاً برای دایره). چهرهٔ شهید
 *     کامل و وسط است. حلقهٔ طلایی، لبهٔ قابِ طلاییِ خودِ تصویر را ادامه
 *     می‌دهد، نه اینکه روی آن بیفتد.
 *   • **variant="emblem"** — شمسهٔ کامل با پرچم، برای هدر در ابعاد بزرگ‌تر
 *     و فوتر. این‌جا برش نمی‌خوریم؛ قاب دست‌نخورده می‌ماند.
 *   • **variant="mark"** — نشان هندسی تک‌رنگ (شمسهٔ هشت‌پر با «۱۸۵» مرکزی)
 *     برای جاهایی که رنگ‌پذیری با `currentColor` لازم است (چاپ، favicon
 *     تک‌رنگ، واترمارک).
 *
 * قاعدهٔ کلی: **هرگز چهره را با `object-cover` در دایره نگذارید.** تصویر
 * باید از قبل برای همان دایره ساخته شده باشد.
 */

/*
  ⚠️ نسخهٔ قبل `emblem.png` را با نسبت ۶۷۸×۷۸۰ نشان می‌داد و داخلِ کادرِ
  مربعِ هدر/فوتر با `object-contain` جا می‌داد؛ نتیجه: نشان از بالا و
  پایین «کات» دیده می‌شد (تاجِ شمسه و نوارِ پایین گم می‌شدند). ریشهٔ
  مشکل، نسبتِ غیرمربعِ فایل بود، نه CSS.
  `emblem-square.png` همان نشان است، برش‌خورده به مربعِ ۵۱۲×۵۱۲ روی
  مرکزِ محتوا (یک‌بار، در زمان ساخت) — پس در هیچ کادری کات نمی‌شود.
*/
const EMBLEM_SRC = "/img/emblem-square.png";
const FACE_SRC = "/img/icon-face.png";

function GoldRing({ size }: { size: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        // لبهٔ دولایه: یک خط زر نازک بیرون، یک هالهٔ نرم داخل.
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--c-gold) 62%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--c-gold) 22%, transparent), 0 6px 18px -10px color-mix(in oklab, var(--c-stage) 55%, transparent)",
        width: size,
        height: size,
      }}
    />
  );
}

export function Logo({
  size = 44,
  className = "",
  variant = "portrait",
}: {
  size?: number;
  className?: string;
  variant?: "portrait" | "mark" | "emblem";
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
          <linearGradient id="k185-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--c-gold)" />
            <stop offset="1" stopColor="var(--c-gold-strong)" />
          </linearGradient>
        </defs>
        {/* شمسهٔ هشت‌پر: دو مربع چرخیده — زبان هندسی گره‌چینی */}
        <rect
          x="9"
          y="9"
          width="30"
          height="30"
          rx="2"
          fill="none"
          stroke="url(#k185-mark)"
          strokeWidth="1.5"
          transform="rotate(0 24 24)"
        />
        <rect
          x="9"
          y="9"
          width="30"
          height="30"
          rx="2"
          fill="none"
          stroke="url(#k185-mark)"
          strokeWidth="1.5"
          transform="rotate(45 24 24)"
        />
        <circle
          cx="24"
          cy="24"
          r="9.5"
          fill="var(--c-canvas)"
          stroke="url(#k185-mark)"
          strokeWidth="1.2"
        />
        <text
          x="24"
          y="27.4"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="800"
          fill="url(#k185-mark)"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ۱۸۵
        </text>
      </svg>
    );
  }

  if (variant === "emblem") {
    return (
      <span
        className={`relative inline-grid shrink-0 place-items-center ${className}`}
        style={{ width: size, height: size }}
      >
        {/* شمسهٔ کامل: تاج و پرچم دست‌نخورده، بدون برش دایره‌ای */}
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG شفاف با
            ابعاد ثابت؛ next/image برای این اندازه فقط لایهٔ resize اضافه
            می‌کند و تصویر را دوباره بهینه نمی‌کند. */}
        <img
          src={EMBLEM_SRC}
          alt=""
          width={size}
          height={size}
          className="size-full object-contain drop-shadow-[0_2px_6px_rgba(20,26,48,0.18)]"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <GoldRing size={size} />
      {/* تصویر از پیش برش‌خورده و مرکزچین — نه `object-cover` روی قاب کامل */}
      {/* eslint-disable-next-line @next/next/no-img-element -- تصویر ۴۰px با
          ابعاد ثابت است؛ next/image برای این اندازه فقط یک لایهٔ resize
          اضافه می‌کند و LCP را بهتر نمی‌کند. فایل از قبل بهینه. */}
      <img
        src={FACE_SRC}
        alt=""
        width={size}
        height={size}
        className="size-full rounded-full object-cover"
        decoding="async"
      />
    </span>
  );
}
