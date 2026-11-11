-- ============================================================
-- Update 02 — switch from accounts to names
-- ============================================================
--
-- Touches ONLY the public.challenges table. Nothing in Supabase's own
-- auth schema, which the SQL editor is often not allowed to change.
--
-- HOW TO RUN IT
--   1. SQL Editor -> New snippet
--   2. Paste this whole file
--   3. Click in the editor and press Cmd+A   (the editor runs ONLY the
--      selected text if anything is selected — this is the usual reason
--      a script seems to do nothing)
--   4. Run
--
-- Safe to run more than once.
-- ============================================================

-- The old rules required a signed-in account, which no longer exists.
drop policy if exists "read own or unlocked" on public.challenges;
drop policy if exists "insert own parity"    on public.challenges;
drop policy if exists "update own"           on public.challenges;

-- Identify the author by the name someone typed, not by an account.
alter table public.challenges drop column if exists author_id;
alter table public.challenges add  column if not exists author text;
alter table public.challenges add  column if not exists secret_data jsonb;

-- With no accounts there is nobody to tell apart, so everyone may read
-- and write. Row-level security stays on with policies that say yes,
-- which is clearer than switching it off.
drop policy if exists "anyone can read"   on public.challenges;
drop policy if exists "anyone can add"    on public.challenges;
drop policy if exists "anyone can change" on public.challenges;

create policy "anyone can read"
  on public.challenges for select to anon, authenticated using (true);

create policy "anyone can add"
  on public.challenges for insert to anon, authenticated with check (true);

create policy "anyone can change"
  on public.challenges for update to anon, authenticated using (true) with check (true);

grant select, insert, update on public.challenges to anon, authenticated;

grant execute on function public.london_today()            to anon, authenticated;
grant execute on function public.is_unlocked(int)          to anon, authenticated;
grant execute on function public.is_unlocked_on(int, date) to anon, authenticated;

notify pgrst, 'reload schema';

select
  'UPDATE 02 APPLIED' as result,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'challenges'
      and column_name = 'author') as author_column,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'challenges'
      and column_name = 'secret_data') as secret_data_column,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'challenges') as policies;
