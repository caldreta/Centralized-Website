# PharmaLink — Centralized Website

The public, no-login website for PharmaLink. Customers search a medicine and see which
participating pharmacies in Trece Martires, Tanza and General Trias have it, on a map.

It is **read-only**: it never writes to the database, never shows prices, and has no
ordering or payments. Stock calculations live in the inventory/POS system.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS v4 · shadcn/ui · Leaflet + OpenStreetMap · Supabase (read-only).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

With no Supabase keys the site runs on **demo data** (made-up stock for the pilot
pharmacies) and shows a yellow "Demo data" banner.

## Connect to the real database

1. Ask the inventory/POS team to run [`supabase/website-contract.sql`](supabase/website-contract.sql),
   after replacing the `ADAPT` lines with their real tables. It creates two views,
   `website_pharmacies` and `website_medicine_availability`, and lets the anon key read
   only those.
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   (the anon/publishable key — **never** the `service_role` key).
3. Restart `npm run dev`. The banner disappears once the keys are set.

## How data flows

| Data | Where it's read | Freshness |
| --- | --- | --- |
| Pharmacy list (name, address, map location) | `getPharmacies()` | cached ~1 min |
| Medicine stock status | `searchMedicines()`, `getPharmacyStock()` | live on every request |

All database access is in `src/lib/pharmalink/`:

- `types.ts` — the shape of the two views (keep in sync with the SQL contract)
- `queries.ts` — what pages call; caching rules live here
- `supabase-source.ts` / `demo-source.ts` — the two interchangeable data sources

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Search box, how it works, map of participating pharmacies |
| `/search?q=…` | Pharmacies with the medicine, stock status, last update, map, "Use my location" sorting |
| `/pharmacies` | All participating pharmacies, city filter, map |
| `/pharmacies/[id]` | One pharmacy: address, call, directions, filterable medicine list |
| `/about` | FAQ and disclaimer |

## Notes

- **Map tiles** come from the public OpenStreetMap server, which is fine for the pilot.
  For heavier traffic, switch the `TileLayer` URL in
  `src/components/map/pharmacy-map-inner.tsx` to a tile provider.
- **"Use my location"** uses the browser's geolocation only to sort by distance. It is
  kept in memory and never sent to the server.
- **Pilot coordinates:** Maxcef, Bayani Med and SBG-CE are approximate in the demo
  data. Confirm every pharmacy's pin before going live.
