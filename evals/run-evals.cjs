#!/usr/bin/env node
/**
 * LegalGraph Contract Analyzer — Eval Runner
 *
 * Usage:
 *   node evals/run-evals.js                          # run all cases
 *   node evals/run-evals.js --case sample-lease-sf-001
 *   node evals/run-evals.js --payload '{"contract_type":...}'
 *
 * Exit codes: 0 = all pass, 1 = failures found
 */

const fs   = require('fs');
const path = require('path');

const CASES_DIR  = path.join(__dirname, 'cases');
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m~\x1b[0m';
const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM  = (s) => `\x1b[2m${s}\x1b[0m`;

/* ── CLI args ──────────────────────────────────────────────────── */
const args       = process.argv.slice(2);
const caseFilter = args[args.indexOf('--case') + 1];
const rawPayload = args[args.indexOf('--payload') + 1];

/* ── Load test cases ───────────────────────────────────────────── */
function loadCases() {
  return fs.readdirSync(CASES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(CASES_DIR, f), 'utf8')))
    .filter(c => !caseFilter || c.id === caseFilter);
}

/* ── Scoring helpers ───────────────────────────────────────────── */
function arraysMatch(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  return [...a].sort().join(',') === [...b].sort().join(',');
}

function arraysSubset(subset, superset) {
  return subset.every(item => superset.includes(item));
}

function scoreResult(label, pass, detail) {
  return { label, pass, detail };
}

/* ── Suite: webhook payload ────────────────────────────────────── */
function evalWebhookPayload(payload, expected) {
  const results = [];

  // contract_type
  results.push(scoreResult(
    'contract_type matches',
    payload.contract_type === expected.contract_type,
    `got "${payload.contract_type}", expected "${expected.contract_type}"`
  ));

  // terms_found — exact set match
  results.push(scoreResult(
    'terms_found — exact set',
    arraysMatch(payload.terms_found, expected.terms_found),
    `got [${(payload.terms_found||[]).sort()}]\n    expected [${expected.terms_found.sort()}]`
  ));

  // terms_missing — exact set match
  results.push(scoreResult(
    'terms_missing — exact set',
    arraysMatch(payload.terms_missing, expected.terms_missing),
    `got [${(payload.terms_missing||[]).sort()}]\n    expected [${expected.terms_missing.sort()}]`
  ));

  // risk_score — exact
  results.push(scoreResult(
    `risk_score === ${expected.risk_score}`,
    payload.risk_score === expected.risk_score,
    `got ${payload.risk_score}`
  ));

  // analyzed_at — valid ISO timestamp
  const tsOk = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(payload.analyzed_at || '');
  results.push(scoreResult(
    'analyzed_at is valid ISO timestamp',
    tsOk,
    `got "${payload.analyzed_at}"`
  ));

  // No unexpected keys
  const allowedKeys = new Set(['contract_type','terms_found','terms_missing','risk_score','analyzed_at']);
  const extra = Object.keys(payload).filter(k => !allowedKeys.has(k));
  results.push(scoreResult(
    'no unexpected payload keys',
    extra.length === 0,
    extra.length ? `unexpected keys: ${extra.join(', ')}` : 'clean'
  ));

  return results;
}

/* ── Suite: field extraction ────────────────────────────────────── */
function evalFieldExtraction(extracted, expectedFields) {
  const results = [];

  for (const [field, spec] of Object.entries(expectedFields)) {
    if (spec.intentionally_absent) {
      // Field should be null / missing
      const val = extracted[field];
      results.push(scoreResult(
        `${field} — intentionally absent (should be null/missing)`,
        val === null || val === undefined,
        `got "${val}"`
      ));
      continue;
    }

    const actual = extracted[field];

    if (actual === undefined) {
      results.push(scoreResult(`${field} — present`, false, 'field not returned by extractor'));
      continue;
    }

    // Value match
    const valueMatch = actual.value !== undefined
      ? actual.value == spec.value   // loose equality handles "2022-01-01" vs Date
      : actual == spec.value;

    results.push(scoreResult(
      `${field} — value`,
      valueMatch,
      `got ${JSON.stringify(actual.value ?? actual)}, expected ${JSON.stringify(spec.value)}`
    ));

    // Source clause
    if (spec.source_clause && actual.source_clause !== undefined) {
      results.push(scoreResult(
        `${field} — source clause`,
        actual.source_clause === spec.source_clause,
        `got "${actual.source_clause}", expected "${spec.source_clause}"`
      ));
    }

    // Confidence threshold
    if (spec.confidence_min > 0 && actual.confidence !== undefined) {
      results.push(scoreResult(
        `${field} — confidence ≥ ${spec.confidence_min}`,
        actual.confidence >= spec.confidence_min,
        `got ${actual.confidence}`
      ));
    }
  }

  return results;
}

/* ── Suite: risk flags ──────────────────────────────────────────── */
function evalRiskFlags(flags, expectedFlags) {
  const results = [];

  for (const expected of expectedFlags) {
    const match = (flags || []).find(f =>
      f.severity === expected.severity &&
      (f.id === expected.id ||
       (f.description || '').toLowerCase().includes(expected.description_contains.toLowerCase()))
    );

    results.push(scoreResult(
      `risk flag "${expected.id}" (${expected.severity})`,
      !!match,
      match ? `found: "${match.description || match.id}"` : `no ${expected.severity} flag matching "${expected.description_contains}"`
    ));
  }

  // No duplicate severities in high (shouldn't have 2 high flags for same field)
  const highFlags = (flags || []).filter(f => f.severity === 'high');
  const highFields = highFlags.map(f => f.field).filter(Boolean);
  const uniqueHighFields = new Set(highFields);
  results.push(scoreResult(
    'no duplicate high-severity flags for same field',
    highFields.length === uniqueHighFields.size,
    highFields.length !== uniqueHighFields.size
      ? `duplicate fields: ${highFields.filter((f,i) => highFields.indexOf(f) !== i).join(', ')}`
      : 'ok'
  ));

  return results;
}

/* ── Suite: risk score ──────────────────────────────────────────── */
function evalRiskScore(score, spec) {
  return [
    scoreResult(
      `risk_score in range [${spec.range_min}–${spec.range_max}]`,
      score >= spec.range_min && score <= spec.range_max,
      `got ${score}`
    ),
    scoreResult(
      `risk_score label is "${spec.label}"`,
      score >= 50 && score <= 69 ? spec.label === 'Medium'
        : score < 50             ? spec.label === 'Low'
        :                          spec.label === 'High',
      `score ${score} → expected label "${spec.label}"`
    ),
  ];
}

/* ── Suite: coverage ────────────────────────────────────────────── */
function evalCoverage(payload, spec) {
  const found   = (payload.terms_found   || []).length;
  const missing = (payload.terms_missing || []).length;
  const total   = found + missing;

  return [
    scoreResult(
      `total IFRS 16 fields = ${spec.total_ifrs16_fields}`,
      total === spec.total_ifrs16_fields,
      `got ${total} (${found} found + ${missing} missing)`
    ),
    scoreResult(
      `fields found = ${spec.expected_found}`,
      found === spec.expected_found,
      `got ${found}`
    ),
    scoreResult(
      `fields missing = ${spec.expected_missing}`,
      missing === spec.expected_missing,
      `got ${missing}`
    ),
  ];
}

/* ── Report renderer ────────────────────────────────────────────── */
function renderSuite(name, results) {
  const passed = results.filter(r => r.pass).length;
  const total  = results.length;
  const allOk  = passed === total;

  console.log(`\n  ${allOk ? PASS : FAIL} ${BOLD(name)}  ${DIM(`${passed}/${total}`)}`);
  for (const r of results) {
    const icon = r.pass ? PASS : FAIL;
    console.log(`      ${icon} ${r.label}`);
    if (!r.pass) console.log(`        ${DIM('→ ' + r.detail)}`);
  }
  return { passed, total };
}

/* ── Main ───────────────────────────────────────────────────────── */
function runCase(testCase, payload) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(BOLD(`Case: ${testCase.id}`));
  console.log(DIM(`  ${testCase.description}`));
  if (!payload) {
    console.log(DIM(`  Source: ${testCase.source_file}`));
  }

  let totalPassed = 0, totalTests = 0;

  // 1. Webhook payload shape
  const webhookResults = evalWebhookPayload(payload, testCase.expected_webhook_payload);
  const w = renderSuite('Webhook payload', webhookResults);
  totalPassed += w.passed; totalTests += w.total;

  // 2. Coverage counts
  const coverageResults = evalCoverage(payload, testCase.extraction_coverage);
  const c = renderSuite('Extraction coverage', coverageResults);
  totalPassed += c.passed; totalTests += c.total;

  // 3. Risk score
  const riskScoreResults = evalRiskScore(payload.risk_score, testCase.expected_risk_score);
  const rs = renderSuite('Risk score', riskScoreResults);
  totalPassed += rs.passed; totalTests += rs.total;

  // 4. Field extraction (only if extractor returns structured fields)
  if (payload.fields) {
    const fieldResults = evalFieldExtraction(payload.fields, testCase.expected_fields);
    const f = renderSuite('Field extraction', fieldResults);
    totalPassed += f.passed; totalTests += f.total;
  } else {
    console.log(`\n  ${WARN} ${DIM('Field extraction — skipped (payload.fields not present)')}`);
    console.log(DIM('    Add a "fields" key to the webhook payload to enable per-field evals.'));
  }

  // 5. Risk flags (only if extractor returns structured flags)
  if (payload.risk_flags) {
    const flagResults = evalRiskFlags(payload.risk_flags, testCase.expected_risk_flags);
    const fl = renderSuite('Risk flags', flagResults);
    totalPassed += fl.passed; totalTests += fl.total;
  } else {
    console.log(`\n  ${WARN} ${DIM('Risk flags — skipped (payload.risk_flags not present)')}`);
    console.log(DIM('    Add a "risk_flags" array to the webhook payload to enable flag evals.'));
  }

  // Summary
  const pct    = Math.round((totalPassed / totalTests) * 100);
  const status = totalPassed === totalTests ? PASS : FAIL;
  console.log(`\n  ${status} ${BOLD('Total: ' + totalPassed + '/' + totalTests + ' (' + pct + '%)')}`);

  return { passed: totalPassed, total: totalTests };
}

/* ── Entry point ─────────────────────────────────────────────────── */
(function main() {
  console.log(BOLD('\nLegalGraph — Contract Extraction Evals'));
  console.log(DIM('Run against live webhook payload or simulated extraction output.\n'));

  const cases = loadCases();
  if (cases.length === 0) {
    console.error(`No cases found${caseFilter ? ` matching "${caseFilter}"` : ''}.`);
    process.exit(1);
  }

  // If a raw payload was passed on the CLI, use it for all cases
  const livePayload = rawPayload ? JSON.parse(rawPayload) : null;

  // When no live payload provided, use the expected payload as a smoke-test
  // (validates the eval harness itself and the ground truth structure)
  let grandPassed = 0, grandTotal = 0;

  for (const testCase of cases) {
    const payload = livePayload || {
      ...testCase.expected_webhook_payload,
      analyzed_at: new Date().toISOString(),
    };

    const { passed, total } = runCase(testCase, payload);
    grandPassed += passed;
    grandTotal  += total;
  }

  console.log(`\n${'═'.repeat(60)}`);
  const allPass = grandPassed === grandTotal;
  const pct     = Math.round((grandPassed / grandTotal) * 100);
  console.log(`${allPass ? PASS : FAIL} ${BOLD('Grand total: ' + grandPassed + '/' + grandTotal + ' (' + pct + '%)')}`);

  if (!livePayload) {
    console.log(DIM('\nTip: pass a live payload to test real extraction output:'));
    console.log(DIM("  node evals/run-evals.js --payload '{\"contract_type\":\"...\"}'"));
    console.log(DIM('  or pipe the n8n webhook body directly:\n  cat payload.json | xargs -d \"\\n\" node evals/run-evals.js --payload'));
  }

  console.log('');
  process.exit(allPass ? 0 : 1);
})();
