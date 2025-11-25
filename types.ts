export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum FormulaType {
  LUMP_SUM = 'LUMP_SUM',
  MONTHLY_SUM = 'MONTHLY_SUM',
  RECURRING_SUM = 'RECURRING_SUM',
  COMPOUNDING = 'COMPOUNDING',
  SIMPLE_INTEREST = 'SIMPLE_INTEREST'
}

export enum CompoundingPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  CUSTOM = 'CUSTOM'
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
}

export interface FinancialItem {
  id: string;
  accountId: string; // The "owner" account or "From" account
  toAccountId?: string; // For transfers
  name: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate?: string; // ISO Date string YYYY-MM-DD
  type: 'income' | 'expense' | 'transfer' | 'effect';
  amount?: number; // For income/expense/transfer
  formula: FormulaType;
  order?: number; // For custom drag-and-drop ordering
  isEnabled?: boolean;

  // Recurring specifics
  recurrenceDays?: number; // "Every X Days"
  isCustomRecurrence?: boolean; // Track if user selected Custom occurrence mode

  // Effect specifics (Interest)
  interestRate?: number; // %
  compoundingPeriod?: CompoundingPeriod;
  compoundingCustomDays?: number;
  compoundingFrequency?: number; // Application per period
}

export interface SimulationPoint {
  date: string;
  balance: number;
  balanceBeforeEffects?: number;
  itemStartBalances?: Record<string, number>; // Balance before each specific item applies (keyed by item ID)
  [key: string]: number | string | undefined | Record<string, number>; // dynamic keys for multiple accounts if needed
}

export interface ProjectState {
  version: number;
  accounts: Account[];
  items: FinancialItem[];
  viewSettings: {
    startDate: string;
    endDate: string;
    granularity: Frequency;
  };
  activeAccountId: string;
}

export interface ViewSettings {
  startDate: string;
  endDate: string;
  granularity: Frequency;
}
