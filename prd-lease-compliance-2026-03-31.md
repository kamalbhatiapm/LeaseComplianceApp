# PRD: Lease Compliance Reporting
**LegalGraph | Version 1.1 | Date: 2026-03-31 | Updated: 2026-05-04**

---

## 1. Problem Statement

In-house legal and finance teams at mid-market companies managing 10–50 active leases have no reliable way to generate audit-ready IFRS 16 / ASC 842 compliance reports from their contracts. Today, Rachel (Compliance Lead) spends 4–6 hours per quarter manually extracting lease terms from PDFs, reconciling them in Excel, and formatting outputs for auditors — a process prone to error, version conflicts, and missed deadlines. With IFRS 16 audit scrutiny increasing and external auditors requiring traceable, clause-level evidence, the current manual workflow is no longer sustainable. LegalGraph is uniquely positioned to solve this: our 94% AI extraction accuracy means we can pull lease terms directly from contracts and generate structured compliance reports with an auditable trail — eliminating the manual extraction step entirely.

---

## 2. User Persona

**Primary User: Rachel — Compliance Lead**
- Owns quarterly IFRS 16 / ASC 842 reporting and audit preparation
- Works across legal and finance; reports to CFO
- Currently uses Excel + manual contract review; no CLM integration
- Pain: 4–6 hours per lease per quarter, high error risk, auditors keep asking for source clauses she has to hunt down manually

**Primary Buyer: Jennifer — General Counsel (GC)**
- Signs off on tooling decisions for the legal team
- Cares about audit defensibility, risk reduction, and not surprising the CFO
- Will approve this feature if it reduces Rachel's time and removes audit risk

**Secondary User: David — Senior Associate**
- Occasionally pulls lease data for contract amendments and renewal negotiations
- Needs quick access to extracted terms; doesn't run the compliance reports himself

---

## 3. Jobs to Be Done

1. **When** the quarterly IFRS 16 reporting deadline approaches, **I want to** generate a structured compliance report directly from our contract repository, **so I can** submit audit-ready output to our external auditors without spending days on manual extraction.

2. **When** an auditor asks for the source clause behind a specific lease line item, **I want to** link directly from the report to the original contract clause, **so I can** answer in minutes instead of digging through PDFs.

3. **When** a new lease is signed or amended, **I want to** see the compliance impact immediately, **so I can** keep our IFRS 16 schedule current without a manual reconciliation cycle.

---

## 4. Success Metrics

### North Star

**Audit-ready compliance reports generated per active account per quarter.**

When this number rises across the customer base, Rachel has completed the full workflow — extraction, risk resolution, sign-off — and delivered output her auditor accepted. It is also the strongest leading indicator of renewal: accounts generating reports do not churn.

*Baseline:* 0 (pre-launch) · *Year 1 target:* ≥1 report/quarter across ≥80% of active accounts

---

### L1 Metrics — Strategic Health

| # | Metric | Definition | Baseline | Target | Timeframe |
|---|--------|-----------|----------|--------|-----------|
| L1-1 | **Activation rate** | % of new accounts completing a first extraction within 14 days of signup | 0% | ≥70% | 30 days post-launch |
| L1-2 | **Report generation rate** | % of active accounts generating ≥1 IFRS 16 report per quarter | 0% | ≥80% | 90 days post-launch |
| L1-3 | **AI extraction accuracy** | % of lease fields correctly extracted vs. ground truth across live contracts | 94% (1 contract) | ≥94% sustained across ≥20 contracts | At launch |
| L1-4 | **Auditor acceptance rate** | % of reports submitted to auditors accepted without a revision request | Unknown | ≥95% | 6 months post-launch |

---

### L2 Metrics — Diagnostic

**Under L1-1 Activation:**
- Time to first extraction (P50 target: <10 min from first login)
- File upload success rate (target: >99%)
- Consent modal completion rate (users completing consent ÷ users reaching upload)
- Upload-to-analysis drop-off rate

**Under L1-2 Report Generation Rate:**
- % of leases with all High-severity flags resolved (prerequisite for report gate)
- Time from first extraction to report export (P50 target: <45 min — Rachel's benchmark)
- Report PDF export rate
- "View full report" click-through rate post-analysis

**Under L1-3 Extraction Quality:**
- Per-field accuracy by field type (discount rate is the known weak field)
- Missing field rate per contract (tracked via `terms_missing` in webhook payload)
- AI confidence score distribution (% of extractions with confidence <0.85)
- False-positive flag rate (flags raised that users manually dismiss)

**Under L1-4 Auditor Acceptance:**
- Clause citation accuracy (auditor source-clause lookups that resolve correctly)
- False-negative flag rate (risks surfaced by auditors that LegalGraph missed)
- Post-filing restatement request rate

---

### L3 Metrics — Operational Health

| Metric | Target |
|--------|--------|
| Webhook success rate | ≥99.5% |
| p95 analysis latency | <8 seconds |
| HHH eval score | ≥90/105 (gating for regulated pilots) |
| RAI eval score | ≥96/112 (gating for insurance/banking) |
| Automated eval pass rate | 11/11 maintained |

---

### Guardrail Metrics

These cap what is allowed while optimising for the North Star. A guardrail breach triggers a stop-and-fix regardless of North Star movement.

| Guardrail | Threshold | Protects against |
|-----------|-----------|-----------------|
| "Not legal advice" disclaimer always visible | 100% of results views | Legal liability |
| Consent modal fires before every analysis | 100% — no bypass | GDPR / data-processing compliance |
| Report gate enforced (High flags block generation) | 100% | Auditor receiving unresolved material risks |
| Extraction accuracy hard floor | ≥90% | Trust erosion → churn |
| HHH Harmless score | ≥25/35 | Regulated-client liability |

---

### Leading Indicators

| Signal | Predicts | Action if declining |
|--------|---------|---------------------|
| Upload rate in week 1 post-signup | Activation (L1-1) | Trigger onboarding nudge; audit upload UX |
| Progress panel 4-step completion rate | Report generation (L1-2) | Investigate webhook failures and drop-off step |
| "Edit terms" session rate per account | Extraction quality trust (L1-3) | High rate = users don't trust AI output |
| Days between upload and report export | Time-to-value | >2 days signals friction in flag-resolution flow |
| "Re-analyze" button click rate | Data trust (L1-4) | High rate = users not confident in first extraction |

---

### Metric collection gaps (must close before metrics are real)

| Gap | Blocks | Priority |
|-----|--------|----------|
| No event tracking instrumentation | All L1/L2 measurement | P0 |
| No persistent storage (BUG-009) | Time-series per account | P0 |
| Report gate not enforced in UI | L1-4 reliability | P0 |
| Extraction benchmarked on 1 contract only | L1-3 statistical validity | P1 |
| No per-field confidence scores | L2 extraction diagnostics | P1 |

---

## 5. Requirements

### P0 — Must Ship in V1

- [ ] **Lease term extraction**: Automatically extract key IFRS 16 fields from uploaded contracts — commencement date, lease term, renewal options, payment schedule, discount rate, right-of-use asset value
- [ ] **Compliance report generation**: Generate a structured IFRS 16 / ASC 842 compliance report for a selected lease or full portfolio, formatted for auditor review
- [ ] **Clause-level audit trail**: Every line item in the report links to the source clause in the original contract — clickable, with clause text visible on hover or tap
- [ ] **Portfolio dashboard**: Single view showing all active leases, their compliance status (current / expiring / flagged), and last report date
- [ ] **Export to PDF**: One-click PDF export of the compliance report with LegalGraph branding and timestamp

### P1 — Ship in V1.1

- [ ] **Amendment tracking**: When a lease is amended, flag the change and show the delta impact on the IFRS 16 schedule
- [ ] **Multi-standard support**: Toggle between IFRS 16 (international) and ASC 842 (US FASB) report formats
- [ ] **Bulk report generation**: Generate compliance reports for all leases in the portfolio in one action
- [ ] **Email delivery**: Send the compliance report directly to specified auditor email addresses from within LegalGraph

### P2 — Future Consideration

- [ ] ERP integration (push lease data to NetSuite, SAP)
- [ ] Automated renewal alerts based on lease expiry dates
- [ ] Benchmark: compare extraction accuracy against prior manual data

---

## 6. Out of Scope (V1)

1. **Accounting journal entries** — we generate the compliance report, not the journal entries. Rachel's accounting team handles booking.
2. **SOX compliance reporting** — IFRS 16 / ASC 842 only in V1. SOX is a separate audit workflow.
3. **Non-real-estate leases** — V1 focuses on property/office leases. Equipment leases (vehicles, machinery) deferred to V1.1.
4. **Auditor portal access** — auditors receive the PDF export; they do not get a LegalGraph login in V1.
5. **Historical data migration** — customers must upload contracts to LegalGraph; we do not migrate data from prior tools.

---

## 7. Open Questions

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | What discount rate do we use if the customer hasn't specified one in the contract? Do we default to the incremental borrowing rate or require manual input? | Rachel (pilot customer) + David | 2026-04-07 |
| 2 | IFRS 16 vs. ASC 842 — do we ship both standards in V1 or IFRS 16 only first? Affects eng scope by ~2 weeks. | Jennifer (GC) + CFO | 2026-04-05 |
| 3 | What format do external auditors actually want — PDF, Excel, or structured data file? Need to validate with 2 pilot customers before building export. | Rachel (pilot outreach) | 2026-04-10 |
| 4 | Does the clause-level audit trail need to show the exact clause text inline, or is a page + section reference sufficient for auditors? | Auditor validation call | 2026-04-10 |
| 5 | How do we handle leases where AI extraction confidence is below threshold — do we block report generation or flag with a warning? | Eng lead + Rachel | 2026-04-07 |

---

## 8. Confidence Levels

| Assumption | Confidence | Rationale |
|-----------|-----------|-----------|
| Rachel spends 4–6 hours/quarter on compliance prep | **High** | Validated in 3 customer interviews |
| Auditors will accept AI-generated reports if clause trail is present | **Medium** | Assumed based on market research — needs auditor validation call |
| 94% extraction accuracy holds for lease-specific fields | **Medium** | Overall accuracy is 94%; lease field accuracy not separately benchmarked yet |
| IFRS 16 is the right standard to prioritize over ASC 842 | **Medium** | Most of our 45 enterprise accounts are international — needs CFO confirmation |
| Customers will upload all leases to LegalGraph | **Low** | Assumes they trust us with their full contract repository — this is a behaviour change, not just a feature |

---

*PRD status: Draft — pending GC review*
*Last updated: 2026-03-31*
