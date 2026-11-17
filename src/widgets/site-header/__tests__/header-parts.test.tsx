import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileMenu } from "../MobileMenu";

/**
 * منوی موبایل — برگهٔ پایین‌کشویی.
 *
 * سه قراردادِ رفتاری که باید همیشه برقرار بمانند:
 *   ۱) دکمه `aria-expanded` دارد و وضعیتش را درست گزارش می‌کند.
 *   ۲) با Escape بسته می‌شود.
 *   ۳) برگه روی `body` پورتال می‌شود — نه داخل هدر. این همان باگی است
 *      که نسخهٔ قبل داشت: `backdrop-filter` هدر، `fixed` را به کادرِ
 *      هدر مقید می‌کرد و برگه فقط یک نوار باریک دیده می‌شد.
 */

afterEach(cleanup);

const links = [
  { href: "/", label: "خانه" },
  { href: "/rules", label: "قوانین" },
] as const;

describe("MobileMenu", () => {
  it("در حالت بسته، دکمه وضعیت بسته را گزارش می‌کند", () => {
    render(<MobileMenu links={links} />);
    const trigger = screen.getByLabelText("باز کردن منو");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("با کلیک، برگه باز می‌شود و مقصدها را نشان می‌دهد", async () => {
    render(<MobileMenu links={links} />);
    fireEvent.click(screen.getByLabelText("باز کردن منو"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("خانه")).toBeTruthy();
    expect(screen.getByText("قوانین")).toBeTruthy();
  });

  it("برگه روی body پورتال می‌شود، نه داخل هدر", async () => {
    const { container } = render(<MobileMenu links={links} />);
    fireEvent.click(screen.getByLabelText("باز کردن منو"));
    const dialog = await screen.findByRole("dialog");
    // والدِ مستقیمِ برگه باید body باشد، نه کادر رندرِ تست.
    expect(dialog.parentElement).toBe(document.body);
    expect(container.contains(dialog)).toBe(false);
  });

  it("با Escape بسته می‌شود", async () => {
    render(<MobileMenu links={links} />);
    fireEvent.click(screen.getByLabelText("باز کردن منو"));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("اسکرولِ صفحه را هنگام باز بودن قفل می‌کند و پس از بستن آزاد می‌کند", async () => {
    render(<MobileMenu links={links} />);
    fireEvent.click(screen.getByLabelText("باز کردن منو"));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(document.body.style.overflow).not.toBe("hidden");
    });
  });

  it("عنوانِ «منو» و بخشِ «در همین صفحه» را نشان نمی‌دهد", async () => {
    // نکتهٔ ۶ کاربر: هر دو برداشته شدند؛ فقط فهرستِ مقصدهای اصلی می‌ماند.
    render(<MobileMenu links={links} />);
    fireEvent.click(screen.getByLabelText("باز کردن منو"));
    await screen.findByRole("dialog");
    expect(screen.queryByText("در همین صفحه")).toBeNull();
    expect(screen.queryByText("منو")).toBeNull();
    expect(screen.getAllByRole("link").some((a) => a.textContent?.includes("خانه"))).toBe(true);
  });
});
