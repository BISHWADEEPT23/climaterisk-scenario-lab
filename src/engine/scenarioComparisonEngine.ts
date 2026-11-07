/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Advanced Scenario Comparison & Attribution Engine
 * Implements:
 * 1. Multi-Scenario Side-by-Side Variance Analysis
 * 2. Sequential Deterministic Risk Driver Attribution
 * 3. 100% Reconciled Financial Transmission Waterfall
 * 4. Cross-Scenario Sector & Counterparty Comparison Matrix
 */

import {
  Company,
  PhysicalAsset,
  ScenarioType,
  Sector,
  RiskDriverAttribution,
  ScenarioComparisonMetricRow
} from '../types/climate';
import { SCENARIO_CATALOG } from '../data/scenarios';
import { interpolateScenarioForYear } from './scenarioInterpolation';
import { calculateCompanyTransitionImpact } from './transitionRisk';
import { calculateCompanyCreditRisk } from './creditRiskEngine';
import { calculateClimateRevenueShock } from './financialProjection';

export interface WaterfallStep {
  name: string;
  amountUsdM: number;
  cumulativeUsdM: number;
  type: 'base' | 'negative' | 'positive' | 'total';
  note: string;
}

/**
 * Calculates deterministic sequential risk driver attribution
 * Ordering assumption:
 * 1. Carbon Price Compliance Penalty
 * 2. Wholesale Power Tariff Uplift
 * 3. Revenue Contraction Shock
 * 4. Decarbonization Mitigation Offset
 */
export function calculateRiskDriverAttribution(
  company: Company,
  scenarioId: ScenarioType,
  horizon: number
): RiskDriverAttribution {
  const scenarioDef = SCENARIO_CATALOG[scenarioId] || SCENARIO_CATALOG.orderly;
  const point = interpolateScenarioForYear(scenarioDef, horizon);

  const baselineEbitda = company.ebitdaUsdM;

  // 1. Carbon cost impact
  const transition = calculateCompanyTransitionImpact(company, point);
  const carbonCostImpact = transition.carbonCostAbsorbedUsdM;

  // 2. Energy cost impact
  const energyCostImpact = transition.incrementalEnergyCostUsdM;

  // 3. Revenue shock impact
  const revShock = calculateClimateRevenueShock(company, horizon, scenarioId, point.carbonPriceUsd, point.tempAnomalyCelsius);
  // Revenue loss transmits to gross margin: assume 40% margin contribution on lost revenue
  const revenueLossUsdM = company.revenueUsdM * (Math.max(0, -revShock.netRevenueShockPct) / 100);
  const revenueShockImpact = Number((revenueLossUsdM * 0.40).toFixed(2));

  // 4. Mitigation benefits
  const mitigationBenefits = transition.mitigationBenefitUsdM;

  // Stressed EBITDA
  const stressedEbitda = Number(
    (baselineEbitda - carbonCostImpact - energyCostImpact - revenueShockImpact + mitigationBenefits).toFixed(2)
  );
  const netDelta = Number((stressedEbitda - baselineEbitda).toFixed(2));
  const totalGrossDebits = carbonCostImpact + energyCostImpact + revenueShockImpact;

  return {
    companyId: company.id,
    entityName: company.name.replace(' [Synthetic]', ''),
    baselineEbitdaUsdM: baselineEbitda,
    carbonCostImpactUsdM: carbonCostImpact,
    energyCostImpactUsdM: energyCostImpact,
    revenueShockImpactUsdM: revenueShockImpact,
    mitigationBenefitsUsdM: mitigationBenefits,
    stressedEbitdaUsdM: stressedEbitda,
    netDeltaUsdM: netDelta,
    carbonCostPct: totalGrossDebits > 0 ? Number(((carbonCostImpact / totalGrossDebits) * 100).toFixed(1)) : 0,
    energyCostPct: totalGrossDebits > 0 ? Number(((energyCostImpact / totalGrossDebits) * 100).toFixed(1)) : 0,
    revenueShockPct: totalGrossDebits > 0 ? Number(((revenueShockImpact / totalGrossDebits) * 100).toFixed(1)) : 0,
    mitigationPct: totalGrossDebits > 0 ? Number(((mitigationBenefits / totalGrossDebits) * 100).toFixed(1)) : 0
  };
}

/**
 * Builds cent-by-cent reconciled waterfall steps for corporate or portfolio view
 */
export function buildReconciledWaterfall(
  companies: Company[],
  scenarioId: ScenarioType,
  horizon: number
): WaterfallStep[] {
  let totalBaseEbitda = 0;
  let totalCarbonCost = 0;
  let totalEnergyCost = 0;
  let totalRevenueShockCost = 0;
  let totalMitigations = 0;

  companies.forEach(comp => {
    const attr = calculateRiskDriverAttribution(comp, scenarioId, horizon);
    totalBaseEbitda += attr.baselineEbitdaUsdM;
    totalCarbonCost += attr.carbonCostImpactUsdM;
    totalEnergyCost += attr.energyCostImpactUsdM;
    totalRevenueShockCost += attr.revenueShockImpactUsdM;
    totalMitigations += attr.mitigationBenefitsUsdM;
  });

  const finalStressedEbitda = Number(
    (totalBaseEbitda - totalCarbonCost - totalEnergyCost - totalRevenueShockCost + totalMitigations).toFixed(2)
  );

  let running = totalBaseEbitda;

  const steps: WaterfallStep[] = [
    {
      name: 'Baseline EBITDA',
      amountUsdM: Number(totalBaseEbitda.toFixed(2)),
      cumulativeUsdM: Number(running.toFixed(2)),
      type: 'base',
      note: 'Audited FY2024 unconstrained operating cash flow'
    }
  ];

  running -= totalCarbonCost;
  steps.push({
    name: 'Carbon Compliance Cost',
    amountUsdM: -Number(totalCarbonCost.toFixed(2)),
    cumulativeUsdM: Number(running.toFixed(2)),
    type: 'negative',
    note: 'Covered Scope 1+2 emissions net of allowances and pass-through'
  });

  running -= totalEnergyCost;
  steps.push({
    name: 'Wholesale Energy Uplift',
    amountUsdM: -Number(totalEnergyCost.toFixed(2)),
    cumulativeUsdM: Number(running.toFixed(2)),
    type: 'negative',
    note: 'Electrical power tariff shifts across MWh operational draw'
  });

  running -= totalRevenueShockCost;
  steps.push({
    name: 'Revenue Margin Contraction',
    amountUsdM: -Number(totalRevenueShockCost.toFixed(2)),
    cumulativeUsdM: Number(running.toFixed(2)),
    type: 'negative',
    note: 'Demand erosion and product substitution market friction'
  });

  running += totalMitigations;
  steps.push({
    name: 'Decarbonization Mitigations',
    amountUsdM: Number(totalMitigations.toFixed(2)),
    cumulativeUsdM: Number(running.toFixed(2)),
    type: 'positive',
    note: 'Operational efficiencies & technology offsets'
  });

  steps.push({
    name: 'Stressed Adjusted EBITDA',
    amountUsdM: finalStressedEbitda,
    cumulativeUsdM: finalStressedEbitda,
    type: 'total',
    note: 'Net scenario-conditioned operating earnings available for debt service'
  });

  return steps;
}

/**
 * Builds complete multi-scenario comparison matrix across all 30 companies
 */
export function buildScenarioComparisonMatrix(
  companies: Company[],
  assets: PhysicalAsset[],
  horizon: number
): ScenarioComparisonMetricRow[] {
  return companies.map(comp => {
    const compAssets = assets.filter(a => a.companyId === comp.id);

    const orderlyImpact = calculateCompanyTransitionImpact(comp, interpolateScenarioForYear(SCENARIO_CATALOG.orderly, horizon));
    const disorderlyImpact = calculateCompanyTransitionImpact(comp, interpolateScenarioForYear(SCENARIO_CATALOG.disorderly, horizon));
    const highWarmingImpact = calculateCompanyTransitionImpact(comp, interpolateScenarioForYear(SCENARIO_CATALOG.high_warming, horizon));

    const orderlyCredit = calculateCompanyCreditRisk(comp, 'orderly', horizon, compAssets);
    const disorderlyCredit = calculateCompanyCreditRisk(comp, 'disorderly', horizon, compAssets);
    const highWarmingCredit = calculateCompanyCreditRisk(comp, 'high_warming', horizon, compAssets);

    return {
      entityId: comp.id,
      entityName: comp.name.replace(' [Synthetic]', ''),
      sector: comp.sector,
      country: comp.country,
      eadUsdM: orderlyCredit.eadUsdM,
      baselineEbitdaUsdM: comp.ebitdaUsdM,
      orderlyEbitdaImpactPct: orderlyImpact.ebitdaChangePct,
      disorderlyEbitdaImpactPct: disorderlyImpact.ebitdaChangePct,
      highWarmingEbitdaImpactPct: highWarmingImpact.ebitdaChangePct,
      orderlyExpectedLossUsdM: orderlyCredit.stressedExpectedLossUsdM,
      disorderlyExpectedLossUsdM: disorderlyCredit.stressedExpectedLossUsdM,
      highWarmingExpectedLossUsdM: highWarmingCredit.stressedExpectedLossUsdM,
      orderlyPdChangeBps: orderlyCredit.pdChangeBps,
      disorderlyPdChangeBps: disorderlyCredit.pdChangeBps,
      highWarmingPdChangeBps: highWarmingCredit.pdChangeBps
    };
  });
}
