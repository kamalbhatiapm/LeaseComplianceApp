# LegalGraph — Ideal User Journey
**Version 1.1 | Date: 2026-05-08**
**Owner: Product**
**Grounded in: PRD v1.1 · JTBD v1.1 · market-research-legal-ai-2026.md · user-research-legal-ai-2026.md**
**Changes in v1.1:** Added Journey D (First-Analysis / Activation), Journey E (Auditor Verification); updated Journey A with Phase 5a (internal CFO sign-off), Phase 8 (batch session workflow); expanded Phase 4 with full IBR guidance flow (J9); updated Journey B with ongoing sign-off role; updated Moments of Truth table, Emotional Arc, and Journey Gaps to reflect JTBD v1.1.

---

## Framing Principle

Rachel logs in **four times a year** under deadline pressure. Every screen must be operable by someone who hasn't touched the tool in 90 days. The journey is not a daily SaaS loop — it is a **quarterly compliance cycle** with a hard finish line: an audit-accepted report with no revision requests.

Two moments define whether LegalGraph becomes indispensable or gets abandoned:
1. **The trust anchor** — the first time Rachel clicks a clause citation and the source text appears. At that point she stops verifying every field manually.
2. **The auditor acceptance** — the first quarter an auditor accepts Rachel's report without a revision request. At that point Rachel becomes a reference customer.

Design every touchpoint to accelerate both moments.

---

## The Five Journeys

| Journey | Persona | Frequency | Success State | JTBD |
|---------|---------|-----------|---------------|------|
| **A. Compliance Cycle** | Rachel | Quarterly | Audit-ready report exported; no auditor revision requests | J1, J2, J3, J4, J5, J8, J9, J10 |
| **B. Buyer Evaluation + Ongoing Approval** | Jennifer | Once to buy; ongoing for sign-off | Signed DPA; report approved before each external submission | J6, J10 |
| **C. Term Lookup** | David | Ad hoc | Specific field answered in <2 minutes without opening the PDF | J7 |
| **D. First-Analysis / Activation** | Rachel | Once (trial) | First extraction completed on a known lease; Rachel decides to continue | J0 |
| **E. Auditor Verification** | External Auditor | Post-submission, per audit cycle | Auditor verifies source clause for any line item; no resubmission requested | J11 |

---

## Journey D: Rachel's First-Analysis / Activation *(New — v1.1)*

Journey D happens before Journey A. It is the moment Rachel decides whether to trust LegalGraph with her real quarterly reporting. It is the activation gate that determines whether she ever reaches Journey A at all.

### D1 — Arrival (First session, post-signup or trial invite)

**What happens:**
Rachel has heard about LegalGraph — from a peer GC, an auditor recommendation, or a product hunt — and signed up for a trial. She is not under a quarterly deadline yet. She has one goal: *does this actually work on my contracts?*

**Emotional state:** Curious but skeptical. "I've seen demos on vendor-chosen data. Let me try it on something I know."

**What the product must do:**
- No wizard, no multi-step setup. One prominent action: upload a lease.
- Suggest starting with a simple fixed-rent lease: *"For your first analysis, we recommend a standard fixed-rent lease — it gives the most complete extraction."* This steers Rachel away from uploading her most complex lease first (which would undersell the tool).
- Time from landing to first upload: under 3 minutes.

**Current gap:** No onboarding guidance exists. Rachel arrives at a blank dashboard and must figure out where to start.

---

### D2 — First Extraction (The ground truth test)

**What happens:**
Rachel uploads a lease she knows well — typically the HQ office lease or a simple vendor agreement. She uses it as a ground truth test: she knows what the rent, term, and renewal options should be.

**The trust threshold:**
- **≤2 fields wrong:** Rachel trusts the tool and continues. "It got the important ones right."
- **3 fields wrong:** Rachel is uncertain. She tries one more lease before deciding.
- **>3 fields wrong:** Rachel concludes the AI isn't ready for her portfolio and abandons. This is the critical firing threshold identified in JTBD v1.1.

**Moments of truth:**
- ✅ Analysis completes in <25 seconds — fast enough to not lose her attention
- ✅ The extracted terms grid is the first visible section — she can check fields immediately
- 🔄 **Clause citations (BUG-006):** If she can click a field and see the source clause, trust is established in one session. Without it, she has to open the PDF in another tab to verify — friction that may cause her to stop before reaching confidence.
- ❌ No "first win" acknowledgement: after a successful extraction, nothing in the product says "this looks good — ready to generate a report?" The activation moment is silent.

**Design implication:** Add a post-extraction prompt for first-time users: *"Your extraction looks complete. Want to resolve the 2 flags and generate your first report?"* This bridges D2 → D3 explicitly.

---

### D3 — First Report (The activation event)

**What happens:**
Rachel resolves flags on her ground-truth lease and generates her first report. This is the moment she goes from "evaluating" to "this could replace my Excel process."

**What the product must do:**
- Flag resolution must be fast for a simple lease: 1–2 flags, each with clear guidance
- Report generation must be instant — no waiting state
- The generated PDF must look professional enough that Rachel can imagine sending it to her auditor

**The IBR flag on first analysis:**
If the discount rate flag fires on her first analysis (highly likely), this is the highest-risk moment in Journey D. Without IBR guidance (J9), Rachel hits a dead end on her very first lease and may abandon. The IBR guidance copy is as important to activation as BUG-006.

**Emotional state:** *"I could actually use this."* If this moment lands, Rachel is activated.

**The one metric:** Activation rate — % of new accounts completing a first extraction within 14 days of signup. Target: ≥70% (PRD L1-1).

---

## Journey A: Rachel's Quarterly Compliance Cycle

### Phase 0 — Trigger (T-14 days before quarter close)

**What happens:**
Rachel realises quarter-end is two weeks away. She knows the IFRS 16 schedule is due. The old workflow: open shared drive → find contract PDFs → open Excel template → extract manually. 4–6 hours, always errors.

**Emotional state:** Anticipatory dread. She knows this is going to be painful.

**Trigger types (from market research and JTBD v1.1):**
- Calendar: quarter-end approaching (most common)
- Auditor: revision request from last quarter came back
- Event: a new lease was signed or amended mid-quarter (J5)
- External: auditor recommended a tool; peer GC mentioned LegalGraph

**What LegalGraph must do here:**
Proactive email: *"Q2 reporting season starts in 14 days. Your leases from last quarter are ready to re-analyse."* *(GA+1 — not yet built.)*

The product cannot rely on Rachel remembering to log in. She uses it four times a year — it must reach out to her first.

---

### Phase 1 — Re-entry (First 60 seconds after login)

**What happens:**
Rachel opens the app. She hasn't used it in 90 days. One question must be answered instantly: *"Where do I pick up?"*

**Current state:** Dashboard shows 4 demo leases with static status pills. Does not reflect Rachel's actual analysis history.

**Ideal state (requires BUG-009):**

```
[ 3 leases ready to report ]   [ 2 leases need attention ]   [ 1 lease not yet analysed ]
```

Below the counter: a portfolio table showing each lease, its last-analysed date, its current status (ready / flags unresolved / not yet run), and any expiry warnings (90-day, 30-day thresholds).

**Moments of truth:**
- ✅ Portfolio is visible immediately — no empty state
- ❌ Status is static demo data, not Rachel's real analysis history (BUG-009)
- ❌ No "ready / needs attention" counter — Rachel must open each lease to understand its state

**Design implication:** The "Ready / Needs Attention" counter is the single most impactful addition to re-entry. It answers J3 in under 3 seconds and sets up J8 (batch workflow) by giving Rachel a queue to work from.

---

### Phase 2 — Upload (2–5 minutes per lease)

**What happens:**
Rachel uploads a lease contract PDF — either a new lease or a re-upload to catch any changes since last quarter.

**Ideal flow:**
1. Drag or click to upload the PDF
2. Select analysis intent *(intent dropdown — live)*
3. Click "Analyse Contract"
4. Consent modal fires — **once per session**, not once per analysis *(consent fatigue fix — J8)*
5. Loading screen with rotating quips; progress bar moves visibly
6. Analysis completes in <25 seconds for standard fixed-rent leases

**Friction points to eliminate:**
- **Scanned image-PDFs:** Rachel often only has a scanned PDF. The app must handle low-quality scans gracefully or flag the issue early rather than returning empty extraction.
- **Consent fatigue (J8):** In a multi-lease session, re-showing the consent modal on every analysis breaks Rachel's flow. Once-per-session consent preserves disclosure compliance without interrupting a batch workflow. *(Not yet built.)*
- **Webhook timeout:** If the webhook fails mid-session, Rachel must know immediately — not after 25 seconds of a stuck loading screen. A clear timeout message with a retry button prevents mid-session abandonment.

**Emotional state:** Cautious optimism. "Let's see if this actually works."

---

### Phase 3 — Review Extracted Terms (5–15 minutes per lease)

**What happens:**
Rachel sees the analysis results. She reviews extracted fields and decides whether to trust each one. This is the highest-stakes moment in the product — if she doesn't trust the output, the entire workflow collapses.

**What she does, in order:**
1. Scans the risk score and level first — "Medium Risk" is her entry point
2. Reads the AI summary paragraph — checks if it matches what she knows about the lease
3. Goes through "Extracted Lease Terms" row by row — spot-checks high-value fields (annual rent, term, ROU asset value)
4. Looks for missing fields — discount rate is almost always absent; she notes the IBR flag to handle in Phase 4
5. Optionally edits fields she knows are wrong — edit-in-place flow marks them "manually verified"

**Trust behaviours (from user research and JTBD J4):**
- Rachel will not accept AI output for high-value fields without verifying against the source PDF. She opens the PDF in another tab and checks.
- She reads clause section references (*"§2.1 — Lease Commencement"*) — this is enough to orient her without clicking through.
- The first time a clause citation opens source text inline (BUG-006), she stops opening the PDF manually. That single interaction changes her review behaviour for every subsequent lease.

**Moments of truth:**
- ✅ Score ring and risk level are instantly readable
- ✅ Edit mode lets her correct AI output; "manually verified" badge is live
- ✅ Clause section references visible per field
- 🔄 **Clause citation → PDF viewer (BUG-006):** The trust anchor. Without it, Rachel verifies every field manually. With it, she verifies only the low-confidence ones.
- 🔄 **Per-field confidence scores (n8n Phase 1):** Color dot UI is present but not yet wired to real confidence values from the extraction pipeline. Once live, Rachel can skip green-dot fields entirely and focus review time on amber and red.

**Ideal confidence flow (once n8n Phase 1 is live):**
- Green dot (>90% confidence): Rachel skips — trusts the AI
- Amber dot (70–90%): Rachel spot-checks — opens PDF to verify
- Red dot (<70%): Rachel verifies and edits — marks "manually verified"

**Emotional state:** Analytical, slightly skeptical. *"Is this right? Let me check the rent figure."*

---

### Phase 4 — Risk Flag Resolution (10–20 minutes)

**What happens:**
Rachel works through the risk flags. High-severity flags must be resolved before she can export. Medium and low flags are informational.

**The discount rate scenario (J9 — most common activation stall):**

Current state:
> Flag: "Discount rate missing — High severity. See IFRS 16.26."
> Rachel's question: "What rate do I use?"
> LegalGraph: *[no guidance]*

This is the single most common point where Rachel stalls or dismisses the flag and exports anyway (creating a compliance risk). Dismissing unresolved High flags degrades report quality and lowers auditor acceptance rates.

Ideal state (J9 — not yet built):
> **Flag: Discount rate missing — High severity**
> *What to do:* Use your company's incremental borrowing rate (IBR) at the lease commencement date.
> Common approach: average cost of debt at commencement. Your treasury team can provide this.
> IFRS 16.26 requires that you document the rate used and the methodology.
> → [Enter rate for this lease] → [Save as default IBR for all leases in this portfolio]

The "save as default IBR" feature eliminates re-entry on every lease in the same session and on every subsequent quarter — turning a per-lease friction point into a one-time setup.

**Other common flags and ideal guidance:**
- **Variable rent not extracted:** "Variable payments (CPI, percentage of revenue) require manual entry. Enter the estimated annual variable amount for IFRS 16 modelling."
- **Lease term ambiguity:** "The lease term could not be determined automatically. Check §[X] and enter the non-cancellable term plus any renewal periods you are reasonably certain to exercise."
- **Sublease detected:** "A sublease arrangement was detected. IFRS 16 requires separate lessee and lessor accounting. Tag this lease as a sublease to apply the correct treatment."

**Emotional state:** Frustrated but purposeful. The flags give her a checklist. She knows what "done" looks like — she just needs clear next steps to get there.

---

### Phase 5 — Report Generation (2–5 minutes)

**What happens:**
All High flags are resolved. Rachel clicks "Generate IFRS 16 Report." A PDF is generated instantly.

**What the PDF must contain (PCAOB AS 1105 compliance, effective December 2025):**
- **Cover page:** lease name, analysis date, standard applied (IFRS 16 / ASC 842), LegalGraph version, Anthropic Claude API disclosure, *"AI-assisted extraction — reviewed and approved by [Rachel's name] on [date]"*
- **Per-field table:** extracted value, clause reference (section + page), confidence indicator, AI-extracted vs. manually-verified badge
- **Risk flag summary:** every flag raised, how each was resolved or acknowledged, who resolved it and when
- **Audit trail log:** extraction timestamp, model version, all manual edits with timestamps

**Current status:** PDF export button exists; output format does not yet include the full structure above. This is a P0 requirement blocking auditor acceptance.

**Emotional state:** Relief. *"I'm done. Now I just need to get sign-off."*

---

### Phase 5a — Internal CFO Sign-Off *(New — v1.1, J10)*

**What happens:**
Before Rachel sends the report to external auditors, it needs internal authorisation from Jennifer or the CFO. Currently this happens via email — fragile, informal, and not linked to the compliance report itself. Under PCAOB AS 1105, the audit trail should show internal human oversight beyond just Rachel's own review.

**Ideal flow (not yet built):**
1. Rachel clicks "Request internal review" on the completed report
2. Jennifer receives an email with a PDF link and a single "Approve" button — no LegalGraph login required
3. Jennifer clicks "Approve" → a timestamp and her name are added to the report's audit trail and cover page
4. Rachel receives a notification: "Jennifer Martinez approved this report on May 8, 2026. You can now submit to your auditor."

**Why this matters beyond compliance:**
- Converts LegalGraph from Rachel's personal tool to a multi-user departmental platform
- Creates a second Jennifer touchpoint per quarter — building Jennifer's familiarity with the product and accelerating upsell conversations
- The approval trail is a concrete artefact Jennifer can show the CFO and board as evidence of rigorous AI oversight

**Emotional state:**
- Rachel: *"I'm covered. The CFO signed off before this went out."*
- Jennifer: *"I reviewed this. My name is on it, and I can see exactly what the AI did."*

---

### Phase 6 — Audit Defense (Days to weeks after submission, J2)

**What happens:**
The auditor receives Rachel's report. During fieldwork they ask: *"What clause supports the ROU asset value of $2.1M in this filing?"*

**Without LegalGraph (current):** Rachel opens the PDF, Ctrl+F's for dollar amounts, manually finds §7.2, copies the text into an email reply. 30–60 minutes.

**With LegalGraph (ideal — requires BUG-006 + BUG-009):** Rachel clicks the "ROU asset value" field in LegalGraph → clause PDF viewer opens → clause text and section reference are visible → she copies both into her auditor reply. Under 2 minutes.

**This is the reference-customer moment.** If Rachel can answer the auditor in 2 minutes with a clause citation, she will tell every compliance peer she knows. The audit defense journey is the highest-leverage acquisition channel LegalGraph has — and it costs nothing beyond shipping BUG-006.

**Critical dependency:** Clause links must remain active on historical analyses (BUG-009). If LegalGraph forgets last quarter's analysis, Rachel cannot use the clause viewer to answer auditor questions after the fact. BUG-006 without BUG-009 is incomplete.

**Emotional state:** Pride and confidence. *"I can show you exactly where every number came from."*

---

### Phase 7 — Return (Next Quarter, J3 + J5)

**What happens:**
90 days later, Rachel comes back. She needs to re-analyse existing leases for changes and process any new leases added to the portfolio.

**The re-entry problem (without BUG-009):**
Rachel has forgotten which leases she processed, which flags she resolved, which IBR she used, and whether any leases were modified. She starts from scratch every quarter. LegalGraph has no institutional memory.

**Ideal return state (requires BUG-009):**
Dashboard shows on login: *"Last analysed: March 15. 6 leases — 4 ready to re-analyse, 1 new lease detected, 1 modification detected in your SF HQ lease since last analysis."*

Features this enables:
- One-click "Re-analyse all" for unchanged leases
- Delta view for leases where something changed (J5): *"Annual rent changed from £120,000 to £132,000 (CPI escalation). ROU asset value updated."*
- Saved IBR carries forward — Rachel doesn't re-enter the discount rate each quarter
- Last quarter's flags and resolutions visible — Rachel can see what she approved and why

**Emotional state:** Renewed trust. *"It remembered where I left off. This is actually saving me time."*

---

### Phase 8 — Batch Session Workflow *(New — v1.1, J8)*

**Note:** Phase 8 is not sequential — it runs in parallel with Phases 1–5 whenever Rachel has more than 3 leases to process. It is the meta-layer of her quarterly session.

**What happens:**
Rachel has 8–12 leases to process before quarter-end. She needs to work through them in priority order, track progress across the session without losing her place, and know when the full portfolio is done.

**Current state:** No session-level progress tracking exists. Rachel manages her own queue mentally or with a sticky note.

**Ideal session experience:**
- Dashboard header shows: *"Session progress: 3 of 8 leases complete. Estimated time remaining: ~35 minutes."*
- Intelligent triage suggestion: *"Start with these 3 leases — they have unresolved High flags from last quarter."* *(GA+1)*
- Once-per-session consent: consent fires once at session start, not before each of 8 analyses *(consent fatigue fix)*
- If a webhook times out on lease 5, a clear error and retry option appears — Rachel doesn't lose progress on leases 1–4

**Priority ordering heuristic (to build):**
1. Leases with unresolved flags from last quarter (highest risk to report gate)
2. Leases approaching expiry within 90 days (time-sensitive)
3. Leases with detected modifications since last analysis (compliance impact)
4. New leases not yet analysed
5. Unchanged leases from last quarter (lowest priority — often auto-approvable)

**Emotional state:** Focused and in control. *"I know exactly what's left and I'm going to finish on time."*

---

## Journey B: Jennifer's Buyer Evaluation + Ongoing Sign-Off Role

Jennifer has two distinct interactions with LegalGraph — an initial evaluation (once, at purchase) and an ongoing quarterly sign-off (via J10). Both must be designed for someone who is not a daily product user.

### B1 — Initial Evaluation (Once)

**Rachel brings it to her attention:**
Rachel has completed Journey D (first analysis) and has time-savings data. She brings it to Jennifer's 1:1 with a specific ask: *"I want to replace our Excel process with this."*

**Jennifer's four evaluation questions (from JTBD J6):**

| Question | What Jennifer needs to see |
|---|---|
| "Where does our contract data go?" | Consent modal naming Anthropic Claude API; data retention policy; DPA with deletion contact |
| "Will auditors accept it?" | Clause trail in the report PDF; report gate (High flags block export); PCAOB AS 1105 compliance one-pager |
| "What does it cost?" | $X/year vs. Rachel's current labour cost (~$14–20K/year at $300/hour for 4–6 hours × 4 quarters × 3+ leases) |
| "What happens if it's wrong?" | "Not legal advice" disclaimer; human review requirement before export; "manually verified" badges on edited fields; Jennifer's own sign-off in the audit trail |

**Jennifer's moment of truth:**
She reads the consent modal. If it names Anthropic Claude API explicitly and provides a data deletion contact, she concludes the vendor is serious about governance. If it doesn't, she flags a data concern that stalls the purchase.

**Jennifer approves:**
Signs the Beta NDA and DPA. Rachel gets a full account.

**Design implication:** Jennifer-facing materials — consent modal, report cover page, PCAOB AS 1105 one-pager, DPA template — are as important as the product UX. They are her primary evaluation surface and none require engineering to improve.

---

### B2 — Quarterly Sign-Off (Ongoing, J10)

**What happens:**
Each quarter, after Rachel generates the report (Phase 5), Jennifer receives an email requesting her approval before external submission. This is a new interaction in v1.1 that did not exist in the v1.0 journey.

**Jennifer's flow (email-based, no LegalGraph login required):**
1. Receives email: *"Rachel has generated the Q2 IFRS 16 compliance report for 6 leases. Please review and approve before submission to [Auditor firm]."*
2. Clicks link → reads the report PDF in browser
3. Clicks "Approve this report"
4. Approval is timestamped and logged in the LegalGraph audit trail
5. Rachel is notified; she submits to the auditor

**What makes this work for Jennifer:**
- No new login or account required — email link is frictionless
- The request is specific: one report, one action, one click
- Her approval is meaningful: it shows up on the report cover page with her name and timestamp

**What this unlocks for LegalGraph:**
- Jennifer becomes a quarterly active stakeholder, not just a one-time buyer
- Her name on every compliance report creates a personal incentive to maintain quality standards
- Two-persona accounts have significantly higher retention and expansion revenue

---

## Journey C: David's Term Lookup

David's journey is 90 seconds, not 45 minutes. One question, one lease, one answer.

**His flow:**
1. Opens LegalGraph dashboard
2. Searches the portfolio table by lease name *(requires BUG-009 for real data)*
3. Clicks into the lease
4. Extracted terms grid is the first visible section *(live — correct)*
5. Finds the field (e.g., renewal options, notice period)
6. Reads the clause section reference — optionally clicks through to source text *(BUG-006)*

**What the product must do for David:**
- Portfolio table must be searchable and sortable by lease name and last-analysed date
- Last-analysed date must be visible — David needs to know if Rachel ran this recently or if data is stale
- Clause section reference must be visible without clicking through — David is in a hurry

**Emotional state:** Transactional. *"Just give me the renewal option clause reference. I have a call in 10 minutes."*

**Gap from JTBD v1.1:** David's journey is currently only partially served. The extracted terms grid works if David navigates to a specific analysis. But he cannot search the portfolio to *find* the right lease (portfolio table is static demo data, BUG-009). Fix BUG-009 and David's job is effectively solved.

---

## Journey E: Auditor Verification *(New — v1.1, J11)*

The auditor is the ultimate gatekeeper of whether LegalGraph's output is accepted. They have their own job — independently verifying AI-generated figures from source contracts — which LegalGraph must support without requiring them to access Rachel's account.

**Circumstance:** Audit fieldwork, January–March for calendar-year reporters. The auditor has received Rachel's PDF compliance report and is performing substantive procedures under PCAOB AS 1105.

### E1 — Receive the Report

The auditor receives Rachel's compliance report PDF. Under the current (incomplete) PDF format, they see field values and section references but no clause text. They must either:
- Accept section references and check the source contracts themselves (takes hours per client)
- Request a resubmission with clause evidence (triggers a revision cycle)

**Target state:** The report PDF contains clause excerpt text inline per field. The auditor can verify any line item without accessing the source PDF.

### E2 — Verify a Field (The one-click test)

**Auditor's question:** *"What clause supports the ROU asset value of $2.1M?"*

**With full LegalGraph output (requires BUG-006 + complete PDF export):**
1. Auditor sees the ROU asset value row in the PDF
2. Next to the value: *"§7.2 — Lease Term and Payments (page 14): 'The annual rental payment shall be £140,000 per annum for the initial term of 10 years...'"*
3. Auditor verifies the clause independently in the source contract
4. No revision request needed

**Emotional state:** Efficient and confident. *"I can see exactly where this number came from. My independence is maintained."*

### E3 — Auditor Portal (GA+1)

For auditors who review multiple LegalGraph clients, a read-only auditor portal eliminates even the PDF step. The auditor receives a shareable link — no LegalGraph account required — with:
- All lease analyses for the client, filterable by field
- Active clause citations that open source text inline
- Audit trail showing what was AI-extracted vs. manually verified, and when
- PCAOB AS 1105 compliance statement

**Why this is a competitive moat:** No current mid-market lease accounting competitor has built an auditor portal. The first vendor to ship it becomes the default tool for firms whose auditors demand clause-level evidence — a demand that is increasing as PCAOB AS 1105 enforcement matures.

---

## Moments of Truth Summary

| Journey | Phase | Moment of Truth | Current Status | Impact if Missing |
|---------|-------|----------------|----------------|-------------------|
| D | First extraction | AI correctly extracts known lease | ✅ Live (if accuracy holds) | Rachel abandons; activation fails |
| D | First report | IBR flag has actionable guidance | ❌ Not built (J9) | Rachel stalls on first lease; abandons to Excel |
| A | Re-entry | "X leases ready / Y need attention" counter | ❌ Not built (BUG-009) | Rachel wastes 10+ min re-orienting |
| A | Upload | Consent fires once per session, not per analysis | ❌ Not built (J8) | Rachel loses flow mid-session; drops off |
| A | Upload | Webhook completes in <25 seconds | ✅ Live (with 25s timeout) | N/A |
| A | Review | Clause citation opens source text in PDF | 🔄 BUG-006 | Rachel verifies every field manually; trust stalls |
| A | Review | Per-field confidence scores guide spot-checking | 🔄 n8n Phase 1 (UI present, not wired) | Rachel checks all fields regardless of confidence |
| A | Flag resolution | IBR flag has "What do I do?" guidance + save default | ❌ Not built (J9) | Most common activation stall; session abandoned |
| A | Report export | PDF contains full clause trail + AI disclosure + cover page | 🔄 Partial | Auditor rejects; revision cycle triggered |
| A | Internal sign-off | Jennifer receives email approval request | ❌ Not built (J10) | No internal audit trail for AI oversight |
| A | Audit defense | Re-open last quarter's analysis with active clause links | ❌ BUG-009 | Rachel answers auditor questions manually (30–60 min) |
| A | Return | Dashboard shows what changed since last quarter | ❌ BUG-009 | Rachel re-analyses everything from scratch |
| B | Evaluation | Consent modal names Anthropic Claude + deletion contact | ✅ Live | Jennifer flags data governance concern; blocks purchase |
| B | Quarterly sign-off | Jennifer receives email approval link | ❌ Not built (J10) | No internal oversight trail |
| C | Term lookup | Portfolio table searchable by lease name | 🔄 Static (BUG-009) | David emails Rachel instead; 10–30 min delay |
| E | Auditor verification | Report PDF contains inline clause excerpts | 🔄 Partial | Auditor requests resubmission |
| E | Auditor portal | Read-only shareable link with active clause citations | ❌ GA+1 | Auditors verify manually; LegalGraph not the default |

---

## The Emotional Arcs

**Rachel — Quarterly Compliance Cycle:**

```
TRIGGER    RE-ENTRY    UPLOAD     REVIEW     FLAGS      SIGN-OFF    SUBMIT     AUDIT
Dread ───► Oriented ──► Cautious ──► Skeptical ──► Focused ──► Relieved ──► Confident ──► Pride
           (J3)         optimism     analytical   (J9 IBR    (J10)       (J2 clause    (reference
                                     (J4 trust)   guidance)               viewer)       customer)
```

**Rachel — First Analysis (Journey D):**

```
ARRIVAL    FIRST EXTRACT   FLAGS         FIRST REPORT    DECISION
Curious ──► Skeptical ────► Concerned ──► Impressed ────► "I'll use this"
            (ground        (IBR flag:     (if report
            truth test)     J9 guidance   looks pro)
                            critical)
```

**Jennifer — Evaluation + Ongoing:**

```
INITIAL EVAL    DPA SIGNED    QUARTERLY SIGN-OFF    BOARD MEETING
Cautious ──────► Approved ───► Informed ────────────► Proud
(4 questions)   (30 min)      (email approval)       (AI compliance
                                                       done right)
```

The product must carry Rachel from dread to pride within a single 45-minute session. Every friction point risks her abandoning to Excel under deadline pressure.

---

## Prioritised Journey Gaps

### P0 — Must ship before GA (blockers)

1. **BUG-009: Persistent per-account storage** — without it, Journey A Phase 7 (return), J3 (portfolio status), J5 (amendment tracking), and Journey C (David's lookup) are all non-functional. Every other GA feature that depends on history is blocked.
2. **BUG-006: Clause PDF viewer** — the trust anchor for Journey A Phase 3 and the entire Journey E (auditor verification). Without it, the audit defense moment fails and the reference-customer conversion doesn't happen.
3. **J9: IBR guidance copy on discount rate flag** — a copy change requiring no engineering; eliminates the most common activation stall in both Journey D and Journey A Phase 4.
4. **Full PDF export structure** — cover page, per-field clause citations, AI disclosure, flag resolution log. Required for PCAOB AS 1105 compliance and Journey E.

### P1 — Ship at GA

5. **Dashboard "Ready / Needs Attention" counter** — Rachel's re-entry orientation signal (J3). One sprint. Requires BUG-009.
6. **Once-per-session consent** — eliminates consent fatigue across J8 batch sessions. Simple logic change.
7. **Per-field confidence scores wired from n8n** — color dots are in the UI; wire them to real pipeline values. Transforms Phase 3 trust behaviour.
8. **J10: Email-based CFO approval flow** — converts LegalGraph from a single-user tool to a two-persona departmental platform.

### P1 GA — Ship at GA

9. **J8: Session-level progress tracker** — "X of Y leases complete" counter for batch sessions with 4+ leases.
10. **Company-level IBR storage** — enter the discount rate once per company; carry it forward across leases and quarters.

### GA+1

11. **J5: Amendment delta view** — "Field X changed from Y to Z since last analysis." Requires BUG-009.
12. **Proactive email nudge** — "Your leases from last quarter are ready to re-analyse. Q2 close is in 14 days."
13. **Intelligent triage** — "Start with these 3 leases — they have unresolved flags."
14. **J11: Auditor portal** — read-only shareable link; first-mover opportunity; no competitor has built this.
15. **Journey D optimisation** — guided first-lease recommendation, post-extraction "first win" prompt.

---

*Journey owner: Product · Last updated: 2026-05-08*
*Personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate), External Auditor (v1.1)*
*Framework grounded in: JTBD v1.1 · PRD v1.1 · user-research-legal-ai-2026.md · market-research-legal-ai-2026.md*
