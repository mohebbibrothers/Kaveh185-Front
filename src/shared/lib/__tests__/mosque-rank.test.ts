import { describe, expect, it } from "vitest";
import { assignRanks, compareFaName, mosqueCoreName, mosqueInitial } from "../mosque-rank";

describe("mosqueCoreName", () => {
  it("«مسجد» و واژه‌های عمومی را برمی‌دارد", () => {
    expect(mosqueCoreName("مسجد جامع صاحب‌الزمان (عج)")).toBe("صاحب الزمان");
    expect(mosqueCoreName("مسجد شهدا (پایگاه شهید کاوه)")).toBe("شهدا پایگاه شهید کاوه");
    expect(mosqueCoreName("حسینیه ثارالله")).toBe("ثارالله");
  });

  it("یک لایه تشریفاتی را برمی‌دارد ولی نام را خالی نمی‌کند", () => {
    expect(mosqueCoreName("مسجد حضرت امیرالمؤمنین (ع)")).toBe("امیرالمؤمنین");
    expect(mosqueCoreName("مسجد امام رضا (ع)")).toBe("رضا");
    expect(mosqueCoreName("مسجد")).toBe("مسجد");
  });
});

describe("mosqueInitial", () => {
  it("حرف معنادار را برمی‌گرداند، نه «م» همیشگی", () => {
    expect(mosqueInitial("مسجد جامع صاحب‌الزمان (عج)")).toBe("ص");
    expect(mosqueInitial("مسجد امام رضا (ع)")).toBe("ر");
    expect(mosqueInitial("مسجد شهدا")).toBe("ش");
    expect(mosqueInitial("مسجد حضرت امیرالمؤمنین (ع)")).toBe("ا");
  });
});

describe("compareFaName", () => {
  it("ترتیب الفبای فارسیِ درست می‌دهد (آ پیش از ا، پ بعد از ب)", () => {
    const names = ["مسجد رضا", "مسجد آبان", "مسجد پاک", "مسجد بهار"];
    const sorted = [...names].sort(compareFaName);
    expect(sorted).toEqual(["مسجد آبان", "مسجد بهار", "مسجد پاک", "مسجد رضا"]);
  });
});

describe("assignRanks", () => {
  it("بر اساس تعداد شرکت‌کننده و سپس الفبا رتبه می‌دهد", () => {
    const rows = [
      { name: "مسجد رضا", completed: 2 },
      { name: "مسجد آبان", completed: 2 },
      { name: "مسجد بهار", completed: 5 },
    ];
    const ranked = assignRanks(rows);
    expect(ranked.map((r) => r.name)).toEqual(["مسجد بهار", "مسجد آبان", "مسجد رضا"]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 2]);
  });

  it("تساوی را رتبهٔ مشترک می‌دهد (۱۲۲۴)", () => {
    const ranked = assignRanks([
      { name: "مسجد الف", completed: 3 },
      { name: "مسجد ب", completed: 3 },
      { name: "مسجد پ", completed: 1 },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3]);
    expect(ranked[1]?.tied).toBe(true);
  });

  it("صفرها رتبه نمی‌گیرند", () => {
    const ranked = assignRanks([
      { name: "مسجد الف", completed: 0 },
      { name: "مسجد ب", completed: 0 },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([0, 0]);
  });
});
