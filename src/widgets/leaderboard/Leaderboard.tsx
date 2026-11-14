import { PersianPattern } from "@/shared/ui/PersianPattern";
import { Star } from "@/shared/ui/Ornament";
import { faNumber, faPercent, toFa } from "@/shared/lib/fa";
import type { LeaderboardEntry, Leaderboard as Board } from "@/shared/api/landing";

function Bar({ value }: { value: number }) {
  return (
    <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 sm:block">
      <span
        className="from-gold-strong to-gold block h-full rounded-full bg-gradient-to-l"
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </span>
  );
}

function Row({ e, max }: { e: LeaderboardEntry; max: number }) {
  const pct = max > 0 ? (e.completed_participants_count / max) * 100 : 0;
  const isTop = e.rank === 1;
  return (
    <li
      className={`grid grid-cols-[28px_1fr_auto] items-center gap-2.5 rounded-lg px-3 py-2.5 sm:grid-cols-[28px_1fr_72px_auto] ${
        isTop
          ? "border-gold/40 from-gold/[0.16] border bg-gradient-to-l to-white/[0.04]"
          : "border border-white/[0.09] bg-white/[0.045]"
      }`}
    >
      <span
        className={`grid size-7 place-items-center rounded-md text-[12px] font-extrabold tabular-nums ${
          isTop ? "bg-gold text-on-gold" : "text-on-stage/80 bg-white/10"
        }`}
      >
        {toFa(e.rank)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">{e.name}</span>
        {e.tier_label ? (
          <span className="text-on-stage/55 block text-[10.5px]">{e.tier_label}</span>
        ) : null}
      </span>
      <Bar value={pct} />
      <span className="text-left text-[13px] font-extrabold tabular-nums">
        {faNumber(e.completed_participants_count)}
      </span>
    </li>
  );
}

export function Leaderboard({ board }: { board: Board }) {
  const rows = board.leaderboard.slice(0, 8);
  const max = Math.max(1, ...rows.map((r) => r.completed_participants_count));
  const top = board.leaderboard[0];

  return (
    <section
      id="board"
      aria-labelledby="board-title"
      className="bg-stage text-on-stage relative overflow-hidden rounded-2xl p-5 sm:p-7"
    >
      <PersianPattern className="text-gold absolute inset-0" opacity={0.08} />

      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold text-[11.5px] font-extrabold tracking-wide">رقابت ۱۷ مسجد</p>
          <h2 id="board-title" className="mt-1 text-[clamp(19px,2.6vw,26px)] font-extrabold">
            مسجد شما در چه جایگاهی است؟
          </h2>
        </div>
        <div className="text-on-stage/70 flex items-center gap-3 text-[11.5px]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="bg-verde inline-block size-1.5 animate-pulse rounded-full"
              aria-hidden="true"
            />
            به‌روزرسانی زنده
          </span>
          <span className="tabular-nums">
            مجموع: {faNumber(board.total_completed_participants)} نفر
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="relative rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-7 text-center">
          <span className="border-gold/30 text-gold mx-auto grid size-11 place-items-center rounded-full border">
            <Star size={18} />
          </span>
          <p className="mt-3 text-[13.5px] font-extrabold">جدول از نخستین مشارکت‌ها پر می‌شود</p>
          <p className="text-on-stage/65 mx-auto mt-1.5 max-w-[38ch] text-[12px] leading-6">
            به‌محض ثبت اولین کارنامه، رتبهٔ هر مسجد در همین‌جا زنده به‌روزرسانی می‌شود. نام مسجدت را
            به بالای جدول برسان.
          </p>
        </div>
      ) : null}

      {top ? (
        <p className="border-gold/25 bg-gold/[0.1] text-on-stage/85 relative mb-3 rounded-lg border px-3 py-2 text-[12px]">
          پیشتاز فعلی: <strong className="text-gold font-extrabold">{top.name}</strong> با{" "}
          {faNumber(top.completed_participants_count)} مشارکت
          {top.participation_share_percent
            ? ` (${faPercent(top.participation_share_percent, 1)} از کل)`
            : ""}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ol className="relative space-y-1.5">
          {rows.map((e) => (
            <Row key={e.mosque_id} e={e} max={max} />
          ))}
        </ol>
      ) : null}

      {board.leaderboard.length > rows.length ? (
        <p className="text-on-stage/60 relative mt-3 text-center text-[11.5px]">
          و {toFa(board.leaderboard.length - rows.length)} مسجد دیگر در جدول کامل
        </p>
      ) : null}
    </section>
  );
}
