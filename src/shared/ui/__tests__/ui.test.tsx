import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";
import { Logo } from "../Logo";
import { Star, Divider, SectionTitle } from "../Ornament";
import { PersianPattern } from "../PersianPattern";

describe("Button", () => {
  it("متن و نقش دکمه را نشان می‌دهد", () => {
    render(<Button>ثبت‌نام</Button>);
    const btn = screen.getByRole("button", { name: "ثبت‌نام" });
    expect(btn).toBeTruthy();
  });

  it("variant و size کلاس متناظر می‌دهند", () => {
    const { rerender } = render(
      <Button variant="gold" size="lg">
        تأیید
      </Button>,
    );
    expect(screen.getByRole("button").className).toContain("bg-gold");
    rerender(
      <Button variant="ghost" size="sm">
        تأیید
      </Button>,
    );
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("border-border-strong");
    expect(cls).toContain("h-9");
  });

  it("block عرض کامل می‌دهد", () => {
    render(<Button block>تمام‌عرض</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });

  it("در حالت غیرفعال قابل کلیک نیست", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        قفل
      </Button>,
    );
    screen.getByRole("button").click();
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });

  it("کلاس‌های دلخواه حفظ می‌شوند", () => {
    render(<Button className="mt-4">x</Button>);
    expect(screen.getByRole("button").className).toContain("mt-4");
  });
});

describe("Logo", () => {
  /**
   * دو حالت دارد:
   *  · portrait (پیش‌فرض) — تصویر پرترهٔ شهید با قاب دایره‌ای؛ تصویر تزئینی
   *    است (alt خالی) و خودِ لینک والد برچسب دسترس‌پذیری می‌دهد.
   *  · mark — شمسهٔ SVG با role="img" که برای چاپ/تک‌رنگ استفاده می‌شود.
   */
  it("variant=mark با نام دسترس‌پذیر رندر می‌شود", () => {
    render(<Logo variant="mark" />);
    expect(screen.getByRole("img", { name: "نشان کاوه ۱۸۵" })).toBeTruthy();
  });

  it("variant=mark اندازهٔ دلخواه را روی SVG اعمال می‌کند", () => {
    render(<Logo variant="mark" size={72} />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("width")).toBe("72");
    expect(svg.getAttribute("height")).toBe("72");
  });

  it("variant=portrait تصویر تزئینی با alt خالی می‌دهد", () => {
    const { container } = render(<Logo />);
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    // alt خالی یعنی screen reader از آن رد می‌شود — چون متن «کاوه ۱۸۵»
    // کنارش در هدر آمده و تکرار نام، تجربهٔ خوانندهٔ صفحه را بد می‌کند
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("variant=portrait اندازهٔ قاب را از prop می‌گیرد", () => {
    const { container } = render(<Logo size={56} />);
    const frame = container.querySelector("span") as HTMLElement;
    expect(frame.style.width).toBe("56px");
    expect(frame.style.height).toBe("56px");
  });
});

describe("Ornament", () => {
  it("Star تزئینی است و از درخت دسترس‌پذیری پنهان می‌ماند", () => {
    const { container } = render(<Star />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 32 32");
  });

  it("Divider درخت دسترس‌پذیری را شلوغ نمی‌کند", () => {
    const { container } = render(<Divider />);
    expect(container.querySelector("div")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("SectionTitle تیتر سطح دو با شناسه می‌سازد", () => {
    render(<SectionTitle id="board-title" eyebrow="رقابت" title="جدول مساجد" />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.id).toBe("board-title");
    expect(h2.textContent).toBe("جدول مساجد");
    expect(screen.getByText("رقابت")).toBeTruthy();
  });

  it("SectionTitle می‌تواند اکشن کنار تیتر بپذیرد", () => {
    render(<SectionTitle eyebrow="e" title="t" action={<span>اکشن</span>} />);
    expect(screen.getByText("اکشن")).toBeTruthy();
  });
});

describe("PersianPattern", () => {
  it("از دسترس‌پذیری پنهان است و الگوی یگانه می‌سازد", () => {
    const { container } = render(<PersianPattern size={90} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("pattern")?.getAttribute("id")).toBe("k185-pat-90");
    expect(container.querySelectorAll("polygon").length).toBeGreaterThan(0);
  });

  it("شفافیت سفارشی اعمال می‌شود", () => {
    const { container } = render(<PersianPattern opacity={0.25} />);
    expect((container.querySelector("svg") as SVGElement).style.opacity).toBe("0.25");
  });
});
