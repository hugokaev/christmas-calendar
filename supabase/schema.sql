-- ============================================================
-- Christmas Calendar 2026 — database setup
-- ============================================================
--
-- For a FRESH Supabase project. If your project already exists,
-- run supabase/update-02-names.sql instead.
--
-- SQL Editor -> New snippet -> paste the whole file -> Run.
-- Click in the editor and press Cmd+A first, so nothing is part-selected
-- (the editor runs only the selection if there is one).
--
-- WHAT THIS DOES AND DOES NOT PROTECT
--
-- There are no accounts. People say who they are by typing a name, and
-- the site believes them. So anyone who has the site address can read
-- and overwrite any day. That is deliberate — the trade for having no
-- passwords.
--
-- What IS enforced here is the clock. Unlock dates are decided by the
-- database in London time, so changing the clock on a laptop or phone
-- does not open December early.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Working out whether a day has unlocked — in London time
-- ------------------------------------------------------------

-- The pure arithmetic, with the date passed in. Kept separate so it can
-- be tested against any date without creating a way to unlock early.
create or replace function public.is_unlocked_on(day int, on_date date)
returns boolean
language sql
immutable
as $$
  select on_date >= make_date(2026, 12, day);
$$;

-- Today's date according to the SERVER, in Europe/London.
create or replace function public.london_today()
returns date
language sql
stable
as $$
  select (timezone('Europe/London', now()))::date;
$$;

create or replace function public.is_unlocked(day int)
returns boolean
language sql
stable
as $$
  select public.is_unlocked_on(day, public.london_today());
$$;


-- ------------------------------------------------------------
-- 2. The days themselves
-- ------------------------------------------------------------
-- The page for each day is a file in src/days/. This table is only for
-- content you would rather edit in the browser than in code: a title,
-- some text, or structured values like the options on a wheel.

create table if not exists public.challenges (
  day          int primary key check (day between 1 and 25),
  title        text,
  instructions text,
  secret_data  jsonb,
  author       text,          -- just the name someone typed
  updated_at   timestamptz not null default now()
);

alter table public.challenges enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists challenges_touch_updated_at on public.challenges;
create trigger challenges_touch_updated_at
  before update on public.challenges
  for each row execute function public.touch_updated_at();


-- ------------------------------------------------------------
-- 3. Who may do what
-- ------------------------------------------------------------
-- Everyone, because there is nobody to tell apart. Row-level security
-- stays switched on with policies that say yes, which is clearer than
-- turning it off: you can read exactly what is allowed.

drop policy if exists "anyone can read"   on public.challenges;
drop policy if exists "anyone can add"    on public.challenges;
drop policy if exists "anyone can change" on public.challenges;

create policy "anyone can read"
  on public.challenges for select
  to anon, authenticated
  using (true);

create policy "anyone can add"
  on public.challenges for insert
  to anon, authenticated
  with check (true);

create policy "anyone can change"
  on public.challenges for update
  to anon, authenticated
  using (true) with check (true);

-- No delete policy, so days cannot be deleted through the site.

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.challenges to anon, authenticated;

grant execute on function public.london_today()            to anon, authenticated;
grant execute on function public.is_unlocked(int)          to anon, authenticated;
grant execute on function public.is_unlocked_on(int, date) to anon, authenticated;

notify pgrst, 'reload schema';

select 'SCHEMA INSTALLED' as result;
