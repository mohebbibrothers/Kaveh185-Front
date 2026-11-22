import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * انتخابِ مسجد — comboboxِ واقعی.
 *
 * ── چه چیزی خراب بود؟ ────────────────────────────────────────────────────
 * نسخهٔ قبل یک فهرستِ همیشه‌بازِ `divide-y` بود؛ با ۱۷ مسجد، فرم را به یک
 * ستونِ بلند بدل می‌کرد که با زبانِ بصریِ سایت نمی‌خواند. این تست‌ها سه چیز
 * را قفل می‌کنند تا در بازطراحی‌های بعدی گم نشوند:
 *
 *   ۱) فهرست **بسته** شروع می‌شود (فرم کوتاه می‌ماند).
 *   ۲) جست‌وجو با نرمال‌سازیِ فارسی کار می‌کند (`ي`/`ی`, ارقامِ فارسی).
 *   ۳) کیبورد کامل کار می‌کند: ↑/↓/Enter/Escape.
 */

const { MosquePicker } = await import("../MosquePicker");

const MOSQUES = [
  { id: 1, code: "MSQ-01", name: "مسجد حضرت مهدی (عج)", neighborhood: "کاوه", display_order: 1 },
  { id: 2, code: "MSQ-02", name: "مسجد النبی", neighborhood: "شهرک ولی‌عصر", display_order: 2 },
  { id: 3, code: "MSQ-03", name: "مسجد امام حسین", neighborhood: "میدان نامجو", display_order: 3 },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderPicker(value: number | null = null, onChange = vi.fn()) {
  render(
    <MosquePicker
      mosques={MOSQUES}
      value={value}
      onChange={onChange}
      loading={false}
      failed={false}
    />,
  );
  return { onChange };
}

describe("MosquePicker", () => {
  it("فهرست بسته شروع می‌شود — فرم شلوغ نمی‌شود", () => {
    renderPicker();
    expect(screen.queryByRole("listbox")).toBeNull();
    const combo = screen.getByRole("combobox");
    expect(combo.getAttribute("aria-expanded")).toBe("false");
  });

  it("با فوکوس باز می‌شود و همهٔ مساجد را نشان می‌دهد", () => {
    renderPicker();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
  });

  it("جست‌وجو روی نام، محله و کد کار می‌کند", () => {
    renderPicker();
    const combo = screen.getByRole("combobox");
    fireEvent.focus(combo);
    fireEvent.change(combo, { target: { value: "نامجو" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("مسجد امام حسین")).toBeTruthy();

    fireEvent.change(combo, { target: { value: "MSQ-02" } });
    // کدِ مسجد با حروف لاتین هم پیدا می‌شود.
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("نرمال‌سازیِ فارسی: «ي» عربی و «ی» فارسی یکی‌اند", () => {
    renderPicker();
    const combo = screen.getByRole("combobox");
    fireEvent.focus(combo);
    fireEvent.change(combo, { target: { value: "وليعصر" } }); // ي عربی، بدونِ نیم‌فاصله
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("کلیک روی گزینه آن را انتخاب می‌کند و فهرست بسته می‌شود", () => {
    const onChange = vi.fn();
    renderPicker(null, onChange);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("مسجد النبی"));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("کیبورد: ↓ و Enter انتخاب می‌کنند، Escape می‌بندد", () => {
    const onChange = vi.fn();
    renderPicker(null, onChange);
    const combo = screen.getByRole("combobox");
    fireEvent.focus(combo);
    // فوکوس فهرست را باز می‌کند و مکان‌نما روی گزینهٔ اول است؛ یک ↓ او را
    // به گزینهٔ دوم می‌برد و Enter انتخابش می‌کند.
    fireEvent.keyDown(combo, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(combo, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(2); // گزینهٔ دوم

    cleanup();
    const second = vi.fn();
    renderPicker(null, second);
    const c2 = screen.getByRole("combobox");
    fireEvent.focus(c2);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(c2, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("نتیجه‌ای نبود: پیامِ راهنما، نه فهرستِ خالی", () => {
    renderPicker();
    const combo = screen.getByRole("combobox");
    fireEvent.focus(combo);
    fireEvent.change(combo, { target: { value: "زیبا" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/مسجدی با این نام پیدا نشد/)).toBeTruthy();
  });

  it("پس از انتخاب، کارتِ تأیید با نام، محله و کد", () => {
    renderPicker(1);
    expect(screen.getByText("مسجد حضرت مهدی (عج)")).toBeTruthy();
    expect(screen.getByText("MSQ-01")).toBeTruthy();
    expect(screen.getByRole("button", { name: "تغییر" })).toBeTruthy();
    // در حالتِ انتخاب‌شده، ورودیِ جست‌وجو وجود ندارد.
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("«تغییر» انتخاب را پاک و فهرست را باز می‌کند", () => {
    const onChange = vi.fn();
    renderPicker(1, onChange);
    fireEvent.click(screen.getByRole("button", { name: "تغییر" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("حالتِ خطا و حالتِ در حال بارگذاری پیامِ درست دارند", () => {
    render(<MosquePicker mosques={[]} value={null} onChange={vi.fn()} loading failed={false} />);
    expect(screen.getByPlaceholderText(/در حال دریافت/)).toBeTruthy();
    cleanup();
    render(<MosquePicker mosques={[]} value={null} onChange={vi.fn()} loading={false} failed />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByText(/فهرست مساجد خوانده نشد/)).toBeTruthy();
  });
});
