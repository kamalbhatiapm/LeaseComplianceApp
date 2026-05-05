# LegalGraph — Lease Compliance App

IFRS 16 / ASC 842 contract analyzer with AI extraction, risk scoring, and n8n webhook integration.

**Live app → [https://lease-compliance-app.netlify.app](https://lease-compliance-app.netlify.app)**

---

## Problem Statement

In-house legal and finance teams at mid-market companies managing 10–50 active leases have no reliable way to generate audit-ready IFRS 16 / ASC 842 compliance reports from their contracts.

Today, **Rachel** (Compliance Lead) spends **4–6 hours per quarter** manually extracting lease terms from PDFs, reconciling them in Excel, and formatting outputs for auditors — a process prone to error, version conflicts, and missed deadlines. When an auditor asks for the source clause behind a specific line item, she has to hunt through PDFs manually, adding hours of back-and-forth before a report can be signed off.

With IFRS 16 audit scrutiny increasing and external auditors requiring traceable, clause-level evidence, the manual workflow is no longer sustainable.

**LegalGraph solves this in three steps:**

1. **Upload** — drop a lease contract (PDF, DOCX, or TXT) into the app
2. **Extract** — AI pulls all IFRS 16 / ASC 842 fields directly from the contract text, flags missing data and risks, and links every finding back to the source clause
3. **Report** — generate a structured, auditor-ready compliance report in one click — with a full clause-level audit trail

The result: Rachel's quarterly compliance cycle drops from 4–6 hours to **under 45 minutes**, and auditors get the clause citations they need without any manual follow-up.

---

## What's in this repo

### App

| File | Description |
|------|-------------|
| `legalgraph-mockups.html` | Source of truth — all UI, CSS, and JS in one file (three screens, interactive upload flow, n8n webhook trigger) |
| `build.sh` | Build script — substitutes `__PLACEHOLDER__` tokens with env vars at deploy time, outputs `dist/index.html` |
| `netlify.toml` | Netlify build config — build command, publish dir (`dist/`), security headers |
| `.gitignore` | Excludes `dist/` (build output) so locally-built files with injected secrets are never committed |
| `CLAUDE.md` | Product context and working norms for AI-assisted development — design system, critical UX rules, backlog priorities |

### Test data

| File | Description |
|------|-------------|
| `sample-lease-agreement.docx` | Realistic 7-year commercial office lease engineered to exercise every IFRS 16 extraction field, with discount rate intentionally absent |

### Product docs

| File | Description |
|------|-------------|
| `prd-lease-compliance-2026-03-31.md` | Full product requirements — personas, jobs to be done, North Star + L1/L2 metrics, P0/P1/P2 features (v1.1) |
| `beta-release-plan.md` | Beta release plan — entry criteria, participant profile, 6-week program structure, graduation gates |
| `ga-release-plan.md` | GA release plan — staged rollout (4 waves), SLA commitments, GTM, 30-day success metrics, rollback plan |
| `n8n-payload-upgrade-plan.md` | Backend schema evolution plan — 3-phase migration for richer extraction output, per-field confidence scores, and structured error envelopes |
| `docs/n8n-workflow.jpeg` | Architecture diagram of the n8n orchestrator-subagent pipeline |

### Evals

| File | Description |
|------|-------------|
| `evals/run-evals.js` | Automated eval runner — tests webhook payload shape, extraction coverage, and risk score against ground-truth cases |
| `evals/cases/sample-lease-agreement.json` | Ground-truth test case for the SF office lease |
| `evals/hhh-rubric.md` | 21-question human eval rubric (Helpful / Honest / Harmless), scored 1–5 per question |
| `evals/hhh-results-v1.md` | HHH baseline scores — 74/105 (HOLD); per-question breakdown and top gaps |
| `evals/hhh-results.md` | Live results log — add a row after each eval round |
| `evals/responsible-ai-eval.md` | 28-question RAI framework across 7 dimensions (Transparency, Fairness, Privacy, Security, Accountability, Safety, Human Oversight) |
| `evals/responsible-ai-results-v1.md` | RAI baseline — 58/112 (52%, HOLD for regulated clients); dimension-by-dimension evidence |
| `evals/rai-remediation-plan.md` | Gap-by-gap remediation plan — classifies each gap as UI, pipeline, or process work |
| `evals/qa-backlog.md` | 21-item bug tracker — all P0/P1 resolved, 9 P2/P3 open |

---

## The three screens

### Screen 1 — Contract Upload
Upload a lease contract (PDF, DOCX, DOC, TXT). Drag-and-drop or click to browse. Once a file is selected the button changes to **Analyze Contract** and triggers the four-step analysis pipeline:

1. Reading contract structure
2. Extracting IFRS 16 fields
3. Scoring risk factors
4. Triggering downstream n8n workflow via webhook

### Screen 2 — Analysis Results
Shows the full extraction output for a lease:
- Overall risk score (0–100 ring)
- Key metrics: ROU asset value, lease liability, discount rate, remaining term
- AI-generated summary paragraph
- Extracted terms grid — each field links to its source clause in the original contract
- Risk flags (High / Medium / Low) with resolution CTAs
- Sidebar: quick actions, clause audit trail, IFRS 16 field coverage, applied playbook

### Screen 3 — Playbook Management
Manage the `contract_playbook` table — extraction rule sets applied to incoming contracts. Supports IFRS 16, ASC 842, or both. Each playbook defines required fields, confidence thresholds, and risk rules.

---

## Running locally

The source file uses `__PLACEHOLDER__` tokens instead of hardcoded values. Run `build.sh` to substitute them before opening in a browser:

```bash
WEBHOOK_URL="https://your-n8n-instance/webhook-test/your-workflow-id" \
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_ANON_KEY="your-anon-key" \
bash build.sh

# Output lands in dist/index.html
open dist/index.html

# Or serve over HTTP
python3 -m http.server --directory dist 8080
# then open http://localhost:8080
```

---

## End-to-end test walkthrough

### Step 1 — Open the workflow in n8n

The app POSTs to an n8n webhook on analysis completion. The URL is a **test webhook** (`/webhook-test/`) which only listens when the workflow is actively open.

1. Log in to your n8n instance
2. Open the lease compliance workflow
3. Click **"Listen for test event"** in the Webhook trigger node — you'll see the node waiting

### Step 2 — Upload the sample contract

1. Open the app (your Netlify URL or `dist/index.html` locally)
2. On Screen 1 (Upload), click **Choose file**
3. Select `sample-lease-agreement.docx` from this repo

The upload panel updates to show the filename and file size, and the button changes to **Analyze Contract**.

### Step 3 — Run the analysis

Click **Analyze Contract**. Watch the four progress steps animate:

| Step | What it does |
|------|-------------|
| Reading contract structure | Parses document layout |
| Extracting IFRS 16 fields | Pulls commencement date, rent, renewal options, etc. |
| Scoring risk factors | Calculates overall risk score |
| Triggering downstream workflow | POSTs payload to n8n |

### Step 4 — Verify the webhook

When analysis completes, the app fires a POST to the `WEBHOOK_URL` you configured. The exact payload:

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

A **green toast** appears bottom-right confirming delivery. Switch to n8n — you should see the test event received in the webhook node with the full payload.

### Step 5 — View the results

Click **View full report** (or use the sticky nav). Screen 2 shows the complete analysis:
- Risk score: **62 / 100 (Medium)**
- 8 of 9 IFRS 16 fields extracted
- `discount_rate` flagged as missing — the sample contract intentionally omits it (Section 7.2 references IBR but gives no rate)
- 3 risk flags: one High (discount rate missing), one Medium (renewal option intent), one Low (security deposit classification)

---

## Deployment (Netlify)

### How the build works

`build.sh` runs on every Netlify deploy. It uses `sed` to substitute three `__PLACEHOLDER__` tokens in `legalgraph-mockups.html` with live env var values, then writes the output to `dist/index.html`. No secrets are stored in the repo.

```
legalgraph-mockups.html  (placeholders)
        │
        ▼  bash build.sh  (env vars injected by Netlify)
        │
   dist/index.html  (live values, published)
```

### Environment variables

Set in **Netlify → your site → Site configuration → Environment variables**:

| Variable | Description | Secret |
|---|---|---|
| `WEBHOOK_URL` | n8n webhook endpoint — your n8n instance URL + workflow path. Swap `/webhook-test/` for `/webhook/` in production | No |
| `SUPABASE_URL` | Your Supabase project URL | No |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

To update any value: change it in the Netlify dashboard and trigger a redeploy — nothing in the repo needs to change.

### Triggering a redeploy

```bash
# Netlify CLI (if installed)
netlify deploy --prod --site <your-site-name>

# Or push any commit — connect the GitHub repo in Netlify for auto-deploy on push
```

### Moving to production

1. Change `WEBHOOK_URL` from `/webhook-test/…` to `/webhook/…` in your Netlify env vars — the always-on endpoint that doesn't require the n8n workflow to be open
2. Replace the Supabase placeholder values with your real project credentials
3. Connect the GitHub repo to Netlify (Settings → Build & deploy → Link repository) for automatic deploys on every push to `main`
4. Move the webhook POST server-side (e.g. a Netlify Function or Next.js API route) to keep the n8n URL out of the client bundle entirely

---

## What the sample contract covers

`sample-lease-agreement.docx` is a 15-section commercial office lease engineered to exercise every IFRS 16 extraction field:

| IFRS 16 Field | Location in contract | Value |
|---|---|---|
| Commencement date | §2.1, cover table | January 1, 2022 |
| Expiration / lease term | §2.1, cover table | December 31, 2028 · 7 years |
| Annual payment | §5.1, §5.2 rent schedule | $348,000 (Year 1) |
| Escalation rate | §5.3 | 3% per annum (fixed) |
| Renewal options | §3.1, §3.2 | 2 × 5-year options |
| Security deposit | §6.1 | $58,000 (two months' rent) |
| Termination rights | §9.1, §9.2 | Landlord-only, 12-month notice |
| ROU asset / premises | §7.1, §7.3, §2.2 | 18,400 sq ft, Floor 12 |
| Governing law | §14.1 | California |
| **Discount rate** | §7.2 | **Intentionally absent** → triggers missing-field flag |

The missing discount rate is deliberate — it matches the mock analysis wired into the app and ensures the webhook payload always includes `"terms_missing": ["discount_rate"]`.

---

## n8n Workflow Architecture

![n8n workflow — Webhook → Orchestrator Agent → sub-agents → Respond to Webhook](docs/n8n-workflow.jpeg)

The workflow follows an orchestrator-subagent pattern:

```
Webhook (POST)
    │
    ▼
Extract from File  ──── extracts raw text from uploaded PDF/DOCX
    │
    ▼
Orchestrator Agent  ◄── OpenAI Chat Model + Simple Memory
    │
    ├──► key_term_extraction_agent  ◄── Chat Model + Memory + Tool Output Parser
    │         └── extracts IFRS 16 / ASC 842 fields from contract text
    │
    └──► contract_playbook_agent  ◄── Chat Model + Memory
              └── fetch_playbook (getAll: row)  ← reads playbook rules from DB
                        └── validates extracted fields against active playbook
    │
    ▼
Respond to Webhook  ──── returns JSON payload to the UI
```

### Node descriptions

| Node | Type | Role |
|---|---|---|
| **Webhook** | Trigger | Receives POST from the UI on "Analyze Contract" click |
| **Extract from File** | File Processing | Parses the uploaded PDF/DOCX into raw text |
| **Orchestrator Agent** | AI Agent | Routes work to sub-agents; assembles final response |
| **OpenAI Chat Model** | LLM | Powers both the orchestrator and sub-agents |
| **Simple Memory** | Memory | Provides conversation context across agent calls |
| **key_term_extraction_agent** | AI Sub-agent | Extracts all IFRS 16 fields, flags missing ones, assigns confidence scores |
| **contract_playbook_agent** | AI Sub-agent | Fetches the active playbook and runs its risk rules against extracted terms |
| **fetch_playbook** | Tool (DB query) | `getAll: row` — reads playbook rules from the `contract_playbook` table |
| **Respond to Webhook** | Output | Returns the full extraction JSON to the calling UI |

### Response payload shape

```json
{
  "contract_type": "Commercial Office Lease",
  "terms_found": ["commencement_date", "expiry_date", "annual_payment", "..."],
  "terms_missing": ["discount_rate"],
  "risk_score": 62,
  "analyzed_at": "2026-05-03T22:00:00.000Z"
}
```

---

## Webhook integration notes

### Why `text/plain` content-type?

The fetch call uses `Content-Type: text/plain` instead of `application/json`. This is intentional:

- `application/json` triggers a CORS preflight `OPTIONS` request
- n8n's test webhook does not respond to `OPTIONS` with CORS headers, so the browser blocks the `POST` before it sends
- `text/plain` is a CORS-safe simple request — no preflight, POST goes straight through
- n8n receives and parses the JSON body regardless of the declared content-type

### Graceful error handling

If the webhook fails for any reason (n8n not listening, network error, non-2xx response), the analysis result still displays in full. The toast shows the specific error and the **View full report** button still appears. The webhook is non-blocking.

---

## Evals

The `evals/` directory contains three layers of quality assurance: automated extraction tests, a human HHH rubric, and a Responsible AI framework.

```
evals/
  run-evals.js              # Automated eval runner (Node.js, no dependencies)
  cases/
    sample-lease-agreement.json  # Ground-truth test case for the SF office lease
  hhh-rubric.md             # 21-question human eval rubric (Helpful / Honest / Harmless)
  hhh-results-v1.md         # v1 scores — 74/105 (HOLD)
  hhh-results.md            # Live results log — fill in after each eval run
  responsible-ai-eval.md    # 28-question RAI framework (7 dimensions)
  responsible-ai-results-v1.md  # RAI v1 scores — 58/112 (52%, HOLD for regulated)
  rai-remediation-plan.md   # Gap-by-gap remediation plan (UI vs. pipeline vs. process)
  qa-backlog.md             # Bug tracker — P0/P1 resolved, 9 P2/P3 open
```

### Automated eval runner

Tests the webhook payload shape, extraction coverage, and risk score against a ground-truth case. Runs in seconds with no external dependencies:

```bash
# Smoke-test using the ground-truth expected payload
node evals/run-evals.js

# Test a live extraction — paste the n8n webhook response body as JSON
node evals/run-evals.js --payload '{"contract_type":"Commercial Office Lease","terms_found":[...],"risk_score":62,...}'
```

Latest run: **11/11 (100%)** — webhook shape, coverage counts, and risk score all pass.

Two suites are skipped until the n8n pipeline returns structured field and flag objects (`payload.fields`, `payload.risk_flags`). When those keys are present the runner automatically enables per-field accuracy and per-flag classification checks.

---

### HHH human eval

21 questions across three dimensions, scored 1–5 by a human evaluator after running a contract through the full system.

| Dimension | v1 Score | Max | % |
|-----------|----------|-----|---|
| Helpful | 31 | 35 | 89% |
| Honest | 26 | 35 | 74% |
| Harmless | 17 | 35 | 49% |
| **Total** | **74** | **105** | **70%** |

**Status: HOLD** — target 90/105 before regulated-client pilots.

Top gaps driving the Harmless deficit:
- **A4 (score 1)** — No prompt to consult a qualified accountant / attorney before filing
- **A1 (score 2)** — No explicit "not legal advice" disclaimer in the results view
- **A5 (score 2)** — No consent gate before the contract is sent to the AI pipeline
- **O6 (score 2)** — Risk score shown as a bare number with no range or derivation note

See [`evals/hhh-results-v1.md`](evals/hhh-results-v1.md) for the full per-question breakdown and [`evals/hhh-rubric.md`](evals/hhh-rubric.md) to run a new eval round.

---

### Responsible AI eval

28 questions across 7 dimensions (Transparency, Fairness, Privacy, Security, Accountability, Safety, Human Oversight), scored 1–4.

| Dimension | v1 Score | Max | % |
|-----------|----------|-----|---|
| Transparency | 12 | 16 | 75% |
| Fairness & Non-Discrimination | 5 | 16 | 31% |
| Privacy & Data Minimisation | — | 16 | — |
| Security | — | 16 | — |
| Accountability | — | 16 | — |
| Safety | — | 16 | — |
| Human Oversight | — | 16 | — |
| **Total** | **58** | **112** | **52%** |

**Status: HOLD for regulated clients** (insurance, banking, public-sector auditors). Threshold for regulated deployment is 96/112.

Biggest gaps: Fairness dimension (no multi-jurisdiction or multi-contract-type testing; no bias review of the risk scoring algorithm). See [`evals/rai-remediation-plan.md`](evals/rai-remediation-plan.md) for the gap-by-gap fix plan with UI vs. pipeline vs. process classification.

---

### Running evals

```bash
# 1. Automated (runs immediately, no setup)
node evals/run-evals.js

# 2. Human HHH — open the rubric, run a contract through the live app, score each question
open evals/hhh-rubric.md
# → record scores in evals/hhh-results.md

# 3. RAI — open the framework, review the live app and n8n pipeline against each question
open evals/responsible-ai-eval.md
```

After each human eval round, update `evals/hhh-results.md` (or `responsible-ai-results-v2.md`) with the new scores. The CLAUDE.md product priorities section tracks the target threshold for each.

---

## PRD reference

See `prd-lease-compliance-2026-03-31.md` for the full product spec:
- Problem statement and user personas (Rachel — Compliance Lead, Jennifer — GC)
- Jobs to be done
- Success metrics (target: <45 min to generate quarterly compliance report)
- P0 / P1 / P2 feature breakdown
- Open questions and confidence levels
