/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Transition Risk Calculation Engine
 * Implements deterministic transition risk transmission equations:
 * 1. Gross Carbon Cost = Covered Emissions × Carbon Price
 * 2. Net Incremental Carbon Cost = Gross Cost - Baseline Cost - Allowances Value
 * 3. Cost Absorbed = Net Incremental Cost × (1 - PassThroughRate)
 * 4. Incremental Energy Cost = Energy Consumption × Delta Energy Unit Price
 * 5. Adjusted EBITDA = Baseline EBITDA - Total Incremental Costs + Mitigation Benefits
 */

import { Company, ScenarioHorizonPoint, TransitionImpactResult } from '../types/climate';

export interface TransitionModelConfig {
  customPassThroughOverridePct?: number; // Optional user override for pass-through (0-100)
  enableEnergyCostImpact?: boolean;
  baselineCarbonPriceUsd?: number; // Default 0 or 2025 baseline
  baselineElectricityPriceUsdMwh?: number; // Default 2025 baseline ~75 USD/MWh
  pdSensitivityElasticity?: number; // Ratio of PD increase to EBITDA contraction
}

export const DEFAULT_TRANSITION_CONFIG: TransitionModelConfig = {
  baselineCarbonPriceUsd: 0,
  baselineElectricityPriceUsdMwh: 75.0,
  enableEnergyCostImpact: true,
  pdSensitivityElasticity: 1.75, // 10% EBITDA loss -> ~17.5% relative PD increase
};

/**
 * Calculates deterministic transition risk impact for a single company
 */
export function calculateCompanyTransitionImpact(
  company: Company,
  scenarioPoint: ScenarioHorizonPoint,
  config: TransitionModelConfig = DEFAULT_TRANSITION_CONFIG
): TransitionImpactResult {
  const baselineCarbonPrice = config.baselineCarbonPriceUsd ?? 0;
  const baselineElectricityPrice = config.baselineElectricityPriceUsdMwh ?? 75.0;
  const effectivePassThroughPct = 
    config.customPassThroughOverridePct !== undefined 
      ? config.customPassThroughOverridePct 
      : company.carbonPassThroughPct;

  // 1. Covered Emissions (Scope 1 + Scope 2) in tCO2e
  const totalScope1And2 = company.scope1Tco2e + company.scope2Tco2e;
  const coverageRate = Math.max(0, Math.min(100, company.carbonCoveragePct)) / 100;
  const freeAllowanceRate = Math.max(0, Math.min(100, company.freeAllowancesPct)) / 100;
  const passThroughRate = Math.max(0, Math.min(100, effectivePassThroughPct)) / 100;

  const coveredEmissionsTco2e = totalScope1And2 * coverageRate;

  // 2. Carbon Cost Calculation (in USD, then converted to USD Millions)
  const currentCarbonPrice = Math.max(0, scenarioPoint.carbonPriceUsd);
  const grossCarbonCostUsd = coveredEmissionsTco2e * currentCarbonPrice;
  const baselineCarbonCostUsd = coveredEmissionsTco2e * baselineCarbonPrice;

  // Free allowances offset gross cost
  const freeAllowancesValueUsd = grossCarbonCostUsd * freeAllowanceRate;
  
  // Net incremental carbon cost cannot be negative if price rises
  const netIncrementalCarbonCostUsd = Math.max(
    0,
    grossCarbonCostUsd - baselineCarbonCostUsd - freeAllowancesValueUsd
  );

  // Carbon cost absorbed by the company after passing through to customers
  const carbonCostAbsorbedUsd = netIncrementalCarbonCostUsd * (1 - passThroughRate);

  // Convert to USD Millions
  const grossCarbonCostUsdM = Number((grossCarbonCostUsd / 1_000_000).toFixed(6));
  const netIncrementalCarbonCostUsdM = Number((netIncrementalCarbonCostUsd / 1_000_000).toFixed(6));
  const carbonCostAbsorbedUsdM = Number((carbonCostAbsorbedUsd / 1_000_000).toFixed(6));

  // 3. Incremental Energy Cost Calculation
  let incrementalEnergyCostUsdM = 0;
  if (config.enableEnergyCostImpact !== false) {
    const deltaElectricityPriceUsdMwh = Math.max(
      0,
      scenarioPoint.electricityPriceUsdMwh - baselineElectricityPrice
    );
    const totalEnergyDeltaUsd = company.energyConsumptionMwh * deltaElectricityPriceUsdMwh;
    // Energy cost absorbed (assume 70% can be absorbed if pass-through is partial)
    const energyAbsorbedUsd = totalEnergyDeltaUsd * (1 - passThroughRate * 0.5);
    incrementalEnergyCostUsdM = Number((energyAbsorbedUsd / 1_000_000).toFixed(6));
  }

  // 4. Sector Decarbonization Mitigation Benefits
  // As sector decarbonizes, efficient technology reduces operating costs / carbon compliance penalty
  const sectorDecarbPct = scenarioPoint.sectorEmissionsReductionPct[company.sector] || 0;
  const potentialMitigationFactor = (sectorDecarbPct / 100) * 0.15; // 15% efficiency recoup
  const mitigationBenefitUsdM = Number((carbonCostAbsorbedUsdM * potentialMitigationFactor).toFixed(6));

  // 5. Total Incremental Cost
  const totalIncrementalCostUsdM = Number(
    (carbonCostAbsorbedUsdM + incrementalEnergyCostUsdM - mitigationBenefitUsdM).toFixed(6)
  );

  // 6. Adjusted EBITDA & Margins
  const baselineEbitda = company.ebitdaUsdM;
  const adjustedEbitdaUsdM = Number((baselineEbitda - totalIncrementalCostUsdM).toFixed(4));
  
  const ebitdaChangePct = baselineEbitda !== 0
    ? Number((((adjustedEbitdaUsdM - baselineEbitda) / Math.abs(baselineEbitda)) * 100).toFixed(2))
    : 0;

  const baselineMarginPct = company.revenueUsdM > 0
    ? Number(((company.ebitdaUsdM / company.revenueUsdM) * 100).toFixed(2))
    : 0;

  const adjustedMarginPct = company.revenueUsdM > 0
    ? Number(((adjustedEbitdaUsdM / company.revenueUsdM) * 100).toFixed(2))
    : 0;

  // 7. Credit Metrics Sensitivity (PD Transmission Proxy)
  // Simplified credit transmission: PD scales with operating leverage deterioration
  const elasticity = config.pdSensitivityElasticity ?? 1.75;
  const ebitdaStressFactor = ebitdaChangePct < 0 ? Math.abs(ebitdaChangePct) / 100 : 0;
  const pdMultiplier = 1 + (ebitdaStressFactor * elasticity);
  const modelledPdPct = Number(Math.min(100, company.baselinePdPct * pdMultiplier).toFixed(3));
  const pdChangeBps = Number(((modelledPdPct - company.baselinePdPct) * 100).toFixed(1));

  return {
    companyId: company.id,
    companyName: company.name,
    sector: company.sector,
    country: company.country,
    baselineEbitdaUsdM: baselineEbitda,
    grossCarbonCostUsdM,
    netIncrementalCarbonCostUsdM,
    carbonCostAbsorbedUsdM,
    incrementalEnergyCostUsdM,
    mitigationBenefitUsdM,
    totalIncrementalCostUsdM,
    adjustedEbitdaUsdM,
    ebitdaChangePct,
    baselineMarginPct,
    adjustedMarginPct,
    baselinePdPct: company.baselinePdPct,
    modelledPdPct,
    pdChangeBps,
    dataQuality: company.dataQuality
  };
}

/**
 * Convenience function for exact mathematical unit testing
 */
export function calculateGrossCarbonCost(coveredEmissionsTco2e: number, carbonPriceUsd: number): number {
  return coveredEmissionsTco2e * carbonPriceUsd;
}
