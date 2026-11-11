// The frame around every page: a thin bar of links, then the page itself.
import { NavLink } from 'react-router-dom'
import { useWho } from '../lib/WhoContext.jsx'
import './Layout.css'

// Bold the page you are currently on, so it is obvious where you are.
function navClass({ isActive }) {
  return isActive ? 'topbar__link topbar__link--here' : 'topbar__link'
}

export default function Layout({ children }) {
  const { name, signOut, unlockAll, setUnlockAll } = useWho()

  return (
    <div className="page">
      <nav className="topbar">
        <NavLink className={navClass} to="/" end>Calendar</NavLink>
        <NavLink className={navClass} to="/my-days">My days</NavLink>

        <span className="topbar__right">
          {import.meta.env.DEV && (
            <label className="topbar__test" title="Testing only — never in the published site">
              <input
                type="checkbox"
                checked={unlockAll}
                onChange={(event) => setUnlockAll(event.target.checked)}
              />
              unlock all
            </label>
          )}

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
