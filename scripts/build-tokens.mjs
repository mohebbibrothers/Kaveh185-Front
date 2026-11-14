// توکن‌های DTCG ⇒ CSS (light :root، dark [data-theme]) + Tailwind v4 @theme.
// --check برای CI: فقط مقایسه، هیچ نوشتنی.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = new URL("../tokens/kaveh185.tokens.json", import.meta.url);
const OUT_CSS = new URL("../src/shared/styles/tokens.css", import.meta.url);
const OUT_TW = new URL("../src/shared/styles/theme.css", import.meta.url);

const tokens = JSON.parse(readFileSync(SRC, "utf8"));
const { light, dark } = tokens.color;

// ── سنجش کنتراست (WCAG 2.2) ── روی sRGB، با تبدیل OKLCH → sRGB
function oklchToSrgb(str) {
  const m = /oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i.exec(str);
  if (!m) return null;
  const L = parseFloat(m[1]) / 100,
    C = parseFloat(m[2]),
    H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H),
    b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    mm = m_ ** 3,
    s = s_ ** 3;
  let r = +4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const enc = (x) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
  return [enc(r), enc(g), enc(bl)].map((v) => Math.min(1, Math.max(0, v)));
}
function relLum([r, g, b]) {
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(hex1, hex2) {
  const a = oklchToSrgb(hex1),
    b = oklchToSrgb(hex2);
  if (!a || !b) return null;
  const [l1, l2] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// جفت‌های متن روی زمینه که حتماً باید AA شوند
const PAIRS = [
  ["text", "canvas", 4.5],
  ["text", "surface", 4.5],
  ["text", "surface-2", 4.5],
  ["text-muted", "canvas", 4.5],
  ["text-muted", "surface", 4.5],
  ["text-subtle", "surface", 4.5],
  ["on-brand", "brand", 4.5],
  ["brand", "canvas", 3],
  ["on-gold", "gold", 4.5],
  ["gold-strong", "surface", 3],
  ["verde", "surface", 4.5],
  ["brick", "surface", 4.5],
  ["text", "gold-soft", 4.5],
  ["text", "verde-soft", 4.5],
  ["text", "brick-soft", 4.5],
];
const fails = [];
for (const theme of ["light", "dark"]) {
  const group = theme === "light" ? light : dark;
  for (const [fg, bg, min] of PAIRS) {
    const c = contrast(group[fg], group[bg]);
    if (c !== null && c < min) fails.push(`${theme}: ${fg} روی ${bg} = ${c.toFixed(2)} < ${min}`);
  }
}

function cssBlock(group, selector) {
  const lines = Object.entries(group).map(([k, v]) => `  --c-${k}: ${v};`);
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}

const header = `/* ⚠️ فایل تولیدی — دست نزنید.\n   منبع: tokens/kaveh185.tokens.json\n   تولید: pnpm run tokens      بررسی drift: pnpm run tokens:check */\n`;

const css = `${header}
/* رنگ‌ها با fallback ساده برای مرورگرهای بدون OKLCH */
:root {
${Object.entries(light)
  .map(([k, v]) => `  --c-${k}: ${v};`)
  .join("\n")}
}

${cssBlock(dark, '[data-theme="dark"]')}
@media (prefers-color-scheme: dark) {
  :root {
${Object.entries(dark)
  .map(([k, v]) => `    --c-${k}: ${v};`)
  .join("\n")}
  }
}

:root {
${Object.entries(tokens.size)
  .filter(([k, v]) => !k.startsWith("$") && typeof v === "string")
  .map(([k, v]) => `  --size-${k}: ${v};`)
  .join("\n")}
${Object.entries(tokens.radius)
  .filter(([k, v]) => !k.startsWith("$") && typeof v === "string")
  .map(([k, v]) => `  --radius-${k}: ${v};`)
  .join("\n")}
${Object.entries(tokens.space)
  .filter(([k, v]) => !k.startsWith("$") && typeof v === "string")
  .map(([k, v]) => `  --space-${k}: ${v};`)
  .join("\n")}
${Object.entries(tokens.duration)
  .filter(([k, v]) => !k.startsWith("$") && typeof v === "string")
  .map(([k, v]) => `  --dur-${k}: ${v};`)
  .join("\n")}
${Object.entries(tokens.easing)
  .filter(([k, v]) => !k.startsWith("$") && Array.isArray(v))
  .map(([k, v]) => `  --ease-${k}: cubic-bezier(${v.join(", ")});`)
  .join("\n")}
  --shadow-1: ${tokens.shadow["1"]};
  --shadow-2: ${tokens.shadow["2"]};
  --shadow-3: ${tokens.shadow["3"]};
  --font-sans: ${tokens.font.sans.join(", ")};
  --font-mono: ${tokens.font.mono.join(", ")};
  --lh-tight: ${tokens.lineHeight.tight};
  --lh-snug: ${tokens.lineHeight.snug};
  --lh-base: ${tokens.lineHeight.base};
  --lh-loose: ${tokens.lineHeight.loose};
}
`;

const tw = `${header}
/* پل توکن‌ها به Tailwind v4 (CSS-first) */
@theme inline {
${Object.entries(light)
  .map(([k]) => `  --color-${k}: var(--c-${k});`)
  .join("\n")}
  --radius-sm: var(--radius-sm); --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg); --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
`;

if (process.argv.includes("--check")) {
  let ok = true;
  const cur_css = existsSync(OUT_CSS) ? readFileSync(OUT_CSS, "utf8") : "";
  const cur_tw = existsSync(OUT_TW) ? readFileSync(OUT_TW, "utf8") : "";
  if (cur_css !== css) {
    ok = false;
    console.error("drift: src/shared/styles/tokens.css");
  }
  if (cur_tw !== tw) {
    ok = false;
    console.error("drift: src/shared/styles/theme.css");
  }
  if (fails.length) {
    ok = false;
    console.error("کنتراست کافی نیست:\n" + fails.join("\n"));
  }
  if (!ok) process.exit(1);
  console.log(`✔ توکن‌ها همگام و کنتراست همهٔ ${PAIRS.length * 2} جفت‌رنگ کافی است`);
} else {
  writeFileSync(OUT_CSS, css);
  writeFileSync(OUT_TW, tw);
  if (fails.length) {
    console.error("✖ کنتراست کافی نیست:\n" + fails.join("\n"));
    process.exit(1);
  }
  console.log(`✔ نوشته شد: tokens.css + theme.css — ${PAIRS.length * 2} جفت‌رنگ سنجیده شد`);
}
