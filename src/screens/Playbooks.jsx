import {
  BookOpen, FileText, Plus,
  CalendarDays, CreditCard, Percent, RefreshCw, Building2,
  GitBranch, DollarSign, TrendingDown, BarChart3, Clock,
} from 'lucide-react'
import Nav from '../components/AppNav.jsx'

const PLAYBOOKS = [
  {
    title: 'IFRS 16 Standard Template',
    meta: 'Version 2.4 · Updated Mar 2026',
    badge: 'IFRS 16',
    badgeCls: 'badge-ifrs',
    stats: [{ val: 9, label: 'Required fields' }, { val: 14, label: 'Risk rules' }, { val: 3, label: 'Contract types' }],
    rules: [
      { icon: CalendarDays, label: 'Lease term',       desc: 'Commencement date, expiry date, non-cancellable period' },
      { icon: CreditCard,   label: 'Payment schedule', desc: 'Annual base rent, escalation rate, payment frequency' },
      { icon: Percent,      label: 'Discount rate',    desc: 'IBR or stated rate; flags if absent' },
      { icon: RefreshCw,    label: 'Renewal options',  desc: 'Number, duration, reasonably certain assessment' },
      { icon: Building2,    label: 'ROU asset scope',  desc: 'Premises description, sq ft, floor reference' },
    ],
  },
  {
    title: 'ASC 842 Standard Template',
    meta: 'Version 1.8 · Updated Feb 2026',
    badge: 'ASC 842',
    badgeCls: 'badge-asc',
    stats: [{ val: 11, label: 'Required fields' }, { val: 12, label: 'Risk rules' }, { val: 4, label: 'Contract types' }],
    rules: [
      { icon: GitBranch,   label: 'Lease classification',    desc: 'Finance vs. operating lease test (5 criteria)' },
      { icon: CalendarDays,label: 'Lease term',              desc: 'Commencement, end date, extension options' },
      { icon: DollarSign,  label: 'Lease payments',          desc: 'Fixed, variable, in-substance fixed payments' },
      { icon: TrendingDown,label: 'Incremental borrow rate', desc: 'Required for operating leases; collateral-adjusted' },
      { icon: BarChart3,   label: 'Variable lease costs',    desc: 'Index-linked escalations, usage-based charges' },
    ],
  },
]

export default function Playbooks({ navLocked, theme, toggleTheme, user }) {
  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} user={user} />
      <main id="main-content">

      <div className="s3-header">
        <div className="s3-title-group">
          <div className="section-title">Playbooks</div>
          <p>Extraction rules and risk criteria applied during contract analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm s3-btn-outline"><BookOpen size={12} aria-hidden="true" /> Documentation</button>
          <button className="btn btn-primary btn-sm"><Plus size={12} aria-hidden="true" /> New playbook</button>
        </div>
      </div>

      <div className="s3-body">
        <div className="pb-stack">
          {PLAYBOOKS.map(pb => (
            <div key={pb.title} className="pb-card">

              {/* Header */}
              <div className="pb-card-header">
                <div className="pb-card-title-group">
                  <div className="pb-card-title">{pb.title}</div>
                  <div className="pb-card-meta">{pb.meta}</div>
                </div>
                <div className="pb-card-header-right">
                  <div className="pb-stats-inline">
                    {pb.stats.map(s => (
                      <div key={s.label} className="pb-stat-inline">
                        <span className="pb-stat-val">{s.val}</span>
                        <span className="pb-stat-label">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <span className={`standard-badge ${pb.badgeCls}`}>{pb.badge}</span>
                </div>
              </div>

              {/* Rules grid */}
              <div className="pb-rules-grid">
                {pb.rules.map(r => (
                  <div key={r.label} className="pb-rule">
                    <div className="pb-rule-icon">
                      <r.icon size={15} />
                    </div>
                    <div>
                      <div className="pb-rule-label">{r.label}</div>
                      <div className="pb-rule-desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pb-card-footer">
                <button className="btn btn-secondary btn-sm"><FileText size={12} /> View rules</button>
                <button className="btn btn-outline btn-sm">Edit</button>
              </div>

            </div>
          ))}
        </div>
      </div>
      </main>
    </div>
  )
}
