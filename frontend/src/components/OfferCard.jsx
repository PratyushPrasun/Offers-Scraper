import React, { useState } from 'react';
import { Copy, Check, Lock, Unlock, Sparkles } from 'lucide-react';
import { getBankTheme, calculateOfferSavings, formatDiscountDisplay } from '../utils/bankTheme';

export default function OfferCard({
  offer,
  cartAmount,
  onCopyCode,
  isManuallyUnlocked = false,
  onToggleUnlock,
}) {
  const [copied, setCopied] = useState(false);
  const theme = getBankTheme(offer.bank);
  const { savings, isUnlocked, remainingSpend, progress } = calculateOfferSavings(
    offer,
    cartAmount,
    isManuallyUnlocked
  );

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!offer.promo_code) return;
    navigator.clipboard.writeText(offer.promo_code);
    setCopied(true);
    if (onCopyCode) onCopyCode(offer.promo_code);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCredit = (offer.card_type || '').toLowerCase() === 'credit';
  const isDebit = (offer.card_type || '').toLowerCase() === 'debit';

  return (
    <div className={`relative flex flex-col justify-between rounded-xl bg-white border border-gray-200 ${theme.leftAccent} border-l-[3px] transition-all duration-200 hover:shadow-md hover:border-gray-300 group overflow-hidden`}>

      {/* Card Content */}
      <div className="p-4 sm:p-5">
        {/* Top: Bank Name + Card Type Badge + Unlock Status */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`font-bold text-sm tracking-wide uppercase ${theme.accent}`}>
            {theme.name}
          </span>

          <div className="flex items-center gap-1.5">
            {isCredit && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200/80">
                Credit
              </span>
            )}
            {isDebit && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sky-50 text-sky-600 border border-sky-200/80">
                Debit
              </span>
            )}
            {!isCredit && !isDebit && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-50 text-slate-600 border border-gray-200">
                {offer.card_type || 'Card'}
              </span>
            )}
          </div>
        </div>

        {/* Discount Headline */}
        <div className="mb-1.5">
          <div className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            {formatDiscountDisplay(offer)}
          </div>
        </div>

        {/* Offer Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {offer.title}
        </p>

        {/* Cart Calculator Feedback / Unlock Status */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          {cartAmount > 0 ? (
            <div>
              {isUnlocked ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Unlocked for ₹{Number(cartAmount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-extrabold">
                    Save ₹{savings.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <Lock className="w-3 h-3" />
                      Spend ₹{remainingSpend.toLocaleString('en-IN')} more
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleUnlock) onToggleUnlock();
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Unlock Now
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                {offer.amount_to_unlock ? (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Min. Spend: <strong className="text-slate-700">₹{offer.amount_to_unlock.toLocaleString('en-IN')}</strong></span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">No Minimum Spend</span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleUnlock) onToggleUnlock();
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isUnlocked
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
                title={isUnlocked ? 'Offer unlocked (click to toggle)' : 'Click to unlock offer'}
              >
                {isUnlocked ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Promo Code */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
        {offer.promo_code ? (
          <div className="flex items-center justify-between w-full p-1 pl-3 rounded-lg bg-gray-50 border border-gray-200 group-hover:border-gray-300 transition-colors">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-indigo-600 select-all">
              {offer.promo_code}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="w-full py-1.5 text-center text-[11px] font-medium text-slate-500 bg-gray-50 rounded-lg border border-gray-200">
            Auto-applied at checkout (No code needed)
          </div>
        )}
      </div>
    </div>
  );
}
