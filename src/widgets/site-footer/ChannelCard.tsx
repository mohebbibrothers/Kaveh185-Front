import { SITE } from "@/shared/config/site";

/**
 * کارتِ کانال رسمی — با پویانماییِ مخصوصِ آیکونِ پیام‌رسان بله.
 *
 * ── نکتهٔ ۱۱ کاربر ───────────────────────────────────────────────────────
 * «کانال رسمی رو حرفه‌ای و خفن طراحی کنی و مثلاً آیکونِ پیام‌رسان بله با
 * پویانماییِ خاصِ خودش (وقتی هاورش می‌شه).»
 *
 * ── چهار حرکتِ هم‌زمانِ هماهنگ در هاور ────────────────────────────────────
 *  ۱) **حلقهٔ پالس** دورِ آیکون پخش می‌شود (دو موج با تأخیرِ پله‌ای).
 *  ۲) **آیکونِ بله یک تکانِ کوتاه** می‌خورد — همان «سلام‌کردن».
 *  ۳) **درخششِ لغزنده** از یک لبه به لبهٔ دیگر کارت می‌گذرد.
 *  ۴) **فلشِ «رفتن»** از حالت ساکن بیرون می‌آید.
 *
 * هر چهار حرکت با `transform` و `opacity` کار می‌کنند (بدون layout) و با
 * `prefers-reduced-motion` خاموش می‌شوند. کدِ میانیِ بله با راهنمای متن
 * همراه است، چون کاربر باید بداند دقیقاً کجا می‌رود.
 */
export function ChannelCard() {
  return (
    <a
      href={SITE.channel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`کانال رسمی ${SITE.channel.name} در پیام‌رسان ${SITE.channel.platform} — باز شدن در پنجرهٔ تازه`}
      className="k185-channel group border-on-stage/12 bg-on-stage/[0.045] hover:border-gold/40 hover:bg-on-stage/[0.075] relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-colors duration-300"
    >
      {/* درخششِ لغزنده */}
      <span
        aria-hidden="true"
        className="k185-channel-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent"
      />

      {/* آیکون + پالس */}
      <span className="relative grid size-11 shrink-0 place-items-center">
        {/* دو حلقهٔ پالس با تأخیر پله‌ای */}
        <span
          aria-hidden="true"
          className="k185-pulse-ring border-verde/50 absolute inset-0 rounded-full border"
        />
        <span
          aria-hidden="true"
          className="k185-pulse-ring k185-pulse-ring-2 border-verde/35 absolute inset-0 rounded-full border"
        />
        <span className="bg-verde/15 text-verde k185-bell ring-verde/25 relative grid size-10 place-items-center rounded-full ring-1">
          <BaleGlyph />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-on-stage block truncate text-[12.5px] font-extrabold">
          {SITE.channel.name}
        </span>
        <span
          className="text-on-stage-muted/85 mt-0.5 flex items-center gap-1.5 text-[10.5px]"
          dir="ltr"
        >
          <span className="truncate font-mono">{SITE.channel.handle}</span>
        </span>
        <span className="text-on-stage-muted/65 mt-1 block text-[9.5px] font-semibold">
          {SITE.channel.platform} · کانال رسمی خبرگزاری حوزه
        </span>
      </span>

      {/* فلشِ رفتن */}
      <span
        aria-hidden="true"
        className="k185-channel-arrow text-on-stage-muted/60 border-on-stage/12 group-hover:border-gold/40 group-hover:text-gold grid size-7 shrink-0 place-items-center rounded-full border transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="M14 6l6 6-6 6M20 12H4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** نشانِ پیام‌رسان بله — حرفِ «ب» داخلِ حبابِ گفتگو، بدون وابستگی به CDN. */
function BaleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none">
      <path
        d="M4.4 3.4h15.2A1.4 1.4 0 0 1 21 4.8v10a1.4 1.4 0 0 1-1.4 1.4h-4.3v3.1a.45.45 0 0 1-.74.35L10.4 16.2H4.4A1.4 1.4 0 0 1 3 14.8v-10a1.4 1.4 0 0 1 1.4-1.4Z"
        stroke="currentColor"
        strokeWidth="1.35"
        fill="currentColor"
        fillOpacity="0.13"
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
