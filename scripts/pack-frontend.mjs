#!/usr/bin/env node
/**
 * بستهٔ استقرار فرانت ایستا برای سرو شدن از درون جنگو.
 *
 * چرا لازم است؟ `next build` با `output: "export"` پوشهٔ `out/` را می‌سازد
 * که مستقیم قابل استفاده است، ولی سه چیز را کم دارد که روی هاست cPanel
 * (سهم کوچک CPU، Passenger) اهمیت واقعی دارند:
 *
 *   ۱) **همزاد فشرده‌شدهٔ هر فایل متنی.** Passenger پاسخ‌ها را فشرده
 *      نمی‌کند. ساختن `.br`/`.gz` هنگام ساخت، هزینهٔ CPU را از هاست
 *      اشتراکی برمی‌دارد و حجم انتقال را ۷۰–۸۰٪ کم می‌کند. (میان‌افزار
 *      جنگو اگر همزاد نبود، HTML را همان‌جا gzip می‌کند.)
 *   ۲) **`BUILD_INFO.json`** با هش SHA-256 تک‌تک فایل‌ها. اسکریپت استقرار
 *      با همین هش‌ها صحت بسته را روی سرور می‌سنجد و میان‌افزار شناسهٔ
 *      نسخهٔ سروشده را در سرآیند `X-Frontend-Build` برمی‌گرداند.
 *   ۳) **`routes.json`** — فهرست مسیرهای واقعی، تا صفحهٔ ۴۰۴ فقط برای
 *      مسیرهای ناشناخته بیاید و اسکریپت استقرار بداند چه چیزی باید
 *      پاسخ ۲۰۰ بدهد.
 *
 * خروجی: `release/frontend-<sha>.tar.gz` + `release/frontend-<sha>.tar.gz.sha256`
 *
 * استفاده:
 *   node scripts/pack-frontend.mjs            # ساخت + بسته‌بندی
 *   node scripts/pack-frontend.mjs --no-tar   # فقط آماده‌سازی out/ (برای تست محلی)
 */
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { gzipSync, brotliCompressSync, constants as zc } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const RELEASE = join(ROOT, "release");
const NO_TAR = process.argv.includes("--no-tar");

/** نوع‌هایی که فشرده‌کردنشان سود دارد. تصویر/فونت از پیش فشرده‌اند. */
const COMPRESSIBLE = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".txt",
  ".webmanifest",
  ".svg",
  ".xml",
  ".map",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt.gz": "text/plain",
};

/** پیمایش بازگشتی — فقط فایل‌ها، بی‌ترتیب وابسته به سیستم‌عامل. */
async function walk(dir) {
  const out = [];
  for (const name of (await readdir(dir)).sort()) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const posix = (p) => relative(OUT, p).split(sep).join("/");

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

// ── ۰) پیش‌نیاز ────────────────────────────────────────────────────────────
try {
  await stat(join(OUT, "index.html"));
} catch {
  fail("پوشهٔ out/ پیدا نشد یا index.html ندارد — اول `pnpm build` را اجرا کنید.");
}

// ── ۱) دروازهٔ پیش از استقرار ──────────────────────────────────────────────
const htmlFiles = (await walk(OUT)).filter((p) => p.endsWith(".html"));
const files = await walk(OUT);
const problems = [];

// ⚠️ فایل‌های `.txt` خروجی **ضروری**اند، نه آشغال: بارِ RSC‌اند که روتر Next
// هنگام ناوبری داخلی درخواست می‌کند (`/login/index.txt`). اگر در بسته نباشند،
// هر کلیک به بارگذاری کامل صفحه می‌افتد و prefetch بی‌اثر می‌شود — بدون هیچ
// خطای کنسولی. پس اینجا فقط *حضور*شان بررسی می‌شود.
for (const p of htmlFiles) {
  if (!posix(p).endsWith("index.html")) continue;
  // سندهای خطا سندِ خطا هستند، نه صفحهٔ قابل ناوبری — بار RSC ندارند.
  if (/(^|\/)(404|500)\/index\.html$/.test(posix(p))) continue;
  const dir = dirname(p);
  const dirOrRoot = posix(dir) === "" ? "" : posix(dir) + "/";
  try {
    await stat(join(OUT, dirOrRoot, "index.txt"));
  } catch {
    problems.push(`بارِ RSC برای ${dirOrRoot || "/"} غایب است (index.txt)`);
  }
}
if (htmlFiles.length === 0) problems.push("هیچ فایل HTML‌ای در خروجی نیست");

// هر صفحهٔ HTML باید به یک چانک واقعی اشاره کند؛ وگرنه استقرار، صفحهٔ سفید است.
for (const p of htmlFiles) {
  const html = await readFile(p, "utf8");
  const refs = [...html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    const target = join(OUT, ref.replace(/^\//, ""));
    try {
      await stat(target);
    } catch {
      problems.push(`${posix(p)} به فایل ناموجود اشاره می‌کند: ${ref}`);
    }
  }
  if (!/_next\/static\/chunks\//.test(html)) {
    problems.push(`${posix(p)} هیچ چانک JS‌ای بار نمی‌کند — صفحه بی‌تعامل می‌ماند`);
  }
}

if (problems.length) {
  console.error("✖ دروازهٔ بسته‌بندی رد شد:");
  for (const p of problems) console.error(`   • ${p}`);
  process.exit(1);
}

// ── ۲) همزاد فشرده‌شده ─────────────────────────────────────────────────────
let raw = 0;
let gz = 0;
let br = 0;
let compressed = 0;

for (const p of files) {
  const ext = p.slice(p.lastIndexOf("."));
  if (!COMPRESSIBLE.has(ext)) continue;
  if (p.endsWith(".br") || p.endsWith(".gz")) continue;
  const buf = await readFile(p);
  raw += buf.length;
  // سطح ۹ برای brotli: یک‌بار هنگام ساخت، نه در هر درخواست
  const b = brotliCompressSync(buf, {
    params: {
      [zc.BROTLI_PARAM_QUALITY]: 9,
      [zc.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  });
  const g = gzipSync(buf, { level: 9 });
  // اگر فشرده‌سازی نتیجه‌ای نداشت (فایل‌های بسیار کوچک)، همزاد ننویس:
  // هر فایل اضافه، هزینهٔ دیسک و کندی rsync است.
  if (b.length < buf.length) {
    await writeFile(`${p}.br`, b);
    br += b.length;
    compressed++;
  }
  if (g.length < buf.length) {
    await writeFile(`${p}.gz`, g);
    gz += g.length;
  }
}

// ── ۳) routes.json — فهرست مسیرهای واقعی ──────────────────────────────────
const routes = htmlFiles
  .map((p) => {
    const rel = posix(p);
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
    return `/${rel}`;
  })
  .sort();

// ── ۴) BUILD_INFO.json با هش هر فایل ─────────────────────────────────────
const all = await walk(OUT);
const manifest = {};
let indexSha = "";
/**
 * فایل‌های «دربارهٔ خودِ بسته» از فهرست هش کنار گذاشته می‌شوند:
 * FILES.sha256 نمی‌تواند هش خودش را داشته باشد، و BUILD_INFO/ROUTES/BUILD_ID
 * بعد از محاسبهٔ هش نوشته می‌شوند. اسکریپت استقرار همین‌ها را استثنا می‌کند.
 */
const SELF = new Set(["FILES.sha256", "BUILD_INFO.json", "ROUTES.txt", "BUILD_ID"]);

for (const p of all) {
  if (p.endsWith(".br") || p.endsWith(".gz") || SELF.has(posix(p))) continue;
  const rel = posix(p);
  const hash = createHash("sha256");
  await pipeline(createReadStream(p), hash);
  const digest = hash.digest("hex");
  manifest[rel] = { sha256: digest, bytes: (await stat(p)).size };
  if (rel === "index.html") indexSha = digest;
}

/**
 * ── چرا `FILES.sha256` و `BUILD_ID` هم نوشته می‌شوند؟ ──────────────────
 *
 * اسکریپت استقرار روی هاست اجرا می‌شود و آنجا **نه Node هست نه python3**
 * (فقط bash و ابزارهای استاندارد). خواندن JSON با grep شکننده است، ولی
 * `sha256sum -c` در هر لینوکسی هست:
 *
 *     FILES.sha256   ← خروجی استاندارد `sha256sum` برای بازرسی یک‌خطی
 *     BUILD_ID       ← یک خط، فقط شناسهٔ نسخه؛ خواندنش با `cat` کافی است
 *
 * BUILD_INFO.json می‌ماند چون میان‌افزار جنگو و انسان‌ها آن را می‌خوانند.
 */
const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const info = {
  name: pkg.name,
  version: pkg.version,
  built_at: new Date().toISOString(),
  sha256_index: indexSha,
  routes,
  files: manifest,
  totals: {
    files: Object.keys(manifest).length,
    raw_bytes: raw,
    gzip_bytes: gz,
    brotli_bytes: br,
    compressed_files: compressed,
  },
};
await writeFile(join(OUT, "BUILD_INFO.json"), JSON.stringify(info, null, 2) + "\n");

// قالب‌های قابل‌مصرف برای bash — بی‌هیچ مفسر زبان
await writeFile(
  join(OUT, "FILES.sha256"),
  Object.entries(manifest)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rel, m]) => `${m.sha256}  ${rel}`)
    .join("\n") + "\n",
);
await writeFile(join(OUT, "BUILD_ID"), `${indexSha.slice(0, 12)}\n`);
await writeFile(join(OUT, "ROUTES.txt"), routes.join("\n") + "\n");

// ── ۵) گزارش ─────────────────────────────────────────────────────────────
const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
const pct = raw > 0 ? ((1 - br / raw) * 100).toFixed(0) : "0";
console.log(`✓ بستهٔ فرانت آماده شد`);
console.log(`  مسیرها: ${routes.length} — ${routes.join(" ")}`);
console.log(`  فایل‌ها: ${Object.keys(manifest).length}`);
console.log(`  متن خام: ${kb(raw)} → brotli ${kb(br)} (−${pct}٪) · gzip ${kb(gz)}`);
console.log(`  نسخه: ${pkg.version} · index ${indexSha.slice(0, 12)}`);

if (!NO_TAR) {
  // tar بدون وابستگی خارجی: از خودِ tar سیستم استفاده می‌کنیم (همه‌جا هست)
  const { spawn } = await import("node:child_process");
  const { mkdir } = await import("node:fs/promises");
  await mkdir(RELEASE, { recursive: true });
  const name = `frontend-${indexSha.slice(0, 12)}.tar.gz`;
  const target = join(RELEASE, name);
  await new Promise((resolve, reject) => {
    const tar = spawn("tar", ["-czf", target, "-C", OUT, "."], { stdio: "inherit" });
    tar.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`tar با کد ${code} شکست خورد`)),
    );
    tar.on("error", reject);
  });
  const hash = createHash("sha256");
  await pipeline(createReadStream(target), hash);
  const digest = hash.digest("hex");
  await writeFile(`${target}.sha256`, `${digest}  ${name}\n`);
  const size = (await stat(target)).size;
  console.log(`  بسته: release/${name} (${kb(size)})`);
  console.log(`  sha256: ${digest}`);
}
