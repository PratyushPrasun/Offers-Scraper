import React from 'react';
import { Calculator, Sparkles, X } from 'lucide-react';
import { calculateOfferSavings } from '../utils/bankTheme';

export default function CartCalculator({ cartAmount, setCartAmount, offers = [], unlockedIds = new Set() }) {
  const presets = [500, 1000, 1500, 5000, 10000];

  // Find best deal for current cart amount
  let bestDeal = null;
  let maxSavings = 0;
  let unlockedForCartCount = 0;

  if (cartAmount > 0) {
    for (const offer of offers) {
      const isManuallyUnlocked = unlockedIds instanceof Set ? unlockedIds.has(offer.promo_code || offer.title) : false;
      const { savings, isUnlocked } = calculateOfferSavings(offer, cartAmount, isManuallyUnlocked);
      if (isUnlocked) {
        unlockedForCartCount++;
        if (savings > maxSavings) {
          maxSavings = savings;
          bestDeal = { ...offer, savings };
        }
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
          <Calculator className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cart Savings</h3>
      </div>

      {/* Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold text-sm">
          ₹
        </span>
        <input
          type="number"
          min="0"
          step="50"
          value={cartAmount || ''}
          onChange={(e) => setCartAmount(e.target.value ? Math.max(0, Number(e.target.value)) : '')}
          placeholder="Enter cart value"
          className="w-full pl-7 pr-7 py-2 text-sm font-semibold rounded-lg bg-gray-50 border border-gray-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        />
        {cartAmount > 0 && (
          <button
            onClick={() => setCartAmount('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear input"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((val) => (
          <button
            key={val}
            onClick={() => setCartAmount(val)}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
              cartAmount === val
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-slate-600 border border-gray-200/50'
            }`}
          >
            ₹{val.toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      {/* Result card */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
        {cartAmount > 0 ? (
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Best Offer
              </span>
              <span className="text-emerald-600 font-semibold">
                {unlockedForCartCount} available
              </span>
            </div>

            {bestDeal ? (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {bestDeal.bank || 'Bank'} {bestDeal.card_type ? `${bestDeal.card_type.toUpperCase()}` : ''}
                  </div>
                  <div className="text-[11px] text-indigo-600 truncate mt-0.5">
                    {bestDeal.promo_code ? `Code: ${bestDeal.promo_code}` : bestDeal.title}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">You Save</div>
                  <div className="text-sm font-extrabold text-emerald-600">
                    ₹{maxSavings.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-relaxed">
                No unlocked offers at ₹{cartAmount}. Increase cart value to unlock deals.
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            💡 Set a cart value to see instant savings for each payment option.
          </p>
        )}
      </div>
    </div>
  );
}
