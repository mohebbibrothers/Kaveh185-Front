import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    // jsdom + undici آدرس مطلق می‌خواهد؛ این پرچم فقط در تست فعال است
    env: { K185_ABSOLUTE_BASE: "1", NEXT_PUBLIC_API_ORIGIN: "http://localhost:8000" },
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/shared/**", "src/entities/**", "src/features/**"],
      exclude: ["**/*.test.*", "**/schema.d.ts", "src/shared/api/openapi.yaml"],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
