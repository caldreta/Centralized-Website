// What the website's pages work with. Built from the view rows in ./views.ts
// by ./queries.ts, so a change in the views is absorbed in one place.

import type { DayOfWeek } from "./views";

export type { DayOfWeek };

/** The views report only these two (no "low stock", by design: it would hint at quantities). */
export type StockStatus = "in_stock" | "out_of_stock";

/** Only RX needs a prescription; OTC and household remedies don't. */
export type MedicineCategory = "prescription" | "otc";

export interface OpeningHours {
  day: DayOfWeek;
  /** "HH:MM", Philippine time */
  opens: string;
  /** "HH:MM", Philippine time */
  closes: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  /** Full address for display. */
  address: string;
  city: string;
  contact_number: string | null;
  latitude: number;
  longitude: number;
  /** Open days only. Empty = the pharmacy has not given its hours yet. */
  hours: OpeningHours[];
}

export interface MedicineAvailability {
  /** pharmacy_id + medicine_id + brand_name: unique per row. */
  key: string;
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
