const getSteps = (intent) => {
  const std = intent === 'asc842_compliance' ? 'ASC 842' : 'IFRS 16'
  return [
    'Identifying lease type and parties',
    'Finding commencement date, rent schedule, and renewals',
    `Checking lease terms against ${std} requirements`,
    'Generating your audit-ready report',
  ]
}

export default function ProgressPanel({ file, progress, analysisIntent }) {
  const STEPS = getSteps(analysisIntent)
  const { step, label, pct, error } = progress

  return (
    <div className="progress-panel" aria-live="polite" aria-label="Analysis progress">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{file?.name ?? '—'}</span>
        <span className={`pill pill-sm ${pct === 100 && !error ? 'pill-green' : 'pill-brand'}`}>
          {pct === 100 ? 'Complete' : 'Analyzing…'}
        </span>
      </div>

      {STEPS.map((name, i) => {
        const stepN = i + 1
        const isDone   = stepN < step || (stepN === step && pct === 100)
        const isActive = stepN === step && pct < 100
        const isError  = isDone && stepN === 4 && error
        return (
          <div
            key={name}
            className={`progress-step ${isDone ? (isError ? 'error done' : 'done') : isActive ? 'active' : ''}`}
          >
            <span className="step-dot" />
            {name}
          </div>
        )
      })}

      <div className="progress-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-meta">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}
