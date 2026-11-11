// Asks the DATABASE what today's date is in London.
//
// This is the whole reason changing your laptop clock does nothing:
// the website never asks the device what day it is.
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

export function useServerDate() {
  const [serverDate, setServerDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    supabase
      .rpc('london_today')
      .then(({ data, error: rpcError }) => {
        if (!active) return
        if (rpcError) setError(rpcError.message)
        else setServerDate(data)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { serverDate, loading, error }
}
