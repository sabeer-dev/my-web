-- Sabeer Market — seller self-registration update.
-- Run once in Supabase Dashboard > SQL Editor after schema.sql.
-- Safe to re-run: all statements are idempotent.

alter table public.sellers add column if not exists phone text not null default '';
alter table public.sellers add column if not exists requested_market_id text;
alter table public.sellers add column if not exists note text not null default '';
alter table public.sellers add column if not exists approved_at timestamptz;

update public.sellers
set approved_at = now()
where verified = true and approved_at is null;

-- Only a sign-up that explicitly requests the seller role gets it.
-- Nobody can request the admin role from the browser.
create or replace function public.set_seller_role_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'requested_role', '') = 'seller' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', 'seller');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_set_seller_role on auth.users;
create trigger on_auth_user_created_set_seller_role
before insert on auth.users
for each row execute function public.set_seller_role_on_signup();

-- Every seller account gets an unverified profile, so an admin must review it
-- and assign price items before any public data can be edited.
create or replace function public.create_seller_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') = 'seller' then
    insert into public.sellers (id, email, name, phone, requested_market_id, note, verified)
    values (
      new.id,
      new.email,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'requested_market_id', ''),
      coalesce(new.raw_user_meta_data ->> 'note', ''),
      false
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seller_profile on auth.users;
create trigger on_auth_user_created_seller_profile
after insert on auth.users
for each row execute function public.create_seller_profile();
