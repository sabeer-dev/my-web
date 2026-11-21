-- Sabeer Market — optional SQL alternative to the Auth dashboard.
-- Run this after schema.sql if you prefer to create the admin user in SQL.
-- Replace the email and password below before running.

-- 1. Create the user with the admin role already in raw_app_meta_data.
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
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'you@example.com',
  crypt('change-this-password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role":"admin"}'::jsonb,
  '{}'::jsonb
);

-- 2. GoTrue expects empty strings, not NULL, in several token/phone columns.
--    Without this, password login fails with "Database error querying schema".
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
where email = 'you@example.com';

-- 3. Verify the role.
select email, raw_app_meta_data -> 'role' as role
from auth.users
where email = 'you@example.com';
