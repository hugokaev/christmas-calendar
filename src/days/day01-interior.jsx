// Inside the cabin — a warm lodge, in the spirit of the Winterfest
// lobby: a big roaring hearth, a tall tree, stacks of wrapped presents,
// strung lights, and deep shadow in the corners so the firelight is the
// brightest thing in the room.
//
// The lighting rule: everything warm and saturated near the fire,
// everything cool and dark away from it.
import { memo, useState } from 'react'

// A fir-shaped tier with curved flanks and a scalloped underside.
function tier(x, top, bot, half) {
  const dip = (bot - top) * 0.18
  return [
    `M${x} ${top}`,
    `C${x + half * 0.34} ${top + (bot - top) * 0.4} ${x + half * 0.74} ${bot - dip * 1.5} ${x + half} ${bot}`,
    `Q${x + half * 0.5} ${bot - dip} ${x + half * 0.2} ${bot - dip * 0.3}`,
    `Q${x} ${bot + dip * 0.2} ${x - half * 0.2} ${bot - dip * 0.3}`,
    `Q${x - half * 0.5} ${bot - dip} ${x - half} ${bot}`,
    `C${x - half * 0.74} ${bot - dip * 1.5} ${x - half * 0.34} ${top + (bot - top) * 0.4} ${x} ${top}`,
    'Z',
  ].join(' ')
}

// A wrapped present. The stacks of these are the thing that makes the
// room read as Winterfest rather than any old living room.
function Present({ x, y, w, h, paper, ribbon, lid = true }) {
  const [poked, setPoked] = useState(false)

  function poke() {
    setPoked(true)
    setTimeout(() => setPoked(false), 650)
  }

  return (
    <g
      className={poked ? 'd1-present d1-present--wiggle' : 'd1-present'}
      onClick={poke}
      role="button"
      tabIndex={0}
      aria-label="A wrapped present"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke() } }}
    >
      <ellipse cx={x} cy={y + 2} rx={w * 0.62} ry={h * 0.13} fill="#120a05" opacity="0.4" />
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={3} fill={paper} />
      <rect x={x - w / 2} y={y - h} width={w * 0.34} height={h} rx={3} fill="#000" opacity="0.18" />
      <rect x={x - w / 2} y={y - h} width={w} height={h * 0.3} rx={3} fill="#fff" opacity="0.1" />
      <rect x={x - w * 0.09} y={y - h} width={w * 0.18} height={h} fill={ribbon} />
      {lid && (
        <>
          <rect x={x - w * 0.56} y={y - h - h * 0.17} width={w * 1.12} height={h * 0.22} rx={3} fill={paper} />
          <rect x={x - w * 0.56} y={y - h - h * 0.17} width={w * 1.12} height={h * 0.09} rx={3} fill="#fff" opacity="0.14" />
          <path d={`M${x} ${y - h - h * 0.17} q-${w * 0.3} -${h * 0.26} -${w * 0.06} -${h * 0.3}
                    q${w * 0.2} -0.5 ${w * 0.06} ${h * 0.3}
                    q${w * 0.3} -${h * 0.26} ${w * 0.06} -${h * 0.3}
                    q-${w * 0.2} -0.5 -${w * 0.06} ${h * 0.3} Z`}
                fill={ribbon} />
        </>
      )}
    </g>
  )
}

const PLANKS = [-314, -290, -266, -242, -218, -194, -170, -146, -122, -98,
                -74, -50, -26, -2, 22, 46, 70, 94, 118, 142, 166, 190]

const Interior = memo(function Interior() {
  return (
    <svg
      className="day01__interior"
      viewBox="0 -340 400 640"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="d1wallIn" x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#6b4227" />
          <stop offset="55%" stopColor="#452a18" />
          <stop offset="100%" stopColor="#241409" />
        </linearGradient>
        <linearGradient id="d1floor" x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#70492a" />
          <stop offset="100%" stopColor="#2e1b0d" />
        </linearGradient>
        <radialGradient id="d1fire">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="1" />
          <stop offset="32%" stopColor="#ffb14d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff6a1f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d1room" cx="0.6" cy="0.66" r="0.85">
          <stop offset="0%" stopColor="#ffb963" stopOpacity="0.4" />
          <stop offset="42%" stopColor="#ff8c3a" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0c0603" stopOpacity="0.76" />
        </radialGradient>
        <linearGradient id="d1night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2f63" />
          <stop offset="100%" stopColor="#4a6aa6" />
        </linearGradient>
        <linearGradient id="d1stone" x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#7d7066" />
          <stop offset="100%" stopColor="#3a332c" />
        </linearGradient>
        <linearGradient id="d1beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4d2c" />
          <stop offset="100%" stopColor="#4a2d18" />
        </linearGradient>
      </defs>

      <rect x="0" y="-340" width="400" height="640" fill="url(#d1wallIn)" />
      {PLANKS.map((y, i) => (
        <path key={i}
              d={`M-5 ${y} Q110 ${y - 2.5 + (i % 2) * 4} 205 ${y + 1.5} T405 ${y - 1}`}
              stroke="#1e1008" strokeWidth="2.4" fill="none" opacity="0.45" />
      ))}

      {/* ceiling beam, with lights slung from it */}
      <rect x="-5" y="-2" width="410" height="18" fill="url(#d1beam)" />
      <path d="M-5 20 Q60 54 120 26 Q190 -6 260 30 Q330 60 405 24"
            stroke="#1f5438" strokeWidth="6" fill="none" strokeLinecap="round" />
      {Array.from({ length: 16 }, (_, i) => {
        const gx = -5 + i * 26
        const gy = 20 + Math.sin((gx + 30) / 42) * 20 + 12
        const colour = ['#ffd166', '#ff6b6b', '#8ad6a0', '#7ec8e3'][i % 4]
        return (
          <g key={i}>
            <circle className="d1-fairy" style={{ animationDelay: `${i * 0.19}s` }} cx={gx} cy={gy} r="7" fill={colour} opacity="0.22" />
            <circle cx={gx} cy={gy} r="2.6" fill={colour} />
          </g>
        )
      })}

      {/* A second string of lights, higher up. A wide screen never sees
          this; a tall phone would otherwise show bare wall. */}
      <path d="M-5 -210 Q70 -176 140 -204 Q215 -234 285 -198 Q350 -168 405 -206"
            stroke="#1f5438" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      {Array.from({ length: 14 }, (_, i) => {
        const gx = 4 + i * 30
        const gy = -210 + Math.sin((gx + 30) / 46) * 20 + 12
        const colour = ['#ffd166', '#ff6b6b', '#8ad6a0', '#7ec8e3'][i % 4]
        return (
          <g key={`hi${i}`}>
            <circle className="d1-fairy" style={{ animationDelay: `${i * 0.23}s` }} cx={gx} cy={gy} r="6" fill={colour} opacity="0.2" />
            <circle cx={gx} cy={gy} r="2.3" fill={colour} />
          </g>
        )
      })}

      {/* window, cold blue against all the amber */}
      <g>
        <rect x="18" y="74" width="76" height="60" rx="5" fill="url(#d1night)" />
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={22 + ((i * 41) % 68)} cy={78 + ((i * 57) % 52)}
                  r={0.7 + (i % 3) * 0.4} fill="#eaf2ff" opacity={0.5 + (i % 4) * 0.12} />
        ))}
        <path d="M18 118 Q40 108 58 118 Q76 128 94 118 L94 134 L18 134 Z" fill="#dce8fb" opacity="0.9" />
        <path d="M56 74 v60 M18 104 h76" stroke="#5a3a21" strokeWidth="4" />
        <rect x="18" y="74" width="76" height="60" rx="5" fill="none" stroke="#5a3a21" strokeWidth="7" />
        <path d="M12 136 q44 6 88 0 l0 6 q-44 6 -88 0 Z" fill="#6b4428" />
        {/* cold light spilling in */}
        <ellipse cx="56" cy="150" rx="56" ry="18" fill="#9ec2f0" opacity="0.12" />
      </g>

      {/* floor */}
      <path d="M-5 214 Q115 204 205 214 T405 207 L405 305 L-5 305 Z" fill="url(#d1floor)" />
      <path d="M-5 214 Q115 204 205 214 T405 207" stroke="#a9713f" strokeWidth="2"
            fill="none" opacity="0.45" />

      {/* the hearth throwing light across the boards */}
      <ellipse cx="262" cy="258" rx="168" ry="60" fill="url(#d1fire)" opacity="0.55" />

      <ellipse cx="180" cy="268" rx="120" ry="30" fill="#7a2f2c" />
      <ellipse cx="180" cy="266" rx="96" ry="23" fill="#9c3f39" />
      <ellipse cx="180" cy="264" rx="60" ry="13" fill="#7a2f2c" opacity="0.8" />

      {/* tree */}
      <g>
        <path d="M96 216 q9 -5 18 0 l0 10 l-18 0 Z" fill="#3a2718" />
        <path d={tier(105, 96, 142, 32)} fill="#1f5438" />
        <path d={tier(105, 120, 170, 40)} fill="#276347" />
        <path d={tier(105, 146, 200, 48)} fill="#2f7a4e" />
        <path d={tier(105, 174, 222, 55)} fill="#357f54" />
        <path d="M105 88 l4.4 9.2 l10 1.5 l-7.2 7.1 l1.7 10 l-8.9 -4.7 l-8.9 4.7 l1.7 -10 l-7.2 -7.1 l10 -1.5 Z"
              fill="#ffd166" />
        <circle cx="105" cy="92" r="13" fill="#ffd166" opacity="0.18" />
        {[[92, 128], [118, 134], [100, 152], [126, 158], [82, 160], [110, 176],
          [136, 182], [78, 186], [104, 196], [132, 204], [86, 208]].map(([cx, cy], i) => {
          const colour = ['#e0453c', '#ffd166', '#7ec8e3', '#b58ae0'][i % 4]
          return (
            <g key={i}>
              <circle className="d1-treelight" style={{ animationDelay: `${i * 0.31}s` }} cx={cx} cy={cy} r="5.6" fill={colour} opacity="0.26" />
              <circle className="d1-bauble" style={{ animationDelay: `${i * 0.23}s` }} cx={cx} cy={cy} r="3.2" fill={colour} />
              <circle cx={cx - 1} cy={cy - 1.1} r="1" fill="#fff" opacity="0.65" />
            </g>
          )
        })}
      </g>

      {/* presents under the tree */}
      <Present x={74} y={224} w={30} h={22} paper="#c0392b" ribbon="#f0d58c" />
      <Present x={104} y={228} w={24} h={17} paper="#2e7d4f" ribbon="#f4f0e4" />
      <Present x={134} y={224} w={27} h={26} paper="#2f6fa8" ribbon="#f0d58c" />
      <Present x={88} y={240} w={36} h={18} paper="#f0d58c" ribbon="#c0392b" lid={false} />

      {/* fireplace */}
      <g>
        <rect x="206" y="120" width="148" height="100" rx="7" fill="url(#d1stone)" />
        {[[216, 134], [254, 134], [292, 134], [330, 134], [234, 158], [272, 158], [310, 158],
          [216, 182], [254, 182], [292, 182], [330, 182]].map(([bx, by], i) => (
          <rect key={i} x={bx} y={by} width="34" height="19" rx="6" fill="#fff" opacity="0.06" />
        ))}
        <path d="M194 110 q86 -8 184 0 l0 14 q-92 8 -184 0 Z" fill="#7a4d2c" />
        <path d="M194 110 q86 -8 184 0 l0 5 q-92 7 -184 0 Z" fill="#fff" opacity="0.1" />

        <path d="M228 220 L228 176 Q280 144 332 176 L332 220 Z" fill="#160b04" />
        <ellipse className="d1-fireglow" cx="280" cy="212" rx="56" ry="34" fill="url(#d1fire)" />
        <path className="d1-flame d1-flame--outer" d="M262 214 q8 -26 18 -34 q10 8 18 34 Z" fill="#ff7a28" />
        <path className="d1-flame d1-flame--mid" d="M270 214 q5 -17 10 -24 q6 7 11 24 Z" fill="#ffb64d" />
        <path className="d1-flame d1-flame--core" d="M275 214 q3 -11 5 -15 q3 4 6 15 Z" fill="#fff3c4" />
        <path d="M246 215 q34 -9 68 0 l0 6 q-34 8 -68 0 Z" fill="#43291a" />

        {[[222, 124], [256, 124], [290, 124], [324, 124]].map(([sx, sy], i) => (
          <path key={i}
                d={`M${sx} ${sy} q5 -2 10 0 l0 17 q0 10 11 10 l7 0 q6 0 6 -6 l-7 -4 l-8 -1 l0 -16 Z`}
                fill={['#c0392b', '#2e7d4f', '#c0392b', '#2e7d4f'][i]} />
        ))}
        {/* candles on the mantel */}
        {[[210, 110], [362, 110]].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx - 3} y={cy - 16} width="6" height="16" rx="2" fill="#f4f0e4" />
            <ellipse className="d1-fireglow" cx={cx} cy={cy - 20} rx="6" ry="9" fill="#ffcf5c" opacity="0.3" />
            <path className="d1-candle" d={`M${cx} ${cy - 24} q3 4 0 6 q-3 -2 0 -6Z`} fill="#fff3c4" />
          </g>
        ))}
      </g>

      {/* a stack of presents beside the hearth */}
      <Present x={222} y={240} w={34} h={24} paper="#2e7d4f" ribbon="#f0d58c" />
      <Present x={218} y={216} w={26} h={18} paper="#f0d58c" ribbon="#c0392b" />
      <Present x={346} y={248} w={38} h={26} paper="#c0392b" ribbon="#f4f0e4" />
      <Present x={340} y={222} w={28} h={19} paper="#2f6fa8" ribbon="#f0d58c" />

      {/* the room's own light, and dark in every corner */}
      <rect x="0" y="-340" width="400" height="640" fill="url(#d1room)" />
    </svg>
  )
})

export default Interior
