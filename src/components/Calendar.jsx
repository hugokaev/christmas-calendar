// The calendar: a heading, the weekday names, and the grid of days.
import { buildMonthGrid, getMonthName, WEEKDAY_NAMES } from '../calendar.js'
import { isUnlockedOn } from '../lib/dates.js'
import { useWho } from '../lib/WhoContext.jsx'
import { YEAR, MONTH, LAST_DAY } from '../config.js'
import DayCell from './DayCell.jsx'
import './Calendar.css'

export default function Calendar({ serverDate }) {
  const { unlockAll } = useWho()
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
            unlocked={day !== null && (unlockAll || isUnlockedOn(day, serverDate))}
          />
        ))}
      </div>
    </section>
  )
}
