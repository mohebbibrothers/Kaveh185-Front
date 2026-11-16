import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fetchBootstrap, fetchBootstrapWithMeta } from "../bootstrap";
import { FALLBACK_BOOTSTRAP } from "../fallback";

/**
 * این آزمون از یک باگ واقعی محافظت می‌کند که به انتشار رسید.
 *
 * ── چه شد ──────────────────────────────────────────────────────────────
 * `fetchBootstrap` هنگام `next build` از `/api/v1/core/bootstrap/` می‌خواند.
 * در زمان ساخت این آدرس به `127.0.0.1:3000` می‌افتد؛ در محیط ساخت یک
 * بک‌اند آزمایشی با دادهٔ seed بالا بود. نتیجه در HTML پخته شد:
 *
 *     "completed_participants_count": 1   ← برای هر ۱۷ مسجد
 *     "participation_share_percent": 5.88
 *     "window_state": "open" ، "آزمون فعال است"
 *     "starts_at": "2026-11-14T11:35:39"
 *
 * API واقعی همان لحظه می‌گفت: صفر مشارکت و `window_state: "upcoming"`.
 * یعنی بازدیدکننده اعداد ساختگی می‌دید — نقض مستقیم اصل پروژه.
 *
 * ── چرا آزمون سطح کد کافی نیست ─────────────────────────────────────────
 * وصلهٔ نقطه‌ای («فقط این تابع را درست کن») دوباره می‌شکند. ضمانت واقعی
 * این است که **مسیر ساخت هیچ شبکه‌ای نزند**. این آزمون همان را می‌سنجد:
 * خروجی `fetchBootstrap` باید عیناً پوستهٔ خالی باشد و هیچ فیلد داده‌ای
 * نداشته باشد.
 */
describe("جداسازی دادهٔ ساخت از دادهٔ زنده", () => {
  it("fetchBootstrap در زمان ساخت هیچ شبکه‌ای نمی‌زند", async () => {
    const before = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (() => {
      calls += 1;
      throw new Error("ساخت نباید fetch بزند");
    }) as typeof fetch;

    try {
      const data = await fetchBootstrap();
      expect(calls).toBe(0);
      expect(data).toEqual(FALLBACK_BOOTSTRAP);
    } finally {
      globalThis.fetch = before;
    }
  });

  it("پوستهٔ خالی هیچ مسجد و هیچ مشارکتی ندارد", async () => {
    const { data, fromApi } = await fetchBootstrapWithMeta();
    expect(fromApi).toBe(false);
    expect(data.mosques).toHaveLength(0);
    expect(data.leaderboard.leaderboard).toHaveLength(0);
    expect(data.leaderboard.total_completed_participants).toBe(0);
    expect(data.leaderboard.total_mosques).toBe(0);
  });

  it("پوستهٔ خالی هیچ تاریخ ساختگی‌ای اعلام نمی‌کند", () => {
    const s = FALLBACK_BOOTSTRAP.exam_status;
    // رشتهٔ خالی = نامعلوم. UI آن را «در حال دریافت…» می‌نویسد.
    expect(s.starts_at).toBe("");
    expect(s.ends_at).toBe("");
    expect(s.starts_at_jalali).toBe("");
    expect(s.ends_at_jalali).toBe("");
    // و وضعیت را «باز» جا نمی‌زند
    expect(s.window_state).toBe("upcoming");
    expect(s.can_participate).toBe(false);
  });

  it("پوستهٔ خالی اندازهٔ بانک سؤال را ادعا نمی‌کند", () => {
    expect(FALLBACK_BOOTSTRAP.exam_status.active_question_bank_size).toBe(0);
  });

  it("صفحهٔ اول هیچ تابع داده‌خوانِ زمان ساخت را import نمی‌کند", () => {
    const page = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf-8");
    // اگر روزی کسی دوباره خواندن از API را به مرحلهٔ ساخت برگرداند، اینجا
    // می‌شکند — همان اتفاقی که یک‌بار به انتشار رسید.
    expect(page).not.toMatch(/apiGet\s*\(/);
    expect(page).not.toMatch(/fetch\(/);
    expect(page).toMatch(/fetchBootstrapWithMeta/);
  });
});
