import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * کارتِ «پرونده ثبت شد» — دروازهٔ ورود به آزمون پس از ثبت‌نام.
 *
 * ── چه چیزی را قفل می‌کند؟ ────────────────────────────────────────────────
 * این کارت جای «پرت‌شدنِ خودکار به /exam» را گرفته است. اگر یک روز کسی
 * دوباره مسیرِ مستقیم را برگرداند، دو چیز از دست می‌رود و این تست‌ها
 * جلویش را می‌گیرند:
 *
 *   ۱) **بازبینی پیش از شروع.** نام، شماره و مسجد باید دیده شوند، چون بعد از
 *      شروعِ آزمون مسجد قفل است و اصلاحش ممکن نیست.
 *   ۲) **کلیکِ آگاهانه.** دکمهٔ شروع فقط با اقدامِ خودِ کاربر `onStart` را
 *      صدا می‌زند؛ هیچ تایمری خودش آزمون را شروع نمی‌کند.
 */

const { ExamEntryCard } = await import("../ExamEntryCard");

const SUMMARY = {
  fullName: "محمد رضایی",
  phoneNumber: "09121234567",
  mosqueName: "مسجد حضرت مهدی (عج)",
  mosqueCode: "MSQ-17",
  mosqueOrder: 3,
};

function renderCard(over: Partial<Parameters<typeof ExamEntryCard>[0]> = {}) {
  const onStart = vi.fn();
  const onEdit = vi.fn();
  render(
    <ExamEntryCard
      summary={SUMMARY}
      verified={false}
      issuedAt={Date.now()}
      onStart={onStart}
      onEdit={onEdit}
      starting={false}
      {...over}
    />,
  );
  return { onStart, onEdit };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ExamEntryCard", () => {
  it("نام، شماره و مسجدِ ثبت‌شده را نشان می‌دهد تا کاربر بازبینی کند", () => {
    renderCard();
    expect(screen.getByText("محمد رضایی")).toBeTruthy();
    expect(screen.getByText("09121234567")).toBeTruthy();
    expect(screen.getAllByText(/مسجد حضرت مهدی/).length).toBeGreaterThan(0);
    expect(screen.getByText("MSQ-17")).toBeTruthy();
  });

  it("دکمهٔ ورود فقط با کلیکِ کاربر آزمون را شروع می‌کند", () => {
    const { onStart } = renderCard();
    const btn = screen.getByRole("button", { name: /ورود به آزمون و شروع/ });
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("وقتی نشست با کد ساخته نشده، ادعای «تأییدِ شماره» نمی‌کند", () => {
    renderCard({ verified: false });
    expect(screen.queryByText(/تأیید شده است/)).toBeNull();
    expect(screen.getByText(/ثبت‌نام انجام شد/)).toBeTruthy();
  });

  it("وقتی با کد تأیید شده، همان را صادقانه می‌گوید", () => {
    renderCard({ verified: true });
    expect(screen.getByText(/تأیید شده است/)).toBeTruthy();
  });

  it("پس از پایانِ اعتبارِ نشست، دکمهٔ شروع غیرفعال است", () => {
    // ۴۰ دقیقه پیش صادر شده ⇒ از ۳۰ دقیقه گذشته.
    renderCard({ issuedAt: Date.now() - 40 * 60 * 1000 });
    const btn = screen.getByRole("button", { name: /ورود به آزمون و شروع/ });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/اعتبارِ این نشست تمام شد/)).toBeTruthy();
  });

  it("مسیرِ اصلاحِ اطلاعات همیشه در دسترس است", () => {
    const { onEdit } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: /اصلاح کن/ }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
