import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Field } from "../Field";
import { FreshnessLine } from "../FreshnessLine";
import { ThemeToggle } from "../ThemeToggle";

/**
 * سه جزء کوچک با اثر بزرگ.
 *
 *   • `Field` تنها جایی است که خطای سرور به کادر ورودی وصل می‌شود؛ اگر
 *     `aria-invalid` و `aria-describedby` ست نشوند، صفحه‌خوان خطا را
 *     نمی‌خواند و کاربرِ کم‌بینا نمی‌فهمد کدام فیلد مشکل دارد.
 *   • `FreshnessLine` باید صادق بماند: هیچ‌وقت «به‌روز» نگوید وقتی داده
 *     از سرور نیامده.
 *   • `ThemeToggle` باید سه‌حالته بچرخد و انتخاب کاربر را نگه دارد.
 */

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("Field", () => {
  it("برچسب را به ورودی وصل می‌کند", () => {
    render(<Field label="کد ملی" value="" onChange={() => {}} />);
    const input = screen.getByLabelText("کد ملی");
    expect(input).toBeTruthy();
  });

  it("خطا را با aria-invalid و aria-describedby اعلام می‌کند", () => {
    render(<Field label="کد ملی" value="" onChange={() => {}} error="کد ملی معتبر نیست" />);
    const input = screen.getByLabelText("کد ملی");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toContain(
      "کد ملی معتبر نیست",
    );
  });

  it("بدون خطا، aria-invalid ست نمی‌شود", () => {
    render(<Field label="نام" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("نام").getAttribute("aria-invalid")).toBeNull();
  });

  it("تایپ، مقدار را به onChange می‌دهد", () => {
    let seen = "";
    render(<Field label="نام" value="" onChange={(v) => (seen = v)} />);
    fireEvent.change(screen.getByLabelText("نام"), { target: { value: "زهرا" } });
    expect(seen).toBe("زهرا");
  });

  it("فیلد اختیاری برچسب «(اختیاری)» می‌گیرد", () => {
    render(<Field label="تلفن" value="" onChange={() => {}} optional />);
    expect(screen.getByText("(اختیاری)")).toBeTruthy();
  });
});

describe("FreshnessLine", () => {
  const served = "2026-11-14T10:30:00Z";

  it("حالت live می‌گوید «به‌روز»", () => {
    render(<FreshnessLine freshness="live" lastOk={served} />);
    expect(screen.getByText(/به‌روز/)).toBeTruthy();
  });

  it("حالت stale صادقانه می‌گوید اتصال برقرار نشد", () => {
    render(<FreshnessLine freshness="stale" lastOk={served} />);
    expect(screen.getByText(/اتصال برقرار نشد/)).toBeTruthy();
  });

  it("حالت shell می‌گوید در حال دریافت است و عدد نمی‌سازد", () => {
    render(<FreshnessLine freshness="shell" lastOk="1970-01-01T00:00:00Z" />);
    expect(screen.getByText(/در حال دریافت/)).toBeTruthy();
    expect(screen.queryByText(/۱۹۷۰|1970/)).toBeNull();
  });

  it("هیچ‌وقت «به‌روز» نمی‌گوید وقتی داده از سرور نیامده", () => {
    render(<FreshnessLine freshness="shell" lastOk="1970-01-01T00:00:00Z" />);
    expect(screen.queryByText("به‌روز")).toBeNull();
  });
});

describe("ThemeToggle", () => {
  it("پس از mount یک دکمهٔ قابل استفاده نشان می‌دهد", async () => {
    render(<ThemeToggle />);
    await waitFor(() => expect(screen.getByRole("button")).toBeTruthy());
  });

  it("با کلیک، تم را روی document می‌گذارد و ذخیره می‌کند", async () => {
    render(<ThemeToggle />);
    const button = await waitFor(() => screen.getByRole("button"));
    fireEvent.click(button);
    await waitFor(() => {
      const stored = window.localStorage.getItem("k185-theme");
      expect(["light", "dark"]).toContain(stored);
    });
    expect(document.documentElement.getAttribute("data-theme")).toMatch(/light|dark/);
  });

  it("تم ذخیره‌شده را پس از mount به‌عنوان وضعیت جاری نشان می‌دهد", async () => {
    // اعمالِ تم روی <html> کار اسکریپت درون layout است (پیش از رنگ‌آمیزی)؛
    // این کامپوننت فقط وضعیت را همگام می‌کند تا برچسب درست باشد.
    window.localStorage.setItem("k185-theme", "dark");
    render(<ThemeToggle />);
    const button = await waitFor(() => screen.getByRole("button"));
    await waitFor(() => expect(button.getAttribute("aria-label")).toContain("شب"));
  });

  it("چرخهٔ تم سه‌حالته است: خودکار → روز → شب", async () => {
    render(<ThemeToggle />);
    const button = await waitFor(() => screen.getByRole("button"));
    // ⚠️ منتظر می‌مانیم تا وضعیت اولیه (خواندن از localStorage) بنشیند.
    // بدون این انتظار، تست به یک مسابقهٔ زمانی وابسته می‌شد: روی ماشینِ
    // کند، اولین کلیک پیش از mount کامل می‌افتاد و برچسب «خودکار» می‌ماند.
    await waitFor(() => expect(button.getAttribute("aria-label")).toContain("خودکار"));
    const labels: string[] = [button.getAttribute("aria-label") ?? ""];
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(button);
      labels.push(button.getAttribute("aria-label") ?? "");
    }
    expect(labels[0]).toContain("خودکار");
    expect(labels[1]).toContain("روز");
    expect(labels[2]).toContain("شب");
    expect(labels[3]).toContain("خودکار");
    // بازگشت به «خودکار» باید کلید ذخیره‌شده را پاک کند
    expect(window.localStorage.getItem("k185-theme")).toBeNull();
  });

  it("حالت compact هم دکمهٔ برچسب‌دار می‌سازد (برای صفحه‌خوان)", async () => {
    render(<ThemeToggle compact />);
    const button = await waitFor(() => screen.getByRole("button"));
    expect((button.getAttribute("aria-label") ?? button.textContent ?? "").length).toBeGreaterThan(
      0,
    );
  });
});
