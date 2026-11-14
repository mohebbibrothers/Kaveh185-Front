/**
 * ستارهٔ هشت‌پر — عنصر امضای بصری پروژه، برگرفته از شمسه و گره‌چینی.
 * در جداکننده‌ها، تیترها و جدول‌ها تکرار می‌شود تا هویت یکدست شود.
 */
export function Star({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 1.6 19.7 9.1 27.9 6.1 24.9 14.3 32.4 18 24.9 21.7 27.9 29.9 19.7 26.9 16 34.4 12.3 26.9 4.1 29.9 7.1 21.7 -0.4 18 7.1 14.3 4.1 6.1 12.3 9.1Z"
        fill="currentColor"
        transform="translate(0,-1.8) scale(1,0.94)"
      />
    </svg>
  );
}

/** جداکنندهٔ پرنقش: دو خط طلایی با یک شمسهٔ مرکزی — امضای صفحه‌آرایی ایرانی */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="via-gold/45 to-gold/60 h-px flex-1 bg-gradient-to-l from-transparent" />
      <span className="text-gold grid place-items-center">
        <Star size={13} />
      </span>
      <span className="border-gold/60 size-1 rotate-45 border" />
      <span className="text-gold grid place-items-center">
        <Star size={13} />
      </span>
      <span className="via-gold/45 to-gold/60 h-px flex-1 bg-gradient-to-r from-transparent" />
    </div>
  );
}

/** تیتر بخش با نشان ستاره — یکدست‌سازی همهٔ سرویس‌های صفحه */
export function SectionTitle({
  eyebrow,
  title,
  tone = "gold",
  id,
  action,
}: {
  eyebrow: string;
  title: string;
  tone?: "gold" | "verde" | "brick";
  id?: string;
  action?: React.ReactNode;
}) {
  const toneCls =
    tone === "verde" ? "text-verde" : tone === "brick" ? "text-brick" : "text-gold-strong";
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p
          className={`flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide ${toneCls}`}
        >
          <Star size={9} />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-1.5 text-[clamp(19px,2.7vw,27px)] font-extrabold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
