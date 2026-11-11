// One day's page.
//
// The site adds nothing here but a back arrow. Whatever appears is
// whatever src/days/Day<NN>.jsx draws.
import { useParams } from 'react-router-dom'
import { isUnlockedOn } from '../lib/dates.js'
import { useServerDate } from '../lib/useServerDate.js'
import { useWho } from '../lib/WhoContext.jsx'
import { FIRST_DAY, LAST_DAY } from '../config.js'
import DayCanvas from '../components/DayCanvas.jsx'
import BackArrow from '../components/BackArrow.jsx'
import Notice from '../components/Notice.jsx'
import './DayPage.css'

export default function DayPage() {
  const { day: dayParam } = useParams()
  const day = Number(dayParam)

  const { unlockAll } = useWho()
  const { serverDate, loading, error } = useServerDate()

  const validDay = Number.isInteger(day) && day >= FIRST_DAY && day <= LAST_DAY

  if (!validDay) {
    return (
      <>
        <BackArrow />
        <div className="daywrap">
          <Notice kind="error">No day {dayParam}.</Notice>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <BackArrow />
        <div className="daywrap">
          <Notice>Loading…</Notice>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <BackArrow />
        <div className="daywrap">
          <Notice kind="error">{error}</Notice>
        </div>
      </>
    )
  }

  if (!unlockAll && !isUnlockedOn(day, serverDate)) {
    return (
      <>
        <BackArrow />
        <div className="daywrap">
          <Notice>Locked until {day} December.</Notice>
        </div>
      </>
    )
  }

  return (
    <>
      <BackArrow />
      <DayCanvas day={day} />
    </>
  )
}
