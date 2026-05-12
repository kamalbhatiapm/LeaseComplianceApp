import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = url && anon ? createClient(url, anon) : null

export async function saveAnalysis({ fileName, analysisData, isLiveData, intent }) {
  if (!supabase) return null
  const { data, error } = await supabase.from('lease_analyses').insert({
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
