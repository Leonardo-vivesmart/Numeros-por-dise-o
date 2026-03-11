import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function formatCurrency(value: number | null | undefined, currency: string) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function calculateAnnualTotal(sales: { [month: number]: number | null }) {
  if (!sales) return 0;
  return Object.values(sales).reduce((sum, val) => (sum || 0) + (val || 0), 0) || 0;
}

export function calculateMonthlyAverage(sales: { [month: number]: number | null }) {
  if (!sales) return 0;
  const values = Object.values(sales).filter((v) => v !== null && v > 0);
  if (values.length === 0) return 0;
  const sum = values.reduce((s, v) => (s || 0) + (v || 0), 0) || 0;
  return sum / values.length;
}

export function calculateYTD(sales: { [month: number]: number | null }, currentMonthIndex: number) {
  if (!sales) return 0;
  let sum = 0;
  for (let i = 0; i <= currentMonthIndex; i++) {
    sum += sales[i] || 0;
  }
  return sum;
}

export function calculateYoYGrowth(currentValue: number | null, previousValue: number | null) {
  if (!currentValue || !previousValue || previousValue === 0) return null;
  return (currentValue - previousValue) / previousValue;
}

// Proyecciones
export function calculateProjections(
  currentYearSales: { [month: number]: number | null },
  previousYearSales: { [month: number]: number | null } | undefined
) {
  // Find the last month with data
  let lastMonthWithData = -1;
  for (let i = 11; i >= 0; i--) {
    if (currentYearSales[i] !== null && currentYearSales[i] !== undefined) {
      lastMonthWithData = i;
      break;
    }
  }

  const currentMonthIndex = lastMonthWithData >= 0 ? lastMonthWithData : 0;
  const ytd = calculateYTD(currentYearSales, currentMonthIndex);
  const remainingMonths = 11 - currentMonthIndex;
  
  if (remainingMonths === 0 || lastMonthWithData === -1) {
    return {
      conservative: ytd,
      realistic: ytd,
      aggressive: ytd,
    };
  }

  const currentMonthlyAverage = calculateMonthlyAverage(currentYearSales);
  
  // Conservative: Assume remaining months will be like last year's remaining months
  let conservativeRemaining = 0;
  if (previousYearSales) {
    for (let i = currentMonthIndex + 1; i < 12; i++) {
      conservativeRemaining += previousYearSales[i] || 0;
    }
  } else {
    conservativeRemaining = currentMonthlyAverage * remainingMonths;
  }

  // Realistic: Assume remaining months will be like current year's average
  const realisticRemaining = currentMonthlyAverage * remainingMonths;

  // Aggressive: Assume remaining months will grow by 15% over current average
  const aggressiveRemaining = currentMonthlyAverage * 1.15 * remainingMonths;

  return {
    conservative: ytd + conservativeRemaining,
    realistic: ytd + realisticRemaining,
    aggressive: ytd + aggressiveRemaining,
  };
}
