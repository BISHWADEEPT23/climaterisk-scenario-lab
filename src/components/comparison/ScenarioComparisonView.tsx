/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  SlidersHorizontal,
  Download,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Calculator,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Company, PhysicalAsset, TimeHorizon, Sector, Country } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import {
  buildReconciledWaterfall,
  calculateRiskDriverAttribution,
  buildScenarioComparisonMatrix,
  WaterfallStep
} from '../../engine/scenarioComparisonEngine';
import { FormulaAuditModal, AuditDetails } from '../dashboard/FormulaAuditModal';

interface ScenarioComparisonViewProps {
  companies: Company[];
  assets: PhysicalAsset[];
  selectedHorizon: TimeHorizon;
  onHorizonChange: (h: TimeHorizon) => void;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  companies,
  assets,
  selectedHorizon,
  onHorizonChange
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('portfolio'); // 'portfolio' or companyId
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeAudit, setActiveAudit] = useState<AuditDetails | null>(null);
  const [sortField, setSortField] = useState<'disorderlyEbitdaImpactPct' | 'disorderlyExpectedLossUsdM' | 'disorderlyPdChangeBps'>('disorderlyEbitdaImpactPct');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [companies, sectorFilter, searchTerm]);

  // Reconciled Waterfall Data for selected entity
  const targetCompaniesForWaterfall = useMemo(() => {
    if (selectedEntityId === 'portfolio') return companies;
    const single = companies.find(c => c.id === selectedEntityId);
    return single ? [single] : companies;
  }, [companies, selectedEntityId]);

  const waterfallSteps: WaterfallStep[] = useMemo(() => {
    return buildReconciledWaterfall(targetCompaniesForWaterfall, 'disorderly', selectedHorizon);
  }, [targetCompaniesForWaterfall, selectedHorizon]);

  // Risk driver attribution breakdown
  const attributionData = useMemo(() => {
    if (selectedEntityId === 'portfolio') {
      let baseEbitda = 0;
      let carbonCost = 0;
      let energyCost = 0;
      let revCost = 0;
      let mitigations = 0;

      companies.forEach(c => {
        const attr = calculateRiskDriverAttribution(c, 'disorderly', selectedHorizon);
        baseEbitda += attr.baselineEbitdaUsdM;
        carbonCost += attr.carbonCostImpactUsdM;
        energyCost += attr.energyCostImpactUsdM;
        revCost += attr.revenueShockImpactUsdM;
        mitigations += attr.mitigationBenefitsUsdM;
      });

      const totalDebits = carbonCost + energyCost + revCost;

      return {
        name: 'Whole Portfolio ($8,695M EAD)',
        carbonCostPct: totalDebits > 0 ? Number(((carbonCost / totalDebits) * 100).toFixed(1)) : 0,
        energyCostPct: totalDebits > 0 ? Number(((energyCost / totalDebits) * 100).toFixed(1)) : 0,
        revenueShockPct: totalDebits > 0 ? Number(((revCost / totalDebits) * 100).toFixed(1)) : 0,
        carbonCostUsdM: Number(carbonCost.toFixed(2)),
        energyCostUsdM: Number(energyCost.toFixed(2)),
        revenueShockUsdM: Number(revCost.toFixed(2)),
        mitigationsUsdM: Number(mitigations.toFixed(2))
      };
    } else {
      const single = companies.find(c => c.id === selectedEntityId) || companies[0];
      const attr = calculateRiskDriverAttribution(single, 'disorderly', selectedHorizon);
      return {
        name: `${single.name.replace(' [Synthetic]', '')} (${single.id})`,
        carbonCostPct: attr.carbonCostPct,
        energyCostPct: attr.energyCostPct,
        revenueShockPct: attr.revenueShockPct,
        carbonCostUsdM: attr.carbonCostImpactUsdM,
        energyCostUsdM: attr.energyCostImpactUsdM,
        revenueShockUsdM: attr.revenueShockImpactUsdM,
        mitigationsUsdM: attr.mitigationBenefitsUsdM
      };
    }
  }, [companies, selectedEntityId, selectedHorizon]);

  // Comparison Matrix Across All Companies
  const matrixRows = useMemo(() => {
    const raw = buildScenarioComparisonMatrix(filteredCompanies, assets, selectedHorizon);
    return raw.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredCompanies, assets, selectedHorizon, sortField, sortAsc]);

  // Export Matrix to CSV
  const handleExportMatrixCSV = () => {
    const headers = [
      'EntityID',
      'EntityName',
      'Sector',
      'Country',
      'EAD_UsdM',
      'Orderly_EBITDA_ImpactPct',
      'Disorderly_EBITDA_ImpactPct',
      'HighWarming_EBITDA_ImpactPct',
      'Orderly_ECL_UsdM',
      'Disorderly_ECL_UsdM',
      'HighWarming_ECL_UsdM',
      'Orderly_PD_ChangeBps',
      'Disorderly_PD_ChangeBps',
      'HighWarming_PD_ChangeBps'
    ];

    const rows = matrixRows.map(r => [
      r.entityId,
      `"${r.entityName}"`,
      r.sector,
      r.country,
      r.eadUsdM,
      r.orderlyEbitdaImpactPct,
      r.disorderlyEbitdaImpactPct,
      r.highWarmingEbitdaImpactPct,
      r.orderlyExpectedLossUsdM,
      r.disorderlyExpectedLossUsdM,
      r.highWarmingExpectedLossUsdM,
      r.orderlyPdChangeBps,
      r.disorderlyPdChangeBps,
      r.highWarmingPdChangeBps
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `scenario_comparison_matrix_${selectedHorizon}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Module 8 — Scenario Comparison
              </span>
              <span className="text-xs text-slate-400 font-mono">Disorderly vs Orderly vs Hot House</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Advanced Multi-Scenario Comparison &amp; Risk Driver Attribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side variance analysis, 100% reconciled financial waterfall, and sequential risk driver decomposition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <span className="px-2 text-slate-400">Horizon:</span>
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

            <button
              onClick={handleExportMatrixCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>

        {/* Target Entity Switcher for Waterfall */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Waterfall View Entity:
            </span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5"
            >
              <option value="portfolio">Entire Portfolio (30 Borrowers, $8,695M EAD)</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name.replace(' [Synthetic]', '')} ({c.sector})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Attribution Methodology: <strong>Deterministic Sequential Ordering</strong> (Carbon → Energy → Revenue → Mitigations)
          </div>
        </div>
      </div>

      {/* Row 2: Reconciled Financial Waterfall & Sequential Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waterfall Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-600" />
                Cent-by-Cent Reconciled Financial Waterfall ({selectedHorizon})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operating EBITDA transmission under Disorderly Transition ($M USD)
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallSteps} margin={{ top: 15, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'USD Millions ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, name, props) => [
                    `$${typeof val === 'number' ? Math.abs(val).toLocaleString() : val}M (Cumulative: $${props.payload.cumulativeUsdM.toLocaleString()}M)`,
                    'Delta'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="amountUsdM" radius={[4, 4, 0, 0]}>
                  {waterfallSteps.map((entry, index) => {
                    let color = '#0284c7';
                    if (entry.type === 'base') color = '#0284c7';
                    if (entry.type === 'negative') color = '#e11d48';
                    if (entry.type === 'positive') color = '#10b981';
                    if (entry.type === 'total') color = '#6366f1';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Driver Attribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            Risk Driver Contribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Relative drag of each transmission channel for {attributionData.name}
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-slate-600 dark:text-slate-300">Carbon Compliance:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  -${attributionData.carbonCostUsdM}M ({attributionData.carbonCostPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${attributionData.carbonCostPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-slate-600 dark:text-slate-300">Energy Tariff Shock:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  -${attributionData.energyCostUsdM}M ({attributionData.energyCostPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${attributionData.energyCostPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-sans text-slate-600 dark:text-slate-300">Revenue Demand Loss:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  -${attributionData.revenueShockUsdM}M ({attributionData.revenueShockPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${attributionData.revenueShockPct}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-sans text-slate-500">
              <span>Verified Mitigations:</span>
              <span className="text-emerald-600 font-mono font-bold">+${attributionData.mitigationsUsdM}M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Scenario Comparison Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cross-Scenario Counterparty Comparison Matrix ({selectedHorizon})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates EBITDA shock (%), Expected Credit Loss ($M), and PD migration across Orderly, Disorderly, and High Warming.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search counterparty or sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Sectors</option>
              <option value="Power Generation">Power Generation</option>
              <option value="Steel">Steel</option>
              <option value="Cement">Cement</option>
              <option value="Automotive">Automotive</option>
              <option value="Commercial Real Estate">Commercial Real Estate</option>
              <option value="Agriculture">Agriculture</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3 font-sans">Entity</th>
                <th className="py-2.5 px-3 font-sans">Sector</th>
                <th className="py-2.5 px-3 text-right">EAD ($M)</th>
                <th className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400">Orderly EBITDA %</th>
                <th
                  onClick={() => {
                    setSortField('disorderlyEbitdaImpactPct');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750"
                >
                  Disorderly EBITDA % {sortField === 'disorderlyEbitdaImpactPct' && (sortAsc ? '▲' : '▼')}
                </th>
                <th className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">High Warming EBITDA %</th>
                <th className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400">Orderly ECL ($M)</th>
                <th
                  onClick={() => {
                    setSortField('disorderlyExpectedLossUsdM');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750"
                >
                  Disorderly ECL ($M) {sortField === 'disorderlyExpectedLossUsdM' && (sortAsc ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => {
                    setSortField('disorderlyPdChangeBps');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right text-purple-600 dark:text-purple-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750"
                >
                  Disorderly ΔPD (bps) {sortField === 'disorderlyPdChangeBps' && (sortAsc ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {matrixRows.map(r => (
                <tr key={r.entityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-sans">
                    <span className="font-semibold text-slate-900 dark:text-white block">{r.entityName}</span>
                    <span className="text-[10px] text-slate-400">{r.entityId} • {r.country}</span>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-500">{r.sector}</td>
                  <td className="py-2 px-3 text-right font-semibold">${r.eadUsdM}M</td>
                  <td className="py-2 px-3 text-right text-teal-600 dark:text-teal-400">{r.orderlyEbitdaImpactPct}%</td>
                  <td className={`py-2 px-3 text-right font-bold ${
                    r.disorderlyEbitdaImpactPct < -15 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {r.disorderlyEbitdaImpactPct}%
                  </td>
                  <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">{r.highWarmingEbitdaImpactPct}%</td>
                  <td className="py-2 px-3 text-right">${r.orderlyExpectedLossUsdM}M</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    ${r.disorderlyExpectedLossUsdM}M
                  </td>
                  <td className="py-2 px-3 text-right text-purple-600 dark:text-purple-400">
                    +{r.disorderlyPdChangeBps} bps
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Audit Modal */}
      <FormulaAuditModal details={activeAudit} onClose={() => setActiveAudit(null)} />
    </div>
  );
};
