// The editor. The same month grid as the calendar, except the dates you
// can open are your own — whatever the date is.
//
// Opening one shows the day as it will look, with a link to its content.
import Calendar from '../components/Calendar.jsx'
import Notice from '../components/Notice.jsx'
import { useWho } from '../lib/WhoContext.jsx'
import { parityOf } from '../lib/dates.js'

export default function EditorPage() {
  const { parity } = useWho()

  if (!parity) {
    return <Notice kind="error">No dates assigned to you.</Notice>
  }

  return (
    <Calendar
      canOpen={(day) => parityOf(day) === parity}
      linkTo={(day) => `/preview/${day}`}
    />
  )
}
