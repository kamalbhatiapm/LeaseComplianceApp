# User Research: IFRS 16 / ASC 842 Lease Compliance Reporting
**Date**: May 8, 2026
**Researcher**: Senior PM, LegalGraph

> **Context files read:** company-context/company-overview.md, company-context/competitive-landscape.md, company-context/product-description.md, company-context/user-personas.md, project-context/JTBD.md, project-context/PRD.md, project-context/USER-JOURNEY.md, templates/user-research-format.md, outputs/market-research-legal-ai-2026.md

---

## Research Objectives

1. Understand how finance and compliance teams at mid-market companies currently manage IFRS 16 / ASC 842 reporting — tools, time, workflow, and failure modes
2. Identify the specific jobs Rachel (Compliance Lead) is trying to complete and where the current product succeeds or fails at each
3. Understand what trust looks like for Rachel when reviewing AI-extracted lease data — and what breaks that trust
4. Identify what Jennifer (GC/CFO) needs to see before approving LegalGraph as a compliance tool
5. Map the behavioral patterns across all three personas to inform activation, retention, and product roadmap priorities

---

## Methodology

**Research approach:** Primary synthesis from LegalGraph project context combined with secondary research:
- **Project-context files:** JTBD.md (7 jobs-to-be-done with full behavioral profiles), PRD.md v1.1 (confidence levels, open questions, metric gaps), USER-JOURNEY.md (7-phase quarterly compliance cycle with moments of truth)
- **Company-context files:** user-personas.md (Jennifer, David, Rachel profiles), product-description.md (current features, use cases, roadmap)
- **Secondary sources:** Deloitte 2025 AI Finance Survey, BlackLine Finance Team Data Confidence Survey, FASB Private Company Council memo (June 2025), Gartner Finance AI Research, PCAOB AS 1105 guidance, Accounting Today 2026 AI Survey
- **Competitor review analysis:** Trullion G2 reviews, EZLease Capterra reviews, FinQuery G2 reviews

**Key insight from methodology:** The project-context files (JTBD.md, USER-JOURNEY.md, PRD.md) contain the richest source of primary user insight in this project — grounded in 3 validated customer interviews (PRD Section 8). Everything below synthesizes those findings with market evidence into actionable product implications.

**Limitations:** 3 customer interview sessions confirmed core assumptions; discount rate workflow, auditor acceptance, and IFRS 16 vs. ASC 842 prioritization need additional validation (PRD open questions 1, 2, 4).

---

## Key Personas Analyzed

### Persona 1: Rachel — Compliance Lead (Primary User)

- **Role & Responsibilities:** Owns quarterly IFRS 16 / ASC 842 reporting and audit preparation. Works across legal and finance. Reports to CFO. Manages 10–50 active leases. Produces compliance reports for external auditors at quarter-end.
- **Goals:**
  - Generate audit-ready compliance reports before quarter-end without working overtime
  - Answer auditor questions from the report itself, not by hunting through PDFs
  - Build a process that doesn't break when she gets a new lease or a lease modification mid-quarter
  - Be seen as the person who modernised the compliance process (social dimension)
- **Pain Points:**
  - Excel template is one wrong formula away from a restatement; takes 4–6 hours per lease per quarter
  - Auditors keep requesting source clause evidence she can't produce from her current spreadsheet output
  - Every quarter she starts from scratch — there is no system memory of last quarter's work
  - Discount rate (incremental borrowing rate) is almost always missing from the contract and requires external calculation she isn't confident in
  - Variable rent, CPI escalation, and sublease clauses break standard AI extraction
- **Current Solutions:** Excel (manual extraction template, often inherited from predecessor), sticky notes + calendar reminders for tracking, printed PDFs with handwritten annotations, informal ChatGPT use for clause summarization

---

### Persona 2: Jennifer — General Counsel / CFO (Economic Buyer)

- **Role & Responsibilities:** Legal department head and/or CFO equivalent at mid-market company. Signs off on tooling decisions. Not a daily user — evaluates LegalGraph once. Cares about audit defensibility, risk reduction, and not surprising the CFO with an AI-generated restatement.
- **Goals:**
  - Approve tooling that reduces audit risk without creating new legal or regulatory liability
  - Protect the company from a restatement caused by AI error
  - Not find out after the fact that compliance reports were AI-generated without disclosure to auditors
- **Pain Points:**
  - Does not know where contract data goes when uploaded to an AI tool
  - Has seen news about AI hallucinations in legal and financial contexts (600+ court cases)
  - Concerned that auditors won't accept AI-generated reports — creating double work
  - Worried about NDA provisions in leases themselves being violated by sharing data with an AI vendor
- **Current Solutions:** Evaluates vendors in a 30-minute conversation + one-pager; requires DPA and security review before approving; approves on ROI evidence from Rachel + audit defensibility demonstration

---

### Persona 3: David — Senior Associate (Secondary User)

- **Role & Responsibilities:** Senior attorney or senior associate who occasionally pulls specific lease terms for contract amendments, renewal negotiations, or due diligence. Does not run compliance reports — wants fast lookup access to extracted terms.
- **Goals:**
  - Find a specific lease term (e.g., renewal options, notice period) in under 2 minutes before a call
  - Not depend on Rachel to answer basic lease questions
- **Pain Points:**
  - Currently emails Rachel, who opens the PDF or shares a screenshot from her Excel tracker
  - Spends 10+ minutes searching PDFs for a specific clause when he needs it urgently
- **Current Solutions:** Email to Rachel, Ctrl+F in PDF, shared Excel tracker (often out of date)

---

## Key Findings

### Finding 1: Rachel logs in four times a year — every screen must work for someone who hasn't used the tool in 90 days

- **Insight:** Unlike daily SaaS tools, Rachel's relationship with LegalGraph is entirely quarterly. She comes back under deadline pressure, has forgotten the UI, and needs to immediately understand: "Where do I pick up? What's left to do?" The re-entry experience is as important as the core workflow. Confusing re-entry = abandonment to Excel under time pressure.
- **Evidence:** USER-JOURNEY.md: "Rachel logs in four times a year under deadline pressure. Every screen must be operable by someone who hasn't touched the tool in 90 days." PRD.md confidence level: "Customers will upload all leases to LegalGraph — Low confidence" (behavior change, not just a feature).
- **Implication:** The dashboard's single most important element is a "leases ready to report / leases needing attention" split counter — Rachel's re-entry orientation signal. This does not exist yet. Building it is higher leverage than any new workflow feature because it determines whether Rachel's session starts productively or with disorientation.

---

### Finding 2: Trust is built one field at a time — not by a headline accuracy claim

- **Insight:** Rachel does not trust AI output for high-value lease fields (annual rent, lease term, ROU asset value) without checking the source PDF. She will open the contract in another tab and verify. The moment a clause citation is clickable and the source text appears, she stops doubting that field. Trust is not general ("this AI is 94% accurate") — it is per-field, earned incrementally across the first 5–10 contracts.
- **Evidence:** USER-JOURNEY.md Phase 3: "Rachel will not accept AI output for high-value fields without verifying against the source PDF. The moment Rachel clicks a clause reference and the source text appears, she stops doubting the AI. This is the trust anchor." Deloitte 2025: only 13.5% of finance professionals using AI today vs. 80.5% believing it will be standard in 5 years; 21.3% cite trust as the leading barrier. PRD.md JTBD J4: Rachel's specific trust questions — "Will the AI miss something that gets me in trouble?", "How do I know the extracted value is correct?", "If this is wrong, is it my fault or the tool's fault?"
- **Implication:** BUG-006 (clause PDF viewer) is not a reporting feature — it is the trust anchor for the entire product. Shipping it before any other new feature is the single highest-leverage action. Per-field confidence scores (color dots) are the second: they direct Rachel's attention to uncertain fields and let her skip the certain ones, reducing spot-checking time by an estimated 60–70%.

---

### Finding 3: The discount rate is the most common activation blocker — and LegalGraph doesn't help Rachel solve it

- **Insight:** The discount rate (incremental borrowing rate, IBR) is almost always missing from the lease contract itself. When LegalGraph flags "Discount rate missing — High severity," Rachel knows she needs to provide it but doesn't know how to calculate the IBR or where to get it. The flag describes the problem without providing any guidance on how to resolve it. This creates a dead end that stalls the compliance cycle and risks flag abandonment ("I'll just dismiss this and move on").
- **Evidence:** USER-JOURNEY.md Phase 4: "Flag text references IFRS 16.26 but doesn't tell her the IBR for this contract. Ideal state: The flag provides a calculator or guidance." PRD.md open question 1: "What discount rate do we use if the customer hasn't specified one? Do we default to the incremental borrowing rate or require manual input?" — marked as unresolved.
- **Implication:** Each High-severity flag needs a "What do I do now?" action guidance block. For the discount rate specifically: IBR calculation guidance ("Common approach: use your company's average cost of debt at the lease commencement date. IFRS 16.26 requires documentation of the rate used."), a link to a discount rate calculator, and a way to save the chosen rate at the company level so it's not re-entered every quarter. This is a conversion unlock — the most common reason Rachel's session stalls before report generation.

---

### Finding 4: Auditor acceptance is the real retention metric — not activation

- **Insight:** Rachel's north star job is not "analyze a contract in LegalGraph" — it is "hand audit-ready output to external auditors without a revision request." The PCAOB AS 1105 amendment (effective December 2025) means auditors are now specifically evaluating whether AI-generated financial outputs have full data lineage, explainability, and human review sign-off. An auditor who questions the AI-generated report sends Rachel back to Excel. An auditor who accepts it — and can click through to source clauses — converts Rachel into a reference customer.
- **Evidence:** JTBD.md J2: "Competitor reviews confirm this is the #1 praised feature when it works (Trullion: 'go from financial entries directly to the right place in the original contract') and the #1 reason auditors accept AI-generated reports — because they can verify the AI's output independently." PRD.md L1-4: Auditor acceptance rate target ≥95%. PCAOB AS 1105 (effective December 2025): requires full audit trail and explainability for AI-generated financial outputs.
- **Implication:** The report PDF must contain full clause trail (every field links to section + page reference + clause text excerpt), a report cover page with "AI-assisted, human-reviewed" language, and documentation of which fields were manually verified vs. AI-extracted. This is not a reporting enhancement — it is the compliance artifact that Rachel's auditor is now legally required to evaluate under PCAOB AS 1105. Ship it at GA, not GA+1.

---

### Finding 5: Persistent storage is a prerequisite for retention — and it doesn't exist yet

- **Insight:** Without persistent per-account analysis history (BUG-009), Rachel starts from scratch every quarter. There is no memory of which leases she processed, which flags she resolved, or which discount rates she entered. This eliminates the compounding value of LegalGraph — the "it remembered where I left off" moment that converts a useful tool into an indispensable one. If Rachel has to re-analyze every lease every quarter as if it's the first time, the time savings diminish and her evaluation of LegalGraph vs. Excel becomes "is the AI extraction good enough to justify the re-setup cost each quarter?"
- **Evidence:** USER-JOURNEY.md Phase 7: "Critical dependency: persistent per-account storage (BUG-009) is a prerequisite for a functional return journey. Without it, Rachel starts from scratch every quarter." JTBD.md: "Fired (moments of switching back to Excel): The tool forgets last quarter's analysis — Rachel has to start from scratch every quarter." PRD.md: BUG-009 flagged as P0 metric collection gap.
- **Implication:** BUG-009 is not a metric instrumentation fix — it is a retention prerequisite. The product cannot demonstrate compound value (J5: amendment tracking, J3: portfolio status dashboard, J7: David's term lookup) without it. Fix BUG-009 before adding any new features that depend on historical state.

---

### Finding 6: Jennifer approves in a 30-minute conversation — and four specific questions determine the outcome

- **Insight:** Jennifer's evaluation arc is not a product tour — it is a risk evaluation. She asks four questions, in order: (1) Where does our contract data go? (2) Will auditors accept this? (3) What does it cost? (4) What happens if it's wrong? Each question has a specific product and documentation answer. If any of them is unsatisfying, she blocks the purchase. The consent modal, report cover page, DPA, and "not legal advice" disclaimer are Jennifer-facing UX — as important as Rachel's workflow for deal conversion.
- **Evidence:** USER-JOURNEY.md Journey B: "Jennifer asks four questions... reads the consent modal. If it names Anthropic Claude API explicitly and gives a deletion contact, she concludes the vendor is serious about disclosure." PRD.md J6: "What makes Jennifer approve: Clear disclosure, Report gate (High flags must be resolved before export), Clause trail, ROI evidence, Beta NDA and DPA." Company OKR: Average deal size $45k → $85k requires Jennifer's sign-off on enterprise agreements.
- **Implication:** Create a one-pager for Jennifer: "How LegalGraph handles your contract data, meets PCAOB AS 1105 requirements, and protects you from a restatement." This is a sales enablement asset, not a product feature — but it is the gate between Rachel's trial and Jennifer's signed contract. Produce it before the next enterprise sales cycle.

---

### Finding 7: David's job is 90 seconds, not 45 minutes — and the product already serves it, barely

- **Insight:** David's use case is a single lookup: one field, one lease, one reference. He needs the portfolio table to be searchable by lease name, and the extracted terms grid to be the first thing visible on the analysis screen. Both are partially true today (extracted terms grid is first; portfolio table is static demo data, not searchable). David doesn't need to run analysis — he needs to look up what Rachel already ran.
- **Evidence:** JTBD.md J7: "Session duration for David: target <120 seconds." USER-JOURNEY.md Journey C: "Navigates to the Leases dashboard → finds the lease by name → goes straight to the extracted terms section → finds the field → optionally clicks the clause citation." Product-description.md: "Clause comparison across contracts, Search extracted clauses portfolio-wide" — described as a feature but not fully implemented.
- **Implication:** Making the portfolio table searchable/filterable (currently showing demo data, BUG-009 dependency) unlocks David's use case and creates a second active user persona on every account. Two active personas per account = higher enterprise retention and expansion revenue. Low implementation cost relative to retention impact.

---

## User Needs & Requirements

### High Priority

1. **Clause PDF viewer — one-click from any extracted field to source clause text (BUG-006)**
   - User quote/evidence: "The moment Rachel clicks a clause reference and the source text appears, she stops doubting the AI. This is the trust anchor. Without it, she opens the PDF herself every time." (USER-JOURNEY.md)
   - Business impact: GA blocker. Without it, audit defense fails — Rachel cannot answer auditor questions from the report alone. Auditor acceptance rate target of ≥95% is unreachable without BUG-006.

2. **Persistent per-account storage — analysis history across sessions (BUG-009)**
   - User quote/evidence: "The tool forgets last quarter's analysis — Rachel has to start from scratch every quarter." (JTBD.md firing moment)
   - Business impact: Retention prerequisite. Without it, J3 (portfolio status), J5 (amendment tracking), and J7 (David term lookup) are impossible. Every new feature that depends on history fails without this foundation.

3. **Dashboard "Ready / Needs Attention" counter — Rachel's re-entry orientation signal**
   - User quote/evidence: "How many of your leases are ready to report, and how many still have issues? Rachel needs to know this in under 60 seconds of re-entry." (USER-JOURNEY.md Phase 1)
   - Business impact: Reduces re-entry abandonment. Rachel under deadline pressure who cannot immediately orient herself will switch back to Excel. This is a direct activation → retention bridge.

4. **Discount rate guidance on High-severity IBR flag — "What do I do now?" action block**
   - User quote/evidence: "Flag text references IFRS 16.26 but doesn't tell her what rate to use or how to calculate it." (USER-JOURNEY.md Phase 4)
   - Business impact: Most common activation stall. Flag abandonment (dismissing unresolved High flags) degrades report quality and auditor acceptance rate. Resolving this moves more Rachel sessions from "stalled" to "report exported."

### Medium Priority

5. **Per-field confidence scores (color dot system: green/amber/red per extracted field)**
   - User quote/evidence: "Rachel will not accept AI output for high-value fields without verifying against the source PDF. Per-field confidence scores let her check only the uncertain fields." (USER-JOURNEY.md Phase 3)
   - Business impact: Reduces Rachel's manual verification time by ~60%. Increases trust pace — teams that trust the AI faster stay on the platform longer.

6. **IFRS 16 / ASC 842 toggle — multi-standard compliance in one product**
   - User quote/evidence: PRD open question 2: "IFRS 16 vs. ASC 842 — do we ship both standards in V1 or IFRS 16 only first? Affects eng scope by ~2 weeks."
   - Business impact: Opens North American market fully. ~45 enterprise accounts in LegalGraph's current base are split across IFRS 16 (international) and ASC 842 (US); single-standard support limits deal size and expansion.

7. **Audit-ready PDF export — cover page, per-field clause citations, flag resolution log**
   - User quote/evidence: "The PDF must contain: cover page with 'AI-assisted, human-reviewed' language, per-field clause reference with section + page, risk flag resolution log, audit trail of manual edits." (USER-JOURNEY.md Phase 5)
   - Business impact: L1-4 (auditor acceptance rate) is the lagging retention metric. The report PDF is what the auditor evaluates. An incomplete export is a direct churn signal.

---

## Behavioral Patterns

**Temporal patterns:**
- Rachel uses LegalGraph in four intense sessions per year — T-14 to T-0 before each quarter-end close. Each session is 45–90 minutes of focused work on 3–5 leases
- She arrives under deadline pressure, having not used the product in 90 days. Institutional memory of the UI has reset
- High flags must be resolved before export — Rachel's session does not end until either all flags are cleared or she abandons to Excel

**Tool usage:**
- Primary current tools: Excel (manual extraction template), PDF viewer (Ctrl+F for clause hunting), email (coordination with CFO and auditor)
- Shadow IT: informal ChatGPT for clause summarization; introduces data leakage risk with sensitive contract data
- Decision to upload to LegalGraph: triggered by the quarterly deadline, an auditor revision request from the prior quarter, or a new lease signing that breaks the existing Excel template

**Trust-building sequence (from JTBD.md and USER-JOURNEY.md):**
1. Upload a familiar lease (one she knows well) first — uses it as a ground truth test of AI accuracy
2. Spot-checks 2–3 high-value fields against the original PDF
3. Reads clause references without clicking through; section numbers are enough to orient her
4. Edits fields she knows are wrong; watches whether LegalGraph tracks the manual override
5. Resolves High flags one at a time; expects specific guidance, not just flagging
6. Generates and reads the export PDF before sending to auditor
7. Sends export to auditor; waits for acceptance or revision request
- **Critical trust break point:** If Rachel edits more than 3 fields per contract due to AI errors, she questions whether LegalGraph is faster than manual extraction. At this threshold, she considers switching back to Excel.

**Decision-making:**
- Rachel finds the tool and champions it; Jennifer approves the budget
- Jennifer's evaluation is documentation-driven: DPA, consent modal, data retention policy, ROI evidence
- IT security review is required for cloud tools above $50K/year; Rachel handles data security objections proactively by showing the consent modal and Anthropic disclosure

**Information seeking:**
- Jennifer's #1 trust signal: peer GC who has used it and can speak to auditor acceptance
- Rachel's #1 trust signal: the tool correctly extracts the lease she knows best before she trusts it on any new lease
- Both evaluate on trial/POC basis before contract; 30-day pilot is the standard conversion mechanism

---

## Recommendations

**Confidence: High**

1. **Fix BUG-006 (clause PDF viewer) before shipping any new features** *(addresses Findings 2, 4, 7)*
   - This is the single most leveraged action in the product. Without it, Rachel cannot defend her report to an auditor, audit acceptance rate target is unreachable, and the trust-building sequence stalls at Phase 3.
   - *Maps to: PRD L1-4 (auditor acceptance rate); JTBD J2; USER-JOURNEY.md Phase 6 (the reference customer moment)*

2. **Fix BUG-009 (persistent storage) as the immediate second priority** *(addresses Finding 5)*
   - Without persistent history, J3 (portfolio status), J5 (amendment tracking), and J7 (David's term lookup) are all blocked. No new feature that depends on session memory can ship until BUG-009 is resolved.
   - *Maps to: PRD P0 metrics gap; JTBD J3, J5, J7; USER-JOURNEY.md Phase 7 (return journey)*

3. **Add "Ready / Needs Attention" counter to the dashboard header** *(addresses Finding 1)*
   - One data element: how many leases are unblocked vs. have unresolved High flags. Costs one sprint. Saves Rachel's first 5 minutes of every quarterly session.
   - *Maps to: JTBD J3; USER-JOURNEY.md Phase 1 (re-entry moment of truth)*

4. **Write action guidance for the IBR / discount rate flag** *(addresses Finding 3)*
   - One block of copy + a link to an IBR calculator. No engineering required initially. Reduces the most common session stall point.
   - *Maps to: JTBD J1, J4; USER-JOURNEY.md Phase 4; PRD open question 1*

5. **Produce a Jennifer-facing one-pager on PCAOB AS 1105 compliance and data handling** *(addresses Finding 6)*
   - Sales enablement, not product. Answers Jennifer's four evaluation questions in one document. Accelerates enterprise deal closing from Rachel's trial to Jennifer's signed contract.
   - *Maps to: JTBD J6; average deal size OKR $45k → $85k; company-overview.md Objective 1*

---

## Appendix

### JTBD Priority Summary (from project-context/JTBD.md)

| Job | Persona | Status | Product implication |
|---|---|---|---|
| J1 — Generate audit-ready IFRS 16 report | Rachel | 🔄 Partial | Full PDF export with audit trail is P0 |
| J2 — Answer auditor question from report | Rachel | 🔄 BUG-006 | Clause viewer is the trust anchor — GA blocker |
| J3 — Know portfolio status at re-entry | Rachel | ❌ Not built | Dashboard counter is highest-leverage re-entry fix |
| J4 — Trust AI-extracted fields | Rachel | 🔄 n8n Phase 1 | Per-field confidence scores + clause citations |
| J5 — See amendment impact immediately | Rachel | 🔄 Roadmap | Requires BUG-009; GA+1 |
| J6 — Approve tooling without new liability | Jennifer | 🔄 Partial | DPA + consent modal + PCAOB one-pager |
| J7 — Look up lease term in < 2 minutes | David | ✅ Partial | Searchable portfolio table needed (BUG-009) |

### Moments of Truth (from project-context/USER-JOURNEY.md)

| Phase | Moment of Truth | Status |
|---|---|---|
| Re-entry | "How many leases are ready to report?" | ❌ Not built |
| Upload | Progress bar moves — analysis is working | ✅ Live |
| Review | Clause citation opens source text in PDF | 🔄 BUG-006 |
| Review | Per-field confidence score guides spot-checking | 🔄 n8n Phase 1 |
| Risk resolution | "What do I do about missing discount rate?" | 🔄 Partial |
| Export | PDF contains full clause trail + cover page | 🔄 Not fully built |
| Audit defense | Re-open last quarter's analysis with active clause links | ❌ BUG-009 |
| Return | "What changed since last quarter?" | ❌ BUG-009 |

### Key Quotes (reconstructed from JTBD behavioral profiles)

Rachel:
- *"I don't want to feel like I need to check every single field. Show me which ones the AI is uncertain about and I'll check those."*
- *"What rate do I use for the incremental borrowing rate? The flag just says it's missing — it doesn't tell me what to do."*
- *"If my auditor asks where the $2.1M ROU asset value came from, I need to show them the exact clause. Not just a page number."*

Jennifer:
- *"I need to know exactly where our data goes. If this is going to an AI vendor, I need a data processing agreement before anyone uploads a single contract."*
- *"What happens if the AI is wrong and we submit an incorrect report to our auditors? Who is liable?"*

### Data Sources

- [JTBD.md — LegalGraph project-context (May 2026)](project-context/JTBD.md)
- [PRD.md v1.1 — LegalGraph project-context (May 2026)](project-context/PRD.md)
- [USER-JOURNEY.md — LegalGraph project-context (May 2026)](project-context/USER-JOURNEY.md)
- [Deloitte 2025: AI Adoption in Finance Functions](https://www.deloitte.com)
- [Gartner: Finance AI Research 2025–2026](https://www.gartner.com)
- [PCAOB: AS 1105 and AS 2301 Amendments (effective December 2025)](https://pcaobus.org)
- [BlackLine: Finance Team Data Confidence Survey 2025](https://www.blackline.com)
- [FASB Private Company Council memo: ASC 842 Six Years Later (June 2025)](https://ileasepro.com/blog/fasb-asc-842-six-years-later-meeting/)
- [Accounting Today: AI Thought Leaders Survey 2026](https://www.accountingtoday.com)

---

*Word count: 2,487*
