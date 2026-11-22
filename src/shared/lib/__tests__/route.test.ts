import { describe, expect, it } from "vitest";

/**
 * `resolveRoute` — مرزِ امن بین «مسیری که سرور گفت» و «جایی که واقعاً می‌رویم».
 *
 * چرا تست دارد؟ چون مقصدِ CTAها از API می‌آید. اگر روزی پاسخِ سرور دستکاری
 * شود (یا یک باگِ سمتِ سرور رشتهٔ دلخواه بدهد)، نباید کاربر به دامنهٔ بیرونی
 * فرستاده شود — همان open-redirect کلاسیک.
 */

const { resolveRoute, isInternalRoute } = await import("../route");

describe("resolveRoute", () => {
  it("مسیرهای داخلیِ عادی را همان‌طور برمی‌گرداند", () => {
    expect(resolveRoute("/exam")).toBe("/exam");
    expect(resolveRoute("/register")).toBe("/register");
    expect(resolveRoute("/receipt?code=K185-1")).toBe("/receipt?code=K185-1");
  });

  it("نشانیِ بیرونی را رد می‌کند (open-redirect)", () => {
    expect(resolveRoute("https://evil.example/x")).toBe("/register");
    expect(resolveRoute("//evil.example")).toBe("/register");
  });

  it("رشتهٔ خالی یا بی‌اسلش را رد می‌کند", () => {
    expect(resolveRoute("")).toBe("/register");
    expect(resolveRoute("exam")).toBe("/register");
  });

  it("fallback سفارشی هم امن است و حلقه نمی‌زند", () => {
    expect(resolveRoute("javascript:alert(1)", "/exam")).toBe("/exam");
    expect(isInternalRoute("javascript:alert(1)")).toBe(false);
  });
});
