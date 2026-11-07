/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Portfolio Stress Testing & Capital Adequacy Solver
 * Implements:
 * 1. Portfolio Multi-Horizon Aggregations & Stage Breakdown
 * 2. Illustrative Capital Adequacy Sensitivity (CET1 Ratio & RWA Inflation)
 * 3. Deterministic Bisection Reverse Stress Solver
 */

import {
  Company,
  PhysicalAsset,
  ScenarioType,
  Sector,
  Country,
  PortfolioStressResult,
  CreditRiskResult,
  CreditRiskAssumptions,
  CapitalAdequacyAssumptions,
  CapitalSensitivityResult,
  ReverseStressResult
} from '../types/climate';
import { calculateCompanyCreditRisk, DEFAULT_CREDIT_CONFIG } from './creditRiskEngine';
import { SCENARIO_CATALOG } from '../data/scenarios';
import { interpolateScenarioForYear } from './scenarioInterpolation';

export const DEFAULT_CAPITAL_CONFIG: CapitalAdequacyAssumptions = {
  startingCet1CapitalUsdM: 1250.0,
  startingRwaUsdM: 9800.0,
  effectiveTaxRatePct: 25.0,
  rwaClimateRiskDensityFactor: 0.35,
  minimumRegulatoryCet1Pct: 10.50 // Basel III Pillar 1 (4.5%) + Capital Conservation Buffer (2.5%) + SIFI/Pillar 2
};

/**
 * Executes portfolio-level climate credit stress test
 */
export function runPortfolioStressTest(
  companies: Company[],
  assets: PhysicalAsset[],
  scenarioId: ScenarioType,
  horizon: number,
  config: CreditRiskAssumptions = DEFAULT_CREDIT_CONFIG
): {
  summary: PortfolioStressResult;
  companyResults: CreditRiskResult[];
} {
  const companyResults: CreditRiskResult[] = [];

  let totalEad = 0;
  let totalBaselineLoss = 0;
  let totalStressedLoss = 0;

  let stage1Ead = 0;
  let stage2Ead = 0;
  let stage3Ead = 0;

  // Breakdown aggregators
  const sectorMap: Record<Sector, { ead: number; loss: number }> = {
    'Power Generation': { ead: 0, loss: 0 },
    'Steel': { ead: 0, loss: 0 },
    'Cement': { ead: 0, loss: 0 },
    'Automotive': { ead: 0, loss: 0 },
    'Commercial Real Estate': { ead: 0, loss: 0 },
    'Agriculture': { ead: 0, loss: 0 }
  };

  const countryMap: Record<Country, { ead: number; loss: number }> = {
    'India': { ead: 0, loss: 0 },
    'United States': { ead: 0, loss: 0 },
    'Germany': { ead: 0, loss: 0 },
    'United Kingdom': { ead: 0, loss: 0 },
    'Japan': { ead: 0, loss: 0 }
  };

  for (const comp of companies) {
    const compAssets = assets.filter(a => a.companyId === comp.id);
    const res = calculateCompanyCreditRisk(comp, scenarioId, horizon, compAssets, config);
    companyResults.push(res);

    totalEad += res.eadUsdM;
    totalBaselineLoss += res.baselineExpectedLossUsdM;
    totalStressedLoss += res.stressedExpectedLossUsdM;

    if (res.ifrs9Stage === 'Stage 1') stage1Ead += res.eadUsdM;
    else if (res.ifrs9Stage === 'Stage 2') stage2Ead += res.eadUsdM;
    else stage3Ead += res.eadUsdM;

    if (sectorMap[comp.sector]) {
      sectorMap[comp.sector].ead += res.eadUsdM;
      sectorMap[comp.sector].loss += res.stressedExpectedLossUsdM;
    }

    if (countryMap[comp.country]) {
      countryMap[comp.country].ead += res.eadUsdM;
      countryMap[comp.country].loss += res.stressedExpectedLossUsdM;
    }
  }

  const incrementalLoss = totalStressedLoss - totalBaselineLoss;
  const baselineLossRateBps = totalEad > 0 ? (totalBaselineLoss / totalEad) * 10000 : 0;
  const stressedLossRateBps = totalEad > 0 ? (totalStressedLoss / totalEad) * 10000 : 0;
  const stage2SharePct = totalEad > 0 ? (stage2Ead / totalEad) * 100 : 0;

  // Sector breakdown array
  const sectorBreakdown = Object.entries(sectorMap).map(([sec, data]) => ({
    sector: sec as Sector,
    eadUsdM: Number(data.ead.toFixed(1)),
    stressedLossUsdM: Number(data.loss.toFixed(2)),
    lossRateBps: data.ead > 0 ? Number(((data.loss / data.ead) * 10000).toFixed(1)) : 0
  }));

  // Country breakdown array
  const countryBreakdown = Object.entries(countryMap).map(([cty, data]) => ({
    country: cty as Country,
    eadUsdM: Number(data.ead.toFixed(1)),
    stressedLossUsdM: Number(data.loss.toFixed(2)),
    lossRateBps: data.ead > 0 ? Number(((data.loss / data.ead) * 10000).toFixed(1)) : 0
  }));

  // Top risk contributors sorted by incremental loss
  const sortedByLoss = [...companyResults].sort(
    (a, b) => b.incrementalExpectedLossUsdM - a.incrementalExpectedLossUsdM
  );
  const topRiskContributors = sortedByLoss.slice(0, 5).map(c => ({
    companyId: c.companyId,
    companyName: c.companyName.replace(' [Synthetic]', ''),
    sector: c.sector,
    eadUsdM: c.eadUsdM,
    incrementalLossUsdM: c.incrementalExpectedLossUsdM,
    contributionPct: incrementalLoss > 0 ? Number(((c.incrementalExpectedLossUsdM / incrementalLoss) * 100).toFixed(1)) : 0
  }));

  const summary: PortfolioStressResult = {
    scenarioId,
    horizon,
    companyCount: companies.length,
    totalEadUsdM: Number(totalEad.toFixed(1)),
    baselineExpectedLossUsdM: Number(totalBaselineLoss.toFixed(2)),
    stressedExpectedLossUsdM: Number(totalStressedLoss.toFixed(2)),
    incrementalExpectedLossUsdM: Number(incrementalLoss.toFixed(2)),
    baselineLossRateBps: Number(baselineLossRateBps.toFixed(1)),
    stressedLossRateBps: Number(stressedLossRateBps.toFixed(1)),
    stage1EadUsdM: Number(stage1Ead.toFixed(1)),
    stage2EadUsdM: Number(stage2Ead.toFixed(1)),
    stage3EadUsdM: Number(stage3Ead.toFixed(1)),
    stage2EadSharePct: Number(stage2SharePct.toFixed(1)),
    sectorBreakdown,
    countryBreakdown,
    topRiskContributors
  };

  return { summary, companyResults };
}

/**
 * Calculates illustrative CET1 ratio capital adequacy impact under stress
 */
export function calculateCapitalAdequacyImpact(
  portfolioStress: PortfolioStressResult,
  baselineAvgPdPct: number,
  stressedAvgPdPct: number,
  config: CapitalAdequacyAssumptions = DEFAULT_CAPITAL_CONFIG
): CapitalSensitivityResult {
  const taxRate = config.effectiveTaxRatePct / 100;
  const startingCet1Ratio = (config.startingCet1CapitalUsdM / config.startingRwaUsdM) * 100;

  // 1. Capital deduction from credit provisions
  // Provisions deduction = incremental credit loss net of tax shield
  const provisionsDeduction = Math.max(0, portfolioStress.incrementalExpectedLossUsdM);
  const taxShield = provisionsDeduction * taxRate;
  const netCapitalDeduction = provisionsDeduction - taxShield;
  const stressedCet1Capital = Math.max(0, config.startingCet1CapitalUsdM - netCapitalDeduction);

  // 2. RWA inflation from risk-weight expansion
  // Under internal ratings-based (IRB) approach, worsening PD increases risk density
  const pdRatio = baselineAvgPdPct > 0 ? stressedAvgPdPct / baselineAvgPdPct : 1.0;
  const rwaInflationRatio = Math.max(0, (pdRatio - 1) * config.rwaClimateRiskDensityFactor);
  const rwaInflationUsdM = config.startingRwaUsdM * rwaInflationRatio;
  const stressedRwa = config.startingRwaUsdM + rwaInflationUsdM;

  // 3. Stressed CET1 Ratio
  const stressedCet1Ratio = stressedRwa > 0 ? (stressedCet1Capital / stressedRwa) * 100 : 0;
  const cet1DepletionBps = (startingCet1Ratio - stressedCet1Ratio) * 100;

  const isBreached = stressedCet1Ratio < config.minimumRegulatoryCet1Pct;
  const bufferHeadroomBps = (stressedCet1Ratio - config.minimumRegulatoryCet1Pct) * 100;

  return {
    scenarioId: portfolioStress.scenarioId,
    horizon: portfolioStress.horizon,
    startingCet1CapitalUsdM: config.startingCet1CapitalUsdM,
    startingRwaUsdM: config.startingRwaUsdM,
    startingCet1RatioPct: Number(startingCet1Ratio.toFixed(2)),
    provisionsDeductionUsdM: Number(provisionsDeduction.toFixed(2)),
    taxShieldBenefitUsdM: Number(taxShield.toFixed(2)),
    netCapitalDeductionUsdM: Number(netCapitalDeduction.toFixed(2)),
    stressedCet1CapitalUsdM: Number(stressedCet1Capital.toFixed(2)),
    rwaInflationUsdM: Number(rwaInflationUsdM.toFixed(2)),
    stressedRwaUsdM: Number(stressedRwa.toFixed(2)),
    stressedCet1RatioPct: Number(stressedCet1Ratio.toFixed(2)),
    cet1DepletionBps: Number(cet1DepletionBps.toFixed(1)),
    isBreached,
    regulatoryBufferHeadroomBps: Number(bufferHeadroomBps.toFixed(1))
  };
}

/**
 * Deterministic Bisection Solver for Reverse Stress Testing
 * Solves for the critical Carbon Price ($/tCO2e) that depletes CET1 ratio to target threshold
 */
export function solveReverseStressCarbonPrice(
  companies: Company[],
  assets: PhysicalAsset[],
  targetCet1ThresholdPct: number = 10.5,
  horizon: number = 2030,
  capitalConfig: CapitalAdequacyAssumptions = DEFAULT_CAPITAL_CONFIG
): ReverseStressResult {
  let low = 0; // $0/t
  let high = 1200; // $1,200/t upper search bound
  const maxIterations = 60;
  const tolerance = 0.01; // within 0.01% (1 bp) of target

  // Function to evaluate CET1 ratio at a given carbon price
  const evaluateCet1AtCarbonPrice = (price: number): number => {
    // Custom synthetic scenario with specified carbon price
    const customScenarioDef = {
      ...SCENARIO_CATALOG.disorderly,
      horizons: {
        ...SCENARIO_CATALOG.disorderly.horizons,
        [horizon as 2030]: {
          ...SCENARIO_CATALOG.disorderly.horizons[horizon as 2030],
          carbonPriceUsd: price
        }
      }
    };
    // Temporarily register custom price
    const originalDisorderly = SCENARIO_CATALOG.disorderly.horizons[horizon as 2030];
    SCENARIO_CATALOG.disorderly.horizons[horizon as 2030] = customScenarioDef.horizons[horizon as 2030];

    const { summary, companyResults } = runPortfolioStressTest(companies, assets, 'disorderly', horizon);
    
    // Restore
    SCENARIO_CATALOG.disorderly.horizons[horizon as 2030] = originalDisorderly;

    const baseAvgPd = companyResults.reduce((s, c) => s + c.baselinePdPct, 0) / companyResults.length;
    const stressedAvgPd = companyResults.reduce((s, c) => s + c.stressedPdPct, 0) / companyResults.length;
    const capRes = calculateCapitalAdequacyImpact(summary, baseAvgPd, stressedAvgPd, capitalConfig);

    return capRes.stressedCet1RatioPct;
  };

  const baselineCet1 = evaluateCet1AtCarbonPrice(0);
  const minAttainableCet1 = evaluateCet1AtCarbonPrice(high);

  // Check if target is already breached at zero stress
  if (baselineCet1 <= targetCet1ThresholdPct) {
    return {
      targetCet1ThresholdPct,
      stressParameterName: 'Carbon Price ($/tCO2e)',
      criticalThresholdValue: 0,
      isConverged: true,
      iterationsRun: 1,
      toleranceAchieved: Math.abs(baselineCet1 - targetCet1ThresholdPct),
      baselineCet1RatioPct: baselineCet1,
      minimumAttainableCet1RatioPct: minAttainableCet1,
      solverNote: `Target threshold of ${targetCet1ThresholdPct}% is already breached at baseline ($0/t carbon price).`
    };
  }

  // Check if target is unachievable even at maximum test severity ($1200/t)
  if (minAttainableCet1 > targetCet1ThresholdPct) {
    return {
      targetCet1ThresholdPct,
      stressParameterName: 'Carbon Price ($/tCO2e)',
      criticalThresholdValue: null,
      isConverged: false,
      iterationsRun: 1,
      toleranceAchieved: minAttainableCet1 - targetCet1ThresholdPct,
      baselineCet1RatioPct: baselineCet1,
      minimumAttainableCet1RatioPct: minAttainableCet1,
      solverNote: `Threshold of ${targetCet1ThresholdPct}% cannot be breached within the search interval ($0–$1,200/t). Minimum attainable CET1 is ${minAttainableCet1}%.`
    };
  }

  // Bisection loop
  let mid = 0;
  let iterations = 0;
  let currentVal = baselineCet1;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    mid = (low + high) / 2;
    currentVal = evaluateCet1AtCarbonPrice(mid);

    const diff = currentVal - targetCet1ThresholdPct;

    if (Math.abs(diff) <= tolerance || (high - low) < 0.5) {
      return {
        targetCet1ThresholdPct,
        stressParameterName: 'Carbon Price ($/tCO2e)',
        criticalThresholdValue: Number(mid.toFixed(1)),
        isConverged: true,
        iterationsRun: iterations,
        toleranceAchieved: Number(Math.abs(diff).toFixed(3)),
        baselineCet1RatioPct: baselineCet1,
        minimumAttainableCet1RatioPct: minAttainableCet1,
        solverNote: `Converged in ${iterations} iterations. Critical carbon price = $${mid.toFixed(1)}/tCO2e.`
      };
    }

    // Monotonic function: higher carbon price -> lower CET1 ratio
    if (currentVal > targetCet1ThresholdPct) {
      // Need higher stress to drop CET1 further
      low = mid;
    } else {
      // Stress is too severe, lower search bound
      high = mid;
    }
  }

  return {
    targetCet1ThresholdPct,
    stressParameterName: 'Carbon Price ($/tCO2e)',
    criticalThresholdValue: Number(mid.toFixed(1)),
    isConverged: true,
    iterationsRun: iterations,
    toleranceAchieved: Number(Math.abs(currentVal - targetCet1ThresholdPct).toFixed(3)),
    baselineCet1RatioPct: baselineCet1,
    minimumAttainableCet1RatioPct: minAttainableCet1,
    solverNote: `Reached iteration limit (${iterations} runs). Approximate solution: $${mid.toFixed(1)}/tCO2e.`
  };
}
