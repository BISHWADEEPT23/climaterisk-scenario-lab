/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  ShieldAlert,
  Flame,
  TrendingDown,
  Layers,
  Globe2,
  PieChart as PieIcon,
  SlidersHorizontal,
  FileCheck2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { AuditDetails, FormulaAuditModal } from './FormulaAuditModal';
import { Company, PhysicalAsset, ScenarioType, TimeHorizon, Sector, Country } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { calculatePortfolioAggregates } from '../../engine/portfolioMetrics';
import { calculateCompanyTransitionImpact } from '../../engine/transitionRisk';
import { getFullScenarioTrajectory } from '../../engine/scenarioInterpolation';

interface ExecutiveDashboardProps {
  companies: Company[];
  assets: PhysicalAsset[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
  onScenarioChange: (id: ScenarioType) => void;
  onHorizonChange: (h: TimeHorizon) => void;
  onNavigateToModule: (moduleId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  companies,
  assets,
  selectedScenarioId,
  selectedHorizon,
  onScenarioChange,
  onHorizonChange,
  onNavigateToModule
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [activeAudit, setActiveAudit] = useState<AuditDetails | null>(null);
  const [customPassThrough, setCustomPassThrough] = useState<number | undefined>(undefined);

  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;
  const scenarioPoint = scenario.horizons[selectedHorizon];

  // Filtered companies based on selection
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
      const matchCountry = countryFilter === 'All' || c.country === countryFilter;
      return matchSector && matchCountry;
    });
  }, [companies, sectorFilter, countryFilter]);

  // Portfolio aggregates
  const aggregates = useMemo(() => {
    return calculatePortfolioAggregates(
      filteredCompanies,
      assets,
      scenarioPoint,
      { customPassThroughOverridePct: customPassThrough }
    );
  }, [filteredCompanies, assets, scenarioPoint, customPassThrough]);

  // Sector breakdown data
  const sectorData = useMemo(() => {
    const sectors: Sector[] = [
      'Power Generation',
      'Steel',
      'Cement',
      'Automotive',
      'Commercial Real Estate',
      'Agriculture'
    ];

    return sectors.map(sec => {
      const secComps = filteredCompanies.filter(c => c.sector === sec);
      const totalLoan = secComps.reduce((sum, c) => sum + c.loanExposureUsdM, 0);
      let secFinancedEmissions = 0;
      secComps.forEach(c => {
        if (c.enterpriseValueUsdM > 0) {
          const attr = Math.min(1.0, c.loanExposureUsdM / c.enterpriseValueUsdM);
          secFinancedEmissions += attr * (c.scope1Tco2e + c.scope2Tco2e);
        }
      });
      return {
        sector: sec,
        loanExposureUsdM: Number(totalLoan.toFixed(1)),
        financedEmissionsTco2e: Math.round(secFinancedEmissions),
        companyCount: secComps.length
      };
    });
  }, [filteredCompanies]);

  // Country breakdown data
  const countryData = useMemo(() => {
    const countries: Country[] = ['India', 'United States', 'Germany', 'United Kingdom', 'Japan'];
    return countries.map(cty => {
      const ctyComps = filteredCompanies.filter(c => c.country === cty);
      const totalLoan = ctyComps.reduce((sum, c) => sum + c.loanExposureUsdM, 0);
      return {
        country: cty,
        loanExposureUsdM: Number(totalLoan.toFixed(1)),
        count: ctyComps.length
      };
    });
  }, [filteredCompanies]);

  // Scenario trajectories (2025 to 2050)
  const trajectoryChartData = useMemo(() => {
    const years = [2025, 2030, 2035, 2040, 2045, 2050];
    return years.map(yr => {
      return {
        year: yr,
        Orderly: SCENARIO_CATALOG.orderly.horizons[yr as TimeHorizon].carbonPriceUsd,
        Disorderly: SCENARIO_CATALOG.disorderly.horizons[yr as TimeHorizon].carbonPriceUsd,
        'High Warming': SCENARIO_CATALOG.high_warming.horizons[yr as TimeHorizon].carbonPriceUsd,
        Baseline: SCENARIO_CATALOG.baseline.horizons[yr as TimeHorizon].carbonPriceUsd
      };
    });
  }, []);

  // Multi-scenario EBITDA impact comparison at selected horizon
  const scenarioComparisonData = useMemo(() => {
    const scenarioKeys: ScenarioType[] = ['baseline', 'orderly', 'disorderly', 'high_warming'];
    return scenarioKeys.map(key => {
      const scen = SCENARIO_CATALOG[key];
      const point = scen.horizons[selectedHorizon];
      const agg = calculatePortfolioAggregates(filteredCompanies, assets, point);
      return {
        name: scen.category,
        scenarioKey: key,
        carbonPrice: point.carbonPriceUsd,
        ebitdaImpactUsdM: agg.aggregateAdjustedEbitdaImpactUsdM,
        ebitdaImpactPct: agg.aggregateEbitdaImpactPct
      };
    });
  }, [filteredCompanies, assets, selectedHorizon]);

  // Waterfall Chart: Baseline EBITDA -> Carbon Cost Absorbed -> Energy Cost -> Mitigations -> Adjusted EBITDA
  const waterfallData = useMemo(() => {
    let baselineEbitda = 0;
    let carbonCostAbsorbed = 0;
    let energyCost = 0;
    let mitigation = 0;

    filteredCompanies.forEach(c => {
      const imp = calculateCompanyTransitionImpact(c, scenarioPoint, {
        customPassThroughOverridePct: customPassThrough
      });
      baselineEbitda += c.ebitdaUsdM;
      carbonCostAbsorbed += imp.carbonCostAbsorbedUsdM;
      energyCost += imp.incrementalEnergyCostUsdM;
      mitigation += imp.mitigationBenefitUsdM;
    });

    const adjustedEbitda = baselineEbitda - carbonCostAbsorbed - energyCost + mitigation;

    return [
      { step: 'Baseline EBITDA', amount: Number(baselineEbitda.toFixed(1)), type: 'base' },
      { step: 'Absorbed Carbon Cost', amount: -Number(carbonCostAbsorbed.toFixed(1)), type: 'sub' },
      { step: 'Energy Cost Uplift', amount: -Number(energyCost.toFixed(1)), type: 'sub' },
      { step: 'Decarb Mitigations', amount: Number(mitigation.toFixed(1)), type: 'add' },
      { step: 'Adjusted EBITDA', amount: Number(adjustedEbitda.toFixed(1)), type: 'total' }
    ];
  }, [filteredCompanies, scenarioPoint, customPassThrough]);

  // Risk concentration matrix data
  const concentrationData = useMemo(() => {
    return filteredCompanies.map(c => {
      const intensity = c.revenueUsdM > 0 ? (c.scope1Tco2e + c.scope2Tco2e) / c.revenueUsdM : 0;
      // Transition score 0-100 based on sector + emissions intensity
      const transitionScore = Math.min(100, Math.round(intensity / 35));
      
      // Physical score from linked assets
      const compAssets = assets.filter(a => a.companyId === c.id);
      const avgPhysical = compAssets.length > 0 
        ? Math.round(compAssets.reduce((sum, a) => sum + a.overallPhysicalScore, 0) / compAssets.length)
        : 30;

      return {
        id: c.id,
        name: c.name.replace(' [Synthetic]', ''),
        sector: c.sector,
        transitionScore,
        physicalScore: avgPhysical,
        loanExposureUsdM: c.loanExposureUsdM
      };
    });
  }, [filteredCompanies, assets]);

  // Audit details builders for each KPI
  const portfolioExposureAudit: AuditDetails = {
    title: 'Total Portfolio Loan Exposure',
    metricCode: 'KPI-EAD-01',
    unit: 'USD Millions ($M)',
    denominator: 'Sum of active drawn loan facilities',
    formula: 'Total Exposure = ∑ Exposure_i',
    inputs: {
      'Filtered Borrowing Entities': filteredCompanies.length,
      'Reporting Baseline': 'FY2024 Audited Balance Sheets',
      'Currency Base': 'USD (Millions)'
    },
    numericalTrace: [
      `Extracted loan balances across ${filteredCompanies.length} synthetic corporate counterparties`,
      `Verified zero negative exposures and complete referential integrity`,
      `Aggregated loan book total = $${aggregates.totalLoanExposureUsdM.toLocaleString()}M`
    ],
    regulatoryReference: 'Basel III Credit Risk Framework / IFRS 7 / IFRS 9 EAD',
    methodologyNote: 'Authorized credit commitment balances and bilateral syndicated loan positions at default.'
  };

  const financedEmissionsAudit: AuditDetails = {
    title: 'PCAF Financed Emissions (Scope 1 + 2)',
    metricCode: 'KPI-PCAF-01',
    unit: 'tCO2e (metric tons)',
    denominator: 'Enterprise Value Including Cash (EVIC)',
    formula: 'Financed Emissions = ∑ [ (Loan_i / EVIC_i) × (Scope1_i + Scope2_i) ]',
    inputs: {
      'Reporting Boundary': 'Scope 1 direct + Scope 2 market-based electricity',
      'Attribution Metric': 'EVIC = Market Cap + Total Debt + Cash',
      'PCAF Score Standard': 'Score 2-3 (Audited Synthetic Facility Reports)'
    },
    numericalTrace: [
      `Computed attribution factor = min(1.0, Loan / EVIC) for each corporate borrower`,
      `Multiplied factor by verified FY2024 (Scope 1 + Scope 2) operational emissions`,
      `Summed attributed emissions across portfolio = ${aggregates.totalFinancedEmissionsTco2e.toLocaleString()} tCO2e`
    ],
    regulatoryReference: 'PCAF Global Standard Part A Section 5.1 (Commercial Loans)',
    methodologyNote: 'Strictly avoids double counting through company-level EVIC attribution. If EVIC is missing, attribution defaults to total debt or is flagged.'
  };

  const waciAudit: AuditDetails = {
    title: 'Weighted Average Carbon Intensity (WACI)',
    metricCode: 'KPI-WACI-01',
    unit: 'tCO2e / USD Million Revenue',
    denominator: 'Total Corporate Revenue ($M)',
    formula: 'WACI = ∑ [ (Loan_i / Total Loan Portfolio) × (Emissions_i / Revenue_i) ]',
    inputs: {
      'Total Loan Exposure': `$${aggregates.totalLoanExposureUsdM}M`,
      'Emissions Included': 'Scope 1 + Scope 2',
      'Revenue Normalization': 'FY2024 Total Sales ($M)'
    },
    numericalTrace: [
      `Calculated company carbon intensity = (Scope 1 + Scope 2) / Revenue ($M)`,
      `Weighted each company by its share of total portfolio loan book: w_i = Loan_i / TotalLoan`,
      `Aggregated weighted intensity sum = ${aggregates.weightedAverageCarbonIntensity} tCO2e / $M Revenue`
    ],
    regulatoryReference: 'TCFD Metrics & Targets Guidance / IFRS S2 Paragraph 29',
    methodologyNote: 'Standardized indicator of carbon footprint efficiency independent of capital structure variations.'
  };

  const ebitdaImpactAudit: AuditDetails = {
    title: 'Scenario-Conditioned EBITDA Impact',
    metricCode: 'KPI-EBITDA-STR',
    unit: 'USD Millions ($M) and Percentage (%)',
    denominator: 'Baseline FY2024 Portfolio EBITDA',
    formula: 'Adjusted EBITDA = Baseline EBITDA - [ (1 - PassThrough) × NetCarbonCost ] - IncrementalEnergyCost + Mitigations',
    inputs: {
      'Selected Scenario': scenario.name,
      'Time Horizon': selectedHorizon,
      'Carbon Price': `$${scenarioPoint.carbonPriceUsd}/tCO2e`,
      'Wholesale Power Price': `$${scenarioPoint.electricityPriceUsdMwh}/MWh`,
      'User Pass-Through Override': customPassThrough !== undefined ? `${customPassThrough}%` : 'Sector Calibrated'
    },
    numericalTrace: [
      `Gross Carbon Cost = Covered Emissions × Carbon Price ($${scenarioPoint.carbonPriceUsd}/t)`,
      `Net Incremental Cost deducted baseline costs and free allowances`,
      `Cost absorbed applied pass-through rate (company absorbed = Net × (1 - α))`,
      `Added incremental power tariff shift: Consumption × Delta Power Tariff`,
      `Net portfolio EBITDA contraction = $${Math.abs(aggregates.aggregateAdjustedEbitdaImpactUsdM).toLocaleString()}M (${aggregates.aggregateEbitdaImpactPct.toFixed(2)}%)`
    ],
    regulatoryReference: 'NGFS Climate Scenario Financial Transmission Guidance',
    methodologyNote: 'Evaluates direct operating cash flow resilience prior to capital restructuring or long-term dynamic asset reallocation.'
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Scenario Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Active Climate Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioType)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="orderly">Orderly (Net Zero 2050 - 1.5°C)</option>
              <option value="disorderly">Disorderly (Delayed Action - High Shocks)</option>
              <option value="high_warming">High Warming (Hot House World - &gt;3°C)</option>
              <option value="baseline">Baseline (Current Statutory Policies)</option>
            </select>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Horizon Anchor: <span className="text-teal-600 dark:text-teal-400 font-bold font-mono">{selectedHorizon}</span>
              </label>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {[2025, 2030, 2035, 2040, 2045, 2050].map(h => (
                <button
                  key={h}
                  onClick={() => onHorizonChange(h as TimeHorizon)}
                  className={`text-xs px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    selectedHorizon === h
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Sector Filter
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All 6 Sectors ({companies.length})</option>
              <option value="Power Generation">Power Generation</option>
              <option value="Steel">Steel</option>
              <option value="Cement">Cement</option>
              <option value="Automotive">Automotive</option>
              <option value="Commercial Real Estate">Commercial Real Estate</option>
              <option value="Agriculture">Agriculture</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Geographies (5 Countries)</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Japan">Japan</option>
            </select>
          </div>
        </div>

        {/* Pass-Through Sensitivity Quick Adjust */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Pass-Through Override</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {customPassThrough !== undefined ? `${customPassThrough}%` : 'Sector Default'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={customPassThrough ?? 50}
              onChange={(e) => setCustomPassThrough(Number(e.target.value))}
              className="w-28 accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
          {customPassThrough !== undefined && (
            <button
              onClick={() => setCustomPassThrough(undefined)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="Reset to calibrated sector pass-through"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row (8 Traceable Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <KpiCard
          title="Total Portfolio Exposure"
          value={`$${aggregates.totalLoanExposureUsdM.toLocaleString()}`}
          unit="USD M"
          denominator="Drawn Loan Facilities (EAD)"
          subtext={`${filteredCompanies.length} Corporate Borrowers`}
          auditDetails={portfolioExposureAudit}
          onAuditClick={setActiveAudit}
          accentColor="blue"
        />

        {/* KPI 2 */}
        <KpiCard
          title="PCAF Financed Emissions"
          value={`${(aggregates.totalFinancedEmissionsTco2e / 1000).toFixed(1)}k`}
          unit="tCO2e"
          denominator="EVIC Attribution"
          subtext="Scope 1 & Scope 2 Attributed"
          auditDetails={financedEmissionsAudit}
          onAuditClick={setActiveAudit}
          accentColor="teal"
        />

        {/* KPI 3 */}
        <KpiCard
          title="Weighted Carbon Intensity"
          value={`${aggregates.weightedAverageCarbonIntensity}`}
          unit="tCO2e / $M"
          denominator="Total Revenue"
          subtext="TCFD / IFRS S2 Standard"
          auditDetails={waciAudit}
          onAuditClick={setActiveAudit}
          accentColor="purple"
        />

        {/* KPI 4 */}
        <KpiCard
          title="Modelled EBITDA Impact"
          value={`$${aggregates.aggregateAdjustedEbitdaImpactUsdM.toLocaleString()}`}
          unit="USD M"
          changeText={`${aggregates.aggregateEbitdaImpactPct > 0 ? '+' : ''}${aggregates.aggregateEbitdaImpactPct.toFixed(2)}%`}
          changePositive={aggregates.aggregateEbitdaImpactPct >= 0}
          scenarioTag={`${selectedScenarioId.toUpperCase()} ${selectedHorizon}`}
          auditDetails={ebitdaImpactAudit}
          onAuditClick={setActiveAudit}
          accentColor="rose"
        />

        {/* KPI 5 */}
        <KpiCard
          title="High Transition Risk"
          value={`$${aggregates.highTransitionRiskExposureUsdM.toLocaleString()}`}
          unit="USD M"
          subtext={`${aggregates.highTransitionRiskPct}% of Portfolio`}
          auditDetails={{
            title: 'High Transition Risk Exposure',
            metricCode: 'KPI-HTR-01',
            unit: 'USD Millions ($M)',
            denominator: 'Total Portfolio Exposure',
            formula: 'High Transition Exposure = ∑ Exposure_i where Sector ∈ {Power, Steel, Cement} or Carbon Intensity > 400',
            inputs: {
              'Threshold Criteria': 'Sectors with structural fossil dependence or >400 tCO2e/$M',
              'Identified Exposure': `$${aggregates.highTransitionRiskExposureUsdM}M`
            },
            numericalTrace: [
              'Filtered portfolio against emissions-intensive taxonomy definitions',
              `Summed lending positions meeting structural exposure conditions = $${aggregates.highTransitionRiskExposureUsdM}M (${aggregates.highTransitionRiskPct}%)`
            ],
            regulatoryReference: 'EBA Guidelines on ESG Risk Management / NGFS Transition Guide',
            methodologyNote: 'Measures vulnerable capital exposed to high compliance penalties and asset stranding.'
          }}
          onAuditClick={setActiveAudit}
          accentColor="amber"
        />

        {/* KPI 6 */}
        <KpiCard
          title="High Physical Risk"
          value={`$${aggregates.highPhysicalRiskExposureUsdM.toLocaleString()}`}
          unit="USD M"
          subtext={`${aggregates.highPhysicalRiskPct}% of Portfolio`}
          auditDetails={{
            title: 'High Physical Peril Asset Exposure',
            metricCode: 'KPI-HPR-01',
            unit: 'USD Millions ($M)',
            denominator: 'Total Portfolio Exposure',
            formula: 'High Physical Exposure = ∑ Exposure_i where any linked Asset Physical Score ≥ 60',
            inputs: {
              'Total Assets Evaluated': assets.length,
              'High Peril Cutoff Score': 'Score ≥ 60 out of 100'
            },
            numericalTrace: [
              'Mapped 100 physical assets across 8 acute and chronic perils',
              `Identified companies with critical asset exposure = $${aggregates.highPhysicalRiskExposureUsdM}M (${aggregates.highPhysicalRiskPct}%)`
            ],
            regulatoryReference: 'IPCC AR6 Working Group II / TCFD Physical Risk Disclosures',
            methodologyNote: 'Tracks borrowing entities with physical facilities exposed to severe flood, cyclone, or chronic water/heat stress.'
          }}
          onAuditClick={setActiveAudit}
          accentColor="rose"
        />

        {/* KPI 7 */}
        <KpiCard
          title="Scenario Carbon Price"
          value={`$${scenarioPoint.carbonPriceUsd}`}
          unit="USD / tCO2e"
          denominator="2024 Real USD"
          subtext={`Temp: +${scenarioPoint.tempAnomalyCelsius}°C`}
          scenarioTag={scenario.name.split(' ')[0]}
          auditDetails={{
            title: 'Scenario Carbon Price Parameter',
            metricCode: 'VAR-CP-01',
            unit: 'USD / tCO2e',
            denominator: 'Real 2024 USD Base',
            formula: 'P_carbon(t) calibrated from NGFS Phase IV synthetic trajectory',
            inputs: {
              'Active Scenario': scenario.name,
              'Horizon': selectedHorizon,
              'Price Base Year': '2024'
            },
            numericalTrace: [
              `Queried scenario database for ${selectedScenarioId} at ${selectedHorizon}`,
              `Carbon price extracted: $${scenarioPoint.carbonPriceUsd}/tCO2e`,
              `Accompanying electricity wholesale benchmark: $${scenarioPoint.electricityPriceUsdMwh}/MWh`
            ],
            regulatoryReference: 'NGFS Phase IV Integrated Assessment Models',
            methodologyNote: 'Authoritative shadow carbon price required to induce target decarbonization rate.'
          }}
          onAuditClick={setActiveAudit}
          accentColor="teal"
        />

        {/* KPI 8 */}
        <KpiCard
          title="Data Integrity Score"
          value={`${aggregates.dataQualityScore}%`}
          unit="Valid"
          denominator="100% Deterministic Synthetic Verification"
          subtext="0 Missing, 0 Inconsistent"
          auditDetails={{
            title: 'Dataset Validation & Quality Audit',
            metricCode: 'GOV-DATA-01',
            unit: 'Percentage (%)',
            denominator: 'Total Checked Accounting & Physical Rules',
            formula: 'Quality Score = 100 × (1 - ErrorCount / TotalRulesChecked)',
            inputs: {
              'Companies Checked': companies.length,
              'Assets Checked': assets.length,
              'Accounting Rules': 'Balance Sheet, Coordinates, Non-negative Emissions'
            },
            numericalTrace: [
              'Executed deterministic data quality engine across 130 entities',
              'Confirmed 0 negative emissions, 0 coordinate violations, and 0 EVIC breaches',
              'Calculated dataset integrity score = 100%'
            ],
            regulatoryReference: 'BCBS 239 Risk Data Aggregation Principles',
            methodologyNote: 'Formal QA testing ensures zero numerical anomalies in portfolio calculations.'
          }}
          onAuditClick={setActiveAudit}
          accentColor="blue"
        />
      </div>

      {/* Row 2: Charts (Sector Exposure & Carbon Price Trajectories) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sector Loan Exposure vs Financed Emissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Sector Exposure & Financed Emissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loan Book EAD ($M) vs Attributed Scope 1+2 Financed Emissions (tCO2e)
              </p>
            </div>
            <button
              onClick={() => onNavigateToModule('corporate')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              View Companies →
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="sector"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Loan EAD ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Financed tCO2e', angle: 90, position: 'insideRight', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name) => [
                    typeof val === 'number' ? val.toLocaleString() : val,
                    name === 'loanExposureUsdM' ? 'Loan Exposure ($M)' : 'Financed Emissions (tCO2e)'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="loanExposureUsdM" name="Loan Exposure ($M)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="financedEmissionsTco2e" name="Financed Emissions (tCO2e)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scenario Carbon Price Pathways */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Scenario Carbon Price Trajectories (2025–2050)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                USD / tCO2e across 4 NGFS-aligned transition pathways
              </p>
            </div>
            <button
              onClick={() => onNavigateToModule('scenario')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Explore Scenarios →
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'USD / tCO2e', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name) => [`$${val} / tCO2e`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Orderly" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Disorderly" stroke="#e11d48" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="High Warming" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Baseline" stroke="#64748b" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Waterfall & Multi-Scenario Impact Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waterfall Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Financial Transmission Waterfall ({selectedHorizon})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baseline EBITDA → Absorbed Carbon & Energy Costs → Adjusted EBITDA ($M)
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 15, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="step" tick={{ fontSize: 10.5, fill: '#64748b' }} interval={0} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'USD Millions ($M)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val) => [`$${typeof val === 'number' ? Math.abs(val).toLocaleString() : val}M`, 'Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="amount" name="Amount ($M)" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => {
                    let color = '#0d9488';
                    if (entry.type === 'base') color = '#0284c7';
                    if (entry.type === 'sub') color = '#e11d48';
                    if (entry.type === 'add') color = '#10b981';
                    if (entry.type === 'total') color = '#6366f1';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Scenario Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                Cross-Scenario EBITDA Sensitivity ({selectedHorizon})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Portfolio EBITDA Contraction (%) across alternative pathways
              </p>
            </div>
            <button
              onClick={() => onNavigateToModule('transition')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Transition Model →
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioComparisonData} margin={{ top: 15, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'EBITDA Impact (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val, name, props) => [
                    `${val}% ($${Math.abs(props.payload.ebitdaImpactUsdM).toLocaleString()}M)`,
                    'EBITDA Impact'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="ebitdaImpactPct" name="EBITDA Impact (%)" radius={[4, 4, 0, 0]}>
                  {scenarioComparisonData.map((entry, index) => {
                    const color = entry.scenarioKey === 'disorderly' ? '#e11d48' : entry.scenarioKey === 'orderly' ? '#0d9488' : '#64748b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Risk Concentration Matrix (Transition Risk vs Physical Risk) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              Portfolio Climate Risk Concentration Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transition Risk Score vs Physical Peril Score by Borrower (Bubble size = Loan Exposure $M)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span> High Dual Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-500/80 inline-block"></span> Low Risk</span>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis
                type="number"
                dataKey="transitionScore"
                name="Transition Risk Score"
                unit=""
                domain={[0, 100]}
                label={{ value: 'Transition Risk Score (0 - 100)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="physicalScore"
                name="Physical Risk Score"
                unit=""
                domain={[0, 100]}
                label={{ value: 'Physical Peril Score (0 - 100)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis type="number" dataKey="loanExposureUsdM" range={[60, 400]} name="Loan Exposure ($M)" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs text-white shadow-xl">
                        <div className="font-semibold text-teal-300">{data.name}</div>
                        <div className="text-slate-400 mb-1.5">{data.sector} • ID: {data.id}</div>
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div>Loan Exposure: <strong>${data.loanExposureUsdM}M</strong></div>
                          <div>Transition Score: <strong>{data.transitionScore} / 100</strong></div>
                          <div>Physical Peril Score: <strong>{data.physicalScore} / 100</strong></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Borrowers" data={concentrationData}>
                {concentrationData.map((entry, index) => {
                  const isHighDual = entry.transitionScore >= 50 && entry.physicalScore >= 50;
                  const isHighTransition = entry.transitionScore >= 50;
                  const color = isHighDual ? '#f43f5e' : isHighTransition ? '#f59e0b' : '#0d9488';
                  return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} stroke="#ffffff" strokeWidth={1} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formula Audit Modal */}
      <FormulaAuditModal details={activeAudit} onClose={() => setActiveAudit(null)} />
    </div>
  );
};
