"use client";

import { useMemo, useState } from "react";
import { useBootstrap } from "@/shared/api/use-bootstrap";
import { MosqueMark, Girih, Medal } from "@/shared/ui/Ornament";
import { toEn, toFa, toSearch, faPercent } from "@/shared/lib/fa";
import { assignRanks, mosqueCoreName, mosqueInitial } from "@/shared/lib/mosque-rank";

/**
 * جدولِ رقابتیِ مساجد.
 *
 * ═══ چرا این صفحه بازنویسی شد؟ (نکته‌های ۱ تا ۴ دورِ ۲۲) ═══════════════════
 *
 *  ۱) **فیلترِ ترتیب حذف شد.** سه دکمهٔ «ترتیب حوزه / بیشترین مشارکت / الفبا»
 *     سه چیدمانِ متفاوت برای یک داده بود و کاربر را مجبور می‌کرد انتخاب کند
 *     که کدام «رتبه‌بندیِ رسمی» است. یک جدولِ رقابتی باید **یک** ترتیبِ
 *     قطعی داشته باشد: تعدادِ شرکت‌کنندهٔ کامل (نزولی) و در تساوی، الفبای
 *     نامِ مسجد (صعودی). این دقیقاً همان قاعده‌ای است که در `mosque-rank.ts`
 *     پیاده و تست شده است.
 *
 *  ۲) **حرفِ نشان از نامِ هسته می‌آید، نه از «مسجد».** قبلاً همه «م» می‌شدند
 *     چون نام‌ها با «مسجد» شروع می‌شوند؛ حالا «صاحب‌الزمان» → «ص»،
 *     «امیرالمؤمنین» → «ا»، «شهدا» → «ش».
 *
 *  ۳) **موبایل کارت می‌گیرد، نه جدولِ فشرده.** زیرِ `lg` هر مسجد یک کارتِ
 *     مستقل با نوارِ پیشرفت و اعدادِ برچسب‌دار است؛ جدولِ سه‌ستونی فقط از
 *     `lg` به بالا (جایی که واقعاً جا دارد) ظاهر می‌شود. این کار «در‌هم‌ریختگی»
 *     فولدبل را ساختاراً حذف می‌کند، نه با فونتِ کوچک‌تر.
 *
 *  ۴) **حسِ رقابت:** سکوی سه‌نفرهٔ افتخار (پودیومِ ۲-۱-۳) + مدالِ طلا/نقره/
 *     برنز روی نشانِ سه رتبهٔ اول + نوارِ سهم از مشارکت‌ها + «رتبهٔ مشترک» برای
 *     تساوی + نشانِ «پیشتاز» و «در تعقیب». همه با توکن‌های تم، پس در شب هم
 *     کلاسیک می‌ماند.
 *
 * ── اصلِ صداقتِ داده (بی‌تغییر) ─────────────────────────────────────────────
 * هر عدد از `leaderboard` همان پاسخ API می‌آید. مسجدی که در جدول نیست،
 * صفرِ *واقعی* دارد. تا پاسخ نرسیده، جای عدد «—» است. مساجدِ صفر در
 * «ردهٔ آغاز» با رتبهٔ «—» فهرست می‌شوند (نه رتبهٔ قلابی).
 */
type Row = {
  id: number;
  name: string;
  code: string;
  neighborhood: string;
  order: number;
  completed: number;
  registered: number;
  share: number;
  /** حرفِ نشان از سرور (اگر بک‌اند تازه مستقر شده باشد). */
  initial?: string;
};

type Ranked = Row & { rank: number; tied: boolean };

const TONE_BY_PLACE = {
  1: {
    rail: "from-gold/70 via-gold/35 to-transparent",
    chip: "bg-gold text-on-gold",
    surface: "border-gold/45 bg-gold-soft",
  },
  2: {
    rail: "from-border-strong/60 via-border-strong/30 to-transparent",
    chip: "bg-surface-2 text-text ring-1 ring-border-strong/60",
    surface: "border-border-strong/45 bg-surface-2",
  },
  3: {
    rail: "from-brick/45 via-brick/25 to-transparent",
    chip: "bg-brick-soft text-brick ring-1 ring-brick/25",
    surface: "border-brick/25 bg-brick-soft",
  },
} as const;

export function MosquesDirectory() {
  const state = useBootstrap();
  const [q, setQ] = useState("");

  const rows = useMemo<Row[]>(() => {
    if (state.phase !== "ready") return [];
    const byId = new Map(state.data.leaderboard.leaderboard.map((e) => [e.mosque_id, e]));
    /* سهم از کل = «سهمِ این مسجد از مجموعِ شرکت‌کنندگانِ کاملِ همهٔ مساجد».
       منبعِ اول: `participation_share_percent` از سرور (همان عددی که API
       می‌دهد)؛ اگر بک‌اندِ قدیمی آن را نداشت، همان فرمول محلی محاسبه می‌شود.
       ⚠️ این عدد با `target_progress_percent` (درصدِ رسیدن به هدفِ ۵۰۰ نفری)
       یکی نیست — آن معیارِ دیگری است و در این جدول استفاده نمی‌شود. */
    const total = state.data.leaderboard.total_completed_participants;
    return state.data.mosques.map((m, i) => {
      const e = byId.get(m.id);
      const completed = e?.completed_participants_count ?? m.completed_participants_count ?? 0;
      return {
        id: m.id,
        name: m.name,
        code: m.code,
        neighborhood: m.neighborhood,
        order: m.display_order ?? i + 1,
        completed,
        registered: e?.registered_users_count ?? 0,
        share: e?.participation_share_percent ?? (total > 0 ? (completed / total) * 100 : 0),
        initial: e?.initial,
      };
    });
  }, [state]);

  /** رتبه‌بندیِ رسمی: تعداد شرکت‌کننده ↓ سپس الفبا ↑ (رتبهٔ مشترک در تساوی). */
  const ranked = useMemo<Ranked[]>(() => assignRanks(rows), [rows]);

  const shown = useMemo(() => {
    const needle = toEn(q).trim().replace(/\s+/g, " ");
    if (!needle) return ranked;
    const n = toSearch(needle);
    return ranked.filter((r) =>
      [r.name, r.neighborhood, r.code, String(r.order), mosqueCoreName(r.name)].some((f) =>
        toSearch(f).includes(n),
      ),
    );
  }, [ranked, q]);

  const anyParticipation = rows.some((r) => r.completed > 0);
  const totalCompleted = rows.reduce((s, r) => s + r.completed, 0);
  const activeCount = rows.filter((r) => r.completed > 0).length;

  /* سه رتبهٔ اول — فقط اگر واقعاً مشارکتی هست (سکوی افتخار با صفر معنا ندارد) */
  const podium = anyParticipation ? ranked.filter((r) => r.rank > 0).slice(0, 3) : [];
  const podiumIds = new Set(podium.map((p) => p.id));
  /** ستون‌های سکو به ترتیب بصری ۲-۱-۳ (مرکز، بلندترین). */
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);

  const rest = shown.filter((r) => !podiumIds.has(r.id) || q.length > 0);
  const leader = podium[0];
  const runnerUp = podium[1];

  return (
    <div className="mt-6">
      {/* ── نوار ابزار: فقط جست‌وجو (فیلترهای ترتیب حذف شدند) ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">جست‌وجوی مسجد</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-text-subtle pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
            inputMode="search"
            placeholder="نام مسجد، محله یا کد…"
            className="border-border-strong bg-surface text-text placeholder:text-text-subtle focus:border-brand/50 focus:ring-brand/15 h-10 w-full rounded-xl border pr-9 pl-3 text-[12.5px] outline-none focus:ring-2"
          />
        </label>

        <p className="text-text-subtle text-[11.5px]" aria-live="polite">
          {state.phase === "ready" ? (
            <>
              {toFa(shown.length)} از {toFa(rows.length)} مسجد
              <span className="hidden sm:inline">
                {" · "}
                {anyParticipation
                  ? `${toFa(activeCount)} مسجد با مشارکت · ${toFa(totalCompleted)} شرکت‌کنندهٔ کامل`
                  : "رقابت هنوز شروع نشده"}
              </span>
            </>
          ) : state.phase === "loading" ? (
            "در حال دریافت فهرست از سامانه…"
          ) : (
            "فهرست از سامانه خوانده نشد — صفحه را دوباره باز کنید."
          )}
        </p>
      </div>

      {/* ── سکوی افتخار ────────────────────────────────────────────────────
          دو چیدمان از یک داده:
            • زیرِ `sm`: سه کارتِ ۹۰ پیکسلی به هم می‌چسبند؛ پس **قهرمان**
              تمام‌عرض و برجسته می‌شود و نفر دوم/سوم زیرش کنارِ هم می‌آیند —
              همان سلسله‌مراتبی که چشم انتظارش است.
            • از `sm` به بالا: سکوی کلاسیک ۲-۱-۳ با کارتِ مرکزیِ بلندتر. */}
      {podium.length > 0 && q.length === 0 ? (
        <section aria-label="سکوی افتخار" className="mt-6">
          {/* موبایل */}
          <div className="pt-4 sm:hidden">
            {podium[0] ? <PodiumCard place={1} row={podium[0]} hero /> : null}
            {podium.length > 1 ? (
              <div className="mt-2 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                {podium.slice(1, 3).map((p, i) => (
                  <PodiumCard key={p.id} place={i === 0 ? 2 : 3} row={p} />
                ))}
              </div>
            ) : null}
          </div>
          {/* تبلت و دسکتاپ */}
          <div className="hidden grid-cols-3 items-end gap-3 pt-5 sm:grid">
            {podiumOrder.map((idx, visual) => {
              const p = podium[idx];
              if (!p) return null;
              const place: 1 | 2 | 3 = p.rank === 1 ? 1 : p.rank === 2 ? 2 : 3;
              return (
                <PodiumCard
                  key={p.id}
                  place={place}
                  row={p}
                  hero={visual === 1 && podium.length === 3}
                />
              );
            })}
          </div>
          <div
            aria-hidden="true"
            className="via-border-strong/50 mt-3 h-px bg-gradient-to-l from-transparent to-transparent"
          />
        </section>
      ) : null}

      {/* ── پیامِ پیشتاز/تعقیب — یک جمله، نه جدول ── */}
      {leader && q.length === 0 ? (
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
                  <>با {strongName(runnerUp.name)} در صدر شریک است</>
                ) : (
                  <>
                    {" "}
                    با اختلافِ {toFa(leader.completed - runnerUp.completed)} نفر از{" "}
                    {strongName(runnerUp.name)}
                  </>
                )}
              </>
            ) : null}
          </span>
        </p>
      ) : null}

      {/* ── کلیدِ رتبه‌بندی — شفاف و یک‌خطی ── */}
      <div className="text-text-subtle mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
          رتبه‌بندی: تعداد شرکت‌کنندهٔ کامل ↓
        </span>
        <span aria-hidden="true" className="bg-border-strong hidden h-3 w-px sm:block" />
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="bg-gold-strong size-1.5 rounded-full" />
          در تساوی: ترتیب الفبای نام مسجد ↑
        </span>
        <span aria-hidden="true" className="bg-border-strong hidden h-3 w-px sm:block" />
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="bg-brand size-1.5 rounded-full" />
          «سهم از مشارکت‌ها» = شرکت‌کنندگانِ این مسجد ÷ مجموعِ شرکت‌کنندگانِ همهٔ مساجد
        </span>
      </div>

      {/* ── فهرست ── */}
      <div className="border-border bg-surface mt-2.5 overflow-hidden rounded-2xl border">
        {/* سرستون — فقط از lg به بالا (جایی که جدول واقعاً جا دارد) */}
        <div className="border-border text-text-subtle hidden border-b px-4 py-2.5 text-[10.5px] font-bold lg:grid lg:grid-cols-[56px_1fr_132px_92px_110px] lg:items-center lg:gap-3">
          <span className="text-center">رتبه</span>
          <span>مسجد</span>
          <span className="text-center">شرکت‌کنندهٔ کامل</span>
          <span className="text-center">ثبت‌نامی</span>
          <span className="text-center">سهم از مشارکت‌ها</span>
        </div>

        {rows.length === 0 ? (
          <EmptyRow phase={state.phase} />
        ) : shown.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Girih size={22} className="text-text-subtle mx-auto" />
            <p className="text-text mt-3 text-[13px] font-extrabold">مسجدی با این نشانه پیدا نشد</p>
            <p className="text-text-muted mt-1 text-[12px]">
              املای نام یا شمارهٔ کد را بررسی کنید، یا جست‌وجو را پاک کنید.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
              }}
              className="border-border-strong text-text hover:bg-surface-2 mt-3 h-9 rounded-lg border px-3 text-[12px] font-bold"
            >
              پاک کردن جست‌وجو
            </button>
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {rest.map((r) => (
              <RowItem key={r.id} row={r} />
            ))}
          </ul>
        )}
      </div>

      {/* ── فراخوانِ رقابتی (دادهٔ واقعی، بدونِ ادعای ساختگی) ── */}
      <a
        href="/register"
        className="group border-brand/25 bg-brand/[0.045] hover:border-brand/45 hover:bg-brand/[0.08] mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors"
      >
        <span className="min-w-0">
          <span className="text-text block text-[12.5px] font-extrabold">
            نامِ مسجدت را بالای جدول ببر
          </span>
          <span className="text-text-muted mt-0.5 block text-[11px] leading-5">
            ثبت‌نام با کد ملی، انتخاب مسجد و شرکت در آزمون — همه در یک مسیر.
          </span>
        </span>
        <span className="bg-brand text-on-brand grid size-9 shrink-0 place-items-center rounded-xl transition-transform group-hover:-translate-x-0.5">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </a>

      {/* ── پانویسِ صادقانه ── */}
      <p className="text-text-subtle mt-3 text-[11px] leading-6">
        «شرکت‌کنندهٔ کامل» یعنی کسی که آزمونش را تا انتها فرستاده است؛ ثبت‌نامِ بدون شرکت در شمارشِ
        کامل نمی‌آید. مساجدِ بی‌مشارکت با رتبهٔ «—» در پایانِ فهرست می‌آیند و به‌ترتیبِ الفبا مرتب‌اند.
        «سهم از مشارکت‌ها» می‌گوید هر مسجد چه بخشی از کلِ شرکت‌کنندگانِ حوزه را به خود اختصاص داده است
        (مجموعِ همهٔ مساجد دقیقاً ۱۰۰٪ می‌شود) و با «درصدِ رسیدن به هدف» کاملاً متفاوت است.
      </p>
    </div>
  );
}

/**
 * یک کارتِ سکو. `hero` = قهرمانِ تمام‌عرض در موبایل یا کارتِ مرکزی در دسکتاپ.
 */
function PodiumCard({
  place,
  row,
  hero = false,
}: {
  place: 1 | 2 | 3;
  row: Ranked;
  hero?: boolean;
}) {
  const tone = TONE_BY_PLACE[place];
  return (
    <div
      className={`relative flex rounded-2xl border ${tone.surface} ${
        hero
          ? "items-center gap-3 px-3.5 pt-5 pb-4 text-start sm:flex-col sm:items-center sm:gap-0 sm:px-3 sm:pt-6 sm:pb-4 sm:text-center"
          : "flex-col items-center px-2 pt-3.5 pb-2.5 text-center max-[359px]:flex-row max-[359px]:items-center max-[359px]:gap-2.5 max-[359px]:px-3 max-[359px]:py-2.5 max-[359px]:text-start sm:px-3 sm:pt-5 sm:pb-3"
      } ${hero && place === 1 ? "sm:-translate-y-2" : ""}`}
    >
      {/* مدال — روی لبهٔ بالا، وسطِ کارت (در فولدبلِ باریک کنارِ نشان می‌نشیند) */}
      <span className="absolute -top-4 right-1/2 translate-x-1/2 drop-shadow-[0_2px_4px_oklch(30%_0.04_70/0.28)] max-[359px]:hidden">
        <Medal place={place} size={hero ? 32 : 26} />
      </span>

      {/* نشانِ مسجد — بی‌شمارهٔ رتبه، چون مدال و جایگاه همین را می‌گویند */}
      <div className="relative shrink-0">
        {/* در فولدبلِ خیلی باریک، کارت افقی می‌شود؛ مدال روی گوشهٔ نشان می‌نشیند
            تا نه روی حرفِ نشان بیفتد و نه ارتفاعِ کارت را زیاد کند. */}
        <span className="absolute -top-2 -left-2 z-10 hidden drop-shadow-[0_2px_4px_oklch(30%_0.04_70/0.28)] max-[359px]:block">
          <Medal place={place} size={22} />
        </span>
        <MosqueMark
          name={row.name}
          initialOverride={row.initial || mosqueInitial(row.name)}
          size={hero ? 54 : 36}
        />
      </div>

      <div className={hero ? "min-w-0 flex-1 sm:flex-none" : "min-w-0"}>
        <p
          className={`text-text mt-0 leading-tight font-extrabold ${
            hero
              ? "line-clamp-3 text-[13.5px] sm:mt-2 sm:line-clamp-2 sm:min-h-[2.4em] sm:text-[12.5px]"
              : "line-clamp-1 text-[11px] sm:text-[12px]"
          }`}
        >
          {row.name}
        </p>

        <p
          className={`text-text flex items-baseline gap-1 tabular-nums ${
            hero ? "mt-1 justify-start sm:justify-center" : "mt-1.5 justify-center"
          }`}
        >
          <span className={hero ? "text-[20px] font-extrabold" : "text-[15px] font-extrabold"}>
            {toFa(row.completed)}
          </span>
          <span className="text-text-subtle text-[9.5px]">شرکت‌کننده</span>
        </p>

        <span className="text-text-subtle mt-0.5 block text-[9.5px] tabular-nums max-[359px]:hidden">
          {faPercent(row.share, 0)} از مشارکت‌ها
        </span>
      </div>

      {hero ? (
        <span className="border-gold/40 text-gold-strong ms-auto flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-extrabold sm:absolute sm:top-3 sm:left-3 sm:ms-0">
          <Girih size={11} />
          پیشتاز
        </span>
      ) : null}
    </div>
  );
}

/** رنگِ نوارِ سهم بر اساسِ جایگاه (طلا/نقره/برنز/عادی). */
function barTone(place: 0 | 1 | 2 | 3): string {
  if (place === 1) return "from-gold to-gold-strong";
  if (place === 2) return "from-border-strong to-text-subtle";
  if (place === 3) return "from-brick to-brick-soft";
  return "from-brand/70 to-brand/35";
}

/** پهنای نوار: صفر = بدونِ نوار، بقیه حداقلِ ۴٪ تا دیده شود. */
function barWidth(row: Ranked): number {
  return row.completed > 0 ? Math.max(4, Math.min(100, row.share)) : 0;
}

function strongName(name: string) {
  return <strong className="font-extrabold">{name}</strong>;
}

/**
 * یک ردیف — **یک محتوا، دو چیدمان**:
 *   • زیرِ `lg`: کارتِ مستقل (نشان + نام + نوارِ سهم + دو عددِ برچسب‌دار)
 *   • از `lg` به بالا: ردیفِ گریدِ جدول با ستون‌های هم‌تراز
 * با این کار در موبایل/فولدبل هیچ ستونی فشرده یا بریده نمی‌شود.
 */
function RowItem({ row }: { row: Ranked }) {
  const place: 1 | 2 | 3 | 0 = row.rank === 1 ? 1 : row.rank === 2 ? 2 : row.rank === 3 ? 3 : 0;
  const tone = place > 0 ? TONE_BY_PLACE[place as 1 | 2 | 3] : null;

  const rowTint =
    place === 1
      ? "bg-gold-soft/35"
      : place === 2
        ? "bg-surface-2/60"
        : place === 3
          ? "bg-brick-soft/30"
          : "";

  return (
    <li className={`hover:bg-surface-2/50 relative transition-colors ${rowTint}`}>
      {tone ? (
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 start-0 w-[3px] bg-gradient-to-b ${tone.rail}`}
        />
      ) : null}
      {/* ═══ موبایل/تبلت ═══ */}
      <div className="flex items-start gap-3 px-3.5 py-3 lg:hidden">
        <div className="relative shrink-0">
          <MosqueMark
            name={row.name}
            initialOverride={row.initial || mosqueInitial(row.name)}
            size={38}
            rank={row.rank > 0 ? row.rank : undefined}
          />
          {place > 0 ? (
            <span className="absolute -bottom-1.5 -left-1.5">
              <Medal place={place as 1 | 2 | 3} size={17} />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-text text-[12.5px] leading-snug font-extrabold">{row.name}</p>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                row.rank > 0
                  ? (tone?.chip ?? "bg-surface-2 text-text-muted")
                  : "bg-surface-2 text-text-subtle"
              }`}
            >
              {row.rank > 0 ? `${toFa(row.rank)}${row.tied ? " مشترک" : ""}` : "—"}
            </span>
          </div>

          <p className="text-text-subtle mt-0.5 flex items-center gap-1.5 text-[10px]">
            <span dir="ltr" className="tabular-nums">
              {row.code}
            </span>
            {row.neighborhood ? (
              <>
                <span
                  aria-hidden="true"
                  className="bg-border-strong inline-block size-1 rounded-full"
                />
                <span className="truncate">{row.neighborhood}</span>
              </>
            ) : null}
          </p>

          {/* اعداد + نوارِ سهم در یک ردیف — بلندیِ ردیف کم، اطلاعات کامل */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-text-subtle shrink-0 text-[10px] tabular-nums">
              <strong className="text-text text-[11.5px] font-extrabold">
                {toFa(row.completed)}
              </strong>{" "}
              شرکت‌کننده
              <span
                aria-hidden="true"
                className="bg-border-strong mx-1 inline-block size-1 rounded-full align-middle"
              />
              {toFa(row.registered)} ثبت‌نامی
            </span>
            <span className="bg-surface-2 h-1.5 min-w-6 flex-1 overflow-hidden rounded-full">
              <span
                className={`block h-full rounded-full bg-gradient-to-l ${barTone(place)}`}
                style={{ width: `${barWidth(row)}%` }}
              />
            </span>
            <span className="text-text-subtle shrink-0 text-[10px] tabular-nums">
              {faPercent(row.share, 0)} از مشارکت‌ها
            </span>
          </div>
        </div>
      </div>

      {/* ═══ دسکتاپ ═══ */}
      <div className="hidden items-center gap-3 px-4 py-2.5 lg:grid lg:grid-cols-[56px_1fr_132px_92px_110px]">
        <div className="flex justify-center">
          {place > 0 ? (
            <span className={`grid size-7 place-items-center rounded-lg ${tone?.chip ?? ""}`}>
              <Medal place={place === 1 ? 1 : place === 2 ? 2 : 3} size={19} />
            </span>
          ) : (
            <span
              className={`grid size-7 place-items-center rounded-lg text-[11px] font-extrabold tabular-nums ${
                row.rank > 0 ? "bg-surface-2 text-text" : "text-text-subtle"
              }`}
            >
              {row.rank > 0 ? toFa(row.rank) : "—"}
            </span>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative shrink-0">
            <MosqueMark
              name={row.name}
              initialOverride={row.initial || mosqueInitial(row.name)}
              size={34}
              rank={row.rank > 0 ? row.rank : undefined}
            />
          </div>
          <div className="min-w-0">
            <p className="text-text flex items-center gap-1.5 truncate text-[12.5px] font-bold">
              {row.name}
              {row.tied ? (
                <span className="border-border-strong text-text-subtle shrink-0 rounded border px-1 text-[9px] font-bold">
                  مشترک
                </span>
              ) : null}
            </p>
            <p className="text-text-subtle flex items-center gap-1.5 text-[10px]">
              <span dir="ltr" className="tabular-nums">
                {row.code}
              </span>
              {row.neighborhood ? (
                <>
                  <span
                    aria-hidden="true"
                    className="bg-border-strong inline-block size-1 rounded-full"
                  />
                  <span className="truncate">{row.neighborhood}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="text-center">
          <span className="text-text block text-[13px] font-extrabold tabular-nums">
            {toFa(row.completed)}
          </span>
        </div>

        <div className="text-center">
          <span className="text-text-muted block text-[12px] tabular-nums">
            {toFa(row.registered)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-surface-2 h-1.5 flex-1 overflow-hidden rounded-full">
            <span
              className={`block h-full rounded-full bg-gradient-to-l ${barTone(place)}`}
              style={{ width: `${barWidth(row)}%` }}
            />
          </span>
          <span className="text-text-subtle w-9 text-left text-[10px] tabular-nums">
            {faPercent(row.share, 0)}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyRow({ phase }: { phase: "loading" | "ready" | "error" }) {
  return (
    <div className="px-5 py-10 text-center">
      <Girih size={22} className="text-text-subtle mx-auto" />
      <p className="text-text mt-3 text-[13px] font-extrabold">
        {phase === "loading"
          ? "فهرست مساجد در حال بارگذاری است"
          : phase === "error"
            ? "ارتباط با سامانه برقرار نشد"
            : "هنوز مسجدی ثبت نشده"}
      </p>
      <p className="text-text-muted mx-auto mt-1 max-w-[42ch] text-[12px] leading-6">
        {phase === "error"
          ? "اتصال اینترنت را بررسی کنید و صفحه را دوباره باز کنید."
          : "فهرست از سامانهٔ برگزاری خوانده می‌شود و همین‌جا نمایش داده خواهد شد."}
      </p>
    </div>
  );
}
