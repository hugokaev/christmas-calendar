// Connects the website to Supabase.
//
// The two values come from a file called .env.local which is NOT in Git.
// Copy .env.example to .env.local and fill it in. See README.md.
//
// The "anon key" is meant to be public — it is visible in the browser and
// that is fine. It grants nothing on its own. What you are actually allowed
// to read and write is decided by the security rules in the database
// (supabase/schema.sql), which the browser cannot influence.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
