// Loads a day's hidden content and hands the whole page over to that
// day's component.
//
// Everything below this point is the author's to do as they like. If
// their component throws, the error is caught here so the rest of the
// site keeps working.
import { useEffect, useState } from 'react'
import { fetchSecret } from '../lib/challenges.js'
import { formatLongDate } from '../lib/dates.js'
import { getDayComponent } from '../days/index.js'
import Boundary from './Boundary.jsx'
import Notice from './Notice.jsx'
import './Boundary.css'

export default function DayCanvas({ day, isPreview = false }) {
  const [secret, setSecret] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchSecret(day)
      .then((data) => {
        if (active) setSecret(data)
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
  }, [day])

  if (loading) return <Notice>Loading…</Notice>

  if (error) {
    return <Notice kind="error">Could not load this day. {error}</Notice>
  }

  const DayComponent = getDayComponent(day)

  return (
    <Boundary name={`Day ${day}`}>
      <DayComponent
        day={day}
        dateLabel={formatLongDate(day)}
        secret={secret}
        isPreview={isPreview}
      />
    </Boundary>
  )
}
