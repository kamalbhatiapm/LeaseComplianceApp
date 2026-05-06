import { BookOpen, Scale, FileText, Plus } from 'lucide-react'
import Nav from '../components/Nav.jsx'

const PLAYBOOKS = [
  {
    title: 'IFRS 16 Standard Template',
    meta: 'Version 2.4 · Updated Mar 2026',
    badge: 'IFRS 16',
    badgeCls: 'badge-ifrs',
    stats: [{ val: 9, label: 'Required fields' }, { val: 14, label: 'Risk rules' }, { val: 3, label: 'Contract types' }],
    rules: [
      { label: 'Lease term',        desc: 'Commencement date, expiry date, non-cancellable period' },
      { label: 'Payment schedule',  desc: 'Annual base rent, escalation rate, payment frequency' },
      { label: 'Discount rate',     desc: 'IBR or stated rate; flags if absent' },
      { label: 'Renewal options',   desc: 'Number, duration, reasonably certain assessment' },
      { label: 'ROU asset scope',   desc: 'Premises description, sq ft, floor reference' },
    ],
  },
  {
    title: 'ASC 842 Standard Template',
    meta: 'Version 1.8 · Updated Feb 2026',
    badge: 'ASC 842',
    badgeCls: 'badge-asc',
    stats: [{ val: 11, label: 'Required fields' }, { val: 12, label: 'Risk rules' }, { val: 4, label: 'Contract types' }],
    rules: [
      { label: 'Lease classification',  desc: 'Finance vs. operating lease test (5 criteria)' },
      { label: 'Lease term',            desc: 'Commencement, end date, extension options' },
      { label: 'Lease payments',        desc: 'Fixed, variable, in-substance fixed payments' },
      { label: 'Incremental borrow rate', desc: 'Required for operating leases; collateral-adjusted' },
      { label: 'Variable lease costs',  desc: 'Index-linked escalations, usage-based charges' },
    ],
  },
  {
    title: 'NDA / Confidentiality Agreement',
    meta: 'Version 1.1 · Updated Jan 2026',
    badge: 'Contract',
    badgeCls: 'badge-ifrs',
    stats: [{ val: 6, label: 'Required fields' }, { val: 8, label: 'Risk rules' }, { val: 2, label: 'Subtypes' }],
    rules: [
      { label: 'Parties',              desc: 'Disclosing and receiving party identification' },
      { label: 'Confidential info',    desc: 'Definition scope, carve-outs, exclusions' },
      { label: 'Term',                 desc: 'Duration, survival clauses post-expiry' },
      { label: 'Governing law',        desc: 'Jurisdiction, dispute resolution mechanism' },
      { label: 'Permitted disclosure', desc: 'Affiliates, legal advisors, required disclosures' },
    ],
  },
]

export default function Playbooks({ navLocked, theme, toggleTheme }) {
  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
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
        <div className="s3-grid">
          {PLAYBOOKS.map(pb => (
            <div key={pb.title} className="playbook-card">
              <div className="playbook-card-header">
                <div>
                  <div className="playbook-title">{pb.title}</div>
                  <div className="playbook-meta">{pb.meta}</div>
                </div>
                <span className={`standard-badge ${pb.badgeCls}`}>{pb.badge}</span>
              </div>
              <div className="playbook-card-body">
                <div className="playbook-rules">
                  {pb.rules.map(r => (
                    <div key={r.label} className="playbook-rule">
                      <div className="rule-icon"><Scale size={11} color="var(--brand)" /></div>
                      <div>
                        <div className="rule-label">{r.label}</div>
                        <div className="rule-desc">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="playbook-stats">
                {pb.stats.map(s => (
                  <div key={s.label}>
                    <div className="playbook-stat-val">{s.val}</div>
                    <div className="playbook-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="playbook-card-footer">
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
