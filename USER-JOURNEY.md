# LegalGraph — Ideal User Journey
**Version 1.0 | Date: 2026-05-06**
**Owner: Product**
**Grounded in: PRD v1.1 · MARKET-RESEARCH.md · USER-RESEARCH.md**

---

## Framing Principle

Rachel logs in **four times a year** under deadline pressure. Every screen must be operable by someone who hasn't touched the tool in 90 days. The journey is not a daily SaaS loop — it is a **quarterly compliance cycle** with a hard finish line: an audit-accepted report. Design every touchpoint with that constraint in mind.

---

## The Three Journeys

| Journey | Persona | Frequency | Success State |
|---------|---------|-----------|---------------|
| **A. Compliance Cycle** | Rachel (Compliance Lead) | Quarterly | Audit-ready report exported; no auditor revision requests |
| **B. Buyer Evaluation** | Jennifer (GC / CFO) | Once (at purchase) | Approved budget; signed DPA; Beta kickoff |
| **C. Term Lookup** | David (Senior Associate) | Ad hoc | Specific field answered in <2 minutes without opening the PDF |

---

## Journey A: Rachel's Quarterly Compliance Cycle

### Phase 0 — Trigger (T-14 days before quarter close)

**What happens:**
Rachel realises quarter-end is two weeks away. She knows the IFRS 16 schedule is due. The old workflow is: open shared drive → find contract PDFs → open Excel template → start extracting manually. That takes her 4–6 hours and always has errors.

**Emotional state:** Anticipatory dread. She knows this is going to be painful.

**Trigger types (from market research):**
- Calendar: quarter-end is approaching (most common)
- Auditor: revision request from last quarter came back
- Event: a new lease was signed or amended last month
- External: auditor recommended a tool at last year's meeting

**What LegalGraph must do here:**
- Targeted email: "Q2 reporting season starts in 14 days. Your 4 leases from last quarter are ready to re-analyze." *(GA+1 — not yet built)*
- The product cannot rely on Rachel remembering to log in.

---

### Phase 1 — Re-entry (First 60 seconds after login)

**What happens:**
Rachel opens the app. She hasn't used it since last quarter. She needs to immediately understand: *Where do I pick up? What's left to do?*

**Current state (LegalGraph today):**
Dashboard shows the portfolio table with 4 demo leases, status pills, and extraction %. Upload zone is prominent. This is correct.

**Ideal state:**
The dashboard should answer one question instantly: *"How many of your leases are ready to report, and how many still have issues?"*

```
[ 2 leases ready to report ]  [ 2 leases need attention ]
```

A "leases ready to report" counter is Rachel's primary re-entry signal. It doesn't exist yet.

**Moments of truth:**
- ✅ She sees the portfolio immediately — no empty state, no wizard
- ❌ She doesn't know which leases are unblocked vs. which need work at a glance

**Design implication:** Add "Ready / Needs attention" split count to the dashboard header. This is the single most impactful addition to the re-entry experience.

---

### Phase 2 — Upload (2–5 minutes)

**What happens:**
Rachel uploads a lease contract PDF. This may be a new lease she hasn't processed before, or a re-upload of an existing lease to catch any changes.

**Ideal flow:**
1. Drag or click to upload the PDF
2. Select analysis type *(now implemented as intent dropdown)*
3. Click "Analyze Contract"
4. Consent modal fires — she reads it once and remembers it thereafter
5. Loading screen with rotating quips keeps her engaged during the 15–25s analysis

**Friction points to eliminate:**
- File format confusion: PDF is the correct format, but Rachel often only has a scanned image-PDF. The app needs to handle this gracefully or flag it early rather than returning empty extraction.
- Large file upload on slow connections: 50MB max is generous but upload progress should be visible.
- Consent fatigue: once Rachel has given consent, repeated consent modals on every analysis erode trust.

**Emotional state during upload:** Cautious optimism. "Let's see if this actually works."

**Ideal loading experience:**
- Quips keep it light; progress bar moves visibly
- The card is compact — fits in view without scrolling *(now implemented)*
- Total analysis time: <25 seconds for a standard fixed-rent lease

---

### Phase 3 — Review Extracted Terms (5–15 minutes)

**What happens:**
Rachel sees the analysis results. She reviews extracted fields and decides whether to trust each one. This is the highest-stakes moment in the product — if she doesn't trust the output, the entire workflow collapses.

**What she does, in order:**
1. Scans the risk score and level first — a "Medium Risk" headline is her entry point
2. Reads the AI summary paragraph — checks if it matches what she knows about the lease
3. Goes through "Extracted Lease Terms" row by row — spot-checks 2–3 high-value fields against the contract she knows well
4. Identifies missing fields — discount rate is almost always missing; she makes a note to add the IBR
5. Checks risk flags — resolves or dismisses each one before she can generate a report

**Trust behaviors (from user research):**
- Rachel will not accept AI output for high-value fields (annual rent, lease term) without verifying against the source PDF. She will open the PDF in another tab and check.
- She edits fields she knows are wrong. The edit-in-place flow directly supports this.
- She reads the clause references — *"§2.1 — Lease Commencement"* gives her enough to verify without clicking through.

**Moments of truth:**
- ✅ Score ring and risk level are instantly readable
- ✅ Edit mode lets her correct AI output without restarting
- 🔄 **Clause citation → PDF viewer (BUG-006):** The moment Rachel clicks a clause reference and the source text appears, she stops doubting the AI. This is the trust anchor. Without it, she opens the PDF herself every time.
- ❌ No per-field confidence scores: Rachel can't tell which fields the AI is sure about vs. guessing

**Ideal confidence signal:**
Each extracted term row should show: green dot (high confidence >90%), amber dot (medium 70–90%), red dot (low <70%) next to the value. Red dot fields should prompt her to verify. This reduces spot-checking from "everything" to "only the uncertain fields."

**Emotional state:** Analytical, slightly skeptical. "Is this right? Let me check the rent figure."

---

### Phase 4 — Risk Flag Resolution (10–20 minutes)

**What happens:**
Rachel works through the risk flags. High-severity flags must be resolved before she can export. Medium and low flags are informational.

**The discount rate scenario (most common):**
- Flag: "Discount rate missing — High severity"
- Rachel's question: "What rate do I use?"
- Current state: Flag text references IFRS 16.26 but doesn't tell her the IBR for this contract
- **Ideal state:** The flag provides a calculator or guidance: "Your treasury team can provide the IBR. Common approach: use your company's average cost of debt at the lease commencement date. IFRS 16.26 requires documentation of the rate used."

**Emotional state:** Frustrated but purposeful. The flags give her a clear checklist. She knows what "done" looks like.

**Design implication:** Each High-severity flag needs a "What do I do now?" action guidance block — not just a description of the risk, but a concrete next step. This is the IBR guidance gap identified in user research.

---

### Phase 5 — Report Generation & Export (2–5 minutes)

**What happens:**
All High flags are resolved. Rachel clicks "Generate IFRS 16 Report." A PDF is generated with LegalGraph branding, a timestamp, all extracted fields, clause citations, and a cover page noting AI-assisted extraction.

**What this PDF must contain (from auditor evidence requirements):**
- Cover page: lease name, analysis date, standard applied (IFRS 16 / ASC 842), LegalGraph version, "AI-assisted extraction — reviewed and approved by [Rachel's name]"
- Per-field: value, clause reference (section + page), confidence indicator
- Risk flag summary: which flags were raised, how each was resolved or acknowledged
- Audit trail: extraction timestamp, model used, any manual edits flagged with "manually verified" badge

**Current status:** PDF export is a P0 requirement in the PRD but is not yet fully built. The button exists; the output format needs the above structure.

**Emotional state:** Relief. "I'm done. Now I just need to send this."

---

### Phase 6 — Audit Defense (Days/weeks after submission)

**What happens:**
The auditor receives Rachel's report. They ask a specific question: *"What clause supports the ROU asset value of $2.1M?"*

**Current state (without LegalGraph):** Rachel opens the PDF, searches manually, finds §7.2, copies the text into an email. Takes 30–60 minutes.

**Ideal state (with LegalGraph):** Rachel clicks the "ROU asset value" field in LegalGraph → clause viewer opens → she copies the clause text and section reference into her auditor reply in under 2 minutes.

**This is the moment that converts Rachel from a user to a reference customer.** If she can answer the auditor in 2 minutes, she will tell every compliance peer she knows.

**Design implication:** The clause PDF viewer (BUG-006) is not a reporting feature — it is an audit defense feature. It needs to work on the final submitted report, not just during analysis. Rachel needs to re-open last quarter's analysis and still have the clause links active.

---

### Phase 7 — Return (Next Quarter)

**What happens:**
90 days later, Rachel comes back. She needs to re-analyze the same leases (to catch any modifications or data changes) and process any new leases added to the portfolio.

**The re-entry problem:**
Rachel has forgotten which leases she processed last quarter, which flags she resolved, and whether any leases were modified since. There is no institutional memory unless LegalGraph persists the state.

**Critical dependency:** Persistent per-account storage (BUG-009 in PRD) is a prerequisite for a functional return journey. Without it, Rachel starts from scratch every quarter.

**Ideal return state:**
- Dashboard shows: "Last analyzed: March 15. 4 leases. 1 lease expires in 90 days. 1 lease modification detected since last analysis."
- One-click "Re-analyze all" for unchanged leases
- Delta view for leases where something changed

**Emotional state:** Renewed trust. "It remembered where I left off. This is actually saving me time."

---

## Journey B: Jennifer's Buyer Evaluation

Jennifer evaluates LegalGraph once. She will not use the product daily — she needs to be convinced in a 30-minute conversation or a well-crafted 1-pager.

### Her evaluation arc:

**1. Rachel brings it to her attention**
Rachel has tried LegalGraph (likely through a free trial or Beta invite) and has time savings data. She brings it to Jennifer's 1:1 with a specific ask: "I want to replace our Excel process with this."

**2. Jennifer asks four questions:**
- "Where does our contract data go?" → Data retention policy, Anthropic API disclosure, DPA
- "Will auditors accept it?" → Clause trail, report gate, Beta auditor feedback
- "What does it cost?" → $15–25K/year vs. $32,000/year in Rachel's labour cost
- "What happens if it's wrong?" → Not legal advice disclaimer, human edit override, sign-off requirement

**3. Jennifer's moment of truth:**
She reads the consent modal. If it names Anthropic Claude API explicitly and gives a deletion contact, she concludes the vendor is serious about disclosure. If it doesn't, she flags a data governance concern.

**4. Jennifer approves:**
She signs the Beta NDA and data processing agreement. Rachel gets a full account.

**Design implication:** Jennifer-facing materials (consent modal, report cover page, privacy policy) are as important as the product UX. They are her primary evaluation surface.

---

## Journey C: David's Term Lookup

David's journey is 90 seconds, not 45 minutes. He opens LegalGraph to answer one question about a specific lease.

### His flow:
1. Navigates to the Leases dashboard
2. Finds the lease by name in the portfolio table
3. Clicks "View report"
4. Goes straight to the extracted terms section
5. Finds the field he needs (e.g., renewal options)
6. Optionally clicks the clause citation to verify

**What the product must do for David:**
- The portfolio table must be searchable/filterable by lease name
- The extracted terms grid must be the first visible section on the analysis screen (it is today)
- Every field must have a visible clause reference — David doesn't want to re-run analysis, just verify a value

**Emotional state:** Transactional. "Just give me the renewal option term and clause reference. I have a call in 10 minutes."

---

## Moments of Truth Summary

| Phase | Moment of Truth | Current Status | Impact if Missing |
|-------|----------------|----------------|-------------------|
| Re-entry | "How many of my leases are ready to report?" | ❌ Not built | Rachel re-builds mental context manually |
| Upload | Progress bar moves — analysis is working | ✅ Live | N/A |
| Review | Clause citation opens source text in PDF | 🔄 BUG-006 | Rachel opens PDF manually; trust stalls |
| Review | Per-field confidence score guides spot-checking | 🔄 Phase 1 n8n | Rachel checks every field instead of uncertain ones |
| Risk resolution | "What do I do about a missing discount rate?" | 🔄 Partial | Rachel escalates to auditor unnecessarily |
| Export | PDF contains full clause trail | 🔄 Not fully built | Auditor asks for evidence Rachel can't produce from the PDF |
| Audit defense | Re-open last quarter's analysis with active clause links | ❌ No persistence | Rachel answers auditor questions manually |
| Return | "What changed since last quarter?" | ❌ No persistence | Rachel re-analyzes everything from scratch |

---

## The Emotional Arc (Rachel)

```
TRIGGER          UPLOAD           REVIEW           FLAGS            EXPORT           AUDIT
Dread   ──────► Cautious ──────► Skeptical ──────► Purposeful ────► Relief  ──────► Pride
                optimism          analytical        frustrated                       (reference
                                  spot-checking     but focused                       customer)
```

The product must carry Rachel from dread to pride within a single 45-minute session. Every friction point in the middle risks her abandoning to Excel under deadline pressure.

---

## Prioritised Journey Gaps (MVP → GA)

### Must fix before Beta (MVP blockers)
1. **Persistent storage** — without it, Journey A Phase 7 (return) doesn't exist
2. **IBR guidance copy on discount rate flag** — Rachel needs to know what to do, not just that something is missing
3. **Working webhook pipeline** — without live extraction, the entire journey is demo data

### Must fix at GA
4. **Clause PDF viewer (BUG-006)** — the single feature that converts the audit defense journey from painful to instant
5. **Dashboard "ready / needs attention" counter** — Rachel's re-entry orientation signal
6. **PDF export with full audit trail structure** — cover page, per-field clause citations, flag resolution log

### Ship in GA+1
7. **Quarterly comparison / delta view** — amendment tracking
8. **"Leases ready to report this quarter" email nudge** — re-engagement before Rachel forgets
9. **Auditor portal** — first-mover opportunity; no competitor has built this yet

---

*Journey owner: Product · Last updated: 2026-05-06*
*Personas: Rachel (Compliance Lead), Jennifer (GC/CFO), David (Senior Associate)*
