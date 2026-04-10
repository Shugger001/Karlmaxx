-- Sync watch SKU name / brand / price with on-disk catalog assets (matches app:
-- src/lib/localCatalogImages.ts poolStartIndex + src/lib/watchCatalogModels.ts).
-- Targets rows where category contains "watch" and images are empty or only
-- /catalog/watches/watch-* paths (no Supabase uploads / Pexels / Picsum URLs).

create or replace function public.watch_pool_start_index(seed text, pool_len int)
returns int
language plpgsql
immutable
as $$
declare
  h bigint := 0;
  i int;
  c int;
begin
  if pool_len <= 0 then
    return 0;
  end if;
  for i in 1..length(seed) loop
    c := ascii(substr(seed, i, 1));
    h := (31 * h + c) & 4294967295;
  end loop;
  return (h % pool_len)::int;
end;
$$;

comment on function public.watch_pool_start_index(text, int) is
  'Same32-bit hash as JS Math.imul(31,h)+char >>> 0; used for watch catalog rotation.';

create or replace function public.watch_local_catalog_lead_path(product_id uuid, images text[])
returns text
language plpgsql
immutable
as $$
declare
  paths constant text[] := array[
    '/catalog/watches/watch-01.jpeg',
    '/catalog/watches/watch-02.png',
    '/catalog/watches/watch-03.png',
    '/catalog/watches/watch-04.png',
    '/catalog/watches/watch-05.png',
    '/catalog/watches/watch-06.png',
    '/catalog/watches/watch-07.png',
    '/catalog/watches/watch-08.png',
    '/catalog/watches/watch-09.png',
    '/catalog/watches/watch-10.png',
    '/catalog/watches/watch-11.png',
    '/catalog/watches/watch-12.png',
    '/catalog/watches/watch-13.png',
    '/catalog/watches/watch-14.png',
    '/catalog/watches/watch-15.png',
    '/catalog/watches/watch-16.png'
  ];
  n int := array_length(paths, 1);
  start_idx int;
begin
  if images is not null and cardinality(images) > 0 and btrim(coalesce(images[1], '')) <> '' then
    return btrim(images[1]);
  end if;
  start_idx := public.watch_pool_start_index(product_id::text, n);
  return paths[start_idx + 1];
end;
$$;

comment on function public.watch_local_catalog_lead_path(uuid, text[]) is
  'Lead /catalog/watches path: first DB image if set, else pool slot from product id hash.';

with catalog(lead_path, brand, name, price) as (
  values
    ('/catalog/watches/watch-01.jpeg', 'Breguet', 'Classique Date · white enamel dial', 298500.00),
    ('/catalog/watches/watch-02.png', 'Fossil', 'Inscription · green dial · square case', 2249.00),
    ('/catalog/watches/watch-03.png', 'Coach', 'Perry · gold case · red leather', 1699.00),
    ('/catalog/watches/watch-04.png', 'Salvatore Ferragamo', 'Vega · steel bracelet · silver dial', 13149.00),
    ('/catalog/watches/watch-05.png', 'Fossil', 'Neutra Chronograph · cream dial · FS5380', 1749.00),
    ('/catalog/watches/watch-06.png', 'Michael Kors', 'Bradshaw Chronograph · rose gold-tone', 2649.00),
    ('/catalog/watches/watch-07.png', 'Coach', 'Kent Chronograph · blue dial · leather', 3399.00),
    ('/catalog/watches/watch-08.png', 'Tom Ford', 'Ocean Plastic N.004 · black braided strap', 15599.00),
    ('/catalog/watches/watch-09.png', 'Tom Ford', 'Ocean Plastic N.002 · black dial', 15599.00),
    ('/catalog/watches/watch-10.png', 'Coach', 'Park · glitter dial · rose gold bracelet', 2349.00),
    ('/catalog/watches/watch-11.png', 'Fossil', 'Carraway · two-tone · black dial · FS6012', 2049.00),
    ('/catalog/watches/watch-12.png', 'TRIWA', 'Humanium Metal 39 · slate dial · leather', 3099.00),
    ('/catalog/watches/watch-13.png', 'Fossil', 'Nate Chronograph · black steel · JR1401', 1599.00),
    ('/catalog/watches/watch-14.png', 'Fossil', 'Autobahn Chronograph · two-tone bracelet', 2499.00),
    ('/catalog/watches/watch-15.png', 'Guess', 'Continental · day-date · green dial', 2499.00),
    ('/catalog/watches/watch-16.png', 'Breda', 'Jane · white leather · gold case', 2049.00)
),
targets as (
  select
    p.id,
    public.watch_local_catalog_lead_path(p.id, p.images) as lead_path
  from public.products p
  where lower(btrim(p.category)) like '%watch%'
    and (
      cardinality(coalesce(p.images, '{}')) = 0
      or not exists (
        select 1
        from unnest(coalesce(p.images, '{}')) as u(x)
        where btrim(coalesce(x, '')) = ''
           or x !~ '^/catalog/watches/watch-'
      )
    )
)
update public.products p
set
  brand = c.brand,
  name = c.name,
  price = c.price
from targets t
join catalog c on c.lead_path = t.lead_path
where p.id = t.id;

revoke all on function public.watch_pool_start_index(text, int) from public;
revoke all on function public.watch_local_catalog_lead_path(uuid, text[]) from public;
