/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Comprehensive Data Dictionary
 * Field-level metadata, data types, units, accounting definitions, and regulatory alignments.
 */

import { DataDictionaryEntry } from '../types/climate';

export const DATA_DICTIONARY: DataDictionaryEntry[] = [
  {
    field: 'id',
    label: 'Company Identifier',
    category: 'Identification',
    dataType: 'String (COMP-XXX)',
    unit: 'Alphanumeric code',
    formulaOrRule: 'Unique synthetic identifier COMP-001 through COMP-030',
    description: 'Unique identifier assigned to each corporate borrowing entity in the portfolio.',
    pcafOrIfrsRef: 'General Entity ID'
  },
  {
    field: 'name',
    label: 'Corporate Entity Name',
    category: 'Identification',
    dataType: 'String',
    unit: 'Text',
    formulaOrRule: 'Company legal name tagged with [Synthetic] suffix',
    description: 'Fictional enterprise name designed to simulate real-world capital structures and emissions profiles.',
    pcafOrIfrsRef: 'IFRS S2 Par. 13'
  },
  {
    field: 'sector',
    label: 'Industry Sector',
    category: 'Classification',
    dataType: 'Categorical',
    unit: 'Taxonomy Code',
    formulaOrRule: 'Power Generation | Steel | Cement | Automotive | Commercial Real Estate | Agriculture',
    description: 'Six target climate-relevant sectors exhibiting varied transition paths and physical asset intensities.',
    pcafOrIfrsRef: 'GICS / NACE / IFRS S2 Industry-based metrics'
  },
  {
    field: 'country',
    label: 'Country of Operations',
    category: 'Geography',
    dataType: 'Categorical',
    unit: 'ISO Alpha-2 proxy',
    formulaOrRule: 'India | United States | Germany | United Kingdom | Japan',
    description: 'Geographic operational footprint determining baseline policy mechanisms, ETS regimes, and peril exposure.',
    pcafOrIfrsRef: 'IFRS S2 Par. 14(a)'
  },
  {
    field: 'revenueUsdM',
    label: 'Total Annual Revenue',
    category: 'Financials',
    dataType: 'Float',
    unit: 'USD Millions',
    formulaOrRule: 'Audited annual gross corporate revenues for FY2024',
    description: 'Top-line sales revenue utilized as the denominator for carbon intensity metrics (WACI).',
    pcafOrIfrsRef: 'IFRS S2 Par. 29'
  },
  {
    field: 'ebitdaUsdM',
    label: 'Baseline EBITDA',
    category: 'Financials',
    dataType: 'Float',
    unit: 'USD Millions',
    formulaOrRule: 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
    description: 'Operating cash flow proxy subject to scenario-conditioned carbon and energy cost transmission.',
    pcafOrIfrsRef: 'IFRS S2 Financial Position Effects'
  },
  {
    field: 'loanExposureUsdM',
    label: 'Loan Exposure (EAD)',
    category: 'Credit Risk',
    dataType: 'Float',
    unit: 'USD Millions',
    formulaOrRule: 'Exposure at Default across syndicated and bilateral credit facilities',
    description: 'Bank credit exposure used as numerator for PCAF attribution factor and portfolio weightings.',
    pcafOrIfrsRef: 'PCAF Part A Lending Attribution'
  },
  {
    field: 'enterpriseValueUsdM',
    label: 'EVIC',
    category: 'Capital Structure',
    dataType: 'Float',
    unit: 'USD Millions',
    formulaOrRule: 'Market Capitalization of Equity + Total Debt + Cash',
    description: 'Enterprise Value Including Cash serving as official PCAF denominator for financed emissions attribution.',
    pcafOrIfrsRef: 'PCAF Part A Section 5.1'
  },
  {
    field: 'scope1Tco2e',
    label: 'Scope 1 Direct GHG Emissions',
    category: 'Emissions',
    dataType: 'Float',
    unit: 'Metric tons CO2 equivalent (tCO2e)',
    formulaOrRule: 'Direct emissions from fuel combustion, industrial processes, and fleet operations',
    description: 'Direct greenhouse gas emissions under operational control, subject to mandatory statutory carbon pricing.',
    pcafOrIfrsRef: 'GHG Protocol / IFRS S2 Par. 29(a)(i)'
  },
  {
    field: 'scope2Tco2e',
    label: 'Scope 2 Indirect Emissions',
    category: 'Emissions',
    dataType: 'Float',
    unit: 'Metric tons CO2 equivalent (tCO2e)',
    formulaOrRule: 'Market-based indirect emissions from purchased electricity, steam, and heating',
    description: 'Indirect emissions from grid electricity consumption, sensitive to wholesale generation decarbonization.',
    pcafOrIfrsRef: 'GHG Protocol / IFRS S2 Par. 29(a)(ii)'
  },
  {
    field: 'scope3Tco2e',
    label: 'Scope 3 Value Chain Emissions',
    category: 'Emissions',
    dataType: 'Float',
    unit: 'Metric tons CO2 equivalent (tCO2e)',
    formulaOrRule: 'Upstream and downstream value chain emissions (Use of Sold Products, Supply Chain)',
    description: 'Value chain emissions tracked for comprehensive footprinting; excluded from direct statutory compliance penalties.',
    pcafOrIfrsRef: 'GHG Protocol / IFRS S2 Par. 29(a)(iii)'
  },
  {
    field: 'carbonCoveragePct',
    label: 'ETS / Carbon Pricing Coverage',
    category: 'Policy & Regulatory',
    dataType: 'Percentage',
    unit: '% (0 to 100)',
    formulaOrRule: 'Statutory emissions percentage covered by active ETS or carbon tax mechanism',
    description: 'Fraction of corporate direct emissions legally required to surrender compliance credits or pay taxes.',
    pcafOrIfrsRef: 'World Bank State and Trends of Carbon Pricing'
  },
  {
    field: 'carbonPassThroughPct',
    label: 'Carbon Cost Pass-Through Rate',
    category: 'Market Transmission',
    dataType: 'Percentage',
    unit: '% (0 to 100)',
    formulaOrRule: 'Share of carbon penalty successfully passed along to downstream consumers',
    description: 'Empirical pricing power parameter dictating the fraction of compliance costs absorbed into EBITDA.',
    pcafOrIfrsRef: 'OECD / CE Delft Empirical Studies'
  },
  {
    field: 'energyConsumptionMwh',
    label: 'Annual Electricity & Energy Consumption',
    category: 'Operational',
    dataType: 'Float',
    unit: 'Megawatt-hours (MWh)',
    formulaOrRule: 'Reported total purchased and self-generated electricity and heat',
    description: 'Physical operational energy draw utilized to calculate power tariff sensitivity under transition scenarios.',
    pcafOrIfrsRef: 'GRI 302 Energy / IFRS S2'
  },
  {
    field: 'replacementValueUsdM',
    label: 'Physical Asset Replacement Value',
    category: 'Physical Exposure',
    dataType: 'Float',
    unit: 'USD Millions',
    formulaOrRule: 'Insured or appraised rebuild cost under local construction indices',
    description: 'Capital asset exposure base against which acute and chronic climate hazard exposure is measured.',
    pcafOrIfrsRef: 'TCFD Physical Risk Metric / IFRS S2'
  }
];
