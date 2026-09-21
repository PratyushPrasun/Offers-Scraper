import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function EmptyState({ onReset }) {
  return (
    <div className="rounded-xl p-10 sm:p-14 text-center bg-white border border-gray-200 shadow-sm">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">No matching offers</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
        Try adjusting your search, bank selection, or clear the active filters.
      </p>
      <button
        onClick={onReset}
        className="mt-5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-sm"
      >
        Reset All Filters
      </button>
    </div>
  );
}
