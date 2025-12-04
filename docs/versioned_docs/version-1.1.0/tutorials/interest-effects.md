---
sidebar_position: 3
---

# Using Interest Effects

Interest effects allow you to model growth (like investments) or debt (like loans) that compound over time.

## Scenario: High-Yield Savings Account

Let's model a savings account with a 4.5% APY.

### 1. Create the Account
1.  Create a new account named "HYSA".
2.  Set Initial Balance to `$5,000`.

### 2. Add Interest Formula
1.  In the sidebar, look for the **Interest / Formula** section (or toggle to Formula View).
2.  Click **+ Add Formula**.
3.  **Type:** "Compound Interest".
4.  **Rate:** `4.5%`.
5.  **Compounding:** "Monthly".
6.  Click **Save**.

### 3. Observe the Curve
Look at the chart. Unlike the straight lines of simple income/expenses, you should see a slight upward curve. This is the power of compound interest!

## Custom Formulas

For more complex scenarios, you can write custom math expressions.

**Example: Inflation Adjustment**
To model expenses increasing by 3% inflation each year:
`amount * (1.03 ^ (years))`

*(Note: Custom formula editor is an advanced feature enabled in settings)*
