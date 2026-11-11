// Testing one of your own days before its date.
//
// Identical to the real day page, so what you see here is what you get
// on the morning. Only your own half of the month is offered.
import { useParams } from 'react-router-dom'
import { parityOf } from '../lib/dates.js'
import { useWho } from '../lib/WhoContext.jsx'
import { FIRST_DAY, LAST_DAY } from '../config.js'
import DayCanvas from '../components/DayCanvas.jsx'
import BackArrow from '../components/BackArrow.jsx'
import Notice from '../components/Notice.jsx'
import './DayPage.css'

export default function PreviewPage() {
  const { day: dayParam } = useParams()
  const day = Number(dayParam)

  const { parity } = useWho()

  const validDay = Number.isInteger(day) && day >= FIRST_DAY && day <= LAST_DAY
  const isMine = parity !== null && validDay && parityOf(day) === parity

  if (!validDay) {
    return (
      <>
        <BackArrow to="/editor" />
        <div className="daywrap">
          <Notice kind="error">No day {dayParam}.</Notice>
        </div>
      </>
    )
  }

  if (!isMine) {
    return (
      <>
        <BackArrow to="/editor" />
        <div className="daywrap">
          <Notice kind="error">
            {parity ? `Day ${day} is not one of yours.` : 'No dates assigned.'}
          </Notice>
        </div>
      </>
    )
  }

  return (
    <>
      <BackArrow to="/editor" />
      <DayCanvas day={day} isPreview />
    </>
  )
}
