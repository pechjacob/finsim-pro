# FinSim Pro - Data Models

## Core Interfaces

### `Account`
Represents a financial container.
- `id`: Unique identifier (UUID).
- `name`: Display name (e.g., "Checking").
- `initialBalance`: Starting funds (currently defaulted to 0).

### `FinancialItem`
The central entity representing any financial event or rule.
- **Core Fields**:
  - `id`: UUID.
  - `accountId`: The account this item belongs to.
  - `type`: `'income' | 'expense' | 'transfer' | 'effect'`.
  - `name`: Display label.
  - `amount`: The base value (for non-effect types).
  - `startDate`: When the item becomes active.
  - `isEnabled`: Toggle for including/excluding in simulation.
  - `order`: Integer for controlling calculation sequence (drag-and-drop).

- **Logic Configuration**:
  - `formula`: Determines how the item behaves (`LUMP_SUM`, `RECURRING_SUM`, `COMPOUNDING`, etc.).
  - `recurrenceDays`: Interval in days for recurring items.
  - `interestRate`: Percentage for effects (e.g., 5.0 for 5%).
  - `compoundingPeriod`: Base interval for interest calculation (`DAILY`, `MONTHLY`, etc.).

### `SimulationPoint`
A single data point in the calculated time series.
- `date`: ISO date string.
- `balance`: The final calculated balance for this date.
- `balanceBeforeEffects`: Snapshot of balance before interest/effects ran for this day.
- `itemStartBalances`: A map (`Record<string, number>`) tracking the balance state *immediately before* a specific item was applied. Used for accurate "Principal" display in the UI.

## Enums

### `FormulaType`
- `LUMP_SUM`: One-time event.
- `MONTHLY_SUM`: Standard monthly recurrence (legacy/simplified).
- `RECURRING_SUM`: Flexible recurrence (every X days).
- `COMPOUNDING`: Interest calculation.

### `Frequency`
Used for chart granularity (`DAILY`, `WEEKLY`, `MONTHLY`, etc.).
