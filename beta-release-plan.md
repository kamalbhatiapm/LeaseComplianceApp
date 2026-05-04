# LegalGraph — Beta Release Plan
**Version 1.0 | Date: 2026-05-04**
**Owner: Product**
**Target window: 2026-06-02 → 2026-07-14 (6 weeks)**

---

## Objective

Validate core product value with a controlled set of real customers before broad availability. The Beta exists to answer three questions:

1. Does the extraction + report workflow reduce Rachel's time from 4–6 hours to <45 minutes on real contracts?
2. Do external auditors accept LegalGraph-generated reports without revision requests?
3. What breaks at realistic contract volume and complexity that the sample contract didn't expose?

Beta is **not** a sales motion. It is a structured learning exercise. Every participant is a co-author of the GA product.

---

## Target Participants

**Size:** 5–8 customer accounts
**Profile:**
- Mid-market companies with 5–25 active leases
- At least one IFRS 16 compliance cycle completed manually in the last 12 months
- Primary user maps to Rachel persona (Compliance Lead or Finance Manager who owns lease reporting)
- Executive sponsor maps to Jennifer persona (GC or CFO who can evaluate audit defensibility)

**Recruitment source:** Existing LegalGraph enterprise accounts + 2 warm referrals from advisory network
**Exclusions:** Insurance, banking, or public-sector accounts — RAI eval score (58/112) does not meet the regulated-client threshold. These segments are GA-only after RAI remediation.

---

## Entry Criteria (Go / No-Go gate before Beta begins)

All of the following must be true before inviting the first Beta account:

| Criterion | Current status | Owner | Deadline |
|-----------|---------------|-------|----------|
| Automated eval: 11/11 pass | ✅ Done | Engineering | — |
| HHH eval score ≥ 80/105 | ❌ Currently 74/105 | Product | 2026-05-25 |
| Consent modal fires before every analysis | ✅ Done (PR #6) | — | — |
| "Not legal advice" disclaimer on all results views | ✅ Done (PR #6) | — | — |
| Report gate enforced in UI (High flags block generation) | ❌ UI gate missing (RAI S2) | Engineering | 2026-05-20 |
| Persistent storage: extraction results survive page refresh | ❌ BUG-009 open | Engineering | 2026-05-25 |
| PDF export functional | ❌ Button not wired | Engineering | 2026-05-25 |
| Data retention policy visible to users | ❌ Missing | Product/Legal | 2026-05-25 |
| Beta participant NDA and data processing agreement signed | ❌ Legal prep needed | Legal | 2026-05-28 |

**If any P0 criterion is unmet on 2026-05-28, Beta start date shifts by 1 week per unresolved item.**

---

## What's In Beta

| Feature | Included | Notes |
|---------|----------|-------|
| Contract upload (PDF, DOCX, DOC, TXT) | ✅ | Up to 50 MB |
| IFRS 16 field extraction via n8n pipeline | ✅ | 9 fields; discount rate flagged if absent |
| Risk scoring (0–100) with flag breakdown | ✅ | Mock score in v1; live scoring in Beta milestone |
| Clause-level audit trail | ✅ | Links visible; PDF viewer modal P1 |
| Report gate (High flags must be resolved) | ✅ | Gate enforced before Beta starts |
| IFRS 16 report PDF export | ✅ | Must be wired before Beta entry |
| Playbook management (IFRS 16 standard) | ✅ | Read-only in Beta; editing enabled in GA |
| Persistent storage (Supabase) | ✅ | Required for Beta — no page-refresh data loss |
| Consent modal + disclaimer | ✅ | |
| Multi-lease dashboard | ✅ | Static for Beta; live Supabase data in GA |
| Clause reference PDF viewer | ❌ | BUG-006 — deferred to GA |
| ASC 842 standard support | ❌ | P1 — GA only |
| Bulk report generation | ❌ | P1 — GA only |
| ERP integration | ❌ | P2 — post-GA |
| Audit Trail tab | ❌ | Disabled in nav — GA milestone |
| Reports tab | ❌ | Disabled in nav — GA milestone |

---

## Beta Program Structure

### Onboarding (Week 1)
- 60-minute onboarding call per account: walkthrough, upload first real contract together
- Provide sample contract as fallback if customer isn't ready with their own
- Assign a named LegalGraph contact (PM or CSM) per account — single point of contact for feedback

### Active use period (Weeks 2–5)
- Participants upload real leases from their portfolio (minimum 3 contracts per account)
- Participants run their next compliance cycle using LegalGraph — not as a parallel exercise, but as their primary tool
- Weekly 30-minute check-in call: structured feedback against exit survey template
- Bug reports via dedicated Slack channel (#legalgraph-beta) — 24-hour response SLA

### Exit interviews (Week 6)
- 45-minute structured interview per account (Rachel + Jennifer personas separately if possible)
- Deliver filled exit survey covering: time saved, auditor feedback, trust in AI output, blockers
- Share anonymised aggregate findings with all participants before GA announcement

---

## Success Criteria to Graduate to GA

Beta is declared a success — and GA planning is unblocked — when **all four** conditions are met:

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Time-to-report | <45 min from upload to PDF export for ≥70% of sessions | Instrumented event log (upload timestamp → export timestamp) |
| Auditor acceptance | ≥1 report per participating account submitted to and accepted by an external auditor without revision | Self-reported in exit interview, corroborated by participant email confirmation |
| Extraction quality on real contracts | ≥90% field-level accuracy across all Beta contracts (not just the sample) | Manual spot-check by PM against source contracts |
| NPS from Beta participants | ≥40 (Promoter-heavy; these are reference customers) | Exit survey |

If any criterion is not met, we run a **Beta extension** (2 additional weeks) with a targeted remediation plan. We do not move to GA on a fixed date if the product isn't working for real users.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Auditors reject AI-generated reports | Medium | High | Clause citations are the trust anchor — validate clause viewer is working before first auditor submission. Have a manual fallback export if needed. |
| Discount rate missing in most real contracts | High | Medium | Pre-warn participants: system will flag IBR gap. Provide a one-pager on how to supply the IBR manually. |
| n8n webhook latency or downtime during Beta | Medium | High | Add webhook health monitoring before Beta. Prepare graceful demo-fallback messaging. |
| Participants upload sensitive contracts to wrong environment | Low | High | Confirm prod vs. staging data isolation. Include in DPA. Run Beta on a dedicated Netlify environment with separate Supabase project. |
| Real contracts are more complex than the sample (subleases, variable rents) | High | Medium | Set expectations in onboarding: "Beta supports standard fixed-rent leases. Flag any complex structures and we'll review together." Collect these as test cases for GA. |

---

## Communication Plan

| Audience | Message | Channel | Timing |
|----------|---------|---------|--------|
| Beta participants | Invitation, NDA, onboarding pack | Email | 2026-05-30 |
| Internal team | Beta scope, what's in/out, feedback loop | All-hands + Notion | 2026-05-28 |
| Waitlist (non-Beta accounts) | "Beta underway — GA coming Q3" | Email newsletter | 2026-06-02 |
| Auditors (via participants) | Report cover sheet explaining LegalGraph output and limitations | PDF cover page on every export | At first export |

---

*Beta release plan owner: Product · Last updated: 2026-05-04*
