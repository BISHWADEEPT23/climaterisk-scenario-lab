/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  MapPin,
  TrendingDown,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Flame,
  Factory,
  X
} from 'lucide-react';
import { Company, PhysicalAsset, ScenarioType, TimeHorizon, Sector, Country } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { calculateCompanyTransitionImpact } from '../../engine/transitionRisk';

interface CorporateExposureViewProps {
  companies: Company[];
  assets: PhysicalAsset[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
}

export const CorporateExposureView: React.FC<CorporateExposureViewProps> = ({
  companies,
  assets,
  selectedScenarioId,
  selectedHorizon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;
  const scenarioPoint = scenario.horizons[selectedHorizon];

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.headquarters.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
      const matchCountry = countryFilter === 'All' || c.country === countryFilter;
      return matchSearch && matchSector && matchCountry;
    });
  }, [companies, searchTerm, sectorFilter, countryFilter]);

  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const activeCompanyImpact = useMemo(() => {
    if (!activeCompany) return null;
    return calculateCompanyTransitionImpact(activeCompany, scenarioPoint);
  }, [activeCompany, scenarioPoint]);

  const activeCompanyAssets = useMemo(() => {
    if (!activeCompany) return [];
    return assets.filter(a => a.companyId === activeCompany.id);
  }, [activeCompany, assets]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company name, ID (e.g. COMP-001), or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Sector Selector */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="All">All Sectors ({companies.length})</option>
            <option value="Power Generation">Power Generation</option>
            <option value="Steel">Steel</option>
            <option value="Cement">Cement</option>
            <option value="Automotive">Automotive</option>
            <option value="Commercial Real Estate">Commercial Real Estate</option>
            <option value="Agriculture">Agriculture</option>
          </select>

          {/* Country Selector */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="All">All Countries</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Japan">Japan</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredCompanies.length}</strong> of {companies.length} synthetic corporate entities
        </div>
      </div>

      {/* Corporate Exposure Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Entity ID & Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Geography</th>
                <th className="py-3 px-4 text-right">Loan EAD ($M)</th>
                <th className="py-3 px-4 text-right">Scope 1+2 (tCO2e)</th>
                <th className="py-3 px-4 text-right">Intensity (t/$M)</th>
                <th className="py-3 px-4 text-right">ETS Cov.</th>
                <th className="py-3 px-4 text-right">Pass-Thru</th>
                <th className="py-3 px-4 text-center">Baseline Rating</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredCompanies.map(c => {
                const totalEmissions = c.scope1Tco2e + c.scope2Tco2e;
                const intensity = c.revenueUsdM > 0 ? Math.round(totalEmissions / c.revenueUsdM) : 0;
                const isSelected = selectedCompanyId === c.id;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-teal-500/5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-500/10 font-medium' : ''
                    }`}
                    onClick={() => setSelectedCompanyId(c.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {c.id}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400">HQ: {c.headquarters}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.sector}
                      </span>
                    </td>
                    <td className="py-3 px-4">{c.country}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ${c.loanExposureUsdM.toLocaleString()}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {totalEmissions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        intensity > 500 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-semibold' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {intensity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{c.carbonCoveragePct}%</td>
                    <td className="py-3 px-4 text-right font-mono">{c.carbonPassThroughPct}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-750 font-mono text-[11px] font-medium">
                        {c.baselineRating} ({c.baselinePdPct}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyId(c.id);
                        }}
                        className="text-teal-600 hover:text-teal-800 dark:text-teal-400 inline-flex items-center gap-1 font-medium"
                      >
                        Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Company Deep Dive Drawer / Modal */}
      {activeCompany && activeCompanyImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold">
                      {activeCompany.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeCompany.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeCompany.sector} • {activeCompany.country} (HQ: {activeCompany.headquarters}) • {activeCompany.dataQuality} Data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanyId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
              {/* Financial Capital Structure Row */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Balance Sheet & Capital Structure (FY2024 Base)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Revenue</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">${activeCompany.revenueUsdM}M</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Baseline EBITDA</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">${activeCompany.ebitdaUsdM}M</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">EVIC (PCAF Denom)</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">${activeCompany.enterpriseValueUsdM}M</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Loan EAD in Book</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">${activeCompany.loanExposureUsdM}M</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">PCAF Attribution</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {((activeCompany.loanExposureUsdM / activeCompany.enterpriseValueUsdM) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Emissions Profile */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Operational GHG Emissions & Regulation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Scope 1 Direct</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{activeCompany.scope1Tco2e.toLocaleString()} t</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Scope 2 Indirect</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{activeCompany.scope2Tco2e.toLocaleString()} t</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">ETS Regulatory Coverage</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{activeCompany.carbonCoveragePct}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-sans">Free Allowances Share</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{activeCompany.freeAllowancesPct}%</span>
                  </div>
                </div>
              </div>

              {/* Scenario-Conditioned Transition Risk Stress (Current Scenario & Horizon) */}
              <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-teal-600" />
                    Modelled Stress Impact: {scenario.name} ({selectedHorizon})
                  </h4>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">
                    Carbon Price: ${scenarioPoint.carbonPriceUsd}/tCO2e
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Gross Carbon Cost</span>
                    <span className="font-bold text-slate-900 dark:text-white">${activeCompanyImpact.grossCarbonCostUsdM}M</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Absorbed Carbon Cost</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">${activeCompanyImpact.carbonCostAbsorbedUsdM}M</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Adjusted EBITDA</span>
                    <span className="font-bold text-slate-900 dark:text-white">${activeCompanyImpact.adjustedEbitdaUsdM}M</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">EBITDA Contraction</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{activeCompanyImpact.ebitdaChangePct}%</span>
                  </div>
                </div>

                {/* Credit sensitivity */}
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <span>Baseline PD: <strong>{activeCompanyImpact.baselinePdPct}%</strong> ({activeCompany.baselineRating})</span>
                  <span>Modelled Credit PD: <strong className="text-rose-600">{activeCompanyImpact.modelledPdPct}%</strong></span>
                  <span>Credit Spread Shift: <strong className="text-amber-600">+{activeCompanyImpact.pdChangeBps} bps</strong></span>
                </div>
              </div>

              {/* Physical Assets Mapped to this Company */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Physical Asset Facilities ({activeCompanyAssets.length} Assets)</span>
                  <span className="font-mono text-slate-500 font-normal">
                    Total Replacement: ${activeCompany.totalAssetReplacementValueUsdM}M
                  </span>
                </h4>
                <div className="space-y-2">
                  {activeCompanyAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{asset.id}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{asset.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            asset.riskTier === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            asset.riskTier === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {asset.riskTier} Risk
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {asset.assetType} • {asset.city}, {asset.country} ({asset.latitude.toFixed(3)}, {asset.longitude.toFixed(3)})
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ${asset.replacementValueUsdM}M
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Peril Score: {asset.overallPhysicalScore}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedCompanyId(null)}
                className="px-4 py-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
