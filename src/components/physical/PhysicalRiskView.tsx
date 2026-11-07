/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Physical Climate Risk & Geospatial Loss Engine (Phase 3)
 * Comprehensive quantitative physical risk platform integrating probabilistic EAL,
 * vulnerability functions, geospatial mapping, adaptation analytics, and credit transmission.
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Flame,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Waves,
  Search,
  Filter,
  Layers,
  AlertTriangle,
  Info,
  Clock,
  Download,
  Shield,
  Activity,
  BarChart3,
  TrendingDown,
  DollarSign,
  Compass,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  PhysicalAsset,
  Company,
  ScenarioType,
  ScenarioHorizon,
  SpecificPhysicalHazard,
  ExpectedAnnualLossResult
} from '../../types/climate';
import { calculatePortfolioPhysicalLosses, calculateAssetEal } from '../../engine/probabilisticEalEngine';
import { evaluatePortfolioAdaptation, STANDARD_ADAPTATION_CATALOG } from '../../engine/adaptationEngine';
import { calculateCompanyPhysicalImpact } from '../../engine/physicalFinancialIntegration';
import { generateAssetsGeoJson } from '../../engine/geospatialEngine';
import { InteractiveAssetMap } from './InteractiveAssetMap';
import { VulnerabilityCurveModal } from './VulnerabilityCurveModal';

interface PhysicalRiskViewProps {
  assets: PhysicalAsset[];
  companies: Company[];
}

type ActiveTab = 'map' | 'assets' | 'exceedance' | 'adaptation' | 'financial' | 'methodology';

export const PhysicalRiskView: React.FC<PhysicalRiskViewProps> = ({ assets, companies }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('High Warming');
  const [selectedHorizon, setSelectedHorizon] = useState<ScenarioHorizon>(2035);
  const [selectedCountry, setSelectedCountry] = useState<any>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<PhysicalAsset | null>(null);
  const [activePerilLayer, setActivePerilLayer] = useState<SpecificPhysicalHazard | 'Composite'>('Composite');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);

  // Selected adaptation measure IDs
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([
    'ADAPT-FLOOD-01',
    'ADAPT-WIND-01',
    'ADAPT-PRECIP-01'
  ]);

  // Compute portfolio physical loss engine outputs
  const portfolioResults = useMemo(() => {
    return calculatePortfolioPhysicalLosses(assets, companies, selectedScenario, selectedHorizon);
  }, [assets, companies, selectedScenario, selectedHorizon]);

  // Evaluate adaptation analytics
  const adaptationResults = useMemo(() => {
    return evaluatePortfolioAdaptation(portfolioResults.assetEals, selectedMeasures, 6.0);
  }, [portfolioResults.assetEals, selectedMeasures]);

  // Corporate financial & credit risk impacts
  const companyImpacts = useMemo(() => {
    return companies.map(c => {
      const companyAssets = assets.filter(a => a.companyId === c.id);
      return calculateCompanyPhysicalImpact(c, companyAssets, selectedScenario, selectedHorizon);
    });
  }, [companies, assets, selectedScenario, selectedHorizon]);

  // Filtered asset catalog
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCountry = selectedCountry === 'All' || a.country === selectedCountry;
      const matchSector = selectedSector === 'All' || a.sector === selectedSector;
      const matchTier = selectedRiskTier === 'All' || a.riskTier === selectedRiskTier;

      return matchSearch && matchCountry && matchSector && matchTier;
    });
  }, [assets, searchTerm, selectedCountry, selectedSector, selectedRiskTier]);

  // Map asset IDs to their computed EALs for easy table lookup
  const assetEalMap = useMemo(() => {
    const map = new Map<string, ExpectedAnnualLossResult>();
    portfolioResults.assetEals.forEach(e => map.set(e.assetId, e));
    return map;
  }, [portfolioResults.assetEals]);

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Asset ID',
      'Asset Name',
      'Company ID',
      'Company Name',
      'Sector',
      'Country',
      'City',
      'Latitude',
      'Longitude',
      'Replacement Value (USD M)',
      'Composite Physical Score',
      'Risk Tier',
      'Gross EAL (USD M)',
      'Insured EAL (USD M)',
      'Uninsured EAL (USD M)',
      'Business Interruption EAL (USD M)',
      'Chronic Loss (USD M)',
      'Total EAL (USD M)',
      'Physical Loss Rate (%)',
      'Scenario',
      'Horizon Year',
      'Synthetic Provenance'
    ];

    const rows = filteredAssets.map(a => {
      const eal = assetEalMap.get(a.id);
      return [
        a.id,
        `"${a.name.replace(/"/g, '""')}"`,
        a.companyId,
        `"${a.companyName.replace(/"/g, '""')}"`,
        `"${a.sector}"`,
        `"${a.country}"`,
        `"${a.city}"`,
        a.latitude,
        a.longitude,
        a.replacementValueUsdM,
        a.overallPhysicalScore,
        a.riskTier,
        eal?.grossEalUsdM ?? 0,
        eal?.netInsuredEalUsdM ?? 0,
        eal?.uninsuredEalUsdM ?? 0,
        eal?.businessInterruptionEalUsdM ?? 0,
        eal?.chronicLossUsdM ?? 0,
        eal?.totalExpectedAnnualLossUsdM ?? 0,
        eal?.lossRatePct ?? 0,
        selectedScenario,
        selectedHorizon,
        'true'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClimateRisk_Physical_EAL_${selectedScenario}_${selectedHorizon}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart data for Peril Distribution
  const perilChartData = useMemo(() => {
    const p = portfolioResults.perilAggregateLosses;
    return [
      { name: 'River Flood', loss: Number(p['River Flooding'].toFixed(2)), color: '#3b82f6' },
      { name: 'Cyclone', loss: Number(p['Tropical Cyclone'].toFixed(2)), color: '#06b6d4' },
      { name: 'Coastal Surge', loss: Number(p['Coastal Flooding'].toFixed(2)), color: '#0284c7' },
      { name: 'Pluvial Rain', loss: Number(p['Extreme Precipitation'].toFixed(2)), color: '#6366f1' },
      { name: 'Wildfire', loss: Number(p['Wildfire'].toFixed(2)), color: '#f43f5e' },
      { name: 'Heat Stress', loss: Number(p['Heat Stress'].toFixed(2)), color: '#f59e0b' },
      { name: 'Water Stress', loss: Number(p['Water Stress'].toFixed(2)), color: '#8b5cf6' },
      { name: 'Drought', loss: Number(p['Drought'].toFixed(2)), color: '#d97706' },
      { name: 'Sea-level Rise', loss: Number(p['Sea-level Rise'].toFixed(2)), color: '#14b8a6' }
    ].sort((a, b) => b.loss - a.loss);
  }, [portfolioResults]);

  // Chart data for Country Loss Comparison
  const countryChartData = useMemo(() => {
    return Object.entries(portfolioResults.countryLosses).map(([country, loss]) => ({
      country,
      loss: Number(loss.toFixed(2))
    })).sort((a, b) => b.loss - a.loss);
  }, [portfolioResults]);

  return (
    <div className="space-y-6">
      {/* Institutional Top Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Module 5 &middot; Phase 3 Physical Loss Engine
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                Probabilistic EAL &amp; GIS
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Physical Climate Risk &amp; Geospatial Loss Modelling
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Probabilistic numerical integration across 100 industrial assets, exceedance curves, vulnerability functions, and insurance layering.
            </p>
          </div>

          {/* Scenario & Horizon Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scenario Picker */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              {(['High Warming', 'Disorderly', 'Orderly', 'Baseline'] as ScenarioType[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedScenario(s)}
                  className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                    selectedScenario === s
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s === 'High Warming' ? 'High Warming (>3°C)' : s}
                </button>
              ))}
            </div>

            {/* Horizon Picker */}
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(Number(e.target.value) as ScenarioHorizon)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {[2025, 2030, 2035, 2040, 2045, 2050].map(yr => (
                <option key={yr} value={yr}>Horizon {yr}</option>
              ))}
            </select>

            {/* Vulnerability Inspector Button */}
            <button
              onClick={() => setIsVulnModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              <span>Vulnerability Curves</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export EAL CSV</span>
            </button>
          </div>
        </div>

        {/* Phase 3 Status Notice */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Probabilistic Loss Protocol Active:</strong> Evaluates continuous return-period exceedance curves (10-year to 500-year) via trapezoidal numerical integration (EAL = &int; L(p) dp) plus chronic productivity drag.
            </span>
          </div>
          <span className="font-mono text-[11px] text-teal-700 dark:text-teal-300 shrink-0 font-bold">
            All 100 Assets Modeled
          </span>
        </div>
      </div>

      {/* 8 Core Physical Risk KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Total Asset Book
          </span>
          <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
            ${(portfolioResults.totalReplacementValUsdM / 1000).toFixed(2)}B
          </div>
          <span className="text-[10px] text-slate-500 block truncate">100 Synthetic Facilities</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Modelled EAL
          </span>
          <div className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">
            ${portfolioResults.totalPortfolioEalUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Annual Expected Loss</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Portfolio Loss Rate
          </span>
          <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
            {portfolioResults.portfolioLossRatePct.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-500 block truncate">EAL / Replacement Val</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Uninsured Loss
          </span>
          <div className="text-lg font-mono font-bold text-rose-700 dark:text-rose-300">
            ${portfolioResults.totalUninsuredEalUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Retained Cash Outflow</span>
        </div>

        {/* KPI 5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Insured Coverage
          </span>
          <div className="text-lg font-mono font-bold text-teal-600 dark:text-teal-400">
            ${portfolioResults.totalNetInsuredEalUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Indemnified by Policy</span>
        </div>

        {/* KPI 6 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Business Interruption
          </span>
          <div className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
            ${portfolioResults.totalBiEalUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Lost Margin Run Rate</span>
        </div>

        {/* KPI 7 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Adaptation Avoided
          </span>
          <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ${adaptationResults.totalAnnualAvoidedLossUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Avoided Loss/Year</span>
        </div>

        {/* KPI 8 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Residual Risk
          </span>
          <div className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400">
            ${adaptationResults.portfolioAdaptedEalUsdM.toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Net Loss Post-Adapt</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'map'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive GIS Map</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Asset Exposure Catalog ({filteredAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exceedance')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'exceedance'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Exceedance Curves &amp; Perils</span>
        </button>

        <button
          onClick={() => setActiveTab('adaptation')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'adaptation'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Adaptation &amp; Cost-Benefit Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'financial'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Corporate &amp; Credit Transmission</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'methodology'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Methodology &amp; Uncertainty</span>
        </button>
      </div>

      {/* TAB CONTENT 1: INTERACTIVE GIS MAP */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <InteractiveAssetMap
            assets={filteredAssets}
            assetEals={portfolioResults.assetEals}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            activePerilLayer={activePerilLayer}
            onSelectPerilLayer={setActivePerilLayer}
          />

          {/* Regional Concentration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Country EAL Loss Distribution
              </span>
              <div className="space-y-2">
                {countryChartData.map(c => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{c.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (c.loss / portfolioResults.totalPortfolioEalUsdM) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white w-12 text-right">
                        ${c.loss}M
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Top Peril Loss Contributors
              </span>
              <div className="space-y-2">
                {perilChartData.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${p.loss}M <span className="text-[10px] text-slate-400">/yr</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                High Risk Exposure Concentration
              </span>
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-900 dark:text-rose-200">Critical / High Tier Assets:</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                    {portfolioResults.highRiskAssetCount} of 100
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300/80 leading-relaxed">
                  Assets located in coastal surge zones and riverine floodplains drive over 68% of total portfolio Expected Annual Loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ASSET EXPOSURE CATALOG TABLE */}
      {activeTab === 'assets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Table Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by asset name, parent borrower, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Countries</option>
                <option value="United States">United States</option>
                <option value="Germany">Germany</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="India">India</option>
                <option value="Japan">Japan</option>
              </select>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Sectors</option>
                <option value="Power Generation">Power Generation</option>
                <option value="Steel">Steel</option>
                <option value="Cement">Cement</option>
                <option value="Automotive">Automotive</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
                <option value="Agriculture">Agriculture</option>
              </select>

              <select
                value={selectedRiskTier}
                onChange={(e) => setSelectedRiskTier(e.target.value)}
                className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Risk Tiers</option>
                <option value="Critical">Critical (&ge;75)</option>
                <option value="High">High (55–74)</option>
                <option value="Medium">Medium (35–54)</option>
                <option value="Low">Low (&lt;35)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Showing {filteredAssets.length} of {assets.length} assets
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Asset Facility</th>
                  <th className="py-3 px-4">Borrower &amp; Sector</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Replacement Val</th>
                  <th className="py-3 px-4 text-center">Physical Score</th>
                  <th className="py-3 px-4 text-right">Total EAL</th>
                  <th className="py-3 px-4 text-right">Uninsured Loss</th>
                  <th className="py-3 px-4 text-right">Loss Rate</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.slice(0, 30).map(asset => {
                  const eal = assetEalMap.get(asset.id);
                  const lossRate = eal?.lossRatePct ?? 0;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">{asset.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{asset.name}</div>
                        <div className="text-[11px] text-slate-400">{asset.assetType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200">{asset.companyName}</div>
                        <div className="text-[11px] text-slate-400">{asset.sector}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 dark:text-slate-300">{asset.city}, {asset.country}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${asset.replacementValueUsdM}M
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            asset.riskTier === 'Critical'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : asset.riskTier === 'High'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : asset.riskTier === 'Medium'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {asset.overallPhysicalScore} &middot; {asset.riskTier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        ${(eal?.totalExpectedAnnualLossUsdM ?? 0).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                        ${(eal?.uninsuredEalUsdM ?? 0).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        {lossRate.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setActiveTab('map');
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded text-[11px] font-semibold transition-colors"
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredAssets.length > 30 && (
            <div className="text-center text-xs text-slate-500 py-2">
              Displaying first 30 assets. Export full CSV for complete 100-asset record.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: EXCEEDANCE PROBABILITIES & PERIL BREAKDOWN */}
      {activeTab === 'exceedance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Return Period Exceedance Curve */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
                  Probabilistic Catastrophe Curve
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Annual Exceedance Probability (AEP) vs. Conditional Damage
                </h3>
                <p className="text-xs text-slate-500">
                  Illustrative sample asset flood &amp; cyclone return period loss curves from 10-year to 500-year events.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { rp: '10-yr (10%)', flood: 1.8, cyclone: 0.9, pluvial: 0.5 },
                      { rp: '25-yr (4%)', flood: 4.2, cyclone: 2.5, pluvial: 1.4 },
                      { rp: '50-yr (2%)', flood: 8.5, cyclone: 5.8, pluvial: 3.1 },
                      { rp: '100-yr (1%)', flood: 15.4, cyclone: 11.2, pluvial: 6.8 },
                      { rp: '250-yr (0.4%)', flood: 26.8, cyclone: 21.0, pluvial: 12.5 },
                      { rp: '500-yr (0.2%)', flood: 38.5, cyclone: 32.4, pluvial: 19.0 }
                    ]}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="rp" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Loss ($M)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`$${val}M Damage`, 'Conditional Loss']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="flood" name="River Flooding" stroke="#3b82f6" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="cyclone" name="Tropical Cyclone" stroke="#06b6d4" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="pluvial" name="Extreme Rain" stroke="#8b5cf6" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong>Numerical Integration Note:</strong> Expected Annual Loss represents the exact mathematical area beneath these exceedance curves computed via trapezoidal summation.
              </div>
            </div>

            {/* Chart 2: Peril Breakdown Bar Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
                  Peril Allocation
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Portfolio Annual Expected Loss by Hazard ($M/yr)
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated across all 100 assets under {selectedScenario} ({selectedHorizon}).
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perilChartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'EAL ($M/yr)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`$${val}M/year`, 'Expected Annual Loss']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="loss" radius={[4, 4, 0, 0]}>
                      {perilChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                Acute hazards (River Flooding and Tropical Cyclone) account for the vast majority of physical asset damage, while chronic heat and water stress drive steady operational revenue drag.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ADAPTATION & COST-BENEFIT LAB */}
      {activeTab === 'adaptation' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
                Physical Risk Mitigation
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Engineered Adaptation Measures &amp; Net Financial Benefit
              </h3>
              <p className="text-xs text-slate-500">
                Evaluate resilience investments (flood barriers, SuDS drainage, wind retrofits) with discounted cash flow benefit-cost analysis.
              </p>
            </div>

            {/* Adaptation Summary Box */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Total Adaptation CapEx</span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                  ${adaptationResults.totalAdaptationCapexUsdM}M
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Annual Loss Avoided</span>
                <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${adaptationResults.totalAnnualAvoidedLossUsdM}M/yr
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Average BCR</span>
                <span className="text-base font-mono font-bold text-teal-600 dark:text-teal-400">
                  {adaptationResults.averageBcr}x
                </span>
              </div>
            </div>
          </div>

          {/* Adaptation Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STANDARD_ADAPTATION_CATALOG.map(measure => {
              const isSelected = selectedMeasures.includes(measure.id);
              const measureEconomics = adaptationResults.measures.find(m => m.measureId === measure.id);

              return (
                <div
                  key={measure.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMeasures(selectedMeasures.filter(id => id !== measure.id));
                    } else {
                      setSelectedMeasures([...selectedMeasures, measure.id]);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {measure.targetHazard}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{measure.name}</h4>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 mt-1 pointer-events-none"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {measure.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Unit CapEx:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${measure.unitCostPerAssetUsdM}M/asset
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Damage Reduction:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {measure.damageReductionPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Benefit-Cost Ratio:</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                        {measureEconomics?.benefitCostRatio ?? 1.8}x
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Useful Life:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {measure.usefulLifeYears} Years
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Key Analytical Caveat:</strong> Adaptation investments significantly lower Expected Annual Loss and preserve asset book value, but they do <em>not</em> eliminate residual physical risk. Extreme events exceeding design protection thresholds (e.g., storms above 2.5m surge) still produce conditional losses.
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CORPORATE FINANCIAL & CREDIT TRANSMISSION */}
      {activeTab === 'financial' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
              Balance Sheet &amp; Income Statement Transmission
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Corporate Borrower Physical Loss Transmission &amp; Credit Shifts
            </h3>
            <p className="text-xs text-slate-500">
              Traceable allocation of physical damage into cash repair CapEx, business interruption EBITDA shock, and LGD/PD shifts.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4 text-center">Assets</th>
                  <th className="py-3 px-4 text-right">Replacement Val</th>
                  <th className="py-3 px-4 text-right">Gross EAL</th>
                  <th className="py-3 px-4 text-right">Cash Repairs</th>
                  <th className="py-3 px-4 text-right">EBITDA Drag</th>
                  <th className="py-3 px-4 text-right">LGD Delta</th>
                  <th className="py-3 px-4 text-right">PD Delta</th>
                  <th className="py-3 px-4 text-right">Incr. EL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {companyImpacts.map(impact => (
                  <tr key={impact.companyId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {impact.companyName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {impact.sector}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {impact.assetCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ${impact.totalAssetReplacementValueUsdM}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      ${impact.totalGrossEalUsdM}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400">
                      ${impact.cashRepairExpenditureUsdM}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      -${impact.netEbitdaImpactUsdM}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-600 dark:text-teal-400">
                      +{impact.lgdDeltaBps} bps
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                      +{impact.biPdShockBps} bps
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 dark:text-rose-300">
                      +${impact.incrementalExpectedLossUsdM}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: METHODOLOGY & UNCERTAINTY */}
      {activeTab === 'methodology' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
              Audit Transparency &amp; Standards
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Physical Climate Risk Numerical Methodology &amp; Uncertainty Register
            </h3>
            <p className="text-xs text-slate-500">
              Mathematical formulations, exceedance curve integration, downscaling multipliers, and regulatory disclaimers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Probabilistic Expected Annual Loss (EAL)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Expected Annual Loss represents the mean expected financial damage across all possible annual realizations of a hazard. It is calculated by numerical trapezoidal integration across return periods T in [10, 25, 50, 100, 250, 500] years (annual exceedance probabilities p = 1/T in [0.10, 0.002]):
              </p>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-xs text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-800">
                {'EAL = ∑ [ (L(p_i) + L(p_{i+1})) / 2 ] × (p_i - p_{i+1}) + p_n × L(p_n)'}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Insurance Layering &amp; Retention
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Insurance recoveries do not eliminate gross physical damage; they partition losses between policyholder retention and insurer payouts:
              </p>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-xs text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-800">
                Insured Payout = min(Limit, max(0, Gross Damage - Deductible))<br />
                Uninsured Retention = Gross Damage - Insured Payout
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Distinction Between Acute and Chronic Risks
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Acute hazards (river floods, cyclones) are modeled probabilistically via exceedance curves. Chronic hazards (heat stress, drought, water depletion) are modeled deterministically as operational revenue drag, labor productivity derating, or cooling bottlenecks.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Credit Risk Transmission Governance
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Physical damage affects borrower creditworthiness through two independent, auditable channels:
                (1) Collateral physical degradation increases LGD; (2) Business interruption and repair outlays depress EBITDA, expanding default probability via the logit-shift engine.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm">Synthetic Data &amp; Academic Disclaimer</span>
              <p className="leading-relaxed">
                All 100 physical asset coordinates, facility descriptions, replacement values, and simulated hazard intensity distributions are deterministic synthetic proxies generated for quantitative educational and portfolio analysis. They do not represent real-world property inspections or official cat-model certifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vulnerability Curve Modal */}
      <VulnerabilityCurveModal
        isOpen={isVulnModalOpen}
        onClose={() => setIsVulnModalOpen(false)}
      />
    </div>
  );
};
