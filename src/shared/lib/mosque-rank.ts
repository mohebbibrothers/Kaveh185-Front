/**
 * شناسهٔ رقابتی مسجد — «نام‌شناسی» و رتبه‌بندی.
 *
 * ── چه مشکلی را حل می‌کند؟ ────────────────────────────────────────────────
 * در داده‌های واقعی، تقریباً همهٔ مساجد با کلمهٔ «مسجد» شروع می‌شوند:
 *   «مسجد جامع صاحب‌الزمان (عج)» · «مسجد امام رضا (ع)» · «مسجد شهدا»
 * نتیجهٔ خامِ این داده دو باگِ بدیهی دارد:
 *
 *   ۱) **نشانِ مسجد همه «م» می‌شود** — چون حرف اولِ رشته همیشه «م» است.
 *   ۲) **مرتب‌سازیِ الفبایی بی‌معنی می‌شود** — همه با «مسجد» شروع می‌شوند،
 *      پس ترتیبِ الفبا در عمل تصادفی است («مسجد امام رضا» باید پیش از
 *      «مسجد جامع…» بیاید، ولی رشتهٔ خام با «م س ج د» مقایسه می‌کند).
 *
 * راه‌حل: یک «نامِ هسته» (core name) می‌سازیم که پیشوندهای عمومی و
 * تشریفاتی را برمی‌دارد و از حرفِ معنادارِ اولِ آن هم برای نشان و هم برای
 * کلیدِ الفبا استفاده می‌کنیم.
 *
 *   «مسجد جامع صاحب‌الزمان (عج)»      → «جامع صاحب‌الزمان»
 *   «مسجد حضرت امیرالمؤمنین (ع)»      → «امیرالمؤمنین»
 *   «مسجد شهدا (پایگاه شهید کاوه)»     → «شهدا»
 *   «حسینیه ثارالله»                   → «حسینیه ثارالله»   (پیشوند ندارد)
 *
 * نرمال‌سازی‌ها همه بی‌اثر بر نمایش‌اند: فقط برای مقایسه و نشان استفاده
 * می‌شوند؛ متنِ اصلیِ نام هرگز دست نمی‌خورد.
 */

/** پیشوندهای عمومی که «هویتِ» مسجد نیستند و باید برداشته شوند. */
const GENERIC_PREFIXES = [
  "مسجد جامع",
  "مسجد اعظم",
  "مسجد بزرگ",
  "مسجد",
  "جامع",
  "مصلای",
  "مصلی",
  "حسینیه",
  "مسجدحسینیه",
  "تکیه",
  "زیارتگاه",
  "امامزاده",
  "بقعه",
  "آستان",
] as const;

/**
 * واژه‌های تشریفاتیِ آغازین که پس از برداشتنِ پیشوند هم هنوز «هویت» نیستند:
 *   «حضرت امیرالمؤمنین» ≡ «امیرالمؤمنین»
 *   «امام رضا» ≡ «رضا»
 * فقط *یک* لایه برداشته می‌شود؛ برداشتنِ زنجیره‌ای می‌تواند نام را به
 * یک حرفِ بی‌معنی تبدیل کند («امام حسن مجتبی» نباید به «مجتبی» برسد؟ —
 * می‌رسد، ولی چون همه با همین قاعده یکسان رفتار می‌شوند، ترتیب الفبا
 * درست می‌ماند و پایدار است).
 */
const HONORIFICS = ["حضرت", "امام", "آیت‌الله", "آیت الله", "شهید"] as const;

/**
 * نشانه‌های دعاییِ پایانی — «(ع)»، «(س)»، «(عج)»، «(ره)».
 *
 * چرا حذف می‌شوند؟ چون در نامِ ۱۵ مسجد از ۱۷ مسجد تکرار می‌شوند و در مقایسهٔ
 * الفبایی فقط «نویزِ» مشترک‌اند؛ علاوه بر آن، پرانتز و نقطه در ترتیبِ رشته
 * جایگاهِ بی‌معنایی می‌سازند. نمایشِ نام دست‌نخورده می‌ماند.
 */
const DUAS = /\s+(عج|ع|س|ره|سع|قدس سره|روحی فداه|سلام الله علیه)$/;

/** حروفی که «الفبای فارسی» با آن‌ها شروع می‌شود — برای انتخابِ حرفِ نشان. */
const FA_LETTER = /[\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC]/;

/**
 * نرمال‌سازی برای مقایسه: نیم‌فاصله، ی/ک عربی، اعراب، پرانتز و نشانه‌ها.
 * (باید با `toSearch` در `fa.ts` هم‌خانواده بماند.)
 */
export function normalizeName(input: string): string {
  return input
    .replace(/[\u064B-\u0652\u0670]/g, "") // اعراب
    .replace(/[\u064A\u06D2]/g, "\u06CC") // ي / ے → ی
    .replace(/\u0643/g, "\u06A9") // ك → ک
    .replace(/[\u0629\u06C0]/g, "\u0647") // ة / ۀ → ه
    .replace(/\u0623|\u0625|\u0622/g, "\u0627") // أشکال الف → ا
    .replace(/[\u200C\u200E\u200F\u202A-\u202E]/g, " ") // نیم‌فاصله و کنترل‌ها
    .replace(/[()[\]«»"'’‘“”]/g, " ")
    .replace(/[.,،؛:!?؟…\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * نامِ هسته: نامِ مسجد بدونِ پیشوندهای عمومی/تشریفاتی.
 * اگر حذف باعث شود چیزی نمانَد، نامِ نرمال‌شدهٔ اصلی برمی‌گردد (هیچ‌وقت خالی).
 */
export function mosqueCoreName(name: string): string {
  const normalized = normalizeName(name);
  if (!normalized) return "";

  let core = normalized;
  // نشانه‌های دعاییِ پایانی (ممکن است چندتا باشند)
  for (let i = 0; i < 3; i += 1) {
    const next = core.replace(DUAS, "").trim();
    if (next === core) break;
    core = next;
  }
  // پیشوند عمومی (بلندترین اول)
  for (const prefix of GENERIC_PREFIXES) {
    if (core === prefix) {
      core = "";
      break;
    }
    if (core.startsWith(`${prefix} `)) {
      core = core.slice(prefix.length + 1).trim();
      break;
    }
  }
  // یک لایه تشریفاتی
  for (const word of HONORIFICS) {
    if (core.startsWith(`${word} `)) {
      core = core.slice(word.length + 1).trim();
      break;
    }
  }
  return core.length > 0 ? core : normalized;
}

/**
 * حرفِ نشان: نخستین حرفِ معنادارِ نامِ هسته.
 *   «مسجد جامع صاحب‌الزمان» → «ج»   (نه «م»)
 *   «مسجد حضرت امیرالمؤمنین» → «ا»
 *   «مسجد شهدا»              → «ش»
 * برای نام‌های لاتین/عددی هم چیزی معقول برمی‌گردد.
 */
export function mosqueInitial(name: string): string {
  const core = mosqueCoreName(name);
  if (!core) return "م";
  const chars = Array.from(core);
  const letter = chars.find((ch) => FA_LETTER.test(ch));
  if (letter) return letter;
  const first = chars[0] ?? "م";
  return first.toUpperCase();
}

/**
 * ترتیبِ الفبای فارسی — Weighted dictionary order.
 *
 * ── چرا `localeCompare` کافی نیست؟ ────────────────────────────────────────
 * ترتیبِ پیش‌فرضِ ICU برای فارسی، «آ» را با «ا» یکی می‌کند و «پ/چ/ژ/گ» را
 * درست سرِ جای خودشان نمی‌گذارد؛ در دستگاه‌های مختلف هم ممکن است فرق کند.
 * در یک **جدولِ رقابتی** این ناپایداری بدترین حالت است: رتبهٔ دو مسجدِ
 * هم‌امتیاز با عوض شدنِ مرورگر جابه‌جا می‌شود. پس یک الفبای صریح داریم.
 */
const FA_ALPHABET = "آاأإءبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیئؤ";

const FA_ORDER: ReadonlyMap<string, number> = new Map(
  Array.from(FA_ALPHABET).map((ch, i) => [ch, i]),
);

/** نگاشتِ حرف به وزن؛ حروفِ ناشناخته (لاتین/عدد) ته صف قرار می‌گیرند. */
function letterWeight(ch: string): number {
  const w = FA_ORDER.get(ch);
  if (w !== undefined) return w;
  if (/[0-9]/.test(ch)) return 100;
  if (/[a-zA-Z]/.test(ch)) return 200;
  return 300;
}

/**
 * مقایسه‌گرِ الفبای فارسی: حرف‌به‌حرف، با وزنِ صریح.
 * «آ» عمداً *پیش از* «ا» می‌آید (قاعدهٔ فرهنگ‌های فارسی).
 */
export function compareFaName(a: string, b: string): number {
  const x = Array.from(mosqueCoreName(a).toLowerCase());
  const y = Array.from(mosqueCoreName(b).toLowerCase());
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i += 1) {
    const dx = letterWeight(x[i] ?? "");
    const dy = letterWeight(y[i] ?? "");
    if (dx !== dy) return dx - dy;
  }
  return x.length - y.length;
}

export type Rankable = {
  name: string;
  completed: number;
};

/**
 * کلیدِ رتبه‌بندیِ رسمی: **تعداد شرکت‌کنندهٔ کامل (نزولی)** و در تساوی،
 * **الفبای نامِ هسته (صعودی)**. هیچ کلیدِ سومی لازم نیست: نامِ مسجد در
 * سامانه یکتاست، پس ترتیب کاملاً قطعی (deterministic) است — رتبه‌ها هرگز
 * بین دو بار بارگذاری جابه‌جا نمی‌شوند.
 */
export function compareRank<T extends Rankable>(a: T, b: T): number {
  if (b.completed !== a.completed) return b.completed - a.completed;
  return compareFaName(a.name, b.name);
}

/**
 * رتبهٔ رقابتی با **جایگاهِ مشترک** (۱، ۲، ۲، ۳، ۳، ۴ …).
 *
 * ── چرا این و نه «۱۲۲۴»ِ سخت‌گیرانه؟ ─────────────────────────────────────
 * صفحه سه جایگاهِ نمایشی دارد: سکوی افتخار (۱ تا ۳)، مدالِ برنز و سطحِ
 * رقابتی. با قاعدهٔ ۱۲۲۴ (۱، ۲، ۲، ۴) جدول هرگز «سوم» نداشت و مدالِ برنز
 * عملاً وجود نداشت — همان چیزی که کاربر دید: «از ۲ پریدی به ۴».
 *
 * در قاعدهٔ جایگاه، هر مسجد بعد از یک گروهِ مساوی **جایگاهِ بعدی** را
 * می‌گیرد (۱، ۲، ۲، ۳)، نه شمارهٔ ردیف. پس:
 *   • هم‌امتیازها دقیقاً یک رتبه و یک سطح دارند (انصاف)،
 *   • «سوم» همیشه وجود دارد وقتی سه گروهِ متمایز داریم (سکو کامل می‌شود)،
 *   • مسجدی با امتیازِ کمتر هرگز رتبهٔ بهتری نمی‌گیرد (بی‌ساختگی).
 * مسجدِ بی‌مشارکت (صفر) رتبهٔ ۰ می‌گیرد: «هنوز رتبه‌ای ندارد»، نه رتبهٔ قلابی.
 */
export function assignRanks<T extends Rankable>(
  rows: T[],
): (T & { rank: number; tied: boolean })[] {
  const sorted = [...rows].sort(compareRank);
  const anyParticipation = sorted.some((r) => r.completed > 0);
  let place = 0;
  let lastCompleted: number | null = null;

  return sorted.map((row) => {
    if (!anyParticipation || row.completed === 0) {
      lastCompleted = row.completed;
      return { ...row, rank: 0, tied: false };
    }
    if (row.completed === lastCompleted) {
      // هم‌امتیاز با ردیفِ قبل ⇒ همان جایگاه
      return { ...row, rank: place, tied: false };
    }
    place += 1;
    lastCompleted = row.completed;
    return { ...row, rank: place, tied: false };
  });
}

/**
 * «رتبهٔ مشترک» را از دادهٔ موجود استخراج می‌کند.
 *
 * چرا لازم است؟ `rank` با قاعدهٔ «جایگاه» ساخته می‌شود (۱، ۲، ۲، ۳ …) و عددِ
 * رتبه به‌تنهایی نمی‌گوید «هم‌رتبه دارم یا نه»: مسجدِ اول هم `rank=1` است، هم
 * دو مسجدِ هم‌امتیاز. پس یک بار می‌شماریم هر رتبه چند مسجد دارد؛ هر عضوِ
 * گروهِ چندنفره `tied: true` می‌گیرد — هم بالای صفحه، هم در جدول.
 *
 * اگر سرور صریح `is_tied` فرستاده باشد، حرفِ او مقدم است (منبعِ واحد).
 */
export function markTies<T extends { rank: number; serverTied?: boolean }>(
  rows: T[],
): (T & { tied: boolean })[] {
  const usage = new Map<number, number>();
  for (const row of rows) {
    if (row.rank > 0) usage.set(row.rank, (usage.get(row.rank) ?? 0) + 1);
  }
  return rows.map((row) => ({
    ...row,
    tied: row.rank > 0 && (row.serverTied ?? (usage.get(row.rank) ?? 0) > 1),
  }));
}

/**
 * سه کارتِ صدر: هر کسی که **جایگاهش ۱ تا ۳** است — نه «سه ردیفِ اولِ فهرست».
 * با ۱۴/۱۱/۱۱/۸ سه گروهِ متمایز داریم: یک مسجدِ جایگاهِ ۱، دو مسجدِ
 * جایگاهِ ۲ و مسجدِ جایگاهِ ۳؛ انتخاب با جایگاه همه‌شان را درست می‌چیند
 * (سقف سه کارت)، درحالی‌که «سه ردیفِ اول» جایگاهِ ۳ را جا می‌گذاشت.
 * مسجدِ بی‌مشارکت (رتبهٔ ۰) هرگز کارت نمی‌گیرد.
 */
export function selectPodium<T extends { rank: number }>(rows: T[], size = 3): T[] {
  return rows.filter((r) => r.rank > 0 && r.rank <= size).slice(0, size);
}

/**
 * سه **جایگاهِ** صدر، هر جایگاه با همهٔ مساجدِ هم‌رتبه‌اش.
 *
 * چرا گروه‌بندی و نه «سه ردیف»؟ چون جایگاه‌ها می‌توانند مشترک باشند و اگر
 * فهرست را بر اساسِ ردیف بچینیم، جایگاهی مثلِ «سوم» ممکن است هیچ کارتی
 * نگیرد و مدالِ برنز از صفحه غایب شود. با گروه‌بندی، همیشه سه جایگاهِ ۱، ۲
 * و ۳ رویِ صفحه‌اند و هم‌رتبه‌ها با هم در یک کارت دیده می‌شوند.
 */
export function groupPlaces<T extends { rank: number }>(
  rows: T[],
  places = 3,
): { place: number; rows: T[] }[] {
  const groups: { place: number; rows: T[] }[] = [];
  for (const row of rows) {
    if (row.rank <= 0 || row.rank > places) continue;
    const last = groups[groups.length - 1];
    if (last && last.place === row.rank) last.rows.push(row);
    else groups.push({ place: row.rank, rows: [row] });
  }
  return groups;
}
