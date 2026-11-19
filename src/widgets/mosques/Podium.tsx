"use client";

import { Girih, MosqueMark } from "@/shared/ui/Ornament";
import { faPercent, toFa } from "@/shared/lib/fa";
import { mosqueInitial } from "@/shared/lib/mosque-rank";

/**
 * سکوی افتخارِ جدولِ رتبه‌بندی مساجد.
 *
 * ═══ چه چیزی عوض شد و چرا؟ ═══════════════════════════════════════════════
 * نسخهٔ اول سه «کارتِ هم‌شکل» بود که فقط رنگ و ترتیبشان فرق می‌کرد؛ از دور
 * عملاً یک ردیف کارت دیده می‌شد و کاربر «جایگاه» را حس نمی‌کرد. سه ضعفِ
 * واقعی داشت:
 *
 *  ۱) **بلندی معنا نداشت.** در سکوی واقعی، قدمگاهِ قهرمان از همه بلندتر است.
 *     حالا هر جایگاه یک **ستونِ سنگی با ارتفاعِ متفاوت** دارد (۲۱۰/۱۶۸/۱۴۰
 *     پیکسل) که نقشِ گره هم رویش حک شده؛ حتی اگر متن را نخوانی، سلسله‌مراتب
 *     را می‌بینی — همان چیزی که چشم از یک سکو انتظار دارد.
 *
 *  ۲) **مدال‌ها تزئین بودند، نه نشانِ جایگاه.** حالا قهرمان تاجِ طلایی +
 *     مدالِ شناور + شمارهٔ جایگاهِ درشت روی ستون دارد؛ نفرِ دوم و سوم مدالِ
 *     نقره/برنز و ستونِ کوتاه‌تر. «پیشتاز» هم فقط وقتی می‌آید که *واقعاً*
 *     تنها صدرنشین باشد (تساوی یعنی «مشترک»، نه قهرمانِ ساختگی).
 *
 *  ۳) **هیچ حسی از فاصله نداشت.** یک خطِ ریز زیرِ کارتِ قهرمان می‌گوید
 *     اختلاف با نفرِ بعدی چند نفر است؛ یا اگر هم‌امتیازند، صریح می‌گوید
 *     «صدر مشترک». این خط با **دادهٔ واقعی** ساخته می‌شود و اگر رقیبی نباشد
 *     اصلاً رندر نمی‌شود.
 *
 * حرکت‌ها همه در `globals.css` تعریف شده‌اند (`k185-podium-*`): بالا آمدنِ
 * پله‌ای کارت‌ها، درخششِ دوره‌ای رویِ قهرمان، شناوربودنِ مدال و نبضِ هاله —
 * همه با `transform/opacity` (بی‌layout)، همه با `prefers-reduced-motion`
 * خاموش. هیچ وابستگیِ جاوااسکریپتی برای انیمیشن نیست.
 */

/** یک ردیفِ رتبه‌بندی‌شده — همان شکلِ خروجیِ `assignRanks`. */
export type PodiumRow = {
  id: number;
  name: string;
  code: string;
  neighborhood: string;
  completed: number;
  registered: number;
  share: number;
  initial?: string;
  rank: number;
  tied: boolean;
};

/** رنگِ اختصاصیِ هر جایگاه — از توکن‌های تم، پس در شب هم درست است. */
const ACCENT: Record<1 | 2 | 3, string> = {
  1: "var(--c-gold)",
  2: "var(--c-border-strong)",
  3: "var(--c-brick)",
};

const LABEL: Record<1 | 2 | 3, string> = {
  1: "جایگاه نخست",
  2: "جایگاه دوم",
  3: "جایگاه سوم",
};

const ORDINAL: Record<1 | 2 | 3, string> = { 1: "۱", 2: "۲", 3: "۳" };

/** ارتفاعِ ستونِ هر جایگاه (پیکسل) — قهرمان بلندترین قدمگاه را دارد. */
const MONUMENT = {
  /* موبایل: پایه‌های کوتاه (فقط یک پله، نه یک کارتِ دوم) */
  mobile: { 1: 28, 2: 20, 3: 16 },
  /* دسکتاپ: اختلافِ ارتفاع زیاد نیست، ولی چشم فوراً ۱ را بلندتر می‌بیند */
  desktop: { 1: 96, 2: 70, 3: 56 },
} as const;

/**
 * سکو. اگر تعدادِ نفراتِ سکو کمتر از سه باشد (مثلاً فقط دو مسجد مشارکت
 * داشته‌اند) همان تعداد کارت با چیدمانِ متقارن می‌آید — نه سه جای خالی.
 */
export function Podium({ rows }: { rows: PodiumRow[] }) {
  const leader = rows[0];
  if (!leader) return null;
  const runnerUp = rows[1];
  const count = Math.min(rows.length, 3);
  /* چیدمانِ بصری: با سه کارت، قهرمان وسط می‌نشیند (۲-۱-۳). با دو کارت،
     قهرمان سمتِ راست (شروع در RTL) و نفرِ دوم کنارش. */
  const visual = (
    count === 3 ? [rows[1], rows[0], rows[2]] : count === 2 ? [rows[0], rows[1]] : [rows[0]]
  ).filter((r): r is PodiumRow => r !== undefined);

  /* اختلافِ صدر با نفرِ بعد — فقط اگر رقیبی با عددِ واقعی باشد. */
  const leadGap =
    runnerUp && runnerUp.completed < leader.completed ? leader.completed - runnerUp.completed : 0;

  return (
    <section aria-labelledby="podium-heading" className="mt-6">
      <h2 id="podium-heading" className="sr-only">
        سکوی افتخار
      </h2>

      {/* ── تبلت و دسکتاپ: سکوی کلاسیک ۲-۱-۳ ── */}
      <div
        className={`hidden items-end gap-3 pt-3 sm:grid ${
          count === 3
            ? "grid-cols-3"
            : count === 2
              ? "mx-auto grid-cols-2 sm:max-w-xl"
              : "mx-auto grid-cols-1 sm:max-w-sm"
        }`}
      >
        {visual.map((row, i) => (
          <PlaceCard
            key={row.id}
            row={row}
            place={row.rank === 1 ? 1 : row.rank === 2 ? 2 : 3}
            index={i}
            hero={count === 3 && i === 1}
            leadGap={row.rank === 1 ? leadGap : 0}
            layout="desktop"
          />
        ))}
      </div>

      {/* ── موبایل/فولدبل: قهرمان تمام‌عرض، نفرِ دوم و سوم کنارِ هم ── */}
      <div className="pt-2 sm:hidden">
        <PlaceCard
          row={leader}
          place={leader.rank === 1 ? 1 : leader.rank === 2 ? 2 : 3}
          index={0}
          hero
          leadGap={leadGap}
          layout="mobile"
        />
        {rows.length > 1 ? (
          /* فقط یک کارتِ دوم (سکوی دو نفره) ⇒ تمام‌عرض؛ دو کارت ⇒ کنارِ هم. */
          <div
            className={`mt-2 grid gap-2 ${
              rows.length === 2 ? "grid-cols-1" : "grid-cols-1 min-[360px]:grid-cols-2"
            }`}
          >
            {rows.slice(1, 3).map((row, i) => (
              <PlaceCard
                key={row.id}
                row={row}
                place={row.rank === 2 ? 2 : 3}
                index={i + 1}
                leadGap={0}
                layout="mobile"
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* کفِ سکو — خطِ افقی که سه قدمگاه را به یک سازه وصل می‌کند؛ در موبایل
          نه، چون کارت‌ها زیرِ هم می‌آیند و «کف» معنایی ندارد. */}
      <div
        aria-hidden="true"
        className="via-border-strong/70 mt-2 mb-5 hidden h-px bg-gradient-to-l from-transparent to-transparent sm:block"
      />
    </section>
  );
}

/**
 * یک جایگاه: کارتِ محتوا + ستونِ قدمگاه.
 * `layout` فقط چگالیِ موبایل/دسکتاپ را عوض می‌کند؛ داده یکی است.
 */
function PlaceCard({
  row,
  place,
  index,
  hero = false,
  leadGap,
  layout,
}: {
  row: PodiumRow;
  place: 1 | 2 | 3;
  index: number;
  hero?: boolean;
  leadGap: number;
  layout: "mobile" | "desktop";
}) {
  const accent = ACCENT[place];
  const desktop = layout === "desktop";
  const monument = desktop ? MONUMENT.desktop[place] : MONUMENT.mobile[place];
  /* عرضِ نوارِ سهم: صفر یعنی بدونِ نوار؛ بقیه حداقلِ ۵٪ تا دیده شود. */
  const barWidth = row.completed > 0 ? Math.max(5, Math.min(100, row.share)) : 0;

  const surface =
    place === 1
      ? "border-gold/50 bg-gold-soft/70"
      : place === 2
        ? "border-border-strong/50 bg-surface"
        : "border-brick/30 bg-brick-soft/45";

  const chip =
    place === 1
      ? "border-gold/60 bg-gold text-on-gold"
      : place === 2
        ? "border-border-strong/60 bg-surface-2 text-text"
        : "border-brick/35 bg-brick-soft text-brick";

  return (
    <article
      aria-label={`${LABEL[place]}${row.tied ? " (مشترک)" : ""}: ${row.name}`}
      className={`k185-podium-card flex flex-col justify-end ${
        hero ? "k185-podium-hero z-10" : ""
      }`}
      style={
        {
          "--podium-delay": `${index * 110}ms`,
          "--podium-accent": accent,
        } as React.CSSProperties
      }
    >
      {/* ═══ کارتِ محتوا ═══ */}
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-[0_18px_36px_-28px_oklch(30%_0.05_260/0.55)] ${surface} ${
          hero ? "pb-3" : "pb-2.5"
        }`}
      >
        {/* درخششِ دوره‌ای — فقط رویِ قهرمان */}
        {hero ? <span aria-hidden="true" className="k185-podium-sheen" /> : null}

        {/* نوارِ بالای کارت — جایگاه و نشانِ «مشترک» */}
        <div className="flex items-center justify-between gap-2 px-2.5 pt-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold whitespace-nowrap ${chip}`}
          >
            {place === 1 ? (
              <svg
                viewBox="0 0 24 24"
                width="10"
                height="10"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M3 8.6 5.9 17h12.2L21 8.6l-4.7 3.2L12 5.4 7.7 11.8z" />
              </svg>
            ) : null}
            {row.tied ? `${LABEL[place]} · مشترک` : LABEL[place]}
          </span>
          <span className="text-text-subtle/70 flex items-center gap-1 text-[9px] font-bold tabular-nums">
            <span dir="ltr" className="tracking-tight">
              {row.code}
            </span>
          </span>
        </div>

        {/* مدال + نشانِ مسجد */}
        <div className={`flex flex-col items-center px-2.5 ${desktop ? "pt-2" : "pt-1.5"}`}>
          <span className="k185-podium-medal relative grid place-items-center">
            {place === 1 ? (
              <span
                aria-hidden="true"
                className="k185-podium-crown text-gold-strong absolute -top-4"
              >
                <svg viewBox="0 0 24 16" width="26" height="17" fill="currentColor">
                  <path d="M1 14 3.2 4.6l4.1 3.6L12 1l4.7 7.2 4.1-3.6L23 14z" />
                </svg>
                {/* چهار جرقهٔ گره‌ای — نبضِ آرام دورِ تاج */}
                <span className="k185-spark absolute -top-1 -left-3.5 size-1 rounded-full bg-current" />
                <span className="k185-spark absolute -top-2 -right-3 size-[3px] rounded-full bg-current" />
                <span className="k185-spark absolute top-1.5 -left-5 size-[2px] rounded-full bg-current" />
                <span className="k185-spark absolute top-2 -right-5 size-1 rounded-full bg-current" />
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className="k185-podium-halo absolute inset-0 rounded-full blur-[7px]"
              style={{
                background: `radial-gradient(circle, color-mix(in oklab, ${accent} 55%, transparent), transparent 70%)`,
              }}
            />
            <MosqueMark
              name={row.name}
              initialOverride={row.initial || mosqueInitial(row.name)}
              size={desktop ? (hero ? 46 : 38) : hero ? 44 : 34}
            />
          </span>

          <p
            className={`text-text mt-1.5 text-center leading-tight font-extrabold ${
              desktop
                ? hero
                  ? "line-clamp-2 min-h-[2.3em] text-[12.5px]"
                  : "line-clamp-2 min-h-[2.3em] text-[11.5px]"
                : hero
                  ? "line-clamp-2 text-[12.5px]"
                  : "line-clamp-1 text-[11px]"
            }`}
          >
            {row.name}
          </p>

          {/* عددِ اصلی — بزرگ‌ترین عددِ صفحه، حقِ قهرمان */}
          <p className="text-text mt-1 flex items-baseline justify-center gap-1 tabular-nums">
            <span
              className={`font-extrabold ${hero ? "text-[26px] leading-none" : "text-[19px] leading-none"} ${
                place === 1 ? "text-gold-strong" : ""
              }`}
            >
              {toFa(row.completed)}
            </span>
            <span className="text-text-subtle text-[9px]">شرکت‌کننده</span>
          </p>

          {/* نوارِ سهم — باریک، به‌رنگِ جایگاه */}
          <div className="mt-1.5 flex w-full items-center gap-1.5">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--c-text)_13%,transparent)]">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${barWidth}%`,
                  background:
                    place === 1
                      ? "linear-gradient(to left, var(--c-gold-strong), var(--c-gold))"
                      : place === 2
                        ? "linear-gradient(to left, var(--c-text-subtle), var(--c-border-strong))"
                        : "linear-gradient(to left, var(--c-brick), color-mix(in oklab, var(--c-brick) 45%, transparent))",
                }}
              />
            </span>
            <span className="text-text-subtle shrink-0 text-[9px] tabular-nums">
              {faPercent(row.share, 0)}
            </span>
          </div>

          {/* اختلاف با نفرِ بعد — فقط با دادهٔ واقعی */}
          {leadGap > 0 ? (
            <p className="text-text-muted mt-1.5 text-center text-[9.5px] leading-tight">
              <span className="text-gold-strong font-extrabold">+{toFa(leadGap)}</span> نفر جلوتر از
              نفرِ دوم
            </p>
          ) : row.tied && row.rank === 1 ? (
            <p className="text-text-muted mt-1.5 text-center text-[9px] leading-tight sm:text-[9.5px]">
              صدر مشترک
            </p>
          ) : null}
        </div>
      </div>

      {/* ═══ قدمگاه ═══
          عمداً **باریک‌تر از کارت** و با فاصلهٔ ۴px زیرِ آن: اگر هم‌عرضِ کارت و
          چسبیده باشد، شبیهِ یک کادرِ خالیِ ادامهٔ کارت دیده می‌شود. باریک و
          جدا، «پایه‌ای» است که کارت رویش نشسته. */}
      <div
        className={`k185-podium-monument mx-auto mt-1 flex items-center justify-center ${
          desktop ? "w-[68%]" : "w-[36%]"
        }`}
        style={{ height: monument }}
        aria-hidden="true"
      >
        <span className="k185-plinth-cap" />
        <span
          className="relative mt-1 font-extrabold tabular-nums"
          style={{
            fontSize: desktop ? 27 : 14,
            lineHeight: 1,
            color: `color-mix(in oklab, ${accent} 62%, var(--c-surface))`,
          }}
        >
          {ORDINAL[place]}
          <span
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 opacity-45"
            style={{ color: `color-mix(in oklab, ${accent} 75%, var(--c-text))` }}
          >
            <Girih size={desktop ? 9 : 7} />
          </span>
        </span>
      </div>
    </article>
  );
}

/** پیامِ یک‌خطیِ پیشتاز — با احترام به تساوی (بی‌ساختگی). */
export function LeaderLine({ leader, runnerUp }: { leader: PodiumRow; runnerUp?: PodiumRow }) {
  return (
    <p className="border-gold/30 bg-gold-soft/70 text-text mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11.5px] leading-6 sm:items-center">
      <span aria-hidden="true" className="mt-1.5 shrink-0 sm:mt-0">
        <Girih size={14} className="text-gold-strong" />
      </span>
      <span>
        پیشتاز: <strong className="font-extrabold">{leader.name}</strong> با{" "}
        {toFa(leader.completed)} شرکت‌کننده
        {runnerUp && runnerUp.completed > 0 ? (
          <>
            {" · "}
            {leader.completed === runnerUp.completed ? (
              <>
                در صدر با <strong className="font-extrabold">{runnerUp.name}</strong> شریک است
              </>
            ) : (
              <>
                با اختلافِ {toFa(leader.completed - runnerUp.completed)} نفر از{" "}
                <strong className="font-extrabold">{runnerUp.name}</strong>
              </>
            )}
          </>
        ) : null}
      </span>
    </p>
  );
}
