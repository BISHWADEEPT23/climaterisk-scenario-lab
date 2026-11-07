/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Portfolio Aggregation & Analytics Engine
 * Implements:
 * 1. PCAF Financed Emissions: Sum_i (Loan_i / EVIC_i * Emissions_i)
 * 2. TCFD / IFRS S2 WACI: Sum_i (Exposure_i / TotalExposure * (Emissions_i / Revenue_i))
 * 3. Portfolio Transition and Physical Risk Concentration
 * 4. Aggregated Scenario-Conditioned Financial Impact
 */

import { Company, PhysicalAsset, PortfolioAggregates, ScenarioHorizonPoint } from '../types/climate';
import { calculateCompanyTransitionImpact, TransitionModelConfig } from './transitionRisk';

export function calculatePortfolioAggregates(
  companies: Company[],
  assets: PhysicalAsset[],
  scenarioPoint: ScenarioHorizonPoint,
  config?: TransitionModelConfig
): PortfolioAggregates {
  if (companies.length === 0) {
    return {
      totalLoanExposureUsdM: 0,
      totalFinancedEmissionsTco2e: 0,
      weightedAverageCarbonIntensity: 0,
      highTransitionRiskExposureUsdM: 0,
      highTransitionRiskPct: 0,
      highPhysicalRiskExposureUsdM: 0,
      highPhysicalRiskPct: 0,
      aggregateAdjustedEbitdaImpactUsdM: 0,
      aggregateEbitdaImpactPct: 0,
      companyCount: 0,
      assetCount: assets.length,
      dataQualityScore: 100,
    };
  }

  const totalLoanExposureUsdM = companies.reduce((sum, c) => sum + c.loanExposureUsdM, 0);

  // 1. PCAF Financed Emissions (Scope 1 + Scope 2 attributed)
  let totalFinancedEmissionsTco2e = 0;
  for (const comp of companies) {
    if (comp.enterpriseValueUsdM > 0) {
      // Attribution factor: min(1, Loan / EVIC)
      const attributionFactor = Math.min(1.0, comp.loanExposureUsdM / comp.enterpriseValueUsdM);
      const totalEmissions = comp.scope1Tco2e + comp.scope2Tco2e;
      totalFinancedEmissionsTco2e += attributionFactor * totalEmissions;
    }
  }

  // 2. Weighted Average Carbon Intensity (WACI)
  // WACI = Sum ( (Loan_i / TotalLoan) * (Emissions_i / Revenue_i) )
  let weightedAverageCarbonIntensity = 0;
  if (totalLoanExposureUsdM > 0) {
    for (const comp of companies) {
      if (comp.revenueUsdM > 0) {
        const weight = comp.loanExposureUsdM / totalLoanExposureUsdM;
        const carbonIntensity = (comp.scope1Tco2e + comp.scope2Tco2e) / comp.revenueUsdM;
        weightedAverageCarbonIntensity += weight * carbonIntensity;
      }
    }
  }

  // 3. High Transition Risk Exposure
  // Sectors with structural exposure: Power, Steel, Cement, plus high-intensity auto
  const highTransitionSectors = new Set(['Power Generation', 'Steel', 'Cement']);
  let highTransitionRiskExposureUsdM = 0;
  for (const comp of companies) {
    const carbonIntensity = comp.revenueUsdM > 0 
      ? (comp.scope1Tco2e + comp.scope2Tco2e) / comp.revenueUsdM 
      : 0;
    if (highTransitionSectors.has(comp.sector) || carbonIntensity > 400) {
      highTransitionRiskExposureUsdM += comp.loanExposureUsdM;
    }
  }
  const highTransitionRiskPct = totalLoanExposureUsdM > 0
    ? (highTransitionRiskExposureUsdM / totalLoanExposureUsdM) * 100
    : 0;

  // 4. High Physical Risk Exposure
  // Find companies with assets having high or critical physical risk scores (score >= 60)
  const highRiskAssetCompanyIds = new Set(
    assets.filter(a => a.overallPhysicalScore >= 60).map(a => a.companyId)
  );
  let highPhysicalRiskExposureUsdM = 0;
  for (const comp of companies) {
    if (highRiskAssetCompanyIds.has(comp.id)) {
      highPhysicalRiskExposureUsdM += comp.loanExposureUsdM;
    }
  }
  const highPhysicalRiskPct = totalLoanExposureUsdM > 0
    ? (highPhysicalRiskExposureUsdM / totalLoanExposureUsdM) * 100
    : 0;

  // 5. Aggregate Financial Impact under current scenario
  let aggregateBaselineEbitdaUsdM = 0;
  let aggregateAdjustedEbitdaUsdM = 0;

  for (const comp of companies) {
    const impact = calculateCompanyTransitionImpact(comp, scenarioPoint, config);
    aggregateBaselineEbitdaUsdM += comp.ebitdaUsdM;
    aggregateAdjustedEbitdaUsdM += impact.adjustedEbitdaUsdM;
  }

  const aggregateAdjustedEbitdaImpactUsdM = aggregateAdjustedEbitdaUsdM - aggregateBaselineEbitdaUsdM;
  const aggregateEbitdaImpactPct = aggregateBaselineEbitdaUsdM !== 0
    ? (aggregateAdjustedEbitdaImpactUsdM / Math.abs(aggregateBaselineEbitdaUsdM)) * 100
    : 0;

  return {
    totalLoanExposureUsdM: Number(totalLoanExposureUsdM.toFixed(2)),
    totalFinancedEmissionsTco2e: Math.round(totalFinancedEmissionsTco2e),
    weightedAverageCarbonIntensity: Number(weightedAverageCarbonIntensity.toFixed(1)),
    highTransitionRiskExposureUsdM: Number(highTransitionRiskExposureUsdM.toFixed(2)),
    highTransitionRiskPct: Number(highTransitionRiskPct.toFixed(1)),
    highPhysicalRiskExposureUsdM: Number(highPhysicalRiskExposureUsdM.toFixed(2)),
    highPhysicalRiskPct: Number(highPhysicalRiskPct.toFixed(1)),
    aggregateAdjustedEbitdaImpactUsdM: Number(aggregateAdjustedEbitdaImpactUsdM.toFixed(2)),
    aggregateEbitdaImpactPct: Number(aggregateEbitdaImpactPct.toFixed(2)),
    companyCount: companies.length,
    assetCount: assets.length,
    dataQualityScore: 100 // Fully validated synthetic dataset
  };
}
