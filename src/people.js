// Who uses this calendar, and which dates each person writes.
//
// To change a name, edit it here. The site matches what you type
// ignoring capitals and spaces, so "HUGO" and " hugo " both work.
export const PEOPLE = [
  { key: 'hugo', name: 'Hugo', parity: 'odd' },
  { key: 'gabriel', name: 'Gabriel', parity: 'even' },
]

// Turn something typed into one of the people above, or null.
export function matchPerson(typed) {
  const cleaned = (typed ?? '').trim().toLowerCase()
  if (!cleaned) return null
  return PEOPLE.find((person) => person.key === cleaned) ?? null
}

export function personByKey(key) {
  return PEOPLE.find((person) => person.key === key) ?? null
}
