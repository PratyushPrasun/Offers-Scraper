import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-800 shadow-lg animate-slide-up">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">Promo Code Copied!</p>
        <p className="text-xs text-slate-500 font-mono">{message}</p>
      </div>
    </div>
  );
}
