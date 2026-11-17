import { SITE } from "@/shared/config/site";

/**
 * کانال رسمی — **آیکونِ گردِ بله** با پویانماییِ اختصاصی، بی‌هیچ باکسِ درازی.
 *
 * ── نکتهٔ ۱۰ کاربر ───────────────────────────────────────────────────────
 * «اون باکسِ دراز رو کلاً بردار؛ یه آیکونِ جذاب و حرفه‌ای از بله بذار جاش
 * و یه پویانماییِ حرفه‌ای هم بهش بده.»
 *
 * ── طراحیِ تازه ──────────────────────────────────────────────────────────
 * • **یک آیکونِ گردِ ۶۴px** با گرادیانِ زمردی و حلقهٔ نور — نقطهٔ توجهِ
 *   ستون، بدونِ اشغالِ عرض.
 * • **دو حلقهٔ پالسِ پله‌ای** که آرام و بی‌وقفه از آیکون بیرون می‌زنند؛
 *   یعنی «این‌جا زنده است» — بدونِ چشمک‌زدنِ آزاردهنده.
 * • **تکانِ آیکون** در هاور/فوکوس (همان «سلام‌کردن»).
 * • **هالهٔ چرخان** (`conic-gradient` + `animation`) که در هاور روشن
 *   می‌شود — یک جزئیاتِ گران‌قیمت که با CSS خالص ساخته شده.
 * • نام و کدِ کانال **زیر** آیکون، کوتاه و خوانا؛ کلِ بلوک یک لینک است
 *   با ناحیهٔ لمسِ بزرگ‌تر از آیکون.
 *
 * ⚠️ فقط یک کانال رسمی وجود دارد. لینکِ مرده بدتر از نبودِ لینک است.
 */
export function ChannelCard() {
  return (
    <a
      href={SITE.channel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`کانال رسمی ${SITE.channel.name} در پیام‌رسان ${SITE.channel.platform} — باز شدن در پنجرهٔ تازه`}
      className="k185-channel group flex w-full max-w-[280px] items-center gap-3 rounded-2xl px-2 py-2 text-start transition-colors hover:bg-[var(--c-band-2)] focus-visible:bg-[var(--c-band-2)] lg:max-w-none lg:px-2.5"
    >
      {/* ── آیکون ── */}
      <span className="relative grid size-[58px] shrink-0 place-items-center">
        {/* هالهٔ چرخان */}
        <span
          aria-hidden="true"
          className="k185-channel-halo absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0 55%, color-mix(in oklab, var(--c-verde) 55%, transparent) 72%, transparent 88%)",
            maskImage: "radial-gradient(circle, transparent 62%, black 66%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 66%)",
          }}
        />
        {/* دو پالسِ پله‌ای */}
        <span
          aria-hidden="true"
          className="k185-pulse-ring border-verde/45 absolute inset-1 rounded-full border"
        />
        <span
          aria-hidden="true"
          className="k185-pulse-ring k185-pulse-ring-2 border-verde/30 absolute inset-1 rounded-full border"
        />

        <span className="k185-bell relative grid size-[50px] place-items-center rounded-full bg-gradient-to-b from-[color-mix(in_oklab,var(--c-verde)_78%,white)] to-[var(--c-verde)] text-white shadow-[0_10px_24px_-10px_color-mix(in_oklab,var(--c-verde)_75%,transparent),inset_0_1px_0_oklch(100%_0_0/0.4)] ring-1 ring-white/25">
          <BaleGlyph />
        </span>
      </span>

      {/* ── نام و کد ── */}
      <span className="min-w-0">
        <span className="text-on-band block truncate text-[12.5px] font-extrabold">
          {SITE.channel.name}
        </span>
        <span className="text-on-band-muted/85 mt-0.5 flex items-center gap-1 text-[10.5px]" dir="ltr">
          <span className="truncate font-mono">{SITE.channel.handle}</span>
        </span>
        <span className="text-on-band-muted/70 mt-0.5 block text-[9.5px] font-semibold">
          {SITE.channel.platform} · کانال رسمی خبرگزاری حوزه
        </span>
      </span>

      {/* فلشِ رفتن — فقط دسکتاپ */}
      <span
        aria-hidden="true"
        className="k185-channel-arrow text-on-band-muted/60 hidden size-7 shrink-0 place-items-center rounded-full border border-on-band/15 transition-colors group-hover:border-verde/50 group-hover:text-verde lg:grid"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M14 6l6 6-6 6M20 12H4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** نشانِ پیام‌رسان بله — حرفِ «ب» داخلِ حبابِ گفتگو، بدون وابستگی به CDN. */
function BaleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none">
      <path
        d="M4.4 3.4h15.2A1.4 1.4 0 0 1 21 4.8v10a1.4 1.4 0 0 1-1.4 1.4h-4.3v3.1a.45.45 0 0 1-.74.35L10.4 16.2H4.4A1.4 1.4 0 0 1 3 14.8v-10a1.4 1.4 0 0 1 1.4-1.4Z"
        stroke="currentColor"
        strokeWidth="1.35"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path
        d="M8.4 8.1v5.4c0 1.9 3.4 1.9 3.4 0V8.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.1 8.1v5.4c0 1.9 3.4 1.9 3.4 0 0-1.9-3.4-1.9-3.4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
