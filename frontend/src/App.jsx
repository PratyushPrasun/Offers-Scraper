import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsBar from './components/Header';
import Sidebar from './components/Sidebar';
import OfferCard from './components/OfferCard';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import defaultOffersData from './data/offers.json';
import { calculateOfferSavings } from './utils/bankTheme';

export default function App() {
  const [offers, setOffers] = useState(defaultOffersData || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCardType, setSelectedCardType] = useState('');
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('discount_desc');
  const [cartAmount, setCartAmount] = useState('');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState(() => new Set());

  const toggleUnlock = (offerKey) => {
    setUnlockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(offerKey)) {
        next.delete(offerKey);
      } else {
        next.add(offerKey);
      }
      return next;
    });
  };

  // Fetch offers dynamically from API or static public file
  const loadOffers = async () => {
    setIsRefreshing(true);
    try {
      // Try /api/offers first (if python server is running), then /offers.json
      let res;
      try {
        res = await fetch('/api/offers');
      } catch {
        res = await fetch('/offers.json');
      }

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOffers(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch fresh offers.json, using bundled data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Show copy toast
  const handleCopyCode = (code) => {
    setToast({ message: code, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 2500);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBank('');
    setSelectedCardType('');
    setUnlockedOnly(false);
  };

  // Distinct list of banks
  const banks = useMemo(() => {
    const set = new Set();
    offers.forEach((o) => {
      if (o.bank) set.add(o.bank.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [offers]);

  // Filter and Sort Offers
  const filteredOffers = useMemo(() => {
    let result = [...offers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          (o.title && o.title.toLowerCase().includes(q)) ||
          (o.bank && o.bank.toLowerCase().includes(q)) ||
          (o.promo_code && o.promo_code.toLowerCase().includes(q)) ||
          (o.card_type && o.card_type.toLowerCase().includes(q))
      );
    }

    // Bank filter
    if (selectedBank) {
      result = result.filter(
        (o) => o.bank && o.bank.toLowerCase() === selectedBank.toLowerCase()
      );
    }

    // Card Type filter
    if (selectedCardType) {
      result = result.filter(
        (o) => o.card_type && o.card_type.toLowerCase().includes(selectedCardType)
      );
    }

    // Unlocked Only filter
    if (unlockedOnly) {
      result = result.filter((o) => {
        const offerKey = o.promo_code || o.title;
        const isManuallyUnlocked = unlockedIds.has(offerKey);
        return calculateOfferSavings(o, cartAmount, isManuallyUnlocked).isUnlocked;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'discount_desc') {
        const valA = a.discount_value || 0;
        const valB = b.discount_value || 0;
        return valB - valA;
      }
      if (sortBy === 'spend_asc') {
        const spendA = a.amount_to_unlock || 0;
        const spendB = b.amount_to_unlock || 0;
        return spendA - spendB;
      }
      if (sortBy === 'bank_asc') {
        const bankA = a.bank || 'ZZZ';
        const bankB = b.bank || 'ZZZ';
        return bankA.localeCompare(bankB);
      }
      return 0;
    });

    return result;
  }, [offers, searchQuery, selectedBank, selectedCardType, unlockedOnly, sortBy, cartAmount, unlockedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f8]">
      {/* Slim top navbar */}
      <Navbar
        offers={offers}
        onRefresh={loadOffers}
        isRefreshing={isRefreshing}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Stats strip */}
      <StatsBar offers={offers} cartAmount={cartAmount} unlockedIds={unlockedIds} />

      {/* Main layout: Sidebar + Content */}
      <div className="flex-1 flex">
        {/* Sidebar: filters + cart calculator */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          selectedCardType={selectedCardType}
          setSelectedCardType={setSelectedCardType}
          unlockedOnly={unlockedOnly}
          setUnlockedOnly={setUnlockedOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
          banks={banks}
          cartAmount={cartAmount}
          setCartAmount={setCartAmount}
          offers={offers}
          totalCount={offers.length}
          filteredCount={filteredOffers.length}
          unlockedIds={unlockedIds}
        />

        {/* Main content: Offer cards grid */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 xl:p-8">
          {filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredOffers.map((offer, idx) => (
                <OfferCard
                  key={`${offer.promo_code || offer.title}-${idx}`}
                  offer={offer}
                  cartAmount={cartAmount}
                  onCopyCode={handleCopyCode}
                  isManuallyUnlocked={unlockedIds.has(offer.promo_code || offer.title)}
                  onToggleUnlock={() => toggleUnlock(offer.promo_code || offer.title)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            ⚡ <span className="text-slate-700 font-medium">Zepto Offers Hub</span> · Scraped live from Zepto Web
          </p>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>CLI: <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">python display.py</code></span>
            <span>Scrape: <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">python scrape.py</code></span>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </div>
  );
}
