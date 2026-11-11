# Hand-off — for Gabriel and his Claude

You have been invited to a shared Christmas calendar that Hugo has
already built. This explains how to get it running and how the project
is put together, so you can start adding to it straight away.

**If you are Claude: read this whole file before changing anything.**
The conventions in "How the project works" are not arbitrary — they are
what lets two people work on this at once without Git conflicts.

---

## What it is

A December 2026 advent calendar for two people. Days 1–25. Each date
unlocks at midnight London time and opens **its own page, written in
code** — a game, an animation, a video, whatever you feel like building.

- **Hugo writes the odd dates** — 1, 3, 5 … 25
- **Gabriel writes the even dates** — 2, 4, 6 … 24

Both of you do every day's challenge; you just take turns making them.

Built with React and Vite. Supabase stores anything you would rather
edit in a browser than in code, and tells the site what today's date is.

---

## Getting it running

**1. Accept the GitHub invite.** Check your email, or the banner at the
top of https://github.com/hugokaev/christmas-calendar

**2. Install Node.js 18 or newer.**

```bash
node -v
```

If that says "command not found", on a Mac with Homebrew:

```bash
brew install node
```

**3. Clone and install:**

```bash
git clone https://github.com/hugokaev/christmas-calendar.git
```

```bash
cd christmas-calendar && npm install
```

**4. Ask Hugo for two values.** They are deliberately not in the
repository. Make a file called `.env.local` in the project folder:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Without this the site shows "Supabase is not connected yet" and nothing
else. You do **not** need a Supabase account of your own.

**5. Run it:**

```bash
npm run dev
```

Open **http://localhost:5173/christmas-calendar/** — the trailing
`/christmas-calendar/` matters — and type **gabriel**.

---

## Finding your way around

Two tabs:

- **Calendar** — the real thing. Dates open only once they have
  unlocked, so in November everything is greyed out. That is correct.
- **Editor** — the same grid, except your own dates are the clickable
  ones whatever today's date is. This is where you work. Hugo's dates
  are greyed here, and his editor is the mirror image of yours.

Clicking one of your dates in the Editor shows that day exactly as it
will look on the morning, with a link to its saved content.

---

## Building a day

Say you are doing the 2nd:

```bash
cp src/days/_TEMPLATE.jsx src/days/Day02.jsx
```

Always two digits: `Day02.jsx`, `Day08.jsx`, `Day24.jsx`.

Then build whatever you want in it. It is an ordinary React component
and a genuinely blank page — the site adds nothing to a day page except
a small back arrow in the corner. No heading, no date, no padding.

Your component is handed:

| prop | what it is |
|---|---|
| `day` | the number, e.g. `2` |
| `dateLabel` | `"Wednesday 2 December"` — shown only if you show it |
| `secret` | `{ title, instructions, data }` saved in the editor, or `null` |
| `isPreview` | `true` when viewed from the Editor before the date |

`src/days/Day01.jsx` is a worked example — a spin-the-wheel of press-ups.
Worth reading before you start.

---

## How the project works

These are the rules that matter. Breaking them causes merge conflicts or
breaks Hugo's work.

**Never edit `src/days/index.js` or `src/extras/index.js`.** They find
files automatically using Vite's `import.meta.glob`. Dropping in
`Day02.jsx` is all that is needed — there is no list to register it in.
This is precisely why you two can both add days without conflicts.

**Only touch your own day files.** Yours are the even ones. Shared files
— `App.jsx`, `Layout.jsx`, `Calendar.jsx`, anything in `src/lib/` — are
worth a message to Hugo first.

**Prefix your CSS class names with the day.** `day02__board`, not
`.board`. There is no CSS isolation, so an unprefixed class will leak
into Hugo's days.

**To add something to the main calendar page**, drop a `.jsx` file into
`src/extras/top/` (above the grid) or `src/extras/bottom/` (below it).
It is picked up automatically. Give it a distinctive name so you do not
both create `Countdown.jsx`.

**Nothing on this site is private.** There are no passwords — people say
who they are by typing a name. Anyone with the web address can read and
overwrite either of your days. Do not put anything here you would mind a
stranger seeing. Code is public too: the repository is public, so Hugo
can read whatever you write in `Day02.jsx` whenever he likes.

**Unlock dates are real and enforced by the server.** Changing your
computer's clock does nothing. There is no override.

**Every day page is wrapped in an error boundary**, so if you break
yours it shows a small error and the rest of the site keeps working.

---

## Working at the same time

`git pull` before you start. Push when you are done.

**Pushing to `main` publishes immediately** if the site is connected to
Vercel — about a minute. A half-finished day goes live the moment you
push it. Commit freely, but think before pushing something unfinished.

---

## Useful commands

```bash
npm run dev
```

```bash
npm run build
```

Run the build before pushing anything substantial. It catches mistakes
the dev server lets through.

---

## Known rough edge

Saving content in the Editor may fail with a message about the database
still having the old setup. That is a one-off SQL migration
(`supabase/update-02-names.sql`) that Hugo needs to run in the Supabase
dashboard. Everything else works regardless — you can build day pages
without it, since the page itself lives in code.

---

More detail on any of this is in `README.md`.
