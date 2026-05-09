# Implementation Plan: T.R.U.S.T Framework UX Improvements

**Date:** 2026-05-09  
**Author:** PM / Claude Code  
**Status:** Ready for implementation  
**Linked docs:** PRD v2.0, JTBD v1.1, USER-JOURNEY v1.1

---

## Overview

Apply the T.R.U.S.T framework (Target the Moment of Trust · Reduce Cognitive Load · Uncertainty as a UX Feature · Signal Quality Continuously · Tight Feedback Loops) across the three LegalGraph app screens to build user trust in AI-extracted lease data. All 10 changes are UI-only — no backend, no schema changes, no routing changes.

---

## Architecture Decisions

- **No new files.** All changes land in existing files: `LeaseAnalysis.jsx`, `Dashboard.jsx`, `ProgressPanel.jsx`, `constants.js`, `globals.css`, `track.js`.
- **CSS additions go to `globals.css`** alongside existing component classes. No CSS modules or new stylesheets.
- **`track()` stub is already wired.** Expanding its call sites requires no infrastructure change.
- **`gateOpen` state already exists** in `LeaseAnalysis` for the export gate — extend it, don't replace it.
- **Vertical slices, not layers.** Each task ships one complete user-visible improvement, not a layer across all files.

---

## Dependency Graph

```
constants.js (FIELD_HINTS, quality thresholds)
    │
    ├── LeaseAnalysis.jsx / TermsGrid
    │       ├── Task 2: Confidence legend + uncertainty chips
    │       └── Task 3: Missing field contextual hints
    │
    ├── LeaseAnalysis.jsx / RiskFlags + gateOpen
    │       ├── Task 1: Gate Export/Send behind sign-off   ← no deps, start here
    │       └── Task 5: Completion banner after sign-off   ← depends on Task 1
    │
    ├── LeaseAnalysis.jsx / score-header
    │       └── Task 9: Extraction quality indicator       ← depends on constants.js
    │
    ├── LeaseAnalysis.jsx / s2-data-badge
    │       └── Task 7: Demo fallback → retry CTA          ← no deps
    │
    ├── ProgressPanel.jsx + LeaseAnalysis/AnalysisLoader
    │       └── Task 6: Rewrite loading step labels        ← no deps
    │
    └── Dashboard.jsx
            └── Task 8: Contract preview after file select ← no deps

track.js (add event types)
    └── LeaseAnalysis.jsx / TermsGrid
            └── Task 10: Track field edits as eval signals ← depends on Task 2/3 (edits wired)
```

Implementation order: Tasks with no deps first (1, 6, 7, 8), then build on them (2→3→5, 9, 10).

---

## Task List

### Phase 1: Results Screen — Core Trust Gates
*Highest-impact changes, isolated to `LeaseAnalysis.jsx` + `globals.css`*

---

#### Task 1: Gate Export/Send buttons behind risk flag sign-off

**TRUST dimension:** T — Target the Moment of Trust  
**Description:** The "Export PDF", "Send to auditor" (sidebar Actions), and "Export to PDF" (subheader) buttons are currently always enabled. Users can bypass unresolved high-severity flags. This task makes those buttons visually locked — greyed out with a lock icon and tooltip — until all high flags have been acknowledged via the sign-off checkbox. The existing `gateOpen` state in `LeaseAnalysis` already tracks this; we extend its use to the action buttons.

**Acceptance criteria:**
- [ ] When `highFlags.length > 0` and not all are signed off, all three export/send buttons render disabled with `cursor: not-allowed` and a tooltip: *"Resolve N high-risk flag(s) to unlock"*
- [ ] A lock icon (Lucide `Lock`, 12px) appears inline before the button label when locked
- [ ] When all high flags are signed off (`gateOpen === true`), buttons return to fully active state with no lock icon
- [ ] If there are zero high flags, buttons are always active (no regression)

**Verification:**
- [ ] Load app with mock data (has 1 high flag: `missing_discount_rate`) — Export PDF is disabled
- [ ] Check the sign-off checkbox — Export PDF becomes enabled
- [ ] Load app, confirm buttons are active with no high flags scenario (temporarily set `severity: 'medium'` on all flags in MOCK_ANALYSIS to test)
- [ ] Build succeeds: `npm run build`

**Dependencies:** None  
**Files touched:**
- `src/screens/LeaseAnalysis.jsx` (button disabled logic + lock icon)
- `src/styles/globals.css` (`.btn:disabled` tooltip pattern if not already present)

**Estimated scope:** S

---

#### Task 2: Confidence dot legend + medium-confidence uncertainty chips

**TRUST dimension:** R — Reduce Cognitive Load / U — Uncertainty as a UX Feature  
**Description:** The `TermsGrid` renders coloured dots (`conf-high` / `conf-med` / `conf-low`) with no explanation. Users cannot interpret them without guessing. This task adds: (a) a one-line legend in the `TermsGrid` card header, and (b) an inline chip on any field where `0.75 ≤ confidence < 0.85` reading *"AI uncertain — verify"* with a link to the source clause.

**Acceptance criteria:**
- [ ] Terms Grid card header shows a legend row: `● High confidence  ● Verify recommended  ● Not found` using the three existing dot colours
- [ ] Any field with `confidence < 0.85` and `confidence > 0` shows a yellow chip: *"AI uncertain — verify against [source_clause]"* directly below the field value
- [ ] Fields with `confidence ≥ 0.85` show no chip (no regression on well-extracted fields)
- [ ] Missing fields (`confidence === 0`) continue to show the existing `conf-low` dot and are handled by Task 3

**Verification:**
- [ ] Inspect mock data: `renewal_options` has `confidence: 0.93` — no chip. `rou_asset_scope` has `confidence: 0.92` — no chip. Temporarily set one field to `confidence: 0.80` to confirm chip appears.
- [ ] Legend is visible in both dark and light themes
- [ ] Build succeeds: `npm run build`

**Dependencies:** None  
**Files touched:**
- `src/screens/LeaseAnalysis.jsx` (TermsGrid component)
- `src/styles/globals.css` (`.conf-chip` style)

**Estimated scope:** S

---

#### Task 3: Missing fields → contextual action hints

**TRUST dimension:** U — Uncertainty as a UX Feature  
**Description:** Fields with `value === null` currently display *"Not found in contract"* with no next step. This is a dead end. This task replaces that dead-end copy with a field-specific action hint drawn from a new `FIELD_HINTS` map in `constants.js`. Example: `discount_rate` → *"Not found — enter your IBR manually or request from treasury."*

**Acceptance criteria:**
- [ ] A `FIELD_HINTS` map is added to `constants.js` covering at minimum: `discount_rate`, `renewal_options`, `termination_rights`, `security_deposit`, `escalation_rate`, `commencement_date`, `expiry_date`
- [ ] Missing fields render the hint text in place of (or below) *"Not found in contract"*
- [ ] Fields with no entry in `FIELD_HINTS` fall back to *"Not found — please verify manually"*
- [ ] Hint text is amber-coloured and 12px (matching existing `term-missing` pattern)

**Verification:**
- [ ] Load app — `discount_rate` row shows the IBR hint text
- [ ] Inspect a field not in FIELD_HINTS with `value: null` — shows fallback text
- [ ] Build succeeds: `npm run build`

**Dependencies:** None (can run parallel to Task 2)  
**Files touched:**
- `src/utils/constants.js` (add `FIELD_HINTS`)
- `src/screens/LeaseAnalysis.jsx` (TermsGrid — consume FIELD_HINTS)

**Estimated scope:** S

---

### Checkpoint: After Tasks 1–3

- [ ] `npm run build` passes cleanly
- [ ] Export PDF is disabled on mock data (1 high flag)
- [ ] Confidence legend is visible in Terms Grid header
- [ ] `discount_rate` missing field shows IBR hint, not a dead-end message
- [ ] Both dark and light themes render correctly
- **Human review before Phase 2**

---

### Phase 2: Completion States, Loading, and Entry Trust

---

#### Task 4: Rewrite loading step labels as user outcomes

**TRUST dimension:** T — Target the Moment of Trust  
**Description:** Both `ProgressPanel.jsx` (hero panel on Dashboard) and the `LOADING_STEPS` constant in `LeaseAnalysis.jsx` use technical labels (*"Extracting IFRS 16 fields"*, *"Triggering downstream workflow"*). Replace with outcome-oriented copy that tells the user what they're getting, not what the machine is doing.

**Acceptance criteria:**
- [ ] `ProgressPanel.jsx` STEPS array updated to: `["Identifying lease type and parties", "Finding commencement date, rent schedule, and renewals", "Scoring risk against IFRS 16 §§ 19, 26, B34", "Generating your audit-ready report"]`
- [ ] `LOADING_STEPS` in `LeaseAnalysis.jsx` updated to match (icons remain the same)
- [ ] Labels in both dark full-screen loader and the hero-panel progress component are updated

**Verification:**
- [ ] Upload a file and start analysis — confirm new step labels appear in the hero panel
- [ ] Confirm the full-screen `AnalysisLoader` (visible on `/leases` during analysis) shows the same updated labels
- [ ] Build succeeds: `npm run build`

**Dependencies:** None  
**Files touched:**
- `src/components/ProgressPanel.jsx`
- `src/screens/LeaseAnalysis.jsx` (LOADING_STEPS constant)

**Estimated scope:** XS

---

#### Task 5: Completion banner after all high flags signed off

**TRUST dimension:** T — Target the Moment of Trust  
**Description:** When the last high-severity flag is acknowledged, nothing visible changes — the gate silently opens. This task adds a green success banner below the Risk Flags section: *"All risks acknowledged — report is ready to export."* with direct Export PDF and Send to Auditor CTAs. The banner only renders when `gateOpen === true` and `highFlags.length > 0`.

**Acceptance criteria:**
- [ ] Banner renders immediately when the last high flag sign-off checkbox is checked
- [ ] Banner shows a green `CircleCheck` icon and the copy: *"All risks acknowledged — report is ready to export."*
- [ ] Banner contains two inline buttons: "Export PDF" and "Send to auditor" (same handlers as sidebar actions)
- [ ] Banner is not shown when `highFlags.length === 0` (zero high flags means no sign-off required)
- [ ] Banner disappears if the user unchecks a sign-off box

**Verification:**
- [ ] Load mock data → check the sign-off checkbox for `missing_discount_rate` → banner appears
- [ ] Uncheck → banner disappears
- [ ] Load with no high flags (modify mock temporarily) → banner never appears
- [ ] Build succeeds: `npm run build`

**Dependencies:** Task 1 (gateOpen state pattern established)  
**Files touched:**
- `src/screens/LeaseAnalysis.jsx`
- `src/styles/globals.css` (`.completion-banner` styles)

**Estimated scope:** S

---

#### Task 6: Demo fallback badge → explicit retry CTA

**TRUST dimension:** U — Uncertainty as a UX Feature  
**Description:** When the webhook fails, the app silently falls back to demo data and shows a *"Demo fallback"* badge. Users don't understand that their live analysis failed. This task makes the fallback state explicit: replace the badge copy with *"⚠ Live extraction failed — showing sample data"* and add an inline "Retry" button that calls `handleReanalyzeAs(analysisIntent)`.

**Acceptance criteria:**
- [ ] `s2-data-badge--fallback` renders: amber background, `AlertTriangle` icon, copy *"Live extraction failed — showing sample data"*
- [ ] An inline "Retry" button (btn-sm, btn-outline) appears inside or immediately after the badge, calling re-analysis
- [ ] The "Demo data" badge (intentional demo, no file) is unchanged
- [ ] The "Live extraction" badge is unchanged

**Verification:**
- [ ] To test fallback state: temporarily set `VITE_WEBHOOK_URL=''` in `.env`, upload a file, analyze — badge shows new copy with Retry button
- [ ] Clicking Retry triggers re-analysis flow
- [ ] Build succeeds: `npm run build`

**Dependencies:** None  
**Files touched:**
- `src/screens/LeaseAnalysis.jsx` (subheader badge section)
- `src/styles/globals.css` (badge variant update if needed)

**Estimated scope:** S

---

#### Task 7: Contract type preview after file select on Dashboard

**TRUST dimension:** T — Target the Moment of Trust  
**Description:** After a file is selected but before analysis starts, the upload zone shows only the filename and size. Users have no signal that the AI understands what they've uploaded. This task adds a lightweight "contract preview" hint below the file name: a detected contract type label (*"Looks like a commercial property lease — IFRS 16 extraction ready"*) derived from filename heuristics (keywords: office, lease, tenancy, commercial, retail).

**Acceptance criteria:**
- [ ] When `selectedFile` is set, a hint line appears below the file size: *"Looks like a [type] lease — [standard] extraction ready"*
- [ ] Type detection uses filename keyword matching (case-insensitive): `office`/`commercial`/`market`/`retail` → *"commercial property"*; `residential`/`apartment` → *"residential"*; no match → *"property"* (generic fallback)
- [ ] Standard in the hint reflects the currently selected `analysisIntent` (IFRS 16 or ASC 842)
- [ ] Hint does not appear when no file is selected

**Verification:**
- [ ] Select a file named `office-lease-sf.pdf` → hint reads *"Looks like a commercial property lease — IFRS 16 extraction ready"*
- [ ] Select a file named `contract.pdf` → hint reads *"Looks like a property lease — IFRS 16 extraction ready"*
- [ ] Switch intent to ASC 842 while file is selected → hint updates standard label
- [ ] Build succeeds: `npm run build`

**Dependencies:** None  
**Files touched:**
- `src/screens/Dashboard.jsx`
- `src/styles/globals.css` (`.upload-hint` style if needed)

**Estimated scope:** S

---

### Checkpoint: After Tasks 4–7

- [ ] `npm run build` passes cleanly
- [ ] Loading steps read as user outcomes in both progress components
- [ ] Sign-off completion banner appears and Export buttons unlock
- [ ] Demo fallback badge shows "Live extraction failed" with Retry button
- [ ] File select on Dashboard shows contract type preview
- **Human review before Phase 3**

---

### Phase 3: Quality Signals and Feedback Loops

---

#### Task 8: Extraction quality indicator in score header

**TRUST dimension:** S — Signal Quality Continuously  
**Description:** The current score header shows a Risk Score ring (0–100, lower is better). Users conflate risk level with extraction quality. This task adds a separate "Extraction Quality" badge to the `score-header-right` section: *"Strong — 7 of 9 fields found, 6 high-confidence"* in green/amber/red based on thresholds defined in `constants.js`.

**Acceptance criteria:**
- [ ] A `EXTRACTION_QUALITY` threshold map is added to `constants.js`: `strong` (≥80% fields found AND ≥80% of those high-confidence), `fair` (≥60%), `weak` (<60%)
- [ ] Score header renders a new row below the pills: `<ExtractionQualityBadge>` showing level label + field counts
- [ ] Strong → green, Fair → amber, Weak → red (using existing CSS variables)
- [ ] Badge is visually distinct from the Risk Score ring (uses a different shape — pill or inline badge, not a ring)

**Verification:**
- [ ] Mock data has 8/9 fields found, most high-confidence → badge shows "Strong"
- [ ] Temporarily reduce mock `terms_found` to 4 of 9 → badge shows "Weak"
- [ ] Build succeeds: `npm run build`

**Dependencies:** Task 3 (constants.js already being edited — coordinate to avoid conflict)  
**Files touched:**
- `src/utils/constants.js` (add `EXTRACTION_QUALITY` thresholds)
- `src/screens/LeaseAnalysis.jsx` (score header section)
- `src/styles/globals.css` (`.extraction-quality-badge` if needed)

**Estimated scope:** M

---

#### Task 9: Track field edits as eval signals

**TRUST dimension:** T — Tight Feedback Loops  
**Description:** User corrections to AI-extracted fields are the highest-quality training signal the product has. Currently the `track()` stub is not called on field edits. This task wires `track('field_edited', { key, original_value, corrected_value, confidence, source_clause })` on every edit save in `TermsGrid`, and adds a micro-copy toast: *"Correction saved — helps improve future extractions."*

**Acceptance criteria:**
- [ ] `track('field_edited', { key, original_value, corrected_value, confidence, source_clause })` fires when the user saves an edit (on "Save edits" button click in `TermsGrid`)
- [ ] A 3-second toast appears: *"Correction saved — helps improve future extractions."* (use existing `showToast` pattern if accessible, otherwise inline transient message)
- [ ] Track call fires once per edited field, not once per keystroke
- [ ] Fields with no change (user opened edit mode but didn't change value) do not fire `track()`

**Verification:**
- [ ] Open browser console, enter edit mode, change a field value, click "Save edits" → `[track] field_edited { key: ..., original_value: ..., corrected_value: ... }` appears in console
- [ ] Edit mode → don't change any value → click "Save edits" → no `field_edited` track call fires
- [ ] Build succeeds: `npm run build`

**Dependencies:** Tasks 2–3 (TermsGrid edits section is being touched — coordinate)  
**Files touched:**
- `src/screens/LeaseAnalysis.jsx` (TermsGrid save handler)
- `src/utils/track.js` (add JSDoc comment for `field_edited` event shape — documentation only)

**Estimated scope:** S

---

### Final Checkpoint

- [ ] `npm run build` passes cleanly
- [ ] Extraction quality badge renders in score header
- [ ] `[track] field_edited` fires in console on field correction
- [ ] Micro-copy toast appears on edit save
- [ ] All 10 improvements are visible in a full walkthrough of the app
- [ ] Both dark and light themes verified for all new elements
- **Human review + deploy**

---

## Parallelization Opportunities

| Tasks | Safe to parallelize? | Note |
|-------|---------------------|------|
| 1, 4, 6, 7 | Yes | Each touches different files/sections |
| 2, 3 | Yes | Both in TermsGrid but different rows — coordinate final merge |
| 5 | After Task 1 | Depends on `gateOpen` pattern from Task 1 |
| 8 | After Task 3 | Both edit `constants.js` — do in same session or coordinate |
| 9 | After Tasks 2–3 | TermsGrid edit handler already being touched |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `gateOpen` state lifted incorrectly for Task 5 banner | Med | Keep banner inside `LeaseAnalysis` — no state lift needed |
| Task 8 quality thresholds feel wrong with real data | Med | Use `terms_found.length / (terms_found + terms_missing).length` ratio — matches existing data shape |
| CSS for new elements conflicts with dark/light theme vars | Low | Use only existing CSS vars (`--brand`, `--amber`, `--green`, `--red`, `--t2`, `--t3`) — no hardcoded colours |
| Webhook retry in Task 6 triggers duplicate analysis | Med | Reuse existing `handleReanalyzeAs()` — it already handles the flow guard |
| Filename heuristics in Task 7 produce wrong type labels | Low | Fallback to "property lease" — never wrong, just generic |

---

## Open Questions

1. **Task 6 retry:** Should retry with the original `analysisIntent` or offer a dropdown to switch standard first? Current plan: retry with current intent (simplest).
2. **Task 9 toast:** `showToast` is defined in `App.jsx` and passed down — confirm `LeaseAnalysis` receives it as a prop, or use a local `useState` transient message instead.
3. **Task 5 banner:** Should the banner auto-scroll into view when it appears? Current plan: no auto-scroll (avoid jarring behaviour).

---

## File Change Summary

| File | Tasks | Type of change |
|------|-------|----------------|
| `src/screens/LeaseAnalysis.jsx` | 1, 2, 3, 5, 6, 7(no), 8, 9 | Logic + JSX additions |
| `src/screens/Dashboard.jsx` | 7 | JSX addition (preview hint) |
| `src/components/ProgressPanel.jsx` | 4 | Copy change only |
| `src/utils/constants.js` | 3, 8 | New exports: `FIELD_HINTS`, `EXTRACTION_QUALITY` |
| `src/utils/track.js` | 9 | JSDoc only |
| `src/styles/globals.css` | 1, 2, 5, 8 | New utility classes |

---

*Word count: ~1,600*
