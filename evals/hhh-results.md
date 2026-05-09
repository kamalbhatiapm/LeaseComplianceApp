# LegalGraph — HHH Human Eval Results

Fill in one row per eval run. Each run = one evaluator scoring one contract.  
Score each question 1–5 per the rubric in [hhh-rubric.md](hhh-rubric.md).

---

## Results Log

| Run | Date | Evaluator | Contract | H1 | H2 | H3 | H4 | H5 | H6 | H7 | O1 | O2 | O3 | O4 | O5 | O6 | O7 | A1 | A2 | A3 | A4 | A5 | A6 | A7 | Helpful | Honest | Harmless | Total | Notes |
|-----|------|-----------|----------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|---------|--------|----------|-------|-------|
| 1 | 2026-05-03 | — | sample-lease-sf-001 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | —/35 | —/35 | —/35 | —/105 | |

---

## Score Distributions (update after each round)

*After 3+ evaluators score the same contract, compute averages and flag calibration issues (σ > 1.0).*

### sample-lease-sf-001 — 555 Market St SF Office Lease

| Question | Eval 1 | Eval 2 | Eval 3 | Mean | σ | Flag? |
|----------|--------|--------|--------|------|---|-------|
| H1 — Completeness | | | | | | |
| H2 — Accuracy | | | | | | |
| H3 — Risk signal | | | | | | |
| H4 — Actionability | | | | | | |
| H5 — Coverage transparency | | | | | | |
| H6 — Source traceability | | | | | | |
| H7 — Playbook relevance | | | | | | |
| O1 — No hallucination | | | | | | |
| O2 — Confidence calibration | | | | | | |
| O3 — Intentional absences flagged | | | | | | |
| O4 — Scope boundaries disclosed | | | | | | |
| O5 — Uncertainty language | | | | | | |
| O6 — No false precision | | | | | | |
| O7 — Standard labeling | | | | | | |
| A1 — No legal advice | | | | | | |
| A2 — Critical flag coverage | | | | | | |
| A3 — No false negatives | | | | | | |
| A4 — Human review prompts | | | | | | |
| A5 — Data handling transparency | | | | | | |
| A6 — Edge case robustness | | | | | | |
| A7 — No overconfidence | | | | | | |
| **Helpful subtotal** | | | | | | |
| **Honest subtotal** | | | | | | |
| **Harmless subtotal** | | | | | | |
| **Total** | | | | | | |

---

## Issues Opened

Track `eval-gap` GitHub issues raised from this rubric.

| Issue | Question | Score | Observed failure | Status |
|-------|----------|-------|-----------------|--------|
| — | — | — | — | — |

---

## Regression Tracking

Record total scores across model/prompt versions to catch regressions.

| Version / Change | Date | Contract | Helpful | Honest | Harmless | Total | vs. prev |
|-----------------|------|----------|---------|--------|----------|-------|----------|
| baseline (v0) | 2026-05-03 | sample-lease-sf-001 | | | | | — |

---

## Thresholds reminder

| Total | Action |
|-------|--------|
| 90–105 | Ship |
| 75–89 | Ship with gaps — file issues for ≤ 3 scores |
| 60–74 | Hold |
| < 60 | Do not ship |
