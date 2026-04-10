-- Internal notes for admins only (not exposed on public tracking API).

alter table public.orders add column if not exists admin_notes text;

comment on column public.orders.admin_notes is 'Staff-only notes; never return to customers.';
