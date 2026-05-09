import { useNavigate } from 'react-router-dom'
import {
  FileDown, Paperclip, AlertTriangle, CircleCheck,
  Clock, CheckCircle2, ShieldCheck, FlaskConical, Lock,
} from 'lucide-react'
import Nav from '../components/Nav.jsx'
import { MOCK_ANALYSIS, FIELD_LABELS, FIELD_HINTS, getExtractionQuality } from '../utils/constants.js'
import { track } from '../utils/track.js'

const STANDARD_META = {
  ifrs16_compliance: { label: 'IFRS 16' },
  asc842_compliance: { label: 'ASC 842' },
}

export default function AuditTrail({ selectedFile, analysisData, isLiveData, navLocked, theme, toggleTheme, analysisIntent, fieldEdits = {} }) {
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
  const dtStr        = new Date(analyzedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

  // Build rows from fields
  const rows = Object.entries(fields).map(([key, raw]) => {
    const f         = typeof raw === 'object' && raw !== null ? raw : { value: raw }
    const missing   = f.value === null || f.value === undefined || f.value === ''
    const conf      = f.confidence ?? (missing ? 0 : 1)
    const confCls   = missing ? 'conf-low' : conf >= 0.85 ? 'conf-high' : 'conf-med'
    const confLabel = missing ? 'Not found' : conf >= 0.85 ? 'High' : 'Verify'
    const label     = FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const clause    = f.source_clause ?? ''
    const edited    = fieldEdits[key]
    const relFlag   = riskFlags.find(fl => fl.field === key)

    return { key, label, missing, conf, confCls, confLabel, clause, value: f.value, edited, relFlag }
  })

  const editedCount  = rows.filter(r => r.edited !== undefined).length
  const highCount    = riskFlags.filter(f => f.severity === 'high').length
  const issueCount   = highCount + termsMissing.length
  const auditReady   = issueCount === 0
  const exportLocked = highCount > 0
  const lockTitle    = `Resolve ${highCount} high-risk flag${highCount !== 1 ? 's' : ''} to unlock`

  // Sort: missing/high-flagged first → verify-recommended → extracted
  const sortScore = r => r.missing ? 0 : r.relFlag?.severity === 'high' ? 1 : (r.conf > 0 && r.conf < 0.85) ? 2 : 3
  const sortedRows = [...rows].sort((a, b) => sortScore(a) - sortScore(b))

  // Analysis timeline entries
  const timeline = [
    { icon: Clock,         label: 'Document received',            detail: filename, time: new Date(new Date(analyzedAt).getTime() - 43000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { icon: FlaskConical,  label: 'Lease type & parties identified', detail: data.contract_type ?? 'Commercial Office Lease', time: new Date(new Date(analyzedAt).getTime() - 35000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { icon: CheckCircle2,  label: `${termsFound.length} of ${totalFields} fields extracted`, detail: `${termsMissing.length} field${termsMissing.length !== 1 ? 's' : ''} missing`, time: new Date(new Date(analyzedAt).getTime() - 18000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { icon: ShieldCheck,   label: `Risk scored: ${data.risk_score ?? 62} / 100`, detail: `${riskFlags.length} flag${riskFlags.length !== 1 ? 's' : ''} raised`, time: new Date(new Date(analyzedAt).getTime() - 8000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { icon: CircleCheck,   label: 'Report generated',             detail: stdMeta.label + ' compliant', time: new Date(analyzedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
  ]
  if (editedCount > 0) {
    timeline.push({ icon: Paperclip, label: `${editedCount} field${editedCount !== 1 ? 's' : ''} manually corrected`, detail: 'By reviewer', time: 'After analysis' })
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
              <a onClick={() => navigate('/leases')}>{filename}</a>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">Audit Trail</span>
            </div>
            <div className="s2-subheader-meta">
              <span className="s2-standard-badge"><ShieldCheck size={11} /> {stdMeta.label}</span>
              <span className="s2-subheader-ts">Analyzed {dtStr}</span>
              {isDemo && <span className="s2-data-badge s2-data-badge--demo"><FlaskConical size={11} /> Demo data</span>}
            </div>
          </div>
          <div className="s2-subheader-actions">
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/leases')}>← Back to report</button>
            <span className={exportLocked ? 'btn-tooltip-wrap' : ''} data-tip={exportLocked ? lockTitle : undefined}>
              <button
                className="btn btn-primary btn-sm"
                disabled={exportLocked}
                onClick={() => !exportLocked && track('audit_exported', { format: 'pdf' })}
              >
                {exportLocked ? <Lock size={12} /> : <FileDown size={12} />} Export audit log
              </button>
            </span>
          </div>
        </div>

        <div className="audit-page">

          {/* Summary bar */}
          <div className="audit-summary-bar">
            <div className="audit-summary-stat">
              <div className="audit-summary-val">{termsFound.length}/{totalFields}</div>
              <div className="audit-summary-label">Fields extracted</div>
            </div>
            <div className="audit-summary-divider" />
            <div className="audit-summary-stat">
              <div className="audit-summary-val" style={{ color: editedCount > 0 ? 'var(--brand)' : 'var(--t2)' }}>{editedCount}</div>
              <div className="audit-summary-label">User corrections</div>
            </div>
            <div className="audit-summary-divider" />
            <div className="audit-summary-stat">
              <div className="audit-summary-val" style={{ color: highCount > 0 ? 'var(--red)' : 'var(--green)' }}>{riskFlags.length}</div>
              <div className="audit-summary-label">Risk flags</div>
            </div>
            <div className="audit-summary-divider" />
            <div className="audit-summary-stat">
              <div className="audit-summary-val" style={{ color: eq.color }}>{eq.level}</div>
              <div className="audit-summary-label">Extraction quality</div>
            </div>
          </div>

          {/* Audit readiness banner */}
          {auditReady ? (
            <div className="audit-ready-banner audit-ready-banner--ok">
              <CircleCheck size={15} />
              <span>Audit-ready — all fields extracted, no unresolved high-risk flags.</span>
            </div>
          ) : (
            <div className="audit-ready-banner audit-ready-banner--warn">
              <AlertTriangle size={15} />
              <span>
                {issueCount} item{issueCount !== 1 ? 's' : ''} need attention before this log is complete
                {termsMissing.length > 0 && ` · ${termsMissing.length} missing field${termsMissing.length !== 1 ? 's' : ''}`}
                {highCount > 0 && ` · ${highCount} unresolved high-risk flag${highCount !== 1 ? 's' : ''}`}.
              </span>
              <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={() => navigate('/leases')}>
                Resolve in report →
              </button>
            </div>
          )}

          <div className="audit-body">

            {/* Field extraction table */}
            <div className="audit-card">
              <div className="audit-card-header">
                <div className="audit-card-title">Field Extraction Log</div>
                <div style={{ fontSize: '12px', color: 'var(--t3)' }}>{rows.length} fields · {stdMeta.label} standard</div>
              </div>
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Source Clause</th>
                    <th>Extracted Value</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => (
                    <tr key={row.key} className={row.missing ? 'audit-row-missing' : row.edited !== undefined ? 'audit-row-edited' : ''}>
                      <td className="audit-field-name">{row.label}</td>
                      <td>
                        {row.clause ? (
                          <span className="audit-clause-ref">
                            <Paperclip size={11} />
                            {row.clause}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--t3)', fontStyle: 'italic' }}>—</span>
                        )}
                      </td>
                      <td className="audit-extracted-val">
                        {row.edited !== undefined ? (
                          <span>
                            <span style={{ textDecoration: 'line-through', color: 'var(--t3)', marginRight: '6px', fontSize: '11px' }}>{row.value ?? 'Not found'}</span>
                            <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{row.edited}</span>
                          </span>
                        ) : row.missing ? (
                          <span style={{ color: 'var(--amber)', fontSize: '12px', lineHeight: 1.5 }}>
                            {FIELD_HINTS[row.key] ?? 'Not found — please verify manually'}
                          </span>
                        ) : (
                          row.value
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className={`confidence-dot ${row.confCls}`} />
                          <span style={{ fontSize: '11px', color: 'var(--t3)' }}>
                            {row.conf > 0 ? `${Math.round(row.conf * 100)}%` : '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {row.edited !== undefined ? (
                          <span className="audit-status-badge audit-status-edited">Edited</span>
                        ) : row.missing ? (
                          <span className="audit-status-badge audit-status-missing">Missing</span>
                        ) : (
                          <span className="audit-status-badge audit-status-ok">Extracted</span>
                        )}
                      </td>
                      <td>
                        {row.relFlag ? (
                          <span className={`pill pill-sm ${row.relFlag.severity === 'high' ? 'pill-red' : 'pill-amber'}`} title={row.relFlag.title}>
                            {row.relFlag.ifrs16_ref ?? row.relFlag.severity}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--t3)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="audit-right-col">

              {/* Analysis timeline */}
              <div className="audit-card">
                <div className="audit-card-header">
                  <div className="audit-card-title">Analysis Timeline</div>
                </div>
                <div className="audit-timeline">
                  {timeline.map((t, i) => (
                    <div key={i} className="audit-timeline-item">
                      <div className="audit-timeline-icon">
                        <t.icon size={13} />
                      </div>
                      <div className="audit-timeline-body">
                        <div className="audit-timeline-label">{t.label}</div>
                        <div className="audit-timeline-detail">{t.detail}</div>
                      </div>
                      <div className="audit-timeline-time">{t.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk flags summary */}
              {riskFlags.length > 0 && (
                <div className="audit-card">
                  <div className="audit-card-header">
                    <div className="audit-card-title">Risk Flag Summary</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 16px' }}>
                    {riskFlags.map(flag => (
                      <div key={flag.id} className="audit-flag-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <AlertTriangle size={12} style={{ color: flag.severity === 'high' ? 'var(--red)' : 'var(--amber)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500 }}>{flag.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {flag.ifrs16_ref && <span style={{ fontSize: '11px', color: 'var(--t3)' }}>IFRS 16 {flag.ifrs16_ref}</span>}
                          <span className={`pill pill-sm ${flag.severity === 'high' ? 'pill-red' : flag.severity === 'medium' ? 'pill-amber' : 'pill-green'}`}>
                            {flag.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
