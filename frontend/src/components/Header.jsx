import React from 'react';
import { CreditCard, ShieldCheck, Tag, Layers } from 'lucide-react';
import { calculateOfferSavings } from '../utils/bankTheme';

export default function StatsBar({ offers = [], cartAmount = 0, unlockedIds = new Set() }) {
  const total = offers.length;
  const creditCount = offers.filter(o => (o.card_type || '').toLowerCase() === 'credit').length;
  const debitCount = offers.filter(o => (o.card_type || '').toLowerCase() === 'debit').length;
  
  // An offer is unlocked if:
  // 1. Manually unlocked by user, OR
  // 2. Unlocked based on cartAmount threshold, OR
  // 3. Inherently unlocked (no min spend or status is 'unlocked')
  const unlockedCount = offers.filter(o => {
    const offerKey = o.promo_code || o.title;
    const isManuallyUnlocked = unlockedIds instanceof Set ? unlockedIds.has(offerKey) : false;
    return calculateOfferSavings(o, cartAmount, isManuallyUnlocked).isUnlocked;
  }).length;

  const stats = [
    { label: 'Total Deals', value: total, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Credit', value: creditCount, icon: CreditCard, color: 'text-rose-600 bg-rose-50' },
    { label: 'Debit', value: debitCount, icon: Tag, color: 'text-sky-600 bg-sky-50' },
    { label: 'Unlocked', value: unlockedCount, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="bg-white border-b border-gray-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50/80 border border-gray-100 shrink-0"
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-slate-800">{stat.value}</span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
