import { MosqueMark, SectionTitle } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import type { Mosque } from "@/shared/api/landing";

/**
 * فهرست مساجد حوزه.
 *
 * ── چرا ستاره حذف شد؟ ────────────────────────────────────────────────────
 * نسخهٔ قبل کنار هر نام مسجد یک ستارهٔ هشت‌پر می‌گذاشت. مشکل فقط زیبایی
 * نبود: ستاره «امتیاز» یا «برگزیده» را تداعی می‌کند، در حالی که هیچ
 * معنایی نداشت — همهٔ ۱۷ مسجد ستارهٔ یکسان داشتند. تکرارِ یک نشان بی‌معنی،
 * هم صفحه را شلوغ می‌کرد و هم انتظار غلط می‌ساخت.
 *
 * به‌جایش `MosqueMark`: کاشی کوچکی با **حرف اول همان مسجد** و **شمارهٔ
 * ترتیب واقعی** از داده. حالا هر ردیف اطلاعات دارد و فهرست قابل اسکن است.
 */
export function Mosques({ mosques, totalActive }: { mosques: Mosque[]; totalActive: number }) {
  const list = mosques.slice(0, 24);

  return (
    <section id="mosques" aria-labelledby="mosques-title" className="mt-14">
      <SectionTitle
        id="mosques-title"
        eyebrow="پهنهٔ رقابت"
        title="مساجد حوزه، در یک نگاه"
        tone="verde"
        index="۰۳"
        action={
          <span className="border-border-strong bg-surface text-text-muted rounded-full border px-3 py-1.5 text-[12px] font-bold tabular-nums">
            {totalActive > 0 ? `${toFa(totalActive)} مسجد فعال` : "در حال دریافت"}
          </span>
        }
      />

      {list.length === 0 ? (
        <div className="border-border-strong bg-surface-2 rounded-2xl border border-dashed px-5 py-8 text-center">
          <p className="text-[13.5px] font-extrabold">فهرست مساجد در حال بارگذاری است</p>
          <p className="text-text-muted mx-auto mt-1.5 max-w-[44ch] text-[12.5px] leading-7">
            نام مساجد از سامانهٔ برگزاری خوانده می‌شود و همین‌جا نمایش داده خواهد شد.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m, index) => (
            <li
              key={m.id}
              className="group border-border bg-surface hover:border-brand/35 hover:bg-canvas flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors"
            >
              <MosqueMark name={m.name} order={m.display_order ?? index + 1} size={34} />
              <span className="min-w-0 flex-1">
                <span className="text-text block truncate text-[12.5px] font-bold">{m.name}</span>
                <span className="text-text-subtle flex items-center gap-1.5 text-[10.5px]">
                  <span className="tabular-nums" dir="ltr">
                    {m.code}
                  </span>
                  {m.neighborhood ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="bg-border-strong inline-block size-1 rounded-full"
                      />
                      <span className="truncate">{m.neighborhood}</span>
                    </>
                  ) : null}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
