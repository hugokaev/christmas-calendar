-- ============================================================
-- Tests for the one rule the database still enforces: the clock
-- ============================================================
--
-- Run this in the Supabase SQL Editor after schema.sql.
-- It reads nothing and writes nothing, so it is safe at any time.
--
-- There are no account rules left to test. With no passwords, anyone
-- using the site can read and overwrite any day — that is known and
-- intended, not a bug to catch here.
--
-- What IS worth checking is that days open on the right date, in London
-- time, decided by the server rather than by a visitor's own clock.
-- ============================================================

do $do$
begin
  -- A day is locked the day before.
  if public.is_unlocked_on(5, date '2026-12-04') then
    raise exception 'FAIL: day 5 must still be locked on 4 December';
  end if;

  -- It opens on the day itself.
  if not public.is_unlocked_on(5, date '2026-12-05') then
    raise exception 'FAIL: day 5 must be unlocked on 5 December';
  end if;

  -- And stays open afterwards.
  if not public.is_unlocked_on(5, date '2026-12-06') then
    raise exception 'FAIL: day 5 must stay unlocked on 6 December';
  end if;

  -- The first and last days.
  if public.is_unlocked_on(1, date '2026-11-30') then
    raise exception 'FAIL: day 1 must be locked in November';
  end if;

  if not public.is_unlocked_on(1, date '2026-12-01') then
    raise exception 'FAIL: day 1 must open on 1 December';
  end if;

  if public.is_unlocked_on(25, date '2026-12-24') then
    raise exception 'FAIL: day 25 must still be locked on Christmas Eve';
  end if;

  if not public.is_unlocked_on(25, date '2026-12-25') then
    raise exception 'FAIL: day 25 must open on Christmas Day';
  end if;
end;
$do$;

select
  'ALL TESTS PASSED' as result,
  public.london_today() as server_thinks_today_is,
  (select count(*) from generate_series(1, 25) d
    where public.is_unlocked(d)) as days_open_right_now;
