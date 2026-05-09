# LegalGraph — Beta Release Plan
**Version 2.0 | Date: 2026-05-09**
**Owner: Product**
**Target window: 2026-07-07 → 2026-08-01 (4 weeks)**
**Supersedes:** BETA-PLAN v1.0 (2026-05-04) — updated to align with SPEC v1.1, tasks/plan.md, and DATA-MODEL.md

---

## Objective

Validate core product value with a controlled set of real customers before broad availability. Beta answers five questions — expanded from v1.0 to reflect PCAOB AS 1105 requirements and the SPEC v1.1 kill criteria:

1. Does the extraction + report workflow reduce Rachel's time from 4–6 hours to **<45 minutes** on real contracts?
2. Do external auditors accept LegalGraph-generated reports without revision requests? (**L1-4 target: ≥95%**)
3. Does the IBR guidance block (J9) reduce discount rate flag abandonment? (**target: >80% resolved vs. dismissed**)
4. Does the PCAOB AS 1105 cover page satisfy auditor documentation requirements in practice — not just in theory?
5. What breaks at realistic contract volume and complexity that SAMPLE-LEASE.docx didn't expose?

Beta is **not** a sales motion. It is a structured learning exercise. Every participant is a co-author of the GA product. If Beta does not pass the kill criteria in SPEC §11, GA does not ship on schedule.

---

## Target Participants

**Size:** 3–5 customer accounts (reduced from 5–8 — tighter cohort, deeper feedback per SPEC §6)
**Profile:**
- Mid-market companies with 10–50 active leases
- At least one IFRS 16 compliance cycle completed manually in the last 12 months
- Primary user maps to Rachel persona (Compliance Lead or Finance Manager who owns lease reporting)
- Executive sponsor maps to Jennifer persona (GC or CFO who signs off on AI tool purchases)
- At least one account has a named external audit firm — required to validate L1-4 (auditor acceptance)

**Recruitment source:** Existing LegalGraph enterprise accounts (45 accounts) + Visual Lease displacement targets from Q2 2026 outbound campaign
**Exclusions:** Insurance, banking, or public-sector accounts — RAI eval score (58/112) does not yet meet the regulated-client threshold (96/112). These segments are GA+1 only.

---

## Entry Criteria (Go / No-Go gate before Beta begins)

All P0 criteria must be met before the first Beta account is invited. This gate targets **2026-07-04** — three days before the Beta start window.

### P0 — Must be true before any Beta account is onboarded

| Criterion | Grounded in | Owner | Deadline |
|---|---|---|---|
| Automated eval: `node evals/run-evals.cjs` 11/11 pass | SPEC §8 | Engineering | Ongoing |
| BUG-009 (Task 3): Supabase persistence live — analysis survives page refresh | SPEC §4 Phase 0 | Engineering | 2026-05-30 |
| BUG-006 (Task 4): Clause drawer shows real `source_text` from n8n | SPEC §4 Phase 0 | Engineering + n8n | 2026-05-30 |
| J9 (Task 1): IBR "What do I do?" guidance block on discount rate flag | SPEC §7 Checkpoint 3 | Product (copy) | 2026-05-16 |
| PostHog (Task 2): `upload_started`, `analysis_complete`, `field_edited`, `ibr_rate_entered`, `flag_resolved`, `report_exported` events firing | SPEC §4 Phase 0 | Engineering | 2026-05-30 |
| Full PDF export (Task 6): PCAOB AS 1105 cover page with AI model disclosure, analyst name, "AI-assisted, human-reviewed" statement | SPEC §7 Checkpoint 2 | Engineering | 2026-06-27 |
| Report gate enforced: High-severity flags block Export PDF and Send buttons (100% — no bypass) | SPEC §9 Boundaries | Engineering | Already shipped |
| "Not legal advice" disclaimer visible on all analysis and audit screens | SPEC §9 Boundaries | Engineering | Already shipped |
| Consent modal fires before every new analysis (names OpenAI API via n8n) | SPEC §9 Boundaries | Engineering | Already shipped |
| Supabase RLS enabled on all tables before any Beta data is written | DATA-MODEL.md | Engineering | 2026-05-30 |
| Beta participant NDA and data processing agreement (DPA) signed | PRD v2.1 §6 | Legal | 2026-07-01 |
| IBR copy reviewed and approved by Legal (SPEC OQ #1) | SPEC OQ #1 | PM + Legal | 2026-06-16 |
| `VITE_POSTHOG_KEY` set in Netlify Beta environment | SPEC §5 | Engineering | 2026-07-01 |

### P1 — Strongly preferred at Beta entry; accepted as in-progress if documented

| Criterion | Owner | Deadline |
|---|---|---|
| J10 (Task 7): CFO email sign-off flow — approval logged in Supabase and rendered on PDF cover page | Engineering | 2026-06-27 |
| Dashboard "Ready / Needs Attention" counter (Task 5) — live from Supabase | Engineering | 2026-06-27 |
| Per-field confidence from n8n pipeline (Task 8) — real scores, not MOCK_ANALYSIS defaults | Engineering + n8n | 2026-06-27 |
| Journey D onboarding (Task 9) — first-lease banner + post-extraction first-win prompt | Product + Engineering | 2026-07-18 |

**If any P0 criterion is unmet on 2026-07-04, Beta start shifts by 1 week per unresolved item.**

---

## What's In Beta

### Already shipped (current state as of 2026-05-09)

| Feature | Notes |
|---|---|
| Contract upload (PDF, DOCX, DOC, TXT, 50 MB) | Drag-and-drop + click |
| IFRS 16 / ASC 842 field extraction via n8n (OpenAI) | 9 fields; discount rate flagged if absent |
| Risk scoring (0–100) with flag breakdown (High/Medium/Low) | |
| Score ring with severity label and "/100 · lower is better" hint | |
| Terms grid: edit-in-place, confidence dots, FIELD_HINTS on missing fields | |
| Uncertainty chips (conf < 0.85): "AI uncertain — verify against §X.X" | T.R.U.S.T framework |
| Extraction quality indicator (Strong / Fair / Weak) | T.R.U.S.T framework |
| Report gate: High flags block Export and Send buttons (100% enforced) | |
| Completion banner after all High flags resolved | |
| Clause source drawer (right-side slide-in, section reference) | BUG-006 partial |
| Audit trail screen (`/audit` route) — formal document layout, print stylesheet | |
| Demo fallback badge + Retry CTA | |
| Dark / light theme toggle (persisted to localStorage) | |
| Consent modal (OpenAI API via n8n disclosure, "not legal advice") | |
| IBR "What do I do?" guidance block — collapsible, 3-step, manual input (Task 1) | J9 — ships Week 1 |
| Contract type hint on Dashboard after file select | T.R.U.S.T framework |

### Shipping before Beta entry (Tasks required by P0 gate)

| Feature | Task | Ships by |
|---|---|---|
| Supabase persistence — analysis survives page refresh | Task 3 (BUG-009) | 2026-05-30 |
| Clause drawer with real `source_text` paragraph from n8n | Task 4 (BUG-006) | 2026-05-30 |
| PostHog event instrumentation | Task 2 | 2026-05-30 |
| Full PDF export: PCAOB AS 1105 cover page + clause citations + flag resolution log | Task 6 | 2026-06-27 |

### In Beta (ships during Beta window, Weeks 11–12)

| Feature | Task | Ships by |
|---|---|---|
| Dashboard "Ready / Needs Attention" counter | Task 5 | 2026-07-18 |
| CFO email sign-off flow (J10) | Task 7 | 2026-07-18 |
| Real per-field confidence from n8n | Task 8 | 2026-07-18 |
| Journey D: first-lease onboarding | Task 9 | 2026-07-18 |
| Company-level IBR carry-forward | Task 10 | 2026-07-18 |
| J8 session progress tracker | Task 11 | 2026-07-18 |

### Explicitly out of Beta

| Feature | Reason | Target |
|---|---|---|
| Auditor portal (external read-only link) | GA+1 — no competitor has shipped this | GA+1 |
| ASC 842 report export (toggle) | +2 weeks eng estimate; IFRS 16 first | GA (if OQ #2 confirmed) |
| Amendment delta view | Requires BUG-009 stable + 2+ analyses per lease | GA+1 |
| Once-per-session consent | Pending Legal OQ #3 (GDPR) | GA or GA+1 |
| Equipment / vehicle leases | Complex extraction variance | V1.1 |
| ERP integration | P2 | Post-GA |

---

## Beta Program Structure

### Week 1 — Onboarding (2026-07-07 → 2026-07-11)
- 60-minute onboarding call per account: live walkthrough, upload first real contract together
- Walk through the trust sequence: confidence dots → spot-check 2–3 fields → resolve IBR flag → export PDF
- Provide SAMPLE-LEASE.docx as fallback if customer isn't ready with their own contract
- Assign a named LegalGraph contact (PM) per account — single point of contact for feedback
- Confirm: each account has a named external audit firm for L1-4 validation

### Weeks 2–3 — Active use (2026-07-14 → 2026-07-25)
- Participants upload ≥3 real leases from their portfolio (minimum; encourage full portfolio)
- Run the next compliance cycle using LegalGraph as the primary tool — not a parallel exercise
- Weekly 30-minute structured check-in: feedback against the exit survey template
- Bug reports via dedicated Slack channel (#legalgraph-beta) — 24-hour response SLA
- PostHog: PM reviews IBR resolution rate and Phase 4 drop-off weekly; flags any kill criteria approaching threshold

### Week 4 — Exit and evaluation (2026-07-28 → 2026-08-01)
- 45-minute structured exit interview per account (Rachel + Jennifer separately if possible)
- Collect: time saved, auditor feedback, trust in AI output, top blockers
- Validate assumption list from SPEC §11 beta validation plan (see below)
- Share anonymised aggregate findings with all participants before GA announcement

---

## Beta Assumption Validation Plan

Per SPEC §11, these six assumptions are validated in Beta — not shipped and assumed true:

| Assumption | Confidence | Validation method |
|---|---|---|
| Rachel spends 4–6 hrs/quarter on compliance prep | High | Time-tracking prompt at session end: "How long did this take?" — record in PostHog |
| Auditors accept AI-generated reports if clause trail is present | Medium | Direct auditor interview in Beta week 1; don't rely only on Rachel's self-report |
| 94% overall extraction accuracy holds for IFRS 16-specific fields | Medium | Run `node evals/run-evals.cjs --payload` against every Beta contract; publish per-field results |
| IFRS 16 is right to prioritise over ASC 842 in V1 | Medium | Survey Beta accounts on standard used; confirm with CFO |
| IBR guidance copy (J9) reduces flag abandonment | Medium | PostHog: IBR resolution rate before vs. after J9 ships — compare to pre-J9 baseline |
| Customers will upload all leases, not just a sample | Low | Track uploads per account vs. known portfolio size; follow up if <50% of portfolio uploaded |

---

## Success Criteria to Graduate to GA

Beta graduates when **all five** conditions are met. These map directly to the SPEC §11 kill criteria — Beta failure on any of these means GA does not proceed on schedule.

| # | Criterion | Target | Measurement |
|---|---|---|---|
| 1 | Time-to-report | <45 min from upload to PDF export for ≥70% of sessions | PostHog: `upload_started` → `report_exported` timestamp delta |
| 2 | Auditor acceptance rate | ≥3 of 5 Beta accounts have ≥1 report accepted by external auditor without revision | Self-reported exit interview + participant email confirmation |
| 3 | AI extraction accuracy | ≥90% field-level accuracy across all Beta contracts (≥10 contracts minimum) | `node evals/run-evals.cjs --payload` per contract; PM spot-checks against source |
| 4 | IBR resolution rate | >50% of "discount rate missing" flags resolved (not dismissed) | PostHog: `flag_resolved` with `flag_id: missing_discount_rate` |
| 5 | NPS from Beta participants | ≥40 | Exit survey (5-point scale → NPS conversion) |

**Kill criteria** (from SPEC §11) — if any threshold is breached, Beta does not graduate:

| Signal | Kill threshold | Action |
|---|---|---|
| Auditor acceptance | <60% across all 5 pilots after BUG-006 ships | Pause GA; commission direct auditor validation study |
| IBR resolution rate post-J9 | <50% resolved vs. dismissed after 2 weeks | User interview — copy may not be the issue |
| AI accuracy on Beta contracts | <90% across ≥10 contracts | Stop GA clock; audit n8n pipeline |
| Activation rate at 30 days | <55% (below company baseline) | Activation audit; pause new feature work |
| Webhook success rate | <99.5% over 7 days | P0 incident; no new features ship |

If any success criterion is not met, we run a **Beta extension** (2 additional weeks, 2026-08-03 → 2026-08-15) with a targeted remediation plan. GA does not ship on a fixed date if the product isn't working for real users.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auditors reject AI-generated reports | Medium | High | Clause drawer (`source_text`) is the trust anchor — validate BUG-006 is working before first auditor submission; include PCAOB AS 1105 statement on cover page |
| IBR missing in most real contracts | High | Medium | J9 guidance block ships as P0 before Beta; PostHog tracks resolution rate week-by-week |
| n8n webhook latency or downtime during Beta | Medium | High | PostHog webhook success rate alert if <99.5%; graceful MOCK_ANALYSIS fallback always in place |
| Supabase RLS misconfiguration exposes data cross-account | Low | Critical | RLS verified in staging with anon key before Beta starts; never use service role key on frontend |
| Real contracts more complex than sample (subleases, variable rents) | High | Medium | Set expectations in onboarding: "Beta supports standard fixed-rent leases. Flag complex structures — we'll collect them as GA test cases." |
| Beta participant uploads sensitive contracts to wrong environment | Low | High | Beta runs on dedicated Netlify environment with separate Supabase project; confirmed in DPA |

---

## Communication Plan

| Audience | Message | Channel | Timing |
|---|---|---|---|
| Beta participants | Invitation, NDA, DPA, onboarding pack | Personal email from PM | 2026-07-01 |
| Internal team | Beta scope, what's in/out, PostHog dashboard access | All-hands + Notion | 2026-06-30 |
| Waitlist (non-Beta accounts) | "Beta underway — GA coming Q3" | Email newsletter | 2026-07-07 |
| External auditors (via Beta participants) | PCAOB AS 1105 cover page on every export explains AI model, human review, and data lineage | PDF export cover page | At first export |

---

*Beta release plan owner: Product · Version: 2.0 · Last updated: 2026-05-09*
*Supersedes v1.0 (2026-05-04). Revised to align with SPEC v1.1, tasks/plan.md (13 tasks / 3 phases), DATA-MODEL.md (5 Supabase tables), and PRD v2.1.*
