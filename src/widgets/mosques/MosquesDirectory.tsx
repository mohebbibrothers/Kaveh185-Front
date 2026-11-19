"use client";

import { useMemo, useState } from "react";
import { useBootstrap } from "@/shared/api/use-bootstrap";
import { MosqueMark, Girih, Medal } from "@/shared/ui/Ornament";
import { TopCards, LeaderLine, type PodiumRow } from "./TopCards";
import { toEn, toFa, toSearch, faPercent } from "@/shared/lib/fa";
import {
  assignRanks,
  groupPlaces,
  markTies,
  mosqueCoreName,
  mosqueInitial,
} from "@/shared/lib/mosque-rank";

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
  /** پاسخِ سرور به «هم‌رتبه است؟» — اگر بک‌اندِ قدیمی باشد، undefined می‌ماند. */
  serverTied?: boolean;
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
        serverTied: e?.is_tied,
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

  /* ═══ چه کسی «مشترک» است و کدام جایگاه‌ها بالای صفحه می‌آیند؟ ═════════
     `rank` حالا «جایگاه» است (۱، ۲، ۲، ۳ …)، پس «سوم» همیشه وجود دارد و
     مدالِ برنز از صفحه غایب نمی‌شود. نشانه‌گذاریِ تساوی (`markTies`) و
     ساختِ سه جایگاهِ صدر (`groupPlaces`) در `mosque-rank.ts` تست شده‌اند.
     • «مشترک» = عضویت در گروهِ چندنفرهٔ یک جایگاه (اول حرفِ سرور، بعد شمارش).
     • هر جایگاه یک کارت است: قهرمان تنها، جایگاهِ دوم/سوم با همهٔ هم‌رتبه‌ها. */
  const tiedRows = useMemo(() => markTies(ranked), [ranked]);
  const placeGroups = useMemo(
    () => (anyParticipation ? groupPlaces(tiedRows) : []),
    [anyParticipation, tiedRows],
  );
  const topRows: PodiumRow[] = useMemo(() => placeGroups.flatMap((g) => g.rows), [placeGroups]);
  const leader = topRows[0];
  const runnerUp = placeGroups.find((g) => g.place > 1)?.rows[0];

  /* جدول **همه** را دارد — رتبه‌های ۱ تا ۳ هم رویِ سکو هستند و هم این‌جا؛
     سکو تجلیل است، نه جایگزینِ ردیف. با جست‌وجو هم فهرست کامل فیلتر می‌شود. */
  const rest = useMemo(() => markTies(shown), [shown]);

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

      {/* ═══ حالتِ «خطِ شروع» ════════════════════════════════════════════════
          وقتی هیچ کارنامه‌ای ثبت نشده، ۱۷ ردیفِ صفر با رتبهٔ «—» نه اطلاعاتی
          دارد نه حسِ رقابت؛ صفحه «خالیِ شلوغ» می‌شود. جای آن یک کارتِ
          انگیزشی + فهرستِ فشردهٔ مساجدِ حاضر در خطِ شروع می‌آید: کاربر
          می‌بیند چه مساجدی در رقابت‌اند و اولین حرکت را خودش می‌زند. */}
      {!anyParticipation && rows.length > 0 ? (
        <div className="mt-4">
          <div className="border-gold/35 from-gold/[0.10] to-gold/[0.03] relative overflow-hidden rounded-2xl border bg-gradient-to-bl px-4 py-5 text-center sm:px-6 sm:py-6">
            <span aria-hidden="true" className="text-gold/25 absolute -top-4 -left-4">
              <Girih size={72} />
            </span>
            <span className="border-gold/40 text-gold-strong mx-auto grid size-11 place-items-center rounded-full border">
              <Girih size={19} />
            </span>
            <p className="text-text mt-3 text-[14px] font-extrabold sm:text-[15.5px]">
              جدول منتظرِ اولین کارنامه است
            </p>
            <p className="text-text-muted mx-auto mt-1.5 max-w-[46ch] text-[11.5px] leading-6">
              هنوز هیچ آزمونی کامل نشده؛ صندلیِ اولِ جدول خالی است. مسجدِ محلهٔ خودت را انتخاب کن و
              اولین افتخارِ این دوره را برایش ثبت کن.
            </p>
            <a
              href="/register"
              className="bg-brand text-on-brand hover:bg-brand-hover mx-auto mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-[12.5px] font-extrabold transition-colors"
            >
              ثبت‌نام در مسابقه
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <p className="text-text-subtle mt-4 flex items-center gap-2 text-[11px] font-bold">
            <span aria-hidden="true" className="bg-verde size-1.5 rounded-full" />
            {toFa(rows.length)} مسجد در خطِ شروع
            {q.length > 0 ? ` · ${toFa(shown.length)} نتیجه` : ""}
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {shown.map((r) => (
              <li
                key={r.id}
                className="border-border bg-surface flex items-center gap-2.5 rounded-xl border px-3 py-2"
              >
                <MosqueMark
                  name={r.name}
                  initialOverride={r.initial || mosqueInitial(r.name)}
                  size={30}
                />
                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-[12px] font-bold">{r.name}</span>
                  <span className="text-text-subtle block text-[10px] tabular-nums" dir="ltr">
                    {r.code}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── سکوی افتخار ────────────────────────────────────────────────────
          سه کارت، بدونِ هیچ سازه یا پایهٔ زیرین: جایگاه را خودِ کارت می‌گوید
          (قاب، مدال و رنگ). در موبایل قهرمان تمام‌عرض و بقیه زیرش؛ کارت‌ها
          با تأخیرِ ۱۱۰ms یکی‌یکی بالا می‌آیند. جزئیات در `TopCards.tsx`. */}
      {placeGroups.length > 0 && q.length === 0 ? <TopCards groups={placeGroups} /> : null}

      {/* ── پیامِ پیشتاز — یک جمله، با احترام به تساوی ── */}
      {leader && q.length === 0 ? <LeaderLine leader={leader} runnerUp={runnerUp} /> : null}

      {/* ── کلیدِ رتبه‌بندی ────────────────────────────────────────────────
          یک خط، نه سه چیپ: قاعدهٔ قبلی فرمولِ «سهم از مشارکت‌ها» را هم توضیح
          می‌داد و در دسکتاپ به دو خط می‌شکست. قاعده یک جمله است و همان کافی
          است؛ فرمول‌ها جای کاربر نیستند. */}
      <p className="text-text-subtle mt-4 flex items-start gap-1.5 text-[10.5px] leading-5 sm:items-center">
        <span
          aria-hidden="true"
          className="bg-verde mt-1.5 size-1.5 shrink-0 rounded-full sm:mt-0"
        />
        رتبه‌بندی با تعدادِ شرکت‌کنندهٔ کامل است؛ در تساوی، الفبای نامِ مسجد تعیین می‌کند.
      </p>

      {/* ── فهرست ── */}
      <div
        className={`border-border bg-surface mt-2.5 overflow-hidden rounded-2xl border ${
          !anyParticipation ? "hidden" : ""
        }`}
      >
        {/* سرستونِ کارت‌ها — زیرِ `lg` جدولِ کلاسیک نداریم، ولی تیترها نباید
            «ناپدید» شوند: یک سرستونِ سبک با سه برچسبِ همان ستون‌ها. */}
        <div className="border-border text-text-subtle flex items-center justify-between border-b px-3.5 py-2 text-[10px] font-bold lg:hidden">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-gold-strong size-1.5 rounded-full" />
            رتبه و مسجد
          </span>
          <span className="flex items-center gap-3">
            <span>شرکت‌کننده</span>
            <span aria-hidden="true" className="bg-border-strong h-3 w-px" />
            <span>سهم</span>
          </span>
        </div>
        {/* سرستون — فقط از lg به بالا (جایی که جدول واقعاً جا دارد) */}
        <div className="border-border text-text-subtle hidden border-b px-4 py-2.5 text-[10.5px] font-bold lg:grid lg:grid-cols-[56px_1fr_132px_92px_110px] lg:items-center lg:gap-3">
          <span className="text-center">رتبه</span>
          <span className="flex items-center gap-2">
            مسجد
            <span className="border-gold/40 bg-gold-soft/60 text-gold-strong rounded border px-1 text-[9px] leading-4 font-bold">
              جایگاه‌های ۱ تا ۳ بالا هم آمده‌اند
            </span>
          </span>
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
          <ul className="divide-border divide-y py-1">
            {rest.map((r) => (
              <RowItem key={r.id} row={r} />
            ))}
          </ul>
        )}
      </div>

      {/* ── فراخوانِ رقابتی (دادهٔ واقعی، بدونِ ادعای ساختگی) ── */}
      <a
        href="/register"
        className={`group border-brand/25 bg-brand/[0.045] hover:border-brand/45 hover:bg-brand/[0.08] mt-4 items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
          anyParticipation ? "flex" : "hidden"
        }`}
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
    </div>
  );
}

/** رنگِ نوارِ سهم بر اساسِ جایگاه (طلا/نقره/برنز/عادی). */
function barTone(place: 0 | 1 | 2 | 3): string {
  if (place === 1) return "from-gold to-gold-strong";
  if (place === 2) return "from-border-strong to-text-subtle";
  if (place === 3) return "from-brick to-brick-soft";
  return "from-brand to-brand/55";
}

/** پهنای نوار: صفر = بدونِ نوار، بقیه حداقلِ ۴٪ تا دیده شود. */
function barWidth(row: Ranked): number {
  return row.completed > 0 ? Math.max(4, Math.min(100, row.share)) : 0;
}

/**
 * یک ردیف — **یک محتوا، دو چیدمان**:
 *   • زیرِ `lg`: کارتِ مستقل (نشان + نام + نوارِ سهم + دو عددِ برچسب‌دار)
 *   • از `lg` به بالا: ردیفِ گریدِ جدول با ستون‌های هم‌تراز
 * با این کار در موبایل/فولدبل هیچ ستونی فشرده یا بریده نمی‌شود.
 */
function RowItem({ row }: { row: Ranked }) {
  /* ═══ رنگِ ردیف = رنگِ **جایگاه**، نه شمارهٔ ردیف ══════════════════════
     اگر دو مسجد در جایگاهِ دوم هم‌امتیاز باشند، هر دو باید کاملاً هم‌شکل
     دیده شوند — همان قاعدهٔ «قهرمان‌های مشترک» در جدول‌های ورزشی. پس جایگاه
     از `rank` می‌آید (که خودش گروهی است) و هرگز از شمارهٔ حلقه. نتیجه: با
     ۱۴/۱۱/۱۱/۸، هر دو مسجدِ ۱۱ نفره نقره‌ای‌اند و مسجدِ ۸ نفره برنزِ کامل
     (مدال + رنگ) می‌گیرد — «سوم» دیگر گم نمی‌شود. */
  const place: 1 | 2 | 3 | 0 = row.rank === 1 ? 1 : row.rank === 2 ? 2 : row.rank === 3 ? 3 : 0;
  const tone = place > 0 ? TONE_BY_PLACE[place as 1 | 2 | 3] : null;

  const rowTint =
    place === 1
      ? "bg-gold-soft/40"
      : place === 2
        ? "bg-surface-2/70"
        : place === 3
          ? "bg-brick-soft/40"
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
              <span className="hidden min-[380px]:inline">
                <span
                  aria-hidden="true"
                  className="bg-border-strong mx-1 inline-block size-1 rounded-full align-middle"
                />
                {toFa(row.registered)} ثبت‌نامی
              </span>
            </span>
            <span className="h-2 min-w-6 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--c-text)_13%,transparent)]">
              <span
                className={`block h-full rounded-full bg-gradient-to-l shadow-[0_0_0_1px_oklch(100%_0_0/0.18)_inset] ${barTone(place)}`}
                style={{ width: `${barWidth(row)}%` }}
              />
            </span>
            <span className="text-text-subtle shrink-0 text-[10px] tabular-nums">
              {faPercent(row.share, 0)}
              <span className="hidden min-[330px]:inline"> از مشارکت‌ها</span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══ دسکتاپ ═══ */}
      <div className="hidden items-center gap-3 px-4 py-2.5 lg:grid lg:grid-cols-[56px_1fr_132px_92px_110px]">
        <div className="flex justify-center">
          {place > 0 ? (
            <span
              className={`relative grid size-8 place-items-center rounded-lg ${tone?.chip ?? ""}`}
              title={`${place === 1 ? "جایگاه نخست" : place === 2 ? "جایگاه دوم" : "جایگاه سوم"}${row.tied ? " (مشترک)" : ""}`}
            >
              <Medal place={place === 1 ? 1 : place === 2 ? 2 : 3} size={20} />
              {/* شمارهٔ جایگاه، کنارِ مدال — تا «سوم» با «۲» اشتباه نشود */}
              <span className="bg-canvas absolute -bottom-1 -left-1 grid min-w-[13px] place-items-center rounded-full px-0.5 text-[8.5px] leading-[12px] font-extrabold tabular-nums ring-1 ring-current/25">
                {toFa(place)}
              </span>
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
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--c-text)_13%,transparent)]">
            <span
              className={`block h-full rounded-full bg-gradient-to-l shadow-[0_0_0_1px_oklch(100%_0_0/0.18)_inset] ${barTone(place)}`}
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
