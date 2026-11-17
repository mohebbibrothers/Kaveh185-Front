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

/**
 * نشان کامل — **بدون هیچ برشی**.
 *
 * ── ایرادِ نسخهٔ قبل (نکتهٔ ۳ کاربر) ────────────────────────────────────
 * فایل `emblem.png` خودش از پایین بریده بود: روبانِ سه‌رنگ و دعای
 * «به یاد شهید» نصفه بودند و در هدر و فوتر همان برش دیده می‌شد — کاربر
 * دقیقاً همین را گفت: «لوگو از پایین کات شده و قسمتی از متن داخل لوگو
 * بریده». ریشهٔ مشکل در CSS نبود؛ در خودِ فایل بود.
 *
 * فایل تازه (`emblem-portrait.jpg`) از تصویر اصلیِ `kaveh-hero.jpg` با
 * ناحیهٔ وسیع‌تر ساخته شده: طاق کامل، هر دو روبان، دعا و گلبرگ‌ها. نسبت
 * ۳:۴ است، پس در قابِ مربع با `object-contain` هم نمی‌بریم — فقط دو نوارِ
 * کرم در دو طرف می‌ماند که با `rounded` و حلقهٔ طلایی، «کادرِ عکس» می‌شود،
 * نه «برش».
 */
const EMBLEM_SRC = "/img/emblem-portrait.jpg";
const EMBLEM_SM_SRC = "/img/emblem-portrait-sm.jpg";
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
    // نسبت واقعی تصویر ۳:۴ است؛ اگر قاب مربع بماند، `contain` دو نوار
    // خالی می‌گذارد و نشان کوچک می‌شود. پس خودِ قاب هم ۳:۴ است.
    const width = Math.round(size * 0.75);
    const height = size;
    return (
      <span
        className={`ring-gold/30 relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[26%] shadow-[0_2px_10px_-4px_oklch(28%_0.06_260/0.35)] ring-1 ${className}`}
        style={{ width, height }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- تصویر ثابت با
            ابعاد مشخص؛ next/image برای ۳۰px فقط یک لایهٔ resize اضافه می‌کند. */}
        <img
          src={size <= 48 ? EMBLEM_SM_SRC : EMBLEM_SRC}
          alt=""
          width={width}
          height={height}
          className="size-full object-cover object-center"
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
