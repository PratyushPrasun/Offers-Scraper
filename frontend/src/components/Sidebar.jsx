import React from 'react';
import { Search, ArrowUpDown, X, Lock, Unlock, SlidersHorizontal } from 'lucide-react';
import CartCalculator from './CartCalculator';

export default function Sidebar({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  selectedBank,
  setSelectedBank,
  selectedCardType,
  setSelectedCardType,
  unlockedOnly,
  setUnlockedOnly,
  sortBy,
  setSortBy,
  banks = [],
  cartAmount,
  setCartAmount,
  offers = [],
  totalCount,
  filteredCount,
  unlockedIds = new Set(),
}) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="p-4 sm:p-5 space-y-5">

          {/* Mobile close header */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2 text-slate-700">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bank, card, promo code…"
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bank dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-lg bg-gray-50 border border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
            >
              <option value="">All Banks</option>
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Card Type</label>
            <div className="flex gap-1.5 p-1 rounded-lg bg-gray-100 border border-gray-200/50">
              {[
                { value: '', label: 'All' },
                { value: 'credit', label: 'Credit' },
                { value: 'debit', label: 'Debit' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedCardType(opt.value)}
                  className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    selectedCardType === opt.value
                      ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sort By</label>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="discount_desc">Highest Discount</option>
                <option value="spend_asc">Lowest Min Spend</option>
                <option value="bank_asc">Bank Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Unlocked Toggle */}
          <div>
            <button
              onClick={() => setUnlockedOnly(!unlockedOnly)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                unlockedOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-gray-50 text-slate-500 border-gray-200 hover:text-slate-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {unlockedOnly ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                Unlocked Only
              </span>
              <span className={`w-8 h-[18px] rounded-full relative transition-colors ${
                unlockedOnly ? 'bg-emerald-500' : 'bg-gray-300'
              }`}>
                <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${
                  unlockedOnly ? 'left-[17px]' : 'left-[2px]'
                }`} />
              </span>
            </button>
          </div>

          {/* Result count */}
          <div className="text-xs text-slate-500 font-medium pt-0.5">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalCount} offers
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Cart Calculator (compact) */}
          <CartCalculator
            cartAmount={cartAmount}
            setCartAmount={setCartAmount}
            offers={offers}
            unlockedIds={unlockedIds}
          />
        </div>
      </aside>
    </>
  );
}
