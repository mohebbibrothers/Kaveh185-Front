import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * دکمهٔ هدر — تنها دکمه‌ای که کاربرِ بازگشتی واقعاً می‌زند.
 *
 * ── باگی که این تست قفل می‌کند ────────────────────────────────────────────
 * این دکمه همیشه به `/register` می‌رفت. کاربرِ ثبت‌نام‌شده دوباره می‌زد و
 * فرمِ خالی می‌دید؛ نتیجه: «ثبت‌نامم پاک شد». حالا با وجودِ نشست، دکمه به
 * `/exam` می‌رود و متنش «ادامهٔ آزمون» است.
 */

const getSession = vi.fn();
vi.mock("@/shared/api/session", () => ({
  getSession: () => getSession() as unknown,
}));

const { EntryCta } = await import("../EntryCta");

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
    getSession.mockReturnValue(null);
    render(<EntryCta />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/register");
    await waitFor(() => {
      expect(link.textContent).toContain("ثبت‌نام و شرکت");
    });
  });

  it("با نشست: «ادامهٔ آزمون» به /exam — نه فرمِ ثبت‌نام", async () => {
    getSession.mockReturnValue({ access: "a".repeat(40), fullName: "محمد" });
    render(<EntryCta />);
    const link = screen.getByRole("link");
    await waitFor(() => {
      expect(link.getAttribute("href")).toBe("/exam");
    });
    expect(link.textContent).toContain("ادامهٔ آزمون");
  });

  it("نسخهٔ موبایل هم همان تصمیم را می‌گیرد", async () => {
    getSession.mockReturnValue({ access: "a".repeat(40), fullName: "محمد" });
    render(<EntryCta variant="mobile" />);
    const link = screen.getByRole("link");
    await waitFor(() => {
      expect(link.getAttribute("href")).toBe("/exam");
    });
  });
});
