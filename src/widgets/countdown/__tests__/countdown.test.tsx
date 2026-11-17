import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "../Countdown";

/**
 * شمارش معکوس — چهار خاصیتی که نباید بشکنند.
 *
 * ۱) **کاشی‌بندی**: هر واحد یک کاشیِ مستقل با برچسب خودش است. اگر روزی
 *    کسی دوباره همه را در یک رشته ادغام کند، این تست می‌شکند.
 * ۲) **ارقام فارسی**: «۰۹» نه «09».
 * ۳) **صفر شدن**: پیامِ پایان، نه عددِ منفی.
 * ۴) **دسترس‌پذیری**: برچسبِ کامل برای صفحه‌خوان وجود دارد و هر ثانیه
 *    اعلام نمی‌شود (`aria-live="off"`).
 */

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("هر چهار واحد را با برچسب فارسی نشان می‌دهد", () => {
    render(<Countdown targetSeconds={90061} label="تا پایان" />);
    for (const label of ["روز", "ساعت", "دقیقه", "ثانیه"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("ارقام را فارسی نشان می‌دهد، نه لاتین", () => {
    const { container } = render(<Countdown targetSeconds={3661} label="تا پایان" />);
    const text = container.textContent ?? "";
    // هر چهار رقم باید فارسی باشند: «۰۱» / «۰۱» / «۰۱» / «۰۱»
    expect(text).toMatch(/[۰-۹]/);
    // هیچ رقم لاتینی نباید در بدنهٔ تایمر باشد. (کلاس‌های Tailwind رقم
    // لاتین ندارند؛ فقط متن مهم است.)
    expect(/[0-9]/.test(text)).toBe(false);
  });

  it("وقتی زمان تمام شده، پیام پایان می‌دهد نه عدد منفی", () => {
    render(<Countdown targetSeconds={0} label="تا پایان" endMessage="مهلت تمام شد" />);
    expect(screen.getByText("مهلت تمام شد")).toBeTruthy();
    expect(screen.queryByText("۰۰")).toBeNull();
  });

  it("برچسب کامل را برای صفحه‌خوان دارد و هر ثانیه اعلام نمی‌کند", () => {
    render(<Countdown targetSeconds={90061} label="تا پایان مهلت" />);
    const timer = screen.getByRole("timer");
    expect(timer.getAttribute("aria-live")).toBe("off");
    expect(timer.getAttribute("aria-label")).toContain("تا پایان مهلت");
  });
});
