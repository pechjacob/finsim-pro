import { Account, FinancialItem, FormulaType, SimulationPoint } from '../types';
import { parseDate, addDays, formatDate } from '../utils';

export const runSimulation = (
  account: Account,
  items: FinancialItem[],
  startDateStr: string,
  endDateStr: string
): SimulationPoint[] => {
  const points: SimulationPoint[] = [];
  
  let currentBalance = account.initialBalance;
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  
  // We simulate daily for accuracy, then can sample for the chart if needed, 
  // but for smooth charts, daily data is usually best unless range is huge.
  // To prevent crashing on massive ranges, we limit to ~3650 days (10 years) or similar in loop.
  
  const loopDate = new Date(startDate);
  
  // Optimization: Pre-process items to valid objects
  const activeItems = items.filter(i => i.accountId === account.id || i.toAccountId === account.id);

  let safetyCounter = 0;
  while (loopDate <= endDate && safetyCounter < 5000) {
    const dateStr = formatDate(loopDate);
    const dayOfMonth = loopDate.getDate();
    
    // 1. Apply Events (Income/Expense)
    activeItems.forEach(item => {
      const itemStart = parseDate(item.startDate);
      const itemEnd = item.endDate ? parseDate(item.endDate) : null;
      
      // Check date range
      if (loopDate < itemStart) return;
      if (itemEnd && loopDate > itemEnd) return;

      // Apply formulas
      let applyAmount = 0;
      
      // Determine direction
      const isOutgoing = item.accountId === account.id && item.type !== 'income'; // If I own it and it's expense or transfer out
      const isIncoming = item.toAccountId === account.id || (item.accountId === account.id && item.type === 'income');

      // Skip effects for now, handle events
      if (item.type === 'effect') return;

      const rawAmount = item.amount || 0;
      const impact = isOutgoing ? -rawAmount : (isIncoming ? rawAmount : 0);

      if (item.formula === FormulaType.LUMP_SUM) {
        if (dateStr === item.startDate) {
            currentBalance += impact;
        }
      } else if (item.formula === FormulaType.MONTHLY_SUM) {
        if (dayOfMonth === itemStart.getDate()) {
           currentBalance += impact;
        }
      } else if (item.formula === FormulaType.RECURRING_SUM) {
         const diff = Math.floor((loopDate.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
         if (diff >= 0 && item.recurrenceDays && diff % item.recurrenceDays === 0) {
             currentBalance += impact;
         }
      }
    });

    // 2. Apply Effects (Interest / Compounding)
    // Usually happens at end of day
    activeItems.forEach(item => {
        if (item.type !== 'effect') return;
        
        const itemStart = parseDate(item.startDate);
        const itemEnd = item.endDate ? parseDate(item.endDate) : null;
        
        if (loopDate < itemStart) return;
        if (itemEnd && loopDate > itemEnd) return;

        if (item.formula === FormulaType.COMPOUNDING && item.interestRate) {
             // Simple daily compounding approximation for smooth charts
             // rate is annual %. 
             const dailyRate = (item.interestRate / 100) / 365;
             currentBalance += currentBalance * dailyRate;
        }
    });

    points.push({
      date: dateStr,
      balance: currentBalance
    });

    loopDate.setDate(loopDate.getDate() + 1);
    safetyCounter++;
  }

  return points;
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
                 if (dayOfMonth === itemStart.getDate()) total += amount;
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
