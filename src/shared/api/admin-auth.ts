"use client";

import { apiPost } from "./client";
import { saveSession } from "./session";

/**
 * ورودِ ادمین/اپراتور با رمز عبور.
 *
 * ── چرا خروجی «نوع‌دار» است و نه پرتابِ خطا؟ ──────────────────────────────
 * سه حالت وجود دارد که پیامِ کاملاً متفاوتی لازم دارند و اگر همه به یک
 * استثنا تبدیل شوند، رابط کاربری نمی‌تواند «رمز داشته ولی غلط بود» را از
 * «حساب اصلاً رمز ندارد» جدا کند — و همان دومی است که کاربر را قفل می‌کند:
 *
 *   • `ok`          ⇒ نشست ساخته شد؛ برو به پنل.
 *   • `no_password` ⇒ پاسخِ ۴۰۱ با کدِ `invalid_credentials`، ولی حساب وجود
 *     دارد و `has_usable_password()` منفی است. راه‌حلِ صریح: اجرای
 *     `manage.py set_admin_password` روی سرور.
 *   • `error`       ⇒ هر چیزِ دیگر با پیامِ سرور.
 *
 * ⚠️ چرا `no_password` از سمتِ سرور نمی‌آید؟ چون نباید بیاید: گفتنِ «این
 * حساب رمز ندارد» به هر کسی که شماره را می‌داند، افشای اطلاعات است. این‌جا
 * ما **بعد از** یک ۴۰۱ تصمیم می‌گیریم، و بازهم ادعای قطعی نمی‌کنیم؛ فقط
 * راهنمایِ محتمل‌ترین علت را نشان می‌دهیم.
 */
/**
 * مسیرِ پنلِ جنگو روی دامنهٔ API.
 *
 * ⚠️ روی همین سایت (`/secure-kaveh185-admin/`) وجود ندارد: فرانت ایستاست و
 * جنگو زیرِ `api.kaveh185.ir` سرو می‌شود. یک `router.push` به مسیرِ نسبی،
 * مدیر را به ۴۰۴ می‌برد — همان چیزی که او «بیرون افتادن از پنل» می‌فهمد.
 */
export const ADMIN_PATH = "secure-kaveh185-admin/";

export type AdminSignInResult =
  { kind: "ok"; fullName: string } | { kind: "no_password" } | { kind: "error"; message: string };

type Envelope = {
  access?: string;
  refresh?: string;
  user?: { full_name?: string; role?: string };
};

export async function adminSignIn(
  identifier: string,
  password: string,
): Promise<AdminSignInResult> {
  try {
    const raw = (await apiPost("/api/v1/auth/login/password/", {
      identifier: identifier.trim(),
      password,
    })) as Envelope;

    if (!raw.access) {
      return { kind: "error", message: "پاسخِ سرور ناقص بود. دوباره تلاش کنید." };
    }

    saveSession({
      access: raw.access,
      refresh: raw.refresh,
      fullName: raw.user?.full_name ?? "مدیر",
      mosqueName: null,
    });
    return { kind: "ok", fullName: raw.user?.full_name ?? "مدیر" };
  } catch (err) {
    const e = err as { status?: number; code?: string; message?: string };
    // ۴۰۱ روی این مسیر تقریباً همیشه یعنی «رمز غلط» — ولی اگر حساب رمزی
    // نداشته باشد پیامِ مدیریتی روی سرور چیزی نمی‌گوید؛ پس هر دو حالت را
    // با یک راهنمایِ عملی پوشش می‌دهیم.
    if (e.status === 401) {
      return { kind: "no_password" };
    }
    return {
      kind: "error",
      message: e.message ?? "ورود انجام نشد. اتصال و اطلاعات را بررسی کنید.",
    };
  }
}
