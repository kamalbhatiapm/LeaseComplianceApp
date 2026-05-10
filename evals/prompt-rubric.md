# Prompt Engineering Rubric
*Based on Mahesh Yadav Institute — Intro to Prompt Engineering guidelines*

Use this rubric to score any system prompt on a 0–100 scale across five dimensions.
Each dimension maps to the product-scale `<Role><Instruction><Task><Guardrails><Examples>` structure.

---

## How to Score

For each dimension, assign a score:

| Points | Meaning |
|--------|---------|
| **Full** | Criterion fully satisfied — specific, unambiguous, actionable |
| **Partial** | Present but incomplete, vague, or inconsistently applied |
| **Missing** | Not addressed at all |

Sum the dimension scores for a total out of 100.

| Total | Grade | Meaning |
|-------|-------|---------|
| 85–100 | **A — Production-ready** | Safe to deploy at scale |
| 70–84 | **B — Good** | Minor gaps; fix before high-stakes use |
| 55–69 | **C — Needs work** | Core structure present but extraction quality will suffer |
| 40–54 | **D — Weak** | Major holes; outputs will be unpredictable |
| 0–39 | **F — Rewrite** | Foundational rethinking needed |

---

## Dimension 1 — Role / Persona (20 pts)

*Does the prompt tell the model WHO it is and what expertise it brings?*

A role grounds the model's language, vocabulary, and reasoning frame. Without it, responses default to generic assistant voice.

| Criterion | Full | Partial | Missing |
|-----------|------|---------|---------|
| **1.1 Role named** — Model is assigned a specific professional identity (e.g., "in-house general counsel", "IFRS 16 extraction agent") not just "you are an AI assistant" | 5 | 2 | 0 |
| **1.2 Expertise specified** — Role includes the relevant domain or credential (e.g., "specialized in commercial contract analysis") | 5 | 2 | 0 |
| **1.3 Guardrails on role** — Role comes with explicit constraints that shape behavior (e.g., "never provide legal advice", "do not replace professional review") | 5 | 2 | 0 |
| **1.4 Role-Task alignment** — The assigned role makes sense for the task being requested (a legal role for legal extraction, not a generic assistant) | 5 | 2 | 0 |

**Score: __ / 20**

---

## Dimension 2 — Instruction / Objective (20 pts)

*Does the prompt state a single, clear overall goal?*

The instruction sets the model's objective before any steps. It should be one paragraph that an engineer could read and immediately understand the purpose of the prompt.

| Criterion | Full | Partial | Missing |
|-----------|------|---------|---------|
| **2.1 Objective stated** — The prompt opens with what the model must accomplish (not what it must avoid) | 5 | 2 | 0 |
| **2.2 Specificity** — The objective is precise enough to exclude off-topic responses (e.g., "extract key IFRS 16 terms" not "analyze the contract") | 5 | 2 | 0 |
| **2.3 Positive framing** — Instructions say what TO do, not just what NOT to do | 5 | 2 | 0 |
| **2.4 Scope boundary** — The instruction signals what is out of scope (e.g., "do not score risks", "do not ask follow-up questions") | 5 | 2 | 0 |

**Score: __ / 20**

---

## Dimension 3 — Task / Steps (20 pts)

*Does the prompt break the work into concrete, ordered steps?*

Complex tasks should be decomposed using chain-of-thought structure. Each step should produce a distinct, verifiable output.

| Criterion | Full | Partial | Missing |
|-----------|------|---------|---------|
| **3.1 Steps enumerated** — Work is broken into numbered sub-tasks, not described as a single monolithic action | 5 | 2 | 0 |
| **3.2 Step specificity** — Each step names a specific action (extract, summarize, compare) and its target (which clause, which field) | 5 | 2 | 0 |
| **3.3 Logical order** — Steps follow a dependency-aware sequence (retrieve before analyze, analyze before format) | 5 | 2 | 0 |
| **3.4 Output per step** — Each step produces a named, checkable artifact ("return a JSON object", "write to memory", "respond with a confirmation") | 5 | 2 | 0 |

**Score: __ / 20**

---

## Dimension 4 — Guardrails / Quality Controls (20 pts)

*Does the prompt set constraints that keep outputs accurate, safe, and within format?*

Guardrails are the prompt's error-handling layer. They prevent hallucination, enforce format, and define fallback behavior when the model is uncertain.

| Criterion | Full | Partial | Missing |
|-----------|------|---------|---------|
| **4.1 Output format specified** — Format is named and described (JSON with exact keys, markdown table with column names, bullet list) not implied | 5 | 2 | 0 |
| **4.2 Uncertainty handling** — Prompt tells the model what to do when information is absent or ambiguous (e.g., set value to `'Not specified'`, flag for human review) | 5 | 2 | 0 |
| **4.3 Hallucination prevention** — Prompt explicitly limits the model to available information ("do not infer", "quote verbatim", "only use rules from memory") | 5 | 2 | 0 |
| **4.4 Completeness rules** — Prompt handles edge cases: empty input, missing fields, unrecognized contract type | 5 | 2 | 0 |

**Score: __ / 20**

---

## Dimension 5 — Examples / Context (20 pts)

*Does the prompt ground the model with concrete examples and relevant input data?*

Examples are the single highest-leverage lever for accuracy. Even one well-chosen example cuts ambiguity more than paragraphs of description.

| Criterion | Full | Partial | Missing |
|-----------|------|---------|---------|
| **5.1 At least one input/output example** — A worked example showing what acceptable output looks like for a given input | 5 | 2 | 0 |
| **5.2 Format examples match required format** — Examples use the exact JSON keys, field names, or table columns specified in the task | 5 | 2 | 0 |
| **5.3 Context injected** — Relevant domain data (playbook rules, contract text, field definitions) is passed in, not assumed to be in the model's training | 5 | 2 | 0 |
| **5.4 Edge case example** — At least one example shows what to do when the expected value is missing or ambiguous | 5 | 2 | 0 |

**Score: __ / 20**

---

## Score Sheet

| Dimension | Score | Max |
|-----------|-------|-----|
| 1. Role / Persona | | 20 |
| 2. Instruction / Objective | | 20 |
| 3. Task / Steps | | 20 |
| 4. Guardrails / Quality Controls | | 20 |
| 5. Examples / Context | | 20 |
| **Total** | | **100** |

**Grade:**  
**One-line summary of main gap:**

---

## Quick Reference — The 10 Best Practices Checklist

Use this as a secondary pass after scoring:

- [ ] **Specific** — Requests named fields/clauses, not generic "analyze the contract"
- [ ] **Exemplified** — Provides at least one worked input → output example
- [ ] **Grounded** — Relevant data (contract text, rules) is passed in the prompt
- [ ] **Formatted** — Output format is named with exact structure (JSON keys, table columns)
- [ ] **Positive** — Tells the model what to do, not just what to avoid
- [ ] **Persona** — Model has a specific professional role, not "helpful assistant"
- [ ] **Chain-of-thought** — Complex tasks are decomposed into sequential steps
- [ ] **Decomposed** — Atomic sub-tasks rather than one compound instruction
- [ ] **Humble** — Acknowledges limitations; flags ambiguity for human review
- [ ] **Tested** — Prompt was iterated against at least one real input/output pair

---

## Parameter Guidance (for prompts that expose model settings)

| Parameter | Low value use case | High value use case |
|-----------|-------------------|---------------------|
| **Temperature** | Fact extraction, structured JSON output (0.0–0.3) | Creative summarization, narrative generation (0.7–1.0) |
| **Top-p** | Exact, deterministic answers | Diverse or exploratory outputs |
| **Frequency penalty** | Allow natural repetition of key terms | Prevent over-used filler words |
| **Presence penalty** | Allow repeated concepts | Force topic coverage breadth |

For legal contract extraction: **temperature 0.1–0.2, top-p 0.9** — factual tasks need low randomness.

---

## Applied Example — LegalGraph n8n Agents

Scores from the RITGE review conducted against this rubric:

| Agent | Score | Grade | Top gap |
|-------|-------|-------|---------|
| Orchestrator | 71/100 | B | No example of final JSON shape; relies on sub-agent to define format |
| contract_playbook_agent | 68/100 | C | No fallback for zero rows returned; memory write format not exemplified |
| key_term_extraction_agent | 82/100 | B | Output schema well-defined; missing edge-case example for absent fields |

---

*Rubric v1.0 — Based on Mahesh Yadav Institute Prompt Engineering guidelines*
