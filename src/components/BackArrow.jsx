// The only thing the site puts on a day page.
//
// Everything else there belongs to whoever built that day.
import { Link } from 'react-router-dom'
import './BackArrow.css'

export default function BackArrow({ to = '/' }) {
  return (
    <Link className="backarrow" to={to} aria-label="Back">
      ←
    </Link>
  )
}
