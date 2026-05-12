import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/landing.css'

export default function Landing() {
  const navRef = useNavigate()
  const lpNavRef = useRef(null)

  useEffect(() => {
    const nav = lpNavRef.current
    if (!nav) return
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 10 ? '0 1px 40px rgba(0,0,0,.5)' : ''
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-page">
      {/* ── Nav ── */}
      <div className="lp-nav" ref={lpNavRef}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">Legal<span>Graph</span></div>
          <div className="lp-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#who-its-for">Who it's for</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="lp-nav-right">
            <button className="lp-btn lp-btn-ghost" onClick={() => navRef('/app')}>Sign in</button>
            <a href="#demo" className="lp-btn lp-btn-primary">Request demo</a>
          </div>
        </div>
      </div>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero-eyebrow">✦ IFRS 16 · ASC 842 · PCAOB AS 1105</div>
            <h1>Audit-Ready Lease Reports<br/>in <em>Under 45 Minutes</em></h1>
            <p className="lp-hero-sub">
              Finance teams managing 10–50 leases spend 40–60 hours per quarter on manual extraction and auditor back-and-forth.
              LegalGraph replaces that with AI extraction, clause citations, and a PCAOB AS 1105-compliant audit log — export-ready when your flags are clear.
            </p>
            <div className="lp-hero-ctas">
              <a href="#demo" className="lp-btn lp-btn-primary">Request demo</a>
              <a href="#how-it-works" className="lp-btn lp-btn-ghost">See how it works →</a>
            </div>
            <p className="lp-hero-proof">Trusted by finance teams managing 10–50 active leases</p>

            {/* UI Mock */}
            <div className="lp-hero-mock">
              <div className="lp-mock-topbar">
                <div className="lp-mock-dot lp-mock-dot-r"></div>
                <div className="lp-mock-dot lp-mock-dot-y"></div>
                <div className="lp-mock-dot lp-mock-dot-g"></div>
                <div className="lp-mock-url">app.legalgraph.com/leases/555-market-st-floor-12</div>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-score-card">
                  <div className="lp-mock-score-row">
                    <div className="lp-mock-ring"><div className="lp-mock-ring-val">62</div></div>
                    <div className="lp-mock-score-meta">
                      <span className="lp-mock-score-label">Risk Score</span>
                      <span className="lp-mock-score-val" style={{color:'#ff9f0a'}}>Medium Risk</span>
                      <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)'}}>62/100 · lower is better</span>
                    </div>
                  </div>
                  <div className="lp-mock-pills">
                    <span className="lp-mock-pill lp-mock-pill-blue">7 of 8 fields extracted</span>
                    <span className="lp-mock-pill lp-mock-pill-blue">IFRS 16 compliant</span>
                    <span className="lp-mock-pill lp-mock-pill-amber">4 flags to review</span>
                  </div>
                  <div style={{fontSize:'12px',color:'#30d158',display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#30d158',display:'inline-block'}}></span>
                    Strong extraction · 7 of 8 fields found
                  </div>
                </div>
                <div className="lp-mock-terms-card">
                  <div className="lp-mock-terms-header">Extracted Lease Terms</div>
                  <div className="lp-mock-term-row">
                    <span className="lp-mock-term-label"><span className="lp-mock-dot-conf lp-conf-high"></span>Commencement Date</span>
                    <span className="lp-mock-term-val">Jan 1, 2022</span>
                  </div>
                  <div className="lp-mock-term-row">
                    <span className="lp-mock-term-label"><span className="lp-mock-dot-conf lp-conf-high"></span>Annual Base Rent</span>
                    <span className="lp-mock-term-val">$348,000</span>
                  </div>
                  <div className="lp-mock-term-row">
                    <span className="lp-mock-term-label"><span className="lp-mock-dot-conf lp-conf-high"></span>Renewal Options</span>
                    <span className="lp-mock-term-val">2 × 5 years</span>
                  </div>
                  <div className="lp-mock-term-row">
                    <span className="lp-mock-term-label"><span className="lp-mock-dot-conf lp-conf-med"></span>Escalation Rate</span>
                    <span className="lp-mock-term-val">3% per annum</span>
                  </div>
                  <div className="lp-mock-term-row">
                    <span className="lp-mock-term-label"><span className="lp-mock-dot-conf lp-conf-low"></span>Discount Rate</span>
                    <span className="lp-mock-term-val" style={{color:'#ff453a'}}>⚠ Missing — enter IBR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="lp-section lp-problem" id="problem">
          <div className="lp-container">
            <div className="lp-section-header">
              <div className="lp-section-label">The problem</div>
              <h2 className="lp-section-title">Every quarter, the same 60-hour grind</h2>
              <p className="lp-section-sub">IFRS 16 and ASC 842 don't get easier with experience. They get more leases.</p>
            </div>
            <div className="lp-problem-grid">
              <div className="lp-problem-card">
                <div className="lp-problem-icon lp-problem-icon-red">📄</div>
                <h3>Manual extraction from PDFs</h3>
                <p>You open each lease, find the commencement date, rent schedule, renewal options, and escalation clauses — then copy them into an inherited Excel template. One lease at a time.</p>
                <span className="lp-problem-stat">20–40 min per lease</span>
              </div>
              <div className="lp-problem-card">
                <div className="lp-problem-icon lp-problem-icon-amber">🔍</div>
                <h3>No audit trail when the auditor asks</h3>
                <p>"What clause supports the ROU asset value of $2.1M?" You know it's in the lease. Finding the exact sentence takes 30–60 minutes of Ctrl+F. Sometimes you're not sure you found the right one.</p>
                <span className="lp-problem-stat">30–60 min per auditor question</span>
              </div>
              <div className="lp-problem-card">
                <div className="lp-problem-icon lp-problem-icon-blue">📉</div>
                <h3>The discount rate is never in the contract</h3>
                <p>IFRS 16.26 requires an incremental borrowing rate when the rate isn't stated. It isn't stated. Your spreadsheet shows an error. You email treasury and wait two days.</p>
                <span className="lp-problem-stat">The #1 activation blocker</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-container">
            <div className="lp-section-header">
              <div className="lp-section-label">How it works</div>
              <h2 className="lp-section-title">From PDF to audit-ready report — 3 steps</h2>
              <p className="lp-section-sub">No configuration. No training. Upload your lease and the report builds itself.</p>
            </div>
            <div className="lp-steps">
              <div className="lp-step">
                <div className="lp-step-line"></div>
                <div className="lp-step-num-wrap"><div className="lp-step-num">1</div></div>
                <div className="lp-step-content">
                  <h3>Upload your lease PDF</h3>
                  <p>Drag and drop your lease contract. LegalGraph reads the full document — not just the first page — and identifies the lease type, parties, and applicable standard (IFRS 16 or ASC 842) automatically. Processing completes in under 45 seconds.</p>
                  <div className="lp-step-mini-mock">
                    <span className="lp-step-mini-icon">📎</span>
                    <span style={{color:'var(--t1)',fontWeight:500}}>555-market-st-floor-12.pdf</span>
                    <span style={{marginLeft:'auto',color:'#30d158',fontWeight:600}}>✓ Uploaded</span>
                  </div>
                </div>
              </div>
              <div className="lp-step">
                <div className="lp-step-line"></div>
                <div className="lp-step-num-wrap"><div className="lp-step-num">2</div></div>
                <div className="lp-step-content">
                  <h3>AI extracts all IFRS 16 / ASC 842 fields</h3>
                  <p>Every material field — commencement date, expiry, annual rent, escalation rate, renewal options, ROU asset scope, and discount rate — is extracted with a confidence score and linked to the exact source clause in the original PDF. You verify exceptions, not every line.</p>
                  <div className="lp-step-mini-mock" style={{flexDirection:'column',alignItems:'flex-start',gap:'8px'}}>
                    <div style={{display:'flex',gap:'8px',width:'100%'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#30d158',marginTop:'3px',flexShrink:0}}></span>
                      <span style={{fontSize:'12px'}}><span style={{color:'var(--t1)',fontWeight:500}}>Annual Base Rent</span> <span style={{color:'var(--t2)'}}>· §5.1 · 96% confidence</span></span>
                    </div>
                    <div style={{display:'flex',gap:'8px',width:'100%'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ff9f0a',marginTop:'3px',flexShrink:0}}></span>
                      <span style={{fontSize:'12px'}}><span style={{color:'var(--t1)',fontWeight:500}}>Escalation Rate</span> <span style={{color:'var(--t2)'}}>· §5.3 · 74% — verify</span></span>
                    </div>
                    <div style={{display:'flex',gap:'8px',width:'100%'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ff453a',marginTop:'3px',flexShrink:0}}></span>
                      <span style={{fontSize:'12px'}}><span style={{color:'var(--t1)',fontWeight:500}}>Discount Rate</span> <span style={{color:'#ff9f0a'}}>· Not found — IBR guidance available</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lp-step">
                <div className="lp-step-num-wrap"><div className="lp-step-num">3</div></div>
                <div className="lp-step-content">
                  <h3>Resolve flags, export the audit log</h3>
                  <p>High-severity flags — missing fields, high-risk clauses — must be acknowledged before the export unlocks. When you're ready, export a PCAOB AS 1105-compliant PDF containing all extracted values, source clause citations, AI model disclosure, and your sign-off.</p>
                  <div className="lp-step-mini-mock">
                    <span className="lp-step-mini-icon">🔒</span>
                    <span style={{color:'var(--t2)'}}>2 flags unresolved — export locked</span>
                    <span style={{marginLeft:'auto',padding:'4px 12px',background:'rgba(0,113,227,.18)',color:'#5ac8fa',borderRadius:'980px',fontSize:'11px',fontWeight:600}}>Resolve →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="lp-section lp-personas" id="who-its-for">
          <div className="lp-container">
            <div className="lp-section-header">
              <div className="lp-section-label">Who it's for</div>
              <h2 className="lp-section-title">Built for the compliance lead<br/>who owns lease accounting</h2>
            </div>
            <div className="lp-persona-grid">
              <div className="lp-persona-card">
                <div className="lp-persona-avatar lp-persona-avatar-r">RC</div>
                <div className="lp-persona-role">Primary User</div>
                <div className="lp-persona-name">Rachel — Compliance Lead</div>
                <p className="lp-persona-desc">Manages 10–50 active leases and is responsible for quarterly IFRS 16 / ASC 842 filings. Currently spending 40–60 hours per quarter manually extracting fields, building amortization schedules, and preparing audit packages in Excel.</p>
                <div className="lp-persona-quote">"The first time an auditor asked me to show the clause, I spent an hour going through the PDF. I can't do that for 30 leases."</div>
              </div>
              <div className="lp-persona-card">
                <div className="lp-persona-avatar lp-persona-avatar-j">JC</div>
                <div className="lp-persona-role">Economic Buyer</div>
                <div className="lp-persona-name">Jennifer — CFO</div>
                <p className="lp-persona-desc">Signs off on audit submissions and sets the standard for what constitutes acceptable AI-assisted output. Needs to know that AI-generated numbers have human review sign-off, full data lineage, and won't create a revision request from the external auditor.</p>
                <div className="lp-persona-quote">"What happens if the AI gets it wrong? I need to be able to show the auditor exactly where each number came from."</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lp-section" id="features">
          <div className="lp-container">
            <div className="lp-section-header">
              <div className="lp-section-label">Features</div>
              <h2 className="lp-section-title">Everything the auditor will ask for — already in the report</h2>
            </div>
            <div className="lp-features-grid">
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">🟢</div>
                <h3>Per-field confidence scores</h3>
                <p>Green, amber, and red dots show you exactly which fields the AI is certain about and which ones need a second look. Focus your 45 minutes on exceptions, not every row.</p>
              </div>
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">📌</div>
                <h3>Clause citations</h3>
                <p>Every extracted value links back to the exact sentence in the original PDF. When the auditor asks, you click — you don't search. This is the feature that stops revision requests.</p>
              </div>
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">📐</div>
                <h3>IBR guidance</h3>
                <p>When the discount rate is missing (it almost always is), LegalGraph shows you the IFRS 16.26 methodology, the calculation approach, and where to get the rate from treasury — inline, no interruptions.</p>
              </div>
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">📋</div>
                <h3>PCAOB AS 1105 cover page</h3>
                <p>Every exported report includes AI model disclosure, human review sign-off, analyzed date, and per-field data lineage — exactly what auditors now require under the December 2025 amendment.</p>
              </div>
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">🔒</div>
                <h3>Export gate</h3>
                <p>High-severity flags must be acknowledged before the PDF export unlocks. Incomplete reports can't be submitted by mistake — the gate is enforced, not advisory.</p>
              </div>
              <div className="lp-feature-tile">
                <div className="lp-feature-icon">✏️</div>
                <h3>Edit-in-place</h3>
                <p>Correct any AI extraction error directly in the UI. Every correction is tracked, timestamped, and appears in the audit log — so the auditor can see what changed and why.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Bar ── */}
        <section className="lp-trust">
          <div className="lp-container">
            <h2>Built for the post-PCAOB AS 1105 world</h2>
            <p>PCAOB amended Auditing Standard No. 1105, effective December 2025. Any AI-generated financial output now requires full audit trail, per-field data lineage, and human review sign-off documented in the filing. LegalGraph generates all three automatically — so your auditor doesn't have to ask.</p>
            <div className="lp-trust-badges">
              <div className="lp-trust-badge"><span className="lp-trust-badge-dot"></span> IFRS 16 compliant</div>
              <div className="lp-trust-badge"><span className="lp-trust-badge-dot"></span> ASC 842 compliant</div>
              <div className="lp-trust-badge"><span className="lp-trust-badge-dot"></span> PCAOB AS 1105 audit trail</div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="lp-section lp-pricing" id="pricing">
          <div className="lp-container">
            <div className="lp-section-header" style={{textAlign:'center'}}>
              <div className="lp-section-label">Pricing</div>
              <h2 className="lp-section-title">Pays for itself in the first quarter</h2>
              <p className="lp-section-sub" style={{margin:'0 auto'}}>No per-field charges. No setup fees. Cancel any time.</p>
            </div>

            <div className="lp-roi-block">
              <div className="lp-roi-item">
                <div className="lp-roi-val">40–60 hrs</div>
                <div className="lp-roi-label">per quarter in manual extraction — validated across 3 customer interviews</div>
              </div>
              <div className="lp-roi-divider"></div>
              <div className="lp-roi-item">
                <div className="lp-roi-val">~$75,000</div>
                <div className="lp-roi-label">in analyst time saved per year on 50 leases (5 hrs × 4 qtrs × $75/hr loaded cost)</div>
              </div>
              <div className="lp-roi-divider"></div>
              <div className="lp-roi-item">
                <div className="lp-roi-val">~4×</div>
                <div className="lp-roi-label">return on Growth plan in year one ($75k saved ÷ $17,988/yr)</div>
              </div>
            </div>

            <div className="lp-pricing-grid">
              <div className="lp-pricing-card">
                <div className="lp-pricing-tier">Starter</div>
                <div className="lp-pricing-price">$699<span>/mo</span></div>
                <div className="lp-pricing-limit">Up to 15 leases per quarter</div>
                <div className="lp-pricing-annual">or $583/mo billed annually — save 2 months</div>
                <ul className="lp-pricing-features">
                  <li>IFRS 16 and ASC 842 extraction</li>
                  <li>Per-field confidence scores</li>
                  <li>Clause citations (source PDF link)</li>
                  <li>PCAOB AS 1105 audit log export</li>
                  <li>Edit-in-place with correction tracking</li>
                </ul>
                <a href="#demo" className="lp-btn lp-btn-ghost" style={{width:'100%',justifyContent:'center'}}>Request demo</a>
              </div>
              <div className="lp-pricing-card featured">
                <div className="lp-pricing-best">Most popular</div>
                <div className="lp-pricing-tier">Growth</div>
                <div className="lp-pricing-price">$1,499<span>/mo</span></div>
                <div className="lp-pricing-limit">Up to 50 leases per quarter</div>
                <div className="lp-pricing-annual">or $1,249/mo billed annually — save 2 months</div>
                <ul className="lp-pricing-features">
                  <li>Everything in Starter</li>
                  <li>IBR / discount rate guidance</li>
                  <li>Auditor share link (read-only)</li>
                  <li>Portfolio dashboard with status tracking</li>
                  <li>Priority support + onboarding call</li>
                </ul>
                <a href="#demo" className="lp-btn lp-btn-primary" style={{width:'100%',justifyContent:'center'}}>Request demo</a>
              </div>
            </div>
            <p className="lp-pricing-note">
              Managing 50+ leases or need multi-entity support?{' '}
              <a href="#demo" style={{color:'var(--brand)'}}>Talk to us about Enterprise →</a>
            </p>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="lp-cta-section" id="demo">
          <div className="lp-container">
            <h2>Stop spending 60 hours a quarter on lease accounting</h2>
            <p>Get a demo with your own lease PDF in under 30 minutes.</p>
            <a href="mailto:demo@legalgraph.com" className="lp-btn lp-btn-primary">Request demo</a>
            <a className="lp-cta-secondary" href="#">Or download a sample IFRS 16 audit report →</a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">Legal<span>Graph</span></div>
          <div className="lp-footer-tagline">AI-assisted, human-reviewed lease compliance</div>
          <div className="lp-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#demo">Contact</a>
            <button
              className="lp-btn lp-btn-ghost"
              style={{fontSize:'13px',padding:'4px 14px'}}
              onClick={() => navRef('/app')}
            >
              Launch app →
            </button>
          </div>
          <p className="lp-footer-disclaimer">AI-assisted — requires human review — not legal or financial advice</p>
          <p className="lp-footer-copy">© 2026 LegalGraph. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
