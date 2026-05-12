import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../utils/track.js', () => ({ track: vi.fn() }))
vi.mock('../../utils/supabase.js', () => ({ supabase: null, saveAnalysis: vi.fn(), loadLatestAnalysis: vi.fn() }))
vi.mock('dompurify', () => ({ default: { sanitize: (s) => s } }))

import { track } from '../../utils/track.js'

// Minimal stub for LeaseAnalysis — import after mocks are set
let LeaseAnalysis
const loadComponent = async () => {
  const mod = await import('../LeaseAnalysis.jsx')
  LeaseAnalysis = mod.default
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const BASE_FIELDS = {
  commencement_date: { value: 'January 1, 2022', confidence: 0.97, source_clause: '§2.1' },
  expiry_date:       { value: 'December 31, 2028', confidence: 0.97, source_clause: '§2.1' },
  annual_payment:    { value: '$348,000 / year', confidence: 0.96, source_clause: '§5.1' },
  discount_rate:     { value: null, confidence: 0 },
}

const MONTHLY_FIELDS = {
  ...BASE_FIELDS,
  annual_payment: { value: 'AUD 15,000 per month', confidence: 0.96, source_clause: '§3.1' },
}

const MISSING_DATES_FIELDS = {
  annual_payment: { value: '$348,000 / year', confidence: 0.96, source_clause: '§5.1' },
  discount_rate:  { value: null, confidence: 0 },
}

const baseAnalysis = (fields) => ({
  fields,
  risk_score: 62,
  risk_flags: [],
  terms_found: Object.keys(fields).filter(k => fields[k]?.value),
  terms_missing: Object.keys(fields).filter(k => !fields[k]?.value),
  analyzed_at: new Date().toISOString(),
  contract_type: 'Commercial Office Lease',
})

const renderAnalysis = (fields = BASE_FIELDS, extra = {}) =>
  render(
    <MemoryRouter>
      <LeaseAnalysis
        selectedFile={{ name: 'lease.pdf' }}
        analysisData={baseAnalysis(fields)}
        isLiveData={true}
        navLocked={false}
        isAnalyzing={false}
        progress={0}
        theme="dark"
        toggleTheme={() => {}}
        analysisIntent="ifrs16_compliance"
        setAnalysisIntent={() => {}}
        handleReanalyzeAs={extra.handleReanalyzeAs ?? vi.fn()}
        fieldEdits={extra.fieldEdits ?? {}}
        setFieldEdits={() => {}}
        analysisRowId={null}
        updateFieldEdits={() => {}}
        user={null}
      />
    </MemoryRouter>
  )

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TRUST fixes', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    await loadComponent()
  })

  // ── Fix 1: Summary card actionable subtext ──────────────────────────────

  describe('Fix 1 — summary card actionable subtext when dates missing', () => {
    it('shows actionable subtext when expiry date is missing', () => {
      renderAnalysis(MISSING_DATES_FIELDS)
      const subtexts = screen.getAllByText('Enter expiry date via Edit terms ↓')
      // Both Lease Duration and Remaining Term should show it
      expect(subtexts.length).toBeGreaterThanOrEqual(2)
    })

    it('does NOT show dead-end "From commencement to expiry" text', () => {
      renderAnalysis(MISSING_DATES_FIELDS)
      expect(screen.queryByText('From commencement to expiry')).not.toBeInTheDocument()
    })

    it('does NOT show dead-end "Expiry date not found" text', () => {
      renderAnalysis(MISSING_DATES_FIELDS)
      expect(screen.queryByText('Expiry date not found')).not.toBeInTheDocument()
    })

    it('shows date range subtext when both dates are present', () => {
      renderAnalysis(BASE_FIELDS)
      // Should show computed date range, not the fallback
      expect(screen.queryByText('Enter expiry date via Edit terms ↓')).not.toBeInTheDocument()
      expect(screen.getByText(/Jan 2022/)).toBeInTheDocument()
    })
  })

  // ── Fix 2: Re-analyze button wired to handleReanalyzeAs ────────────────

  describe('Fix 2 — Re-analyze button calls handleReanalyzeAs', () => {
    it('calls handleReanalyzeAs with current analysisIntent when clicked', () => {
      const handleReanalyzeAs = vi.fn()
      renderAnalysis(BASE_FIELDS, { handleReanalyzeAs })
      fireEvent.click(screen.getByRole('button', { name: /re-analyze/i }))
      expect(handleReanalyzeAs).toHaveBeenCalledWith('ifrs16_compliance')
    })

    it('also calls track() when Re-analyze is clicked', () => {
      renderAnalysis(BASE_FIELDS)
      fireEvent.click(screen.getByRole('button', { name: /re-analyze/i }))
      expect(track).toHaveBeenCalledWith('reanalyze', expect.objectContaining({ intent: 'ifrs16_compliance' }))
    })
  })

  // ── Fix 3: Needs Review tooltip ─────────────────────────────────────────

  describe('Fix 3 — confidence legend items have explanatory tooltips', () => {
    it('Verified legend item has a title explaining the threshold', () => {
      const { container } = renderAnalysis(BASE_FIELDS)
      const verifiedItems = [...container.querySelectorAll('[title]')].filter(el =>
        el.title.toLowerCase().includes('85%') && el.title.toLowerCase().includes('verified')
      )
      expect(verifiedItems.length).toBeGreaterThan(0)
    })

    it('Needs Review legend item has a title explaining the threshold', () => {
      const { container } = renderAnalysis(BASE_FIELDS)
      const needsReviewItems = [...container.querySelectorAll('[title]')].filter(el =>
        el.title.toLowerCase().includes('85%') && el.title.toLowerCase().includes('confidence')
      )
      expect(needsReviewItems.length).toBeGreaterThan(0)
    })

    it('confidence dots on rows have title attributes', () => {
      const { container } = renderAnalysis(BASE_FIELDS)
      const dots = [...container.querySelectorAll('.confidence-dot[title]')]
      expect(dots.length).toBeGreaterThan(0)
    })
  })

  // ── Fix 4: Rent period subtext ──────────────────────────────────────────

  describe('Fix 4 — rent period subtext reflects actual payment frequency', () => {
    it('shows "Per month" when rent value contains "per month"', () => {
      renderAnalysis(MONTHLY_FIELDS)
      expect(screen.getByText('Per month')).toBeInTheDocument()
    })

    it('shows "Per annum" when rent value is annual (contains "/ year")', () => {
      renderAnalysis(BASE_FIELDS)
      expect(screen.getByText('Per annum')).toBeInTheDocument()
    })

    it('does NOT show "Per annum" for a monthly rent value', () => {
      renderAnalysis(MONTHLY_FIELDS)
      expect(screen.queryByText('Per annum')).not.toBeInTheDocument()
    })

    it('does NOT show "Base rent per annum" anywhere', () => {
      renderAnalysis(MONTHLY_FIELDS)
      expect(screen.queryByText('Base rent per annum')).not.toBeInTheDocument()
    })
  })
})
