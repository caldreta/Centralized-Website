import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { DataSource } from "./source";
import type { MedicineAvailability, Pharmacy } from "./types";

const PHARMACY_COLUMNS =
  "id, name, address, city, contact_number, latitude, longitude, opening_hours";
const AVAILABILITY_COLUMNS =
  "pharmacy_id, medicine_id, generic_name, brand_name, strength, dosage_form, category, stock_status, updated_at";

/** Upper bound on rows per search so a one-letter query can't pull the whole table. */
const SEARCH_LIMIT = 500;

function client() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase: could not load ${what}: ${error.message}`);
}

export const supabaseSource: DataSource = {
  kind: "supabase",

  async listPharmacies() {
    const { data, error } = await client()
      .from("website_pharmacies")
      .select(PHARMACY_COLUMNS)
      .order("name");
    if (error) fail("pharmacies", error);
    return (data ?? []) as Pharmacy[];
  },

  async searchAvailability(term) {
    // `term` is sanitized by the caller to letters, digits, spaces and hyphens,
    // so it is safe inside a PostgREST `or` filter. Quoted because it may contain spaces.
    const pattern = `"*${term}*"`;
    const { data, error } = await client()
      .from("website_medicine_availability")
      .select(AVAILABILITY_COLUMNS)
      .or(`generic_name.ilike.${pattern},brand_name.ilike.${pattern}`)
      .limit(SEARCH_LIMIT);
    if (error) fail("search results", error);
    return (data ?? []) as MedicineAvailability[];
  },

  async listPharmacyStock(pharmacyId) {
    const { data, error } = await client()
      .from("website_medicine_availability")
      .select(AVAILABILITY_COLUMNS)
      .eq("pharmacy_id", pharmacyId)
      .order("generic_name");
    if (error) fail("pharmacy stock", error);
    return (data ?? []) as MedicineAvailability[];
  },
};
