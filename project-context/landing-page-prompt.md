# Landing Page — Code Generation Prompt

## Role

You are a senior frontend engineer and conversion-focused copywriter building a marketing landing page for LegalGraph — an AI-powered lease compliance platform targeting mid-market finance and compliance teams.

Your goal is to produce a complete, production-ready landing page that:
- Speaks directly to the target user (Rachel, Compliance Lead, 10–50 active leases)
- Explains exactly how the product works in plain language
- Builds trust through specificity, not hype
- Matches the LegalGraph design system (dark theme, brand blue `#0071E3`, Inter/system font, rounded cards)
- Converts visitors into trial signups or demo requests

---

## Design System

Match the existing app exactly:

```css
/* Colors */
--page-bg:   #0d1117;
--surface:   rgba(255,255,255,.06);
--brand:     #0071E3;
--green:     #30d158;
--amber:     #ff9f0a;
--red:       #ff453a;
--t1:        #f5f5f7;   /* primary text */
--t2:        #a1a1a6;   /* secondary text */
--t3:        rgba(255,255,255,.45);

/* Typography */
font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;

/* Radii */
--radius-card: 20px;
--radius-btn:  980px;

/* Brand button */
background: #0071E3; color: #fff; border-radius: 980px; padding: 12px 28px; font-weight: 600;
```

---

## Page Sections (in order)

### 1. Nav
- Logo: "LegalGraph" wordmark (left)
- Links: How it works · Who it's for · Pricing (right)
- CTA button: "Request demo" (brand blue, pill shape)
- Sticky, frosted glass background on scroll

### 2. Hero
- Headline (max 10 words): Focus on the outcome, not the technology
  - Use: "Audit-Ready Lease Reports in Under 45 Minutes"
- Sub-headline (2 sentences max): Name the pain, name the user, name the regulation
  - Reference: IFRS 16 / ASC 842 compliance, quarterly deadline, audit trail
- Two CTAs: Primary "Request demo" + Secondary "See a sample report →"
- Social proof line below CTAs: "Trusted by finance teams at mid-market companies managing 10–50 active leases"
- Hero visual: A mock screenshot or illustration of the risk score card + extracted terms grid (use CSS to build a realistic UI mock — do not use placeholder images)

### 3. Problem (The Old Way)
- Section title: "Every quarter, the same 60-hour grind"
- Three pain cards with icons:
  1. **Manual extraction** — 20–40 min per lease copying fields from PDFs into Excel
  2. **No audit trail** — auditors ask "what clause supports this?" and you spend an hour hunting
  3. **Discount rate dead end** — IFRS 16 requires an IBR that's never in the contract, and you don't know where to get it
- Tone: Empathetic, specific, no adjectives. These should read like Rachel's actual words.

### 4. How It Works (3 steps)
- Section title: "From PDF to audit-ready report — 3 steps"
- Step 1: **Upload your lease PDF** — drag-and-drop, PDF only, processed in under 45 seconds
- Step 2: **AI extracts all IFRS 16 / ASC 842 fields** — commencement date, rent schedule, renewal options, discount rate, ROU asset value. Each field shows confidence score and source clause so you can verify, not just trust.
- Step 3: **Resolve flags, export the audit log** — high-risk fields are gated. When all flags are acknowledged, export a PCAOB AS 1105-compliant PDF with clause citations, AI disclosure, and your sign-off.
- Each step: large step number, icon, title, 2-sentence description
- Optional: small UI mock or screenshot annotation per step

### 5. Who It's For
- Section title: "Built for the compliance lead who owns lease accounting"
- Two persona cards side by side:
  1. **Rachel — Compliance Lead**: Manages 10–50 leases, responsible for quarterly IFRS 16 / ASC 842 filings, currently spending 40–60 hours/quarter on manual extraction
  2. **Jennifer — CFO**: Signs off on audit submissions, needs confidence that AI-generated numbers have human review sign-off and full data lineage — "What happens if it's wrong?"
- Each card: role, 2-sentence description, 1 key quote in italics

### 6. Key Features
- Section title: "Everything the auditor will ask for — already in the report"
- Six feature tiles in a 3×2 grid:
  1. **Per-field confidence scores** — green/amber/red dots show where to focus your review time
  2. **Clause citations** — every extracted value links back to the exact sentence in the original PDF
  3. **IBR guidance** — when the discount rate is missing, step-by-step instructions for calculating or sourcing your incremental borrowing rate
  4. **PCAOB AS 1105 cover page** — AI model disclosure, human review sign-off, and analyzed date — exactly what your auditor requires
  5. **Export gate** — high-severity flags must be acknowledged before the PDF unlocks, so incomplete reports can't be submitted by mistake
  6. **Edit-in-place** — correct any AI extraction error directly in the UI; corrections are tracked and appear in the audit log

### 7. Trust / Compliance Bar
- Full-width section, slightly different background
- Headline: "Built for the post-PCAOB AS 1105 world"
- 2–3 sentence explanation: PCAOB amended AS 1105 effective December 2025. Any AI-generated financial output now requires full audit trail, per-field data lineage, and human review sign-off. LegalGraph generates all three automatically.
- Three trust badges: "IFRS 16 compliant" · "ASC 842 compliant" · "PCAOB AS 1105 audit trail"

### 8. Pricing (Optional — include if space)
- Simple 2-tier structure:
  - **Starter** — Up to 10 leases/quarter · $X/month · Core extraction + export
  - **Growth** — Up to 50 leases/quarter · $X/month · Everything + IBR guidance + auditor share link
- Note: "Pricing shown is directional — contact us for enterprise volume"

### 9. CTA Footer
- Headline: "Stop spending 60 hours a quarter on lease accounting"
- Sub: "Get a demo with your own lease PDF in under 30 minutes."
- Button: "Request demo" (large, centered, brand blue)
- Secondary: "Or download a sample IFRS 16 audit report →"

### 10. Footer
- Logo + tagline: "AI-assisted, human-reviewed lease compliance"
- Links: Privacy · Terms · Contact
- Disclaimer: "AI-assisted — requires human review — not legal or financial advice"
- Copyright: "© 2026 LegalGraph"

---

## Copy Guidelines

- **No adjectives that don't earn their place.** "Revolutionary", "powerful", "seamless" — cut them all.
- **Speak Rachel's language.** She thinks in quarters, fields, auditor revision requests, and hours saved — not "AI-powered workflows."
- **Name the regulation.** IFRS 16, ASC 842, PCAOB AS 1105 — these are trust signals to her, not jargon.
- **Specific numbers beat vague claims.** "Under 45 minutes" beats "fast." "10–50 leases" beats "mid-market."
- **Don't hide the how.** The 3-step section must make the mechanism crystal clear — upload → extract → export.

---

## Technical Requirements

- **Single HTML file** with embedded CSS and no external dependencies (except a Google Font import for Inter if needed)
- **Dark theme by default**, matching `#0d1117` page background
- **Fully responsive** — mobile (375px), tablet (768px), desktop (1280px)
- **No placeholder images** — build UI mocks in pure CSS/HTML
- **Smooth scroll** on nav link clicks
- **Frosted glass nav** on scroll (use `backdrop-filter: blur`)
- All buttons should have hover states matching the design system
- Use semantic HTML (nav, main, section, footer, h1–h3)
- No JavaScript frameworks — vanilla JS only for scroll behavior

---

## Context

**Product:** LegalGraph — AI-powered IFRS 16 / ASC 842 lease compliance reporting
**Stage:** Series A, $12M raised, $3.8M ARR
**Target user:** Rachel — Compliance Lead at a mid-market company, 10–50 active leases, quarterly IFRS 16 / ASC 842 reporting responsibility
**Key differentiator:** PCAOB AS 1105 compliant audit trail with clause-level citations — something generic AI tools (ChatGPT, Copilot) cannot produce
**Competitor displacement opportunity:** Visual Lease (acquired by CoStar, customers re-evaluating), LeaseQuery/FinQuery (repositioning, losing lease focus)
**Primary CTA:** Request demo
**Secondary CTA:** Download sample report

---

## Output

Produce a single complete `index.html` file. Start with the `<!DOCTYPE html>` declaration. Do not truncate — output the entire file.
