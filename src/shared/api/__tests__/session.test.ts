import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getSession, hasSession, patchSession, saveSession } from "../session";

/**
 * نشست در `localStorage` تنها جایی است که «من کی هستم» را نگه می‌دارد.
 *
 * اگر `read` یک رشتهٔ خراب یا توکن کوتاه را قبول کند، کاربر با نشستی وارد
 * می‌شود که سرور ردش می‌کند و وسط آزمون به پیام «منقضی شده» می‌خورد. پس
 * این تست‌ها همان گاردها را قفل می‌کنند: توکن کوتاه رد شود، JSON خراب
 * صفحه را نیندازد، و نوشتن با حافظهٔ پر خطا ندهد.
 */

const KEY = "k185-session-v1";

const session = {
  access: "a".repeat(40),
  refresh: "r".repeat(40),
  fullName: "زهرا محمدی",
  mosqueName: "مسجد جامع صاحب‌الزمان (عج)",
  trackingCode: "KV185-ABC12345",
  lastScore: 4,
};

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("getSession", () => {
  it("نشست ذخیره‌شده را برمی‌گرداند", () => {
    window.localStorage.setItem(KEY, JSON.stringify(session));
    expect(getSession()).toMatchObject({ fullName: "زهرا محمدی", lastScore: 4 });
  });

  it("بدون داده null می‌دهد", () => {
    expect(getSession()).toBeNull();
    expect(hasSession()).toBe(false);
  });

  it("JSON خراب را null می‌کند، نه استثنا", () => {
    window.localStorage.setItem(KEY, "{ not json");
    expect(getSession()).toBeNull();
  });

  it("توکن کوتاه را معتبر نمی‌شمارد", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...session, access: "short" }));
    expect(getSession()).toBeNull();
  });

  it("شیء بدون فیلد access را رد می‌کند", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ fullName: "بی‌توکن" }));
    expect(getSession()).toBeNull();
  });

  it("مقدار غیرشیء (رشته) را رد می‌کند", () => {
    window.localStorage.setItem(KEY, JSON.stringify("فقط یک رشته"));
    expect(getSession()).toBeNull();
  });
});

describe("saveSession", () => {
  it("نشست را ذخیره می‌کند و hasSession درست می‌شود", () => {
    saveSession(session);
    expect(hasSession()).toBe(true);
    expect(getSession()?.trackingCode).toBe("KV185-ABC12345");
  });

  it("وقتی ذخیره‌سازی مسدود است، خطا نمی‌دهد", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveSession(session)).not.toThrow();
  });
});

describe("patchSession", () => {
  it("فقط فیلدهای داده‌شده را عوض می‌کند", () => {
    saveSession(session);
    const next = patchSession({ lastScore: 5 });
    expect(next?.lastScore).toBe(5);
    expect(next?.fullName).toBe("زهرا محمدی");
    expect(getSession()?.lastScore).toBe(5);
  });

  it("بدون نشست فعلی null می‌دهد و چیزی نمی‌سازد", () => {
    expect(patchSession({ lastScore: 3 })).toBeNull();
    expect(getSession()).toBeNull();
  });
});

describe("clearSession", () => {
  it("نشست را پاک می‌کند", () => {
    saveSession(session);
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("وقتی حذف مسدود است، خطا نمی‌دهد", () => {
    saveSession(session);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => clearSession()).not.toThrow();
  });
});
