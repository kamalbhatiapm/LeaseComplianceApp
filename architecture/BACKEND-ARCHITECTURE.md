# Backend Architecture
**LegalGraph n8n Pipeline**
**Last updated: 2026-05-05**

> Visual diagrams: see [`diagrams/backend-current.png`](diagrams/backend-current.png) and [`diagrams/backend-beta.png`](diagrams/backend-beta.png)

---

## Current State

A real multi-agent AI pipeline running in n8n Cloud. Three OpenAI agents (Orchestrator → contract_playbook_agent → key_term_extraction_agent) share a Simple Memory buffer and a single gpt-5-mini LLM connection. Supabase is actively read for playbook rules but never written to. The pipeline cannot extract real contract data today because the frontend sends a base64-encoded JSON body — not a binary file — so n8n's `Extract from File` node receives `$json.text = undefined` and passes empty context to every downstream agent.

```mermaid
flowchart TD
    subgraph Client["Browser (APP.html)"]
        UPLOAD["User uploads file\n(PDF / DOCX / TXT)"]
        REQ["HTTP POST Content-Type: text/plain\n\n{\n  file_name,\n  file_type,\n  file_content (base64),\n  standard: IFRS16,\n  analyzed_at\n}\n\n⚠️ No intent field\n⚠️ Not a binary attachment\n❌ No session_id / account_id"]
        FALLBACK["MOCK_ANALYSIS fallback\n(hardcoded in APP.html)\nshown when webhook fails\nor returns non-JSON"]
    end

    subgraph N8N["n8n Cloud — Multi-Agent Pipeline"]
        direction TB
        HOOK["Webhook trigger\nReceives POST body"]

        EXTRACT["Extract from File\n(expects binary in 'file' property)\n\n⚠️ MISMATCH: receives base64 JSON\nnot a binary file\n→ $json.text = undefined"]

        ORCH["Orchestrator Agent\ngpt-5-mini via OpenAI\n\nReads:\n• intent from body ← undefined ⚠️\n• file text from Extract node ← undefined ⚠️\n\nDetects intent + contract type\nCalls sub-agents in sequence"]

        subgraph SubAgents["Sub-Agents (gpt-5-mini + Shared Memory)"]
            PLAYBOOK["contract_playbook_agent\nFetches IFRS 16 playbook rules\nfor detected contract type\nfrom Supabase ✅"]
            EXTR_AGENT["key_term_extraction_agent\nExtracts key terms from contract\nusing playbook rules from memory\nReturns structured JSON"]
            MEMORY["Simple Memory\nShared buffer between all agents\nContextWindowLength: 50"]
        end

        RESP["Respond to Webhook\nReturns agent output"]

        HOOK --> EXTRACT --> ORCH
        ORCH --> SubAgents
        PLAYBOOK --> EXTR_AGENT
        MEMORY -.->|"shared context"| ORCH
        MEMORY -.->|"shared context"| PLAYBOOK
        MEMORY -.->|"shared context"| EXTR_AGENT
        SubAgents --> RESP
    end

    subgraph Supabase["Supabase"]
        DB_READ["contract_playbook table\nRead ✅ — playbook rules\nper contract type (NDA / MSA)"]
        DB_WRITE["Extraction results\nNot written ❌\nNo persistence"]
    end

    subgraph OpenAI["OpenAI API"]
        MODEL["gpt-5-mini\nUsed by all three agents:\nOrchestrator + Playbook + Extraction"]
    end

    subgraph RespSchema["Response (schema mismatch)"]
        RESP_BODY["{\n  contract_type,\n  parties: [],\n  effective_date,\n  key_terms: [\n    { label, value }\n  ]\n}\n\n⚠️ No confidence scores\n⚠️ No clause_ref\n⚠️ No risk_score / flags\n⚠️ No error envelope\n⚠️ No status field\n⚠️ Frontend expects {risk_score, flags[], terms_found[]}\n→ falls back to MOCK_ANALYSIS"]
    end

    UPLOAD --> REQ --> HOOK
    REQ -.->|"timeout / error"| FALLBACK
    ORCH <-->|"LLM calls"| MODEL
    PLAYBOOK <-->|"LLM calls"| MODEL
    EXTR_AGENT <-->|"LLM calls"| MODEL
    PLAYBOOK <-->|"fetch rules"| DB_READ
    RESP --> RespSchema
    RespSchema -->|"200 OK"| Client
```

### Current State — Key Gaps

| Gap | Bug | Impact |
|-----|-----|--------|
| **Binary mismatch** — frontend sends base64 JSON, `Extract from File` expects binary `file` property | — | `$json.text = undefined`; all agents work with empty context; extraction produces nothing |
| **No `intent` field** — Orchestrator reads `body.intent` which is never set | — | Orchestrator cannot detect intent; sub-agent routing may produce wrong or empty output |
| **Response schema mismatch** — n8n returns `{contract_type, key_terms[]}`, frontend expects `{risk_score, flags[], terms_found[]}` | — | Frontend falls back to MOCK_ANALYSIS on every successful 200 response |
| No `confidence` scores in response | — | UI cannot distinguish reliable extractions from guesses |
| No `clause_ref` in response | BUG-006 | PDF viewer cannot be wired; audit trail has no source |
| No `session_id` / `account_id` in request | — | Per-account analytics and storage isolation impossible |
| No error envelope | — | UI shows generic error on any failure; no retry guidance |
| No `terms_missing` in response | — | UI cannot show which required fields were not found |
| Supabase never written to | BUG-009 | Extraction results not persisted; page refresh = data loss |

---

## Beta Target State

Fixes the core extraction gap by having the frontend extract `document_text` client-side (PDF.js / mammoth.js) and send it as plain text. n8n reads `document_text` directly — bypassing the broken `Extract from File` node — and the real OpenAI agent pipeline produces genuine extraction output. Response schema is aligned so the frontend renders real results instead of the MOCK_ANALYSIS fallback.

```mermaid
flowchart TD
    subgraph Client2["Browser (APP.html — Beta)"]
        UPLOAD2["User uploads file"]
        EXTRACT_TEXT["PDF.js / mammoth.js ✨\nextracts document_text\nclient-side\n(capped at 100k chars)"]
        AUTH_FE["Supabase Auth ✨\nResolves account_id + JWT"]
        REQ2["HTTP POST Content-Type: application/json ✨\n\n{\n  session_id,      ✨ NEW\n  account_id,      ✨ NEW\n  intent: key_term_extraction, ✨ NEW\n  standard: IFRS16,\n  file_name,\n  file_type,\n  document_text    ✨ NEW — fixes binary mismatch\n}\n\n✅ Binary mismatch resolved\n✅ intent field added"]
        FALLBACK2["MOCK_ANALYSIS fallback\n(unchanged — last resort only)"]
    end

    subgraph N8N2["n8n Cloud — Beta Workflow"]
        direction TB
        HOOK2["Webhook trigger"]

        PARSE_TEXT["Read document_text ✨\nfrom request body directly\n(no Extract from File needed)"]

        ORCH2["Orchestrator Agent\ngpt-5-mini (or Claude ✨)\n\nReads:\n• intent from body ✅\n• document_text ✅\n\nDetects contract type\nCalls sub-agents"]

        subgraph SubAgents2["Sub-Agents"]
            PLAYBOOK2["contract_playbook_agent\nFetches IFRS 16 rules\nfrom Supabase ✅"]
            EXTR2["key_term_extraction_agent\nExtracts terms from real document text\nReturns structured JSON with confidence"]
            MEMORY2["Simple Memory\nShared buffer"]
        end

        RESP2["Respond to Webhook\nReturns aligned schema"]
    end

    subgraph RespSchema2["Response — Beta schema ✨"]
        RESP_BODY2["{\n  contract_type,\n  parties: [],\n  effective_date,\n  key_terms: [\n    { label, value, confidence, clause_ref }\n  ],\n  terms_missing: [],\n  status: ok | partial | error,\n  error_message\n}"]
    end

    subgraph Supabase2["Supabase — Beta"]
        AUTH_DB["Auth ✨\nMagic link login\nIssues JWT + account_id"]
        PLAY_DB2["contract_playbook table\nRead ✅ (unchanged)"]
        RESULTS_DB["Extraction results ✨\nWrite on every successful run\nLoad on page refresh\nFixes BUG-009"]
    end

    subgraph OpenAI2["OpenAI API"]
        MODEL2["gpt-5-mini\n(all agents)"]
    end

    UPLOAD2 --> EXTRACT_TEXT
    AUTH_FE --> REQ2
    EXTRACT_TEXT --> REQ2
    REQ2 --> HOOK2
    HOOK2 --> PARSE_TEXT --> ORCH2
    ORCH2 --> SubAgents2
    PLAYBOOK2 --> EXTR2
    MEMORY2 -.->|"shared context"| ORCH2
    MEMORY2 -.->|"shared context"| PLAYBOOK2
    MEMORY2 -.->|"shared context"| EXTR2
    SubAgents2 --> RESP2
    RESP2 --> RespSchema2
    RespSchema2 -->|"200 OK"| Client2
    REQ2 -.->|"timeout / error"| FALLBACK2
    ORCH2 <-->|"LLM calls"| MODEL2
    PLAYBOOK2 <-->|"LLM calls"| MODEL2
    EXTR2 <-->|"LLM calls"| MODEL2
    PLAYBOOK2 <-->|"fetch rules"| PLAY_DB2
    AUTH_FE <-->|"auth"| AUTH_DB
    RESP2 -->|"write results"| RESULTS_DB
    RESULTS_DB -.->|"load on refresh"| Client2
```

### Beta Target — Changes Required

| Change | Addresses | Priority |
|--------|-----------|----------|
| Frontend extracts `document_text` client-side (PDF.js + mammoth.js); sends as plain text | Binary mismatch | **P0 — fixes core extraction gap** |
| Add `intent: "key_term_extraction"` to POST payload | Missing intent field | **P0 — Beta entry** |
| n8n reads `document_text` from request body (bypass `Extract from File`) | Binary mismatch | **P0 — Beta entry** |
| Align n8n response schema to what frontend expects (or update frontend parser) | Schema mismatch | **P0 — Beta entry** |
| Add `confidence` per term to response | UX / trust | P1 — Beta milestone |
| Add `clause_ref` per term to response | BUG-006 | P1 — Beta milestone |
| Add `terms_missing` array to response | UX | P1 — Beta milestone |
| Add `status: ok / partial / error` to response | Error handling | P1 — Beta milestone |
| Supabase: write extraction results on every successful run | BUG-009 | P1 — Beta milestone |
| Add error envelope to response | Debuggability | P1 — Beta milestone |

---

## Payload Evolution Summary

### Request

| Field | Current | Beta |
|-------|---------|------|
| `file_name` | ✅ | ✅ |
| `file_type` | ✅ | ✅ |
| `file_content` (base64) | ✅ ⚠️ broken | — removed |
| `standard` | ✅ | ✅ |
| `analyzed_at` | ✅ | ✅ |
| `intent` | — missing ⚠️ | ✅ NEW |
| `session_id` | — | ✅ NEW |
| `account_id` | — | ✅ NEW |
| `document_text` | — | ✅ NEW — fixes binary mismatch |

### Response

| Field | Current | Beta |
|-------|---------|------|
| `contract_type` | ✅ | ✅ |
| `parties[]` | ✅ | ✅ |
| `effective_date` | ✅ | ✅ |
| `key_terms[].label/value` | ✅ | ✅ real extraction |
| `key_terms[].confidence` | — | ✅ NEW |
| `key_terms[].clause_ref` | — | ✅ NEW |
| `terms_missing[]` | — | ✅ NEW |
| `status` | — | ✅ NEW |
| `error_message` | — | ✅ NEW |
| `risk_score` / `flags[]` | — (frontend expects but n8n never sends) ⚠️ | TBD |

---

## Infrastructure

| Component | Current | Beta |
|-----------|---------|------|
| Webhook host | n8n Cloud (cfalcon.app.n8n.cloud) | n8n Cloud (same) |
| AI model | gpt-5-mini via OpenAI | gpt-5-mini via OpenAI (Claude stretch goal) |
| Supabase — playbook reads | ✅ Active | ✅ Active (unchanged) |
| Supabase — result writes | ❌ None | ✅ NEW |
| Supabase — auth | ❌ None | ✅ NEW (magic link) |
| File storage | None | Supabase Storage (for PDF viewer) |
| Frontend host | Netlify | Netlify (same) |
| Monitoring | n8n execution logs only | n8n logs + Supabase dashboard |

---

*Owner: Engineering · Reviewed by: AI, Product · Last updated: 2026-05-05*
