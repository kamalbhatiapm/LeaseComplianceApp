# LegalGraph — Lease Compliance App: MVP Specification

**Version:** 1.2  
**Date:** 2026-05-11  
**Grounded in:** PRD v2.0 · TRUST-UX-PLAN.md · Project Evaluation (stress-test, May 2026) · User personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate), External Auditor  
**Status:** Active  
**Changelog v1.1:** Added MOAT section (§11), AI pipeline architecture (§5), analytics provider + kill criteria, Why Agentic AI rationale (§1), beta validation plan per assumption  
**Changelog v1.2:** BUG-009 + J9 marked done; PDF-only upload; consent → permanent localStorage (OQ #3 resolved); webhook body → FormData; safety timeout → 3 min; T.R.U.S.T framework items added; FLAG_GUIDANCE noted; supabase.js added to project structure; gateOpen removed from state; pre-BUG-009 labels updated

---

## 1. Objective

Build the end-to-end IFRS 16 / ASC 842 lease compliance reporting workflow for mid-market finance and legal teams (10–50 leases). The product enables a compliance lead to upload a raw contract PDF and generate an audit-ready report — with clause-level evidence — in under 45 minutes per quarter.

**North Star metric:** Audit-ready compliance reports generated per active account per quarter.

**Primary user:** Rachel — Compliance Lead. Logs in 4× per year under deadline pressure. Must be operable by someone who hasn't touched the tool in 90 days.

**Economic buyer:** Jennifer — GC/CFO. Approves in 30 minutes based on four questions: data location, auditor acceptance, cost, and liability if wrong.

**Regulatory driver:** PCAOB AS 1105 (effective December 2025) requires per-field data lineage, AI model disclosure, and human review sign-off for AI-assisted compliance filings.

**Why Agentic AI, not rule-based parsing:** Lease PDFs are structurally non-standard. Clause numbering varies by jurisdiction and law firm; renewal language appears in definitions, recitals, and boilerplate interchangeably; discount rate provisions require inference from surrounding context rather than direct extraction; and scanned PDFs require semantic understanding, not template matching. Deterministic OCR and rule-based parsers break on all four of these — which is exactly why Trullion's top G2 complaint is inaccurate extraction on complex leases. LLMs with RAG against the source document are the only architecture that handles this variance reliably at scale.

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
│   │   └── ConsentModal.jsx     # GDPR + Anthropic API disclosure (fires once ever; persisted to localStorage)
│   ├── utils/
│   │   ├── constants.js         # MOCK_ANALYSIS, FIELD_LABELS, FIELD_HINTS, getExtractionQuality
│   │   ├── supabase.js          # Supabase client, saveAnalysis, loadLatestAnalysis
│   │   ├── track.js             # Analytics event stub (track(event, props))
│   │   └── fileToBase64.js      # File → base64 (legacy; webhook now uses FormData)
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
| **BUG-009: Persistent storage (Supabase)** | P0 | Done | `src/utils/supabase.js` — `saveAnalysis` / `loadLatestAnalysis`. `lease_analyses` table + RLS anon insert/select policies. App.jsx hydrates from Supabase on mount; writes on every analysis. localStorage is the fallback cache. |
| **BUG-006: Clause PDF viewer** | P0 | Partial | Drawer opens from source clause tag (shipped). Needs full clause text + page reference from n8n pipeline. |
| **J9: IBR guidance copy** | P0 | Done | `FLAG_GUIDANCE` in `LeaseAnalysis.jsx` covers all 11 n8n flag IDs with 3-step resolution guidance + IBR input fields (expanded from 3 legacy IDs). |
| **Event tracking — PostHog** | P0 | Not started | Wire `track()` to PostHog before Week 10 beta invites. Priority signals: IBR flag resolution rate + Phase 4 drop-off. These two gate the GA decision. `VITE_POSTHOG_KEY` in `.env`. |

### Phase 1 — Core Compliance Workflow (Weeks 4–7)

| Feature | Priority | Status | Notes |
|---|---|---|---|
| **Full PDF export** | P0 | Partial | `window.print()` ships. Needs: cover page with AI disclosure, clause inline text, flag resolution log, PCAOB AS 1105 statement. |
| **Dashboard "Ready / Needs Attention" counter** | P1 | Not started | Requires BUG-009. Show: X ready · Y need attention · Z not yet analysed. |
| **Once-per-session consent** | P1 | Done | Shipped as permanent localStorage (`lg-consent` key). Consent fires only on first-ever use. See OQ #3 — resolved by product decision. |
| **Per-field confidence from n8n** | P1 | Partial | UI dots are live. Real scores from n8n pipeline not yet wired. |
| **J10: CFO email sign-off flow** | P1 | Not started | "Request internal review" → email → one-click approval → logged in audit trail + cover page. |

### Phase 2 — Activation & Batch (Weeks 8–10)

| Feature | Priority | Status | Notes |
|---|---|---|---|
| Journey D: First-lease onboarding | P1 | Not started | First-time prompt: "Start with a simple fixed-rent lease." Post-extraction: "Resolve 2 flags and generate your first report." |
| J8: Session progress tracker | P1 | Not started | Requires BUG-009. "X of Y leases complete · ~Z min remaining." |
| Company-level IBR storage + carry-forward | P1 | Not started | Enter once, pre-populate on all leases. Suggest last quarter's rate in next cycle. |

### Already Shipped (Current State)

- Upload flow (PDF only, 50MB cap, drag-drop; DOCX/DOC/TXT shown as "Coming soon")
- n8n webhook integration with 45s minimum display + 3-minute (180s) safety timeout
- IFRS 16 / ASC 842 field extraction with MOCK_ANALYSIS fallback
- Supabase persistence — `saveAnalysis` / `loadLatestAnalysis`; localStorage fallback cache (BUG-009 ✅)
- Terms grid: edit-in-place, confidence dots, FIELD_HINTS on missing fields, uncertainty chips (conf < 0.85)
- Risk flags: severity (High/Medium/Low), sign-off gate (High blocks export)
- FLAG_GUIDANCE: 11 n8n flag IDs with 3-step resolution guidance + IBR input fields (J9 ✅)
- Completion banner after all High flags acknowledged
- Clause source drawer (right-side slide-in)
- Score ring: risk score + level label + "/100 · lower is better"
- Extraction quality indicator (Strong/Fair/Weak) — separate from risk score
- Audit trail: dedicated `/audit` route, formal document layout, print stylesheet
- Demo fallback badge → Retry CTA (calls `handleReanalyzeAs(analysisIntent)`)
- CSS-only hover tooltips on locked export buttons
- Dark/light theme toggle (persisted to localStorage)
- Consent modal (Anthropic Claude API disclosure) — persisted to localStorage; fires once ever
- Contract preview hint on Dashboard after file select (detects lease type from filename)
- Field edit tracking: `track('field_edited', { key, original_value, corrected_value, confidence, source_clause })` + transient "Correction saved" confirmation
- Confidence legend (green/amber/red dots) in TermsGrid header
- Outcome-focused loading step labels (e.g. "Finding commencement date, rent schedule, and renewals")

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
- **Analytics: PostHog** — instrument before first beta invite. IBR flag resolution rate and Phase 4 drop-off are the two signals that gate the GA decision. Add `VITE_POSTHOG_KEY` to `.env`.

### AI Pipeline Architecture (n8n workflow)
The n8n workflow must implement the following to prevent clause hallucination — the top G2 complaint against Trullion and the documented failure mode in AI compliance tools (Springer Nature, 2025):

1. **PDF parsing** — extract raw text preserving section numbering; flag scanned PDFs for OCR pre-processing
2. **Semantic chunking** — split by clause/section boundaries, not fixed token windows; preserve clause reference (e.g. "§5.1") as metadata on each chunk
3. **RAG grounding** — retrieve relevant chunks per field using vector similarity; pass source chunks as context to Claude API; never generate field values from parametric memory alone
4. **Confidence scoring** — derive per-field confidence from retrieval similarity score + Claude's self-reported uncertainty; return as `confidence` (0–1) in the fields payload
5. **Source citation** — return `source_clause` (e.g. "§5.1 — Base Rent") as the chunk reference, not a generated label
6. **Hallucination guard** — if no chunk scores above similarity threshold for a field, return `value: null` and flag as missing rather than generating a plausible-sounding value

This architecture means every extracted value is traceable to a specific clause in the source document — satisfying PCAOB AS 1105 data lineage requirements and enabling the clause drawer (BUG-006) to show real source text.

### Data Flow
```
User uploads PDF
    → App.jsx POSTs FormData (file + file_name, file_type, standard, intent, analyzed_at)
    → POST to n8n VITE_WEBHOOK_URL (multipart/form-data)
    → n8n Extract from File → Orchestrator Agent → key_term_extraction_agent
    → Returns structured analysis JSON
    → App.jsx saves to Supabase (saveAnalysis) + localStorage cache
    → LeaseAnalysis renders from App.jsx state (hydrated from Supabase on mount)
    → Edits, sign-offs, flag resolutions in App.jsx state (Supabase write on save)
    → /audit renders from same state
    → window.print() generates PDF from /audit route
```

### State (Current — Supabase primary, localStorage fallback)
All state lives in `App.jsx` and is passed via props:
- `selectedFile`, `analysisData`, `fieldEdits`, `analysisIntent`
- `isAnalyzing`, `progress`, `navLocked`
- `isLiveData` — true when result comes from a successful webhook response

On mount: `loadLatestAnalysis()` hydrates from Supabase asynchronously, overwriting localStorage cache if server has newer data. `analysisData` and `isLiveData` are also seeded from localStorage synchronously for instant restore on page refresh.

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
- Webhook body: `FormData` (multipart/form-data) — `file`, `file_name`, `file_type`, `standard`, `intent`, `analyzed_at`
- 3-minute (175s) fetch timeout via `AbortController`; 3-minute (180s) hard safety timer clears loading state regardless
- Always fall back to `MOCK_ANALYSIS` on webhook failure — never show an empty/broken state to the user
- n8n `key_term_extraction_agent` prompt is intentionally concise — Cloudflare n8n Cloud has a 100s hard response limit; do not expand the system message without benchmarking inference time

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

**Primary test file:** `sample-lease-ifrs16.pdf` — 4-page commercial lease (Sydney CBD, AUD 180k/year, 5-year term) with all 10 IFRS 16 fields present. Use this for end-to-end testing; `SAMPLE-LEASE.docx` remains in the repo as the source document.

### Manual QA Checklist (required before each deploy)
- [ ] Upload `sample-lease-ifrs16.pdf` → analysis completes (or gracefully falls back to MOCK_ANALYSIS)
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
- Fire consent modal before first-ever analysis (persisted to `lg-consent` in localStorage — not per-session)
- Name "Anthropic Claude API" explicitly in consent modal
- Show "Not legal advice" disclaimer on every analysis screen
- Display "AI-assisted, human-reviewed" on every exported report
- Enforce High-flag export gate at 100% — no bypass, no exceptions
- Log every field edit with original value, corrected value, confidence, and timestamp
- Validate file type (PDF only) and size (50MB max) on the frontend before upload

### Ask First (confirm before implementing)
- **Removing or weakening the export gate** — this is a guardrail metric and a legal/compliance decision
- **Changing consent modal language or data retention copy** — Jennifer-facing; legal sign-off required
- **Wiring IBR auto-fill from any data source** — creates financial advice liability
- **Adding any feature that reads or stores raw contract text outside Supabase** — data governance concern
- **Changing consent persistence behaviour** — currently permanent localStorage (`lg-consent`); any weakening requires legal sign-off
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

## 10. MOAT Analysis

The stress-test evaluation (May 2026) identified the MOAT argument as timing-dependent rather than structural. This section defines the path from timing advantage to defensible moat.

### Today's Timing Advantage (erodes in 6–12 months)
- **PCAOB AS 1105 first-mover:** Live for December 2025 fiscal years. No competitor has shipped a purpose-built PCAOB AS 1105 compliance cover page or human-review sign-off audit trail. Trullion's top G2 feature is clause navigation, not compliance documentation. EZLease has no AI.
- **Visual Lease displacement window:** CoStar acquisition (Nov 2024) has mid-market customers in active re-evaluation. LegalGraph's outbound displacement campaign targets this cohort in Q2 2026 before renewals close.

### Structural Moat Being Built (12+ months to replicate)
- **Ground-truth accuracy dataset:** Every beta contract run through the eval harness (`evals/run-evals.cjs`) and validated by a named audit firm creates a proprietary accuracy benchmark. Competitors cannot replicate this without the same customer relationships and the same number of auditor-validated ground-truth cases. Target: 20 contracts at ≥94% accuracy before GA; 100 contracts by end of Year 1.
- **Auditor acceptance network:** Each report accepted by an external audit firm without revision is a reference data point. At scale, this creates a feedback loop: auditors who accept LegalGraph reports recommend LegalGraph to other clients. No competitor has published auditor acceptance rate data.
- **RAG pipeline grounded to source clauses:** The hallucination guard (return `null` rather than generate) combined with RAG grounding means LegalGraph's extraction is verifiable — every value traces to a specific clause in the source document. Trullion's complex-lease extraction bugs (G2, 2025–2026) suggest they have not fully solved this. Being consistently more accurate on complex leases (variable rent, multi-renewal, sublease) is defensible if measured and published.

### What Competitors Cannot Copy Quickly
Trullion could add a PCAOB AS 1105 cover page in a sprint. What they cannot quickly replicate is: (1) a validated ground-truth accuracy benchmark across 20+ named leases with auditor sign-off, and (2) a RAG pipeline with the hallucination guard that reliably returns `null` on uncertain fields rather than a plausible fabrication. Both require customer relationships and time, not just engineering.

---

## 11. Kill Criteria

These are strategic go/no-go gates — distinct from the operational guardrail metrics in §9.

| Scenario | Threshold | Action |
|---|---|---|
| Beta auditor acceptance rate | <60% across all 5 pilots after BUG-006 ships | Pause GA; commission direct auditor validation study before re-scoping |
| IBR flag resolution rate post-J9 copy | <50% resolved vs. dismissed after 2 weeks live | Escalate: either the copy is wrong or the IBR stall is deeper than a copy fix — user interview required |
| AI extraction accuracy on beta contracts | <90% across ≥10 contracts | Stop GA clock; audit n8n pipeline for hallucination guard and chunking strategy |
| Activation rate at 30 days post-launch | <55% (below company baseline) | Pause new feature work; run activation audit on upload → extraction → first report funnel |
| Webhook success rate | <99.5% sustained over 7 days | P0 incident; no new features ship until resolved |

### Beta Assumption Validation Plan
The PRD lists 6 assumptions. These are how each gets validated in beta — not just shipped:

| Assumption | Confidence | Beta Validation Method |
|---|---|---|
| Rachel spends 4–6 hrs/quarter | High | Time-tracking prompt at session end: "How long did this take?" |
| Auditors accept with clause trail | Medium | Direct auditor interview in beta week 1 (not just Rachel's report submission) |
| 94% accuracy holds for IFRS 16 fields | Medium | Run `node evals/run-evals.cjs --payload` against every beta contract; publish results |
| IFRS 16 right priority over ASC 842 | Medium | Survey beta accounts on standard used; confirm with CFO |
| IBR guidance copy reduces abandonment | Medium | PostHog: IBR flag resolution rate before vs. after J9 ships |
| Customers upload all leases (not a sample) | Low | Track uploads per account vs. known portfolio size; follow up if <50% of portfolio uploaded |

---

## 12. Open Questions (from PRD v2.0)

| # | Question | Owner | Deadline |
|---|---|---|---|
| 1 | IBR guidance copy: exact rate methodology to recommend for IFRS 16.26? Needs legal review. | PM + Legal | T-3 weeks from GA |
| 2 | Ship IFRS 16 only at GA, or both IFRS 16 + ASC 842? Eng estimate: +2 weeks for ASC 842. | Eng Lead + CFO | T-4 weeks from GA |
| 3 | ~~Once-per-session consent: does GDPR require per-analysis or is session-level sufficient?~~ **Resolved by product decision** — shipped as permanent localStorage (`lg-consent`). Legal should confirm this approach is acceptable; no GA blocker. | Legal | Confirm before GA |
| 4 | PDF export: do auditors prefer inline clause text in PDF, or structured JSON/CSV for audit tools? | PM (auditor interview) | Beta week 1 |
| 5 | CFO approval link: should it expire after 72 hours for security? | Eng Lead + Legal | T-2 weeks from GA |

---

*SPEC Owner: PM · Version: 1.1 · Status: Active · Grounded in PRD v2.0 (2026-05-08) · Stress-tested May 2026 (score: 23/27 → Strong)*
