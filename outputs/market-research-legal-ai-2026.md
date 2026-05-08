# Market Research: IFRS 16 / ASC 842 Lease Compliance Software Market
**Date**: May 8, 2026
**Researcher**: Senior PM, LegalGraph

> **Context files read:** company-context/company-overview.md, company-context/competitive-landscape.md, company-context/product-description.md, company-context/user-personas.md, project-context/JTBD.md, project-context/PRD.md, project-context/USER-JOURNEY.md, templates/market-research-format.md

---

## Executive Summary

LegalGraph is building an AI-powered lease compliance reporting tool for mid-market companies managing 10–50 active leases. This is a distinct and underserved niche within the broader lease accounting software market — one where Excel is still the dominant workflow and purpose-built SaaS tools are either too cheap to handle audit complexity (EZLease, $4K/yr) or too enterprise-heavy to justify for 10–50 leases (Nakisa, Accruent, Visual Lease).

The global lease accounting software market is valued at approximately $1–2.5B in 2025, growing at 11–15% CAGR through 2033. The market received a structural tailwind from IFRS 16 / ASC 842 enforcement, but private company adoption remains incomplete — many mid-market companies with 10–50 leases still operate on Excel templates, precisely the conversion opportunity LegalGraph targets.

Two competitive shifts materially change the landscape heading into 2026: (1) **CoStar acquired Visual Lease** (November 2024) and is moving upmarket, leaving mid-market buyers underserved during a period of integration uncertainty; (2) **LeaseQuery rebranded as FinQuery** and is pivoting to broader contract intelligence, creating positioning confusion for their core mid-market base. Both moves open a window for an AI-native, audit-focused mid-market entrant. The only direct AI-native competitor in the mid-market is **Trullion** (~$3K/yr, founded 2020), which LegalGraph must out-differentiate on compliance report quality and audit defensibility.

The critical market signal for 2026 is regulatory: **PCAOB amended AS 1105** (effective for fiscal years beginning December 15, 2025), requiring full audit trail and explainability for AI-generated financial outputs. This creates a new standard that incumbents built before this requirement are scrambling to meet — and that LegalGraph can build to natively.

---

## Market Overview

### Market Size & Growth

| Segment | 2025 Size | CAGR | Key Source |
|---|---|---|---|
| Lease accounting software (global) | $1.0B–$2.5B | 11–15% | DataIntelo, Market Research Future, MarketIntelo (2026) |
| North American segment | ~40% of global | ~12.7% | OpenPR consensus estimate |
| AI-powered lease abstraction tools | Emerging sub-segment | Faster than base | Nakisa, Accounting Today 2026 |

**Key growth drivers:**
- Mandatory IFRS 16 / ASC 842 on-balance-sheet recognition creating persistent software demand — this is not a transient compliance event
- Private company adoption still incomplete: ASC 842 effective for private companies 2021–2022; many mid-market companies still running spreadsheets (FASB Private Company Council memo, June 2025)
- AI/automation expanding TAM by converting Excel users who previously couldn't justify enterprise tool pricing
- Market consolidation (CoStar/Visual Lease, FinQuery rebrand) creating mid-market gaps
- PCAOB AS 1105 amendment elevating audit-trail requirements and forcing product investment across incumbents

### Market Segments

| Segment | Characteristics | LegalGraph Fit |
|---|---|---|
| **Mid-market (10–50 leases)** | Finance/compliance teams, Series A–C companies, outgrown Excel, can't justify enterprise pricing; $6–25K/year budget | ✅ **Primary — exact ICP** |
| **SMB (< 10 leases)** | Price-sensitive, EZLease ($4K/yr) serves them well, audit expectations lower | ❌ Below ICP; EZLease owns this |
| **Enterprise (50–500 leases)** | SAP/Oracle ERP integration required; Nakisa, FinQuery, Accruent competitive | ⚠️ Secondary — future expansion |
| **Accounting firms / MSPs** | Client-service model; Trullion strong here via 70+ firm channel | 🟡 Opportunity via partner channel |

---

## Competitive Analysis

### Competitor 1: Trullion

- **Overview:** AI-native accounting automation platform covering ASC 842, IFRS 16, and ASC 606. Founded 2020 (NY); $34M total funding (Aleph, Greycroft, StepStone); 11–50 employees. Named Deloitte Technology Fast 500 and Top 15 Fastest-Growing in North America (2024).
- **Strengths:** Purpose-built AI for lease abstraction and audit trail; also covers revenue recognition (ASC 606) alongside lease accounting; strong accounting firm / managed services channel (70+ firms); fast-growing and well-capitalized relative to size.
- **Weaknesses:** Small team (11–50 employees); limited enterprise SAP/Oracle ERP depth; primarily US-focused; less mature on IFRS 16 vs. ASC 842.
- **Market position:** Most direct AI-native competitor in mid-market. Growing through accounting firm channel, not direct sales.
- **Pricing:** Starts at ~$3,000/year (publicly listed); custom for larger deployments.
- **LegalGraph differentiation:** Compliance report output quality and audit defensibility. Trullion does abstraction well; LegalGraph wins on the full audit-ready report cycle (clause citations, per-field confidence scores, PCAOB AS 1105-aligned audit trail, flag resolution gate before export). Rachel's job is not just extraction — it is producing a report her auditor accepts without revision requests.

---

### Competitor 2: EZLease

- **Overview:** Simple compliance-first tool for lessees and lessors managing real estate and equipment portfolios. Supports ASC 842, IFRS 16, and GASB 87. Publicly priced.
- **Strengths:** Transparent, affordable pricing ($4,000/year for 6–49 leases, unlimited users); fits the 10–50 lease mid-market sweet spot on price; low implementation burden; supports both real estate and equipment leases.
- **Weaknesses:** Minimal AI capabilities; basic reporting without full audit trail structure; limited integrations; not suitable for complex leases (variable rent, CPI escalation, multi-currency); does not generate clause-level evidence for auditors.
- **Market position:** Price floor anchor for mid-market. Buyers evaluate EZLease first on cost grounds; they upgrade when audit scrutiny requires more.
- **Pricing:** $4,000/year (6–49 leases, publicly disclosed).
- **LegalGraph differentiation:** The upgrade story. EZLease handles calculation; LegalGraph handles audit defense. When Rachel gets her first auditor revision request, she needs clause citations, per-field confidence scores, and a full resolution audit trail — none of which EZLease provides. Positioning: "Built for teams that have outgrown EZLease."

---

### Competitor 3: Visual Lease (CoStar Group)

- **Overview:** Acquired by CoStar Group in November 2024. Previously a mid-market to enterprise lease administration and accounting platform with 1,500+ customers. Post-acquisition, CoStar is integrating Visual Lease with its real estate data network.
- **Strengths:** Large customer base; CoStar real estate data integration; full lease lifecycle (administration + compliance); AI abstraction in roadmap; enterprise brand credibility.
- **Weaknesses:** Integration disruption during acquisition creates customer anxiety; CoStar's strategic direction may shift product toward real-estate-heavy enterprise buyers; pricing and sales motion becoming enterprise-oriented; mid-market customers may feel de-prioritized.
- **Market position:** Consolidating upmarket. Mid-market customers on Visual Lease contracts that expire in 2025–2026 are a displacement opportunity.
- **Pricing:** Custom quote only (no public pricing post-acquisition).
- **LegalGraph differentiation:** Speed and focus. Visual Lease is now part of a $4B+ public company; implementation timelines and sales cycles are lengthening. LegalGraph's 10-lease-to-report-in-45-minutes value proposition wins against a platform in integration transition.

---

### Competitor 4: FinQuery (formerly LeaseQuery)

- **Overview:** Rebranded from LeaseQuery to FinQuery in February 2024, expanding from lease accounting to broader "contract and spend intelligence." Supports ASC 842, IFRS 16, GASB 87. Strong in retail chains, franchises, healthcare.
- **Strengths:** Strong accountant credibility; deep compliance features (amortization schedules, journal entry automation); audit-tested; expanding TAM via contract intelligence pivot.
- **Weaknesses:** Rebrand creates positioning confusion; mid-market customers may not want or need the full contract intelligence suite; pricing opacity; broader scope may dilute lease-specific depth.
- **Market position:** Historically the strongest mid-market lease accounting tool by accountant reputation. Rebrand signals they are chasing a larger TAM — creating space for a lease-specialist.
- **Pricing:** Not publicly disclosed; structured by lease/contract count and modules.
- **LegalGraph differentiation:** Lease compliance specialists vs. expanding generalist. As FinQuery adds contract intelligence, invoice management, and software spend tracking, their lease accounting feature depth may stall. LegalGraph wins by being the best tool for the single job Rachel actually has: quarterly IFRS 16 / ASC 842 compliance reporting with audit defense.

---

### Competitor 5: Nakisa

- **Overview:** Enterprise-grade lease accounting platform with native SAP/Oracle/Workday integration. Targets Fortune 1000 companies managing large, complex, multi-entity lease portfolios. Added Nakisa AI in 2025 R1 release.
- **Strengths:** Unmatched ERP integration depth (SAP ECC and S/4HANA native via Java Connector); handles local GAAP variants globally; multi-entity and high-volume capabilities; well-established in large enterprise.
- **Weaknesses:** Vastly over-engineered for 10–50 lease mid-market; pricing is enterprise only; implementation measured in months; not a fit without SAP/Oracle.
- **Market position:** Enterprise tier — not a direct LegalGraph competitor today. Relevant if LegalGraph moves upmarket into SAP-dependent companies.
- **Pricing:** Custom enterprise only.
- **LegalGraph notes:** Not a threat in mid-market. Monitor as a future partnership opportunity: Nakisa as the enterprise CLM engine, LegalGraph as the AI compliance reporting layer for mid-market subsidiaries or spin-offs.

---

## Market Opportunities

1. **CoStar/Visual Lease Mid-Market Displacement**
   - Market gap: Visual Lease customers with 10–50 leases facing integration uncertainty, sales motion changes, or contract renewals in 2025–2026. These buyers need to re-evaluate.
   - Potential impact: Visual Lease had 1,500+ customers; even 3–5% displacement = 45–75 accounts at $10–20K/year = $500K–$1.5M ARR opportunity.
   - Requirements: Competitive migration landing page, Visual Lease import tool, outbound motion targeting known Visual Lease mid-market customers up for renewal.

2. **PCAOB AS 1105 Compliance Gap — Audit-Ready AI**
   - Market gap: Most lease accounting tools (including EZLease, and early-vintage FinQuery implementations) were built before PCAOB AS 1105 (effective December 2025) required full audit trail and explainability for AI-generated financial outputs. They lack per-field clause citations, confidence scoring, and human-review workflow gates.
   - Potential impact: Finance teams and their auditors will ask vendors for PCAOB AS 1105 compliance documentation in 2026. Vendors who can't provide it will lose deals or face auditor pushback. LegalGraph built with these requirements from day one.
   - Requirements: Per-field clause citations (BUG-006), confidence scores (n8n Phase 1), human sign-off gate before export, report cover page with AI disclosure. Already on LegalGraph's P0 roadmap.

3. **Excel Conversion in the 10–50 Lease Wedge**
   - Market gap: Mid-market companies with 10–50 leases that have outgrown Excel but find enterprise tools overbuilt. Software is strongly recommended at 10+ leases — the exact LegalGraph ICP. FASB Private Company Council data (June 2025) confirms many private companies still use spreadsheets.
   - Potential impact: LegalGraph's SAM of $8B (company-overview.md) reflects the full contract review market; the addressable lease compliance sub-segment for 10–50 lease companies is smaller but more specific and actionable. Even 0.5% of a $1B market = $5M ARR.
   - Requirements: Transparent pricing, self-serve trial, < 10 minutes from upload to first report, comparison page vs. Excel and EZLease.

4. **Audit Defense as a Retention and Referral Moat**
   - Market gap: No current mid-market tool delivers the end-to-end audit defense workflow (analysis → clause citation → auditor Q&A support → accepted report). The moment Rachel can answer an auditor question in 2 minutes by clicking a clause link in LegalGraph — rather than 30–60 minutes of PDF hunting — she becomes a reference customer. This is the moment of truth identified in USER-JOURNEY.md.
   - Potential impact: Reference-customer-driven growth in a trust-sensitive, peer-recommendation market (GCs and controllers talk to each other via CLOC, ACC, AICPA networks).
   - Requirements: Clause PDF viewer (BUG-006 — GA blocker), active clause links in historical analyses (persistence — BUG-009), "Share with auditor" export with clause excerpts inline.

---

## Technology Trends

| Trend | Implication for LegalGraph | Priority |
|---|---|---|
| **AI abstraction is table stakes (2026)** | Basic AI extraction no longer differentiates; audit-ready output quality and full compliance workflow is where differentiation lives | High — invest in report output, not just extraction |
| **PCAOB AS 1105 audit trail requirements** (effective Dec 2025) | Full data lineage, per-field explainability, and human sign-off workflow are now regulatory requirements, not product features | Critical — this is a built-in wedge vs. incumbents |
| **Agentic AI in finance functions** | 90% of finance functions deploying AI by 2026 (Gartner); buyers expect AI to handle document intake → extraction → exception review → report generation | Medium — progressive automation on the roadmap; stay human-in-the-loop for audit credibility |
| **Multilingual + multi-standard coverage** | Best AI tools support 20+ languages in 2026; IFRS 16 + ASC 842 + GASB 87 + local GAAP in one tool is expected for international buyers | Medium — IFRS 16 first; ASC 842 toggle for US/Canada customers |
| **Market consolidation creating mid-market gaps** | CoStar/Visual Lease and FinQuery both moving upmarket; mid-market buyers are less well-served in 2026 than 2024 | High — timing advantage; move fast on mid-market ICP |
| **Transparent pricing as conversion lever** | EZLease's published pricing ($4K/yr) attracts self-service evaluation; most enterprise players price opaquely | Medium — publish self-serve pricing for the 10–50 lease tier; convert trials faster |
| **Error reduction case for AI** | 59% of accountants make several errors monthly with manual processes; fraud and misstatements 80–90% more common in spreadsheet environments (Gartner) | High — use these statistics in demand generation and sales materials |

---

## Recommendations

**Confidence: High**

1. **Position exclusively on audit-defense, not abstraction (Q2 2026)** — Abstraction is commoditized. Every competitor claims AI extraction. LegalGraph's differentiation is the full compliance cycle: extract → review → resolve flags → generate audit-ready report with clause citations that an auditor will accept. All product development and marketing should align to this north star. *Owner: PM + Marketing.*

2. **Ship clause PDF viewer (BUG-006) before any new feature work** — This is the single feature that completes Rachel's audit defense job and converts her from a user to a reference customer (USER-JOURNEY.md Phase 6). Without it, LegalGraph produces a report Rachel cannot stand behind under auditor questioning. Every other feature investment has lower leverage until BUG-006 is live. *Owner: PM + Engineering.*

3. **Build PCAOB AS 1105 compliance documentation and market it (Q2–Q3 2026)** — The PCAOB AS 1105 amendment (effective December 2025) creates an immediate buying criterion that LegalGraph can meet and competitors cannot without significant retooling. Produce a one-pager: "How LegalGraph meets PCAOB AS 1105 requirements for AI-generated lease compliance reports." Lead with this in sales conversations with controllers and CFOs. *Owner: PM + Legal + Marketing.*

4. **Target Visual Lease mid-market renewals proactively (Q2 2026)** — CoStar's acquisition of Visual Lease is creating uncertainty for mid-market customers. Identify Visual Lease customers in the 10–50 lease range whose contracts are up in 2025–2026 and run an outbound displacement campaign with a migration tool. *Owner: Sales + Marketing.*

5. **Publish transparent pricing for the 10–50 lease tier** — EZLease's $4,000/year published price is the conversion baseline. LegalGraph should publish pricing for the mid-market tier (e.g., $8–12K/year for up to 50 leases, unlimited users) to enable self-service evaluation by finance directors and controllers who are comparing on spreadsheets before engaging sales. *Owner: PM + Sales.*

---

## Sources

- [DataIntelo Lease Accounting Software Market Report 2026](https://dataintelo.com/report/lease-accounting-software-market)
- [Market Research Future: Lease Accounting Management Software](https://www.marketresearchfuture.com/reports/lease-accounting-management-software-market-23203)
- [OpenPR: Lease Accounting Software Market Size 2026](https://www.openpr.com/news/4330749/lease-accounting-software-market-size-report-2026)
- [CoStar Closes Visual Lease Acquisition — BusinessWire, November 2024](https://www.businesswire.com/news/home/20241101640656/en/CoStar-Group-Closes-Deal-to-Acquire-Visual-Lease-a-Leading-Lease-Administration-and-Accounting-Platform)
- [Visual Lease: Six Months Post-Acquisition](https://visuallease.com/six-months-post-acquisition-an-exciting-path-forward/)
- [LeaseQuery Rebrands to FinQuery — GlobeNewswire, February 2024](https://www.globenewswire.com/news-release/2024/02/08/2826056/0/en/LeaseQuery-Rebrands-to-FinQuery-Reflecting-Company-s-Focus-on-Contract-and-Spend-Intelligence.html)
- [Trullion — Tracxn Company Profile](https://tracxn.com/d/companies/trullion/__2R9_0QPFd7wflWHsPoauxAAqjWhDYmVge8IfHb-SHgc)
- [EZLease — SoftwareConnect Best Lease Accounting 2026](https://softwareconnect.com/roundups/best-lease-accounting-software/)
- [Nakisa Lease Accounting 2025 R1 Release Notes](https://nakisa.com/blog/nakisa-lease-accounting-software-2025-r1-product-release/)
- [Nakisa: AI and Automation in Lease Accounting 2026](https://nakisa.com/blog/how-ai-automation-data-integration-are-shaping-lease-accounting-software/)
- [PCAOB: Generative AI Spotlight — July 2024](https://pcaobus.org/documents/generative-ai-spotlight.pdf)
- [SEC Approves PCAOB AS 1105 and AS 2301 Amendments — SEC.gov, 2024](https://www.sec.gov/newsroom/press-releases/2024-100)
- [Datricks: AI and Auditing — PCAOB AS 1105 Implications](https://datricks.com/blog/ai-and-auditing-addressing-the-pcaobs-audit-inspection-priorities/)
- [iLeasePro: ASC 842 Six Years Later — FASB Private Company Council](https://ileasepro.com/blog/fasb-asc-842-six-years-later-meeting/)
- [MRI Software: ASC 842 vs. IFRS 16 — 2026 Compliance Checklist](https://www.mrisoftware.com/blog/asc-842-vs-ifrs-16-2026-compliance-checklist-for-lease-accounting/)
- [Netgain: ASC 842 with Spreadsheets — When to Upgrade](https://www.netgain.tech/blog/can-i-adopt-asc-842-with-spreadsheets)
- [Accounting Today: How AI Will Change Lease Accounting and Auditing](https://www.accountingtoday.com/opinion/how-ai-will-change-lease-accounting-and-auditing)
- [Texas CPA Magazine: AI in Accounting 2026](https://www.tx.cpa/news-publications/todays-cpa-magazine/issues/article/march-april-2026/2026/03/05/ai-in-accounting-2026-from-practical-automation-to-strategic-advantage)
- [Accounting Today: AI Thought Leaders Survey 2026](https://www.accountingtoday.com/list/ai-thought-leaders-survey-2026-process-predictions)
- [BlackLine: Finance Team Data Confidence Survey](https://www.blackline.com)
- [Cushman & Wakefield: 2026 AI Impact Barometer](https://www.cushmanwakefield.com)

---

*Word count: 2,301*
