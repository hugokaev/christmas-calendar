// Hidden content for one of your own days.
//
// This is NOT where you design the page — that is a .jsx file you write
// with Claude. This is only for things that must stay a surprise, because
// your code is readable by Gabriel on GitHub and this is not.
//
// All three fields are optional. A day can be pure code with nothing here.
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchSecret, saveSecret, supportsSecretData } from '../lib/challenges.js'
import { formatLongDate, parityOf } from '../lib/dates.js'
import { useWho } from '../lib/WhoContext.jsx'
import { FIRST_DAY, LAST_DAY } from '../config.js'
import Notice from '../components/Notice.jsx'
import './EditDayPage.css'

const pad = (day) => String(day).padStart(2, '0')

export default function EditDayPage() {
  const { day: dayParam } = useParams()
  const day = Number(dayParam)

  const { name, parity } = useWho()

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dataText, setDataText] = useState('')
  const [saved, setSaved] = useState({ title: '', instructions: '', dataText: '' })

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState(null)

  const validDay = Number.isInteger(day) && day >= FIRST_DAY && day <= LAST_DAY
  const isMine = parity !== null && validDay && parityOf(day) === parity

  const dirty =
    title !== saved.title ||
    instructions !== saved.instructions ||
    dataText !== saved.dataText

  // Is the structured-data box valid JSON?
  const dataError = useMemo(() => {
    if (!dataText.trim()) return null
    try {
      JSON.parse(dataText)
      return null
    } catch (err) {
      return err.message
    }
  }, [dataText])

  useEffect(() => {
    if (!isMine) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setLoadError(null)

    fetchSecret(day)
      .then((secret) => {
        if (!active) return
        const next = {
          title: secret?.title ?? '',
          instructions: secret?.instructions ?? '',
          dataText: secret?.data ? JSON.stringify(secret.data, null, 2) : '',
        }
        setTitle(next.title)
        setInstructions(next.instructions)
        setDataText(next.dataText)
        setSaved(next)
      })
      .catch((err) => {
        if (active) setLoadError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [day, isMine])

  // Catch the classic mistake: typing something then closing the tab.
  useEffect(() => {
    if (!dirty) return
    function warn(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function handleSubmit(event) {
    event.preventDefault()
    if (dataError) return

    setSaveState('saving')
    setSaveError(null)

    try {
      await saveSecret({
        day,
        title,
        instructions,
        data: dataText.trim() ? JSON.parse(dataText) : null,
        author: name,
      })
      setSaved({ title, instructions, dataText })
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setSaveError(err.message)
    }
  }

  if (!validDay) {
    return <Notice kind="error">There is no day {dayParam} in this calendar.</Notice>
  }

  if (!isMine) {
    return (
      <>
        <Notice kind="error">
          {parity
            ? `Day ${day} is not one of yours. You write the ${parity} dates.`
            : 'Your account has no days assigned yet.'}
        </Notice>
        <p className="editday__links">
          <Link to="/my-days">Back to my days</Link>
        </p>
      </>
    )
  }

  if (loading) return <Notice>Loading…</Notice>

  if (loadError) {
    return <Notice kind="error">Could not open this day. {loadError}</Notice>
  }

  // False until supabase/update-02-names.sql has been run.
  const dataReady = supportsSecretData()

  return (
    <section className="editday">
      <h1 className="editday__title">{formatLongDate(day)}</h1>

      <form className="editday__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Title (optional)</span>
          <input
            className="field__input"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSaveState('idle') }}
          />
        </label>

        <label className="field">
          <span className="field__label">Text (optional)</span>
          <textarea
            className="field__textarea"
            value={instructions}
            onChange={(e) => { setInstructions(e.target.value); setSaveState('idle') }}
          />
        </label>

        {dataReady ? (
        <label className="field">
          <span className="field__label">Structured data (optional)</span>
          <textarea
            className="field__textarea field__textarea--code"
            value={dataText}
            spellCheck={false}
            placeholder={'{\n  "pushups": [10, 20, 30, 40]\n}'}
            onChange={(e) => { setDataText(e.target.value); setSaveState('idle') }}
          />
        </label>
        ) : (
          <Notice>
            Structured data is switched off until{' '}
            <code>supabase/update-02-names.sql</code> has been run. Title and
            text still work.
          </Notice>
        )}

        {dataError && (
          <Notice kind="error">Structured data is not valid JSON. {dataError}</Notice>
        )}

        <div className="editday__actions">
          <button
            className="button"
            type="submit"
            disabled={saveState === 'saving' || !dirty || Boolean(dataError)}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>

          {dirty && saveState !== 'saving' && !dataError && (
            <span className="editday__dirty">Unsaved changes</span>
          )}
          {!dirty && saveState === 'saved' && (
            <span className="editday__dirty">Saved</span>
          )}
        </div>
      </form>

      {saveState === 'error' && (
        <Notice kind="error">Could not save. {saveError}</Notice>
      )}

      <p className="editday__links">
        <Link to={`/preview/${day}`}>Preview this day</Link>
        {' · '}
        <Link to="/my-days">Back to my days</Link>
      </p>
    </section>
  )
}
