// The frame around every page: a thin bar of links, then the page itself.
import { NavLink } from 'react-router-dom'
import { useWho } from '../lib/WhoContext.jsx'
import './Layout.css'

// Bold the page you are currently on, so it is obvious where you are.
function navClass({ isActive }) {
  return isActive ? 'topbar__link topbar__link--here' : 'topbar__link'
}

export default function Layout({ children }) {
  const { name, signOut } = useWho()

  return (
    <div className="page">
      <nav className="topbar">
        <NavLink className={navClass} to="/" end>Calendar</NavLink>
        <NavLink className={navClass} to="/editor">Editor</NavLink>

        <span className="topbar__right">
          <span className="topbar__who">{name}</span>
          <button className="topbar__button" type="button" onClick={signOut}>
            Not you?
          </button>
        </span>
      </nav>

      <main>{children}</main>
    </div>
  )
}
