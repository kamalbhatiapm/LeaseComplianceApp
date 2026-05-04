# LegalGraph — QA Bug Backlog

**QA run date:** 2026-05-03  
**Last updated:** 2026-05-04  
**Scope:** Full end-to-end review of UI, extraction logic, eval suite, and build pipeline  
**Source:** HHH eval results v1 + manual code inspection  

Priority definitions: **P0** = blocks ship / data integrity · **P1** = significant UX or trust gap · **P2** = notable gap, workaround exists · **P3** = polish / nice-to-have  
Status: ✅ Fixed · 🔄 In progress · ⬜ Open

---

## Summary

| Priority | Total | Fixed | Open |
|----------|-------|-------|------|
| P0 | 5 | 5 | 0 |
| P1 | 5 | 5 | 0 |
| P2 | 6 | 0 | 6 |
| P3 | 5 | 2 | 3 |
| **Total** | **21** | **12** | **9** |

**Ship status: ✅ Ship criteria met** — all P0 and required P1 bugs resolved (PR #6).  
Re-run HHH eval after next deploy to confirm score clears 90/105.

---

## P0 — Blocks Ship

### ✅ BUG-001 · Wrong clause numbers for Termination and Governing Law
**Fixed in:** PR #6 · 2026-05-04
**Area:** Extraction accuracy  
**What:** The results screen cites "Clause 14.1 — Early Termination" and "Clause 22.4 — Governing Law." The actual DOCX has only 15 sections. Termination Rights is **Section 9**, and Governing Law is **Section 14**. Section 22 does not exist.  
**Impact:** Auditors verifying clause citations will immediately find a mismatch and lose trust in all other extractions.  
**Fix:** Update the hardcoded clause citations in the results screen:
- Termination Rights → `§9.1 — "Termination Rights"`
- Governing Law → `§14.1 — "Governing Law and Dispute Resolution"`

---

### ✅ BUG-002 · "IFRS 16 compliant" pill is an unsupported compliance assertion
**Fixed in:** PR #6 · 2026-05-04
**Area:** Honesty / legal risk  
**What:** The results screen shows a pill labeled "IFRS 16 compliant." The system has not verified compliance — it has only extracted fields. A missing discount rate means the lease schedule *cannot* be IFRS 16 compliant yet.  
**Impact:** A user could rely on this label to sign off on a compliance filing. This is a legal liability.  
**Fix:** Replace with "IFRS 16 fields extracted" or "Extraction complete." Never assert compliance.

---

### ✅ BUG-003 · No professional review disclaimer anywhere in the product
**Fixed in:** PR #6 · 2026-05-04
**Area:** Harmlessness / legal risk  
**What:** No text in the UI tells users that outputs are not legal advice or accounting opinions, and that a qualified accountant and attorney must review before booking journal entries or signing disclosures.  
**Impact:** Users may treat the system's output as authoritative. HHH eval scored A4 = 1/5.  
**Fix:** Add a persistent footer: *"LegalGraph assists with extraction and risk flagging. Always have a qualified accountant and legal counsel review outputs before booking journal entries or signing financial disclosures."* Also show a modal on first use.

---

### ✅ BUG-004 · No pre-analysis consent for external data processing
**Fixed in:** PR #6 · 2026-05-04
**Area:** Privacy / harmlessness  
**What:** When the user clicks "Analyze Contract," the contract is processed and the webhook fires to n8n without the user being informed that their document is leaving the browser and going to an external service.  
**Impact:** GDPR and similar regulations require informed consent before processing personal or commercial data externally. HHH eval scored A5 = 2/5.  
**Fix:** Show a one-time consent modal before the first analysis: *"Your contract will be sent to [AI provider] for extraction and to your n8n workflow. By continuing, you consent to this processing."* Gate `runAnalysis()` on confirmation.

---

### ✅ BUG-005 · Remaining term and expiry date are inconsistent
**Fixed in:** PR #6 · 2026-05-04
**Area:** Data accuracy  
**What:** The AI Summary states the lease expires **December 31, 2028**. The metric card "Remaining Term" shows **4.6 yrs** with subtitle **"Expires Dec 31, 2030."** 2030 ≠ 2028. Either the expiry date or the remaining term subtitle is wrong.  
**Impact:** Users reporting to auditors will get contradictory dates from the same screen.  
**Fix:** The lease expires 2028-12-31. From today (2026-05-03) that is ~2.7 years remaining. Fix the metric card to show `≈2.7 yrs` and `Expires Dec 31, 2028`.

---

## P1 — Significant Gap

### ✅ BUG-006 · Risk score presented as exact number with no derivation or range
**Fixed in:** PR #6 · 2026-05-04
**Area:** Honesty / false precision  
**What:** The score "62/100" is displayed without explanation of how it was calculated, what inputs drive it, or what confidence interval it carries. The system shows it to one significant figure as if it were a precise measurement.  
**Impact:** Users may make significant financial decisions based on a number that is an estimate. HHH eval scored O6 = 2/5.  
**Fix:** Add a tooltip or info panel: *"Score is an estimate based on field coverage (weight: 40%) and flag severity (weight: 60%). Range: 0–49 Low, 50–69 Medium, 70–100 High. Margin of error: ±8 points."*

---

### ✅ BUG-007 · No file size or file type validation before analysis begins
**Fixed in:** PR #6 · 2026-05-04
**Area:** Input validation / security  
**What:** The `<input>` uses `accept=".pdf,.doc,.docx,.txt"` but this is a browser hint only — it can be bypassed. The JS `onFileSelected()` reads `file.size` for display but never enforces the advertised 50 MB limit or validates MIME type.  
**Impact:** A user could submit a 200 MB binary or an `.exe` renamed to `.docx`, triggering a silent failure or backend error with no user feedback.  
**Fix:** In `onFileSelected()`, check `file.size > 50 * 1024 * 1024` and reject with a user-visible error. Also check `file.type` or filename extension against an allowlist.

---

### ✅ BUG-008 · No mobile/responsive layout
**Fixed in:** PR #6 · 2026-05-04
**Area:** Accessibility / usability  
**What:** The `<meta name="viewport">` tag is present but there are zero `@media` breakpoints in the CSS. On screens narrower than ~1100px the three-column layouts (terms grid, sidebar, playbook table) overflow and become unusable.  
**Impact:** Any user on a tablet or phone sees a broken layout.  
**Fix:** Add responsive breakpoints: collapse sidebar below 900px, stack the terms grid to single-column below 600px, make the playbook table horizontally scrollable on small screens.

---

### ✅ BUG-009 · Landlord-only termination right not flagged as a lessee risk
**Fixed in:** PR #6 · 2026-05-04
**Area:** Risk flag completeness  
**What:** The termination rights field correctly extracts "Landlord only (12-month notice)" — meaning the *lessee has no exit right*. This is material to IFRS 16 lease term assessment (IFRS 16.B34) because the existence of a termination option affects the lease term used in liability calculations. It is not flagged.  
**Impact:** A compliance officer would flag this. HHH eval scored A3 = 3/5.  
**Fix:** Add rule: if `termination_party === "Landlord"` (lessee has no option), raise a medium risk flag: *"Lessee has no unilateral termination right. Per IFRS 16.B34, confirm that the non-cancellable period used in the lease liability calculation reflects this."*

---

### ✅ BUG-010 · `__WEBHOOK_URL__` placeholder visible if build.sh fails silently
**Fixed in:** PR #6 · 2026-05-04
**Area:** Build pipeline / security  
**What:** `build.sh` runs a `grep` check after substitution and exits 1 if placeholders remain. However, if Netlify's build environment doesn't set `WEBHOOK_URL`, `set -e` catches `: "${WEBHOOK_URL:?}"` and fails the build — but only *before* producing `dist/index.html`. If the check is bypassed or the prior deploy's artifact is served, users see a literal `__WEBHOOK_URL__` string in the JS.  
**Impact:** The webhook silently fails with a fetch error to the string `__WEBHOOK_URL__` — confusing and unprofessional.  
**Fix:** Add a runtime JS guard at the top of the script block:
```js
if (WEBHOOK_URL.startsWith('__')) {
  console.error('Build misconfiguration: WEBHOOK_URL placeholder not replaced.');
}
```

---

## P2 — Notable Gap ⬜ All open

### ⬜ BUG-011 · No request timeout on webhook fetch
**Area:** Resilience  
**What:** The `fetch(WEBHOOK_URL, ...)` call has no timeout. If n8n is slow or the network stalls, the analysis UI hangs indefinitely on "Sending to n8n workflow…" with the button disabled.  
**Impact:** Users are stuck with no feedback and no way to proceed to results.  
**Fix:** Wrap the fetch in `AbortController` with a 10-second timeout:
```js
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 10000);
const res = await fetch(WEBHOOK_URL, { signal: controller.signal, ... });
clearTimeout(timer);
```

---

### ⬜ BUG-012 · Double-submit possible if user clicks nav links during analysis
**Area:** Race condition  
**What:** The "Analyze" button is disabled during analysis, but the sticky page-nav links (`#screen1`, `#screen2`, `#screen3`) and sidebar nav links remain fully clickable. A user clicking "② Analysis Results" mid-analysis will scroll to the static mockup results before the real flow completes, causing confusion.  
**Impact:** User sees results before analysis finishes, or misses the webhook toast.  
**Fix:** Disable or visually lock nav links during analysis. Re-enable in the `finally` block.

---

### ⬜ BUG-013 · Per-field confidence not surfaced — only aggregate "96%"
**Area:** Transparency / honesty  
**What:** All 8 found fields show the same green confidence dot. The AI Summary says "96% confidence across 8 of 9 key fields" as one number. Users cannot see which individual fields are less certain and should be manually verified.  
**Impact:** A field with 0.82 confidence looks identical to one with 0.99. HHH eval scored O2 = 3/5.  
**Fix:** Show numeric confidence on hover (tooltip) per term row, e.g., "Confidence: 0.94." Flag fields below 0.85 with an amber dot instead of green.

---

### ⬜ BUG-014 · Playbook checklist is not adapted to this contract's detected risks
**Area:** Helpfulness  
**What:** The playbook sidebar always shows the generic "IFRS 16 Standard Template v2.4" with the same 9 required fields for every contract. It does not highlight or promote the checklist items that correspond to the flagged risks (discount rate, renewal certainty).  
**Impact:** The playbook panel is decorative rather than actionable. HHH eval scored H7 = 3/5.  
**Fix:** After analysis, programmatically highlight playbook checklist rows that correspond to flagged fields. Add a "Jump to related checklist item" link on each risk flag card.

---

### ⬜ BUG-015 · No accessibility (ARIA) attributes on interactive elements
**Area:** Accessibility  
**What:** Zero `aria-*` attributes found in the entire HTML file. Buttons have no `aria-label`, the drag-and-drop zone has no `role`, progress steps have no `aria-live`, and the toast has no `role="alert"`.  
**Impact:** Screen reader users cannot use the product at all.  
**Fix:** At minimum: add `role="alert"` to the webhook toast, `aria-live="polite"` to the progress panel, `aria-label` to icon-only buttons, and `role="button" tabindex="0"` to the upload zone.

---

### ⬜ BUG-016 · Nav links are `<div>` elements — not keyboard accessible
**Area:** Accessibility  
**What:** All top-nav links (Dashboard, Leases, Reports, Playbooks, Audit Trail) are `<div class="nav-link">` elements. They are not focusable and cannot be activated by keyboard.  
**Fix:** Change to `<button>` or `<a href>` elements, or add `tabindex="0"` and `onkeydown` Enter/Space handling.

---

## P3 — Polish (2 fixed, 3 open)

### ⬜ BUG-017 · No guidance on where to obtain the IBR
**Area:** Actionability  
**What:** The "Enter IBR manually" button appears without any explanation of what the IBR is or how to obtain it. A first-time user may not know to contact their treasury team or lender.  
**Fix:** Add helper text below the button: *"The incremental borrowing rate (IBR) is the rate your company would pay to borrow a similar amount over a similar term. Obtain it from your treasury team or primary lender."*

---

### ✅ BUG-018 · Toast auto-dismisses in 7 s — too short for users to read the error
**Fixed in:** PR #6 · 2026-05-04 (incidental fix while resolving P1 bugs)
**Area:** UX  
**What:** `setTimeout(dismissToast, 7000)` runs regardless of success or failure. On a webhook error, the error message disappears in 7 seconds before the user has time to note the HTTP status code.  
**Fix:** On success, keep 7 s. On error, do not auto-dismiss — require explicit user close, or extend to 30 s.

---

### ✅ BUG-019 · "Analyze Contract" button resets `onclick` to `scrollIntoView` after one run
**Fixed in:** PR #6 · 2026-05-04 (incidental fix while resolving P1 bugs)
**Area:** Re-analysis flow  
**What:** After analysis completes, `btn.innerHTML = '📊 View full report'` and `btn.onclick = () => screen2.scrollIntoView(...)`. If the user uploads a second contract and clicks the button, it scrolls instead of re-running analysis.  
**Fix:** Reset `btn.onclick = null` (back to the HTML `onclick="handleAnalyzeClick()"`) when `onFileSelected()` is called for a new file, and re-set `btn.innerHTML = 'Analyze Contract'`.

---

### ⬜ BUG-020 · No handling of complex lease structures flagged for manual review
**Area:** Completeness  
**What:** The system has no pathway for contracts with subleases, variable lease payments, purchase options, or evergreen/rolling terms — structures that require different IFRS 16 treatment. Such contracts would produce the same UI as a simple lease, silently. HHH eval scored A7 = 2/5.  
**Fix:** Add a detection heuristic: if the contract mentions "sublease," "variable," "CPI," "purchase option," or "month-to-month," surface a banner: *"This contract may contain features that require specialist review before IFRS 16 accounting can be applied."*

---

### ⬜ BUG-021 · `progressFileName` falls back to hardcoded filename
**Area:** UX / accuracy  
**What:** In `runAnalysis()`:
```js
document.getElementById('progressFileName').textContent =
  selectedFile ? selectedFile.name : 'HQ_Lease_SFOffice_2024.pdf';
```
`selectedFile` is always set before `runAnalysis()` is called, so the fallback is never shown. But if the flow ever changes, a hardcoded filename leaks into production.  
**Fix:** Remove the fallback — throw an error or return early if `selectedFile` is null.

---

## Detailed Status

| ID | Priority | Area | Status | Fixed in |
|----|----------|------|--------|----------|
| BUG-001 | P0 | Extraction accuracy | ✅ Fixed | PR #6 |
| BUG-002 | P0 | Honesty / legal risk | ✅ Fixed | PR #6 |
| BUG-003 | P0 | Harmlessness / legal risk | ✅ Fixed | PR #6 |
| BUG-004 | P0 | Privacy / harmlessness | ✅ Fixed | PR #6 |
| BUG-005 | P0 | Data accuracy | ✅ Fixed | PR #6 |
| BUG-006 | P1 | Honesty / false precision | ✅ Fixed | PR #6 |
| BUG-007 | P1 | Input validation / security | ✅ Fixed | PR #6 |
| BUG-008 | P1 | Accessibility / usability | ✅ Fixed | PR #6 |
| BUG-009 | P1 | Risk flag completeness | ✅ Fixed | PR #6 |
| BUG-010 | P1 | Build pipeline / security | ✅ Fixed | PR #6 |
| BUG-011 | P2 | Resilience | ⬜ Open | — |
| BUG-012 | P2 | Race condition | ⬜ Open | — |
| BUG-013 | P2 | Transparency / honesty | ⬜ Open | — |
| BUG-014 | P2 | Helpfulness | ⬜ Open | — |
| BUG-015 | P2 | Accessibility | ⬜ Open | — |
| BUG-016 | P2 | Accessibility | ⬜ Open | — |
| BUG-017 | P3 | Actionability | ⬜ Open | — |
| BUG-018 | P3 | UX | ✅ Fixed | PR #6 (incidental) |
| BUG-019 | P3 | Re-analysis flow | ✅ Fixed | PR #6 (incidental) |
| BUG-020 | P3 | Completeness | ⬜ Open | — |
| BUG-021 | P3 | UX / accuracy | ⬜ Open | — |

**Ship criteria: ✅ Met** — all P0 and required P1 bugs resolved in PR #6.  
**Next:** Re-run HHH eval after next Netlify deploy to confirm score clears 90/105.  
**Remaining open:** 9 bugs (6× P2, 3× P3) — recommended for next sprint.
