-- Sabeer Market — Supabase schema for food prices and markets.
--
-- Run this in Supabase Dashboard > SQL Editor.
-- Public visitors can read the board. Only signed-in users whose
-- app_metadata.role is "admin" can add, edit or delete rows. Verified
-- sellers with role "seller" can update only the price items assigned to
-- them through price_items.seller_id.
--
-- The script is safe to run more than once. Existing prices and markets
-- are not overwritten because the seed inserts use ON CONFLICT DO NOTHING.

create table if not exists public.markets (
  id text primary key,
  name text not null,
  detail text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Verified sellers. The id is the same uuid as the Supabase Auth user.
create table if not exists public.sellers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.price_items (
  id text primary key,
  name text not null,
  category text not null check (category in ('Grains', 'Vegetables', 'Proteins', 'Oils & spices')),
  market_id text not null references public.markets(id) on update cascade on delete restrict,
  unit text not null,
  price integer not null check (price >= 0),
  change numeric(5, 1) not null default 0,
  history jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Existing installations get this column without losing any price data.
alter table public.price_items
  add column if not exists seller_id uuid references public.sellers(id) on delete set null;

create index if not exists price_items_market_idx on public.price_items (market_id);
create index if not exists price_items_sort_idx on public.price_items (sort_order, name);
create index if not exists price_items_seller_idx on public.price_items (seller_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists price_items_touch_updated_at on public.price_items;
create trigger price_items_touch_updated_at
before update on public.price_items
for each row execute function public.touch_updated_at();

alter table public.markets enable row level security;
alter table public.sellers enable row level security;
alter table public.price_items enable row level security;

-- Public read access.
drop policy if exists "Public can read markets" on public.markets;
create policy "Public can read markets"
on public.markets for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active prices" on public.price_items;
create policy "Public can read active prices"
on public.price_items for select
to anon, authenticated
using (active = true);

-- Seller access. Sellers only see and update their own assigned items.
drop policy if exists "Sellers can read their profile" on public.sellers;
create policy "Sellers can read their profile"
on public.sellers for select
to authenticated
using (id = auth.uid() and verified = true);

drop policy if exists "Sellers can read own prices" on public.price_items;
create policy "Sellers can read own prices"
on public.price_items for select
to authenticated
using (seller_id = auth.uid());

drop policy if exists "Sellers can update own prices" on public.price_items;
create policy "Sellers can update own prices"
on public.price_items for update
to authenticated
using (
  seller_id = auth.uid()
  and exists (
    select 1 from public.sellers
    where id = auth.uid() and verified = true
  )
)
with check (
  seller_id = auth.uid()
  and exists (
    select 1 from public.sellers
    where id = auth.uid() and verified = true
  )
);

-- Admin write access, based on the JWT's app_metadata.role claim.
drop policy if exists "Admins can manage markets" on public.markets;
create policy "Admins can manage markets"
on public.markets for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read every price" on public.price_items;
create policy "Admins can read every price"
on public.price_items for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage prices" on public.price_items;
create policy "Admins can manage prices"
on public.price_items for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage sellers" on public.sellers;
create policy "Admins can manage sellers"
on public.sellers for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Explicit table privileges. Supabase does not always grant these to tables
-- created from the SQL Editor, and RLS policies alone are not sufficient.
grant select on public.markets to anon, authenticated;
grant select on public.price_items to anon, authenticated;
grant select on public.sellers to authenticated;
grant insert, update, delete on public.markets to authenticated;
grant insert, update, delete on public.price_items to authenticated;
grant update on public.sellers to authenticated;

-- Seed the six markets that the site starts with.
insert into public.markets (id, name, detail, sort_order) values
  ('lagos', 'Lagos', 'Mile 12 · Oshodi · Ikeja', 1),
  ('abuja', 'Abuja', 'Wuse · Garki · Nyanya', 2),
  ('kano', 'Kano', 'Dawanau · Kurmi', 3),
  ('kaduna', 'Kaduna', 'Barnawa · Kasuwa', 4),
  ('port-harcourt', 'Port Harcourt', 'Mile 3 · Rumuokoro', 5),
  ('ibadan', 'Ibadan', 'Bodija · Oja''ba', 6)
on conflict (id) do nothing;

-- Seed the 12 everyday items currently shown on the board.
insert into public.price_items
  (id, name, category, market_id, unit, price, change, history, active, sort_order)
values
  ('rice', 'Local Rice', 'Grains', 'lagos', '50kg bag', 78000, 2.4, '[70000,72000,73000,75000,74000,76000,78000]'::jsonb, true, 1),
  ('beans', 'Honey Beans', 'Grains', 'kano', '50kg bag', 65000, -1.2, '[68000,67000,66000,67000,65000,66000,65000]'::jsonb, true, 2),
  ('maize', 'Maize', 'Grains', 'abuja', '100kg bag', 52000, 1.8, '[48000,49000,50000,51000,50000,51000,52000]'::jsonb, true, 3),
  ('garri', 'Garri', 'Grains', 'ibadan', '50kg bag', 38000, -2.0, '[40000,40000,39000,39000,38000,39000,38000]'::jsonb, true, 4),
  ('tomatoes', 'Tomatoes', 'Vegetables', 'lagos', 'Big basket', 32000, 8.6, '[24000,26000,25000,28000,29000,30000,32000]'::jsonb, true, 5),
  ('onions', 'Onions', 'Vegetables', 'kaduna', '50kg bag', 45000, -3.1, '[48000,47000,47000,46000,46000,45000,45000]'::jsonb, true, 6),
  ('pepper', 'Rodo Pepper', 'Vegetables', 'lagos', '50kg bag', 48000, 4.2, '[42000,44000,43000,45000,46000,47000,48000]'::jsonb, true, 7),
  ('yam', 'Yam', 'Vegetables', 'abuja', '100 tubers', 85000, 5.0, '[76000,78000,79000,81000,82000,84000,85000]'::jsonb, true, 8),
  ('eggs', 'Eggs', 'Proteins', 'abuja', 'Crate of 30', 5200, 0, '[5200,5200,5100,5200,5200,5200,5200]'::jsonb, true, 9),
  ('chicken', 'Chicken', 'Proteins', 'lagos', '1kg', 6500, 1.5, '[6000,6100,6200,6300,6400,6400,6500]'::jsonb, true, 10),
  ('palm-oil', 'Palm Oil', 'Oils & spices', 'port-harcourt', '25L keg', 38000, -0.9, '[39000,39000,38000,38000,39000,38000,38000]'::jsonb, true, 11),
  ('cooking-oil', 'Cooking Oil', 'Oils & spices', 'lagos', '5L bottle', 12500, 0, '[12500,12600,12500,12500,12400,12500,12500]'::jsonb, true, 12)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Admin setup
-- ---------------------------------------------------------------------------
-- 1. Create the admin user in Authentication > Users > Add user.
-- 2. Give that user the admin role. Either use the dashboard's user page
--    (Raw App Meta Data: {"role":"admin"}) or run the SQL below with your
--    admin email:
--
--    update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--      || '{"role":"admin"}'::jsonb
--    where email = 'you@example.com';
--
-- 3. Sign out and sign in again so the new JWT includes the role.
-- 4. Open /admin on the deployed Next.js app.
--
-- Seller setup:
-- 1. Run web/supabase/seller-user.sql with a seller email, password and name.
-- 2. Assign items to that seller from the Owner field in /admin.
-- 3. The seller signs in at /seller and can edit only assigned items.

-- Refresh PostgREST's schema cache so newly created tables appear in the API
-- immediately, even if the dashboard cached an older version of the schema.
notify pgrst, 'reload schema';
