import { SITE } from "@/shared/config/site";

/**
 * کانال رسمی — **آیکونِ سه‌بعدیِ بله**، بدونِ هیچ باکسِ درازی.
 *
 * ── نکتهٔ ۴ کاربر (دورِ ۱۶) ──────────────────────────────────────────────
 * «اون باکسِ کانالِ رسمی رو کلاً بردار، جاش آیکونِ بله رو با استایلِ
 * سه‌بعدی و پویانماییِ جذاب بذار؛ کلیک ⇒ کانال. رنگِ آیکون با تمِ روز/شب
 * عوض بشه.»
 *
 * ── چطور «سه‌بعدی» شد، بدونِ یک تصویرِ اضافه؟ ────────────────────────────
 * آیکونِ بله دو **ماسکِ آلفا** است که از فایلِ خودِ کاربر ساخته شده
 * (`/img/bale-body.png` بدنهٔ حباب، `/img/bale-tick.png` تیک):
 *
 *   ۱) **بدنه** با `background-color` رنگ می‌گیرد و رویش گرادیانِ عمودیِ
 *      روشن‌به‌تیره می‌نشیند ⇒ حسِ گنبد/کره.
 *   ۲) **تیک** سفیدِ مات می‌مانَد و یک نسخهٔ کوچکِ محو هم **زیرِ** بدنه
 *      می‌آید ⇒ تیک مثل یک برجستگیِ واقعی روی سطح می‌نشیند.
 *   ۳) **سایهٔ داخلیِ بالا** (`inset 0 2px 0`) لبهٔ روشنِ نور و **سایهٔ
 *      داخلیِ پایین** (`inset 0 -6px 10px`) عمقِ زیرین را می‌سازد.
 *   ۴) **بازتاب** (`radial-gradient` بالا-چپ) + **حلقهٔ طلاییِ نازک** دورِ
 *      آیکون ⇒ فلزِ برند، نه یک دکمهٔ تخت.
 *
 * نتیجه: در تمِ روز بدنهٔ زمردیِ عمیق با تیکِ کِرِم؛ در تمِ شب همان بدنه
 * یک پله روشن‌تر و تیک طلاییِ گرم — هر دو از توکن‌های `verde` و `gold`
 * می‌آیند، پس هیچ رنگِ ثابتی در کامپوننت نیست.
 *
 * ── پویانمایی (همه با `transform`/`opacity`، بی‌هیچ layout) ───────────────
 *   • **شناوریِ آرام** بی‌وقفه: آیکون ۲px بالا-پایین می‌رود (`k185-bale-float`).
 *   • **دو حلقهٔ پالسِ پله‌ای** از پشتِ آن بیرون می‌زنند.
 *   • **هاور/فوکوس:** تیک «کلیک» می‌کند (`k185-bale-tick-pop`)، حلقهٔ
 *     طلایی روشن می‌شود، درخششِ مورب یک‌بار عبور می‌کند و آیکون کمی
 *     بزرگ می‌شود.
 *   • `prefers-reduced-motion` ⇒ همهٔ پویانمایی‌ها خاموش، خودِ آیکون می‌مانَد.
 *
 * ⚠️ فقط یک کانال رسمی وجود دارد. لینکِ مرده بدتر از نبودِ لینک است.
 */
/** ماسکِ مشترکِ تیک — یک شیء، دو مصرف (سایه و خودِ تیک). */
const MASK = {
  maskImage: "url(/img/bale-tick.png)",
  WebkitMaskImage: "url(/img/bale-tick.png)",
} as const;

export function ChannelCard() {
  return (
    <a
      href={SITE.channel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`کانال رسمی ${SITE.channel.name} در پیام‌رسان ${SITE.channel.platform} — باز شدن در پنجرهٔ تازه`}
      className="k185-bale group flex items-center gap-3 rounded-2xl py-1.5 ps-1 pe-2 transition-colors hover:bg-[var(--c-band-2)] focus-visible:bg-[var(--c-band-2)]"
    >
      {/* ── آیکونِ سه‌بعدی ── */}
      <span className="relative grid size-[54px] shrink-0 place-items-center sm:size-[58px]">
        {/* پالس‌های پشتِ آیکون */}
        <span
          aria-hidden="true"
          className="k185-bale-ring border-verde/45 absolute inset-1.5 rounded-full border"
        />
        <span
          aria-hidden="true"
          className="k185-bale-ring k185-bale-ring-2 border-verde/30 absolute inset-1.5 rounded-full border"
        />
        {/* هالهٔ نرمِ زیرِ آیکون — «شناوری» را باورپذیر می‌کند */}
        <span
          aria-hidden="true"
          className="bg-verde/25 absolute -bottom-1 h-2 w-8 rounded-full blur-[5px]"
        />

        <span className="k185-bale-body relative grid size-[44px] place-items-center rounded-full sm:size-[48px]">
          {/* بازتابِ سطح */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(80%_60%_at_28%_16%,oklch(100%_0_0/0.42),transparent_58%)]"
          />
          {/* درخششِ موربِ هاور */}
          <span
            aria-hidden="true"
            className="k185-bale-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span className="absolute inset-y-0 -left-1/2 w-1/3 bg-[linear-gradient(90deg,transparent,oklch(100%_0_0/0.55),transparent)]" />
          </span>

          {/* تیکِ برجسته — دو لایه: سایهٔ زیرین + تیکِ روشن */}
          <span className="k185-bale-tick relative grid size-[26px] place-items-center sm:size-[28px]">
            <span
              aria-hidden="true"
              className="k185-bale-mask absolute inset-0 translate-y-[1.5px] bg-[oklch(0%_0_0/0.3)] blur-[1px]"
              style={MASK}
            />
            <span
              aria-hidden="true"
              className="k185-bale-mask bg-on-verde absolute inset-0"
              style={MASK}
            />
          </span>
        </span>
      </span>

      {/* ── نام و کد ── */}
      <span className="min-w-0">
        <span className="text-on-band block truncate text-[12.5px] font-extrabold">
          {SITE.channel.name}
        </span>
        <span className="text-on-band-muted/85 mt-0.5 flex items-center gap-1.5 text-[10.5px]">
          <span className="truncate font-mono" dir="ltr">
            {SITE.channel.handle}
          </span>
        </span>
        <span className="text-on-band-muted/70 mt-0.5 flex items-center gap-1 text-[9.5px] font-semibold">
          {SITE.channel.platform} · کانال رسمی
          <svg
            viewBox="0 0 24 24"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            aria-hidden="true"
            className="k185-bale-arrow"
          >
            <path d="M14 6l6 6-6 6M20 12H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </a>
  );
}
