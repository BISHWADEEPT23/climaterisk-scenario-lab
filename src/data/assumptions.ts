/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Model Assumptions Register
 * Traceable documentation of numerical assumptions, boundary conditions, and parameter defaults.
 */

import { AssumptionItem } from '../types/climate';

export const ASSUMPTIONS_REGISTER: AssumptionItem[] = [
  {
    key: 'ASM-001',
    category: 'Transition',
    parameterName: 'Carbon Price Pass-Through Rate',
    defaultVal: '30% - 85% by Sector',
    unit: 'Percentage (%)',
    source: 'Calibrated from empirical carbon pricing literature (CE Delft / OECD ETS Studies)',
    rationale: 'Energy-intensive trade-exposed sectors (Steel, Cement) possess limited market power to pass compliance costs without trade leakage, while Utilities and Real Estate have higher cost pass-through capacity.',
    sensitivityRange: '0% (complete cost absorption) to 100% (complete pass-through)'
  },
  {
    key: 'ASM-002',
    category: 'Transition',
    parameterName: 'Covered Emissions Scope',
    defaultVal: 'Scope 1 + Scope 2 (ETS regulatory boundary)',
    unit: 'tCO2e',
    source: 'EU ETS & California Cap-and-Trade compliance rules',
    rationale: 'Direct carbon compliance obligations under statutory ETS mechanisms typically apply directly to direct facility emissions (Scope 1) and in some jurisdictions purchased power (Scope 2). Scope 3 is tracked for value chain disclosure but excluded from statutory penalty calculations in Phase 1.',
    sensitivityRange: 'Scope 1 only vs Scope 1+2 vs Full Scope 1+2+3'
  },
  {
    key: 'ASM-003',
    category: 'Transition',
    parameterName: 'Free Allowances Allocation Trajectory',
    defaultVal: 'Gradual linear phase-out aligned with CBAM (10% to 50% baseline)',
    unit: 'Percentage (%)',
    source: 'EU Carbon Border Adjustment Mechanism (CBAM) phase-out schedule',
    rationale: 'Free allowances cushion trade-exposed sectors during initial phases but decline sharply towards 2035-2040 under orderly and disorderly transition pathways.',
    sensitivityRange: '0% (full auctioning) to 100% (grandfathered allocations)'
  },
  {
    key: 'ASM-004',
    category: 'Financial Transmission',
    parameterName: 'EBITDA-to-PD Elasticity Factor',
    defaultVal: '1.75x',
    unit: 'Multiplier (Dimensionless)',
    source: 'Empirical Merton structural default model calibration for corporate debt',
    rationale: 'Operating profit contraction diminishes interest coverage and debt service capability, elevating credit risk non-linearly. Serves as an illustrative transmission proxy, not an official IFRS 9 rating migration matrix.',
    sensitivityRange: '1.0x (linear) to 2.5x (severe distress sensitivity)'
  },
  {
    key: 'ASM-005',
    category: 'Portfolio Aggregation',
    parameterName: 'PCAF Financed Emissions Attribution Factor',
    defaultVal: 'Loan Exposure / Enterprise Value Including Cash (EVIC)',
    unit: 'Ratio (0.0 to 1.0)',
    source: 'PCAF Global GHG Accounting and Reporting Standard for the Financial Industry (Part A)',
    rationale: 'Standard PCAF attribution formula ensures consistent non-double-counted allocation of corporate emissions to lending portfolios.',
    sensitivityRange: 'Loan/EVIC vs Loan/Total Debt vs Loan/Total Assets'
  },
  {
    key: 'ASM-006',
    category: 'Portfolio Aggregation',
    parameterName: 'Weighted Average Carbon Intensity (WACI) Denominator',
    defaultVal: 'Total Corporate Revenue (USD Millions)',
    unit: 'tCO2e / USD Million Revenue',
    source: 'TCFD / IFRS S2 Climate-related Disclosures Metric Guidance',
    rationale: 'Normalizes portfolio emissions by commercial revenue to facilitate cross-portfolio benchmarking and sector-neutral efficiency tracking.',
    sensitivityRange: 'Revenue vs Enterprise Value vs Market Capitalization'
  },
  {
    key: 'ASM-007',
    category: 'Physical',
    parameterName: 'Physical Risk Vulnerability Framework',
    defaultVal: 'Conceptual: Risk = Hazard × Exposure × Vulnerability',
    unit: 'Composite Score (0-100)',
    source: 'IPCC AR6 Working Group II Risk Assessment Framework',
    rationale: 'Phase 1 models spatial hazard exposure across 8 acute and chronic peril dimensions. Expected Annual Monetary Loss functions are deferred to Phase 3.',
    sensitivityRange: 'Hazard exposure score (0-100) and replacement value at risk'
  },
  {
    key: 'ASM-008',
    category: 'Transition',
    parameterName: 'Decarbonization Technology Mitigation Benefit',
    defaultVal: 'Up to 15% operating cost recoup at high sector decarbonization',
    unit: 'Percentage of Net Carbon Cost (%)',
    source: 'IEA Net Zero Emissions by 2050 Technology Roadmap',
    rationale: 'Capital investments in energy efficiency and low-carbon technologies partially mitigate gross compliance penalties over a 10-20 year horizon.',
    sensitivityRange: '0% (static technology) to 30% (accelerated green innovation)'
  }
];
