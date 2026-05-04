# LegalGraph — General Availability (GA) Release Plan
**Version 1.0 | Date: 2026-05-04**
**Owner: Product**
**Target window: 2026-08-03 → 2026-08-17 (staged rollout over 2 weeks)**

---

## Objective

Ship LegalGraph's IFRS 16 / ASC 842 compliance module to all eligible customer accounts with full confidence that:
- The product reduces Rachel's compliance cycle from 4–6 hours to <45 minutes on real contracts
- External auditors accept the output without revision ≥95% of the time
- The product meets the bar for mid-market legal and finance teams (HHH ≥90/105)
- Regulated-sector accounts (insurance, banking, public sector) are gated behind a separate qualification — GA ships to commercial / professional-services accounts first

GA is not a launch event. It is an orderly expansion from 5–8 Beta accounts to all eligible accounts, with quality gates at each stage of the rollout.

---

## Entry Criteria (Beta graduation gate)

GA cannot begin until all Beta success criteria are met **and** the following additional conditions are true:

| Criterion | Owner | Deadline |
|-----------|-------|----------|
| Beta: <45 min time-to-report for ≥70% of sessions | Product | 2026-07-21 |
| Beta: ≥1 accepted auditor report per participating account | Product/CSM | 2026-07-21 |
| Beta: extraction accuracy ≥90% on real contracts | AI / Engineering | 2026-07-21 |
| Beta NPS ≥40 | Product | 2026-07-21 |
| HHH eval score ≥90/105 | Product | 2026-07-21 |
| RAI eval score ≥80/112 (GA threshold; regulated-client threshold ≥96/112 is later) | Product | 2026-07-21 |
| Clause reference PDF viewer functional (BUG-006) | Engineering | 2026-07-14 |
| Audit Trail tab wired (or explicitly disabled until GA+1) | Engineering | 2026-07-14 |
| Event tracking instrumented across all key flows | Engineering | 2026-07-07 |
| Extraction accuracy benchmarked across ≥20 real contracts | AI | 2026-07-14 |
| SLA and uptime commitments documented and operationally backed | Engineering / Infra | 2026-07-21 |
| Legal: Terms of Service updated to cover AI processing, data retention policy published | Legal | 2026-07-14 |
| Support: helpdesk runbook and escalation path defined | CS | 2026-07-14 |

**Go / No-Go decision meeting: 2026-07-24.** Attendance required from Product, Engineering, AI, Legal, CS.

---

## What's In GA

### P0 — Shipping at GA

| Feature | Status at Beta entry | GA status |
|---------|---------------------|-----------|
| Contract upload (PDF, DOCX, DOC, TXT, up to 50 MB) | ✅ | ✅ |
| IFRS 16 field extraction — 9 required fields | ✅ | ✅ |
| Risk scoring with High / Medium / Low flag breakdown | ✅ (mock score) | ✅ Live score from n8n |
| Clause-level audit trail with source citations | ✅ | ✅ |
| Clause reference PDF viewer (click citation → highlights clause) | ❌ BUG-006 | ✅ Required for GA |
| Report gate (High flags must be resolved before export) | ✅ | ✅ |
| IFRS 16 report PDF export with LegalGraph branding | ✅ | ✅ |
| Persistent storage — extraction results survive page refresh | ✅ Beta | ✅ |
| Multi-lease dashboard with live Supabase data | ❌ Static | ✅ |
| Playbook management (view + edit) | View only | ✅ Full edit |
| Consent modal + "not legal advice" disclaimer | ✅ | ✅ |
| Data source badge (Live / Demo / Fallback) | ✅ | ✅ |

### P1 — Shipping at GA

| Feature | Notes |
|---------|-------|
| ASC 842 standard support | Toggle between IFRS 16 and ASC 842 in playbook and report export |
| Amendment tracking | Flag delta impact when a lease is amended vs. prior extraction |
| Bulk report generation | Generate compliance reports for all leases in one action |
| Email delivery of reports | Send PDF directly to auditor email addresses from within the product |
| Audit Trail tab | Full clause-level audit log with timestamps — enabled in nav |

### Explicitly Out of Scope for GA

| Feature | Rationale | Planned for |
|---------|-----------|-------------|
| ERP integration (NetSuite, SAP) | P2 — requires partner integration work | GA+1 (Q4 2026) |
| Automated renewal alerts | P2 | GA+1 |
| Regulated-sector accounts (insurance, banking, public-sector) | RAI score must reach 96/112 first | GA+1 after RAI remediation |
| Auditor portal access (external login) | Out of scope V1 | Post-GA roadmap |
| Equipment / vehicle leases | V1 is property leases only | V1.1 |
| SOX compliance reporting | Separate workflow | Post-GA roadmap |

---

## Rollout Plan

GA uses a staged rollout, not a flag-flip. This controls blast radius if something breaks at scale.

### Wave 1 — Existing Beta accounts (Day 1, 2026-08-03)
- Auto-upgraded from Beta to GA without re-onboarding
- First to receive new GA features (ASC 842, bulk export, amendment tracking)
- Monitored daily for 5 days; any P0 incident pauses Wave 2

### Wave 2 — Existing LegalGraph enterprise accounts (Days 3–7, 2026-08-05)
- Accounts already using LegalGraph for contract management but not the compliance module
- In-app banner: "IFRS 16 Compliance is now available — try it with your first lease"
- CSM outreach to top 20 accounts (by lease count) with a personalised activation email

### Wave 3 — New signups and waitlist (Days 8–14, 2026-08-10)
- Waitlist accounts notified via email sequence (Day 1: announcement, Day 3: how-to, Day 7: "Rachel's story" case study from Beta)
- Self-serve onboarding flow enabled — no white-glove required
- Pricing page updated with compliance module SKU

### Wave 4 — Full availability (Day 14+, 2026-08-17)
- Public-facing marketing: blog post, LinkedIn, product hunt listing
- Regulated-sector waitlist opened (with clear "coming soon" messaging and qualification form)

---

## SLA Commitments at GA

| Service | Commitment |
|---------|-----------|
| Uptime | 99.5% monthly (Netlify + n8n pipeline) |
| Analysis latency (p95) | <8 seconds from upload to results screen |
| Webhook availability | 99.5% success rate; graceful demo fallback if n8n unavailable |
| Support response (P1 — extraction failure on real contract) | <4 hours during business hours |
| Support response (P2 — UI bug, non-blocking) | <2 business days |
| Data deletion request | Within 30 days of request (per consent modal disclosure) |

---

## Success Metrics — First 30 Days Post-GA

These are the metrics that will be reviewed at the 30-day post-GA retrospective to determine whether GA is healthy or needs intervention.

| Metric | Target | Action if missed |
|--------|--------|-----------------|
| Activation rate (first extraction within 14 days) | ≥70% of new accounts | Trigger onboarding email sequence; review upload UX drop-off |
| Report generation rate | ≥50% of activated accounts generate ≥1 report in month 1 | High-touch CSM outreach to stalled accounts |
| Extraction accuracy on GA contracts | ≥94% sustained | Pause Wave 4 if drops below 90%; investigate model inputs |
| NPS (30-day in-app survey) | ≥45 | Review verbatims for top complaint theme; sprint planning |
| Support ticket volume | <5% of activated accounts open a P1 ticket | Investigate root cause; update runbook |
| Auditor acceptance rate | Begin tracking; target ≥95% by 6-month mark | Cannot measure in 30 days — qualitative proxy: 0 restatement requests |

---

## GTM and Launch Communications

### Internal (2026-07-24 — Go/No-Go meeting)
- Engineering: deployment checklist signed off
- CS: support runbook reviewed; team trained on common extraction questions
- Marketing: launch assets approved (blog draft, email sequence, LinkedIn)
- Legal: ToS and privacy policy updated and live

### Customer communications

| Audience | Message | Channel | Timing |
|----------|---------|---------|--------|
| Beta participants | "You helped build this — you're first" thank-you + GA upgrade notice | Personal email from PM | 2026-08-01 |
| Existing enterprise accounts | Feature announcement + activation CTA | In-app banner + email | 2026-08-05 (Wave 2) |
| Waitlist | Launch announcement + self-serve signup link | Email sequence | 2026-08-10 (Wave 3) |
| Market | Blog: "From 5 hours to 45 minutes — how LegalGraph eliminates IFRS 16 manual work" | Website + LinkedIn | 2026-08-17 (Wave 4) |
| Auditor community | One-page explainer: what a LegalGraph compliance report contains, how to validate clause citations | PDF via Beta participants | 2026-08-17 |

### Pricing at GA
- Compliance module is an add-on to the existing LegalGraph contract management SKU
- Beta participants receive 3 months free as a thank-you; converts to standard pricing at month 4
- Pricing tiers by lease count: 1–10 leases / 11–25 leases / 26–50 leases
- *(Specific pricing TBD by commercial team — this plan does not set it)*

---

## Post-GA Roadmap Priorities (GA+1, Q4 2026)

In priority order, based on Beta learnings and open eval gaps:

1. **RAI remediation to 96/112** — unlocks regulated-sector accounts (insurance, banking, public-sector auditors). Primary gaps: Fairness dimension (multi-jurisdiction testing, bias review of risk scoring), Privacy (named third-party disclosures, retention policy).
2. **ERP integration (NetSuite)** — most-requested P2 feature from enterprise accounts; pushes extracted lease data directly into accounting systems.
3. **Automated renewal alerts** — proactive notification when a lease is within 6/3/1 months of expiry; reduces the "surprised by renewal" scenario Jennifer flagged in discovery.
4. **Equipment / vehicle lease support** — expands TAM beyond property leases.
5. **Auditor portal** — external auditor login to view reports and clause citations directly without receiving a PDF; improves audit defensibility and reduces back-and-forth.

---

## Rollback Plan

If a P0 incident occurs post-GA (extraction failure on >5% of uploads, data leak, or auditor acceptance rate drops below 80%):

1. **Immediate:** Pause all Wave 3/4 activation emails. Do not onboard new accounts.
2. **Within 2 hours:** Engineering root-cause analysis begins. PM notifies affected accounts.
3. **Within 24 hours:** Mitigation deployed or rollback to previous stable build executed via Netlify.
4. **Within 48 hours:** Post-mortem written and shared with all GA accounts. Timeline for fix communicated.
5. **Re-activation:** Only after the triggering condition is resolved and a 24-hour smoke-test period passes cleanly.

---

*GA release plan owner: Product · Reviewed by: Engineering, CS, Legal · Last updated: 2026-05-04*
