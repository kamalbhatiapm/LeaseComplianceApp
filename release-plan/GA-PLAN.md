# LegalGraph — General Availability (GA) Release Plan
**Version 2.0 | Date: 2026-05-09**
**Owner: Product**
**Target window: 2026-08-03 → 2026-08-17 (staged rollout over 2 weeks)**
**Supersedes:** GA-PLAN v1.0 (2026-05-04) — updated to align with SPEC v1.1, tasks/plan.md, DATA-MODEL.md, and PRD v2.1 pricing

---

## Objective

Ship LegalGraph's IFRS 16 / ASC 842 compliance module to all eligible customer accounts with full confidence that:
- Rachel's compliance cycle drops from 4–6 hours to **<45 minutes** on real contracts (L1-2: ≥80% of active accounts generate ≥1 report/quarter)
- External auditors accept the output without revision **≥95% of the time** (L1-4)
- PCAOB AS 1105 documentation requirements are met on every exported report
- The product activates **≥70%** of new accounts within 14 days (L1-1)
- AI extraction accuracy is **≥94% sustained** across ≥20 contracts (L1-3)
- Regulated-sector accounts (insurance, banking, public-sector) remain gated — RAI eval must reach 96/112 before that segment opens

GA is an orderly expansion from 3–5 Beta accounts to all eligible accounts. It is not a launch event.

---

## Entry Criteria (Beta graduation gate)

GA cannot begin until **all Beta success criteria are met** (BETA-PLAN §Success Criteria) **and** the following additional conditions are true. Go/No-Go decision meeting: **2026-07-28**.

### Engineering / Product

| Criterion | Grounded in | Owner | Deadline |
|---|---|---|---|
| Beta: ≥3 of 5 accounts have ≥1 auditor-accepted report (no revision) | SPEC §11 kill criteria | Product / CSM | 2026-08-01 |
| Beta: extraction accuracy ≥90% across ≥10 contracts | SPEC §11 | Engineering | 2026-08-01 |
| Beta: IBR resolution rate >50% | SPEC §11 | Product | 2026-08-01 |
| Beta: time-to-report <45 min for ≥70% of sessions | SPEC §11 | Product | 2026-08-01 |
| Beta: NPS ≥40 | BETA-PLAN | Product | 2026-08-01 |
| All 13 tasks from tasks/plan.md complete and verified | tasks/todo.md | Engineering | 2026-08-01 |
| `npm test` — all 4 Vitest unit tests pass (Task 12) | SPEC §8 | Engineering | 2026-08-01 |
| Manual QA checklist — all 9 items pass (Task 13) | SPEC §8 | Product + Engineering | 2026-08-01 |
| `node evals/run-evals.cjs` — 11/11 (automated eval harness) | SPEC §8 | Engineering | Ongoing |
| Extraction accuracy benchmarked across ≥20 real contracts with human baseline | PRD v2.1 §AI Eval | AI / n8n | 2026-08-01 |
| Per-field confidence scores from n8n are calibrated (0.9 conf ≈ 90% accuracy on held-out set) | PRD v2.1 §AI Eval | AI / n8n | 2026-08-01 |
| PostHog L1/L2 metric dashboard live and reviewed (IBR resolution, Phase 4 drop-off) | SPEC §4, PRD v2.1 | Engineering | 2026-07-14 |
| Webhook success rate ≥99.5% over 7-day pre-GA monitoring window | SPEC §11 | Engineering | 2026-07-28 |
| Supabase RLS verified on all 5 tables (anon key isolation) | DATA-MODEL.md | Engineering | 2026-07-14 |

### Legal / Compliance

| Criterion | Owner | Deadline |
|---|---|---|
| IBR guidance copy (J9) approved by Legal (SPEC OQ #1) | PM + Legal | 2026-06-16 |
| GDPR session consent determination (SPEC OQ #3) — per-analysis or session-level | Legal | 2026-07-14 |
| Terms of Service updated to cover AI processing, data retention policy published | Legal | 2026-07-21 |
| DPA template reviewed by Legal and available for enterprise accounts | PRD v2.1 §5 J1 | Legal | 2026-07-21 |
| PCAOB AS 1105 one-pager (sales asset): "How LegalGraph meets PCAOB AS 1105 requirements" | PM + Legal | 2026-07-21 |

### Go / No-Go Decision: 2026-07-28

Attendance required: Product, Engineering, AI, Legal, CS. Criteria are binary — no partial credit. Any unmet P0 criterion pushes GA by 1 week per item.

---

## What's In GA

All 13 tasks from tasks/plan.md are GA scope. This table maps tasks to feature status.

### P0 — Ships at GA (must be complete for Wave 1)

| Feature | Task | Status |
|---|---|---|
| Contract upload (PDF, DOCX, DOC, TXT, 50 MB) | — | ✅ Shipped |
| IFRS 16 / ASC 842 field extraction via n8n (OpenAI) | — | ✅ Shipped |
| Risk scoring with High / Medium / Low flag breakdown | — | ✅ Shipped |
| T.R.U.S.T framework UX (confidence dots, uncertainty chips, extraction quality, export gate, fallback badge) | — | ✅ Shipped |
| IBR "What do I do?" guidance block — J9 | Task 1 | Wk 1 |
| PostHog event instrumentation (6 key events) | Task 2 | Wk 1–3 |
| Supabase persistence — analysis history across sessions | Task 3 (BUG-009) | Wk 1–3 |
| Clause drawer with real `source_text` from n8n | Task 4 (BUG-006) | Wk 1–3 |
| Dashboard "Ready / Needs Attention" counter | Task 5 | Wk 4–7 |
| Full PDF export: PCAOB AS 1105 cover page, per-field citations, flag resolution log, audit trail | Task 6 | Wk 4–7 |
| CFO email sign-off flow (J10) — approval token, Supabase logging, cover page stamp | Task 7 | Wk 4–7 |
| Per-field confidence scores from n8n pipeline (real, not mock) | Task 8 | Wk 4–7 |
| Journey D first-lease onboarding — banner + post-extraction first-win prompt | Task 9 | Wk 8–10 |
| Company-level IBR carry-forward with cross-quarter suggestion | Task 10 | Wk 8–10 |
| J8 session progress tracker ("X of Y leases complete") | Task 11 | Wk 8–10 |
| Vitest unit test suite — 4 tests pass | Task 12 | Wk 11–12 |
| Manual QA + accessibility audit — 9/9 checklist items | Task 13 | Wk 11–12 |

### P1 — Shipping at GA (confirmed if OQ #2 resolved in time)

| Feature | Dependency | Notes |
|---|---|---|
| ASC 842 standard toggle (report export + extraction standard switch) | OQ #2: Eng Lead + CFO confirmation | +2 weeks estimate; targeted for Wave 2 if OQ #2 confirmed by 2026-06-16 |
| Once-per-session consent (vs. per-analysis) | OQ #3: Legal GDPR determination | Ships only after Legal confirms session-level consent is sufficient |

### Explicitly Out of Scope for GA

| Feature | Reason | Target |
|---|---|---|
| Auditor portal (external read-only link, no login) | GA+1 — first-mover opportunity; no competitor has shipped this | GA+1 Q4 2026 |
| Amendment delta view | Requires BUG-009 stable + 2+ analysis runs per lease; data not yet available at GA | GA+1 |
| ERP integration (NetSuite, SAP) | P2 — partner integration investment not scoped | GA+1 |
| Equipment / vehicle leases | V1 is property leases only | V1.1 |
| Accounting journal entries (DR/CR) | Creates financial advice liability | Out of scope |
| SOX compliance reporting | Different workflow, different standard | Post-GA |
| IBR as a calculated financial service | Legal advice liability | Out of scope — guidance only |
| Regulated-sector accounts (insurance, banking, public-sector) | RAI eval must reach 96/112 first (currently 58/112) | GA+1 after RAI remediation |

---

## Rollout Plan

GA uses a staged rollout — not a flag-flip. Controls blast radius if something breaks at scale.

### Wave 1 — Beta accounts (Day 1, 2026-08-03)
- Auto-upgraded from Beta to GA without re-onboarding
- First to receive all GA features
- Monitored daily for 3 days via PostHog; any P0 incident pauses Wave 2
- Personal thank-you note from PM

### Wave 2 — Existing LegalGraph enterprise accounts (Days 3–7, 2026-08-05)
- 45 existing accounts using LegalGraph for contract management (not yet on the compliance module)
- In-app banner: "IFRS 16 Compliance is now live — generate your first audit-ready report"
- CSM outreach to top 15 accounts by lease count — personalised activation email with ROI framing ($14–20K/year labour saving vs. $8K entry price)
- PCAOB AS 1105 one-pager sent to Jennifer persona contacts at enterprise accounts

### Wave 3 — Waitlist + new signups (Days 8–14, 2026-08-10)
- Waitlist accounts notified via email sequence (Day 1: announcement, Day 3: how-to, Day 7: "Rachel's story" case study from Beta)
- Self-serve onboarding enabled — Journey D first-lease banner guides new users
- Pricing page live with compliance module SKU

### Wave 4 — Full public availability (Day 14+, 2026-08-17)
- Blog post: "From 5 hours to 45 minutes — how LegalGraph eliminates IFRS 16 manual work"
- LinkedIn + Product Hunt listing
- Visual Lease displacement campaign activated: outbound sequence to mid-market VL customers mid-renewal cycle
- Regulated-sector waitlist opened with clear "coming Q4 2026" messaging and qualification form

---

## Pricing at GA

Per PRD v2.1 §Pricing & Business Case. Commercial team owns final pricing; these are the directional tiers that inform the pricing page.

| Tier | Lease count | Price | Message |
|---|---|---|---|
| Entry | 10–25 leases | **$8,000/year** | The PCAOB AS 1105-ready upgrade from EZLease: "when your auditor starts asking for clause evidence, you need LegalGraph" |
| Mid-market | 26–50 leases | **$15,000/year** | 3-seat minimum (Rachel + Jennifer + David personas) |
| Enterprise | 50+ leases + ERP integration | **$45,000+/year (custom)** | J10 CFO sign-off and GA+1 auditor portal as enterprise differentiators |

**Beta participant offer:** 3 months free as a thank-you; converts to standard pricing at month 4.
**ROI framing for Jennifer:** Rachel's current labour cost: 4–6 hours × $300/hr × 4 quarters × 10 leases = $14,400–$21,600/year. LegalGraph entry price: $8,000/year. Net saving: **$6,400–$13,600/year** on labour alone, before auditor revision request costs.

---

## SLA Commitments at GA

| Service | Commitment |
|---|---|
| Uptime | 99.5% monthly (Netlify + n8n + Supabase) |
| Analysis latency (p95) | <8 seconds from upload to results screen (45s minimum display enforced in UI) |
| Webhook availability | ≥99.5% success rate (SPEC §11 kill criterion); graceful MOCK_ANALYSIS fallback always active |
| Supabase writes | <500ms p95 for analysis record upsert; data durable across sessions |
| CFO approval email delivery | <2 minutes from "Send approval request" to inbox |
| Support response (P1 — extraction failure on real contract) | <4 hours during business hours |
| Support response (P2 — UI bug, non-blocking) | <2 business days |
| Data deletion request | Within 30 days of request (per consent modal and ToS) |

---

## Success Metrics — First 30 Days Post-GA

Reviewed at the 30-day post-GA retrospective. These map directly to the L1 metrics from PRD v2.1.

| Metric | L1 ref | Baseline | Target | Action if missed |
|---|---|---|---|---|
| Activation rate (first extraction ≤14 days of signup) | L1-1 | 55% (company) | **≥70%** | Review PostHog upload drop-off funnel; trigger Journey D onboarding check |
| Report generation rate (≥1 report/quarter per active account) | L1-2 | 0% | **≥50% in month 1** (→ ≥80% by 90 days) | CSM high-touch outreach to stalled accounts; review Phase 4 drop-off in PostHog |
| AI extraction accuracy (vs. human baseline ~80–85%) | L1-3 | 94% on 1 contract | **≥94% sustained across ≥20 contracts** | If <90%: pause Wave 4; audit n8n pipeline (SPEC §11 kill criterion) |
| Auditor acceptance rate | L1-4 | Unknown | Begin tracking; target ≥95% by 6 months | Post-export "Did your auditor accept this?" prompt; 0 restatement requests in 30 days as proxy |
| IBR resolution rate | L2 (under L1-2) | Unknown | ≥80% resolved vs. dismissed | PostHog `flag_resolved` vs. dismissed signal; check J9 copy effectiveness |
| Phase 4 (flag resolution) completion rate | L2 (under L1-2) | Unknown | <15% session drop-off | PostHog session funnel; investigate flag resolution friction |
| Webhook success rate | Guardrail | Unknown | ≥99.5% | SPEC §11 kill criterion — automatic P0 incident if breached over 7 days |

---

## GTM and Launch Communications

### Internal (2026-07-28 — Go/No-Go meeting)
- Engineering: deployment checklist signed off; all 13 tasks verified in staging
- CS: support runbook reviewed; team trained on IBR guidance, clause drawer, and PDF export questions
- Marketing: launch assets approved (blog draft, email sequence, LinkedIn)
- Legal: ToS, privacy policy, and PCAOB AS 1105 one-pager live
- AI: accuracy benchmark published internally (≥20 contracts, per-field breakdown, human baseline comparison)

### Customer communications

| Audience | Message | Channel | Timing |
|---|---|---|---|
| Beta participants | "You helped build this — you're first" + GA upgrade | Personal email from PM | 2026-08-01 |
| Jennifer (GC/CFO) at enterprise accounts | PCAOB AS 1105 one-pager + DPA template | CSM outreach + email | 2026-08-05 (Wave 2) |
| Existing enterprise accounts | Feature announcement + activation CTA | In-app banner + email | 2026-08-05 (Wave 2) |
| Waitlist | Launch announcement + self-serve signup link | Email sequence | 2026-08-10 (Wave 3) |
| Market | Blog: "From 5 hours to 45 minutes" | Website + LinkedIn + Product Hunt | 2026-08-17 (Wave 4) |
| External auditors (via participants) | PCAOB AS 1105 cover page on every export; auditor one-pager PDF via Beta participants | PDF + Rachel forwards | 2026-08-17 |
| Visual Lease displacement targets | "Mid-market lease compliance — built for audit defence" | Outbound sales sequence | 2026-08-17 |

---

## Post-GA Roadmap (GA+1, Q4 2026)

In priority order, based on SPEC §4 GA+1 scope and Beta learnings:

1. **Auditor portal** — read-only shareable link for auditors; no LegalGraph login required. First-mover opportunity — no competitor has shipped this. Trullion's top G2 feature is clause navigation; this extends it to full auditor independence (Story A1 in PRD v2.1).
2. **Amendment delta view** — "field X changed from Y to Z since last analysis." Requires BUG-009 stable + 2+ analysis runs per lease per account.
3. **RAI remediation to 96/112** — unlocks regulated-sector accounts (insurance, banking, public-sector auditors). Primary gaps: Fairness dimension (multi-jurisdiction testing, bias review of risk scoring algorithm).
4. **ERP integration (NetSuite)** — pushes extracted lease data directly into accounting systems. Most-requested P2 feature from enterprise accounts.
5. **Automated renewal alerts** — proactive notification when a lease is within 6 / 3 / 1 months of expiry.

---

## Rollback Plan

If a P0 incident occurs post-GA (extraction failure on >5% of uploads, Supabase data integrity issue, or auditor acceptance rate drops below 80%):

1. **Immediate:** Pause all Wave 3/4 activation emails. Do not onboard new accounts.
2. **Within 2 hours:** Engineering root-cause analysis begins. PM notifies affected accounts via email.
3. **Within 24 hours:** Mitigation deployed or rollback to previous stable Netlify build.
4. **Within 48 hours:** Post-mortem written and shared with all GA accounts. Timeline for fix communicated.
5. **Re-activation:** Only after the triggering condition is resolved and a 24-hour smoke-test period (including `node evals/run-evals.cjs`) passes cleanly.

---

*GA release plan owner: Product · Version: 2.0 · Last updated: 2026-05-09*
*Supersedes v1.0 (2026-05-04). Revised to align with SPEC v1.1, tasks/plan.md (13 tasks / 3 phases), DATA-MODEL.md (5 Supabase tables), PRD v2.1 (pricing tiers, L1/L2 metrics, AI eval strategy).*
