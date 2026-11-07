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
  CartesianGrid
} from 'recharts';
import {
  Download,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SCENARIO_CATALOG } from '../../data/scenarios';
import { ScenarioType, TimeHorizon, Sector } from '../../types/climate';
import { interpolateScenarioForYear } from '../../engine/scenarioInterpolation';

interface ScenarioExplorerProps {
  activeScenarioId: ScenarioType;
  activeHorizon: TimeHorizon;
  onScenarioChange: (id: ScenarioType) => void;
  onHorizonChange: (h: TimeHorizon) => void;
}

export const ScenarioExplorer: React.FC<ScenarioExplorerProps> = ({
  activeScenarioId,
  activeHorizon,
  onScenarioChange,
  onHorizonChange
}) => {
  const [selectedVariable, setSelectedVariable] = useState<string>('carbonPriceUsd');
  const [selectedSector, setSelectedSector] = useState<Sector>('Power Generation');
  const [yearSliderValue, setYearSliderValue] = useState<number>(activeHorizon);
  const [comparedScenarios, setComparedScenarios] = useState<ScenarioType[]>([
    'orderly',
    'disorderly',
    'high_warming',
    'baseline'
  ]);

  const currentScenario = SCENARIO_CATALOG[activeScenarioId] || SCENARIO_CATALOG.orderly;

  // Interpolated point for whatever year is currently set on slider (2025 to 2050)
  const dynamicPoint = useMemo(() => {
    return interpolateScenarioForYear(currentScenario, yearSliderValue);
  }, [currentScenario, yearSliderValue]);

  // Trajectory series for the selected variable across selected compared scenarios
  const trajectoryData = useMemo(() => {
    const years: number[] = [];
    for (let y = 2025; y <= 2050; y++) {
      years.push(y);
    }

    return years.map(yr => {
      const row: Record<string, number | string | boolean> = { year: yr };
      comparedScenarios.forEach(scenKey => {
        const scenDef = SCENARIO_CATALOG[scenKey];
        if (scenDef) {
          const pt = interpolateScenarioForYear(scenDef, yr);
          if (selectedVariable === 'carbonPriceUsd') {
            row[scenDef.name] = pt.carbonPriceUsd;
          } else if (selectedVariable === 'tempAnomalyCelsius') {
            row[scenDef.name] = pt.tempAnomalyCelsius;
          } else if (selectedVariable === 'electricityPriceUsdMwh') {
            row[scenDef.name] = pt.electricityPriceUsdMwh;
          } else if (selectedVariable === 'energyDemandIndex') {
            row[scenDef.name] = pt.energyDemandIndex;
          } else if (selectedVariable === 'gdpImpactPct') {
            row[scenDef.name] = pt.gdpImpactPct;
          } else if (selectedVariable === 'inflationBps') {
            row[scenDef.name] = pt.inflationBps;
          } else if (selectedVariable === 'sectorDecarb') {
            row[scenDef.name] = pt.sectorEmissionsReductionPct[selectedSector] || 0;
          }
        }
      });
      return row;
    });
  }, [comparedScenarios, selectedVariable, selectedSector]);

  // Sector decarbonization breakdown for active scenario at selected year
  const sectorDecarbBreakdown = useMemo(() => {
    const sectors: Sector[] = [
      'Power Generation',
      'Steel',
      'Cement',
      'Automotive',
      'Commercial Real Estate',
      'Agriculture'
    ];
    return sectors.map(sec => ({
      sector: sec,
      reductionPct: dynamicPoint.sectorEmissionsReductionPct[sec] || 0
    }));
  }, [dynamicPoint]);

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Year', ...comparedScenarios.map(s => SCENARIO_CATALOG[s].name)];
    const rows = trajectoryData.map(r => {
      return [r.year, ...comparedScenarios.map(s => r[SCENARIO_CATALOG[s].name])].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `climaterisk_scenario_${selectedVariable}_2025_2050.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVariableUnit = () => {
    switch (selectedVariable) {
      case 'carbonPriceUsd': return 'USD / tCO2e';
      case 'tempAnomalyCelsius': return '°C Anomaly';
      case 'electricityPriceUsdMwh': return 'USD / MWh';
      case 'energyDemandIndex': return 'Index (2025=100)';
      case 'gdpImpactPct': return '% GDP Delta';
      case 'inflationBps': return 'Basis Points';
      case 'sectorDecarb': return '% Emissions Cut';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scenario Selection & Metadata Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {currentScenario.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentScenario.sourceVersion} • Base Year: {currentScenario.priceBaseYear} USD
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentScenario.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Provider: <strong className="text-slate-700 dark:text-slate-300">{currentScenario.provider}</strong> | {currentScenario.ngfsAlignment}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeScenarioId}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioType)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
            >
              <option value="orderly">Orderly (Net Zero 2050)</option>
              <option value="disorderly">Disorderly (Delayed Action)</option>
              <option value="high_warming">High Warming (Hot House World)</option>
              <option value="baseline">Baseline (Current Policies)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Narrative & Assumptions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              Scenario Narrative & Policy Mechanism
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentScenario.narrativeSummary}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-600" /> Key Model Drivers
            </h4>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-1 text-[11px]">
              {currentScenario.keyAssumptions.slice(0, 3).map((asm, i) => (
                <li key={i} className="leading-snug">{asm}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Variable Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Variable Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2">
            Scenario Variable:
          </span>
          {[
            { id: 'carbonPriceUsd', label: 'Carbon Price ($/t)' },
            { id: 'tempAnomalyCelsius', label: 'Temperature (°C)' },
            { id: 'electricityPriceUsdMwh', label: 'Wholesale Power ($/MWh)' },
            { id: 'energyDemandIndex', label: 'Energy Demand' },
            { id: 'gdpImpactPct', label: 'GDP Delta (%)' },
            { id: 'sectorDecarb', label: 'Sector Decarb (%)' }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVariable(v.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedVariable === v.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Sector sub-filter if sectorDecarb is chosen */}
        {selectedVariable === 'sectorDecarb' && (
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as Sector)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="Power Generation">Power Generation</option>
            <option value="Steel">Steel</option>
            <option value="Cement">Cement</option>
            <option value="Automotive">Automotive</option>
            <option value="Commercial Real Estate">Commercial Real Estate</option>
            <option value="Agriculture">Agriculture</option>
          </select>
        )}

        {/* Dynamic Year Slider */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Simulation Year</span>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {yearSliderValue} {dynamicPoint.isInterpolated ? '(Interpolated)' : '(Anchor)'}
            </span>
          </div>
          <input
            type="range"
            min="2025"
            max="2050"
            step="1"
            value={yearSliderValue}
            onChange={(e) => {
              const val = Number(e.target.value);
              setYearSliderValue(val);
              if ([2025, 2030, 2035, 2040, 2045, 2050].includes(val)) {
                onHorizonChange(val as TimeHorizon);
              }
            }}
            className="w-32 accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Macro-Climate Trajectory Comparison (2025–2050)</span>
              <span className="text-xs font-normal text-slate-400 font-mono">[{getVariableUnit()}]</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side comparison across Orderly, Disorderly, High Warming, and Baseline pathways
            </p>
          </div>
          <div className="text-xs flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              {dynamicPoint.provenanceLabel}
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: getVariableUnit(), angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                formatter={(val, name) => [`${val} ${getVariableUnit()}`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey={SCENARIO_CATALOG.orderly.name} stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey={SCENARIO_CATALOG.disorderly.name} stroke="#e11d48" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              <Line type="monotone" dataKey={SCENARIO_CATALOG.high_warming.name} stroke="#ea580c" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey={SCENARIO_CATALOG.baseline.name} stroke="#64748b" strokeWidth={1.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Decarbonization Targets at Active Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Sector Decarbonization Intensity Targets ({yearSliderValue})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Required % emissions reduction relative to 2025 baseline under {currentScenario.name}
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorDecarbBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 10.5, fill: '#64748b' }} width={120} />
                <Tooltip
                  formatter={(val) => [`${val}% Reduction`, 'Target Decarbonization']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="reductionPct" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Scenario Metadata Registry */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Scenario Metadata & Audit Registry
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Scenario Identifier</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{currentScenario.id.toUpperCase()}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Data Lineage / Provider</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{currentScenario.provider}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Model Release Version</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{currentScenario.sourceVersion}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Publication Date</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{currentScenario.publicationDate}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Price Base Year</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{currentScenario.priceBaseYear} USD Real</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-850 flex justify-between">
              <span className="text-slate-500">Published Anchor Horizons</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">2025, 2030, 2035, 2040, 2045, 2050</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
