// DEMO DATA ONLY. Used when SUPABASE_URL / SUPABASE_ANON_KEY are not set, so the
// website can be developed before the inventory/POS database is ready.
//
// Pharmacy names and locations come from the pilot list in the PharmaLink paper.
// Stock levels are made up. The site shows a "Demo data" banner in this mode.
// Coordinates decoded from Plus Codes are accurate; the ones marked
// "approximate" were placed by street name and must be confirmed with the pharmacy.

import type { MedicineCategory, Pharmacy } from "./types";

export const DEMO_PHARMACIES: Pharmacy[] = [
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0001",
    name: "Quali-Meds",
    address: "Trece Martires - Indang Rd, Trece Martires City, 4109 Cavite",
    city: "Trece Martires City",
    contact_number: "0931 029 9557",
    latitude: 14.275313, // Plus Code 7VGC+4FC
    longitude: 120.871141,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0002",
    name: "Maxcef Pharmacy",
    address: "Unit B, Metropolis Greens, J Bldg, JLAS, Manggahan, General Trias, Cavite",
    city: "General Trias City",
    contact_number: null,
    latitude: 14.2968, // approximate
    longitude: 120.9135,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0003",
    name: "Family Doc Clinic Diagnostics Pharmacy",
    address: "Juanito R. Remulla Senior Rd, General Trias, Cavite",
    city: "General Trias City",
    contact_number: null,
    latitude: 14.292262, // Plus Code 7WR5+WX5
    longitude: 120.909984,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0004",
    name: "Bayani Med Pharmacy",
    address: "Noemi Bldg, 098 Prinza St, Manggahan, General Trias, 4107 Cavite",
    city: "General Trias City",
    contact_number: "0933 076 8081",
    latitude: 14.2952, // approximate
    longitude: 120.9172,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0005",
    name: "STATMeds Pharmacy",
    address: "Crisanto M. De Los Reyes Ave, General Trias, Cavite",
    city: "General Trias City",
    contact_number: null,
    latitude: 14.290413, // Plus Code 7WR6+5R7
    longitude: 120.912047,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0006",
    name: "Happy Med Pharmacy",
    address: "General Trias, Cavite",
    city: "General Trias City",
    contact_number: null,
    latitude: 14.297688, // Plus Code 7WX5+3P
    longitude: 120.909312,
    opening_hours: null,
  },
  {
    id: "5b0f8a52-6c1e-4a51-9d0e-1f3a2b7c0007",
    name: "SBG-CE Pharmacy",
    address: "Buenavista 1, General Trias, Cavite",
    city: "General Trias City",
    contact_number: null,
    latitude: 14.3405, // approximate
    longitude: 120.9093,
    opening_hours: null,
  },
];

export interface DemoMedicine {
  generic_name: string;
  brand_name: string | null;
  strength: string;
  dosage_form: string;
  category: MedicineCategory;
}

export const DEMO_MEDICINES: DemoMedicine[] = [
  { generic_name: "Paracetamol", brand_name: "Biogesic", strength: "500 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Paracetamol", brand_name: "Calpol", strength: "250 mg/5 mL", dosage_form: "Syrup", category: "otc" },
  { generic_name: "Ibuprofen", brand_name: "Advil", strength: "200 mg", dosage_form: "Softgel", category: "otc" },
  { generic_name: "Mefenamic Acid", brand_name: "Dolfenal", strength: "500 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Cetirizine", brand_name: "Virlix", strength: "10 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Loratadine", brand_name: "Claritin", strength: "10 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Loperamide", brand_name: "Diatabs", strength: "2 mg", dosage_form: "Capsule", category: "otc" },
  { generic_name: "Oral Rehydration Salts", brand_name: "Hydrite", strength: "Sachet", dosage_form: "Powder", category: "otc" },
  { generic_name: "Carbocisteine", brand_name: "Solmux", strength: "500 mg", dosage_form: "Capsule", category: "otc" },
  { generic_name: "Ambroxol", brand_name: "Mucosolvan", strength: "30 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Phenylephrine + Chlorphenamine + Paracetamol", brand_name: "Neozep", strength: "10 mg/2 mg/500 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Lagundi Leaf", brand_name: "Ascof", strength: "600 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Ascorbic Acid", brand_name: "Poten-Cee", strength: "500 mg", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Ferrous Sulfate + Folic Acid", brand_name: "Hemarate FA", strength: "Tablet", dosage_form: "Tablet", category: "otc" },
  { generic_name: "Amoxicillin", brand_name: "Amoxil", strength: "500 mg", dosage_form: "Capsule", category: "prescription" },
  { generic_name: "Co-Amoxiclav", brand_name: "Augmentin", strength: "625 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Cefalexin", brand_name: null, strength: "500 mg", dosage_form: "Capsule", category: "prescription" },
  { generic_name: "Losartan", brand_name: "Cozaar", strength: "50 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Amlodipine", brand_name: "Norvasc", strength: "5 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Metformin", brand_name: "Glucophage", strength: "500 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Atorvastatin", brand_name: "Lipitor", strength: "20 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Metoprolol", brand_name: null, strength: "50 mg", dosage_form: "Tablet", category: "prescription" },
  { generic_name: "Omeprazole", brand_name: null, strength: "20 mg", dosage_form: "Capsule", category: "prescription" },
  { generic_name: "Salbutamol", brand_name: "Ventolin", strength: "100 mcg/dose", dosage_form: "Inhaler", category: "prescription" },
];
