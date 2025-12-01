---
sidebar_position: 2
---

# Data Models

Understanding the underlying data structures can help when working with advanced features or contributing to the project.

## Account

Represents a financial container (e.g., Checking, Savings).

```typescript
interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  initialBalance: number;
  interestRate: number; // APY
  color: string;
}
```

## FinancialItem (Event)

Represents a single income or expense rule.

```typescript
interface FinancialItem {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  isEnabled: boolean;
}
```

## SimulationPoint

A single data point on the chart, representing the state at a specific time.

```typescript
interface SimulationPoint {
  date: string; // ISO Date string
  balance: number;
  events: string[]; // IDs of events that occurred on this day
}
```
