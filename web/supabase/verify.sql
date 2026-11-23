-- Sabeer Market — Supabase setup verification.
-- Run this in Supabase Dashboard > SQL Editor after schema.sql.

select
  to_regclass('public.markets') as markets,
  to_regclass('public.sellers') as sellers,
  to_regclass('public.price_items') as price_items;

select
  (select count(*) from public.markets) as market_count,
  (select count(*) from public.sellers) as seller_count,
  (select count(*) from public.price_items) as price_count;

select id, name, category, market_id, price, active
from public.price_items
order by sort_order asc
limit 20;

-- Replace the email below with the admin account you created.
-- Expected role: "admin"
select email, raw_app_meta_data -> 'role' as role
from auth.users
where email = 'you@example.com';

-- If the REST API still reports a missing table after the checks above pass,
-- force PostgREST to reload its schema cache:
notify pgrst, 'reload schema';
