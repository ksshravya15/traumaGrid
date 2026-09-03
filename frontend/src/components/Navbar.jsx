import React from 'react';
import { Activity, ShieldAlert, Radio, HelpCircle, RefreshCw } from 'lucide-react';

export function Navbar({ activePage, onNavigate, networkStatus, offlineCount, onSync, isSyncing }) {
  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'weak_2g':
        return {
          icon: '🟡',
          text: 'Simulated 2G / LoRa',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'offline':
        return {
          icon: '🔴',
          text: 'Offline Mode',
          color: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      case 'online':
      default:
        return {
          icon: '🟢',
          text: 'Online',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const badge = getNetworkBadge();

  return (
    <header className="sticky top-0 z-40 bg-trauma-panel/95 backdrop-blur-md border-b border-trauma-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('bystander')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">TRAUMAGRID</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-tight font-medium">
              AI Golden-Hour Triage • Ultra-Low Bandwidth
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onNavigate('bystander')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activePage === 'bystander'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Triage</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activePage === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="hidden xs:inline">Command</span> Center
          </button>

          <button
            onClick={() => onNavigate('first-aid')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1 ${
              activePage === 'first-aid'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="First-Aid Protocols"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </nav>

        {/* Network & Offline Status */}
        <div className="flex items-center space-x-2">
          {offlineCount > 0 && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center space-x-1 animate-pulse"
              title="Click to manually sync queued offline packets"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{offlineCount} queued</span>
            </button>
          )}

          <div
            className={`px-2.5 py-1 rounded-full border text-xs font-mono flex items-center space-x-1.5 ${badge.color}`}
          >
            <span className="text-[10px]">{badge.icon}</span>
            <span className="hidden md:inline font-medium">{badge.text}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
