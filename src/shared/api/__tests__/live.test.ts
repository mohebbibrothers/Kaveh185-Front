import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_BOOTSTRAP } from "../fallback";
import { isBootstrap } from "../guard";
import type { Bootstrap } from "../landing";

/**
 * تازه‌سازی داده در مرورگر — همان قلابی که جدول مساجد و شمارنده‌ها را
 * زنده نگه می‌دارد.
 *
 * قواعدی که اگر بشکنند کاربر ضرر می‌کند:
 *   • وقتی برگه پنهان است، درخواست نمی‌رود (دادهٔ موبایل).
 *   • شکست تازه‌سازی، دادهٔ قبلی را پاک نمی‌کند؛ فقط برچسب «کهنه» می‌شود.
 *   • پاسخ بی‌ساختار جایگزین دادهٔ سالم نمی‌شود.
 *   • دادهٔ یکسان باعث رندر دوباره و پرش جدول نمی‌شود.
 */

const okBootstrap: Bootstrap = {
  ...FALLBACK_BOOTSTRAP,
  server_time: "2026-11-14T10:00:00Z",
};

function mockFetch(handler: () => Response) {
  const fn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => handler());
  vi.stubGlobal("fetch", fn);
  return fn;
}

const json = (payload: unknown, status = 200) =>
  new Response(
    JSON.stringify({
      success: status < 400,
      status_code: status,
      code: status < 400 ? "ok" : "err",
      message: "",
      trace_id: "t",
      data: payload,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("isBootstrap", () => {
  it("پاسخ سالم را می‌پذیرد", () => {
    expect(isBootstrap(okBootstrap)).toBe(true);
  });

  it("HTML یا رشته را رد می‌کند (نشتی پروکسی خطا)", () => {
    expect(isBootstrap("<html>oops</html>")).toBe(false);
    expect(isBootstrap(null)).toBe(false);
    expect(isBootstrap([])).toBe(false);
  });

  it("اگر فیلد حیاتی وضعیت آزمون نباشد، رد می‌کند", () => {
    const broken = {
      ...okBootstrap,
      exam_status: { ...okBootstrap.exam_status, window_state: undefined },
    };
    expect(isBootstrap(broken)).toBe(false);
  });

  it("وضعیت پنجرهٔ ناشناخته را رد می‌کند", () => {
    const broken = {
      ...okBootstrap,
      exam_status: { ...okBootstrap.exam_status, window_state: "paused" },
    };
    expect(isBootstrap(broken)).toBe(false);
  });

  it("جدول راهبران بی‌آرایه را رد می‌کند", () => {
    const broken = {
      ...okBootstrap,
      leaderboard: { ...okBootstrap.leaderboard, leaderboard: "not-array" },
    };
    expect(isBootstrap(broken)).toBe(false);
  });
});

describe("fetchBootstrapLive", () => {
  it("دادهٔ معتبر را برمی‌گرداند", async () => {
    mockFetch(() => json(okBootstrap));
    const { fetchBootstrapLive } = await import("../live");
    const data = await fetchBootstrapLive();
    expect(data.server_time).toBe("2026-11-14T10:00:00Z");
  });

  it("پاسخ بی‌ساختار را با خطای روشن رد می‌کند", async () => {
    mockFetch(() => json({ hello: "world" }));
    const { fetchBootstrapLive } = await import("../live");
    await expect(fetchBootstrapLive()).rejects.toThrow(/ساختار/);
  });

  it("خطای شبکه بالا می‌رود تا قلاب آن را «کهنه» علامت بزند", async () => {
    mockFetch(() => json({}, 500));
    const { fetchBootstrapLive } = await import("../live");
    await expect(fetchBootstrapLive()).rejects.toBeTruthy();
  });
});

describe("useLiveBootstrap", () => {
  it("پس از تازه‌سازی اولیه، برچسب live می‌شود", async () => {
    const fresh = { ...okBootstrap, server_time: "2026-11-14T11:00:00Z" };
    mockFetch(() => json(fresh));
    const { useLiveBootstrap } = await import("../live");
    const { result } = renderHook(() => useLiveBootstrap(okBootstrap, "2026-11-14T10:00:00Z"));

    expect(result.current.freshness).toBe("shell");
    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.freshness).toBe("live"));
    expect(result.current.lastOk).toBe("2026-11-14T11:00:00Z");
  });

  it("شکست تازه‌سازی دادهٔ قبلی را نگه می‌دارد و stale می‌کند", async () => {
    mockFetch(() => json({}, 500));
    const { useLiveBootstrap } = await import("../live");
    const { result } = renderHook(() => useLiveBootstrap(okBootstrap, "2026-11-14T10:00:00Z"));
    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.freshness).toBe("stale"));
    // داده دست‌نخورده مانده است — عدد صفر یا خالی جای آن ننشسته
    expect(result.current.data.server_time).toBe(okBootstrap.server_time);
  });

  it("درخواست هم‌زمان دوباره فرستاده نمی‌شود", async () => {
    const fn = mockFetch(() => json(okBootstrap, 500));
    const { useLiveBootstrap } = await import("../live");
    const { result } = renderHook(() => useLiveBootstrap(okBootstrap, "2026-11-14T10:00:00Z"));
    await act(async () => {
      void result.current.refresh();
      void result.current.refresh();
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.refreshing).toBe(false));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
