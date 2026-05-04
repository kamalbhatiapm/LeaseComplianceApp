# PRD: Lease Compliance Reporting
**LegalGraph | Version 1.0 | Date: 2026-03-31**

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

| Metric | Baseline (today) | Target | Timeframe |
|--------|-----------------|--------|-----------|
| Time to generate quarterly compliance report | 4–6 hours/quarter | <45 minutes | 60 days post-launch |
| Audit query response time (source clause lookup) | 2–4 hours | <5 minutes | 60 days post-launch |
| Rachel's activation rate on compliance module | 0% (feature doesn't exist) | 80% of eligible customers | 90 days post-launch |
| AI extraction accuracy on lease terms | 94% (current overall) | ≥94% on lease-specific fields | At launch |
| Auditor acceptance rate (no restatement requests) | Unknown | ≥95% reports accepted without revision | 6 months post-launch |

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
