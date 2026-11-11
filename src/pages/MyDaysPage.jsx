// "My days" — the dates you write.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllSecrets } from '../lib/challenges.js'
import { isUnlockedOn, parityOf } from '../lib/dates.js'
import { useServerDate } from '../lib/useServerDate.js'
import { useWho } from '../lib/WhoContext.jsx'
import { FIRST_DAY, LAST_DAY } from '../config.js'
import { hasCustomPage } from '../days/index.js'
import Notice from '../components/Notice.jsx'
import './MyDaysPage.css'

const pad = (day) => String(day).padStart(2, '0')

export default function MyDaysPage() {
  const { parity } = useWho()
  const { serverDate, loading: dateLoading } = useServerDate()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const myDays = useMemo(() => {
    if (!parity) return []
    const days = []
    for (let day = FIRST_DAY; day <= LAST_DAY; day++) {
      if (parityOf(day) === parity) days.push(day)
    }
    return days
  }, [parity])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchAllSecrets()
      .then((data) => {
        if (active) setRows(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading || dateLoading) return <Notice>Loading…</Notice>

  if (error) return <Notice kind="error">{error}</Notice>

  const byDay = new Map(rows.map((row) => [row.day, row]))

  return (
    <section>
      <h1 className="mydays__title">My days</h1>

      <ul className="mydays__list">
        {myDays.map((day) => {
          const row = byDay.get(day)
          const built = hasCustomPage(day)
          const hasContent = Boolean(
            row?.instructions?.trim() || row?.title?.trim() || row?.secret_data,
          )
          const unlocked = isUnlockedOn(day, serverDate)

          return (
            <li key={day} className="mydays__item">
              <span className="mydays__day">
                <Link to={`/preview/${day}`}>{day} December</Link>
                {unlocked && <span className="mydays__live"> · live</span>}
              </span>

              <span className="mydays__built">
                {built ? (
                  <code>Day{pad(day)}.jsx</code>
                ) : (
                  <span className="mydays__todo">no page yet</span>
                )}
              </span>

              <span className="mydays__secret">
                <Link to={`/my-days/${day}`}>
                  {hasContent ? 'content ✓' : 'content'}
                </Link>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
