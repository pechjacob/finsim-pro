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
    COMPOUNDING = 'COMPOUNDING'
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
    
    // Recurring specifics
    recurrenceDays?: number; // "Every X Days"
    
    // Effect specifics (Interest)
    interestRate?: number; // Annual %
    compoundsPerYear?: number; // 12 for monthly, 1 for yearly
  }
  
  export interface SimulationPoint {
    date: string;
    balance: number;
    [key: string]: number | string; // dynamic keys for multiple accounts if needed
  }
  
  export interface ViewSettings {
    startDate: string;
    endDate: string;
    granularity: Frequency;
  }
  