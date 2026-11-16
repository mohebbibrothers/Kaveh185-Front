import { describe, expect, it } from "vitest";
import {
  birthDateError,
  birthDateString,
  nameError,
  nationalIdError,
  phoneError,
} from "../validate";
import { toSearch } from "../fa";

/**
 * تست‌های فرم شرکت‌کننده.
 *
 * چرا این‌ها مهم‌اند؟ چون هر اشتباه در این لایه، کاربر واقعی را در دقیقهٔ
 * آخر از ثبت‌نام بازمی‌دارد. هر تست یک شکایت واقعی را از قبل گرفته است.
 */
describe("کد ملی — پیام‌ها", () => {
  it("خالی را با پیام روشن رد می‌کند", () => {
    expect(nationalIdError("")).toBe("کد ملی را وارد کنید.");
  });

  it("کوتاه‌بودن را می‌گوید، نه «معتبر نیست»", () => {
    expect(nationalIdError("123")).toBe("کد ملی باید ۱۰ رقم باشد.");
  });

  it("رقم‌های یکسان را جدا تشخیص می‌دهد", () => {
    expect(nationalIdError("1111111111")).toBe("همهٔ رقم‌های کد ملی یکسان است.");
  });

  it("کد ملی معتبر را می‌پذیرد", () => {
    expect(nationalIdError("0009900012")).toBeUndefined();
  });

  it("ارقام فارسی را نرمال می‌کند", () => {
    expect(nationalIdError("۰۰۰۹۹۰۰۰۱۲")).toBeUndefined();
  });

  it("رقم کنترل غلط را رد می‌کند", () => {
    expect(nationalIdError("0009900013")).toBe("این کد ملی معتبر نیست؛ رقم‌ها را بررسی کنید.");
  });
});

describe("شمارهٔ همراه", () => {
  it("۱۰ رقم را رد می‌کند", () => {
    expect(phoneError("0912345678")).toContain("۱۱ رقم");
  });

  it("شمارهٔ بدون صفر ابتدایی را نرمال می‌کند، نه رد", () => {
    // کاربری که «9123456789» می‌نویسد قصدش همان ۰۹۱۲... است؛ ردکردنش
    // فقط یک دیوار بی‌دلیل است. نرمال‌سازی در `normalizePhone` انجام می‌شود.
    expect(phoneError("9123456789")).toBeUndefined();
    expect(phoneError("+989123456789")).toBeUndefined();
  });

  it("شمارهٔ درست را می‌پذیرد و فاصله را نادیده می‌گیرد", () => {
    expect(phoneError("0912 345 6789")).toBeUndefined();
  });
});

describe("تاریخ تولد", () => {
  it("تاریخ کامل را می‌سازد", () => {
    expect(birthDateString("5", "6", "1382")).toBe("1382/06/05");
  });

  it("نبود یک جزء را می‌گوید", () => {
    expect(birthDateError("", "6", "1382")).toBe("تاریخ تولد را کامل کنید.");
  });

  it("۳۱ شهریور را می‌پذیرد و ۳۱ مهر را رد می‌کند", () => {
    // شش ماه اول سال ۳۱ روزه‌اند؛ از مهر به بعد ۳۰ روزه.
    expect(birthDateError("31", "6", "1382")).toBeUndefined();
    expect(birthDateError("31", "7", "1382")).toContain("وجود ندارد");
  });

  it("سال چهاررقمی را الزامی می‌داند", () => {
    expect(birthDateError("1", "1", "82")).toContain("چهاررقمی");
  });
});

describe("نام", () => {
  it("نویسهٔ لاتین را رد می‌کند", () => {
    expect(nameError("Ali", "نام")).toContain("فارسی");
  });

  it("نیم‌فاصله را می‌پذیرد", () => {
    expect(nameError("سید محمد", "نام")).toBeUndefined();
  });

  it("یک‌حرفی را رد می‌کند", () => {
    expect(nameError("ع", "نام")).toContain("۲ حرف");
  });
});

describe("جست‌وجوی فارسی", () => {
  it("نیم‌فاصله و فاصلهٔ ساده را یکی می‌کند", () => {
    expect(toSearch("صاحب‌الزمان")).toBe(toSearch("صاحب الزمان"));
  });

  it("ی و ک عربی را با فارسی یکی می‌کند", () => {
    expect(toSearch("كريمی")).toBe(toSearch("کریمی"));
  });

  it("جست‌وجوی «مسجد» همهٔ مساجد را پیدا می‌کند", () => {
    expect(toSearch("مسجد جامع صاحب‌الزمان (عج)")).toContain(toSearch("صاحب الزمان"));
  });

  it("پرانتز و گیومه را حذف می‌کند", () => {
    expect(toSearch("فاطمه‌الزهرا (س)")).toBe("فاطمهالزهراس");
  });

  it("ارقام فارسی را به لاتین برمی‌گرداند تا کد مسجد هم جست‌وجو شود", () => {
    expect(toSearch("MSQ-۰۱")).toBe("msq-01");
  });
});
