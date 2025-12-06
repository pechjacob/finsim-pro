---
sidebar_position: 4
---

# API Reference

This section documents the core data structures used in FinSim Pro.

## Core Types

### Account

Represents a financial account (e.g., Checking, Savings).

```typescript
export interface Account {
  id: string;
  name: string;
  initialBalance: number;
}
```

### FinancialItem

Represents an event or effect that modifies the account balance (Income, Expense, Transfer, Interest).

```typescript
export interface FinancialItem {
  id: string;
  accountId: string; // The "owner" account
  toAccountId?: string; // For transfers
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  type: 'income' | 'expense' | 'transfer' | 'effect';
  amount?: number;
  formula: FormulaType;
  isEnabled?: boolean;
  
  // Recurring specifics
  recurrenceDays?: number; // "Every X Days"
  
  // Effect specifics (Interest)
  interestRate?: number; // %
  compoundingPeriod?: CompoundingPeriod;
}
```

### SimulationPoint

Represents a single data point in the calculated simulation timeline.

```typescript
export interface SimulationPoint {
  date: string;
  balance: number;
}
```

## Enums

### Frequency

Granularity of the chart view.

```typescript
export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}
```

### FormulaType

Calculation method for the item.

```typescript
export enum FormulaType {
  LUMP_SUM = 'LUMP_SUM',
  MONTHLY_SUM = 'MONTHLY_SUM',
  RECURRING_SUM = 'RECURRING_SUM',
  COMPOUNDING = 'COMPOUNDING',
  SIMPLE_INTEREST = 'SIMPLE_INTEREST'
}
```
