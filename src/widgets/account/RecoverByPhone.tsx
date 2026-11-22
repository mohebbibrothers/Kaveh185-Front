"use client";

import { useState } from "react";
import Link from "next/link";
import { lookupParticipant, type LookupResult } from "@/shared/api/lookup";
import { saveSession } from "@/shared/api/session";
import { invalidateIdentity } from "@/shared/api/identity";
import { resolveRoute } from "@/shared/lib/route";
import { PrimaryButton, Field, FormAlert } from "@/shared/ui/Field";
import { normalizePhone } from "@/shared/lib/validate";

/**
 * «پروندهٔ من را پیدا کن» — شمارهٔ همراه **و** کد ملی.
 *
 * ══ چرا کد ملی اضافه شد؟ ═════════════════════════════════════════════════
 * قبلاً فقط شماره کافی بود. یعنی هر کسی که شمارهٔ یک شرکت‌کننده را می‌دانست
 * (شماره‌ها در گروه‌های محلی می‌چرخند) می‌توانست نشستِ او را بگیرد و
 * کارنامه‌اش را ببیند. حالا دو عامل لازم است و **هر دو** باید به همان پرونده
 * تعلق داشته باشند؛ سرور این را با یک تطابقِ هم‌زمان می‌سنجد، نه با دو
 * پرسشِ جدا (که حملهٔ «حدسِ تدریجی» را ممکن می‌کرد).
 *
 * ══ چهار حالتِ پاسخ، چهار رابطِ متفاوت ═══════════════════════════════════
 *   • `not_found`      ⇒ پیامِ کوتاه، بدونِ فاش‌کردنِ اینکه شماره هست یا نه.
 *   • `session_ready`  ⇒ نشست ذخیره می‌شود و مستقیم به آزمون می‌رویم.
 *   • `exam_completed` ⇒ به کارنامه با کدِ رهگیری (نشست لازم نیست).
 *   • `mismatch`       ⇒ «شماره و کد ملی با هم نمی‌خوانند» — بدونِ گفتنِ
 *     اینکه کدام‌شان غلط است (همان سیاستِ سرور برای ورودِ مدیران).
 */
export function RecoverByPhone({ onRecovered }: { onRecovered?: () => void }) {
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const phoneOk = /^09\d{9}$/.test(normalizePhone(phone));
  const nidOk = nid.replace(/\D/g, "").length === 10;
  const canSubmit = phoneOk && nidOk && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await lookupParticipant(normalizePhone(phone), nid.replace(/\D/g, ""));
      if (!res.found) {
        // پیامِ واحد برای «شماره نیست» و «کد ملی نمی‌خواند» تا کسی از این
        // مسیر پرونده کشف نکند.
        setError(
          "پرونده‌ای با این شماره و کد ملی پیدا نشد. هر دو را با دقت بررسی کنید. اگر شماره یا کد ملی را عوض کرده‌اید، همین‌جا ثبت‌نامِ تازه بسازید.",
        );
        return;
      }
      if (res.state === "exam_completed") {
        setResult(res);
        return;
      }
      if (res.access) {
        saveSession({
          access: res.access,
          refresh: res.refresh,
          fullName: res.user?.full_name ?? "شرکت‌کننده",
          mosqueName: res.user?.mosque_name ?? null,
        });
        // کشِ هویت پاک می‌شود تا با نشستِ تازه از نو ساخته شود.
        invalidateIdentity();
        onRecovered?.();
        return;
      }
      setError("پاسخِ سرور کامل نبود. یک بار دیگر تلاش کنید.");
    } catch {
      setError("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setBusy(false);
    }
  }

  // ── حالتِ «آزمون داده‌ام» ────────────────────────────────────────────────
  if (result?.state === "exam_completed") {
    const code = result.tracking_code ?? "";
    return (
      <div className="border-verde/30 bg-verde/[0.06] rounded-2xl border p-4">
        <p className="text-verde text-[12.5px] font-extrabold">
          {result.user?.full_name
            ? `${result.user.full_name}، کارنامه‌تان آماده است`
            : "کارنامه‌تان آماده است"}
        </p>
        <p className="text-text-muted mt-1.5 text-[11.5px] leading-6">
          شما قبلاً در این آزمون شرکت کرده‌اید. هر کد ملی فقط یک بار مجاز است؛ جای آزمونِ تازه،
          کارنامه‌تان را ببینید.
        </p>
        <Link
          href={resolveRoute(`/receipt?code=${encodeURIComponent(code)}`)}
          className="bg-brand text-on-brand mt-3 inline-flex h-10 items-center rounded-xl px-4 text-[12.5px] font-extrabold"
        >
          دیدنِ کارنامه
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-4">
      <p className="text-text text-[13px] font-extrabold">پروندهٔ من را پیدا کن</p>
      <p className="text-text-muted mt-1 text-[11.5px] leading-6">
        اگر قبلاً ثبت‌نام کرده‌اید، با شمارهٔ همراه <span className="font-extrabold">و</span> کد
        ملی‌تان وارد شوید — لازم نیست فرم را دوباره پر کنید.
      </p>

      <form
        className="mt-3 space-y-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field
          label="شمارهٔ همراه"
          value={phone}
          onChange={(x) => {
            setPhone(x);
            setError(null);
          }}
          inputMode="numeric"
          autoComplete="tel"
          ltr
          placeholder="09xxxxxxxxx"
        />
        <Field
          label="کد ملی"
          value={nid}
          onChange={(x) => {
            setNid(x);
            setError(null);
          }}
          inputMode="numeric"
          autoComplete="off"
          ltr
          placeholder="۱۰ رقم"
        />
        <PrimaryButton
          type="submit"
          loading={busy}
          loadingLabel="در حال بررسی…"
          disabled={!canSubmit}
          className="w-full"
        >
          {busy ? "در حال بررسی…" : "پیدا کردنِ پرونده"}
        </PrimaryButton>
      </form>

      {error ? (
        <div className="mt-2.5">
          <FormAlert title="پیدا نشد">{error}</FormAlert>
        </div>
      ) : null}

      <p className="text-text-subtle mt-2.5 text-[10.5px] leading-5">
        چرا کد ملی؟ برای اینکه فقط خودِ صاحبِ پرونده بتواند کارنامه را ببیند. شمارهٔ همراه به‌تنهایی
        برای شناسایی کافی نیست.
      </p>
    </div>
  );
}
