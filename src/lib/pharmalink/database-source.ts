import "server-only";

import postgres, { type Sql } from "postgres";

import { databaseUrl, type DataSource } from "./source";
import type { OpeningHoursViewRow, PharmacyViewRow, ProductAvailabilityViewRow } from "./views";

// Connection rules from Sein (26 Nov 2026):
//  * read-only login `pharmalink_public_api`, connection string on the server only
//  * Supabase pooler, port 6543 (transaction mode) → prepared statements OFF
//  * write the schema name in every query: pharmalink_public.<view>
//  * read columns by name, never by position

const globalForSql = globalThis as unknown as { __pharmalinkSql?: Sql };

function sql(): Sql {
  if (!globalForSql.__pharmalinkSql) {
    const url = databaseUrl()!;
    const host = new URL(url).hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
    globalForSql.__pharmalinkSql = postgres(url, {
      prepare: false, // required by the transaction pooler
      fetch_types: false, // no extra type lookups through the pooler
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      // Supabase needs TLS; a local test database doesn't. sslmode in the URL wins.
      ...(url.includes("sslmode=") ? {} : { ssl: local ? false : ("require" as const) }),
      connection: { application_name: "pharmalink-public-site" },
    });
  }
  return globalForSql.__pharmalinkSql;
}

function fail(what: string, error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`Database: could not load ${what}: ${message}`);
}

export const databaseSource: DataSource = {
  kind: "database",

  async listPharmacies() {
    try {
      return await sql()<PharmacyViewRow[]>`
        select pharmacy_id::text   as pharmacy_id,
               pharmacy_name,
               street_address,
               barangay,
               area,
               province,
               latitude::float8    as latitude,
               longitude::float8   as longitude,
               contact_number
        from pharmalink_public.pharmacies
        order by pharmacy_name`;
    } catch (error) {
      fail("pharmacies", error);
    }
  },

  async listOpeningHours() {
    try {
      return await sql()<OpeningHoursViewRow[]>`
        select pharmacy_id::text   as pharmacy_id,
               day_of_week::text   as day_of_week,
               opens_at::text      as opens_at,
               closes_at::text     as closes_at
        from pharmalink_public.opening_hours`;
    } catch (error) {
      fail("opening hours", error);
    }
  },

  async searchProducts(term) {
    // `term` is sanitized to letters, digits, spaces and hyphens, so it holds
    // no LIKE wildcards; it is still sent as a parameter, never pasted in.
    const pattern = `%${term}%`;
    try {
      return await sql()<ProductAvailabilityViewRow[]>`
        select ${productColumns()}
        from pharmalink_public.product_availability
        where generic_name ilike ${pattern}
           or brand_name   ilike ${pattern}
           or medicine_name ilike ${pattern}
        limit 500`;
    } catch (error) {
      fail("search results", error);
    }
  },

  async listPharmacyProducts(pharmacyId) {
    try {
      return await sql()<ProductAvailabilityViewRow[]>`
        select ${productColumns()}
        from pharmalink_public.product_availability
        where pharmacy_id::text = ${pharmacyId}
        order by generic_name, brand_name nulls first`;
    } catch (error) {
      fail("pharmacy stock", error);
    }
  },
};

function productColumns() {
  return sql()`
    medicine_name, pharmacy_name, area, availability_status, last_updated_at,
    pharmacy_id::text as pharmacy_id, medicine_id::text as medicine_id,
    classification::text as classification, generic_name, strength, form::text as form, brand_name`;
}
