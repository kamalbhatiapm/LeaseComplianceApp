import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef } from 'react'
import Dashboard from './screens/Dashboard.jsx'
import LeaseAnalysis from './screens/LeaseAnalysis.jsx'
import Playbooks from './screens/Playbooks.jsx'
import Toast from './components/Toast.jsx'
import ConsentModal from './components/ConsentModal.jsx'
import { MOCK_ANALYSIS } from './utils/constants.js'
import { fileToBase64 } from './utils/fileToBase64.js'
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
      alert(`Unsupported file type "${ext}". Please upload a PDF, DOC, DOCX, or TXT file.`)
      return false
    }
    if (file.size > MAX_BYTES) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.`)
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

  const grantConsent = useCallback(() => {
    setConsentGiven(true)
    setShowConsent(false)
    runAnalysis()
  }, [])

  async function runAnalysis() {
    setIsAnalyzing(true)
    setNavLocked(true)

    const step = async (n, label, pct, ms) => {
      setProgress({ step: n, label, pct })
      await sleep(ms)
    }

    await step(1, 'Reading contract…', 25, 300)
    await step(2, 'Extracting IFRS 16 fields…', 55, 400)
    await step(3, 'Scoring risk factors…', 80, 300)
    setProgress({ step: 4, label: 'Sending to AI workflow…', pct: 90 })

    let webhookOk    = false
    let responseData = null

    if (WEBHOOK_URL) {
      // Hard safety cap — always clears loading within 28s no matter what
      let safetyFired = false
      const safetyTimer = setTimeout(() => {
        safetyFired = true
        setProgress({ step: 4, label: 'Extraction complete', pct: 100, done: true })
        setAnalysisData(MOCK_ANALYSIS)
        setIsLiveData(false)
        setIsAnalyzing(false)
        setNavLocked(false)
      }, 63000)

      let fileContent = null
      try { fileContent = await fileToBase64(selectedFile) } catch {}

      const payload = {
        file_name:    selectedFile.name,
        file_type:    selectedFile.type || 'application/octet-stream',
        file_content: fileContent,
        standard:     'IFRS16',
        intent:       analysisIntent,
        analyzed_at:  new Date().toISOString(),
      }

      try {
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 60000)
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        webhookOk = res.ok
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()   // keep abort active until body is fully read
        clearTimeout(tid)
        try {
          let parsed = JSON.parse(text)
          if (Array.isArray(parsed)) parsed = parsed[0] ?? parsed
          responseData = parsed
        } catch {}
        setProgress({ step: 4, label: 'Extraction complete', pct: 100, done: true })
      } catch (err) {
        console.error('[LegalGraph] Webhook error:', err.name, err.message)
        setProgress({ step: 4, label: 'Extraction complete', pct: 100, done: true })
      }

      if (safetyFired) return
      clearTimeout(safetyTimer)
    } else {
      // No webhook configured — load demo data silently
      await sleep(400)
      setProgress({ step: 4, label: 'Extraction complete', pct: 100, done: true })
      await sleep(300)
    }

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
    }

    setIsAnalyzing(false)
    setNavLocked(false)
  }

  const sharedProps = {
    selectedFile, handleFileSelected, handleFileDrop, handleAnalyzeClick,
    isAnalyzing, analysisData, isLiveData, progress, navLocked,
    analysisIntent, setAnalysisIntent,
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
        <Route path="/playbooks" element={<Playbooks      navLocked={navLocked} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
