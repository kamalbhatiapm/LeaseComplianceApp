# LegalGraph — User Research
**Version 1.0 | Date: 2026-05-05**
**Owner: Product**
**Method: Secondary research synthesis (competitor reviews, industry reports, audit standards documentation, analyst surveys)**

---

## Overview

This document synthesises user research findings relevant to LegalGraph's three personas — Rachel (Compliance Lead), Jennifer (General Counsel / CFO), and David (Senior Associate) — drawing from competitor user reviews, IFRS 16 practitioner literature, AI adoption research, and auditor evidence requirements. It identifies validated pain points, unmet needs, behavioural patterns, key objections, and design implications for the product.

---

## 1. Persona Deep Dives

---

### Persona 1: Rachel — Compliance Lead / Finance Manager

**Role:** Owns quarterly IFRS 16 / ASC 842 reporting and audit preparation. Works across legal and finance. Reports to CFO. **The primary daily user of LegalGraph.**

---

#### 1a. The Quarterly Compliance Cycle (Current State)

Rachel's workflow today follows a painful four-phase cycle every quarter:

| Phase | Activity | Time | Primary pain |
|-------|----------|------|--------------|
| **1. Locate** | Identify all active leases; track down latest versions of each contract PDF | 30–60 min | Contracts are spread across email, shared drives, and legal team folders with no single source of truth |
| **2. Extract** | Manually read each contract and pull IFRS 16 fields into a spreadsheet: commencement date, rent, term, renewal options, discount rate, ROU value | 2–4 hrs | Error-prone; each contract takes 20–40 min; discount rate is often absent and requires IBR calculation separately |
| **3. Reconcile** | Compare extracted data to prior quarter's schedule; identify modifications, escalations, or new leases | 30–60 min | Version conflicts in Excel; easy to miss a lease modification |
| **4. Report + Audit prep** | Format output for auditors; field auditor questions by hunting back through source contracts | 1–2 hrs | Auditors ask for source clauses; Rachel re-opens PDFs to find them manually |

**Total: 4–6 hours per quarter, per lease portfolio** *(validated in 3 customer interviews per PRD)*

---

#### 1b. Validated Pain Points

**1. Manual extraction is the biggest time sink and error source**

Users consistently cite manual data entry as the primary frustration across competing tools. Before software, teams were "managing all their leases with an Excel spreadsheet" — a process described as "time-consuming and subject to error." Even after adopting tools like LeaseQuery, a common complaint is that the initial data entry burden is significant: *"It's not exactly plug-and-play, and if your lease data isn't clean to begin with, expect some back and forth."*

LegalGraph implication: AI extraction that eliminates manual field entry is the core value prop. The upload-first, analysis-immediate flow directly addresses this.

**2. Discount rate / IBR is the most common field gap**

IFRS 16 requires a discount rate at every lease commencement and modification. Most mid-market lease contracts do not include the rate implicit in the lease — Rachel must calculate or estimate the Incremental Borrowing Rate (IBR) separately. Auditors specifically test: *"Is the IBR reasonable? Was it determined at the correct date? Has it been updated when required?"*

This is the most frequently missing field in real-world contracts, and it always generates an audit question. LegalGraph's sample contract intentionally omits it to exercise this exact workflow.

LegalGraph implication: The "discount rate missing" high-severity flag with IFRS 16.26 guidance copy is critical. The product should educate Rachel on how to supply the IBR, not just flag the gap.

**3. Auditor clause-citation requests are the most stressful moment**

When auditors ask *"what clause supports this ROU asset value?"*, Rachel currently has to re-open the original PDF, search manually, and respond. This takes 30–60 minutes per question and is the primary source of audit friction.

Trullion users specifically call this out as the killer feature: *"The software is particularly useful for audits because you can go from financial entries directly to the right place in the original contract. The audit trail is extremely convenient as it saves time and effort for the auditors and the accounting team."*

LegalGraph implication: The clause-level PDF viewer (BUG-006) is not a nice-to-have — it is the feature that converts Rachel from a user to a reference customer. It must ship at GA.

**4. Complex lease structures cause extraction failures**

Real portfolios include subleases, variable rents, CPI escalation clauses, and multi-party arrangements that standard extraction models struggle with. Users of competing tools report: *"Lease modifications require precise calculations and audit trails"* and *"the complexity of IFRS 16 requires systems that can handle terminations, escalations, impairments and variable rents without endless manual workarounds."*

LegalGraph implication: The upload zone disclaimer ("Best results with standard fixed-rent property leases. Subleases, variable rents, and multi-party structures may require manual review") is the right expectation-setting. Flagging complex structure detection in the `metadata.complex_structure_flags` field (Phase 3 of n8n plan) will help Rachel know when to apply extra scrutiny.

**5. Learning curve and re-entry friction drive abandonment**

LeaseQuery users report: *"The layout can be confusing, especially for users who don't log in regularly"* and *"if you enter a lease detail incorrectly, it's not always easy to backtrack without starting over."* Visual Lease users cite *"a steep learning curve, complex setup, limited UI intuitiveness."*

Rachel logs in once a quarter. Any friction in re-learning the tool is a churn signal.

LegalGraph implication: The upload-first flow (no training required, progress panel walks Rachel through every step) is a structural advantage. The product must remain operable by someone who hasn't touched it in 90 days.

---

#### 1c. Unmet Needs

| Need | Current workaround | LegalGraph status |
|------|-------------------|-------------------|
| Know which fields are missing before starting the compliance cycle | Discover gaps mid-cycle by re-reading contracts | ✅ `terms_missing` flag shown immediately after extraction |
| Understand *why* a risk flag was raised | Email auditor or re-read contract section | ✅ Flag guidance copy per risk item |
| Answer auditor clause questions without reopening PDFs | Manual PDF search | 🔄 BUG-006 — GA milestone |
| Track changes when a lease is modified | Manual reconciliation vs. prior quarter | 🔄 Amendment tracking — GA roadmap |
| Generate reports for all leases in one action | Repeat process per lease | 🔄 Bulk report generation — GA |
| Receive alerts before lease expiry | Calendar reminders; easy to miss | ❌ Automated renewal alerts — GA+1 |

---

#### 1d. Behavioural Patterns

- **Quarterly rhythm, not daily use.** Rachel uses compliance tooling 4× per year. The product must deliver full value in a single session.
- **Trust-then-verify.** Rachel will not blindly accept AI output. She will spot-check extracted fields against the source contract, especially for high-value leases. The edit-terms flow (currently in the app) directly supports this.
- **Deadline-driven.** The quarter-end close creates acute time pressure. Any tool that adds steps or confusion will be abandoned in favour of Excel under deadline pressure.
- **Auditor-preparing, not auditor-replacing.** Rachel's mental model is "I need to hand this to an auditor and not get called back." She optimises for defensibility, not just accuracy.

---

### Persona 2: Jennifer — General Counsel / CFO

**Role:** Economic buyer. Signs off on tooling decisions. Cares about audit defensibility, risk reduction, and not surprising the CFO. Does not use the product daily — evaluates based on Rachel's recommendation and her own risk lens.

---

#### 2a. What Jennifer Actually Cares About

**1. Audit defensibility above all else**

Jennifer's primary fear is a restatement. If the auditor finds an IFRS 16 error after the accounts are filed, the consequences are board-level: restatement, potential regulatory notice, reputational damage. Jennifer will approve tooling that demonstrably reduces this risk, and block tooling that introduces it.

LegalGraph implication: The clause-level audit trail is Jennifer's primary evaluation criterion. The report gate (High flags must be resolved before export) directly addresses her concern: *"I cannot sign off on a report that hasn't been reviewed."*

**2. "Don't surprise me"**

The CFO-GC alliance operates on the principle that finance and legal are the nervous system of the organisation — both functions exist to flag risk early. Jennifer will not approve tooling that creates hidden liability: AI-generated reports presented to auditors without disclosure of AI involvement, or outputs that look authoritative but may be wrong.

LegalGraph implication: The "not legal advice" disclaimer, the consent modal naming Anthropic Claude API explicitly, and the data source badge (Live / Demo / Fallback) are not just compliance features — they are trust signals for Jennifer. She needs to know the AI's role is disclosed.

**3. ROI framing matters**

Jennifer approves the budget. The ROI calculation is straightforward: if Rachel spends 5 hours per quarter on compliance work and earns $80/hr fully loaded, that's $400/quarter or $1,600/year in labour cost per lease per year. For a 20-lease portfolio, that's $32,000/year in manual compliance labour. LegalGraph at $15–25K/year pays back in year one.

LegalGraph implication: The PRD's "4–6 hours to <45 minutes" claim needs to be the primary headline in Jennifer-facing materials — it converts directly to dollars she recognises.

**4. Vendor trust: data security and retention**

Jennifer will ask: *"Where does our contract data go? Who can see it? How long is it kept?"* Mid-market GCs are acutely aware of NDA provisions in lease contracts — many restrict sharing contract details with third parties.

LegalGraph implication: The consent modal's data retention disclosure ("processed by Anthropic Claude API and retained for up to 30 days") and the privacy@legalgraph.io deletion contact are Jennifer's answers. The Beta NDA and data processing agreement (per release-plan/BETA-PLAN.md) must be solid before she approves Beta participation.

---

#### 2b. Decision Criteria (Jennifer's Evaluation Checklist)

| Criterion | Weight | LegalGraph Status |
|-----------|--------|-------------------|
| Audit acceptance rate ≥95% | Critical | Target — unproven until Beta auditor validation |
| Clause-level evidence trail | Critical | 🔄 BUG-006 — must be GA |
| AI involvement disclosed to auditors | High | ✅ Report cover sheet planned |
| Data security / retention policy | High | ✅ Consent modal + privacy contact |
| Time savings for Rachel | High | ✅ <45 min claim — needs Beta validation |
| Price vs. current process cost | Medium | ✅ Pencils out at $15–25K/yr for 10–50 leases |
| ERP integration | Low (for target ICP) | ❌ GA+1 — acceptable for V1 |
| Vendor stability | Medium | Risk: LegalGraph is early-stage |

---

### Persona 3: David — Senior Associate

**Role:** Secondary user. Occasionally pulls lease data for contract amendments and renewal negotiations. Does not run compliance reports. Needs quick term lookups.

---

#### 3a. David's Use Case

David's workflow is fundamentally different from Rachel's:
- He is not running a compliance cycle — he is answering a one-off question: *"What are the renewal options on the Midtown office?"*
- He needs the answer in under 2 minutes, not 45
- He cares about accuracy of a single field, not portfolio-level compliance
- He does not need the report gate, the flag resolution workflow, or the PDF export

LegalGraph implication: The extracted terms grid on Screen 2 (Analysis Results) is David's primary destination. It should be instantly readable, with direct clause links so he can verify a value without running a full analysis. The "Leases" tab dashboard (Screen 2 portfolio view) needs to surface the terms he'll query most: expiry date, renewal options, rent escalation.

---

## 2. External Auditor Perspective

External auditors are not LegalGraph users — they receive the PDF output. But they determine whether Rachel's work is accepted or sent back for revision. Understanding what auditors test is critical to product design.

### What auditors specifically examine in IFRS 16 audits

| Audit area | What they look for | LegalGraph relevance |
|-----------|-------------------|----------------------|
| **Lease register completeness** | Evidence of a systematic process for identifying all leases, including embedded leases | LegalGraph cannot solve completeness (Rachel must upload all contracts) — but the portfolio dashboard makes the register visible |
| **Lease identification decisions** | Documented rationale for any contract excluded from the register | Out of scope V1 |
| **Discount rate documentation** | IBR must be documented, not just applied; tested for reasonableness and application at correct date | ✅ Discount rate flagged as missing; IBR guidance shown |
| **Modification evidence** | Every lease change needs: the trigger, effective date, new terms, recalculation, and resulting journal entries | 🔄 Amendment tracking — GA |
| **Source clause traceability** | Every material figure in the financial statements must trace to a specific clause in the original contract | 🔄 BUG-006 — clause PDF viewer; **most critical auditor requirement** |
| **Journal entry reconciliation** | Amortisation schedule must reconcile to financial statements | Out of scope V1 (accounting team handles booking) |

### Auditor trust in AI-generated reports

Auditor acceptance of AI-generated compliance reports is the highest-risk assumption in the PRD (Medium confidence). Based on market evidence:

- Trullion users report *"the audit trail is extremely convenient as it saves time and effort for the auditors"* — suggesting auditors accept it when the evidence chain is intact
- The key trust mechanism is **not the AI itself, but the clause citation**: auditors can verify the AI's output against the source contract independently
- A report that says "ROU asset value: $2.1M — derived from §7.1, page 4 of the lease agreement" is auditor-defensible; one that says "ROU asset value: $2.1M" is not

LegalGraph implication: The clause citation is not a UX feature — it is the auditor's verification mechanism. Without it, auditors cannot accept the report. BUG-006 is a hard blocker for auditor acceptance.

---

## 3. AI Trust & Adoption Barriers

AI adoption in finance and accounting faces a documented trust gap that directly affects LegalGraph's adoption trajectory.

### The numbers

- **80.5%** of finance professionals believe AI tools could become standard within 5 years *(Deloitte, 2025)*
- **Only 13.5%** are currently using agentic AI tools *(Deloitte, 2025)*
- **21.3%** cite *trust* as their leading barrier to adoption — the single largest factor
- **Less than 2%** of firms have fully integrated AI into their workflows

### What "trust" means to Rachel specifically

Rachel's trust concerns are not abstract — they are concrete and auditable:

1. **"Will the AI miss something and get me in trouble with auditors?"** — Fear of false negatives (risks missed)
2. **"How do I know the extracted value is correct?"** — Need for verifiability, not just confidence scores
3. **"If I submit this report and it's wrong, is it my fault or the tool's fault?"** — Accountability clarity
4. **"My auditor will ask where these numbers came from — what do I tell them?"** — Disclosure concern

### Design implications for trust

| Trust concern | LegalGraph design response | Status |
|--------------|---------------------------|--------|
| Fear of missing critical fields | `terms_missing` list shown prominently after extraction | ✅ Live |
| Need to verify AI output | Edit terms inline; clause link shows source text | ✅ Edit mode live; clause viewer 🔄 GA |
| Report gate prevents premature submission | High flags must be resolved and signed off before export | ✅ Live |
| Disclosure to auditors | "Not legal advice" disclaimer; report cover sheet planned | ✅ Disclaimer live |
| Black box opacity | Consent modal names Anthropic Claude API explicitly | ✅ Updated |
| Confidence in specific fields | Per-field confidence scores in extraction output | 🔄 n8n Phase 1 |
| Human override | Edit terms replaces AI value with human-verified value | ✅ Live |

**Key insight:** LegalGraph's report gate (High flags must be resolved before export) is the most powerful trust design choice in the product. No competitor enforces this. It reframes AI from "trusted oracle" to "trusted assistant that flags, but humans decide." This is exactly the mental model Rachel and Jennifer need.

---

## 4. Usability Research Signals

### What users love about the best tools in this space

From competitor reviews (Trullion, LeaseQuery, Visual Lease):

| Positive signal | Implication for LegalGraph |
|----------------|---------------------------|
| *"Easy to make changes to leases and perform lease modifications"* | Edit terms flow must be frictionless |
| *"Everything accessible in one place saves a ton of time"* | Portfolio dashboard is critical for day-2 retention |
| *"Go from financial entries directly to the right place in the original contract"* | Clause PDF viewer is the #1 feature auditors and Rachel both want |
| *"Simple presentation with ease of use, even without training"* | Upload-first flow is the right design; don't add steps |
| *"40–50% workflow time reduction"* (Trullion) | LegalGraph's 85%+ reduction claim (4–6 hrs → <45 min) is differentiated if substantiated in Beta |

### What users hate (failure modes to avoid)

| Negative signal | Risk for LegalGraph |
|----------------|---------------------|
| *"Layout confusing for users who don't log in regularly"* | Rachel logs in quarterly — every screen must be self-explanatory |
| *"If you enter a lease detail incorrectly, not easy to backtrack"* | Edit mode must support correction without restarting analysis |
| *"Steep learning curve; complex setup"* | No onboarding wizard required — zero-configuration upload is the differentiator |
| *"Reporting customization feels rigid"* | Report PDF must be auditor-ready without customisation — avoid over-engineering export |
| *"Takes time to configure when you have a large amount of data"* | LegalGraph's per-contract model avoids bulk import problem |

---

## 5. Jobs-to-Be-Done Analysis

Mapped against the PRD's JTBDs with research validation:

### JTBD 1: Generate an audit-ready report before the quarter-end deadline

> "When the quarterly IFRS 16 reporting deadline approaches, I want to generate a structured compliance report directly from our contract repository, so I can submit audit-ready output to our external auditors without spending days on manual extraction."

**Research validation:** Strongly confirmed. Every reviewed source cites quarterly close pressure as the primary trigger. The deadline creates acute willingness to pay and reduces price sensitivity.

**Unmet dimension:** Users also want to know *in advance* if they're on track. A "leases ready for reporting this quarter" count on the dashboard (vs. "leases with unresolved flags") would give Rachel early warning — not just a report button.

**Recommended addition:** Dashboard metric: *"X of Y leases ready to report · Z have unresolved High flags"*

---

### JTBD 2: Answer auditor clause questions without digging through PDFs

> "When an auditor asks for the source clause behind a specific lease line item, I want to link directly from the report to the original contract clause, so I can answer in minutes instead of digging through PDFs."

**Research validation:** Strongly confirmed and competitor-validated. Trullion's most praised feature. BDO's audit guidance explicitly requires traceable clause evidence. Multiple users describe the before state as *"PDF scavenger hunts."*

**Critical finding:** Auditors don't just want a page number — they want the exact clause text. *"Does the clause-level audit trail need to show the exact clause text inline, or is a page + section reference sufficient?"* (PRD Open Question #4) — research suggests the answer is **both**: page reference for navigation, clause text excerpt for quick verification without opening the PDF.

**Recommended design:** Clause citation shows: page number + section reference + first 50 words of clause text as a tooltip. Full clause visible by clicking → opens PDF at that page.

---

### JTBD 3: See compliance impact of a new or amended lease immediately

> "When a new lease is signed or amended, I want to see the compliance impact immediately, so I can keep our IFRS 16 schedule current without a manual reconciliation cycle."

**Research validation:** Confirmed but lower urgency than JTBDs 1 and 2. Users describe modification tracking as *"complex"* and *"requiring precise calculations."* The pain is real but less acute — it surfaces between quarters, not at deadline.

**Current status:** Amendment tracking is on the GA roadmap but not yet live. The right Beta question is: *"How often do your leases get modified mid-quarter?"* — this determines how urgent amendment tracking is relative to other GA features.

---

## 6. Open Questions for Beta Validation

The PRD lists 5 open questions. Based on user research, here are additional questions Beta participants should answer:

| # | Question | Persona | How to measure |
|---|----------|---------|---------------|
| 1 | What is Rachel's actual time-to-report using LegalGraph vs. her prior process? | Rachel | Event log: upload timestamp → export timestamp |
| 2 | Does Rachel edit AI-extracted terms, and which fields most often? | Rachel | Edit mode session rate per field |
| 3 | How do auditors react when they learn the report was AI-generated? | Jennifer (via exit interview) | Auditor acceptance rate; revision requests |
| 4 | What does Rachel do when she sees a "Medium" flag — resolve it, dismiss it, or ignore it? | Rachel | Flag resolution rate by severity |
| 5 | Does the 30-second timeout for n8n cold-starts feel acceptable, or does Rachel abandon mid-analysis? | Rachel | Analysis abandonment rate; session duration |
| 6 | Do Beta participants upload their full lease portfolio or only selected contracts? | Rachel | Upload count per account vs. stated portfolio size |
| 7 | What is the clause text format auditors actually want — tooltip excerpt, modal, or PDF navigation? | External auditor (via participant relay) | Qualitative in exit interview |
| 8 | How does Jennifer evaluate the "not legal advice" disclaimer — is it sufficient, or does she want stronger safe-harbour language? | Jennifer | Exit interview |
| 9 | Does David use the product independently, or only when Rachel shows him results? | David | Session count by user type if multi-user is enabled |
| 10 | What is Rachel's biggest anxiety about submitting an AI-generated report to her auditor for the first time? | Rachel | Open-ended in exit interview |

---

## 7. Design Recommendations

Prioritised by research signal strength:

| Priority | Recommendation | Research basis |
|----------|---------------|----------------|
| **P0** | Ship clause PDF viewer (BUG-006) at GA — without it, auditor acceptance is at risk | Audit evidence requirements; Trullion reviews; PRD open question #4 |
| **P0** | Add IBR guidance copy to the "discount rate missing" flag — tell Rachel what to do, not just that it's missing | IFRS 16.26 audit requirements; IBR is the most common missing field |
| **P1** | Dashboard: add "leases ready to report this quarter" count alongside unresolved flag count | JTBD 1 — Rachel needs early warning, not just a report button |
| **P1** | Clause citation: show page + section + first 50-word excerpt as tooltip; full clause on click | PRD open question #4; auditor evidence standard |
| **P1** | Per-field confidence scores visible to Rachel (Phase 1 of n8n payload plan) | AI trust research; Rachel needs to know which fields to double-check |
| **P2** | Quarterly comparison: show delta vs. prior extraction for the same lease | JTBD 3 — amendment tracking need; also reduces fear of AI error |
| **P2** | "Share with auditor" button that generates a report with an explicit AI disclosure cover page | Jennifer's disclosure requirement; Trullion's audit suite model |
| **P3** | Re-analyse prompt when a lease modification is detected (date-based heuristic) | JTBD 3; audit modification evidence requirement |

---

## Sources

- [12-Step Roadmap to Ongoing ASC 842 and IFRS 16 Compliance for Finance Leaders — Financial Executives International](https://www.financialexecutives.org/FEI-Daily/September-2025/12-Steps-to-Staying-Ahead-on-Lease-Accounting-in-2.aspx)
- [What is IFRS 16 and how is lease accounting impacting organisations — Unit4](https://www.unit4.com/blog/what-ifrs-16-and-how-will-it-impact-organizations-2024)
- [How to prepare for an IFRS 16 lease accounting audit — Loisleasing](https://loisleasing.com/blog/ifrs-16-lease-accounting-audit-preparation-checklist)
- [Lease Audit Procedures: Accounting Best Practices — Occupier](https://www.occupier.com/blog/lease-audit-procedures/)
- [IFRS 16 Leases - Audit — BDO UK](https://www.bdo.co.uk/en-gb/services/audit-assurance/ifrs-us-gaap-and-international-gaap/ifrs-16-leases)
- [Incremental Borrowing Rate: ASC 842, IFRS 16, & GASB 87 — FinQuery](https://finquery.com/blog/incremental-borrowing-rate-discount-rate-asc-842-ifrs-16-gasb-87/)
- [IFRS 16 — Understanding the Discount Rate — Grant Thornton](https://www.grantthornton.global/en/insights/ifrs-16/ifrs-16---understanding-the-discount-rate/)
- [Trust Emerges as Main Barrier to Agentic AI Adoption in Finance and Accounting — Deloitte](https://www.deloitte.com/us/en/about/press-room/trust-main-barrier-to-agentic-ai-adoption-in-finance-and-accounting.html)
- [Lease accounting confidence with automation and AI — Trullion](https://trullion.com/blog/lease-accounting-confidence-with-automation-and-ai/)
- [How GRF CPAs & Advisors revolutionised their audit workflow with Trullion — Trullion Customer Story](https://trullion.com/customer-stories/how-grf-cpas-advisors-revolutionized-their-audit-workflow-with-trullion/)
- [Trullion Reviews 2025 — Capterra](https://www.capterra.com/p/198454/smrt/reviews/)
- [LeaseQuery Reviews 2025 — Capterra](https://www.capterra.com/p/143396/LeaseQuery/reviews/)
- [ASC 842: Challenges, Solutions & Global Outlook — Envoria](https://envoria.com/insights-news/asc-842-in-practice-challenges-solutions-and-global-outlook)
- [ASC 842 and IFRS 16: 5 Lessons Learned — Visual Lease](https://visuallease.com/asc-842-ifrs-16-lessons-learned/)
- [Why Trust Remains the Biggest Barrier to AI Adoption for CPAs — Inside Public Accounting](https://insidepublicaccounting.com/2025/12/17/perspectives-from-the-profession-why-trust-remains-the-biggest-barrier-to-ai-adoption-for-cpas/)
- [How AI Is Quietly Rewriting Finance Rules for Midsize Enterprises — Forvis Mazars](https://www.forvismazars.us/forsights/2025/09/how-ai-is-quietly-rewriting-finance-rules-for-midsize-enterprises)
- [IFRS Accounting Standards in Practice 2023/2024 — BDO Global](https://www.bdo.global/getmedia/4b4c5f48-af18-4caa-b598-630ba9b937cf/IFRS-16-In-Practice-2023-2024.pdf?ext=.pdf)
- [Best Lease Accounting Software 2025 — Netgain](https://www.netgain.tech/blog/best-lease-accounting-software)

---

*User research owner: Product · Last updated: 2026-05-05*
