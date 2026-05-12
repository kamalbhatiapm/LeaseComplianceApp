import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted — use vi.hoisted() so variables exist when the factory runs
const {
  mockInsert, mockSelect, mockSingle, mockOrder,
  mockLimit, mockUpdate, mockEq, mockGetUser,
} = vi.hoisted(() => ({
  mockInsert:  vi.fn(),
  mockSelect:  vi.fn(),
  mockSingle:  vi.fn(),
  mockOrder:   vi.fn(),
  mockLimit:   vi.fn(),
  mockUpdate:  vi.fn(),
  mockEq:      vi.fn(),
  mockGetUser: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser:           mockGetUser,
      signOut:           vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: () => ({
      insert:  mockInsert,
      select:  mockSelect,
      update:  mockUpdate,
    }),
  }),
}))

import { saveAnalysis, loadLatestAnalysis, updateFieldEdits } from '../utils/supabase.js'

// ---------------------------------------------------------------------------
// Chain helpers — Supabase builder pattern
// ---------------------------------------------------------------------------
function buildInsertChain({ data = null, error = null } = {}) {
  mockSingle.mockResolvedValue({ data, error })
  mockSelect.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelect })
}

function buildSelectChain({ data = null, error = null } = {}) {
  mockSingle.mockResolvedValue({ data, error })
  mockLimit.mockReturnValue({ single: mockSingle })
  mockOrder.mockReturnValue({ limit: mockLimit })
  mockSelect.mockReturnValue({ order: mockOrder })
}

function buildUpdateChain({ error = null } = {}) {
  mockEq.mockResolvedValue({ error })
  mockUpdate.mockReturnValue({ eq: mockEq })
}

const MOCK_USER = { id: 'user-uuid-123', email: 'test@example.com' }

const MOCK_ANALYSIS_DATA = {
  contract_type: 'office',
  intent: 'ifrs16_compliance',
  risk_score: 62,
  terms_found: ['commencement_date'],
  terms_missing: ['discount_rate'],
  fields: { commencement_date: { value: '2022-01-01', confidence: 0.95 } },
  risk_flags: [],
  key_terms: [],
  analyzed_at: '2026-05-12T00:00:00Z',
}

// ---------------------------------------------------------------------------
// 1. saveAnalysis — user scoping
// ---------------------------------------------------------------------------
describe('saveAnalysis', () => {
  beforeEach(() => vi.clearAllMocks())

  it('includes user_id in the insert payload', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    buildInsertChain({ data: { id: 'row-1', ...MOCK_ANALYSIS_DATA, user_id: MOCK_USER.id } })

    await saveAnalysis({ fileName: 'lease.pdf', analysisData: MOCK_ANALYSIS_DATA, isLiveData: true, intent: 'ifrs16_compliance' })

    expect(mockInsert).toHaveBeenCalledOnce()
    const payload = mockInsert.mock.calls[0][0]
    expect(payload.user_id).toBe(MOCK_USER.id)
  })

  it('returns null and does not insert when no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await saveAnalysis({ fileName: 'lease.pdf', analysisData: MOCK_ANALYSIS_DATA, isLiveData: false, intent: 'ifrs16_compliance' })

    expect(result).toBeNull()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('passes all expected fields to the insert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    buildInsertChain({ data: { id: 'row-1' } })

    await saveAnalysis({ fileName: 'lease.pdf', analysisData: MOCK_ANALYSIS_DATA, isLiveData: true, intent: 'ifrs16_compliance' })

    const payload = mockInsert.mock.calls[0][0]
    expect(payload).toMatchObject({
      user_id:       MOCK_USER.id,
      file_name:     'lease.pdf',
      contract_type: 'office',
      risk_score:    62,
      is_live_data:  true,
      field_edits:   {},
    })
  })

  it('returns the saved row on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    const savedRow = { id: 'row-1', user_id: MOCK_USER.id, risk_score: 62 }
    buildInsertChain({ data: savedRow })

    const result = await saveAnalysis({ fileName: 'lease.pdf', analysisData: MOCK_ANALYSIS_DATA, isLiveData: true, intent: 'ifrs16_compliance' })

    expect(result).toEqual(savedRow)
  })

  it('returns null on Supabase insert error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    buildInsertChain({ data: null, error: { message: 'RLS violation' } })

    const result = await saveAnalysis({ fileName: 'lease.pdf', analysisData: MOCK_ANALYSIS_DATA, isLiveData: true, intent: 'ifrs16_compliance' })

    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 2. loadLatestAnalysis — relies on RLS for user scoping
// ---------------------------------------------------------------------------
describe('loadLatestAnalysis', () => {
  beforeEach(() => vi.clearAllMocks())

  it('queries ordered by created_at descending with limit 1', async () => {
    buildSelectChain({ data: { id: 'row-1', user_id: MOCK_USER.id } })

    await loadLatestAnalysis()

    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(mockLimit).toHaveBeenCalledWith(1)
    expect(mockSingle).toHaveBeenCalled()
  })

  it('returns the row when found', async () => {
    const row = { id: 'row-1', user_id: MOCK_USER.id, risk_score: 62 }
    buildSelectChain({ data: row })

    const result = await loadLatestAnalysis()

    expect(result).toEqual(row)
  })

  it('returns null when no rows exist (Supabase PGRST116 error)', async () => {
    buildSelectChain({ data: null, error: { code: 'PGRST116', message: 'no rows' } })

    const result = await loadLatestAnalysis()

    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 3. updateFieldEdits — row scoped by id (RLS enforces user ownership)
// ---------------------------------------------------------------------------
describe('updateFieldEdits', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates field_edits filtered by row id', async () => {
    buildUpdateChain()

    await updateFieldEdits('row-1', { commencement_date: '2022-01-01' })

    expect(mockUpdate).toHaveBeenCalledWith({ field_edits: { commencement_date: '2022-01-01' } })
    expect(mockEq).toHaveBeenCalledWith('id', 'row-1')
  })

  it('does nothing when rowId is null', async () => {
    await updateFieldEdits(null, { commencement_date: '2022-01-01' })

    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
