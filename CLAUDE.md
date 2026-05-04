# LegalGraph — CLAUDE.md

Product context and working norms for AI-assisted development on this repo.

---

## What this product is

LegalGraph is a lease compliance tool for in-house legal and finance teams. Users upload a lease contract (PDF, DOCX, DOC, TXT) and receive:

1. **AI-extracted lease terms** — commencement/expiry dates, rent, escalation, renewal options, discount rate, ROU asset scope, governing law
2. **IFRS 16 / ASC 842 risk score** — 0–100, with a Low / Medium / High label
3. **Clause-level audit trail** — every extracted field cites the contract clause it came from
4. **IFRS 16 report** — PDF export for auditors (gated behind sign-off and no unresolved High flags)

The AI extraction runs via an n8n webhook. The UI is a single-file HTML/CSS/JS app (`legalgraph-mockups.html`) built and deployed to Netlify.

**Primary user:** Rachel — Compliance Lead, owns quarterly IFRS 16 reporting, currently spends 4–6 hours per lease manually.
**Primary buyer:** Jennifer — General Counsel, cares about audit defensibility and not surprising the CFO.

---

## Repo layout

```
legalgraph-mockups.html   # Source of truth — all UI, CSS, and JS in one file
build.sh                  # Injects env vars (WEBHOOK_URL etc.) via sed → dist/index.html
dist/index.html           # Built output served by Netlify
netlify.toml              # Build config and security headers
prd-lease-compliance-2026-03-31.md  # Full PRD — personas, JTBDs, success metrics
evals/
  hhh-rubric.md           # 21-question human eval rubric (Helpful / Harmless / Honest)
  hhh-results-v1.md       # Baseline scores — 74/105 (HOLD)
  responsible-ai-eval.md  # 28-question RAI framework (7 dimensions)
  responsible-ai-results-v1.md  # RAI v1 scores — 58/112 (52%, HOLD for regulated)
  rai-remediation-plan.md # Which gaps are UI vs. n8n pipeline work
  qa-backlog.md           # 21 bugs; all P0+P1 resolved, 9 P2/P3 open
  run-evals.js            # Automated eval runner against the webhook
  cases/                  # Sample lease JSON for eval runs
sample-lease-agreement.docx  # Test contract (SF HQ, Floor 12, 7-year lease)
```

---

## Build and deploy

**Local preview** (reads from `dist/`, no rebuild needed for HTML-only changes):
```bash
cp legalgraph-mockups.html dist/index.html
npx serve dist/
```

**Netlify deploy** requires `WEBHOOK_URL` env var set in Netlify dashboard. `build.sh` will fail fast if it is missing. Do not commit the webhook URL to source — it is injected at build time via `sed`.

**Branch:** all work happens on `feat/lease-compliance-app`. PRs target `main`.

---

## Design system

- **Colors:** Navy + Teal palette. `--brand` (#1B4FD8) for interactive elements; `--accent` (#0D9488 / #5EEAD4) for highlights, stats, progress. Semantic colors (amber/red/green) are reserved for risk signals — do not repurpose them as brand accents.
- **Icons:** Lucide SVG (`lucide.createIcons()`) — 14px / 1.75px stroke throughout. Never use emoji as icons. Always call `lucide.createIcons({ nodes: [container] })` after injecting dynamic HTML with `data-lucide` attributes.
- **Hero gradient:** `#0F1923 → #0D2B3E → #0A3A3A` (dark navy to dark teal).
- **Typography:** Helvetica Neue / Arial, no custom font imports.
- **Radius:** `--radius: 8px` for cards; `99px` for pills and progress bars.

---

## Critical UX rules (do not break these)

1. **Never assert compliance.** The product extracts fields and flags risk — it does not verify IFRS 16 compliance. Pills and labels must say "IFRS 16 fields extracted," never "IFRS 16 compliant."
2. **Professional review disclaimer must be visible** on every results view. Current text: *"LegalGraph assists with extraction and risk flagging. Always have a qualified accountant and legal counsel review outputs before booking journal entries or signing financial disclosures."*
3. **Consent modal before analysis.** The consent gate (`showConsentModal()`) must fire before the n8n webhook is called. Do not bypass it.
4. **Generate Report is gated.** The button must remain disabled until: (a) all High-severity risk flags are resolved, and (b) the sign-off fields are filled. This is a legal liability control — do not relax the gate.
5. **Data source badge.** Screen 2 must always show one of: gray "Demo data" (no run), green "Live extraction" (webhook succeeded), amber "Demo fallback" (webhook failed). Users must never mistake placeholder data for real extraction.
6. **Clause citations must match the sample contract.** The DOCX has 15 sections. Any clause reference beyond §15 is wrong. Key mappings: Termination Rights → §9.1, Governing Law → §14.1.

---

## Eval baseline and open gaps

**HHH eval v1:** 74/105 — HOLD. Target: 90/105 before shipping to regulated clients.
**RAI eval v1:** 58/112 (52%) — HOLD for regulated (insurance, banking) clients.

**Open P2 bugs** (no blocker, workaround exists — good PM backlog items):
- BUG-006: Clause reference links open nothing (PDF viewer not yet built)
- BUG-007: No multi-lease batch upload
- BUG-009: No persistent storage — page refresh loses all extraction results
- BUG-012: No real audit trail log with timestamps
- BUG-016: Sign-off fields not validated before enabling report generation

**Open P3 polish:**
- BUG-013: No keyboard accessibility (tab order, ARIA labels)
- BUG-018: No loading skeleton — blank flash before Screen 2 populates
- BUG-021: No empty-state for zero leases in the dashboard table

---

## Product priorities (as of 2026-05-04)

1. **Persistent storage** (BUG-009) — biggest trust gap; page refresh loses everything. Supabase credentials are already wired in `build.sh` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) — schema and client code are the remaining work.
2. **Clause reference links** (BUG-006) — auditors click these; they must go somewhere. Even a PDF viewer modal with a highlight would clear the HHH H2 gap.
3. **HHH re-run** — after the next substantive feature, re-run `evals/run-evals.js` and update `evals/hhh-results.md`. Target 90/105 to unlock regulated-client pilots.
4. **Multi-lease dashboard** — the lease table on Screen 1 is static. Real data from Supabase would make the product usable for Rachel's actual workflow.
5. **PDF report generation** — the "Generate IFRS 16 Report" button is gated but not yet wired. This is the primary output Rachel needs to send to her auditor.

---

## What to ask Claude

Good tasks for this repo:
- "Add Supabase persistence so extraction results survive a page refresh"
- "Wire up the Generate Report button to produce a real PDF from the extracted fields"
- "Build a PDF viewer modal so clause reference links (§9.1 etc.) highlight the relevant paragraph"
- "Add ARIA labels and keyboard tab order to Screen 2"
- "Re-run the HHH eval and update the results file"
- "Add a loading skeleton so Screen 2 doesn't flash blank while populating"
- "Add batch upload so Rachel can queue multiple leases at once"

Avoid asking Claude to:
- Assert IFRS 16 compliance on behalf of the user
- Remove the consent modal or the report generation gate
- Add features that bypass the data source badge (users must always know if they're seeing demo data)
