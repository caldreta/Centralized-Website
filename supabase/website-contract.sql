-- #####################################################################
-- #  FILE 6:  website-contract.sql   (run AFTER 01, 02, 03, 04 and 05)
-- #  PharmaLink - read-only views for the public Centralized Website
-- #
-- #  HOW TO RUN: new blank query -> paste everything -> Run.
-- #  Safe to run again: it drops and recreates only its own two views.
-- #  It stops by itself if 05_integration.sql has not been run.
-- #
-- #  WHAT IT ADDS
-- #    * website_pharmacies             one row per listed branch
-- #    * website_medicine_availability  one row per medicine per branch,
-- #                                     with a stock STATUS only
-- #
-- #  The website (anon key) can read these two views and nothing new.
-- #  They never expose prices, quantities, batches, suppliers, costs,
-- #  staff, customers, sales or prescriptions.
-- #####################################################################

begin;

do $$
begin
  if to_regclass('public.integration_source') is null then
    raise exception 'STOP: run 01 to 05 first.';
  end if;
end $$;

drop view if exists public.website_medicine_availability;
drop view if exists public.website_pharmacies;


-- ---------------------------------------------------------------------
-- 1. Listed pharmacies (a "pharmacy" on the website = one branch)
--    Shown only when the branch and its pharmacy are active and the
--    branch has map coordinates.
-- ---------------------------------------------------------------------
create view public.website_pharmacies
with (security_invoker = false)   -- runs as the owner, so anon needs no table access
as
select
  b.branch_id                                        as id,
  case
    when lower(trim(b.branch_name)) = lower(trim(ph.pharmacy_name))
      then ph.pharmacy_name
    else ph.pharmacy_name || ' – ' || b.branch_name
  end::text                                          as name,
  concat_ws(', ',
    nullif(trim(concat_ws(' ', b.house_number, b.street)), ''),
    b.barangay,
    b.city_municipality,
    nullif(trim(concat_ws(' ', b.province, b.postal_code)), '')
  )                                                  as address,
  b.city_municipality::text                          as city,
  coalesce(b.contact_number, ph.contact_number)::text as contact_number,
  b.latitude::float8                                 as latitude,
  b.longitude::float8                                as longitude,
  null::text                                         as opening_hours   -- not in the schema yet
from public.pharmacy_branch b
join public.pharmacy ph on ph.pharmacy_id = b.pharmacy_id
where b.status = 'active'
  and ph.status = 'active'
  and b.latitude  is not null
  and b.longitude is not null;


-- ---------------------------------------------------------------------
-- 2. Medicine availability per branch
--    Status uses the same rule as v_inventory_status:
--      available = active, unexpired batches minus quantity_reserved
--      0 or less -> out_of_stock, at or below reorder_level -> low_stock
--    It is computed here directly (not via v_inventory_status) so it does
--    not depend on that view's invoker rights.
--    Only medicines are listed (product_type = 'medicine').
-- ---------------------------------------------------------------------
create view public.website_medicine_availability
with (security_invoker = false)
as
with stock as (
  select
    i.inventory_id,
    coalesce(sum(mb.quantity_remaining) filter (
      where mb.batch_status = 'active'
        and (mb.expiration_date is null or mb.expiration_date >= current_date)), 0) as on_hand,
    max(mb.updated_at) as batch_updated_at
  from public.inventory i
  left join public.medicine_batch mb on mb.inventory_id = i.inventory_id
  group by i.inventory_id
)
select
  i.branch_id                                   as pharmacy_id,
  p.product_id                                  as medicine_id,
  coalesce(p.generic_name, p.name)::text        as generic_name,
  p.brand_name::text                            as brand_name,
  p.strength::text                              as strength,
  df.form_name::text                            as dosage_form,
  case when p.prescription_class in ('Rx', 'Controlled')
       then 'prescription' else 'otc' end       as category,
  case
    when greatest(s.on_hand - i.quantity_reserved, 0) <= 0             then 'out_of_stock'
    when greatest(s.on_hand - i.quantity_reserved, 0) <= i.reorder_level then 'low_stock'
    else 'in_stock'
  end                                           as stock_status,
  -- When the stock was last confirmed: the last successful sync for
  -- integrated branches, otherwise the last batch change.
  coalesce(src.last_success_at, s.batch_updated_at, i.created_at) as updated_at
from public.inventory i
join stock s                    on s.inventory_id = i.inventory_id
join public.product p           on p.product_id = i.product_id
left join public.dosage_form df on df.dosage_form_id = p.dosage_form_id
join public.pharmacy_branch b   on b.branch_id = i.branch_id
join public.pharmacy ph         on ph.pharmacy_id = b.pharmacy_id
left join public.integration_source src
       on src.branch_id = b.branch_id and src.is_active
where i.is_active
  and p.is_active
  and p.product_type = 'medicine'
  and b.status = 'active'
  and ph.status = 'active'
  and b.latitude  is not null
  and b.longitude is not null;


-- ---------------------------------------------------------------------
-- 3. Permissions: read-only, and only these two views
--    (Supabase grants new views to anon by default, so revoke first.)
-- ---------------------------------------------------------------------
revoke all on public.website_pharmacies, public.website_medicine_availability
  from public, anon, authenticated;
grant select on public.website_pharmacies, public.website_medicine_availability
  to anon, authenticated;

commit;


-- ---------------------------------------------------------------------
-- 4. RECOMMENDED, NOT RUN AUTOMATICALLY: stop the anon key reading prices
--    and exact quantities.
--    get_public_availability() and search_availability() (files 03-05)
--    return selling_price and available_quantity and are executable by
--    anon. Anyone holding the anon key can call them directly. The paper
--    says prices are not shown publicly. Before running this, confirm the
--    NestJS API does not call these two functions with the anon key.
-- ---------------------------------------------------------------------
-- revoke execute on function public.get_public_availability(text)          from anon;
-- revoke execute on function public.search_availability(text, text, text)   from anon;
