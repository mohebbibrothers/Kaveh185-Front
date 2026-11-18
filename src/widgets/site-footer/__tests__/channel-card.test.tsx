import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SITE } from "@/shared/config/site";

/**
 * کارتِ کانالِ رسمی — دورِ ۱۷ (نکتهٔ ۴ و ۶ کاربر).
 *
 * چهار قرارداد که این تست قفل می‌کند:
 *   ۱) هیچ باکس/سطحی وجود ندارد؛ فقط تیتر + آیکون + نام.
 *   ۲) کلیک روی آیکون ⇒ کانالِ بله، در پنجرهٔ تازه و با `rel` امن.
 *   ۳) `alt`/`aria-label` پر است (آیکون تنها نقطهٔ تعامل است).
 *   ۴) **هم‌گامی با بک‌اند**: اگر بک‌اند کانالِ تازه بدهد، لینک عوض می‌شود؛
 *      اگر خطا بدهد، به پیکربندیِ ساخت برمی‌گردد (هرگز لینکِ خالی).
 */

const useBootstrap = vi.fn();
vi.mock("@/shared/api/use-bootstrap", () => ({
  useBootstrap: () => useBootstrap(),
}));

const { ChannelCard } = await import("../ChannelCard");

beforeEach(() => {
  useBootstrap.mockReturnValue({ phase: "loading", data: null });
});

afterEach(cleanup);

const ready = (channel: Record<string, unknown>) => ({
  phase: "ready" as const,
  data: { exam_status: { communication_channels: [channel] } },
});

describe("ChannelCard", () => {
  it("بدونِ دادهٔ زنده، از پیکربندیِ ساخت می‌خواند", () => {
    render(<ChannelCard />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(SITE.channel.url);
    expect(screen.getByText(SITE.channel.name)).toBeTruthy();
    expect(screen.getByText("کانال رسمی")).toBeTruthy();
  });

  it("لینک در پنجرهٔ تازه و با rel امن باز می‌شود", () => {
    render(<ChannelCard />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("کانالِ تازهٔ بک‌اند را می‌گیرد و عنوانِ بلند را کوتاه می‌کند", () => {
    useBootstrap.mockReturnValue(
      ready({
        platform: "bale",
        title: "کانال رسمی حوزهٔ ۱۸۵ — نسخهٔ تازه",
        url: "https://ble.ir/Kaveh185",
        handle: "@Kaveh185",
      }),
    );
    render(<ChannelCard />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("https://ble.ir/Kaveh185");
    expect(screen.getByText("کانال رسمی حوزهٔ ۱۸۵")).toBeTruthy();
  });

  it("نشانیِ ناامن یا پلتفرمِ دیگر را رد می‌کند", () => {
    useBootstrap.mockReturnValue(
      ready({ platform: "eitaa", title: "ایتا", url: "http://eitaa.com/x" }),
    );
    render(<ChannelCard />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(SITE.channel.url);
  });

  it("آیکون تنها نقطهٔ تعامل است و نامِ دسترس‌پذیر دارد", () => {
    render(<ChannelCard />);
    const link = screen.getByRole("link");
    const label = link.getAttribute("aria-label") ?? "";
    expect(label).toContain("کانال رسمی");
    expect(label).toContain(SITE.channel.platform);
    // هیچ سطح/باکسی: لینک نباید کلاسِ پس‌زمینه یا حاشیه داشته باشد.
    const cls = link.className;
    expect(cls).not.toMatch(/\bborder(-|\b)/);
    expect(cls).not.toMatch(/\bbg-/);
  });
});
