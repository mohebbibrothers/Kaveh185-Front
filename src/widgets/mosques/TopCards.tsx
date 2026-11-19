"use client";

import { Girih, MosqueMark } from "@/shared/ui/Ornament";
import { faPercent, toFa } from "@/shared/lib/fa";
import { mosqueInitial } from "@/shared/lib/mosque-rank";

/**
 * سه کارتِ صدرِ جدولِ رتبه‌بندی مساجد.
 *
 * ═══ چه چیزی عوض شد و چرا؟ ═══════════════════════════════════════════════
 * نسخهٔ پیشین یک «سکوی سنگی» بود: زیرِ هر کارت یک پلینت با بافتِ سنگ و
 * شمارهٔ جایگاه می‌نشست. ایرادش دیداری بود، نه فنی: آن پلینت‌ها سه مستطیلِ
 * خاکستریِ خالی زیرِ کارت‌های رنگی بودند و صفحه را «نیمه‌کاره» نشان می‌داد —
 * دقیقاً همان چیزی که کاربر دید. حالا **هیچ سازه‌ای زیرِ کارت‌ها نیست**؛
 * خودِ کارت، جایگاه را نشان می‌دهد:
 *
 *   • قهرمان: قابِ طلاییِ روشن‌تر، تاج، مدالِ شناور با هالهٔ نبض‌دار، نوارِ
 *     درخششِ دوره‌ای و عددِ درشت‌تر. جایگاهِ نخست همیشه تنهاست (تساویِ صدر
 *     هم ممکن است، آن‌وقت هر دو «جایگاه نخست · مشترک» می‌گیرند).
 *   • جایگاهِ دوم و سوم: قابِ نقره‌ای/برنزی، مدالِ همان جنس، عددِ کوچک‌تر.
 *
 * مهم‌تر از همه: جایگاه‌ها **گروهی** هستند. اگر دو مسجد در جایگاهِ دوم
 * هم‌امتیاز باشند، هر دو در همان کارت و با همان رنگ دیده می‌شوند و جایگاهِ
 * سوم هم به‌جای خودش می‌ماند (قاعده در `groupPlaces`). هر کارت حداکثر سه
 * مسجد را نشان می‌دهد و بقیه با «+N مسجدِ دیگر» شمرده می‌شوند.
 *
 * حرکت‌ها همه در `globals.css` (`k185-podium-*`): بالا آمدنِ پله‌ای، درخشش،
 * شناوربودنِ مدال و جرقه‌های گره‌ای — همه با `transform/opacity`، بدونِ JS و
 * با `prefers-reduced-motion` خاموش.
 */

/** یک ردیفِ رتبه‌بندی‌شده — همان شکلِ خروجیِ `assignRanks` + `markTies`. */
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

/** قاعده‌های سطحِ کارت — یک‌جا، تا سه جایگاه از هم جدا نشوند. */
const CARD_SURFACE: Record<1 | 2 | 3, string> = {
  1: "border-gold/55 from-gold-soft/85 to-gold-soft/35 shadow-[0_22px_48px_-30px_oklch(52%_0.09_78/0.55)]",
  2: "border-border-strong/60 from-surface to-surface-2/45 shadow-[0_18px_38px_-30px_oklch(30%_0.05_260/0.5)]",
  3: "border-brick/30 from-brick-soft/60 to-brick-soft/20 shadow-[0_18px_38px_-30px_oklch(40%_0.08_30/0.4)]",
};

const CHIP: Record<1 | 2 | 3, string> = {
  1: "border-gold/60 bg-gold text-on-gold",
  2: "border-border-strong/70 bg-surface-2 text-text",
  3: "border-brick/40 bg-brick-soft text-brick",
};

/**
 * سه کارتِ صدر.
 * `groups` از `groupPlaces` می‌آید: هر عضو یک جایگاه و مساجدِ هم‌رتبه‌اش.
 */
export function TopCards({ groups }: { groups: { place: number; rows: PodiumRow[] }[] }) {
  const first = groups[0];
  if (!first) return null;
  const leader = first.rows[0];
  if (!leader) return null;

  const placeOf = (g: { place: number }): 1 | 2 | 3 => (g.place === 1 ? 1 : g.place === 2 ? 2 : 3);
  const runnerUp = groups.find((g) => g.place > 1)?.rows[0];
  /* اختلافِ صدر با نزدیک‌ترین رقیب — فقط با دادهٔ واقعی. */
  const leadGap =
    runnerUp && runnerUp.completed < leader.completed ? leader.completed - runnerUp.completed : 0;

  /** ردیفِ کارت با نوشتهٔ واقعیِ داده. */
  const Row = ({
    row,
    place,
    dense = false,
  }: {
    row: PodiumRow;
    place: 1 | 2 | 3;
    dense?: boolean;
  }) => (
    <div className="flex items-center gap-2.5">
      <span className="k185-podium-medal relative grid shrink-0 place-items-center">
        {place === 1 ? (
          <span aria-hidden="true" className="k185-podium-crown text-gold-strong absolute -top-3.5">
            <svg viewBox="0 0 24 16" width="22" height="15" fill="currentColor">
              <path d="M1 14 3.2 4.6l4.1 3.6L12 1l4.7 7.2 4.1-3.6L23 14z" />
            </svg>
            <span className="k185-spark absolute -top-1 -left-3 size-1 rounded-full bg-current" />
            <span className="k185-spark absolute -top-1.5 -right-2.5 size-[3px] rounded-full bg-current" />
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="k185-podium-halo absolute inset-0 rounded-full blur-[7px]"
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, ${ACCENT[place]} 55%, transparent), transparent 70%)`,
          }}
        />
        <MosqueMark
          name={row.name}
          initialOverride={row.initial || mosqueInitial(row.name)}
          size={dense ? 30 : place === 1 ? 42 : 36}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`text-text block leading-tight font-extrabold ${
            dense ? "line-clamp-1 text-[11.5px]" : "line-clamp-2 text-[12.5px]"
          }`}
        >
          {row.name}
        </span>
        {/* «مشترک» را کنارِ خودِ نام می‌گذاریم، نه با «·» جلوی کد؛ چسبیدنِ
            خط‌تیره به کد، آن را شبیهِ بخشی از کد می‌کرد. */}
        <span className="text-text-subtle mt-0.5 flex items-center gap-1.5 text-[9.5px] tabular-nums">
          {row.tied ? (
            <span className="text-gold-strong font-bold whitespace-nowrap">هم‌رتبه</span>
          ) : null}
          {row.tied ? (
            <span
              aria-hidden="true"
              className="bg-border-strong inline-block size-1 rounded-full"
            />
          ) : null}
          <span dir="ltr" className="tracking-tight">
            {row.code}
          </span>
        </span>
      </span>

      <span className="shrink-0 text-left tabular-nums">
        <span
          className={`block leading-none font-extrabold ${
            dense ? "text-[15px]" : place === 1 ? "text-[24px]" : "text-[19px]"
          }`}
          style={{ color: place === 1 ? "var(--c-gold-strong)" : "var(--c-text)" }}
        >
          {toFa(row.completed)}
        </span>
        <span className="text-text-subtle mt-0.5 block text-[9px]">شرکت‌کننده</span>
      </span>
    </div>
  );

  return (
    <section aria-labelledby="top-cards-heading" className="mt-6">
      <h2 id="top-cards-heading" className="sr-only">
        سه جایگاهِ نخست
      </h2>

      {/* `items-stretch` + ارتفاعِ برابر: سه کارت با تعدادِ ردیفِ متفاوت
          نباید لبه‌های ناهم‌تراز بسازند؛ اختلافِ جایگاه از قاب و رنگ می‌آید،
          نه از بلندیِ اتفاقیِ محتوا. */}
      <div
        className={`grid items-stretch gap-2.5 ${
          groups.length > 1 ? "sm:grid-cols-3" : "mx-auto max-w-sm"
        }`}
      >
        {groups.map((group, index) => {
          const place = placeOf(group);
          const shownRows = group.rows.slice(0, 3);
          const hidden = group.rows.length - shownRows.length;
          return (
            <article
              key={group.place}
              aria-label={`${LABEL[place]}${group.rows.length > 1 ? " (مشترک)" : ""}: ${group.rows
                .map((r) => r.name)
                .join("، ")}`}
              className={`k185-podium-card relative isolate flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-b ${
                CARD_SURFACE[place]
              } ${groups.length > 1 ? "sm:order-2" : ""} ${
                place === 2 && groups.length > 2 ? "sm:order-1" : ""
              } ${place === 3 ? "sm:order-3" : ""} ${place === 1 ? "k185-podium-hero" : ""}`}
              style={{ "--podium-delay": `${index * 110}ms` } as React.CSSProperties}
            >
              {place === 1 ? <span aria-hidden="true" className="k185-podium-sheen" /> : null}
              {/* خطِ رنگیِ بالای کارت — امضای جایگاه، بی‌آنکه ارتفاعی به صفحه اضافه کند. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: `linear-gradient(to left, transparent, ${ACCENT[place]}, transparent)`,
                }}
              />

              <div
                className={`flex flex-1 flex-col ${
                  place === 1 ? "px-3.5 pt-4 pb-3.5" : "px-3 pt-3.5 pb-3"
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-extrabold whitespace-nowrap ${CHIP[place]}`}
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
                    {group.rows.length > 1 ? `${LABEL[place]} · مشترک` : LABEL[place]}
                  </span>
                  {/* «تنها صدرنشین» پایین‌تر، زیرِ نوار، گفته می‌شود؛ این‌جا
                      تکرارش فقط شلوغی می‌ساخت. */}
                </div>

                <div className="space-y-2">
                  {shownRows.map((row, i) => (
                    <div
                      key={row.id}
                      className={
                        i > 0 ? "border-border/70 border-t [border-top-style:dashed] pt-2" : ""
                      }
                    >
                      <Row row={row} place={place} dense={i > 0} />
                    </div>
                  ))}
                </div>

                {hidden > 0 ? (
                  <p className="text-text-subtle mt-1.5 text-[9.5px]">
                    {toFa(hidden)} مسجدِ دیگر هم در همین جایگاه
                  </p>
                ) : null}

                {/* نوارِ سهم — باریک، به‌رنگِ جایگاه */}
                <div className="mt-auto flex items-center gap-1.5 pt-2.5">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--c-text)_13%,transparent)]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${leader.completed > 0 ? Math.max(5, Math.min(100, shownRows[0]?.share ?? 0)) : 0}%`,
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
                    {faPercent(shownRows[0]?.share ?? 0, 0)}
                  </span>
                </div>

                {/* فقط قهرمان: فاصله با نزدیک‌ترین رقیب (یا اعلامِ صدرِ مشترک) */}
                {place === 1 ? (
                  <p className="text-text-muted mt-2 text-[9.5px] leading-tight">
                    {leadGap > 0 ? (
                      <>
                        <span className="text-gold-strong font-extrabold">+{toFa(leadGap)}</span>{" "}
                        نفر جلوتر از نفرِ دوم
                      </>
                    ) : group.rows.length > 1 ? (
                      "صدر مشترک"
                    ) : (
                      "تنها صدرنشین؛ رقیبی هم‌امتیاز ندارد"
                    )}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
