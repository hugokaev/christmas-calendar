// One square in the grid.
//
// A square you can open is a link. One you cannot is plain text.
// Nothing else is ever shown here but the date number.
import { Link } from 'react-router-dom'
import './DayCell.css'

export default function DayCell({ day, open, to }) {
  if (day === null) {
    return <div className="day day--empty" aria-hidden="true" />
  }

  if (!open) {
    return (
      <div className="day day--locked" aria-label={`${day} December`}>
        <span className="day__number">{day}</span>
      </div>
    )
  }

  return (
    <Link className="day day--open" to={to} aria-label={`${day} December`}>
      <span className="day__number">{day}</span>
    </Link>
  )
}
