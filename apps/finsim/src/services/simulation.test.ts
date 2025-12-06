import { describe, it, expect, beforeEach } from 'vitest';
import { runSimulation } from '../services/simulation';
import { Account, FinancialItem, FormulaType, CompoundingPeriod } from '../types';

describe('runSimulation - itemContributions', () => {
    let account: Account;
    let baseDate: string;

    beforeEach(() => {
        account = {
            id: 'acc-1',
            name: 'Test Account',
            initialBalance: 1000,
        };
        baseDate = '2025-01-01';
    });

    describe('Income tracking', () => {
        it('tracks LUMP_SUM income contribution', () => {
            const income: FinancialItem = {
                id: 'income-1',
                accountId: 'acc-1',
                name: 'Bonus',
                startDate: '2025-01-15',
                type: 'income',
                amount: 5000,
                formula: FormulaType.LUMP_SUM,
            };

            const result = runSimulation(account, [income], baseDate, '2025-01-31');

            // Before start date: contribution should be 0
            const beforePoint = result.points.find(p => p.date === '2025-01-14');
            expect(beforePoint?.itemContributions?.[income.id]).toBe(0);

            // On start date: contribution should be 5000
            const onPoint = result.points.find(p => p.date === '2025-01-15');
            expect(onPoint?.itemContributions?.[income.id]).toBe(5000);

            // After start date: contribution remains 5000 (cumulative)
            const afterPoint = result.points.find(p => p.date === '2025-01-31');
            expect(afterPoint?.itemContributions?.[income.id]).toBe(5000);
        });

        it('tracks MONTHLY_SUM income contribution', () => {
            const income: FinancialItem = {
                id: 'income-2',
                accountId: 'acc-1',
                name: 'Salary',
                startDate: '2025-01-15',
                type: 'income',
                amount: 1000,
                formula: FormulaType.MONTHLY_SUM,
            };

            const result = runSimulation(account, [income], baseDate, '2025-03-31');

            // First month
            const jan15 = result.points.find(p => p.date === '2025-01-15');
            expect(jan15?.itemContributions?.[income.id]).toBe(1000);

            // Second month (cumulative)
            const feb15 = result.points.find(p => p.date === '2025-02-15');
            expect(feb15?.itemContributions?.[income.id]).toBe(2000);

            // Third month (cumulative)
            const mar15 = result.points.find(p => p.date === '2025-03-15');
            expect(mar15?.itemContributions?.[income.id]).toBe(3000);
        });

        it('tracks RECURRING_SUM income contribution', () => {
            const income: FinancialItem = {
                id: 'income-3',
                accountId: 'acc-1',
                name: 'Weekly Side Hustle',
                startDate: '2025-01-01',
                type: 'income',
                amount: 200,
                formula: FormulaType.RECURRING_SUM,
                recurrenceDays: 7,
            };

            const result = runSimulation(account, [income], baseDate, '2025-01-22');

            // Day 1 (start)
            const day1 = result.points.find(p => p.date === '2025-01-01');
            expect(day1?.itemContributions?.[income.id]).toBe(200);

            // Day 8 (second occurrence)
            const day8 = result.points.find(p => p.date === '2025-01-08');
            expect(day8?.itemContributions?.[income.id]).toBe(400);

            // Day 15 (third occurrence)
            const day15 = result.points.find(p => p.date === '2025-01-15');
            expect(day15?.itemContributions?.[income.id]).toBe(600);

            // Day 22 (fourth occurrence)
            const day22 = result.points.find(p => p.date === '2025-01-22');
            expect(day22?.itemContributions?.[income.id]).toBe(800);
        });
    });

    describe('Expense tracking', () => {
        it('tracks LUMP_SUM expense contribution (negative)', () => {
            const expense: FinancialItem = {
                id: 'expense-1',
                accountId: 'acc-1',
                name: 'One-time Purchase',
                startDate: '2025-01-10',
                type: 'expense',
                amount: 500,
                formula: FormulaType.LUMP_SUM,
            };

            const result = runSimulation(account, [expense], baseDate, '2025-01-31');

            // Before: 0
            const before = result.points.find(p => p.date === '2025-01-09');
            expect(before?.itemContributions?.[expense.id]).toBe(0);

            // On date: -500
            const on = result.points.find(p => p.date === '2025-01-10');
            expect(on?.itemContributions?.[expense.id]).toBe(-500);

            // After: still -500 (cumulative)
            const after = result.points.find(p => p.date === '2025-01-31');
            expect(after?.itemContributions?.[expense.id]).toBe(-500);
        });

        it('tracks MONTHLY_SUM expense contribution (cumulative negative)', () => {
            const expense: FinancialItem = {
                id: 'expense-2',
                accountId: 'acc-1',
                name: 'Rent',
                startDate: '2025-01-01',
                type: 'expense',
                amount: 1500,
                formula: FormulaType.MONTHLY_SUM,
            };

            const result = runSimulation(account, [expense], baseDate, '2025-03-31');

            // Jan
            const jan1 = result.points.find(p => p.date === '2025-01-01');
            expect(jan1?.itemContributions?.[expense.id]).toBe(-1500);

            // Feb (cumulative)
            const feb1 = result.points.find(p => p.date === '2025-02-01');
            expect(feb1?.itemContributions?.[expense.id]).toBe(-3000);

            // Mar (cumulative)
            const mar1 = result.points.find(p => p.date === '2025-03-01');
            expect(mar1?.itemContributions?.[expense.id]).toBe(-4500);
        });
    });

    describe('Effect tracking (Interest)', () => {
        it('tracks COMPOUNDING interest contribution', () => {
            const effect: FinancialItem = {
                id: 'effect-1',
                accountId: 'acc-1',
                name: 'Savings Interest',
                startDate: '2025-01-01',
                type: 'effect',
                formula: FormulaType.COMPOUNDING,
                interestRate: 12, // 12% annual
                compoundingPeriod: CompoundingPeriod.MONTHLY,
                compoundingFrequency: 1,
            };

            const result = runSimulation(account, [effect], baseDate, '2025-03-31');

            // Day 1: interest applies immediately on start date
            const day1 = result.points.find(p => p.date === '2025-01-01');
            expect(day1?.itemContributions?.[effect.id]).toBeGreaterThanOrEqual(0);

            // Feb 1: interest has compounded (includes Jan 1 start + Feb 1)
            const feb1 = result.points.find(p => p.date === '2025-02-01');
            expect(feb1?.itemContributions?.[effect.id]).toBeGreaterThan(10);

            // Mar 1: more compounding (cumulative)
            const mar1 = result.points.find(p => p.date === '2025-03-01');
            expect(mar1?.itemContributions?.[effect.id]).toBeGreaterThan(20);
        });

        it('tracks SIMPLE_INTEREST contribution', () => {
            const effect: FinancialItem = {
                id: 'effect-2',
                accountId: 'acc-1',
                name: 'Simple Interest',
                startDate: '2025-01-01',
                type: 'effect',
                formula: FormulaType.SIMPLE_INTEREST,
                interestRate: 6, // 6% annual
                compoundingPeriod: CompoundingPeriod.MONTHLY,
            };

            const result = runSimulation(account, [effect], baseDate, '2025-03-01');

            // Feb 1: first month's interest applied
            const feb1 = result.points.find(p => p.date === '2025-02-01');
            expect(feb1?.itemContributions?.[effect.id]).toBeGreaterThan(0);

            // Mar 1: cumulative interest (includes start date)
            const mar1 = result.points.find(p => p.date === '2025-03-01');
            expect(mar1?.itemContributions?.[effect.id]).toBeGreaterThan(10);
        });
    });

    describe('Multiple items', () => {
        it('tracks contributions independently for each item', () => {
            const income: FinancialItem = {
                id: 'income-4',
                accountId: 'acc-1',
                name: 'Salary',
                startDate: '2025-01-01',
                type: 'income',
                amount: 1000,
                formula: FormulaType.MONTHLY_SUM,
            };

            const expense: FinancialItem = {
                id: 'expense-3',
                accountId: 'acc-1',
                name: 'Rent',
                startDate: '2025-01-01',
                type: 'expense',
                amount: 800,
                formula: FormulaType.MONTHLY_SUM,
            };

            const result = runSimulation(account, [income, expense], baseDate, '2025-02-28');

            // Jan 1
            const jan1 = result.points.find(p => p.date === '2025-01-01');
            expect(jan1?.itemContributions?.[income.id]).toBe(1000);
            expect(jan1?.itemContributions?.[expense.id]).toBe(-800);

            // Feb 1
            const feb1 = result.points.find(p => p.date === '2025-02-01');
            expect(feb1?.itemContributions?.[income.id]).toBe(2000);
            expect(feb1?.itemContributions?.[expense.id]).toBe(-1600);

            // Net balance should reflect both
            expect(feb1?.balance).toBe(1000 + (2000 - 1600)); // 1400
        });

        it('tracks 10+ items simultaneously', () => {
            const items: FinancialItem[] = Array.from({ length: 10 }, (_, i) => ({
                id: `item-${i}`,
                accountId: 'acc-1',
                name: `Item ${i}`,
                startDate: '2025-01-01',
                type: i % 2 === 0 ? 'income' : 'expense',
                amount: 100,
                formula: FormulaType.LUMP_SUM,
            }));

            const result = runSimulation(account, items, baseDate, '2025-01-15');

            const point = result.points.find(p => p.date === '2025-01-01');

            // All 10 items should have contributions tracked
            items.forEach((item, i) => {
                const expectedContribution = i % 2 === 0 ? 100 : -100;
                expect(point?.itemContributions?.[item.id]).toBe(expectedContribution);
            });
        });
    });

    describe('Edge cases', () => {
        it('handles empty items array', () => {
            const result = runSimulation(account, [], baseDate, '2025-01-31');
            expect(result.points).toBeDefined();
            expect(result.points.length).toBeGreaterThan(0);
        });

        it('handles item with endDate', () => {
            const income: FinancialItem = {
                id: 'income-5',
                accountId: 'acc-1',
                name: 'Contract Work',
                startDate: '2025-01-01',
                endDate: '2025-01-15',
                type: 'income',
                amount: 100,
                formula: FormulaType.RECURRING_SUM,
                recurrenceDays: 7,
            };

            const result = runSimulation(account, [income], baseDate, '2025-01-31');

            // Should apply on Jan 1, 8, 15 but NOT Jan 22 (after endDate)
            const jan22 = result.points.find(p => p.date === '2025-01-22');
            expect(jan22?.itemContributions?.[income.id]).toBe(300); // Still 300, not 400
        });

        it('handles disabled item (isEnabled: false)', () => {
            const income: FinancialItem = {
                id: 'income-6',
                accountId: 'acc-1',
                name: 'Disabled Income',
                startDate: '2025-01-01',
                type: 'income',
                amount: 1000,
                formula: FormulaType.LUMP_SUM,
                isEnabled: false,
            };

            const result = runSimulation(account, [income], baseDate, '2025-01-31');

            // Disabled items are filtered from simulation, but itemContributions is initialized for all items
            const point = result.points.find(p => p.date === '2025-01-15');
            expect(point?.itemContributions?.[income.id]).toBe(0); // Should be 0, not undefined
        });

        it('handles future start date', () => {
            const income: FinancialItem = {
                id: 'income-7',
                accountId: 'acc-1',
                name: 'Future Income',
                startDate: '2025-02-01',
                type: 'income',
                amount: 1000,
                formula: FormulaType.LUMP_SUM,
            };

            const result = runSimulation(account, [income], baseDate, '2025-02-15');

            // Before start date: 0
            const jan15 = result.points.find(p => p.date === '2025-01-15');
            expect(jan15?.itemContributions?.[income.id]).toBe(0);

            // After start date: 1000
            const feb15 = result.points.find(p => p.date === '2025-02-15');
            expect(feb15?.itemContributions?.[income.id]).toBe(1000);
        });
    });

    describe('Contribution totals match itemTotals', () => {
        it('final contribution equals itemTotal', () => {
            const income: FinancialItem = {
                id: 'income-8',
                accountId: 'acc-1',
                name: 'Test Income',
                startDate: '2025-01-01',
                type: 'income',
                amount: 500,
                formula: FormulaType.MONTHLY_SUM,
            };

            const result = runSimulation(account, [income], baseDate, '2025-03-31');

            const lastPoint = result.points[result.points.length - 1];
            const finalContribution = lastPoint.itemContributions?.[income.id] || 0;

            // Final contribution should match itemTotal
            expect(finalContribution).toBe(result.itemTotals[income.id]);
        });
    });
});
