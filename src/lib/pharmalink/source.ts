import "server-only";

import type { OpeningHoursViewRow, PharmacyViewRow, ProductAvailabilityViewRow } from "./views";

/** Everything the website reads. Read-only by design; returns raw view rows. */
export interface DataSource {
  readonly kind: "database" | "demo";
  listPharmacies(): Promise<PharmacyViewRow[]>;
  listOpeningHours(): Promise<OpeningHoursViewRow[]>;
  /** Rows whose generic, brand or full medicine name contains `term` (already sanitized). */
  searchProducts(term: string): Promise<ProductAvailabilityViewRow[]>;
  listPharmacyProducts(pharmacyId: string): Promise<ProductAvailabilityViewRow[]>;
}

/** Connection string of the read-only `pharmalink_public_api` login (server only). */
export function databaseUrl(): string | undefined {
  return process.env.PHARMALINK_PUBLIC_DATABASE_URL || undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(databaseUrl());
}

export async function getDataSource(): Promise<DataSource> {
  if (isDatabaseConfigured()) {
    const { databaseSource } = await import("./database-source");
    return databaseSource;
  }
  const { demoSource } = await import("./demo-source");
  return demoSource;
}
