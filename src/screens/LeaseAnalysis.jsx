import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
  Sparkles, Pencil, Check, FileDown, Send, RefreshCw,
  AlertTriangle, CircleAlert, FlaskConical, CircleCheck,
  FileText, Loader, ScanText, Brain, ShieldCheck, Lock, X, ExternalLink,
  ThumbsUp, ThumbsDown,
} from 'lucide-react'
import Nav from '../components/AppNav.jsx'
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

function MetricGrid({ fields, data, edits = {} }) {
  const get = key => edits[key] ?? (fields[key] ? (typeof fields[key] === 'object' ? fields[key].value : fields[key]) : null)

  // Lease Duration — computed from start/end dates
  const start = get('commencement_date')
  const expiry = get('expiry_date')
  let duration = '—', durationSub = ''
  if (start && expiry) {
    const ms = new Date(expiry) - new Date(start)
    if (!isNaN(ms) && ms > 0) {
      const totalMonths = Math.round(ms / (1000 * 60 * 60 * 24 * 30.4375))
      const yrs = Math.floor(totalMonths / 12)
      const mos = totalMonths % 12
      duration = mos === 0 ? `${yrs} yr${yrs !== 1 ? 's' : ''}` : `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo`
      durationSub = `${new Date(start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${new Date(expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    }
  }

  // Remaining term
  let remaining = '—', expirySub = ''
  if (expiry) {
    const d = new Date(expiry)
    const yrs = (d - Date.now()) / (1000 * 60 * 60 * 24 * 365.25)
    if (!isNaN(yrs) && yrs > 0) remaining = `≈${yrs.toFixed(1)} yrs`
    expirySub = `Expires ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const annualRentRaw = get('annual_payment') ?? get('annual_payment_usd')
  const discountRaw   = get('discount_rate')
  const rentPeriod    = /month|\/mo|p\.m\./i.test(annualRentRaw ?? '') ? 'Per month' : 'Per annum'

  // Extract just the dollar/numeric amount from verbose rent strings
  const extractAmount = raw => {
    if (!raw) return null
    // Match patterns like "$29,000", "AUD 15,000", "£12,500", "€10,000 per month" etc.
    const m = String(raw).match(/([A-Z]{0,3}\s*[$£€]?\s*[\d,]+(?:\.\d+)?(?:\s*(?:per month|\/mo|p\.m\.|per annum|\/yr|p\.a\.))?)/i)
    return m ? m[1].trim() : String(raw).slice(0, 20)
  }
  const annualRent = extractAmount(annualRentRaw)

  const cards = [
    { label: 'Lease Duration',  val: duration,    sub: durationSub || 'Enter expiry date via Edit terms ↓',   flagged: duration === '—' },
    { label: 'Annual Base Rent',val: annualRent,   sub: annualRent ? rentPeriod : 'Not extracted',             flagged: !annualRent },
    { label: 'Remaining Term',  val: remaining,    sub: expirySub || 'Enter expiry date via Edit terms ↓',     flagged: remaining === '—' },
    { label: 'Borrowing Rate',  val: discountRaw,  sub: discountRaw ? '' : 'Manual input required', flagged: !discountRaw },
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

  const confLabel = clause.conf >= 0.85 && !clause.missing ? 'Verified' : 'Needs Review'
  const confCls   = clause.conf >= 0.85 && !clause.missing ? 'conf-high' : 'conf-med'

  return (
    <>
      <div className="clause-drawer-backdrop" onClick={onClose} />
      <div className="clause-drawer" role="dialog" aria-label={`Clause detail: ${clause.ref}`}>
        <div className="clause-drawer-header">
          <div className="clause-drawer-title">
            <span className="clause-word-label">Clause</span>
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
            <div className="clause-drawer-value" style={clause.missing ? { color: 'var(--amber)' } : {}}>
              {clause.missing ? 'Not found in contract' : clause.value}
            </div>
          </div>

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className={`confidence-dot ${confCls}`} />
              <span className="clause-drawer-value">{confLabel}</span>
            </div>
          </div>

          <div className="clause-drawer-divider" />

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Clause Reference</div>
            <div className="clause-drawer-clause-box">
              <span>{clause.ref}</span>
              <ExternalLink size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
            </div>
          </div>

          <div className="clause-drawer-section">
            <div className="clause-drawer-label">Source Text</div>
            {clause.clauseText ? (
              <blockquote className="clause-drawer-quote">{clause.clauseText}</blockquote>
            ) : (
              <div className="clause-drawer-note">
                Clause text not available — open the contract PDF and refer to {clause.ref}.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function TermsGrid({ fields, termsMissing = [], edits, setEdits, analysisRowId, onSaveEdits }) {
  const [editMode, setEditMode]         = useState(false)
  const [saveConfirm, setSaveConfirm]   = useState(false)
  const [activeClause, setActiveClause] = useState(null)
  const [fieldFeedback, setFieldFeedback] = useState({}) // { [key]: 'up' | 'down' }

  const submitFieldFeedback = (key, verdict, row) => {
    if (fieldFeedback[key]) return
    setFieldFeedback(prev => ({ ...prev, [key]: verdict }))
    track('field_feedback', {
      key,
      verdict,
      value: row.edited ?? row.value ?? null,
      confidence: row.conf,
      source_clause: row.clause,
    })
    if (verdict === 'down') setEditMode(true)
  }

  const rows = Object.entries(fields).map(([key, raw]) => {
    const f       = typeof raw === 'object' && raw !== null ? raw : { value: raw }
    const missing = f.value === null || f.value === undefined || f.value === ''
    const conf    = f.confidence ?? (missing ? 0 : 1)
    const confCls = !missing && conf >= 0.85 ? 'conf-high' : 'conf-med'
    const uncertain = !missing && conf > 0 && conf < 0.85
    const label   = FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const clause      = f.source_clause ?? ''
    const clauseText  = f.clause_text ?? null
    const edited      = edits[key]

    return { key, missing, confCls, uncertain, label, clause, clauseText, value: f.value, edited, conf, rawField: f }
  })

  // Compute lease duration from commencement + expiry dates if both present
  const computedDurationRow = (() => {
    if ('lease_term_years' in fields) return null // pipeline already returned it
    const start = fields.commencement_date?.value ?? fields.commencement_date
    const end   = fields.expiry_date?.value       ?? fields.expiry_date
    if (!start || !end) return null
    const ms    = new Date(end) - new Date(start)
    if (isNaN(ms) || ms <= 0) return null
    const totalMonths = Math.round(ms / (1000 * 60 * 60 * 24 * 30.4375))
    const years  = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    const display = months === 0
      ? `${years} year${years !== 1 ? 's' : ''}`
      : `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`
    return {
      key: 'lease_term_years', label: 'Lease Duration', missing: false,
      confCls: 'conf-high', uncertain: false, conf: 1,
      clause: '', clauseText: null, edited: undefined,
      value: display, rawField: { value: display, confidence: 1 },
      computed: true,
    }
  })()

  const rowsWithDuration = computedDurationRow
    ? (() => {
        const idx = rows.findIndex(r => r.key === 'expiry_date')
        if (idx === -1) return [...rows, computedDurationRow]
        const out = [...rows]
        out.splice(idx + 1, 0, computedDurationRow)
        return out
      })()
    : rows

  const sortedRows = [
    ...rowsWithDuration.filter(r => !r.missing && r.conf >= 0.85),
    ...rowsWithDuration.filter(r =>  r.missing || r.conf <  0.85),
  ]

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
      onSaveEdits?.(analysisRowId, edits)
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
          { cls: 'conf-high', label: 'Verified',     tip: 'AI confidence ≥ 85% — value matches a clearly labelled clause' },
          { cls: 'conf-med',  label: 'Needs Review', tip: 'AI confidence < 85% or field not found — verify against original contract' },
        ].map(({ cls, label, tip }) => (
          <span key={cls} title={tip} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--t3)', cursor: 'help' }}>
            <span className={`confidence-dot ${cls}`} style={{ flexShrink: 0 }} />{label}
          </span>
        ))}
      </div>
      <div className="term-col-headers">
        <span>Field</span>
        <span>Extracted Value</span>
        <span>Source Clause</span>
        <span />
      </div>
      {sortedRows.map((row) => {
        const { key, missing, confCls, uncertain, conf, label, clause, clauseText, value, edited, computed } = row
        const fb = fieldFeedback[key]
        return (
        <div key={key} className={`term-row${missing ? ' term-missing' : ''}`}>
          <div className="term-label">
            <span
              className={`confidence-dot ${confCls}`}
              title={confCls === 'conf-high' ? 'Verified — AI confidence ≥ 85%' : missing ? 'Not found in contract' : 'Needs Review — AI confidence < 85%'}
            />
            {label}
            {computed && <span style={{ fontSize: '10px', opacity: .45, marginLeft: '5px', fontStyle: 'italic' }}>calculated</span>}
          </div>
          <div className="term-val" style={missing ? { color: 'var(--amber)' } : {}}>
            {editMode && !computed ? (
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
              onClick={() => setActiveClause({ ref: clause, clauseText, fieldLabel: label, value: edited ?? value, conf, missing })}
            >
              <span className="clause-word-label">Clause</span>
              {clause}
            </button>
          ) : <div />}
          <div className="field-feedback-cell">
            {fb ? (
              <span className={`field-feedback-done field-feedback-done--${fb}`}>
                {fb === 'up' ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
                {fb === 'up' ? 'Correct' : 'Flagged'}
              </span>
            ) : !editMode && !missing && !computed ? (
              <div className="field-feedback-btns">
                <button
                  className="field-feedback-btn"
                  title="Extraction looks correct"
                  onClick={() => submitFieldFeedback(key, 'up', row)}
                ><ThumbsUp size={12} /></button>
                <button
                  className="field-feedback-btn field-feedback-btn--down"
                  title="Extraction looks wrong — opens edit mode"
                  onClick={() => submitFieldFeedback(key, 'down', row)}
                ><ThumbsDown size={12} /></button>
              </div>
            ) : null}
          </div>
        </div>
        )
      })}
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

const FLAG_GUIDANCE = {
  missing_discount_rate: {
    steps: [
      { label: 'What it is', text: 'Your incremental borrowing rate (IBR) — the rate you would pay to borrow a similar amount for a similar term on the commencement date (IFRS 16.26 / ASC 842-20-30).' },
      { label: 'How to get it', text: 'Ask your treasury team for your average cost of debt at lease commencement. If unavailable, request a rate indication from your primary lender for a comparable term and collateral profile.' },
      { label: 'What auditors need', text: 'Document the rate used, the methodology, and who approved it. Auditors will ask for this evidence under PCAOB AS 1105.' },
    ],
    inputLabel: 'Enter IBR for this lease (%)',
    inputPlaceholder: 'e.g. 5.25',
  },
  missing_expiry_date: {
    steps: [
      { label: 'What it is', text: 'The date the lease term ends. Required to calculate remaining lease term, ROU asset, and lease liability under IFRS 16.' },
      { label: 'How to find it', text: 'Check the lease agreement for the stated expiry or end date. If only a term length is given (e.g. "5 years"), calculate from the commencement date.' },
      { label: 'What auditors need', text: 'Document the expiry date and the source (clause reference). If derived, show the calculation.' },
    ],
    inputLabel: 'Enter lease expiry date',
    inputPlaceholder: 'e.g. 31 December 2028',
  },
  missing_termination_rights: {
    steps: [
      { label: 'What to check', text: 'If the lessee holds a termination right, the non-cancellable period may be shorter than the stated lease term. IFRS 16.B34 requires the lease term to reflect the period the lessee is "reasonably certain" not to terminate.' },
      { label: 'How to assess', text: 'Review termination notice periods, any financial penalties for early exit, and the significance of the leased asset to operations.' },
      { label: 'What to document', text: 'Record the termination right terms, the assessed non-cancellable period, and the basis for that assessment.' },
    ],
    inputLabel: 'Management note on termination right',
    inputPlaceholder: 'e.g. Termination right exists but not expected to be exercised — $250K penalty clause.',
  },
  missing_escalation_rate: {
    steps: [
      { label: 'What it is', text: 'The rate at which rent increases each year. Under IFRS 16, variable payments linked to an index or rate must be included in lease liability calculations.' },
      { label: 'How to find it', text: 'Check the rent review clause in the lease. It may be a fixed % (e.g. 3.5% p.a.), CPI-linked, or market review. If rent is fixed with no escalation, document that explicitly.' },
      { label: 'What auditors need', text: 'Document whether escalation applies, the rate or index used, and how it affects the payment schedule.' },
    ],
    inputLabel: 'Enter escalation rate or note (e.g. fixed rent)',
    inputPlaceholder: 'e.g. 3.5% per annum on each anniversary',
  },
  missing_security_deposit: {
    steps: [
      { label: 'What it is', text: 'An upfront payment held by the lessor as security. Under IFRS 16, security deposits are a separate financial asset — not included in lease payments.' },
      { label: 'How to find it', text: 'Check the lease schedule, side letter, or bond/bank guarantee clause. The amount is often stated as a multiple of monthly rent.' },
      { label: 'What auditors need', text: 'Document the deposit amount, whether it is refundable, and how it is classified on the balance sheet.' },
    ],
    inputLabel: 'Enter security deposit amount',
    inputPlaceholder: 'e.g. AUD 30,000 (2 months rent)',
  },
  missing_governing_law: {
    steps: [
      { label: 'What it is', text: 'The jurisdiction whose laws govern the lease agreement. Relevant for dispute resolution and determining applicable statutory lease protections.' },
      { label: 'How to find it', text: 'Look for a "Governing Law" or "Jurisdiction" clause, typically near the end of the agreement.' },
      { label: 'What to document', text: 'Record the governing jurisdiction. Note any statutory protections (e.g. retail leasing legislation) that may affect the lease terms.' },
    ],
    inputLabel: 'Enter governing law / jurisdiction',
    inputPlaceholder: 'e.g. New South Wales, Australia',
  },
  missing_commencement_date: {
    steps: [
      { label: 'What it is', text: 'The date the lease term begins and the lessee obtains control of the asset. This is the measurement date for the ROU asset and lease liability under IFRS 16.' },
      { label: 'How to find it', text: 'Check the lease for "Commencement Date", "Start Date", or "Possession Date". It may differ from the execution date.' },
      { label: 'What auditors need', text: 'Document the commencement date with its clause reference. This anchors all subsequent IFRS 16 calculations.' },
    ],
    inputLabel: 'Enter lease commencement date',
    inputPlaceholder: 'e.g. 1 January 2024',
  },
  missing_annual_payment: {
    steps: [
      { label: 'What it is', text: 'The total annual rent payable. Required to calculate the present value of future lease payments under IFRS 16.' },
      { label: 'How to find it', text: 'Check the rent clause. Annual payment may be stated directly or derivable from a monthly/quarterly amount.' },
      { label: 'What auditors need', text: 'Document the annual payment amount, payment frequency, and whether GST/VAT is included or excluded.' },
    ],
    inputLabel: 'Enter annual payment amount',
    inputPlaceholder: 'e.g. AUD 180,000 per annum excl. GST',
  },
  missing_renewal_options: {
    steps: [
      { label: 'What to check', text: 'Determine whether the lessee is "reasonably certain" to exercise the renewal option under IFRS 16.19. This affects the lease term used for ROU asset and liability calculations.' },
      { label: 'How to assess', text: 'Review economic incentives (leasehold improvements, location significance, business continuity), historical renewal behaviour, and management intent.' },
      { label: 'What to document', text: 'Record the renewal option terms, the certainty assessment, and the conclusion. If reasonably certain, include renewal periods in the lease term.' },
    ],
    inputLabel: 'Management note on renewal option',
    inputPlaceholder: 'e.g. Renewal not reasonably certain — leasehold improvements fully amortised by lease end.',
  },
  renewal_certainty: {
    steps: [
      { label: 'What to check', text: 'Determine whether the lessee is "reasonably certain" to exercise the renewal option under IFRS 16.19 / ASC 842-20-30-26. This affects the lease term used for ROU asset and liability calculations.' },
      { label: 'How to assess', text: 'Review economic incentives (leasehold improvements, location significance, business continuity), historical renewal behaviour, and management intent.' },
      { label: 'What to document', text: 'Record the renewal assessment and conclusion. If reasonably certain, include renewal periods in the lease term. If not, document why.' },
    ],
    inputLabel: 'Management note on renewal certainty',
    inputPlaceholder: 'e.g. Renewal not reasonably certain — leasehold improvements fully amortised by lease end.',
  },
  termination_lessee: {
    steps: [
      { label: 'What to check', text: 'If the lessee holds a termination right, the non-cancellable period may be shorter than the stated lease term. IFRS 16.B34 requires the lease term to reflect the period the lessee is "reasonably certain" not to terminate.' },
      { label: 'How to assess', text: 'Review termination notice periods, any financial penalties for early exit, and the significance of the leased asset to operations.' },
      { label: 'What to document', text: 'Record the termination right terms, the assessed non-cancellable period, and the basis for that assessment.' },
    ],
    inputLabel: 'Management note on termination right',
    inputPlaceholder: 'e.g. Termination right exists but not expected to be exercised — $250K penalty clause.',
  },
}

function FlagGuidance({ flagId, isHigh }) {
  const [open, setOpen] = useState(false)
  const [val, setVal]   = useState('')
  const guide = FLAG_GUIDANCE[flagId]
  if (!guide) return null
  return (
    <div className="flag-guidance-wrap">
      <button className="flag-guidance-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▾' : '▸'} What do I do?
      </button>
      {open && (
        <div className="flag-guidance-body">
          {guide.steps.map(s => (
            <div key={s.label} className="flag-guidance-step">
              <span className="flag-guidance-label">{s.label}</span>
              <span className="flag-guidance-text">{s.text}</span>
            </div>
          ))}
          <div className="flag-guidance-input-row">
            <label className="flag-guidance-input-label">{guide.inputLabel}</label>
            <input
              className="flag-guidance-input"
              type="text"
              value={val}
              placeholder={guide.inputPlaceholder}
              onChange={e => setVal(e.target.value)}
            />
            {val && (
              <span className="flag-guidance-saved">Note will appear in your export</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RiskFlags({ flags, onGateChange, stdLabel = 'IFRS 16' }) {
  const [signoffs, setSignoffs]       = useState({})
  const [flagFeedback, setFlagFeedback] = useState({}) // { [id]: 'relevant' | 'not_relevant' }

  const toggle = id => {
    const next = { ...signoffs, [id]: !signoffs[id] }
    setSignoffs(next)
    onGateChange(next)
    track('flag_resolved', { flag_id: id, resolved: next[id] })
  }

  const submitFlagFeedback = (id, verdict) => {
    if (flagFeedback[id]) return
    setFlagFeedback(prev => ({ ...prev, [id]: verdict }))
    track('flag_feedback', { flag_id: id, verdict })
  }

  return (
    <>
      <div className="card-title" style={{ marginBottom: '12px', marginTop: '8px' }}>Risk Flags</div>
      <div className="risk-list">
        {flags.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--t4)', padding: '12px 0' }}>No risk flags detected.</p>
        )}
        {flags.map(flag => {
          const sev     = flag.severity ?? 'low'
          const pillCls = sev === 'high' ? 'pill-red' : sev === 'medium' ? 'pill-amber' : 'pill-green'
          const pillLbl = sev.charAt(0).toUpperCase() + sev.slice(1)
          const isHigh  = sev === 'high'
          const ref     = flag.ifrs16_ref ?? ''
          return (
            <div key={flag.id} className={`risk-item ${sev}`} id={`flag-${flag.id}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="risk-title">{flag.title}</div>
                  <div className="risk-desc">{flag.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {ref && <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{stdLabel} {ref}</span>}
                  <span className={`pill ${pillCls} risk-sev-pill`}>{pillLbl}</span>
                </div>
              </div>
              <div className="flag-feedback-row">
                {flagFeedback[flag.id] ? (
                  <span className={`flag-feedback-done flag-feedback-done--${flagFeedback[flag.id] === 'relevant' ? 'up' : 'down'}`}>
                    {flagFeedback[flag.id] === 'relevant'
                      ? <><ThumbsUp size={11} /> Marked relevant</>
                      : <><ThumbsDown size={11} /> Marked not relevant</>}
                  </span>
                ) : (
                  <>
                    <span className="flag-feedback-label">Was this flag helpful?</span>
                    <button className="field-feedback-btn" title="Yes, this flag is relevant" onClick={() => submitFlagFeedback(flag.id, 'relevant')}><ThumbsUp size={12} /></button>
                    <button className="field-feedback-btn field-feedback-btn--down" title="No, this flag is not relevant" onClick={() => submitFlagFeedback(flag.id, 'not_relevant')}><ThumbsDown size={12} /></button>
                  </>
                )}
              </div>
              <FlagGuidance flagId={flag.id} isHigh={isHigh} />
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

export default function LeaseAnalysis({ selectedFile, analysisData, isLiveData, navLocked, isAnalyzing, progress, theme, toggleTheme, analysisIntent, setAnalysisIntent, handleReanalyzeAs, fieldEdits, setFieldEdits, analysisRowId, updateFieldEdits, user }) {
  if (isAnalyzing) {
    return (
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
        <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} user={user} />
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
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} user={user} />
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
          <button className="btn btn-outline btn-sm" onClick={() => { track('reanalyze', { intent: analysisIntent }); handleReanalyzeAs(analysisIntent) }}>
            <RefreshCw size={12} /> Re-analyze
          </button>
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
              <div className="score-hint" title="0–49 Low · 50–69 Medium · 70–100 High">{riskScore}/100 · lower is better</div>
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
              <MetricGrid fields={fields} data={data} edits={fieldEdits ?? {}} />
            </div>
          </div>

          {/* AI Summary */}
          {summary && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title"><Sparkles size={14} /> AI Summary</div>
              <div className="summary-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(summary) }} />
            </div>
          )}

          {/* Terms */}
          <TermsGrid fields={fields} termsMissing={termsMissing} edits={fieldEdits ?? {}} setEdits={setFieldEdits ?? (() => {})} analysisRowId={analysisRowId} onSaveEdits={updateFieldEdits} />

          {/* Risk flags */}
          <RiskFlags flags={riskFlags} onGateChange={onGateChange} stdLabel={stdMeta.label} />

          {/* Completion banner */}
          {gateOpen && highFlags.length > 0 && (
            <div className="completion-banner">
              <CircleCheck size={16} />
              <span>All risks acknowledged — report is ready to export.</span>
              <button className="btn btn-sm btn-primary" onClick={() => {
                if (exportLocked) return
                track('report_exported', { format: 'pdf', type: 'banner' })
                navigate('/audit')
                setTimeout(() => window.print(), 150)
              }}>
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
                  onClick={() => {
                    if (exportLocked) return
                    track('report_exported', { format: 'pdf', type: 'sidebar' })
                    navigate('/audit')
                    setTimeout(() => window.print(), 150)
                  }}
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
            <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Clause Audit Trail
              <button
                className="btn btn-sm btn-outline"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => navigate('/audit')}
              >
                View all →
              </button>
            </div>
            {Object.entries(fields)
              .filter(([, f]) => typeof f === 'object' && f !== null && f.source_clause)
              .slice(0, 5)
              .map(([key, f]) => (
                <div key={key} className="audit-trail-item">
                  <div className="audit-clause">{f.source_clause}</div>
                  <div className="audit-field">→ {FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}</div>
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
