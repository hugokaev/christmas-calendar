// Keeps track of who you said you are.
//
// There are no accounts and no passwords. You type a name and the site
// takes your word for it, remembering the answer in this browser so you
// are not asked again.
//
// Because nothing is verified, this decides what the site SHOWS you, not
// what you are allowed to reach. Anyone can be anyone.
import { createContext, useContext, useEffect, useState } from 'react'
import { matchPerson, personByKey } from '../people.js'

const STORAGE_KEY = 'christmas-calendar:who'

const WhoContext = createContext(null)

export function WhoProvider({ children }) {
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  // Remember the choice between visits.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setPerson(personByKey(saved))
    } catch {
      // Private browsing can block storage. Not a problem: you will
      // just be asked for your name again.
    }
    setLoading(false)
  }, [])

  function signIn(typed) {
    const found = matchPerson(typed)
    if (!found) return false

    setPerson(found)
    try {
      window.localStorage.setItem(STORAGE_KEY, found.key)
    } catch {
      // Ignore — the name simply will not be remembered.
    }
    return true
  }

  function signOut() {
    setPerson(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore.
    }
  }

  const value = {
    person,
    name: person?.name ?? null,
    parity: person?.parity ?? null,
    loading,
    signIn,
    signOut,
  }

  return <WhoContext.Provider value={value}>{children}</WhoContext.Provider>
}

export function useWho() {
  const context = useContext(WhoContext)
  if (!context) throw new Error('useWho must be used inside <WhoProvider>')
  return context
}
