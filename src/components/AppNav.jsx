import { NavLink } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Nav({ locked = false, theme = 'dark', onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  const cls = ({ isActive }) =>
    'nav-link' + (isActive ? ' active' : '') + (locked ? ' disabled' : '')

  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => { if (!navRef.current?.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav ref={navRef}>
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo" style={{textDecoration:'none'}}>LegalGraph<sup>®</sup></NavLink>
        <div className="nav-links">
          <NavLink to="/app"       className={cls} end>Dashboard</NavLink>
          <NavLink to="/leases"    className={cls}>Reports</NavLink>
          <NavLink to="/playbooks" className={cls}>Playbooks</NavLink>
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
          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu">
          <NavLink to="/app"       className={cls} end   onClick={closeMenu}>Dashboard</NavLink>
          <NavLink to="/leases"    className={cls}       onClick={closeMenu}>Reports</NavLink>
          <NavLink to="/playbooks" className={cls}       onClick={closeMenu}>Playbooks</NavLink>
          <span className="nav-link disabled" title="Coming soon">Audit Trail</span>
        </div>
      )}
    </nav>
  )
}
