import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = url && anon ? createClient(url, anon) : null

// Auth helpers
export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data?.session ?? null
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return () => subscription.unsubscribe()
}

export async function saveAnalysis({ fileName, analysisData, isLiveData, intent }) {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('lease_analyses').insert({
    user_id:       user.id,
    file_name:     fileName ?? null,
    contract_type: analysisData.contract_type ?? null,
    intent:        intent ?? null,
    risk_score:    analysisData.risk_score ?? null,
    terms_found:   analysisData.terms_found ?? [],
    terms_missing: analysisData.terms_missing ?? [],
    fields:        analysisData.fields ?? {},
    risk_flags:    analysisData.risk_flags ?? [],
    key_terms:     analysisData.key_terms ?? [],
    is_live_data:  isLiveData,
    analyzed_at:   analysisData.analyzed_at ?? new Date().toISOString(),
    field_edits:   {},
  }).select().single()
  if (error) console.error('[LegalGraph] Supabase save error:', error.message)
  return data ?? null
}

export async function updateFieldEdits(rowId, fieldEdits) {
  if (!supabase || !rowId) return
  const { error } = await supabase
    .from('lease_analyses')
    .update({ field_edits: fieldEdits })
    .eq('id', rowId)
  if (error) console.error('[LegalGraph] Supabase field_edits update error:', error.message)
}

export async function saveFeedback({ analysisId, type, key, verdict, value, confidence, sourceClause }) {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('feedback').insert({
    user_id:       user.id,
    analysis_id:   analysisId ?? null,
    type,
    key,
    verdict,
    value:         value ?? null,
    confidence:    confidence ?? null,
    source_clause: sourceClause ?? null,
  })
  if (error) console.error('[LegalGraph] Supabase feedback save error:', error.message)
}

export async function loadLatestAnalysis() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('lease_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data ?? null
}
