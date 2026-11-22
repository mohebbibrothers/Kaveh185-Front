import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * صفحهٔ `/login` — «چه دکمه‌ای باید ببینم؟»
 *
 * ── باگِ واقعی ────────────────────────────────────────────────────────────
 * نسخهٔ قبل فقط وقتی `attempt !== null` بود دکمهٔ آزمون می‌داد. نتیجه: کاربری
 * که ثبت‌نام کرده بود ولی آزمونش را شروع نکرده بود، روی `/login` کارتِ
 * «نشست فعال» و «کارنامهٔ من» می‌دید و **هیچ راهی به آزمون نداشت** — دقیقاً
 * گزارشِ «بعد از ثبت‌نام دوباره فرم می‌آید / دکمهٔ شرکت نیست».
 *
 * قراردادِ تازه:
 *   • نشست + آزمونِ باز       ⇒ «ادامهٔ آزمون» → `/exam`
 *   • نشست + بدونِ آزمون      ⇒ «ورود به آزمون» → `/exam`
 *   • نشست + کارنامه          ⇒ «کارنامهٔ من» → `/receipt?code=…`
 *   • بی‌نشست                 ⇒ فرمِ پیدا کردنِ پرونده با شماره + ورودِ مدیران
 */

const getSession = vi.fn();
const fetchCurrentAttempt = vi.fn();
const clearSession = vi.fn();
const patchSession = vi.fn();
const adminSignIn = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/shared/api/session", () => ({
  getSession: () => getSession() as unknown,
  clearSession: () => clearSession() as unknown,
  patchSession: (p: unknown) => patchSession(p) as unknown,
  saveSession: vi.fn(),
}));
vi.mock("@/shared/api/exam", () => ({
  fetchCurrentAttempt: () => fetchCurrentAttempt() as unknown,
  registerParticipant: vi.fn(),
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock("@/shared/api/admin-auth", () => ({
  adminSignIn: (id: string, pw: string) => adminSignIn(id, pw) as unknown,
  ADMIN_PATH: "secure-kaveh185-admin/",
}));
vi.mock("@/shared/api/lookup", () => ({
  lookupParticipant: vi.fn(),
}));

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
  it("بی‌نشست: فرمِ پیدا کردنِ پرونده و ورودِ مدیران را می‌دهد", async () => {
    getSession.mockReturnValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("روی این دستگاه نشستی نیست")).toBeTruthy();
    });
    expect(screen.getByText("ورودِ مدیران و اپراتورها")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "ادامهٔ آزمون" })).toBeNull();
  });

  it("نشست بدونِ آزمون: «ورود به آزمون» را می‌دهد، نه فقط کارنامه", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("محمد رضایی")).toBeTruthy();
    });
    const cta = screen.getByRole("link", { name: "ورود به آزمون" });
    expect(cta.getAttribute("href")).toBe("/exam");
  });

  it("نشست با آزمونِ باز: «ادامهٔ آزمون» را می‌دهد", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue({ id: 9, status: "in_progress" });
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "ادامهٔ آزمون" })).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "ادامهٔ آزمون" }).getAttribute("href")).toBe("/exam");
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

  it("ورودِ مدیر با ۴۰۱: راهنمایِ set_admin_password را نشان می‌دهد", async () => {
    getSession.mockReturnValue(null);
    adminSignIn.mockResolvedValue({ kind: "no_password" });
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("ورودِ مدیران و اپراتورها")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("ورودِ مدیران و اپراتورها"));
    await waitFor(() => {
      expect(screen.getByText("شمارهٔ همراه یا کد ملی")).toBeTruthy();
    });
    // دو ورودیِ شماره در صفحه هست (پیدا کردنِ پرونده + ورودِ مدیر)؛
    // ورودیِ بلوکِ مدیر، آخرینِ آن‌ها در DOM است.
    const lastPhone = screen.getAllByPlaceholderText("09xxxxxxxxx").at(-1) as HTMLInputElement;
    fireEvent.change(lastPhone, { target: { value: "09121234567" } });
    const lastPassword = screen.getAllByPlaceholderText("••••••••").at(-1) as HTMLInputElement;
    fireEvent.change(lastPassword, { target: { value: "secret-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "ورود به پنل مدیریت" }));
    await waitFor(() => {
      expect(screen.getByText(/set_admin_password/)).toBeTruthy();
    });
  });

  it("خروج: نشست پاک می‌شود و به حالتِ بی‌نشست برمی‌گردد", async () => {
    getSession.mockReturnValue(SESSION);
    fetchCurrentAttempt.mockResolvedValue(null);
    render(<AccountView />);
    await waitFor(() => {
      expect(screen.getByText("محمد رضایی")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "خروج از این دستگاه" }));
    await waitFor(() => {
      expect(screen.getByText("روی این دستگاه نشستی نیست")).toBeTruthy();
    });
    expect(clearSession).toHaveBeenCalled();
  });
});
