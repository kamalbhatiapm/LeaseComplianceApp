# LegalGraph — Lease Compliance App

IFRS 16 / ASC 842 contract analyzer with AI extraction, risk scoring, and n8n webhook integration.

**Live app → [https://lease-compliance-app.netlify.app](https://lease-compliance-app.netlify.app)**

---

## What's in this repo

| File | Description |
|------|-------------|
| `legalgraph-mockups.html` | Full UI mockup — three screens, interactive upload flow, n8n webhook trigger |
| `sample-lease-agreement.docx` | Realistic 7-year office lease with all IFRS 16 fields embedded for extraction testing |
| `prd-lease-compliance-2026-03-31.md` | Product requirements document |
| `build.sh` | Build script — injects env vars into the HTML at deploy time |
| `netlify.toml` | Netlify build config — command, publish dir, security headers |

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

## PRD reference

See `prd-lease-compliance-2026-03-31.md` for the full product spec:
- Problem statement and user personas (Rachel — Compliance Lead, Jennifer — GC)
- Jobs to be done
- Success metrics (target: <45 min to generate quarterly compliance report)
- P0 / P1 / P2 feature breakdown
- Open questions and confidence levels
