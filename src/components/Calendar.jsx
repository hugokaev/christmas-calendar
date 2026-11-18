// The treasure-map trail of days.
//
// Used by two pages that look identical but open different things:
//
//   Calendar page — dates you can open are the ones that have unlocked
//   Editor page   — dates you can open are the ones you write
//
// Both are told which dates are openable, and where a date leads.
import { buildTrail, getMonthName, STOP_SIZE, FINAL_SIZE } from '../calendar.js'
import { YEAR, MONTH, LAST_DAY } from '../config.js'
import DayCell from './DayCell.jsx'
import './Calendar.css'

export default function Calendar({ canOpen, linkTo }) {
  const { stops, path, height } = buildTrail(LAST_DAY)

  return (
    <section className="calendar">
      <h1 className="calendar__title">
        {getMonthName(MONTH)} {YEAR}
      </h1>

      <div className="trail" style={{ aspectRatio: `100 / ${height}` }}>
        <svg
          className="trail__path"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={path} />
        </svg>

        {stops.map((stop) => (
          <DayCell
            key={stop.day}
            day={stop.day}
            final={stop.final}
            open={canOpen(stop.day)}
            to={linkTo(stop.day)}
            style={{
              left: `${stop.x}%`,
              top: `${(stop.y / height) * 100}%`,
              width: `${stop.final ? FINAL_SIZE : STOP_SIZE}%`,
            }}
          />
        ))}
      </div>
    </section>
  )
}
