import "server-only";

import { DEMO_HOURS, DEMO_MEDICINES, DEMO_PHARMACIES } from "./demo-data";
import type { DataSource } from "./source";
import type { ProductAvailabilityViewRow } from "./views";

/** Small deterministic hash so demo stock looks the same on every request. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Rows shaped like pharmalink_public.product_availability. */
function buildProducts(now: number): ProductAvailabilityViewRow[] {
  const rows: ProductAvailabilityViewRow[] = [];
  for (const pharmacy of DEMO_PHARMACIES) {
    for (const medicine of DEMO_MEDICINES) {
      for (const brand of medicine.brands) {
        const h = hash(`${pharmacy.pharmacy_id}:${medicine.medicine_id}:${brand ?? ""}`);
        if (h % 10 < 3) continue; // ~30% of lines are not carried at all
        const minutesAgo = (h >>> 12) % (60 * 30); // within the last 30 hours
        rows.push({
          medicine_name: `${medicine.generic_name} ${medicine.strength} ${medicine.form}`,
          pharmacy_name: pharmacy.pharmacy_name,
          area: pharmacy.area,
          availability_status: (h >>> 8) % 10 < 7 ? "in_stock" : "out_of_stock",
          last_updated_at: new Date(now - minutesAgo * 60_000).toISOString(),
          pharmacy_id: pharmacy.pharmacy_id,
          medicine_id: medicine.medicine_id,
          classification: medicine.classification,
          generic_name: medicine.generic_name,
          strength: medicine.strength,
          form: medicine.form,
          brand_name: brand,
        });
      }
    }
  }
  return rows;
}

const contains = (value: string | null, needle: string) =>
  value !== null && value.toLowerCase().includes(needle);

export const demoSource: DataSource = {
  kind: "demo",

  async listPharmacies() {
    return [...DEMO_PHARMACIES].sort((a, b) => a.pharmacy_name.localeCompare(b.pharmacy_name));
  },

  async listOpeningHours() {
    return DEMO_HOURS;
  },

  async searchProducts(term) {
    const needle = term.toLowerCase();
    return buildProducts(Date.now()).filter(
      (row) =>
        contains(row.generic_name, needle) ||
        contains(row.brand_name, needle) ||
        contains(row.medicine_name, needle),
    );
  },

  async listPharmacyProducts(pharmacyId) {
    return buildProducts(Date.now()).filter((row) => row.pharmacy_id === pharmacyId);
  },
};
