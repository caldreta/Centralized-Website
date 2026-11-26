// Shapes of the two read-only views in supabase/website-contract.sql.
// Keep these in sync with that file.

export type City = "Trece Martires City" | "Tanza" | "General Trias City";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type MedicineCategory = "prescription" | "otc";

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_number: string | null;
  latitude: number;
  longitude: number;
  opening_hours: string | null;
}

export interface MedicineAvailability {
  pharmacy_id: string;
  medicine_id: string;
  generic_name: string;
  brand_name: string | null;
  strength: string | null;
  dosage_form: string | null;
  category: MedicineCategory;
  stock_status: StockStatus;
  /** ISO 8601 timestamp */
  updated_at: string;
}

/** One pharmacy and the medicines in it that matched a search. */
export interface PharmacySearchResult {
  pharmacy: Pharmacy;
  matches: MedicineAvailability[];
  /** Best status among the matches, used for sorting and the map pin colour. */
  best_status: StockStatus;
}
