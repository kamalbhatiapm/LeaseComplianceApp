import { NavLink } from 'react-router-dom'

export default function Nav({ locked = false }) {
  const cls = ({ isActive }) =>
    'nav-link' + (isActive ? ' active' : '') + (locked ? ' disabled' : '')

  return (
    <nav>
      <div className="nav-logo">LegalGraph<sup>®</sup></div>
      <div className="nav-links">
        <NavLink to="/"          className={cls} end>Dashboard</NavLink>
        <NavLink to="/leases"    className={cls}>Leases</NavLink>
        <NavLink to="/playbooks" className={cls}>Playbooks</NavLink>
        <span className="nav-link disabled" title="Coming soon">Reports</span>
        <span className="nav-link disabled" title="Coming soon">Audit Trail</span>
      </div>
      <div className="nav-end">
        <div className="avatar">RC</div>
      </div>
    </nav>
  )
}
