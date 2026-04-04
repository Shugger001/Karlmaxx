-- Admin dashboard: allow admins to read all profiles, update roles, and correct orders.

-- Profiles: admins can list all customers (for Customers view).
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Profiles: admins can update any profile (e.g. promote/demote admin, fix display name).
create policy "profiles_update_admin"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Orders: admins can update status or references (manual fixes, marking paid).
create policy "orders_update_admin"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
