import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_BOOTSTRAP } from "../fallback";

/**
 * دادهٔ صفحهٔ اول: `DataContext`، `useBootstrap` و پیکربندی مسیرها.
 *
 * چرا این‌ها با هم؟ چون قرارداد مشترکشان یکی است: هر جایی که داده نرسیده،
 * باید «—» یا پوستهٔ صادقانه دیده شود، نه عدد ساختگی و نه کرش. اگر
 * `useData` بیرون از provider بترکد، همهٔ صفحه‌های داخلی می‌افتند.
 */

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("useData", () => {
  it("بیرون از provider همان مقدار fallback را می‌دهد", async () => {
    const { useData } = await import("../data-context");
    const fallback = {
      data: FALLBACK_BOOTSTRAP,
      freshness: "shell" as const,
      lastOk: "2026-11-14T10:00:00Z",
    };
    const { result } = renderHook(() => useData(fallback));
    expect(result.current).toBe(fallback);
  });

  it("داخل provider دادهٔ provider را می‌دهد", async () => {
    const { DataContext, useData } = await import("../data-context");
    const live = {
      data: { ...FALLBACK_BOOTSTRAP, server_time: "2026-11-14T12:00:00Z" },
      freshness: "live" as const,
      lastOk: "2026-11-14T12:00:00Z",
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DataContext.Provider value={live}>{children}</DataContext.Provider>
    );
    const { result } = renderHook(
      () =>
        useData({
          data: FALLBACK_BOOTSTRAP,
          freshness: "shell" as const,
          lastOk: "",
        }),
      { wrapper },
    );
    expect(result.current.freshness).toBe("live");
    expect(result.current.data.server_time).toBe("2026-11-14T12:00:00Z");
  });
});

describe("useBootstrap", () => {
  it("حالت اولیه loading است و پس از رسیدن داده ready می‌شود", async () => {
    const payload = { ...FALLBACK_BOOTSTRAP, server_time: "2026-11-14T13:00:00Z" };
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              status_code: 200,
              code: "ok",
              message: "",
              trace_id: "t",
              data: payload,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
    const { useBootstrap } = await import("../use-bootstrap");
    const { result } = renderHook(() => useBootstrap());
    expect(result.current.phase).toBe("loading");
    await vi.waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current.data?.server_time).toBe("2026-11-14T13:00:00Z");
  });

  it("با شکست شبکه به حالت error می‌رود، نه استثنا", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { useBootstrap } = await import("../use-bootstrap");
    const { result } = renderHook(() => useBootstrap());
    await vi.waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current.data).toBeNull();
  });
});

describe("پیکربندی مسیرها", () => {
  it("مسیرهای اصلی همان‌هایی هستند که وجود دارند", async () => {
    const { PRIMARY } = await import("../../config/site");
    // «خانه» اول آمد (راهِ برگشت همیشه دیده شود) — به درخواست صریح کاربر.
    expect(PRIMARY.map((item) => item.href)).toEqual([
      "/",
      "/book",
      "/rules",
      "/mosques",
      "/receipt",
    ]);
  });

  it("هر مسیر یک برچسب فارسی غیرخالی دارد", async () => {
    const { ANCHORS } = await import("../../config/site");
    expect(ANCHORS.length).toBeGreaterThan(0);
    for (const item of ANCHORS) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href.startsWith("#") || item.href.startsWith("/")).toBe(true);
    }
  });

  it("برچسب‌ها یکتا هستند تا منو دو آیتم یکسان نداشته باشد", async () => {
    const { ANCHORS } = await import("../../config/site");
    const labels = ANCHORS.map((a) => a.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("زمان", () => {
  it("تا پیش از شروع، شمارش معکوس مثبت است", async () => {
    const { secondsUntil } = await import("../../lib/time");
    expect(secondsUntil("2026-11-14T10:05:00Z", "2026-11-14T10:00:00Z")).toBe(300);
  });

  it("پس از پایان، صفر می‌دهد نه عدد منفی", async () => {
    const { secondsUntil } = await import("../../lib/time");
    expect(secondsUntil("2026-11-14T10:00:00Z", "2026-11-14T10:05:00Z")).toBe(0);
  });

  it("تاریخ نامعتبر را null می‌کند، نه NaN یا استثنا", async () => {
    const { secondsUntil } = await import("../../lib/time");
    expect(secondsUntil("not-a-date", "2026-11-14T10:00:00Z")).toBeNull();
  });
});

describe("رندر واقعی", () => {
  it("دکمه، برچسب فارسی را به‌صورت متن رندر می‌کند", async () => {
    const { Button } = await import("../../ui/Button");
    render(<Button>ورود به آزمون</Button>);
    expect(screen.getByRole("button").textContent).toContain("ورود به آزمون");
  });
});
