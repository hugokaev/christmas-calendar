// Every read and write of day content goes through here.
//
// There are no accounts, so "author" is simply the name someone typed.
//
// WHY THIS IS MORE CAREFUL THAN YOU MIGHT EXPECT
// ----------------------------------------------
// The database may be older than the code — if supabase/update-02-names.sql
// has not been run yet, the secret_data and author columns are missing.
// Rather than throwing an error at whoever is using the site, this works
// out which columns actually exist and uses those. Saving still needs the
// update, and says so clearly when it cannot.
import { supabase } from './supabase.js'

const ALWAYS = ['day', 'title', 'instructions', 'updated_at']
const OPTIONAL = ['secret_data', 'author']

// Columns the database has told us it does not have.
const missingColumns = new Set()

function columnList() {
  return [...ALWAYS, ...OPTIONAL.filter((c) => !missingColumns.has(c))].join(', ')
}

// Which optional column is this error complaining about, if any?
function blamedColumn(error) {
  if (!error?.message || !/does not exist/i.test(error.message)) return null
  return OPTIONAL.find((c) => error.message.includes(c)) ?? null
}

function needsUpdate(error) {
  const code = error?.code
  return code === '42501' || code === 'PGRST301' || /permission|denied|JWT/i.test(error?.message ?? '')
}

const UPDATE_MESSAGE =
  'The database still has the old account-based setup. ' +
  'Run supabase/update-02-names.sql in the Supabase SQL Editor.'

// Run a read, dropping columns the database turns out not to have.
async function read(build) {
  for (let attempt = 0; attempt <= OPTIONAL.length; attempt++) {
    const result = await build(columnList())
    if (!result.error) return result

    const blamed = blamedColumn(result.error)
    if (!blamed) {
      throw new Error(needsUpdate(result.error) ? UPDATE_MESSAGE : result.error.message)
    }
    missingColumns.add(blamed)
  }
  throw new Error(UPDATE_MESSAGE)
}

// Turn a database row into the shape day pages receive.
function toSecret(row) {
  if (!row) return null
  return {
    title: row.title ?? '',
    instructions: row.instructions ?? '',
    data: row.secret_data ?? null,
    author: row.author ?? null,
    updatedAt: row.updated_at,
  }
}

// Is the structured-data field usable?
export function supportsSecretData() {
  return !missingColumns.has('secret_data')
}

// One day.
export async function fetchSecret(day) {
  const { data } = await read((columns) =>
    supabase.from('challenges').select(columns).eq('day', day).maybeSingle(),
  )
  return toSecret(data)
}

// Everything saved so far.
export async function fetchAllSecrets() {
  const { data } = await read((columns) =>
    supabase.from('challenges').select(columns).order('day'),
  )
  return data ?? []
}

// Create or update one day's content.
export async function saveSecret({ day, title, instructions, data, author }) {
  for (let attempt = 0; attempt <= OPTIONAL.length; attempt++) {
    const row = {
      day,
      title: title?.trim() ? title.trim() : null,
      instructions: instructions ?? '',
    }
    if (!missingColumns.has('secret_data')) row.secret_data = data ?? null
    if (!missingColumns.has('author')) row.author = author ?? null

    const { error } = await supabase
      .from('challenges')
      .upsert(row, { onConflict: 'day' })

    if (!error) return

    const blamed = blamedColumn(error)
    if (blamed) {
      missingColumns.add(blamed)
      continue
    }

    throw new Error(needsUpdate(error) ? UPDATE_MESSAGE : error.message)
  }

  throw new Error(UPDATE_MESSAGE)
}
