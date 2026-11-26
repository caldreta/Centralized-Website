import "server-only";

import { cacheLife } from "next/cache";
import { connection } from "next/server";

import { bestStatus, compareStatus, sanitizeSearchTerm } from "./format";
import { getDataSource } from "./source";
import type { MedicineAvailability, Pharmacy, PharmacySearchResult } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Pharmacy details change rarely, so they are cached for a few minutes. */
export async function getPharmacies(): Promise<Pharmacy[]> {
  "use cache";
  cacheLife("minutes");
  const source = await getDataSource();
  return source.listPharmacies();
}

export async function getPharmacy(id: string): Promise<Pharmacy | null> {
  if (!UUID.test(id)) return null;
  const pharmacies = await getPharmacies();
  return pharmacies.find((p) => p.id === id) ?? null;
}

/**
 * Stock is never cached: every search reads the latest status the
 * inventory/POS wrote, as the paper's synchronization process requires.
 */
export async function searchMedicines(rawQuery: string): Promise<PharmacySearchResult[]> {
  await connection();
  const term = sanitizeSearchTerm(rawQuery);
  if (term.length < 2) return [];

  const source = await getDataSource();
  const [rows, pharmacies] = await Promise.all([
    source.searchAvailability(term),
    getPharmacies(),
  ]);

  const byPharmacy = new Map<string, MedicineAvailability[]>();
  for (const row of rows) {
    const list = byPharmacy.get(row.pharmacy_id) ?? [];
    list.push(row);
    byPharmacy.set(row.pharmacy_id, list);
  }

  const results: PharmacySearchResult[] = [];
  for (const pharmacy of pharmacies) {
    const matches = byPharmacy.get(pharmacy.id);
    if (!matches?.length) continue;
    matches.sort(
      (a, b) =>
        compareStatus(a.stock_status, b.stock_status) ||
        a.generic_name.localeCompare(b.generic_name),
    );
    results.push({ pharmacy, matches, best_status: bestStatus(matches) });
  }
  return results.sort(
    (a, b) =>
      compareStatus(a.best_status, b.best_status) ||
      a.pharmacy.name.localeCompare(b.pharmacy.name),
  );
}

export async function getPharmacyStock(id: string): Promise<MedicineAvailability[]> {
  await connection();
  if (!UUID.test(id)) return [];
  const source = await getDataSource();
  return source.listPharmacyStock(id);
}
