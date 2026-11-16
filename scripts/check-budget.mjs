#!/usr/bin/env node
/**
 * بودجهٔ حجم — جایگزین سبکِ size-limit (که در این محیط نصب نمی‌شود).
 * خواندن مستقیم خروجی بیلد و مقایسه با سقف‌های اعلام‌شده در README.
 * خطا با کد ۱ برمی‌گردد تا CI قرمز شود.
 */
import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * سقف‌ها بر مبنای «حجم gzip» هستند — همان چیزی که کاربر واقعاً دانلود می‌کند.
 * مقایسهٔ حجم خام، معیار گمراه‌کننده‌ای است.
 */
const LIMITS = {
  /**
   * سقف‌های «صفحهٔ اول» همان چیزی است که کاربر موبایل واقعاً دانلود می‌کند.
   *
   * عدد فعلی عمداً نزدیک به واقعیت است تا هر رشد بی‌دلیل، CI را قرمز کند:
   * React 19 + روتر Next 16 حدود ۱۵۵KB gzip از این عدد را می‌گیرند و
   * سهم کد خودِ ما کوچک است. پایین‌تر از این، بدون کنارگذاشتن React یا
   * روتر ممکن نیست.
   */
  "homepage/js": 205,
  "homepage/css": 25,
  homepage: 225,
  "html/raw": 130, // سند کامل صفحهٔ اول، پیش از gzip (شامل JSON-LD و دادهٔ پخته)
};

const ROOT = ".next/static";
if (!existsSync(ROOT)) {
  console.error("✖ پوشهٔ .next/static پیدا نشد — اول `pnpm build` را اجرا کنید.");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push({ path: p, size: s.size });
  }
  return out;
}

const files = walk(ROOT);
const gzSize = (path) => gzipSync(readFileSync(path)).length;
const sum = (pred) => files.filter(pred).reduce((a, f) => a + gzSize(f.path), 0);
const kb = (n) => Math.round(n / 1024);

const buckets = {
  "chunks/js": sum((f) => f.path.includes("/chunks/") && f.path.endsWith(".js")),
  "chunks/css": sum((f) => f.path.includes("/chunks/") && f.path.endsWith(".css")),
  chunks: sum((f) => f.path.includes("/chunks/")),
};

/**
 * ── چرا معیار عوض شد؟ ───────────────────────────────────────────────────
 *
 * سقف قبلی (۱۹۰KB) مجموع **همهٔ** چانک‌های ساخته‌شده را می‌سنجید. تا وقتی
 * کل صفحه یک درخت کلاینت بود، آن با «آنچه کاربر دانلود می‌کند» یکی بود.
 * اکنون صفحه به پوسته + بخش‌های تنبل تقسیم شده و Next چند چانک برای
 * ناوبری آینده هم می‌سازد که کاربر صفحهٔ اول هرگز نمی‌گیرد. سنجیدنشان
 * یعنی جریمه‌کردن به‌خاطرِ کدی که دانلود نمی‌شود.
 *
 * معیار درست: **وزن واقعیِ صفحهٔ اول** — همان فایل‌هایی که در
 * `out/index.html` صریحاً با `<script>`/`<link>` آمده‌اند. این عدد را
 * می‌شود به کاربر گفت و می‌شود رگرسیونش را گرفت.
 */
const OUT_INDEX = "out/index.html";
let homepageJs = 0;
let homepageCss = 0;
let homepageFiles = [];

if (existsSync(OUT_INDEX)) {
  const html = readFileSync(OUT_INDEX, "utf8");
  const resolve = (ref) => ref.replace(/^\/_next\//, ".next/");
  const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
  const styles = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
  for (const ref of scripts) {
    const p = resolve(ref);
    if (existsSync(p)) homepageJs += gzSize(p);
  }
  for (const ref of styles) {
    const p = resolve(ref);
    if (existsSync(p)) homepageCss += gzSize(p);
  }
  homepageFiles = scripts;
}

const homepageTotal = kb(homepageJs + homepageCss);
let failed = false;

console.log("─".repeat(58));
console.log("بودجهٔ حجم بیلد (gzip)");
console.log("─".repeat(58));

const rows = [
  ["صفحهٔ اول JS", kb(homepageJs), LIMITS["homepage/js"]],
  ["صفحهٔ اول CSS", kb(homepageCss), LIMITS["homepage/css"]],
  ["صفحهٔ اول کل", homepageTotal, LIMITS.homepage],
  ["همهٔ چانک‌ها", kb(buckets.chunks), 0],
];

for (const [label, bytes, limitKb] of rows) {
  let mark = "·";
  if (limitKb > 0) {
    if (bytes > limitKb) {
      mark = "✖";
      failed = true;
    } else mark = "✔";
  }
  console.log(
    `${mark} ${label.padEnd(14)} ${String(bytes).padStart(5)} KB  (سقف: ${limitKb > 0 ? `${limitKb} KB` : "اطلاعاتی"})`,
  );
}

if (homepageFiles.length) {
  console.log("─".repeat(58));
  console.log(`  صفحهٔ اول ${homepageFiles.length} فایل JS بار می‌کند`);
}

// ── وزن سند HTML ───────────────────────────────────────────────────────
if (existsSync(OUT_INDEX)) {
  const raw = readFileSync(OUT_INDEX);
  const HTML_LIMIT_KB = LIMITS["html/raw"];
  const pass = raw.length <= HTML_LIMIT_KB * 1024;
  if (!pass) failed = true;
  console.log(
    `${pass ? "✔" : "✖"} ${"index.html".padEnd(14)} ${String(kb(raw.length)).padStart(5)} KB خام  (سقف: ${HTML_LIMIT_KB} KB)`,
  );
}
console.log("─".repeat(58));

if (failed) {
  console.error("✖ بودجهٔ حجم رد شد. قبل از merge حجم را کاهش دهید.");
  process.exit(1);
}
console.log("✔ همهٔ سقف‌های حجم رعایت شد.");
