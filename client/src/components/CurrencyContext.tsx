import { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: "usd" | "inr";
  setCurrency: (currency: "usd" | "inr") => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");

  useEffect(() => {
    const saved = localStorage.getItem("phoenix-currency") as "usd" | "inr";
    if (saved) setCurrency(saved);
  }, []);

  const handleSetCurrency = (newCurrency: "usd" | "inr") => {
    setCurrency(newCurrency);
    localStorage.setItem("phoenix-currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
