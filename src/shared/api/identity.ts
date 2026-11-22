"use client";

import { getSession, patchSession } from "./session";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  کشِ هویت — «این دستگاه مالِ کیست و قدمِ بعدی‌اش چیست؟»
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── مسئله‌ای که این فایل حل می‌کند ────────────────────────────────────────
 * گزارشِ واقعی: «ثبت‌نام می‌کنم، به خانه می‌روم، دوباره «ثبت‌نام و شرکت» را
 * می‌زنم و همان فرم می‌آید.» تا امروز هر کامپوننت (هدر، `/register`،
 * `/login`، `/exam`) **خودش** از `localStorage` می‌خواند و خودش حدس می‌زد.
 * نتیجه: چهار حقیقتِ متفاوت، و در بدترین حالت هر چهار تای‌شان غلط.
 *
 * این فایل یک منبعِ حقیقتِ واحد می‌سازد، با سه لایهٔ کش که هر کدام یک
 * مسئلهٔ متفاوت را حل می‌کنند:
 *
 *   ┌─────────────────────────────┬───────────────────────────────────────┐
 *   │ لایه                        │ مسئلهٔ حل‌شده                        │
 *   ├─────────────────────────────┼───────────────────────────────────────┤
 *   │ ۱) اِسنپ‌شاتِ `localStorage` │ پرشِ چشمی: هدر در همان فریمِ اول     │
 *   │                             │ می‌داند «ادامهٔ آزمون» یا «ثبت‌نام».  │
 *   │ ۲) کشِ حافظه‌ای با TTL       │ کلیک‌های پشتِ‌سرهم و ریموت‌های هدر/فرم │
 *   │                             │ یک درخواستِ شبکه نمی‌سازند.           │
 *   │ ۳) Single-flight            │ سه کامپوننت که هم‌زمان mount شوند ⇒   │
 *   │                             │ فقط **یک** درخواست.                   │
 *   └─────────────────────────────┴───────────────────────────────────────┘
 *
 * و بالاتر از همه، سرور تنها مرجعِ «چه کسی هستم» است
 * (`POST /auth/session/state/`) که خودش توکنِ منقضی را با refresh زنده
 * می‌کند. یعنی برخلافِ قبل، نشستِ کهنه به «کاربرِ تازه» ترجمه نمی‌شود.
 *
 * ── قاعدهٔ طلایی ─────────────────────────────────────────────────────────
 * هیچ‌جا از این فایل «حدس» نمی‌گیریم: اگر شبکه بخوابد ولی اِسنپ‌شات باشد،
 * همان را با `stale: true` برمی‌گردانیم تا کاربر به فرمِ خالی پرت نشود؛
 * و اگر هیچ‌چیز نباشد، **صادقانه** `no_session` می‌گوییم.
 */

/** قدمِ بعدی — همان چیزی که سرور تصمیم می‌گیرد و رابط فقط نمایش می‌دهد. */
export type NextStep = {
  /** مسیرِ مقصد؛ همیشه یک مسیرِ داخلیِ سایت (`/exam`، `/receipt?code=…`, `/register`). */
  path: string;
  /** متنِ دکمه؛ کوتاه و دستوری. */
  label: string;
  /** دلیلِ یک‌جمله‌ای برای نمایش کنارِ دکمه. */
  reason: string;
};

export type IdentityState =
  | "session"
  | "revived"
  | "completed"
  | "no_session"
  /** شبکه/سرور در دسترس نبود ولی اِسنپ‌شات داشتیم — «آنچه می‌دانیم» را بده. */
  | "offline";

export type Identity = {
  state: IdentityState;
  /** نامِ کاملِ صاحبِ پرونده — یا رشتهٔ خالی. */
  fullName: string;
  mosqueName: string | null;
  trackingCode: string | null;
  phoneHint: string;
  /** آیا سرور می‌گوید «دکمهٔ ورود به آزمون فعال است»؟ */
  canEnterExam: boolean;
  hasInProgress: boolean;
  completed: boolean;
  next: NextStep;
  reason: string;
  /** زمانِ ساختِ این نتیجه (میلی‌ثانیه). */
  at: number;
  /** نتیجه از کشِ محلی است و ممکن است کهنه باشد. */
  stale: boolean;
};

/** اِسنپ‌شات پایدار (برای فریمِ اول) — عمداً جدا از نشست نگه داشته می‌شود. */
const SNAPSHOT_KEY = "k185-identity-v1";

/** اعلانِ تغییرِ هویت، برای هر کامپوننتی که مشترک شده است. */
const EVENT = "k185:identity";
/** اعلانِ تغییرِ نشست (ذخیره/پاک‌شدن) — از `session.ts` می‌آید. */
const SESSION_EVENT = "k185:session";

/** عمرِ کشِ حافظه‌ای: کوتاه، چون هویت واقعاً می‌تواند عوض شود. */
const TTL_MS = 20_000;

type MemoryCache = { identity: Identity; at: number };
let memory: MemoryCache | null = null;
let inflight: Promise<Identity> | null = null;

const ANON: Identity = {
  state: "no_session",
  fullName: "",
  mosqueName: null,
  trackingCode: null,
  phoneHint: "",
  canEnterExam: false,
  hasInProgress: false,
  completed: false,
  next: { path: "/register", label: "ثبت‌نام و شرکت", reason: "برای شرکت، ثبت‌نام کنید." },
  reason: "",
  at: 0,
  stale: false,
};

// ── اِسنپ‌شات ──────────────────────────────────────────────────────────────
function isIdentity(v: unknown): v is Identity {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  const next = o["next"];
  return (
    typeof o["state"] === "string" &&
    typeof next === "object" &&
    next !== null &&
    typeof (next as Record<string, unknown>)["path"] === "string"
  );
}

/**
 * خواندنِ اِسنپ‌شات — همگام و بی‌خطا.
 *
 * فقط از `localStorage` می‌خواند، پس در رندرِ سرور `null` می‌دهد. مصرف‌کننده
 * باید آن را «بعد از mount» استفاده کند تا hydration mismatch نگیریم
 * (همان الگویی که در `EntryCta` پیاده شده است).
 */
export function readIdentitySnapshot(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isIdentity(parsed)) return null;
    // اِسنپ‌شاتِ خیلی کهنه (بیش از ۷ روز) دیگر «حقیقت» نیست.
    if (typeof parsed.at === "number" && Date.now() - parsed.at > 7 * 86_400_000) return null;
    return { ...parsed, stale: true };
  } catch {
    return null;
  }
}

export function writeIdentitySnapshot(identity: Identity): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(identity));
  } catch {
    /* حافظهٔ پر یا حالتِ ناشناس — کشِ محلی «امتیاز» است، نه «ضرورت». */
  }
}

export function clearIdentitySnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    /* بی‌اثر */
  }
}

// ── اعلان‌ها ───────────────────────────────────────────────────────────────
function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

/** اشتراک در تغییرِ هویت (برای `useSyncExternalStore` یا هر شنوندهٔ دلخواه). */
export function subscribeIdentity(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => {
    listener();
  };
  window.addEventListener(EVENT, onLocal);
  // تغییرِ نشست (ثبت‌نام/خروج) هویت را باطل می‌کند.
  window.addEventListener(SESSION_EVENT, onLocal);
  // تغییر از تبِ دیگر — همان کاربر، دو تبِ باز.
  const onStorage = (e: StorageEvent) => {
    if (e.key === SNAPSHOT_KEY || e.key === null) {
      if (e.key === null) clearMemory();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onLocal);
    window.removeEventListener(SESSION_EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}

function clearMemory(): void {
  memory = null;
  inflight = null;
}

/** باطل‌کردنِ کش — بعد از ثبت‌نام، خروج، یا هر تغییری که هویت را عوض می‌کند. */
export function invalidateIdentity(): void {
  clearMemory();
  emit();
}

// ── فراخوانیِ سرور ────────────────────────────────────────────────────────
type ServerSession = {
  access: string;
  refresh?: string;
  session_uid?: string;
};

type ServerPayload = {
  state?: string;
  session?: ServerSession | null;
  user?: { full_name?: string; mosque_name?: string | null } | null;
  exam_eligibility?: {
    can_enter_exam?: boolean;
    has_in_progress_exam?: boolean;
    has_completed_exam?: boolean;
    tracking_code?: string | null;
  } | null;
  next?: Partial<NextStep>;
  reason?: string;
  phone_hint?: string;
};

function normalizeServer(raw: unknown): Identity {
  const p = (raw ?? {}) as ServerPayload;
  const elig = p.exam_eligibility ?? {};
  const completed = Boolean(elig.has_completed_exam) || p.state === "completed";
  const inProgress = Boolean(elig.has_in_progress_exam);
  const tracking = elig.tracking_code ?? null;

  const fallback: NextStep = completed
    ? {
        path: `/receipt?code=${encodeURIComponent(tracking ?? "")}`,
        label: "دیدنِ کارنامه",
        reason: "کارنامهٔ شما صادر شده است.",
      }
    : p.state === "no_session"
      ? ANON.next
      : {
          path: "/exam",
          label: inProgress ? "ادامهٔ آزمون" : "ورود به آزمون",
          reason: inProgress ? "آزمونِ شما باز است." : "پروندهٔ شما آماده است.",
        };

  const next: NextStep = {
    path: p.next?.path || fallback.path,
    label: p.next?.label || fallback.label,
    reason: p.next?.reason || fallback.reason,
  };

  const state: IdentityState =
    p.state === "revived"
      ? "revived"
      : completed
        ? "completed"
        : p.state === "session"
          ? "session"
          : p.state === "no_session"
            ? "no_session"
            : p.state === "completed"
              ? "completed"
              : "no_session";

  return {
    state,
    fullName: p.user?.full_name ?? "",
    mosqueName: p.user?.mosque_name ?? null,
    trackingCode: tracking,
    phoneHint: p.phone_hint ?? "",
    canEnterExam: Boolean(elig.can_enter_exam),
    hasInProgress: inProgress,
    completed,
    next,
    reason: p.reason ?? next.reason,
    at: Date.now(),
    stale: false,
  };
}

/**
 * تنها درِ ورودیِ «هویت» — با کش، single-flight و شکستِ نرم.
 *
 * @param opts.force  کشِ حافظه‌ای را نادیده بگیر (بعد از خطای ۴۰۱ لازم است).
 */
export async function resolveIdentity(opts?: { force?: boolean }): Promise<Identity> {
  const force = opts?.force === true;
  if (typeof window === "undefined") return ANON;

  if (!force && memory && Date.now() - memory.at < TTL_MS) return memory.identity;
  if (!force && inflight) return inflight;

  const session = getSession();
  const snapshot = readIdentitySnapshot();

  // بی‌نشست و بی‌اِسنپ‌شات ⇒ هیچ درخواستی لازم نیست.
  if (!session && !snapshot) {
    memory = { identity: ANON, at: Date.now() };
    return ANON;
  }

  const body: Record<string, string> = {};
  if (session?.access) body.access = session.access;
  if (session?.refresh) body.refresh = session.refresh;

  const run = (async (): Promise<Identity> => {
    try {
      const raw = await postSessionState(body);
      const identity = normalizeServer(raw);

      // توکنِ تازه را همان‌جا بنشان تا درخواستِ بعدی ۴۰۱ نگیرد.
      const s = raw as ServerPayload;
      if (s.session?.access) {
        patchSession({
          access: s.session.access,
          refresh: s.session.refresh ?? getSession()?.refresh,
          fullName: identity.fullName || getSession()?.fullName,
          mosqueName: identity.mosqueName,
          trackingCode: identity.trackingCode,
        });
      }

      memory = { identity, at: Date.now() };
      writeIdentitySnapshot(identity);
      emit();
      return identity;
    } catch {
      /*
       * شکستِ شبکه: مهم‌ترین قاعدهٔ این فایل این‌جاست. **هرگز** کاربرِ
       * دارای پرونده را به «تازه‌وارد» تبدیل نکن. اگر اِسنپ‌شات یا نشستی
       * داریم، همان را با `stale` برگردان؛ رابط دکمهٔ درست را نشان می‌دهد
       * و در پس‌زمینه دوباره تلاش می‌شود.
       */
      if (snapshot) {
        const offline: Identity = { ...snapshot, state: "offline", stale: true };
        memory = { identity: offline, at: Date.now() };
        return offline;
      }
      if (session) {
        const optimistic: Identity = {
          ...ANON,
          state: "offline",
          fullName: session.fullName || "",
          mosqueName: session.mosqueName ?? null,
          trackingCode: session.trackingCode ?? null,
          next: session.trackingCode
            ? {
                path: `/receipt?code=${encodeURIComponent(session.trackingCode)}`,
                label: "دیدنِ کارنامه",
                reason: "کارنامهٔ شما صادر شده است.",
              }
            : {
                path: "/exam",
                label: "ادامهٔ آزمون",
                reason: "پروندهٔ شما روی این دستگاه ذخیره است.",
              },
          reason: "ارتباط با سرور برقرار نشد؛ از پروندهٔ ذخیره‌شده استفاده می‌کنیم.",
          at: Date.now(),
          stale: true,
        };
        memory = { identity: optimistic, at: Date.now() };
        return optimistic;
      }
      memory = { identity: ANON, at: Date.now() };
      return ANON;
    } finally {
      inflight = null;
    }
  })();

  inflight = run;
  return run;
}

async function postSessionState(body: Record<string, string>): Promise<unknown> {
  // دینامیک: لایهٔ کلاینت را در بارگذاریِ اولیه نکشیم (این فایل ممکن است در
  // هدر بیاید و هدر روی هر صفحه‌ای هست).
  const { apiPost } = await import("./client");
  return apiPost("/api/v1/auth/session/state/", body, {
    headers: { "Content-Type": "application/json" },
  });
}
