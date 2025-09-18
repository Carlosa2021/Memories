'use client';
import { createContext, useContext, useMemo, useState } from 'react';

type AutoTransactContextValue = {
  autoSign: boolean;
  setAutoSign: (v: boolean) => void;
};

const AutoTransactContext = createContext<AutoTransactContextValue | undefined>(
  undefined,
);

export function AutoTransactProvider({
  children,
  defaultAutoSign = false,
}: {
  children: React.ReactNode;
  defaultAutoSign?: boolean;
}) {
  const [autoSign, setAutoSign] = useState<boolean>(defaultAutoSign);
  const value = useMemo(() => ({ autoSign, setAutoSign }), [autoSign]);
  return (
    <AutoTransactContext.Provider value={value}>
      {children}
    </AutoTransactContext.Provider>
  );
}

export function useAutoSign() {
  const ctx = useContext(AutoTransactContext);
  if (!ctx)
    throw new Error('useAutoSign must be used within AutoTransactProvider');
  return ctx;
}
