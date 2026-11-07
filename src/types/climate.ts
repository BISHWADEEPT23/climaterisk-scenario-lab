/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Core Data Models and Types
 * Standardized across NGFS Phase IV Scenario Framework, PCAF Global Standard, and IFRS S2
 */

export type Sector = 
  | 'Power Generation'
  | 'Steel'
  | 'Cement'
  | 'Automotive'
  | 'Commercial Real Estate'
  | 'Agriculture';

export type Country = 
  | 'India'
  | 'United States'
  | 'Germany'
  | 'United Kingdom'
  | 'Japan';

export type TimeHorizon = 2025 | 2030 | 2035 | 2040 | 2045 | 2050;
export type ScenarioHorizon = TimeHorizon;

export type DataQualityCategory = 
  | 'Observed'
  | 'Estimated'
  | 'Synthetic'
  | 'Missing'
  | 'Invalid';

export type ScenarioType = 
  | 'baseline' 
  | 'orderly' 
  | 'disorderly' 
  | 'high_warming' 
  | 'custom'
  | 'Baseline'
  | 'Orderly'
  | 'Disorderly'
  | 'High Warming'
  | 'Custom';

export interface ScenarioHorizonPoint {
  horizon: TimeHorizon;
  carbonPriceUsd: number; // USD / tCO2e
  tempAnomalyCelsius: number; // °C above pre-industrial
  electricityPriceUsdMwh: number; // USD / MWh
  energyDemandIndex: number; // 2025 = 100
  sectorEmissionsReductionPct: Record<Sector, number>; // % decarbonization
  gdpImpactPct: number; // % deviation from baseline GDP
  inflationBps: number; // basis points impact
  acuteHazardIndex: number; // 0 - 100 benchmark index
  chronicHazardIndex: number; // 0 - 100 benchmark index
}

export interface ScenarioDefinition {
  id: ScenarioType;
  name: string;
  category: 'Orderly' | 'Disorderly' | 'Hot House World' | 'Baseline / Current Policies' | 'Custom User';
  ngfsAlignment: string;
  provider: string;
  sourceVersion: string;
  publicationDate: string;
  priceBaseYear: number;
  narrativeSummary: string;
  keyAssumptions: string[];
  horizons: Record<TimeHorizon, ScenarioHorizonPoint>;
}

export interface Company {
  id: string; // COMP-001 ... COMP-030
  name: string;
  isSynthetic: true;
  sector: Sector;
  country: Country;
  headquarters: string;
  reportingYear: number;
  
  // Financials in USD Millions
  revenueUsdM: number;
  ebitdaUsdM: number;
  totalDebtUsdM: number;
  cashUsdM: number;
  enterpriseValueUsdM: number; // EVIC for PCAF attribution
  loanExposureUsdM: number; // EAD (Exposure at Default) in portfolio
  
  // Baseline Credit Metrics
  baselineRating: string; // e.g., BBB, BB+, A
  baselinePdPct: number; // Annual Probability of Default (%)
  baselineLgdPct: number; // Loss Given Default (%)
  
  // Emissions in tCO2e
  scope1Tco2e: number;
  scope2Tco2e: number;
  scope3Tco2e?: number;
  
  // Operational profile
  energyConsumptionMwh: number;
  carbonCoveragePct: number; // % of Scope 1+2 covered by ETS or carbon pricing
  freeAllowancesPct: number; // % of covered emissions granted as free allowances
  carbonPassThroughPct: number; // default ability to pass costs to customers (0 - 100%)
  
  // Physical asset count
  physicalAssetCount: number;
  totalAssetReplacementValueUsdM: number;
  
  // Governance & Quality
  dataQuality: DataQualityCategory;
  verifiedMethodology: string;
}

export type AcuteHazardType = 'Flood' | 'Cyclone' | 'Wildfire' | 'Extreme Precipitation';
export type ChronicHazardType = 'Heat Stress' | 'Water Stress' | 'Drought' | 'Sea-level Rise';

export interface PhysicalAsset {
  id: string; // ASSET-001 ... ASSET-100
  companyId: string;
  companyName: string;
  sector: Sector;
  name: string;
  isSynthetic: true;
  assetType: string;
  country: Country;
  city: string;
  latitude: number;
  longitude: number;
  replacementValueUsdM: number;
  
  // Baseline Hazard Exposure Indices (0-100 Normalized Scale)
  acuteHazards: Record<AcuteHazardType, number>;
  chronicHazards: Record<ChronicHazardType, number>;
  
  overallPhysicalScore: number; // Weighted composite 0-100
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface TransitionImpactResult {
  companyId: string;
  companyName: string;
  sector: Sector;
  country: Country;
  baselineEbitdaUsdM: number;
  
  grossCarbonCostUsdM: number;
  netIncrementalCarbonCostUsdM: number;
  carbonCostAbsorbedUsdM: number;
  incrementalEnergyCostUsdM: number;
  mitigationBenefitUsdM: number;
  
  totalIncrementalCostUsdM: number;
  adjustedEbitdaUsdM: number;
  ebitdaChangePct: number;
  
  baselineMarginPct: number;
  adjustedMarginPct: number;
  
  baselinePdPct: number;
  modelledPdPct: number;
  pdChangeBps: number;
  
  dataQuality: DataQualityCategory;
}

export interface PortfolioAggregates {
  totalLoanExposureUsdM: number;
  totalFinancedEmissionsTco2e: number; // PCAF sum
  weightedAverageCarbonIntensity: number; // tCO2e / USD M Revenue
  highTransitionRiskExposureUsdM: number;
  highTransitionRiskPct: number;
  highPhysicalRiskExposureUsdM: number;
  highPhysicalRiskPct: number;
  aggregateAdjustedEbitdaImpactUsdM: number;
  aggregateEbitdaImpactPct: number;
  companyCount: number;
  assetCount: number;
  dataQualityScore: number; // % validated
}

export interface ValidationIssue {
  id: string;
  entityType: 'Company' | 'Asset' | 'Scenario';
  entityId: string;
  field: string;
  severity: 'Error' | 'Warning' | 'Notice';
  rule: string;
  message: string;
  valueReceived: unknown;
}

export interface ValidationSummary {
  totalChecked: number;
  passedCount: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  datasetIntegrityScorePct: number;
  executionTimestamp: string;
}

export interface AssumptionItem {
  key: string;
  category: 'Transition' | 'Physical' | 'Financial Transmission' | 'Portfolio Aggregation';
  parameterName: string;
  defaultVal: string;
  unit: string;
  source: string;
  rationale: string;
  sensitivityRange: string;
}

export interface DataDictionaryEntry {
  field: string;
  label: string;
  category: string;
  dataType: string;
  unit: string;
  formulaOrRule: string;
  description: string;
  pcafOrIfrsRef: string;
}

// ============================================================================
// PHASE 2 — FINANCIAL IMPACT & MULTI-YEAR PROJECTION TYPES
// ============================================================================

export interface ClimateFinancialShock {
  demandReductionPct: number; // % drop in baseline demand
  productSubstitutionPct: number; // % loss to green alternatives
  marketTransitionPct: number; // general regulatory/market contraction
  operationalDisruptionPct: number; // acute/chronic supply disruption
  lowCarbonOpportunityPct: number; // revenue expansion from green offerings
  netRevenueShockPct: number; // net combined revenue shock
}

export interface DecarbonizationInvestment {
  id: string;
  companyId: string;
  name: string;
  category: 
    | 'Renewable Electricity'
    | 'Energy Efficiency'
    | 'Fuel Switching'
    | 'Industrial Electrification'
    | 'Process Emissions Reduction'
    | 'Low-Carbon Tech Adoption';
  implementationYear: number;
  usefulLifeYears: number;
  initialCapexUsdM: number;
  annualOpexSavingsUsdM: number;
  annualEmissionsReductionTco2e: number;
  annualDepreciationUsdM: number;
  debtFinancingSharePct: number; // % financed with debt
  interestRatePct: number; // cost of green debt
  isPositiveNpv: boolean;
}

export interface AnnualFinancialProjection {
  year: number;
  isHistoricalBaseline: boolean; // FY2024 is true; 2025-2050 are false (projections)
  
  // Income Statement (USD Millions)
  baselineRevenueUsdM: number;
  projectedRevenueUsdM: number;
  revenueShockPct: number;
  
  baselineOpexUsdM: number;
  incrementalCarbonCostUsdM: number;
  incrementalEnergyCostUsdM: number;
  otherClimateOpexUsdM: number;
  verifiedOpexSavingsUsdM: number;
  totalAdjustedOpexUsdM: number;
  
  baselineEbitdaUsdM: number;
  adjustedEbitdaUsdM: number;
  ebitdaChangePct: number;
  baselineMarginPct: number;
  adjustedMarginPct: number;
  
  depreciationAndAmortizationUsdM: number;
  ebitUsdM: number;
  taxExpenseUsdM: number;
  effectiveTaxRatePct: number;
  
  // Cash Flow & Investment
  baselineCapexUsdM: number;
  greenCapexUsdM: number;
  totalCapexUsdM: number;
  changeInNetWorkingCapitalUsdM: number;
  
  baselineFcffUsdM: number;
  climateAdjustedFcffUsdM: number;
  incrementalFcffDeltaUsdM: number;
  cumulativeFcffImpactUsdM: number;
  
  // Balance Sheet & Solvency
  totalDebtUsdM: number;
  interestExpenseUsdM: number;
  debtServiceCoverageRatio: number; // (Adjusted EBITDA - Tax) / (Interest + Principal)
  
  // Decarbonization progress
  remainingScope1Tco2e: number;
  remainingScope2Tco2e: number;
}

export interface CompanyFinancialProjectionSummary {
  companyId: string;
  companyName: string;
  sector: Sector;
  country: Country;
  scenarioId: ScenarioType;
  projections: AnnualFinancialProjection[]; // 2024 to 2050
  cumulativeCapexUsdM: number;
  cumulativeFcffImpactUsdM: number;
  terminal2050MarginPct: number;
  minDscr: number;
}

// ============================================================================
// PHASE 2 — CLIMATE CREDIT RISK TYPES
// ============================================================================

export interface CreditRiskAssumptions {
  pdTransmissionModel: 'Logit-Shift' | 'Merton-Elasticity-Proxy';
  logitSensitivityFactor: number; // Calibration scaling factor (default 1.25)
  collateralHaircutSensitivity: number; // Haircut multiplier on physical score
  recoveryCostShockPct: number; // Additional recovery friction in distress
  creditConversionFactorPct: number; // CCF for undrawn commitment (default 50%)
  ifrs9SicrThresholdMultiplier: number; // PD ratio triggering Stage 2 (e.g. 2.0x)
  ifrs9SicrAbsoluteBps: number; // Absolute PD increase triggering Stage 2 (e.g. 100 bps)
}

export interface CreditRiskResult {
  companyId: string;
  companyName: string;
  sector: Sector;
  country: Country;
  scenarioId: ScenarioType;
  horizon: number;
  
  // Baseline Credit
  baselineRating: string;
  baselinePdPct: number;
  baselineLgdPct: number;
  drawnExposureUsdM: number;
  undrawnCommitmentUsdM: number;
  creditConversionFactorPct: number;
  eadUsdM: number;
  baselineExpectedLossUsdM: number;
  
  // Climate Stressed Credit
  climatePdShiftLogit: number;
  stressedPdPct: number;
  pdChangeBps: number;
  
  collateralValueShockPct: number;
  stressedLgdPct: number;
  lgdChangeBps: number;
  
  stressedExpectedLossUsdM: number;
  incrementalExpectedLossUsdM: number;
  expectedLossRateBps: number; // (EL / EAD) in basis points
  
  // Merton Elasticity Comparison (Illustrative Proxy)
  mertonProxyPdPct: number;
  
  // IFRS 9 Staging Classification
  ifrs9Stage: 'Stage 1' | 'Stage 2' | 'Stage 3';
  isSicrTriggered: boolean;
  stagingRationale: string;
}

// ============================================================================
// PHASE 2 — PORTFOLIO STRESS TESTING & CAPITAL ADEQUACY TYPES
// ============================================================================

export interface PortfolioStressResult {
  scenarioId: ScenarioType;
  horizon: number;
  companyCount: number;
  totalEadUsdM: number;
  baselineExpectedLossUsdM: number;
  stressedExpectedLossUsdM: number;
  incrementalExpectedLossUsdM: number;
  baselineLossRateBps: number;
  stressedLossRateBps: number;
  
  // Staging Breakdown
  stage1EadUsdM: number;
  stage2EadUsdM: number;
  stage3EadUsdM: number;
  stage2EadSharePct: number;
  
  // Concentrations
  sectorBreakdown: Array<{
    sector: Sector;
    eadUsdM: number;
    stressedLossUsdM: number;
    lossRateBps: number;
  }>;
  countryBreakdown: Array<{
    country: Country;
    eadUsdM: number;
    stressedLossUsdM: number;
    lossRateBps: number;
  }>;
  topRiskContributors: Array<{
    companyId: string;
    companyName: string;
    sector: Sector;
    eadUsdM: number;
    incrementalLossUsdM: number;
    contributionPct: number;
  }>;
}

export interface CapitalAdequacyAssumptions {
  startingCet1CapitalUsdM: number; // e.g. 1250
  startingRwaUsdM: number; // e.g. 9800
  effectiveTaxRatePct: number; // e.g. 25%
  rwaClimateRiskDensityFactor: number; // Sensitivity factor for RWA increase (default 0.35)
  minimumRegulatoryCet1Pct: number; // Regulatory minimum e.g. 10.5% (Pillar 1 + Buffers)
}

export interface CapitalSensitivityResult {
  scenarioId: ScenarioType;
  horizon: number;
  startingCet1CapitalUsdM: number;
  startingRwaUsdM: number;
  startingCet1RatioPct: number;
  
  provisionsDeductionUsdM: number;
  taxShieldBenefitUsdM: number;
  netCapitalDeductionUsdM: number;
  stressedCet1CapitalUsdM: number;
  
  rwaInflationUsdM: number;
  stressedRwaUsdM: number;
  
  stressedCet1RatioPct: number;
  cet1DepletionBps: number;
  isBreached: boolean;
  regulatoryBufferHeadroomBps: number;
}

export interface ReverseStressResult {
  targetCet1ThresholdPct: number; // e.g. 10.5%
  stressParameterName: 'Carbon Price ($/tCO2e)' | 'Across-the-board Revenue Shock (%)';
  criticalThresholdValue: number | null; // e.g. $245/t or 22.4%
  isConverged: boolean;
  iterationsRun: number;
  toleranceAchieved: number;
  baselineCet1RatioPct: number;
  minimumAttainableCet1RatioPct: number;
  solverNote: string;
}

// ============================================================================
// PHASE 2 — SCENARIO COMPARISON & ATTRIBUTION TYPES
// ============================================================================

export interface RiskDriverAttribution {
  companyId?: string;
  entityName: string;
  baselineEbitdaUsdM: number;
  carbonCostImpactUsdM: number;
  energyCostImpactUsdM: number;
  revenueShockImpactUsdM: number;
  mitigationBenefitsUsdM: number;
  stressedEbitdaUsdM: number;
  netDeltaUsdM: number;
  
  // Percentage attribution breakdown
  carbonCostPct: number;
  energyCostPct: number;
  revenueShockPct: number;
  mitigationPct: number;
}

export interface ScenarioComparisonMetricRow {
  entityId: string;
  entityName: string;
  sector: Sector;
  country: Country;
  eadUsdM: number;
  
  baselineEbitdaUsdM: number;
  orderlyEbitdaImpactPct: number;
  disorderlyEbitdaImpactPct: number;
  highWarmingEbitdaImpactPct: number;
  
  orderlyExpectedLossUsdM: number;
  disorderlyExpectedLossUsdM: number;
  highWarmingExpectedLossUsdM: number;
  
  orderlyPdChangeBps: number;
  disorderlyPdChangeBps: number;
  highWarmingPdChangeBps: number;
}

export interface CalculationAuditRecord {
  scenarioId: ScenarioType;
  companyId: string;
  projectionYear: number;
  currency: string;
  unit: string;
  modelVersion: string;
  assumptionsVersion: string;
  calculationTimestamp: string;
  dataProvenance: string;
  formulaApplied: string;
  inputs: Record<string, number | string>;
  outputValue: number;
}

// ============================================================================
// PHASE 3 — PHYSICAL CLIMATE RISK & GEOSPATIAL LOSS MODELLING TYPES
// ============================================================================

export type SpecificPhysicalHazard =
  | 'River Flooding'
  | 'Coastal Flooding'
  | 'Tropical Cyclone'
  | 'Wildfire'
  | 'Extreme Precipitation'
  | 'Heat Stress'
  | 'Drought'
  | 'Water Stress'
  | 'Sea-level Rise';

export interface HazardIntensity {
  hazardType: SpecificPhysicalHazard;
  intensityUnit: string; // 'meters', 'm/s', 'kW/m', 'mm/24h', 'degC_days', 'deficit_pct', 'cm'
  value: number;
  returnPeriodYears?: number;
  annualExceedanceProbability?: number;
  scenarioId: ScenarioType;
  horizon: ScenarioHorizon;
}

export interface HazardEvent {
  eventId: string;
  hazardType: SpecificPhysicalHazard;
  returnPeriodYears: number; // e.g. 10, 25, 50, 100, 250, 500
  annualExceedanceProbability: number; // 1 / returnPeriodYears
  hazardIntensity: number;
  intensityUnit: string;
}

export interface VulnerabilityCurve {
  curveId: string;
  hazardType: SpecificPhysicalHazard;
  assetType: string;
  curveName: string;
  intensityUnit: string;
  formulaDescription: string;
  intensityPoints: number[];
  damageRatios: number[]; // Bounded [0, 1]
  protectionThreshold: number; // Intensity below which damage = 0
  uncertaintyBandPct: number; // e.g. ±15%
}

export interface AssetDamageResult {
  assetId: string;
  assetName: string;
  companyId: string;
  hazardType: SpecificPhysicalHazard;
  returnPeriodYears: number;
  hazardIntensity: number;
  intensityUnit: string;
  damageRatio: number; // strictly [0, 1]
  grossDamageUsdM: number;
  insuredDamageUsdM: number;
  uninsuredDamageUsdM: number;
  isProtectedByThreshold: boolean;
}

export interface BusinessInterruptionResult {
  assetId: string;
  hazardType: SpecificPhysicalHazard;
  downtimeDays: number;
  dailyMarginLossUsdM: number;
  grossBusinessInterruptionUsdM: number;
  insuredBiUsdM: number;
  netBiLossUsdM: number;
}

export interface InsuranceRecoveryResult {
  policyDeductibleUsdM: number;
  policyLimitUsdM: number;
  coveragePct: number;
  grossPhysicalClaimUsdM: number;
  grossBiClaimUsdM: number;
  netInsurancePayoutUsdM: number;
  uninsuredRetainedLossUsdM: number;
}

export interface ExceedanceCurvePoint {
  returnPeriodYears: number;
  annualExceedanceProbability: number;
  hazardIntensity: number;
  damageRatio: number;
  grossDamageUsdM: number;
  netInsuredDamageUsdM: number;
  uninsuredDamageUsdM: number;
}

export interface ExpectedAnnualLossResult {
  assetId: string;
  assetName: string;
  companyId: string;
  companyName: string;
  sector: Sector;
  country: Country;
  assetType: string;
  replacementValueUsdM: number;
  scenarioId: ScenarioType;
  horizon: ScenarioHorizon;
  
  // EAL Components (Probabilistic Numerical Integration)
  grossEalUsdM: number;
  netInsuredEalUsdM: number;
  uninsuredEalUsdM: number;
  businessInterruptionEalUsdM: number;
  totalExpectedAnnualLossUsdM: number;
  lossRatePct: number; // totalEal / replacementValue * 100
  
  // Chronic peril loss
  chronicLossUsdM: number;
  
  // Breakdown by peril
  perilBreakdown: Record<SpecificPhysicalHazard, number>;
  
  // Detailed exceedance curve
  floodExceedanceCurve: ExceedanceCurvePoint[];
  cycloneExceedanceCurve: ExceedanceCurvePoint[];
  
  // Adapted scenario
  adaptedTotalEalUsdM?: number;
  avoidedLossAnnualUsdM?: number;
}

export interface AdaptationMeasure {
  measureId: string;
  name: string;
  targetHazard: SpecificPhysicalHazard;
  assetTypeTarget: string;
  description: string;
  capitalCostUsdM: number;
  annualMaintenanceCostUsdM: number;
  usefulLifeYears: number;
  protectionStandardIntensity: number; // e.g. 2.5m flood depth
  damageReductionPct: number; // e.g. 70% reduction in residual damage
  
  // Dynamic economics
  baselineEalUsdM: number;
  adaptedEalUsdM: number;
  avoidedLossAnnualUsdM: number;
  netPresentBenefitUsdM: number;
  benefitCostRatio: number;
  paybackYears: number;
}

export interface PhysicalRiskFinancialImpact {
  companyId: string;
  companyName: string;
  sector: Sector;
  country: Country;
  scenarioId: ScenarioType;
  horizon: ScenarioHorizon;
  
  totalAssetReplacementValueUsdM: number;
  assetCount: number;
  
  // Direct Physical Losses
  totalGrossEalUsdM: number;
  totalInsuredEalUsdM: number;
  totalUninsuredEalUsdM: number;
  totalBusinessInterruptionEalUsdM: number;
  
  // Chronic Peril Drag
  heatProductivityDragUsdM: number;
  waterStressCapacityDragUsdM: number;
  droughtYieldDragUsdM: number;
  coastalErosionImpairmentUsdM: number;
  totalChronicOperatingDragUsdM: number;
  
  // Financial Transmission Breakdown
  cashRepairExpenditureUsdM: number; // Uninsured physical damage cash outflow
  accountingAssetImpairmentUsdM: number; // Write-down of impaired capital base
  insuranceRecoveryInflowUsdM: number; // Cash recovery from claims
  netEbitdaImpactUsdM: number; // Business interruption + chronic drag
  netFcffImpactUsdM: number; // EBITDA impact - cash repairs + tax shield
  
  // Adaptation Program
  adaptationCapexUsdM: number;
  adaptedTotalLossUsdM: number;
  avoidedLossUsdM: number;
  
  // Credit Risk Transmission
  collateralImpairmentPct: number;
  stressedLgdPct: number;
  lgdDeltaBps: number;
  biPdShockBps: number;
  stressedPdPct: number;
  incrementalExpectedLossUsdM: number;
}

export interface PhysicalRiskAuditRecord {
  auditId: string;
  assetId?: string;
  companyId?: string;
  scenarioId: ScenarioType;
  horizon: ScenarioHorizon;
  hazardType: SpecificPhysicalHazard;
  calculationType: 'VulnerabilityDamage' | 'ProbabilisticEAL' | 'InsuranceLayer' | 'BusinessInterruption' | 'AdaptationNPV' | 'CreditTransmission';
  formulaApplied: string;
  numericalInputs: Record<string, number | string>;
  calculatedOutput: number;
  unit: string;
  downscalingMethod: string;
  uncertaintyRating: 'Low' | 'Medium' | 'High' | 'Very High';
  isSynthetic: true;
  timestamp: string;
}

export interface GeospatialAssetCluster {
  clusterId: string;
  country: Country;
  regionName: string;
  centerLatitude: number;
  centerLongitude: number;
  assetCount: number;
  totalReplacementValueUsdM: number;
  avgPhysicalScore: number;
  totalEalUsdM: number;
  dominantPeril: SpecificPhysicalHazard;
  criticalAssetCount: number;
}

