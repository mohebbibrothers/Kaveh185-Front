import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * «کاربر قبلاً ثبت‌نام کرده» — قفلِ رفتارِ ورودِ بازگشتی.
 *
 * ── سناریوی واقعی ─────────────────────────────────────────────────────────
 * کاربر فرم را پر می‌کند، ثبت‌نام می‌شود، ولی دکمهٔ «ورود به آزمون» را نمی‌زند.
 * بار بعد دوباره «ثبت‌نام و شرکت» را می‌زند. قبل از این تغییر، همان فرمِ خالی
 * را می‌دید و باید همه‌چیز را از نو می‌زد (یا پیامِ «قبلاً ثبت‌نام کرده‌اید»).
 *
 * حالا: با تکمیلِ شماره، فرم پرونده را پیدا می‌کند، پیامِ خوش‌آمد می‌دهد،
 * فیلدها را پر می‌کند و دکمه را به «ادامهٔ آزمون با همین پرونده» تبدیل می‌کند.
 */

const lookupParticipant = vi.fn();
const registerParticipant = vi.fn();

vi.mock("@/shared/api/lookup", () => ({
  lookupParticipant: (phone: string) => lookupParticipant(phone),
}));
vi.mock("@/shared/api/exam", () => ({
  registerParticipant: (input: unknown) => registerParticipant(input),
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/shared/api/session", () => ({ saveSession: vi.fn() }));
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

const { RegisterForm } = await import("../RegisterForm");

const PHONE = "09121234567";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

async function typePhone() {
  const input = document.querySelector('input[data-k="phone"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value: PHONE } });
  // تایمرِ ۶۰۰msِ «بررسیِ سابقه» را رد می‌کنیم
  await vi.advanceTimersByTimeAsync(700);
}

describe("ورودِ بازگشتی", () => {
  it("شمارهٔ آشنا ⇒ فرم پر می‌شود و دکمه به «ادامهٔ آزمون» تبدیل می‌شود", async () => {
    lookupParticipant.mockResolvedValue({
      found: true,
      state: "session_ready",
      access: "token-abc",
      is_phone_verified: false,
      user: {
        id: 1,
        first_name: "محمد",
        last_name: "رضایی",
        full_name: "محمد رضایی",
        national_id: "0012345678",
        mosque_id: 7,
        mosque_name: "مسجد النبی",
        mosque_code: "MSQ-07",
        role: "participant",
      },
    });

    render(<RegisterForm />);
    await typePhone();

    await waitFor(() => {
      expect(screen.getByText(/پروندهٔ شما از قبل ثبت شده است/)).toBeTruthy();
    });
    expect(screen.getByText(/محمد رضایی، خوش آمدید/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /ادامهٔ آزمون با همین پرونده/ })).toBeTruthy();

    // فیلدها پر شده‌اند — کاربر نباید دوباره تایپ کند.
    const first = document.querySelector('input[data-k="first"]') as HTMLInputElement;
    const nid = document.querySelector('input[data-k="nid"]') as HTMLInputElement;
    expect(first.value).toBe("محمد");
    expect(nid.value).toBe("0012345678");
  });

  it("شمارهٔ ناشناس ⇒ فرمِ عادی و دکمهٔ ثبت‌نام دست‌نخورده", async () => {
    lookupParticipant.mockResolvedValue({ found: false, state: "not_found" });

    render(<RegisterForm />);
    await typePhone();

    await waitFor(() => {
      expect(lookupParticipant).toHaveBeenCalledWith(PHONE);
    });
    expect(screen.queryByText(/پروندهٔ شما از قبل ثبت شده است/)).toBeNull();
    expect(screen.getByRole("button", { name: /ثبت‌نام و ورود به آزمون/ })).toBeTruthy();
  });

  it("ادامه، فرم را دوباره ارسال نمی‌کند (ثبت‌نامِ تکراری ممنوع)", async () => {
    lookupParticipant.mockResolvedValue({
      found: true,
      state: "session_ready",
      access: "token-abc",
      user: { id: 1, first_name: "زهرا", last_name: "ک", full_name: "زهرا ک", role: "participant" },
    });

    render(<RegisterForm />);
    await typePhone();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ادامهٔ آزمون/ })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /ادامهٔ آزمون/ }));

    await waitFor(() => {
      expect(screen.getByText(/پروندهٔ شما ثبت شد/)).toBeTruthy();
    });
    expect(registerParticipant).not.toHaveBeenCalled();
  });

  it("اگر مسیرِ کمکی خطا بدهد، فرم بلاک نمی‌شود", async () => {
    lookupParticipant.mockRejectedValue(new Error("network"));

    render(<RegisterForm />);
    await typePhone();

    // پس از خطا، فرم باید همان فرمِ عادی بماند و قابل ارسال باشد.
    expect(screen.getByRole("button", { name: /ثبت‌نام و ورود به آزمون/ })).toBeTruthy();
  });
});
