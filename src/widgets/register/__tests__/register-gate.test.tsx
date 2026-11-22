import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * «ثبت‌نام و شرکت» برای کسی که از قبل نشست دارد ⇒ **هرگز فرمِ خالی**.
 *
 * ── باگِ واقعی که این تست قفل می‌کند ──────────────────────────────────────
 * کاربر ثبت‌نام می‌کرد، به صفحهٔ دیگری می‌رفت («قوانین»، «رتبه‌بندی مساجد»)
 * و از هدر دوباره «ثبت‌نام و شرکت» را می‌زد. چون `/register` هیچ نگاهی به
 * نشستِ موجود نمی‌انداخت، **همان فرمِ خالی** بالا می‌آمد. از دیدِ کاربر
 * یعنی «پرونده‌ام پاک شد»؛ در واقع پرونده سرجایش بود و فقط رابط راهش را
 * نمی‌دانست.
 *
 * قراردادِ تازه:
 *   • نشست هست  ⇒ ریدایرکت به `/exam` (آنجا بریفینگ/ادامه/کارنامه).
 *   • نشست نیست ⇒ فرمِ ثبت‌نام، بدونِ هیچ تأخیرِ محسوس.
 */

const replace = vi.fn();
const getSession = vi.fn();
const fetchCurrentAttempt = vi.fn();
const lookupParticipant = vi.fn();
const registerParticipant = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/shared/api/session", () => ({
  getSession: () => getSession() as unknown,
  saveSession: vi.fn(),
  patchSession: vi.fn(),
  clearSession: vi.fn(),
}));
vi.mock("@/shared/api/exam", () => ({
  fetchCurrentAttempt: () => fetchCurrentAttempt() as unknown,
  registerParticipant: (input: unknown) => registerParticipant(input) as unknown,
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock("@/shared/api/lookup", () => ({
  lookupParticipant: (phone: string) => lookupParticipant(phone) as unknown,
}));
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

const SESSION = { access: "a".repeat(40), fullName: "محمد رضایی" };

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
    getSession.mockReturnValue(null);
    render(<RegisterGate />);
    await waitFor(() => {
      expect(screen.getByText(/ثبت‌نام/)).toBeTruthy();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("با نشست و آزمونِ باز: به /exam می‌رود، نه فرمِ خالی", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue({ id: 5, status: "in_progress" });
    render(<RegisterGate />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/exam");
    });
    // پیامِ «پرونده پیدا شد» نشان داده می‌شود، نه فرم.
    expect(screen.getByText(/پروندهٔ شما پیدا شد/)).toBeTruthy();
  });

  it("با نشست و بدونِ آزمونِ باز: بازهم به /exam می‌رود (بریفینگ شروع می‌کند)", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<RegisterGate />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/exam");
    });
  });

  it("نشستِ منقضی (خطای شبکه/۴۰۱): به فرم برمی‌گردد تا کاربر گیر نکند", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockRejectedValue(
      Object.assign(new Error("unauthorized"), { status: 401 }),
    );
    render(<RegisterGate />);
    await waitFor(() => {
      expect(screen.getByText(/ثبت‌نام/)).toBeTruthy();
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
