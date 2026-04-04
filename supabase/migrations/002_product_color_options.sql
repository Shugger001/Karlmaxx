-- Per-variant colours (optional image per colour). Safe to re-run.
alter table public.products
  add column if not exists color_options jsonb not null default '[]'::jsonb;
