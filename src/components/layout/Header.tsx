/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Printer,
  Terminal,
  ShieldCheck,
  Compass,
  Building2
} from 'lucide-react';
import { ScenarioType, TimeHorizon } from '../../types/climate';
import { SCENARIO_CATALOG } from '../../data/scenarios';

interface HeaderProps {
  currentModuleName: string;
  activeScenarioId: ScenarioType;
  activeHorizon: TimeHorizon;
  onScenarioChange: (s: ScenarioType) => void;
  onHorizonChange: (h: TimeHorizon) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebarMobile: () => void;
  onOpenTestRunner: () => void;
  onNavigateToReports: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModuleName,
  activeScenarioId,
  activeHorizon,
  onScenarioChange,
  onHorizonChange,
  isDarkMode,
  onToggleDarkMode,
  onToggleSidebarMobile,
  onOpenTestRunner,
  onNavigateToReports
}) => {
  const scenario = SCENARIO_CATALOG[activeScenarioId] || SCENARIO_CATALOG.orderly;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {currentModuleName}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Portfolio: 30 Synthetic Corporates ($8.7B EAD)</span>
            <span>•</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              Active: {scenario.name.split(' ')[0]} ({activeHorizon})
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Quick Scenario, Horizon, Test Runner, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Scenario Quick Selector (Hidden on tiny screens) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Compass className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <select
            value={activeScenarioId}
            onChange={(e) => onScenarioChange(e.target.value as ScenarioType)}
            className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none pr-2 py-0.5 cursor-pointer"
          >
            <option value="orderly">Orderly (1.5°C)</option>
            <option value="disorderly">Disorderly</option>
            <option value="high_warming">High Warming (&gt;3°C)</option>
            <option value="baseline">Baseline</option>
          </select>
        </div>

        {/* Horizon Quick Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono">
          {[2025, 2030, 2040, 2050].map(h => (
            <button
              key={h}
              onClick={() => onHorizonChange(h as TimeHorizon)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                activeHorizon === h
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Test Runner Button */}
        <button
          onClick={onOpenTestRunner}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
          title="Run 12 Mandatory Numerical Tests"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Run Tests</span>
        </button>

        {/* Print / Report Button */}
        <button
          onClick={onNavigateToReports}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Generate Printable Report"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
