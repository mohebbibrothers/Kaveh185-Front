import { describe, expect, it } from "vitest";
import {
  isValidNationalId,
  normalizePhone,
  isValidPhone,
  isValidJalaliDate,
  jalaliToGregorian,
  ageFromJalali,
} from "../validate";
import {
  toFa,
  toEn,
  faNumber,
  faClock,
  faDuration,
  normalizeFa,
  faJalali,
  faJalaliDateTime,
} from "../fa";

describe("کد ملی (mod 11)", () => {
  it("کدهای معتبر را می‌پذیرد", () => {
    for (const id of ["0013542419", "1111111121", "1845759486", "9377754534"]) {
      expect(isValidNationalId(id), id).toBe(true);
    }
  });
  it("کد نامعتبر را رد می‌کند", () => {
    for (const id of ["0013542418", "1234567890", "0000000000", "1111111111", "12345"]) {
      expect(isValidNationalId(id), id).toBe(false);
    }
  });
  it("ارقام فارسی را نرمال می‌کند", () => {
    expect(isValidNationalId("۰۰۱۳۵۴۲۴۱۹")).toBe(true);
  });
  it("فاصله و خط تیره را تحمل می‌کند", () => {
    expect(isValidNationalId("001-354-2419")).toBe(true);
  });
});

describe("موبایل", () => {
  it("قالب‌های مختلف را به ۰۹… نرمال می‌کند", () => {
    expect(normalizePhone("+989121234567")).toBe("09121234567");
    expect(normalizePhone("00989121234567")).toBe("09121234567");
    expect(normalizePhone("989121234567")).toBe("09121234567");
    expect(normalizePhone("9121234567")).toBe("09121234567");
    expect(normalizePhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
  });
  it("اعتبار را می‌سنجد", () => {
    expect(isValidPhone("09123456789")).toBe(true);
    expect(isValidPhone("0912345678")).toBe(false);
    expect(isValidPhone("08123456789")).toBe(false);
  });
});

describe("تاریخ جلالی", () => {
  it("تاریخ درست را می‌پذیرد", () => {
    expect(isValidJalaliDate("1382/06/15")).toBe(true);
    expect(isValidJalaliDate("۱۳۸۲/۰۶/۱۵")).toBe(true);
    expect(isValidJalaliDate("1382-6-15")).toBe(true);
  });
  it("تاریخ نادرست را رد می‌کند", () => {
    expect(isValidJalaliDate("1382/13/01")).toBe(false);
    expect(isValidJalaliDate("1382/07/31")).toBe(false);
    expect(isValidJalaliDate("1200/01/01")).toBe(false);
    expect(isValidJalaliDate("abc")).toBe(false);
  });
  it("شمسی → میلادی", () => {
    expect(jalaliToGregorian(1382, 6, 15)).toEqual({ y: 2003, m: 9, d: 6 });
    expect(jalaliToGregorian(1370, 1, 1)).toEqual({ y: 1991, m: 3, d: 21 });
  });
  it("سن را درست حساب می‌کند", () => {
    expect(ageFromJalali("1382/06/15", { y: 1405, m: 8, d: 23 })).toBe(23);
    expect(ageFromJalali("1405/09/01", { y: 1405, m: 8, d: 23 })).toBe(-1);
  });
});

describe("ابزارهای فارسی", () => {
  it("تبدیل ارقام دوطرفه", () => {
    expect(toFa("1405")).toBe("۱۴۰۵");
    expect(toEn("۱۴۰۵")).toBe("1405");
    expect(toEn("١٤٠٥")).toBe("1405");
  });
  it("عدد با جداکننده", () => {
    expect(faNumber(1247)).toBe("۱٬۲۴۷");
    expect(faNumber(0)).toBe("۰");
  });
  it("ساعت شمارش معکوس", () => {
    expect(faClock(0)).toBe("۰۰:۰۰");
    expect(faClock(59)).toBe("۰۰:۵۹");
    expect(faClock(300)).toBe("۰۵:۰۰");
    expect(faClock(3725)).toBe("۶۲:۰۵");
  });
  it("مدت خوانا", () => {
    expect(faDuration(1)).toBe("۱ ثانیه");
    expect(faDuration(132)).toBe("۲ دقیقه و ۱۲ ثانیه");
    expect(faDuration(3600)).toBe("۱ ساعت");
    expect(faDuration(3725)).toBe("۱ ساعت و ۲ دقیقه و ۵ ثانیه");
  });
  it("نرمال‌سازی جست‌وجوی فارسی", () => {
    expect(normalizeFa("علي  كاظمي")).toBe("علی کاظمی");
    expect(normalizeFa("مسجد\u200cجامع")).toBe("مسجد جامع");
  });
});

describe("تاریخ جلالی خوانا (faJalali)", () => {
  /**
   * باگ واقعی: بک‌اند `1405/08/29 00:00:00` می‌دهد و نسخهٔ قبلی همان را
   * عیناً نشان می‌داد. روی موبایل به دو خط می‌شکست و ثانیه‌ای داشت که هیچ
   * معنایی برای کاربر نداشت.
   */
  it("تاریخ خالص را به نام ماه تبدیل می‌کند", () => {
    expect(faJalali("1405/08/29")).toBe("۲۹ آبان ۱۴۰۵");
    expect(faJalali("1405/09/05")).toBe("۵ آذر ۱۴۰۵");
    expect(faJalali("1405/01/01")).toBe("۱ فروردین ۱۴۰۵");
    expect(faJalali("1405/12/29")).toBe("۲۹ اسفند ۱۴۰۵");
  });

  it("ساعت و ثانیه را از تاریخ جدا می‌کند", () => {
    expect(faJalali("1405/08/29 00:00:00")).toBe("۲۹ آبان ۱۴۰۵");
    expect(faJalali("1405/09/05 23:59:59")).toBe("۵ آذر ۱۴۰۵");
  });

  it("جداکنندهٔ خط تیره را هم می‌پذیرد", () => {
    expect(faJalali("1405-08-29")).toBe("۲۹ آبان ۱۴۰۵");
  });

  it("ورودی نامعتبر را خراب نمی‌کند", () => {
    // به‌جای پرتاب خطا، همان ورودی را با ارقام فارسی برمی‌گرداند
    expect(faJalali("نامعلوم")).toBe("نامعلوم");
  });

  it("ساعت را وقتی داده شده نگه می‌دارد", () => {
    expect(faJalaliDateTime("1405/08/29 08:30:00")).toBe("۲۹ آبان ۱۴۰۵ — ۰۸:۳۰");
    expect(faJalaliDateTime("1405/08/29")).toBe("۲۹ آبان ۱۴۰۵");
  });
});
