/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Layers,
  Download,
  Calendar,
  Building2,
  ShieldAlert,
  Info,
  Clock,
  Zap,
  Leaf
} from 'lucide-react';
import { Company, ScenarioType, TimeHorizon, Sector } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { projectCompanyFinancials, DEFAULT_FINANCIAL_CONFIG } from '../../engine/financialProjection';

interface FinancialImpactViewProps {
  companies: Company[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
  onScenarioChange: (s: ScenarioType) => void;
}

export const FinancialImpactView: React.FC<FinancialImpactViewProps> = ({
  companies,
  selectedScenarioId,
  selectedHorizon,
  onScenarioChange
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0].id);
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [taxRateOverride, setTaxRateOverride] = useState<number>(25);

  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => sectorFilter === 'All' || c.sector === sectorFilter);
  }, [companies, sectorFilter]);

  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || filteredCompanies[0] || companies[0];
  }, [companies, selectedCompanyId, filteredCompanies]);

  const financialSummary = useMemo(() => {
    return projectCompanyFinancials(activeCompany, scenario, {
      ...DEFAULT_FINANCIAL_CONFIG,
      corporateTaxRatePct: taxRateOverride
    });
  }, [activeCompany, scenario, taxRateOverride]);

  const projections = financialSummary.projections;
  const p2024 = projections[0];
  const pSelected = projections.find(p => p.year === selectedHorizon) || projections[projections.length - 1];
  const p2050 = projections[projections.length - 1];

  // CSV Export for multi-year financial statements
  const handleExportFinancials = () => {
    const headers = [
      'Year',
      'IsHistoricalBaseline',
      'BaselineRevenueUsdM',
      'ProjectedRevenueUsdM',
      'RevenueShockPct',
      'BaselineOpexUsdM',
      'CarbonCostUsdM',
      'EnergyCostUsdM',
      'GreenSavingsUsdM',
      'AdjustedOpexUsdM',
      'BaselineEbitdaUsdM',
      'AdjustedEbitdaUsdM',
      'AdjustedMarginPct',
      'DAndAUsdM',
      'EbitUsdM',
      'TaxUsdM',
      'TotalCapexUsdM',
      'BaselineFcffUsdM',
      'AdjustedFcffUsdM',
      'TotalDebtUsdM',
      'DSCR'
    ];

    const rows = projections.map(p => [
      p.year,
      p.isHistoricalBaseline,
      p.baselineRevenueUsdM,
      p.projectedRevenueUsdM,
      p.revenueShockPct,
      p.baselineOpexUsdM,
      p.incrementalCarbonCostUsdM,
      p.incrementalEnergyCostUsdM,
      p.verifiedOpexSavingsUsdM,
      p.totalAdjustedOpexUsdM,
      p.baselineEbitdaUsdM,
      p.adjustedEbitdaUsdM,
      p.adjustedMarginPct,
      p.depreciationAndAmortizationUsdM,
      p.ebitUsdM,
      p.taxExpenseUsdM,
      p.totalCapexUsdM,
      p.baselineFcffUsdM,
      p.climateAdjustedFcffUsdM,
      p.totalDebtUsdM,
      p.debtServiceCoverageRatio
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${activeCompany.id}_financial_projections_2024_2050.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Corporate Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Module 6 — Financial Impact Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">2024–2050 Multi-Year Projections</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Corporate Multi-Year Financial Statements &amp; Cash Flow Modelling
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulates revenue shocks, carbon and energy cost transmission, CapEx decarbonization retrofits, FCFF, and DSCR covenants.
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

            <button
              onClick={handleExportFinancials}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Projections CSV</span>
            </button>
          </div>
        </div>

        {/* Corporate Selector Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="w-48">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Sector Filter
              </label>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Sectors ({companies.length})</option>
                <option value="Power Generation">Power Generation</option>
                <option value="Steel">Steel</option>
                <option value="Cement">Cement</option>
                <option value="Automotive">Automotive</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <div className="flex-1 min-w-[240px]">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Target Corporate Borrower
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200"
              >
                {filteredCompanies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.name.replace(' [Synthetic]', '')} ({c.sector}, {c.country})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>Scope 1+2: <strong>{(activeCompany.scope1Tco2e + activeCompany.scope2Tco2e).toLocaleString()} tCO2e</strong></div>
            <div>Baseline Debt: <strong>${activeCompany.totalDebtUsdM}M</strong></div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            FY2024 Baseline Revenue
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ${p2024.projectedRevenueUsdM.toLocaleString()}M
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            2050 Projected: ${p2050.projectedRevenueUsdM.toLocaleString()}M
          </span>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            EBITDA Margin Shift
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 flex items-baseline gap-1.5">
            <span>{pSelected.adjustedMarginPct}%</span>
            <span className="text-xs font-normal text-slate-400 font-sans">at {selectedHorizon}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Baseline: {p2024.baselineMarginPct}% (Δ{(pSelected.adjustedMarginPct - p2024.baselineMarginPct).toFixed(1)}%)
          </span>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Cumulative Decarb CapEx
          </span>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            ${financialSummary.cumulativeCapexUsdM.toLocaleString()}M
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Discounted FCFF Impact: ${financialSummary.cumulativeFcffImpactUsdM.toLocaleString()}M
          </span>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Minimum Solvency DSCR
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            financialSummary.minDscr < 1.0 ? 'text-rose-600 dark:text-rose-400' :
            financialSummary.minDscr < 1.3 ? 'text-amber-600 dark:text-amber-400' :
            'text-emerald-600 dark:text-emerald-400'
          }`}>
            {financialSummary.minDscr}x
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {financialSummary.minDscr < 1.0 ? 'Breaches Covenant (<1.0x)' : 'Covenant Compliant'}
          </span>
        </div>
      </div>

      {/* Row 2: Charts (Revenue & EBITDA Trajectory + FCFF Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue & EBITDA Projection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Revenue &amp; Adjusted EBITDA Dynamics (2024–2050)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                USD Millions ($M) under {scenario.name}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              FY2024 Baseline = Historical
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'USD Millions ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name) => [`$${typeof val === 'number' ? val.toLocaleString() : val}M`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="projectedRevenueUsdM" name="Projected Revenue ($M)" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="adjustedEbitdaUsdM" name="Adjusted EBITDA ($M)" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="baselineEbitdaUsdM" name="Counterfactual Baseline EBITDA ($M)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Free Cash Flow to Firm (FCFF) Trajectory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Free Cash Flow to Firm (FCFF) Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operating cash flow net of CapEx, D&amp;A, and working capital shifts
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'FCFF ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name) => [`$${typeof val === 'number' ? val.toLocaleString() : val}M`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceLine y={0} stroke="#e11d48" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="climateAdjustedFcffUsdM" name="Stressed FCFF ($M)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="baselineFcffUsdM" name="Baseline FCFF ($M)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: DSCR Solvency & CapEx Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: DSCR Solvency Trajectory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Debt Service Coverage Ratio (DSCR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solvency covenant coverage: (Adjusted EBITDA - Tax) / (Interest + Principal)
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 flex gap-2">
              <span className="text-amber-500 font-semibold">1.3x Warning</span>
              <span className="text-rose-500 font-semibold">1.0x Covenant Breach</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'DSCR Multiple (x)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val) => [`${val}x`, 'DSCR Multiple']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <ReferenceLine y={1.3} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '1.3x Safe Covenant', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={1.0} stroke="#e11d48" strokeDasharray="3 3" label={{ value: '1.0x Default Threshold', fill: '#e11d48', fontSize: 10 }} />
                <Line type="monotone" dataKey="debtServiceCoverageRatio" name="Modelled DSCR" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: CapEx Investments Schedule */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Capital Expenditure Breakdown ($M)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baseline Maintenance CapEx vs Green Decarbonization Investments
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'CapEx ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name) => [`$${typeof val === 'number' ? val.toLocaleString() : val}M`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="baselineCapexUsdM" name="Maintenance CapEx ($M)" stackId="a" fill="#94a3b8" />
                <Bar dataKey="greenCapexUsdM" name="Green Decarb CapEx ($M)" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Annual Projection Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Multi-Year Financial Statements (2024–2050)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Values in USD Millions ($M). Audited FY2024 starting baseline followed by annual scenario projections.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            27 Projection Periods
          </span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 px-3 text-right">Carbon Cost</th>
                <th className="py-2.5 px-3 text-right">Energy Cost</th>
                <th className="py-2.5 px-3 text-right">Adjusted EBITDA</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-right">EBIT</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Total CapEx</th>
                <th className="py-2.5 px-3 text-right">FCFF</th>
                <th className="py-2.5 px-3 text-right">Debt</th>
                <th className="py-2.5 px-3 text-right">DSCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {projections.map(p => (
                <tr
                  key={p.year}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    p.isHistoricalBaseline ? 'bg-teal-500/10 font-bold text-teal-900 dark:text-teal-200' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-sans font-semibold">
                    {p.year} {p.isHistoricalBaseline && <span className="text-[9px] text-teal-600 font-mono">(Base)</span>}
                  </td>
                  <td className="py-2 px-3 text-right">${p.projectedRevenueUsdM}M</td>
                  <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400">
                    {p.incrementalCarbonCostUsdM > 0 ? `-$${p.incrementalCarbonCostUsdM}M` : '$0M'}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">
                    {p.incrementalEnergyCostUsdM > 0 ? `-$${p.incrementalEnergyCostUsdM}M` : '$0M'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                    ${p.adjustedEbitdaUsdM}M
                  </td>
                  <td className="py-2 px-3 text-right">{p.adjustedMarginPct}%</td>
                  <td className="py-2 px-3 text-right">${p.ebitUsdM}M</td>
                  <td className="py-2 px-3 text-right">${p.taxExpenseUsdM}M</td>
                  <td className="py-2 px-3 text-right">${p.totalCapexUsdM}M</td>
                  <td className={`py-2 px-3 text-right font-bold ${
                    p.climateAdjustedFcffUsdM < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    ${p.climateAdjustedFcffUsdM}M
                  </td>
                  <td className="py-2 px-3 text-right">${p.totalDebtUsdM}M</td>
                  <td className={`py-2 px-3 text-right font-bold ${
                    p.debtServiceCoverageRatio < 1.0 ? 'text-rose-600 dark:text-rose-400' :
                    p.debtServiceCoverageRatio < 1.3 ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-800 dark:text-slate-200'
                  }`}>
                    {p.debtServiceCoverageRatio}x
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
