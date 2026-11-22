import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * صفحهٔ `/login` — «چه دکمه‌ای باید ببینم؟» و «چطور پرونده‌ام را پیدا کنم؟»
 *
 * ── سه چیزی که این تست قفل می‌کند ────────────────────────────────────────
 *  ۱) نشستِ فعال ⇒ دکمهٔ درست (ادامه / ورود / کارنامه)، نه هیچ چیزِ دیگر.
 *  ۲) **بلوکِ «ورودِ مدیران و اپراتورها» دیگر وجود ندارد** — به درخواست
 *     صریحِ کارفرما: این صفحه برای شرکت‌کننده است؛ ورودِ مدیر از مسیرِ
 *     خودش (پنلِ جنگو روی دامنهٔ API) انجام می‌شود.
 *  ۳) بازیابیِ پرونده **دو عامل** می‌خواهد: شماره + کد ملی. شمارهٔ تنها
 *     نباید هیچ درخواستی بفرستد.
 */

const getSession = vi.fn();
const fetchCurrentAttempt = vi.fn();
const clearSession = vi.fn();
const patchSession = vi.fn();
const lookupParticipant = vi.fn();
const saveSession = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/shared/api/session", () => ({
  getSession: () => getSession() as unknown,
  clearSession: () => clearSession() as unknown,
  patchSession: (p: unknown) => patchSession(p) as unknown,
  saveSession: (s: unknown) => saveSession(s) as unknown,
}));
vi.mock("@/shared/api/exam", () => ({
  fetchCurrentAttempt: () => fetchCurrentAttempt() as unknown,
  registerParticipant: vi.fn(),
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock("@/shared/api/lookup", () => ({
  lookupParticipant: (p: string, n: string) => lookupParticipant(p, n) as unknown,
}));
vi.mock("@/shared/api/identity", async () => {
  const actual = await import("@/shared/api/identity");
  return {
    ...actual,
    invalidateIdentity: () => {},
    resolveIdentity: () => Promise.resolve(null),
    readIdentitySnapshot: () => null,
    subscribeIdentity: () => () => {},
  };
});
vi.mock("@/widgets/register/use-draft", () => ({ clearDraft: () => {} }));

const { AccountView } = await import("../AccountView");

const SESSION = { access: "a".repeat(40), fullName: "محمد رضایی", mosqueName: "مسجد النبی" };

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

describe("AccountView (/login)", () => {
  it("بی‌نشست: کارتِ «پروندهٔ من را پیدا کن» با هر دو فیلد", async () => {
    getSession.mockReturnValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("پروندهٔ من را پیدا کن")).toBeTruthy();
    });
    expect(screen.getByPlaceholderText("09xxxxxxxxx")).toBeTruthy();
    expect(screen.getByText("کد ملی")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "ادامهٔ آزمون" })).toBeNull();
  });

  it("بلوکِ «ورودِ مدیران و اپراتورها» حذف شده است", async () => {
    getSession.mockReturnValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("پروندهٔ من را پیدا کن")).toBeTruthy();
    });
    expect(screen.queryByText(/ورودِ مدیران/)).toBeNull();
    expect(screen.queryByRole("button", { name: /ورود به پنل مدیریت/ })).toBeNull();
  });

  it("شمارهٔ تنها هیچ درخواستی نمی‌فرستد (دو عامل الزامی است)", async () => {
    getSession.mockReturnValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("09xxxxxxxxx")).toBeTruthy();
    });
    fireEvent.change(screen.getByPlaceholderText("09xxxxxxxxx"), {
      target: { value: "09121234567" },
    });
    const submit = screen.getByRole("button", { name: /پیدا کردنِ پرونده/ });
    expect(submit.hasAttribute("disabled")).toBe(true);
    fireEvent.click(submit);
    expect(lookupParticipant).not.toHaveBeenCalled();
  });

  it("جفتِ کامل: پرونده پیدا می‌شود و به آزمون می‌رود", async () => {
    getSession.mockReturnValue(null);
    lookupParticipant.mockResolvedValue({
      found: true,
      state: "session_ready",
      access: "b".repeat(40),
      user: { full_name: "سارا" },
    });
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("09xxxxxxxxx")).toBeTruthy();
    });
    fireEvent.change(screen.getByPlaceholderText("09xxxxxxxxx"), {
      target: { value: "09121234567" },
    });
    fireEvent.change(screen.getByPlaceholderText("۱۰ رقم"), { target: { value: "0013542419" } });
    fireEvent.click(screen.getByRole("button", { name: /پیدا کردنِ پرونده/ }));
    await waitFor(() => {
      expect(lookupParticipant).toHaveBeenCalledWith("09121234567", "0013542419");
    });
    await waitFor(() => {
      expect(saveSession).toHaveBeenCalled();
    });
  });

  it("آزمون‌داده: به کارنامه اشاره می‌کند، نه به آزمون", async () => {
    getSession.mockReturnValue(null);
    lookupParticipant.mockResolvedValue({
      found: true,
      state: "exam_completed",
      tracking_code: "K185-777",
      user: { full_name: "سارا" },
    });
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("09xxxxxxxxx")).toBeTruthy();
    });
    fireEvent.change(screen.getByPlaceholderText("09xxxxxxxxx"), {
      target: { value: "09121234567" },
    });
    fireEvent.change(screen.getByPlaceholderText("۱۰ رقم"), { target: { value: "0013542419" } });
    fireEvent.click(screen.getByRole("button", { name: /پیدا کردنِ پرونده/ }));
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "دیدنِ کارنامه" })).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "دیدنِ کارنامه" }).getAttribute("href")).toBe(
      "/receipt?code=K185-777",
    );
  });

  it("نشست بدونِ آزمون: «ورود به آزمون» را می‌دهد", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("محمد رضایی")).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "ورود به آزمون" }).getAttribute("href")).toBe("/exam");
  });

  it("نشست با آزمونِ باز: «ادامهٔ آزمون» را می‌دهد", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue({ id: 9, status: "in_progress" });
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "ادامهٔ آزمون" })).toBeTruthy();
    });
  });

  it("نشست با کارنامه: «کارنامهٔ من» با کدِ رهگیری", async () => {
    getSession.mockReturnValue({ ...SESSION, trackingCode: "K185-777" });
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "کارنامهٔ من" })).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "کارنامهٔ من" }).getAttribute("href")).toBe(
      "/receipt?code=K185-777",
    );
  });

  it("خروج: نشست و کشِ هویت پاک می‌شوند", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("محمد رضایی")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "خروج از این دستگاه" }));
    await waitFor(() => {
      expect(screen.getByText("پروندهٔ من را پیدا کن")).toBeTruthy();
    });
    expect(clearSession).toHaveBeenCalled();
  });
});
