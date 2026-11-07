/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Flame,
  Zap,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Company, ScenarioType, TimeHorizon } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { calculateCompanyTransitionImpact } from '../../engine/transitionRisk';

interface TransitionRiskViewProps {
  companies: Company[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
}

export const TransitionRiskView: React.FC<TransitionRiskViewProps> = ({
  companies,
  selectedScenarioId,
  selectedHorizon
}) => {
  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;
  const scenarioPoint = scenario.horizons[selectedHorizon];

  // Interactive what-if controls
  const [simCarbonPrice, setSimCarbonPrice] = useState<number>(scenarioPoint.carbonPriceUsd);
  const [simPowerPrice, setSimPowerPrice] = useState<number>(scenarioPoint.electricityPriceUsdMwh);
  const [simPassThrough, setSimPassThrough] = useState<number>(50);
  const [simSelectedCompanyId, setSimSelectedCompanyId] = useState<string>(companies[0].id);

  // Sync with scenario changes
  React.useEffect(() => {
    setSimCarbonPrice(scenarioPoint.carbonPriceUsd);
    setSimPowerPrice(scenarioPoint.electricityPriceUsdMwh);
  }, [scenarioPoint]);

  const targetCompany = useMemo(() => {
    return companies.find(c => c.id === simSelectedCompanyId) || companies[0];
  }, [companies, simSelectedCompanyId]);

  // Simulated calculation point
  const simScenarioPoint = useMemo(() => {
    return {
      ...scenarioPoint,
      carbonPriceUsd: simCarbonPrice,
      electricityPriceUsdMwh: simPowerPrice
    };
  }, [scenarioPoint, simCarbonPrice, simPowerPrice]);

  // Company impact
  const companyImpact = useMemo(() => {
    return calculateCompanyTransitionImpact(targetCompany, simScenarioPoint, {
      customPassThroughOverridePct: simPassThrough,
      baselineCarbonPriceUsd: 0,
      baselineElectricityPriceUsdMwh: 75.0
    });
  }, [targetCompany, simScenarioPoint, simPassThrough]);

  // Portfolio-wide simulated impacts
  const portfolioImpacts = useMemo(() => {
    let totalGrossCarbonM = 0;
    let totalAbsorbedCarbonM = 0;
    let totalEnergyCostM = 0;
    let totalBaselineEbitdaM = 0;
    let totalAdjustedEbitdaM = 0;

    companies.forEach(c => {
      const imp = calculateCompanyTransitionImpact(c, simScenarioPoint, {
        customPassThroughOverridePct: simPassThrough
      });
      totalGrossCarbonM += imp.grossCarbonCostUsdM;
      totalAbsorbedCarbonM += imp.carbonCostAbsorbedUsdM;
      totalEnergyCostM += imp.incrementalEnergyCostUsdM;
      totalBaselineEbitdaM += c.ebitdaUsdM;
      totalAdjustedEbitdaM += imp.adjustedEbitdaUsdM;
    });

    const netPortfolioEbitdaDeltaM = totalAdjustedEbitdaM - totalBaselineEbitdaM;
    const portfolioEbitdaDeltaPct = totalBaselineEbitdaM !== 0
      ? (netPortfolioEbitdaDeltaM / totalBaselineEbitdaM) * 100
      : 0;

    return {
      totalGrossCarbonM: Number(totalGrossCarbonM.toFixed(1)),
      totalAbsorbedCarbonM: Number(totalAbsorbedCarbonM.toFixed(1)),
      totalEnergyCostM: Number(totalEnergyCostM.toFixed(1)),
      totalBaselineEbitdaM: Number(totalBaselineEbitdaM.toFixed(1)),
      totalAdjustedEbitdaM: Number(totalAdjustedEbitdaM.toFixed(1)),
      netPortfolioEbitdaDeltaM: Number(netPortfolioEbitdaDeltaM.toFixed(1)),
      portfolioEbitdaDeltaPct: Number(portfolioEbitdaDeltaPct.toFixed(2))
    };
  }, [companies, simScenarioPoint, simPassThrough]);

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Phase 1 Calculation Service
              </span>
              <span className="text-xs text-slate-400 font-mono">NGFS Transmission Pipeline</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Transition Risk Financial Transmission Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive sensitivity simulator for direct carbon compliance costs, pass-through dynamics, energy tariffs, and EBITDA transmission.
            </p>
          </div>
          <button
            onClick={() => {
              setSimCarbonPrice(scenarioPoint.carbonPriceUsd);
              setSimPowerPrice(scenarioPoint.electricityPriceUsdMwh);
              setSimPassThrough(50);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Scenario Baseline</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Controls & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sensitivity Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            Stress Drivers & Sensitivities
          </h3>

          {/* Select Target Corporate */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Corporate Borrower
            </label>
            <select
              value={simSelectedCompanyId}
              onChange={(e) => setSimSelectedCompanyId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name.replace(' [Synthetic]', '')} ({c.sector})
                </option>
              ))}
            </select>
          </div>

          {/* Carbon Price Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Carbon Price ($/tCO2e)</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">${simCarbonPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="450"
              step="5"
              value={simCarbonPrice}
              onChange={(e) => setSimCarbonPrice(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$0 (No Action)</span>
              <span>$140 (Orderly 2030)</span>
              <span>$450 (Disorderly 2050)</span>
            </div>
          </div>

          {/* Wholesale Power Price Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Wholesale Electricity ($/MWh)</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${simPowerPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="2"
              value={simPowerPrice}
              onChange={(e) => setSimPowerPrice(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$50/MWh</span>
              <span>$75 (Baseline)</span>
              <span>$200/MWh (Severe Shock)</span>
            </div>
          </div>

          {/* Pass-Through Assumption */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Cost Pass-Through Rate (α)</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{simPassThrough}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simPassThrough}
              onChange={(e) => setSimPassThrough(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Full Absorption)</span>
              <span>50% (Shared)</span>
              <span>100% (Passed to Client)</span>
            </div>
          </div>

          {/* Active Company Metadata Pill */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">{targetCompany.name}</div>
            <div className="text-slate-500">Scope 1+2: {(targetCompany.scope1Tco2e + targetCompany.scope2Tco2e).toLocaleString()} tCO2e</div>
            <div className="text-slate-500">ETS Regulatory Coverage: {targetCompany.carbonCoveragePct}%</div>
            <div className="text-slate-500">Free Allowances: {targetCompany.freeAllowancesPct}%</div>
          </div>
        </div>

        {/* Center & Right: Modelled Company Transmission Trace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transmission Pipeline Diagram */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-600" />
              Traceable Transmission Step-by-Step ({targetCompany.name})
            </h3>

            {/* Visual Formula Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  1. Gross Carbon Cost
                </span>
                <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
                  ${companyImpact.grossCarbonCostUsdM}M
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Covered Scope 1+2 ({(targetCompany.scope1Tco2e * (targetCompany.carbonCoveragePct/100) / 1000).toFixed(0)}k t) × ${simCarbonPrice}/t
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  2. Absorbed Net Cost
                </span>
                <div className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                  ${companyImpact.carbonCostAbsorbedUsdM}M
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  After {targetCompany.freeAllowancesPct}% free allowances &amp; {simPassThrough}% pass-through
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  3. Energy Tariff Uplift
                </span>
                <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                  ${companyImpact.incrementalEnergyCostUsdM}M
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Consumption ({targetCompany.energyConsumptionMwh.toLocaleString()} MWh) × Δ${Math.max(0, simPowerPrice - 75)}/MWh
                </p>
              </div>
            </div>

            {/* Financial Result Summary Table */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                <span>Financial Metric</span>
                <span className="w-24 text-right">Baseline</span>
                <span className="w-24 text-right text-teal-300">Modelled Stress</span>
                <span className="w-24 text-right text-rose-400">Delta</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">Operating EBITDA ($M)</span>
                <span className="w-24 text-right">${targetCompany.ebitdaUsdM.toLocaleString()}M</span>
                <span className="w-24 text-right text-teal-300 font-bold">${companyImpact.adjustedEbitdaUsdM.toLocaleString()}M</span>
                <span className="w-24 text-right text-rose-400 font-bold">{companyImpact.ebitdaChangePct}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">Operating Margin (%)</span>
                <span className="w-24 text-right">{companyImpact.baselineMarginPct}%</span>
                <span className="w-24 text-right text-teal-300 font-bold">{companyImpact.adjustedMarginPct}%</span>
                <span className="w-24 text-right text-rose-400 font-bold">
                  {(companyImpact.adjustedMarginPct - companyImpact.baselineMarginPct).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-800 pt-2">
                <span className="text-slate-300">Annual Probability of Default (PD)</span>
                <span className="w-24 text-right">{companyImpact.baselinePdPct}%</span>
                <span className="w-24 text-right text-rose-400 font-bold">{companyImpact.modelledPdPct}%</span>
                <span className="w-24 text-right text-amber-400 font-bold">+{companyImpact.pdChangeBps} bps</span>
              </div>
            </div>
          </div>

          {/* Portfolio Aggregated Stress Results Under This Simulator Setting */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Whole Portfolio Aggregated Sensitivity</span>
              <span className="text-xs font-mono text-teal-600 font-medium">30 Borrowers ($8,695M Book)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Total Gross Carbon</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${portfolioImpacts.totalGrossCarbonM}M</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Total Absorbed Cost</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">${portfolioImpacts.totalAbsorbedCarbonM}M</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Portfolio EBITDA Shock</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">${portfolioImpacts.netPortfolioEbitdaDeltaM}M</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Portfolio Contraction</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{portfolioImpacts.portfolioEbitdaDeltaPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
