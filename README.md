# christmas-calendar

A shared December 2026 challenge calendar for Hugo and Gabriel.

Days 1–25. Each date unlocks at midnight London time and opens **its own
page, which you build in code**. Hugo writes the **odd** dates, Gabriel
the **even** ones.

---

## Who can see what

Read this bit. It is short and it matters.

**There are no accounts and no passwords.** You open the site, type your
name, and it believes you. That means:

- Either of you can type the other's name and see their days
- Anyone who has the published web address can do the same
- Anyone who has it can also **overwrite** what you have written

Nothing on this site is private. Do not put anything here you would mind
either of you — or a stranger who stumbles across the link — reading.

**What is still enforced** is the calendar itself. Unlock dates are
decided by the database in London time, so changing the clock on your
laptop or phone will not open December's days early.

If you ever want real surprises back, it needs accounts again. Say so and
it can be rebuilt; the groundwork is in the Git history.

---

## What you need

[Node.js](https://nodejs.org) 18 or newer:

```bash
node -v
```

If that says "command not found", install it with [Homebrew](https://brew.sh):

```bash
brew install node
```

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open:

**http://localhost:5173/christmas-calendar/**

The trailing `/christmas-calendar/` matters — plain `localhost:5173`
will not show the page.

---

## Building a day page

This is the main thing you will do.

**1. Copy the template.** For the 5th:

```bash
cp src/days/_TEMPLATE.jsx src/days/Day05.jsx
```

Two digits always: `Day01.jsx`, `Day09.jsx`, `Day25.jsx`.

**2. Build whatever you want.** It is an ordinary React component and a
completely blank canvas. Add a CSS file next to it, pull in a library,
animate things, play a video. Ask Claude for exactly what you want.

The site puts **nothing** on a day page except a small back arrow in the
top-left corner. No top bar, no date, no title, no padding. A day with
nothing built shows an empty page and the arrow, which is the point —
everything you see there is something one of you put there.

That also means you set your own margins. `src/days/Day01.css` shows one
way; a full-bleed background is just as valid.

**3. That is it.** The file is found automatically. There is no list to
register it in, which is deliberate — it means you and Gabriel can both
add days and Git will never make you resolve a conflict.

**4. Preview it** at **My days → the date**, any time before it unlocks.

Your component is handed four things:

| prop | what it is |
|---|---|
| `day` | the number, e.g. `5` |
| `dateLabel` | `"Saturday 5 December"` — printed only if you print it |
| `secret` | `{ title, instructions, data }` saved in the editor, or `null` |
| `isPreview` | `true` when you are testing before the date |

`secret` is content you would rather edit in the browser than in code —
handy for numbers you want to tweak without touching the file. It is not
private; see above.

Keep your CSS class names prefixed with the day — `day05__wheel` — so
they cannot collide with anything Gabriel writes.

### Day 1 as an example

`src/days/Day01.jsx` is a spin-the-wheel of press-ups. Worth reading: it
shows the whole pattern, including generating its numbers from a seed so
the wheel is identical for both of you and cannot be rerolled by
refreshing the page.

---

## Seeing a day before its date

While `npm run dev` is running there is an **unlock all** tickbox in the
top bar. Tick it and every date becomes clickable, so you can see a day
exactly as it will look on the morning it opens. Untick it to get the
real locked behaviour back.

It is remembered per browser, and it exists **only in development** —
`npm run build` strips it out, so it cannot be switched on by anyone
using the published site.

There is also **My days → a date**, which previews just your own days
with a "Preview" bar at the top.

---

## Adding things to the main page

Drop a `.jsx` file into one of these and it appears automatically:

- `src/extras/top/` — above the calendar
- `src/extras/bottom/` — below it

```jsx
// src/extras/top/HugoCountdown.jsx
export default function HugoCountdown() {
  return <p>12 sleeps to go</p>
}
```

Neither of you ever edits a shared file, so your countdown and his
Christmas tree can land in the same commit without touching each other.

Give files a distinctive name so you do not both create `Countdown.jsx`.

### If something breaks

Every day page and every extra is wrapped in an error boundary. If one of
them throws, that one shows a small error message and **everything else
keeps working**. A mistake in his tree cannot blank your calendar.

---

## Connecting Supabase

The site stores what you write there, and asks it what today's date is.

### 1. Make a project

Create a free project at [supabase.com](https://supabase.com).

### 2. Run the SQL

**SQL Editor** → **New snippet** → paste in all of `supabase/schema.sql`
→ **Run**. Expect **SCHEMA INSTALLED**.

Click in the editor and press `Cmd + A` first — the editor runs only the
selected text if anything is selected, which is the usual reason a script
appears to do nothing.

If your project was set up before the name system, run
`supabase/update-02-names.sql` instead. It migrates an existing database
rather than building a new one.

### 3. Copy your keys in

Press **Connect** at the top of the dashboard. You want the **Project
URL** and the **publishable key** (it starts `sb_publishable_`).

**Never** paste the **secret** key (`sb_secret_...`). It bypasses
everything, including the unlock dates.

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_abc123...
```

`.env.local` is ignored by Git.

### 4. Restart

```bash
npm run dev
```

Required — Vite only reads `.env.local` at startup.

---

## Checking the unlock dates

Run `supabase/tests.sql` in the SQL Editor. It checks that days open on
the right date and not before, including the boundaries around days 1, 5
and 25. It reads and writes nothing, so it is safe to run any time.

Look for **ALL TESTS PASSED**.

---

## Checking the build

```bash
npm run build
```

```bash
npm run preview
```

---

## Putting it online with Vercel

Vercel gives you a free address like `christmas-calendar.vercel.app`,
which is what you and Gabriel will both open.

### 1. Get the code on GitHub

In GitHub Desktop: write a summary, **Commit**, then **Push**.

Vercel builds the **main** branch by default, so if you are working on
another branch, merge it into main first (Branch → Merge into current
branch, with main checked out) and push that.

### 2. Import it into Vercel

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account
2. **Add New → Project**
3. Pick the `christmas-calendar` repository
4. Leave the build settings alone — it detects Vite on its own

### 3. Add your two keys — before you deploy

This is the step people miss. Under **Environment Variables**, add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | your project URL |
| `VITE_SUPABASE_ANON_KEY` | your `sb_publishable_...` key |

They are the same two lines as in `.env.local`. That file is ignored by
Git on purpose, so Vercel has no other way of knowing them. Without
them the published site shows the "Supabase is not connected" screen.

Then press **Deploy**.

### 4. Share the address

Vercel gives you `something.vercel.app` when it finishes. That is the
free domain — send it to Gabriel and you are both looking at the same
calendar.

Every push to main redeploys automatically from then on.

Worth remembering: once it is online, that address is the only thing
between a stranger and your calendar. There are no passwords.

### Notes

- Addresses contain a `#`, like `.../#/day/5`. That is deliberate and
  works anywhere, including after a refresh.
- `vite.config.js` has `base: '/'` because Vercel serves from the root of
  a domain. If you ever move to GitHub Pages instead, that has to become
  `'/christmas-calendar/'` or nothing will load.
- The **unlock all** testing tickbox does not exist in the published
  site. Days there really do open on their date.

---

## The files

```
index.html               The page the browser loads first
vite.config.js           Build settings, including the /christmas-calendar/ path
.env.local               Your Supabase keys — never committed

supabase/
  schema.sql             Fresh setup
  update-02-names.sql    Migrates a database made before the name system
  tests.sql              Checks the unlock dates

src/
  config.js              Year, month, first and last day
  people.js              Who uses the site and which dates they write
  App.jsx                The routes
  calendar.js            Works out the month's grid
  forms.css              Shared input and button styling

  days/                  ← YOUR DAY PAGES GO HERE
    _TEMPLATE.jsx        Copy this to Day05.jsx and go wild
    Day01.jsx            Worked example: the press-up wheel
    DefaultDay.jsx       Used for any day with no file yet
    index.js             Finds Day*.jsx automatically — never edit

  extras/                ← YOUR MAIN-PAGE ADDITIONS GO HERE
    top/                 Anything here shows above the calendar
    bottom/              Anything here shows below it
    index.js             Finds them automatically — never edit

  lib/
    supabase.js          The database connection
    WhoContext.jsx       Remembers the name you typed
    challenges.js        Reading and writing day content
    useDaySecret.js      Hook for fetching a day's content yourself
    dates.js             Unlock checks and date formatting
    useServerDate.js     Asks the server what day it is

  components/
    Calendar.jsx         Heading, status line, grid
    DayCell.jsx          One square: locked text or a link
    DayCanvas.jsx        Loads a day's content and hands over to your file
    Extras.jsx           Renders the extras folders
    Boundary.jsx         Stops one broken component breaking the site
    Layout.jsx           The bar of links at the top
    NamePrompt.jsx       "Who are you?"
    SetupNeeded.jsx      Shown when Supabase is not connected

  pages/
    CalendarPage.jsx     The month
    DayPage.jsx          A day, once it has unlocked
    PreviewPage.jsx      Testing your own day early
    MyDaysPage.jsx       Your dates, and what still needs building
    EditDayPage.jsx      Content for one of your days
```
