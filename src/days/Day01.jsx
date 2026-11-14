// 1 December — the grand opening.
//
// Tap the advent door, cross the snow to the cabin, click its door to
// go inside, then scratch the frost off the card to find the challenge.
//
// The landscape is in day01-scene.jsx, the room in day01-interior.jsx,
// and the scratch panel in day01-scratch.jsx. Their filenames
// deliberately do not look like "Day01.jsx", so the day-finder in
// index.js ignores them.
//
// The challenge text comes from Editor -> 1 December. Until something
// is saved there it shows a placeholder.
import { useCallback, useEffect, useRef, useState } from 'react'
import Day01Scene, { PaintedDoor } from './day01-scene.jsx'
import Interior from './day01-interior.jsx'
import ScratchCard from './day01-scratch.jsx'
import './Day01.css'

function prefersStillness() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

// ── Snow ────────────────────────────────────────────────────────────

function Snowfall() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const stillPlease = prefersStillness()

    let flakes = []
    let frameId = null

    function resize() {
      const ratio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function makeFlakes() {
      const count = Math.max(40, Math.round(window.innerWidth / 11))
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0.8 + Math.random() * 2.4,
        fall: 0.25 + Math.random() * 1.15,
        drift: (Math.random() - 0.5) * 0.5,
        alpha: 0.35 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.fillStyle = '#ffffff'
      for (const flake of flakes) {
        ctx.globalAlpha = flake.alpha
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function step(time) {
      for (const flake of flakes) {
        flake.y += flake.fall
        flake.x += flake.drift + Math.sin(time / 1400 + flake.wobble) * 0.35
        if (flake.y > window.innerHeight + 6) {
          flake.y = -6
          flake.x = Math.random() * window.innerWidth
        }
        if (flake.x < -6) flake.x = window.innerWidth + 6
        if (flake.x > window.innerWidth + 6) flake.x = -6
      }
      draw()
      frameId = requestAnimationFrame(step)
    }

    function restart() {
      resize()
      makeFlakes()
      draw()
    }

    restart()
    if (!stillPlease) frameId = requestAnimationFrame(step)

    window.addEventListener('resize', restart)
    return () => {
      window.removeEventListener('resize', restart)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas className="day01__snow" ref={canvasRef} aria-hidden="true" />
}

// ── The day ─────────────────────────────────────────────────────────

export default function Day01({ day = 1, secret }) {
  // closed -> opening -> outside -> inside
  const [phase, setPhase] = useState('closed')
  const rootRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  function openTheDoor() {
    if (phase !== 'closed') return
    setPhase(prefersStillness() ? 'outside' : 'opening')
  }

  useEffect(() => {
    if (phase !== 'opening') return
    const timer = setTimeout(() => setPhase('outside'), 1500)
    return () => clearTimeout(timer)
  }, [phase])

  // Follow the pointer, so the layers of the landscape shift against
  // one another and the picture gains depth.
  //
  // This sets the SVG transform ATTRIBUTE rather than a CSS transform:
  // CSS transforms turned out not to apply to these groups at all, even
  // set inline. The attribute works in user units, and a small easing
  // loop keeps the movement smooth instead of snapping.
  useEffect(() => {
    if (prefersStillness()) return
    const root = rootRef.current
    if (!root) return

    const layers = [
      ['.d1-par--sky', 2],
      ['.d1-par--far', 4],
      ['.d1-par--mid', 8],
      ['.d1-par--near', 13],
      ['.d1-par--front', 19],
    ]
      .map(([selector, depth]) => [root.querySelector(selector), depth])
      .filter(([element]) => element)

    if (layers.length === 0) return

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frameId = null

    function move(event) {
      targetX = -((event.clientX / window.innerWidth) * 2 - 1)
      targetY = -((event.clientY / window.innerHeight) * 2 - 1)
    }

    function leave() {
      targetX = 0
      targetY = 0
    }

    function frame() {
      currentX += (targetX - currentX) * 0.07
      currentY += (targetY - currentY) * 0.07
      for (const [element, depth] of layers) {
        element.setAttribute(
          'transform',
          `translate(${(currentX * depth).toFixed(2)} ${(currentY * depth * 0.4).toFixed(2)})`,
        )
      }
      frameId = requestAnimationFrame(frame)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerleave', leave)
    frameId = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [phase])

  const goInside = useCallback(() => setPhase('inside'), [])
  const onRevealed = useCallback(() => setRevealed(true), [])

  // Two parts, one per layer of wrapping. Lines saved in the editor
  // win; otherwise these are the day's challenge.
  const saved = (secret?.instructions ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const parts = saved.length >= 2 ? saved.slice(0, 2) : ['Some stretching', 'A 2km run']

  const inside = phase === 'inside'

  return (
    <div className={`day01 day01--${phase}`} ref={rootRef}>
      {!inside && <Snowfall />}

      {!inside ? (
        <>
          <Day01Scene onEnter={goInside} />
          <main className="day01__inside">
            <p className="day01__prompt">Knock on the cabin door</p>
          </main>
        </>
      ) : (
        <>
          <Interior />
          <main className="day01__room">
            <p className="day01__cheer">
              {revealed ? 'Happy 1st of December!' : 'Unwrap your challenge'}
            </p>

            <ScratchCard parts={parts} onRevealed={onRevealed} />

            <button className="day01__back" type="button" onClick={() => setPhase('outside')}>
              Back outside
            </button>
          </main>
        </>
      )}

      {phase !== 'open' && phase !== 'outside' && phase !== 'inside' && (
        <button
          className="day01__doors"
          type="button"
          onClick={openTheDoor}
          aria-label="Open the first door"
        >
          <span className="day01__door day01__door--left" aria-hidden="true">
            <PaintedDoor side="left" />
          </span>
          <span className="day01__door day01__door--right" aria-hidden="true">
            <PaintedDoor side="right" />
          </span>

          <span className="day01__plaque">
            <span className="day01__numeral">1</span>
            <span className="day01__month">December</span>
            <span className="day01__hint">tap to open</span>
          </span>
        </button>
      )}
    </div>
  )
}
