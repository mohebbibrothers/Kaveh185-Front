import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * گامِ کدِ تأیید (بله) — دورِ ۲۸.
 *
 * ── چه چیزی را قفل می‌کند؟ ────────────────────────────────────────────────
 * این گام تنها جایی است که کاربر می‌تواند از «ثبت‌نام» به «آزمون» برسد؛ اگر
 * یک حالتش بی‌صدا بشکند، هیچ‌کس وارد آزمون نمی‌شود و خطا در لاگ دیده نمی‌شود.
 * پس:
 *   ۱) کدِ ۶ رقمی با ارقامِ فارسی هم پذیرفته می‌شود (کاربر با صفحه‌کلیدِ
 *      فارسی تایپ می‌کند؛ اگر فقط `\d` را قبول کنیم، هیچ‌کس وارد نمی‌شود).
 *   ۲) تأییدِ موفق ⇒ `onVerified` با توکنِ نشست صدا زده می‌شود.
 *   ۳) کدِ نادرست ⇒ پیامِ سرور **زیرِ همان ورودی** و ورودی پاک می‌شود.
 *   ۴) کدِ اتصالِ بله دیده می‌شود و ارسالِ دوباره پس از فاصله زمانی ممکن است.
 */

const verifyOtp = vi.fn();
const requestOtp = vi.fn();
const fetchBaleStatus = vi.fn();

vi.mock("@/shared/api/exam", () => ({
  verifyOtp: (phone: string, code: string) => verifyOtp(phone, code),
  requestOtp: (phone: string) => requestOtp(phone),
}));

vi.mock("@/shared/api/bale", () => ({
  fetchBaleStatus: (phone: string) => fetchBaleStatus(phone),
}));

vi.mock("@/shared/api/client", () => {
  class ApiError extends Error {
    status: number;
    errors?: Record<string, unknown>;
    constructor(message: string, status = 400, errors?: Record<string, unknown>) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.errors = errors;
    }
    fieldError(key: string): string | undefined {
      const v = this.errors?.[key];
      return typeof v === "string" ? v : undefined;
    }
  }
  return { ApiError };
});

const { OtpStep } = await import("../OtpStep");
const { ApiError } = await import("@/shared/api/client");

const PHONE = "09121234567";

/**
 * ساختِ خطای API در تست.
 *
 * تایپِ واقعیِ `ApiError` یک شیء می‌گیرد، ولی ماکِ این تست سازندهٔ ساده‌تری
 * دارد؛ این ریخت‌گیریِ کوچک فقط همین تفاوت را پل می‌زند تا تست با تایپِ
 * تولیدیِ خودِ پروژه سبز بماند.
 */
type ApiErrorCtor = new (
  message: string,
  status?: number,
  errors?: Record<string, unknown>,
) => Error;
const makeApiError = (message: string, status = 400, errors?: Record<string, unknown>): Error =>
  new (ApiError as unknown as ApiErrorCtor)(message, status, errors);

function setup(initial: Record<string, unknown> | null = null, onVerified = vi.fn()) {
  render(
    <OtpStep phoneNumber={PHONE} initial={initial} onVerified={onVerified} onBack={vi.fn()} />,
  );
  return { onVerified };
}

beforeEach(() => {
  verifyOtp.mockReset();
  requestOtp.mockReset();
  fetchBaleStatus.mockReset();
  fetchBaleStatus.mockResolvedValue({
    bale_configured: true,
    bot_username: "kaveh185_bot",
    linked: true,
  });
});

afterEach(cleanup);

describe("OtpStep", () => {
  it("پیامِ تحویل را بر اساسِ کانالِ واقعی می‌گوید", async () => {
    setup({ delivery: "bale", expires_in_seconds: 180 });
    expect(screen.getByText(/کد به بلهٔ شمارهٔ/)).toBeTruthy();
    await waitFor(() => {
      expect(fetchBaleStatus).toHaveBeenCalledWith(PHONE);
    });
  });

  it("اگر کانالی در دسترس نبود، بن‌بست نمی‌سازد و راهِ بله را نشان می‌دهد", async () => {
    setup({ delivery: "none", bale_link: { code: "A7K2QF", bot_username: "kaveh185_bot" } });
    expect(screen.getByText(/کد از راهِ بله می‌آید/)).toBeTruthy();
    expect(screen.getByText("A7K2QF")).toBeTruthy();
  });

  it("کدِ فارسی را می‌پذیرد و تأییدِ موفق نشست می‌دهد", async () => {
    verifyOtp.mockResolvedValue({ access: "token-abc", tokens: {}, user: {} });
    const { onVerified } = setup({ delivery: "bale", expires_in_seconds: 180 });

    fireEvent.change(screen.getByLabelText("کدِ تأیید"), { target: { value: "۱۲۳۴۵۶" } });
    fireEvent.click(screen.getByRole("button", { name: /تأیید و ورود/ }));

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith(PHONE, "123456");
    });
    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledWith("token-abc");
    });
  });

  it("کدِ نادرست ⇒ پیامِ فیلد و پاک‌شدنِ ورودی", async () => {
    verifyOtp.mockRejectedValue(makeApiError("کد نادرست است.", 400, { code: "کد نادرست است." }));
    setup({ delivery: "bale", expires_in_seconds: 180 });

    const input = screen.getByLabelText("کدِ تأیید") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "999999" } });
    fireEvent.click(screen.getByRole("button", { name: /تأیید و ورود/ }));

    await waitFor(() => {
      expect(screen.getByText("کد نادرست است.")).toBeTruthy();
    });
    expect(input.value).toBe("");
  });

  it("دکمه تا کامل‌شدنِ ۶ رقم غیرفعال است", () => {
    setup({ delivery: "bale", expires_in_seconds: 180 });
    const button = screen.getByRole("button", { name: /تأیید و ورود/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("کدِ تأیید"), { target: { value: "12345" } });
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("کدِ تأیید"), { target: { value: "123456" } });
    expect(button.disabled).toBe(false);
  });

  it("ارسالِ دوباره کدِ تازه می‌گیرد و شمارشِ معکوس را ریست می‌کند", async () => {
    requestOtp.mockResolvedValue({ delivery: "bale", expires_in_seconds: 180 });
    setup({ delivery: "none", expires_in_seconds: 0 });

    expect(screen.getByText(/زمانِ این کد تمام شد/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /ارسال دوبارهٔ کد/ }));

    await waitFor(() => {
      expect(requestOtp).toHaveBeenCalledWith(PHONE);
    });
    await waitFor(() => {
      expect(screen.getByText(/کد تازه صادر شد/)).toBeTruthy();
    });
  });

  it("خطای ۴۲۹ ⇒ دکمهٔ ارسال دوباره تا پایانِ فاصله زمانی خاموش می‌ماند", async () => {
    requestOtp.mockRejectedValue(makeApiError("بیش از حد تلاش.", 429));
    setup({ delivery: "none", expires_in_seconds: 0 });

    fireEvent.click(screen.getByRole("button", { name: /ارسال دوبارهٔ کد/ }));
    await waitFor(() => {
      expect(screen.getByText("بیش از حد تلاش.")).toBeTruthy();
    });
    const again = screen.getByRole("button", { name: /ارسال دوباره تا/ }) as HTMLButtonElement;
    expect(again.disabled).toBe(true);
  });
});
