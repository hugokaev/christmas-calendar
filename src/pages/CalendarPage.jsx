// The main calendar view.
//
// Anything dropped into src/extras/top or src/extras/bottom appears
// around the calendar automatically.
import Calendar from '../components/Calendar.jsx'
import Extras from '../components/Extras.jsx'
import Notice from '../components/Notice.jsx'
import { useServerDate } from '../lib/useServerDate.js'

export default function CalendarPage() {
  const { serverDate, loading, error } = useServerDate()

  if (loading) return <Notice>Loading…</Notice>

  if (error) {
    return <Notice kind="error">Could not load the calendar. {error}</Notice>
  }

  return (
    <>
      <Extras slot="top" />
      <Calendar serverDate={serverDate} />
      <Extras slot="bottom" />
    </>
  )
}
