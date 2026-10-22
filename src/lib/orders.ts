import type { Order } from "@/types";

const STORAGE_KEY = "orraviola_orders";
const MAX_ORDERS = 30;

/** Ambil seluruh pesanan tersimpan di perangkat ini. */
export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

/** Simpan pesanan (menaikkan ke atas, deduplikasi by id). */
export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getOrders();
    const previous = existing.find((o) => o.id === order.id);
    const merged: Order = previous ? { ...order, t: previous.t } : order;
    const next = [merged, ...existing.filter((o) => o.id !== order.id)].slice(0, MAX_ORDERS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage penuh / diblokir — abaikan, checkout tetap jalan */
  }
}

export function findOrder(id: string): Order | undefined {
  const key = id.trim().toUpperCase();
  return getOrders().find((o) => o.id.toUpperCase() === key);
}

export function clearOrders(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* abaikan */
  }
}
