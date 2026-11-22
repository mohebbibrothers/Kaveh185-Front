"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  invalidateIdentity,
  readIdentitySnapshot,
  resolveIdentity,
  subscribeIdentity,
  type Identity,
} from "./identity";

/**
 * `useIdentity()` — یک قلاب برای همهٔ CTAها، هدر، `/register`، `/login` و `/exam`.
 *
 * ── قراردادِ این قلاب (سه ضمانت) ──────────────────────────────────────────
 *  ۱) **هیچ‌وقت hydration mismatch نمی‌دهد.** رندرِ سرور و اولین رندرِ کلاینت
 *     دقیقاً یک خروجی دارند (`status: "pending"`)، و مقدارِ واقعی در
 *     `useEffect` می‌نشیند. بنابراین سایت هرگز با React خطا نمی‌دهد و دکمه
 *     هم «پرش» نمی‌کند (عرض با `min-w` قفل است).
 *  ۲) **هیچ‌وقت کاربرِ دارای پرونده را «تازه‌وارد» نمی‌بیند.** اگر شبکه
 *     بخوابد، از اِسنپ‌شات با `state: "offline"` استفاده می‌شود.
 *  ۳) **پس از هر تغییرِ نشست خودش را تازه می‌کند** (رویدادِ `k185:session`).
 */
export type IdentityStatus = "pending" | "ready";

export type UseIdentity = {
  identity: Identity;
  status: IdentityStatus;
  /** برچسبِ دکمهٔ اصلی (پیش از آماده‌شدن، متنِ بی‌طرف). */
  label: string;
  href: string;
  /** اگر کاربر نشستی دارد (به‌هرحال، حتی offline). */
  hasSession: boolean;
  refresh: () => void;
};

/**
 * خواندنِ اِسنپ‌شات با `useSyncExternalStore` تا هر تب/هر تغییر، همهٔ
 * مصرف‌کننده‌ها را هم‌زمان بیدار کند. مقدارِ سرور `null` است تا SSR و CSR
 * یکی باشند.
 */
export function useIdentitySnapshot(): Identity | null {
  return useSyncExternalStore(
    subscribeIdentity,
    () => readIdentitySnapshot(),
    () => null,
  );
}

export function useIdentity(): UseIdentity {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [status, setStatus] = useState<IdentityStatus>("pending");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    /*
     * ابتدا اِسنپ‌شات: همان فریمِ اولِ پس از hydration، دکمهٔ درست را نشان
     * می‌دهد (بدونِ انتظار برای شبکه). بعد نتیجهٔ سرور می‌رسد و تصحیح می‌کند.
     */
    const snap = readIdentitySnapshot();
    const id = window.setTimeout(() => {
      if (!alive) return;
      if (snap) {
        setIdentity(snap);
        setStatus("ready");
      }
      void resolveIdentity({ force: nonce > 0 })
        .then((next) => {
          if (!alive) return;
          setIdentity(next);
          setStatus("ready");
        })
        .catch(() => {
          // `resolveIdentity` خودش خطا را می‌بلعد؛ این فقط تورِ ایمنی است.
          if (!alive) return;
          setStatus(snap ? "ready" : "ready");
        });
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [nonce]);

  const refresh = () => {
    invalidateIdentity();
    setNonce((n) => n + 1);
  };

  const resolved = identity;
  return {
    identity: resolved ?? FALLBACK,
    status: resolved ? status : "pending",
    label: resolved ? resolved.next.label : "شرکت در آزمون",
    href: resolved ? resolved.next.path : "/register",
    hasSession: resolved ? resolved.state !== "no_session" : false,
    refresh,
  };
}

/** مقدارِ محافظه‌کارانه پیش از آماده‌شدن — همان چیزی که سرور هم رندر می‌کند. */
const FALLBACK: Identity = {
  state: "no_session",
  fullName: "",
  mosqueName: null,
  trackingCode: null,
  phoneHint: "",
  canEnterExam: false,
  hasInProgress: false,
  completed: false,
  next: { path: "/register", label: "ثبت‌نام و شرکت", reason: "" },
  reason: "",
  at: 0,
  stale: false,
};
