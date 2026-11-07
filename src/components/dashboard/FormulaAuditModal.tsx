/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Calculator, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

export interface AuditDetails {
  title: string;
  metricCode: string;
  unit: string;
  denominator: string;
  formula: string;
  inputs: Record<string, string | number>;
  numericalTrace: string[];
  regulatoryReference: string;
  methodologyNote: string;
}

interface FormulaAuditModalProps {
  details: AuditDetails | null;
  onClose: () => void;
}

export const FormulaAuditModal: React.FC<FormulaAuditModalProps> = ({ details, onClose }) => {
  if (!details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-lg border border-teal-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {details.title}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
                  {details.metricCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Traceable Numerical Methodology & Audit Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-600 dark:text-slate-300">
          {/* Formula Card */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs border border-slate-800 shadow-inner">
            <div className="text-[11px] text-teal-400 font-sans font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Mathematical Formula</span>
            </div>
            <div className="text-sm font-semibold text-teal-200 py-1 overflow-x-auto">
              {details.formula}
            </div>
            <div className="text-slate-400 mt-2 text-[11px] flex gap-4">
              <span><strong>Unit:</strong> {details.unit}</span>
              <span><strong>Denominator:</strong> {details.denominator}</span>
            </div>
          </div>

          {/* Active Inputs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Parameters & Active Inputs
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(details.inputs).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{key}</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Numerical Calculation Trace */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Traceable Calculation Step-by-Step
            </h4>
            <div className="space-y-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              {details.numericalTrace.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-teal-600 dark:text-teal-400 font-bold">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory & Methodology Note */}
          <div className="p-3.5 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Standard Alignment: {details.regulatoryReference}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {details.methodologyNote}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
