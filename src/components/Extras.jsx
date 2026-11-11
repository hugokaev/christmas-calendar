// Renders whatever has been dropped into src/extras/top or /bottom.
// Each one is wrapped on its own, so a broken extra cannot take the
// calendar down with it.
import { topExtras, bottomExtras } from '../extras/index.js'
import Boundary from './Boundary.jsx'
import './Boundary.css'

export default function Extras({ slot }) {
  const items = slot === 'top' ? topExtras : bottomExtras

  if (items.length === 0) return null

  return (
    <div className={`extras extras--${slot}`}>
      {items.map(({ name, Component }) => (
        <Boundary key={name} name={name}>
          <Component />
        </Boundary>
      ))}
    </div>
  )
}
