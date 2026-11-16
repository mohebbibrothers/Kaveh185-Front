/**
 * نقش‌مایه‌های هندسی کاوه ۱۸۵ — زبان بصری «کاشی لاجوردی و گره».
 *
 * چرا SVG و نه تصویر؟ چون این نقش‌ها پس‌زمینه‌اند و باید با `currentColor`
 * رنگ بگیرند (تم روز/شب، بخش تیره، چاپ). یک PNG سیاه هیچ‌کدام را نمی‌دهد.
 *
 * چرا ستاره کنار نام مساجد حذف شد؟ ستاره در نسخهٔ قبل همه‌جا بود — تیتر،
 * جداکننده، ردیف مسجد — و همین تکرار آن را ارزان کرده بود. جای آن، سه
 * عنصر با معنی آمده:
 *
 *   • `Girih`   — گرهٔ هشت‌پر برای جداکننده و تیتر (هویت ایرانی، بی‌تزئین اضافه)
 *   • `Muqarnas`— کمانِ محرابی برای قاب تیترها و کارت‌ها
 *   • `MosqueMark` — نشان اختصاصی هر مسجد: کاشیِ کوچکی که حرف اول نام مسجد
 *     و یک ترتیب رقابتی را نشان می‌دهد. هر مسجد نشان خودش را دارد، پس
 *     فهرست «تکرار ستاره × ۱۷» نیست.
 */

/** گرهٔ هشت‌پر — امضای بصری. اندازه‌پذیر و رنگ‌پذیر. */
export function Girih({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <rect x="6" y="6" width="20" height="20" />
        <rect x="6" y="6" width="20" height="20" transform="rotate(45 16 16)" />
        <circle cx="16" cy="16" r="3.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** جداکنندهٔ محرابی — دو خط نازک با یک گرهٔ مرکزی. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="via-border-strong/70 h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
      <span className="text-gold-strong/80 grid place-items-center">
        <Girih size={13} />
      </span>
      <span className="via-border-strong/70 h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
    </div>
  );
}

/** کمان محرابی — لبهٔ بالای کارت‌های تیتردار. */
export function MuqarnasArch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 24V14C8 14 12 9 16 5c4 4 8 9 16 9s12-5 16-9c4 4 8 9 16 9s12-5 16-9c4 4 8 9 16 9s12-5 16-9c4 4 8 9 16 9v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** نمونهٔ تیتر بخش — شمارندهٔ کوچک «۰۱» به‌جای ستاره. */
export function SectionTitle({
  eyebrow,
  title,
  tone = "brand",
  id,
  action,
  index,
}: {
  eyebrow: string;
  title: string;
  tone?: "brand" | "verde" | "brick";
  id?: string;
  action?: React.ReactNode;
  index?: string;
}) {
  const toneCls = tone === "verde" ? "text-verde" : tone === "brick" ? "text-brick" : "text-brand";
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p
          className={`flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide ${toneCls}`}
        >
          {index ? (
            <span className="rounded-[5px] border border-current/25 px-1.5 py-0.5 text-[10px] tabular-nums">
              {index}
            </span>
          ) : (
            <span
              className="inline-block h-[2px] w-4 rounded-full bg-current/70"
              aria-hidden="true"
            />
          )}
          {eyebrow}
        </p>
        <h2 id={id} className="text-text mt-2 text-[clamp(19px,2.7vw,27px)] font-extrabold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/**
 * نشان اختصاصی مسجد — کاشی کوچک با حرف اول نام + شمارهٔ ترتیب.
 *
 * چرا حرف اول؟ چون ۱۷ مسجد داریم و ۱۷ ستارهٔ یکسان هیچ اطلاعاتی حمل
 * نمی‌کرد. حرف اول، مسجد را در فهرست قابل تشخیص می‌کند و «شمارهٔ ترتیب»
 * یک شمارندهٔ واقعی از داده است. رنگ، از شش رنگ ثابت پروژه انتخاب می‌شود
 * تا هر مسجد نشان پایدار خودش را داشته باشد (نه رنگ تصادفی هر رندر).
 */
const TILE_TONES = [
  "bg-brand/[0.09] text-brand ring-brand/20",
  "bg-verde/[0.10] text-verde ring-verde/20",
  "bg-gold/[0.16] text-gold-strong ring-gold/30",
  "bg-accent/[0.13] text-accent ring-accent/25",
  "bg-brick/[0.09] text-brick ring-brick/20",
  "bg-surface-2 text-text-muted ring-border-strong/40",
] as const;

export function MosqueMark({
  name,
  order,
  size = 34,
}: {
  name: string;
  order?: number;
  size?: number;
}) {
  const first = (name.trim().match(/[^\s(]+/) ?? ["م"])[0].replace(/^ال/, "");
  const initial = first.slice(0, 1) || "م";
  const seed = Array.from(name).reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
  const tone = TILE_TONES[seed % TILE_TONES.length];

  return (
    <span
      className={`relative grid shrink-0 place-items-center ring-1 ${tone}`}
      style={{
        width: size,
        height: size,
        // گوشهٔ بریده — همان زبان کاشی، نه دایرهٔ عمومی
        borderRadius: `${Math.round(size * 0.27)}px ${Math.round(size * 0.09)}px`,
      }}
      aria-hidden="true"
    >
      <span className="leading-none font-extrabold" style={{ fontSize: Math.round(size * 0.42) }}>
        {initial}
      </span>
      {order ? (
        <span
          className="bg-canvas absolute -top-1 -left-1 grid min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-extrabold tabular-nums ring-1 ring-current/25"
          style={{ lineHeight: "15px" }}
        >
          {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(order)}
        </span>
      ) : null}
    </span>
  );
}
