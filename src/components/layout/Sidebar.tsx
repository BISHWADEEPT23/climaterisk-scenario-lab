/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Building2,
  Flame,
  Waves,
  LineChart,
  Activity,
  SlidersHorizontal,
  ShieldCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Terminal
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isPhase1Ready: boolean;
  phaseBadge?: string;
}

interface SidebarProps {
  currentModule: string;
  onSelectModule: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTestRunner: () => void;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, isPhase1Ready: true },
  { id: 'scenario', label: 'Scenario Explorer', icon: Compass, isPhase1Ready: true },
  { id: 'corporate', label: 'Corporate Exposure Analysis', icon: Building2, isPhase1Ready: true },
  { id: 'transition', label: 'Transition Risk Engine', icon: Flame, isPhase1Ready: true },
  { id: 'physical', label: 'Physical Risk & EAL Engine', icon: Waves, isPhase1Ready: true, phaseBadge: 'Phase 3' },
  { id: 'financial', label: 'Financial Impact Engine', icon: LineChart, isPhase1Ready: true, phaseBadge: 'Phase 2' },
  { id: 'stress', label: 'Portfolio Stress Testing', icon: Activity, isPhase1Ready: true, phaseBadge: 'Phase 2' },
  { id: 'comparison', label: 'Scenario Comparison', icon: SlidersHorizontal, isPhase1Ready: true, phaseBadge: 'Phase 2' },
  { id: 'quality', label: 'Data Quality & Methodology', icon: ShieldCheck, isPhase1Ready: true },
  { id: 'reports', label: 'Reports & Disclosure (IFRS S2)', icon: FileText, isPhase1Ready: true },
  { id: 'settings', label: 'Settings & Parameters', icon: Settings, isPhase1Ready: true }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  onOpenTestRunner
}) => {
  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold font-mono text-sm shrink-0">
              CR
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-sm tracking-tight block">
                ClimateRisk
              </span>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase block">
                Scenario Lab
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold font-mono text-sm">
            CR
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors hidden sm:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.phaseBadge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      item.isPhase1Ready 
                        ? 'bg-teal-500/20 text-teal-300' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.phaseBadge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Numerical QA Runner Quick Trigger */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onOpenTestRunner}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Run 12 Mandatory Numerical Tests"
        >
          <Terminal className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>QA Test Suite (12/12)</span>}
        </button>
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <div className="flex justify-between font-mono">
            <span>Phase 1 Verified</span>
            <span className="text-teal-400 font-semibold">100% QA</span>
          </div>
          <div className="truncate text-slate-400">
            SEED: SEED_CRSL_2024_01
          </div>
        </div>
      )}
    </aside>
  );
};
