import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef } from 'react'
import Dashboard from './screens/Dashboard.jsx'
import LeaseAnalysis from './screens/LeaseAnalysis.jsx'
import AuditTrail from './screens/AuditTrail.jsx'
import Playbooks from './screens/Playbooks.jsx'
import Toast from './components/Toast.jsx'
import ConsentModal from './components/ConsentModal.jsx'
import { MOCK_ANALYSIS } from './utils/constants.js'
import { track } from './utils/track.js'

const WEBHOOK_URL   = import.meta.env.VITE_WEBHOOK_URL   ?? ''
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (WEBHOOK_URL.startsWith('__') || !WEBHOOK_URL) {
  console.error('Build misconfiguration: VITE_WEBHOOK_URL not set. Check .env file.')
}

export default function App() {
  const [selectedFile, setSelectedFile]   = useState(null)
  const [consentGiven, setConsentGiven]   = useState(false)
  const [showConsent, setShowConsent]     = useState(false)
  const [isAnalyzing, setIsAnalyzing]     = useState(false)
  const [analysisData, setAnalysisData]   = useState(null)
  const [isLiveData, setIsLiveData]       = useState(false)
  const [toast, setToast]                 = useState(null)
  const [progress, setProgress]           = useState({ step: 0, label: '', pct: 0 })
  const [navLocked, setNavLocked]         = useState(false)
  const [analysisIntent, setAnalysisIntent] = useState('ifrs16_compliance')
  const [fieldEdits, setFieldEdits]         = useState({})
  const [theme, setTheme]                 = useState(() => localStorage.getItem('lg-theme') ?? 'dark')
  const dropPending                        = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('lg-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const showToast = useCallback((type, title, sub) => {
    setToast({ type, title, sub })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  const validateAndSetFile = (file) => {
    const ALLOWED = new Set(['.pdf', '.doc', '.docx', '.txt'])
    const MAX_BYTES = 50 * 1024 * 1024
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED.has(ext)) {
      showToast('error', 'Unsupported file type', `"${ext}" is not supported. Please upload a PDF, DOC, DOCX, or TXT file.`)
      setTimeout(dismissToast, 6000)
      return false
    }
    if (file.size > MAX_BYTES) {
      showToast('error', 'File too large', `${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 50 MB limit.`)
      setTimeout(dismissToast, 6000)
      return false
    }
    setSelectedFile(file)
    track('upload_started', { file_name: file.name, file_size_kb: Math.round(file.size / 1024) })
    return true
  }

  const handleFileSelected = useCallback((file) => {
    validateAndSetFile(file)
  }, [])

  const handleFileDrop = useCallback((file) => {
    if (validateAndSetFile(file)) dropPending.current = true
  }, [])

  // After a drop, selectedFile state has settled — trigger the analyze flow
  useEffect(() => {
    if (!dropPending.current || !selectedFile) return
    dropPending.current = false
    if (!consentGiven) { setShowConsent(true); return }
    runAnalysis()
  }, [selectedFile])

  const handleAnalyzeClick = useCallback(() => {
    if (!selectedFile) return
    if (!consentGiven) { setShowConsent(true); return }
    runAnalysis()
  }, [selectedFile, consentGiven])

  const handleReanalyzeAs = useCallback((intent) => {
    if (!selectedFile) return
    setAnalysisIntent(intent)
    runAnalysis(intent)
  }, [selectedFile])

  const grantConsent = useCallback(() => {
    setConsentGiven(true)
    setShowConsent(false)
    runAnalysis()
  }, [])

  async function runAnalysis(intentOverride) {
    setIsAnalyzing(true)
    setNavLocked(true)

    const MIN_MS   = 45000   // always show loading for at least 45 s
    const MAX_MS   = 180000  // safety cap at 3 min
    const startMs  = Date.now()

    const step = async (n, label, pct, ms) => {
      setProgress({ step: n, label, pct })
      await sleep(ms)
    }

    // Spread steps across the first ~33 s so the UI stays lively
    await step(1, 'Reading contract…',           15,  4000)
    await step(2, 'Parsing document structure…', 30,  6000)
    await step(3, 'Extracting IFRS 16 fields…',  50,  8000)
    await step(4, 'Scoring risk factors…',        68,  7000)
    await step(5, 'Running compliance checks…',   82,  6000)
    setProgress({ step: 6, label: 'Sending to AI workflow…', pct: 90 })

    let webhookOk    = false
    let responseData = null
    let errorReason  = null

    if (WEBHOOK_URL) {
      // Heartbeat: slowly nudge progress 90→97% while waiting for webhook
      // so the UI never looks frozen during the ~80 s AI processing window.
      let heartbeatPct = 91
      const heartbeat = setInterval(() => {
        heartbeatPct = Math.min(97, heartbeatPct + 0.8)
        const label = heartbeatPct < 94
          ? 'AI agents processing contract…'
          : heartbeatPct < 96
            ? 'Almost there — building your report…'
            : 'Finalising extraction…'
        setProgress({ step: 6, label, pct: Math.round(heartbeatPct) })
      }, 3000)

      // Hard safety cap at 3 min — always clears loading no matter what
      let safetyFired = false
      const safetyTimer = setTimeout(() => {
        safetyFired = true
        clearInterval(heartbeat)
        setProgress({ step: 6, label: 'Extraction complete', pct: 100, done: true })
        setAnalysisData(MOCK_ANALYSIS)
        setIsLiveData(false)
        setIsAnalyzing(false)
        setNavLocked(false)
        showToast('warning', 'Analysis timed out', 'Showing sample data — the AI workflow took longer than 3 minutes. Try again with a shorter document.')
        setTimeout(dismissToast, 9000)
      }, MAX_MS)

      const analyzedAt = new Date().toISOString()
      const payload = new FormData()
      payload.append('file', selectedFile, selectedFile.name)
      payload.append('file_name', selectedFile.name)
      payload.append('file_type', selectedFile.type || 'application/octet-stream')
      payload.append('standard', 'IFRS16')
      payload.append('intent', intentOverride ?? analysisIntent)
      payload.append('analyzed_at', analyzedAt)

      try {
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), MAX_MS - 5000)
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: payload,
          signal: controller.signal,
        })
        webhookOk = res.ok
        if (!res.ok) {
          errorReason = `Service returned ${res.status} — showing sample data`
          throw new Error(`HTTP ${res.status}`)
        }
        const text = await res.text()
        clearTimeout(tid)
        try {
          let parsed = JSON.parse(text)
          if (Array.isArray(parsed)) parsed = parsed[0] ?? parsed
          responseData = parsed
        } catch {
          errorReason = 'Unexpected response format — showing sample data'
        }
      } catch (err) {
        console.error('[LegalGraph] Webhook error:', err.name, err.message)
        if (!errorReason) {
          errorReason = err.name === 'AbortError'
            ? 'Analysis timed out — showing sample data. Try again or upload a shorter document.'
            : 'Connection error — showing sample data. Check your network and try again.'
        }
      }

      clearInterval(heartbeat)
      if (safetyFired) return
      clearTimeout(safetyTimer)
    }

    // Enforce minimum display time — wait out the remainder if webhook was fast
    const elapsed = Date.now() - startMs
    if (elapsed < MIN_MS) {
      setProgress({ step: 6, label: 'Finalising report…', pct: 95 })
      await sleep(MIN_MS - elapsed)
    }

    setProgress({ step: 6, label: 'Extraction complete', pct: 100, done: true })

    const displayData = responseData ?? MOCK_ANALYSIS
    setAnalysisData(displayData)
    setIsLiveData(webhookOk && !!responseData)

    track('analysis_complete', {
      webhook_ok: webhookOk,
      risk_score: displayData?.risk_score ?? null,
      used_demo_data: !webhookOk,
    })

    if (webhookOk) {
      const fc = displayData?.terms_found?.length || MOCK_ANALYSIS.terms_found.length
      showToast('success', 'Extraction complete', `${fc} fields extracted · risk score ${displayData?.risk_score ?? '—'}`)
      setTimeout(dismissToast, 7000)
    } else if (errorReason) {
      showToast('error', 'Extraction failed', errorReason)
      setTimeout(dismissToast, 9000)
    }

    setIsAnalyzing(false)
    setNavLocked(false)
  }

  const sharedProps = {
    selectedFile, handleFileSelected, handleFileDrop, handleAnalyzeClick, handleReanalyzeAs,
    isAnalyzing, analysisData, isLiveData, progress, navLocked,
    analysisIntent, setAnalysisIntent,
    fieldEdits, setFieldEdits,
    showToast, dismissToast, theme, toggleTheme,
  }

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
      {showConsent && <ConsentModal onGrant={grantConsent} onDeny={() => setShowConsent(false)} />}
      <Routes>
        <Route path="/"          element={<Dashboard      {...sharedProps} />} />
        <Route path="/leases"    element={<LeaseAnalysis  {...sharedProps} isAnalyzing={isAnalyzing} progress={progress} />} />
        <Route path="/audit"     element={<AuditTrail     {...sharedProps} />} />
        <Route path="/playbooks" element={<Playbooks      navLocked={navLocked} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
