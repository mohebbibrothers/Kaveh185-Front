import { describe, expect, it } from "vitest";
import {
  assignRanks,
  compareFaName,
  markTies,
  mosqueCoreName,
  mosqueInitial,
  selectPodium,
} from "../mosque-rank";

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

/** خواندنِ امنِ عضوِ آرایه در تست — بی‌نیاز از `!` (که لینت منع می‌کند). */
function at<T>(list: T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`آرایه عضوِ ${index} را ندارد`);
  return item;
}

describe("markTies و selectPodium (سکوی افتخار)", () => {
  const rows = [
    { name: "مسجد جامع صاحب‌الزمان (عج)", completed: 14 },
    { name: "مسجد حضرت امیرالمؤمنین (ع)", completed: 11 },
    { name: "مسجد حضرت فاطمةالزهرا (س)", completed: 11 },
    { name: "مسجد امام حسن مجتبی (ع)", completed: 8 },
    { name: "مسجد سیدالشهدا (ع)", completed: 8 },
    { name: "مسجد امام رضا (ع)", completed: 0 },
  ].map((r, i) => ({ ...r, id: i + 1 }));

  const ranked = assignRanks(rows);
  const tied = markTies(ranked);

  it("هر عضوِ گروهِ هم‌امتیاز «مشترک» می‌شود و صدرنشینِ تنها نه", () => {
    expect(at(tied, 0).rank).toBe(1);
    expect(at(tied, 0).tied).toBe(false);
    expect(at(tied, 1).rank).toBe(2);
    expect(at(tied, 2).rank).toBe(2);
    expect(at(tied, 1).tied).toBe(true);
    expect(at(tied, 2).tied).toBe(true);
    expect(at(tied, 3).rank).toBe(4);
    expect(at(tied, 3).tied).toBe(true);
  });

  it("مسجدِ بی‌مشارکت (رتبهٔ ۰) هرگز «مشترک» یا رویِ سکو نیست", () => {
    const zero = tied.find((r) => r.completed === 0);
    expect(zero?.rank).toBe(0);
    expect(zero?.tied).toBe(false);
    expect(selectPodium(tied).some((r) => r.completed === 0)).toBe(false);
  });

  it("سکو رتبه‌های ۱ تا ۳ را می‌گیرد، نه سه ردیفِ اول را", () => {
    // رتبه‌ها: ۱، ۲، ۲، ۴، ۴، ۰ → سکو باید ۱ و دو مسجدِ رتبهٔ ۲ باشد
    const podium = selectPodium(tied);
    expect(podium.map((r) => r.rank)).toEqual([1, 2, 2]);
    expect(podium.map((r) => r.completed)).toEqual([14, 11, 11]);
  });

  it("حرفِ سرور (serverTied) بر شمارشِ محلی مقدم است", () => {
    const fromServer = markTies([{ name: "مسجد شهدا", completed: 5, rank: 1, serverTied: true }]);
    expect(fromServer[0]?.tied).toBe(true);
  });

  it("سقفِ سه‌نفره رعایت می‌شود حتی اگر چهار مسجد رتبهٔ ۱ داشته باشند", () => {
    const four = markTies(
      [1, 1, 1, 1].map((completed, i) => ({ name: `مسجد ${i}`, completed, rank: 1 })),
    );
    expect(selectPodium(four)).toHaveLength(3);
  });
});
