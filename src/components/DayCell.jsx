// One stop on the trail.
//
// A stop you can open is a link. One you cannot is plain text.
// It shows the date number, and a picture behind it if the day has one
// (see src/boxArt.js).
// Calendar.jsx decides where the stop sits and how big it is (style).
import { Link } from 'react-router-dom'
import { BOX_ART } from '../boxArt.js'
import './DayCell.css'

export default function DayCell({ day, open, to, final, style }) {
  const art = BOX_ART[day]
  const className = [
    'day',
    open ? 'day--open' : 'day--locked',
    final && 'day--final',
    art && 'day--art',
  ].filter(Boolean).join(' ')

  const fullStyle = art ? { ...style, backgroundImage: `url(${art})` } : style

  if (!open) {
    return (
      <div className={className} style={fullStyle} aria-label={`${day} December`}>
        <span className="day__number">{day}</span>
      </div>
    )
  }

  return (
    <Link className={className} style={fullStyle} to={to} aria-label={`${day} December`}>
      <span className="day__number">{day}</span>
    </Link>
  )
}
