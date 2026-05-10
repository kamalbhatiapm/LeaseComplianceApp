# LegalGraph — Data Model

**Version:** 1.0  
**Date:** 2026-05-09  
**Grounded in:** tasks/plan.md · SPEC.md v1.1 · BACKEND-ARCHITECTURE.md · PRD v2.1  
**Database:** Supabase (PostgreSQL)  
**Status:** Draft — implements BUG-009 (Task 3) and supporting tables for Tasks 5, 7, 10, 11

---

## Entity Relationship Overview

```
accounts
  │
  ├──< analyses (1:many — one account has many lease analyses)
  │       │
  │       ├──< field_edits (1:many — one analysis has many field corrections)
  │       │
  │       └──< approvals (1:1 — one analysis has at most one active approval)
  │
  └──1 account_settings (1:1 — one settings record per account, stores company IBR)

contract_playbook (independent — read by n8n pipeline; no FK to accounts in MVP)
```

---

## Tables

### `accounts`

Represents an organisation (Rachel's company). Created on first sign-in via Supabase magic link.

```sql
CREATE TABLE accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  email       text NOT NULL UNIQUE,          -- magic link auth email
  name        text,                          -- company or user display name
  plan        text NOT NULL DEFAULT 'trial'  -- 'trial' | 'entry' | 'mid_market' | 'enterprise'
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX accounts_email_idx ON accounts (email);
```

**RLS:**
```sql
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own account row
CREATE POLICY "accounts: own row only"
  ON accounts FOR ALL
  USING (id = auth.uid());
```

---

### `analyses`

One row per lease analysis run. The central table — everything else hangs off it.

```sql
CREATE TABLE analyses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- Contract metadata
  file_name        text NOT NULL,
  file_size_kb     integer,
  standard         text NOT NULL DEFAULT 'ifrs16',  -- 'ifrs16' | 'asc842'
  contract_type    text,                             -- e.g. 'Commercial Office Lease'
  quarter          text,                             -- e.g. 'Q2-2026' — set on insert

  -- Extraction output (full n8n response stored as-is)
  analysis_json    jsonb,           -- full structured response from n8n (see shape below)
  risk_score       integer,         -- denormalised from analysis_json for fast queries
  terms_found      text[],          -- denormalised array of found field keys
  terms_missing    text[],          -- denormalised array of missing field keys
  webhook_ok       boolean NOT NULL DEFAULT false,

  -- Human review state
  analyst_name     text,            -- entered by Rachel before export
  field_edits_json jsonb,           -- per-field manual corrections (see shape below)
  flags_resolved   jsonb,           -- per-flag resolution records (see shape below)
  ibr_rate         numeric(6,4),    -- manually entered IBR (e.g. 0.0520 = 5.20%)
  ibr_method       text,            -- free-text methodology note

  -- Portfolio status (computed on write, used by Task 5 dashboard counter)
  status           text NOT NULL DEFAULT 'pending',
  -- 'pending'         — not yet analysed
  -- 'needs_attention' — ≥1 unresolved High-severity flag
  -- 'ready'           — all High flags resolved, report exportable
  -- 'approved'        — CFO approval received (approval_id set)

  -- CFO sign-off (Task 7, J10)
  approval_id      uuid REFERENCES approvals(id) ON DELETE SET NULL
);
```

**Indexes:**
```sql
CREATE INDEX analyses_account_id_idx    ON analyses (account_id);
CREATE INDEX analyses_status_idx        ON analyses (account_id, status);
CREATE INDEX analyses_quarter_idx       ON analyses (account_id, quarter);
CREATE INDEX analyses_created_at_idx    ON analyses (account_id, created_at DESC);
```

**Trigger — auto-update `updated_at`:**
```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**RLS:**
```sql
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses: own rows only"
  ON analyses FOR ALL
  USING (account_id = auth.uid());
```

#### `analysis_json` shape (n8n response — stored verbatim)

> **Current pipeline state (as of 2026-05-10):** The n8n workflow (Webhook → Extract from File → Orchestrator Agent → Respond to Webhook) returns the Orchestrator Agent's raw text output. The Respond to Webhook node sends this as `{"output": "..."}`. The frontend stores whatever JSON the webhook returns. The structured shape below is the **target schema** for when the pipeline is extended with a Format Response node that maps the Orchestrator output into typed fields. Until then, `analysis_json` may contain `{"output": "<markdown or JSON text>"}` and the frontend falls back to `MOCK_ANALYSIS` for display.

**Target shape (once pipeline returns structured JSON):**
```jsonc
{
  "contract_type": "Commercial Office Lease",
  "standard": "ifrs16",
  "terms_found": ["commencement_date", "annual_payment", "..."],
  "terms_missing": ["discount_rate"],
  "risk_score": 62,
  "risk_flags": [
    {
      "id": "missing_discount_rate",
      "severity": "high",               // 'high' | 'medium' | 'low'
      "field": "discount_rate",
      "description": "Discount rate not found in contract"
    }
  ],
  "fields": {
    "commencement_date": {
      "value": "2022-01-01",
      "confidence": 0.95,               // 0–1.0; null if not returned by pipeline
      "source_clause": "§2.1",
      "source_text": "The Lease Term shall commence on January 1, 2022..."
    },
    "discount_rate": {
      "value": null,
      "confidence": 0,
      "source_clause": "§7.2",
      "source_text": null
    }
    // ... one entry per IFRS 16 field
  },
  "analyzed_at": "2026-05-09T10:00:00.000Z",
  "model": "gpt-4o-mini",               // pipeline model name for PCAOB AS 1105
  "pipeline_version": "1.0"
}
```

**Current actual shape (raw Orchestrator output):**
```jsonc
{
  "output": "contract_type: Commercial Office Lease\n\nfields:\n  commencement_date: ..."
  // Free-text or embedded JSON returned by the Orchestrator Agent
  // No `fields`, `risk_flags`, or `risk_score` keys at the top level
}
```

#### `field_edits_json` shape (manual corrections from Task 1 / Checkpoint 1)

```jsonc
{
  "annual_payment_usd": {
    "original_value": 348000,
    "corrected_value": 360000,
    "edited_by": "Rachel Chen",
    "edited_at": "2026-05-09T10:15:00.000Z",
    "confidence": 0.92,
    "source_clause": "§5.1"
  }
  // ... one entry per edited field
}
```

#### `flags_resolved` shape (export gate state from Checkpoint 2)

```jsonc
{
  "missing_discount_rate": {
    "resolved_by": "Rachel Chen",
    "resolved_at": "2026-05-09T10:20:00.000Z",
    "action": "ibr_entered",            // 'ibr_entered' | 'acknowledged' | 'not_applicable'
    "note": "Using 5.2% IBR per treasury Q2 guidance"
  }
  // ... one entry per resolved flag
}
```

---

### `field_edits`

Normalised log of every field correction — one row per edit event. Complements `analyses.field_edits_json` (which stores the latest state) with a full immutable history. Required for PCAOB AS 1105 audit trail.

```sql
CREATE TABLE field_edits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id      uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),

  field_key        text NOT NULL,        -- e.g. 'annual_payment_usd'
  original_value   text,                 -- stringified; null if field was empty
  corrected_value  text NOT NULL,
  confidence       numeric(4,3),         -- AI confidence at time of edit (0–1.0)
  source_clause    text,                 -- e.g. '§5.1'
  edited_by        text NOT NULL         -- analyst display name
);
```

**Indexes:**
```sql
CREATE INDEX field_edits_analysis_id_idx ON field_edits (analysis_id);
CREATE INDEX field_edits_account_id_idx  ON field_edits (account_id);
```

**RLS:**
```sql
ALTER TABLE field_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_edits: own rows only"
  ON field_edits FOR ALL
  USING (account_id = auth.uid());
```

> **Why both `field_edits` and `analyses.field_edits_json`?**  
> `field_edits_json` on `analyses` is the current state — fast to read and render.  
> `field_edits` is the immutable event log — required for PCAOB AS 1105 (auditors need to see every change, not just the latest value).

---

### `approvals`

CFO / GC sign-off token and result. One row created per approval request (Task 7, J10). The approval link in the email is `/approve?token=<token>` — no LegalGraph login required for the approver.

```sql
CREATE TABLE approvals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id      uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Approver identity (entered by Rachel when sending request)
  approver_email   text NOT NULL,
  approver_name    text,

  -- Token (single-use, time-limited)
  token            uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),

  -- Resolution
  status           text NOT NULL DEFAULT 'pending',
  -- 'pending'  — email sent, not yet actioned
  -- 'approved' — approver clicked Approve
  -- 'expired'  — token_expires_at passed without action
  approved_at      timestamptz,
  comment          text          -- optional approver note
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX approvals_token_idx       ON approvals (token);
CREATE INDEX        approvals_analysis_id_idx ON approvals (analysis_id);
CREATE INDEX        approvals_account_id_idx  ON approvals (account_id);
```

**RLS:**
```sql
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Rachel can read/create approval requests for her own analyses
CREATE POLICY "approvals: own account"
  ON approvals FOR ALL
  USING (account_id = auth.uid());

-- Approver uses the token endpoint via Edge Function (service role) — no RLS bypass on frontend
```

> **Token expiry enforcement:** A Supabase Edge Function handles the `/approve?token=<token>` route. It verifies `token_expires_at > now()` and `status = 'pending'` before writing `approved_at`. If expired, it returns a friendly "this link has expired — ask Rachel to resend" page. The 72-hour window is configurable (Open Question #5).

---

### `account_settings`

One row per account. Stores company-level IBR for carry-forward (Task 10) and any future account-wide preferences.

```sql
CREATE TABLE account_settings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- Company-level IBR (Task 10 — J9 carry-forward)
  ibr_rate         numeric(6,4),     -- e.g. 0.0520 = 5.20%
  ibr_method       text,             -- free-text methodology description
  ibr_updated_at   timestamptz,      -- when the IBR was last confirmed
  ibr_quarter      text,             -- 'Q2-2026' — used to detect cross-quarter carry-forward

  -- Future: other account-level settings (standard preference, analyst name default, etc.)
  settings_json    jsonb DEFAULT '{}'::jsonb
);
```

**Trigger — auto-update `updated_at`:**
```sql
CREATE TRIGGER account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**RLS:**
```sql
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "account_settings: own row only"
  ON account_settings FOR ALL
  USING (account_id = auth.uid());
```

---

### `contract_playbook`

Pre-existing table. Read by the n8n `contract_playbook_agent` to fetch extraction rules for a given contract type. Not written from the frontend in MVP.

```sql
-- Verified schema (confirmed via information_schema.columns 2026-05-10)
CREATE TABLE contract_playbook (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type        text NOT NULL,             -- 'NDA' | 'MSA' | 'LEASE'
  key_term_name        text NOT NULL,             -- snake_case field key, e.g. 'commencement_date'
  key_term_label       text NOT NULL,             -- human-readable label, e.g. 'Commencement Date'
  key_term_description text NOT NULL,             -- extraction guidance for the AI agent
  risk_weight          integer NOT NULL,          -- 1–10; higher = more critical for risk scoring
  created_at           timestamptz NOT NULL DEFAULT now()
);
```

**LEASE rows (IFRS 16 fields — added 2026-05-10):**

```sql
INSERT INTO contract_playbook (contract_type, key_term_name, key_term_label, key_term_description, risk_weight) VALUES
('LEASE', 'commencement_date',  'Commencement Date',   'The date the lease term begins. Required for IFRS 16 lease term calculation and ROU asset recognition.', 10),
('LEASE', 'expiry_date',        'Expiry Date',         'The date the lease term ends. Required to compute remaining term and lease liability schedule.', 10),
('LEASE', 'annual_payment',     'Annual Payment',      'Total annual lease payment amount. Required for present value calculation of lease liability under IFRS 16 §26.', 10),
('LEASE', 'discount_rate',      'Discount Rate (IBR)', 'The interest rate implicit in the lease or the lessee incremental borrowing rate. Required to discount future lease payments. If not in contract, must be entered manually.', 10),
('LEASE', 'escalation_rate',    'Escalation Rate',     'Annual rent escalation percentage or formula. Affects the lease payment schedule and liability calculation.', 7),
('LEASE', 'renewal_options',    'Renewal Options',     'Any options to extend the lease term. IFRS 16 §19 requires assessment of whether renewal is reasonably certain.', 8),
('LEASE', 'termination_rights', 'Termination Rights',  'Conditions under which either party may terminate the lease early. Determines the non-cancellable period under IFRS 16.B34.', 8),
('LEASE', 'security_deposit',   'Security Deposit',    'Deposit held by the lessor. May need classification as a lease incentive receivable depending on refund terms.', 5),
('LEASE', 'rou_asset_scope',    'ROU Asset Scope',     'Description of the underlying asset (premises, equipment). Defines the right-of-use asset to be recognised on the balance sheet.', 6),
('LEASE', 'governing_law',      'Governing Law',       'Jurisdiction whose laws govern the lease agreement. Relevant for cross-border lease accounting treatment.', 3);
```

> **Note:** The `fetch_playbook` n8n node queries this table filtered by `contract_type`. Each row is one extractable field. The `key_term_description` is the primary signal the `key_term_extraction_agent` uses to locate and extract the value from the contract text.

---

## Status Computation

`analyses.status` is set on every write (insert or update) by the application layer, not a database trigger. This keeps the logic in one place (the Supabase client code) and avoids trigger complexity.

```
status = 'approved'         if approval_id IS NOT NULL and approvals.status = 'approved'
status = 'ready'            if all High flags in analysis_json.risk_flags are present in flags_resolved
status = 'needs_attention'  if ≥1 High flag in analysis_json.risk_flags is NOT in flags_resolved
status = 'pending'          if analysis_json IS NULL
```

**Dashboard counter query (Task 5):**
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'ready' OR status = 'approved') AS ready_count,
  COUNT(*) FILTER (WHERE status = 'needs_attention')               AS needs_attention_count,
  COUNT(*) FILTER (WHERE status = 'pending')                       AS pending_count
FROM analyses
WHERE account_id = auth.uid();
```

---

## IBR Carry-Forward Logic (Task 10)

On loading a new analysis, the frontend:
1. Reads `account_settings.ibr_rate` and `ibr_quarter` for the current account
2. If `ibr_rate` is set AND `ibr_quarter` = current quarter → pre-populate input with "Suggested: X% (used this quarter)"
3. If `ibr_rate` is set AND `ibr_quarter` ≠ current quarter → pre-populate with "You used X% last quarter — confirm the rate is still appropriate"
4. User must explicitly save to confirm — carry-forward is never auto-applied

On save, write both to `analyses.ibr_rate` (lease-specific) and `account_settings.ibr_rate` (company default, updated quarterly).

---

## PCAOB AS 1105 Audit Trail

The combination of `analyses` + `field_edits` + `approvals` satisfies the PCAOB AS 1105 documentation requirements:

| Requirement | Satisfied by |
|---|---|
| AI model name and version | `analyses.analysis_json.model` + `pipeline_version` |
| Extraction timestamp | `analyses.created_at` |
| Human review sign-off | `analyses.analyst_name` + `analyses.updated_at` |
| Per-field data lineage | `analyses.analysis_json.fields[key].source_clause` + `source_text` |
| Manual correction log (immutable) | `field_edits` table — one row per edit |
| Internal approval (J10) | `approvals.approved_at` + `approver_name` + `comment` |
| Flag resolution evidence | `analyses.flags_resolved[flag_id].action` + `note` + `resolved_at` |

---

## Migration Order

Apply in this sequence (each depends on the previous):

```
1. accounts                 — no dependencies
2. contract_playbook        — no dependencies (already exists — verify schema)
3. account_settings         — depends on accounts
4. analyses                 — depends on accounts (approval_id FK added in step 6)
5. field_edits              — depends on analyses + accounts
6. approvals                — depends on analyses + accounts
7. ALTER analyses ADD COLUMN approval_id uuid REFERENCES approvals(id)
```

> Step 7 adds the FK after `approvals` is created to avoid a circular dependency at table creation time.

---

## n8n Webhook Upload Contract

The frontend sends lease documents to n8n as `multipart/form-data` (browser `FormData`). No `Content-Type` header is set manually — the browser auto-sets it with the correct boundary.

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `file` | binary | Raw file bytes — n8n receives this as `binary.file` (required by Extract from File node) |
| `file_name` | string | Original filename, e.g. `office-lease-2024.pdf` |
| `file_type` | string | MIME type, e.g. `application/pdf` (or `application/octet-stream` fallback) |
| `standard` | string | Always `IFRS16` in current version |
| `intent` | string | e.g. `ifrs16_compliance` — passed through to the Orchestrator Agent prompt |
| `analyzed_at` | string | ISO 8601 timestamp set by the frontend at submission time |

The `file` field name must be exactly `file` — the Extract from File node in n8n is configured with `binaryPropertyName: "file"`.

**Supported file types:** `.pdf`, `.doc`, `.docx`, `.txt` (validated client-side; max 50 MB).  
**Note:** The Extract from File node's PDF mode (`operation: "pdf"`) only processes PDF files. Other types pass through as text.

---

## Frontend Client Setup (`src/utils/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Helper — get current account_id from Supabase Auth session
export async function getAccountId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}
```

**Never use the service role key on the frontend.** The Supabase anon key + RLS enforces data isolation. The service role key is only used in Supabase Edge Functions (e.g. the `/approve` token handler for J10).

---

## Open Questions Affecting This Model

| # | Question | Impact |
|---|---|---|
| OQ #3 | Does GDPR require per-analysis consent or is session-level sufficient? | If session-level: add `session_consent_at` to `analyses`; if per-analysis: no schema change needed |
| OQ #5 | Should the approver token expire after 72 hours? | Default is 72h in this model; change `interval '72 hours'` in `approvals` DDL |
| — | Auth strategy: magic link only, or email+password? | Determines whether `accounts.email` is also the auth user ID or a separate field |

---

*Data Model Owner: Engineering · Reviewed by: PM · Version: 1.0 · 2026-05-09*
