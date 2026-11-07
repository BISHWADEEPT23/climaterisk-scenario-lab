/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Probabilistic Expected Annual Loss Engine (Phase 3)
 * Implements numerical integration over exceedance-probability curves and insurance layering.
 */

import {
  PhysicalAsset,
  Company,
  ScenarioType,
  ScenarioHorizon,
  SpecificPhysicalHazard,
  ExceedanceCurvePoint,
  ExpectedAnnualLossResult
} from '../types/climate';
import { calculateDamageRatio, calculateBusinessInterruption } from './vulnerabilityFunctions';

export interface ProbabilisticSimulationConfig {
  includeBusinessInterruption: boolean;
  insuranceCoverageDeductiblePct: number;
  insurancePolicyLimitPct: number;
  adaptationThresholdBonus: number;
  discountRatePct: number;
}

export const DEFAULT_PROBABILISTIC_CONFIG: ProbabilisticSimulationConfig = {
  includeBusinessInterruption: true,
  insuranceCoverageDeductiblePct: 5.0,
  insurancePolicyLimitPct: 80.0,
  adaptationThresholdBonus: 0.0,
  discountRatePct: 6.0
};

/**
 * Standard return periods and Annual Exceedance Probabilities (AEP)
 */
export const RETURN_PERIODS = [10, 25, 50, 100, 250, 500] as const;
export const AEP_VALUES = RETURN_PERIODS.map(t => 1 / t); // [0.10, 0.04, 0.02, 0.01, 0.004, 0.002]

/**
 * Returns scenario and horizon climate downscaling multipliers for physical hazard intensity.
 */
export function getScenarioHazardMultiplier(
  scenarioId: ScenarioType,
  horizon: ScenarioHorizon,
  hazardCategory: 'Flood' | 'Wind' | 'Heat' | 'Drought' | 'Water' | 'Coastal'
): number {
  const horizonYear = horizon;
  const yearsFromBase = Math.max(0, horizonYear - 2024);
  const progress = yearsFromBase / 26.0; // 0 to 1 between 2024 and 2050

  const s = scenarioId.toLowerCase();

  if (s === 'orderly') {
    // Modest increase peaking ~2035 then stabilizing
    return 1.0 + 0.15 * Math.min(1.0, progress * 1.1);
  } else if (s === 'disorderly') {
    // Delayed action leads to sharp hazard acceleration post-2030
    if (horizonYear <= 2030) return 1.0 + 0.12 * progress;
    return 1.0 + 0.12 + 0.28 * Math.pow(progress, 1.3);
  } else if (s === 'high warming' || s === 'high_warming') {
    // Chronic unmitigated GHG emissions driving severe tail hazards
    if (hazardCategory === 'Heat' || hazardCategory === 'Drought') {
      return 1.0 + 0.65 * progress;
    }
    if (hazardCategory === 'Flood' || hazardCategory === 'Coastal') {
      return 1.0 + 0.50 * progress;
    }
    return 1.0 + 0.40 * progress;
  } else {
    // Current trajectory baseline warming (+2.7°C)
    return 1.0 + 0.25 * progress;
  }
}

/**
 * Maps synthetic baseline hazard score (0-100) and return period to physical intensity.
 * Example for Flood: score 70 at 100-yr return period yields ~2.2m water depth.
 */
export function estimateHazardIntensity(
  hazardType: SpecificPhysicalHazard,
  baselineScore: number,
  returnPeriod: number,
  scenarioMultiplier: number
): { intensity: number; unit: string } {
  // Return period scaling factor relative to 100-yr anchor
  // Standard Gumbel / GEV extreme value quantile shape proxy:
  // Q(T) = Q_100 * [1 + 0.28 * ln(T / 100)]
  const rpFactor = Math.max(0.4, 1.0 + 0.28 * Math.log(returnPeriod / 100.0));
  const normalizedScore = Math.max(0, Math.min(100, baselineScore)) / 100.0;

  switch (hazardType) {
    case 'River Flooding': {
      // Depth in meters: 0 to 4.5m
      const baseDepth = normalizedScore * 3.2 * rpFactor * scenarioMultiplier;
      return { intensity: Number(Math.max(0, baseDepth).toFixed(2)), unit: 'meters' };
    }
    case 'Coastal Flooding': {
      // Surge depth in meters: 0 to 3.8m
      const baseSurge = normalizedScore * 2.8 * rpFactor * scenarioMultiplier;
      return { intensity: Number(Math.max(0, baseSurge).toFixed(2)), unit: 'meters' };
    }
    case 'Tropical Cyclone': {
      // Wind speed in m/s: 20 to 75 m/s
      const baseWind = (22.0 + normalizedScore * 42.0) * rpFactor * Math.sqrt(scenarioMultiplier);
      return { intensity: Number(Math.min(85, Math.max(15, baseWind)).toFixed(1)), unit: 'm/s' };
    }
    case 'Wildfire': {
      // Flame index (0-100)
      const baseFire = normalizedScore * 85.0 * rpFactor * scenarioMultiplier;
      return { intensity: Number(Math.min(100, Math.max(0, baseFire)).toFixed(1)), unit: 'index' };
    }
    case 'Extreme Precipitation': {
      // 24h rainfall in mm: 50 to 350 mm
      const baseRain = (60.0 + normalizedScore * 240.0) * rpFactor * scenarioMultiplier;
      return { intensity: Number(Math.max(0, baseRain).toFixed(1)), unit: 'mm/24h' };
    }
    case 'Heat Stress': {
      // Degree-days above 35°C: 0 to 45 days
      const days = normalizedScore * 35.0 * scenarioMultiplier;
      return { intensity: Number(days.toFixed(1)), unit: 'degC_days' };
    }
    case 'Drought': {
      // Soil moisture deficit %: 0 to 60%
      const deficit = normalizedScore * 50.0 * scenarioMultiplier;
      return { intensity: Number(deficit.toFixed(1)), unit: 'deficit_pct' };
    }
    case 'Water Stress': {
      // Water stress index %: 0 to 80%
      const stress = normalizedScore * 65.0 * scenarioMultiplier;
      return { intensity: Number(stress.toFixed(1)), unit: 'stress_pct' };
    }
    case 'Sea-level Rise': {
      // Permanent elevation rise in cm: 0 to 70 cm
      const rise = normalizedScore * 55.0 * scenarioMultiplier;
      return { intensity: Number(rise.toFixed(1)), unit: 'cm' };
    }
  }
}

/**
 * Computes numerical trapezoidal integration of an exceedance loss curve to evaluate Expected Annual Loss (EAL).
 * EAL = Integral from 0 to 1 of L(p) dp
 * Discrete trapezoidal rule: sum( (L(p_i) + L(p_{i+1})) / 2 * (p_i - p_{i+1}) ) + p_n * L(p_n)
 */
export function integrateExceedanceCurve(points: { aep: number; loss: number }[]): number {
  if (points.length === 0) return 0.0;
  
  // Sort descending by AEP (e.g. 0.10, 0.04, 0.02, 0.01, 0.004, 0.002)
  const sorted = [...points].sort((a, b) => b.aep - a.aep);

  let totalEal = 0.0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i].aep;
    const p2 = sorted[i + 1].aep;
    const l1 = sorted[i].loss;
    const l2 = sorted[i + 1].loss;

    const deltaP = p1 - p2;
    const avgLoss = (l1 + l2) / 2.0;
    totalEal += avgLoss * deltaP;
  }

  // Add the low-frequency extreme tail beyond 500-yr (p_n = 0.002)
  const lastPoint = sorted[sorted.length - 1];
  totalEal += lastPoint.aep * lastPoint.loss;

  return Number(totalEal.toFixed(5));
}

/**
 * Calculates complete probabilistic Expected Annual Loss (EAL) for a single physical asset.
 */
export function calculateAssetEal(
  asset: PhysicalAsset,
  company: Company,
  scenarioId: ScenarioType,
  horizon: ScenarioHorizon,
  config: ProbabilisticSimulationConfig = DEFAULT_PROBABILISTIC_CONFIG
): ExpectedAnnualLossResult {
  const floodMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Flood');
  const windMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Wind');
  const heatMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Heat');
  const droughtMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Drought');
  const waterMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Water');
  const coastalMult = getScenarioHazardMultiplier(scenarioId, horizon, 'Coastal');

  // Baseline asset hazard scores
  const riverScore = asset.acuteHazards['Flood'] ?? 30;
  const cycloneScore = asset.acuteHazards['Cyclone'] ?? 25;
  const precipScore = asset.acuteHazards['Extreme Precipitation'] ?? 30;
  const wildfireScore = asset.acuteHazards['Wildfire'] ?? 20;

  const heatScore = asset.chronicHazards['Heat Stress'] ?? 25;
  const droughtScore = asset.chronicHazards['Drought'] ?? 20;
  const waterScore = asset.chronicHazards['Water Stress'] ?? 30;
  const slrScore = asset.chronicHazards['Sea-level Rise'] ?? 15;

  // Build Exceedance Curve for River Flooding
  const floodExceedanceCurve: ExceedanceCurvePoint[] = [];
  const floodGrossPoints: { aep: number; loss: number }[] = [];
  const floodInsuredPoints: { aep: number; loss: number }[] = [];
  const floodUninsuredPoints: { aep: number; loss: number }[] = [];

  for (const rp of RETURN_PERIODS) {
    const aep = 1 / rp;
    const { intensity } = estimateHazardIntensity('River Flooding', riverScore, rp, floodMult);
    const dr = calculateDamageRatio('River Flooding', intensity, 1.0, config.adaptationThresholdBonus);
    const grossDamage = Number((asset.replacementValueUsdM * dr).toFixed(4));

    const deductible = Math.max(0.1, asset.replacementValueUsdM * (config.insuranceCoverageDeductiblePct / 100));
    const limit = asset.replacementValueUsdM * (config.insurancePolicyLimitPct / 100);
    const claimable = Math.max(0, grossDamage - deductible);
    const insuredDamage = Number(Math.min(limit, claimable).toFixed(4));
    const uninsuredDamage = Number(Math.max(0, grossDamage - insuredDamage).toFixed(4));

    floodExceedanceCurve.push({
      returnPeriodYears: rp,
      annualExceedanceProbability: aep,
      hazardIntensity: intensity,
      damageRatio: dr,
      grossDamageUsdM: grossDamage,
      netInsuredDamageUsdM: insuredDamage,
      uninsuredDamageUsdM: uninsuredDamage
    });

    floodGrossPoints.push({ aep, loss: grossDamage });
    floodInsuredPoints.push({ aep, loss: insuredDamage });
    floodUninsuredPoints.push({ aep, loss: uninsuredDamage });
  }

  // Build Exceedance Curve for Tropical Cyclone
  const cycloneExceedanceCurve: ExceedanceCurvePoint[] = [];
  const cycloneGrossPoints: { aep: number; loss: number }[] = [];
  const cycloneInsuredPoints: { aep: number; loss: number }[] = [];
  const cycloneUninsuredPoints: { aep: number; loss: number }[] = [];

  for (const rp of RETURN_PERIODS) {
    const aep = 1 / rp;
    const { intensity } = estimateHazardIntensity('Tropical Cyclone', cycloneScore, rp, windMult);
    const dr = calculateDamageRatio('Tropical Cyclone', intensity, 1.0, config.adaptationThresholdBonus);
    const grossDamage = Number((asset.replacementValueUsdM * dr).toFixed(4));

    const deductible = Math.max(0.1, asset.replacementValueUsdM * (config.insuranceCoverageDeductiblePct / 100));
    const limit = asset.replacementValueUsdM * (config.insurancePolicyLimitPct / 100);
    const claimable = Math.max(0, grossDamage - deductible);
    const insuredDamage = Number(Math.min(limit, claimable).toFixed(4));
    const uninsuredDamage = Number(Math.max(0, grossDamage - insuredDamage).toFixed(4));

    cycloneExceedanceCurve.push({
      returnPeriodYears: rp,
      annualExceedanceProbability: aep,
      hazardIntensity: intensity,
      damageRatio: dr,
      grossDamageUsdM: grossDamage,
      netInsuredDamageUsdM: insuredDamage,
      uninsuredDamageUsdM: uninsuredDamage
    });

    cycloneGrossPoints.push({ aep, loss: grossDamage });
    cycloneInsuredPoints.push({ aep, loss: insuredDamage });
    cycloneUninsuredPoints.push({ aep, loss: uninsuredDamage });
  }

  // Integrate Flood and Cyclone EAL
  const floodGrossEal = integrateExceedanceCurve(floodGrossPoints);
  const floodInsuredEal = integrateExceedanceCurve(floodInsuredPoints);
  const floodUninsuredEal = integrateExceedanceCurve(floodUninsuredPoints);

  const cycloneGrossEal = integrateExceedanceCurve(cycloneGrossPoints);
  const cycloneInsuredEal = integrateExceedanceCurve(cycloneInsuredPoints);
  const cycloneUninsuredEal = integrateExceedanceCurve(cycloneUninsuredPoints);

  // Wildfire and Pluvial Rain EAL (discrete annualized Poisson rate formulation)
  // Annualized rate: ~0.02 annual frequency of a design 50-yr event
  const wildfireIntensity = estimateHazardIntensity('Wildfire', wildfireScore, 50, floodMult).intensity;
  const wildfireDr = calculateDamageRatio('Wildfire', wildfireIntensity, 1.0, config.adaptationThresholdBonus);
  const wildfireGrossEal = Number((asset.replacementValueUsdM * wildfireDr * 0.02).toFixed(5));

  const precipIntensity = estimateHazardIntensity('Extreme Precipitation', precipScore, 50, floodMult).intensity;
  const precipDr = calculateDamageRatio('Extreme Precipitation', precipIntensity, 1.0, config.adaptationThresholdBonus);
  const precipGrossEal = Number((asset.replacementValueUsdM * precipDr * 0.03).toFixed(5));

  const coastalSurgeIntensity = estimateHazardIntensity('Coastal Flooding', slrScore, 50, coastalMult).intensity;
  const coastalSurgeDr = calculateDamageRatio('Coastal Flooding', coastalSurgeIntensity, 1.0, config.adaptationThresholdBonus);
  const coastalSurgeGrossEal = Number((asset.replacementValueUsdM * coastalSurgeDr * 0.02).toFixed(5));

  // Chronic Peril Annual Impacts (Deterministic transmission to revenue & maintenance)
  const heatIntensity = estimateHazardIntensity('Heat Stress', heatScore, 1, heatMult).intensity;
  const heatDr = calculateDamageRatio('Heat Stress', heatIntensity);
  const heatChronicLoss = Number((asset.replacementValueUsdM * heatDr * 0.015).toFixed(5));

  const droughtIntensity = estimateHazardIntensity('Drought', droughtScore, 1, droughtMult).intensity;
  const droughtDr = calculateDamageRatio('Drought', droughtIntensity);
  const droughtChronicLoss = Number((asset.replacementValueUsdM * droughtDr * 0.012).toFixed(5));

  const waterIntensity = estimateHazardIntensity('Water Stress', waterScore, 1, waterMult).intensity;
  const waterDr = calculateDamageRatio('Water Stress', waterIntensity);
  const waterChronicLoss = Number((asset.replacementValueUsdM * waterDr * 0.018).toFixed(5));

  const slrIntensity = estimateHazardIntensity('Sea-level Rise', slrScore, 1, coastalMult).intensity;
  const slrDr = calculateDamageRatio('Sea-level Rise', slrIntensity);
  const slrChronicLoss = Number((asset.replacementValueUsdM * slrDr * 0.02).toFixed(5));

  const totalChronicLoss = Number((heatChronicLoss + droughtChronicLoss + waterChronicLoss + slrChronicLoss).toFixed(4));

  // Total Gross Acute EAL
  const totalGrossAcuteEal = floodGrossEal + cycloneGrossEal + wildfireGrossEal + precipGrossEal + coastalSurgeGrossEal;
  const totalInsuredAcuteEal = floodInsuredEal + cycloneInsuredEal + (wildfireGrossEal + precipGrossEal) * 0.75;
  const totalUninsuredAcuteEal = Math.max(0, totalGrossAcuteEal - totalInsuredAcuteEal);

  // Business Interruption EAL:
  // Using 100-yr flood damage ratio as representative downtime trigger
  const rep100YrDamageRatio = floodExceedanceCurve.find(p => p.returnPeriodYears === 100)?.damageRatio ?? 0.2;
  const biResult = calculateBusinessInterruption(
    asset,
    rep100YrDamageRatio,
    company.revenueUsdM,
    company.ebitdaUsdM > 0 ? (company.ebitdaUsdM / company.revenueUsdM) * 100 : 15,
    company.totalAssetReplacementValueUsdM,
    14,
    180
  );
  // Annualized BI loss = BI(100yr) * 0.01 + BI(25yr) * 0.04
  const biEal = Number((biResult.netBiLossUsdM * 0.025).toFixed(4));

  const totalExpectedAnnualLossUsdM = Number((totalUninsuredAcuteEal + biEal + totalChronicLoss).toFixed(4));
  const lossRatePct = asset.replacementValueUsdM > 0
    ? Number(((totalExpectedAnnualLossUsdM / asset.replacementValueUsdM) * 100).toFixed(3))
    : 0.0;

  const perilBreakdown: Record<SpecificPhysicalHazard, number> = {
    'River Flooding': Number(floodGrossEal.toFixed(4)),
    'Coastal Flooding': Number(coastalSurgeGrossEal.toFixed(4)),
    'Tropical Cyclone': Number(cycloneGrossEal.toFixed(4)),
    'Wildfire': Number(wildfireGrossEal.toFixed(4)),
    'Extreme Precipitation': Number(precipGrossEal.toFixed(4)),
    'Heat Stress': Number(heatChronicLoss.toFixed(4)),
    'Drought': Number(droughtChronicLoss.toFixed(4)),
    'Water Stress': Number(waterChronicLoss.toFixed(4)),
    'Sea-level Rise': Number(slrChronicLoss.toFixed(4))
  };

  return {
    assetId: asset.id,
    assetName: asset.name,
    companyId: asset.companyId,
    companyName: asset.companyName,
    sector: asset.sector,
    country: asset.country,
    assetType: asset.assetType,
    replacementValueUsdM: asset.replacementValueUsdM,
    scenarioId,
    horizon,
    grossEalUsdM: Number(totalGrossAcuteEal.toFixed(4)),
    netInsuredEalUsdM: Number(totalInsuredAcuteEal.toFixed(4)),
    uninsuredEalUsdM: Number(totalUninsuredAcuteEal.toFixed(4)),
    businessInterruptionEalUsdM: biEal,
    totalExpectedAnnualLossUsdM,
    lossRatePct,
    chronicLossUsdM: totalChronicLoss,
    perilBreakdown,
    floodExceedanceCurve,
    cycloneExceedanceCurve
  };
}

/**
 * Aggregates physical losses across the entire portfolio of 100 assets.
 */
export function calculatePortfolioPhysicalLosses(
  assets: PhysicalAsset[],
  companies: Company[],
  scenarioId: ScenarioType,
  horizon: ScenarioHorizon,
  config: ProbabilisticSimulationConfig = DEFAULT_PROBABILISTIC_CONFIG
): {
  assetEals: ExpectedAnnualLossResult[];
  totalReplacementValUsdM: number;
  totalGrossEalUsdM: number;
  totalNetInsuredEalUsdM: number;
  totalUninsuredEalUsdM: number;
  totalBiEalUsdM: number;
  totalChronicEalUsdM: number;
  totalPortfolioEalUsdM: number;
  portfolioLossRatePct: number;
  perilAggregateLosses: Record<SpecificPhysicalHazard, number>;
  countryLosses: Record<string, number>;
  sectorLosses: Record<string, number>;
  highRiskAssetCount: number;
} {
  const companyMap = new Map<string, Company>();
  companies.forEach(c => companyMap.set(c.id, c));

  const assetEals: ExpectedAnnualLossResult[] = [];
  let totalReplacementValUsdM = 0;
  let totalGrossEalUsdM = 0;
  let totalNetInsuredEalUsdM = 0;
  let totalUninsuredEalUsdM = 0;
  let totalBiEalUsdM = 0;
  let totalChronicEalUsdM = 0;
  let totalPortfolioEalUsdM = 0;
  let highRiskAssetCount = 0;

  const perilAggregateLosses: Record<SpecificPhysicalHazard, number> = {
    'River Flooding': 0,
    'Coastal Flooding': 0,
    'Tropical Cyclone': 0,
    'Wildfire': 0,
    'Extreme Precipitation': 0,
    'Heat Stress': 0,
    'Drought': 0,
    'Water Stress': 0,
    'Sea-level Rise': 0
  };

  const countryLosses: Record<string, number> = {};
  const sectorLosses: Record<string, number> = {};

  for (const asset of assets) {
    const company = companyMap.get(asset.companyId) ?? companies[0];
    const eal = calculateAssetEal(asset, company, scenarioId, horizon, config);
    assetEals.push(eal);

    totalReplacementValUsdM += asset.replacementValueUsdM;
    totalGrossEalUsdM += eal.grossEalUsdM;
    totalNetInsuredEalUsdM += eal.netInsuredEalUsdM;
    totalUninsuredEalUsdM += eal.uninsuredEalUsdM;
    totalBiEalUsdM += eal.businessInterruptionEalUsdM;
    totalChronicEalUsdM += eal.chronicLossUsdM;
    totalPortfolioEalUsdM += eal.totalExpectedAnnualLossUsdM;

    if (eal.lossRatePct >= 0.75 || asset.riskTier === 'Critical' || asset.riskTier === 'High') {
      highRiskAssetCount++;
    }

    // Accumulate perils
    for (const [peril, loss] of Object.entries(eal.perilBreakdown) as [SpecificPhysicalHazard, number][]) {
      perilAggregateLosses[peril] += loss;
    }

    countryLosses[asset.country] = (countryLosses[asset.country] ?? 0) + eal.totalExpectedAnnualLossUsdM;
    sectorLosses[asset.sector] = (sectorLosses[asset.sector] ?? 0) + eal.totalExpectedAnnualLossUsdM;
  }

  const portfolioLossRatePct = totalReplacementValUsdM > 0
    ? Number(((totalPortfolioEalUsdM / totalReplacementValUsdM) * 100).toFixed(3))
    : 0.0;

  return {
    assetEals,
    totalReplacementValUsdM: Number(totalReplacementValUsdM.toFixed(2)),
    totalGrossEalUsdM: Number(totalGrossEalUsdM.toFixed(3)),
    totalNetInsuredEalUsdM: Number(totalNetInsuredEalUsdM.toFixed(3)),
    totalUninsuredEalUsdM: Number(totalUninsuredEalUsdM.toFixed(3)),
    totalBiEalUsdM: Number(totalBiEalUsdM.toFixed(3)),
    totalChronicEalUsdM: Number(totalChronicEalUsdM.toFixed(3)),
    totalPortfolioEalUsdM: Number(totalPortfolioEalUsdM.toFixed(3)),
    portfolioLossRatePct,
    perilAggregateLosses,
    countryLosses,
    sectorLosses,
    highRiskAssetCount
  };
}
