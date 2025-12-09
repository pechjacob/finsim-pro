import React from 'react';
import { FinancialItem, FormulaType } from '../types';
import { formatCurrency } from '../utils';
import { calculateTotalDelta } from '../services/simulation';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { GripVertical } from 'lucide-react';

interface FormulaDisplayProps {
    items: FinancialItem[];
    selectedItemIds?: Set<string>;
    onItemClick?: (id: string) => void;
    viewStartDate?: string;
    viewEndDate?: string;
    simulationPoints?: { date: string; balance: number; itemStartBalances?: Record<string, number>; }[];
    itemTotals?: Record<string, number>;
    showIndividualSeries?: boolean;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
    items,
    selectedItemIds,
    onItemClick,
    viewStartDate,
    viewEndDate,
    simulationPoints = [],
    itemTotals = {},
    showIndividualSeries = true, // Default to true if not provided
}) => {
    // Helper to get variable name
    const getVarName = (item: FinancialItem) => {
        if (item.type === 'income') return `I_{${item.name.charAt(0).toLowerCase()}}`;
        if (item.type === 'expense') return `E_{${item.name.charAt(0).toLowerCase()}}`;
        return `L_{${item.name.charAt(0).toLowerCase()}}`; // Default/Savings
    };

    // Helper to get account balance at event start date (matches SortableEventItem logic)
    const getBalanceAtStart = (item: FinancialItem): number => {
        const point = simulationPoints?.find(p => p.date === item.startDate);
        return point?.itemStartBalances?.[item.id] ?? 0;
    };

    return (
        <div className="px-2 pt-1 pb-2">
            <div className="space-y-2">
                {items.map(item => {
                    const isIncome = item.type === 'income';
                    const isExpense = item.type === 'expense';
                    const isEffect = item.type === 'effect';
                    const isActive = selectedItemIds?.has(item.id);

                    let bgColor = 'bg-gray-800/60';
                    let borderColor = 'border-gray-700';
                    let textColor = 'text-gray-200';

                    if (isIncome) {
                        bgColor = isActive ? 'bg-green-600' : 'bg-green-600/60';
                        borderColor = isActive ? 'border-green-400' : 'border-green-800';
                        textColor = 'text-green-100';
                    } else if (isExpense) {
                        bgColor = isActive ? 'bg-red-600' : 'bg-red-600/60';
                        borderColor = isActive ? 'border-red-400' : 'border-red-800';
                        textColor = 'text-red-100';
                    } else if (isEffect) {
                        bgColor = isActive ? 'bg-purple-600' : 'bg-purple-600/60';
                        borderColor = isActive ? 'border-purple-400' : 'border-purple-800';
                        textColor = 'text-purple-100';
                    }

                    const varName = getVarName(item);
                    const isEnabled = item.isEnabled !== false;

                    // Calculate the account balance at the event's start date (matches unflipped view)
                    const balanceAtStart = getBalanceAtStart(item);

                    // Calculate delta from itemTotals (matches unflipped view)
                    const delta = itemTotals[item.id] !== undefined ? itemTotals[item.id] : calculateTotalDelta(item, viewStartDate || '', viewEndDate || '');
                    const deltaFormatted = formatCurrency(Math.abs(delta));
                    const centerDisplay = delta > 0 ? `Δ + ${deltaFormatted} ` : `∇ ${deltaFormatted} `;

                    // Format frequency text for left display
                    let frequencyText = '';
                    const isLumpSum = item.formula === FormulaType.LUMP_SUM;

                    if (item.type === 'effect') {
                        if (item.formula === FormulaType.SIMPLE_INTEREST) {
                            frequencyText = `+ ${item.interestRate}% simple interest applied ${(item.compoundingPeriod || 'ANNUALLY').toLowerCase()} `;
                        } else {
                            frequencyText = `+ ${item.interestRate}% compounded ${item.compoundingFrequency || 1} times per ${(item.compoundingPeriod || 'MONTHLY').toLowerCase().replace('ly', '')} `;
                        }
                    } else {
                        const sign = isExpense ? '-' : '+';
                        if (isLumpSum) {
                            frequencyText = 'lump sum';
                        } else if (item.formula === FormulaType.MONTHLY_SUM) {
                            frequencyText = 'monthly';
                        } else {
                            frequencyText = 'monthly'; // Default
                        }
                        frequencyText = `${sign}${formatCurrency(item.amount || 0)} ${frequencyText} `;
                    }

                    // Calculate active bar width and position if view dates are provided
                    let activeBarStyle: React.CSSProperties = {};
                    let showActiveArea = false;

                    if (viewStartDate && viewEndDate) {
                        const viewStart = new Date(viewStartDate).getTime();
                        const viewEnd = new Date(viewEndDate).getTime();
                        const viewDuration = viewEnd - viewStart;

                        const itemStart = new Date(item.startDate).getTime();
                        const itemEnd = item.endDate ? new Date(item.endDate).getTime() : viewEnd;

                        // Calculate percentages
                        const startOffset = Math.max(0, itemStart - viewStart);
                        const durationInView = Math.min(itemEnd, viewEnd) - Math.max(itemStart, viewStart);

                        let leftPercent = (startOffset / viewDuration) * 100;
                        let widthPercent = (durationInView / viewDuration) * 100;

                        // Edge case: if item is completely outside view
                        if (itemEnd < viewStart || itemStart > viewEnd) {
                            widthPercent = 0;
                        }

                        // Ensure we don't overflow
                        if (leftPercent + widthPercent > 100) {
                            widthPercent = 100 - leftPercent;
                        }

                        // For ongoing items that started before view, left is 0.
                        if (itemStart < viewStart) leftPercent = 0;

                        // Lump Sum Handling: Make it a thin line if duration is 0
                        const isLumpSumOrSingleDay = widthPercent < 0.5;

                        activeBarStyle = {
                            left: `${leftPercent}% `,
                            width: (isLumpSum || isLumpSumOrSingleDay) ? '4px' : `${widthPercent}% `,
                            position: 'absolute',
                            height: '100%',
                            top: 0,
                            zIndex: 0,
                            borderRadius: 'inherit',
                        };

                        showActiveArea = true;
                    }

                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick?.(item.id)}
                            className={`relative flex items-center justify-between px-4 h-10 mb-1 rounded-md border ${borderColor} overflow-hidden transition-colors cursor-pointer hover:brightness-110 group ${!isEnabled ? 'opacity-50 grayscale' : ''}`}
                        >
                            {/* Background Track */}
                            {showActiveArea && (
                                <div
                                    className="absolute inset-0 bg-gray-800/40"
                                    style={{ zIndex: 0 }}
                                />
                            )}

                            {/* Active Bar Portion - only show if we have view dates */}
                            {showActiveArea && (
                                <div
                                    className="absolute top-0 bottom-0 pointer-events-none z-1"
                                    style={{ width: 'calc(100% - 80px)', left: 0 }}
                                >
                                    <div className={`${bgColor} transition-all duration-300`} style={activeBarStyle} />
                                </div>
                            )}

                            {/* Fallback: Full background if no view dates */}
                            {!showActiveArea && (
                                <div className={`absolute inset-0 ${bgColor}`} style={{ zIndex: 0 }} />
                            )}

                            {/* Left: Variable Definition + Amount */}
                            <div className={`relative flex items-center space-x-2 z-10 ${textColor}`}>
                                <div className="mr-2 text-gray-600 group-hover:text-gray-400 transition-colors">
                                    <GripVertical size={14} />
                                </div>
                                <span className="text-sm font-bold">
                                    <InlineMath math={varName} />
                                    {' = '}
                                    {item.name}
                                </span>
                                <span className="text-xs opacity-70 italic">
                                    {frequencyText}
                                </span>
                            </div>

                            {/* Center: Delta */}
                            <div className="relative flex-1 flex justify-center items-center z-10 pointer-events-none">
                                <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                                    {centerDisplay}
                                </span>
                            </div>

                            {/* Right: Meta Info */}
                            <div className={`relative flex items-center space-x-2 text-xs font-mono opacity-80 z-10 ${textColor}`}>
                                <span>Starts {item.startDate.split('-')[1]}-{item.startDate.split('-')[2]}-{item.startDate.split('-')[0]}</span>
                                <span className="text-xs opacity-70 italic">On</span>
                                <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                                    {formatCurrency(balanceAtStart)}
                                </span>
                                <span className="px-1.5 py-0.5 bg-black/20 rounded uppercase text-[10px] tracking-wider">
                                    {item.endDate ? `Ends ${item.endDate.split('-')[1]}-${item.endDate.split('-')[2]}-${item.endDate.split('-')[0]}` : 'Ongoing'}
                                </span>
                            </div>

                            {/* Chart Color Indicator - Full Height, Far Right */}
                            <div
                                className="absolute right-0 top-0 bottom-0 w-1.5 shadow-sm z-20"
                                style={{
                                    backgroundColor: (showIndividualSeries && item.isChartVisible !== false)
                                        ? (item.chartColor || (item.type === 'income' ? '#22c55e' : item.type === 'expense' ? '#ef4444' : item.type === 'effect' ? '#a855f7' : '#4b5563'))
                                        : '#374151' // Gray-700 for hidden series
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
