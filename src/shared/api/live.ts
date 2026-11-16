"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "./client";
import { isBootstrap } from "./guard";
import type { DataFreshness } from "./bootstrap";
import type { Bootstrap } from "./landing";

/**
 * تازه‌سازی دادهٔ صفحهٔ اول در مرورگر.
 *
 * چرا در مرورگر و نه سرور؟ چون سایت ایستاست (← `next.config.ts`). HTML در
 * زمان ساخت پخته می‌شود؛ اگر فقط به آن تکیه کنیم، جدول مساجد تا انتشار
 * بعدی منجمد می‌ماند.
 *
 * سه تصمیم که این قلاب را از یک `setInterval` ساده جدا می‌کند:
 *
 * ۱) **صرفه‌جویی در دادهٔ کاربر.** هر ۶۰ ثانیه فقط وقتی درخواست می‌رود که
 *    برگه دیده می‌شود (`Page Visibility`). برگهٔ پنهان منبعِ درخواستِ بی‌فایده
 *    است — و برای کاربر موبایلِ ایرانی، دادهٔ واقعی.
 * ۲) **بدون پرش.** دادهٔ تازه فقط وقتی جایگزین می‌شود که *تغییری* کرده باشد
 *    (مقایسهٔ JSON). وگرنه هر دقیقه کل جدول بی‌دلیل دوباره رندر می‌شد.
 * ۳) **شکست بی‌صدا نیست.** اگر تازه‌سازی شکست خورد، دادهٔ قبلی می‌ماند و
 *    برچسب «آخرین به‌روزرسانی موفق» تغییر نمی‌کند؛ کاربر هرگز عدد پاک‌شده
 *    یا خطای قرمز وسط صفحه نمی‌بیند.
 */
/**
 * خواندن تازه از مرورگر.
 *
 * ⚠️ چرا zod اینجا نیست؟ مسیر کلاینت، پاسخِ سرور خودمان را دوباره
 * اعتبارسنجی می‌کند؛ zod در این مسیر ۴۰KB gzip به بستهٔ اولیه اضافه می‌کرد
 * (سنجیده شد) بدون هیچ سود امنیتی. اعتبارسنجی کامل در **زمان ساخت**
 * می‌ماند (`bootstrap.ts`)، و اینجا `isBootstrap` فقط جلوی تزریق
 * `undefined` به درخت React را می‌گیرد.
 *
 * `cache: "no-store"` تا کش HTTP پاسخ کهنه ندهد.
 */
export async function fetchBootstrapLive(): Promise<Bootstrap> {
  const raw = await apiGet("/api/v1/core/bootstrap/", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!isBootstrap(raw)) throw new Error("پاسخ تازهٔ سرور ساختار مورد انتظار را ندارد");
  return raw;
}

export function useLiveBootstrap(initial: Bootstrap, initialFetchedAt: string) {
  const [data, setData] = useState(initial);
  const [freshness, setFreshness] = useState<DataFreshness>("build");
  const [lastOk, setLastOk] = useState(initialFetchedAt);
  const [refreshing, setRefreshing] = useState(false);

  /** آخرین JSON موفق — برای تشخیص تغییر واقعی و جلوگیری از رندر بی‌مورد */
  const lastJson = useRef<string>(JSON.stringify(initial));
  /** جلوگیری از درخواست‌های هم‌زمان */
  const inFlight = useRef(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const next = await fetchBootstrapLive();
      if (!mounted.current) return;
      const json = JSON.stringify(next);
      if (json !== lastJson.current) {
        lastJson.current = json;
        setData(next);
        setFreshness("live");
      } else if (freshness !== "live") {
        setFreshness("live");
      }
      // برچسب زمان از ساعتِ خودِ سرور می‌آید، نه از ساعتِ دستگاه کاربر
      setLastOk(next.server_time);
    } catch {
      if (mounted.current) setFreshness((f) => (f === "live" ? "stale" : "stale"));
    } finally {
      if (mounted.current) setRefreshing(false);
      inFlight.current = false;
    }
  }, [freshness]);

  useEffect(() => {
    mounted.current = true;

    const POLL_MS = 60_000;
    let timer: number | undefined;

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, POLL_MS);
    };

    // نخستین تازه‌سازی کمی پس از هیدریشن: کاربر صفحه را سریع می‌بیند و
    // درخواست، رقابت با تصویر هیرو و فونت نمی‌کند.
    const warm = window.setTimeout(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 1200);

    // بازگشت به برگه ⇒ تازه‌سازی فوری؛ تایمر هم از نو تنظیم می‌شود
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
      schedule();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted.current = false;
      window.clearTimeout(warm);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { data, freshness, lastOk, refreshing, refresh };
}
