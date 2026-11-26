import "server-only";

import { cacheLife } from "next/cache";
import { connection } from "next/server";

import { bestStatus, compareStatus, DAY_ORDER, sanitizeSearchTerm, toHHMM } from "./format";
import { getDataSource } from "./source";
import type { MedicineAvailability, Pharmacy, PharmacySearchResult } from "./types";
import type { OpeningHoursViewRow, PharmacyViewRow, ProductAvailabilityViewRow } from "./views";

/** Ids are opaque text; this only rejects obvious junk before it reaches the database. */
const ID = /^[A-Za-z0-9_-]{1,64}$/;

// --- view rows → site types (the only place that knows the view columns) -----

function toPharmacy(row: PharmacyViewRow, hours: OpeningHoursViewRow[]): Pharmacy {
  return {
    id: row.pharmacy_id,
    name: row.pharmacy_name,
    address: [row.street_address, row.barangay, row.area, row.province]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", "),
    city: row.area,
    contact_number: row.contact_number?.trim() || null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    hours: hours
      .map((h) => ({ day: h.day_of_week, opens: toHHMM(h.opens_at), closes: toHHMM(h.closes_at) }))
      .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)),
  };
}

function toAvailability(row: ProductAvailabilityViewRow): MedicineAvailability {
  return {
    key: `${row.pharmacy_id}:${row.medicine_id}:${row.brand_name ?? ""}`,
    pharmacy_id: row.pharmacy_id,
    medicine_id: row.medicine_id,
    generic_name: row.generic_name,
    brand_name: row.brand_name?.trim() || null,
    strength: row.strength || null,
    dosage_form: row.form || null,
    // Only RX needs a prescription; OTC and HOUSEHOLD_REMEDY don't (Sein, 26 Nov).
    category: row.classification === "RX" ? "prescription" : "otc",
    stock_status: row.availability_status === "in_stock" ? "in_stock" : "out_of_stock",
    updated_at: new Date(row.last_updated_at).toISOString(),
  };
}

const byStatusThenName = (a: MedicineAvailability, b: MedicineAvailability) =>
  compareStatus(a.stock_status, b.stock_status) ||
  a.generic_name.localeCompare(b.generic_name) ||
  (a.strength ?? "").localeCompare(b.strength ?? "") ||
  (a.brand_name ?? "").localeCompare(b.brand_name ?? "");

// --- queries -----------------------------------------------------------------

/** Pharmacy details and hours change rarely, so they are cached for a few minutes. */
export async function getPharmacies(): Promise<Pharmacy[]> {
  "use cache";
  cacheLife("minutes");
  const source = await getDataSource();
  const [rows, hours] = await Promise.all([source.listPharmacies(), source.listOpeningHours()]);
  const hoursByPharmacy = new Map<string, OpeningHoursViewRow[]>();
  for (const h of hours) {
    const list = hoursByPharmacy.get(h.pharmacy_id) ?? [];
    list.push(h);
    hoursByPharmacy.set(h.pharmacy_id, list);
  }
  return rows.map((row) => toPharmacy(row, hoursByPharmacy.get(row.pharmacy_id) ?? []));
}

export async function getPharmacy(id: string): Promise<Pharmacy | null> {
  if (!ID.test(id)) return null;
  const pharmacies = await getPharmacies();
  return pharmacies.find((p) => p.id === id) ?? null;
}

/**
 * Stock is never cached: every search reads the latest status the
 * inventory/POS wrote.
 */
export async function searchMedicines(rawQuery: string): Promise<PharmacySearchResult[]> {
  await connection();
  const term = sanitizeSearchTerm(rawQuery);
  if (term.length < 2) return [];

  const source = await getDataSource();
  const [rows, pharmacies] = await Promise.all([source.searchProducts(term), getPharmacies()]);

  const byPharmacy = new Map<string, MedicineAvailability[]>();
  for (const row of rows) {
    const item = toAvailability(row);
    const list = byPharmacy.get(item.pharmacy_id) ?? [];
    list.push(item);
    byPharmacy.set(item.pharmacy_id, list);
  }

  const results: PharmacySearchResult[] = [];
  for (const pharmacy of pharmacies) {
    const matches = byPharmacy.get(pharmacy.id);
    if (!matches?.length) continue;
    matches.sort(byStatusThenName);
    results.push({ pharmacy, matches, best_status: bestStatus(matches) });
  }
  return results.sort(
    (a, b) =>
      compareStatus(a.best_status, b.best_status) || a.pharmacy.name.localeCompare(b.pharmacy.name),
  );
}

export async function getPharmacyStock(id: string): Promise<MedicineAvailability[]> {
  await connection();
  if (!ID.test(id)) return [];
  const source = await getDataSource();
  return (await source.listPharmacyProducts(id)).map(toAvailability).sort(byStatusThenName);
}
