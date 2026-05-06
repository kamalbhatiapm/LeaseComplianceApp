import { NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'

export default function Nav({ locked = false, theme = 'dark', onToggleTheme }) {
  const cls = ({ isActive }) =>
    'nav-link' + (isActive ? ' active' : '') + (locked ? ' disabled' : '')

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-logo">LegalGraph<sup>®</sup></div>
        <div className="nav-links">
          <NavLink to="/"          className={cls} end>Dashboard</NavLink>
          <NavLink to="/leases"    className={cls}>Leases</NavLink>
          <NavLink to="/playbooks" className={cls}>Playbooks</NavLink>
          <span className="nav-link disabled" title="Coming soon">Reports</span>
          <span className="nav-link disabled" title="Coming soon">Audit Trail</span>
        </div>
        <div className="nav-end">
          {onToggleTheme && (
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun  size={15} aria-hidden="true" />
                : <Moon size={15} aria-hidden="true" />}
            </button>
          )}
          <div className="avatar">RC</div>
        </div>
      </div>
    </nav>
  )
}
