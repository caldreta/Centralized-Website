// Rows exactly as Sein's read-only views in the `pharmalink_public` schema
// return them (agreed 26 Nov 2026). Column NAMES are the contract; always read
// by name, never by position. The site never reads `pharmalink_inventory`.
//
// Which rows appear is decided by the views: the pharmacy is switched on, its
// owner pressed "My count is done", the line is selling, and the medicine is
// on the master list. Expired pieces never count as stock.

/** pharmalink_public.pharmacies: one row per listed pharmacy. */
export interface PharmacyViewRow {
  pharmacy_id: string;
  pharmacy_name: string;
  street_address: string;
  barangay: string;
  /** The city. */
  area: string;
  province: string;
  /** Always present: the database refuses a pharmacy without a map point. */
  latitude: number;
  longitude: number;
  contact_number: string | null;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/**
 * pharmalink_public.opening_hours: one row per OPEN day.
 * A day with no row is closed. A pharmacy with no rows has not given its hours.
 * Times are Philippine clock times ("HH:MM" or "HH:MM:SS"); 00:00–23:59 = open all day.
 */
export interface OpeningHoursViewRow {
  pharmacy_id: string;
  day_of_week: DayOfWeek;
  opens_at: string;
  closes_at: string;
}

export type Classification = "RX" | "OTC" | "HOUSEHOLD_REMEDY";

/**
 * pharmalink_public.product_availability: one brand of a medicine at a pharmacy.
 * brand_name is null for unbranded products AND for brands not yet checked by
 * the PharmaLink team (those are grouped into one row), so a row has no single
 * product id. Key = pharmacy_id + medicine_id + brand_name.
 * (medicine_availability has the same columns minus brand_name.)
 */
export interface ProductAvailabilityViewRow {
  medicine_name: string;
  pharmacy_name: string;
  area: string;
  availability_status: "in_stock" | "out_of_stock";
  last_updated_at: string | Date;
  pharmacy_id: string;
  medicine_id: string;
  classification: Classification;
  generic_name: string;
  strength: string;
  /** Lower-case words, e.g. "chewable tablet". */
  form: string;
  brand_name: string | null;
}
