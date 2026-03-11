import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, Currency, Goals, SalesData } from './types';

const STORAGE_KEY = 'numeros_por_diseno_data';

const currentYear = new Date().getFullYear();
const defaultYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const defaultState: AppState = {
  companyInfo: {
    name: '',
    currency: 'USD',
  },
  years: defaultYears,
  salesData: defaultYears.reduce((acc, year) => {
    acc[year] = Array.from({ length: 12 }).reduce<Record<number, number | null>>((mAcc, _, i) => {
      mAcc[i] = null;
      return mAcc;
    }, {});
    return acc;
  }, {} as SalesData),
  goals: {
    pyf: 100000,
    mpyf: 150000,
    spyf: 200000,
  },
};

interface AppContextType {
  state: AppState;
  updateCompanyInfo: (info: Partial<AppState['companyInfo']>) => void;
  updateSalesData: (year: number, month: number, value: number | null) => void;
  updateGoals: (goals: Partial<Goals>) => void;
  addYear: (year: number) => void;
  removeYear: (year: number) => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure salesData structure exists for all years in parsed.years
        parsed.years.forEach((year: number) => {
          if (!parsed.salesData[year]) {
            parsed.salesData[year] = Array.from({ length: 12 }).reduce<Record<number, number | null>>((acc, _, i) => {
              acc[i] = null;
              return acc;
            }, {});
          }
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateCompanyInfo = useCallback((info: Partial<AppState['companyInfo']>) => {
    setState((prev) => ({ ...prev, companyInfo: { ...prev.companyInfo, ...info } }));
  }, []);

  const updateSalesData = useCallback((year: number, month: number, value: number | null) => {
    setState((prev) => ({
      ...prev,
      salesData: {
        ...prev.salesData,
        [year]: {
          ...prev.salesData[year],
          [month]: value,
        },
      },
    }));
  }, []);

  const updateGoals = useCallback((goals: Partial<Goals>) => {
    setState((prev) => ({ ...prev, goals: { ...prev.goals, ...goals } }));
  }, []);

  const addYear = useCallback((year: number) => {
    setState((prev) => {
      if (prev.years.includes(year)) return prev;
      const newYears = [...prev.years, year].sort((a, b) => a - b);
      const newSalesData = { ...prev.salesData };
      if (!newSalesData[year]) {
        newSalesData[year] = Array.from({ length: 12 }).reduce<Record<number, number | null>>((acc, _, i) => {
          acc[i] = null;
          return acc;
        }, {});
      }
      return { ...prev, years: newYears, salesData: newSalesData };
    });
  }, []);

  const removeYear = useCallback((year: number) => {
    setState((prev) => {
      const newYears = prev.years.filter((y) => y !== year);
      const newSalesData = { ...prev.salesData };
      delete newSalesData[year];
      return { ...prev, years: newYears, salesData: newSalesData };
    });
  }, []);

  const clearData = useCallback(() => {
    if (window.confirm('¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.')) {
      setState(defaultState);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        updateCompanyInfo,
        updateSalesData,
        updateGoals,
        addYear,
        removeYear,
        clearData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
