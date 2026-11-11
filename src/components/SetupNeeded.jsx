// Shown when .env.local is missing or incomplete.
//
// The site genuinely cannot work without Supabase: accounts, shared data
// and the secrecy rules all live there. Rather than pretend, it says so.
import './SetupNeeded.css'

export default function SetupNeeded() {
  return (
    <section className="setup">
      <h1 className="setup__title">Supabase is not connected yet</h1>

      <p className="setup__text">
        The calendar needs a Supabase project to store what you write and
        to decide, on the server, which days have unlocked. Nothing is
        stored in this browser, so there is nothing to show until that
        exists.
      </p>

      <ol className="setup__steps">
        <li>
          Create a free project at <code>supabase.com</code>.
        </li>
        <li>
          Open <strong>SQL Editor</strong>, paste in <code>supabase/schema.sql</code>
          {' '}from this project, and run it.
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env.local</code>, then press
          {' '}<strong>Connect</strong> at the top of the Supabase dashboard and paste in
          {' '}your Project URL and publishable key.
        </li>
        <li>
          Stop the dev server and start it again with <code>npm run dev</code>.
        </li>
      </ol>

      <p className="setup__text setup__text--quiet">
        The full walkthrough is in <code>README.md</code>.
      </p>
    </section>
  )
}
