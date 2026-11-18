// One stop on the trail.
//
// A stop you can open is a link. One you cannot is plain text.
// Nothing else is ever shown here but the date number.
// Calendar.jsx decides where the stop sits and how big it is (style).
import { Link } from 'react-router-dom'
import './DayCell.css'

export default function DayCell({ day, open, to, final, style }) {
  const className = `day ${open ? 'day--open' : 'day--locked'}${final ? ' day--final' : ''}`

  if (!open) {
    return (
      <div className={className} style={style} aria-label={`${day} December`}>
        <span className="day__number">{day}</span>
      </div>
    )
  }

  return (
    <Link className={className} style={style} to={to} aria-label={`${day} December`}>
      <span className="day__number">{day}</span>
    </Link>
  )
}
