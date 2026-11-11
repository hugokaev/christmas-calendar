// Fetches the hidden content for one day.
//
// Day pages are code, and code on GitHub is readable by both of you.
// This is the one thing that is not: the database only hands over a day
// that is yours, or one that has already unlocked. Changing your device
// clock does not help, because the date is checked on the server.
//
// Use it inside a custom day page when you need the surprise itself:
//
//   const { secret, loading, error } = useDaySecret(day)
//   const options = secret?.data?.options ?? []
import { useEffect, useState } from 'react'
import { fetchSecret } from './challenges.js'

export function useDaySecret(day) {
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

  return { secret, loading, error }
}
