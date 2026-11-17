"use client";

import { createContext, useContext } from "react";
import type { Bootstrap } from "./landing";
import type { DataFreshness } from "./bootstrap";
import { FALLBACK_BOOTSTRAP } from "./fallback";

/**
 * اشتراک یک نمونهٔ دادهٔ تازه‌شده بین بخش‌های صفحه.
 *
 * چرا context و نه یک قلاب در هر ویجت؟ اگر هر بخش خودش polling کند، یک
 * صفحهٔ باز = سه درخواست در دقیقه به API. با یک منبع در بالای درخت،
 * همهٔ بخش‌ها همان داده را می‌بینند و شبکه یک‌بار هزینه می‌شود.
 *
 * مقدار پیش‌فرض `null` است تا استفاده بیرون از provider در تست‌ها
 * به‌جای کرش، fallback بگیرد (← `useData`).
 */
export interface DataContextValue {
  data: Bootstrap;
  freshness: DataFreshness;
  lastOk: string;
}

export const DataContext = createContext<DataContextValue | null>(null);

/** مقدار پیش‌فرضِ بی‌provider — همان پوستهٔ خالی، نه دادهٔ ساختگی. */
const ORPHAN_VALUE: DataContextValue = {
  data: FALLBACK_BOOTSTRAP,
  freshness: "shell",
  lastOk: FALLBACK_BOOTSTRAP.server_time,
};

/**
 * دادهٔ جاری. اگر provider نبود (مثلاً در تست کامپوننتی) پوستهٔ خالی
 * برمی‌گردد — بی‌آرگومان، تا هر مصرف‌کننده مجبور نباشد fallback خودش را
 * بسازد و دو نسخهٔ متفاوت از «حالت خالی» نداشته باشیم.
 */
export function useData(fallback?: DataContextValue): DataContextValue {
  return useContext(DataContext) ?? fallback ?? ORPHAN_VALUE;
}
