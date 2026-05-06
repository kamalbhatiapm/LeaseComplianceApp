import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, FileCheck, Plus, MoreHorizontal, BarChart2 } from 'lucide-react'
import Nav from '../components/Nav.jsx'
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

export default function Dashboard({ selectedFile, handleFileSelected, handleAnalyzeClick, isAnalyzing, progress, navLocked, theme, toggleTheme, analysisIntent, setAnalysisIntent }) {
  const fileRef  = useRef(null)
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (isAnalyzing) navigate('/leases')
  }, [isAnalyzing])

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFileSelected(e.dataTransfer.files[0])
  }

  const onAnalyze = () => {
    handleAnalyzeClick()
  }

  const pctColor = p => p >= 90 ? 'var(--ink-3)' : p >= 75 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh', paddingTop: '53px' }}>
      <Nav locked={navLocked} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">

      {/* Hero */}
      <div className="s1-hero">
        <div className="s1-hero-inner">
          <div className="s1-hero-copy">
            <div className="s1-kicker">IFRS 16 / ASC 842 Compliance Suite</div>
            <div className="s1-headline">Audit-ready lease<br />reports in minutes,<br />not hours.</div>
            <div className="s1-sub">
              Upload a contract and LegalGraph extracts every IFRS 16 field automatically — commencement dates,
              payment schedules, discount rates, renewal options — with a clause-level audit trail auditors can verify on the spot.
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
              <ProgressPanel file={selectedFile} progress={progress} />
            ) : (
              <div
                className={`upload-zone${dragging ? ' drag-over' : ''}`}
                onClick={() => !selectedFile && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={e => { if (e.target.files.length) handleFileSelected(e.target.files[0]) }}
                />
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
                {!selectedFile && (
                  <div className="upload-types">
                    {['PDF', 'DOCX', 'DOC', 'TXT'].map(t => (
                      <span key={t} className="upload-type-tag">{t}</span>
                    ))}
                  </div>
                )}

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
