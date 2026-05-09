# LegalGraph — Lease Compliance App: MVP Specification

**Version:** 1.0  
**Date:** 2026-05-09  
**Grounded in:** PRD v2.0 · TRUST-UX-PLAN.md · User personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate), External Auditor  
**Status:** Active

---

## 1. Objective

Build the end-to-end IFRS 16 / ASC 842 lease compliance reporting workflow for mid-market finance and legal teams (10–50 leases). The product enables a compliance lead to upload a raw contract PDF and generate an audit-ready report — with clause-level evidence — in under 45 minutes per quarter.

**North Star metric:** Audit-ready compliance reports generated per active account per quarter.

**Primary user:** Rachel — Compliance Lead. Logs in 4× per year under deadline pressure. Must be operable by someone who hasn't touched the tool in 90 days.

**Economic buyer:** Jennifer — GC/CFO. Approves in 30 minutes based on four questions: data location, auditor acceptance, cost, and liability if wrong.

**Regulatory driver:** PCAOB AS 1105 (effective December 2025) requires per-field data lineage, AI model disclosure, and human review sign-off for AI-assisted compliance filings.

---

## 2. Commands

```bash
# Development
npm run dev          # Vite dev server → http://localhost:5173

# Production build
npm run build        # Outputs to dist/

# Deploy to Netlify (production)
NETLIFY_AUTH_TOKEN=<token> npx netlify-cli deploy --prod --dir dist --site <site-id>

# Lint (if configured)
npm run lint
```

**Environment variables (`.env`):**
```
VITE_WEBHOOK_URL=        # n8n webhook endpoint for AI extraction
VITE_SUPABASE_URL=       # Supabase project URL
VITE_SUPABASE_ANON_KEY=  # Supabase anon key (public)
```

---

## 3. Project Structure

```
LeaseComplianceApp/
├── public/
├── src/
│   ├── screens/
│   │   ├── Dashboard.jsx        # Upload hero + portfolio table (J3, J8)
│   │   ├── LeaseAnalysis.jsx    # Score header + terms grid + risk flags + sidebar (J1, J2, J4)
│   │   ├── AuditTrail.jsx       # Formal document view: extraction ledger + timeline (J10, A1)
│   │   └── Playbooks.jsx        # Compliance playbooks reference
│   ├── components/
│   │   ├── Nav.jsx              # Top navigation; locked during analysis
│   │   ├── ProgressPanel.jsx    # Analysis loading steps
│   │   ├── Toast.jsx            # Transient notifications
│   │   └── ConsentModal.jsx     # GDPR + Anthropic API disclosure (fires once per session)
│   ├── utils/
│   │   ├── constants.js         # MOCK_ANALYSIS, FIELD_LABELS, FIELD_HINTS, getExtractionQuality
│   │   ├── track.js             # Analytics event stub (track(event, props))
│   │   └── fileToBase64.js      # File → base64 for webhook payload
│   ├── styles/
│   │   └── globals.css          # All CSS; CSS custom properties for theming
│   └── App.jsx                  # Router, state, webhook call, shared props
├── .env                         # Local env vars (not committed)
├── SPEC.md                      # This file
├── project-context/
│   ├── TRUST-UX-PLAN.md
│   └── PRD v2.0.md
└── vite.config.js
```

**Routing (React Router v6):**
- `/` — Dashboard (upload + portfolio)
- `/leases` — LeaseAnalysis (results + review)
- `/audit` — AuditTrail (formal document export)
- `/playbooks` — Compliance playbooks

---

## 4. MVP Feature Scope

Features are ordered by PRD priority. P0 = GA blocker. P1 = GA required. GA+1 = post-launch.

### Phase 0 — Foundation (Weeks 1–3)

| Feature | Priority | Status | Notes |
|---|---|---|---|
| **BUG-009: Persistent storage (Supabase)** | P0 | Not started | Unblocks 7+ features. User's analysis history, resolved flags, IBR, portfolio status all depend on this. |
| **BUG-006: Clause PDF viewer** | P0 | Partial | Drawer opens from source clause tag (shipped). Needs full clause text + page reference from n8n pipeline. |
| **J9: IBR guidance copy** | P0 | Not started | Copy-only change. No engineering. Guidance block on every "Discount rate missing — High" flag. |
| **Event tracking instrumentation** | P0 | Partial | `track()` stub exists. Wire to real analytics provider. All L1/L2 metrics blocked until live. |

### Phase 1 — Core Compliance Workflow (Weeks 4–7)

| Feature | Priority | Status | Notes |
|---|---|---|---|
| **Full PDF export** | P0 | Partial | `window.print()` ships. Needs: cover page with AI disclosure, clause inline text, flag resolution log, PCAOB AS 1105 statement. |
| **Dashboard "Ready / Needs Attention" counter** | P1 | Not started | Requires BUG-009. Show: X ready · Y need attention · Z not yet analysed. |
| **Once-per-session consent** | P1 | Not started | Legal sign-off required first (GDPR question — see Open Questions). |
| **Per-field confidence from n8n** | P1 | Partial | UI dots are live. Real scores from n8n pipeline not yet wired. |
| **J10: CFO email sign-off flow** | P1 | Not started | "Request internal review" → email → one-click approval → logged in audit trail + cover page. |

### Phase 2 — Activation & Batch (Weeks 8–10)

| Feature | Priority | Status | Notes |
|---|---|---|---|
| Journey D: First-lease onboarding | P1 | Not started | First-time prompt: "Start with a simple fixed-rent lease." Post-extraction: "Resolve 2 flags and generate your first report." |
| J8: Session progress tracker | P1 | Not started | Requires BUG-009. "X of Y leases complete · ~Z min remaining." |
| Company-level IBR storage + carry-forward | P1 | Not started | Enter once, pre-populate on all leases. Suggest last quarter's rate in next cycle. |

### Already Shipped (Current State)

- Upload flow (PDF/DOCX/DOC/TXT, 50MB cap, drag-drop)
- n8n webhook integration with 45s minimum display + 50s safety timeout
- IFRS 16 / ASC 842 field extraction with MOCK_ANALYSIS fallback
- Terms grid: edit-in-place, confidence dots, FIELD_HINTS on missing fields, uncertainty chips (conf < 0.85)
- Risk flags: severity (High/Medium/Low), sign-off gate (High blocks export)
- Completion banner after all High flags acknowledged
- Clause source drawer (right-side slide-in)
- Score ring: risk score + level label + "/100 · lower is better"
- Extraction quality indicator (Strong/Fair/Weak)
- Audit trail: dedicated `/audit` route, formal document layout, print stylesheet
- Demo fallback badge + Retry CTA
- CSS-only hover tooltips on locked export buttons
- Dark/light theme toggle (persisted to localStorage)
- Consent modal (Anthropic Claude API disclosure)

### Out of Scope (V1 GA)

- Auditor portal (GA+1 — read-only shareable link, no LegalGraph account required)
- Amendment delta view (GA+1 — requires BUG-009 as foundation)
- Equipment / vehicle leases
- ERP data sync (NetSuite/SAP)
- Accounting journal entries (DR/CR)
- SOX compliance reporting
- Multi-party leases (3+ parties)
- IBR as a financial calculation service (guidance only — liability risk)
- Historical data migration from prior tools
- Contract redlining / negotiation

---

## 5. Architecture & Tech Stack

### Frontend
- **React 18** + **Vite** (SPA, no SSR)
- **React Router v6** for client-side routing
- **Lucide React** for icons
- **CSS custom properties** for theming (dark/light via `data-theme` on `<html>`)
- All styles in `src/styles/globals.css` — no CSS modules, no Tailwind

### Backend / Integration
- **n8n webhook** (`VITE_WEBHOOK_URL`): receives base64-encoded PDF + metadata; returns structured JSON (fields, risk_flags, terms_found, etc.)
- **Supabase** (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`): persistent storage for analysis history, portfolio state, resolved flags, IBR values, user sessions
- **Anthropic Claude API**: invoked inside n8n workflow (not directly from frontend); must be named in consent modal per J6/Jennifer requirement

### Data Flow
```
User uploads PDF
    → App.jsx encodes to base64
    → POST to n8n VITE_WEBHOOK_URL (text/plain body, JSON stringified)
    → n8n calls Claude API → returns structured analysis JSON
    → App.jsx stores result in Supabase (BUG-009)
    → LeaseAnalysis renders from Supabase + real-time state
    → Edits, sign-offs, flag resolutions persisted to Supabase
    → /audit renders from same persisted record
    → window.print() generates PDF from /audit route
```

### State (Current — pre-BUG-009)
All state lives in `App.jsx` and is passed via props:
- `selectedFile`, `analysisData`, `fieldEdits`, `analysisIntent`
- `isAnalyzing`, `progress`, `navLocked`, `gateOpen`

Post-BUG-009: analysis records move to Supabase; `App.jsx` state becomes a session cache.

---

## 6. Code Style

### General
- **Functional components only** — no class components
- **No TypeScript** in MVP (JavaScript JSX throughout)
- **No comments** unless the WHY is non-obvious (hidden constraint, subtle invariant, specific bug workaround)
- **No abstractions before the third use case** — three similar blocks of JSX is fine; a premature component is not
- Props are passed explicitly; no Context API unless prop drilling exceeds 3 levels

### Components
- Screen-level components in `src/screens/`
- Reusable UI components in `src/components/`
- No new utility files for single-use operations
- Icons from `lucide-react` only; no SVG inlining

### CSS
- All CSS in `globals.css`; no inline styles for layout (inline `style` acceptable for dynamic values like colors, widths from data)
- CSS custom property naming: `--page-bg`, `--ink`, `--ink-3`, `--brand`, `--accent`, `--border`, `--surface`
- Theme via `[data-theme="light"]` overrides at bottom of globals.css
- Print styles via `@media print` block at bottom
- BEM-like class naming for new sections: `prefix-block`, `prefix-block__element`, `prefix-block--modifier`

### API / Webhook
- Webhook body: `Content-Type: text/plain`, JSON-stringified payload
- 60s fetch timeout via `AbortController`; 50s safety timer clears loading state regardless
- Always fall back to `MOCK_ANALYSIS` on webhook failure — never show an empty/broken state to the user

### Supabase (BUG-009)
- Use Supabase JS client; anon key only on the frontend
- Row-level security must be enabled on all tables before launch
- Never expose service role key in frontend code

---

## 7. Human-in-the-Loop (HITL) Design

HITL is required by PCAOB AS 1105: AI-generated financial outputs must have documented human review and sign-off. The following checkpoints are mandatory.

### Checkpoint 1 — Field-Level Review (already shipped)
**What:** Any AI-extracted field can be overridden by the user. Edited fields are marked "Edited" with a diff (original → corrected).  
**When it fires:** Whenever the user clicks Edit on a field.  
**What gets logged:** `track('field_edited', { key, original_value, corrected_value, confidence, source_clause })` + stored in Supabase (post-BUG-009) with editor name + timestamp.  
**Why:** Rachel's trust-building sequence is field-by-field spot-check. If >3 fields are wrong and uneditable, she abandons.

### Checkpoint 2 — Export Gate: High Flags Must Be Resolved (already shipped)
**What:** Export/Send buttons are disabled until all High-severity risk flags are acknowledged and resolved.  
**When it fires:** Any time a report has ≥1 unresolved High flag.  
**What gets logged:** Resolution action + who resolved it + timestamp (stored in Supabase; surfaced in audit trail and PDF).  
**Why:** Guardrail metric — 100% enforcement. Auditors receiving unreviewed material risks is a critical product liability.

### Checkpoint 3 — Discount Rate / IBR Must Be Manually Entered (P0 — J9)
**What:** The incremental borrowing rate (IFRS 16.26) is never auto-filled by AI. The field is always flagged as High severity until the user manually enters a rate.  
**When it fires:** Every analysis that does not have a discount rate in the contract.  
**What gets logged:** Rate entered + methodology note + who entered it + date.  
**Why:** IBR is company-specific and legally the company's responsibility. Auto-filling creates financial advice liability. This is the #1 activation stall (user-research Finding 3).

### Checkpoint 4 — Internal Sign-Off Before External Submission (P1 — J10)
**What:** After export, Rachel can (and for enterprise accounts, must) request CFO/GC approval via email. Approver clicks "Approve this report" — no LegalGraph login required.  
**When it fires:** "Request internal review" button on completed report.  
**What gets logged:** Approver name + email + timestamp + optional comment. Logged in audit trail and rendered on PDF cover page.  
**Why:** PCAOB AS 1105 requires documented human oversight beyond the primary user. Jennifer (J6) evaluates this as deal blocker question #4: "What happens if it's wrong?"

### Checkpoint 5 — Auditor Acceptance Signal (GA+1)
**What:** After submitting a report to an auditor, the user is prompted: "Did your auditor accept this report without revision?" (binary: Yes / No + optional note).  
**When it fires:** 48 hours after first report export per lease per quarter.  
**What gets logged:** Accepted/rejected signal + lease ID + quarter (L1-4 metric).  
**Why:** Auditor acceptance rate is the lagging retention metric. This is the product's true measure of success.

### When NOT to add HITL
- **Low-confidence chips (conf < 0.85):** Surface as uncertainty signals (already shipped) — do not block the workflow. Rachel decides whether to verify; the chip guides her, not gates her.
- **Missing Medium/Low fields:** Show FIELD_HINTS and let Rachel proceed. Only High flags gate the export.
- **AI summary text:** Advisory only; never gated. Rachel uses it for orientation, not as audit evidence.

---

## 8. Testing Strategy

### Unit Tests (vitest)
- `getExtractionQuality(termsFound, termsTotal, fields)` — all three tiers (Strong/Fair/Weak)
- `getRiskLevel(score)` — boundary values (49, 50, 69, 70)
- `FIELD_HINTS` — every key maps to a non-empty string
- `fileToBase64` — valid file returns base64 string; error is caught

### Integration Tests
- Upload flow: file selected → consent modal fires → runAnalysis called → progress steps advance
- Export gate: High flag present → buttons disabled → flag resolved → buttons enabled
- Field edit: value changed → `track('field_edited')` called with correct args → diff rendered

### Manual QA Checklist (required before each deploy)
- [ ] Upload a PDF → analysis completes (or gracefully falls back to MOCK_ANALYSIS)
- [ ] High-severity flag present → Export PDF and Send to auditor buttons show lock + tooltip
- [ ] Resolve all High flags → completion banner appears, export unlocks
- [ ] Edit a field → "Edited" pill shows, original strikethrough shown
- [ ] Click source clause tag → right drawer opens with clause text
- [ ] Navigate to `/audit` → formal document renders with correct data
- [ ] Click "Export audit log" → browser print dialog opens; nav/toolbar hidden in print preview
- [ ] Toggle light theme → all screens readable (check audit trail toolbar and breadcrumb)
- [ ] Drop a file on Dashboard → contract type hint appears below file size

### Accessibility
- All interactive elements have accessible labels (`aria-label`, `title`, or visible text)
- `skip-link` present on every page
- Keyboard navigation: Tab reaches all buttons; Enter/Space activates them
- Color is never the only signal (confidence dots have text labels in legend)

---

## 9. Boundaries

### Always Do
- Show `MOCK_ANALYSIS` demo data on any webhook failure — never an empty or broken state
- Fire consent modal before every new analysis session (once-per-session after J8 fix)
- Name "Anthropic Claude API" explicitly in consent modal
- Show "Not legal advice" disclaimer on every analysis screen
- Display "AI-assisted, human-reviewed" on every exported report
- Enforce High-flag export gate at 100% — no bypass, no exceptions
- Log every field edit with original value, corrected value, confidence, and timestamp
- Validate file type and size on the frontend before upload (PDF/DOCX/DOC/TXT, 50MB max)

### Ask First (confirm before implementing)
- **Removing or weakening the export gate** — this is a guardrail metric and a legal/compliance decision
- **Changing consent modal language or data retention copy** — Jennifer-facing; legal sign-off required
- **Wiring IBR auto-fill from any data source** — creates financial advice liability
- **Adding any feature that reads or stores raw contract text outside Supabase** — data governance concern
- **Once-per-session consent rollout** — GDPR determination pending (Open Question #3)
- **Shipping new Supabase tables** — confirm RLS policies are enabled before launch

### Never Do
- Auto-fill the IBR / discount rate field from AI output
- Skip or suppress the consent modal for any new analysis
- Show audit results without the "Not legal advice" disclaimer
- Write to Supabase using the service role key from the frontend
- Generate or guess user-facing URLs (e.g. for "share with auditor" links) without proper backend token generation
- Show competitor names or pricing in the product UI
- Claim the report is "auditor-approved" — it is "AI-assisted, human-reviewed"; auditor acceptance is separate
- Commit `.env` files or expose `VITE_SUPABASE_ANON_KEY` in logs
- Use `window.alert()` for validation errors (use `showToast()` instead, or inline field errors)

---

## 10. Open Questions (from PRD v2.0)

| # | Question | Owner | Deadline |
|---|---|---|---|
| 1 | IBR guidance copy: exact rate methodology to recommend for IFRS 16.26? Needs legal review. | PM + Legal | T-3 weeks from GA |
| 2 | Ship IFRS 16 only at GA, or both IFRS 16 + ASC 842? Eng estimate: +2 weeks for ASC 842. | Eng Lead + CFO | T-4 weeks from GA |
| 3 | Once-per-session consent: does GDPR require per-analysis or is session-level sufficient? | Legal | T-3 weeks from GA |
| 4 | PDF export: do auditors prefer inline clause text in PDF, or structured JSON/CSV for audit tools? | PM (auditor interview) | Beta week 1 |
| 5 | CFO approval link: should it expire after 72 hours for security? | Eng Lead + Legal | T-2 weeks from GA |

---

*SPEC Owner: PM · Status: Active · Grounded in PRD v2.0 (2026-05-08)*
