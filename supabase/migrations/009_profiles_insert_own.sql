-- Let signed-in users insert ONLY their own profile row with role user (fixes legacy auth users with no trigger).
-- Admins still promote via Table Editor / SQL / service role. Role lock trigger (008) does not apply to INSERT.

drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role = 'user'
  );

comment on policy "profiles_insert_own" on public.profiles is
  'Self-service first row: id must match JWT; cannot self-insert as admin.';
