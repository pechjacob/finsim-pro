---
sidebar_position: 4
---

# Formulas & Interest

FinSim Pro goes beyond simple income and expenses by supporting **Formulas**. These allow you to model complex financial behaviors like compound interest, inflation, or variable rates.

## Formula Types

### 1. Compound Interest
Applies a percentage growth to the account balance.
*   **Rate:** The annual interest rate (e.g., 5%).
*   **Compounding:** How often interest is applied (Monthly, Yearly, Daily).

**Example:**
A savings account with 5% APY compounding monthly.

### 2. Simple Interest
Applies interest based only on the principal amount (not including previously earned interest).

### 3. Custom Formulas
For advanced users, you can write custom mathematical expressions using variables.

**Available Variables:**
*   `b` = Current Balance
*   `t` = Time (days since start)
*   `d` = Day of month
*   `m` = Month (1-12)

**Example:**
`b * 0.05 / 12` (Apply 5% annual interest monthly)

## Formula View
Click the **Flip** icon in the timeline header to switch to **Formula View**. This view visualizes the mathematical effects being applied to your balance over time, rather than just the cash flow events.

<!-- TODO: Add screenshot of formula editor -->
