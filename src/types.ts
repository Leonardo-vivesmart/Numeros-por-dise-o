export type Currency = 'USD' | 'EUR' | 'MXN' | 'COP' | 'PEN' | 'CLP';

export interface CompanyInfo {
  name: string;
  currency: Currency;
}

export interface Goals {
  pyf: number;
  mpyf: number;
  spyf: number;
}

export interface SalesData {
  [year: number]: {
    [month: number]: number | null;
  };
}

export interface AppState {
  companyInfo: CompanyInfo;
  years: number[];
  salesData: SalesData;
  goals: Goals;
}
