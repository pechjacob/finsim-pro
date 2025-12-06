import { Account, FinancialItem, FormulaType, SimulationPoint, CompoundingPeriod } from '../types';
import { parseDate, addDays, formatDate } from '../utils';

export const runSimulation = (
  account: Account,
  items: FinancialItem[],
  startDateStr: string,
  endDateStr: string
): { points: SimulationPoint[], itemTotals: Record<string, number> } => {
  const points: SimulationPoint[] = [];
  const itemTotals: Record<string, number> = {};
  const itemContributions: Record<string, number> = {}; // Track cumulative contributions

  // Initialize totals and contributions
  items.forEach(i => {
    itemTotals[i.id] = 0;
    itemContributions[i.id] = 0;
  });

  let currentBalance = account.initialBalance;
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  // We simulate daily for accuracy, then can sample for the chart if needed, 
  // but for smooth charts, daily data is usually best unless range is huge.
  // To prevent crashing on massive ranges, we limit to ~3650 days (10 years) or similar in loop.

  const loopDate = new Date(startDate);

  // Optimization: Pre-process items to valid objects and sort by order
  const activeItems = items
    .filter(i => (i.accountId === account.id || i.toAccountId === account.id) && i.isEnabled !== false)
    .sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      return orderA - orderB;
    });

  let safetyCounter = 0;
  while (loopDate <= endDate && safetyCounter < 5000) {
    const dateStr = formatDate(loopDate);
    const dayOfMonth = loopDate.getDate();

    // Track balance before each individual item applies (for proper display)
    const itemStartBalances: Record<string, number> = {};

    // 1. Apply Events (Income / Expenses)
    activeItems.forEach(item => {
      const itemStart = parseDate(item.startDate);
      const itemEnd = item.endDate ? parseDate(item.endDate) : null;

      // Check date range
      if (loopDate < itemStart) return;
      if (itemEnd && loopDate > itemEnd) return;

      // Apply formulas
      // let applyAmount = 0; // Unused

      // Determine direction
      const isOutgoing = item.accountId === account.id && item.type !== 'income'; // If I own it and it's expense or transfer out
      const isIncoming = item.toAccountId === account.id || (item.accountId === account.id && item.type === 'income');

      // Skip effects for now, handle events
      if (item.type === 'effect') return;

      const rawAmount = item.amount || 0;
      const impact = isOutgoing ? -rawAmount : (isIncoming ? rawAmount : 0);

      // Capture balance BEFORE this specific item applies
      itemStartBalances[item.id] = currentBalance;

      if (item.formula === FormulaType.LUMP_SUM) {
        if (dateStr === item.startDate) {
          currentBalance += impact;
          itemTotals[item.id] += impact;
          itemContributions[item.id] += impact; // Track cumulative contribution
        }
      } else if (item.formula === FormulaType.MONTHLY_SUM) {
        const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
        const targetDay = itemStart.getDate();
        const effectiveDay = Math.min(targetDay, daysInMonth);

        if (dayOfMonth === effectiveDay) {
          currentBalance += impact;
          itemTotals[item.id] += impact;
          itemContributions[item.id] += impact; // Track cumulative contribution
        }
      } else if (item.formula === FormulaType.RECURRING_SUM) {
        const diff = Math.floor((loopDate.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && item.recurrenceDays && diff % item.recurrenceDays === 0) {
          currentBalance += impact;
          itemTotals[item.id] += impact;
          itemContributions[item.id] += impact; // Track cumulative contribution
        }
      }
    }); // This closing brace was missing for the forEach callback function.

    // Capture balance before effects are applied (for display purposes)
    const balanceBeforeEffects = currentBalance;

    // 2. Apply Effects (Interest / Compounding)
    // Usually happens at end of day
    activeItems.forEach(item => {
      if (item.type !== 'effect') return;

      const itemStart = parseDate(item.startDate);
      const itemEnd = item.endDate ? parseDate(item.endDate) : null;

      if (loopDate < itemStart) return;
      if (itemEnd && loopDate > itemEnd) return;

      // Capture balance BEFORE this specific effect applies
      itemStartBalances[item.id] = currentBalance;

      if (item.formula === FormulaType.COMPOUNDING && item.interestRate) {
        const period = item.compoundingPeriod || CompoundingPeriod.MONTHLY;
        const frequency = item.compoundingFrequency || 1;
        const customDays = item.compoundingCustomDays || 1;

        let shouldApply = false;

        // Calculate days since start
        const diffDays = Math.floor((loopDate.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return;

        if (period === CompoundingPeriod.DAILY) {
          // Frequency X times per day? Usually means every (1/X) days. 
          // For simplicity in daily loop, if freq > 1, we apply (rate/freq) X times.
          // If freq = 1, apply once.
          shouldApply = true;
        } else if (period === CompoundingPeriod.WEEKLY) {
          // Apply on the same day of week as start date
          // If frequency > 1, we need to distribute it? 
          // Let's assume Frequency means "X times per Period", evenly distributed if possible, 
          // or just applied X times at the end of the period for simplicity?
          // The prompt says "Interest Rate compounded X (frequency) times per X (period)".
          // Standard interpretation: Rate is nominal annual. 
          // If Monthly, Freq 1 => Apply 1/12th of rate once a month.
          // If Monthly, Freq 2 => Apply 1/24th of rate twice a month? 
          // Let's stick to: Apply ONCE at the end of the interval defined by (Period / Frequency).

          // Actually, let's simplify: Check if today is a "compounding day".
          // Weekly = 7 days. Interval = 7 / freq.
          // If interval is not integer, we accumulate? 
          // Let's assume Frequency = 1 for standard periods usually.
          // If Freq > 1, we check `diffDays % (PeriodDays / Freq) < 1`.

          const periodDays = 7;
          const interval = periodDays / frequency;
          // Check if we hit an interval boundary today
          // Using a small epsilon for float division or just round
          const currentIntervalCount = Math.floor((diffDays + 0.1) / interval);
          const prevIntervalCount = Math.floor((diffDays - 1 + 0.1) / interval);
          if (currentIntervalCount > prevIntervalCount) shouldApply = true;

        } else if (period === CompoundingPeriod.MONTHLY) {
          // Logic for monthly is tricky with days (28-31).
          // Simplest: Same day of month.
          // If Freq > 1, e.g. 2, apply on 1st and 15th?
          // Let's use the day-count approximation: 30.44 days?
          // OR: strict date check.
          if (frequency === 1) {
            const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
            const targetDay = itemStart.getDate();
            const effectiveDay = Math.min(targetDay, daysInMonth);
            if (loopDate.getDate() === effectiveDay) shouldApply = true;
          } else {
            // Approx interval
            const periodDays = 30.4375;
            const interval = periodDays / frequency;
            const currentIntervalCount = Math.floor((diffDays + 0.1) / interval);
            const prevIntervalCount = Math.floor((diffDays - 1 + 0.1) / interval);
            if (currentIntervalCount > prevIntervalCount) shouldApply = true;
          }
        } else if (period === CompoundingPeriod.QUARTERLY) {
          if (frequency === 1) {
            // Every 3 months
            const monthDiff = (loopDate.getFullYear() - itemStart.getFullYear()) * 12 + (loopDate.getMonth() - itemStart.getMonth());
            if (monthDiff > 0 && monthDiff % 3 === 0) {
              const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
              const targetDay = itemStart.getDate();
              const effectiveDay = Math.min(targetDay, daysInMonth);
              if (loopDate.getDate() === effectiveDay) shouldApply = true;
            }
          } else {
            const periodDays = 91.31; // 365.25 / 4
            const interval = periodDays / frequency;
            const currentIntervalCount = Math.floor((diffDays + 0.1) / interval);
            const prevIntervalCount = Math.floor((diffDays - 1 + 0.1) / interval);
            if (currentIntervalCount > prevIntervalCount) shouldApply = true;
          }
        } else if (period === CompoundingPeriod.ANNUALLY) {
          if (frequency === 1) {
            const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
            const targetDay = itemStart.getDate();
            const effectiveDay = Math.min(targetDay, daysInMonth);
            if (loopDate.getMonth() === itemStart.getMonth() && loopDate.getDate() === effectiveDay && loopDate.getFullYear() > itemStart.getFullYear()) shouldApply = true;
          } else {
            const periodDays = 365.25;
            const interval = periodDays / frequency;
            const currentIntervalCount = Math.floor((diffDays + 0.1) / interval);
            const prevIntervalCount = Math.floor((diffDays - 1 + 0.1) / interval);
            if (currentIntervalCount > prevIntervalCount) shouldApply = true;
          }
        } else if (period === CompoundingPeriod.CUSTOM) {
          const interval = customDays / frequency;
          const currentIntervalCount = Math.floor((diffDays + 0.1) / interval);
          const prevIntervalCount = Math.floor((diffDays - 1 + 0.1) / interval);
          if (currentIntervalCount > prevIntervalCount) shouldApply = true;
        }

        if (shouldApply) {
          // Rate Calculation
          // Nominal Annual Rate = item.interestRate
          // Rate per application = (AnnualRate / 100) / (ApplicationsPerYear)

          let appsPerYear = 1;
          if (period === CompoundingPeriod.DAILY) appsPerYear = 365 * frequency;
          else if (period === CompoundingPeriod.WEEKLY) appsPerYear = 52 * frequency;
          else if (period === CompoundingPeriod.MONTHLY) appsPerYear = 12 * frequency;
          else if (period === CompoundingPeriod.QUARTERLY) appsPerYear = 4 * frequency;
          else if (period === CompoundingPeriod.ANNUALLY) appsPerYear = 1 * frequency;
          else if (period === CompoundingPeriod.CUSTOM) appsPerYear = 365 / (customDays / frequency);

          const ratePerApp = (item.interestRate / 100) / appsPerYear;
          const interestAmount = currentBalance * ratePerApp;
          currentBalance += interestAmount;
          itemTotals[item.id] += interestAmount;
          itemContributions[item.id] += interestAmount; // Track cumulative contribution
        }
      } else if (item.formula === FormulaType.SIMPLE_INTEREST && item.interestRate) {
        // Simple Interest: Apply once per period based on the Period setting.
        // Frequency is ignored (assumed 1).
        const period = item.compoundingPeriod || CompoundingPeriod.ANNUALLY; // Default to Annual for Simple Interest if not set
        const customDays = item.compoundingCustomDays || 1;

        let shouldApply = false;
        const diffDays = Math.floor((loopDate.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return;

        if (period === CompoundingPeriod.DAILY) {
          shouldApply = true;
        } else if (period === CompoundingPeriod.WEEKLY) {
          // Apply every 7 days
          if (diffDays > 0 && diffDays % 7 === 0) shouldApply = true;
        } else if (period === CompoundingPeriod.MONTHLY) {
          // Apply on same day of month
          const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
          const targetDay = itemStart.getDate();
          const effectiveDay = Math.min(targetDay, daysInMonth);
          if (loopDate.getDate() === effectiveDay) shouldApply = true;
        } else if (period === CompoundingPeriod.QUARTERLY) {
          // Apply every 3 months
          const monthDiff = (loopDate.getFullYear() - itemStart.getFullYear()) * 12 + (loopDate.getMonth() - itemStart.getMonth());
          if (monthDiff > 0 && monthDiff % 3 === 0) {
            const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
            const targetDay = itemStart.getDate();
            const effectiveDay = Math.min(targetDay, daysInMonth);
            if (loopDate.getDate() === effectiveDay) shouldApply = true;
          }
        } else if (period === CompoundingPeriod.ANNUALLY) {
          // Apply once a year
          const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
          const targetDay = itemStart.getDate();
          const effectiveDay = Math.min(targetDay, daysInMonth);
          if (loopDate.getMonth() === itemStart.getMonth() && loopDate.getDate() === effectiveDay && loopDate.getFullYear() > itemStart.getFullYear()) shouldApply = true;
        } else if (period === CompoundingPeriod.CUSTOM) {
          if (diffDays > 0 && diffDays % customDays === 0) shouldApply = true;
        }

        if (shouldApply) {
          // Rate Calculation:
          // If Simple Interest is "5% Annually", and period is Annual, apply 5%.
          // If period is Monthly, apply 5% / 12.

          let appsPerYear = 1;
          if (period === CompoundingPeriod.DAILY) appsPerYear = 365;
          else if (period === CompoundingPeriod.WEEKLY) appsPerYear = 52;
          else if (period === CompoundingPeriod.MONTHLY) appsPerYear = 12;
          else if (period === CompoundingPeriod.QUARTERLY) appsPerYear = 4;
          else if (period === CompoundingPeriod.ANNUALLY) appsPerYear = 1;
          else if (period === CompoundingPeriod.CUSTOM) appsPerYear = 365 / customDays;

          const ratePerApp = (item.interestRate / 100) / appsPerYear;
          const interestAmount = currentBalance * ratePerApp;
          currentBalance += interestAmount;
          itemTotals[item.id] += interestAmount;
          itemContributions[item.id] += interestAmount; // Track cumulative contribution
        }
      }
    });

    points.push({
      date: dateStr,
      balance: currentBalance,
      balanceBeforeEffects,
      itemStartBalances,
      itemContributions: { ...itemContributions } // Snapshot of cumulative contributions
    });

    loopDate.setTime(addDays(loopDate, 1).getTime());
    safetyCounter++;
  }

  return { points, itemTotals };
};

export const calculateTotalDelta = (
  item: FinancialItem,
  viewStart: string,
  viewEnd: string
): number => {
  // Quick calculation for the bar display "Total gained/lost in view"
  const start = parseDate(viewStart);
  const end = parseDate(viewEnd);
  const itemStart = parseDate(item.startDate);
  const itemEnd = item.endDate ? parseDate(item.endDate) : null;

  let total = 0;
  let loopDate = new Date(start);

  if (item.type === 'effect') return 0; // Hard to calc distinct effect delta without full context

  while (loopDate <= end) {
    if (loopDate >= itemStart && (!itemEnd || loopDate <= itemEnd)) {
      const dayOfMonth = loopDate.getDate();
      const amount = item.amount || 0;

      if (item.formula === FormulaType.LUMP_SUM) {
        if (formatDate(loopDate) === item.startDate) total += amount;
      } else if (item.formula === FormulaType.MONTHLY_SUM) {
        const daysInMonth = new Date(loopDate.getFullYear(), loopDate.getMonth() + 1, 0).getDate();
        const targetDay = itemStart.getDate();
        const effectiveDay = Math.min(targetDay, daysInMonth);
        if (dayOfMonth === effectiveDay) total += amount;
      } else if (item.formula === FormulaType.RECURRING_SUM) {
        const diff = Math.floor((loopDate.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && item.recurrenceDays && diff % item.recurrenceDays === 0) {
          total += amount;
        }
      }
    }
    loopDate.setDate(loopDate.getDate() + 1);
  }
  return total;
}
