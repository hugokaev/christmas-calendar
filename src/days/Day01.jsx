// 1 December — spin the press-up wheel.
//
// Eight kinds of press-up, each with its own number from 5 to 50.
// The harder the variation, the lower the number it can roll.
//
// The numbers are generated from the day itself, not from Math.random(),
// so the wheel is identical for both of you and refreshing the page
// cannot reroll it into something easier.
//
// You can override the whole thing from My days -> 1 December. Put one
// option per line in the Text box, or use structured data:
//
//   { "options": ["10 burpees", "Sing a carol"] }
import { useMemo, useState } from 'react'
import './Day01.css'

// Harder variations roll smaller numbers. 1 = the full 5-50 range.
const PRESS_UP_TYPES = [
  { name: 'standard', hardness: 1 },
  { name: 'wide-arm', hardness: 1 },
  { name: 'incline', hardness: 0.95 },
  { name: 'decline', hardness: 0.8 },
  { name: 'diamond', hardness: 0.7 },
  { name: 'pike', hardness: 0.6 },
  { name: 'clap', hardness: 0.45 },
  { name: 'one-hand', hardness: 0.3 },
]

// A small predictable random generator. Given the same seed it always
// produces the same sequence, which is what keeps the wheel stable.
function seededRandom(seed) {
  let state = seed + 0x6d2b79f5
  return function next() {
    state += 0x6d2b79f5
    let result = Math.imul(state ^ (state >>> 15), 1 | state)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

// Work out a point on a circle. Angles start at the top and go clockwise.
function pointOn(radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180
  return [150 + radius * Math.cos(radians), 150 + radius * Math.sin(radians)]
}

// One pie slice of the wheel.
function slicePath(startAngle, endAngle) {
  const [x1, y1] = pointOn(130, startAngle)
  const [x2, y2] = pointOn(130, endAngle)
  const bigArc = endAngle - startAngle > 180 ? 1 : 0
  return `M 150 150 L ${x1} ${y1} A 130 130 0 ${bigArc} 1 ${x2} ${y2} Z`
}

export default function Day01({ day = 1, secret }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [landedOn, setLandedOn] = useState(null)
  const [pending, setPending] = useState(null)

  const options = useMemo(() => {
    // Anything saved in the editor wins.
    const structured = secret?.data?.options
    if (Array.isArray(structured) && structured.length > 1) {
      return structured.map((option) => ({
        count: String(option),
        type: '',
        label: String(option),
      }))
    }

    const lines = (secret?.instructions ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length > 1) {
      return lines.map((line) => ({ count: line, type: '', label: line }))
    }

    // Otherwise: the press-up wheel.
    const random = seededRandom(day * 7919)
    return PRESS_UP_TYPES.map(({ name, hardness }) => {
      const count = 5 + Math.round(45 * random() * hardness)
      return {
        count: String(count),
        type: name,
        label: `${count} ${name} press-ups`,
      }
    })
  }, [secret, day])

  const sliceAngle = options.length > 0 ? 360 / options.length : 0

  function spin() {
    if (spinning || options.length < 2) return

    const pick = Math.floor(Math.random() * options.length)
    const middleOfSlice = pick * sliceAngle + sliceAngle / 2

    // Land with the chosen slice at the top, after a few full turns.
    // Always rotate forwards so it never rewinds.
    const base = Math.ceil(rotation / 360) * 360
    const target = base + 360 * 5 + (360 - middleOfSlice)

    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches

    setLandedOn(null)
    setPending(pick)

    if (reduceMotion) {
      setRotation(target)
      setLandedOn(pick)
      return
    }

    setSpinning(true)
    setRotation(target)
  }

  function finishedSpinning() {
    setSpinning(false)
    if (pending !== null) setLandedOn(pending)
  }

  return (
    <article className="day01">
      {/* Nothing is shown unless you put it here. A title only appears
          if you have saved one under My days. */}
      {secret?.title && <h2 className="day01__title">{secret.title}</h2>}

      {options.length < 2 ? (
        <p className="day01__empty">This wheel needs at least two options.</p>
      ) : (
        <>
          <div className="day01__stage">
            <div className="day01__pointer" aria-hidden="true" />

            <div
              className="day01__wheel"
              style={{ transform: `rotate(${rotation}deg)` }}
              onTransitionEnd={finishedSpinning}
            >
              <svg
                viewBox="0 0 300 300"
                role="img"
                aria-label={`Wheel of ${options.length} press-up challenges`}
              >
                {options.map((option, index) => {
                  const start = index * sliceAngle
                  const middle = start + sliceAngle / 2

                  // Without this, labels on the bottom half come out
                  // upside down. Flip them so every one reads normally.
                  const upsideDown = middle > 90 && middle < 270
                  const flip = upsideDown ? 180 : 0

                  const [countX, countY] = pointOn(option.type ? 96 : 84, middle)
                  const [typeX, typeY] = pointOn(68, middle)

                  return (
                    <g key={index}>
                      <path
                        d={slicePath(start, start + sliceAngle)}
                        fill={index % 2 === 0 ? '#ffffff' : '#f2f2f2'}
                        stroke="#000000"
                        strokeWidth="1"
                      />

                      <text
                        x={countX}
                        y={countY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={option.type ? 15 : 10}
                        fontWeight={option.type ? 600 : 400}
                        transform={`rotate(${middle + flip} ${countX} ${countY})`}
                      >
                        {option.type
                          ? option.count
                          : option.count.length > 16
                            ? `${option.count.slice(0, 15)}…`
                            : option.count}
                      </text>

                      {option.type && (
                        <text
                          x={typeX}
                          y={typeY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          transform={`rotate(${middle + flip} ${typeX} ${typeY})`}
                        >
                          {option.type}
                        </text>
                      )}
                    </g>
                  )
                })}

                <circle cx="150" cy="150" r="130" fill="none" stroke="#000" strokeWidth="1.5" />
                <circle cx="150" cy="150" r="6" fill="#000000" />
              </svg>
            </div>
          </div>

          <button
            className="button day01__spin"
            type="button"
            onClick={spin}
            disabled={spinning}
          >
            {spinning ? 'Spinning…' : 'Spin the wheel'}
          </button>

          <p className="day01__result" aria-live="polite">
            {landedOn !== null ? (
              <>
                You got: <strong>{options[landedOn].label}</strong>
              </>
            ) : (
              ' '
            )}
          </p>
        </>
      )}
    </article>
  )
}
