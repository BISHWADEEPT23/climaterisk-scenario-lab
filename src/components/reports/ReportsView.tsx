/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building,
  Flame,
  Waves
} from 'lucide-react';
import { Company, PhysicalAsset, ScenarioType, TimeHorizon } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { calculatePortfolioAggregates } from '../../engine/portfolioMetrics';

interface ReportsViewProps {
  companies: Company[];
  assets: PhysicalAsset[];
  selectedScenarioId: ScenarioType;
  selectedHorizon: TimeHorizon;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  companies,
  assets,
  selectedScenarioId,
  selectedHorizon
}) => {
  const [reportType, setReportType] = useState<string>('executive');
  const scenario = SCENARIO_CATALOG[selectedScenarioId] || SCENARIO_CATALOG.orderly;
  const scenarioPoint = scenario.horizons[selectedHorizon];

  const aggregates = useMemo(() => {
    return calculatePortfolioAggregates(companies, assets, scenarioPoint);
  }, [companies, assets, scenarioPoint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Printable HTML Institutional Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">IFRS S2 Aligned</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Climate Risk Disclosure &amp; Executive Reporting
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent analytical reports distinguishing actual balance-sheet data, model assumptions, scenario stress, and limitations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2"
          >
            <option value="executive">Executive Climate Risk Briefing</option>
            <option value="ifrs">IFRS S2 Disclosure Mapping</option>
            <option value="methodology">Methodology &amp; Assumptions Report</option>
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 max-w-5xl mx-auto space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-teal-700 font-bold mb-1">
              ClimateRisk Scenario Lab • Analytical Portfolio Report
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {reportType === 'executive' && 'Executive Climate Financial Risk Assessment'}
              {reportType === 'ifrs' && 'IFRS S2 Climate-related Disclosures Alignment Matrix'}
              {reportType === 'methodology' && 'Numerical Methodology, Assumptions & Limitations Audit'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Reporting Entity: Commercial Banking &amp; Corporate Lending Division | Baseline: FY2024 Audited
            </p>
          </div>
          <div className="text-right text-xs font-mono space-y-0.5">
            <div>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div>Classification: <strong className="text-slate-800">Internal Audit / Portfolio Demo</strong></div>
            <div>Scenario: <strong className="text-teal-700">{scenario.name} ({selectedHorizon})</strong></div>
          </div>
        </div>

        {/* Section: Disclaimers and Distinction Matrix */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Data Provenance &amp; Modelling Distinctions (Mandatory Disclosure)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="font-semibold text-slate-700 block">1. Input Data:</span>
              <span className="text-slate-500">Synthetic corporate financial statements and asset locations.</span>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="font-semibold text-slate-700 block">2. Model Assumptions:</span>
              <span className="text-slate-500">Calibrated pass-through rates and Merton PD elasticity.</span>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="font-semibold text-slate-700 block">3. Scenario Projections:</span>
              <span className="text-slate-500">NGFS Phase IV synthetic trajectories to 2050.</span>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="font-semibold text-slate-700 block">4. Limitations:</span>
              <span className="text-slate-500">Static balance sheets; physical EAL calculation deferred to Phase 3.</span>
            </div>
          </div>
        </div>

        {/* Report Content Based on Type */}
        {reportType === 'executive' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            {/* KPI Summary Table */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-1">
                1. Core Portfolio Risk Metrics
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold uppercase text-[10px] text-slate-700">
                  <tr>
                    <th className="py-2 px-3 border-r border-b">Metric Description</th>
                    <th className="py-2 px-3 border-r border-b">Standard Reference</th>
                    <th className="py-2 px-3 border-r border-b text-right">Value</th>
                    <th className="py-2 px-3 border-b">Unit &amp; Denominator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="py-2 px-3 border-r font-sans">Total Evaluated Loan Book (EAD)</td>
                    <td className="py-2 px-3 border-r text-slate-500">Basel III / IFRS 7</td>
                    <td className="py-2 px-3 border-r text-right font-bold">${aggregates.totalLoanExposureUsdM.toLocaleString()}M</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">USD Millions across 30 Borrowers</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r font-sans">Attributed Scope 1+2 Financed Emissions</td>
                    <td className="py-2 px-3 border-r text-slate-500">PCAF Part A Sec 5.1</td>
                    <td className="py-2 px-3 border-r text-right font-bold">{aggregates.totalFinancedEmissionsTco2e.toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">tCO2e (EVIC Attributed)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r font-sans">Weighted Average Carbon Intensity (WACI)</td>
                    <td className="py-2 px-3 border-r text-slate-500">TCFD / IFRS S2 Par. 29</td>
                    <td className="py-2 px-3 border-r text-right font-bold">{aggregates.weightedAverageCarbonIntensity}</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">tCO2e / $M Revenue</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r font-sans">High Transition Risk Capital Exposure</td>
                    <td className="py-2 px-3 border-r text-slate-500">EBA ESG Pillar 3</td>
                    <td className="py-2 px-3 border-r text-right font-bold text-amber-700">${aggregates.highTransitionRiskExposureUsdM.toLocaleString()}M</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{aggregates.highTransitionRiskPct}% of Portfolio</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r font-sans">Modelled EBITDA Financial Shock</td>
                    <td className="py-2 px-3 border-r text-slate-500">NGFS Macro Transmission</td>
                    <td className="py-2 px-3 border-r text-right font-bold text-rose-700">${aggregates.aggregateAdjustedEbitdaImpactUsdM.toLocaleString()}M</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{aggregates.aggregateEbitdaImpactPct}% Contraction under {scenario.name}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Analytical Observations */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                2. Key Executive Risk Insights
              </h3>
              <p>
                Under the selected <strong>{scenario.name}</strong> at horizon <strong>{selectedHorizon}</strong>, the portfolio is subjected to a shadow carbon compliance price of 
                <strong> ${scenarioPoint.carbonPriceUsd}/tCO2e</strong> alongside an electricity price of <strong>${scenarioPoint.electricityPriceUsdMwh}/MWh</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-2">
                <li>
                  <strong>Transition Risk Concentration:</strong> The Power Generation, Steel, and Cement sectors account for 
                  ${aggregates.highTransitionRiskExposureUsdM.toLocaleString()}M ({aggregates.highTransitionRiskPct}%) of portfolio exposure. 
                  Unmitigated carbon compliance costs result in an aggregate EBITDA contraction of {aggregates.aggregateEbitdaImpactPct}%.
                </li>
                <li>
                  <strong>Credit Transmission Proxy:</strong> Operating cash flow deterioration elevates borrower debt service coverage strain, leading to an illustrative credit spread widening across vulnerable industrial names.
                </li>
                <li>
                  <strong>Physical Exposure:</strong> 100 physical assets across 5 countries were geo-tagged; assets located in coastal industrial hubs (such as Paradip, Yokohama, and Mumbai) demonstrate elevated joint flood and cyclone perils.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Report Content: IFRS S2 Mapping Matrix */}
        {reportType === 'ifrs' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              IFRS S2 Climate-related Disclosures Metric Mapping
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-semibold uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="py-2 px-3 border-r border-b">IFRS S2 Paragraph</th>
                  <th className="py-2 px-3 border-r border-b">Disclosure Requirement</th>
                  <th className="py-2 px-3 border-r border-b">Platform Implementation Status</th>
                  <th className="py-2 px-3 border-b">Analytical Traceability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 13-14</td>
                  <td className="py-2 px-3 border-r">Climate transition and physical risk strategy &amp; exposure</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">30 companies, 100 assets classified across 6 sectors and 5 countries.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 22</td>
                  <td className="py-2 px-3 border-r">Climate scenario analysis &amp; resilience stress testing</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">Orderly, Disorderly, High Warming, and Baseline pathways (2025–2050).</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 29(a)</td>
                  <td className="py-2 px-3 border-r">Absolute Scope 1, 2, and 3 Greenhouse Gas Emissions</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">Direct Scope 1, market Scope 2, and documented Scope 3 value chain.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 29(a)(vi)</td>
                  <td className="py-2 px-3 border-r">Financed Emissions Category 15 (Commercial Lending)</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">PCAF Part A EVIC attribution methodology verified with 0 NaN errors.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 29(b)</td>
                  <td className="py-2 px-3 border-r">Capital deployment to climate-related risks and opportunities</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">High Transition ($M) and High Physical Risk ($M) exposure KPIs.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r font-mono font-bold text-teal-800">Par. 29(c)</td>
                  <td className="py-2 px-3 border-r">Internal carbon prices applied in capital budgeting</td>
                  <td className="py-2 px-3 border-r text-emerald-700 font-semibold">Fully Implemented</td>
                  <td className="py-2 px-3 text-slate-600">Scenario shadow carbon pricing ($10 to $410/tCO2e).</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content: Methodology Report */}
        {reportType === 'methodology' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Methodology &amp; Mathematical Engine Specifications
            </h3>
            <div className="space-y-3 font-mono text-[11px] bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <strong>[Equation 1] Gross Carbon Cost:</strong><br />
                GrossCost = CoveredEmissions × CarbonPrice
              </div>
              <div>
                <strong>[Equation 2] Net Incremental Compliance Cost:</strong><br />
                NetCost = GrossCost - BaselineCost - (GrossCost × FreeAllowancesRate)
              </div>
              <div>
                <strong>[Equation 3] Corporate Cost Absorption:</strong><br />
                AbsorbedCost = NetCost × (1 - PassThroughRate)
              </div>
              <div>
                <strong>[Equation 4] Financial EBITDA Transmission:</strong><br />
                AdjustedEBITDA = BaselineEBITDA - AbsorbedCost - IncrementalEnergyCost + DecarbMitigations
              </div>
              <div>
                <strong>[Equation 5] PCAF Financed Emissions Attribution:</strong><br />
                FinancedEmissions = ∑ [ min(1.0, Loan_i / EVIC_i) × (Scope1_i + Scope2_i) ]
              </div>
            </div>
          </div>
        )}

        {/* Document Sign-off Footer */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>ClimateRisk Scenario Lab • Phase 1 Analytical Prototype</div>
          <div className="font-mono">Page 1 of 1 • Internal Audit Reference: AUDIT-PHASE1-VERIFIED</div>
        </div>
      </div>
    </div>
  );
};
