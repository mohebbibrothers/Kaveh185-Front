"use client";

import { useEffect, useState } from "react";
import type { Martyr } from "@/shared/api/landing";

/**
 * «شهدا را برای فوترِ صفحه‌های داخلی بیاور.»
 *
 * ── چرا لازم شد؟ ─────────────────────────────────────────────────────────
 * صفحهٔ اول دادهٔ کامل را از قبل دارد و بی‌واسطه به فوتر می‌دهد. ولی
 * صفحه‌های `/rules`، `/book`، `/mosques` و … ایستا هستند و هیچ داده‌ای
 * نمی‌گیرند؛ در نتیجه یادوارهٔ شهدا زیرِ آن‌ها خالی می‌ماند و فوتر
 * «نصفه» به نظر می‌رسد.
 *
 * ── سه تصمیم ─────────────────────────────────────────────────────────────
 * ۱) **بدونِ دادهٔ جعلی**: تا وقتی پاسخ نیامده، فهرست خالی است و
 *    `MartyrsMarquee` هیچ چیزی رندر نمی‌کند (اصلِ صداقت).
 * ۲) **یک درخواستِ سبک**: مستقیم `/api/v1/gallery/` — همان نقطه‌ای که
 *    فقط گالری را می‌دهد، نه کلِ bootstrap. کشِ ماژول هم دارد تا اگر
 *    کاربر بین صفحه‌ها جابه‌جا شد، درخواست تکرار نشود.
 * ۳) **بی‌صدا در خطا**: فوتر هرگز به‌خاطرِ نبودِ این داده نمی‌شکند.
 *
 * ⚠️ `AbortController` هست تا در جابه‌جاییِ سریع، setState روی کامپوننتِ
 * unmount‌شده اجرا نشود.
 */
const ENDPOINT = "/api/v1/gallery/";

let cache: Martyr[] | null = null;

export function useFooterMartyrs(limit = 12): Martyr[] {
  const [items, setItems] = useState<Martyr[]>(() => cache ?? []);

  useEffect(() => {
    if (cache) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: { martyrs?: Martyr[] } };
        const list = payload.data?.martyrs ?? [];
        cache = list.slice(0, limit);
        setItems(cache);
      } catch {
        /* شبکه/سرور در دسترس نیست — یادواره ساکت می‌ماند، فوتر سالم */
      }
    };

    void load();
    return () => {
      controller.abort();
    };
  }, [limit]);

  return items;
}
