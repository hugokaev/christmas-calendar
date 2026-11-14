// Layers of wrapping to chip away at.
//
// Two covers sit over the card. The outer one is wrapping paper across
// the whole thing; under it, gold foil still hides the second half of
// the challenge. Clear the paper and you can see there is more to do.
//
// Each cover is a canvas, erased with destination-out compositing,
// which is how a real scratch card behaves. There is a button on each
// as well — scratching is a drag, which is awkward with a keyboard and
// impossible for some people.
import { useCallback, useEffect, useRef, useState } from 'react'

const REVEAL_AT = 0.45

function stillPlease() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

/** Paint the inner layer: gold foil. */
function paintFoil(ctx, width, height) {
  const base = ctx.createLinearGradient(0, 0, width, height)
  base.addColorStop(0, '#f3dfa6')
  base.addColorStop(0.4, '#d9b86a')
  base.addColorStop(0.7, '#f7ecc4')
  base.addColorStop(1, '#c9a155')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)

  // creased foil
  ctx.save()
  ctx.globalAlpha = 0.22
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = i % 2 ? '#8a6a28' : '#fffbe8'
    ctx.lineWidth = 1 + Math.random() * 2
    ctx.beginPath()
    const x = Math.random() * width
    ctx.moveTo(x, 0)
    ctx.lineTo(x + (Math.random() - 0.5) * 40, height)
    ctx.stroke()
  }
  ctx.restore()

  label(ctx, width, height, 'Keep going — one more layer', '#6b4a12', 'rgba(255,250,230,0.7)')
}

function label(ctx, width, height, text, colour, shadow) {
  ctx.fillStyle = colour
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${Math.max(12, Math.min(17, width / 21))}px ui-rounded, system-ui, sans-serif`
  ctx.shadowColor = shadow
  ctx.shadowBlur = 6
  ctx.fillText(text, width / 2, height / 2)
  ctx.shadowBlur = 0
}

/**
 * Wires one canvas up as a scratchable cover.
 * Returns the props to spread onto it, plus a way to clear it outright.
 */
function useScratch({ paint, onCleared, active }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [cleared, setCleared] = useState(false)

  const clear = useCallback(() => {
    setCleared((already) => {
      if (!already) onCleared?.()
      return true
    })
  }, [onCleared])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || cleared) return

    function repaint() {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      const ctx = canvas.getContext('2d')
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      paint(ctx, width, height)
    }

    repaint()
    const observer = new ResizeObserver(repaint)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [paint, cleared])

  function scratchAt(x, y) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 40
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    if (last.current) {
      ctx.moveTo(last.current[0], last.current[1])
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    last.current = [x, y]
  }

  function enoughGone() {
    const canvas = canvasRef.current
    if (!canvas) return false
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    if (!width || !height) return false
    const data = ctx.getImageData(0, 0, width, height).data
    let gone = 0
    let total = 0
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++
      if (data[i] < 24) gone++
    }
    return total > 0 && gone / total >= REVEAL_AT
  }

  function point(event) {
    const rect = canvasRef.current.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }

  const handlers = {
    onPointerDown(event) {
      if (cleared || !active) return
      drawing.current = true
      last.current = null
      event.currentTarget.setPointerCapture?.(event.pointerId)
      const [x, y] = point(event)
      scratchAt(x, y)
    },
    onPointerMove(event) {
      if (!drawing.current || cleared || !active) return
      const [x, y] = point(event)
      scratchAt(x, y)
    },
    onPointerUp() {
      if (!drawing.current) return
      drawing.current = false
      last.current = null
      if (enoughGone()) clear()
    },
  }

  return { canvasRef, cleared, clear, handlers, scratching: drawing }
}

/**
 * The outer layer: wrapping paper you peel off by dragging the corner.
 *
 * The fold line is wherever your pointer is, running at 45 degrees.
 * Everything above and right of it has been peeled away; a lit band
 * along the line is the paper curling back. Let go past halfway and it
 * carries on by itself; let go early and it falls back down.
 */
function PeelCover({ onPeeled }) {
  const sheetRef = useRef(null)
  const dragging = useRef(false)
  const raf = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [peel, setPeel] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    function measure() {
      const r = sheet.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])

  const full = size.w + size.h

  function glide(from, to, ms, after) {
    const started = performance.now()
    function step(now) {
      const t = Math.min(1, (now - started) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      setPeel(from + (to - from) * eased)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else after?.()
    }
    raf.current = requestAnimationFrame(step)
  }

  function finish() {
    setGone(true)
    onPeeled?.()
  }

  function lengthAt(event) {
    const r = sheetRef.current.getBoundingClientRect()
    const fromRight = r.right - event.clientX
    const fromTop = event.clientY - r.top
    return Math.max(0, Math.min(full, fromRight + fromTop))
  }

  function down(event) {
    if (gone) return
    dragging.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    if (raf.current) cancelAnimationFrame(raf.current)
    setPeel(lengthAt(event))
  }

  function move(event) {
    if (!dragging.current || gone) return
    setPeel(lengthAt(event))
  }

  function up() {
    if (!dragging.current) return
    dragging.current = false
    if (peel > full * 0.4) glide(peel, full, 420, finish)
    else glide(peel, 0, 320)
  }

  if (gone) return null

  const { w, h } = size
  const L = peel
  let clip = 'polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)'
  if (w && h && L > 0) {
    if (L <= Math.min(w, h)) {
      clip = `polygon(0px 0px, ${w - L}px 0px, ${w}px ${L}px, ${w}px ${h}px, 0px ${h}px)`
    } else if (L <= Math.max(w, h)) {
      clip = h < w
        ? `polygon(0px 0px, ${w - L}px 0px, ${w - L + h}px ${h}px, 0px ${h}px)`
        : `polygon(0px ${L - w}px, ${w}px ${L}px, ${w}px ${h}px, 0px ${h}px)`
    } else {
      clip = `polygon(0px ${L - w}px, ${Math.max(0, w - L + h)}px ${h}px, 0px ${h}px)`
    }
  }

  return (
    <>
      <div
        ref={sheetRef}
        className="peel"
        style={{ clipPath: clip }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="peel__label">Peel the corner</span>
        <span className="peel__dogear" aria-hidden="true" />
      </div>

      {L > 2 && (
        <div
          className="peel__fold"
          aria-hidden="true"
          style={{
            left: `${w - L}px`,
            width: `${full * 1.6}px`,
            transform: 'rotate(45deg) translateY(-100%)',
          }}
        />
      )}

      <button className="scratch__skip" type="button" onClick={() => glide(peel, full, 420, finish)}>
        Unwrap it
      </button>
    </>
  )
}

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: 4 + (i * 97) % 92,
  delay: (i % 7) * 0.08,
  tilt: ((i * 53) % 90) - 45,
  colour: ['#e0453c', '#ffd166', '#7ec8e3', '#8ad6a0', '#f0d58c'][i % 5],
}))

export default function ScratchCard({ parts, onRevealed }) {
  const [paperGone, setPaperGone] = useState(false)
  const [foilGone, setFoilGone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const onPaper = useCallback(() => setPaperGone(true), [])
  const onFoil = useCallback(() => {
    setFoilGone(true)
    if (!stillPlease()) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1600)
    }
  }, [])

  const foil = useScratch({ paint: paintFoil, onCleared: onFoil, active: paperGone })

  useEffect(() => {
    if (paperGone && foilGone) onRevealed?.()
  }, [paperGone, foilGone, onRevealed])

  const step = !paperGone ? 0 : !foilGone ? 1 : 2

  return (
    <div className={`scratch scratch--step${step}`}>
      <div className="scratch__content">
        <div className="scratch__part">
          <span className="scratch__order">First</span>
          <span className="scratch__text">{parts[0]}</span>
        </div>
        <div className="scratch__rule" aria-hidden="true" />
        <div className="scratch__part scratch__part--two">
          <span className="scratch__order">Then</span>
          <span className="scratch__text">{parts[1]}</span>
        </div>
      </div>

      {/* gold foil, over the second half only */}
      {!foil.cleared && (
        <canvas
          ref={foil.canvasRef}
          className="scratch__cover scratch__cover--foil"
          aria-hidden="true"
          {...foil.handlers}
        />
      )}

      {/* wrapping paper, over everything — peeled, not scratched */}
      {!paperGone && <PeelCover onPeeled={onPaper} />}

      {step === 1 && (
        <button className="scratch__skip" type="button" onClick={foil.clear}>
          Peel the foil
        </button>
      )}

      {step === 1 && (
        <p className="scratch__more" aria-live="polite">There&rsquo;s another layer underneath!</p>
      )}

      {celebrate && (
        <div className="scratch__confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              style={{
                left: `${c.left}%`,
                background: c.colour,
                animationDelay: `${c.delay}s`,
                transform: `rotate(${c.tilt}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
