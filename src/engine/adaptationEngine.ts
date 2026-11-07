/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Adaptation Analytics Engine (Phase 3)
 * Evaluates engineered adaptation measures, avoided physical losses, and net present benefit (NPB).
 */

import { SpecificPhysicalHazard, AdaptationMeasure, ExpectedAnnualLossResult } from '../types/climate';

export interface AdaptationMeasureDefinition {
  id: string;
  name: string;
  targetHazard: SpecificPhysicalHazard;
  assetTypeTarget: string;
  description: string;
  unitCostPerAssetUsdM: number;
  annualMaintenancePct: number; // e.g. 3% of capital cost
  usefulLifeYears: number; // e.g. 20-30 years
  protectionStandardIntensity: number; // e.g. 2.5m flood depth, 250mm rain
  damageReductionPct: number; // percentage reduction in residual damage (e.g. 70%)
}

export const STANDARD_ADAPTATION_CATALOG: AdaptationMeasureDefinition[] = [
  {
    id: 'ADAPT-FLOOD-01',
    name: 'Perimeter Flood Wall & Deployable Flood Barriers',
    targetHazard: 'River Flooding',
    assetTypeTarget: 'Industrial / Commercial Facilities',
    description: 'Construct reinforced concrete perimeter flood barrier and automated floodgates rated for 1-in-100 year inundation up to 2.5m depth.',
    unitCostPerAssetUsdM: 1.85,
    annualMaintenancePct: 2.5,
    usefulLifeYears: 25,
    protectionStandardIntensity: 2.5, // 2.5m protection
    damageReductionPct: 75.0 // 75% residual damage reduction
  },
  {
    id: 'ADAPT-COASTAL-01',
    name: 'Armored Coastal Revetment & Storm Surge Gates',
    targetHazard: 'Coastal Flooding',
    assetTypeTarget: 'Coastal Assets & Terminals',
    description: 'Geotextile rock revetment and automated tidal surge gates preventing saline storm inundation up to 2.8m surge height.',
    unitCostPerAssetUsdM: 3.20,
    annualMaintenancePct: 3.0,
    usefulLifeYears: 30,
    protectionStandardIntensity: 2.8,
    damageReductionPct: 80.0
  },
  {
    id: 'ADAPT-WIND-01',
    name: 'Structural Wind Retrofit & Impact-Resistant Cladding',
    targetHazard: 'Tropical Cyclone',
    assetTypeTarget: 'Structural Envelope & Roof Systems',
    description: 'Hurricane straps, reinforced parapet anchors, and high-velocity impact-resistant louvers and window protection rated to 65 m/s gusts.',
    unitCostPerAssetUsdM: 1.40,
    annualMaintenancePct: 2.0,
    usefulLifeYears: 20,
    protectionStandardIntensity: 65.0, // 65 m/s wind threshold
    damageReductionPct: 65.0
  },
  {
    id: 'ADAPT-PRECIP-01',
    name: 'Sustainable Drainage Systems (SuDS) & Retention Sumps',
    targetHazard: 'Extreme Precipitation',
    assetTypeTarget: 'Drainage & Internal Water Ingress',
    description: 'High-capacity stormwater detention basins, pervious pavement retrofits, and high-head submersible pump batteries rated to 250mm/24h.',
    unitCostPerAssetUsdM: 0.95,
    annualMaintenancePct: 3.5,
    usefulLifeYears: 20,
    protectionStandardIntensity: 250.0, // 250mm/24h
    damageReductionPct: 70.0
  },
  {
    id: 'ADAPT-WILDFIRE-01',
    name: 'Defensible Space Buffer & Roof Foam Sprinkler Arrays',
    targetHazard: 'Wildfire',
    assetTypeTarget: 'Facilities in Wildland-Urban Interface (WUI)',
    description: '30-meter cleared fuel-free defensible zone, spark arrestors, Class-A fire-resistant membranes, and rooftop high-pressure foam suppression.',
    unitCostPerAssetUsdM: 0.75,
    annualMaintenancePct: 4.0,
    usefulLifeYears: 15,
    protectionStandardIntensity: 60.0,
    damageReductionPct: 65.0
  },
  {
    id: 'ADAPT-HEAT-01',
    name: 'Industrial HVAC Chillers & High-Albedo Cool Roofs',
    targetHazard: 'Heat Stress',
    assetTypeTarget: 'Industrial Labor & Cooling Systems',
    description: 'Ultra-efficient mechanical cooling, heat-recovery ventilation, and solar-reflective roof coatings mitigating thermal worker fatigue.',
    unitCostPerAssetUsdM: 0.85,
    annualMaintenancePct: 4.5,
    usefulLifeYears: 15,
    protectionStandardIntensity: 35.0,
    damageReductionPct: 60.0
  },
  {
    id: 'ADAPT-WATER-01',
    name: 'Closed-Loop Effluent Recycling & Desalination Polishing',
    targetHazard: 'Water Stress',
    assetTypeTarget: 'Thermal Power & Heavy Processing Facilities',
    description: 'Zero liquid discharge (ZLD) filtration, greywater reclamation, and air-cooled heat exchangers reducing raw river water intake by 70%.',
    unitCostPerAssetUsdM: 2.10,
    annualMaintenancePct: 3.0,
    usefulLifeYears: 20,
    protectionStandardIntensity: 50.0,
    damageReductionPct: 70.0
  }
];

/**
 * Calculates financial returns and Net Present Benefit (NPB) of an adaptation project.
 * NPB = Present Value of Avoided Annual Losses - Present Value of CapEx & OpEx
 */
export function calculateAdaptationEconomics(
  baselineEalUsdM: number,
  measure: AdaptationMeasureDefinition,
  assetCountTargeted: number = 1,
  discountRatePct: number = 6.0
): AdaptationMeasure {
  const capitalCostUsdM = Number((measure.unitCostPerAssetUsdM * assetCountTargeted).toFixed(4));
  const annualMaintenanceCostUsdM = Number((capitalCostUsdM * (measure.annualMaintenancePct / 100)).toFixed(4));

  // Adaptation reduces baseline EAL by damageReductionPct, leaving residual risk
  const avoidedLossAnnualUsdM = Number((baselineEalUsdM * (measure.damageReductionPct / 100)).toFixed(4));
  const adaptedEalUsdM = Number(Math.max(0, baselineEalUsdM - avoidedLossAnnualUsdM).toFixed(4));

  // Net annual operational cash saving = Avoided Physical & BI Loss - Annual Maintenance Cost
  const netAnnualBenefit = avoidedLossAnnualUsdM - annualMaintenanceCostUsdM;

  // Discounted Cash Flow over Useful Life:
  // PV Factor for annuity = [1 - (1 + r)^(-n)] / r
  const r = discountRatePct / 100;
  const n = measure.usefulLifeYears;
  const annuityPvFactor = r > 0 ? (1 - Math.pow(1 + r, -n)) / r : n;

  const presentValueOfBenefits = netAnnualBenefit * annuityPvFactor;
  const netPresentBenefitUsdM = Number((presentValueOfBenefits - capitalCostUsdM).toFixed(3));

  // Benefit-Cost Ratio = PV(Avoided Losses) / (CapEx + PV(Maintenance))
  const pvOfCosts = capitalCostUsdM + annualMaintenanceCostUsdM * annuityPvFactor;
  const pvOfGrossAvoidedLoss = avoidedLossAnnualUsdM * annuityPvFactor;
  const benefitCostRatio = pvOfCosts > 0 ? Number((pvOfGrossAvoidedLoss / pvOfCosts).toFixed(2)) : 1.0;

  // Simple undiscounted payback period (years)
  const paybackYears = netAnnualBenefit > 0
    ? Number(Math.min(99, capitalCostUsdM / netAnnualBenefit).toFixed(1))
    : 99.0;

  return {
    measureId: measure.id,
    name: measure.name,
    targetHazard: measure.targetHazard,
    assetTypeTarget: measure.assetTypeTarget,
    description: measure.description,
    capitalCostUsdM,
    annualMaintenanceCostUsdM,
    usefulLifeYears: measure.usefulLifeYears,
    protectionStandardIntensity: measure.protectionStandardIntensity,
    damageReductionPct: measure.damageReductionPct,
    baselineEalUsdM,
    adaptedEalUsdM,
    avoidedLossAnnualUsdM,
    netPresentBenefitUsdM,
    benefitCostRatio,
    paybackYears
  };
}

/**
 * Evaluates adaptation package across the entire portfolio.
 */
export function evaluatePortfolioAdaptation(
  portfolioAssetEals: ExpectedAnnualLossResult[],
  selectedMeasureIds: string[] = ['ADAPT-FLOOD-01', 'ADAPT-WIND-01', 'ADAPT-PRECIP-01'],
  discountRatePct: number = 6.0
): {
  measures: AdaptationMeasure[];
  totalAdaptationCapexUsdM: number;
  totalAnnualAvoidedLossUsdM: number;
  totalNetPresentBenefitUsdM: number;
  portfolioAdaptedEalUsdM: number;
  averageBcr: number;
} {
  const measures: AdaptationMeasure[] = [];
  let totalAdaptationCapexUsdM = 0;
  let totalAnnualAvoidedLossUsdM = 0;
  let totalNetPresentBenefitUsdM = 0;

  // Group asset EALs by target hazard
  const hazardEalSum: Record<SpecificPhysicalHazard, number> = {
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

  const hazardAssetCounts: Record<SpecificPhysicalHazard, number> = {
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

  for (const a of portfolioAssetEals) {
    for (const [hazard, loss] of Object.entries(a.perilBreakdown) as [SpecificPhysicalHazard, number][]) {
      hazardEalSum[hazard] += loss;
      if (loss > 0.05) {
        hazardAssetCounts[hazard]++;
      }
    }
  }

  const catalog = STANDARD_ADAPTATION_CATALOG.filter(m => selectedMeasureIds.includes(m.id));

  for (const def of catalog) {
    const targetEal = hazardEalSum[def.targetHazard] || 0.5;
    const targetCount = Math.max(1, hazardAssetCounts[def.targetHazard] || 5);

    const result = calculateAdaptationEconomics(targetEal, def, targetCount, discountRatePct);
    measures.push(result);

    totalAdaptationCapexUsdM += result.capitalCostUsdM;
    totalAnnualAvoidedLossUsdM += result.avoidedLossAnnualUsdM;
    totalNetPresentBenefitUsdM += result.netPresentBenefitUsdM;
  }

  const totalBaselineEal = portfolioAssetEals.reduce((sum, a) => sum + a.totalExpectedAnnualLossUsdM, 0);
  const portfolioAdaptedEalUsdM = Math.max(0, totalBaselineEal - totalAnnualAvoidedLossUsdM);
  const averageBcr = measures.length > 0
    ? Number((measures.reduce((sum, m) => sum + m.benefitCostRatio, 0) / measures.length).toFixed(2))
    : 1.0;

  return {
    measures,
    totalAdaptationCapexUsdM: Number(totalAdaptationCapexUsdM.toFixed(3)),
    totalAnnualAvoidedLossUsdM: Number(totalAnnualAvoidedLossUsdM.toFixed(3)),
    totalNetPresentBenefitUsdM: Number(totalNetPresentBenefitUsdM.toFixed(3)),
    portfolioAdaptedEalUsdM: Number(portfolioAdaptedEalUsdM.toFixed(3)),
    averageBcr
  };
}
