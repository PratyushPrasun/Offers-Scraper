// Bank branding and theme utilities — Light mode

export const BANK_CONFIG = {
  SBI: {
    name: "SBI",
    accent: "text-blue-600",
    leftAccent: "border-l-blue-400",
  },
  ICICI: {
    name: "ICICI",
    accent: "text-orange-600",
    leftAccent: "border-l-orange-400",
  },
  HDFC: {
    name: "HDFC",
    accent: "text-sky-600",
    leftAccent: "border-l-sky-400",
  },
  AXIS: {
    name: "Axis",
    accent: "text-rose-600",
    leftAccent: "border-l-rose-400",
  },
  INDUSIND: {
    name: "IndusInd",
    accent: "text-red-600",
    leftAccent: "border-l-red-400",
  },
  RBL: {
    name: "RBL",
    accent: "text-indigo-600",
    leftAccent: "border-l-indigo-400",
  },
  KOTAK: {
    name: "Kotak",
    accent: "text-red-600",
    leftAccent: "border-l-red-400",
  },
  "INDIAN BANK": {
    name: "Indian Bank",
    accent: "text-emerald-600",
    leftAccent: "border-l-emerald-400",
  },
  DEFAULT: {
    name: "Bank Offer",
    accent: "text-indigo-600",
    leftAccent: "border-l-indigo-400",
  },
};

export function getBankTheme(bankName) {
  if (!bankName) return BANK_CONFIG.DEFAULT;
  const upper = bankName.toUpperCase();
  for (const key of Object.keys(BANK_CONFIG)) {
    if (upper.includes(key)) {
      return BANK_CONFIG[key];
    }
  }
  return {
    ...BANK_CONFIG.DEFAULT,
    name: bankName,
  };
}

export function calculateOfferSavings(offer, cartAmount, manuallyUnlocked = false) {
  const unlockThreshold = offer.amount_to_unlock || 0;
  const isInherentlyUnlocked = unlockThreshold <= 0 || (offer.status || "").toLowerCase() === "unlocked";

  if (manuallyUnlocked) {
    const effectiveAmount = cartAmount > 0 ? cartAmount : (unlockThreshold > 0 ? unlockThreshold : 1000);
    let savings = 0;
    if (offer.discount_type === "percent" && offer.discount_value) {
      const calculated = (effectiveAmount * offer.discount_value) / 100;
      savings = offer.max_discount ? Math.min(calculated, offer.max_discount) : calculated;
    } else if (offer.discount_type === "flat" && offer.discount_value) {
      savings = offer.discount_value;
    } else if (offer.discount_type === "cashback" && offer.discount_value) {
      savings = offer.discount_value;
    }
    return {
      savings: Math.round(savings),
      isUnlocked: true,
      remainingSpend: 0,
      progress: 100,
    };
  }

  if (!cartAmount || cartAmount <= 0) {
    return {
      savings: 0,
      isUnlocked: isInherentlyUnlocked,
      remainingSpend: isInherentlyUnlocked ? 0 : unlockThreshold,
      progress: isInherentlyUnlocked ? 100 : 0,
    };
  }

  // If cart is entered, offer is unlocked if inherently unlocked OR cart >= threshold
  const isUnlocked = isInherentlyUnlocked || cartAmount >= unlockThreshold;
  const remainingSpend = isUnlocked ? 0 : Math.max(0, unlockThreshold - cartAmount);
  const progress = unlockThreshold > 0 
    ? Math.min(100, Math.round((cartAmount / unlockThreshold) * 100))
    : 100;

  let savings = 0;
  if (isUnlocked) {
    if (offer.discount_type === "percent" && offer.discount_value) {
      const calculated = (cartAmount * offer.discount_value) / 100;
      savings = offer.max_discount ? Math.min(calculated, offer.max_discount) : calculated;
    } else if (offer.discount_type === "flat" && offer.discount_value) {
      savings = offer.discount_value;
    } else if (offer.discount_type === "cashback" && offer.discount_value) {
      savings = offer.discount_value;
    }
  }

  return {
    savings: Math.round(savings),
    isUnlocked,
    remainingSpend: Math.round(remainingSpend),
    progress,
  };
}

export function formatDiscountDisplay(offer) {
  const { discount_type, discount_value, max_discount } = offer;
  if (discount_type === "percent" && discount_value) {
    const pct = `${discount_value}% OFF`;
    return max_discount ? `${pct} up to ₹${max_discount.toLocaleString("en-IN")}` : pct;
  }
  if (discount_type === "flat" && discount_value) {
    return `₹${discount_value.toLocaleString("en-IN")} FLAT OFF`;
  }
  if (discount_type === "cashback" && discount_value) {
    return `₹${discount_value.toLocaleString("en-IN")} CASHBACK`;
  }
  return offer.title || "Special Offer";
}
