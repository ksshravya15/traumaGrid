import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NetworkBanner } from './components/NetworkBanner';
import { BystanderTriagePage } from './pages/BystanderTriagePage';
import { ResponderDashboardPage } from './pages/ResponderDashboardPage';
import { FirstAidPage } from './pages/FirstAidPage';
import { useNetworkStatus } from './hooks/useNetworkStatus';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    return window.location.pathname === '/dashboard' ? 'dashboard' : 'bystander';
  });

  const {
    status: networkStatus,
    simulatedMode,
    setSimulatedMode,
    offlineCount,
    isSyncing,
    triggerAutoSync,
  } = useNetworkStatus();

  // URL Sync
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/dashboard') {
        setActivePage('dashboard');
      } else if (window.location.pathname === '/first-aid') {
        setActivePage('first-aid');
      } else {
        setActivePage('bystander');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    const path = page === 'dashboard' ? '/dashboard' : page === 'first-aid' ? '/first-aid' : '/';
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-trauma-dark text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        networkStatus={networkStatus}
        offlineCount={offlineCount}
        onSync={triggerAutoSync}
        isSyncing={isSyncing}
      />

      {/* Bandwidth & Network Simulation Ribbon */}
      <NetworkBanner
        status={networkStatus}
        simulatedMode={simulatedMode}
        onSetMode={setSimulatedMode}
        offlineCount={offlineCount}
        onSync={triggerAutoSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'bystander' && (
          <BystanderTriagePage onNavigate={handleNavigate} networkStatus={networkStatus} />
        )}
        {activePage === 'dashboard' && <ResponderDashboardPage />}
        {activePage === 'first-aid' && <FirstAidPage onNavigate={handleNavigate} />}
      </main>

      {/* Global Footer with Safety Disclaimer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-semibold text-slate-400">
            TraumaGrid • 24-Hour Hackathon Prototype • Not Clinically Validated
          </p>
          <p className="text-[11px] leading-relaxed">
            TraumaGrid is an assistive triage prototype engineered for research, edge AI demonstration, and low-bandwidth telemetry testing. It does not replace professional emergency medical assessment. Always contact emergency dispatch (108 / 112 / 911) immediately.
          </p>
          <p className="text-[10px] font-mono text-slate-600">
            Edge CV • Remote Photoplethysmography • START/RTS Heuristics • WebSocket Telemetry
          </p>
        </div>
      </footer>
    </div>
  );
}
