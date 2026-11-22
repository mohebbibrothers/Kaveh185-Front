import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * دکمهٔ هدر — تنها دکمه‌ای که کاربرِ بازگشتی واقعاً می‌زند.
 *
 * ── باگی که این تست قفل می‌کند ────────────────────────────────────────────
 * این دکمه همیشه به `/register` می‌رفت. کاربرِ ثبت‌نام‌شده دوباره می‌زد و
 * فرمِ خالی می‌دید؛ نتیجه: «ثبت‌نامم پاک شد». حالا مقصد و برچسب از کشِ
 * هویت می‌آید و **سرور** تعیینش می‌کند، نه یک شرطِ محلی.
 */

const resolveIdentity = vi.fn();

vi.mock("@/shared/api/identity", async () => {
  const actual = await import("@/shared/api/identity");
  return {
    ...actual,
    resolveIdentity: (...a: unknown[]) => resolveIdentity(...a) as unknown,
    readIdentitySnapshot: () => null,
    subscribeIdentity: () => () => {},
    invalidateIdentity: () => {},
  };
});
vi.mock("@/shared/api/session", () => ({
  getSession: () => null,
  saveSession: vi.fn(),
  patchSession: vi.fn(),
  clearSession: vi.fn(),
  SESSION_EVENT: "k185:session",
}));

const { EntryCta } = await import("../EntryCta");

const identity = (over: Record<string, unknown> = {}) => ({
  state: "session",
  fullName: "محمد",
  mosqueName: null,
  trackingCode: null,
  phoneHint: "",
  canEnterExam: true,
  hasInProgress: false,
  completed: false,
  next: { path: "/exam", label: "ادامهٔ آزمون", reason: "" },
  reason: "",
  at: Date.now(),
  stale: false,
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

describe("EntryCta", () => {
  it("بی‌نشست: «ثبت‌نام و شرکت» به /register", async () => {
    resolveIdentity.mockResolvedValue(
      identity({
        state: "no_session",
        next: { path: "/register", label: "ثبت‌نام و شرکت", reason: "" },
      }),
    );
    render(<EntryCta />);
    await waitFor(() => {
      expect(screen.getByRole("link").getAttribute("data-identity")).toBe("no_session");
    });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/register");
    expect(link.textContent).toContain("ثبت‌نام و شرکت");
  });

  it("با نشست: مقصد و برچسب را از سرور می‌گیرد — نه فرمِ ثبت‌نام", async () => {
    resolveIdentity.mockResolvedValue(identity());
    render(<EntryCta />);
    const link = screen.getByRole("link");
    await waitFor(() => {
      expect(link.getAttribute("href")).toBe("/exam");
    });
    expect(link.textContent).toContain("ادامهٔ آزمون");
  });

  it("کاربرِ تمام‌شده: دکمه به کارنامه می‌رود", async () => {
    resolveIdentity.mockResolvedValue(
      identity({
        state: "completed",
        completed: true,
        next: { path: "/receipt?code=K185-2", label: "دیدنِ کارنامه", reason: "" },
      }),
    );
    render(<EntryCta />);
    await waitFor(() => {
      expect(screen.getByRole("link").getAttribute("href")).toBe("/receipt?code=K185-2");
    });
    expect(screen.getByRole("link").textContent).toContain("دیدنِ کارنامه");
  });

  it("نسخهٔ موبایل هم همان تصمیم را می‌گیرد", async () => {
    resolveIdentity.mockResolvedValue(identity());
    render(<EntryCta variant="mobile" />);
    await waitFor(() => {
      expect(screen.getByRole("link").getAttribute("href")).toBe("/exam");
      expect(screen.getByRole("link").textContent).toContain("ادامهٔ آزمون");
    });
  });

  it("آفلاین: همچنان دکمهٔ آزمون، با نشانِ آفلاین — نه «ثبت‌نام»", async () => {
    resolveIdentity.mockResolvedValue(identity({ state: "offline", stale: true }));
    render(<EntryCta />);
    await waitFor(() => {
      expect(screen.getByRole("link").getAttribute("data-identity")).toBe("offline");
    });
    const link = screen.getByRole("link");
    // ⚠️ نکتهٔ اصلی: مقصد همچنان /exam است — نه /register.
    expect(link.getAttribute("href")).toBe("/exam");
    expect(link.getAttribute("title")).toContain("پروندهٔ ذخیره‌شده");
  });
});
