/**
 * نشان کاوه ۱۸۵ — سه حالت، یک هویت، همیشه بدون پس‌زمینه.
 *
 * ── ایرادِ نسخهٔ قبل (نکتهٔ ۱ کاربر) ──────────────────────────────────────
 * «لوگوی هدر، لوگوی زبانهٔ مرورگر، لوگوی فوتر و لوگوی صفحهٔ ۴۰۴ باید همان
 * تصویرِ بدون بک‌گراند باشند.» نسخهٔ قبل سه فایلِ متفاوت و بدتر: یک
 * `icon-face.png` که خودش از قبل با کادرِ طلایی برش خورده بود، یک
 * `emblem-portrait.jpg` که پس‌زمینهٔ کرمِ مستطیلی داشت و در هدر مثل یک
 * «کادر عکس» دیده می‌شد، و آیکون‌های PWA که از همان پرترهٔ گرد ساخته
 * شده بودند.
 *
 * حالا **یک** داراییِ منبع داریم و همه از آن مشتق می‌شوند:
 *   • `emblem-mark`  — نشانِ کامل با شفافیت (`public/img/emblem-mark.webp`)
 *   • `emblem-head`  — برشِ پرترهٔ کادرِ گنبدی با شفافیت (`emblem-head.webp`)
 *   • آیکون‌های ۳۲/۶۴/۱۸۰/۱۹۲/۵۱۲ و maskable — همه از همین نشان، روی
 *     زمینهٔ لاجوردی تا در زبانهٔ کروم (که شفافیت را سفید نشان می‌دهد)
 *     دیده شوند.
 *
 * ── قاعده‌ای که دیگر نقض نمی‌شود ─────────────────────────────────────────
 * **هرگز چهره را با `object-cover` در دایره نگذارید.** تصویری که خودش
 * کادرِ تزئینی دارد، وقتی داخل دایره برش بخورد، تاجِ شمسه‌اش می‌رود.
 *
 * ── نکتهٔ ۷ کاربر (دورِ ۱۶): آواتارِ موبایل «ناقص و بی‌کادر» بود ──────────
 * ریشه در دو لایه بود:
 *   ۱) خودِ فایلِ `emblem-avatar.webp` یک **برشِ مربعِ شفاف** بود؛ داخلِ
 *      قابِ گرد، چهار گوشه‌اش می‌بُرید (مخصوصاً در ۲۶–۳۴px منوی موبایل).
 *   ۲) CSS هم `object-cover` می‌گذاشت و همان برش را تشدید می‌کرد.
 * حالا **خودِ فایل دایره است**: بومِ کرمِ هم‌رنگِ کادرِ گنبدی + حلقهٔ
 * مویِ طلایی + ماسکِ آلفای گرد (در `build_front_assets.py`). پس در هر
 * اندازه‌ای کامل است و هیچ برشی لازم ندارد. `GoldRing` هم دیگر حلقهٔ دوم
 * نمی‌کشد (قاب داخلِ تصویر است) و فقط سایه/هالهٔ بیرونی می‌دهد.
 */
const AVATAR_SRC = "/img/emblem-avatar.webp";
const AVATAR_SM_SRC = "/img/emblem-avatar-sm.webp";
/** نسخهٔ ۴۸px — برای اندازه‌های ۲۴ تا ۳۴ که هیچ‌جای هدر و منو نیست. */
const AVATAR_XS_SRC = "/img/emblem-avatar-xs.webp";
const MARK_SRC = "/img/emblem-mark.webp";
const MARK_SM_SRC = "/img/emblem-mark-sm.webp";

function GoldRing({ size }: { size: number }) {
  // قابِ طلایی **داخلِ خودِ تصویر** است (تا در هر اندازه‌ای سالم بمانَد)؛
  // این لایه فقط هالهٔ نرمِ بیرونی و یک لبهٔ نوری می‌دهد که آواتار را از
  // پشتِ هدر جدا می‌کند — بدونِ حلقهٔ دوم.
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        boxShadow:
          "0 1px 2px color-mix(in oklab, var(--c-stage) 30%, transparent), 0 6px 18px -10px color-mix(in oklab, var(--c-stage) 55%, transparent)",
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

  /**
   * نشانِ کامل (شهید + پرچم + خوش‌نویسی) — **بدون کادر و بدون پس‌زمینه**.
   *
   * ارتفاع ثابت است و عرض از نسبت واقعی تصویر می‌آید؛ در فوتر و ۴۰۴ هم
   * همین استفاده می‌شود. `size` یعنی «ارتفاع».
   */
  if (variant === "emblem") {
    return (
      <span
        className={`relative inline-grid shrink-0 place-items-center ${className}`}
        style={{ height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- تصویر ثابتِ
            بهینه‌شده با ابعاد مشخص؛ next/image در خروجی ایستا فقط یک لایهٔ
            اضافه می‌کند و این تصویر LCP هدر نیست. */}
        <img
          src={size <= 64 ? MARK_SM_SRC : MARK_SRC}
          alt=""
          height={size}
          style={{ height: size, width: "auto" }}
          className="block drop-shadow-[0_3px_10px_oklch(20%_0.04_260/0.22)]"
          decoding="async"
        />
      </span>
    );
  }

  /**
   * پرترهٔ گرد — آواتارِ هدر، منوی موبایل و صفحهٔ ۴۰۴.
   * `object-contain` تا هیچ بخشی از کادرِ گنبدی بریده نشود.
   */
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <GoldRing size={size} />
      <span
        className="relative grid size-full place-items-center overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        {/* `object-contain` و نه `cover`: فایل خودش دایره است؛ `cover` فقط
            لبه‌ها را می‌بُرید (همان ایرادِ «آواتارِ ناقص» در موبایل).

            ⚠️ نکتهٔ ۳ دورِ ۱۷ — چرا نسخهٔ ۴۸px اضافه شد:
            پیش‌تر برای هر اندازهٔ ≤۵۶ همان `emblem-avatar-sm` (۱۲۸px) با
            `object-contain` کشیده می‌شد. در ۲۶px مرورگر یک تصویرِ ۱۲۸px را
            به ۲۶px کوچک می‌کرد و چون حلقهٔ طلایی فقط ۳٪ ضخامت داشت، در
            کوچک‌شدن محو/ناقص دیده می‌شد. حالا یک فایلِ بهینهٔ ۴۸px با
            حلقهٔ ضخیم‌تر برای اندازه‌های کوچک داریم و `1x/2x` هم با
            `sizes` منطقی انتخاب می‌شود. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- ابعاد مشخص، از قبل بهینه */}
        <img
          src={size <= 34 ? AVATAR_XS_SRC : size <= 56 ? AVATAR_SM_SRC : AVATAR_SRC}
          alt=""
          width={size}
          height={size}
          className="size-full object-contain"
          decoding="async"
        />
      </span>
    </span>
  );
}
