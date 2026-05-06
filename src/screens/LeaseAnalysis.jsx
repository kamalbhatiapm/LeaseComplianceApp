import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Pencil, Check, Download, Mail, RefreshCw,
  Paperclip, AlertTriangle, CircleAlert, FlaskConical, CircleCheck,
  FileText, Loader, ScanText, Brain, ShieldCheck,
} from 'lucide-react'
import Nav from '../components/Nav.jsx'
import { MOCK_ANALYSIS, FIELD_LABELS } from '../utils/constants.js'
import { track } from '../utils/track.js'

const QUIPS = [
  "Translating 'hereinafter referred to as' into English…",
  "Finding the clause lawyers buried on page 47…",
  "Making sure the landlord can't see this…",
  "Checking if 'reasonable certainty' is certain enough…",
  "Summoning the incremental borrowing rate…",
  "Computing present value of future headaches…",
  "Converting legalese to something a human would say…",
  "Negotiating with sub-agents… one is asking for a raise.",
  "Consulting 3 agents and 1 overconfident opinion.",
  "Loading… the AI insists it's almost done.",
]

const LOADING_STEPS = [
  { icon: FileText, label: 'Reading contract structure' },
  { icon: ScanText, label: 'Extracting IFRS 16 fields'  },
  { icon: Brain,    label: 'Scoring risk factors'        },
  { icon: Sparkles, label: 'Running AI workflow'         },
]

function AnalysisLoader({ file, progress }) {
  const { step, pct, label, error } = progress
  const [quipIdx, setQuipIdx] = useState(() => Math.floor(Math.random() * QUIPS.length))
  const [fade, setFade]       = useState(true)

  useEffect(() => {
    const tick = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setQuipIdx(i => (i + 1) % QUIPS.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className="analysis-loading">
      <div className="analysis-loading-card">
        <div className="analysis-loading-icon-wrap">
          <div className="analysis-loading-pulse" />
          <Sparkles size={28} color="var(--brand)" style={{ position: 'relative', zIndex: 1 }} />
        </div>

        <div className="analysis-loading-title">Analyzing your contract</div>
        {file && (
          <div className="analysis-loading-file">
            <FileText size={12} />
            {file.name}
          </div>
        )}

        <div className="analysis-loading-steps">
          {LOADING_STEPS.map(({ icon: Icon, label: name }, i) => {
            const n       = i + 1
            const isDone  = n < step || (n === step && pct === 100 && !error)
            const isActive= n === step && pct < 100
            const isErr   = n === step && error
            return (
              <div key={name} className={`al-step ${isDone ? 'done' : isActive ? 'active' : isErr ? 'error' : ''}`}>
                <span className="al-step-icon">
                  {isDone  ? <Check   size={13} /> :
                   isActive ? <Loader  size={13} className="spin" /> :
                   isErr   ? <CircleAlert size={13} /> :
                   <Icon size={13} />}
                </span>
                <span>{name}</span>
              </div>
            )
          })}
        </div>

        <div className="al-quip" style={{ opacity: fade ? 1 : 0 }}>
          {QUIPS[quipIdx]}
        </div>

        <div
          className="al-progress-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Analysis progress"
        >
          <div className="al-progress-fill" style={{ width: `${pct}%`, background: error ? 'var(--red)' : 'var(--brand)' }} />
        </div>
        <div className="al-progress-meta">
          <span>{label || 'Starting…'}</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

function getRiskMeta(score) {
  if (score < 50) return { level: 'Low',    color: 'var(--green)', pillCls: 'pill-green', pct: score }
  if (score < 70) return { level: 'Medium', color: 'var(--amber)', pillCls: 'pill-amber', pct: score }
  return               { level: 'High',   color: 'var(--red)',   pillCls: 'pill-red',   pct: score }
}

function MetricGrid({ fields, data }) {
  const get = key => { const f = fields[key]; return f ? (typeof f === 'object' ? f.value : f) : null }
  const expiry = get('expiry_date')
  let remaining = '—', expirySub = ''
  if (expiry) {
    const d = new Date(expiry)
    const yrs = (d - Date.now()) / (1000 * 60 * 60 * 24 * 365.25)
    if (!isNaN(yrs) && yrs > 0) remaining = `≈${yrs.toFixed(1)} yrs`
    expirySub = `Expires ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  const discountRaw = get('discount_rate')
  const rouRaw      = get('rou_asset_value') ?? data.rou_asset_value
  const liabRaw     = get('lease_liability')  ?? data.lease_liability
  const fmt = v => {
    const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.]/g, '')) : Number(v)
    return isNaN(n) ? String(v) : `$${n.toLocaleString()}`
  }
  const cards = [
    { label: 'ROU Asset Value',  val: rouRaw  ? fmt(rouRaw)  : '$2.18M', sub: 'Right-of-use asset',            flagged: !rouRaw },
    { label: 'Lease Liability',  val: liabRaw ? fmt(liabRaw) : '$1.94M', sub: 'Present value',                 flagged: false },
    { label: 'Discount Rate',    val: discountRaw,                         sub: discountRaw ? 'IBR applied' : 'Manual input required', flagged: !discountRaw },
    { label: 'Remaining Term',   val: remaining,                           sub: expirySub || 'Expires Dec 31, 2028', flagged: false },
  ]
  return (
    <div className="metric-grid">
      {cards.map(c => (
        <div key={c.label} className={`metric-card${c.flagged ? ' flagged' : ''}`}>
          <div className="metric-label">{c.label}</div>
          <div className="metric-val">
            {c.flagged && !c.val ? <><CircleAlert size={14} /> Missing</> : (c.val ?? 'N/A')}
          </div>
          <div className="metric-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

function TermsGrid({ fields, termsMissing = [] }) {
  const [editMode, setEditMode]     = useState(false)
  const [edits, setEdits]           = useState({})

  const rows = Object.entries(fields).map(([key, raw]) => {
    const f       = typeof raw === 'object' && raw !== null ? raw : { value: raw }
    const missing = f.value === null || f.value === undefined || f.value === ''
    const conf    = f.confidence ?? (missing ? 0 : 1)
    const confCls = missing ? 'conf-low' : conf >= 0.85 ? 'conf-high' : 'conf-med'
    const label   = FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const clause  = f.source_clause ?? ''
    const edited  = edits[key]

    return { key, missing, confCls, label, clause, value: f.value, edited }
  })

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider, rgba(255,255,255,.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="card-title" style={{ margin: 0 }}>Extracted Lease Terms</div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setEditMode(m => !m)}
          style={editMode ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--t4)', borderColor: 'rgba(255,255,255,.18)' }}
        >
          {editMode ? <><Check size={12} /> Save edits</> : <><Pencil size={12} /> Edit terms</>}
        </button>
      </div>
      {rows.map(({ key, missing, confCls, label, clause, value, edited }) => (
        <div key={key} className={`term-row${missing ? ' term-missing' : ''}`}>
          <div className="term-label">
            <span className={`confidence-dot ${confCls}`} />
            {label}
          </div>
          <div className="term-val" style={missing ? { color: 'var(--amber)' } : {}}>
            {editMode ? (
              <input
                className="term-val-edit"
                defaultValue={edited ?? (missing ? '' : value)}
                onChange={e => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
              />
            ) : edited ? (
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{edited}<span className="manually-verified-badge">Edited</span></span>
            ) : missing ? 'Not found in contract' : value}
          </div>
          {clause ? (
            <div className="term-clause" style={missing ? { color: 'var(--amber)' } : {}}>
              {missing ? <AlertTriangle size={12} /> : <Paperclip size={12} />}
              {clause}
            </div>
          ) : <div />}
        </div>
      ))}
    </div>
  )
}

function RiskFlags({ flags, onGateChange }) {
  const [signoffs, setSignoffs] = useState({})
  const toggle = id => {
    const next = { ...signoffs, [id]: !signoffs[id] }
    setSignoffs(next)
    onGateChange(next)
    track('flag_resolved', { flag_id: id, resolved: next[id] })
  }

  return (
    <>
      <div className="card-title" style={{ marginBottom: '12px', marginTop: '8px' }}>Risk Flags</div>
      <div className="risk-list">
        {flags.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--t4)', padding: '12px 0' }}>No risk flags detected.</p>
        )}
        {flags.map(flag => {
          const sev      = flag.severity ?? 'low'
          const pillCls  = sev === 'high' ? 'pill-red' : sev === 'medium' ? 'pill-amber' : 'pill-green'
          const pillLbl  = sev.charAt(0).toUpperCase() + sev.slice(1)
          const isHigh   = sev === 'high'
          const ref      = flag.ifrs16_ref ?? ''
          return (
            <div key={flag.id} className={`risk-item ${sev}`} id={`flag-${flag.id}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="risk-title">{flag.title}</div>
                  <div className="risk-desc">{flag.description}</div>
                </div>
                <span className={`pill ${pillCls} risk-sev-pill`}>{pillLbl}</span>
              </div>
              {flag.id === 'missing_discount_rate' && (
                <div style={{ fontSize: '11px', color: 'var(--t4)', marginTop: '6px', lineHeight: 1.5 }}>
                  To obtain your IBR, contact your treasury team or request a rate from your primary lender for a comparable term and collateral profile.
                </div>
              )}
              <div className="risk-meta">
                <button className="btn btn-sm btn-outline">
                  {isHigh ? 'Enter IBR manually' : 'Add management note'}
                </button>
                {ref && <span style={{ fontSize: '11px', color: 'var(--t3)' }}>IFRS 16 {ref}</span>}
              </div>
              {isHigh && (
                <div className="sign-off-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!signoffs[flag.id]}
                      onChange={() => toggle(flag.id)}
                    />
                    I acknowledge this risk and confirm resolution before report generation
                  </label>
                  <input type="text" placeholder="Reviewer name" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default function LeaseAnalysis({ selectedFile, analysisData, isLiveData, navLocked, isAnalyzing, progress, theme, toggleTheme }) {
  if (isAnalyzing) {
    return (
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
        <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
        <AnalysisLoader file={selectedFile} progress={progress} />
      </div>
    )
  }
  const navigate  = useNavigate()
  const data      = analysisData ?? MOCK_ANALYSIS
  const isDemo    = !analysisData

  const riskScore    = data.risk_score ?? 62
  const fields       = data.fields ?? {}
  const riskFlags    = data.risk_flags ?? []
  const termsFound   = data.terms_found ?? Object.keys(fields).filter(k => fields[k]?.value)
  const termsMissing = data.terms_missing ?? Object.keys(fields).filter(k => !fields[k]?.value)
  const summary      = data.summary ?? data.ai_summary ?? null
  const analyzedAt   = data.analyzed_at ?? new Date().toISOString()
  const filename     = selectedFile ? selectedFile.name.replace(/\.[^.]+$/, '') : (data.contract_type ?? 'Contract')

  const { level, color, pillCls, pct } = getRiskMeta(riskScore)
  const totalFields = termsFound.length + termsMissing.length || 9
  const dtStr = new Date(analyzedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

  const [gateOpen, setGateOpen] = useState(false)
  const highFlags = riskFlags.filter(f => f.severity === 'high')

  const onGateChange = signoffs => {
    const allSigned = highFlags.every(f => signoffs[f.id])
    setGateOpen(highFlags.length === 0 || allSigned)
  }

  const badgeCls  = isDemo ? 's2-data-badge--demo' : isLiveData ? 's2-data-badge--live' : 's2-data-badge--fallback'
  const badgeIcon = isDemo ? <FlaskConical size={12} /> : isLiveData ? <CircleCheck size={12} /> : <CircleAlert size={12} />
  const badgeTxt  = isDemo ? 'Demo data' : isLiveData ? 'Live extraction' : 'Demo fallback'

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">

      {/* Sub-header */}
      <div className="s2-subheader">
        <div className="breadcrumb">
          <a onClick={() => navigate('/')}>Leases</a>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{filename}</span>
        </div>
        <div className="s2-subheader-actions">
          <span className={`s2-data-badge ${badgeCls}`} title={isDemo ? 'Showing placeholder data' : isLiveData ? 'Live AI extraction' : 'Demo fallback'}>
            {badgeIcon} {badgeTxt}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--t4)' }}>Last analyzed: {dtStr}</span>
          <button className="btn btn-outline btn-sm">Re-analyze</button>
          <button className="btn btn-outline btn-sm" onClick={() => track('report_exported', { format: 'pdf', type: 'extraction' })}>
            <Download size={12} aria-hidden="true" /> Export PDF
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!gateOpen}
            title={gateOpen ? 'Generate IFRS 16 report' : 'Resolve all high-severity flags first'}
            onClick={() => track('report_exported', { format: 'pdf', type: 'ifrs16_compliance' })}
          >
            Generate IFRS 16 Report
          </button>
        </div>
      </div>

      <div className="s2-layout">
        {/* Main */}
        <div className="s2-main">

          {/* Score header */}
          <div className="score-header">
            <div className="score-header-left">
              <div
                className="score-ring"
                style={{ background: `conic-gradient(${color} 0% ${pct}%, var(--border) ${pct}% 100%)` }}
              >
                <div className="score-ring-val" style={{ color }}>{riskScore}</div>
              </div>
              <div className="score-level" style={{ color }}>{level} Risk</div>
              <div className="score-hint" title="0–49 Low · 50–69 Medium · 70–100 High">Lower is better</div>
            </div>
            <div className="score-header-divider" />
            <div className="score-header-right">
              <div className="score-header-meta">
                <div className="score-title">{filename}</div>
                <div className="score-sub">
                  {[data.contract_type, 'IFRS 16', new Date(analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })].filter(Boolean).join(' · ')}
                </div>
                <div className="score-pills">
                  <span className={`pill ${pillCls}`}>{level} Risk</span>
                  <span className="pill pill-green">{termsFound.length} of {totalFields} fields extracted</span>
                  <span className="pill pill-brand">IFRS 16 fields extracted</span>
                  {riskFlags.length > 0 && <span className="pill pill-gray">{riskFlags.length} flag{riskFlags.length !== 1 ? 's' : ''} to review</span>}
                </div>
              </div>
              <MetricGrid fields={fields} data={data} />
            </div>
          </div>

          {/* AI Summary */}
          {summary && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title"><Sparkles size={14} /> AI Summary</div>
              <div className="summary-text" dangerouslySetInnerHTML={{ __html: summary }} />
            </div>
          )}

          {/* Terms */}
          <TermsGrid fields={fields} termsMissing={termsMissing} />

          {/* Risk flags */}
          <RiskFlags flags={riskFlags} onGateChange={onGateChange} />
        </div>

        {/* Sidebar */}
        <div className="s2-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Actions</div>
            <div className="action-list">
              <button className="action-btn" aria-label="Export report to PDF"><Download size={14} aria-hidden="true" /> Export to PDF</button>
              <button className="action-btn" aria-label="Send report to auditor"><Mail size={14} aria-hidden="true" /> Send to auditor</button>
              <button className="action-btn" aria-label="Re-run lease extraction"><RefreshCw size={14} aria-hidden="true" /> Re-run extraction</button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Clause Audit Trail</div>
            {[
              { clause: '§ 2.1 — Lease Commencement', field: 'Commencement date · Lease term' },
              { clause: '§ 3.2 — Renewal Rights',      field: 'Renewal options' },
              { clause: '§ 5.1 — Base Rent',            field: 'Annual payment' },
              { clause: '§ 5.3 — Rent Adjustments',     field: 'Escalation rate' },
              { clause: '§ 6.1 — Security Deposit',     field: 'Security deposit amount' },
              { clause: '§ 14.1 — Early Termination',   field: 'Termination rights' },
            ].map(a => (
              <div key={a.clause} className="audit-trail-item">
                <div className="audit-clause">{a.clause}</div>
                <div className="audit-field">→ {a.field}</div>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">IFRS 16 Field Coverage</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Lease term',        ok: true },
                { label: 'Payment schedule',  ok: true },
                { label: 'Renewal options',   ok: true },
                { label: 'Discount rate',     ok: false },
                { label: 'ROU asset value',   ok: true },
                { label: 'Commencement date', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--t2)' }}>{label}</span>
                  <span className={`pill pill-sm ${ok ? 'pill-green' : 'pill-red'}`}>{ok ? '✓' : 'Missing'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Applied Playbook</div>
            <div style={{ background: 'var(--brand-lt)', border: '1px solid rgba(0,113,227,.2)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)', marginBottom: '4px' }}>IFRS 16 Standard Template</div>
              <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Version 2.4 · 9 required fields · 14 risk rules</div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
