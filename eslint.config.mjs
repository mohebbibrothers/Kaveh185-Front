import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "eslint-config-next";

/**
 * ESLint مسطح (flat) + تایپ‌دار.
 *
 * نکته درباره ترتیب: کانفیگ `next` پارسر خودش را می‌آورد و اگر بعد از
 * قواعدِ تایپ‌دار بیاید، آن‌ها را از اطلاعات نوع محروم می‌کند. پس اول next،
 * بعد قواعد تایپ‌دار.
 */
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "src/shared/api/schema.d.ts",
      "scripts/**",
    ],
  },
  js.configs.recommended,
  ...next,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // مرزهای معماری FSD: app → widgets → features → entities → shared (یک‌طرفه)
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app"],
              message:
                "لایه‌های دیگر نمی‌توانند از app وارد کنند؛ جهت وابستگی app → widgets → shared است.",
            },
          ],
        },
      ],
    },
  },
  {
    // فایل‌های تست و کانفیگ: بدون نیاز به اطلاعات نوع
    files: ["**/*.test.{ts,tsx}", "*.config.*", "vitest.config.mts"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
