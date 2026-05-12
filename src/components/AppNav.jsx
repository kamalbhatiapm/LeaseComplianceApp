import { NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { signOut } from '../utils/supabase.js'

export default function Nav({ locked = false, theme = 'dark', onToggleTheme, user }) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const navRef    = useRef(null)
  const avatarRef = useRef(null)
  const navigate  = useNavigate()

  const cls = ({ isActive }) =>
    'nav-link' + (isActive ? ' active' : '') + (locked ? ' disabled' : '')

  // Close hamburger on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => { if (!navRef.current?.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return
    const close = (e) => { if (!avatarRef.current?.contains(e.target)) setAvatarOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [avatarOpen])

  const closeMenu = () => setMenuOpen(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // Derive initials from email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'RC'

  return (
    <nav ref={navRef}>
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo" style={{textDecoration:'none'}}>LegalGraph<sup aria-hidden="true">®</sup></NavLink>
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

          {/* Avatar + dropdown */}
          <div className="nav-avatar-wrap" ref={avatarRef}>
            <button
              className="avatar"
              onClick={() => setAvatarOpen(o => !o)}
              title={user?.email ?? ''}
              aria-label="Account menu"
            >
              {initials}
            </button>
            {avatarOpen && (
              <div className="nav-avatar-dropdown">
                {user?.email && (
                  <div className="nav-avatar-email">{user.email}</div>
                )}
                <button className="nav-avatar-signout" onClick={handleSignOut}>
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>

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
          {user && (
            <button className="nav-link nav-mobile-signout" onClick={handleSignOut}>
              <LogOut size={13} style={{marginRight:6}} />
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
