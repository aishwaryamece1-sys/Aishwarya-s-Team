/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RainShieldProvider } from './context/RainShieldContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ForecastPage } from './pages/ForecastPage';
import { InundationPage } from './pages/InundationPage';
import { ImpactPage } from './pages/ImpactPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PresentationModeOverlay } from './components/PresentationModeOverlay';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RainShieldProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {/* Global Navigation Header */}
        <Header currentRoute={currentRoute} onNavigate={handleNavigate} />

        {/* Dynamic Route View */}
        <main className="flex-1 flex flex-col min-h-0">
          {currentRoute === '/' && <LandingPage onNavigate={handleNavigate} />}
          {currentRoute === '/dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentRoute === '/monitoring' && <MonitoringPage />}
          {currentRoute === '/forecast' && <ForecastPage />}
          {currentRoute === '/inundation' && <InundationPage />}
          {currentRoute === '/impact' && <ImpactPage />}
          {currentRoute === '/alerts' && <AlertsPage />}
          {currentRoute === '/history' && <HistoryPage onNavigate={handleNavigate} />}
          {(currentRoute === '/data-sources' || currentRoute === '/sources') && <DataSourcesPage />}
          {currentRoute === '/models' && <ModelsPage />}
          {currentRoute === '/reports' && <ReportsPage />}
          {currentRoute === '/architecture' && <ArchitecturePage />}
          {currentRoute === '/settings' && <SettingsPage />}
        </main>

        {/* Global Presentation Mode Overlay */}
        <PresentationModeOverlay />

        {/* Global Toast System */}
        <ToastContainer />
      </div>
    </RainShieldProvider>
  );
}
