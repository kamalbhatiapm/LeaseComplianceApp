export const FIELD_HINTS = {
  discount_rate:     'Not found — enter your IBR manually or request from treasury.',
  renewal_options:   'Not found — confirm whether renewal options exist and document intent language for auditors.',
  termination_rights:'Not found — confirm the non-cancellable period and termination conditions manually.',
  security_deposit:  'Not found — check lease schedule or side letter for deposit amount.',
  escalation_rate:   'Not found — confirm if rent is fixed or escalates; document for IFRS 16 payment schedule.',
  commencement_date: 'Not found — required for IFRS 16 lease term calculation. Enter manually.',
  expiry_date:       'Not found — required to compute remaining term. Enter manually.',
  annual_payment:    'Not found — required for present value calculation. Enter manually.',
}

export const EXTRACTION_QUALITY = { strongRatio: 0.8, fairRatio: 0.6 }

export function getExtractionQuality(termsFound, termsTotal, fields) {
  if (!termsTotal) return { level: 'Weak', color: 'var(--red)', detail: 'No fields extracted' }
  const foundRatio = termsFound / termsTotal
  const highConfCount = Object.values(fields ?? {}).filter(f => {
    const conf = typeof f === 'object' && f !== null ? (f.confidence ?? 0) : 1
    return conf >= 0.85
  }).length
  const highConfRatio = termsFound > 0 ? highConfCount / termsFound : 0
  if (foundRatio >= EXTRACTION_QUALITY.strongRatio && highConfRatio >= EXTRACTION_QUALITY.strongRatio) {
    return { level: 'Strong', color: 'var(--green)', detail: `Strong — ${termsFound} of ${termsTotal} fields found, ${highConfCount} high-confidence` }
  }
  if (foundRatio >= EXTRACTION_QUALITY.fairRatio) {
    return { level: 'Fair', color: 'var(--amber)', detail: `Fair — ${termsFound} of ${termsTotal} fields found` }
  }
  return { level: 'Weak', color: 'var(--red)', detail: `Weak — ${termsFound} of ${termsTotal} fields found, review recommended` }
}

export const FIELD_LABELS = {
  commencement_date:   'Commencement Date',
  expiry_date:         'Expiry Date',
  lease_term_years:    'Lease Term',
  annual_payment:      'Annual Base Rent',
  annual_payment_usd:  'Annual Base Rent',
  monthly_payment_usd: 'Monthly Rent',
  escalation_rate:     'Rent Escalation',
  escalation_rate_pct: 'Rent Escalation',
  renewal_options:     'Renewal Options',
  renewal_option_count:'Renewal Options',
  termination_rights:  'Termination Rights',
  termination_party:   'Termination Party',
  security_deposit:    'Security Deposit',
  security_deposit_usd:'Security Deposit',
  rou_asset_value:     'ROU Asset Value',
  rou_asset_scope:     'ROU Asset Scope',
  premises_sqft:       'Premises (sq ft)',
  premises_floor:      'Floor',
  governing_law:       'Governing Law',
  discount_rate:       'Discount Rate',
  lease_liability:     'Lease Liability',
}

export const MOCK_ANALYSIS = {
  contract_type: 'Commercial Office Lease',
  terms_found: [
    'commencement_date', 'expiry_date', 'annual_payment',
    'escalation_rate', 'renewal_options', 'termination_rights', 'security_deposit',
  ],
  terms_missing: ['discount_rate'],
  risk_score: 62,
  analyzed_at: new Date().toISOString(),
  summary: 'This is a <strong>7-year commercial office lease</strong> for Floor 12 at 555 Market Street, San Francisco, commencing January 1, 2022 and expiring December 31, 2028. Annual base rent is <strong>$348,000</strong> with 3% annual escalations. The lessee holds <strong>two renewal options of 5 years each</strong>. The lease does not specify a discount rate — the incremental borrowing rate must be supplied manually before the IFRS 16 schedule can be finalized. AI extraction confidence is <strong>96%</strong> across 8 of 9 key fields; the discount rate field is the only gap.',
  fields: {
    commencement_date:  { value: 'January 1, 2022',                 confidence: 0.97, source_clause: '§2.1 — Lease Commencement', clause_text: 'The lease term shall commence on January 1, 2022 (the "Commencement Date") and, unless sooner terminated pursuant to the terms hereof, shall expire on December 31, 2028.' },
    expiry_date:        { value: 'December 31, 2028',               confidence: 0.97, source_clause: '§2.1 — Lease Term',         clause_text: 'The lease term shall commence on January 1, 2022 and, unless sooner terminated pursuant to the terms hereof, shall expire on December 31, 2028 (the "Expiration Date").' },
    annual_payment:     { value: '$348,000 / year',                 confidence: 0.96, source_clause: '§5.1 — Base Rent',          clause_text: 'Tenant shall pay to Landlord a base rent of Twenty-Nine Thousand Dollars ($29,000) per month, totalling Three Hundred Forty-Eight Thousand Dollars ($348,000) per annum, payable in advance on the first day of each calendar month.' },
    escalation_rate:    { value: '3% per annum',                    confidence: 0.95, source_clause: '§5.3 — Rent Adjustments',   clause_text: 'Commencing on the first anniversary of the Commencement Date and on each anniversary thereafter, the monthly Base Rent shall increase by three percent (3%) over the Base Rent payable for the immediately preceding twelve-month period.' },
    renewal_options:    { value: '2 × 5-year options',              confidence: 0.93, source_clause: '§3.2 — Renewal Rights',     clause_text: 'Provided Tenant is not in default, Tenant shall have two (2) options to renew this Lease for additional periods of five (5) years each, exercisable by written notice to Landlord no later than nine (9) months prior to the expiration of the then-current term.' },
    termination_rights: { value: 'Landlord only (12-month notice)', confidence: 0.94, source_clause: '§9.1 — Termination Rights', clause_text: 'Landlord may terminate this Lease upon twelve (12) months prior written notice to Tenant. Tenant shall have no right of early termination except as expressly provided in Section 9.2.' },
    security_deposit:   { value: '$58,000',                         confidence: 0.96, source_clause: '§6.1 — Security Deposit',   clause_text: 'Upon execution of this Lease, Tenant shall deposit with Landlord the sum of Fifty-Eight Thousand Dollars ($58,000) as a security deposit, to be held by Landlord as security for the faithful performance of Tenant\'s obligations hereunder.' },
    rou_asset_scope:    { value: 'Floor 12 (18,400 sq ft)',          confidence: 0.92, source_clause: '§1.2 — Premises',           clause_text: 'Landlord hereby leases to Tenant and Tenant hereby leases from Landlord those certain premises consisting of approximately 18,400 rentable square feet located on the twelfth (12th) floor of the Building, as depicted on Exhibit A attached hereto.' },
    governing_law:      { value: 'California, USA',                 confidence: 0.98, source_clause: '§14.1 — Governing Law',     clause_text: 'This Lease shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles.' },
    discount_rate:      { value: null, confidence: 0.0,             source_clause: '§7.2 — Financial Terms', clause_text: null, basis_found: false },
  },
  risk_flags: [
    {
      id: 'missing_discount_rate', severity: 'high',
      title: 'Discount rate missing',
      description: 'IFRS 16 requires a discount rate to calculate present value of lease payments and ROU asset. The contract does not specify one. Report generation is blocked until resolved.',
      ifrs16_ref: '§26', field: 'discount_rate',
    },
    {
      id: 'renewal_certainty', severity: 'medium',
      title: 'Renewal options not clearly specified as reasonably certain',
      description: 'IFRS 16 §19 requires assessment of whether renewal options are "reasonably certain" to be exercised. Clause 3.2 grants two 5-year options but contains no intent language — auditors may require a written policy position.',
      ifrs16_ref: '§19', field: 'renewal_options',
    },
    {
      id: 'termination_lessee', severity: 'medium',
      title: 'Lessee has no unilateral termination right',
      description: '§9.1 grants termination rights to Landlord only (12-month notice). The lessee cannot exit early. Per IFRS 16.B34, confirm the non-cancellable period reflects the full remaining term.',
      ifrs16_ref: 'B34', field: 'termination_rights',
    },
    {
      id: 'security_deposit', severity: 'low',
      title: 'Security deposit classification',
      description: 'The $58,000 security deposit (§6.1) may need to be classified as a lease incentive receivable depending on refund terms. Current extraction did not detect refund conditions.',
      ifrs16_ref: '§46', field: 'security_deposit',
    },
  ],
}
