// The month grid.
//
// Used by two pages that look identical but open different things:
//
//   Calendar page — dates you can open are the ones that have unlocked
//   Editor page   — dates you can open are the ones you write
//
// Both are told which dates are openable, and where a date leads.
import { buildMonthGrid, getMonthName, WEEKDAY_NAMES } from '../calendar.js'
import { YEAR, MONTH, LAST_DAY } from '../config.js'
import DayCell from './DayCell.jsx'
import './Calendar.css'

export default function Calendar({ canOpen, linkTo }) {
  const cells = buildMonthGrid(YEAR, MONTH, LAST_DAY)

  return (
    <section className="calendar">
      <h1 className="calendar__title">
        {getMonthName(MONTH)} {YEAR}
      </h1>

      <div className="calendar__grid">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name} className="calendar__weekday">
            {name}
          </div>
        ))}

        {cells.map((day, index) => (
          <DayCell
            key={index}
            day={day}
            open={day !== null && canOpen(day)}
            to={day !== null ? linkTo(day) : null}
          />
        ))}
      </div>
    </section>
  )
}
