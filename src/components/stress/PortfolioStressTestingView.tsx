/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  ShieldAlert,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingDown,
  Layers,
  Building2,
  PieChart as PieIcon
} from 'lucide-react';
import { Company, PhysicalAsset, ScenarioType, TimeHorizon, Sector, Country } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import {
  runPortfolioStressTest,
  calculateCapitalAdequacyImpact,
  solveReverseStressCarbonPrice,
  DEFAULT_CAPITAL_CONFIG
} from '../../engine/portfolioStressEngine';
import { DEFAULT_CREDIT_CONFIG } from '../../engine/creditRiskEngine';

interface PortfolioStressTestingViewProps {
  companies: Company[];
  assets: PhysicalAsset[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
  onScenarioChange: (s: ScenarioType) => void;
  onHorizonChange: (h: TimeHorizon) => void;
}

export const PortfolioStressTestingView: React.FC<PortfolioStressTestingViewProps> = ({
  companies,
  assets,
  selectedScenarioId,
  selectedHorizon,
  onScenarioChange,
  onHorizonChange
}) => {
  // Scenario & Sensitivity Driver Overrides
  const [logitSensitivity, setLogitSensitivity] = useState<number>(1.25);
  const [collateralHaircut, setCollateralHaircut] = useState<number>(0.35);
  const [ccfPct, setCcfPct] = useState<number>(50);

  // Reverse Stress Solver Controls
  const [targetCet1Threshold, setTargetCet1Threshold] = useState<number>(10.5);
  const [reverseStressResult, setReverseStressResult] = useState<any>(null);
  const [isSolving, setIsSolving] = useState(false);

  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;

  // Run portfolio stress test
  const { summary: stressSummary, companyResults } = useMemo(() => {
    return runPortfolioStressTest(companies, assets, selectedScenarioId, selectedHorizon, {
      ...DEFAULT_CREDIT_CONFIG,
      logitSensitivityFactor: logitSensitivity,
      collateralHaircutSensitivity: collateralHaircut,
      creditConversionFactorPct: ccfPct
    });
  }, [companies, assets, selectedScenarioId, selectedHorizon, logitSensitivity, collateralHaircut, ccfPct]);

  // Compute Capital Adequacy Impact
  const capitalImpact = useMemo(() => {
    const baseAvgPd = companyResults.reduce((s, c) => s + c.baselinePdPct, 0) / companyResults.length;
    const stressedAvgPd = companyResults.reduce((s, c) => s + c.stressedPdPct, 0) / companyResults.length;
    return calculateCapitalAdequacyImpact(stressSummary, baseAvgPd, stressedAvgPd, DEFAULT_CAPITAL_CONFIG);
  }, [stressSummary, companyResults]);

  // Handle Reverse Stress Solve
  const handleSolveReverseStress = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = solveReverseStressCarbonPrice(companies, assets, targetCet1Threshold, selectedHorizon);
      setReverseStressResult(res);
      setIsSolving(false);
    }, 150);
  };

  // Staging breakdown for Donut Chart
  const stagingData = useMemo(() => {
    return [
      { name: 'Stage 1 (Performing)', value: stressSummary.stage1EadUsdM, color: '#0d9488' },
      { name: 'Stage 2 (SICR)', value: stressSummary.stage2EadUsdM, color: '#f59e0b' },
      { name: 'Stage 3 (Impaired)', value: stressSummary.stage3EadUsdM, color: '#e11d48' }
    ];
  }, [stressSummary]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Regulatory Notice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Module 7 — Portfolio Stress Testing
              </span>
              <span className="text-xs text-slate-400 font-mono">Basel III / IFRS 9 Framework</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Portfolio Credit Stress Testing &amp; Capital Adequacy Solver
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregates borrower Expected Credit Loss (ECL), Stage 2 SICR migrations, RWA density shifts, and reverse stress thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedScenarioId}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioType)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2"
            >
              <option value="orderly">Orderly (Net Zero 2050)</option>
              <option value="disorderly">Disorderly (Delayed Shock)</option>
              <option value="high_warming">High Warming (&gt;3°C)</option>
              <option value="baseline">Baseline (Current Policies)</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono">
              {[2025, 2030, 2035, 2040, 2050].map(h => (
                <button
                  key={h}
                  onClick={() => onHorizonChange(h as TimeHorizon)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedHorizon === h
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure Badge */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Methodology Notice: <em>Illustrative Capital Adequacy Sensitivity — Not a Regulatory Stress Test</em>
          </span>
          <span className="font-mono text-[11px]">
            Starting CET1 Capital: $1,250M • Starting RWA: $9,800M
          </span>
        </div>
      </div>

      {/* KPI Cards Row (Portfolio Expected Loss & Capital) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Stressed Expected Loss */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Stressed Expected Loss (ECL)
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            ${stressSummary.stressedExpectedLossUsdM.toLocaleString()}M
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Baseline: ${stressSummary.baselineExpectedLossUsdM.toLocaleString()}M (+${stressSummary.incrementalExpectedLossUsdM.toLocaleString()}M)
          </span>
        </div>

        {/* KPI 2: Expected Loss Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Portfolio Loss Rate
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stressSummary.stressedLossRateBps} <span className="text-xs font-normal text-slate-400 font-sans">bps</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Baseline: {stressSummary.baselineLossRateBps} bps (EAD: ${stressSummary.totalEadUsdM.toLocaleString()}M)
          </span>
        </div>

        {/* KPI 3: Stage 2 Migration Share */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            IFRS 9 Stage 2 SICR Exposure
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {stressSummary.stage2EadSharePct}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            ${stressSummary.stage2EadUsdM.toLocaleString()}M Lifetime ECL Bound
          </span>
        </div>

        {/* KPI 4: Stressed CET1 Ratio */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Stressed CET1 Ratio
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            capitalImpact.isBreached ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {capitalImpact.stressedCet1RatioPct}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Depletion: -{capitalImpact.cet1DepletionBps} bps ({capitalImpact.isBreached ? 'Breached' : 'Adequate'})
          </span>
        </div>
      </div>

      {/* Row 2: Sensitivity Drivers & Reverse Stress Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Sensitivity Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            Credit Stress Driver Controls
          </h3>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">PD Logit Sensitivity Factor</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{logitSensitivity}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={logitSensitivity}
              onChange={(e) => setLogitSensitivity(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Scales PD migration relative to EBITDA loss.</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Collateral Haircut Sensitivity</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{collateralHaircut}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={collateralHaircut}
              onChange={(e) => setCollateralHaircut(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Physical peril discount applied to asset recoveries.</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Credit Conversion Factor (CCF)</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{ccfPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={ccfPct}
              onChange={(e) => setCcfPct(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">% drawn of committed revolving credit lines.</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => {
                setLogitSensitivity(1.25);
                setCollateralHaircut(0.35);
                setCcfPct(50);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Drivers
            </button>
          </div>
        </div>

        {/* Center & Right: Reverse Stress Testing Solver */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Reverse Stress Testing — Bisection Root Solver
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solves for the critical stress severity that depletes portfolio CET1 capital to regulatory minimum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target CET1 Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="7.0"
                max="12.5"
                value={targetCet1Threshold}
                onChange={(e) => setTargetCet1Threshold(Number(e.target.value))}
                className="w-full text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-500 mb-1">Search Parameter</span>
              <span className="text-xs font-mono font-semibold text-teal-600 block py-1.5">
                Carbon Price ($/tCO2e)
              </span>
            </div>

            <div>
              <button
                onClick={handleSolveReverseStress}
                disabled={isSolving}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSolving ? 'Solving Bisection...' : 'Run Reverse Stress Solver'}</span>
              </button>
            </div>
          </div>

          {/* Solver Result Card */}
          {reverseStressResult && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-teal-300">Bisection Solver Solution Record</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  reverseStressResult.isConverged ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {reverseStressResult.isConverged ? 'CONVERGED' : 'UNACHIEVABLE'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block font-sans">Critical Carbon Price:</span>
                  <span className="text-sm font-bold text-white">
                    {reverseStressResult.criticalThresholdValue !== null
                      ? `$${reverseStressResult.criticalThresholdValue}/tCO2e`
                      : 'N/A (> $1,200/t)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Baseline CET1 Ratio:</span>
                  <span className="text-sm font-bold text-slate-200">{reverseStressResult.baselineCet1RatioPct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Target Threshold:</span>
                  <span className="text-sm font-bold text-rose-400">{reverseStressResult.targetCet1ThresholdPct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Bisection Iterations:</span>
                  <span className="text-sm font-bold text-teal-300">{reverseStressResult.iterationsRun} runs</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-2 pt-2 border-t border-slate-800 leading-relaxed">
                {reverseStressResult.solverNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Charts (Sector Expected Loss & IFRS 9 Staging Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sector Expected Loss Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Sector Expected Credit Loss (ECL) Breakdown ($M)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stressed credit loss per sector at {selectedHorizon}
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressSummary.sectorBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="sector" tick={{ fontSize: 10.5, fill: '#64748b' }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'ECL ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`$${typeof val === 'number' ? val.toLocaleString() : val}M`, 'Stressed Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="stressedLossUsdM" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: IFRS 9 Staging Portfolio Allocation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-500" />
                IFRS 9 Staged Exposure Allocation ($M EAD)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stage 1 (12-Month ECL) vs Stage 2 (Lifetime SICR) vs Stage 3 (Default)
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stagingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name?.split(' ')[0] ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {stagingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`$${typeof val === 'number' ? val.toLocaleString() : val}M EAD`, 'Exposure']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Risk Contributors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Top Portfolio Climate Credit Risk Contributors
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Counterparties driving the largest share of incremental expected loss under {scenario.name} ({selectedHorizon})
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-sans">Counterparty</th>
                <th className="py-2.5 px-4 font-sans">Sector</th>
                <th className="py-2.5 px-4 text-right">EAD ($M)</th>
                <th className="py-2.5 px-4 text-right">Incremental ECL ($M)</th>
                <th className="py-2.5 px-4 text-right">Share of Stressed Delta (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {stressSummary.topRiskContributors.map((c, i) => (
                <tr key={c.companyId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    {i + 1}. {c.companyName} <span className="text-slate-400 text-[10px]">({c.companyId})</span>
                  </td>
                  <td className="py-2.5 px-4 font-sans">{c.sector}</td>
                  <td className="py-2.5 px-4 text-right">${c.eadUsdM}M</td>
                  <td className="py-2.5 px-4 text-right text-rose-600 dark:text-rose-400 font-bold">
                    +${c.incrementalLossUsdM}M
                  </td>
                  <td className="py-2.5 px-4 text-right text-teal-600 dark:text-teal-400 font-bold">
                    {c.contributionPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
