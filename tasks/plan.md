# Implementation Plan: LegalGraph MVP — SPEC v1.1

**Grounded in:** SPEC.md v1.1 · PRD v2.1 · current codebase audit (2026-05-09)
**North Star:** Audit-ready compliance reports generated per active account per quarter
**GA target:** Week 12 · L1-1 ≥70% activation · L1-3 ≥94% accuracy across ≥20 contracts

---

## Overview

The React 18 + Vite SPA is largely built. The T.R.U.S.T UX layer is complete (9 tasks shipped). What remains is the **persistence layer** (BUG-009), the **audit-defence features** (BUG-006, full PDF export, J10 sign-off), the **activation unblocking** (J9 IBR copy, PostHog instrumentation, Journey D onboarding), and the **batch workflow** (J8 session tracker, IBR carry-forward).

All state currently lives in `App.jsx` and resets on page load — no account history, no portfolio status, no saved IBR. Every feature that compounds value across sessions is blocked until BUG-009 ships. That makes it the single highest-leverage task in the plan.

---

## Dependency Graph

```
J9: IBR guidance copy (standalone — no deps)
PostHog instrumentation (standalone — no deps)

BUG-009: Supabase persistence
    ├── Dashboard "Ready / Needs Attention" counter (Task 5)
    ├── J8: Session progress tracker (Task 9)
    ├── J10: CFO email sign-off flow (Task 7)
    └── Company-level IBR storage + carry-forward (Task 10)

BUG-006: Clause PDF viewer full text (partial dep on BUG-009 for persistence)
    └── Full PDF export — inline clause text (Task 6)

Full PDF export: cover page + PCAOB AS 1105 (Task 6)
    └── J10: sign-off stamp on cover page (Task 7)

Journey D: First-lease onboarding
    └── PostHog (to measure first_report_generated)
```

**Implementation order:** Risk-first. BUG-009 is the highest-impact dependency — it gates 5 of the 12 remaining tasks. J9 and PostHog have no dependencies and are started first to unblock activation measurement before BUG-009 lands.

---

## Phase 0 — Foundation (Weeks 1–3)

### Task 1: J9 — IBR Guidance Copy on Discount Rate Flag

**Description:** The "Discount rate missing — High" flag is the #1 activation stall (user research Finding 3). Every time this flag appears, users need actionable guidance to resolve it. A structured "What do I do?" block with IFRS 16.26 methodology and an input field replaces the current dead-end flag display. This is a copy + minor UI change — no backend required.

**Status:** `FLAG_GUIDANCE` constant and `FlagGuidance` component exist in `LeaseAnalysis.jsx`. Verify the guidance block is surfaced correctly and covers all required content per SPEC §7 Checkpoint 3.

**Acceptance criteria:**
- [ ] Every "Discount rate missing — High severity" flag renders a collapsible "What do I do?" block
- [ ] Block contains three labelled steps: IBR definition, calculation approach, IFRS 16.26 documentation requirement
- [ ] Input field: "Enter rate for this lease" accepts a decimal value and persists in local state
- [ ] "Save as default for this portfolio" toggle visible (functional in Task 10 when Supabase is live)
- [ ] Entering a value shows "✓ Saved — will appear in audit log" confirmation
- [ ] Legal sign-off on rate methodology copy before shipping to users (Open Question #1)

**Verification:**
- [ ] Manual: Upload SAMPLE-LEASE.docx → discount_rate flag appears → expand "What do I do?" → all three steps visible
- [ ] Manual: Enter a rate → confirmation message appears → value persists on same-session re-visit
- [ ] Build: `npm run build` succeeds
- [ ] Eval: `node evals/run-evals.cjs` still 11/11

**Dependencies:** None
**Files:** `src/screens/LeaseAnalysis.jsx`, `src/styles/globals.css`
**Scope:** Small (1–2 files)

---

### Task 2: PostHog Instrumentation

**Description:** Wire the existing `track()` stub to PostHog before the first beta invite. Two signals gate the GA decision: IBR flag resolution rate and Phase 4 (flag resolution) drop-off. Without real data, the GA decision is made blind. `VITE_POSTHOG_KEY` needs adding to `.env` and `.env.example`.

**Acceptance criteria:**
- [ ] `src/utils/track.js` calls `window.posthog?.capture(event, props)` when PostHog is initialised
- [ ] PostHog snippet initialised in `index.html` (or `src/main.jsx`) behind `VITE_POSTHOG_KEY` — silently no-ops if key not set
- [ ] `VITE_POSTHOG_KEY` added to `.env.example` with placeholder value
- [ ] SPEC.md `VITE_POSTHOG_KEY` already listed under env vars — confirm `.env.example` matches
- [ ] All existing `track()` calls in the codebase fire events visibly in PostHog Live Events view during manual QA
- [ ] No personally identifiable information (lease content, user names) sent in event properties

**Key events already instrumented (verify all fire):**
- `upload_started` — `{ file_name, file_size_kb }`
- `analysis_complete` — `{ webhook_ok, risk_score, used_demo_data }`
- `field_edited` — `{ key, original_value, corrected_value, confidence, source_clause }`

**New events to add:**
- `ibr_rate_entered` — `{ lease_id: null (pre-BUG-009), method: 'manual' }` — fired on IBR input save
- `flag_resolved` — `{ flag_id, severity, action }` — fired when a High flag is signed off
- `report_exported` — `{ flag_count_resolved, fields_edited }` — fired on PDF export
- `session_started` — `{ returning: boolean }` — fired on consent grant

**Verification:**
- [ ] `npm run dev` → upload a file → open PostHog Live Events → confirm `upload_started` appears
- [ ] Complete analysis → `analysis_complete` appears with correct `risk_score`
- [ ] Edit a field → `field_edited` appears with `key`, `original_value`, `corrected_value`
- [ ] `npm run build` succeeds
- [ ] No events fire if `VITE_POSTHOG_KEY` is unset (silent fail)

**Dependencies:** None
**Files:** `src/utils/track.js`, `index.html` (or `src/main.jsx`), `.env.example`
**Scope:** Small

---

### Task 3: BUG-009 — Supabase Schema + Persistence Layer

**Description:** The single highest-impact unblocked task. All state currently resets on page load. This task creates the Supabase schema, wires the JS client, and migrates `analysisData` + `fieldEdits` from `App.jsx` ephemeral state into persistent records. Five downstream tasks (5, 7, 9, 10, and BUG-006 full clause text) all depend on this being live.

**Acceptance criteria:**
- [ ] Supabase client initialised in `src/utils/supabase.js` using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon key only — never service role on frontend)
- [ ] `analyses` table created with columns: `id`, `account_id`, `file_name`, `standard`, `created_at`, `analysis_json` (JSONB), `field_edits_json` (JSONB), `flags_resolved` (JSONB), `ibr_rate` (numeric, nullable), `status` (enum: `'pending' | 'ready' | 'needs_attention'`)
- [ ] Row-level security enabled on `analyses` table before any data writes
- [ ] After `runAnalysis()` succeeds, result is upserted to `analyses` table
- [ ] `fieldEdits` saved to `analyses.field_edits_json` on each edit (debounced 500ms)
- [ ] On app load, most recent `analyses` record is fetched and hydrates `analysisData` state — Rachel's last session is visible immediately
- [ ] `analyses.status` is computed and stored: `'ready'` if no unresolved High flags, `'needs_attention'` if ≥1 unresolved High flag, `'pending'` if not yet analysed
- [ ] All Supabase writes have error handling — failure falls back silently (does not break the UI)

**Verification:**
- [ ] `npm run dev` → upload and analyse → reload page → previous analysis still shown (not MOCK_ANALYSIS)
- [ ] Edit a field → reload → edit persists
- [ ] In Supabase table editor: confirm row inserted with correct `analysis_json` and `status`
- [ ] Confirm RLS policy is active: anon key cannot read other users' rows
- [ ] `npm run build` succeeds
- [ ] `node evals/run-evals.cjs` still 11/11

**Dependencies:** None (but must ship before Tasks 5, 7, 9, 10)
**Files:** `src/utils/supabase.js` (new), `src/App.jsx`, Supabase dashboard (schema migration)
**Scope:** Medium (3–5 files)

---

### Task 4: BUG-006 — Clause PDF Viewer with Real Source Text

**Description:** The clause source drawer exists (right-side slide-in) but shows only the `source_clause` reference string (e.g. "§5.1"). It needs to show the actual clause paragraph text returned by n8n. This is the "trust anchor" from user research Finding 2 — the first time Rachel clicks a citation and sees the real clause text, she stops manually opening PDFs. It is also required for PCAOB AS 1105 inline evidence.

**This task has two parts:**
1. **n8n pipeline update:** Each field in the response payload must include `source_text` (the actual clause paragraph, ~100 words) alongside the existing `source_clause` reference.
2. **Frontend:** Clause drawer renders `source_text` when present, with section reference, page number, and 50-word context window.

**Acceptance criteria:**
- [ ] n8n `key_term_extraction_agent` returns `source_text` per field alongside `source_clause` (coordinate with whoever owns the n8n workflow)
- [ ] `MOCK_ANALYSIS.fields` in `constants.js` updated to include `source_text` per field for local development/testing
- [ ] Clause drawer shows: section number (bold), page reference (if returned), full `source_text` paragraph
- [ ] If `source_text` is absent (legacy payloads), drawer gracefully falls back to showing the `source_clause` reference only — no empty drawer
- [ ] Clause text is scrollable if longer than the drawer height
- [ ] Drawer is keyboard accessible (Escape closes it; focus returns to the trigger element)

**Verification:**
- [ ] Manual: Upload SAMPLE-LEASE.docx → click "§5.1" on `annual_payment_usd` → drawer opens with full clause text
- [ ] Manual: Keyboard: Tab to source tag → Enter opens drawer → Escape closes it → focus returns
- [ ] Manual: `MOCK_ANALYSIS` fallback: drawer opens with mock source_text (no blank drawer)
- [ ] `npm run build` succeeds
- [ ] Manual QA checklist item "Click source clause tag → drawer opens with clause text" ✓

**Dependencies:** None for frontend (uses MOCK_ANALYSIS). Coordinate n8n payload update separately.
**Files:** `src/screens/LeaseAnalysis.jsx`, `src/utils/constants.js`, `src/styles/globals.css`
**Scope:** Small–Medium

---

### Checkpoint: After Phase 0 (end of Week 3)

- [ ] All tests pass: `npm run build` clean, `node evals/run-evals.cjs` 11/11
- [ ] IBR guidance block live and legible in both themes
- [ ] PostHog receiving events in Live Events dashboard
- [ ] Supabase `analyses` table has at least 1 real row from a test upload
- [ ] Clause drawer shows real source text from MOCK_ANALYSIS
- [ ] **Human review required before Phase 1:** PM confirms PostHog IBR resolution rate is measurable; Legal sign-off on IBR copy (OQ #1) and GDPR session consent question (OQ #3)

---

## Phase 1 — Core Compliance Workflow (Weeks 4–7)

### Task 5: Dashboard "Ready / Needs Attention" Counter

**Description:** Rachel logs in 4× per year under deadline pressure. The first thing she needs to know in under 60 seconds is: how many leases are ready to report, how many need attention, how many haven't been run yet. This counter + portfolio table status is the J3 job-to-be-done. It depends on BUG-009 (Task 3) for real per-lease status.

**Acceptance criteria:**
- [ ] Dashboard header shows: "X leases ready to report · Y need attention · Z not yet analysed" — counts drawn from `analyses` table `status` column
- [ ] Portfolio table row shows per-lease: last-analysed date, status badge (Ready/Needs attention/Not yet run), and an upcoming expiry warning (amber if ≤90 days, red if ≤30 days)
- [ ] "Needs attention" row is clickable → navigates directly to `/leases` with that lease's analysis loaded
- [ ] Empty state (no analyses in Supabase) shows demo portfolio table clearly labelled "Demo data" with an upload CTA
- [ ] Counter and table reflect live Supabase data on every mount — no stale state from previous session
- [ ] Stale analysis (>90 days old) shows warning: "Last analysed [date] — results may not reflect recent amendments"

**Verification:**
- [ ] `npm run dev` → upload 2 leases (one with unresolved High flag, one clean) → dashboard header shows "1 ready · 1 needs attention"
- [ ] Click "needs attention" row → navigates to `/leases` with correct analysis
- [ ] Clear `analyses` table → reload → demo portfolio shown with "Demo data" label
- [ ] `npm run build` succeeds

**Dependencies:** Task 3 (BUG-009)
**Files:** `src/screens/Dashboard.jsx`, `src/utils/supabase.js`
**Scope:** Medium

---

### Task 6: Full PDF Export — PCAOB AS 1105 Cover Page + Clause Citations

**Description:** `window.print()` ships but the output lacks the cover page and structured clause citations PCAOB AS 1105 requires. An auditor who receives the current export has no AI model disclosure, no human review sign-off, and no inline clause text — they cannot verify fields against source documents independently. This task completes the export to make it auditor-acceptable.

**Acceptance criteria:**
- [ ] Print stylesheet produces a cover page as page 1 with: lease name, analysis date, standard (IFRS 16 / ASC 842), LegalGraph version, "Powered by OpenAI API via n8n", "AI-assisted, human-reviewed" statement with analyst name + date, PCAOB AS 1105 compliance statement ("This report was generated with AI assistance. All material fields have been reviewed by a human analyst.")
- [ ] Per-field table: extracted value, source clause reference, confidence indicator (High/Verify/Not found), AI-extracted vs. manually-verified badge
- [ ] Risk flags section: every flag raised, severity, resolution action, who resolved it, timestamp
- [ ] Audit trail section: extraction timestamp, all manual field edits with original → corrected value, editor name, timestamp
- [ ] Analyst name field: prompt Rachel to enter her name before export if not yet stored (persisted to Supabase via Task 3)
- [ ] PDF renders correctly in Adobe Acrobat and browser-native PDF viewer
- [ ] `window.print()` trigger remains on the `/audit` route (no regression)

**Verification:**
- [ ] Manual: resolve all High flags → click "Export PDF" → print dialog opens → preview shows cover page as page 1
- [ ] Manual: per-field table has source clause references and confidence badges
- [ ] Manual: flags section shows resolution timestamp and actor
- [ ] Manual: PCAOB compliance statement visible on cover page
- [ ] `npm run build` succeeds
- [ ] Manual QA checklist: "Export audit log → browser print dialog opens; nav/toolbar hidden in print preview" ✓

**Dependencies:** Task 4 (BUG-006 clause text for inline citations); Task 3 (analyst name persistence) — Task 6 can ship without Task 7 (CFO sign-off stamp is added by Task 7 separately)
**Files:** `src/screens/AuditTrail.jsx`, `src/styles/globals.css` (`@media print` block)
**Scope:** Medium

---

### Task 7: J10 — CFO Email Sign-Off Flow

**Description:** PCAOB AS 1105 requires documented human oversight beyond the primary analyst. Jennifer (CFO/GC) must be able to approve a compliance report from her email inbox — no LegalGraph login required — and have her approval logged in the audit trail and rendered on the PDF cover page. This is also deal-conversion lever #2 for Jennifer (USER-JOURNEY Journey B: "Will auditors accept this?").

**Acceptance criteria:**
- [ ] "Request internal review" button visible on completed report (after all High flags resolved, on `/leases` sidebar)
- [ ] Clicking opens a modal: approver email input, optional note field, "Send approval request" button
- [ ] App generates a Supabase-backed approval token and sends email via Supabase Edge Function (or email provider — see Open Question #5 re: link expiry)
- [ ] Approver email contains: PDF link, summary of report, one-click "Approve this report" button
- [ ] On approval: approver name, email, timestamp, and optional comment stored in `analyses.approval_json`
- [ ] Approved report cover page (Task 6) renders the approval stamp: "Approved by [name] on [date]"
- [ ] Rachel sees an in-app notification: "Jennifer Martinez approved this report on [date]"
- [ ] Portfolio dashboard status for an approved lease changes to "Approved — pending submission"
- [ ] If no approval within 48 hours, Rachel sees a reminder prompt (not an email — keep server-side ops minimal for MVP)

**Verification:**
- [ ] Manual: complete a report → click "Request internal review" → enter an email → modal confirms send
- [ ] Manual (with real email): approve from the email link → audit trail shows approval entry
- [ ] Manual: export PDF after approval → cover page shows approval stamp
- [ ] Supabase: `analyses` row has populated `approval_json`
- [ ] `npm run build` succeeds

**Dependencies:** Task 3 (BUG-009 — approval stored in Supabase), Task 6 (approval stamp on cover page)
**Files:** `src/screens/LeaseAnalysis.jsx`, `src/screens/AuditTrail.jsx`, `src/utils/supabase.js`, Supabase Edge Function (new)
**Scope:** Large (5–8 files, includes backend Edge Function)

---

### Task 8: Per-Field Confidence Wired from n8n

**Description:** The confidence dots (green/amber/red) are live in the UI but hardcoded from `MOCK_ANALYSIS`. The n8n pipeline needs to return real per-field confidence scores (0–1.0) per the AI pipeline architecture in SPEC §5. This task wires the real scores and validates they are calibrated (0.9 confidence = ~90% accuracy on held-out contracts).

**Acceptance criteria:**
- [ ] n8n response includes `fields[key].confidence` (0–1.0) for each extracted field
- [ ] UI confidence dots reflect real values: green if ≥0.85, amber if 0 < conf < 0.85, red/absent if null
- [ ] Uncertainty chip ("AI uncertain — verify against §X.X") appears for any real field with 0 < conf < 0.85
- [ ] Extraction quality indicator (Strong/Fair/Weak) uses real field confidence values from the response
- [ ] `MOCK_ANALYSIS` in `constants.js` preserves realistic confidence values for local dev (no regressions)
- [ ] If `confidence` is absent from a field (legacy payloads), UI defaults to amber dot — no crash

**Verification:**
- [ ] Upload SAMPLE-LEASE.docx against live n8n → field dots update from mock colours to real
- [ ] Spot-check: `annual_payment_usd` confidence ≥0.85 → green dot; `discount_rate` absent → red
- [ ] `node evals/run-evals.cjs` still 11/11 (field confidence eval suite activates when `payload.fields` present)
- [ ] `npm run build` succeeds

**Dependencies:** n8n pipeline update (coordinate with ML/n8n owner); no frontend Task dependencies
**Files:** `src/utils/constants.js`, `src/screens/LeaseAnalysis.jsx` (minimal — UI already handles real values)
**Scope:** Small (frontend); Medium (n8n pipeline coordination)

---

### Checkpoint: After Phase 1 (end of Week 7)

- [ ] `npm run build` clean, `node evals/run-evals.cjs` 11/11
- [ ] Supabase `analyses` table receiving writes from real uploads
- [ ] Dashboard counter reflects real portfolio status for test accounts
- [ ] PDF export opens with PCAOB AS 1105 cover page
- [ ] CFO approval email sends and logs in Supabase
- [ ] Real confidence dots showing from n8n (or stub confirmed with n8n owner for next sprint)
- [ ] **Human review:** PM reviews PostHog Phase 4 drop-off data; confirm IBR resolution rate improving vs. pre-J9 baseline

---

## Phase 2 — Activation & Batch (Weeks 8–10)

### Task 9: Journey D — First-Lease Onboarding

**Description:** First-time users (L1-1 activation metric) need to be guided past the most common failure mode: uploading a complex lease with variable rent, sublease provisions, or missing IBR when they should start with a simple fixed-rent lease. Two moments matter: before the first upload (guidance prompt) and immediately after the first extraction (first-win prompt).

**Acceptance criteria:**
- [ ] First-time detection: a flag (`lg-first-upload` in localStorage) determines whether a user has completed their first extraction; cleared after first successful analysis
- [ ] Before first upload: an info banner on the Dashboard upload zone: "New to LegalGraph? Start with a simple, fixed-rent lease — it'll extract cleanly and build your confidence in the output."
- [ ] After first extraction: if `isFirstAnalysis`, show an interstitial prompt before navigating to `/leases`: "Your extraction looks complete — resolve the flags and generate your first report."
- [ ] Prompt has two CTAs: "Review now" (navigates to `/leases`) and "Remind me later" (dismisses, does not block)
- [ ] `track('first_extraction_complete', { risk_score, fields_found })` fires on first analysis only
- [ ] Banner and prompt do not appear on subsequent analyses (localStorage flag cleared)

**Verification:**
- [ ] Clear localStorage → upload → see the onboarding banner on dashboard
- [ ] Complete analysis → first-win prompt appears → "Review now" navigates to `/leases`
- [ ] "Remind me later" dismisses prompt, does not reappear on next upload
- [ ] Second upload: no banner, no prompt
- [ ] PostHog: `first_extraction_complete` event visible in Live Events
- [ ] `npm run build` succeeds

**Dependencies:** Task 2 (PostHog, for `first_extraction_complete` event)
**Files:** `src/screens/Dashboard.jsx`, `src/App.jsx`, `src/styles/globals.css`
**Scope:** Small

---

### Task 10: Company-Level IBR Storage + Carry-Forward

**Description:** Rachel should enter her company's incremental borrowing rate (IBR) once per portfolio — not once per lease. The rate entered on the first lease should be pre-populated (not auto-applied) on all subsequent leases in the same session, and suggested (not auto-applied) in the following quarter. This directly extends J9 (Task 1) and requires Supabase for cross-session persistence.

**Acceptance criteria:**
- [ ] IBR value entered in Task 1's "Enter rate for this lease" field is stored in Supabase `analyses` record (Task 3 prerequisite)
- [ ] An `account_ibr` table (or `account_settings` JSONB column) stores the company-level IBR keyed by account
- [ ] On a new analysis in the same session: if a company-level IBR exists, pre-populate the IBR input field with: "Suggested: 5.2% (used last time) — confirm or change before saving"
- [ ] Carry-forward is a suggestion, not an auto-fill — user must explicitly save the pre-populated value
- [ ] In a new quarter (>90 days since last IBR entry): suggestion message changes to: "You used 5.2% last quarter — confirm the rate is still appropriate for [date]"
- [ ] `track('ibr_confirmed', { rate, carried_forward: boolean })` fires on save

**Verification:**
- [ ] Upload lease 1 → enter IBR 5.2% → save → upload lease 2 in same session → IBR field shows "Suggested: 5.2%"
- [ ] Simulate Q2 (set `created_at` to 95 days ago in Supabase) → reload → suggestion message uses "last quarter" copy
- [ ] Confirm auto-fill does NOT apply — field must be explicitly saved
- [ ] Supabase: `account_settings` row has `ibr_rate: 5.2`
- [ ] `npm run build` succeeds

**Dependencies:** Task 3 (BUG-009), Task 1 (J9 IBR input field)
**Files:** `src/screens/LeaseAnalysis.jsx`, `src/utils/supabase.js`
**Scope:** Small–Medium

---

### Task 11: J8 — Session Progress Tracker

**Description:** For Rachel's quarterly batch session (J8 — 4–12 leases), she needs to track progress without losing context on completed leases. "X of Y leases complete · ~Z min remaining" in the session header keeps her oriented and reduces mid-session abandonment.

**Acceptance criteria:**
- [ ] Session start: when ≥2 leases exist in the portfolio and user begins an analysis, session counter initialises: "Session: 0 of Y leases complete"
- [ ] After each completed analysis, counter increments: "Session: X of Y leases complete · ~Z min remaining" (Z = (Y–X) × average session duration)
- [ ] Counter is visible in the Dashboard header during a session and persists across `/leases` ↔ `/` navigation
- [ ] "Back to portfolio" button in the `/leases` sidebar always visible (does not scroll out of view)
- [ ] Session state stored in `sessionStorage` (not Supabase) — resets on browser close, survives tab refresh
- [ ] Once-per-session consent modal check: if `consentGiven` is false at session start, fire the modal once and not again for the rest of the session (pending Legal OQ #3 — implement guard but gate rollout on legal confirmation)

**Verification:**
- [ ] Add 3 leases to portfolio → start analysis on each → session counter increments correctly
- [ ] Navigate /leases → / → /leases: counter persists
- [ ] Close tab → reopen: counter resets to 0
- [ ] `npm run build` succeeds

**Dependencies:** Task 3 (BUG-009 for portfolio count), Task 2 (PostHog for session_started event)
**Files:** `src/App.jsx`, `src/screens/Dashboard.jsx`, `src/components/Nav.jsx`
**Scope:** Medium

---

### Checkpoint: After Phase 2 (end of Week 10)

- [ ] `npm run build` clean, `node evals/run-evals.cjs` 11/11
- [ ] First-time user flow tested end-to-end: banner → extraction → first-win prompt → report
- [ ] IBR carry-forward working across 2 leases in same session
- [ ] Session progress counter increments correctly across 3 leases
- [ ] **Human review:** PostHog — IBR resolution rate, activation rate (first extraction), Phase 4 drop-off. Go/no-go on beta invites.

---

## Phase 3 — Beta + GA Preparation (Weeks 11–12)

### Task 12: Vitest Unit Test Suite

**Description:** The SPEC §8 lists four unit tests required before GA. No test infrastructure currently exists. This task sets up Vitest and writes the four specified tests.

**Acceptance criteria:**
- [ ] Vitest installed and configured (`vite.config.js` updated with test config)
- [ ] `npm test` runs and reports results
- [ ] 4 tests pass:
  - `getExtractionQuality` — Strong (≥80% found, ≥80% high-conf), Fair (≥60% found), Weak (<60% found)
  - `getRiskLevel` — boundary values: score 49 → Low, 50 → Medium, 69 → Medium, 70 → High
  - `FIELD_HINTS` — every key maps to a non-empty string (8 keys)
  - `fileToBase64` — valid File returns base64 string; invalid input is caught

**Verification:**
- [ ] `npm test` — all 4 tests pass
- [ ] `npm run build` succeeds (test config does not break build)

**Dependencies:** None
**Files:** `vite.config.js`, `src/utils/constants.test.js` (new), `src/utils/fileToBase64.test.js` (new)
**Scope:** Small

---

### Task 13: Manual QA Pass + Accessibility Audit

**Description:** Run the full SPEC §8 manual QA checklist before beta invites. Identify and fix any regressions from Phase 1–2 work. Accessibility audit per SPEC §8 requirements.

**Acceptance criteria:**
All 9 QA checklist items pass:
- [ ] Upload PDF → analysis completes or gracefully falls back to MOCK_ANALYSIS
- [ ] High flag present → export buttons show lock + tooltip
- [ ] Resolve all High flags → completion banner appears, export unlocks
- [ ] Edit a field → "Edited" pill shows with original strikethrough
- [ ] Click source clause tag → drawer opens with clause text
- [ ] Navigate to `/audit` → formal document renders with correct data
- [ ] Click "Export audit log" → print dialog opens; nav/toolbar hidden in print preview
- [ ] Toggle light theme → all screens readable
- [ ] Drop a file on Dashboard → contract type hint appears below file size

Accessibility:
- [ ] All interactive elements reachable by keyboard (Tab / Enter / Space)
- [ ] `skip-link` present on every route
- [ ] Confidence dots have text labels in legend (not colour-only)
- [ ] Screen reader test: NVDA/VoiceOver reads flag severity and extraction quality without confusion

**Dependencies:** All prior tasks
**Files:** Any screen with regressions found
**Scope:** Small–Medium (QA + targeted fixes)

---

## Deferred (Pending Legal / Post-GA)

| Feature | Reason deferred | Trigger to unactivate |
|---|---|---|
| Once-per-session consent | Blocked on GDPR determination (Open Question #3) | Legal confirms session-level consent is sufficient |
| Auditor portal (GA+1) | No mid-market competitor has shipped this; first-mover opportunity | GA ships clean; BUG-009 stable |
| Amendment delta view (GA+1) | Requires BUG-009 as foundation + 2+ analysis runs per lease | BUG-009 live + 30 days post-GA data |
| Per-field accuracy eval suite in run-evals.cjs | Requires n8n to return `payload.fields` + `payload.risk_flags` | Task 8 (n8n confidence wiring) complete |

---

## Architecture Decisions

1. **Supabase over custom backend (Task 3):** Anon key + RLS provides secure per-user isolation without a custom auth server. Supabase Edge Functions handle the J10 approval email — no separate server required for MVP.
2. **sessionStorage for session counter (Task 11):** Session progress resets on browser close (correct UX — a new browser session is a new quarterly session). Supabase would be over-engineered for this signal.
3. **localStorage for first-time flag (Task 9):** Simpler than a Supabase flag for single-user per-device onboarding. Post-BUG-009, can be upgraded to account-level tracking.
4. **n8n pipeline changes coordinated externally (Task 8):** The frontend already handles `fields[key].confidence` — it's just populated from MOCK_ANALYSIS today. n8n update does not block any frontend task.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| BUG-009 takes longer than 3 weeks | High — gates 5 tasks | Start Task 5 (dashboard counter) with Supabase mock data in parallel; ship Tasks 1, 2, 4 while BUG-009 is in progress |
| n8n `source_text` and `confidence` not available at GA | High — BUG-006 and Task 8 blocked | Confirm n8n pipeline owner timeline in Week 1; use MOCK_ANALYSIS with realistic `source_text` as fallback for demo/testing |
| Legal OQ #3 (session consent) not resolved before GA | Medium — Once-per-session consent blocked | Keep per-analysis consent as-is; defer to GA+1; does not block any P0 item |
| J10 Supabase Edge Function email delivery | Medium — approval flow blocked if email fails | Implement with Resend or Supabase built-in; test with 2 pilot accounts before beta |
| Vitest setup conflicts with Vite config | Low | Vitest is Vite-native; minimal config changes needed |

---

*Plan Owner: PM · Grounded in SPEC v1.1 · Created 2026-05-09*
