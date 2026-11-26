// Pure helpers shared by server and client code.

import type { MedicineAvailability, StockStatus } from "./types";

const STATUS_ORDER: Record<StockStatus, number> = {
  in_stock: 0,
  low_stock: 1,
  out_of_stock: 2,
};

export const STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function compareStatus(a: StockStatus, b: StockStatus): number {
  return STATUS_ORDER[a] - STATUS_ORDER[b];
}

export function bestStatus(rows: Pick<MedicineAvailability, "stock_status">[]): StockStatus {
  return rows.reduce<StockStatus>(
    (best, row) => (compareStatus(row.stock_status, best) < 0 ? row.stock_status : best),
    "out_of_stock",
  );
}

export function isAvailable(status: StockStatus): boolean {
  return status !== "out_of_stock";
}

/** Keeps letters (any language), digits, spaces and hyphens; max 60 chars. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function medicineLabel(m: Pick<MedicineAvailability, "generic_name" | "brand_name">): string {
  return m.brand_name ? `${m.generic_name} (${m.brand_name})` : m.generic_name;
}

export function medicineDetail(
  m: Pick<MedicineAvailability, "strength" | "dosage_form">,
): string {
  return [m.strength, m.dosage_form].filter(Boolean).join(" · ");
}

/** Great-circle distance in kilometres. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function directionsUrl(p: { latitude: number; longitude: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatRelative(iso: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
