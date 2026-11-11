// ── TEMPLATE — copy me, do not edit me ──────────────────────────────
//
// To build your own page for, say, the 5th:
//
//   1. Copy this file to Day05.jsx  (two digits: Day01, Day09, Day25)
//   2. Change whatever you like — this is a blank canvas
//   3. That is it. No list to update, no other file to touch.
//
// The underscore in this filename keeps it out of the calendar, so it is
// never treated as a real day.
//
// THE PAGE IS EMPTY UNTIL YOU FILL IT
//
// The site adds nothing to a day page except a small back arrow in the
// corner. No heading, no date, no padding, no top bar. If you want a
// date shown, print `dateLabel`. If you want a margin, set one in your
// own CSS file. Full-bleed backgrounds and animations are all fair game.
//
// WHAT YOU GET
//
//   day        5                      the number
//   dateLabel  "Saturday 5 December"  ready to print, if you want it
//   secret     { title, instructions, data } or null
//   isPreview  true when you are testing it before the date
//
// `secret` is whatever you saved under Editor -> the date -> Edit
// for things you want to change without editing this file. Nothing on
// this site is private: there are no passwords, so anyone using it can
// read what you save there.
//
// `secret.data` is for structured values — a list of wheel options, a
// countdown target, anything. It is whatever JSON you saved.
//
// Styling: write a Day05.css next to this file and import it. Prefix your
// class names with the day (day05__wheel) so they cannot collide with
// anything Gabriel writes.

// import './Day05.css'

export default function DayTemplate({ day, dateLabel, secret, isPreview }) {
  return (
    <div>
      {/* Delete all of this and start again. */}
      <p>Day {day} is not built yet.</p>
    </div>
  )
}
