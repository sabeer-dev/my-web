-- Sabeer Market — create a verified seller and assign price items.
-- Run this after schema.sql in Supabase Dashboard > SQL Editor.
-- Replace the three placeholder values before running.

-- 1. Create the Auth user with the seller role and matching seller profile.
with new_seller as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  select
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'seller@example.com',
    crypt('change-this-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role":"seller"}'::jsonb,
    '{"name":"Market Seller"}'::jsonb
  where not exists (
    select 1 from auth.users where email = 'seller@example.com'
  )
  returning id, email
)
insert into public.sellers (id, email, name, verified)
select id, email, 'Market Seller', true
from new_seller;

-- 2. GoTrue expects empty strings, not NULL, in several token/phone columns.
update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, ''),
  phone = coalesce(phone, ''),
  email_change_confirm_status = coalesce(email_change_confirm_status, 0),
  is_sso_user = coalesce(is_sso_user, false),
  is_anonymous = coalesce(is_anonymous, false)
where email = 'seller@example.com';

-- 3. Assign the items this seller may edit.
update public.price_items
set seller_id = (select id from public.sellers where email = 'seller@example.com')
where id in ('rice', 'tomatoes', 'pepper');

-- 4. Verify the setup.
select
  u.email,
  u.raw_app_meta_data -> 'role' as role,
  s.name,
  s.verified,
  count(p.id) as assigned_items
from auth.users u
join public.sellers s on s.id = u.id
left join public.price_items p on p.seller_id = s.id
where u.email = 'seller@example.com'
group by u.email, u.raw_app_meta_data, s.name, s.verified;
