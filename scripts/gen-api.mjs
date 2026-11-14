// تولید تایپ‌ها از کانتِرار OpenAPI بک‌اند — منبعِ حقیقت واحد.
// خروجی کامیت می‌شود تا بیلد به شبکه وابسته نباشد و هر تغییر قرارداد در diff دیده شود.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const LOCAL = new URL("../src/shared/api/openapi.yaml", import.meta.url);
const OUT = new URL("../src/shared/api/schema.d.ts", import.meta.url);
const check = process.argv.includes("--check");

const src = process.env.SCHEMA_SRC
  ? process.env.SCHEMA_SRC
  : existsSync(LOCAL)
    ? LOCAL.pathname
    : "http://127.0.0.1:8000/api/v1/schema/";

const tmp = OUT.pathname + ".tmp";
execSync(`npx openapi-typescript "${src}" -o "${tmp}"`, { stdio: "inherit" });

const header = `/* ⚠️ فایل تولیدی — دست نزنید.\n   منبع: ${src}\n   تولید: pnpm run api:types\n   این فایل کامیت می‌شود تا بیلد به شبکه وابسته نباشد. */\n`;
const body = readFileSync(tmp, "utf8");
const next = header + body;

if (check) {
  const cur = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (cur !== next) {
    console.error(
      "✖ drift قرارداد: schema.d.ts با openapi.yaml همگام نیست. `pnpm run api:types` را بزن.",
    );
    process.exit(1);
  }
  console.log("✔ قرارداد API همگام است");
} else {
  writeFileSync(OUT, next);
  console.log("✔ نوشته شد: src/shared/api/schema.d.ts");
}
