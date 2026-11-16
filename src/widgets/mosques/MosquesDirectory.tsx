"use client";

import { useMemo, useState } from "react";
import { useBootstrap } from "@/shared/api/use-bootstrap";
import { MosqueMark, Girih } from "@/shared/ui/Ornament";
import { toEn, toFa, toSearch } from "@/shared/lib/fa";

/**
 * فهرست کامل مساجد + جدول مشارکت واقعی.
 *
 * ── چه چیزی این را از فهرست صفحهٔ اول جدا می‌کند؟ ─────────────────────────
 * صفحهٔ اول فقط ۲۴ نام را نشان می‌دهد تا صفحه سبک بماند. اینجا جای «کار»
 * است: جست‌وجو، شمارش واقعی شرکت‌کنندهٔ هر مسجد، و مقایسه با هدف.
 *
 * ── اصل پرهیز از دادهٔ جعلی ────────────────────────────────────────────────
 * هر عددی که نشان می‌دهیم از `leaderboard` همان پاسخ API می‌آید. اگر مسجدی
 * در جدول نباشد، شمارنده‌اش صفر *واقعی* است (یعنی هیچ مشارکت کامل ثبت
 * نشده) — نه صفر ساختگی. تا پاسخ نرسیده، جای عدد «—» است.
 */
type Row = {
  id: number;
  name: string;
  code: string;
  neighborhood: string;
  order: number;
  completed: number;
  registered: number;
  target?: number;
};

type Sort = "order" | "participation" | "name";

export function MosquesDirectory() {
  const state = useBootstrap();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("order");

  const rows = useMemo<Row[]>(() => {
    if (state.phase !== "ready") return [];
    const byId = new Map(state.data.leaderboard.leaderboard.map((e) => [e.mosque_id, e]));
    return state.data.mosques.map((m, i) => {
      const e = byId.get(m.id);
      return {
        id: m.id,
        name: m.name,
        code: m.code,
        neighborhood: m.neighborhood,
        order: m.display_order ?? i + 1,
        completed: e?.completed_participants_count ?? m.completed_participants_count ?? 0,
        registered: e?.registered_users_count ?? 0,
        target: e?.target_participants,
      };
    });
  }, [state]);

  const shown = useMemo(() => {
    const needle = toEn(q).trim().replace(/\s+/g, " ");
    let list = rows;
    if (needle) {
      list = rows.filter((r) =>
        [r.name, r.neighborhood, r.code, String(r.order)].some((f) =>
          toSearch(f).includes(toSearch(needle)),
        ),
      );
    }
    const sorted = [...list];
    if (sort === "participation") {
      sorted.sort((a, b) => b.completed - a.completed || a.order - b.order);
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    } else {
      sorted.sort((a, b) => a.order - b.order);
    }
    return sorted;
  }, [rows, q, sort]);

  const totalCompleted = rows.reduce((s, r) => s + r.completed, 0);
  const activeCount = rows.filter((r) => r.completed > 0).length;

  return (
    <div className="mt-6">
      {/* ── نوار ابزار ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 sm:max-w-xs">
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

        <div
          role="group"
          aria-label="ترتیب نمایش"
          className="border-border-strong bg-surface-2 flex gap-0.5 rounded-xl border p-0.5"
        >
          {(
            [
              ["order", "ترتیب حوزه"],
              ["participation", "بیشترین مشارکت"],
              ["name", "الفبا"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setSort(k);
              }}
              aria-pressed={sort === k}
              className={`h-9 rounded-[10px] px-2.5 text-[11.5px] font-bold transition-colors ${
                sort === k ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── خلاصه ── */}
      <p className="text-text-subtle mt-3 text-[11.5px]" aria-live="polite">
        {state.phase === "ready" ? (
          <>
            {toFa(shown.length)} از {toFa(rows.length)} مسجد
            {sort === "participation" && totalCompleted > 0 ? (
              <>
                {" · "}
                {toFa(activeCount)} مسجد دست‌کم یک شرکت‌کنندهٔ کامل دارند
              </>
            ) : null}
          </>
        ) : state.phase === "loading" ? (
          "در حال دریافت فهرست از سامانه…"
        ) : (
          "فهرست از سامانه خوانده نشد — صفحه را دوباره باز کنید."
        )}
      </p>

      {/* ── جدول ── */}
      <div className="border-border bg-surface mt-2 overflow-hidden rounded-2xl border">
        {/* سرستون — فقط از sm به بالا، چون روی موبایل جدول معنا ندارد */}
        <div className="border-border text-text-subtle hidden border-b px-4 py-2.5 text-[10.5px] font-bold sm:grid sm:grid-cols-[1fr_120px_92px]">
          <span>مسجد</span>
          <span className="text-center">شرکت‌کنندهٔ کامل</span>
          <span className="text-center">ثبت‌نامی</span>
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
            {shown.map((r) => (
              <li
                key={r.id}
                className="hover:bg-surface-2/60 grid grid-cols-[1fr_auto] items-center gap-3 px-3.5 py-2.5 transition-colors sm:grid-cols-[1fr_120px_92px] sm:px-4"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <MosqueMark name={r.name} order={r.order} size={32} />
                  <div className="min-w-0">
                    <p className="text-text truncate text-[12.5px] font-bold">{r.name}</p>
                    <p className="text-text-subtle flex items-center gap-1.5 text-[10.5px]">
                      <span dir="ltr" className="tabular-nums">
                        {r.code}
                      </span>
                      {r.neighborhood ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="bg-border-strong inline-block size-1 rounded-full"
                          />
                          <span className="truncate">{r.neighborhood}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                {/* موبایل: عدد کنار نام؛ دسکتاپ: ستون‌های جدول */}
                <div className="flex items-center gap-3 sm:contents">
                  <div className="text-center">
                    <span className="text-text block text-[13px] font-extrabold tabular-nums">
                      {toFa(r.completed)}
                    </span>
                    <span className="text-text-subtle text-[9.5px] sm:hidden">شرکت‌کننده</span>
                  </div>
                  <div className="hidden text-center sm:block">
                    <span className="text-text-muted block text-[12px] tabular-nums">
                      {toFa(r.registered)}
                    </span>
                  </div>
                  <span className="text-text-subtle text-[10px] whitespace-nowrap sm:hidden">
                    ثبت‌نامی {toFa(r.registered)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-text-subtle mt-3 text-[11px] leading-6">
        «شرکت‌کنندهٔ کامل» یعنی کسی که آزمونش را تا انتها فرستاده است. ثبت‌نام بدون شرکت، در شمارش
        کامل حساب نمی‌شود.
      </p>
    </div>
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
