# Product Requirements Document: IFRS 16 / ASC 842 Lease Compliance Reporting

**Status:** In Review
**Author:** Senior PM, LegalGraph
**Reviewer:** Priya Sharma (Head of Product)
**Date:** 2026-05-08
**Last Updated:** 2026-05-08 (v2.1 — gap patches: L3 metrics, ASC 842 story, bulk export story, email-to-auditor story, GA+1 stories, guardrail stop-and-fix, D2/D3 trust threshold ACs)
**Supersedes:** project-context/PRD v1.0.md (2026-03-31) — full rewrite incorporating JTBD v1.1, USER-JOURNEY v1.1, market research, and user research (May 2026)
**Context files read:** company-context/company-overview.md · user-personas.md · product-description.md · competitive-landscape.md · project-context/JTBD.md (v1.1) · USER-JOURNEY.md (v1.1) · PRD v1.0.md · outputs/market-research-legal-ai-2026.md · outputs/user-research-legal-ai-2026.md · templates/prd-template.md

---

## 1. Introduction & Context

### Problem / Opportunity Statement

**Objective:** Build the end-to-end IFRS 16 / ASC 842 lease compliance reporting workflow that enables mid-market finance and compliance teams to generate audit-ready reports from raw contract PDFs — in under 45 minutes per quarter, with clause-level evidence that external auditors accept without revision requests.

**The problem today:**

Rachel (Compliance Lead) manages 10–50 active leases and is responsible for quarterly IFRS 16 / ASC 842 compliance reporting. Her current process:

1. Opens a shared drive of lease PDFs — often disorganized, inconsistently named
2. Manually extracts key fields (rent, commencement date, term, renewal options, discount rate) into an inherited Excel template — 20–40 minutes per lease
3. Calculates ROU asset and liability amortization schedules manually — error-prone if any formula is touched
4. Formats the output into a narrative for her external auditor — another 30–60 minutes
5. When the auditor asks *"what clause supports the ROU asset value of $2.1M?"* — hunts through PDFs using Ctrl+F for 30–60 minutes

**Total time:** 4–6 hours per lease, per quarter. For 10 leases: 40–60 hours/quarter. For 50 leases: 200–300 hours/quarter. This is unsustainable.

**The regulatory catalyst — PCAOB AS 1105 (effective December 2025):**

The PCAOB amended Auditing Standard No. 1105 and AS 2301, effective for fiscal years beginning December 15, 2025. The amendment requires full audit trail and explainability for AI-generated financial outputs — including per-field data lineage, documentation of the AI model used, human review sign-off, and the ability for auditors to verify AI outputs against source documents independently. This creates:
- A new compliance requirement that legacy tools (EZLease, early-vintage FinQuery implementations) cannot satisfy without significant retooling
- A built-in differentiation wedge for LegalGraph, which can architect PCAOB AS 1105 compliance from day one
- Increasing auditor scrutiny of any AI-assisted compliance filing in 2026 and beyond

**The competitive opportunity:**

Two market shifts create an open window heading into 2026:
- **CoStar acquired Visual Lease (November 2024):** Mid-market Visual Lease customers are facing integration disruption and an upmarket sales motion. Their 10–50 lease accounts are actively re-evaluating (source: Visual Lease post-acquisition communications, November 2024).
- **LeaseQuery rebranded to FinQuery (February 2024):** Expanding from lease accounting to broader "contract and spend intelligence." Creating positioning confusion for their mid-market base and diluting lease-specific depth.

Both moves leave the 10–50 lease mid-market segment with no clear preferred vendor. The only AI-native competitor in this tier is Trullion (~$3K/year, founded 2020) — differentiated on abstraction but not on full audit-defense workflow quality (source: Trullion G2 reviews, market-research-legal-ai-2026.md).

---

### Key Observations, Data & Insights

**Finding 1: Rachel logs in four times a year — re-entry UX is as important as core workflow**

> "Rachel logs in four times a year under deadline pressure. Every screen must be operable by someone who hasn't touched the tool in 90 days." — USER-JOURNEY.md v1.1

Re-entry disorientation under quarterly deadline pressure is the leading cause of session abandonment to Excel. The dashboard's single most critical element — a "leases ready to report / leases needing attention" split counter (J3) — does not yet exist. The product currently shows static demo portfolio data regardless of the user's actual analysis history (BUG-009).

**Finding 2: Trust is built per-field, not by headline accuracy claims**

> Only 13.5% of finance professionals use AI tools today vs. 80.5% who believe they will be standard in 5 years. 21.3% cite trust as the leading barrier. — Deloitte AI Finance Survey, 2025

Rachel's trust-building sequence (user-research-legal-ai-2026.md, Finding 2):
1. Uploads a known lease as a ground-truth test
2. Spot-checks 2–3 high-value fields against the source PDF
3. **If she edits >3 fields due to AI errors, she concludes LegalGraph is not faster than manual extraction and abandons** — the critical firing threshold
4. The first time a clause citation opens source text inline (BUG-006), she stops opening the PDF manually — this is the "trust anchor"

**Finding 3: The discount rate (IBR) is the most common activation blocker**

The incremental borrowing rate (IBR) required by IFRS 16.26 is almost never specified in the lease contract itself. When LegalGraph flags "Discount rate missing — High severity," Rachel has no guidance on how to calculate or source the IBR. This is the single most common point where Rachel stalls, dismisses the flag, or abandons the session. Dismissing unresolved High flags degrades report quality and auditor acceptance rates (JTBD J9, USER-JOURNEY Phase 4).

**Finding 4: Auditor acceptance — not activation — is the real retention metric**

> Rachel's north star job is not "analyze a contract in LegalGraph." It is "hand audit-ready output to external auditors without a revision request." — user-research-legal-ai-2026.md, Finding 4

PCAOB AS 1105 enforcement means auditors are now specifically evaluating whether AI-generated financial outputs have full data lineage and human review sign-off. Trullion's top-rated G2 feature is clause-to-source navigation for exactly this use case. An auditor who accepts Rachel's LegalGraph report converts her into a reference customer. An auditor who questions it sends her back to Excel. Auditor acceptance rate (L1-4) is the lagging retention metric; clause citations (BUG-006) is the feature that makes it achievable.

**Finding 5: Persistent storage is a retention prerequisite, not a feature**

Without persistent per-account analysis history (BUG-009), Rachel starts from scratch every quarter — no memory of resolved flags, no saved IBR, no portfolio status. Compound value ("it remembered where I left off") is the conversion from useful tool to indispensable platform. Every feature that depends on historical state — J3 (portfolio status), J5 (amendment tracking), J7 (David's term lookup), J8 (batch session workflow), J10 (internal sign-off audit trail) — is blocked until BUG-009 is resolved.

**Finding 6: Jennifer approves in 30 minutes based on four specific questions**

From JTBD J6 and USER-JOURNEY Journey B: Jennifer's four evaluation questions, in order:
1. "Where does our contract data go?" — requires Anthropic Claude API named in consent modal + DPA
2. "Will auditors accept this?" — requires clause trail + report gate + PCAOB AS 1105 one-pager
3. "What does it cost?" — requires ROI data: Rachel's ~$14–20K/year labour cost (4–6 hours × $300/hr × 4 quarters × 10 leases) vs. LegalGraph pricing
4. "What happens if it's wrong?" — requires "not legal advice" disclaimer + human review requirement + manually-verified badges

The consent modal, report cover page, and DPA template are Jennifer-facing UX — deal conversion levers as important as Rachel's workflow.

**Finding 7: The mid-market (10–50 leases) is underserved and conversion-ready**

- 59% of accountants make several errors monthly with manual processes; fraud and misstatements 80–90% more common in spreadsheet environments (Gartner, 2025)
- Many private mid-market companies still use spreadsheets for ASC 842 compliance — FASB Private Company Council confirms (June 2025)
- Software strongly recommended at 10+ leases — exact LegalGraph ICP
- EZLease ($4K/yr) is the price floor but lacks AI, clause citations, and PCAOB AS 1105 compliance
- LegalGraph's upgrade story from EZLease: "when your auditor starts asking for clause evidence, you need LegalGraph"

---

### Impact Sizing

**Qualitative Impact:**

- *Rachel:* Quarter-end reporting drops from 40–60 hours to <8 hours (for a 10-lease portfolio). Auditor questions answered in 2 minutes vs. 30–60 minutes. From reactive reporter to proactive compliance manager.
- *Jennifer:* Full audit trail satisfies PCAOB AS 1105; AI model disclosure eliminates surprise. Quarterly sign-off flow creates personal accountability artefact for board reporting.
- *David:* Lease term lookup in <2 minutes without interrupting Rachel. Independence before negotiations.
- *External Auditor:* Clause-level evidence per field; PCAOB AS 1105 compliance documentation inline. Faster fieldwork; no revision requests.

**Quantitative Impact:**

| Metric | Baseline | Target | Impact |
|---|---|---|---|
| Time per lease per quarter (Rachel) | 4–6 hours | <45 minutes | ~87% reduction; ~$1,200 labour saving per lease per quarter at $300/hr |
| Auditor revision request rate | Unknown (estimated ~30–40%) | <5% | Eliminates resubmission cycles; reference customer conversion |
| Activation rate (first extraction <14 days) | 55% (company baseline) | ≥70% | +15pp; ~27% more activated accounts per cohort |
| Report generation rate per quarter | 0% (pre-launch) | ≥80% of active accounts | Direct revenue retention signal |
| Enterprise deal size | $45K/year | $85K/year (OKR target) | Jennifer's sign-off required; J10 + PCAOB one-pager enable this |
| ARR opportunity (Visual Lease displacement) | — | $500K–$1.5M | 3–5% of 1,500 VL mid-market customers at $10–20K/year |

---

## 2. Goals & Metrics

### Success Metrics

**North Star:** Audit-ready compliance reports generated per active account per quarter.
*Rationale:* Accounts generating reports do not churn. Reports accepted by auditors generate reference customers. This metric captures both activation and retention in a single signal.
*Baseline:* 0 (pre-launch) · *Year 1 target:* ≥1 report/quarter across ≥80% of active accounts

| # | Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|---|
| **L1-1** | Activation rate | % of new accounts completing a first extraction within 14 days of signup | 55% (company) | **≥70%** | 30 days post-launch |
| **L1-2** | Report generation rate | % of active accounts generating ≥1 IFRS 16/ASC 842 report per quarter | 0% | **≥80%** | 90 days post-launch |
| **L1-3** | AI extraction accuracy | % of lease fields correctly extracted vs. ground truth across ≥20 live contracts | 94% (1 contract) | **≥94% sustained** | At launch |
| **L1-4** | Auditor acceptance rate | % of reports submitted to auditors accepted without revision requests | Unknown | **≥95%** | 6 months post-launch |

**L2 Diagnostic Metrics — Under L1-1 (Activation):**
- Time to first extraction: P50 target <10 min from first login (J0)
- File upload success rate: target >99%
- Consent modal completion rate
- IBR flag resolution rate: % of "discount rate missing" flags resolved vs. dismissed (J9 target: >80%)
- First extraction → first report conversion rate (Journey D → Journey A bridge)

**L2 Diagnostic Metrics — Under L1-2 (Report Generation):**
- % of leases with all High-severity flags resolved before export gate
- Time from first extraction to report export: P50 target <45 minutes
- Average leases processed per session for accounts with 8+ leases (J8 batch efficiency)
- Session drop-off rate by phase (Phase 4 — flag resolution — is highest-risk drop-off point)

**L2 Diagnostic Metrics — Under L1-3 (Extraction Quality):**
- Per-field accuracy by field type (discount rate is known weak field)
- Edit-mode session rate per field per account (declining = trust building; target: declining over successive quarters)
- False-positive flag rate (flags raised that users manually dismiss without resolution)

**L2 Diagnostic Metrics — Under L1-4 (Auditor Acceptance):**
- Clause citation accuracy (auditor source-clause lookups that resolve correctly)
- False-negative flag rate (risks surfaced by auditors that LegalGraph missed)
- Beta DPA signed within 14 days of Rachel's first analysis session (J6/J10 metric)

**L3 Metrics — Operational Health (gates for regulated pilots):**

| Metric | Target | Gate |
|---|---|---|
| Webhook success rate | ≥99.5% | All accounts |
| p95 analysis latency | <8 seconds | All accounts |
| HHH eval score (Helpful, Honest, Harmless) | ≥90/105 (Harmless ≥25/35) | Required for regulated pilots (insurance, banking) |
| RAI eval score (Responsible AI) | ≥96/112 | Required for insurance/banking sector accounts |
| Automated eval pass rate | 11/11 maintained | Regression gate — blocks any model update that drops a test |

*L3 metrics are not customer-visible but gate regulated-sector pilots. Jennifer's InfoSec review will ask for HHH/RAI scores for financial services accounts.*

---

### Guardrail Metrics

These cap what is permitted while optimising for the North Star. A guardrail breach triggers a stop-and-fix response regardless of North Star movement.

**Stop-and-fix procedure:** On any guardrail breach — (1) Engineering Lead is paged immediately; (2) affected feature is disabled via feature flag within 1 hour; (3) impacted accounts are notified within 24 hours; (4) post-mortem completed within 5 business days before re-enabling.

| Guardrail | Threshold | Protects Against |
|---|---|---|
| "Not legal advice" disclaimer always visible on analysis screen | 100% of results views | Legal liability |
| Consent modal fires before every new session (once-per-session after J8 fix) | 100% — no bypass | GDPR / data-processing compliance |
| Report gate enforced — High flags block export | 100% | Auditor receiving unreviewed material risks |
| Anthropic Claude API named in consent modal | 100% of consents | Jennifer's data governance evaluation (J6) |
| AI extraction accuracy floor | ≥90% | Trust erosion and churn — Rachel fires us at >3 wrong fields per contract |
| Webhook success rate | ≥99.5% | Mid-session abandonment (a leading churn signal) |

---

### Leading vs. Lagging Indicators

| Type | Signal | Predicts | Action if Declining |
|---|---|---|---|
| **Leading** | Upload rate in week 1 post-signup | L1-1 Activation | Trigger onboarding nudge; audit upload UX |
| **Leading** | IBR flag resolution rate (J9) | L1-2 Report generation | Investigate IBR guidance copy and calculator |
| **Leading** | Phase 4 (flag resolution) completion rate | L1-2 Report generation | Friction in flag resolution flow |
| **Leading** | Edit-mode session rate per account | L1-3 AI trust | High = users don't trust AI; investigate accuracy |
| **Leading** | Days between first extraction and report export | L1-4 Auditor acceptance | >2 days = friction; audit flag resolution flow |
| **Lagging** | Auditor revision request rate (L1-4) | Retention | BUG-006 likely cause; investigate clause citation quality |
| **Lagging** | Net retention rate — enterprise | Revenue | Monthly cohort analysis; churn interview if <92% |
| **Lagging** | DPA signed within 14 days (J6) | Enterprise deal size | Jennifer enablement materials not landing |

---

## 3. Risks & Assumptions

### Known Risks

**Technical Risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| BUG-009 (persistent storage) blocks 7+ dependent features | Critical | P0 priority; no new features that depend on history ship until resolved |
| BUG-006 (clause PDF viewer) blocks audit defense and trust anchor | Critical | P0 GA blocker; ship before any new workflow feature |
| Webhook timeout rate >0.5% causes mid-session abandonment | High | 25s timeout with clear error message + retry; monitor webhook p95 latency |
| n8n confidence score pipeline (Phase 1) not live at GA | Medium | Color dot UI present; static confidence display as fallback; wire to real scores in first sprint post-GA |
| AI extraction accuracy below 90% on complex leases (variable rent, CPI escalation, subleases) | High | Explicit "AI uncertain" flag on complex clause types; edit-in-place fallback; accuracy benchmarked on ≥20 contracts before launch |

**Product Risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| Rachel edits >3 fields per contract (critical firing threshold) | High | Onboarding guidance to start with simple fixed-rent leases (J0 — Journey D); accuracy floor guardrail |
| IBR flag causes session abandonment before first report (most common stall) | High | J9 IBR guidance copy as P0 — no engineering required; copy change only |
| Auditor receives incomplete PDF export (missing clause trail) | Critical | Full PDF structure (cover page, clause citations, audit trail) required at GA; enforce report gate |
| Jennifer blocks purchase due to data governance concern | Medium | Consent modal names Anthropic Claude API; DPA template produced pre-launch; PCAOB AS 1105 one-pager for sales |
| Consent fatigue in multi-lease sessions (J8) | Medium | Once-per-session consent as P1 GA fix |

**Market Risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| Trullion expands audit-defense workflow before LegalGraph ships BUG-006 | High | Ship BUG-006 as P0; compete on PCAOB AS 1105 compliance documentation (Trullion has not published this) |
| PCAOB AS 1105 enforcement slower than anticipated — reduces urgency of audit trail features | Low | Features are high-value regardless of enforcement timing; Rachel benefits from clause citations independent of auditor requirements |
| Visual Lease mid-market customers renew before LegalGraph can displace | Medium | Proactive outbound displacement campaign Q2 2026; migration one-pager ready before renewals |
| FinQuery reverses rebrand and re-focuses on lease accounting | Low | Monitor; LegalGraph advantage is AI-native architecture; FinQuery's pivot is capital-intensive to reverse |

**Assumptions and Confidence Levels:**

| Assumption | Confidence | Source |
|---|---|---|
| Rachel spends 4–6 hours/quarter on compliance prep | **High** | Validated in 3 customer interviews (PRD v1.1 §8) |
| Auditors will accept AI-generated reports if clause trail is present | **Medium** | PCAOB AS 1105 guidance + Trullion G2 reviews; needs direct auditor validation call |
| 94% overall extraction accuracy holds for IFRS 16-specific fields | **Medium** | Overall accuracy benchmarked on 1 contract; needs ≥20-contract benchmark |
| IFRS 16 is right to prioritize over ASC 842 in V1 | **Medium** | Most of 45 enterprise accounts are international; CFO confirmation needed |
| IBR guidance copy will reduce flag abandonment rate | **Medium** | Based on user research synthesis; needs post-launch measurement to confirm |
| Customers will upload all leases (not just a sample) to LegalGraph | **Low** | Behavior change assumption; trust-building is prerequisite |

---

## 4. Scope

### In-Scope (GA)

**Core Compliance Workflow (J0 → J1 → J2):**
- IFRS 16 / ASC 842 lease term extraction from uploaded PDF contracts
- AI-generated compliance report with structured field output (commencement date, lease term, renewal options, payment schedule, discount rate, ROU asset value)
- Risk flag surfacing with severity classification (High / Medium / Low) and resolution gate (High flags block report export)
- Clause-level audit trail: every field links to source clause text (BUG-006 — GA blocker)
- PDF report export: cover page (AI model disclosure, "AI-assisted, human-reviewed" language), per-field table with clause citations, flag resolution log, audit trail (PCAOB AS 1105 compliance)

**Portfolio Management (J3, J8):**
- Persistent per-account storage of analysis history across sessions (BUG-009 — P0)
- Dashboard "Ready to report / Needs attention" counter with per-lease status
- Session-level progress tracker: "X of Y leases complete" for batch sessions
- Once-per-session consent (vs. once-per-analysis) for multi-lease workflows

**Flag Resolution (J9):**
- IBR / discount rate flag: "What do I do?" action guidance block with IFRS 16.26 methodology, IBR calculation approach, and save-as-default for portfolio
- Other flag guidance: variable rent, lease term ambiguity, sublease detected

**Internal Sign-Off (J10):**
- "Request internal review" button on completed report
- Email-based approval flow for Jennifer/CFO (no LegalGraph login required for approver)
- Approval logged in audit trail and visible on report cover page

**Activation (J0 — Journey D):**
- First-lease onboarding prompt: recommend starting with a simple fixed-rent lease
- Post-extraction "first win" prompt: "Your extraction looks complete — resolve 2 flags and generate your first report"

**Multi-Standard Support (conditional on OQ#2):**
- IFRS 16 / ASC 842 toggle: generate reports in either standard from a single extraction — see Story R9
- Engineering estimate: +2 weeks scope if shipped at GA; deferred if OQ#2 answer is "IFRS 16 only first"

**Bulk Report Export:**
- One-click "Export all ready leases" action from the portfolio dashboard — generates reports for all leases with no unresolved High flags in a single action — see Story R11

**Email Delivery to Auditor:**
- Send the approved compliance report directly to specified auditor email addresses from within LegalGraph — see Story R10

---

### Out-of-Scope (V1 GA)

1. **Auditor portal (GA+1):** Read-only shareable link for auditors; no LegalGraph account required. Planned post-GA as competitive moat — no mid-market competitor has shipped this.
2. **Amendment delta view (GA+1):** Mid-quarter detection of changes vs. prior analysis; requires BUG-009 as foundation.
3. **Equipment and vehicle leases:** V1 focuses on real estate/office leases. Equipment lease structure variations add extraction complexity.
4. **ERP data sync:** Journal entry posting to NetSuite/SAP is an enterprise-tier V1.1 feature when deal size warrants integration investment.
5. **Accounting journal entries (DR/CR):** We generate the compliance report; Rachel's accounting team handles booking. Creating liability if wrong.
6. **SOX compliance reporting:** Different workflow, different persona, different audit standard. Deferred.
7. **Multi-party lease review (3+ parties):** Edge case with significant extraction complexity.
8. **IBR calculation as a financial service:** LegalGraph provides guidance and tooling to help Rachel calculate her IBR; not a financial calculation service (creates advice liability).
9. **Historical data migration:** Customers upload contracts; we do not migrate from prior tools.
10. **Automated negotiation or contract redlining:** Separate product initiative (Contract Negotiation Assistant, separate PRD).

---

## 5. User Stories

### Persona 1: Rachel — Compliance Lead (Primary User)

---

**Story R1 — First Activation (J0)**

*As a compliance lead evaluating LegalGraph for the first time, I want to upload my most familiar lease — one I know inside-out — and verify that the AI extracts the key fields correctly within 30 minutes, so I can decide whether to trust the platform with my quarterly reporting cycle before investing more time.*

**Acceptance Criteria:**
- [ ] Upload flow completes to extracted terms in <10 minutes from first login
- [ ] Onboarding prompt suggests starting with a simple fixed-rent lease; explains why
- [ ] Extracted terms grid is the first visible section post-analysis (correct — live)
- [ ] Post-extraction prompt for first-time users: "Your extraction looks complete. Want to resolve the 2 flags and generate your first report?"
- [ ] IBR flag displays "What do I do?" guidance block on first-time trigger (see R5)
- [ ] After first report generation, activation event is logged (L1-1 metric)

**Design constraint — D2/D3 trust thresholds (USER-JOURNEY Journey D):**
- ≤2 wrong fields: Rachel trusts the tool and continues
- 3 wrong fields: Rachel is uncertain; she tries one more lease before deciding
- >3 wrong fields: Rachel concludes the AI isn't ready and abandons — **this is the critical firing threshold**
- Design implication: onboarding must steer Rachel toward a simple fixed-rent lease (high accuracy probability), not her most complex lease. A complex first lease that returns >3 errors on unfamiliar fields will fail even if the AI is technically correct on the harder fields.
- The IBR guidance (R5) is as critical to activation as BUG-006: if the discount rate flag fires on the first analysis (highly likely) with no guidance, Rachel hits a dead end on her very first lease.

*Research grounding: USER-JOURNEY Journey D (D2 trust threshold, D3 activation event); JTBD J0; user-research Finding 1*

---

**Story R2 — Quarterly Re-entry (J3)**

*As a compliance lead returning after 90 days, I want to see immediately — in under 60 seconds of login — how many leases are ready to report and how many still have unresolved flags, so I can triage my quarterly session without spending time rediscovering the state of each lease.*

**Acceptance Criteria:**
- [ ] Dashboard header shows: "X leases ready to report | Y leases need attention | Z leases not yet analysed"
- [ ] Portfolio table shows per-lease status (ready / flags unresolved / not yet run), last-analysed date, upcoming expiry warnings (90-day, 30-day thresholds in color)
- [ ] Status reflects actual analysis history from persistent storage (BUG-009 required)
- [ ] Rachel can navigate directly to a flagged lease from the dashboard counter in one click
- [ ] Empty state for new accounts shows sample portfolio data clearly labeled as demo, with an upload CTA

*Research grounding: USER-JOURNEY Phase 1; JTBD J3; user-research Finding 1*

---

**Story R3 — Extract Lease Terms and Trust AI Output (J1, J4)**

*As a compliance lead, I want to upload a lease PDF and have AI extract all material IFRS 16 fields — with per-field confidence indicators and clause source references — so I can verify only the uncertain fields and spend my time on exceptions, not line-by-line review.*

**Acceptance Criteria:**
- [ ] Extraction completes in <25 seconds for standard fixed-rent leases (25s timeout currently in place)
- [ ] Extracted fields include: commencement date, lease term, renewal options, payment schedule, discount rate, ROU asset value
- [ ] Per-field clause section reference visible in the extracted terms grid (live — correct)
- [ ] Per-field confidence dots (green/amber/red) populated from n8n extraction pipeline (n8n Phase 1)
- [ ] Edit-in-place available for any field; edited fields marked "manually verified" with editor name + timestamp (live)
- [ ] For first-time users: green dots = skip, amber = spot-check, red = verify and edit — explained in a one-time tooltip on first review
- [ ] Upload supports scanned PDFs (low quality); returns clear error if scan quality prevents extraction

*Research grounding: USER-JOURNEY Phase 3; JTBD J4; user-research Finding 2 (trust anchor)*

---

**Story R4 — Answer an Auditor Question from the Report (J2)**

*As a compliance lead during audit fieldwork, I want to click any field in the compliance report and see the exact clause text from the original contract — section number, page reference, and surrounding context — so I can reply to the auditor in under 2 minutes with a specific citation.*

**Acceptance Criteria:**
- [ ] Every extracted field has a clickable clause citation that opens source clause text inline — no new tab (BUG-006 — GA blocker)
- [ ] Clause viewer shows: section number, page reference, full clause paragraph text, surrounding context (50 words before/after)
- [ ] Clause links remain active on historical analyses across sessions (BUG-009 required)
- [ ] "Share with auditor" export: PDF with clause excerpt text inline per field (not just section reference)
- [ ] Clause viewer accessible on mobile (auditor may be on tablet during fieldwork)
- [ ] Tooltip on hover over section reference shows first 50 words of clause text before clicking through

*Research grounding: USER-JOURNEY Phase 6; JTBD J2; user-research Finding 4; market-research: Trullion's top G2 feature*

---

**Story R5 — Resolve Missing Discount Rate Flag Without Escalating (J9)**

*As a compliance lead who has just received a "Discount rate missing — High severity" flag, I want clear guidance on how to calculate or source the IBR for this lease — including the IFRS 16.26 methodology — so I can resolve the flag and proceed to report generation without interrupting my treasury team or abandoning the session.*

**Acceptance Criteria:**
- [ ] Every High-severity IBR flag displays a "What do I do?" action guidance block containing:
  - IBR definition: "Use your company's incremental borrowing rate at the lease commencement date"
  - Calculation approach: "Common method: average cost of debt at commencement. Ask your treasury team."
  - IFRS 16.26 requirement: "Document the rate used and methodology — auditors will ask for this"
  - Input field: "Enter rate for this lease" (persisted to analysis record)
  - "Save as default for all leases in this portfolio" toggle (company-level IBR storage)
- [ ] Company-level IBR is pre-populated on subsequent leases in the same session
- [ ] IBR entered in Q1 is suggested (not auto-applied) in Q2 with prompt: "You used 5.2% last quarter — use the same rate?"
- [ ] IBR flag resolution rate measured and reported in L2 diagnostics (target: >80% resolved vs. dismissed)

*Research grounding: USER-JOURNEY Phase 4; JTBD J9; user-research Finding 3; most common activation stall*

---

**Story R6 — Batch Processing: Work Through 4–12 Leases in One Session (J8)**

*As a compliance lead processing my full portfolio before quarter-end, I want to track session progress across all leases, work in priority order, and maintain the consent disclosure without re-acknowledging it for every single analysis, so I can complete the entire compliance cycle in one focused session.*

**Acceptance Criteria:**
- [ ] Session header shows: "Session progress: X of Y leases complete. Estimated time remaining: ~Z minutes" (calculated from average lease processing time)
- [ ] Portfolio table supports triage ordering: unresolved flags → expiring → modified → new → unchanged (priority heuristic visible as default sort)
- [ ] Consent modal fires once per session (at session start) rather than once per analysis; session consent satisfies GDPR disclosure requirement
- [ ] Webhook timeout on any individual lease shows clear error + retry button without affecting progress on completed leases
- [ ] "Back to portfolio" button always visible during single-lease analysis to maintain session context
- [ ] Requires BUG-009 for real portfolio state; placeholder counter with demo data until BUG-009 ships

*Research grounding: USER-JOURNEY Phase 8; JTBD J8; user-research: consent fatigue firing moment*

---

**Story R7 — Generate Audit-Ready PDF Report (J1)**

*As a compliance lead whose High flags are all resolved, I want to generate an IFRS 16 compliance report PDF that my external auditor will accept without revision requests — containing all extracted fields, clause citations, flag resolution evidence, and AI disclosure language that meets PCAOB AS 1105 requirements.*

**Acceptance Criteria:**
- [ ] Report export blocked until all High-severity flags are resolved (live — guardrail)
- [ ] PDF contains cover page: lease name, analysis date, standard (IFRS 16 / ASC 842), LegalGraph version, Anthropic Claude API disclosure, "AI-assisted, human-reviewed" statement with Rachel's name and date
- [ ] Per-field table: extracted value, clause section reference + page, confidence indicator, AI-extracted vs. manually-verified badge
- [ ] Risk flag summary: every flag raised, resolution action taken, who resolved it, timestamp
- [ ] Audit trail log: extraction timestamp, model version, all manual edits with timestamps and editor names
- [ ] PDF is generated in <5 seconds (no loading state that breaks momentum)
- [ ] PDF renders correctly in both Adobe Acrobat and browser-based PDF viewers

*Research grounding: USER-JOURNEY Phase 5; JTBD J1; user-research Finding 4; PCAOB AS 1105 requirements*

---

**Story R8 — Request Internal CFO Sign-Off Before External Submission (J10)**

*As a compliance lead with a completed report, I want to send it to the CFO/GC for review and receive explicit written approval — logged in the audit trail — before it goes to external auditors, so that the submission has documented internal authorization beyond just my own review.*

**Acceptance Criteria:**
- [ ] "Request internal review" button visible on completed report (after export but before submission)
- [ ] Approver receives email with PDF link + "Approve this report" button — no LegalGraph login required
- [ ] Approver can add a comment before approving (optional; useful for conditional approvals)
- [ ] On approval: timestamp, approver name and email, and comment (if any) added to report cover page and audit trail
- [ ] Rachel receives notification: "Jennifer Martinez approved this report on [date]. You can now submit to your auditor."
- [ ] Report status changes to "Approved — pending submission" in the portfolio dashboard
- [ ] If no approval within 48 hours, Rachel receives a reminder email with a re-send option

*Research grounding: USER-JOURNEY Phase 5a; JTBD J10; PCAOB AS 1105 human oversight requirement*

---

**Story R9 — Generate a Report in Either IFRS 16 or ASC 842 Format (conditional on OQ#2)**

*As a compliance lead whose company reports under ASC 842 (US FASB) rather than IFRS 16, I want to toggle the reporting standard before generating my report — without re-running the extraction — so I get the correct schedule format for my auditor without duplicating work.*

**Acceptance Criteria:**
- [ ] Standard toggle (IFRS 16 / ASC 842) visible at report generation step — defaults to the standard set at account level
- [ ] Toggling standard re-formats the output fields accordingly (ASC 842: operating vs. finance lease classification; IFRS 16: single lessee model)
- [ ] A single extraction can produce both standards — no re-upload required
- [ ] Report cover page shows the applied standard explicitly
- [ ] Account-level standard preference is saved and pre-selected on subsequent sessions
- [ ] **Conditional:** This story is in scope only if OQ#2 is resolved as "ship both standards at GA." If IFRS 16-only, defer ASC 842 to V1.1.

*Research grounding: user-research Finding 6 ("~45 enterprise accounts split across IFRS 16 and ASC 842"); PRD v1.0 P1 requirement; market-research: North American ASC 842 market*

---

**Story R10 — Submit Compliance Report to Auditor from Within LegalGraph**

*As a compliance lead with an approved report, I want to send it directly to my external auditor's email address from within LegalGraph — with the approval record attached — so there is a single, traceable submission event linked to the report rather than a detached email chain.*

**Acceptance Criteria:**
- [ ] "Submit to auditor" button available on approved reports (after CFO sign-off is logged, or optionally without if J10 is not enabled)
- [ ] Rachel enters one or more auditor email addresses; addresses are saved per account for future quarters
- [ ] Email sent to auditor contains: PDF report link, a plain-text summary of the report scope (X leases, standard, period), and a read-only verification link (clause citations active)
- [ ] Submission event is logged in the audit trail: auditor email(s), timestamp, report version submitted
- [ ] Rachel receives a confirmation: "Report submitted to [auditor] on [date]. View submission record."
- [ ] If a report has already been submitted, a warning is shown: "This report was already submitted to [auditor] on [date]. Submit again?" — prevents duplicate submissions

*Research grounding: PRD v1.0 P1 requirement (email delivery); USER-JOURNEY Phase 6 (audit defense); JTBD J1 (audit-ready submission)*

---

**Story R11 — Bulk Export Reports for All Ready Leases**

*As a compliance lead who has finished processing all leases in my portfolio, I want to export compliance reports for every ready lease in one action — rather than generating each report individually — so I can complete the final step of my quarterly session in under 5 minutes regardless of portfolio size.*

**Acceptance Criteria:**
- [ ] "Export all ready leases" button appears in the portfolio dashboard when ≥2 leases show "ready to report" status
- [ ] Bulk export generates individual PDF reports per lease AND a combined portfolio summary PDF (list of leases, standards applied, per-lease risk summary)
- [ ] Leases with unresolved High flags are excluded from bulk export with a clear notification: "2 leases skipped — unresolved High flags. Resolve to include."
- [ ] Export completes within 30 seconds for up to 12 leases
- [ ] Download delivered as a ZIP containing individual lease PDFs + portfolio summary
- [ ] Bulk export event logged in audit trail with timestamp and list of included leases

*Research grounding: PRD v1.0 P1 requirement (bulk report generation); JTBD J8 (batch session workflow); USER-JOURNEY Phase 8*

---

### Persona 2: Jennifer — General Counsel / CFO (Economic Buyer)

---

**Story J1 — Evaluate and Approve LegalGraph Without Being a Daily User (J6)**

*As the General Counsel approving a new AI compliance tool, I want to get answers to my four evaluation questions — where data goes, whether auditors accept it, what it costs, and what happens if it's wrong — in under 30 minutes, so I can approve the DPA and budget without creating new legal or regulatory exposure.*

**Acceptance Criteria:**
- [ ] Consent modal names "Anthropic Claude API" explicitly and provides a data deletion contact (live)
- [ ] Consent modal specifies data retention policy (e.g., "your contracts are stored for X days; delete at [contact]")
- [ ] Report gate prevents export with unresolved High flags (live — guardrail)
- [ ] "Manually verified" badge visible on any field Rachel has overridden (live)
- [ ] PCAOB AS 1105 compliance one-pager available as a sales asset: "How LegalGraph meets PCAOB AS 1105 requirements"
- [ ] DPA template available and reviewed by legal before enterprise contracts signed
- [ ] ROI evidence available: beta time-to-report data showing Rachel's session durations (requires BUG-009 instrumentation)

*Research grounding: USER-JOURNEY Journey B1; JTBD J6; user-research Finding 6*

---

**Story J2 — Quarterly Sign-Off Via Email (J10)**

*As the GC receiving a quarterly report approval request, I want to review the compliance report and approve it from my email inbox — without logging into LegalGraph — so that my sign-off is formally documented with minimal friction.*

**Acceptance Criteria:**
- [ ] Email request is clear: "Rachel has generated the Q2 IFRS 16 compliance report for 6 leases. Please review and approve before submission to [Auditor firm]."
- [ ] Email contains PDF link that opens in browser without authentication
- [ ] "Approve this report" button in email triggers approval logging — one click
- [ ] Jennifer's name, timestamp, and email address are logged in the report audit trail and appear on the cover page
- [ ] If Jennifer has a concern, she can reply via email with a comment that is logged as a conditional approval
- [ ] Approval is irreversible once submitted (protects audit integrity)

*Research grounding: USER-JOURNEY Journey B2; JTBD J10*

---

### Persona 3: David — Senior Associate (Secondary User)

---

**Story D1 — Look Up a Specific Lease Term in Under 2 Minutes (J7)**

*As a senior associate preparing for a lease negotiation or amendment call, I want to open LegalGraph, find the relevant lease, and see the specific clause value and source reference — without running a new analysis or asking Rachel — so I can walk into the call informed.*

**Acceptance Criteria:**
- [ ] Portfolio table is searchable by lease name, lessee/lessor, and lease address (requires BUG-009)
- [ ] Last-analysed date visible in the portfolio table row (not just on the analysis screen)
- [ ] Extracted terms grid is the first visible section on the analysis screen (live — correct)
- [ ] Clause section reference visible per field without clicking through (live)
- [ ] Full session completes in <120 seconds for a direct term lookup (L2 diagnostic target)
- [ ] Stale analysis (>90 days) shows a warning: "Last analysed [date] — results may not reflect recent amendments"

*Research grounding: USER-JOURNEY Journey C; JTBD J7; user-research Finding 7*

---

### Persona 4: External Auditor (New — v1.1)

---

**Story A1 — Verify AI-Generated Figures from Source Contracts (J11)**

*As an external auditor performing substantive procedures on an AI-assisted IFRS 16 filing, I want to trace each material line item directly back to the specific clause text in the original lease — without accessing the client's LegalGraph account — so I can satisfy my independence requirements under PCAOB AS 1105 without requesting a manual resubmission.*

**Acceptance Criteria:**
- [ ] Report PDF contains inline clause excerpt text per field: section number + page + first 2 sentences of clause (not just section reference)
- [ ] Cover page includes: AI model name (OpenAI GPT-5 mini via n8n), extraction date, LegalGraph version, human review sign-off (Rachel's name and date), PCAOB AS 1105 compliance statement
- [ ] Audit trail log distinguishes AI-extracted fields from manually-verified fields with timestamps
- [ ] Auditor can verify inline clause excerpts against the original contract PDF without accessing LegalGraph
- [ ] Auditor portal (GA+1): shareable read-only link with active clause citations; no LegalGraph account required for auditor

*Research grounding: USER-JOURNEY Journey E; JTBD J11; market-research: PCAOB AS 1105; Trullion G2 top feature*

---

### GA+1 Stories (Design Now, Ship Post-GA)

These stories are out of scope for GA but are documented now so that GA engineering decisions (data model, PDF structure, email infrastructure) are made with GA+1 in mind.

---

**Story GA1 — See the Compliance Impact of a New or Amended Lease Immediately (J5)**

*As a compliance lead who has just received an updated lease contract (rent escalation, renewal exercised, or term extended), I want to upload it and immediately see how the IFRS 16 schedule changes vs. the prior version — so I can keep compliance records current without waiting for quarter-end.*

**Acceptance Criteria:**
- [ ] On re-upload of a lease previously analysed, system detects it as an amendment (via document similarity or manual "this replaces [lease name]" tag)
- [ ] Delta view shows: fields that changed (old value → new value), new flags introduced, flags resolved by the amendment
- [ ] ROU asset and liability schedule delta is displayed: "ROU asset increased by £12,000 due to rent escalation"
- [ ] Mid-quarter amendment is saved as a new analysis version, with the prior version preserved and accessible
- [ ] Rachel receives an in-app alert if a modification is detected on a lease she has already analysed this quarter
- [ ] **Dependency:** Requires BUG-009 (persistent storage) and per-lease version history

*Research grounding: USER-JOURNEY Phase 7 + Return journey; JTBD J5; user-research Finding 5*

---

**Story GA2 — Auditor Portal: Independently Verify Figures Without Accessing Client's Account (J11 — full)**

*As an external auditor reviewing multiple LegalGraph clients, I want a read-only shareable link that gives me active clause citations for any lease filing — without requiring a LegalGraph account — so I can complete fieldwork across all my AI-assisted clients from a single, standardised interface.*

**Acceptance Criteria:**
- [ ] Rachel can generate a shareable auditor link for any submitted report — link is time-limited (expires 90 days after audit period)
- [ ] Auditor link opens a read-only view: field values, clause citations (active — click to see source text), AI vs. manually-verified badges, audit trail log
- [ ] No LegalGraph account required for the auditor — link is publicly accessible but non-guessable (UUID-based)
- [ ] Auditor portal includes PCAOB AS 1105 compliance statement and AI model disclosure inline
- [ ] Auditor can filter by field type, flag severity, or verification status
- [ ] Rachel can revoke a shared link at any time; revoked links show an expired state to the auditor

*Research grounding: USER-JOURNEY Journey E3; JTBD J11; market-research: "no current mid-market competitor has shipped this — first-mover opportunity"*

---

**Story GA3 — Proactive Quarter-End Email Nudge**

*As a compliance lead who uses LegalGraph four times a year, I want to receive a proactive email 14 days before quarter-end — telling me which leases from last quarter are ready to re-analyse — so I start my reporting session on time rather than remembering to log in under deadline pressure.*

**Acceptance Criteria:**
- [ ] Email sent to Rachel 14 days before each quarter-end close (configurable; defaults to standard calendar quarter-ends)
- [ ] Email content: "Q[X] reporting season starts in 14 days. You have [N] leases from last quarter ready to re-analyse. [Start now →]"
- [ ] Link in email takes Rachel directly to the portfolio dashboard (authenticated deep link)
- [ ] Email is suppressed if Rachel has already logged in during the last 7 days (not a re-reminder if she's already active)
- [ ] Rachel can configure notification timing (7 / 14 / 21 days before quarter-end) or opt out in account settings
- [ ] **Dependency:** Requires BUG-009 (persistent storage) and per-account quarter-end date configuration

*Research grounding: USER-JOURNEY Phase 0 (trigger) and Phase 8 (batch session); JTBD J1 (quarterly deadline circumstance); user-research Finding 1 (4x/year login pattern)*

---

## 6. Milestones & GTM

### Project Plan

**Phase 0 — Foundation (Weeks 1–3):**
| Deliverable | Owner | Priority |
|---|---|---|
| BUG-009: Persistent per-account storage (Supabase) | Engineering (Backend) | P0 — unblocks 7+ features |
| BUG-006: Clause PDF viewer | Engineering (Frontend + Backend) | P0 — GA blocker |
| J9: IBR guidance copy on discount rate flag | PM (copy change only) | P0 — no eng required |
| Event tracking instrumentation for L1/L2 metrics | Engineering | P0 — all metrics blocked without this |

**Phase 1 — Core Compliance Workflow (Weeks 4–7):**
| Deliverable | Owner | Priority | Story |
|---|---|---|---|
| Full PDF export: cover page, clause citations, flag resolution log, AI disclosure | Engineering + Design | P0 | R7 |
| Dashboard "Ready / Needs Attention" counter (requires BUG-009) | Engineering (Frontend) | P1 | R2 |
| Once-per-session consent (vs. per-analysis) | Engineering | P1 | R6 |
| Per-field confidence scores wired from n8n pipeline | Engineering (ML) | P1 | R3 |
| J10: Email-based CFO approval flow | Engineering + Design | P1 | R8, J2 |
| R10: Submit report to auditor email from LegalGraph | Engineering + Design | P1 | R10 |

**Phase 2 — Activation, Batch & Multi-Standard (Weeks 8–10):**
| Deliverable | Owner | Priority | Story |
|---|---|---|---|
| Journey D: First-lease onboarding guidance + post-extraction "first win" prompt | Design + Engineering | P1 | R1 |
| J8: Session-level "X of Y leases complete" progress tracker | Engineering (Frontend) | P1 GA | R6 |
| Company-level IBR storage and carry-forward | Engineering | P1 GA | R5 |
| R11: Bulk report export (all ready leases, ZIP download) | Engineering | P1 GA | R11 |
| R9: ASC 842 toggle (conditional on OQ#2 resolution) | Engineering (ML + Frontend) | P1 GA | R9 |
| PCAOB AS 1105 compliance one-pager (sales enablement) | PM + Legal | P1 — no eng | J1 |

**Beta (Week 10–12):**
- Invite 3–5 pilot accounts from existing enterprise customer base
- Rachel persona accounts with 10–50 leases
- Focus: full compliance cycle from upload → report → auditor Q&A
- Success criteria: ≥3 of 5 pilots generate a report accepted by their auditor without revision requests

**GA (Week 12):**
- All P0 and P1 items complete
- L1-1 (activation rate) ≥70% sustained for 2 weeks
- L1-3 (extraction accuracy) ≥94% across ≥20 contracts

**GA+1 Roadmap:**
- GA1: J5 — Amendment delta view ("field X changed from Y to Z since last analysis") — Story GA1
- GA2: J11 — Auditor portal — read-only shareable link; first-mover opportunity; no competitor has shipped this — Story GA2
- GA3: Proactive quarter-end email nudge — Story GA3
- Intelligent triage: "Start with these 3 leases — they have unresolved flags from last quarter" (no story yet; design alongside GA3)

---

### Release / Rollout Strategy

**Release Plan:**

- **Feature flags:** BUG-006 (clause viewer) and J10 (CFO sign-off flow) gated for staged rollout — enable for beta accounts first, then all accounts after 2-week stability period
- **BUG-009 (persistent storage):** Backend migration; no feature flag needed; silent rollout with monitoring on data integrity
- **Once-per-session consent:** Requires legal review before rollout; flagged as a compliance decision (GDPR), not just a UX change

**Beta Program:**

- **Target:** 3–5 accounts with Rachel-persona primary users managing 10–50 leases
- **Activation criteria:** First extraction completed AND first report exported AND submitted to auditor
- **Data collected:** Time-to-report, flag resolution rate, IBR guidance usage, auditor acceptance or revision request
- **Beta NDA:** Covers data processing terms; includes explicit consent for LegalGraph to collect usage telemetry

**Rollout Communications:**

| Audience | Message | Channel | Timing |
|---|---|---|---|
| Existing enterprise customers | "Clause-level audit trail now live — answer auditor questions in 2 minutes" | In-app banner + email | Day of GA |
| Jennifer (GC / CFO) at enterprise accounts | PCAOB AS 1105 compliance one-pager + DPA template | CSM outreach + email | Week of GA |
| External auditors at beta accounts | "Share with auditor" PDF export explainer | Rachel forwards to auditor; no direct outreach | Week 2 post-GA |
| Visual Lease customers (displacement) | "Mid-market lease compliance — built for audit defense, not just tracking" | Outbound sequence via Sales | Month 2 post-GA |
| G2/Capterra review program | Request reviews from activated beta accounts | In-app prompt post-first-accepted-report | Month 2 post-GA |

**Beta Feedback Loops:**
- Weekly 30-minute call with each beta account (PM-led)
- In-app flag: "Did this report get accepted by your auditor?" (binary prompt post-export)
- Slack channel with beta customers for async feedback
- Monthly synthesis shared with engineering and design leads

---

## Open Questions

| # | Question | Owner | Deadline |
|---|---|---|---|
| 1 | IBR guidance copy: what exact rate methodology should we recommend for IFRS 16.26? Need legal review before shipping. | PM + Head of Legal | T-3 weeks from GA |
| 2 | IFRS 16 vs. ASC 842 toggle: ship both in GA or IFRS 16 only? Eng estimate: +2 weeks for ASC 842. Most of our 45 enterprise accounts are international. | Engineering Lead + CFO | T-4 weeks from GA |
| 3 | Once-per-session consent: does GDPR require per-analysis consent or is session-level sufficient? | Head of Legal | T-3 weeks from GA |
| 4 | PDF export format: do auditors prefer PDF with inline clause text, or structured data (JSON/CSV) for ingestion into audit management tools? Validate with 2 pilot auditors. | PM (auditor interview) | Beta week 1 |
| 5 | Jennifer email approval flow: does the approver link need to be time-limited (expire after 72 hours) for security? | Engineering Lead + Legal | T-2 weeks from GA |

---

*PRD Owner: Senior PM · Reviewer: Priya Sharma (Head of Product) · Status: In Review · Version: 2.1*
*Context grounded in: JTBD v1.1 · USER-JOURNEY v1.1 · market-research-legal-ai-2026.md · user-research-legal-ai-2026.md · PRD v1.0 (project-context)*
*Personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate), External Auditor (v1.1)*
*User stories: R1–R11 (Rachel) · J1–J2 (Jennifer) · D1 (David) · A1 (Auditor) · GA1–GA3 (GA+1)*
*Word count: ~6,800*
