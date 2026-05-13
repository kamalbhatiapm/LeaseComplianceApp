import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, FileCheck, Plus, MoreHorizontal, BarChart2 } from 'lucide-react'
import Nav from '../components/AppNav.jsx'
import ProgressPanel from '../components/ProgressPanel.jsx'

const LEASES = [
  { name: 'SF Headquarters — Floor 12', sub: '555 Market St, San Francisco, CA',    standard: 'IFRS 16', start: 'Jan 1, 2022',  term: '7 years',  rent: '$348,000',  status: 'green',  statusLabel: 'Current',       pct: 96 },
  { name: 'NYC Office — Midtown',        sub: '1221 Avenue of the Americas, New York', standard: 'ASC 842', start: 'Mar 15, 2021', term: '5 years',  rent: '$524,400',  status: 'amber',  statusLabel: 'Expiring soon', pct: 88 },
  { name: 'Austin Co-working Space',     sub: '701 Brazos St, Austin, TX',            standard: 'ASC 842', start: 'Sep 1, 2023',  term: '2 years',  rent: '$96,000',   status: 'red',    statusLabel: 'Flagged',       pct: 71 },
  { name: 'London EMEA HQ',             sub: '30 St Mary Axe, London, EC3A 8EP',     standard: 'IFRS 16', start: 'Jul 1, 2020',  term: '10 years', rent: '£612,000',  status: 'green',  statusLabel: 'Current',       pct: 98 },
]

const INTENTS = [
  { value: 'ifrs16_compliance',  label: 'IFRS 16 Compliance Report',  short: 'IFRS 16',  desc: 'Extract key terms, score risk flags, and generate an audit-ready report under IFRS 16' },
  { value: 'asc842_compliance',  label: 'ASC 842 Compliance Report',  short: 'ASC 842',  desc: 'Extract key terms, score risk flags, and generate an audit-ready report under ASC 842 (US GAAP)' },
]

export default function Dashboard({ selectedFile, handleFileSelected, handleFileDrop, handleAnalyzeClick, isAnalyzing, progress, navLocked, theme, toggleTheme, analysisIntent, setAnalysisIntent, user }) {
  const fileRef   = useRef(null)
  const zoneRef   = useRef(null)
  const navigate  = useNavigate()
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (isAnalyzing) navigate('/leases')
  }, [isAnalyzing])

  const onDragEnter = e => { e.preventDefault(); setDragging(true) }
  const onDragOver  = e => { e.preventDefault(); setDragging(true) }

  const onDragLeave = e => {
    // Only clear when leaving the zone entirely, not when moving between children
    if (!zoneRef.current?.contains(e.relatedTarget)) setDragging(false)
  }

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFileDrop(e.dataTransfer.files[0])
  }

  const onAnalyze = () => {
    handleAnalyzeClick()
  }

  const pctColor = p => p >= 90 ? 'var(--ink-3)' : p >= 75 ? 'var(--amber)' : 'var(--red)'

  const contractTypeHint = file => {
    if (!file) return null
    const n = file.name.toLowerCase()
    const type = /office|commercial|market|retail/.test(n) ? 'commercial property'
               : /residential|apartment/.test(n) ? 'residential'
               : 'property'
    const standard = analysisIntent === 'ifrs16_compliance' ? 'IFRS 16' : 'ASC 842'
    return `Looks like a ${type} lease — ${standard} extraction ready`
  }

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} user={user} />
      <main id="main-content">

      {/* Hero — full section is the drop target */}
      <div
        ref={zoneRef}
        className="s1-hero"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="s1-hero-inner">
          <div className="s1-hero-copy">
            <div className="s1-kicker">IFRS 16 / ASC 842 Compliance Suite</div>
            <div className="s1-headline">Audit-ready lease<br />reports in minutes,<br />not hours.</div>
            <div className="s1-sub">
              Upload a contract and LegalGraph extracts IFRS 16 and ASC 842 fields in under 2 minutes — commencement dates,
              payment schedules, borrowing rates, renewal options — each linked to the exact clause, then export a PCAOB AS 1105-compliant audit report in one click.
            </div>
            <div className="s1-stats">
              <div><div className="s1-stat-val">94%</div><div className="s1-stat-label">Extraction accuracy</div></div>
              <div><div className="s1-stat-val">&lt;45m</div><div className="s1-stat-label">Time to compliance report</div></div>
              <div><div className="s1-stat-val">12</div><div className="s1-stat-label">Active leases tracked</div></div>
            </div>
          </div>

          {/* Upload zone */}
          <div className="s1-upload-panel">
            {isAnalyzing ? (
              <ProgressPanel file={selectedFile} progress={progress} analysisIntent={analysisIntent} />
            ) : (
              <div
                className={`upload-zone${dragging ? ' drag-over' : ''}`}
                onClick={() => !selectedFile && fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => { if (e.target.files.length) handleFileSelected(e.target.files[0]) }}
                />
                <div className="upload-drop-area">
                  {dragging ? (
                    <>
                      <div className="upload-icon upload-icon-drop">
                        <FileText size={24} color="var(--accent-on-dark)" />
                      </div>
                      <div className="upload-title">Drop to analyze</div>
                      <div className="upload-sub">Release to start extraction</div>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">
                        {selectedFile
                          ? <FileCheck size={24} color="var(--accent-on-dark)" />
                          : <FileText  size={24} color="var(--accent-on-dark)" />}
                      </div>
                      <div className="upload-title">
                        {selectedFile ? selectedFile.name : 'Upload a lease contract'}
                      </div>
                      <div className="upload-sub">
                        {selectedFile
                          ? `${(selectedFile.size / 1024).toFixed(0)} KB · Ready to analyze`
                          : 'Drag & drop or click to browse'}
                      </div>
                      {selectedFile && contractTypeHint(selectedFile) && (
                        <div className="upload-hint">
                          {contractTypeHint(selectedFile)}
                        </div>
                      )}
                      {!selectedFile && (
                        <div className="upload-types">
                          <span className="upload-type-tag">PDF</span>
                          {['DOCX', 'DOC', 'TXT'].map(t => (
                            <span key={t} className="upload-type-tag upload-type-tag--soon" title="Coming soon">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Analysis intent selector */}
                <div className="intent-select-wrap" onClick={e => e.stopPropagation()}>
                  <label className="intent-label">Reporting standard</label>
                  <div className="intent-segmented">
                    {INTENTS.map(i => (
                      <button
                        key={i.value}
                        type="button"
                        className={`intent-seg-btn${analysisIntent === i.value ? ' active' : ''}`}
                        onClick={() => setAnalysisIntent(i.value)}
                      >
                        {i.short}
                      </button>
                    ))}
                  </div>
                  <div className="intent-desc">
                    {INTENTS.find(i => i.value === analysisIntent)?.desc}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={e => {
                    e.stopPropagation()
                    if (selectedFile) { onAnalyze() } else { fileRef.current?.click() }
                  }}
                >
                  {selectedFile ? <><BarChart2 size={14} /> Analyze Contract</> : 'Choose file'}
                </button>
                <div className="upload-progress-label">Max 50 MB per file · Encrypted at rest</div>
                <div className="upload-progress-label" style={{ marginTop: '6px' }}>
                  Best results with standard fixed-rent property leases. Subleases, variable rents, and
                  multi-party structures may require manual review.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--surface)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '6px' }}>How it works</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Three steps to an audit-ready report</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              {
                step: '01',
                title: 'Upload',
                desc: 'PDF goes to encrypted storage. AI extracts IFRS 16 fields with clause citations.',
                icon: '📄',
              },
              {
                step: '02',
                title: 'Review',
                desc: 'Spot-check fields, edit anything wrong, resolve risk flags. Each edit is logged.',
                icon: '🔍',
              },
              {
                step: '03',
                title: 'Export',
                desc: 'Generate the audit-ready PDF report, complete with cover page and audit trail.',
                icon: '✅',
              },
            ].map((s, i) => (
              <div
                key={s.step}
                style={{
                  background: 'var(--white)',
                  borderRadius: '14px',
                  padding: '28px 24px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                {/* Connector arrow between cards */}
                {i < 2 && (
                  <div style={{
                    position: 'absolute',
                    right: '-18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    textAlign: 'center',
                    fontSize: '16px',
                    color: 'var(--ink-3)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}>→</div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  STEP {s.step}
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lease table */}
      <div className="s1-body">
        <div className="lease-table-card">
          <div className="lease-table-toolbar">
            <div className="section-title">Recent Contracts</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline btn-sm">Export all</button>
              <button className="btn btn-primary btn-sm"><Plus size={12} aria-hidden="true" /> Add lease</button>
            </div>
          </div>
          <table className="lease-table">
            <thead>
              <tr>
                <th>Contract</th><th>Standard</th><th>Commencement</th>
                <th>Term</th><th>Annual Payment</th><th>Status</th><th>Extraction</th><th />
              </tr>
            </thead>
            <tbody>
              {LEASES.map(l => (
                <tr key={l.name}>
                  <td>
                    <div className="lease-name">{l.name}</div>
                    <div className="lease-sub">{l.sub}</div>
                  </td>
                  <td>
                    <span className={`standard-badge ${l.standard === 'IFRS 16' ? 'badge-ifrs' : 'badge-asc'}`}>
                      {l.standard}
                    </span>
                  </td>
                  <td>{l.start}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{l.term}</td>
                  <td>{l.rent}</td>
                  <td><span className={`pill pill-${l.status}`}>{l.statusLabel}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${l.pct}%` }} />
                      </div>
                      <span style={{ fontSize: '11px', color: pctColor(l.pct) }}>{l.pct}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className={`btn btn-sm ${l.status === 'red' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => navigate('/leases')}
                      >
                        {l.status === 'red' ? 'Resolve flags' : 'View report'}
                      </button>
                      <button className="btn-icon" aria-label={`More options for ${l.name}`}><MoreHorizontal size={14} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  )
}
