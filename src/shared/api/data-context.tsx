"use client";

import { createContext, useContext } from "react";
import type { Bootstrap } from "./landing";
import type { DataFreshness } from "./bootstrap";

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

/** دادهٔ جاری؛ اگر provider نبود همان مقدار اولیه‌ای که داده شده. */
export function useData(fallback: DataContextValue): DataContextValue {
  return useContext(DataContext) ?? fallback;
}
