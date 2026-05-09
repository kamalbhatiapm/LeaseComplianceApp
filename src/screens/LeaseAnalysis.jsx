import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Pencil, Check, FileDown, Send, RefreshCw,
  Paperclip, AlertTriangle, CircleAlert, FlaskConical, CircleCheck,
  FileText, Loader, ScanText, Brain, ShieldCheck, Lock, X, ExternalLink,
} from 'lucide-react'
import Nav from '../components/Nav.jsx'
import { MOCK_ANALYSIS, FIELD_LABELS, FIELD_HINTS, getExtractionQuality } from '../utils/constants.js'
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
  "I'm like Linux. First I confuse you, then you can't live without me.",
  "Lease term: 5 years. Time spent reading it: also 5 years.",
  "The landlord's lawyer used 'forthwith' 11 times. We counted.",
  "Extracting the important bits so you don't have to fake-read 47 pages.",
]

const LOADING_STEPS = [
  { icon: FileText, label: 'Identifying lease type and parties'                   },
  { icon: ScanText, label: 'Finding commencement date, rent schedule, and renewals' },
  { icon: Brain,    label: 'Scoring risk against IFRS 16 §§ 19, 26, B34'          },
  { icon: Sparkles, label: 'Generating your audit-ready report'                   },
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

        <div className="al-quip" style={{ opacity: fade ? 1 : 0 }}>
          {QUIPS[quipIdx]}
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

function ClauseDrawer({ clause, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!clause) return null

  const confLabel = clause.conf >= 0.85 ? 'High confidence' : clause.conf > 0 ? 'Verify recommended' : 'Not found'
  const confCls   = clause.conf >= 0.85 ? 'conf-high' : clause.conf > 0 ? 'conf-med' : 'conf-low'

  return (
    <>
      <div className="clause-drawer-backdrop" onClick={onClose} />
      <div className="clause-drawer" role="dialog" aria-label={`Clause detail: ${clause.ref}`}>
        <div className="clause-drawer-header">
          <div className="clause-drawer-title">
            <Paperclip size={14} />
            {clause.ref}
          </div>
          <button className="clause-drawer-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="clause-drawer-body">
          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Field</div>
            <div className="clause-drawer-value">{clause.fieldLabel}</div>
          </div>

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Extracted Value</div>
            <div className="clause-drawer-value" style={{ color: clause.missing ? 'var(--amber)' : 'inherit' }}>
              {clause.missing ? 'Not found in contract' : clause.value}
            </div>
          </div>

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">AI Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className={`confidence-dot ${confCls}`} />
              <span className="clause-drawer-value">{confLabel}</span>
              {clause.conf > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--t3)' }}>({Math.round(clause.conf * 100)}%)</span>
              )}
            </div>
          </div>

          <div className="clause-drawer-divider" />

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Clause Reference</div>
            <div className="clause-drawer-clause-box">
              <span>{clause.ref}</span>
              <ExternalLink size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
            </div>
            <div className="clause-drawer-note">
              This clause was identified by the AI as the source for the extracted value.
              Open the contract PDF to verify the full clause text.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function TermsGrid({ fields, termsMissing = [] }) {
  const [editMode, setEditMode]       = useState(false)
  const [edits, setEdits]             = useState({})
  const [saveConfirm, setSaveConfirm] = useState(false)
  const [activeClause, setActiveClause] = useState(null)

  const rows = Object.entries(fields).map(([key, raw]) => {
    const f       = typeof raw === 'object' && raw !== null ? raw : { value: raw }
    const missing = f.value === null || f.value === undefined || f.value === ''
    const conf    = f.confidence ?? (missing ? 0 : 1)
    const confCls = missing ? 'conf-low' : conf >= 0.85 ? 'conf-high' : 'conf-med'
    const uncertain = !missing && conf > 0 && conf < 0.85
    const label   = FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const clause  = f.source_clause ?? ''
    const edited  = edits[key]

    return { key, missing, confCls, uncertain, label, clause, value: f.value, edited, conf, rawField: f }
  })

  const handleSave = () => {
    Object.entries(edits).forEach(([key, corrected_value]) => {
      const f = fields[key]
      const original_value = typeof f === 'object' && f !== null ? f.value : f
      if (corrected_value !== original_value) {
        track('field_edited', {
          key,
          original_value: original_value ?? null,
          corrected_value,
          confidence: (typeof f === 'object' && f !== null ? f.confidence : null) ?? 0,
          source_clause: (typeof f === 'object' && f !== null ? f.source_clause : null) ?? '',
        })
      }
    })
    setEditMode(false)
    if (Object.keys(edits).length > 0) {
      setSaveConfirm(true)
      setTimeout(() => setSaveConfirm(false), 3000)
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider, rgba(255,255,255,.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="card-title" style={{ margin: 0 }}>Extracted Lease Terms</div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          style={editMode ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--t4)', borderColor: 'rgba(255,255,255,.18)' }}
        >
          {editMode ? <><Check size={12} /> Save edits</> : <><Pencil size={12} /> Edit terms</>}
        </button>
      </div>
      <div style={{ padding: '8px 18px 6px', borderBottom: '1px solid var(--divider, rgba(255,255,255,.06))', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>Confidence:</span>
        {[
          { cls: 'conf-high', label: 'High confidence' },
          { cls: 'conf-med',  label: 'Verify recommended' },
          { cls: 'conf-low',  label: 'Not found' },
        ].map(({ cls, label }) => (
          <span key={cls} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--t3)' }}>
            <span className={`confidence-dot ${cls}`} style={{ flexShrink: 0 }} />{label}
          </span>
        ))}
      </div>
      <div className="term-col-headers">
        <span>Field</span>
        <span>Extracted Value</span>
        <span>Source Clause</span>
      </div>
      {rows.map(({ key, missing, confCls, uncertain, conf, label, clause, value, edited }) => (
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
            ) : missing ? (
              <span style={{ fontSize: '12px', color: 'var(--amber)', lineHeight: 1.5 }}>
                {FIELD_HINTS[key] ?? 'Not found — please verify manually'}
              </span>
            ) : value}
            {uncertain && !editMode && (
              <div className="conf-chip">
                AI uncertain — verify against {clause || 'source contract'}
              </div>
            )}
          </div>
          {clause ? (
            <button
              className="term-clause term-clause-link"
              style={missing ? { color: 'var(--amber)' } : {}}
              onClick={() => setActiveClause({ ref: clause, fieldLabel: label, value: edited ?? value, conf, missing })}
            >
              {missing ? <AlertTriangle size={12} /> : <Paperclip size={12} />}
              {clause}
            </button>
          ) : <div />}
        </div>
      ))}
      {saveConfirm && (
        <div style={{ padding: '10px 18px', fontSize: '12px', color: 'var(--green)', borderTop: '1px solid var(--divider, rgba(255,255,255,.06))' }}>
          <CircleCheck size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Correction saved — helps improve future extractions.
        </div>
      )}
      <ClauseDrawer clause={activeClause} onClose={() => setActiveClause(null)} />
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

const STANDARD_META = {
  ifrs16_compliance: { label: 'IFRS 16', short: 'IFRS 16', other: 'ASC 842', otherValue: 'asc842_compliance' },
  asc842_compliance: { label: 'ASC 842', short: 'ASC 842', other: 'IFRS 16', otherValue: 'ifrs16_compliance' },
}

export default function LeaseAnalysis({ selectedFile, analysisData, isLiveData, navLocked, isAnalyzing, progress, theme, toggleTheme, analysisIntent, setAnalysisIntent, handleReanalyzeAs }) {
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

  const exportLocked = highFlags.length > 0 && !gateOpen
  const lockTitle = `Resolve ${highFlags.length} high-risk flag${highFlags.length !== 1 ? 's' : ''} to unlock`

  const stdMeta   = STANDARD_META[analysisIntent] ?? STANDARD_META.ifrs16_compliance
  const badgeCls  = isDemo ? 's2-data-badge--demo' : isLiveData ? 's2-data-badge--live' : 's2-data-badge--fallback'
  const badgeIcon = isDemo ? <FlaskConical size={12} /> : isLiveData ? <CircleCheck size={12} /> : <CircleAlert size={12} />
  const badgeTxt  = isDemo ? 'Demo data' : isLiveData ? 'Live extraction' : 'Live extraction failed — showing sample data'

  const switchStandard = () => {
    if (!selectedFile) return
    handleReanalyzeAs(stdMeta.otherValue)
  }

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">

      {/* Sub-header */}
      <div className="s2-subheader">
        <div className="s2-subheader-left">
          <div className="breadcrumb">
            <a onClick={() => navigate('/')}>Leases</a>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{filename}</span>
          </div>
          <div className="s2-subheader-meta">
            <span className={`s2-data-badge ${badgeCls}`} title={isDemo ? 'Showing placeholder data' : isLiveData ? 'Live AI extraction' : 'Live extraction failed'}>
              {badgeIcon} {badgeTxt}
              {!isDemo && !isLiveData && (
                <button
                  className="btn btn-sm btn-outline"
                  style={{ marginLeft: '8px', padding: '1px 8px', fontSize: '11px' }}
                  onClick={() => handleReanalyzeAs(analysisIntent)}
                >
                  Retry
                </button>
              )}
            </span>
            <span className="s2-standard-badge"><ShieldCheck size={11} /> {stdMeta.label}</span>
            <span className="s2-subheader-ts">Analyzed {dtStr}</span>
          </div>
        </div>
        <div className="s2-subheader-actions">
          <button className="btn btn-outline btn-sm" onClick={() => track('reanalyze')}>
            <RefreshCw size={12} /> Re-analyze
          </button>
          <span className={exportLocked ? 'btn-tooltip-wrap' : ''} data-tip={exportLocked ? lockTitle : undefined}>
            <button
              className="btn btn-outline btn-sm"
              disabled={exportLocked}
              onClick={() => !exportLocked && track('report_exported', { format: 'pdf', type: 'extraction' })}
            >
              {exportLocked ? <Lock size={12} /> : <FileDown size={12} />} Export PDF
            </button>
          </span>
          {selectedFile && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={switchStandard}
              title={`Re-run this contract under ${stdMeta.other}`}
            >
              Run as {stdMeta.other}
            </button>
          )}
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
                  {[data.contract_type, stdMeta.label, new Date(analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })].filter(Boolean).join(' · ')}
                </div>
                <div className="score-pills">
                  <span className={`pill ${pillCls}`}>{level} Risk</span>
                  <span className="pill pill-green">{termsFound.length} of {totalFields} fields extracted</span>
                  <span className="pill pill-brand">{stdMeta.label} compliant</span>
                  {riskFlags.length > 0 && <span className="pill pill-gray">{riskFlags.length} flag{riskFlags.length !== 1 ? 's' : ''} to review</span>}
                </div>
                {(() => {
                  const eq = getExtractionQuality(termsFound.length, totalFields, fields)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--t3)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: eq.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: eq.color, fontWeight: 600 }}>{eq.level}</span>
                      <span style={{ color: 'var(--t3)' }}>extraction · {eq.detail.split(' — ')[1]}</span>
                    </div>
                  )
                })()}
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

          {/* Completion banner */}
          {gateOpen && highFlags.length > 0 && (
            <div className="completion-banner">
              <CircleCheck size={16} />
              <span>All risks acknowledged — report is ready to export.</span>
              <button className="btn btn-sm btn-primary" onClick={() => track('report_exported', { format: 'pdf', type: 'banner' })}>
                <FileDown size={12} /> Export PDF
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => track('report_sent', { method: 'email', source: 'banner' })}>
                <Send size={12} /> Send to auditor
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="s2-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Actions</div>
            <div className="action-list">
              <span className={exportLocked ? 'btn-tooltip-wrap btn-tooltip-wrap--full' : ''} data-tip={exportLocked ? lockTitle : undefined}>
                <button
                  className="action-btn"
                  aria-label="Export report to PDF"
                  disabled={exportLocked}
                  onClick={() => !exportLocked && track('report_exported', { format: 'pdf', type: 'sidebar' })}
                >
                  {exportLocked ? <Lock size={14} aria-hidden="true" /> : <FileDown size={14} aria-hidden="true" />} Export to PDF
                </button>
              </span>
              <span className={exportLocked ? 'btn-tooltip-wrap btn-tooltip-wrap--full' : ''} data-tip={exportLocked ? lockTitle : undefined}>
                <button
                  className="action-btn"
                  aria-label="Send report to auditor"
                  disabled={exportLocked}
                  onClick={() => !exportLocked && track('report_sent', { method: 'email' })}
                >
                  {exportLocked ? <Lock size={14} aria-hidden="true" /> : <Send size={14} aria-hidden="true" />} Send to auditor
                </button>
              </span>
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
            <div className="sidebar-section-title">{stdMeta.label} Field Coverage</div>
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
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)', marginBottom: '4px' }}>{stdMeta.label} Standard Template</div>
              <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Version 2.4 · 9 required fields · 14 risk rules</div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
