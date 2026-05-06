# LegalGraph — Jobs to Be Done
**Version 1.0 | Date: 2026-05-06**
**Owner: Product**
**Grounded in: PRD v1.1 · MARKET-RESEARCH.md · USER-RESEARCH.md**
**Framework: Clayton Christensen JTBD — functional, emotional, and social dimensions**

---

## Framing

A Job to Be Done is the progress a person is trying to make in a specific circumstance. LegalGraph is hired to make progress on compliance work that is painful, high-stakes, and time-constrained. Understanding what Rachel "fires" when she "hires" LegalGraph — and what she fires LegalGraph for if it fails her — is the foundation of the product strategy.

---

## The Jobs, Prioritised by Business Impact

| # | Job | Persona | Urgency | Impact if unsolved | LegalGraph status |
|---|-----|---------|---------|-------------------|-------------------|
| J1 | Generate an audit-ready IFRS 16 report before quarter-end | Rachel | **Critical** | Rachel misses deadline or submits unreviewed output | 🔄 Partial — extraction works; PDF export not fully structured |
| J2 | Answer an auditor's clause question without opening the PDF | Rachel | **Critical** | Audit friction; 30–60 min per question manually | 🔄 BUG-006 — clause PDF viewer |
| J3 | Know which leases are ready to report and which still have issues | Rachel | **High** | Rachel has no dashboard-level orientation on what's left to do | ❌ Not built |
| J4 | Trust that AI-extracted fields are accurate enough to submit to an auditor | Rachel | **High** | Rachel spot-checks everything manually; abandons to Excel | 🔄 Partial — edit mode live; confidence scores not yet |
| J5 | See the compliance impact of a new or amended lease immediately | Rachel | **Medium** | Rachel runs a manual reconciliation between uploads | 🔄 GA roadmap — amendment tracking |
| J6 | Approve tooling that reduces audit risk without creating new liability | Jennifer | **High** | Jennifer blocks the purchase | 🔄 Partial — consent modal + disclaimer live; auditor validation pending |
| J7 | Look up a specific lease term in under 2 minutes without running analysis | David | **Medium** | David opens the original PDF and spends 10 minutes searching | ✅ Extracted terms grid serves this |

---

## Detailed JTBD Profiles

---

### J1 — Generate an Audit-Ready IFRS 16 Report Before Quarter-End

**Full statement:**
> When the quarterly IFRS 16 / ASC 842 reporting deadline is approaching and I have 4–12 leases to process, I want to generate a structured compliance report from our contract repository directly — with all material fields extracted, risk flags surfaced, and clause evidence attached — so I can hand audit-ready output to our external auditors without spending 4–6 hours on manual extraction, and without the fear that something important was missed.

**Circumstance:** Quarter-end close, T-7 to T-0 days. Rachel is under deadline pressure.

**Progress she's trying to make:** Go from "raw PDF contracts in a shared drive" to "PDF report my auditor accepts without revision requests" in under 45 minutes.

**What she hires today (and fires when she hires LegalGraph):**
- Excel spreadsheets (manual extraction template, usually built by her predecessor)
- Sticky notes and calendar reminders to track which leases she's done
- Saved PDFs with handwritten annotations on printed paper

**Why she fires Excel:**
1. One wrong formula breaks the entire schedule
2. Auditors ask for clause evidence Excel cannot provide
3. Version conflicts when she shares the file with the CFO for review
4. Takes 20–40 minutes per lease — she can't process 12 leases in a week alongside her other work

**Functional dimension:** Extract, structure, and export IFRS 16 compliance data from contract PDFs with a full audit trail — in under 45 minutes total.

**Emotional dimension:** Feel confident that she hasn't missed anything material. Eliminate the anxiety of "what if I get a call back from the auditor?"

**Social dimension:** Be the person on the finance team who modernised the compliance process. Rachel wants to show Jennifer that she found a better way.

**What makes this job hard:**
- Leases are in different formats, locations, and PDF quality
- Discount rate is almost always missing and requires an external calculation
- Complex clauses (CPI escalation, variable rent, subleases) break standard extraction
- Auditors have high standards — they want clause text, not just figures

**Product requirements this job drives:**
- AI extraction from PDF (live — via n8n pipeline)
- Risk flag surfacing with severity (live)
- High-flag resolution gate before export (live)
- Per-field clause citations (BUG-006 — GA milestone)
- PDF export with cover page, field values, clause trail, flag resolution log (P0 — partially built)
- Analysis completes in <25 seconds for standard leases (target — 25s timeout currently)

**The one metric that tells us this job is done:**
> % of active accounts generating ≥1 IFRS 16 report per quarter that is accepted by the auditor without revision requests.

---

### J2 — Answer an Auditor's Clause Question Without Opening the PDF

**Full statement:**
> When my external auditor asks me "what clause supports the ROU asset value of $2.1M in this filing?", I want to go directly from the line item in my compliance report to the exact clause text in the original contract — so I can reply to the auditor in under 2 minutes with a specific section reference and clause excerpt, rather than spending 30–60 minutes hunting through PDFs.

**Circumstance:** Post-submission audit query, usually during audit fieldwork (January–March for calendar-year reporters).

**What she hires today:**
- "Command + F" in PDF viewer to search for dollar amounts
- Ctrl+F on keywords, then manual scanning to find the right clause
- Emailing the legal team to locate the contract and clause reference for her

**Why this job matters for LegalGraph specifically:**
Competitor reviews confirm this is the #1 praised feature when it works (Trullion: *"go from financial entries directly to the right place in the original contract"*) and the #1 reason auditors accept AI-generated reports — because they can verify the AI's output independently.

Without clause citation, Rachel cannot trust the AI. Without trust, she doesn't submit the AI-generated report. Without submission, LegalGraph generates zero value.

**Functional dimension:** One click from any field in the analysis → source clause text visible, with section number, page reference, and surrounding context.

**Emotional dimension:** Feel confident and prepared when the auditor calls. Not embarrassed or scrambling.

**Social dimension:** Demonstrate to auditors and Jennifer that the compliance process is rigorous, not just fast. "I can show you exactly where every number came from."

**What makes this job hard:**
- PDF clause navigation requires knowing section numbers, which are buried in the document
- Legal language is dense — the relevant clause is rarely the obvious one
- Auditors want the exact text, not a page number alone
- The clause reference must still be accessible months after the analysis was run (persistence requirement)

**Product requirements this job drives:**
- Clause PDF viewer — BUG-006 (hard GA blocker)
- Per-field clause reference visible in extracted terms grid (live — section references shown)
- Tooltip showing first 50 words of clause text before clicking through
- Clause links remain active in historical analyses (persistence — BUG-009)
- "Share with auditor" export that includes clause excerpts inline in the PDF

**The one metric that tells us this job is done:**
> Auditor revision request rate after LegalGraph report submission: target <5%.

---

### J3 — Know Which Leases Are Ready to Report and Which Still Have Issues

**Full statement:**
> When I open LegalGraph at the start of reporting season, I want to see immediately — without clicking into each lease — how many of my leases are ready to export, how many still have unresolved High flags, and which ones need my attention first, so I can triage my work session efficiently and not lose time rediscovering the state of each lease manually.

**Circumstance:** Re-entry after 90 days away. Rachel opens the dashboard under time pressure.

**What she does today:**
Opens the shared Excel tracker to see a color-coded status column she updates manually. Unreliable. Often out of date.

**What the current LegalGraph dashboard shows:**
Portfolio table with status pills (Current / Expiring / Flagged) and extraction %. These are static demo states that don't reflect Rachel's actual upload and analysis history.

**Functional dimension:** Dashboard-level portfolio health: per-lease status (ready / flags unresolved / not yet analyzed), time since last analysis, upcoming expiry warnings.

**Emotional dimension:** Feel oriented and in control from the moment she logs in, not lost or overwhelmed.

**Social dimension:** Be able to tell Jennifer in a weekly sync: "We have 10 of 12 leases compliant. 2 need discount rate inputs before we can generate reports."

**What makes this job hard:**
- Requires persistent per-account storage to track analysis history (BUG-009)
- Status must reflect actual flag resolution state, not just whether analysis was run
- Rachel may have uploaded and analyzed the same lease multiple times — the system must track the latest state per lease

**Product requirements this job drives:**
- "X ready to report / Y need attention" counter on the dashboard (not yet built)
- Portfolio table reflects actual analysis state from Supabase (requires BUG-009)
- Lease-level last-analyzed date visible in the table
- Expiry date column with color-coded proximity warning (90-day, 30-day thresholds)

**The one metric that tells us this job is done:**
> % of returning users who navigate directly to a flagged lease within 60 seconds of login (measured by click path analytics).

---

### J4 — Trust AI-Extracted Fields Enough to Submit to an Auditor

**Full statement:**
> When I review AI-extracted lease terms, I want to know — for each individual field — how confident the AI is in its extraction and which source clause it used, so I can quickly verify only the uncertain fields rather than manually checking every single value, and ultimately feel confident enough to submit the report to my auditor without a second read-through of the original contract.

**Circumstance:** During the review phase (Phase 3 of the compliance cycle), after extraction is complete.

**The trust gap (from user research):**
> 80.5% of finance professionals believe AI tools will be standard within 5 years. Only 13.5% are using them today. 21.3% cite trust as the leading barrier. — Deloitte 2025

Rachel's specific trust questions:
1. "Will the AI miss something that gets me in trouble?" (false negative fear)
2. "How do I know the extracted value is correct?" (verifiability need)
3. "If this is wrong, is it my fault or the tool's fault?" (accountability concern)

**What she currently does:**
Checks every field against the source PDF, which defeats much of the time savings. She needs a way to know which fields need checking and which she can trust.

**What LegalGraph currently provides:**
- Confidence dots: green (high), amber (medium), red (low) per field
- Clause section reference per field
- Edit-in-place to correct AI output (marked "manually verified")
- Report gate: high flags must be resolved before export

**What's still missing:**
- Per-field confidence score (numeric — not just color)
- Clause text visible without leaving the app (BUG-006)
- "AI extracted / Human verified" distinction in the export PDF

**Functional dimension:** Know which fields to double-check without checking all of them. Know that human overrides are tracked and visible in the audit trail.

**Emotional dimension:** Feel professionally responsible for the output, not blindly trusting a black box. "I reviewed the AI's work. I'm signing off on it."

**Social dimension:** Be able to tell an auditor: "Every field either came from the contract directly — and I can show you the clause — or was manually entered and flagged as human-verified."

**Product requirements this job drives:**
- Per-field confidence scores from n8n extraction pipeline (Phase 1 — planned)
- "Manually verified" badge on edited fields (live)
- Consent modal naming Anthropic Claude API explicitly (live)
- Report cover page with "AI-assisted, human-reviewed" language (planned)
- Clause text tooltip on hover over section references (BUG-006 dependency)

**The one metric that tells us this job is done:**
> Edit-mode session rate per field. If it drops over successive quarters for the same Rachel, she is building trust. If it stays high, she still doesn't trust the AI.

---

### J5 — See the Compliance Impact of a New or Amended Lease Immediately

**Full statement:**
> When a new office lease is signed or an existing lease is modified (rent escalation, renewal exercised, term extended), I want to upload the updated contract and see immediately how the IFRS 16 schedule changes — what the new ROU asset value is, how the liability schedule shifts, whether new risk flags appear — so I can keep our compliance records current without waiting until quarter-end to reconcile.

**Circumstance:** Mid-quarter, when a new lease event occurs. Lower urgency than J1 but becomes acute when modifications are frequent.

**What she does today:**
Waits until quarter-end, then manually reconciles the new lease or modification into the Excel template alongside all other leases. Often misses modifications because there is no trigger to update the schedule.

**Current LegalGraph status:**
No amendment tracking. Every analysis starts fresh. No comparison to a prior analysis of the same lease.

**Functional dimension:** Upload new contract → see delta vs. last analysis of the same lease → understand compliance impact without running a manual recalculation.

**Emotional dimension:** Feel ahead of the problem rather than reactive to it.

**Product requirements this job drives:**
- Persistent per-lease analysis history (BUG-009)
- Delta view: "Field X changed from Y to Z since last analysis"
- Amendment detection heuristic (date-based: "this contract was executed 30 days after the prior version")
- Mid-quarter alert: "A modification was detected in your SF HQ lease since last analysis" *(GA+1)*

**The one metric that tells us this job is done:**
> # of re-analyses triggered mid-quarter (between Q-end submission dates). Rising = Rachel is using LegalGraph between reporting cycles, not just at deadline.

---

### J6 — Approve Tooling That Reduces Audit Risk Without Creating New Liability (Jennifer)

**Full statement:**
> When my compliance lead recommends a new AI-powered tool for IFRS 16 reporting, I want to understand exactly how the AI is used, where our contract data goes, how the output is disclosed to auditors, and what happens if the AI is wrong — so I can approve the budget and the data processing agreement knowing we are not creating a new legal or regulatory exposure.

**Circumstance:** Jennifer's 1:1 with Rachel; budget approval cycle; vendor evaluation.

**What she fires if she approves:**
The Excel process, the risk of manual error, and Rachel's time.

**What she fears if she approves:**
- A restatement caused by AI error
- An auditor who refuses to accept AI-generated reports
- Contract data shared with an AI vendor in violation of NDA provisions in the leases themselves
- The CFO finding out after the fact that compliance reports were AI-generated without disclosure

**What makes Jennifer approve:**
1. Clear disclosure: Anthropic Claude API is named; data retention is specified; deletion contact is provided
2. Report gate: High flags must be resolved by a human before the report can be exported — LegalGraph cannot submit an unreviewed report
3. Clause trail: every field links back to the source contract — auditors can verify independently
4. ROI: Rachel's 4–6 hours → <45 minutes, documented with Beta time-to-report data
5. Beta NDA and DPA are solid; no surprises post-signature

**The one metric that tells us this job is done:**
> Beta DPA signed within 14 days of Rachel's first analysis session (measures Jennifer's approval speed once Rachel demonstrates value).

---

### J7 — Look Up a Specific Lease Term in Under 2 Minutes (David)

**Full statement:**
> When I need to know the renewal options on the London EMEA lease before a call with our landlord, I want to open LegalGraph, find the lease, and see the renewal term and clause reference — without running a new analysis, reading the contract, or asking Rachel — so I can walk into the negotiation informed in under 2 minutes.

**Circumstance:** Ad hoc, before a negotiation or amendment discussion. No deadline, but time is short.

**What he fires:**
Emailing Rachel, who then either opens the PDF or forwards him a screenshot from her Excel tracker.

**Functional dimension:** Searchable portfolio → lease detail → specific field value + clause reference, all in under 90 seconds.

**Product requirements this job drives:**
- Portfolio table must be searchable/sortable (currently static demo data)
- Extracted terms grid is the first section on the analysis screen (live — correct)
- Clause references visible without clicking through (section reference already shown)

**The one metric that tells us this job is done:**
> Session duration for David: target <120 seconds (vs. Rachel's 45-minute sessions). If his sessions average 2–3 minutes, the term lookup job is working.

---

## What LegalGraph Is Actually Being Hired and Fired For

### Hired for (moments of switching from Excel):
1. The quarterly deadline crunch — Excel is too slow and too error-prone
2. The first auditor revision request — Excel produces no audit trail
3. A new GC or CFO who wants to modernise the compliance stack

### Fired (moments of switching back to Excel):
1. The webhook times out and the loading screen never resolves — Rachel abandons mid-analysis
2. Clause links don't work — auditor asks for evidence Rachel can't produce from the report
3. The tool forgets last quarter's analysis — Rachel has to start from scratch every quarter
4. Per-field accuracy is visibly wrong — Rachel edits so many fields she concludes Excel is faster

**The single most important firing moment to prevent:** Rachel uploads a contract, the analysis runs, and she edits more than 3 fields because the AI was wrong. At that point, she questions whether this is faster than manual extraction.

---

## Jobs the Product Should Not Try to Own (V1)

| Job | Why not now |
|-----|-------------|
| Generate journal entries (DR/CR) | Accounting team's job; creates liability if wrong |
| File IFRS 16 disclosure notes directly | Requires auditor verification; out of scope |
| Manage the full lease lifecycle (admin, renewal workflows) | Competitors (Visual Lease, Nakisa) own this; LegalGraph wins by being the compliance specialist, not the platform |
| SOX compliance reporting | Different workflow, different persona, different audit standard |
| Equipment and vehicle lease accounting | High variance in structure; V1.1 scope |

---

## JTBD → Feature Traceability Matrix

| Job | Core feature | Priority | Status |
|-----|-------------|----------|--------|
| J1 — Report generation | AI extraction + PDF export with audit trail | P0 | 🔄 Partial |
| J1 — Report generation | Risk flag resolution gate | P0 | ✅ Live |
| J2 — Clause answer | Clause PDF viewer | P0 GA blocker | 🔄 BUG-006 |
| J2 — Clause answer | Clause text tooltip (50-word excerpt) | P1 | ❌ Not built |
| J3 — Portfolio status | "Ready / needs attention" dashboard counter | P1 | ❌ Not built |
| J3 — Portfolio status | Persistent per-lease analysis history | P0 | ❌ BUG-009 |
| J4 — AI trust | Per-field confidence scores | P1 | 🔄 n8n Phase 1 |
| J4 — AI trust | "Manually verified" badge on edits | P0 | ✅ Live |
| J4 — AI trust | Report cover page with AI disclosure | P1 | 🔄 Planned |
| J5 — Amendment tracking | Delta view vs. prior analysis | P1 GA | 🔄 Roadmap |
| J6 — Jennifer approval | Consent modal with Anthropic disclosure | P0 | ✅ Live |
| J6 — Jennifer approval | Report gate: High flags block export | P0 | ✅ Live |
| J7 — David term lookup | Searchable portfolio table | P1 | 🔄 Static today |

---

## The One North Star Job

If LegalGraph solves only one job in V1 with excellence, it must be **J1: Generate an audit-ready IFRS 16 report before quarter-end.**

J2 (clause answer) is the trust mechanism that makes J1 defensible to auditors. J1 without J2 produces a report Rachel can generate but cannot stand behind. J1 with J2 produces a report that converts Rachel into a reference customer.

**Ship both. In that order.**

---

*JTBD owner: Product · Last updated: 2026-05-06*
*Personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate)*
*Framework: Clayton Christensen Jobs-to-Be-Done*
