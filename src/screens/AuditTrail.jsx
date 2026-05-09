import { useNavigate } from 'react-router-dom'
import {
  FileDown, Paperclip, AlertTriangle, CircleCheck,
  Clock, CheckCircle2, ShieldCheck, FlaskConical, Lock,
} from 'lucide-react'

function getRiskLevel(score) {
  if (score < 50) return { level: 'Low',    color: '#16a34a' }
  if (score < 70) return { level: 'Medium', color: '#b45309' }
  return               { level: 'High',   color: '#dc2626' }
}
import Nav from '../components/Nav.jsx'
import { MOCK_ANALYSIS, FIELD_LABELS, FIELD_HINTS, getExtractionQuality } from '../utils/constants.js'
import { track } from '../utils/track.js'

const STANDARD_META = {
  ifrs16_compliance: { label: 'IFRS 16' },
  asc842_compliance: { label: 'ASC 842' },
}

export default function AuditTrail({ selectedFile, analysisData, navLocked, theme, toggleTheme, analysisIntent, fieldEdits = {} }) {
  const navigate  = useNavigate()
  const data      = analysisData ?? MOCK_ANALYSIS
  const isDemo    = !analysisData

  const fields       = data.fields ?? {}
  const riskFlags    = data.risk_flags ?? []
  const termsFound   = data.terms_found ?? Object.keys(fields).filter(k => fields[k]?.value)
  const termsMissing = data.terms_missing ?? Object.keys(fields).filter(k => !fields[k]?.value)
  const analyzedAt   = data.analyzed_at ?? new Date().toISOString()
  const filename     = selectedFile ? selectedFile.name.replace(/\.[^.]+$/, '') : (data.contract_type ?? 'Contract')
  const stdMeta      = STANDARD_META[analysisIntent] ?? STANDARD_META.ifrs16_compliance
  const totalFields  = termsFound.length + termsMissing.length || 9
  const eq           = getExtractionQuality(termsFound.length, totalFields, fields)
  const dtStr        = new Date(analyzedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  const dateOnly     = new Date(analyzedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const rows = Object.entries(fields).map(([key, raw]) => {
    const f       = typeof raw === 'object' && raw !== null ? raw : { value: raw }
    const missing = f.value === null || f.value === undefined || f.value === ''
    const conf    = f.confidence ?? (missing ? 0 : 1)
    const confCls = missing ? 'conf-low' : conf >= 0.85 ? 'conf-high' : 'conf-med'
    const label   = FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const clause  = f.source_clause ?? ''
    const edited  = fieldEdits[key]
    const relFlag = riskFlags.find(fl => fl.field === key)
    return { key, label, missing, conf, confCls, clause, value: f.value, edited, relFlag }
  })

  const editedCount  = rows.filter(r => r.edited !== undefined).length
  const highCount    = riskFlags.filter(f => f.severity === 'high').length
  const issueCount   = highCount + termsMissing.length
  const auditReady   = issueCount === 0
  const exportLocked = highCount > 0
  const lockTitle    = `Resolve ${highCount} high-risk flag${highCount !== 1 ? 's' : ''} to unlock`

  const sortScore  = r => r.missing ? 0 : r.relFlag?.severity === 'high' ? 1 : (r.conf > 0 && r.conf < 0.85) ? 2 : 3
  const sortedRows = [...rows].sort((a, b) => sortScore(a) - sortScore(b))

  const timeline = [
    { icon: Clock,        label: 'Document received',                   detail: filename },
    { icon: FlaskConical, label: 'Lease type & parties identified',     detail: data.contract_type ?? 'Commercial Office Lease' },
    { icon: CheckCircle2, label: `${termsFound.length}/${totalFields} fields extracted`, detail: `${termsMissing.length} missing` },
    { icon: ShieldCheck,  label: `Risk scored ${data.risk_score ?? 62}/100`,             detail: `${riskFlags.length} flags raised` },
    { icon: CircleCheck,  label: 'Report generated',                   detail: stdMeta.label + ' compliant' },
  ]
  if (editedCount > 0) {
    timeline.push({ icon: Paperclip, label: `${editedCount} field${editedCount !== 1 ? 's' : ''} corrected`, detail: 'By reviewer' })
  }

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">

        {/* Screen-only toolbar */}
        <div className="adt-toolbar no-print">
          <div className="adt-toolbar-left">
            <div className="breadcrumb">
              <a onClick={() => navigate('/')}>Leases</a>
              <span className="breadcrumb-sep">›</span>
              <a onClick={() => navigate('/leases')}>{filename}</a>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">Audit Trail</span>
            </div>
          </div>
          <div className="adt-toolbar-right">
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/leases')}>← Back to report</button>
            <span className={exportLocked ? 'btn-tooltip-wrap' : ''} data-tip={exportLocked ? lockTitle : undefined}>
              <button
                className="btn btn-primary btn-sm"
                disabled={exportLocked}
                onClick={() => { if (exportLocked) return; track('audit_exported', { format: 'pdf' }); window.print() }}
              >
                {exportLocked ? <Lock size={12} /> : <FileDown size={12} />} Export audit log
              </button>
            </span>
          </div>
        </div>

        {/* Document */}
        <div className="adt-doc">

          {/* Document header */}
          <div className="adt-doc-header">
            <div className="adt-doc-header-top">
              <div>
                <div className="adt-doc-label">CLAUSE AUDIT TRAIL</div>
                <div className="adt-doc-title">{filename}</div>
                <div className="adt-doc-subtitle">{data.contract_type ?? 'Commercial Lease'} · {stdMeta.label} · Generated {dateOnly}</div>
              </div>
              <div className="adt-doc-header-meta">
                <div className="adt-doc-meta-row"><span>Standard</span><span>{stdMeta.label}</span></div>
                <div className="adt-doc-meta-row">
                  <span>Risk score</span>
                  <span>
                    {data.risk_score ?? 62}
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: '11px' }}>/100</span>
                    {' '}
                    <span style={{ color: getRiskLevel(data.risk_score ?? 62).color, fontWeight: 600, fontSize: '11px' }}>
                      {getRiskLevel(data.risk_score ?? 62).level}
                    </span>
                  </span>
                </div>
                <div className="adt-doc-meta-row"><span>Extraction</span><span style={{ color: eq.color === 'var(--green)' ? '#16a34a' : eq.color === 'var(--amber)' ? '#b45309' : '#dc2626' }}>{eq.level}</span></div>
                <div className="adt-doc-meta-row"><span>Fields</span><span>{termsFound.length} of {totalFields}</span></div>
                {isDemo && <div className="adt-doc-meta-row"><span>Data</span><span style={{ color: '#b45309' }}>Demo</span></div>}
              </div>
            </div>

            {/* Readiness status */}
            <div className={`adt-status-bar ${auditReady ? 'adt-status-ok' : 'adt-status-warn'}`}>
              {auditReady
                ? <><CircleCheck size={14} /> Audit-ready — all fields extracted, no unresolved high-risk flags.</>
                : <><AlertTriangle size={14} />
                    <span>
                      {issueCount} item{issueCount !== 1 ? 's' : ''} require attention before this log is complete
                      {termsMissing.length > 0 && ` · ${termsMissing.length} missing field${termsMissing.length !== 1 ? 's' : ''}`}
                      {highCount > 0 && ` · ${highCount} unresolved high-risk flag${highCount !== 1 ? 's' : ''}`}.
                    </span>
                    <button className="adt-resolve-link no-print" onClick={() => navigate('/leases')}>
                      Resolve in report →
                    </button>
                  </>
              }
            </div>
          </div>

          {/* Field extraction ledger */}
          <div className="adt-section">
            <div className="adt-section-title">Field Extraction Log</div>
            <table className="adt-ledger">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Source Clause</th>
                  <th>Extracted Value</th>
                  <th>Conf.</th>
                  <th>Status</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr key={row.key} className={
                    row.missing ? 'adt-row-missing'
                    : row.edited !== undefined ? 'adt-row-edited'
                    : i % 2 === 0 ? 'adt-row-even' : ''
                  }>
                    <td className="adt-field-name">
                      {(row.missing || row.relFlag?.severity === 'high') && (
                        <AlertTriangle size={11} className="adt-row-warn-icon" />
                      )}
                      {row.label}
                    </td>
                    <td className="adt-clause-cell">
                      {row.clause
                        ? <span className="adt-clause-tag"><Paperclip size={10} />{row.clause}</span>
                        : <span className="adt-empty">—</span>
                      }
                    </td>
                    <td className="adt-val-cell">
                      {row.edited !== undefined ? (
                        <>
                          <span className="adt-original">{row.value ?? 'Not found'}</span>
                          <span className="adt-corrected">{row.edited}</span>
                        </>
                      ) : row.missing ? (
                        <span className="adt-hint">{FIELD_HINTS[row.key] ?? 'Not found — please verify manually'}</span>
                      ) : row.value}
                    </td>
                    <td className="adt-conf-cell">
                      <span className={`confidence-dot ${row.confCls}`} style={{ width: '7px', height: '7px' }} />
                      <span className="adt-conf-pct">{row.conf > 0 ? `${Math.round(row.conf * 100)}%` : '—'}</span>
                    </td>
                    <td>
                      <span className={`adt-status-pill ${row.edited !== undefined ? 'adt-pill-edited' : row.missing ? 'adt-pill-missing' : 'adt-pill-ok'}`}>
                        {row.edited !== undefined ? 'Edited' : row.missing ? 'Missing' : 'Extracted'}
                      </span>
                    </td>
                    <td className="adt-flag-cell">
                      {row.relFlag
                        ? <span className={`adt-flag-tag ${row.relFlag.severity === 'high' ? 'adt-flag-high' : 'adt-flag-med'}`}>
                            {stdMeta.label} {row.relFlag.ifrs16_ref ?? row.relFlag.severity}
                          </span>
                        : <span className="adt-empty">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analysis timeline */}
          <div className="adt-section">
            <div className="adt-section-title">Analysis Timeline</div>
            <div className="adt-timeline-strip">
              {timeline.map((t, i) => (
                <div key={i} className="adt-tl-step">
                  <div className="adt-tl-dot">
                    <t.icon size={11} />
                  </div>
                  {i < timeline.length - 1 && <div className="adt-tl-line" />}
                  <div className="adt-tl-label">{t.label}</div>
                  <div className="adt-tl-detail">{t.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk flags */}
          {riskFlags.length > 0 && (
            <div className="adt-section">
              <div className="adt-section-title">Risk Flag Summary</div>
              <table className="adt-ledger adt-flags-table">
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>Description</th>
                    <th>Standard Ref.</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {riskFlags.map((flag, i) => (
                    <tr key={flag.id} className={i % 2 === 0 ? 'adt-row-even' : ''}>
                      <td className="adt-field-name" style={{ whiteSpace: 'nowrap' }}>{flag.title}</td>
                      <td><div className="adt-flag-desc">{flag.description}</div></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{flag.ifrs16_ref ? `${stdMeta.label} ${flag.ifrs16_ref}` : '—'}</td>
                      <td>
                        <span className={`adt-status-pill ${flag.severity === 'high' ? 'adt-pill-missing' : flag.severity === 'medium' ? 'adt-pill-edited' : 'adt-pill-ok'}`}>
                          {flag.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="adt-doc-footer">
            <span>Generated by LegalGraph · {dtStr}</span>
            <span>AI-assisted, human-reviewed · Powered by Anthropic Claude API · Not legal or financial advice · Verify all extracted values against the original contract before submission.</span>
          </div>

        </div>
      </main>
    </div>
  )
}
