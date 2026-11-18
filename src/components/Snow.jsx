// Gentle snow over the calendar page.
//
// Every flake starts above the top of the screen, so when the page opens
// the snow drifts in from the top rather than appearing all at once.
// After that it keeps falling, looping back to the top when it lands.
//
// It sits behind the page content, so the white boxes hide it as it
// passes, and it ignores the mouse. Anyone who has asked their device for reduced motion
// gets no snow at all.
import { useEffect, useRef } from 'react'
import './Snow.css'

const FLAKES_PER_100PX = 5// density, measured across the screen width

export default function Snow() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let flakes = []
    let frame = 0
    let last = performance.now()

    function makeFlake(startAbove) {
      return {
        x: Math.random() * width,
        // On the first wave, spread flakes out above the screen so they
        // arrive in a soft, uneven curtain.
        y: startAbove ? -Math.random() * height - 15 : -15,
        r: 1 + Math.random() * 2.2,
        speed: 15 + Math.random() * 25, // pixels per second
        drift: Math.random() * Math.PI * 2,
        sway: 8 + Math.random() * 14,
        alpha: 0.35 + Math.random() * 0.4,
        // About one in four is a proper six-armed snowflake that slowly
        // turns as it falls; the rest are plain soft dots.
        shape: Math.random() < 0.25 ? 'flake' : 'dot',
        size: 5 + Math.random() * 6,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.8,
      }
    }

    function drawFlake(x, y, size, angle) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      for (let arm = 0; arm < 6; arm++) {
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -size)
        // Two little branches on each arm.
        const b = size * 0.55
        const len = size * 0.32
        ctx.moveTo(0, -b)
        ctx.lineTo(-len * 0.8, -b - len * 0.6)
        ctx.moveTo(0, -b)
        ctx.lineTo(len * 0.8, -b - len * 0.6)
        ctx.rotate(Math.PI / 3)
      }
      ctx.stroke()
      ctx.restore()
    }

    function resize() {
      const ratio = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

      const wanted = Math.round((width / 100) * FLAKES_PER_100PX)
      while (flakes.length < wanted) flakes.push(makeFlake(true))
      flakes.length = wanted
    }

    function tick(now) {
      // Cap the step so a tab coming back from the background
      // does not make every flake jump.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      ctx.clearRect(0, 0, width, height)
      for (const flake of flakes) {
        flake.y += flake.speed * dt
        flake.drift += dt * 0.8
        flake.angle += flake.spin * dt
        if (flake.y - flake.size > height) Object.assign(flake, makeFlake(false))

        const x = flake.x + Math.sin(flake.drift) * flake.sway
        const colour = `rgba(150, 165, 185, ${flake.alpha})`

        if (flake.shape === 'flake') {
          ctx.strokeStyle = colour
          ctx.lineWidth = 1.2
          ctx.lineCap = 'round'
          drawFlake(x, flake.y, flake.size, flake.angle)
        } else {
          ctx.beginPath()
          ctx.arc(x, flake.y, flake.r, 0, Math.PI * 2)
          ctx.fillStyle = colour
          ctx.fill()
        }
      }

      frame = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="snow" aria-hidden="true" />
}
