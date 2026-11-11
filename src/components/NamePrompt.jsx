// The front door: type your name.
import { useState } from 'react'
import { useWho } from '../lib/WhoContext.jsx'
import { PEOPLE } from '../people.js'
import Notice from './Notice.jsx'
import './NamePrompt.css'

export default function NamePrompt() {
  const { signIn } = useWho()
  const [typed, setTyped] = useState('')
  const [rejected, setRejected] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!signIn(typed)) setRejected(true)
  }

  return (
    <section className="nameprompt">
      <h1 className="nameprompt__title">Christmas Calendar 2026</h1>

      <p className="nameprompt__intro">Who are you?</p>

      <form className="nameprompt__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Your name</span>
          <input
            className="field__input"
            type="text"
            value={typed}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(event) => {
              setTyped(event.target.value)
              setRejected(false)
            }}
          />
        </label>

        <button className="button" type="submit">
          Continue
        </button>
      </form>

      {rejected && (
        <Notice kind="error">
          That is not a name this calendar knows. Try{' '}
          {PEOPLE.map((person) => person.name).join(' or ')}.
        </Notice>
      )}
    </section>
  )
}
