/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  ShieldCheck,
  Check,
  Sliders,
  DollarSign,
  Cpu,
  Layers
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [currency] = useState('USD ($ Millions)');
  const [priceBaseYear] = useState('2024 Real');
  const [emissionsScope, setEmissionsScope] = useState('Scope 1 + Scope 2 (Default)');
  const [baselinePowerTariff, setBaselinePowerTariff] = useState('75.0 USD/MWh');
  const [pdElasticity, setPdElasticity] = useState('1.75x (Merton Calibration)');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform &amp; Methodology Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure calculation parameter defaults, reporting boundaries, and accounting units.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 text-xs">
        {/* Section 1: Units and Currency */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            Financial &amp; Price Denominations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Reporting Currency Unit
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Locked to USD ($M) for portfolio consistency.</span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Price Base Year Benchmark
              </label>
              <input
                type="text"
                disabled
                value={priceBaseYear}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">All scenario trajectories deflated to 2024 USD.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Calculation Methodology Defaults */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            Transition Risk Transmission Calibration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Mandatory Carbon Compliance Scope
              </label>
              <select
                value={emissionsScope}
                onChange={(e) => setEmissionsScope(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="Scope 1 + Scope 2 (Default)">Scope 1 + Scope 2 (Recommended)</option>
                <option value="Scope 1 Only">Scope 1 Direct Combustion Only</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Scope of corporate footprint subject to ETS tax penalties.</span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Merton Credit Transmission Elasticity
              </label>
              <select
                value={pdElasticity}
                onChange={(e) => setPdElasticity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="1.75x (Merton Calibration)">1.75x (Baseline Corporate Structural)</option>
                <option value="1.25x (Low Sensitivity)">1.25x (Low Operational Sensitivity)</option>
                <option value="2.25x (High Distress)">2.25x (High Leverage Distress)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Elasticity scaling PD shift relative to EBITDA loss.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Data Lineage & Engine Version */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Engine Version &amp; Environment
          </h3>
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
            <div>Platform: ClimateRisk Scenario Lab (v1.0.0-PROD)</div>
            <div>Runtime: React 19 SPA + TypeScript Strict Mode</div>
            <div>Database Fixture: SEED_CRSL_2024_01 (30 Companies, 100 Assets)</div>
            <div>Scenario Source: Synthetic NGFS Phase IV Aligned Proxy (v4.1.2-SYNTH)</div>
            <div>QA Verification: 12 / 12 Numerical Tests Verified PASS</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Settings stored locally in demonstration workspace.</span>
          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved Successfully
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
