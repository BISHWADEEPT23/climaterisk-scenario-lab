/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ScenarioExplorer } from './components/scenario/ScenarioExplorer';
import { CorporateExposureView } from './components/companies/CorporateExposureView';
import { TransitionRiskView } from './components/transition/TransitionRiskView';
import { PhysicalRiskView } from './components/physical/PhysicalRiskView';
import { DataQualityView } from './components/governance/DataQualityView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { FinancialImpactView } from './components/financial/FinancialImpactView';
import { PortfolioStressTestingView } from './components/stress/PortfolioStressTestingView';
import { ScenarioComparisonView } from './components/comparison/ScenarioComparisonView';
import { TestRunnerModal } from './components/tests/TestRunnerModal';

import { SYNTHETIC_COMPANIES } from './data/syntheticCompanies';
import { SYNTHETIC_ASSETS } from './data/syntheticAssets';
import { ScenarioType, TimeHorizon } from './types/climate';

export default function App() {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioType>('orderly');
  const [activeHorizon, setActiveHorizon] = useState<TimeHorizon>(2030);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getModuleName = (id: string) => {
    switch (id) {
      case 'dashboard': return 'Executive Climate Risk Dashboard';
      case 'scenario': return 'Scenario Explorer & Trajectories';
      case 'corporate': return 'Corporate Exposure Analysis';
      case 'transition': return 'Transition Risk Financial Transmission';
      case 'physical': return 'Physical Peril Asset Catalog';
      case 'financial': return 'Financial Impact Engine (Multi-Year Projections)';
      case 'stress': return 'Portfolio Climate Stress Testing & Capital Adequacy';
      case 'comparison': return 'Advanced Scenario Comparison & Attribution';
      case 'quality': return 'Data Quality, Lineage & Assumptions';
      case 'reports': return 'Reports & IFRS S2 Disclosure Mapping';
      case 'settings': return 'Platform Settings & Calibration';
      default: return 'ClimateRisk Scenario Lab';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop & Collapsible Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(id) => {
          setCurrentModule(id);
          setIsMobileSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Analytical Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Global Toolbar Header */}
        <Header
          currentModuleName={getModuleName(currentModule)}
          activeScenarioId={activeScenarioId}
          activeHorizon={activeHorizon}
          onScenarioChange={setActiveScenarioId}
          onHorizonChange={setActiveHorizon}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenTestRunner={() => setIsTestRunnerOpen(true)}
          onNavigateToReports={() => setCurrentModule('reports')}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950/90">
          <div className="max-w-7xl mx-auto">
            {/* Module 1: Executive Dashboard */}
            {currentModule === 'dashboard' && (
              <ExecutiveDashboard
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
                onScenarioChange={setActiveScenarioId}
                onHorizonChange={setActiveHorizon}
                onNavigateToModule={setCurrentModule}
              />
            )}

            {/* Module 2: Scenario Explorer */}
            {currentModule === 'scenario' && (
              <ScenarioExplorer
                activeScenarioId={activeScenarioId}
                activeHorizon={activeHorizon}
                onScenarioChange={setActiveScenarioId}
                onHorizonChange={setActiveHorizon}
              />
            )}

            {/* Module 3: Corporate Exposure Analysis */}
            {currentModule === 'corporate' && (
              <CorporateExposureView
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
              />
            )}

            {/* Module 4: Transition Risk Engine */}
            {currentModule === 'transition' && (
              <TransitionRiskView
                companies={SYNTHETIC_COMPANIES}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
              />
            )}

            {/* Module 5: Physical Risk & Geospatial Loss Engine */}
            {currentModule === 'physical' && (
              <PhysicalRiskView assets={SYNTHETIC_ASSETS} companies={SYNTHETIC_COMPANIES} />
            )}

            {/* Module 6: Financial Impact Engine */}
            {currentModule === 'financial' && (
              <FinancialImpactView
                companies={SYNTHETIC_COMPANIES}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
                onScenarioChange={setActiveScenarioId}
              />
            )}

            {/* Module 7: Portfolio Stress Testing */}
            {currentModule === 'stress' && (
              <PortfolioStressTestingView
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
                onScenarioChange={setActiveScenarioId}
                onHorizonChange={setActiveHorizon}
              />
            )}

            {/* Module 8: Scenario Comparison */}
            {currentModule === 'comparison' && (
              <ScenarioComparisonView
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
                selectedHorizon={activeHorizon}
                onHorizonChange={setActiveHorizon}
              />
            )}

            {/* Module 9: Data Quality & Methodology */}
            {currentModule === 'quality' && (
              <DataQualityView
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
              />
            )}

            {/* Module 10: Reports & Disclosure Mapping */}
            {currentModule === 'reports' && (
              <ReportsView
                companies={SYNTHETIC_COMPANIES}
                assets={SYNTHETIC_ASSETS}
                selectedScenarioId={activeScenarioId}
                selectedHorizon={activeHorizon}
              />
            )}

            {/* Module 11: Settings */}
            {currentModule === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
}
