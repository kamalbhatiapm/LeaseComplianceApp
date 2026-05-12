import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks (must appear before component imports) ──────────────────────────────

vi.mock('../../utils/track.js', () => ({ track: vi.fn() }))
vi.mock('../../utils/supabase.js', () => ({
  supabase: null,
  saveAnalysis: vi.fn(),
  loadLatestAnalysis: vi.fn(),
  updateFieldEdits: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
  onAuthStateChange: vi.fn(() => () => {}),
}))
vi.mock('dompurify', () => ({ default: { sanitize: (s) => s } }))

// ── Component imports (after mocks) ──────────────────────────────────────────

import Dashboard    from '../Dashboard.jsx'
import LeaseAnalysis from '../LeaseAnalysis.jsx'
import AuditTrail   from '../AuditTrail.jsx'
import { MOCK_ANALYSIS } from '../../utils/constants.js'

// ── Shared test helpers ───────────────────────────────────────────────────────

/**
 * Minimal props for Dashboard. analysisIntent and setAnalysisIntent are
 * controlled externally by App — pass them as props to simulate that.
 */
function renderDashboard(overrides = {}) {
  const defaults = {
    selectedFile: null,
    handleFileSelected: vi.fn(),
    handleFileDrop: vi.fn(),
    handleAnalyzeClick: vi.fn(),
    isAnalyzing: false,
    progress: { step: 0, label: '', pct: 0 },
    navLocked: false,
    theme: 'dark',
    toggleTheme: vi.fn(),
    analysisIntent: 'ifrs16_compliance',
    setAnalysisIntent: vi.fn(),
    user: null,
  }
  return render(
    <MemoryRouter>
      <Dashboard {...defaults} {...overrides} />
    </MemoryRouter>
  )
}

/**
 * Minimal props for LeaseAnalysis. analysisIntent is passed directly.
 */
function renderLeaseAnalysis(overrides = {}) {
  const defaults = {
    selectedFile: null,
    analysisData: MOCK_ANALYSIS,
    isLiveData: false,
    navLocked: false,
    isAnalyzing: false,
    progress: { step: 0, label: '', pct: 0 },
    theme: 'dark',
    toggleTheme: vi.fn(),
    analysisIntent: 'ifrs16_compliance',
    setAnalysisIntent: vi.fn(),
    handleReanalyzeAs: vi.fn(),
    fieldEdits: {},
    setFieldEdits: vi.fn(),
    analysisRowId: null,
    updateFieldEdits: vi.fn(),
    user: null,
  }
  return render(
    <MemoryRouter>
      <LeaseAnalysis {...defaults} {...overrides} />
    </MemoryRouter>
  )
}

/**
 * Minimal props for AuditTrail. analysisIntent is passed directly.
 */
function renderAuditTrail(overrides = {}) {
  const defaults = {
    selectedFile: null,
    analysisData: MOCK_ANALYSIS,
    navLocked: false,
    theme: 'dark',
    toggleTheme: vi.fn(),
    analysisIntent: 'ifrs16_compliance',
    fieldEdits: {},
    user: null,
  }
  return render(
    <MemoryRouter>
      <AuditTrail {...defaults} {...overrides} />
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Dashboard — reporting standard toggle', () => {
  it('renders both IFRS 16 and ASC 842 toggle buttons', () => {
    renderDashboard()

    const ifrsBtn = screen.getByRole('button', { name: 'IFRS 16' })
    const ascBtn  = screen.getByRole('button', { name: 'ASC 842' })

    expect(ifrsBtn).toBeInTheDocument()
    expect(ascBtn).toBeInTheDocument()
  })

  it('clicking ASC 842 calls setAnalysisIntent with "asc842_compliance"', () => {
    const setAnalysisIntent = vi.fn()
    renderDashboard({ setAnalysisIntent })

    fireEvent.click(screen.getByRole('button', { name: 'ASC 842' }))

    expect(setAnalysisIntent).toHaveBeenCalledWith('asc842_compliance')
    expect(setAnalysisIntent).toHaveBeenCalledTimes(1)
  })

  it('IFRS 16 button has "active" class when analysisIntent is "ifrs16_compliance"', () => {
    renderDashboard({ analysisIntent: 'ifrs16_compliance' })

    const ifrsBtn = screen.getByRole('button', { name: 'IFRS 16' })
    const ascBtn  = screen.getByRole('button', { name: 'ASC 842' })

    expect(ifrsBtn).toHaveClass('active')
    expect(ascBtn).not.toHaveClass('active')
  })

  it('ASC 842 button has "active" class when analysisIntent is "asc842_compliance"', () => {
    renderDashboard({ analysisIntent: 'asc842_compliance' })

    const ifrsBtn = screen.getByRole('button', { name: 'IFRS 16' })
    const ascBtn  = screen.getByRole('button', { name: 'ASC 842' })

    expect(ascBtn).toHaveClass('active')
    expect(ifrsBtn).not.toHaveClass('active')
  })

  it('description text mentions IFRS 16 when intent is ifrs16_compliance', () => {
    renderDashboard({ analysisIntent: 'ifrs16_compliance' })

    expect(
      screen.getByText(/generate an audit-ready report under IFRS 16/i)
    ).toBeInTheDocument()
  })

  it('description text changes to ASC 842 when intent is asc842_compliance', () => {
    renderDashboard({ analysisIntent: 'asc842_compliance' })

    expect(
      screen.getByText(/generate an audit-ready report under ASC 842/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/generate an audit-ready report under IFRS 16/i)
    ).not.toBeInTheDocument()
  })

  it('contractTypeHint shows "IFRS 16" when intent is ifrs16_compliance', () => {
    const file = new File([''], 'office-lease.pdf', { type: 'application/pdf' })
    renderDashboard({ selectedFile: file, analysisIntent: 'ifrs16_compliance' })

    expect(screen.getByText(/IFRS 16 extraction ready/i)).toBeInTheDocument()
  })

  it('contractTypeHint shows "ASC 842" when intent is asc842_compliance', () => {
    const file = new File([''], 'office-lease.pdf', { type: 'application/pdf' })
    renderDashboard({ selectedFile: file, analysisIntent: 'asc842_compliance' })

    expect(screen.getByText(/ASC 842 extraction ready/i)).toBeInTheDocument()
  })
})

describe('LeaseAnalysis — standard label based on analysisIntent', () => {
  it('shows "IFRS 16" label in the sub-header badge when intent is ifrs16_compliance', () => {
    renderLeaseAnalysis({ analysisIntent: 'ifrs16_compliance' })

    // stdMeta.label appears in the s2-standard-badge span
    const badges = screen.getAllByText('IFRS 16')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows "ASC 842" label in the sub-header badge when intent is asc842_compliance', () => {
    renderLeaseAnalysis({ analysisIntent: 'asc842_compliance' })

    const badges = screen.getAllByText('ASC 842')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('risk flag standard ref in RiskFlags panel shows "ASC 842 §26" not "IFRS 16 §26" when intent is asc842_compliance', () => {
    // MOCK_ANALYSIS has a risk flag with ifrs16_ref: '§26'
    // When analysisIntent is asc842_compliance the displayed ref should say "ASC 842 §26"
    renderLeaseAnalysis({ analysisIntent: 'asc842_compliance' })

    // Should contain "ASC 842 §26"
    expect(screen.getByText('ASC 842 §26')).toBeInTheDocument()
    // Should NOT contain "IFRS 16 §26"
    expect(screen.queryByText('IFRS 16 §26')).not.toBeInTheDocument()
  })
})

describe('AuditTrail — standard label in report header', () => {
  it('shows "IFRS 16" in the document subtitle when intent is ifrs16_compliance', () => {
    renderAuditTrail({ analysisIntent: 'ifrs16_compliance' })

    // The subtitle is: "{contract_type} · {stdMeta.label} · Generated {dateOnly}"
    const subtitle = screen.getByText(/Commercial Office Lease.*IFRS 16/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('shows "ASC 842" in the document subtitle when intent is asc842_compliance', () => {
    renderAuditTrail({ analysisIntent: 'asc842_compliance' })

    const subtitle = screen.getByText(/Commercial Office Lease.*ASC 842/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('risk flag Standard Ref. column shows "ASC 842 §26" when intent is asc842_compliance', () => {
    // MOCK_ANALYSIS risk flag has ifrs16_ref: '§26'
    // AuditTrail renders stdMeta.label + flag.ifrs16_ref in both the field ledger and
    // the risk flag summary table, so getAllByText is required.
    renderAuditTrail({ analysisIntent: 'asc842_compliance' })

    expect(screen.getAllByText('ASC 842 §26').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('IFRS 16 §26')).toHaveLength(0)
  })

  it('risk flag Standard Ref. column shows "IFRS 16 §26" when intent is ifrs16_compliance', () => {
    renderAuditTrail({ analysisIntent: 'ifrs16_compliance' })

    expect(screen.getAllByText('IFRS 16 §26').length).toBeGreaterThan(0)
  })
})
