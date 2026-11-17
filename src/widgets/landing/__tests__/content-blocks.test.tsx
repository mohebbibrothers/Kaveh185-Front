import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LeaderGallery } from "../LeaderGallery";
import { MartyrsMarquee } from "../MartyrsMarquee";
import type { LeaderPortrait, Martyr } from "@/shared/api/landing";

/**
 * گالری و نوار شهدا — دو بخشی که مستقیماً از ادمین داده می‌گیرند.
 *
 * این تست‌ها سه قرارداد را قفل می‌کنند که شکستن‌شان در مرورگر دیده
 * نمی‌شود ولی تجربه را خراب می‌کند:
 *   ۱) دادهٔ خالی ⇒ هیچ چیزی رندر نمی‌شود (نه باکس خالی، نه جای‌خالی).
 *   ۲) `alt` همیشه پر است (صفحه‌خوان هرگز «تصویر» بی‌نام نمی‌شنود).
 *   ۳) چرخش گالری با دکمه‌های واقعی کار می‌کند، نه فقط با تایمر.
 */

afterEach(cleanup);

const portrait = (over: Partial<LeaderPortrait> = {}): LeaderPortrait => ({
  image_url: "https://example.test/a.jpg",
  alt: "تصویر الف",
  caption: "کلام الف",
  caption_paragraphs: ["کلام الف"],
  source: "منبع الف",
  show_in_box: true,
  order: 1,
  ...over,
});

const martyr = (over: Partial<Martyr> = {}): Martyr => ({
  image_url: "https://example.test/m.jpg",
  title: "سیدشهدای مقاومت",
  subtitle: "شهید محمود کاوه",
  alt: "سیدشهدای مقاومت — شهید محمود کاوه",
  order: 1,
  ...over,
});

describe("LeaderGallery", () => {
  it("بدون داده، هیچ چیزی رندر نمی‌کند", () => {
    const { container } = render(<LeaderGallery items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("تصویر و کلامِ همان تصویر را با هم نشان می‌دهد", () => {
    render(<LeaderGallery items={[portrait()]} />);
    expect(screen.getByAltText("تصویر الف")).toBeTruthy();
    expect(screen.getByText("کلام الف")).toBeTruthy();
    expect(screen.getByText("منبع الف")).toBeTruthy();
  });

  it("با یک تصویر، نشانگر و فلش نمایش نمی‌دهد", () => {
    render(<LeaderGallery items={[portrait()]} />);
    expect(screen.queryByLabelText("تصویر بعد")).toBeNull();
    expect(screen.queryByLabelText(/تصویر ۱ از ۱/)).toBeNull();
  });

  it("با چند تصویر، دکمهٔ «تصویر بعد» کلام را عوض می‌کند", () => {
    render(
      <LeaderGallery
        items={[
          portrait({ alt: "اول", caption: "کلام اول", caption_paragraphs: ["کلام اول"] }),
          portrait({
            image_url: "https://example.test/b.jpg",
            alt: "دوم",
            caption: "کلام دوم",
            caption_paragraphs: ["کلام دوم"],
            order: 2,
          }),
        ]}
      />,
    );

    expect(screen.getByText("کلام اول")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("تصویر بعد"));
    expect(screen.getByText("کلام دوم")).toBeTruthy();
  });

  it("تصاویری که ادمین «در باکس دیده نشود» گذاشته را نمایش نمی‌دهد", () => {
    const { container } = render(<LeaderGallery items={[portrait({ show_in_box: false })]} />);
    expect(container.firstChild).toBeNull();
  });

  it("وقتی کلام ثبت نشده، به‌جای کرش پیام صادقانه می‌دهد", () => {
    render(<LeaderGallery items={[portrait({ caption: "", caption_paragraphs: [] })]} />);
    expect(screen.getByText(/برای این تصویر ثبت نشده/)).toBeTruthy();
  });
});

describe("MartyrsMarquee", () => {
  it("بدون داده، هیچ چیزی رندر نمی‌کند", () => {
    const { container } = render(<MartyrsMarquee items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("عنوانِ کوتاه زیر هر چهره و متن جانشین تصویر را می‌گذارد", () => {
    render(<MartyrsMarquee items={[martyr()]} />);
    expect(screen.getAllByText("سیدشهدای مقاومت").length).toBeGreaterThan(0);
    expect(screen.getAllByAltText("سیدشهدای مقاومت — شهید محمود کاوه").length).toBeGreaterThan(0);
  });

  it("تعداد شهدا را با ارقام فارسی می‌نویسد", () => {
    render(
      <MartyrsMarquee items={[martyr(), martyr({ title: "دوم" }), martyr({ title: "سوم" })]} />,
    );
    expect(screen.getByText("۳ شهید")).toBeTruthy();
  });

  it("با ۳ نفر یا بیشتر، ردیف را برای حرکتِ بی‌درز تکرار می‌کند", () => {
    render(<MartyrsMarquee items={[martyr(), martyr({ title: "ب" }), martyr({ title: "ج" })]} />);
    // ۳ نفر × ۳ تکرار = ۹ چهره
    expect(screen.getAllByRole("img").length).toBe(9);
  });

  it("با ۲ نفر، ردیف ثابت می‌ماند (تکرار مصنوعی ندارد)", () => {
    render(<MartyrsMarquee items={[martyr(), martyr({ title: "ب" })]} />);
    expect(screen.getAllByRole("img").length).toBe(2);
  });
});
