// Day 2 — the curtained stage.
//
// A big version of day 2's calendar box. Beside it is a crank handle:
// turn it anticlockwise and the curtains slowly draw apart to show a video.
// Turn it back the other way and they close again.
//
// THE VIDEO
//
// It comes from the day's saved content (Editor -> 2 December -> Edit),
// in the structured-data box, so it stays hidden until the day unlocks:
//
//   { "video": "https://..." }
//
// Paste the YouTube link as it is (an unlisted video works). Any of
// youtu.be/..., youtube.com/watch?v=..., /shorts/... or /embed/... is fine.
// A direct link to a video file (.mp4, .webm) also works.
import { useEffect, useRef, useState } from 'react'
import top from '../assets/day02-top.png'
import curtainLeft from '../assets/day02-curtain-left.png'
import curtainRight from '../assets/day02-curtain-right.png'
import floor from '../assets/day02-floor.png'
import './Day02.css'

const TURNS = 20 // full turns of the handle to open the curtains all the way
const MAX_TURN = TURNS * Math.PI * 2
const KEY_STEP = Math.PI / 6// how far one arrow-key press turns it

// "https://youtu.be/abc" or "https://www.youtube.com/watch?v=abc" -> "abc"
function youTubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{6,})/,
  )
  return match ? match[1] : null
}

export default function Day02({ secret }) {
  const [turn, setTurn] = useState(0) // how far the handle has turned, in radians
  const [revealed, setRevealed] = useState(false) // fully opened at least once
  const crankRef = useRef(null)
  const lastAngle = useRef(null)
  const videoRef = useRef(null)
  const youTubeRef = useRef(null)

  const progress = turn / MAX_TURN // 0 = shut, 1 = fully open
  const open = progress >= 0.999

  const videoUrl = typeof secret?.data?.video === 'string' ? secret.data.video.trim() : ''
  const ytId = videoUrl ? youTubeId(videoUrl) : null

  // Play once the curtains are fully open; pause if they start closing.
  const shouldPause = !open && progress < 0.9
  useEffect(() => {
    if (open && !revealed) setRevealed(true)

    const video = videoRef.current
    if (video) {
      if (open) video.play().catch(() => {})
      else if (shouldPause) video.pause()
    }

    // YouTube is a page inside the page; it takes commands by message.
    const frame = youTubeRef.current
    if (frame && (open || shouldPause)) {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: open ? 'playVideo' : 'pauseVideo', args: [] }),
        'https://www.youtube.com',
      )
    }
  }, [open, shouldPause, revealed])

  function angleOf(event) {
    const box = crankRef.current.getBoundingClientRect()
    return Math.atan2(
      event.clientY - (box.top + box.height / 2),
      event.clientX - (box.left + box.width / 2),
    )
  }

  function turnBy(delta) {
    setTurn((t) => Math.min(MAX_TURN, Math.max(0, t + delta)))
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    lastAngle.current = angleOf(event)
  }

  function onPointerMove(event) {
    if (lastAngle.current === null) return
    const angle = angleOf(event)
    let delta = angle - lastAngle.current
    // Going past the 9 o'clock line jumps by a full circle; undo that.
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    lastAngle.current = angle
    turnBy(-delta) // anticlockwise on screen opens
  }

  function onPointerUp() {
    lastAngle.current = null
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') turnBy(KEY_STEP)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') turnBy(-KEY_STEP)
    else return
    event.preventDefault()
  }

  // Each curtain bunches up towards its own side.
  const squeeze = 1 - progress * 0.88

  return (
    <div className="day02">
      <div className="day02__stage">
        <div className="day02__screen">
          {!videoUrl && <p className="day02__empty">No video yet</p>}
          {videoUrl && ytId && revealed && (
            <iframe
              ref={youTubeRef}
              className="day02__video"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
              title="Day 2 video"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
          {videoUrl && !ytId && (
            <video
              ref={videoRef}
              className="day02__video"
              src={videoUrl}
              controls={open}
              playsInline
              preload="metadata"
            />
          )}
        </div>

        <img
          className="day02__layer day02__curtain day02__curtain--left"
          src={curtainLeft}
          alt=""
          draggable="false"
          style={{ transform: `scaleX(${squeeze})` }}
        />
        <img
          className="day02__layer day02__curtain day02__curtain--right"
          src={curtainRight}
          alt=""
          draggable="false"
          style={{ transform: `scaleX(${squeeze})` }}
        />
        <img className="day02__layer day02__floor" src={floor} alt="" draggable="false" />
        <img className="day02__layer day02__top" src={top} alt="" draggable="false" />
      </div>

      <div className="day02__side">
        <div
          ref={crankRef}
          className="day02__crank"
          role="slider"
          tabIndex={0}
          aria-label="Curtain handle. Turn anticlockwise to open."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <svg viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
            {/* The wheel plate, fixed to the wall. */}
            <rect x="6" y="4" width="20" height="24" fill="#3b2412" />
            <rect x="4" y="6" width="24" height="20" fill="#3b2412" />
            <rect x="7" y="5" width="18" height="22" fill="#7a4a24" />
            <rect x="5" y="7" width="22" height="18" fill="#7a4a24" />
            <rect x="8" y="8" width="2" height="2" fill="#9c6634" />
            <rect x="22" y="22" width="2" height="2" fill="#5a3518" />

            {/* The handle, which turns. */}
            <g transform={`rotate(${(-turn * 180) / Math.PI} 16 16)`}>
              <rect x="15" y="4" width="2" height="12" fill="#1c1c1c" />
              <rect x="13" y="1" width="6" height="5" fill="#1c1c1c" />
              <rect x="14" y="2" width="4" height="3" fill="#e2b33c" />
              <rect x="14" y="2" width="2" height="1" fill="#f6dc86" />
            </g>

            {/* The hub in the middle. */}
            <rect x="13" y="13" width="6" height="6" fill="#1c1c1c" />
            <rect x="14" y="14" width="4" height="4" fill="#c49a3a" />
          </svg>
        </div>

        <p className={`day02__hint${turn > 0 ? ' day02__hint--gone' : ''}`}>
          Turn the handle ↺
        </p>
      </div>
    </div>
  )
}
