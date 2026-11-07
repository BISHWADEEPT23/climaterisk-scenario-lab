/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Code, FileText, ArrowRight, Layers, ShieldCheck, Cpu } from 'lucide-react';

interface RoadmapModuleProps {
  moduleId: string;
  title: string;
  phaseTarget: 'Phase 2' | 'Phase 3';
  description: string;
  targetCapabilities: string[];
  plannedMethodology: string;
  calculationInterface: string;
}

export const RoadmapModule: React.FC<RoadmapModuleProps> = ({
  moduleId,
  title,
  phaseTarget,
  description,
  targetCapabilities,
  plannedMethodology,
  calculationInterface
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {phaseTarget} Architecture Scaffold
              </span>
              <span className="text-xs font-mono text-slate-400">Module ID: {moduleId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-slate-400 block">Strict QA Policy</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4" /> Zero Fabricated Outputs
            </span>
          </div>
        </div>

        {/* Architecture Notice */}
        <div className="pt-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
          <p>
            <strong>Phase 1 Integrity Guarantee:</strong> In accordance with the analytical specification, this module contains validated engineering interfaces and calculation contracts. 
            No speculative or fabricated numerical results are rendered until formal Phase 2/3 numerical calculation models and calibrated historical backtests are complete.
          </p>
        </div>
      </div>

      {/* Target Capabilities & Planned Methodology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Planned Capabilities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Planned Capabilities ({phaseTarget})
          </h3>
          <ul className="space-y-2">
            {targetCapabilities.map((cap, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span className="leading-snug">{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Planned Methodology & References */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Governing Methodology &amp; Standards
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {plannedMethodology}
          </p>
        </div>
      </div>

      {/* Scaffolding Code Contract / Calculation Interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-teal-600" />
          Scaffolded TypeScript Calculation Contract
        </h3>
        <pre className="p-4 rounded-lg bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
          {calculationInterface}
        </pre>
      </div>
    </div>
  );
};
