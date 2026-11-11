// Plain JavaScript helpers for working out the shape of a month.
// No React in here on purpose, so it stays easy to read and to test.

// The weekday names across the top, starting on Monday.
export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// month is human-friendly: 1 = January, 12 = December.
export function getMonthName(month) {
  return MONTH_NAMES[month - 1]
}

/**
 * Build the list of cells for one month's grid.
 *
 * Returns an array where each item is either a day number (1, 2, 3 ...)
 * or null for an empty padding square before the 1st or after the last day.
 *
 * Example for December 2026, which starts on a Tuesday:
 *   [null, 1, 2, 3, 4, 5, 6, 7, 8, ...]
 *
 * lastDay lets the grid stop early. Our calendar stops at the 25th,
 * so the 26th to the 31st are simply never drawn.
 */
export function buildMonthGrid(year, month, lastDay) {
  // JavaScript months are 0-based, so we subtract 1.
  const firstOfMonth = new Date(year, month - 1, 1)

  // Day 0 of the next month is the last day of this month.
  const daysInMonth = lastDay ?? new Date(year, month, 0).getDate()

  // getDay() gives 0 for Sunday ... 6 for Saturday.
  // We want Monday first, so Monday becomes 0 and Sunday becomes 6.
  const blanksBefore = (firstOfMonth.getDay() + 6) % 7

  const cells = []

  for (let i = 0; i < blanksBefore; i++) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }

  // Pad the end so the grid always finishes with complete rows of 7.
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}
