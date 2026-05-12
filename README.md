# LegalGraph — Lease Compliance App

Audit-ready IFRS 16 / ASC 842 compliance reports from raw contract PDFs — in under 45 minutes per quarter.

**Live app → [https://lease-compliance-app.netlify.app](https://lease-compliance-app.netlify.app)**

---

## Problem Statement

In-house legal and finance teams at mid-market companies managing 10–50 active leases have no reliable way to generate audit-ready IFRS 16 / ASC 842 compliance reports from their contracts.

Today, **Rachel** (Compliance Lead) spends **4–6 hours per quarter** manually extracting lease terms from PDFs, reconciling them in Excel, and formatting outputs for auditors — a process prone to error, version conflicts, and missed deadlines. When an auditor asks for the source clause behind a specific line item, she has to hunt through PDFs manually, adding hours of back-and-forth before a report can be signed off.

With **PCAOB AS 1105 (effective December 2025)** requiring full data lineage, AI model disclosure, and human review sign-off for AI-assisted financial outputs, the manual workflow — and legacy tools built before this standard — are no longer viable.

**LegalGraph solves this in three steps:**

1. **Upload** — drop a lease contract PDF into the app (DOCX / TXT support coming soon)
2. **Extract** — AI pulls all IFRS 16 / ASC 842 fields directly from the contract text, flags missing data and risks with per-field confidence scores, and links every finding back to the source clause
3. **Report** — generate a structured, auditor-ready compliance report in one click — with a full clause-level audit trail that satisfies PCAOB AS 1105 requirements

The result: Rachel's quarterly compliance cycle drops from 4–6 hours to **under 45 minutes**, and auditors get the clause citations they need without any manual follow-up.

---

## What's in this repo

### App (React 18 + Vite SPA)

| Path | Description |
|------|-------------|
| `src/App.jsx` | Root component — React Router v6 routes, ProtectedRoute, auth state (user, authReady), Toast provider, ConsentModal gate |
| `src/screens/Landing.jsx` | Marketing landing page — hero, feature sections, social proof, CTA → `/signin` |
| `src/screens/Auth.jsx` | Sign-in / sign-up / forgot-password screen (Supabase email+password auth) |
| `src/screens/Dashboard.jsx` | Upload hero, lease portfolio table, drag-and-drop file picker |
| `src/screens/LeaseAnalysis.jsx` | Full extraction results: risk score ring, terms grid, risk flags with guidance, sidebar export actions |
| `src/screens/AuditTrail.jsx` | Per-session audit log: extraction timestamp, model version, field edits, flag resolutions |
| `src/screens/Playbooks.jsx` | Playbook management — IFRS 16 / ASC 842 rule sets applied to incoming contracts |
| `src/components/ConsentModal.jsx` | Pre-analysis consent gate: OpenAI API disclosure, data handling, "not legal advice" |
| `src/components/ProgressPanel.jsx` | 4-step analysis progress panel shown during extraction |
| `src/components/AppNav.jsx` | Top navigation bar with avatar dropdown (sign-out) and mobile hamburger drawer |
| `src/components/Toast.jsx` | Non-blocking toast notifications (replaces all `alert()` calls) |
| `src/utils/constants.js` | `FIELD_LABELS`, `MOCK_ANALYSIS`, `FIELD_HINTS`, `getExtractionQuality()` |
| `src/utils/supabase.js` | Supabase client — `saveAnalysis`, `loadLatestAnalysis`, `getSession`, `signOut`, `onAuthStateChange` |
| `src/utils/track.js` | Analytics event stub — wires to PostHog (`VITE_POSTHOG_KEY`) |
| `src/utils/fileToBase64.js` | File encoding utility for webhook payload |
| `src/styles/globals.css` | App CSS — design tokens, components, responsive layout |
| `src/styles/landing.css` | Landing page styles (self-contained dark theme) |
| `src/styles/auth.css` | Auth page styles (self-contained dark theme matching landing) |
| `index.html` | Vite entry point |
| `vite.config.js` | Vite build config |

### Configuration

| File | Description |
|------|-------------|
| `.env.example` | Required env vars: `VITE_WEBHOOK_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POSTHOG_KEY` |
| `netlify.toml` | Netlify build config — build command, publish dir (`dist/`), security headers, SPA redirect |
| `CLAUDE.md` | Product context and working norms for AI-assisted development |
| `SPEC.md` | Technical spec v1.3 — AI pipeline architecture, HITL checkpoints, kill criteria, MOAT analysis, auth flow |

### Product docs

| File | Description |
|------|-------------|
| `project-context/PRD v2.1.md` | Full PRD — personas, jobs to be done, North Star + L1/L2 metrics, AI evaluation strategy, pricing model |
| `project-context/JTBD.md` | Jobs-to-be-done framework (v1.1) |
| `project-context/USER-JOURNEY.md` | End-to-end user journey maps for Rachel, Jennifer, David, External Auditor (v1.1) |
| `project-context/TRUST-UX-PLAN.md` | T.R.U.S.T framework UX implementation plan — 9 tasks across 3 phases |
| `release-plan/BETA-PLAN.md` | Beta release plan — entry criteria, 6-week program, graduation gates |
| `release-plan/GA-PLAN.md` | GA release plan — staged rollout, SLA commitments, 30-day success metrics |

### Architecture

| File | Description |
|------|-------------|
| `architecture/BACKEND-ARCHITECTURE.md` | Backend schema, Supabase tables, n8n integration |
| `architecture/BACKEND-PLAN.md` | Schema evolution plan — 3-phase migration for confidence scores, structured error envelopes |
| `architecture/FRONTEND-ARCHITECTURE.md` | React component tree, routing, state management |
| `architecture/n8n-workflow.json` | Exportable n8n workflow definition |
| `architecture/diagrams/` | System architecture diagrams (current + beta) |

### Research & Context

| File | Description |
|------|-------------|
| `outputs/market-research-legal-ai-2026.md` | Market sizing ($800M–$1.9B TAM), 11-player competitor map, pricing benchmarks |
| `outputs/user-research-legal-ai-2026.md` | Persona deep dives, auditor evidence requirements, AI trust gap data |
| `company-context/` | Company overview, user personas, product description, competitive landscape |

### Test data

| File | Description |
|------|-------------|
| `SAMPLE-LEASE.docx` | Realistic 7-year commercial office lease engineered to exercise every IFRS 16 field, with discount rate intentionally absent |
| `sample-lease-ifrs16.pdf` | PDF version of the test lease — use this for end-to-end testing since the app currently accepts PDF only |

### Evals

| File | Description |
|------|-------------|
| `evals/run-evals.cjs` | Automated eval runner — tests webhook payload shape, extraction coverage, risk score, field extraction, and risk flags against ground-truth cases |
| `evals/cases/sample-lease-agreement.json` | Ground-truth test case for the SF 555 Market St lease |
| `evals/hhh-rubric.md` | 21-question human eval rubric (Helpful / Honest / Harmless), scored 1–5 |
| `evals/hhh-results-v1.md` | HHH baseline scores — 74/105 (HOLD); per-question breakdown and gaps |
| `evals/hhh-results.md` | Live results log — add a row after each eval round |
| `evals/rai-remediation-plan.md` | Gap-by-gap RAI remediation plan — UI vs. pipeline vs. process classification |
| `evals/prompt-rubric.md` | 5-dimension prompt engineering rubric (Role/Instruction/Task/Guardrails/Examples) — use to score n8n system messages |

---

## Running locally

```bash
# Install dependencies
npm install

# Copy env vars and fill in your values
cp .env.example .env

# Start the dev server (hot reload)
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview the production build
npm run preview
```

### Environment variables

Set in `.env` for local development, or in **Netlify → Site configuration → Environment variables** for deployment:

| Variable | Description | Secret |
|---|---|---|
| `VITE_WEBHOOK_URL` | n8n webhook endpoint. Use `/webhook-test/…` during development, `/webhook/…` in production | No |
| `VITE_SUPABASE_URL` | Supabase project URL | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_POSTHOG_KEY` | PostHog project API key for L1/L2 metric instrumentation | Yes |

---

## End-to-end test walkthrough

### Step 1 — Open the workflow in n8n

The app POSTs to an n8n webhook on analysis completion. The URL is a **test webhook** (`/webhook-test/`) which only listens when the workflow is actively open.

1. Log in to your n8n instance
2. Open the lease compliance workflow (import `architecture/n8n-workflow.json` if needed)
3. Click **"Listen for test event"** in the Webhook trigger node

### Step 2 — Sign in

1. Open the app (`npm run dev` or the Netlify URL) — the landing page loads at `/`
2. Click **Get started** or **Sign in** to reach `/signin`
3. Create an account (sign-up) or sign in with an existing Supabase email+password account
4. You'll be redirected to the Dashboard (`/app`)

### Step 3 — Upload the sample contract

1. On the Dashboard, click **Choose file** or drag-and-drop
2. Select `sample-lease-ifrs16.pdf` from this repo (PDF only; DOCX support coming soon)

The upload panel shows the filename and file size. The button changes to **Analyze Contract**.

### Step 4 — Accept the consent modal

On first analysis, a consent modal appears disclosing:
- **OpenAI API** processes the contract text via the n8n workflow
- Data is not used to train AI models
- Output requires human review and is not legal or financial advice

Dismiss to proceed.

### Step 5 — Run the analysis

Click **Analyze Contract**. The 4-step progress panel animates:

| Step | What it does |
|------|-------------|
| Identifying lease type and parties | Parses document structure |
| Finding commencement date, rent schedule, and renewals | Extracts IFRS 16 fields |
| Scoring risk against IFRS 16 §§ 19, 26, B34 | Calculates risk score |
| Generating your audit-ready report | POSTs payload to n8n webhook |

### Step 6 — Verify the webhook payload

When analysis completes, the app fires a POST to `VITE_WEBHOOK_URL`. The exact payload shape:

```json
{
  "contract_type": "Commercial Office Lease",
  "terms_found": [
    "commencement_date",
    "expiry_date",
    "annual_payment",
    "escalation_rate",
    "renewal_options",
    "rou_asset_value",
    "termination_rights",
    "security_deposit"
  ],
  "terms_missing": ["discount_rate"],
  "risk_score": 62,
  "analyzed_at": "2026-05-03T22:00:00.000Z"
}
```

A **green toast** appears bottom-right confirming delivery.

### Step 7 — Review the results

The LeaseAnalysis screen shows the full extraction output:
- Risk score: **62 / 100 · Medium**
- Extraction quality indicator (Strong / Fair / Weak) with field count
- 8 of 9 IFRS 16 fields extracted
- `discount_rate` flagged as missing — the sample contract intentionally omits it (§7.2 references IBR but gives no rate)
- 3 risk flags: one **High** (discount rate missing), one **Medium** (renewal option intent), one **Low** (security deposit classification)
- Each High flag includes a **"What do I do?"** guidance block with IFRS 16 methodology and an input field for manual entry
- Export and Send buttons are **gated** until all High flags are resolved

---

## T.R.U.S.T Framework

The UX is built around five trust dimensions for AI-assisted compliance tooling:

| Dimension | Implementation |
|---|---|
| **T**arget the Moment of Trust | Export gate locked behind High flag resolution; completion banner on sign-off |
| **R**educe Cognitive Load | Confidence legend (green/amber/red dots) in terms grid header; contextual missing-field hints per field type |
| **U**ncertainty as a UX Feature | Inline "AI uncertain — verify against §X.X" chips on fields with confidence < 0.85 |
| **S**ignal Quality Continuously | Extraction quality indicator (Strong/Fair/Weak) separate from risk score; demo fallback badge with Retry CTA |
| **T**ight Feedback Loops | Field edit tracking via `track('field_edited', …)` — corrections feed back as eval signals; "Correction saved — helps improve future extractions" confirmation |

---

## What the sample contract covers

`sample-lease-ifrs16.pdf` (and its source `SAMPLE-LEASE.docx`) is a 15-section commercial office lease at 555 Market St, San Francisco — engineered to exercise every IFRS 16 extraction field. **Use the PDF for end-to-end testing** — the app currently accepts PDF only.

| IFRS 16 Field | Location | Value |
|---|---|---|
| Commencement date | §2.1 | January 1, 2022 |
| Expiration / lease term | §2.1 | December 31, 2028 · 7 years |
| Annual payment | §5.1, §5.2 | $348,000 (Year 1) |
| Escalation rate | §5.3 | 3% per annum (fixed) |
| Renewal options | §3.1, §3.2 | 2 × 5-year options |
| Security deposit | §6.1 | $58,000 (two months' rent) |
| Termination rights | §9.1, §9.2 | Landlord-only, 12-month notice |
| ROU asset / premises | §7.1, §7.3, §2.2 | 18,400 sq ft, Floor 12 |
| Governing law | §14.1 | California |
| **Discount rate** | §7.2 | **Intentionally absent** → triggers missing-field flag + IBR guidance |

The missing discount rate is deliberate — it matches the mock analysis wired into the app and ensures the webhook payload always includes `"terms_missing": ["discount_rate"]`.

---

## n8n Workflow Architecture

The workflow follows an orchestrator-subagent pattern powered by **OpenAI Chat Model**:

```
Webhook (POST)
    │
    ▼
Extract from File  ──── parses raw text from uploaded PDF/DOCX
    │
    ▼
Orchestrator Agent  ◄── OpenAI Chat Model + Simple Memory
    │
    ├──► key_term_extraction_agent  ◄── OpenAI Chat Model + Tool Output Parser
    │         └── extracts IFRS 16 / ASC 842 fields, assigns confidence scores,
    │             cites source clauses, applies hallucination guard
    │
    └──► contract_playbook_agent  ◄── OpenAI Chat Model + Memory
              └── fetch_playbook (getAll: row)
                        └── validates extracted fields against active playbook
    │
    ▼
Respond to Webhook  ──── returns structured JSON payload to the UI
```

**AI pipeline steps (per SPEC v1.1):**
1. PDF parsing → raw text extraction
2. Semantic chunking → clause-boundary-aware segments
3. RAG grounding → retrieves relevant IFRS 16 / ASC 842 standard sections
4. Confidence scoring → per-field 0–1.0 score, calibrated against ground truth
5. Source citation → clause section + page reference per extracted field
6. Hallucination guard → fields not found return `null` with `confidence: 0` (never a hallucinated value)

Import `architecture/n8n-workflow.json` to your n8n instance to get the full workflow definition.

> **Note on prompt size:** The `key_term_extraction_agent` system message is intentionally concise to stay under Cloudflare n8n Cloud's 100-second response limit. The prompt includes a full 10-field LEASE example to ensure correct key naming — do not expand it without benchmarking inference time first.

---

## Webhook integration notes

### Why `text/plain` content-type?

The fetch call uses `Content-Type: text/plain` instead of `application/json`. This is intentional:

- `application/json` triggers a CORS preflight `OPTIONS` request
- n8n's test webhook does not respond to `OPTIONS` with CORS headers, so the browser blocks the `POST`
- `text/plain` is a CORS-safe simple request — no preflight, POST goes straight through
- n8n receives and parses the JSON body regardless of the declared content-type

### Graceful error handling

If the webhook fails (n8n not listening, network error, non-2xx response), the analysis result still displays in full using mock data. A toast shows the specific error. The fallback badge changes to "Live extraction failed — showing sample data" with a **Retry** button.

---

## Evals

```
evals/
  run-evals.cjs                   # Automated eval runner (Node.js, CommonJS, no dependencies)
  cases/
    sample-lease-agreement.json   # Ground-truth for the SF 555 Market St lease
  hhh-rubric.md                   # 21-question HHH rubric (Helpful / Honest / Harmless)
  hhh-results-v1.md               # v1 scores — 74/105 (HOLD)
  hhh-results.md                  # Live results log
  responsible-ai-eval.md          # 28-question RAI framework (7 dimensions)
  rai-remediation-plan.md         # Gap-by-gap remediation plan
```

### Automated eval runner

Tests 5 suites against a ground-truth case: webhook payload shape, extraction coverage, risk score, per-field accuracy, and risk flag classification.

```bash
# Smoke-test using the ground-truth expected payload (no n8n required)
node evals/run-evals.cjs

# Test a live extraction — paste the n8n webhook response body
node evals/run-evals.cjs --payload '{"contract_type":"Commercial Office Lease","terms_found":[...],"risk_score":62,...}'

# Run a single named case
node evals/run-evals.cjs --case sample-lease-sf-001
```

Latest run: **11/11 (100%)** — webhook shape, coverage counts, and risk score all pass. Field extraction and risk flag suites activate automatically when `payload.fields` and `payload.risk_flags` are present in the n8n response.

---

### HHH human eval

| Dimension | v1 Score | Max | % |
|-----------|----------|-----|---|
| Helpful | 31 | 35 | 89% |
| Honest | 26 | 35 | 74% |
| Harmless | 17 | 35 | 49% |
| **Total** | **74** | **105** | **70%** |

**Status: HOLD** — target 90/105 before regulated-client pilots. Top gap: Harmless dimension (disclaimer visibility, consent gate, risk score explainability).

**T.R.U.S.T framework partially closes the following v1 gaps:**

| Eval question | v1 Score | Gap addressed |
|---|---|---|
| A4 — Human review prompts | 1 | "What do I do?" guidance blocks now on every High flag with IFRS 16 methodology |
| A5 — Data handling transparency | 2 | Consent modal fires before first analysis; persists to localStorage so it's never skipped |
| H4 — Actionability | 4 | Contextual missing-field hints (FIELD_HINTS) with specific next actions per field type |
| O2 — Confidence calibration | 3 | Confidence legend + inline "AI uncertain — verify against §X.X" chips on fields <0.85 |
| O4 — Scope boundaries disclosed | 2 | Demo fallback badge now explicitly says "Live extraction failed — showing sample data" |

Re-score with `evals/hhh-rubric.md` after the T.R.U.S.T deploy to establish v2 baseline.

---

### Responsible AI eval

RAI scoring is in progress. Transparency and Fairness dimensions were scored in v1; remaining 5 dimensions are pending a dedicated eval session.

| Dimension | v1 Score | Max | % | Status |
|-----------|----------|-----|---|--------|
| Transparency | 12 | 16 | 75% | Scored |
| Fairness & Non-Discrimination | 5 | 16 | 31% | Scored — biggest gap |
| Privacy & Data Minimisation | — | 16 | — | Pending |
| Security | — | 16 | — | Pending |
| Accountability | — | 16 | — | Pending |
| Safety | — | 16 | — | Pending |
| Human Oversight | — | 16 | — | Pending |
| **Partial total** | **17** | **32** | **53%** | 2 of 7 dimensions |

**Threshold for regulated deployment: 96/112.** Biggest scored gap: Fairness (no multi-jurisdiction or multi-contract-type testing). See `evals/rai-remediation-plan.md` for the gap-by-gap fix plan.

---

## Deployment (Netlify)

```bash
# One-off deploy via Netlify CLI
netlify deploy --prod

# Or push to the connected GitHub repo — auto-deploys on every push to main
git push origin main
```

Netlify runs `npm run build` (Vite), publishes `dist/`, and applies the security headers and SPA redirect rule in `netlify.toml`. No secrets are stored in the repo — all env vars are set in the Netlify dashboard.

### Moving to production

1. Change `VITE_WEBHOOK_URL` from `/webhook-test/…` to `/webhook/…` — the always-on endpoint
2. Wire `VITE_POSTHOG_KEY` to your PostHog project for L1/L2 metric instrumentation
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Netlify dashboard and trigger **Deploy without cache** (Supabase persistence is implemented — env vars enable it)

---

## Product spec

See `project-context/PRD v2.1.md` for the full product requirements:
- Problem statement and user personas (Rachel, Jennifer, David, External Auditor)
- Jobs to be done (J0–J11)
- North Star + L1/L2 metrics with baselines, targets, DRI assignments
- AI Evaluation Strategy — ground-truth methodology, human baseline, prompting approach
- Pricing model ($8K / $15K / $45K+ tiers) and business case
- P0/P1/P2 feature breakdown with 12-week GA roadmap

See `SPEC.md` for the technical spec — AI pipeline architecture, HITL checkpoints, PCAOB AS 1105 compliance requirements, kill criteria, and MOAT analysis.
