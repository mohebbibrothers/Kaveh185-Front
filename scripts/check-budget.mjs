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
  "chunks/js": 190, // gzip — React 19 + روتر + polyfill
  "chunks/css": 25, // gzip
  chunks: 215,
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

let failed = false;
console.log("─".repeat(58));
console.log("بودجهٔ حجم بیلد (gzip)");
console.log("─".repeat(58));
for (const [key, value] of Object.entries(buckets)) {
  const limitKb = LIMITS[key] ?? 0;
  const bytes = kb(value);
  const limit = limitKb > 0 ? `${limitKb} KB` : "—";
  let mark = "·";
  if (limitKb > 0 && bytes > limitKb) {
    mark = "✖";
    failed = true;
  } else if (limitKb > 0) {
    mark = "✔";
  }
  console.log(`${mark} ${key.padEnd(12)} ${String(bytes).padStart(5)} KB  (سقف: ${limit})`);
}
console.log("─".repeat(58));

if (failed) {
  console.error("✖ بودجهٔ حجم رد شد. قبل از merge حجم را کاهش دهید.");
  process.exit(1);
}
console.log("✔ همهٔ سقف‌های حجم رعایت شد.");
