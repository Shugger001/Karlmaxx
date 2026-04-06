-- After backfilling, run migration 009_profiles_insert_own.sql so the app can self-create missing rows via API.
--
-- Run in Supabase → SQL → New query on the SAME project as NEXT_PUBLIC_SUPABASE_URL in .env.local.
-- Check the hostname: https://<YOUR_REF>.supabase.co → dashboard:
-- https://supabase.com/dashboard/project/<YOUR_REF>

-- 1) Auth users with NO profiles row (broken admin / missing profile)
select
  u.id,
  u.email,
  u.created_at as auth_created
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
order by u.created_at desc;

-- 2) Profiles whose id does NOT exist in auth (orphan rows — rare)
select p.*
from public.profiles p
left join auth.users u on u.id = p.id
where u.id is null;

-- 3) Who has admin (sanity check)
select id, email, role, display_name
from public.profiles
where role = 'admin';

-- 4) BACKFILL missing profiles for existing auth users (run only if (1) returned rows)
--    Adjust nothing; safe default role is 'user'. Then set admin in Table Editor or UPDATE.
/*
insert into public.profiles (id, email, display_name, role)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    ''
  ),
  'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
*/
