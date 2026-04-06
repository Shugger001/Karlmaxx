-- Fix PostgreSQL error 42P17 "infinite recursion detected in policy for relation profiles".
-- Any RLS policy that does EXISTS (SELECT … FROM profiles …) re-enters profiles RLS.
-- Use a SECURITY DEFINER helper so the admin check reads profiles without RLS recursion.

create or replace function public.is_profiles_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_profiles_admin() from public;
grant execute on function public.is_profiles_admin() to authenticated;

comment on function public.is_profiles_admin() is
  'True when auth.uid() has profiles.role = admin; bypasses RLS for policy/trigger checks.';

-- Role-change trigger: same recursion if it SELECTs profiles under RLS
create or replace function public.profiles_enforce_role_unchanged_for_non_privileged()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text;
begin
  if new.role is not distinct from old.role then
    return new;
  end if;

  jwt_role := coalesce(auth.jwt() ->> 'role', '');

  if jwt_role = 'service_role' then
    return new;
  end if;

  if (select public.is_profiles_admin()) then
    return new;
  end if;

  if auth.uid() is null
     and current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  raise exception 'Changing profiles.role is restricted to admins or service_role'
    using errcode = '42501';
end;
$$;

-- 006 admin policies on profiles
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_admin"
  on public.profiles for select
  using ((select public.is_profiles_admin()));

create policy "profiles_update_admin"
  on public.profiles for update
  using ((select public.is_profiles_admin()));

-- 001 admin policies on products
drop policy if exists "products_insert_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

create policy "products_insert_admin"
  on public.products for insert
  with check ((select public.is_profiles_admin()));

create policy "products_update_admin"
  on public.products for update
  using ((select public.is_profiles_admin()));

create policy "products_delete_admin"
  on public.products for delete
  using ((select public.is_profiles_admin()));

-- 001 orders select
drop policy if exists "orders_select_owner_or_admin" on public.orders;

create policy "orders_select_owner_or_admin"
  on public.orders for select
  using (
    (select public.is_profiles_admin())
    or (user_id is not null and auth.uid() = user_id)
  );

-- 006 orders admin update
drop policy if exists "orders_update_admin" on public.orders;

create policy "orders_update_admin"
  on public.orders for update
  using ((select public.is_profiles_admin()));

-- 001 storage policies
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;

create policy "product_images_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (select public.is_profiles_admin())
  );

create policy "product_images_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (select public.is_profiles_admin())
  );

create policy "product_images_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (select public.is_profiles_admin())
  );
