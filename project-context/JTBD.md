# LegalGraph — Jobs to Be Done
**Version 1.1 | Date: 2026-05-08**
**Owner: Product**
**Grounded in: PRD v1.1 · market-research-legal-ai-2026.md · user-research-legal-ai-2026.md**
**Framework: Clayton Christensen JTBD — functional, emotional, and social dimensions**
**Changes in v1.1:** Added J8 (batch workflow), J9 (IBR guidance), J10 (internal sign-off), J11 (auditor verification), J0 (first-analysis activation); completed J5/J6/J7 profiles; fixed J4 confidence dot status contradiction; added OKR mapping column; updated fired/hired lists.

---

## Framing

A Job to Be Done is the progress a person is trying to make in a specific circumstance. LegalGraph is hired to make progress on compliance work that is painful, high-stakes, and time-constrained. Understanding what Rachel "fires" when she "hires" LegalGraph — and what she fires LegalGraph for if it fails her — is the foundation of the product strategy.

---

## The Jobs, Prioritised by Business Impact

| # | Job | Persona | Urgency | Impact if unsolved | LegalGraph status | OKR |
|---|-----|---------|---------|-------------------|-------------------|-----|
| J0 | Evaluate LegalGraph on a known lease to decide whether to trust it | Rachel | **Critical** | Activation fails; Rachel never commits to full portfolio | ❌ Not designed for | Obj 1 KR2 |
| J1 | Generate an audit-ready IFRS 16 report before quarter-end | Rachel | **Critical** | Rachel misses deadline or submits unreviewed output | 🔄 Partial — extraction works; PDF export not fully structured | Obj 1 KR2 |
| J2 | Answer an auditor's clause question without opening the PDF | Rachel | **Critical** | Audit friction; 30–60 min per question manually | 🔄 BUG-006 — clause PDF viewer | Obj 3 KR1 |
| J3 | Know which leases are ready to report and which still have issues | Rachel | **High** | Rachel has no dashboard-level orientation on what's left to do | ❌ Not built | Obj 1 KR2 |
| J4 | Trust that AI-extracted fields are accurate enough to submit to an auditor | Rachel | **High** | Rachel spot-checks everything manually; abandons to Excel | 🔄 Partial — edit mode + section refs live; numeric confidence scores not yet | Obj 3 KR1/KR2 |
| J5 | See the compliance impact of a new or amended lease immediately | Rachel | **Medium** | Rachel runs a manual reconciliation between uploads | 🔄 GA roadmap — amendment tracking | Obj 1 KR3 |
| J6 | Approve tooling that reduces audit risk without creating new liability | Jennifer | **High** | Jennifer blocks the purchase | 🔄 Partial — consent modal + disclaimer live; auditor validation pending | Obj 1 KR1 |
| J7 | Look up a specific lease term in under 2 minutes without running analysis | David | **Medium** | David opens the original PDF and spends 10 minutes searching | 🔄 Partial — terms grid live; portfolio not yet searchable (BUG-009) | Obj 2 KR2 |
| J8 | Work through 4–12 leases efficiently in a single quarter-end session | Rachel | **High** | Rachel loses track of progress; session overruns or stalls | ❌ Not built | Obj 1 KR2 |
| J9 | Resolve a missing discount rate flag without escalating to treasury or auditor | Rachel | **High** | Most common activation stall; flags dismissed or session abandoned | ❌ Guidance not built | Obj 3 KR1 |
| J10 | Get internal CFO sign-off on the compliance report before external submission | Rachel + Jennifer | **Medium** | No internal approval trail; audit exposure if CFO unaware of AI use | ❌ Not built | Obj 1 KR1 |
| J11 | Independently verify AI-generated lease figures from source contracts | Auditor | **Medium** | Auditor refuses AI-generated report; Rachel resubmits manually | ❌ Auditor portal not built (GA+1) | Obj 3 KR2 |

---

## Detailed JTBD Profiles

---

### J0 — Evaluate LegalGraph on a Known Lease Before Committing *(New — v1.1)*

**Full statement:**
> When I'm evaluating LegalGraph for the first time, I want to upload my most familiar lease — one I know inside-out — and see whether the AI extracts the key fields correctly within 30 minutes, so I can decide whether to trust the platform with my full quarterly reporting cycle before investing time in setting it up.

**Circumstance:** Free trial or first session post-signup. Rachel is skeptical and time-constrained. She is not yet committed.

**What she does today:**
There is no equivalent — she either accepts a vendor demo on vendor-selected data (low trust) or asks for a proof-of-concept on her own contracts (high friction, usually requires a sales call).

**Progress she's trying to make:** Go from "I've heard AI can do this" to "I've seen it work on my actual lease" in under 30 minutes.

**Functional dimension:** Upload one known lease → see AI extract correct values for rent, term, and renewal options → verify 2–3 fields against the source → decide to continue or stop.

**Emotional dimension:** Reduce the anxiety of committing to a new tool. "I'm not going to trust this with my quarterly report until I know it works on something I understand."

**Social dimension:** Be able to tell Jennifer: "I tested it on our HQ lease and it got the material terms right. I think we should use it."

**What makes this job hard:**
- Rachel's "known lease" may be complex (variable rent, CPI escalation) — a hard first test that undersells the tool
- If the first extraction has >3 wrong fields, Rachel concludes the tool isn't ready and doesn't return
- No onboarding flow guides her to a high-probability-of-success first lease

**Product requirements this job drives:**
- Recommended first lease: prompt Rachel to start with a simple fixed-rent lease (not her most complex one)
- Time-to-first-extraction: < 10 minutes from signup (current target from PRD L2 metrics)
- Accuracy on standard fixed-rent leases must be visibly correct on the fields Rachel checks first (annual rent, term, commencement date)
- "You're ready to start" moment: a clear success state after first extraction that encourages progression

**The one metric that tells us this job is done:**
> Activation rate: % of new accounts completing a first extraction within 14 days of signup. Current target: ≥70% (PRD L1-1).

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
- Discount rate is almost always missing and requires an external calculation (see J9)
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
- Clause section reference per field (live)
- Edit-in-place to correct AI output, marked "manually verified" (live)
- Report gate: High flags must be resolved before export (live)
- **Note:** Color confidence dots (green/amber/red) are in the UI design but are static placeholders — numeric confidence scores from the n8n extraction pipeline are not yet wired up (n8n Phase 1, planned). *(Clarifies v1.0 contradiction.)*

**What's still missing:**
- Per-field numeric confidence score from n8n pipeline (n8n Phase 1 — planned)
- Clause text visible without leaving the app (BUG-006)
- "AI extracted / Human verified" distinction in the export PDF

**Functional dimension:** Know which fields to double-check without checking all of them. Know that human overrides are tracked and visible in the audit trail.

**Emotional dimension:** Feel professionally responsible for the output, not blindly trusting a black box. "I reviewed the AI's work. I'm signing off on it."

**Social dimension:** Be able to tell an auditor: "Every field either came from the contract directly — and I can show you the clause — or was manually entered and flagged as human-verified."

**Product requirements this job drives:**
- Per-field confidence scores wired from n8n extraction pipeline (Phase 1 — planned)
- Color dot UI already present; activate with real confidence values
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

**Emotional dimension:** Feel ahead of the problem rather than reactive to it. "I know about this change now, not three months from now when it's urgent."

**Social dimension:** Be able to tell the CFO mid-quarter: "We signed the new Sydney lease last week. Here's how it affects the IFRS 16 schedule — I've already updated the figures." This shifts Rachel from reactive reporter to proactive compliance manager.

**What makes this job hard:**
- LegalGraph currently has no concept of lease identity across analyses — two uploads of the same lease look like two separate documents
- Amendment detection requires matching the new upload to a prior version (date heuristic, document similarity, or manual tagging)
- Compliance impact calculation (delta in ROU asset, liability schedule) requires the prior period's numbers as a baseline
- Rachel may not know a lease has been modified unless she receives the updated contract proactively

**Product requirements this job drives:**
- Persistent per-lease analysis history (BUG-009)
- Delta view: "Field X changed from Y to Z since last analysis"
- Amendment detection heuristic (date-based: "this contract was executed 30 days after the prior version")
- Mid-quarter alert: "A modification was detected in your SF HQ lease since last analysis" *(GA+1)*

**The one metric that tells us this job is done:**
> # of re-analyses triggered mid-quarter (between Q-end submission dates). Rising = Rachel is using LegalGraph between reporting cycles, not just at deadline.

---

### J6 — Approve Tooling That Reduces Audit Risk Without Creating New Liability

**Full statement:**
> When my compliance lead recommends a new AI-powered tool for IFRS 16 reporting, I want to understand exactly how the AI is used, where our contract data goes, how the output is disclosed to auditors, and what happens if the AI is wrong — so I can approve the budget and the data processing agreement knowing we are not creating a new legal or regulatory exposure.

**Circumstance:** Jennifer's 1:1 with Rachel; budget approval cycle; vendor evaluation. Jennifer evaluates LegalGraph once — she does not use it daily.

**What she hires today (and fires when she approves LegalGraph):**
- Manual oversight: trusting Rachel's Excel process implicitly, with no formal sign-off mechanism
- Ad hoc vendor review: reading SOC 2 reports and asking legal to review the vendor contract

**What she fears if she approves:**
- A restatement caused by AI error
- An auditor who refuses to accept AI-generated reports
- Contract data shared with an AI vendor in violation of NDA provisions in the leases themselves
- The CFO finding out after the fact that compliance reports were AI-generated without disclosure

**What makes this job hard:**
- Jennifer is not a daily LegalGraph user — she evaluates on documentation and Rachel's testimony, not direct product experience
- PCAOB AS 1105 (effective December 2025) creates new auditor standards for AI-generated outputs that Jennifer must verify the vendor meets
- The DPA and data retention policy must be reviewed by Jennifer's legal team before sign-off, adding 1–2 weeks to approval
- Jennifer must trust both Rachel's judgment (that the tool works) and LegalGraph's claims (that it's audit-defensible)

**What makes Jennifer approve:**
1. Clear disclosure: Anthropic Claude API is named; data retention is specified; deletion contact is provided
2. Report gate: High flags must be resolved by a human before the report can be exported — LegalGraph cannot submit an unreviewed report
3. Clause trail: every field links back to the source contract — auditors can verify independently
4. ROI: Rachel's 4–6 hours → <45 minutes, documented with Beta time-to-report data
5. Beta NDA and DPA are solid; no surprises post-signature

**Functional dimension:** Get complete answers to four questions — where does data go, will auditors accept this, what does it cost, what happens if it's wrong — in under 30 minutes of evaluation.

**Emotional dimension:** Feel that she is managing AI risk responsibly, not ignoring it. "I approved this with full knowledge of how it works and what the safeguards are."

**Social dimension:** Be seen by the CFO and board as the GC who modernised compliance while maintaining audit rigour — not the one who introduced AI sloppily. "Jennifer brought in a tool that actually got our auditor to sign off faster."

**Product requirements this job drives:**
- Consent modal with Anthropic disclosure (live)
- Report gate: High flags block export (live)
- PCAOB AS 1105 compliance one-pager (not yet built — sales enablement)
- DPA template with data retention terms (not yet built)
- Beta time-to-report data for ROI conversation (needs instrumentation — BUG-009/metrics)

**The one metric that tells us this job is done:**
> Beta DPA signed within 14 days of Rachel's first analysis session (measures Jennifer's approval speed once Rachel demonstrates value).

---

### J7 — Look Up a Specific Lease Term in Under 2 Minutes

**Full statement:**
> When I need to know the renewal options on the London EMEA lease before a call with our landlord, I want to open LegalGraph, find the lease, and see the renewal term and clause reference — without running a new analysis, reading the contract, or asking Rachel — so I can walk into the negotiation informed in under 2 minutes.

**Circumstance:** Ad hoc, before a negotiation or amendment discussion. No deadline, but time is short.

**What he hires today (and fires when he uses LegalGraph):**
Emailing Rachel, who then either opens the PDF or forwards him a screenshot from her Excel tracker. Takes 10–30 minutes and interrupts Rachel's workflow.

**What makes this job hard:**
- The portfolio table currently shows static demo data, not David's actual lease history (BUG-009)
- David doesn't know whether Rachel has analyzed a given lease recently — the last-analyzed date isn't visible
- He may need a field that wasn't extracted (e.g., subtenant rights, co-tenancy clause) — the AI doesn't cover every possible field

**Functional dimension:** Searchable portfolio → lease detail → specific field value + clause reference, all in under 90 seconds.

**Emotional dimension:** Feel self-sufficient and prepared before a negotiation. "I didn't have to bother Rachel for this."

**Social dimension:** Be the associate who comes to landlord negotiations already knowing the terms — not the one who has to pause and look things up during a call.

**Product requirements this job drives:**
- Portfolio table must be searchable/sortable (requires BUG-009 for real data)
- Extracted terms grid is the first section on the analysis screen (live — correct)
- Clause references visible without clicking through (section reference already shown)
- Last-analyzed date visible in the portfolio table (not yet built)

**The one metric that tells us this job is done:**
> Session duration for David: target <120 seconds (vs. Rachel's 45-minute sessions). If his sessions average 2–3 minutes, the term lookup job is working.

---

### J8 — Work Through 4–12 Leases Efficiently in a Single Quarter-End Session *(New — v1.1)*

**Full statement:**
> When I sit down to process the full portfolio before quarter-end, I want to work through all 4–12 leases in priority order — starting with the ones most likely to have issues — track my progress across the session, and know exactly when every lease is done and ready to export, so I can complete the entire compliance cycle in one focused session without losing track or missing a lease.

**Circumstance:** Single intensive work session, T-3 to T-0 before quarter-end. Rachel has 2–3 hours blocked. This is distinct from J1 (which is about one lease → one report) and J3 (which is about re-entry status orientation). J8 is about efficiently executing a multi-lease queue.

**What she does today:**
Works through leases in ad hoc order (usually the order she finds the PDFs in the shared drive). Uses a sticky note or mental checklist to track which ones she's done. Frequently loses track, re-opens completed leases to check, or discovers she missed one after sending to the auditor.

**Functional dimension:** Session-level progress tracking across all leases: how many done, how many remaining, which ones blocked by unresolved flags, total time elapsed.

**Emotional dimension:** Feel in control of a high-stakes, time-pressured workflow. "I know exactly what's left and I'm going to finish on time."

**Social dimension:** Complete the quarterly submission on time and without errors — the basic expectation Jennifer and the CFO have of Rachel's role.

**What makes this job hard:**
- No session-level progress view exists — only per-lease status (and only after BUG-009 is fixed)
- Priority ordering (which lease to do first) requires knowing which leases have the most flags or the most complexity — not visible without opening each one
- Consent modal fires per analysis, creating friction across a multi-lease session (consent fatigue — noted as a fired moment)
- If one lease's webhook times out mid-session, Rachel loses flow and may not return to it

**Product requirements this job drives:**
- Portfolio table showing all leases with per-lease status (ready / flags / not yet analyzed) — requires BUG-009
- Session-level "X of Y leases complete" progress indicator (not yet built)
- Consent modal: once-per-session consent rather than once-per-analysis (reduce fatigue without removing disclosure)
- Intelligent triage suggestion: "Start with these 3 leases — they have the most unresolved flags" (GA+1)

**The one metric that tells us this job is done:**
> Average number of leases processed in a single session for accounts with 8+ leases. Rising = Rachel is batch-processing efficiently. Flat or declining = she's dropping out mid-session.

---

### J9 — Resolve a Missing Discount Rate Flag Without Escalating to Treasury or Auditor *(New — v1.1)*

**Full statement:**
> When LegalGraph flags "discount rate missing — High severity" on a lease and I don't know what incremental borrowing rate to use, I want clear, actionable guidance on how to calculate or source the IBR for this specific lease — including the IFRS 16.26 methodology and documentation requirements — so I can resolve the flag confidently and proceed to report generation without interrupting my treasury team or escalating to my auditor.

**Circumstance:** During flag resolution (Phase 4 of the compliance cycle), on nearly every lease. The discount rate is almost never specified in the contract itself. This is the single most common activation stall in the product.

**What she does today:**
- Emails the treasury team to ask for the company's average cost of debt
- Searches "IFRS 16 incremental borrowing rate" and reads accounting guidance
- Sometimes dismisses the flag and exports anyway (compliance risk)
- Sometimes abandons the analysis and defers to Excel where she has a hardcoded rate from last year

**What LegalGraph currently provides:**
- High-severity flag with label "Discount rate missing"
- Reference to IFRS 16.26 in the flag description
- No guidance on how to calculate or source the IBR
- No ability to save the IBR at the company level for reuse across leases

**Functional dimension:** See a specific, actionable next step directly on the flag: the IBR calculation methodology, a link to a calculator or formula, and the ability to enter and save the rate for all leases in the portfolio.

**Emotional dimension:** Feel competent and independent — able to resolve a compliance question without relying on another team. "I know exactly what to do next."

**Social dimension:** Not have to go back to Jennifer or the CFO mid-session with a question about a rate they may not know off the top of their heads.

**What makes this job hard:**
- IBR varies by lease commencement date, currency, and jurisdiction — a single company-wide rate is an approximation, not always technically correct
- Rachel is not an accountant by training — the IFRS 16.26 methodology requires interpretation she may not have
- The "correct" IBR is a judgment call that creates liability if wrong — Rachel needs both guidance and clear documentation that she made an informed choice

**Product requirements this job drives:**
- Flag action block: "What do I do?" guidance section on every High-severity IBR flag (copy change — no eng required initially)
- IBR guidance text: "Use your company's incremental borrowing rate at lease commencement. Common approach: average cost of debt at commencement date. IFRS 16.26 requires documentation of the rate and methodology used."
- Company-level IBR storage: enter the rate once, apply to all leases with the same commencement currency (not yet built)
- IBR calculator link or embedded tool (GA+1)

**The one metric that tells us this job is done:**
> IBR flag resolution rate: % of "discount rate missing" flags that are resolved (vs. dismissed or left unresolved) before export. Target: >80%.

---

### J10 — Get Internal CFO Sign-Off Before External Submission *(New — v1.1)*

**Full statement:**
> When my compliance report is ready to submit to external auditors, I want to share a draft with the CFO for review and get explicit written approval before it leaves the building — with a clear record in the audit trail that she reviewed and signed off — so that the final submission has internal authorization and the audit trail demonstrates human oversight beyond just my own review.

**Circumstance:** Between report generation (Phase 5) and external submission. Rachel has generated the PDF; it now needs Jennifer or CFO approval before going to the auditor.

**What she does today:**
Emails the PDF to Jennifer with "please review before I send to [auditor]." Jennifer replies "looks fine" in email. That email chain is the approval record — fragile, hard to find, not linked to the compliance report itself.

**Functional dimension:** Share a report draft from within LegalGraph → Jennifer receives it with a clear review interface → Jennifer approves or comments → approval is logged in the audit trail alongside the report.

**Emotional dimension:** Rachel: "I'm covered. The CFO approved this before it went out." Jennifer: "I reviewed this. My name is on it, and I'm comfortable with that because I can see exactly what the AI did."

**Social dimension:** Both Rachel and Jennifer can demonstrate to auditors, the board, or regulators that there was a formal internal review step — not just AI output sent directly to external parties.

**What makes this job hard:**
- Jennifer is not a daily LegalGraph user — a full platform login for a one-time approval creates friction
- The approval needs to be legally meaningful (name, timestamp, version of the report approved) — a casual email reply doesn't satisfy PCAOB AS 1105's human-oversight requirement
- Rachel needs to know when Jennifer has approved so she can submit without delay

**Product requirements this job drives:**
- "Request internal review" button on completed report (not yet built)
- Email-based approval flow for Jennifer: receive PDF link → click "Approve" → confirmation logged in audit trail (no LegalGraph account required for approver)
- Approval timestamp and approver name visible on report cover page and in audit trail
- Notification to Rachel when approval is complete

**The one metric that tells us this job is done:**
> % of reports with internal approval logged before external submission. Rising = departments are adopting the formal sign-off workflow. Also: DPA signed within 14 days (J6 metric) should accelerate once J10 is built.

---

### J11 — Independently Verify AI-Generated Lease Figures From Source Contracts *(New — v1.1 — Auditor Persona)*

**Full statement:**
> When I'm reviewing a client's AI-generated IFRS 16 compliance schedule during audit fieldwork, I want to trace each material line item directly back to the specific clause in the original lease contract — with the clause text visible — so I can conclude the AI-assisted extraction meets my independence and evidence standards under PCAOB AS 1105, without requesting a manual resubmission from the client.

**Persona:** External auditor (new persona in v1.1). The auditor is the ultimate consumer of LegalGraph's output and the final gatekeeper of whether AI-generated compliance reports are accepted.

**Circumstance:** Audit fieldwork, January–March for calendar-year reporters. The auditor has received Rachel's PDF compliance report and is performing substantive procedures.

**What they do today:**
Request that the client provide source contracts and manually verify key figures — a process that takes 2–4 hours per client and often results in revision requests when the client's manual extraction has errors.

**Why this job matters for LegalGraph:**
If auditors can verify AI-generated reports independently, they accept them. If they can't, they reject them and Rachel reverts to manual. J11 is the demand-side job that determines whether J1 (Rachel's report generation) results in an accepted submission or a revision cycle. Trullion's most-praised G2 feature is clause-to-source navigation specifically for this use case.

**Functional dimension:** From the compliance report PDF → click any field → see the source clause text, section number, and page reference in the original contract — without accessing Rachel's LegalGraph account.

**Emotional dimension:** Feel confident signing off on an AI-assisted filing. "I can see exactly where this number came from. My independence is not compromised by the AI."

**Social dimension:** Be the auditor who handles AI-assisted clients efficiently, not the one who creates friction by rejecting AI-generated reports. Auditors who accept LegalGraph reports get faster fieldwork; those who don't add 2–4 hours per client.

**What makes this job hard:**
- Auditors cannot (and should not) access Rachel's LegalGraph account — they need a read-only, shareable view
- The audit trail must show not just the clause but also whether the field was AI-extracted or manually verified, and when
- PCAOB AS 1105 requires documentation of the AI model used — auditors may ask for this explicitly

**Product requirements this job drives:**
- "Share with auditor" export: PDF with clause excerpts inline per field (planned — J2 dependency)
- Auditor portal: read-only, shareable link to the compliance report with active clause citations (GA+1)
- Report cover page: AI model disclosure, extraction date, human review sign-off, PCAOB AS 1105 compliance statement
- Audit trail log accessible in the share (which fields were AI-extracted vs. manually verified, and when)

**The one metric that tells us this job is done:**
> Auditor revision request rate: target <5% of submitted reports require resubmission. Also: auditor NPS (if measurable via post-submission survey to Rachel).

---

## What LegalGraph Is Actually Being Hired and Fired For

### Hired for (moments of switching from Excel):
1. The quarterly deadline crunch — Excel is too slow and too error-prone with 8+ leases
2. The first auditor revision request — Excel produces no clause trail; auditors ask for evidence Rachel can't provide
3. A new GC or CFO who wants to modernise the compliance stack
4. A new or amended lease that breaks the existing Excel template mid-quarter
5. A more rigorous auditor who specifically asks for source clause evidence per field *(new — v1.1)*

### Fired (moments of switching back to Excel):
1. The webhook times out and the loading screen never resolves — Rachel abandons mid-analysis
2. Clause links don't work — auditor asks for evidence Rachel can't produce from the report (BUG-006)
3. The tool forgets last quarter's analysis — Rachel has to start from scratch every quarter (BUG-009)
4. Per-field accuracy is visibly wrong — Rachel edits so many fields she concludes Excel is faster
5. The discount rate flag has no actionable guidance — Rachel dismisses it or abandons the session *(new — v1.1)*
6. Consent modal fires on every analysis in a multi-lease session — Rachel loses momentum and stops mid-session *(new — v1.1)*

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
| Calculate the IBR directly (as a financial service) | Creates financial advice liability; LegalGraph provides guidance and tooling to help Rachel calculate it, not a calculation service |
| ERP data sync (journal entry posting to NetSuite/SAP) | Enterprise requirement; V1.1 scope when deal size warrants integration investment |
| Multi-party lease review (3+ party agreements) | Edge case with significant extraction complexity; defer to V1.1 |

---

## JTBD → Feature Traceability Matrix

| Job | Core feature | Priority | Status |
|-----|-------------|----------|--------|
| J0 — First-analysis activation | Recommended first lease prompt + fast extraction | P1 | ❌ Not built |
| J1 — Report generation | AI extraction + PDF export with audit trail | P0 | 🔄 Partial |
| J1 — Report generation | Risk flag resolution gate | P0 | ✅ Live |
| J2 — Clause answer | Clause PDF viewer | P0 GA blocker | 🔄 BUG-006 |
| J2 — Clause answer | Clause text tooltip (50-word excerpt) | P1 | ❌ Not built |
| J3 — Portfolio status | "Ready / needs attention" dashboard counter | P1 | ❌ Not built |
| J3 — Portfolio status | Persistent per-lease analysis history | P0 | ❌ BUG-009 |
| J4 — AI trust | Per-field confidence scores (wired from n8n) | P1 | 🔄 n8n Phase 1 |
| J4 — AI trust | Color confidence dot UI | P1 | 🔄 UI present; not wired |
| J4 — AI trust | "Manually verified" badge on edits | P0 | ✅ Live |
| J4 — AI trust | Report cover page with AI disclosure | P1 | 🔄 Planned |
| J5 — Amendment tracking | Delta view vs. prior analysis | P1 GA | 🔄 Roadmap |
| J6 — Jennifer approval | Consent modal with Anthropic disclosure | P0 | ✅ Live |
| J6 — Jennifer approval | Report gate: High flags block export | P0 | ✅ Live |
| J6 — Jennifer approval | PCAOB AS 1105 compliance one-pager | P1 | ❌ Not built (sales enablement) |
| J7 — David term lookup | Searchable portfolio table | P1 | 🔄 Static today (BUG-009) |
| J8 — Batch session workflow | Session-level progress tracker (X of Y leases) | P1 | ❌ Not built |
| J8 — Batch session workflow | Once-per-session consent (vs. per-analysis) | P1 | ❌ Not built |
| J9 — IBR guidance | "What do I do?" action block on IBR flag | P0 | ❌ Copy change only |
| J9 — IBR guidance | Company-level IBR storage and reuse | P1 | ❌ Not built |
| J10 — Internal sign-off | Email-based CFO approval flow | P1 GA | ❌ Not built |
| J10 — Internal sign-off | Approval logged in audit trail + report cover | P1 GA | ❌ Not built |
| J11 — Auditor verification | "Share with auditor" PDF with inline clause excerpts | P1 | 🔄 Planned (J2 dependency) |
| J11 — Auditor verification | Auditor portal (read-only share link) | P2 GA+1 | ❌ Not built |

---

## The One North Star Job

If LegalGraph solves only one job in V1 with excellence, it must be **J1: Generate an audit-ready IFRS 16 report before quarter-end.**

J2 (clause answer) is the trust mechanism that makes J1 defensible to auditors. J1 without J2 produces a report Rachel can generate but cannot stand behind. J1 with J2 produces a report that converts Rachel into a reference customer.

J0 (first-analysis activation) is the prerequisite that gets Rachel to J1 in the first place.

**Build in this order: J0 → J1 → J2.**

---

*JTBD owner: Product · Last updated: 2026-05-08*
*Personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate), Auditor (External — v1.1)*
*Framework: Clayton Christensen Jobs-to-Be-Done*
