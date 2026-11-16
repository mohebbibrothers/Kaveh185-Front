"use client";

import { useEffect, useState } from "react";
import { fetchBootstrapLive } from "./live";
import type { Bootstrap } from "./landing";

/**
 * خواندن دادهٔ صفحهٔ اول در صفحه‌های داخلی (`/rules`، `/mosques`، …).
 *
 * چرا از `LandingShell` استفاده نمی‌کنیم؟ آن پوستهٔ صفحهٔ اول است و هدر/هیرو/فوتر
 * خودش را دارد. صفحه‌های داخلی فقط داده می‌خواهند.
 *
 * چرا حالت اولیه `null` و نه پوستهٔ خالی؟ چون این صفحه‌ها عدد ساختگی ندارند
 * و می‌خواهیم تفاوت «هنوز نرسیده» و «رسیده» را به کاربر نشان دهیم — با
 * همان اصل «پوستهٔ صادقانه»: تا داده نیامده، جای عدد «—» است، نه صفر.
 */
export type BootstrapState =
  | { phase: "loading"; data: null }
  | { phase: "ready"; data: Bootstrap }
  | { phase: "error"; data: null };

export function useBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({ phase: "loading", data: null });

  useEffect(() => {
    let alive = true;
    fetchBootstrapLive()
      .then((data) => {
        if (alive) setState({ phase: "ready", data });
      })
      .catch(() => {
        if (alive) setState({ phase: "error", data: null });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
