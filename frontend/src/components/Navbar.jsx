import React from 'react';
import { Zap, RefreshCw, Menu } from 'lucide-react';
import { calculateOfferSavings } from '../utils/bankTheme';

export default function Navbar({ offers = [], onRefresh, isRefreshing, onToggleSidebar, cartAmount = 0, unlockedIds = new Set() }) {
  const total = offers.length;
    const unlockedCount = offers.filter(o => {
      const offerKey = o.promo_code || o.title;
      const isManuallyUnlocked = unlockedIds instanceof Set ? unlockedIds.has(offerKey) : false;
      return calculateOfferSavings(o, cartAmount, isManuallyUnlocked).isUnlocked;
    }).length;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle filters"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Zepto Offers
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              Live
            </span>
          </div>
        </div>

        {/* Right: Summary + Refresh */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-slate-500 font-medium">
            {total} offers&ensp;·&ensp;{unlockedCount} unlocked
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer shadow-sm"
            title="Reload offers data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Reloading…' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
