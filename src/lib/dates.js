import { YEAR, MONTH } from '../config.js'

// Turn a day number into the date string the database uses, e.g. 5 -> "2026-12-05".
export function dayToISO(day) {
  const mm = String(MONTH).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${YEAR}-${mm}-${dd}`
}

/**
 * Has this day unlocked?
 *
 * serverDate is the date string the DATABASE reported, not the device clock.
 * Comparing ISO date strings alphabetically is the same as comparing the
 * dates themselves, which keeps this simple and timezone-free.
 */
export function isUnlockedOn(day, serverDate) {
  if (!serverDate) return false
  return serverDate >= dayToISO(day)
}

// "Tuesday 1 December" — used as the heading on a day page.
export function formatLongDate(day) {
  const date = new Date(YEAR, MONTH - 1, day)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Odd days belong to one author, even days to the other.
export function parityOf(day) {
  return day % 2 === 1 ? 'odd' : 'even'
}
