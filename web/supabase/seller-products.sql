-- Sabeer Market — seller product creation.
--
-- Run this once in Supabase Dashboard > SQL Editor. It is safe to run again.
-- Verified sellers can add new price items that belong to their own account.
-- The seller portal sets seller_id from the signed-in user, never from the form.

drop policy if exists "Sellers can add own prices" on public.price_items;
create policy "Sellers can add own prices"
on public.price_items for insert
to authenticated
with check (
  seller_id = auth.uid()
  and exists (
    select 1 from public.sellers
    where id = auth.uid() and verified = true
  )
);

notify pgrst, 'reload schema';
