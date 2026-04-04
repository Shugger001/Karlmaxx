-- Optional brand label per SKU (e.g. Rolex, Casio). Used to group watches on the storefront.
alter table public.products
  add column if not exists brand text not null default '';

comment on column public.products.brand is 'Manufacturer or house name; storefront groups watch products by this value.';
