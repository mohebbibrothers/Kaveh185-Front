import { Star, SectionTitle } from "@/shared/ui/Ornament";
import { toFa } from "@/shared/lib/fa";
import type { Mosque } from "@/shared/api/landing";

export function Mosques({ mosques, totalActive }: { mosques: Mosque[]; totalActive: number }) {
  const list = mosques.slice(0, 18);

  return (
    <section id="mosques" aria-labelledby="mosques-title" className="mt-12">
      <SectionTitle
        id="mosques-title"
        eyebrow="پهنهٔ رقابت"
        title="هفده مسجد، یک حوزه"
        tone="verde"
        action={
          <span className="border-border-strong bg-surface text-text-muted rounded-full border px-3 py-1.5 text-[12px] font-bold">
            {toFa(totalActive)} مسجد فعال
          </span>
        }
      />

      {list.length === 0 ? (
        <div className="border-border-strong bg-surface-2 rounded-xl border border-dashed px-5 py-8 text-center">
          <p className="text-[13.5px] font-extrabold">فهرست مساجد در حال بارگذاری است</p>
          <p className="text-text-muted mx-auto mt-1.5 max-w-[44ch] text-[12.5px] leading-7">
            اسامی مساجد از سامانهٔ برگزاری دریافت می‌شود و در فرم ثبت‌نام به‌صورت فهرست انتخاب نمایش
            داده خواهد شد.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <li
              key={m.id}
              className="group border-border bg-surface hover:border-gold/45 hover:bg-gold-soft/40 flex items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors"
            >
              <span
                aria-hidden="true"
                className="bg-surface-2 text-gold-strong group-hover:bg-brand group-hover:text-gold grid size-8 shrink-0 place-items-center rounded-md transition-colors"
              >
                <Star size={12} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold">{m.name}</span>
                <span className="text-text-subtle block truncate text-[11px]">
                  {m.neighborhood}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
