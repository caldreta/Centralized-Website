import "server-only";

import { DEMO_MEDICINES, DEMO_PHARMACIES } from "./demo-data";
import type { DataSource } from "./source";
import type { MedicineAvailability, StockStatus } from "./types";

/** Small deterministic hash so demo stock looks the same on every request. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildStock(now: number): MedicineAvailability[] {
  const rows: MedicineAvailability[] = [];
  for (const pharmacy of DEMO_PHARMACIES) {
    DEMO_MEDICINES.forEach((medicine, index) => {
      const h = hash(`${pharmacy.id}:${index}`);
      if (h % 10 < 2) return; // ~20% of medicines are not carried at all
      const roll = (h >>> 8) % 10;
      const stock_status: StockStatus =
        roll < 6 ? "in_stock" : roll < 8 ? "low_stock" : "out_of_stock";
      const minutesAgo = (h >>> 12) % (60 * 30); // within the last 30 hours
      rows.push({
        pharmacy_id: pharmacy.id,
        medicine_id: `${pharmacy.id.slice(0, 24)}${String(index).padStart(12, "0")}`,
        generic_name: medicine.generic_name,
        brand_name: medicine.brand_name,
        strength: medicine.strength,
        dosage_form: medicine.dosage_form,
        category: medicine.category,
        stock_status,
        updated_at: new Date(now - minutesAgo * 60_000).toISOString(),
      });
    });
  }
  return rows;
}

export const demoSource: DataSource = {
  kind: "demo",

  async listPharmacies() {
    return [...DEMO_PHARMACIES].sort((a, b) => a.name.localeCompare(b.name));
  },

  async searchAvailability(term) {
    const needle = term.toLowerCase();
    return buildStock(Date.now()).filter(
      (row) =>
        row.generic_name.toLowerCase().includes(needle) ||
        (row.brand_name?.toLowerCase().includes(needle) ?? false),
    );
  },

  async listPharmacyStock(pharmacyId) {
    return buildStock(Date.now())
      .filter((row) => row.pharmacy_id === pharmacyId)
      .sort((a, b) => a.generic_name.localeCompare(b.generic_name));
  },
};
