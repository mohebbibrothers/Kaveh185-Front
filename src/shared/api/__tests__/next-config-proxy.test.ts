import { describe, expect, it } from "vitest";

/**
 * next.config.ts در ریشهٔ پروژه است و vitest آن را با vite می‌خواند (نه tsc).
 * import داینامیک با مسیر رشته‌ای، هم از خطای TS5097 (پسوند .ts) جلوگیری
 * می‌کند و هم از خطای رزولوشن ماژول در محیط تست.
 */
async function loadConfig() {
  const mod = await import("../../../../next.config.ts");
  return mod.default;
}

/**
 * قفل باگ «حلقهٔ ریدایرکت بین Next و Django».
 *
 * چرا این تست وجود دارد
 * ─────────────────────
 * قاعدهٔ سادهٔ `source: "/api/:path*"` در rewrites، regex ای می‌سازد که
 * اسلش پایانی را می‌بلعد:
 *
 *     ^\/api(?:\/((?:[^\/]+?)(?:\/(?:[^\/]+?))*))?(?:\/)?$
 *                                                        ↑ اسلش اختیاری
 *
 * نتیجه در عمل:
 *
 *     GET /api/v1/core/bootstrap/  (Django این را می‌خواهد)
 *       → پروکسی به .../api/v1/core/bootstrap   (بدون اسلش)
 *       → Django: APPEND_SLASH → 301 به نسخهٔ با اسلش
 *       → Next دوباره به نسخهٔ بدون اسلش
 *       → «۵۰ redirect» و fetch شکست می‌خورد
 *       → صفحه بی‌صدا به پوستهٔ خالی fallback می‌کرد، بدون هیچ خطای کنسولی
 *
 * این تست تضمین می‌کند قاعده‌ای که اسلش را حفظ می‌کند همیشه حاضر باشد.
 */
describe("next.config — پیکربندی پروکسی API", () => {
  const load = async () => {
    const cfgFn = await loadConfig();
    const cfg = cfgFn("phase-development-server") as unknown as {
      trailingSlash?: boolean;
      output?: string;
      images?: { unoptimized?: boolean };
      skipTrailingSlashRedirect?: boolean;
      rewrites: () => Promise<{
        beforeFiles: { source: string; destination: string }[];
        afterFiles: unknown[];
        fallback: unknown[];
      }>;
    };
    return { cfg, rewrites: cfg.rewrites };
  };

  it("قاعده‌ای دارد که اسلش پایانی را در destination نگه می‌دارد", async () => {
    const { rewrites } = await load();
    const { beforeFiles } = await rewrites();
    const withSlash = beforeFiles.find(
      (r) => r.source.endsWith("/") && r.destination.endsWith("/"),
    );
    expect(
      withSlash,
      "قاعدهٔ «مسیر با اسلش» غایب است — حلقهٔ redirect با Django برمی‌گردد",
    ).toBeDefined();
    expect(withSlash?.source).toContain(":path*");
  });

  it("قاعدهٔ دوم مسیرهای بدون اسلش را هم پوشش می‌دهد", async () => {
    const { rewrites } = await load();
    const { beforeFiles } = await rewrites();
    const withoutSlash = beforeFiles.find(
      (r) => !r.source.endsWith("/") && r.source.includes("/api/"),
    );
    expect(withoutSlash).toBeDefined();
  });

  it("rewrite ها در beforeFiles اجرا می‌شوند، نه fallback", async () => {
    const { rewrites } = await load();
    const { beforeFiles, fallback } = await rewrites();
    expect(
      beforeFiles.length,
      "beforeFiles باید پر باشد تا پروکسی پیش از تطبیق مسیرهای اپ اجرا شود",
    ).toBeGreaterThan(0);
    expect(fallback.length, "fallback باید خالی باشد — وگرنه ترتیب اشتباه است").toBe(0);
  });

  /**
   * ⚠️ این انتظار در گذار به خروجی ایستا عوض شد و باید همین بماند.
   *
   * قبلاً `trailingSlash: false` بود چون یک سرور Node مسیرها را در لحظه
   * حل می‌کرد. اکنون خروجی، پوشه‌ای از فایل‌های ایستاست
   * (`register/index.html`) و بدون اسلش پایانی، سرور فایل‌های ایستا مسیر را
   * پیدا نمی‌کند. برای همین `true` است و `apps/core/frontend.py` مسیر
   * بی‌اسلش را با ۳۰۸ به نسخهٔ با اسلش می‌فرستد.
   */
  it("trailingSlash روشن است — لازمهٔ خروجی ایستای پوشه‌ای", async () => {
    const { cfg } = await load();
    expect(cfg.trailingSlash).toBe(true);
  });

  it("خروجی ایستاست — بدون آن استقرار روی cPanel بی‌فرآیندِ Node ممکن نیست", async () => {
    const { cfg } = await load();
    expect(cfg.output).toBe("export");
  });

  it("بهینه‌سازی تصویر خاموش است — /_next/image در خروجی ایستا وجود ندارد", async () => {
    const { cfg } = await load();
    expect(cfg.images?.unoptimized).toBe(true);
  });

  it("در تولید هیچ rewrite ای ثبت نمی‌شود — همه‌چیز هم‌مبدأ است", async () => {
    const cfgFn = await loadConfig();
    const prod = cfgFn("phase-production-build") as unknown as {
      output?: string;
      rewrites?: unknown;
      skipTrailingSlashRedirect?: boolean;
    };
    expect(prod.output).toBe("export");
    expect(prod.rewrites, "rewrite در تولید یعنی پروکسی، و پروکسی یعنی یک سرور").toBeUndefined();
  });

  it("skipTrailingSlashRedirect روشن است تا Next خودش اسلش را دستکاری نکند", async () => {
    const { cfg } = await load();
    expect(cfg.skipTrailingSlashRedirect).toBe(true);
  });

  it("هر دو قاعده به یک API_BASE اشاره می‌کنند", async () => {
    const { rewrites } = await load();
    const { beforeFiles } = await rewrites();
    const apiRewrites = beforeFiles.filter((r) => r.source.startsWith("/api/"));
    expect(apiRewrites.length).toBeGreaterThanOrEqual(2);
    const bases = new Set(apiRewrites.map((r) => r.destination.split("/api/")[0]));
    expect(bases.size, "همهٔ قواعد باید یک مقصد داشته باشند").toBe(1);
  });
});
