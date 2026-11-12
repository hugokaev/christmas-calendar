// The front door: Frog Security asks your name.
//
// The frog types his question into his speech bubble. Get it wrong and
// he refuses you (as many times as you like). Get it right and he says
// "Enter <name>...", slides off to the right, the screen fades to black,
// and the calendar fades in.
import { useEffect, useRef, useState } from 'react'
import { useWho } from '../lib/WhoContext.jsx'
import { matchPerson } from '../people.js'
import frog from '../assets/frog-security.png'
import './NamePrompt.css'

const ASK = 'what is your name?'
const REFUSE = 'I do not know you. No entry.'
const FAKE = 'that is a FAKE name. what is your REAL name'

const TYPE_SPEED_MS = 55 // per letter
const FIRST_DELAY_MS = 400 // before the frog starts asking
const PAUSE_BEFORE_EXIT_MS = 700 // after "Enter <name>..." finishes

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Reveals `text` one letter at a time. `nonce` restarts it even when the
// text is the same, so a second wrong answer still visibly retypes.
function useTypewriter(text, nonce, startDelay) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(text)
      return
    }
    setShown('')
    let count = 0
    let interval
    const start = setTimeout(() => {
      interval = setInterval(() => {
        count += 1
        setShown(text.slice(0, count))
        if (count >= text.length) clearInterval(interval)
      }, TYPE_SPEED_MS)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, nonce, startDelay])

  return { shown, done: shown === text }
}

// A full-screen black layer on <body>. It fades in, runs `whileDark`
// (which swaps this page for the calendar underneath), then fades out
// and removes itself. It lives outside React so it survives this
// component unmounting.
function fadeThroughBlack(whileDark) {
  const veil = document.createElement('div')
  veil.className = 'nameprompt-veil'
  document.body.appendChild(veil)

  const fadeIn = veil.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 700,
    easing: 'ease-in',
    fill: 'forwards',
  })

  fadeIn.finished
    .then(() => {
      whileDark()
      return veil.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 900,
        delay: 250,
        easing: 'ease-out',
        fill: 'forwards',
      }).finished
    })
    .finally(() => veil.remove())
}

export default function NamePrompt() {
  const { signIn } = useWho()
  const [typed, setTyped] = useState('')
  const [bubble, setBubble] = useState({ text: ASK, nonce: 0, delay: FIRST_DELAY_MS })
  const [entering, setEntering] = useState(null) // the matched person
  const [leaving, setLeaving] = useState(false)
  const inputRef = useRef(null)

  const { shown, done } = useTypewriter(bubble.text, bubble.nonce, bubble.delay)

  function say(text) {
    setBubble((previous) => ({ text, nonce: previous.nonce + 1, delay: 0 }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (entering) return

    const cleaned = typed.trim().toLowerCase().replace(/\s+/g, ' ')

    if (cleaned === 'ladies washroom') {
      say(FAKE)
    } else {
      const found = matchPerson(typed)
      if (found) {
        setEntering(found)
        say(`Enter ${found.name}...`)
        return
      }
      say(REFUSE)
    }

    setTyped('')
    inputRef.current?.focus()
  }

  // Once "Enter <name>..." is fully typed, pause, then slide away.
  useEffect(() => {
    if (!entering || !done) return
    const timer = setTimeout(() => setLeaving(true), PAUSE_BEFORE_EXIT_MS)
    return () => clearTimeout(timer)
  }, [entering, done])

  function handleExitFinished(event) {
    if (event.target !== event.currentTarget || !entering) return
    fadeThroughBlack(() => signIn(entering.key))
  }

  return (
    <section className="nameprompt">
      <div
        className={leaving ? 'nameprompt__frog nameprompt__frog--leaving' : 'nameprompt__frog'}
        onAnimationEnd={handleExitFinished}
      >
        <img
          className="nameprompt__image"
          src={frog}
          alt="A frog in a FROG SECURITY uniform, with a speech bubble"
          draggable={false}
        />
        <p className="nameprompt__bubble" aria-live="polite">
          <span className="nameprompt__said" aria-hidden="true">
            {shown}
          </span>
          <span className="nameprompt__sr">{done ? bubble.text : ''}</span>
        </p>
      </div>

      <form className="nameprompt__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Your name</span>
          <input
            ref={inputRef}
            className="field__input"
            type="text"
            value={typed}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={Boolean(entering)}
            onChange={(event) => setTyped(event.target.value)}
          />
        </label>

        <button className="button" type="submit" disabled={Boolean(entering)}>
          Continue
        </button>
      </form>
    </section>
  )
}
