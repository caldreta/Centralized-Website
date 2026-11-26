# PharmaLink — Centralized Website

The public, no-login website for PharmaLink. Customers search a medicine and see which
participating pharmacies in Trece Martires, Tanza and General Trias have it, on a map.

It is **read-only**: it never writes to the database, never shows prices, and has no
ordering or payments. Stock calculations live in the inventory/POS system.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS v4 · shadcn/ui · Leaflet + OpenStreetMap · Postgres (read-only, via postgres.js).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

With no database connection string the site runs on **demo data** (made-up stock for the
pilot pharmacies, shaped exactly like the real views) and shows a yellow "Demo data" banner.

## Where the data comes from

The database belongs to the inventory side (Sein). **We never change it, and never run SQL
in it.** The site reads only the read-only views in the `pharmalink_public` schema, through
the read-only login `pharmalink_public_api`:

| View | One row is | Used for |
| --- | --- | --- |
| `pharmalink_public.pharmacies` | one listed pharmacy | names, address, map pin, Call button |
| `pharmalink_public.opening_hours` | one open day of a pharmacy | "Open now" and the hours table |
| `pharmalink_public.product_availability` | one brand of a medicine at a pharmacy | search, stock status, Rx tag |

Rules agreed with Sein (26 Nov 2026):

- Read columns **by name**, and write the schema in every query (`pharmalink_public.…`).
- Connect through Supabase's **pooler on port 6543** with **prepared statements off**.
- Stock is only `in_stock` / `out_of_stock` (no low stock, no quantities, no prices).
- Only `RX` gets the "Rx" tag; `OTC` and `HOUSEHOLD_REMEDY` don't need a prescription.
- A `product_availability` row has no single product id: its key is
  `pharmacy_id + medicine_id + brand_name` (brand is empty for unbranded or unchecked brands).
- Opening hours: no row for a day = closed; no rows at all = "hours not given";
  00:00–23:59 = open all day. "Open now" is worked out in **Manila time**.

## Connect to the real database (when Sein says the login is ready)

1. Get the `pharmalink_public_api` connection string (pooler, port 6543) from Sein.
2. Locally: put it in `.env.local` as `PHARMALINK_PUBLIC_DATABASE_URL` (see `.env.example`).
   On Vercel: add the same variable under **Settings → Environment Variables**, then redeploy.
3. The "Demo data" banner disappears once it is set.

## How data flows

| Data | Read by | Freshness |
| --- | --- | --- |
| Pharmacies and opening hours | `getPharmacies()` | cached ~1 min |
| Medicine stock status | `searchMedicines()`, `getPharmacyStock()` | live on every request |

All database access is in `src/lib/pharmalink/`:

- `views.ts` — the view rows exactly as Sein's views return them (the contract)
- `types.ts` — what the pages use
- `queries.ts` — turns view rows into page data; caching rules live here
- `database-source.ts` / `demo-source.ts` — the real database and the demo data

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Search box, how it works, map of participating pharmacies |
| `/search?q=…` | Pharmacies with the medicine, stock status, last update, map, "Use my location" sorting |
| `/pharmacies` | All participating pharmacies, city filter, map |
| `/pharmacies/[id]` | One pharmacy: address, open now, opening hours, call, directions, filterable medicine list |
| `/about` | FAQ and disclaimer |

## Notes

- **Map tiles** come from the public OpenStreetMap server, which is fine for the pilot.
  For heavier traffic, switch the `TileLayer` URL in
  `src/components/map/pharmacy-map-inner.tsx` to a tile provider.
- **"Use my location"** uses the browser's geolocation only to sort by distance. It is
  kept in memory and never sent to the server.
- **Pilot coordinates:** Maxcef, Bayani Med and SBG-CE are approximate in the demo
  data. Confirm every pharmacy's pin before going live.
