-- =============================================================================
-- PharmaLink public website: read-only data contract
-- =============================================================================
-- The public website reads ONLY the two views below, using the Supabase
-- anon/publishable key. It never touches the inventory/POS tables directly.
--
-- Why views:
--   * Prices, quantities, sales, returns and prescription references stay
--     private. The website cannot select a column that is not in a view.
--   * The inventory/POS team can rename or restructure its tables freely as
--     long as these two views keep the same columns.
--
-- HOW TO USE: replace the FROM clauses marked "ADAPT" with the real
-- inventory/POS tables once the schema is final. Keep the column names,
-- types and allowed values exactly as listed, because the website depends on them.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Participating pharmacies (one row per listed pharmacy)
-- -----------------------------------------------------------------------------
-- id              uuid      not null   stable id, used in /pharmacies/<id> URLs
-- name            text      not null
-- address         text      not null   full street address
-- city            text      not null   'Trece Martires City' | 'Tanza' | 'General Trias City'
-- contact_number  text      null       shown as a tap-to-call link
-- latitude        float8    not null   WGS84, e.g. 14.275313
-- longitude       float8    not null   WGS84, e.g. 120.871141
-- opening_hours   text      null       free text, e.g. 'Mon-Sat 8:00 AM - 9:00 PM'
-- -----------------------------------------------------------------------------
create or replace view public.website_pharmacies
with (security_invoker = false)  -- runs as the view owner, so anon needs no table access
as
select
  p.id,
  p.name,
  p.address,
  p.city,
  p.contact_number,
  p.latitude::float8  as latitude,
  p.longitude::float8 as longitude,
  p.opening_hours
from public.pharmacies p            -- ADAPT: real pharmacies table
where p.is_active = true;           -- ADAPT: only pharmacies that agreed to be listed


-- -----------------------------------------------------------------------------
-- 2. Medicine availability (one row per medicine per pharmacy)
-- -----------------------------------------------------------------------------
-- pharmacy_id     uuid         not null   -> website_pharmacies.id
-- medicine_id     uuid         not null   the pharmacy's own medicine/product id
-- generic_name    text         not null   e.g. 'Paracetamol'
-- brand_name      text         null       e.g. 'Biogesic'
-- strength        text         null       e.g. '500 mg'
-- dosage_form     text         null       e.g. 'Tablet', 'Capsule', 'Syrup'
-- category        text         not null   'prescription' | 'otc'
-- stock_status    text         not null   'in_stock' | 'low_stock' | 'out_of_stock'
-- updated_at      timestamptz  not null   when the stock last changed
--
-- stock_status is computed by the inventory/POS side (for example from
-- quantity vs. low-stock threshold, excluding expired batches). The website
-- only displays it. Do NOT add price or quantity columns to this view.
-- Non-medicine products (personal care, etc.) should be filtered out here.
-- -----------------------------------------------------------------------------
create or replace view public.website_medicine_availability
with (security_invoker = false)
as
select
  m.pharmacy_id,
  m.id            as medicine_id,
  m.generic_name,
  m.brand_name,
  m.strength,
  m.dosage_form,
  m.category,      -- ADAPT: map to 'prescription' | 'otc'
  m.stock_status,  -- ADAPT: map to 'in_stock' | 'low_stock' | 'out_of_stock'
  m.updated_at
from public.medicines m             -- ADAPT: real medicine/stock table(s)
join public.pharmacies p on p.id = m.pharmacy_id and p.is_active = true
where m.category in ('prescription', 'otc');


-- -----------------------------------------------------------------------------
-- 3. Permissions: the anon role may read the two views and nothing else
-- -----------------------------------------------------------------------------
revoke all on public.website_pharmacies            from anon, authenticated;
revoke all on public.website_medicine_availability from anon, authenticated;
grant select on public.website_pharmacies            to anon, authenticated;
grant select on public.website_medicine_availability to anon, authenticated;

-- The underlying inventory/POS tables must have RLS enabled and NO policy
-- that lets the anon role read them, e.g.:
--   alter table public.pharmacies enable row level security;
--   alter table public.medicines  enable row level security;
-- (Supabase's linter will flag the views as "security definer views". That is
--  intentional here: it is what lets anon read safe columns without being able
--  to read the tables themselves.)


-- -----------------------------------------------------------------------------
-- 4. Recommended indexes on the underlying table for name search
-- -----------------------------------------------------------------------------
-- create extension if not exists pg_trgm;
-- create index if not exists medicines_generic_name_trgm
--   on public.medicines using gin (generic_name gin_trgm_ops);
-- create index if not exists medicines_brand_name_trgm
--   on public.medicines using gin (brand_name gin_trgm_ops);
