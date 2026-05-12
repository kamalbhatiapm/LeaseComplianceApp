# LegalGraph — RAI Remediation Plan

**Based on:** RAI Results v1 (58/112, HOLD)  
**Date:** 2026-05-04  

Each open RAI gap is classified as:
- **UI** — fix in `APP.html` (frontend only)
- **Pipeline** — fix in the n8n agent workflow and/or AI prompt (changes what the model returns)
- **Both** — requires coordinated changes to the payload schema AND the UI that renders it
- **Process** — requires policy, legal, or testing work outside the codebase

---

## RAI-P0 — Must fix before regulated deployment

### H3 · Human sign-off on high-severity flags `UI` ✅ DONE (v1)

**Gap:** No reviewer field or acknowledgement checkbox on high flags. "Generate IFRS 16 Report" can be triggered with unresolved high flags.  
**Status:** Export gate ships. All High-severity flags must be acknowledged before Export PDF / Send to auditor buttons unlock. Completion banner shows after all High flags resolved.  
**Fix location:** UI only.

```html
<!-- Add to each high-severity risk flag card -->
<div class="sign-off-row">
  <label>
    <input type="checkbox" id="signoff-discount-rate" />
    I acknowledge this risk and confirm manual IBR has been entered
  </label>
  <input type="text" placeholder="Reviewer name" />
</div>
<!-- Disable report button until all high-flag checkboxes are checked -->
```

```js
function updateReportButton() {
  const highFlagBoxes = document.querySelectorAll('.high-flag-signoff');
  const allSigned = [...highFlagBoxes].every(cb => cb.checked);
  document.getElementById('generateReportBtn').disabled = !allSigned;
}
```

---

### S2 · Hard gate on "Generate IFRS 16 Report" `UI` ✅ DONE (v1)

**Gap:** The button is present and clickable even when discount rate is missing (high flag).  
**Status:** Export buttons are disabled (Lock icon + tooltip) when any High flag is unresolved. Gate enforced at 100% — no bypass.  
**Fix location:** UI only — disable the button until all high-severity flags have been signed off.

```js
// On results screen load, disable if any high flags unresolved
const hasOpenHighFlags = payload.risk_flags?.some(f => f.severity === 'high' && !f.resolved);
document.getElementById('generateReportBtn').disabled = hasOpenHighFlags;
```

Also add a tooltip on the disabled button: *"Resolve all high-severity flags before generating a report."*

---

### H4 · Accountability chain and Terms of Service `UI + Process`

**Gap:** No ToS, no liability disclosure, no escalation path.  
**Fix location:** Primarily process/legal — but the UI must link to it.

**UI change:**
```html
<!-- Add to footer and consent modal -->
<a href="/terms" target="_blank">Terms of Service</a> ·
<a href="/privacy" target="_blank">Privacy Policy</a> ·
<a href="mailto:legal@legalgraph.io">Report an issue</a>
```

**Process work required:**
- Draft ToS that explicitly scopes liability to "extraction assistance, not accounting or legal advice"
- Define escalation path for users who suffer financial loss from an extraction error
- Assign a named data controller for GDPR purposes

---

### F1 · Multi-jurisdiction testing `Process + Pipeline`

**Gap:** Only California-governed contracts tested.  
**Fix location:** Primarily eval/testing work, but the AI prompt also needs jurisdiction-aware extraction.

**Prompt addition (n8n agent):**
```
After extracting all fields, identify the governing law jurisdiction from the contract.
If the jurisdiction is not US/California, flag the following fields as requiring
jurisdiction-specific review before IFRS 16 application:
- Lease term calculation (renewal options may be treated differently)
- Termination rights (local tenant protection laws may override)
- Security deposit classification

Return: "jurisdiction": "<detected>", "jurisdiction_review_required": true/false
```

**Eval work:** Add at minimum one UK lease (IFRS 16 native), one NY-governed US lease, and one EU lease to `evals/cases/`.

---

## RAI-P1 — Fix within next sprint

### P2 · Data retention policy `UI + Process`

**Gap:** No retention period disclosed, no deletion mechanism.  
**Fix location:** UI (add to consent modal) + Process (define the policy).

```html
<!-- Add to consent modal body -->
<p style="font-size:12px;color:#6B7E8D;margin-top:12px;">
  Contract data is processed by [AI provider] and retained for up to 30 days
  for quality monitoring. n8n workflow data is retained per your self-hosted
  configuration. <a href="/privacy">See our Privacy Policy</a> for deletion requests.
</p>
```

---

### T3 · Per-field confidence scores `Both — Pipeline primary` ⚠ PARTIAL (v1)

**Gap:** All 8 found fields show the same green dot. No numeric per-field confidence.  
**Status:** UI half-done. Uncertainty chips (amber inline "AI uncertain — verify against §X.X") now appear for any field with confidence < 0.85. Confidence legend (green/amber/red dots) shown in Terms Grid header. Pipeline must still return real per-field confidence for this to work with live data — currently only MOCK_ANALYSIS values are used.  
**Fix location:** Pipeline first (model must return it), then UI renders it.

**Prompt change (n8n agent):**
```
For each extracted field, return a confidence score between 0.0 and 1.0 based on:
- 1.0: exact verbatim match in a clearly labelled clause
- 0.85–0.99: strong match with minor ambiguity (e.g., date format, implicit reference)
- 0.70–0.84: inferred from context, not directly stated
- < 0.70: uncertain — flag for manual review

Return format per field:
{
  "value": <extracted>,
  "confidence": <0.0–1.0>,
  "source_clause": "<§X.X>",
  "source_text": "<verbatim sentence from contract>"
}
```

**Payload schema change:**
```json
"fields": {
  "commencement_date": {
    "value": "2022-01-01",
    "confidence": 0.97,
    "source_clause": "§2.1",
    "source_text": "The Lease Term shall commence on January 1, 2022 ('Commencement Date')."
  }
}
```

**UI change:** Show numeric confidence on hover per term row. Amber dot for confidence < 0.85.

---

### E2 · Verbatim clause text `Both — Pipeline primary`

**Gap:** Only clause number and title shown. Verbatim source sentence not surfaced.  
**Fix location:** Pipeline (return `source_text` per field — see T3 prompt above), then UI.

**UI change (once pipeline returns `source_text`):**
```html
<div class="term-clause" title="§2.1 — The Lease Term shall commence on January 1, 2022.">
  📎 §2.1 — "Lease Commencement"
</div>
```
Or show it inline as a collapsible quote block below each term row.

---

### S3 · Hallucination prevention `Pipeline`

**Gap:** No mechanism to detect or flag extractions with no textual basis.  
**Fix location:** Pipeline only — the UI already supports a `conf-low` state.

**Prompt addition (n8n agent):**
```
For each field, you MUST locate the specific sentence in the contract that
justifies the extracted value. If you cannot find a direct textual basis:
- Set "value": null
- Set "confidence": 0.0
- Set "basis_found": false
- Set "source_text": null
- DO NOT infer or estimate a value

Never populate a field by reasoning from general knowledge of typical lease terms.
Only extract what is explicitly stated in the provided document text.
```

**Payload field:**
```json
"basis_found": true   // or false if the model could not locate supporting text
```

---

### R1 · Complex structure detection `Pipeline + UI`

**Gap:** System silently processes subleases, variable payments, and evergreen leases as standard contracts.  
**Fix location:** Pipeline (detect and return `complexity_flags`), then UI (render a warning banner).

**Prompt addition (n8n agent):**
```
Before extracting fields, scan the contract for the following complexity indicators.
For each detected, add an entry to "complexity_flags":

- "sublease": contract contains a subletting or assignment clause with active sublease
- "variable_payments": rent linked to CPI, index, turnover, or other variable
- "purchase_option": lessee has an option to purchase the asset
- "evergreen": no fixed expiry — automatically renews unless notice given
- "sale_leaseback": contract formed from a prior sale of the same asset
- "short_term_exemption": lease term ≤ 12 months (IFRS 16 exemption may apply)

Return: "complexity_flags": ["sublease", "variable_payments"]  // empty array if none
```

**UI change:** If `complexity_flags.length > 0`, show a banner above the results:
```html
<div class="alert alert-amber">
  ⚠ This contract contains complex structures (sublease, variable payments) that require
  specialist review before IFRS 16 accounting can be applied. Results below are indicative only.
</div>
```

---

### R2 · Adversarial input resistance `Process + Pipeline`

**Gap:** No adversarial test cases. No testing for conflicting dates or obfuscated terms.  
**Fix location:** Primarily eval work, but prompt robustness also needs hardening.

**Prompt hardening (n8n agent):**
```
If the contract contains conflicting information for the same field
(e.g., two different commencement dates in different clauses), do NOT
silently pick one. Instead:
- Set "value": null
- Set "conflict_detected": true
- Set "conflict_description": "Clause 2.1 states Jan 1 2022; Exhibit A states Mar 1 2022"
```

**Eval work:** Add to `evals/cases/`:
- `adversarial-conflicting-dates.json` — lease with contradictory commencement dates
- `adversarial-obfuscated-terms.json` — rent stated in words not numbers, non-standard section numbering

---

### F2 · Contract complexity parity `Process + Pipeline`

**Gap:** Only office lease tested. Retail, equipment, and sublease contracts untested.  
**Fix location:** Primarily eval work. Prompt also needs to be validated across contract types.

**Eval work:** Add to `evals/cases/`:
- `retail-lease-001.json` — turnover rent, fit-out incentives
- `equipment-lease-001.json` — no premises, different asset scope rules
- `sublease-001.json` — intermediate lessor treatment

---

## RAI-P2 — Recommended for sprint after next

### E3 · Risk score decomposition `Both`

**Gap:** Score methodology explained in tooltip but not the actual breakdown for this contract.  
**Fix location:** Pipeline (return component scores), then UI (render breakdown).

**Payload addition:**
```json
"score_breakdown": {
  "field_coverage_component": 35,
  "flag_severity_component": 27,
  "total": 62,
  "field_coverage_detail": "8 of 9 required fields found (weight: 40%)",
  "flag_severity_detail": "1 high flag × 20 pts + 2 medium flags × 8 pts + 1 low flag × 3 pts"
}
```

---

### H2 · Audit trail completeness `Both`

**Gap:** Audit trail maps clause → field but has no timestamp or model version.  
**Fix location:** Pipeline (return metadata), then UI (render it in the audit trail sidebar).

**Payload addition:**
```json
"extraction_metadata": {
  "model": "claude-sonnet-4-6",
  "prompt_version": "ifrs16-v1.2",
  "extracted_at": "2026-05-04T10:23:11Z",
  "document_hash": "sha256:abc123..."
}
```

---

### H1 · Manual field override `UI` ✅ DONE (v1)

**Gap:** "Edit extracted terms" button is non-functional mockup.  
**Status:** Edit-in-place ships. Overridden values show "Edited" pill with original strikethrough. Edits tracked via `track('field_edited', { key, original_value, corrected_value, confidence, source_clause })` and persisted to Supabase.  
**Fix location:** UI only — no pipeline change needed.

---

### F3 · Language coverage disclosure `Pipeline + UI`

**Gap:** Non-English contracts accepted silently with no warning.  
**Fix location:** Pipeline (detect language), UI (gate or warn).

**Prompt addition:**
```
Detect the primary language of the contract. If it is not English, return:
"document_language": "<ISO 639-1 code>",
"language_warning": "This contract is not in English. Extraction accuracy for non-English
contracts has not been validated. Results should be treated as preliminary."
```

---

## Summary

| RAI Gap | Priority | Fix type | Location |
|---------|----------|----------|----------|
| H3 — Human sign-off | P0 | UI | `APP.html` |
| S2 — Report generation gate | P0 | UI | `APP.html` |
| H4 — ToS / accountability | P0 | UI + Process | New `/terms` page + legal work |
| F1 — Multi-jurisdiction testing | P0 | Process + Pipeline | Eval cases + prompt |
| P2 — Retention policy | P1 | UI + Process | Consent modal + policy doc |
| T3 — Per-field confidence | P1 | **Pipeline primary** | n8n prompt + payload schema + UI |
| E2 — Verbatim clause text | P1 | **Pipeline primary** | n8n prompt + payload schema + UI |
| S3 — Hallucination prevention | P1 | **Pipeline only** | n8n prompt |
| R1 — Complex structure detection | P1 | **Pipeline + UI** | n8n prompt + `complexity_flags` + banner |
| R2 — Adversarial testing | P1 | Process + Pipeline | Eval cases + prompt hardening |
| F2 — Contract complexity parity | P1 | Process + Pipeline | Eval cases |
| E3 — Score decomposition | P2 | Both | `score_breakdown` in payload + UI |
| H2 — Audit trail completeness | P2 | Both | `extraction_metadata` in payload + UI |
| H1 — Field correction UI | P2 | UI | `APP.html` |
| F3 — Language detection | P2 | Pipeline + UI | n8n prompt + warning banner |

### Payload schema additions needed

To resolve T3, E2, S3, R1, E3, H2, and F3, the n8n webhook response should be extended to include:

```json
{
  "contract_type": "...",
  "terms_found": [...],
  "terms_missing": [...],
  "risk_score": 62,
  "analyzed_at": "...",

  "fields": {
    "<field_name>": {
      "value": <extracted>,
      "confidence": 0.97,
      "basis_found": true,
      "source_clause": "§2.1",
      "source_text": "<verbatim sentence>"
    }
  },

  "risk_flags": [
    {
      "id": "missing_discount_rate",
      "severity": "high",
      "field": "discount_rate",
      "description": "...",
      "ifrs16_ref": "§26",
      "resolved": false
    }
  ],

  "complexity_flags": [],

  "score_breakdown": {
    "field_coverage_component": 35,
    "flag_severity_component": 27,
    "total": 62
  },

  "extraction_metadata": {
    "model": "gpt-5-mini",
    "prompt_version": "ifrs16-v1.2",
    "extracted_at": "...",
    "document_language": "en",
    "document_hash": "sha256:..."
  }
}
```

This single schema extension would unblock 7 of the 15 open RAI gaps.
