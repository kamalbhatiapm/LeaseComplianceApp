# n8n Payload Upgrade Plan
**Version 1.0 | Date: 2026-05-04**
**Owner: Engineering / AI**
**Target: GA entry (must be complete before 2026-07-14)**

---

## Context

The current n8n webhook integration uses a minimal JSON payload that was designed for the sample-contract demo. As we move to Beta and GA — with real customer contracts, per-field confidence scores, and auditor-facing reports — the payload schema needs to evolve in three directions:

1. **Richer extraction output** the UI can display without guessing
2. **Per-field confidence scores** to power L2 diagnostic metrics
3. **Structured error envelopes** so the UI can show actionable failure messages instead of a generic fallback

This document defines the target schema, migration path, and backwards-compatibility rules.

---

## Current Schema (as-is)

### Request payload (frontend → n8n)

```json
{
  "filename": "lease-agreement.pdf",
  "filesize": 204800,
  "filetype": "pdf",
  "timestamp": "2026-05-04T10:23:00Z"
}
```

**Problems:**
- No contract content sent — n8n cannot extract anything without the document text or a storage reference
- No standard field to signal which accounting standard to use (IFRS 16 vs ASC 842)
- No session or account identifier for per-account analytics

### Response payload (n8n → frontend)

```json
{
  "risk_score": 72,
  "flags": [
    { "id": "discount-rate", "label": "Discount rate missing", "severity": "high" }
  ],
  "terms_found": [
    { "field": "commencement_date", "value": "2021-01-01" }
  ]
}
```

**Problems:**
- No `confidence` per field — UI cannot distinguish "extracted with 0.97 confidence" from "guessed"
- `severity` has no standard values documented — UI and n8n can drift
- No `clause_ref` per term — clause-level audit trail (`BUG-006` PDF viewer) cannot be wired
- No `missing_fields` list — UI has to infer from absent keys
- No error envelope — network and extraction failures look identical to the UI

---

## Target Schema (to-be)

### Request payload (frontend → n8n)

```json
{
  "session_id": "uuid-v4",
  "account_id": "acct_abc123",
  "standard": "IFRS16",
  "filename": "lease-agreement.pdf",
  "filesize": 204800,
  "filetype": "pdf",
  "timestamp": "2026-05-04T10:23:00Z",
  "document_text": "<extracted plain text of the contract, max 100k chars>",
  "document_storage_ref": "supabase://contracts/acct_abc123/uuid.pdf"
}
```

**Field notes:**
- `session_id` — UUID generated client-side per analysis run; links request to event tracking
- `account_id` — from Supabase auth session; used for per-account metrics and storage isolation
- `standard` — `"IFRS16"` or `"ASC842"`; controls which fields n8n extracts and validates
- `document_text` — plain-text extracted from the PDF/DOCX client-side (using PDF.js or pdfmake); n8n uses this for extraction without needing to fetch from storage
- `document_storage_ref` — Supabase path for the original file; used for clause-reference PDF viewer

### Response payload (n8n → frontend)

```json
{
  "session_id": "uuid-v4",
  "status": "ok",
  "standard": "IFRS16",
  "risk_score": 72,
  "extraction_model": "claude-sonnet-4-6",
  "extracted_at": "2026-05-04T10:23:05Z",
  "terms_found": [
    {
      "field": "commencement_date",
      "label": "Commencement Date",
      "value": "2021-01-01",
      "confidence": 0.97,
      "clause_ref": {
        "page": 3,
        "section": "2.1",
        "text_excerpt": "The lease shall commence on 1 January 2021"
      }
    }
  ],
  "terms_missing": [
    {
      "field": "discount_rate",
      "label": "Discount Rate",
      "reason": "not_in_contract",
      "guidance": "Supply the Incremental Borrowing Rate (IBR) manually per IFRS 16.26"
    }
  ],
  "flags": [
    {
      "id": "discount-rate-missing",
      "label": "Discount rate not found in contract",
      "severity": "high",
      "category": "missing_field",
      "guidance": "Per IFRS 16.26, a discount rate is required. Enter your IBR in the terms panel.",
      "clause_ref": null
    },
    {
      "id": "renewal-option-present",
      "label": "Renewal option may extend lease term",
      "severity": "medium",
      "category": "lease_modification",
      "guidance": "Assess whether renewal is reasonably certain under IFRS 16.19.",
      "clause_ref": {
        "page": 7,
        "section": "5.3",
        "text_excerpt": "Tenant may renew for an additional 5-year term with 6 months written notice"
      }
    }
  ],
  "metadata": {
    "word_count": 4820,
    "pages_detected": 12,
    "lease_type_detected": "property",
    "jurisdiction_detected": "UK",
    "complex_structure_flags": []
  }
}
```

**Error envelope (returned when status ≠ ok):**

```json
{
  "session_id": "uuid-v4",
  "status": "error",
  "error_code": "extraction_failed",
  "error_message": "Claude API returned an empty response after 3 retries",
  "retryable": true
}
```

---

## Field Definitions

### `terms_found[].field` — canonical field names

| Field | IFRS 16 ref | ASC 842 ref |
|-------|-------------|-------------|
| `commencement_date` | 16.13 | 842-20-30 |
| `lease_term` | 16.19 | 842-20-30 |
| `renewal_options` | 16.19 | 842-20-30 |
| `payment_schedule` | 16.26 | 842-20-30 |
| `discount_rate` | 16.26 | 842-20-30 |
| `rou_asset_value` | 16.23 | 842-20-30 |
| `lease_incentives` | 16.24 | 842-20-30 |
| `variable_lease_payments` | 16.38 | 842-20-31 |
| `sublease_income` | 16.77 | 842-20-35 |

### `flags[].severity` — canonical values

| Value | Meaning |
|-------|---------|
| `high` | Blocks report generation — user must sign off |
| `medium` | Advisory — should be reviewed before submission |
| `low` | Informational — no action required |

### `flags[].category` — canonical values

| Value | Description |
|-------|-------------|
| `missing_field` | A required field was not found in the contract |
| `lease_modification` | Contract contains a clause that may change lease classification |
| `measurement_uncertainty` | Extracted value has confidence < 0.85 |
| `jurisdiction_risk` | Jurisdiction-specific rules may apply that n8n cannot validate |
| `data_quality` | Extraction returned an implausible value (e.g. negative rent) |

### `status` — canonical values

| Value | Meaning |
|-------|---------|
| `ok` | Extraction completed; results are usable |
| `partial` | Extraction completed but confidence < 0.85 on ≥3 fields |
| `error` | Extraction failed; error envelope is populated |

### `error_code` — canonical values

| Code | Cause | Retryable |
|------|-------|-----------|
| `extraction_failed` | Claude API returned empty or malformed response | Yes |
| `document_too_large` | Document text exceeds 100k char limit | No |
| `unsupported_structure` | Sublease, variable-rent, or non-property lease detected | No |
| `timeout` | n8n workflow exceeded 30s execution limit | Yes |
| `invalid_standard` | `standard` field not recognized | No |

---

## Migration Path

### Phase 1 — Backwards-compatible additions (Beta, by 2026-06-02)

**Request:** Add `session_id`, `account_id`, `standard`. Leave `document_text` optional — n8n falls back to demo extraction if absent.

**Response:** Add `confidence` and `clause_ref` to `terms_found`. Add `terms_missing`. Add `status` field. Existing `risk_score`, `flags`, `terms_found` structure unchanged.

**Frontend changes needed:**
- Generate `session_id` (UUID) per analysis run and include in request
- Read `confidence` from each term — display low-confidence indicator (< 0.85) in terms panel
- Read `terms_missing` — render in a "Missing Fields" section below the terms grid
- Read `status` — if `"partial"`, show a yellow banner: "Some fields were extracted with low confidence"

**n8n changes needed:**
- Add `confidence` score (0–1) to each extracted field in the response
- Populate `clause_ref` where page/section can be identified
- Add `terms_missing` array for fields not found
- Add top-level `status` field

### Phase 2 — Document text extraction (Beta milestone, by 2026-07-07)

**Request:** Add `document_text` — extracted client-side from the uploaded file.

**Frontend changes needed:**
- Integrate PDF.js (for PDFs) and mammoth.js (for DOCX) to extract plain text before sending to n8n
- Cap at 100k characters with a `[TRUNCATED]` marker
- Show extraction error if text extraction fails before webhook call

**n8n changes needed:**
- Use `document_text` for actual Claude extraction instead of demo data
- Remove demo-data fallback once text is reliably present

### Phase 3 — Error envelope + clause PDF viewer (GA, by 2026-07-14)

**Response:** Add structured error envelope. Add `metadata` block. Populate `clause_ref` reliably for all high/medium flags.

**Frontend changes needed:**
- On `status: "error"`, show the `error_message` in the toast instead of the generic "webhook unavailable" message
- Wire `clause_ref` to the PDF viewer (BUG-006) — clicking a citation opens the PDF at the referenced page/section
- Render `metadata.complex_structure_flags` as a warning banner if non-empty

**n8n changes needed:**
- Return structured error envelope on failure
- Populate `metadata` block (word count, pages, lease type, jurisdiction)
- Populate `complex_structure_flags` for subleases, variable rents, multi-party structures

---

## Backwards Compatibility Rules

1. **Frontend is the consumer** — n8n must not remove fields the frontend currently reads (`risk_score`, `flags[].id`, `flags[].label`, `flags[].severity`, `terms_found[].field`, `terms_found[].value`)
2. **Additive only through Beta** — Phase 1 and 2 changes add new fields; no existing field is renamed or removed
3. **`confidence` defaults to `1.0`** if n8n cannot compute it — do not omit the field
4. **`clause_ref` may be `null`** — frontend must handle null gracefully (no crash if PDF viewer is not wired)
5. **`status` defaults to `"ok"`** for any response that returns `risk_score` — n8n must not break old clients that don't read `status`

---

## Testing Checkpoints

| Checkpoint | Owner | Date |
|-----------|-------|------|
| Phase 1 schema agreed and n8n dev branch live | Engineering / AI | 2026-05-21 |
| Frontend reads `confidence` and `terms_missing` | Engineering | 2026-06-09 |
| Document text extraction working client-side (PDF + DOCX) | Engineering | 2026-06-23 |
| n8n using real Claude extraction on `document_text` | AI | 2026-07-07 |
| Error envelope wired in frontend toast | Engineering | 2026-07-14 |
| `clause_ref` wired to PDF viewer (BUG-006 resolved) | Engineering | 2026-07-14 |
| Extraction benchmarked on ≥20 real contracts | AI | 2026-07-14 |

---

*Owner: Engineering · Reviewed by: AI, Product · Last updated: 2026-05-04*
