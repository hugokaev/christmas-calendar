// One square in the grid.
//
// A locked day is plain text. An unlocked day is a link to its own page.
// Nothing else is ever shown here: no titles, no clues, and no hint about
// whether a challenge has been written yet.
//
// Both kinds carry a title/aria-label so hovering a square — or hearing it
// read aloud — explains itself, without putting anything extra on screen.
import { Link } from 'react-router-dom'
import './DayCell.css'

export default function DayCell({ day, unlocked }) {
  if (day === null) {
    return <div className="day day--empty" aria-hidden="true" />
  }

  if (!unlocked) {
    return (
      <div
        className="day day--locked"
        title={`Locked — unlocks on ${day} December`}
        aria-label={`${day} December, locked`}
      >
        <span className="day__number">{day}</span>
      </div>
    )
  }

  return (
    <Link
      className="day day--open"
      to={`/day/${day}`}
      title={`Open ${day} December`}
      aria-label={`${day} December, open`}
    >
      <span className="day__number">{day}</span>
    </Link>
  )
}
