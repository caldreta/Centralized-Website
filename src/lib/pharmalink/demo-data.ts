// DEMO DATA ONLY, shaped exactly like Sein's pharmalink_public views.
// Used until PHARMALINK_PUBLIC_DATABASE_URL is set. The site shows a
// "Demo data" banner in this mode.
//
// Pharmacy names and places come from the pilot list in the PharmaLink paper.
// Stock and hours are made up. Coordinates decoded from Plus Codes are
// accurate; those marked "approximate" were placed by street name.

import type { Classification, DayOfWeek, OpeningHoursViewRow, PharmacyViewRow } from "./views";

export const DEMO_PHARMACIES: PharmacyViewRow[] = [
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0001",
    pharmacy_name: "Quali-Meds",
    street_address: "Trece Martires - Indang Rd",
    barangay: "Luciano",
    area: "Trece Martires City",
    province: "Cavite",
    latitude: 14.275313, // Plus Code 7VGC+4FC
    longitude: 120.871141,
    contact_number: "0931 029 9557",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0002",
    pharmacy_name: "Maxcef Pharmacy",
    street_address: "Unit B, Metropolis Greens, J Bldg, JLAS",
    barangay: "Manggahan",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.2968, // approximate
    longitude: 120.9135,
    contact_number: "0917 555 0102",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0003",
    pharmacy_name: "Family Doc Clinic Diagnostics Pharmacy",
    street_address: "Juanito R. Remulla Senior Rd",
    barangay: "Pasong Camachile I",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.292262, // Plus Code 7WR5+WX5
    longitude: 120.909984,
    contact_number: "0917 555 0103",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0004",
    pharmacy_name: "Bayani Med Pharmacy",
    street_address: "Noemi Bldg, 098 Prinza St",
    barangay: "Manggahan",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.2952, // approximate
    longitude: 120.9172,
    contact_number: "0933 076 8081",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0005",
    pharmacy_name: "STATMeds Pharmacy",
    street_address: "Crisanto M. De Los Reyes Ave",
    barangay: "Pasong Camachile I",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.290413, // Plus Code 7WR6+5R7
    longitude: 120.912047,
    contact_number: "0917 555 0105",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0006",
    pharmacy_name: "Happy Med Pharmacy",
    street_address: "Governor's Drive",
    barangay: "Pasong Camachile II",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.297688, // Plus Code 7WX5+3P
    longitude: 120.909312,
    contact_number: "0917 555 0106",
  },
  {
    pharmacy_id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0007",
    pharmacy_name: "SBG-CE Pharmacy",
    street_address: "Buenavista Rd",
    barangay: "Buenavista I",
    area: "General Trias City",
    province: "Cavite",
    latitude: 14.3405, // approximate
    longitude: 120.9093,
    contact_number: "0917 555 0107",
  },
];

const WEEKDAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const ALL_DAYS: DayOfWeek[] = [...WEEKDAYS, "SATURDAY", "SUNDAY"];

function hours(pharmacyNo: number, days: DayOfWeek[], opens: string, closes: string): OpeningHoursViewRow[] {
  const pharmacy_id = `5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c000${pharmacyNo}`;
  return days.map((day_of_week) => ({ pharmacy_id, day_of_week, opens_at: opens, closes_at: closes }));
}

/** A mix of every case the views can return. Pharmacy 5 has not given its hours. */
export const DEMO_HOURS: OpeningHoursViewRow[] = [
  ...hours(1, ALL_DAYS, "07:00:00", "21:00:00"),
  ...hours(2, [...WEEKDAYS, "SATURDAY"], "08:00:00", "20:00:00"), // closed Sunday
  ...hours(3, ALL_DAYS, "00:00:00", "23:59:00"), // open all day
  ...hours(4, WEEKDAYS, "08:00:00", "21:00:00"),
  ...hours(4, ["SATURDAY", "SUNDAY"], "09:00:00", "18:00:00"),
  ...hours(6, ALL_DAYS, "08:00:00", "22:00:00"),
  ...hours(7, [...WEEKDAYS, "SATURDAY"], "07:30:00", "19:30:00"),
];

export interface DemoMedicine {
  medicine_id: string;
  generic_name: string;
  strength: string;
  form: string;
  classification: Classification;
  /** null = unbranded generic (or a brand not yet checked) */
  brands: (string | null)[];
}

const m = (
  n: number,
  generic_name: string,
  strength: string,
  form: string,
  classification: Classification,
  brands: (string | null)[],
): DemoMedicine => ({
  medicine_id: `9a1c0000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  generic_name,
  strength,
  form,
  classification,
  brands,
});

export const DEMO_MEDICINES: DemoMedicine[] = [
  m(1, "Paracetamol", "500mg", "tablet", "OTC", ["Biogesic", null]),
  m(2, "Paracetamol", "250mg/5mL", "syrup", "OTC", ["Calpol"]),
  m(3, "Ibuprofen", "200mg", "capsule", "OTC", ["Advil"]),
  m(4, "Mefenamic Acid", "500mg", "tablet", "OTC", ["Dolfenal", null]),
  m(5, "Cetirizine", "10mg", "tablet", "OTC", ["Virlix"]),
  m(6, "Loratadine", "10mg", "tablet", "OTC", ["Claritin"]),
  m(7, "Loperamide", "2mg", "capsule", "OTC", ["Diatabs"]),
  m(8, "Oral Rehydration Salts", "20.5g", "powder sachet", "HOUSEHOLD_REMEDY", ["Hydrite"]),
  m(9, "Carbocisteine", "500mg", "capsule", "OTC", ["Solmux"]),
  m(10, "Ambroxol", "30mg", "tablet", "OTC", ["Mucosolvan"]),
  m(11, "Lagundi Leaf", "600mg", "tablet", "OTC", ["Ascof"]),
  m(12, "Ascorbic Acid", "500mg", "tablet", "OTC", ["Poten-Cee", null]),
  m(13, "Amoxicillin", "500mg", "capsule", "RX", ["Amoxil", null]),
  m(14, "Co-Amoxiclav", "625mg", "tablet", "RX", ["Augmentin"]),
  m(15, "Cefalexin", "500mg", "capsule", "RX", [null]),
  m(16, "Losartan", "50mg", "tablet", "RX", ["Cozaar", null]),
  m(17, "Amlodipine", "5mg", "tablet", "RX", ["Norvasc", null]),
  m(18, "Metformin", "500mg", "tablet", "RX", ["Glucophage"]),
  m(19, "Atorvastatin", "20mg", "tablet", "RX", ["Lipitor"]),
  m(20, "Omeprazole", "20mg", "capsule", "RX", [null]),
  m(21, "Salbutamol", "100mcg/dose", "inhaler", "RX", ["Ventolin"]),
];
