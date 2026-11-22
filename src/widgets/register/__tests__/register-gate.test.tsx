import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * دروازهٔ `/register` — «کاربرِ دارای پرونده هرگز فرمِ خالی نمی‌بیند».
 *
 * ── باگِ واقعی ────────────────────────────────────────────────────────────
 * «ثبت‌نام می‌کنم، به خانه می‌روم، دوباره «ثبت‌نام و شرکت» را می‌زنم و همان
 * فرم می‌آید.» علت: دروازه فقط `localStorage` را می‌دید و اگر توکن منقضی
 * بود، ۴۰۱ می‌گرفت و فرم را نشان می‌داد. حالا تصمیم از کشِ هویت می‌آید که
 * خودش نشست را تمدید می‌کند.
 */

const replace = vi.fn();
const resolveIdentity = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));
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
vi.mock("@/shared/api/exam", () => ({
  fetchCurrentAttempt: vi.fn(),
  registerParticipant: vi.fn(),
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock("@/shared/api/lookup", () => ({ lookupParticipant: vi.fn() }));
vi.mock("@/shared/api/use-bootstrap", () => ({
  useBootstrap: () => ({
    phase: "ready",
    data: {
      mosques: [
        { id: 7, code: "MSQ-07", name: "مسجد النبی", neighborhood: "کاوه", display_order: 2 },
      ],
    },
  }),
}));

const { RegisterGate } = await import("../RegisterGate");

const identity = (over: Record<string, unknown> = {}) => ({
  state: "session",
  fullName: "محمد رضایی",
  mosqueName: "مسجد النبی",
  trackingCode: null,
  phoneHint: "09***",
  canEnterExam: true,
  hasInProgress: false,
  completed: false,
  next: { path: "/exam", label: "ورود به آزمون", reason: "آماده است" },
  reason: "آماده است",
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

describe("RegisterGate", () => {
  it("بی‌نشست: فرمِ ثبت‌نام را نشان می‌دهد و جایی نمی‌رود", async () => {
    resolveIdentity.mockResolvedValue(
      identity({
        state: "no_session",
        next: { path: "/register", label: "ثبت‌نام و شرکت", reason: "" },
      }),
    );
    render(<RegisterGate />);
    await waitFor(() => {
      expect(screen.getByText(/هفتهٔ بسیج|ثبت‌نام/)).toBeTruthy();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("با نشست: به /exam می‌رود، نه فرم", async () => {
    resolveIdentity.mockResolvedValue(identity());
    render(<RegisterGate />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/exam");
    });
    expect(screen.getByText(/پروندهٔ شما پیدا شد/)).toBeTruthy();
  });

  it("کاربرِ تمام‌شده: به کارنامه می‌رود", async () => {
    resolveIdentity.mockResolvedValue(
      identity({
        state: "completed",
        completed: true,
        next: { path: "/receipt?code=K185-1", label: "دیدنِ کارنامه", reason: "" },
      }),
    );
    render(<RegisterGate />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/receipt?code=K185-1");
    });
    expect(screen.getByText(/کارنامهٔ شما آماده است/)).toBeTruthy();
  });

  it("آفلاین: بازهم به /exam می‌رود (نشستِ محلی) نه فرمِ خالی", async () => {
    resolveIdentity.mockResolvedValue(identity({ state: "offline", stale: true }));
    render(<RegisterGate />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/exam");
    });
  });
});
