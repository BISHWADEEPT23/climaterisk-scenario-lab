/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Physical Financial & Credit Integration Engine (Phase 3)
 * Bridges asset-level probabilistic physical losses to corporate financial statements and credit metrics.
 */

import {
  PhysicalAsset,
  Company,
  ScenarioType,
  ScenarioHorizon,
  PhysicalRiskFinancialImpact,
  ExpectedAnnualLossResult
} from '../types/climate';
import { calculateAssetEal } from './probabilisticEalEngine';
import { evaluatePortfolioAdaptation } from './adaptationEngine';

/**
 * Calculates company-level physical climate risk financial transmission.
 * Avoids double counting by strictly isolating:
 * 1. Cash repair outflows (Uninsured acute damage)
 * 2. Operating income losses (Business interruption + chronic drag)
 * 3. Non-cash accounting impairments
 * 4. Insurance cash recoveries
 */
export function calculateCompanyPhysicalImpact(
  company: Company,
  companyAssets: PhysicalAsset[],
  scenarioId: ScenarioType,
  horizon: ScenarioHorizon,
  taxRatePct: number = 25.0
): PhysicalRiskFinancialImpact {
  const assetCount = companyAssets.length;
  const totalReplacementVal = companyAssets.reduce((sum, a) => sum + a.replacementValueUsdM, 0);

  // Compute EAL for each company asset
  const ealResults: ExpectedAnnualLossResult[] = companyAssets.map(asset =>
    calculateAssetEal(asset, company, scenarioId, horizon)
  );

  const totalGrossEal = ealResults.reduce((sum, r) => sum + r.grossEalUsdM, 0);
  const totalInsuredEal = ealResults.reduce((sum, r) => sum + r.netInsuredEalUsdM, 0);
  const totalUninsuredEal = ealResults.reduce((sum, r) => sum + r.uninsuredEalUsdM, 0);
  const totalBiEal = ealResults.reduce((sum, r) => sum + r.businessInterruptionEalUsdM, 0);

  // Chronic Peril Drag Breakdown
  let heatDrag = 0;
  let waterDrag = 0;
  let droughtDrag = 0;
  let coastalDrag = 0;

  for (const r of ealResults) {
    heatDrag += r.perilBreakdown['Heat Stress'] || 0;
    waterDrag += r.perilBreakdown['Water Stress'] || 0;
    droughtDrag += r.perilBreakdown['Drought'] || 0;
    coastalDrag += r.perilBreakdown['Sea-level Rise'] || 0;
  }

  const totalChronicDrag = heatDrag + waterDrag + droughtDrag + coastalDrag;

  // 1. Operating Loss Transmission to EBITDA:
  // Operating income is reduced by Business Interruption and Chronic Operating Drag
  const netEbitdaImpact = totalBiEal + totalChronicDrag;

  // 2. Direct Cash Outflow:
  // Cash repair expenditure equals the uninsured physical damage retention
  const cashRepairExpenditure = totalUninsuredEal;

  // 3. Accounting Impairment:
  // Permanent capital write-down (e.g. from coastal erosion / unrepairable damage)
  const accountingAssetImpairment = Number((totalUninsuredEal * 0.40).toFixed(4));

  // 4. Insurance Recovery Inflow:
  const insuranceRecoveryInflow = totalInsuredEal;

  // 5. Free Cash Flow to Firm (FCFF) Impact:
  // FCFF Delta = - (EBITDA Shock * (1 - tax)) - Cash Repair Expenditure + (Tax Shield on Repairs)
  const taxShield = taxRatePct / 100;
  const netFcffImpact = Number(
    (netEbitdaImpact * (1 - taxShield) + cashRepairExpenditure * (1 - taxShield)).toFixed(4)
  );

  // 6. Adaptation Program
  const adaptation = evaluatePortfolioAdaptation(ealResults, ['ADAPT-FLOOD-01', 'ADAPT-PRECIP-01']);
  const adaptationCapex = adaptation.totalAdaptationCapexUsdM;
  const avoidedLoss = adaptation.totalAnnualAvoidedLossUsdM;
  const adaptedTotalLoss = Math.max(0, (totalUninsuredEal + netEbitdaImpact) - avoidedLoss);

  // 7. Credit Risk Transmission:
  // Collateral value impairment reduces recovery, increasing LGD
  const collateralImpairmentPct = totalReplacementVal > 0
    ? Math.min(30.0, Number(((totalUninsuredEal / totalReplacementVal) * 100).toFixed(2)))
    : 0.0;

  const lgdDeltaBps = Number((collateralImpairmentPct * 45.0).toFixed(1)); // 1% collateral drop adds ~45 bps to LGD
  const stressedLgdPct = Math.min(100.0, Number((company.baselineLgdPct + lgdDeltaBps / 100).toFixed(2)));

  // Operating shock translates into Probability of Default (PD) shift via logit sensitivity
  const ebitdaShockPct = company.ebitdaUsdM > 0
    ? Math.min(50.0, (netEbitdaImpact / company.ebitdaUsdM) * 100)
    : 5.0;

  const biPdShockBps = Number((ebitdaShockPct * 8.5).toFixed(1)); // 1% EBITDA loss adds ~8.5 bps to PD
  const stressedPdPct = Math.min(99.99, Number((company.baselinePdPct + biPdShockBps / 100).toFixed(3)));

  // Stressed Single-Period Expected Loss
  const baselineEl = (company.baselinePdPct / 100) * (company.baselineLgdPct / 100) * company.loanExposureUsdM;
  const stressedEl = (stressedPdPct / 100) * (stressedLgdPct / 100) * company.loanExposureUsdM;
  const incrementalExpectedLossUsdM = Number(Math.max(0, stressedEl - baselineEl).toFixed(4));

  return {
    companyId: company.id,
    companyName: company.name,
    sector: company.sector,
    country: company.country,
    scenarioId,
    horizon,
    totalAssetReplacementValueUsdM: Number(totalReplacementVal.toFixed(2)),
    assetCount,
    totalGrossEalUsdM: Number(totalGrossEal.toFixed(4)),
    totalInsuredEalUsdM: Number(totalInsuredEal.toFixed(4)),
    totalUninsuredEalUsdM: Number(totalUninsuredEal.toFixed(4)),
    totalBusinessInterruptionEalUsdM: Number(totalBiEal.toFixed(4)),
    heatProductivityDragUsdM: Number(heatDrag.toFixed(4)),
    waterStressCapacityDragUsdM: Number(waterDrag.toFixed(4)),
    droughtYieldDragUsdM: Number(droughtDrag.toFixed(4)),
    coastalErosionImpairmentUsdM: Number(coastalDrag.toFixed(4)),
    totalChronicOperatingDragUsdM: Number(totalChronicDrag.toFixed(4)),
    cashRepairExpenditureUsdM: Number(cashRepairExpenditure.toFixed(4)),
    accountingAssetImpairmentUsdM: accountingAssetImpairment,
    insuranceRecoveryInflowUsdM: Number(insuranceRecoveryInflow.toFixed(4)),
    netEbitdaImpactUsdM: Number(netEbitdaImpact.toFixed(4)),
    netFcffImpactUsdM: netFcffImpact,
    adaptationCapexUsdM: adaptationCapex,
    adaptedTotalLossUsdM: Number(adaptedTotalLoss.toFixed(4)),
    avoidedLossUsdM: Number(avoidedLoss.toFixed(4)),
    collateralImpairmentPct,
    stressedLgdPct,
    lgdDeltaBps,
    biPdShockBps,
    stressedPdPct,
    incrementalExpectedLossUsdM
  };
}
