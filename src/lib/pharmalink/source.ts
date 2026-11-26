import "server-only";

import type { MedicineAvailability, Pharmacy } from "./types";

/** Everything the website needs from the database. Read-only by design. */
export interface DataSource {
  readonly kind: "supabase" | "demo";
  listPharmacies(): Promise<Pharmacy[]>;
  /** Medicines whose generic or brand name contains `term` (already sanitized). */
  searchAvailability(term: string): Promise<MedicineAvailability[]>;
  listPharmacyStock(pharmacyId: string): Promise<MedicineAvailability[]>;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function getDataSource(): Promise<DataSource> {
  if (isSupabaseConfigured()) {
    const { supabaseSource } = await import("./supabase-source");
    return supabaseSource;
  }
  const { demoSource } = await import("./demo-source");
  return demoSource;
}
