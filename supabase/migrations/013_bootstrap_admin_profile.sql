-- One-shot helper: create or upgrade a profiles row to admin for an existing auth user.
--
-- How to use (Supabase Dashboard → Authentication → Users → copy User UUID):
--   select public.bootstrap_admin_profile('PASTE-UUID-HERE'::uuid);
--
-- Also callable with a service_role JWT (e.g. server script); not exposed to anon/authenticated.

create or replace function public.bootstrap_admin_profile(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_name text;
begin
  if auth.uid() is not null
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'bootstrap_admin_profile is restricted to SQL Editor or service_role'
      using errcode = '42501';
  end if;

  select u.email,
    coalesce(
      u.raw_user_meta_data ->> 'display_name',
      u.raw_user_meta_data ->> 'full_name',
      ''
    )
  into v_email, v_name
  from auth.users u
  where u.id = p_user_id;

  if v_email is null then
    raise exception 'No auth.users row for id %', p_user_id;
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    p_user_id,
    v_email,
    nullif(btrim(v_name), ''),
    'admin'
  )
  on conflict (id) do update set
    role = 'admin',
    email = excluded.email,
    display_name = coalesce(
      nullif(btrim(coalesce(public.profiles.display_name, '')), ''),
      excluded.display_name
    );
end;
$$;

revoke all on function public.bootstrap_admin_profile(uuid) from public;
grant execute on function public.bootstrap_admin_profile(uuid) to service_role;

comment on function public.bootstrap_admin_profile(uuid) is
  'Upsert profiles row as admin for auth user id; run in SQL Editor (no JWT) or via service_role RPC.';
