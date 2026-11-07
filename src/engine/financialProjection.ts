/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Multi-Year Corporate Financial Projection Engine
 * Implements full 2024-2050 Income Statement, FCFF, CapEx, and DSCR dynamics.
 * Strictly distinguishes FY2024 historical synthetic baseline from future projections.
 */

import {
  Company,
  ScenarioDefinition,
  ScenarioType,
  TimeHorizon,
  Sector,
  AnnualFinancialProjection,
  CompanyFinancialProjectionSummary,
  DecarbonizationInvestment,
  ClimateFinancialShock
} from '../types/climate';
import { interpolateScenarioForYear } from './scenarioInterpolation';
import { calculateCompanyTransitionImpact } from './transitionRisk';

export interface FinancialProjectionConfig {
  corporateTaxRatePct?: number; // default 25%
  baseDebtInterestRatePct?: number; // default 5.5%
  workingCapitalRatioPct?: number; // default 12% of revenue change
  baselineAnnualGrowthPct?: number; // default 2.5% p.a.
  discountRatePct?: number; // default 7.0% for cumulative discounted FCFF
  enableGreenInvestments?: boolean; // default true
}

export const DEFAULT_FINANCIAL_CONFIG: FinancialProjectionConfig = {
  corporateTaxRatePct: 25.0,
  baseDebtInterestRatePct: 5.5,
  workingCapitalRatioPct: 12.0,
  baselineAnnualGrowthPct: 2.5,
  discountRatePct: 7.0,
  enableGreenInvestments: true
};

/**
 * Calculates sector and scenario-conditioned revenue shocks for an interpolated point
 */
export function calculateClimateRevenueShock(
  company: Company,
  year: number,
  scenarioId: ScenarioType,
  carbonPriceUsd: number,
  tempAnomalyCelsius: number
): ClimateFinancialShock {
  if (year <= 2024) {
    return {
      demandReductionPct: 0,
      productSubstitutionPct: 0,
      marketTransitionPct: 0,
      operationalDisruptionPct: 0,
      lowCarbonOpportunityPct: 0,
      netRevenueShockPct: 0
    };
  }

  let demandReduction = 0;
  let productSubstitution = 0;
  let marketTransition = 0;
  let operationalDisruption = 0;
  let lowCarbonOpportunity = 0;

  // Sector-specific climate sensitivity factors
  const carbonPriceFactor = Math.min(1.0, carbonPriceUsd / 300); // 0 to 1 scaling
  const physicalWarmingFactor = Math.max(0, (tempAnomalyCelsius - 1.2) / 1.5); // 0 to 1 scaling above 1.2°C

  switch (company.sector) {
    case 'Power Generation':
      // Fossil generators face demand loss to renewables; green generators capture market
      demandReduction = carbonPriceFactor * 14.0;
      productSubstitution = carbonPriceFactor * 8.0;
      marketTransition = carbonPriceFactor * 5.0;
      lowCarbonOpportunity = (1 - company.carbonCoveragePct / 100) * 12.0;
      break;

    case 'Steel':
      // High carbon steel loses demand to circular scrap and low-emission DRI
      demandReduction = carbonPriceFactor * 10.0;
      productSubstitution = carbonPriceFactor * 9.0;
      marketTransition = carbonPriceFactor * 4.0;
      lowCarbonOpportunity = carbonPriceFactor * 5.0;
      break;

    case 'Cement':
      // Clinker substitution and green building standards
      demandReduction = carbonPriceFactor * 9.0;
      productSubstitution = carbonPriceFactor * 7.0;
      marketTransition = carbonPriceFactor * 3.5;
      lowCarbonOpportunity = carbonPriceFactor * 4.0;
      break;

    case 'Automotive':
      // ICE vehicle ban mandates shift revenue rapidly to EVs
      demandReduction = carbonPriceFactor * 6.0;
      productSubstitution = carbonPriceFactor * 15.0;
      marketTransition = carbonPriceFactor * 6.0;
      lowCarbonOpportunity = carbonPriceFactor * 18.0; // EV market expansion
      break;

    case 'Commercial Real Estate':
      // Energy efficiency tenancy flight and brown discounts
      demandReduction = carbonPriceFactor * 4.0;
      productSubstitution = carbonPriceFactor * 5.0;
      marketTransition = carbonPriceFactor * 3.0;
      lowCarbonOpportunity = carbonPriceFactor * 6.0;
      break;

    case 'Agriculture':
      // Severe physical weather disruption combined with land-use policies
      demandReduction = carbonPriceFactor * 5.0;
      productSubstitution = carbonPriceFactor * 4.0;
      marketTransition = carbonPriceFactor * 3.0;
      operationalDisruption = physicalWarmingFactor * 14.0;
      lowCarbonOpportunity = carbonPriceFactor * 4.0;
      break;
  }

  // Physical operational disruptions scale in high warming scenarios
  if (tempAnomalyCelsius > 1.5) {
    operationalDisruption += physicalWarmingFactor * 6.0;
  }

  // Net combined revenue shock (capped between -50% and +20%)
  const rawNet = -demandReduction - productSubstitution - marketTransition - operationalDisruption + lowCarbonOpportunity;
  const netRevenueShockPct = Number(Math.max(-50, Math.min(25, rawNet)).toFixed(2));

  return {
    demandReductionPct: Number(demandReduction.toFixed(2)),
    productSubstitutionPct: Number(productSubstitution.toFixed(2)),
    marketTransitionPct: Number(marketTransition.toFixed(2)),
    operationalDisruptionPct: Number(operationalDisruption.toFixed(2)),
    lowCarbonOpportunityPct: Number(lowCarbonOpportunity.toFixed(2)),
    netRevenueShockPct
  };
}

/**
 * Builds deterministic decarbonization investments for a company
 */
export function getCompanyDecarbonizationInvestments(company: Company): DecarbonizationInvestment[] {
  const investments: DecarbonizationInvestment[] = [];
  const baseSize = company.revenueUsdM * 0.04; // 4% of revenue

  // Investment 1: Energy Efficiency & Heat Recovery (2026)
  investments.push({
    id: `INV-${company.id}-01`,
    companyId: company.id,
    name: `${company.sector} Thermal & Electric Efficiency Modernization`,
    category: 'Energy Efficiency',
    implementationYear: 2026,
    usefulLifeYears: 15,
    initialCapexUsdM: Number((baseSize * 1.2).toFixed(2)),
    annualOpexSavingsUsdM: Number((baseSize * 0.18).toFixed(2)),
    annualEmissionsReductionTco2e: Math.round(company.scope1Tco2e * 0.08),
    annualDepreciationUsdM: Number(((baseSize * 1.2) / 15).toFixed(2)),
    debtFinancingSharePct: 60,
    interestRatePct: 4.8,
    isPositiveNpv: true
  });

  // Investment 2: Renewable Power Purchase & Onsite Solar (2028)
  investments.push({
    id: `INV-${company.id}-02`,
    companyId: company.id,
    name: 'Zero-Carbon Power Offtake & Distributed Array',
    category: 'Renewable Electricity',
    implementationYear: 2028,
    usefulLifeYears: 20,
    initialCapexUsdM: Number((baseSize * 1.8).toFixed(2)),
    annualOpexSavingsUsdM: Number((baseSize * 0.22).toFixed(2)),
    annualEmissionsReductionTco2e: Math.round(company.scope2Tco2e * 0.45),
    annualDepreciationUsdM: Number(((baseSize * 1.8) / 20).toFixed(2)),
    debtFinancingSharePct: 70,
    interestRatePct: 4.5,
    isPositiveNpv: true
  });

  // Investment 3: Deep Process Abatement / Fuel Switching (2032)
  // Higher capital drag, often negative/neutral commercial NPV under low carbon prices
  investments.push({
    id: `INV-${company.id}-03`,
    companyId: company.id,
    name: 'Industrial Fuel Switching & Electrification Retrofit',
    category: 'Industrial Electrification',
    implementationYear: 2032,
    usefulLifeYears: 18,
    initialCapexUsdM: Number((baseSize * 2.5).toFixed(2)),
    annualOpexSavingsUsdM: Number((baseSize * 0.12).toFixed(2)), // Lower immediate savings
    annualEmissionsReductionTco2e: Math.round(company.scope1Tco2e * 0.25),
    annualDepreciationUsdM: Number(((baseSize * 2.5) / 18).toFixed(2)),
    debtFinancingSharePct: 50,
    interestRatePct: 5.2,
    isPositiveNpv: false // Negative commercial NPV if carbon price is low
  });

  return investments;
}

/**
 * Projects complete annual financial statement from 2024 to 2050 for a company
 */
export function projectCompanyFinancials(
  company: Company,
  scenario: ScenarioDefinition,
  config: FinancialProjectionConfig = DEFAULT_FINANCIAL_CONFIG
): CompanyFinancialProjectionSummary {
  const taxRate = (config.corporateTaxRatePct ?? 25.0) / 100;
  const baseDebtRate = (config.baseDebtInterestRatePct ?? 5.5) / 100;
  const baseGrowthRate = (config.baselineAnnualGrowthPct ?? 2.5) / 100;
  const workingCapitalRatio = (config.workingCapitalRatioPct ?? 12.0) / 100;
  const discountRate = (config.discountRatePct ?? 7.0) / 100;

  const investments = config.enableGreenInvestments !== false ? getCompanyDecarbonizationInvestments(company) : [];

  const projections: AnnualFinancialProjection[] = [];

  let prevProjectedRevenue = company.revenueUsdM;
  let prevBaselineRevenue = company.revenueUsdM;
  let currentDebt = company.totalDebtUsdM;
  let cumulativeFcffImpact = 0;
  let cumulativeCapex = 0;
  let minDscr = 999;

  for (let year = 2024; year <= 2050; year++) {
    const isHistorical = year === 2024;

    if (isHistorical) {
      // FY2024 Historical Baseline
      const baselineRev = company.revenueUsdM;
      const baselineEbitda = company.ebitdaUsdM;
      const baselineOpex = baselineRev - baselineEbitda;
      const dAndA = Number((company.totalAssetReplacementValueUsdM * 0.05).toFixed(2));
      const ebit = baselineEbitda - dAndA;
      const taxExpense = Math.max(0, ebit * taxRate);
      const baselineCapex = Number((baselineRev * 0.045).toFixed(2));
      const baselineFcff = Number((ebit * (1 - taxRate) + dAndA - baselineCapex).toFixed(2));
      const interestExp = Number((currentDebt * baseDebtRate).toFixed(2));
      const principalRepayment = Number((currentDebt / 15).toFixed(2));
      const dscr = Number(((baselineEbitda - taxExpense) / Math.max(1, interestExp + principalRepayment)).toFixed(2));

      minDscr = Math.min(minDscr, dscr);

      projections.push({
        year: 2024,
        isHistoricalBaseline: true,
        baselineRevenueUsdM: baselineRev,
        projectedRevenueUsdM: baselineRev,
        revenueShockPct: 0,
        baselineOpexUsdM: baselineOpex,
        incrementalCarbonCostUsdM: 0,
        incrementalEnergyCostUsdM: 0,
        otherClimateOpexUsdM: 0,
        verifiedOpexSavingsUsdM: 0,
        totalAdjustedOpexUsdM: baselineOpex,
        baselineEbitdaUsdM: baselineEbitda,
        adjustedEbitdaUsdM: baselineEbitda,
        ebitdaChangePct: 0,
        baselineMarginPct: Number(((baselineEbitda / baselineRev) * 100).toFixed(2)),
        adjustedMarginPct: Number(((baselineEbitda / baselineRev) * 100).toFixed(2)),
        depreciationAndAmortizationUsdM: dAndA,
        ebitUsdM: ebit,
        taxExpenseUsdM: taxExpense,
        effectiveTaxRatePct: taxRate * 100,
        baselineCapexUsdM: baselineCapex,
        greenCapexUsdM: 0,
        totalCapexUsdM: baselineCapex,
        changeInNetWorkingCapitalUsdM: 0,
        baselineFcffUsdM: baselineFcff,
        climateAdjustedFcffUsdM: baselineFcff,
        incrementalFcffDeltaUsdM: 0,
        cumulativeFcffImpactUsdM: 0,
        totalDebtUsdM: currentDebt,
        interestExpenseUsdM: interestExp,
        debtServiceCoverageRatio: dscr,
        remainingScope1Tco2e: company.scope1Tco2e,
        remainingScope2Tco2e: company.scope2Tco2e
      });
      continue;
    }

    // Future Projections (2025 to 2050)
    const scenarioPoint = interpolateScenarioForYear(scenario, year);

    // 1. Revenue Dynamics
    // Baseline counterfactual revenue grows at modest historical rate
    const baselineRev = Number((prevBaselineRevenue * (1 + baseGrowthRate)).toFixed(2));
    prevBaselineRevenue = baselineRev;

    // Climate revenue shock
    const shock = calculateClimateRevenueShock(
      company,
      year,
      scenario.id,
      scenarioPoint.carbonPriceUsd,
      scenarioPoint.tempAnomalyCelsius
    );
    const climateShockFactor = shock.netRevenueShockPct / 100;
    
    // Projected revenue = prev * [1 + baseGrowth + climateShock]
    // Clamped so company revenue cannot fall below 5% of base
    const rawProjectedRev = prevProjectedRevenue * (1 + baseGrowthRate + climateShockFactor);
    const projectedRev = Number(Math.max(company.revenueUsdM * 0.05, rawProjectedRev).toFixed(2));
    prevProjectedRevenue = projectedRev;

    // 2. Transition Costs (Reuses Phase 1 engine cleanly)
    const transitionImpact = calculateCompanyTransitionImpact(company, scenarioPoint);
    const absorbedCarbonCostUsdM = transitionImpact.carbonCostAbsorbedUsdM;
    const incrementalEnergyCostUsdM = transitionImpact.incrementalEnergyCostUsdM;

    // 3. Decarbonization Investments & OpEx Savings active in this year
    let activeGreenCapex = 0;
    let activeOpexSavings = 0;
    let activeGreenDepreciation = 0;
    let activeGreenDebtIssued = 0;
    let abatedScope1 = 0;
    let abatedScope2 = 0;

    investments.forEach(inv => {
      // Initial CapEx in implementation year
      if (inv.implementationYear === year) {
        activeGreenCapex += inv.initialCapexUsdM;
        activeGreenDebtIssued += inv.initialCapexUsdM * (inv.debtFinancingSharePct / 100);
      }
      // Ongoing operating savings & depreciation if within useful life
      if (year >= inv.implementationYear && year < inv.implementationYear + inv.usefulLifeYears) {
        activeOpexSavings += inv.annualOpexSavingsUsdM;
        activeGreenDepreciation += inv.annualDepreciationUsdM;
        if (inv.category === 'Renewable Electricity') {
          abatedScope2 += inv.annualEmissionsReductionTco2e;
        } else {
          abatedScope1 += inv.annualEmissionsReductionTco2e;
        }
      }
    });

    cumulativeCapex += activeGreenCapex;

    // 4. Operating Costs & EBITDA
    // Baseline OpEx scales proportionally with baseline revenue
    const baselineOpex = Number((baselineRev * (1 - (company.ebitdaUsdM / company.revenueUsdM))).toFixed(2));
    
    // Total adjusted operating expenses
    const totalAdjustedOpex = Number(
      Math.max(0, baselineOpex + absorbedCarbonCostUsdM + incrementalEnergyCostUsdM - activeOpexSavings).toFixed(2)
    );

    // EBITDA = Projected Revenue - Total Adjusted OpEx
    const adjustedEbitda = Number((projectedRev - totalAdjustedOpex).toFixed(2));
    const baselineEbitda = Number((baselineRev - baselineOpex).toFixed(2));

    const ebitdaChangePct = baselineEbitda !== 0
      ? Number((((adjustedEbitda - baselineEbitda) / Math.abs(baselineEbitda)) * 100).toFixed(2))
      : 0;

    const baselineMargin = baselineRev > 0 ? Number(((baselineEbitda / baselineRev) * 100).toFixed(2)) : 0;
    const adjustedMargin = projectedRev > 0 ? Number(((adjustedEbitda / projectedRev) * 100).toFixed(2)) : 0;

    // 5. Depreciation & Amortization
    const baselineDAndA = Number((company.totalAssetReplacementValueUsdM * 0.05).toFixed(2));
    const totalDAndA = Number((baselineDAndA + activeGreenDepreciation).toFixed(2));

    // 6. EBIT & Tax
    const ebit = Number((adjustedEbitda - totalDAndA).toFixed(2));
    const taxExpense = ebit > 0 ? Number((ebit * taxRate).toFixed(2)) : 0;

    // 7. CapEx & Net Working Capital
    const baselineCapex = Number((baselineRev * 0.045).toFixed(2));
    const totalCapex = Number((baselineCapex + activeGreenCapex).toFixed(2));
    const prevRev = projections[projections.length - 1].projectedRevenueUsdM;
    const deltaNwc = Number(((projectedRev - prevRev) * workingCapitalRatio).toFixed(2));

    // 8. Free Cash Flow to Firm (FCFF)
    // FCFF = EBIT*(1-t) + D&A - CapEx - DeltaNWC
    const climateAdjustedFcff = Number(
      (ebit * (1 - taxRate) + totalDAndA - totalCapex - deltaNwc).toFixed(2)
    );
    const baselineEbit = baselineEbitda - baselineDAndA;
    const baselineFcff = Number(
      (baselineEbit * (1 - taxRate) + baselineDAndA - baselineCapex).toFixed(2)
    );
    const incrementalFcffDelta = Number((climateAdjustedFcff - baselineFcff).toFixed(2));

    // Discounted running cumulative impact
    const discountFactor = Math.pow(1 + discountRate, year - 2024);
    cumulativeFcffImpact += incrementalFcffDelta / discountFactor;

    // 9. Debt & Solvency
    const principalRepayment = Number((currentDebt / 15).toFixed(2));
    currentDebt = Number(Math.max(0, currentDebt + activeGreenDebtIssued - principalRepayment).toFixed(2));
    const interestExp = Number((currentDebt * baseDebtRate).toFixed(2));
    
    // DSCR = (Adjusted EBITDA - Tax) / (Interest + Principal)
    const numerator = Math.max(0, adjustedEbitda - taxExpense);
    const denominator = Math.max(1, interestExp + principalRepayment);
    const dscr = Number((numerator / denominator).toFixed(2));

    minDscr = Math.min(minDscr, dscr);

    // Remaining emissions after abatement
    const remainingScope1 = Math.max(0, company.scope1Tco2e - abatedScope1);
    const remainingScope2 = Math.max(0, company.scope2Tco2e - abatedScope2);

    projections.push({
      year,
      isHistoricalBaseline: false,
      baselineRevenueUsdM: baselineRev,
      projectedRevenueUsdM: projectedRev,
      revenueShockPct: shock.netRevenueShockPct,
      baselineOpexUsdM: baselineOpex,
      incrementalCarbonCostUsdM: absorbedCarbonCostUsdM,
      incrementalEnergyCostUsdM: incrementalEnergyCostUsdM,
      otherClimateOpexUsdM: 0,
      verifiedOpexSavingsUsdM: activeOpexSavings,
      totalAdjustedOpexUsdM: totalAdjustedOpex,
      baselineEbitdaUsdM: baselineEbitda,
      adjustedEbitdaUsdM: adjustedEbitda,
      ebitdaChangePct,
      baselineMarginPct: baselineMargin,
      adjustedMarginPct: adjustedMargin,
      depreciationAndAmortizationUsdM: totalDAndA,
      ebitUsdM: ebit,
      taxExpenseUsdM: taxExpense,
      effectiveTaxRatePct: taxRate * 100,
      baselineCapexUsdM: baselineCapex,
      greenCapexUsdM: activeGreenCapex,
      totalCapexUsdM: totalCapex,
      changeInNetWorkingCapitalUsdM: deltaNwc,
      baselineFcffUsdM: baselineFcff,
      climateAdjustedFcffUsdM: climateAdjustedFcff,
      incrementalFcffDeltaUsdM: incrementalFcffDelta,
      cumulativeFcffImpactUsdM: Number(cumulativeFcffImpact.toFixed(2)),
      totalDebtUsdM: currentDebt,
      interestExpenseUsdM: interestExp,
      debtServiceCoverageRatio: dscr,
      remainingScope1Tco2e: remainingScope1,
      remainingScope2Tco2e: remainingScope2
    });
  }

  const p2050 = projections[projections.length - 1];

  return {
    companyId: company.id,
    companyName: company.name,
    sector: company.sector,
    country: company.country,
    scenarioId: scenario.id,
    projections,
    cumulativeCapexUsdM: Number(cumulativeCapex.toFixed(2)),
    cumulativeFcffImpactUsdM: Number(cumulativeFcffImpact.toFixed(2)),
    terminal2050MarginPct: p2050.adjustedMarginPct,
    minDscr: Number(minDscr.toFixed(2))
  };
}
