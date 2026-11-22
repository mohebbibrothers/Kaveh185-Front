import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * پیش‌نویسِ ثبت‌نام — «چیزی که تایپ کردم گم نمی‌شود».
 *
 * ── شکایتِ واقعی ──────────────────────────────────────────────────────────
 * «اطلاعات رو ذخیره نمی‌کنه.» بخشی از این جمله مربوط به سرور نبود؛ مربوط
 * به این بود که کاربر فرم را نیمه‌کاره رها می‌کرد (قوانین، مساجد، سؤال) و
 * تایپ‌هایش می‌رفت. این تست سه چیز را قفل می‌کند:
 *
 *   ۱) بازیابیِ درستِ پیش‌نویسِ تازه
 *   ۲) **ذخیره‌نشدنِ کد ملی/تاریخ تولد** (حریمِ دستگاهِ اشتراکی)
 *   ۳) کنارگذاشتنِ پیش‌نویسِ کهنه (بیش از ۳ روز)
 */

const store = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, v);
  },
  removeItem: (k: string) => {
    store.delete(k);
  },
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
};

const { readDraft, writeDraft, clearDraft } = await import("../use-draft");

const KEY = "k185-register-draft-v1";

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock);
  store.clear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("پیش‌نویسِ ثبت‌نام", () => {
  it("می‌نویسد و همان را برمی‌گرداند", () => {
    writeDraft({
      first: "محمد",
      last: "رضایی",
      phone: "09121234567",
      mosqueId: 7,
      savedAt: Date.now(),
    });
    const d = readDraft();
    expect(d).toMatchObject({ first: "محمد", last: "رضایی", phone: "09121234567", mosqueId: 7 });
  });

  it("کد ملی و تاریخ تولد را هرگز ذخیره نمی‌کند", () => {
    writeDraft({
      first: "محمد",
      last: "رضایی",
      phone: "09121234567",
      mosqueId: 7,
      savedAt: Date.now(),
      // @ts-expect-error — عمداً فیلدِ غیرمجاز را می‌فرستیم تا مطمئن شویم دور ریخته می‌شود
      nid: "0013542419",
      birth: "2000-01-01",
    });
    const raw = store.get(KEY) ?? "";
    expect(raw).not.toContain("0013542419");
    expect(raw).not.toContain("2000-01-01");
  });

  it("پیش‌نویسِ کهنه (بیش از ۳ روز) نادیده گرفته می‌شود", () => {
    writeDraft({
      first: "قدیمی",
      last: "x",
      phone: "",
      mosqueId: null,
      savedAt: Date.now() - 4 * 86_400_000,
    });
    expect(readDraft()).toBeNull();
  });

  it("پیش‌نویسِ خالی (مثلاً فقط سفید) معتبر نیست", () => {
    writeDraft({ first: "", last: "", phone: "", mosqueId: null, savedAt: Date.now() });
    expect(readDraft()).toBeNull();
  });

  it("JSON خراب کرش نمی‌کند", () => {
    store.set(KEY, "}{");
    expect(readDraft()).toBeNull();
  });

  it("clearDraft پاک می‌کند", () => {
    writeDraft({ first: "a", last: "", phone: "", mosqueId: null, savedAt: Date.now() });
    clearDraft();
    expect(readDraft()).toBeNull();
  });
});
