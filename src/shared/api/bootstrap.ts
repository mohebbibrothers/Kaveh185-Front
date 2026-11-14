import { apiGet } from "./client";
import { bootstrapSchema, type Bootstrap } from "./landing";
import { FALLBACK_BOOTSTRAP } from "./fallback";

/**
 * تک‌درخواستی: وضعیت آزمون + ۱۷ مسجد + جدول زنده.
 * revalidate در RSC: صفحهٔ اول هر ۶۰ ثانیه تازه می‌شود (سقف کش لبه).
 */
export async function fetchBootstrap(): Promise<Bootstrap> {
  let raw: unknown;
  try {
    raw = await apiGet("/api/v1/core/bootstrap/", {
      next: { revalidate: 60, tags: ["bootstrap"] },
    });
  } catch {
    // بک‌اند هنوز آنلاین نیست — صفحهٔ اول باید همیشه رندر شود
    return FALLBACK_BOOTSTRAP;
  }
  const parsed = bootstrapSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `قرارداد bootstrap با انتظار فرانت نمی‌خواند: ${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(" | ")}`,
    );
  }
  return parsed.data;
}
