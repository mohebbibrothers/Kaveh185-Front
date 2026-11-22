import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * بریفینگِ پیش از آزمون.
 *
 * ── چرا این تست حیاتی است؟ ────────────────────────────────────────────────
 * آزمون یک‌بارمصرف و زمان‌دار است. اگر دکمهٔ «شروع» بدونِ تیکِ آگاهی فعال
 * شود، یک کلیکِ اشتباه، پنج دقیقه و تنها فرصتِ کاربر را می‌سوزاند. این تست
 * قفل می‌کند که:
 *
 *   ۱) تا تیک نخورده، دکمه غیرفعال است و `onStart` صدا زده نمی‌شود.
 *   ۲) با تیک، دکمه فعال می‌شود و فقط یک بار `onStart` می‌رود.
 *   ۳) قواعدِ سخت (۵ پرسش، ۵ دقیقه، ترتیبِ اجباری، یک‌بار) دیده می‌شوند —
 *      این‌ها همان چیزهایی است که کاربر بعداً به‌خاطرشان شکایت می‌کند.
 *   ۴) نام و مسجد در متن می‌آید تا کاربر بداند به نامِ چه کسی آزمون می‌دهد.
 */

const { Briefing } = await import("../Briefing");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Briefing", () => {
  it("تا تیکِ آگاهی، دکمهٔ شروع غیرفعال است", () => {
    const onStart = vi.fn();
    render(<Briefing fullName="زهرا محمدی" mosqueName="مسجد النبی" onStart={onStart} />);

    const btn = screen.getByRole("button", { name: /شروعِ آزمون/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onStart).not.toHaveBeenCalled();
  });

  it("بعد از تیک، دکمه فعال و یک‌بار اجرا می‌شود", () => {
    const onStart = vi.fn();
    render(<Briefing fullName="زهرا محمدی" mosqueName="مسجد النبی" onStart={onStart} />);

    fireEvent.click(screen.getByRole("checkbox"));
    const btn = screen.getByRole("button", { name: /شروعِ آزمون/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("قواعدِ سخت و نام و مسجد را نشان می‌دهد", () => {
    render(<Briefing fullName="زهرا محمدی" mosqueName="مسجد النبی" onStart={vi.fn()} />);
    expect(screen.getByText(/پنج پرسش چهارگزینه‌ای/)).toBeTruthy();
    expect(screen.getByText(/پنج دقیقه، یک‌بار برای همیشه/)).toBeTruthy();
    expect(screen.getByText(/ترتیب اجباری است/)).toBeTruthy();
    expect(screen.getByText(/زهرا محمدی/)).toBeTruthy();
    expect(screen.getByText(/مسجد النبی/)).toBeTruthy();
  });

  it("بدونِ نام و مسجد هم می‌شکند (حالتِ نشستِ ناقص)", () => {
    render(<Briefing fullName="" mosqueName={null} onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: /شروعِ آزمون/ })).toBeTruthy();
  });
});
