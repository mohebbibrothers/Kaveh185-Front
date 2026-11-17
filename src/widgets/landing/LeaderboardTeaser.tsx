import Link from "next/link";
import { PersianPattern } from "@/shared/ui/PersianPattern";
import { Girih } from "@/shared/ui/Ornament";
import { faNumber, toFa } from "@/shared/lib/fa";
import type { Leaderboard as Board } from "@/shared/api/landing";

/**
 * جدول مشارکت — اما فقط یک **پیش‌نمایش** سه‌نفره.
 *
 * ── چه چیزی و چرا حذف شد؟ ────────────────────────────────────────────────
 * نسخهٔ قبل، جدول هشت‌ردیفهٔ کامل با نوار پیشرفتِ هر مسجد، شمارندهٔ کل و
 * جدول جداگانهٔ فهرست ۲۴ مسجد را در صفحهٔ اول می‌آورد. نتیجه: کسی که
 * صفحهٔ اول را می‌خواند، دیگر هیچ دلیلی برای رفتن به `/mosques` نداشت —
 * و صفحهٔ اول به یک داشبورد تبدیل شده بود، نه یک صفحهٔ معرفی.
 *
 * اکنون این‌جا فقط سه چیز است: نفر اول (اگر وجود دارد)، دو نفر بعدی، و
 * یک دکمهٔ روشن «جدول کامل و آمار هر مسجد». عدد کل مشارکت هم مانده، چون
 * تنها عددی است که «زنده بودن» مسابقه را نشان می‌دهد.
 *
 * ── اصل صداقت داده ───────────────────────────────────────────────────────
 * مسجدی که هیچ کارنامهٔ کاملی ندارد وارد جدول نمی‌شود؛ API به همه رتبه
 * می‌دهد و نمایش «۱. مسجد … ۰» یعنی اعلام برنده‌ای که وجود ندارد. وقتی
 * هیچ مشارکتی نیست، متن صریح می‌گوید جدول از نخستین کارنامه پر می‌شود.
 */
export function LeaderboardTeaser({ board }: { board: Board }) {
  const active = board.leaderboard.filter((r) => r.completed_participants_count > 0);
  const top = active.slice(0, 3);

  return (
    <section
      id="board"
      aria-labelledby="board-title"
      className="bg-stage text-on-stage relative overflow-hidden rounded-2xl p-5 sm:p-7"
    >
      <PersianPattern className="text-gold absolute inset-0" opacity={0.08} />

      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold text-[11.5px] font-extrabold tracking-wide">
            {board.total_mosques > 0
              ? `رقابت ${faNumber(board.total_mosques)} مسجد`
              : "رقابت مساجد"}
          </p>
          <h2 id="board-title" className="mt-1 text-[clamp(19px,2.6vw,26px)] font-extrabold">
            مسجد شما کجای جدول است؟
          </h2>
        </div>
        <div className="text-on-stage-muted flex items-center gap-3 text-[11.5px]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="bg-verde inline-block size-1.5 animate-pulse rounded-full"
              aria-hidden="true"
            />
            زنده
          </span>
          <span className="tabular-nums">
            {board.total_completed_participants > 0
              ? `${faNumber(board.total_completed_participants)} کارنامه`
              : "در انتظار نخستین کارنامه"}
          </span>
        </div>
      </div>

      {top.length === 0 ? (
        <div className="border-on-stage/25 bg-on-stage/[0.04] relative rounded-xl border border-dashed px-4 py-7 text-center">
          <span className="border-gold/30 text-gold mx-auto grid size-11 place-items-center rounded-full border">
            <Girih size={18} />
          </span>
          <p className="mt-3 text-[13.5px] font-extrabold">جدول از نخستین کارنامه پر می‌شود</p>
          <p className="text-on-stage-muted mx-auto mt-1.5 max-w-[38ch] text-[12px] leading-6">
            به‌محض ثبت اولین کارنامه، رتبهٔ هر مسجد در همین‌جا زنده به‌روزرسانی می‌شود. نام مسجدت را
            به بالای جدول برسان.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-1.5">
          {top.map((e, i) => (
            <li
              key={e.mosque_id}
              className={`grid grid-cols-[30px_1fr_auto] items-center gap-2.5 rounded-lg border px-3 py-2.5 ${
                i === 0
                  ? "border-gold/40 from-gold/[0.16] to-on-stage/[0.05] bg-gradient-to-l"
                  : "border-on-stage/12 bg-on-stage/[0.05]"
              }`}
            >
              <span
                className={`grid size-7 place-items-center rounded-md text-[12px] font-extrabold tabular-nums ${
                  i === 0 ? "bg-gold text-on-gold" : "text-on-stage bg-on-stage/12"
                }`}
              >
                {toFa(e.rank)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">{e.name}</span>
                {e.neighborhood ? (
                  <span className="text-on-stage-muted block truncate text-[10.5px]">
                    {e.neighborhood}
                  </span>
                ) : null}
              </span>
              <span className="text-left text-[13px] font-extrabold tabular-nums">
                {faNumber(e.completed_participants_count)}
                <span className="text-on-stage-muted mr-1 text-[10.5px] font-semibold">
                  کارنامه
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* تنها راهِ دیدن جدول کامل — یک دکمه، نه پنج لینک */}
      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-on-stage-muted text-[11.5px] leading-6">
          {active.length > 3
            ? `${toFa(active.length - 3)} مسجد دیگر در جدول کامل`
            : "جدول کامل، آمار هر مسجد و هدف مشارکت"}
        </p>
        <Link
          href="/mosques"
          className="text-on-stage ring-on-stage/25 hover:bg-on-stage/10 inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-bold ring-1 transition-colors"
        >
          جدول کامل مساجد
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
