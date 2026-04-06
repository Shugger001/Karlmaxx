-- Lock down profiles.role: only service_role (API), dashboard admins, or DB maintenance can change it.
-- Regular users may still UPDATE their own row (email, display_name) via profiles_update_own;
-- self-promotion to admin is blocked by this trigger.
--
-- Bootstrap first admin: run in SQL Editor (runs as postgres / no JWT) or use service role from server:
--   update public.profiles set role = 'admin' where email = 'owner@example.com';

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

  -- Server-side admin client (bypasses RLS; still runs this trigger).
  if jwt_role = 'service_role' then
    return new;
  end if;

  -- Signed-in dashboard admin updating any profile (including roles).
  if exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  ) then
    return new;
  end if;

  -- SQL Editor / migrations: typically no auth.uid() and table owner role.
  if auth.uid() is null
     and current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  raise exception 'Changing profiles.role is restricted to admins or service_role'
    using errcode = '42501';
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;

create trigger profiles_role_guard
  before update of role on public.profiles
  for each row
  execute procedure public.profiles_enforce_role_unchanged_for_non_privileged();

comment on function public.profiles_enforce_role_unchanged_for_non_privileged() is
  'Rejects updates that change profiles.role unless caller is service_role JWT, an admin profile, or DB maintenance (SQL Editor).';
