# Frontend Architecture
**LegalGraph SPA — `APP.html`**
**Last updated: 2026-05-05**

> Visual diagrams: see [`diagrams/frontend-current.png`](diagrams/frontend-current.png) and [`diagrams/frontend-beta.png`](diagrams/frontend-beta.png)

---

## Current State

A single-file HTML/CSS/JS SPA served from Netlify. No framework, no bundler. UI state lives in the DOM and is lost on page refresh. The file is read as base64 before being sent to n8n — but n8n expects a binary attachment, causing a format mismatch.

```mermaid
flowchart TD
    subgraph Build["Build (build.sh + Netlify)"]
        SRC["APP.html (placeholders)"]
        ENV["Netlify env vars\nWEBHOOK_URL\nSUPABASE_URL ⚠️ injected, unused\nSUPABASE_ANON_KEY ⚠️ injected, unused"]
        DIST["dist/index.html (substituted)"]
        SRC -->|"sed substitution"| DIST
        ENV -->|"injected at build"| DIST
    end

    subgraph Browser["Browser — no persistence, no auth"]

        S1["Screen 1 — Dashboard\n(hardcoded static lease table)"]
        S2["Screen 2 — Lease Analysis"]
        S3["Screen 3 — Playbooks (read-only)"]

        FILE["File input → onFileSelected()\nfileToBase64() converts to base64 string"]
        CONSENT["Consent modal — showConsentModal()"]

        ANALYZE["runAnalysis()\nPOST Content-Type: text/plain\n{\n  file_name, file_type,\n  file_content (base64),\n  standard: IFRS16,\n  analyzed_at\n}\n⚠️ No intent field\n⚠️ Not a binary attachment\n❌ No session_id / account_id"]

        PARSE["Parse response\nJSON.parse(text) → if Array take [0]"]
        MOCK["MOCK_ANALYSIS fallback\nhardcoded in APP.html\nshown when webhook times out\nor returns non-JSON"]

        RENDER["renderResults(data)\nTerms grid · Risk flags · Clause citations"]
        GATE["updateReportGate()\nblocks export if High flags unresolved\nor sign-off empty"]
        EXPORT["Export PDF\nButton gated correctly\n❌ PDF not generated"]
        CITATIONS["Clause citations\nlinks render but open nothing\n❌ BUG-006"]
        PERSIST["Persistence\n❌ None — data lost on refresh (BUG-009)"]
        TRACK["track(event, props)\n→ console.debug only\n❌ No real analytics destination"]

        S1 -->|"Upload a lease"| FILE
        FILE --> CONSENT --> ANALYZE
        ANALYZE -->|"200 OK"| PARSE
        ANALYZE -.->|"timeout / error"| MOCK
        PARSE -->|"valid JSON"| RENDER
        PARSE -.->|"non-JSON / empty"| MOCK
        RENDER --> GATE --> EXPORT
        RENDER --> CITATIONS
        RENDER --> PERSIST
        RENDER -.-> TRACK
    end

    DIST --> Browser
```

### Current State — Key Gaps

| Gap | Bug | Impact |
|-----|-----|--------|
| **Binary mismatch** — frontend sends base64 JSON, n8n expects binary file attachment | — | n8n `Extract from File` node fails; `$json.text = undefined`; extraction likely produces empty output |
| **No `intent` field** — n8n orchestrator reads `body.intent` which is never set | — | Orchestrator cannot detect intent; sub-agent routing may fail |
| **Response schema mismatch** — n8n returns `{contract_type, key_terms[]}`, frontend expects `{risk_score, flags[], terms_found[]}` | — | Frontend falls back to MOCK_ANALYSIS even on a 200 response |
| No PDF clause viewer | BUG-006 | Auditors cannot verify source clauses — hard Beta blocker |
| No persistence | BUG-009 | Page refresh destroys all extraction results |
| Supabase credentials injected but client never instantiated | BUG-009 | `SUPABASE_URL` + `SUPABASE_ANON_KEY` are in the build but unused |
| Event tracking stubs only | — | Cannot measure time-to-report or activation metrics |
| No auth / session identity | — | No `account_id` or `session_id` passed to n8n |
| Static lease dashboard | — | Screen 1 shows hardcoded rows, not real data |
| Export PDF not wired | — | Report gate works; PDF generation does not |

---

## Beta Target State

Fixes the binary mismatch by extracting document text client-side and sending as plain text. Adds Supabase auth + persistence, PDF.js/mammoth.js extraction, PDF clause viewer, and wired analytics.

```mermaid
flowchart TD
    subgraph Build["Build (build.sh + Netlify)"]
        SRC2["APP.html (placeholders)"]
        ENV2["Netlify env vars\nWEBHOOK_URL\nSUPABASE_URL ✅ now used\nSUPABASE_ANON_KEY ✅ now used"]
        DIST2["dist/index.html (substituted)"]
        SRC2 -->|"sed substitution"| DIST2
        ENV2 -->|"injected at build"| DIST2
    end

    subgraph Browser2["Browser — Beta target"]

        AUTH["Supabase Auth ✨\nMagic link login\nReturns account_id + JWT"]
        S1B["Screen 1 — Dashboard ✨\nReal lease table from Supabase"]

        FILE2["File input → onFileSelected()"]
        EXTRACT_TEXT["Extract document_text ✨\nPDF.js for PDFs\nmammoth.js for DOCX\nCapped at 100k chars"]
        CONSENT2["Consent modal"]

        ANALYZE2["runAnalysis()\nPOST Content-Type: application/json\n{\n  session_id, account_id,\n  intent: key_term_extraction,\n  standard: IFRS16,\n  file_name, file_type,\n  document_text\n}\n✅ Binary mismatch fixed\n✅ intent field added"]

        PARSE2["Parse response\n+ reads confidence, terms_missing, status"]
        TOAST["Error toast ✨\nShows error_message from envelope"]

        RENDER2["renderResults(data) ✨\n+ confidence indicators per field\n+ terms_missing section\n+ partial banner if status=partial"]
        VIEWER["PDF Clause Viewer ✨\nModal on citation click\nHighlights source clause\nBUG-006 resolved"]
        GATE2["updateReportGate()"]
        EXPORT2["Export PDF ✨\nGenerates real IFRS 16 report"]
        SUPA_DB["Supabase DB ✨\nSave results per session\nLoad on page refresh\nBUG-009 resolved"]
        TRACK2["track(event, props) ✨\nWired to analytics\nupload_started, analysis_complete\nflag_resolved, report_exported"]

        AUTH --> S1B
        S1B -->|"Upload a lease"| FILE2
        FILE2 --> EXTRACT_TEXT --> CONSENT2 --> ANALYZE2
        ANALYZE2 -->|"200 OK"| PARSE2
        ANALYZE2 -.->|"error envelope"| TOAST
        PARSE2 --> RENDER2
        RENDER2 -->|"clause click"| VIEWER
        RENDER2 --> GATE2 --> EXPORT2
        RENDER2 --> SUPA_DB
        SUPA_DB -.->|"load on refresh"| RENDER2
        RENDER2 -.-> TRACK2
    end

    DIST2 --> Browser2
```

### Beta Target — Changes Required

| Change | Addresses | Priority |
|--------|-----------|----------|
| Extract `document_text` client-side (PDF.js + mammoth.js); send as plain text | Binary mismatch | **P0 — fixes core extraction gap** |
| Add `intent: "key_term_extraction"` to POST payload | Missing intent field | **P0 — Beta entry** |
| Align frontend response parser to n8n's actual schema | Response schema mismatch | **P0 — Beta entry** |
| Build PDF viewer modal wired to `clause_ref` | BUG-006 | P0 — Beta entry |
| Instantiate Supabase JS client; write/read extraction results | BUG-009 | P0 — Beta entry |
| Wire `track()` to real analytics destination | Metric collection | P0 — Beta entry |
| Add Supabase Auth; pass `session_id` + `account_id` in request | Identity | P1 — Beta milestone |
| Drive Screen 1 lease table from Supabase rows | Dashboard | P1 — Beta milestone |
| Render `confidence` indicators and `terms_missing` section | UX | P1 — Beta milestone |
| Wire PDF export to real report generation | Export | P0 — Beta entry |

---

## Data Flow Summary

### Current
```
User uploads file
  → fileToBase64() converts file to base64 string
  → consent modal
  → POST {file_name, file_type, file_content (base64), standard, analyzed_at}
    Content-Type: text/plain
    ⚠️ No intent field — n8n orchestrator reads body.intent → undefined
    ⚠️ base64 JSON, not binary — n8n Extract from File fails
  → n8n pipeline runs but with undefined text → likely empty extraction
  → frontend receives {contract_type, key_terms[]} — schema mismatch → falls back to MOCK_ANALYSIS
  → results rendered from hardcoded mock data
  → results lost on page refresh
```

### Beta Target
```
User uploads file
  → PDF.js / mammoth.js extracts plain document_text client-side
  → consent modal
  → Supabase Auth resolves account_id + new session_id generated
  → POST {session_id, account_id, intent, standard, file_name, document_text}
  → n8n reads document_text, runs real extraction via OpenAI agents
  → n8n returns {contract_type, key_terms[], confidence, clause_ref, terms_missing, status}
  → frontend renders real results with confidence indicators
  → results saved to Supabase DB
  → clause citation click → PDF viewer modal at referenced page
  → results survive page refresh (loaded from Supabase)
  → all events emitted to analytics
```
