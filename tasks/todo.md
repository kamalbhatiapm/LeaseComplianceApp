# Task List — LegalGraph MVP

> Generated from tasks/plan.md · 2026-05-09 · Updated 2026-05-12
> Status: ⬜ Not started · 🔄 In progress · ✅ Done · ⏸ Blocked · 🔒 Deferred

---

## Auth & Landing (Shipped 2026-05-12)

- [x] **Landing page** — Marketing page at `/` (`Landing.jsx` + `landing.css`); hero, feature sections, social proof, all CTAs → `/signin`
- [x] **Auth flow** — Sign-in / sign-up / forgot-password at `/signin` (`Auth.jsx` + `auth.css`); Supabase email+password; dark theme matching landing; "Back to home" link
- [x] **ProtectedRoute** — `/app`, `/leases`, `/audit`, `/playbooks` require auth; redirect to `/signin`; `authReady` prevents flash-of-redirect
- [x] **AppNav** — Renamed from `Nav.jsx`; avatar dropdown with user email + sign-out; mobile drawer sign-out; initials from `user.email`
- [x] **supabase.js auth helpers** — `getSession`, `signOut`, `onAuthStateChange`

---

## Phase 0 — Foundation (Weeks 1–3)

- [x] **Task 1** — J9: IBR guidance copy on discount rate flag *(shipped — FLAG_GUIDANCE covers all 11 n8n flag IDs)*
- [ ] **Task 2** — PostHog instrumentation *(Small · no deps · P0)*
- [x] **Task 3** — BUG-009: Supabase schema + persistence layer *(shipped — supabase.js + lease_analyses table + RLS policies)*
- [ ] **Task 4** — BUG-006: Clause PDF viewer with real source text *(Small–Medium · coordinate n8n · P0)*

**Checkpoint:** Phase 0 complete → all build clean → PostHog receiving events → Supabase row inserted → IBR guidance live

---

## Phase 1 — Core Compliance Workflow (Weeks 4–7)

- [ ] **Task 5** — Dashboard "Ready / Needs Attention" counter *(Medium · needs Task 3 · P1)*
- [ ] **Task 6** — Full PDF export: PCAOB AS 1105 cover page + clause citations *(Medium · needs Task 4 · P0)*
- [ ] **Task 7** — J10: CFO email sign-off flow *(Large · needs Tasks 3 + 6 · P1)*
- [ ] **Task 8** — Per-field confidence wired from n8n *(Small frontend · coordinate n8n owner · P1)*

**Checkpoint:** Phase 1 complete → PDF export with cover page → Supabase writes live → CFO approval flow tested → confidence dots real

---

## Phase 2 — Activation & Batch (Weeks 8–10)

- [ ] **Task 9**  — Journey D: First-lease onboarding *(Small · needs Task 2 · P1)*
- [ ] **Task 10** — Company-level IBR storage + carry-forward *(Small–Medium · needs Tasks 1 + 3 · P1)*
- [ ] **Task 11** — J8: Session progress tracker *(Medium · needs Tasks 2 + 3 · P1)*

**Checkpoint:** Phase 2 complete → activation funnel instrumented → IBR carry-forward working → session counter live → PostHog go/no-go review

---

## Phase 3 — Beta + GA Preparation (Weeks 11–12)

- [ ] **Task 12** — Vitest unit test suite *(Small · no deps)*
- [ ] **Task 13** — Manual QA pass + accessibility audit *(Small–Medium · all prior tasks)*

**Final checkpoint:** All 9 QA checklist items pass → `npm test` 4/4 → `node evals/run-evals.cjs` 11/11 → deploy to beta accounts

---

## Deferred

- 🔒 Auditor portal — GA+1
- 🔒 Amendment delta view — GA+1 (needs BUG-009 + 30 days post-GA data)
- 🔒 Per-field accuracy eval suite — needs n8n `payload.fields` + `payload.risk_flags` (Task 8)

---

## Kill Criteria (from SPEC §11)

Stop the GA clock if any of these thresholds are hit during beta:

| Signal | Threshold | Action |
|---|---|---|
| Beta auditor acceptance | <60% after BUG-006 ships | Pause GA; auditor validation study |
| IBR resolution rate post-J9 | <50% after 2 weeks | User interview — copy may not be the issue |
| AI accuracy on beta contracts | <90% on ≥10 contracts | Audit n8n pipeline |
| Activation at 30 days | <55% | Activation audit on upload → first report funnel |
| Webhook success rate | <99.5% over 7 days | P0 incident; no new features |
