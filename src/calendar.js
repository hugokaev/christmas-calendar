// Plain JavaScript helpers for the calendar's shape.
// No React in here on purpose, so it stays easy to read and to test.

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// month is human-friendly: 1 = January, 12 = December.
export function getMonthName(month) {
  return MONTH_NAMES[month - 1]
}

/*
  The treasure-map trail.

  Everything is measured on a map 100 units wide. Height grows with the
  number of days. Days 1 to 24 snake down the map in rows of four:
  left to right, then right to left, and so on. The last day sits on its
  own at the bottom as the treasure, twice the size of the others.
*/
const COLUMNS = [13, 37.7, 62.3, 87] // x position of each stop in a row
const TOP = 13 // y of the first row
const ROW_GAP = 26 // distance between rows
const FINAL_GAP = 34 // extra drop down to the treasure

export const STOP_SIZE = 18 // width of a normal stop, in map units
export const FINAL_SIZE = 34 // width of the treasure stop

// A small, fixed wobble so the trail looks hand-drawn rather than ruled.
// It is the same every time, so stops never jump about between visits.
function wobble(i) {
  return {
    x: Math.sin(i * 2.3) * 1.5,
    y: Math.cos(i * 1.7) * 2.6,
  }
}

/**
 * Work out where every day sits and the trail that joins them.
 *
 * Returns:
 *   stops  — [{ day, x, y, final }] in map units
 *   path   — an SVG path string for the dashed trail
 *   height — how tall the map is (it is always 100 wide)
 */
export function buildTrail(lastDay) {
  const stops = []
  const perRow = COLUMNS.length

  for (let i = 0; i < lastDay - 1; i++) {
    const row = Math.floor(i / perRow)
    const along = i % perRow
    const col = row % 2 === 0 ? along : perRow - 1 - along
    const w = wobble(i)
    stops.push({
      day: i + 1,
      x: COLUMNS[col] + w.x,
      y: TOP + row * ROW_GAP + w.y,
      final: false,
    })
  }

  const rows = Math.ceil((lastDay - 1) / perRow)
  const finalY = TOP + (rows - 1) * ROW_GAP + FINAL_GAP
  stops.push({ day: lastDay, x: 50, y: finalY, final: true })

  // The points the trail passes through. It wanders in from the top
  // edge, visits every stop, and swings wide at the end of each row.
  const points = [{ x: 3, y: 1 }]
  stops.forEach((stop, i) => {
    points.push(stop)
    const endOfRow = (i + 1) % perRow === 0
    const next = stops[i + 1]
    if (endOfRow && next && !next.final) {
      points.push({ x: stop.x > 50 ? 99 : 1, y: (stop.y + next.y) / 2 })
    }
  })

  return {
    stops,
    path: smoothPath(points),
    height: finalY + FINAL_SIZE / 2 + 4,
  }
}

// Draw one smooth curve through every point (a Catmull-Rom spline,
// written out as the cubic Bézier curves SVG understands).
function smoothPath(points) {
  const f = (n) => n.toFixed(2)
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`
  }

  return d
}
