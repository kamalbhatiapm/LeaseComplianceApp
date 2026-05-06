# Frontend Architecture
**LegalGraph SPA — `APP.html`**
**Last updated: 2026-05-05**

---

## Current State

A single-file HTML/CSS/JS SPA served from Netlify. No framework, no bundler, no persistent storage. All UI state lives in the DOM and is lost on page refresh.

```mermaid
flowchart TD
    subgraph Build["Build (build.sh + Netlify)"]
        SRC["APP.html\n(placeholders)"]
        ENV["Netlify env vars\nWEBHOOK_URL\nSUPABASE_URL*\nSUPABASE_ANON_KEY*"]
        DIST["dist/index.html\n(substituted)"]
        SRC -->|"sed substitution"| DIST
        ENV -->|"injected at build"| DIST
    end

    subgraph Browser["Browser (single session, no persistence)"]
        direction TB

        subgraph Router["SPA Router"]
            S1["Screen 1\nDashboard\n(static lease table)"]
            S2["Screen 2\nLease Analysis\n(upload → results)"]
            S3["Screen 3\nPlaybooks\n(IFRS 16 fields, read-only)"]
            SHOW["showScreen(n)\ntoggles .active\nupdates aria-current"]
        end

        subgraph UploadFlow["Upload Flow"]
            FILE["File input\nonchange → onFileSelected()"]
            CONSENT["Consent modal\nshowConsentModal()"]
            ANALYZE["handleAnalyzeClick()\n→ grantConsent()\n→ runAnalysis()"]
        end

        subgraph Analysis["Analysis Pipeline"]
            LOCK["setNavLocked(true)"]
            PROG["setProgress()\nanimateStep()\n4-step progress panel"]
            FETCH["fetch(WEBHOOK_URL)\nAbortController 30s timeout\nPOST: filename, filesize,\nfiletype, timestamp"]
            BADGE["setDataBadge()\nLive / Demo fallback"]
            RENDER["renderResults(data)\n→ renderMetrics()\n→ renderTermsGrid()\n→ renderRiskFlags()"]
            GATE["updateReportGate()\nblocks export if\nHigh flags unresolved\nor sign-off empty"]
            UNLOCK["setNavLocked(false)"]
        end

        subgraph Tracking["Event Tracking (stub only)"]
            TRACK["track(event, props)\n→ console.debug only\nno real destination"]
        end

        subgraph State["In-memory State (lost on refresh ⚠️)"]
            DOM["DOM only\nNo localStorage\nNo Supabase reads/writes\nNo session identity"]
        end

        FILE --> CONSENT --> ANALYZE
        ANALYZE --> LOCK --> PROG --> FETCH
        FETCH -->|"200 OK"| BADGE
        FETCH -->|"timeout / error"| BADGE
        BADGE --> RENDER --> GATE --> UNLOCK
        RENDER -.-> TRACK
        GATE -.-> TRACK
    end

    DIST --> Browser
```

### Current State — Key Gaps

| Gap | Bug | Impact |
|-----|-----|--------|
| No persistent storage | BUG-009 | Page refresh destroys all extraction results |
| No document text sent to n8n | — | n8n can only return demo data, not real extraction |
| No PDF viewer on clause citations | BUG-006 | Auditors cannot verify source clauses — hard blocker |
| Event tracking is stubs only | — | Cannot measure time-to-report or activation metrics |
| No auth / session identity | — | Multi-account isolation impossible; `account_id` never sent |
| Static lease dashboard | — | Screen 1 shows hardcoded rows, not real data |
| `SUPABASE_URL` + `SUPABASE_ANON_KEY` injected but never used | BUG-009 | Credentials are wired but no Supabase client instantiated |

---

## Beta Target State

Adds persistence, real document text extraction, a PDF clause viewer, wired event tracking, and Supabase auth. The single-file HTML structure is preserved — all additions are library includes and JS blocks within `APP.html`.

```mermaid
flowchart TD
    subgraph Build["Build (build.sh + Netlify)"]
        SRC2["APP.html\n(placeholders)"]
        ENV2["Netlify env vars\nWEBHOOK_URL\nSUPABASE_URL ✅\nSUPABASE_ANON_KEY ✅"]
        DIST2["dist/index.html\n(substituted)"]
        SRC2 -->|"sed substitution"| DIST2
        ENV2 -->|"injected at build"| DIST2
    end

    subgraph Browser2["Browser (Beta target)"]
        direction TB

        subgraph Auth["Auth Layer (NEW)"]
            SUPA_AUTH["Supabase Auth\nmagic link / email\nreturns account_id + JWT"]
            SESSION["session_id = UUID per run\naccount_id = from Supabase session"]
        end

        subgraph DocExtract["Document Extraction (NEW)"]
            PDFJS["PDF.js\nextracts plain text from PDF"]
            MAMMOTH["mammoth.js\nextracts plain text from DOCX"]
            TEXTCAP["Cap at 100k chars\nadd [TRUNCATED] marker"]
        end

        subgraph UploadFlow2["Upload Flow"]
            FILE2["File input → onFileSelected()"]
            CONSENT2["Consent modal"]
            EXTRACT_TEXT["Extract document_text\nclient-side before webhook call"]
            ANALYZE2["runAnalysis()"]
        end

        subgraph Analysis2["Analysis Pipeline"]
            LOCK2["setNavLocked(true)"]
            PROG2["setProgress() — 5 steps\n(adds text extraction step)"]
            FETCH2["fetch(WEBHOOK_URL)\nPOST: session_id, account_id,\nstandard, filename, filesize,\nfiletype, timestamp,\ndocument_text ✅"]
            BADGE2["setDataBadge()\nLive / Demo / Partial"]
            RENDER2["renderResults(data)\n+ confidence indicators\n+ terms_missing section\n+ partial banner if status=partial"]
            GATE2["updateReportGate()"]
            UNLOCK2["setNavLocked(false)"]
        end

        subgraph ClauseViewer["Clause PDF Viewer (NEW — BUG-006)"]
            PDF_MODAL["PDF viewer modal\nopens on clause citation click\nhighlights referenced page/section\nvia clause_ref from n8n response"]
        end

        subgraph Persistence["Persistence Layer (NEW — BUG-009)"]
            SUPA_DB["Supabase DB\nsave extraction results per session\nload on page refresh\nmulti-lease dashboard driven by real rows"]
        end

        subgraph Tracking2["Event Tracking (wired)"]
            TRACK2["track(event, props)\n→ analytics destination\nupload_started, analysis_complete,\nflag_resolved, report_exported"]
        end

        FILE2 --> EXTRACT_TEXT --> CONSENT2 --> ANALYZE2
        SUPA_AUTH --> SESSION --> FETCH2
        EXTRACT_TEXT --> FETCH2
        ANALYZE2 --> LOCK2 --> PROG2 --> FETCH2
        FETCH2 -->|"200 + status:ok/partial"| BADGE2
        FETCH2 -->|"error envelope"| BADGE2
        BADGE2 --> RENDER2 --> GATE2 --> UNLOCK2
        RENDER2 -->|"clause_ref clicks"| PDF_MODAL
        RENDER2 --> SUPA_DB
        SUPA_DB -.->|"load on refresh"| RENDER2
        RENDER2 -.-> TRACK2
        GATE2 -.-> TRACK2
    end

    DIST2 --> Browser2
```

### Beta Target — Changes Required

| Change | Addresses | Priority |
|--------|-----------|----------|
| Add Supabase JS client; write extraction results to DB | BUG-009 | P0 — Beta entry |
| Add PDF.js + mammoth.js; extract `document_text` before webhook call | Phase 2 backend plan | P0 — Beta milestone |
| Build PDF viewer modal wired to `clause_ref` | BUG-006 | P0 — Beta entry (per PM review) |
| Wire `track()` to real analytics destination | Metric collection | P0 — Beta entry |
| Add Supabase Auth; pass `session_id` + `account_id` in request | Backend plan Phase 1 | P1 — Beta milestone |
| Drive Screen 1 lease table from Supabase rows | Dashboard gap | P1 — Beta milestone |
| Render `confidence` indicators and `terms_missing` section | Backend plan Phase 1 | P1 — Beta milestone |

---

## Data Flow Summary

### Current
```
User uploads file
  → consent modal
  → POST {filename, filesize, filetype, timestamp} to n8n
  → n8n returns demo/mock JSON (no real extraction)
  → render results in DOM
  → results lost on page refresh
```

### Beta Target
```
User uploads file
  → PDF.js / mammoth.js extracts document_text client-side
  → consent modal
  → Supabase Auth resolves account_id + new session_id
  → POST {session_id, account_id, standard, ..., document_text} to n8n
  → n8n runs real Claude extraction, returns terms + confidence + clause_ref
  → render results; save to Supabase
  → clause citation click → PDF viewer modal at referenced page
  → results survive page refresh (loaded from Supabase)
  → all events emitted to analytics
```
