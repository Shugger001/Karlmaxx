-- Order tracking (fulfillment timeline + guest lookup by order id + email or token).

alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_token text;

alter table public.orders add column if not exists fulfillment_stage text;
update public.orders set fulfillment_stage = 'placed' where fulfillment_stage is null;
alter table public.orders alter column fulfillment_stage set default 'placed';
alter table public.orders alter column fulfillment_stage set not null;

alter table public.orders drop constraint if exists orders_fulfillment_stage_check;
alter table public.orders add constraint orders_fulfillment_stage_check
  check (fulfillment_stage in (
    'placed',
    'preparing',
    'shipped',
    'out_for_delivery',
    'delivered'
  ));

create unique index if not exists orders_tracking_token_key
  on public.orders (tracking_token)
  where tracking_token is not null;

comment on column public.orders.customer_email is 'Checkout email for guest tracking.';
comment on column public.orders.fulfillment_stage is 'Fulfillment stage (separate from payment status).';
comment on column public.orders.tracking_token is 'Opaque token for track-by-link.';
