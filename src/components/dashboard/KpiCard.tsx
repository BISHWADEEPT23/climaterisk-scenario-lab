/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { AuditDetails } from './FormulaAuditModal';

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  denominator?: string;
  changeText?: string;
  changePositive?: boolean;
  subtext?: string;
  scenarioTag?: string;
  auditDetails: AuditDetails;
  onAuditClick: (details: AuditDetails) => void;
  accentColor?: 'teal' | 'rose' | 'amber' | 'blue' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  denominator,
  changeText,
  changePositive,
  subtext,
  scenarioTag,
  auditDetails,
  onAuditClick,
  accentColor = 'teal'
}) => {
  const accentBorderMap = {
    teal: 'hover:border-teal-500/50',
    rose: 'hover:border-rose-500/50',
    amber: 'hover:border-amber-500/50',
    blue: 'hover:border-blue-500/50',
    purple: 'hover:border-purple-500/50'
  };

  const badgeColorMap = {
    teal: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    rose: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    amber: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    blue: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    purple: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900'
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-sm transition-all duration-200 ${accentBorderMap[accentColor]} group flex flex-col justify-between`}
    >
      {/* Top row: Title and Formula Inspector Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <button
            onClick={() => onAuditClick(auditDetails)}
            className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Inspect calculation methodology & formula"
            aria-label={`Audit formula for ${title}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Value & Unit */}
        <div className="flex items-baseline gap-1.5 flex-wrap my-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {value}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        </div>

        {/* Denominator if applicable */}
        {denominator && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 truncate">
            Denom: <span className="font-mono text-slate-600 dark:text-slate-400">{denominator}</span>
          </div>
        )}
      </div>

      {/* Footer / Context */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {changeText ? (
          <div className={`flex items-center gap-1 font-medium ${changePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {changePositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{changeText}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 truncate">{subtext || 'FY2024 Audited'}</span>
        )}

        {scenarioTag && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badgeColorMap[accentColor]}`}>
            {scenarioTag}
          </span>
        )}
      </div>
    </div>
  );
};
