# Backend Architecture
**LegalGraph n8n Pipeline**
**Last updated: 2026-05-05**

---

## Current State

The backend is a single n8n cloud webhook. The frontend POSTs file metadata only — no document content is transmitted. n8n returns hardcoded demo JSON. No real AI extraction runs against the uploaded file.

```mermaid
flowchart LR
    subgraph Client["Browser (APP.html)"]
        UPLOAD["User uploads file\n(PDF / DOCX / TXT)"]
        REQ["HTTP POST\nWebhook URL\n\nPayload:\n{\n  filename,\n  filesize,\n  filetype,\n  timestamp\n}"]
        FALLBACK["Demo fallback JSON\n(hardcoded in APP.html)\nshown if webhook fails"]
    end

    subgraph N8N["n8n Cloud (cfalcon.app.n8n.cloud)"]
        HOOK["Webhook trigger\n/webhook/7d90ba9a-..."]
        MOCK["Return mock response\n(no Claude call,\nno document processing)"]
        RESP["Response JSON:\n{\n  risk_score: 72,\n  flags: [...],\n  terms_found: [...]\n}\n\n⚠️ No confidence scores\n⚠️ No clause_ref\n⚠️ No session_id\n⚠️ No error envelope"]
    end

    subgraph Storage["Storage (not used ⚠️)"]
        SUPA["Supabase\n(credentials injected\nbut never written to)"]
    end

    UPLOAD --> REQ --> HOOK --> MOCK --> RESP
    RESP -->|"200 OK"| Client
    REQ -.->|"timeout / error"| FALLBACK
```

### Current State — Key Gaps

| Gap | Impact |
|-----|--------|
| No document content sent to n8n | n8n cannot extract real data — all output is mock |
| No `confidence` scores in response | UI cannot distinguish reliable extractions from guesses |
| No `clause_ref` in response | PDF viewer (BUG-006) cannot be wired; audit trail has no source |
| No `session_id` / `account_id` in request | Per-account analytics and storage isolation impossible |
| No error envelope | UI shows generic "webhook unavailable" on any failure; no retry guidance |
| No `terms_missing` in response | UI cannot show which required fields were not found |
| No Supabase writes | Extraction results not persisted; page refresh = data loss (BUG-009) |
| n8n cold start can exceed 30s | AbortController timeout triggers false "unavailable" errors |

---

## Beta Target State

Three-phase migration (detailed in `BACKEND-PLAN.md`). By Beta start (Phase 1) the schema is enriched additively. By Beta milestone (Phase 2) real Claude extraction runs against `document_text`. Error envelopes and `clause_ref` ship at GA (Phase 3).

```mermaid
flowchart TD
    subgraph Client2["Browser (APP.html — Beta)"]
        UPLOAD2["User uploads file"]
        EXTRACT["PDF.js / mammoth.js\nextracts document_text\nclient-side"]
        REQ2["HTTP POST\nWebhook URL\n\nPayload:\n{\n  session_id,      ← NEW\n  account_id,      ← NEW\n  standard,        ← NEW\n  filename,\n  filesize,\n  filetype,\n  timestamp,\n  document_text    ← NEW Phase 2\n}"]
        FALLBACK2["Demo fallback\n(unchanged)"]
    end

    subgraph N8N2["n8n Cloud — Beta Workflow"]
        direction TB
        HOOK2["Webhook trigger"]

        subgraph Phase1["Phase 1 — Schema enrichment (Beta entry, Jun 2)"]
            P1_RESP["Enrich response:\n+ confidence per term\n+ clause_ref (where available)\n+ terms_missing array\n+ status field\n(risk_score / flags / terms_found unchanged)"]
        end

        subgraph Phase2["Phase 2 — Real extraction (Beta milestone, Jul 7)"]
            P2_PARSE["Receive document_text\nfrom request"]
            P2_CLAUDE["Call Anthropic Claude API\n(claude-sonnet-4-6)\nExtract IFRS 16 / ASC 842 fields\nfrom contract text"]
            P2_SCORE["Score confidence per field\nFlag terms_missing\nSet risk_score from real flags"]
        end

        RESP2["Response JSON:\n{\n  session_id,\n  status: 'ok' | 'partial' | 'error',\n  standard,\n  risk_score,\n  extraction_model,\n  extracted_at,\n  terms_found: [\n    { field, value, confidence, clause_ref }\n  ],\n  terms_missing: [\n    { field, reason, guidance }\n  ],\n  flags: [\n    { id, label, severity,\n      category, guidance, clause_ref }\n  ],\n  metadata: { ... }\n}"]

        HOOK2 --> Phase1 --> Phase2
        P2_PARSE --> P2_CLAUDE --> P2_SCORE
        Phase2 --> RESP2
    end

    subgraph Claude["Anthropic Claude API"]
        CLAUDE_API["claude-sonnet-4-6\nLease field extraction\nIFRS 16 / ASC 842 compliance\nClause citation identification"]
    end

    subgraph Storage2["Supabase (NEW)"]
        direction TB
        AUTH["Auth\nIssues JWT + account_id\nper user session"]
        DB["Database\ncontracts table\nextractions table\nflags table\n(keyed by session_id + account_id)"]
        FILES["File Storage\noriginal contract PDFs\nreferenced by clause_ref\nfor PDF viewer modal"]
    end

    UPLOAD2 --> EXTRACT --> REQ2
    AUTH -->|"account_id + JWT"| REQ2
    REQ2 --> HOOK2
    RESP2 -->|"200 OK"| Client2
    REQ2 -.->|"timeout / network error"| FALLBACK2

    P2_CLAUDE <-->|"Claude API call"| CLAUDE_API

    RESP2 -->|"write extraction results"| DB
    UPLOAD2 -->|"upload original file"| FILES
    DB -.->|"load on page refresh"| Client2
```

### Beta Target — Changes Required per Phase

**Phase 1 — By Beta entry (2026-06-02)**

| Change | Owner |
|--------|-------|
| Add `session_id`, `account_id`, `standard` to request payload | Frontend |
| Add `confidence` (0–1) to each `terms_found` entry | n8n |
| Add `terms_missing` array for fields not in contract | n8n |
| Add `status: ok / partial / error` to response | n8n |
| Add `clause_ref` where page/section can be identified | n8n |
| Frontend renders `confidence` indicators (<0.85 = low-confidence flag) | Frontend |
| Frontend renders `terms_missing` section in results panel | Frontend |

**Phase 2 — By Beta milestone (2026-07-07)**

| Change | Owner |
|--------|-------|
| Add PDF.js (PDF text extraction) to APP.html | Frontend |
| Add mammoth.js (DOCX text extraction) to APP.html | Frontend |
| Send `document_text` in webhook request (capped at 100k chars) | Frontend |
| n8n uses `document_text` to call Claude API for real extraction | n8n / AI |
| Remove demo-data fallback from n8n (keep client-side fallback) | n8n |
| Supabase: write extraction results on every successful run | Frontend |
| Supabase: load last extraction on page load (fixes BUG-009) | Frontend |

**Phase 3 — By GA entry (2026-07-14) — per BACKEND-PLAN.md**

| Change | Owner |
|--------|-------|
| Return structured error envelope on failure | n8n |
| Populate `metadata` block (word count, pages, lease type, jurisdiction) | n8n |
| Populate `complex_structure_flags` for subleases / variable rents | n8n |
| Wire `clause_ref` to PDF viewer modal (resolves BUG-006) | Frontend |
| Show `error_message` from envelope in toast instead of generic text | Frontend |

---

## Payload Evolution Summary

### Request

| Field | Current | Phase 1 | Phase 2 |
|-------|---------|---------|---------|
| `filename` | ✅ | ✅ | ✅ |
| `filesize` | ✅ | ✅ | ✅ |
| `filetype` | ✅ | ✅ | ✅ |
| `timestamp` | ✅ | ✅ | ✅ |
| `session_id` | — | ✅ NEW | ✅ |
| `account_id` | — | ✅ NEW | ✅ |
| `standard` | — | ✅ NEW | ✅ |
| `document_text` | — | — | ✅ NEW |
| `document_storage_ref` | — | — | ✅ NEW |

### Response

| Field | Current | Phase 1 | Phase 2 | Phase 3 |
|-------|---------|---------|---------|---------|
| `risk_score` | ✅ | ✅ | ✅ real | ✅ |
| `flags[].id/label/severity` | ✅ | ✅ | ✅ | ✅ |
| `flags[].category` | — | ✅ NEW | ✅ | ✅ |
| `flags[].clause_ref` | — | partial | ✅ | ✅ |
| `terms_found[].field/value` | ✅ | ✅ | ✅ real | ✅ |
| `terms_found[].confidence` | — | ✅ NEW | ✅ | ✅ |
| `terms_found[].clause_ref` | — | partial | ✅ | ✅ |
| `terms_missing` | — | ✅ NEW | ✅ | ✅ |
| `status` | — | ✅ NEW | ✅ | ✅ |
| `session_id` | — | ✅ NEW | ✅ | ✅ |
| `metadata` | — | — | — | ✅ NEW |
| `error` envelope | — | — | — | ✅ NEW |

---

## Infrastructure

| Component | Current | Beta |
|-----------|---------|------|
| Webhook host | n8n Cloud (cfalcon.app.n8n.cloud) | n8n Cloud (same) |
| AI model | None (mock) | claude-sonnet-4-6 via Anthropic API |
| Database | None | Supabase (Postgres) |
| File storage | None | Supabase Storage |
| Auth | None | Supabase Auth (magic link) |
| Frontend host | Netlify | Netlify (same) |
| Monitoring | None | n8n execution logs + Supabase dashboard |

---

*Owner: Engineering · Reviewed by: AI, Product · Last updated: 2026-05-05*
