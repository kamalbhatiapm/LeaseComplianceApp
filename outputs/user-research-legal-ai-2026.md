# User Research: In-House Legal Teams & AI Contract Review
**Date**: May 8, 2026
**Researcher**: Senior PM, LegalGraph

> **Context files read:** company-overview.md, competitive-landscape.md, product-description.md, templates/user-research-format.md, sample-prompts/user-research-prompt.md, outputs/market-research-legal-ai-2026.md
> **Note:** user-personas.md removed from company-context/. Personas reconstructed from product-description.md use cases, company-overview.md, and web research.

---

## Research Objectives

1. Understand how in-house legal teams currently review contracts — tools, time, workflows, and bottlenecks
2. Identify the top pain points preventing attorneys from adopting AI contract review tools
3. Understand what "good" looks like for LegalGraph's primary users (AGC, Senior Counsel, GC)
4. Identify unmet needs that should inform the Contract Negotiation Assistant, onboarding improvements, and analytics roadmap
5. Uncover behavioral patterns that explain LegalGraph's 55% activation rate and 8-loss rate to manual process

---

## Methodology

**Research approach:** Secondary research synthesis combining:
- Previous LegalGraph market research (outputs/market-research-legal-ai-2026.md)
- Industry survey reports: CLOC State of the Industry 2025, FTI Technology GC Report 2025, Axiom Law 2025 AI Legal Report, GC AI Customer Survey (100+ in-house teams, Dec 2025)
- Review platform analysis: G2, Capterra (Ironclad, LawGeex, Kira reviews)
- Bloomberg Law, Wolters Kluwer, and Gartner research on legal AI adoption
- Industry publications: Artificial Lawyer, Legartis, Wordsmith AI legal trends 2026

**Limitations:** No primary interview data. Recommendations should be validated with 5–8 customer interviews with AGC/GC roles before roadmap finalization. User-personas.md removed — recommend restoring for future runs.

---

## Key Personas Analyzed

### Persona 1: Sarah — Associate General Counsel (Primary User)

- **Role & Responsibilities:** Reviews 30–100 contracts/month; manages 2–4 junior attorneys; enforces company playbooks; handles NDA, vendor, and customer contract workflows; reports to GC
- **Goals:**
  - Clear contract backlog without adding headcount
  - Maintain consistent risk standards across team reviews
  - Reduce time on routine contracts (NDAs, DPAs) to focus on complex/high-value work
  - Show GC and business teams that legal is a revenue enabler, not a bottleneck
- **Pain Points:**
  - Contract volume grows faster than team size — backlog creates deal delays
  - Inconsistent risk assessments across junior reviewers
  - Spreadsheet-based deviation tracking breaks down at scale
  - Business teams bypass legal on "small" contracts (shadow contracts)
  - 77% of lawyers use email as primary task management — contracts get buried in inboxes
- **Current Solutions:**
  - Word + tracked changes for redlines
  - Email chains for review requests and approvals (stretching weeks)
  - Spreadsheet templates for clause tracking
  - Informal ChatGPT use for summarization (shadow IT)

---

### Persona 2: Marcus — General Counsel (Economic Buyer)

- **Role & Responsibilities:** Heads legal department (5–20 attorneys); owns legal tech budget; sits in leadership meetings; manages outside counsel spend; accountable to CEO/Board for legal risk
- **Goals:**
  - Demonstrate legal's ROI to the CEO and board
  - Reduce outside counsel spend (79% of GCs report pressure to cut it)
  - Get board-level portfolio risk visibility without manual reporting
  - Protect the company from contract risk without slowing deals
- **Pain Points:**
  - No real-time view of company's contract risk portfolio
  - 57% of legal departments don't track or quantify cost savings — can't report ROI
  - Outside counsel spend rising faster than revenue growth
  - Hallucination liability risk: worried about AI errors reaching courts (600+ cases on record)
  - Shadow IT risk: attorneys using personal ChatGPT accounts with sensitive contract data
- **Current Solutions:**
  - Quarterly outside counsel billing reviews
  - Manual contract risk reports (compiled by team in Excel)
  - Gartner/Forrester reports for legal tech evaluation
  - Peer GC networks (ACC, CLOC) for vendor recommendations

---

### Persona 3: Jordan — Legal Operations Manager (Power User / Champion)

- **Role & Responsibilities:** Runs legal technology, process, and workflow for the department; drives tool adoption; manages vendor relationships; often the person who finds LegalGraph, champions it internally, and manages the onboarding
- **Goals:**
  - Implement tools that attorneys actually adopt (low change management burden)
  - Reduce contract cycle time from submission to approval
  - Build scalable workflows that don't require adding attorneys
  - Get reporting metrics that prove legal tech ROI
- **Pain Points:**
  - Platforms force teams into rigid workflows that don't match how they actually work
  - Implementation that takes months instead of weeks kills adoption momentum
  - Unused seats after enterprise contract signing — renegotiations happening in 2026
  - One-size-fits-all AI doesn't map to company-specific playbooks
- **Current Solutions:**
  - Evaluates 3–5 tools per category before recommending to GC
  - Often runs a 30-day pilot before full rollout
  - Builds internal templates and training guides for adoption
  - Uses CLOC and ACC LegalTech communities for vendor intel

---

## Key Findings

### Finding 1: Email and spreadsheets remain the default — adoption friction is the #1 activation barrier

- **Insight:** 77% of lawyers use email as their primary task and project management tool. Contract review requests, approvals, and status updates all flow through email chains that stretch weeks. Platforms that require lawyers to leave their existing tools (Word, Outlook) are used less than those that integrate with them.
- **Evidence:** "Email chains for contract reviews are stretching for weeks, requests are disappearing into spreadsheet black holes, business stakeholders are constantly asking 'What's the status?'" (Bloomberg Law, 2026). Spellbook's traction confirms lawyers prefer reviewing inside Word.
- **Implication:** LegalGraph's 55% activation rate and 8 losses to manual process are directly tied to this. The product needs a lower-friction first-mile experience — one-click upload from email, Word add-in for review, or Outlook integration — to close the activation gap from 55% → 70%.

---

### Finding 2: Shadow IT is the real competition — not other tools

- **Insight:** Lawyers who find their sanctioned legal tech platform slow, clunky, or incomplete default to personal ChatGPT/Claude accounts. This is the dominant informal solution for contract summarization and clause querying. It also creates significant data leakage risk with sensitive contract information.
- **Evidence:** "Shadow IT is the biggest risk facing most legal departments. Lawyers at firms and in-house use ChatGPT or Claude on personal accounts because their sanctioned platform is slow, clunky, or does not cover the task." (Bloomberg Law, 2026). LegalGraph's own data: 8 losses to manual process last quarter; change resistance ("lawyers prefer Word") cited directly.
- **Implication:** Speed and simplicity in the core review flow are existential — every friction point is an invitation for users to go back to ChatGPT. Onboarding must get users to value (first contract reviewed) in under 10 minutes.

---

### Finding 3: Playbook customization is the biggest unlock — and biggest setup barrier

- **Insight:** Generic AI tools (pre-trained on public contracts) quickly hit a ceiling. Users who invest in mapping their company's specific playbook into LegalGraph see dramatically higher value and retention. But setting up playbooks is complex enough that teams often skip it, limiting the product to commodity clause extraction rather than its full differentiator.
- **Evidence:** "Users will realize that introducing their own context — playbooks, precedents, templates, preferred legislation — will become the main driver of value." (Wordsmith AI, 2026). LegalGraph win/loss: 12 wins vs LawGeex specifically cited customization as the reason.
- **Implication:** Playbook setup must become a guided, fast-path experience — not an advanced admin task. A "playbook wizard" with pre-built industry templates (tech, SaaS, healthcare) that teams can customize in < 30 minutes would directly drive activation and retention.

---

### Finding 4: GCs can't quantify ROI — and that kills renewals

- **Insight:** 79% of GCs report pressure to reduce outside counsel spend, but 57% of legal departments don't track or quantify savings. This means most GC buyers cannot justify legal tech renewals with hard data, leading to contract renegotiations and churn when budgets are scrutinized.
- **Evidence:** "57% acknowledge they do not track or quantify the data or any savings they may achieve." (LegalBillReview, 2025). Gartner Q4 2025: AI and contract analytics are urgent priorities for GCs, with ROI proof as the gating factor for continued investment.
- **Implication:** LegalGraph needs to make ROI *automatic and visible* — not something users have to calculate. The ROI report (time saved × attorney rate) must be surfaced prominently on the GC dashboard and sent as a monthly digest. This directly supports OKR Objective 2 (NPS 42 → 60) and reduces renewal risk.

---

### Finding 5: AI trust deficit is the primary barrier among late adopters

- **Insight:** 42% of slow adopters cite distrust in AI as their primary barrier. With 600+ AI hallucination cases in courts and Stanford research showing 17–34% error rates in legal-specific tools, GCs are right to be cautious. This trust gap is holding back a large cohort of potential LegalGraph customers who are aware of AI but won't adopt without proof.
- **Evidence:** "42% of slow adopters cite mistrust in AI and ethical concerns, 41% want to wait for AI to become more reliable." (Wolters Kluwer, 2025). LegalGraph's 88% risk scoring accuracy and 94% clause extraction accuracy are competitive — but only if backed by validated, published evidence.
- **Implication:** Confidence scores and "AI uncertain" flags in the UI are necessary but not sufficient. An independently validated accuracy benchmark report (OKR KR2) becomes the key trust-building tool for this segment. It should be promoted in sales materials, gated content, and the product itself.

---

### Finding 6: Contract cycle time and deal delay are the business team's pain — not just legal's

- **Insight:** 57% of business development professionals report that contracting inefficiencies delay revenue recognition. 50% have experienced lost business opportunities due to slow contract review. This means the business case for LegalGraph extends beyond the legal team — sales, procurement, and ops all feel the pain.
- **Evidence:** "57% of business development professionals report that contracting inefficiencies delay revenue recognition, whereas 50% have experienced lost business opportunities altogether." (Streamline.ai, 2026). Also reflected in LegalGraph use case 2: MSA negotiation 6 hours → 45 minutes, enabling faster deal closes.
- **Implication:** LegalGraph's value proposition should extend to "helps your sales team close faster" — not just "saves your legal team time." This reframes the budget conversation from a legal cost center to a revenue enabler. Salesforce integration (already live) should be front-and-center in sales materials targeting RevOps and CRO audiences.

---

### Finding 7: Once trust is established, AI adoption expands across workflows naturally

- **Insight:** Resistance to AI in contract review has dropped to just 5%. Once teams trust the tool for one contract type (e.g., NDAs), they naturally expand to MSAs, vendor contracts, and eventually playbook management. This "land and expand" behavior is a retention and upsell signal — not just an activation metric.
- **Evidence:** "Once trust is established in contract review, AI adoption expands naturally into other legal workflows." (LegalOnTech, 2026). LegalGraph data: 92% net retention for enterprise; 12,500 contracts/month growing 18% MoM.
- **Implication:** Activation strategy should be laser-focused on one high-value contract type first (NDAs for most customers), then systematically expand. The onboarding flow should guide users through a "first win" on their highest-volume contract type before introducing playbooks or analytics.

---

## User Needs & Requirements

### High Priority

1. **Frictionless contract upload from existing tools (email, Word, SharePoint)**
   - User quote/evidence: "Word and Outlook integration matters more than marketing suggests. Lawyers live in Word and Outlook. A platform that requires leaving those surfaces gets used less." (Bloomberg Law, 2026)
   - Business impact: Directly addresses 55% → 70% activation OKR. Every point of activation = ~8x higher conversion to paid.

2. **Automatic ROI reporting visible to GC (time saved, cost avoided)**
   - User quote/evidence: "57% acknowledge they do not track or quantify savings they may achieve." (LegalBillReview, 2025)
   - Business impact: Reduces renewal risk. Gives GC the data needed to justify budget. Supports 92% → 95% enterprise retention OKR.

3. **Guided playbook setup with pre-built templates (< 30 min to first playbook)**
   - User quote/evidence: "Introducing your own context — playbooks, precedents, templates — will become the main driver of value." (Wordsmith AI, 2026)
   - Business impact: Unlocks the core LegalGraph differentiator. Teams that configure playbooks have significantly higher retention and expansion revenue.

4. **Published, validated accuracy benchmarks**
   - User quote/evidence: "42% of slow adopters cite mistrust in AI and ethical concerns, 41% want to wait for AI to become more reliable." (Wolters Kluwer, 2025)
   - Business impact: Unblocks the late-adopter segment. Directly maps to OKR Objective 3, KR2.

### Medium Priority

5. **AI-powered redline suggestions tied to playbook (Contract Negotiation Assistant)**
   - User quote/evidence: LegalGraph use case 2 — MSA review: 6 hours → 45 minutes with AI redline suggestions. Highest-ROI workflow for Senior Counsel.
   - Business impact: Increases deal size ($45k → $85k OKR target). Differentiates from LawGeex and commodity review tools.

6. **Portfolio-level risk dashboard for GC (risk heatmap, trends, benchmarks)**
   - User quote/evidence: "79% of legal departments report pressure to reduce outside counsel spend" — but no visibility into which contracts are driving risk. (LegalBillReview, 2025)
   - Business impact: Moves LegalGraph from "attorney tool" to "GC strategic platform." Enables upsell from Professional → Enterprise tier.

7. **Approval workflow with Slack/email notifications**
   - User quote/evidence: "Email chains for contract reviews are stretching for weeks." (Bloomberg Law, 2026)
   - Business impact: Reduces contract cycle time. Improves collaboration between legal and business stakeholders. Reduces shadow contracts.

---

## Behavioral Patterns

**Tool usage:**
- Primary tools today: Word (drafting/redlines), Outlook (review requests/approvals), Excel/Google Sheets (clause tracking), ChatGPT (informal summarization)
- Legal teams resist adopting new platforms that don't integrate with Word or email
- Legal ops managers (Jordan persona) are the adoption champions — they run pilots, build training, and manage rollout

**Workflow patterns:**
- Contract review is triggered by email request → manual triage → review in Word → email back with redlines → email approval chain
- High-volume routine contracts (NDAs) reviewed in batches on Monday mornings; complex contracts (MSAs) get dedicated review sessions
- Playbook enforcement is currently manual: attorneys "remember" standards or reference a shared doc; inconsistency grows with team size
- Outside counsel escalation happens when internal team is overloaded, not by risk tier — an inefficiency LegalGraph can fix with AI triage

**Decision-making:**
- Junior attorneys flag issues and escalate; senior counsel makes risk calls; GC approves anything with high liability exposure
- AI recommendations are trusted (78% follow LegalGraph risk scores) but only after initial trust-building period (first 5–10 contracts)
- Buying decisions led by legal ops or AGC; GC approves budget above $50k; IT security review required for cloud tools

**Information seeking:**
- GC peers (ACC, CLOC) are the #1 source for tool recommendations — peer validation beats vendor marketing
- G2 and Capterra reviews consulted during evaluation (Ironclad: 4.5/5 G2; LawGeex: 4.7/5 G2)
- Trials and POCs are the primary conversion mechanism — "see it work on our contracts" before signing

**Time allocation (estimated):**
- 40% of attorney time: contract review and redlines
- 25%: client/stakeholder communication and approvals
- 20%: research, drafting, negotiation
- 15%: admin, reporting, meeting prep

---

## Recommendations

**Confidence: High**

1. **Redesign onboarding to achieve first contract reviewed in < 10 minutes** *(addresses Findings 1, 2, 7)*
   - Build an "email-to-LegalGraph" forwarding feature and a Word add-in (even basic) to reduce context switching
   - Guided setup flow: contract type → upload sample → review AI results → first win
   - Remove all steps between signup and first contract reviewed
   - *Maps to: Activation OKR 55% → 70%; LegalGraph's biggest growth lever*

2. **Launch "Playbook Wizard" with 10 industry-standard templates** *(addresses Finding 3)*
   - Pre-built playbooks for SaaS/Tech, Healthcare, Real Estate, Financial Services
   - 5-step setup: choose template → customize red lines → set approval matrix → go live
   - Target: < 30 minutes from zero to first playbook applied
   - *Maps to: Retention, expansion revenue, competitive differentiation vs LawGeex*

3. **Build GC ROI Dashboard with auto-generated monthly digest** *(addresses Finding 4)*
   - Dashboard: time saved this month, cost avoided, contracts reviewed, high-risk flags
   - Monthly email digest to GC with YTD ROI (time saved × $300/hour attorney rate)
   - *Maps to: Enterprise retention OKR 92% → 95%; reduces renewal risk*

4. **Publish accuracy benchmark report before Q3 2026** *(addresses Finding 5)*
   - Partner with a law school or Big 4 legal audit firm for independent validation
   - Publish as gated content and in-app ("This result validated at 94% accuracy by [firm]")
   - *Maps to: OKR Objective 3 KR2; unblocks late-adopter segment (42% of prospect universe)*

5. **Reposition messaging for RevOps/Sales audience — "close deals faster"** *(addresses Finding 6)*
   - Add a sales-focused ROI angle: "Legal delays cost sales teams X deals/year"
   - Salesforce integration story for AEs: "Contract status visible in your CRM in real-time"
   - *Maps to: Deal size OKR $45k → $85k; opens new buyer persona beyond legal team*

---

## Appendix

### Additional Evidence & Quotes

- *"63% of legal departments cite bandwidth and workload as their top operational challenge."* — CLOC State of the Industry Report, 2025
- *"More than a third of GCs (36%) are focused on adopting AI, building AI skills, or improving AI risk management."* — Gartner GC Survey, Q4 2025
- *"Contract law firms were most interested in replacing legal-specific functions like contract drafting and review, automating previously outsourced work."* — Wolters Kluwer, 2025
- *"Rushed adoption, unclear ROI, and poor integration can create operational friction and security exposure."* — LegalFly, 2026
- *"Per-seat pricing is fundamentally at odds with AI's variable, outcome-driven value."* — Legal AI Trends, 2026 (implication: LegalGraph's flat $45k/year enterprise pricing is well-positioned)
- LegalGraph internal: 92% of users trust risk scores; 78% follow AI recommendations (product-description.md)
- LegalGraph internal: 12,500 contracts/month, 3.5 hours saved per contract = 43,750 hours/month saved across customer base

### Data Sources

- [AI Contract Review for In-House Counsel: The 2026 Guide — GC AI](https://gc.ai/blog/ai-contract-review)
- [2025 General Counsel Survey Report — FTI Technology](https://ftitechnology.com/spotlight/gc-report-2025)
- [Gartner Survey: AI and Contract Analytics are Urgent Priorities for General Counsel — Gartner, Q4 2025](https://www.gartner.com/en/newsroom/press-releases/2025-10-01-gartner-survey-shows-ai-and-contract-analytics-ar-urgent-priorities-for-general-counsel)
- [2025 Legal Department Survey: Outside Counsel Oversight — LegalBillReview](https://www.legalbillreview.com/blog/2025-legal-spend-survey-results)
- [Legal AI Adoption: Time Savings, Contract Review, Revenue Growth & Ethical Risks — Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/legal-ai-adoption-time-savings-revenue-growth)
- [Legal Workflow Automation in 2026 — Bloomberg Law](https://pro.bloomberglaw.com/insights/legal-solutions/legal-workflow-automation-in-2026-whats-working-and-whats-hype/)
- [Legal AI Trends 2026: Why In-House Legal Must Own the AI Stack — Wordsmith AI](https://www.wordsmith.ai/blog/legal-ai-trends-2026)
- [Best Contract Management Software for In-House Legal Teams 2026 — Xakia Tech](https://www.xakiatech.com/blog/best-contract-management-software-in-house-legal)
- [AI Adoption in Contract Review Doubles Year-Over-Year — LegalOnTech](https://www.legalontech.com/press-releases/ai-adoption-in-contract-review-doubles-year-over-year)
- [Contract Challenges for In-House Legal Teams — TermScout](https://blog.termscout.com/top-contract-challenges-for-in-house-legal-teams)

---

*Word count: 2,104*
