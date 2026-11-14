// The winter scene for day 1.
//
// How it is built, and why:
//
//   FORM first. Every object is a clean silhouette — hills, firs, the
//   cabin. Painting a cabin out of loose strokes turned it to mush, so
//   the shapes are solid and readable.
//
//   TEXTURE on top. Soft brush marks are laid over the snow and sky at
//   low opacity. They give the surface life without eating the forms.
//
//   DEPTH by layers. Six planes recede into the distance, each one
//   paler and bluer than the one in front — distant things lose contrast
//   in cold air. A valley runs through the middle so the eye travels in.
//
// The filename deliberately does not look like "Day01.jsx", so the
// day-finder in index.js ignores it.
import { memo } from 'react'
// A small predictable random generator. Same seed in, same numbers
// out — so the stars, textures and forests are identical on every load
// rather than reshuffling.
function seeded(seed) {
  let state = seed + 0x6d2b79f5
  return function next() {
    state += 0x6d2b79f5
    let r = Math.imul(state ^ (state >>> 15), 1 | state)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = seeded(20261201)
const between = (a, b) => a + rnd() * (b - a)

// ── Texture ─────────────────────────────────────────────────────────
// Soft marks laid over a band of the picture. Low opacity on purpose:
// these are meant to be felt, not counted.

function texture(count, [x0, y0, x1, y1], colours, { len = [10, 26], wid = [1.6, 3.4], tilt = 0, alpha = [0.04, 0.12] } = {}) {
  const out = []
  for (let i = 0; i < count; i++) {
    const x = between(x0, x1)
    const y = between(y0, y1)
    out.push({
      x, y,
      rx: between(len[0], len[1]) / 2,
      ry: between(wid[0], wid[1]) / 2,
      a: tilt + between(-7, 7),
      f: colours[(rnd() * colours.length) | 0],
      o: between(alpha[0], alpha[1]),
    })
  }
  return out
}

function Marks({ list }) {
  return list.map((s, i) => (
    <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={s.f}
             opacity={s.o} transform={`rotate(${s.a} ${s.x} ${s.y})`} />
  ))
}

// ── Trees ───────────────────────────────────────────────────────────

function firTier(x, top, bot, half) {
  // Curved flanks and a scalloped underside, so it reads as a tree
  // rather than a triangle.
  const dip = (bot - top) * 0.16
  return [
    `M${x} ${top}`,
    `C${x + half * 0.34} ${top + (bot - top) * 0.38} ${x + half * 0.72} ${bot - dip * 1.6} ${x + half} ${bot}`,
    `Q${x + half * 0.5} ${bot - dip} ${x + half * 0.22} ${bot - dip * 0.35}`,
    `Q${x} ${bot + dip * 0.2} ${x - half * 0.22} ${bot - dip * 0.35}`,
    `Q${x - half * 0.5} ${bot - dip} ${x - half} ${bot}`,
    `C${x - half * 0.72} ${bot - dip * 1.6} ${x - half * 0.34} ${top + (bot - top) * 0.38} ${x} ${top}`,
    'Z',
  ].join(' ')
}

function Fir({ x, base, h, w, body, cap, capOpacity = 1, lean = 0 }) {
  const tiers = [
    [base - h, base - h * 0.46, w * 0.6],
    [base - h * 0.72, base - h * 0.16, w * 0.8],
    [base - h * 0.42, base, w],
  ]
  return (
    <g transform={lean ? `rotate(${lean} ${x} ${base})` : undefined}>
      <Shadow x={x - h * 0.26} y={base + 1} rx={w * 0.95} ry={h * 0.055} opacity={0.2} />
      <path d={`M${x - w * 0.09} ${base} q${w * 0.09} -${h * 0.06} ${w * 0.18} 0 l0 ${h * 0.06} l-${w * 0.18} 0 Z`}
            fill="#4a3a2e" opacity="0.85" />
      {tiers.map(([top, bot, half], i) => (
        <path key={i} d={firTier(x, top, bot, half)} fill={body} />
      ))}
      {/* light on the moon side of each tier */}
      {tiers.map(([top, bot, half], i) => (
        <path key={`l${i}`} d={firTier(x + half * 0.18, top + (bot - top) * 0.1, bot - (bot - top) * 0.1, half * 0.62)}
              fill="#ffffff" opacity="0.07" />
      ))}
      {/* snow settled on the branches */}
      {tiers.map(([top, bot, half], i) => (
        <path
          key={`s${i}`}
          d={`M${x} ${top + 1} Q${x + half * 0.46} ${top + (bot - top) * 0.5} ${x + half * 0.56} ${bot - (bot - top) * 0.34}
              Q${x} ${bot - (bot - top) * 0.52} ${x - half * 0.56} ${bot - (bot - top) * 0.34}
              Q${x - half * 0.46} ${top + (bot - top) * 0.5} ${x} ${top + 1} Z`}
          fill={cap}
          opacity={capOpacity}
        />
      ))}
    </g>
  )
}

// A scattering of firs along a ridge — the forests that give the
// middle distance its depth.
function Forest({ seedKey, count, from, to, baseline, height, body, cap, capOpacity }) {
  const r = seeded(seedKey)
  const trees = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const x = from + (to - from) * t + (r() - 0.5) * 8
    const scale = 0.75 + r() * 0.5
    trees.push({ x, base: baseline(x) + r() * 3, h: height * scale, w: height * scale * 0.42 })
  }
  trees.sort((a, b) => a.base - b.base)
  return (
    <g>
      {trees.map((t, i) => (
        <Fir key={i} x={t.x} base={t.base} h={t.h} w={t.w} body={body} cap={cap} capOpacity={capOpacity} />
      ))}
    </g>
  )
}

// ── Where the land sits ─────────────────────────────────────────────

const farRidge = (x) => 128 - 6 * Math.sin(x / 70)
// The middle distance dips into a valley, so the eye is led inward.
const midRidge = (x) => 150 + 26 * Math.sin((x / 400) * Math.PI) ** 2 * 1 + 8 * Math.sin(x / 55)
const nearRidge = (x) => 200 + 10 * Math.sin(x / 90 + 1.4)
const frontRidge = (x) => 232 + 9 * Math.sin(x / 120 + 3.1)

// ── The layers, built once ──────────────────────────────────────────

const STARS = Array.from({ length: 150 }, () => ({
  x: between(-70, 470),
  y: between(-690, 60),
  r: between(0.55, 1.8),
  o: between(0.45, 1),
}))

const SKY_TEX = texture(300, [-70, -760, 470, 120],
  ['#8e9ad0', '#6d79b4', '#b7a9c4', '#e8c7a8'], { len: [18, 46], wid: [3, 7], alpha: [0.03, 0.09] })

const FAR_TEX = texture(90, [-70, 120, 470, 185], ['#ffffff', '#aab8d8'], { len: [12, 30], alpha: [0.05, 0.13] })
const MID_TEX = texture(130, [-70, 150, 470, 240], ['#ffffff', '#b9c6e2'], { len: [14, 34], alpha: [0.05, 0.14] })
const NEAR_TEX = texture(150, [-70, 196, 470, 285], ['#ffffff', '#c0cde6'], { len: [16, 40], wid: [2, 4.4], alpha: [0.06, 0.16] })
const FRONT_TEX = texture(170, [-70, 228, 470, 320], ['#ffffff', '#cbd6ea', '#f7e9dc'], { len: [20, 48], wid: [2.4, 5], alpha: [0.07, 0.18] })

const Sky = memo(function Sky() {
  return (
    <g className="d1-par d1-par--sky">
      <rect x="-70" y="-760" width="540" height="910" fill="url(#d1sky)" />

      {/* The sky's own light, strongest near the horizon */}
      <ellipse cx="200" cy="146" rx="340" ry="120" fill="url(#d1skyglow)" />
      <ellipse className="d1-aurglow" cx="210" cy="-40" rx="300" ry="130" fill="url(#d1aurglow)" />

      {/* Northern lights, hanging just above the peaks where they
          are actually visible — higher up and a wide screen crops
          them away entirely. */}
      <g className="d1-aurora" filter="url(#d1aurora)" transform="translate(0 46)">
        <path className="d1-aurora__band d1-aurora__band--a" fill="url(#d1aur1)"
              d="M-60 -92 C 40 -140 140 -56 240 -104 S 400 -70 480 -116
                 L480 -16 C 380 20 260 -28 160 6 S 20 42 -60 -4 Z" />
        <path className="d1-aurora__band d1-aurora__band--b" fill="url(#d1aur2)"
              d="M-60 -48 C 60 -92 180 -20 280 -62 S 420 -26 480 -68
                 L480 16 C 390 46 250 4 150 36 S 20 64 -60 28 Z" />
        <path className="d1-aurora__band d1-aurora__band--c" fill="url(#d1aur3)"
              d="M-60 -136 C 80 -182 200 -104 300 -146 S 430 -116 480 -152
                 L480 -92 C 400 -62 270 -98 170 -68 S 30 -44 -60 -80 Z" />
      </g>
      <Marks list={SKY_TEX} />
      {STARS.map((s, i) => (
        <circle
          key={i}
          className={i % 3 === 0 ? 'd1-star d1-star--twinkle' : 'd1-star'}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fff"
          opacity={s.o}
          style={i % 3 === 0 ? { animationDelay: `${(i % 11) * 0.37}s` } : undefined}
        />
      ))}
      <circle className="d1-moonglow" cx="322" cy="6" r="48" fill="url(#d1glow)" />
      <circle cx="322" cy="6" r="17" fill="#fff6dd" />
      <circle cx="317" cy="2" r="13" fill="#fffdf4" opacity="0.7" />
    </g>
  )
})

// Light comes from the moon, upper right. Everything casts to the
// lower left, and every edge facing the moon catches a rim of light.

function Rim({ d, width = 1.6, opacity = 0.6 }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={width * 3.4}
            opacity={opacity * 0.4} filter="url(#d1bloom)" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={width * 0.7}
            opacity={opacity * 0.38} strokeLinecap="round" />
    </g>
  )
}

function Shadow({ x, y, rx, ry, opacity = 0.2 }) {
  return (
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#49598c" opacity={opacity}
             filter="url(#d1soft)" />
  )
}

const SPARKLES = Array.from({ length: 90 }, () => ({
  x: between(-70, 470),
  y: between(196, 310),
  r: between(0.4, 1.1),
  o: between(0.3, 0.95),
}))

const FAR_EDGE = 'M-70 134 Q100 116 200 130 Q300 144 470 130'
const MID_EDGE = 'M-70 156 Q60 138 120 158 Q200 184 280 156 Q345 136 470 156'
const NEAR_EDGE = 'M-70 206 Q90 186 180 204 Q270 222 470 200'
const FRONT_EDGE = 'M-70 238 Q110 220 210 238 Q310 254 470 234'

const FarLayer = memo(function FarLayer() {
  return (
    <g className="d1-par d1-par--far">
      {/* An irregular range — even triangles read as geometry. */}
      <g filter="url(#d1haze-blur)">
        <path d="M-70 156 Q-24 132 28 96 Q40 83 50 110 Q62 92 76 74
                 Q88 62 98 100 Q108 76 118 60 Q130 48 142 102
                 Q154 86 166 86 Q178 90 190 116 Q200 90 212 74
                 Q222 62 234 108 Q246 92 258 90 Q270 78 286 66
                 Q298 58 310 104 Q322 86 334 82 Q348 88 360 110
                 Q372 92 384 88 Q398 96 470 128 L470 260 L-70 260 Z"
              fill="url(#d1peak)" />
        {/* snow on the lit flank of each peak */}
        <path d="M118 60 Q132 76 136 90 Q124 96 112 90 Q106 74 118 60 Z
                 M76 74 Q88 88 92 100 Q80 104 70 98 Q66 84 76 74 Z
                 M212 74 Q226 90 230 104 Q218 110 206 102 Q202 86 212 74 Z
                 M286 66 Q300 80 304 92 Q292 98 282 92 Q278 78 286 66 Z
                 M384 88 Q396 100 400 110 Q390 114 382 108 Q378 96 384 88 Z"
              fill="#e6ecf8" opacity="0.82" />
      </g>

      {/* haze pooling at the foot of the range */}
      <rect x="-70" y="104" width="540" height="42" fill="url(#d1haze)" />

      <path d="M-70 134 Q100 116 200 130 Q300 144 470 130 L470 270 L-70 270 Z"
            fill="url(#d1far)" />
      <Rim d={FAR_EDGE} width={1.2} opacity={0.3} />

      <Forest seedKey={4421} count={34} from={-66} to={466} baseline={farRidge}
              height={13} body="#5d7091" cap="#cdd8ec" capOpacity={0.6} />
      <Marks list={FAR_TEX} />
    </g>
  )
})

const MidLayer = memo(function MidLayer() {
  return (
    <g className="d1-par d1-par--mid">
      <path d="M-70 156 Q60 138 120 158 Q200 184 280 156 Q345 136 470 156 L470 300 L-70 300 Z"
            fill="url(#d1mid)" />
      <Rim d={MID_EDGE} width={1.4} opacity={0.34} />
      <Forest seedKey={9087} count={22} from={-66} to={130} baseline={midRidge}
              height={24} body="#44606a" cap="#e3ebf8" capOpacity={0.8} />
      <Forest seedKey={3312} count={20} from={272} to={466} baseline={midRidge}
              height={24} body="#44606a" cap="#e3ebf8" capOpacity={0.8} />
      <Marks list={MID_TEX} />
    </g>
  )
})

const NearLayer = memo(function NearLayer() {
  return (
    <g className="d1-par d1-par--near">
      <path d="M-70 206 Q90 186 180 204 Q270 222 470 200 L470 330 L-70 330 Z"
            fill="url(#d1near)" />
      <Rim d={NEAR_EDGE} width={1.6} opacity={0.4} />
      <Marks list={NEAR_TEX} />
    </g>
  )
})

const FrontLayer = memo(function FrontLayer() {
  return (
    <g className="d1-par d1-par--front">
      <path d="M-70 238 Q110 220 210 238 Q310 254 470 234 L470 340 L-70 340 Z"
            fill="url(#d1front)" />
      <Rim d={FRONT_EDGE} width={1.8} opacity={0.46} />
      <Marks list={FRONT_TEX} />
      {/* frost catching the light */}
      {SPARKLES.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
      ))}
    </g>
  )
})

const Cabin = memo(function Cabin() {
  const x = 200
  const base = 178
  return (
    <g>
      <Shadow x={x - 16} y={base + 4} rx={44} ry={7} opacity={0.22} />

      <g fill="#e9eefb" opacity="0.38">
        <circle cx={x + 17} cy={base - 54} r="4" />
        <circle cx={x + 21} cy={base - 64} r="5.5" />
        <circle cx={x + 16} cy={base - 76} r="7" />
      </g>
      <rect x={x + 12} y={base - 52} width="9" height="13" fill="#4a3426" />
      <rect x={x + 10} y={base - 55} width="13" height="5" rx="2" fill="#f2f6ff" />

      {/* lamplight pooling on the snow */}
      <ellipse cx={x} cy={base + 4} rx="62" ry="12" fill="url(#d1lamp)" opacity="0.5" />

      <rect x={x - 30} y={base - 30} width="60" height="32" rx="2" fill="url(#d1wall)" />
      <rect x={x - 30} y={base - 30} width="60" height="32" rx="2" fill="#2c1f16" opacity="0.25" />
      <rect x={x - 30} y={base - 30} width="26" height="32" fill="#2c1f16" opacity="0.22" />

      <path d={`M${x - 38} ${base - 29} L${x} ${base - 53} L${x + 38} ${base - 29} Z`} fill="#3f2b1f" />
      <path d={`M${x - 38} ${base - 33} L${x} ${base - 57} L${x + 38} ${base - 33} Z`} fill="#eef3ff" />
      <path d={`M${x} ${base - 57} L${x + 38} ${base - 33} L${x + 22} ${base - 33} Z`} fill="#ffffff" opacity="0.8" />
      <Rim d={`M${x - 38} ${base - 33} L${x} ${base - 57} L${x + 38} ${base - 33}`} width={1} opacity={0.7} />

      <rect x={x - 7} y={base - 18} width="14" height="20" rx="2" fill="#3a2719" />
      <circle cx={x + 3} cy={base - 8} r="1.2" fill="#ffd98a" />

      {/* windows, with the light blooming out of them */}
      {[-25, 13].map((dx, i) => (
        <g key={i}>
          <circle className="d1-windowglow" cx={x + dx + 6} cy={base - 18.5} r="13" fill="url(#d1lamp)" opacity="0.55" />
          <rect className="d1-window" x={x + dx} y={base - 24} width="12" height="11" rx="1.5" fill="#ffc766" />
          <rect x={x + dx} y={base - 24} width="12" height="11" rx="1.5" fill="#fff4d2" opacity="0.5" />
          <path d={`M${x + dx + 6} ${base - 24} v11 M${x + dx} ${base - 18.5} h12`}
                stroke="#6b4a36" strokeWidth="1.1" opacity="0.8" />
        </g>
      ))}

      <circle cx={x} cy={base - 26} r="4.5" fill="none" stroke="#2f4a3c" strokeWidth="2.4" />
      <circle cx={x} cy={base - 21.5} r="1.3" fill="#d4473f" />

      {[-30, -20, -10, 0, 10, 20, 30].map((dx, i) => {
        const colour = ['#ffd166', '#ff6b6b', '#8ad6a0'][i % 3]
        const cy = base - 31 + Math.abs(dx) * 0.08
        return (
          <g key={i}>
            <circle className="d1-fairy" style={{ animationDelay: `${i * 0.26}s` }} cx={x + dx} cy={cy} r="4" fill={colour} opacity="0.3" filter="url(#d1bloom)" />
            <circle cx={x + dx} cy={cy} r="1.5" fill={colour} />
          </g>
        )
      })}

      {/* footprints, wandering up to the door */}
      {Array.from({ length: 9 }, (_, i) => {
        const t = i / 8
        const fy = base + 62 - t * 58
        const fx = x - 16 + Math.sin(t * 3.4) * 7 + t * 12
        return (
          <g key={i} opacity={0.2 - t * 0.09}>
            <ellipse cx={fx - 2.6} cy={fy} rx="1.9" ry="1.2" fill="#4a5f8e" />
            <ellipse cx={fx + 2.6} cy={fy - 3} rx="1.9" ry="1.2" fill="#4a5f8e" />
          </g>
        )
      })}
    </g>
  )
})

const Snowman = memo(function Snowman() {
  const x = 250
  const base = 232
  return (
    <g>
      <Shadow x={x - 9} y={base + 1} rx={17} ry={4} opacity={0.26} />
      <circle cx={x} cy={base - 9} r="11" fill="#fbfdff" />
      <circle cx={x} cy={base - 24} r="8.5" fill="#fbfdff" />
      <circle cx={x} cy={base - 36} r="6.5" fill="#fbfdff" />
      {/* cool shadow on the side away from the moon */}
      <path d={`M${x - 11} ${base - 9} a11 11 0 0 0 7 10.2 a11 11 0 0 1 -7 -10.2Z`} fill="#c2d0ea" />
      <path d={`M${x - 8.5} ${base - 24} a8.5 8.5 0 0 0 5 7.9 a8.5 8.5 0 0 1 -5 -7.9Z`} fill="#c7d4ec" />
      <circle cx={x + 3.5} cy={base - 12} r="6" fill="#ffffff" opacity="0.6" />
      <circle cx={x - 2.2} cy={base - 38} r="0.95" fill="#3f3b34" />
      <circle cx={x + 2.2} cy={base - 38} r="0.95" fill="#3f3b34" />
      <path d={`M${x} ${base - 35.5} L${x + 6} ${base - 34.5} L${x} ${base - 33.5} Z`} fill="#e0893f" />
      <circle cx={x} cy={base - 25} r="1" fill="#3f3b34" />
      <circle cx={x} cy={base - 21} r="1" fill="#3f3b34" />
      <path d={`M${x - 8.5} ${base - 24} L${x - 18} ${base - 29}`} stroke="#5c4030" strokeWidth="1.5" strokeLinecap="round" />
      <path d={`M${x + 8.5} ${base - 24} L${x + 18} ${base - 28}`} stroke="#5c4030" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={x - 7.5} y={base - 45} width="15" height="3" rx="1.2" fill="#3b3833" />
      <rect x={x - 5} y={base - 53} width="10" height="9" rx="1.5" fill="#3b3833" />
      <rect x={x - 5} y={base - 47.5} width="10" height="2.5" fill="#d4473f" />
      <path d={`M${x - 7} ${base - 31} q7 3.5 14 0 l0.8 3.4 q-7.8 3.5 -15.6 0 Z`} fill="#d4473f" />
      <path d={`M${x + 6} ${base - 29.5} l3.4 8.6 l-3.4 0.9 l-1.7 -8.6 Z`} fill="#c23f38" />
    </g>
  )
})

const Reindeer = memo(function Reindeer() {
  const x = 140
  const base = 236
  return (
    <g>
      <Shadow x={x - 10} y={base + 1} rx={19} ry={4} opacity={0.26} />
      <path d={`M${x - 8} ${base} v-12 M${x - 2} ${base} v-12 M${x + 4} ${base} v-12 M${x + 10} ${base} v-12`}
            stroke="#5e4030" strokeWidth="2.8" strokeLinecap="round" />
      <ellipse cx={x + 1} cy={base - 17} rx="14.5" ry="9.5" fill="#7d5940" />
      <ellipse cx={x + 4} cy={base - 20} rx="10" ry="5.5" fill="#a07a56" opacity="0.75" />
      <circle cx={x - 14} cy={base - 20} r="3" fill="#8f6950" />
      {/* Neck: short and thick. The first attempt was long and thin
          and the thing looked like a llama. */}
      <ellipse cx={x + 13} cy={base - 27} rx="9.5" ry="7" fill="#8a6446"
               transform={`rotate(-40 ${x + 13} ${base - 27})`} />
      <ellipse cx={x + 14.5} cy={base - 28.5} rx="6.5" ry="4" fill="#a07a56" opacity="0.5"
               transform={`rotate(-40 ${x + 14.5} ${base - 28.5})`} />

      {/* Ear, behind the head */}
      <ellipse cx={x + 16.5} cy={base - 43} rx="3.8" ry="2.1" fill="#7d5940"
               transform={`rotate(-52 ${x + 16.5} ${base - 43})`} />

      {/* Head and muzzle, overlapping so they read as one animal */}
      <ellipse cx={x + 22} cy={base - 38} rx="8.2" ry="6.9" fill="#9b7554"
               transform={`rotate(-18 ${x + 22} ${base - 38})`} />
      <ellipse cx={x + 28.5} cy={base - 34.6} rx="5.4" ry="4.2" fill="#ab8562"
               transform={`rotate(-20 ${x + 28.5} ${base - 34.6})`} />
      <circle cx={x + 20.6} cy={base - 40.4} r="1.15" fill="#3f3b34" />

      {/* The famous nose, right on the end of the muzzle */}
      <circle className="d1-nose" cx={x + 32} cy={base - 33.2} r="4.8" fill="#d4473f"
              opacity="0.4" filter="url(#d1bloom)" />
      <circle cx={x + 32} cy={base - 33.2} r="3" fill="#d4473f" />
      <circle cx={x + 31} cy={base - 34.3} r="1" fill="#ffe3d6" opacity="0.85" />

      {/* Antlers, bigger and properly branched */}
      <path d={`M${x + 18.5} ${base - 43.5} c-1.4 -5 -3.6 -8.4 -7 -11.4
                m0 0 c-2.4 0.2 -4.6 -0.8 -6 -2.8 m6 2.8 c0.4 -2.4 0.2 -4.6 -0.8 -6.6
                M${x + 25} ${base - 44} c1 -5.2 2.8 -8.8 6 -12
                m0 0 c2.4 0 4.8 -1 6.2 -3 m-6.2 3 c-0.2 -2.4 0.2 -4.6 1.4 -6.6`}
            stroke="#5c4030" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Collar with a bell */}
      <path d={`M${x + 10} ${base - 26} q5 3.6 10 1.2`} stroke="#2f4a3c" strokeWidth="2.8" fill="none" />
      <circle cx={x + 15} cy={base - 23.4} r="1.6" fill="#ffd166" />
    </g>
  )
})

// ── The advent door ─────────────────────────────────────────────────
// Solid colour with soft marks over it, the same approach as the
// picture behind: form first, texture second.

const DOOR_TEX_L = texture(260, [-10, -10, 410, 810],
  ['#c25a4e', '#8d2f2b', '#d2705f', '#a8403a'],
  { len: [16, 44], wid: [3, 7], tilt: 90, alpha: [0.06, 0.2] })

const DOOR_TEX_R = texture(260, [-10, -10, 410, 810],
  ['#c25a4e', '#8d2f2b', '#d2705f', '#a8403a'],
  { len: [16, 44], wid: [3, 7], tilt: 90, alpha: [0.06, 0.2] })

export function PaintedDoor({ side = 'left' }) {
  return (
    <svg
      className="day01__doorpaint"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`d1door-${side}`} x1={side === 'left' ? '1' : '0'} y1="0"
                        x2={side === 'left' ? '0' : '1'} y2="1">
          <stop offset="0%" stopColor="#c0544a" />
          <stop offset="55%" stopColor="#a33c36" />
          <stop offset="100%" stopColor="#722426" />
        </linearGradient>
      </defs>
      <rect x="-10" y="-10" width="420" height="820" fill={`url(#d1door-${side})`} />
      <Marks list={side === 'left' ? DOOR_TEX_L : DOOR_TEX_R} />
    </svg>
  )
}

// ── The whole picture ───────────────────────────────────────────────

export default function Day01Scene({ onEnter }) {
  return (
    <svg
      className="day01__scene"
      viewBox="0 -700 400 966"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="A snowy valley at night with a lit cabin, firs, a snowman and a reindeer"
    >
      <defs>
        <linearGradient id="d1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#01020a" />
          <stop offset="42%" stopColor="#04071a" />
          <stop offset="64%" stopColor="#070d26" />
          <stop offset="80%" stopColor="#0b1232" />
          <stop offset="90%" stopColor="#141c3e" />
          <stop offset="96%" stopColor="#232b50" />
          <stop offset="100%" stopColor="#3b3a5e" />
        </linearGradient>
        {/* A broad glow sitting low in the sky, so the night is lit
            rather than merely dark. */}
        <radialGradient id="d1skyglow" cx="0.5" cy="1" r="0.85">
          <stop offset="0%" stopColor="#ffbe84" stopOpacity="0.16" />
          <stop offset="34%" stopColor="#9c7fb8" stopOpacity="0.07" />
          <stop offset="70%" stopColor="#5a63a8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#5a63a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d1aurglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#5cf0c0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5cf0c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d1glow">
          <stop offset="0%" stopColor="#fff6dd" stopOpacity="0.8" />
          <stop offset="52%" stopColor="#ffe9b8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>

        {/* Every snow plane is lit from the moon side and falls into
            cool shadow away from it. Flat white read as shapes. */}
        <linearGradient id="d1far" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3cfe7" />
          <stop offset="55%" stopColor="#a4b3d4" />
          <stop offset="100%" stopColor="#8d9dc4" />
        </linearGradient>
        <linearGradient id="d1mid" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#e8eefa" />
          <stop offset="55%" stopColor="#ccd8ed" />
          <stop offset="100%" stopColor="#b3c2e0" />
        </linearGradient>
        <linearGradient id="d1near" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#f3f7fe" />
          <stop offset="60%" stopColor="#dde7f7" />
          <stop offset="100%" stopColor="#c6d4ec" />
        </linearGradient>
        <linearGradient id="d1front" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#eef4fd" />
          <stop offset="100%" stopColor="#d6e2f5" />
        </linearGradient>
        <linearGradient id="d1peak" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aebbd8" />
          <stop offset="100%" stopColor="#6c7ca8" />
        </linearGradient>
        <linearGradient id="d1wall" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a6148" />
          <stop offset="100%" stopColor="#573a2a" />
        </linearGradient>
        <radialGradient id="d1lamp">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="d1haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d9c8" stopOpacity="0" />
          <stop offset="60%" stopColor="#e8d9c8" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#e8d9c8" stopOpacity="0" />
        </linearGradient>

        <filter id="d1soft" x="-60%" y="-120%" width="220%" height="340%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="d1haze-blur" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="d1bloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>

        {/* The aurora is three soft ribbons, blurred heavily so they
            read as light rather than as painted shapes. */}
        <filter id="d1aurora" x="-30%" y="-60%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
        <linearGradient id="d1aur1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3ef0a8" stopOpacity="0" />
          <stop offset="45%" stopColor="#4bf5bc" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#58d8f0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="d1aur2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7a6ff0" stopOpacity="0" />
          <stop offset="50%" stopColor="#a383ff" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#5fd6e8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="d1aur3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8df0c8" stopOpacity="0" />
          <stop offset="55%" stopColor="#c6ffe6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#8df0c8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <Sky />
      <FarLayer />
      <MidLayer />
      <Cabin />
      <NearLayer />

      {/* framing firs, largest and darkest because they are nearest */}
      <Fir x={368} base={248} h={92} w={36} body="#27433c" cap="#f0f6ff" lean={-1.5} />
      <Fir x={396} base={262} h={70} w={28} body="#1f3a34" cap="#e8f0fb" lean={2} />

      <Snowman />
      <Reindeer />

      <Fir x={34} base={252} h={104} w={40} body="#27433c" cap="#f0f6ff" lean={1.5} />
      <Fir x={6} base={264} h={78} w={30} body="#1f3a34" cap="#e8f0fb" lean={-2} />

      <FrontLayer />

      {/* The way in. Drawn last so nothing can sit on top of it. */}
      <g className="day01__doorway" onClick={onEnter} role="button" tabIndex={0}
         aria-label="Open the cabin door and go inside"
         onKeyDown={(e) => {
           if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnter() }
         }}>
        {/* A generous invisible target. The painted door is small, and
            26px was not enough to hit with a thumb. */}
        <rect x="176" y="144" width="48" height="46" fill="transparent" />
        <rect className="day01__doorhalo" x="192" y="159" width="16" height="22" rx="2.5" />
        <circle cx="203" cy="170" r="1.2" fill="#ffd98a" />
      </g>
    </svg>
  )
}
