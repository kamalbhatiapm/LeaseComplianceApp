import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getExtractionQuality, FIELD_HINTS, MOCK_ANALYSIS } from '../utils/constants.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// 0. App.jsx — grantConsent stale closure bug
//    grantConsent useCallback must include selectedFile + analysisIntent in
//    its dep array, otherwise it captures a stale runAnalysis from first
//    render where selectedFile === null and analysis never fires after consent.
// ---------------------------------------------------------------------------
describe('App.jsx grantConsent closure', () => {
  const src = readFileSync(resolve('/tmp/LeaseComplianceApp-fresh/src/App.jsx'), 'utf8')

  it('grantConsent useCallback includes selectedFile in deps', () => {
    // Match across lines: find the closing dep array of grantConsent's useCallback
    const match = src.match(/grantConsent\s*=\s*useCallback\([\s\S]*?\},\s*\[([^\]]*)\]/)
    expect(match, 'grantConsent useCallback not found').toBeTruthy()
    expect(match[1]).toContain('selectedFile')
  })

  it('grantConsent useCallback includes analysisIntent in deps', () => {
    const match = src.match(/grantConsent\s*=\s*useCallback\([\s\S]*?\},\s*\[([^\]]*)\]/)
    expect(match, 'grantConsent useCallback not found').toBeTruthy()
    expect(match[1]).toContain('analysisIntent')
  })
})

// ---------------------------------------------------------------------------
// 1. getExtractionQuality — used in the AuditTrail cover page
// ---------------------------------------------------------------------------
describe('getExtractionQuality', () => {
  const mockFields = (entries) =>
    Object.fromEntries(entries.map(([k, conf]) => [k, { value: 'x', confidence: conf }]))

  it('returns Strong when ≥80% found and ≥80% high-confidence', () => {
    const fields = mockFields([
      ['a', 0.95], ['b', 0.90], ['c', 0.88], ['d', 0.91],
      ['e', 0.92], ['f', 0.87], ['g', 0.93], ['h', 0.86],
    ])
    const result = getExtractionQuality(8, 10, fields)
    expect(result.level).toBe('Strong')
    expect(result.color).toBe('var(--green)')
    expect(result.detail).toMatch(/Strong/)
  })

  it('returns Fair when 60–79% found', () => {
    const fields = mockFields([['a', 0.95], ['b', 0.90], ['c', 0.88], ['d', 0.91], ['e', 0.92], ['f', 0.87]])
    const result = getExtractionQuality(6, 10, fields)
    expect(result.level).toBe('Fair')
    expect(result.color).toBe('var(--amber)')
    expect(result.detail).toMatch(/Fair/)
  })

  it('returns Weak when <60% found', () => {
    const fields = mockFields([['a', 0.95], ['b', 0.90], ['c', 0.88], ['d', 0.91]])
    const result = getExtractionQuality(4, 10, fields)
    expect(result.level).toBe('Weak')
    expect(result.color).toBe('var(--red)')
    expect(result.detail).toMatch(/Weak/)
  })

  it('returns Weak with no detail when termsTotal is 0', () => {
    const result = getExtractionQuality(0, 0, {})
    expect(result.level).toBe('Weak')
    expect(result.detail).toBe('No fields extracted')
  })
})

// ---------------------------------------------------------------------------
// 2. FIELD_HINTS — contextual hints shown for missing fields in print view
// ---------------------------------------------------------------------------
describe('FIELD_HINTS', () => {
  const requiredKeys = [
    'discount_rate', 'renewal_options', 'termination_rights',
    'security_deposit', 'escalation_rate', 'commencement_date',
    'expiry_date', 'annual_payment',
  ]

  it('has a hint for every required IFRS 16 field', () => {
    requiredKeys.forEach(key => {
      expect(FIELD_HINTS[key], `missing hint for ${key}`).toBeTruthy()
      expect(typeof FIELD_HINTS[key]).toBe('string')
      expect(FIELD_HINTS[key].length).toBeGreaterThan(10)
    })
  })

  it('hints start with "Not found —"', () => {
    requiredKeys.forEach(key => {
      expect(FIELD_HINTS[key]).toMatch(/^Not found —/)
    })
  })
})

// ---------------------------------------------------------------------------
// 3. MOCK_ANALYSIS — clause_text must be present for print view source citations
// ---------------------------------------------------------------------------
describe('MOCK_ANALYSIS clause_text', () => {
  const fields = MOCK_ANALYSIS.fields

  it('has clause_text on all non-missing fields', () => {
    Object.entries(fields).forEach(([key, f]) => {
      if (f.value !== null) {
        expect(f.clause_text, `${key} is missing clause_text`).toBeTruthy()
        expect(typeof f.clause_text).toBe('string')
        expect(f.clause_text.length).toBeGreaterThan(20)
      }
    })
  })

  it('has clause_text: null for discount_rate (not found field)', () => {
    expect(fields.discount_rate.clause_text).toBeNull()
  })

  it('has source_clause on all fields', () => {
    Object.entries(fields).forEach(([key, f]) => {
      expect(f.source_clause, `${key} missing source_clause`).toBeTruthy()
    })
  })
})

// ---------------------------------------------------------------------------
// 4. Print CSS classes — verify the expected class names exist in the source
//    (structural smoke test — catches regressions if classes are renamed)
// ---------------------------------------------------------------------------
describe('print CSS classes in globals.css', () => {
  const css = readFileSync(
    resolve('/tmp/LeaseComplianceApp-fresh/src/styles/globals.css'), 'utf8'
  )

  it('has @media print block', () => {
    expect(css).toContain('@media print')
  })

  it('hides .no-print elements in print', () => {
    expect(css).toMatch(/\.no-print\s*\{[^}]*display:\s*none/)
  })

  it('applies page-break-after: always to .audit-cover', () => {
    expect(css).toMatch(/\.audit-cover\s*\{[^}]*page-break-after:\s*always/)
  })

  it('shows .audit-print-footer in print (display: block)', () => {
    expect(css).toContain('.audit-print-footer')
    // In @media print it must be display:block
    const printBlock = css.slice(css.indexOf('@media print'))
    expect(printBlock).toMatch(/\.audit-print-footer[^}]*display:\s*block/)
  })

  it('shows .audit-clause-text-row in print', () => {
    const printBlock = css.slice(css.indexOf('@media print'))
    expect(printBlock).toMatch(/\.audit-clause-text-row[^}]*display:\s*table-row/)
  })

  it('hides .audit-clause-text-row outside print', () => {
    expect(css).toMatch(/\.audit-clause-text-row\s*\{[^}]*display:\s*none/)
  })
})

// ---------------------------------------------------------------------------
// 5. AuditTrail.jsx markup — verify key class names are present in source
// ---------------------------------------------------------------------------
describe('AuditTrail.jsx markup', () => {
  const jsx = readFileSync(
    resolve('/tmp/LeaseComplianceApp-fresh/src/screens/AuditTrail.jsx'), 'utf8'
  )

  it('has audit-cover wrapper', () => {
    expect(jsx).toContain('className="audit-cover"')
  })

  it('has PCAOB disclosure block', () => {
    expect(jsx).toContain('audit-pcaob-disclosure')
    expect(jsx).toContain('PCAOB AS 1105')
  })

  it('has audit-print-footer', () => {
    expect(jsx).toContain('audit-print-footer')
    expect(jsx).toContain('PCAOB AS 1105 compliant')
  })

  it('renders audit-clause-text-row when clauseText exists', () => {
    expect(jsx).toContain('audit-clause-text-row')
    expect(jsx).toContain('audit-clause-text-cell')
    expect(jsx).toContain('row.clauseText')
  })

  it('adds no-print to Nav and toolbar', () => {
    expect(jsx).toMatch(/Nav[^>]*no-print/)
    expect(jsx).toMatch(/no-print/)
  })
})

// ---------------------------------------------------------------------------
// 6. LeaseAnalysis.jsx export buttons — verify print trigger wiring
// ---------------------------------------------------------------------------
describe('LeaseAnalysis.jsx export button wiring', () => {
  const jsx = readFileSync(
    resolve('/tmp/LeaseComplianceApp-fresh/src/screens/LeaseAnalysis.jsx'), 'utf8'
  )

  it('calls navigate to /audit on export', () => {
    expect(jsx).toContain("navigate('/audit')")
  })

  it('calls window.print() via setTimeout after navigate', () => {
    expect(jsx).toContain('window.print()')
    expect(jsx).toContain('setTimeout')
  })

  it('still calls track() on export', () => {
    expect(jsx).toContain("track('report_exported'")
  })
})
