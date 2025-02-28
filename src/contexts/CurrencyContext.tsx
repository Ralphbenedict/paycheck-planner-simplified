
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Currency conversion rates
export const CONVERSION_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150.42,
  CAD: 1.36,
  // Southeast Asian currencies
  PHP: 56.20,    // Philippine Peso
  SGD: 1.35,     // Singapore Dollar
  MYR: 4.48,     // Malaysian Ringgit
  THB: 35.80,    // Thai Baht
  IDR: 15750,    // Indonesian Rupiah
  VND: 25150,    // Vietnamese Dong
};

export type CurrencyCode = keyof typeof CONVERSION_RATES;

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  // Southeast Asian currency symbols
  PHP: "₱",
  SGD: "S$",
  MYR: "RM",
  THB: "฿",
  IDR: "Rp",
  VND: "₫",
};

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertAmount: (amount: number) => number;
  getCurrencySymbol: () => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // Convert an amount from USD to the selected currency
  const convertAmount = (amount: number): number => {
    // If the currency is USD, no conversion needed
    if (currency === "USD") {
      return amount;
    }
    
    // The input amount is already in the selected currency, so we don't need to convert it
    return amount;
  };

  // Get the currency symbol for the current selected currency
  const getCurrencySymbol = (): string => {
    return CURRENCY_SYMBOLS[currency];
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      convertAmount,
      getCurrencySymbol
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook to use the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
