import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * کشِ هویت — آزمونِ حافظه، single-flight، و «هرگز کاربر را تازه‌وارد جا نزن».
 *
 * این فایل قلبِ رفعِ باگِ «فرمِ خالی» است. اگر یک روز کسی لایهٔ کش را
 * «ساده» کند، این تست‌ها می‌گویند چه چیزی از دست می‌رود.
 */

const apiPost = vi.fn();
vi.mock("../client", () => ({
  apiPost: (...args: unknown[]) => apiPost(...args) as unknown,
}));

const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memoryStore.set(k, v);
  },
  removeItem: (k: string) => {
    memoryStore.delete(k);
  },
  clear: () => memoryStore.clear(),
  key: (i: number) => [...memoryStore.keys()][i] ?? null,
  get length() {
    return memoryStore.size;
  },
};

const SESSION_KEY = "k185-session-v1";

function seedSession(over: Record<string, unknown> = {}) {
  memoryStore.set(
    SESSION_KEY,
    JSON.stringify({ access: "a".repeat(40), fullName: "محمد رضایی", ...over }),
  );
}

const {
  resolveIdentity,
  readIdentitySnapshot,
  writeIdentitySnapshot,
  clearIdentitySnapshot,
  invalidateIdentity,
} = await import("../identity");

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock);
  memoryStore.clear();
  apiPost.mockReset();
  invalidateIdentity();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("resolveIdentity", () => {
  it("بی‌نشست و بی‌اِسنپ‌شات: هیچ درخواستی نمی‌فرستد و no_session می‌دهد", async () => {
    const id = await resolveIdentity();
    expect(id.state).toBe("no_session");
    expect(id.next.path).toBe("/register");
    expect(apiPost).not.toHaveBeenCalled();
  });

  it("با نشست: پاسخ سرور را می‌خواند و مقصد را از سرور می‌گیرد", async () => {
    seedSession();
    apiPost.mockResolvedValue({
      state: "session",
      user: { full_name: "محمد رضایی", mosque_name: "مسجد النبی" },
      exam_eligibility: { can_enter_exam: true, has_in_progress_exam: false },
      next: { path: "/exam", label: "ورود به آزمون", reason: "آماده است" },
    });
    const id = await resolveIdentity();
    expect(apiPost).toHaveBeenCalledWith(
      "/api/v1/auth/session/state/",
      expect.objectContaining({ access: "a".repeat(40) }),
      expect.anything(),
    );
    expect(id.state).toBe("session");
    expect(id.next.label).toBe("ورود به آزمون");
    expect(id.fullName).toBe("محمد رضایی");
  });

  it("کاربرِ تمام‌شده: مقصد کارنامه است حتی اگر نشست زنده باشد", async () => {
    seedSession();
    apiPost.mockResolvedValue({
      state: "session",
      user: { full_name: "سارا" },
      exam_eligibility: { has_completed_exam: true, tracking_code: "K185-9" },
    });
    const id = await resolveIdentity();
    expect(id.state).toBe("completed");
    expect(id.next.path).toBe("/receipt?code=K185-9");
  });

  it("توکنِ تازه‌ای که سرور در revived می‌دهد در نشست می‌نشیند", async () => {
    seedSession({ refresh: "r".repeat(40) });
    apiPost.mockResolvedValue({
      state: "revived",
      session: { access: "NEW-ACCESS-TOKEN-VALUE-1234567890", refresh: "NEW-REFRESH" },
      user: { full_name: "محمد" },
      exam_eligibility: { can_enter_exam: true },
    });
    const id = await resolveIdentity({ force: true });
    expect(id.state).toBe("revived");
    const stored = JSON.parse(memoryStore.get(SESSION_KEY) ?? "{}") as Record<string, unknown>;
    expect(stored.access).toBe("NEW-ACCESS-TOKEN-VALUE-1234567890");
    expect(stored.refresh).toBe("NEW-REFRESH");
  });

  it("کشِ حافظه‌ای: دو فراخوانی پشتِ‌سرهم ⇒ یک درخواست", async () => {
    seedSession();
    apiPost.mockResolvedValue({ state: "session", exam_eligibility: { can_enter_exam: true } });
    await resolveIdentity();
    await resolveIdentity();
    expect(apiPost).toHaveBeenCalledTimes(1);
  });

  it("single-flight: دو فراخوانیِ هم‌زمان ⇒ یک درخواست", async () => {
    seedSession();
    let release: (v: unknown) => void = () => {};
    apiPost.mockReturnValue(
      new Promise((r) => {
        release = r;
      }),
    );
    const [a, b] = [resolveIdentity(), resolveIdentity()];
    release({ state: "session", exam_eligibility: {} });
    const [x, y] = await Promise.all([a, b]);
    expect(apiPost).toHaveBeenCalledTimes(1);
    expect(x.next.path).toBe(y.next.path);
  });

  it("force: کشِ حافظه‌ای را دور می‌زند (بعد از ۴۰۱ لازم است)", async () => {
    seedSession();
    apiPost.mockResolvedValue({ state: "session", exam_eligibility: {} });
    await resolveIdentity();
    await resolveIdentity({ force: true });
    expect(apiPost).toHaveBeenCalledTimes(2);
  });

  it("شبکهٔ قطع: کاربرِ دارای نشست «تازه‌وارد» نمی‌شود — offline با مقصد /exam", async () => {
    seedSession();
    apiPost.mockRejectedValue(new Error("network down"));
    const id = await resolveIdentity({ force: true });
    expect(id.state).toBe("offline");
    expect(id.stale).toBe(true);
    expect(id.next.path).toBe("/exam");
  });

  it("شبکهٔ قطع + اِسنپ‌شات: اِسنپ‌شات برنده است و مقصدش حفظ می‌شود", async () => {
    seedSession();
    writeIdentitySnapshot({
      state: "completed",
      fullName: "سارا",
      mosqueName: null,
      trackingCode: "K185-777",
      phoneHint: "0990***3741",
      canEnterExam: false,
      hasInProgress: false,
      completed: true,
      next: { path: "/receipt?code=K185-777", label: "دیدنِ کارنامه", reason: "—" },
      reason: "—",
      at: Date.now(),
      stale: false,
    });
    apiPost.mockRejectedValue(new Error("offline"));
    const id = await resolveIdentity({ force: true });
    expect(id.state).toBe("offline");
    expect(id.next.path).toBe("/receipt?code=K185-777");
    expect(id.fullName).toBe("سارا");
  });

  it("اِسنپ‌شاتِ خیلی کهنه (بیش از ۷ روز) دیگر معتبر نیست", () => {
    writeIdentitySnapshot({
      state: "session",
      fullName: "قدیمی",
      mosqueName: null,
      trackingCode: null,
      phoneHint: "",
      canEnterExam: true,
      hasInProgress: false,
      completed: false,
      next: { path: "/exam", label: "ادامهٔ آزمون", reason: "" },
      reason: "",
      at: Date.now() - 8 * 86_400_000,
      stale: false,
    });
    expect(readIdentitySnapshot()).toBeNull();
  });

  it("اِسنپ‌شاتِ خراب (JSON نامعتبر) کرش نمی‌کند", () => {
    memoryStore.set("k185-identity-v1", "{not json");
    expect(readIdentitySnapshot()).toBeNull();
  });

  it("clearIdentitySnapshot اِسنپ‌شات را پاک می‌کند", () => {
    writeIdentitySnapshot({
      state: "session",
      fullName: "x",
      mosqueName: null,
      trackingCode: null,
      phoneHint: "",
      canEnterExam: true,
      hasInProgress: false,
      completed: false,
      next: { path: "/exam", label: "ادامه", reason: "" },
      reason: "",
      at: Date.now(),
      stale: false,
    });
    expect(readIdentitySnapshot()).not.toBeNull();
    clearIdentitySnapshot();
    expect(readIdentitySnapshot()).toBeNull();
  });
});
