/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Climate Credit Risk & Expected Loss Engine
 * Implements:
 * 1. Logit-Shift PD Transmission Model: logit(PD_adj) = logit(PD_base) + ClimateRiskShock
 * 2. Merton Elasticity Illustrative Proxy
 * 3. Collateral & Recovery Shocked LGD Model
 * 4. EAD with Credit Conversion Factors (CCF)
 * 5. Single-Period Expected Credit Loss (EL = PD * LGD * EAD)
 * 6. IFRS 9 Staging (Stage 1 / Stage 2 SICR / Stage 3)
 */

import {
  Company,
  ScenarioType,
  TimeHorizon,
  CreditRiskAssumptions,
  CreditRiskResult,
  PhysicalAsset
} from '../types/climate';
import { calculateCompanyTransitionImpact } from './transitionRisk';
import { interpolateScenarioForYear } from './scenarioInterpolation';
import { SCENARIO_CATALOG } from '../data/scenarios';

export const DEFAULT_CREDIT_CONFIG: CreditRiskAssumptions = {
  pdTransmissionModel: 'Logit-Shift',
  logitSensitivityFactor: 1.25,
  collateralHaircutSensitivity: 0.35,
  recoveryCostShockPct: 15.0,
  creditConversionFactorPct: 50.0,
  ifrs9SicrThresholdMultiplier: 2.0, // 2x relative increase
  ifrs9SicrAbsoluteBps: 100.0 // 100 bps absolute increase
};

/**
 * Standard logit transformation: ln(p / (1 - p))
 * Safely clamped to avoid division by zero or log of negative numbers
 */
export function logit(p: number): number {
  const clampedP = Math.max(0.0001, Math.min(0.9999, p));
  return Math.log(clampedP / (1 - clampedP));
}

/**
 * Inverse logit transformation: 1 / (1 + e^-x)
 */
export function inverseLogit(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Calculates EAD with credit conversion factor
 */
export function calculateEad(
  drawnExposureUsdM: number,
  undrawnCommitmentUsdM: number,
  ccfPct: number = 50.0
): number {
  const ccf = Math.max(0, Math.min(100, ccfPct)) / 100;
  return Number((drawnExposureUsdM + ccf * Math.max(0, undrawnCommitmentUsdM)).toFixed(4));
}

/**
 * Computes single-period expected loss: EL = PD * LGD * EAD
 */
export function calculateExpectedLoss(pdPct: number, lgdPct: number, eadUsdM: number): number {
  const pd = Math.max(0, Math.min(100, pdPct)) / 100;
  const lgd = Math.max(0, Math.min(100, lgdPct)) / 100;
  return Number((pd * lgd * Math.max(0, eadUsdM)).toFixed(6));
}

/**
 * Computes scenario-conditioned credit risk metrics for a single corporate borrower
 */
export function calculateCompanyCreditRisk(
  company: Company,
  scenarioId: ScenarioType,
  horizon: number,
  companyAssets: PhysicalAsset[] = [],
  config: CreditRiskAssumptions = DEFAULT_CREDIT_CONFIG
): CreditRiskResult {
  const scenarioDef = SCENARIO_CATALOG[scenarioId] || SCENARIO_CATALOG.orderly;
  const scenarioPoint = interpolateScenarioForYear(scenarioDef, horizon);

  // 1. Exposure at Default (EAD)
  // Assume a 20% undrawn revolving liquidity line for corporate borrowers
  const drawnExposure = company.loanExposureUsdM;
  const undrawnCommitment = Number((drawnExposure * 0.20).toFixed(2));
  const ead = calculateEad(drawnExposure, undrawnCommitment, config.creditConversionFactorPct);

  // 2. Baseline Credit Metrics
  const baselinePdProb = company.baselinePdPct / 100;
  const baselineLgdProb = company.baselineLgdPct / 100;
  const baselineExpectedLoss = calculateExpectedLoss(company.baselinePdPct, company.baselineLgdPct, ead);

  // 3. Transition Impact & Financial Transmission Drivers
  const transitionImpact = calculateCompanyTransitionImpact(company, scenarioPoint);
  const ebitdaShock = transitionImpact.ebitdaChangePct < 0 ? Math.abs(transitionImpact.ebitdaChangePct) / 100 : 0;
  
  // Calculate synthetic DSCR distress
  const estInterest = company.totalDebtUsdM * 0.055;
  const estPrincipal = company.totalDebtUsdM / 15;
  const estDebtService = Math.max(1, estInterest + estPrincipal);
  const estDscr = Math.max(0, transitionImpact.adjustedEbitdaUsdM) / estDebtService;
  const dscrDistress = estDscr < 1.3 ? Math.max(0, 1.3 - estDscr) : 0;

  // 4. Logit-Shift PD Transmission
  // logit(PD_adj) = logit(PD_base) + factor * (1.5 * EbitdaShock + 0.8 * DscrDistress)
  const sensitivity = config.logitSensitivityFactor ?? 1.25;
  const climateRiskShockLogit = sensitivity * (ebitdaShock * 1.5 + dscrDistress * 0.7);

  const baselineLogit = logit(baselinePdProb);
  const stressedLogit = baselineLogit + climateRiskShockLogit;
  const rawStressedPd = inverseLogit(stressedLogit);

  // Clamp within [0.01%, 99.99%]
  const stressedPdProb = Math.max(0.0001, Math.min(0.9999, rawStressedPd));
  const stressedPdPct = Number((stressedPdProb * 100).toFixed(3));
  const pdChangeBps = Number(((stressedPdPct - company.baselinePdPct) * 100).toFixed(1));

  // Merton elasticity illustrative proxy for comparison
  const mertonElasticity = 1.75;
  const mertonProxyPdPct = Number(
    Math.min(100, company.baselinePdPct * (1 + ebitdaShock * mertonElasticity)).toFixed(3)
  );

  // 5. Stressed LGD Model with Collateral Haircuts
  // Assets in high-peril or high-transition sectors suffer collateral impairment
  const avgPhysicalScore = companyAssets.length > 0
    ? companyAssets.reduce((sum, a) => sum + a.overallPhysicalScore, 0) / companyAssets.length
    : 30;

  const physicalCollateralHaircut = (avgPhysicalScore / 100) * (config.collateralHaircutSensitivity ?? 0.35);
  const recoveryCostShock = (config.recoveryCostShockPct ?? 15.0) / 100;

  // Stressed LGD = min(1.0, max(0.05, Baseline LGD * (1 + physicalHaircut*0.6 + recoveryShock*0.4)))
  const rawStressedLgd = baselineLgdProb * (1 + physicalCollateralHaircut * 0.6 + recoveryCostShock * 0.4);
  const stressedLgdProb = Math.min(1.0, Math.max(0.05, rawStressedLgd));
  const stressedLgdPct = Number((stressedLgdProb * 100).toFixed(2));
  const lgdChangeBps = Number(((stressedLgdPct - company.baselineLgdPct) * 100).toFixed(1));

  // 6. Stressed Expected Credit Loss
  const stressedExpectedLoss = calculateExpectedLoss(stressedPdPct, stressedLgdPct, ead);
  const incrementalExpectedLoss = Number((stressedExpectedLoss - baselineExpectedLoss).toFixed(4));
  const expectedLossRateBps = ead > 0 ? Number(((stressedExpectedLoss / ead) * 10000).toFixed(1)) : 0;

  // 7. IFRS 9 Staging Classification
  const pdRatio = company.baselinePdPct > 0 ? stressedPdPct / company.baselinePdPct : 1.0;
  const pdDiffBps = (stressedPdPct - company.baselinePdPct) * 100;

  let ifrs9Stage: 'Stage 1' | 'Stage 2' | 'Stage 3' = 'Stage 1';
  let isSicrTriggered = false;
  let stagingRationale = 'Performing credit: variation within normal cycle tolerance.';

  if (stressedPdPct >= 20.0 || estDscr < 0.75) {
    ifrs9Stage = 'Stage 3';
    isSicrTriggered = true;
    stagingRationale = 'Credit-impaired (Default): Modelled PD >= 20% or severe DSCR insolvency.';
  } else if (
    pdRatio >= config.ifrs9SicrThresholdMultiplier ||
    pdDiffBps >= config.ifrs9SicrAbsoluteBps
  ) {
    ifrs9Stage = 'Stage 2';
    isSicrTriggered = true;
    stagingRationale = `Significant Increase in Credit Risk (SICR): PD expanded ${pdRatio.toFixed(2)}x (+${pdDiffBps.toFixed(0)} bps). Requires Lifetime ECL.`;
  }

  return {
    companyId: company.id,
    companyName: company.name,
    sector: company.sector,
    country: company.country,
    scenarioId,
    horizon,
    baselineRating: company.baselineRating,
    baselinePdPct: company.baselinePdPct,
    baselineLgdPct: company.baselineLgdPct,
    drawnExposureUsdM: drawnExposure,
    undrawnCommitmentUsdM: undrawnCommitment,
    creditConversionFactorPct: config.creditConversionFactorPct,
    eadUsdM: ead,
    baselineExpectedLossUsdM: Number(baselineExpectedLoss.toFixed(4)),
    climatePdShiftLogit: Number(climateRiskShockLogit.toFixed(4)),
    stressedPdPct,
    pdChangeBps,
    collateralValueShockPct: Number((physicalCollateralHaircut * 100).toFixed(2)),
    stressedLgdPct,
    lgdChangeBps,
    stressedExpectedLossUsdM: Number(stressedExpectedLoss.toFixed(4)),
    incrementalExpectedLossUsdM: incrementalExpectedLoss,
    expectedLossRateBps,
    mertonProxyPdPct,
    ifrs9Stage,
    isSicrTriggered,
    stagingRationale
  };
}
