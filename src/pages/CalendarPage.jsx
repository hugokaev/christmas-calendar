// The main calendar. Dates open once they have unlocked.
// Snow starts falling the moment you arrive, even while the date loads.
import Calendar from '../components/Calendar.jsx'
import Extras from '../components/Extras.jsx'
import Notice from '../components/Notice.jsx'
import Snow from '../components/Snow.jsx'
import { useServerDate } from '../lib/useServerDate.js'
import { isUnlockedOn } from '../lib/dates.js'

function CalendarContent() {
  const { serverDate, loading, error } = useServerDate()

  if (loading) return <Notice>Loading…</Notice>

  if (error) {
    return <Notice kind="error">Could not load the calendar. {error}</Notice>
  }

  return (
    <>
      <Extras slot="top" />

      <Calendar
        canOpen={(day) => isUnlockedOn(day, serverDate)}
        linkTo={(day) => `/day/${day}`}
      />

      <Extras slot="bottom" />
    </>
  )
}

export default function CalendarPage() {
  return (
    <>
      <Snow />
      <CalendarContent />
    </>
  )
}
