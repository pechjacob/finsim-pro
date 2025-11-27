import React from 'react';
import { FinancialItem, FormulaType } from '../types';
import { formatCurrency } from '../utils';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface FormulaDisplayProps {
    items: FinancialItem[];
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ items }) => {
    // Helper to get variable name
    const getVarName = (item: FinancialItem) => {
        if (item.type === 'income') return `I_{${item.name.charAt(0).toLowerCase()}}`;
        if (item.type === 'expense') return `E_{${item.name.charAt(0).toLowerCase()}}`;
        return `L_{${item.name.charAt(0).toLowerCase()}}`; // Default/Savings
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-2">
            <div className="space-y-2">
                {items.map(item => {
                    const isIncome = item.type === 'income';
                    const isExpense = item.type === 'expense';
                    const isEffect = item.type === 'effect';

                    let bgColor = 'bg-gray-800/60';
                    let borderColor = 'border-gray-700';
                    let textColor = 'text-gray-200';

                    if (isIncome) {
                        bgColor = 'bg-green-800/60';
                        borderColor = 'border-green-700/50';
                        textColor = 'text-green-100';
                    } else if (isExpense) {
                        bgColor = 'bg-red-800/60';
                        borderColor = 'border-red-700/50';
                        textColor = 'text-red-100';
                    } else if (isEffect) {
                        bgColor = 'bg-purple-800/60';
                        borderColor = 'border-purple-700/50';
                        textColor = 'text-purple-100';
                    }

                    const varName = getVarName(item);
                    const amount = item.amount || 0;
                    const amountStr = isExpense ? `-\\$${amount}` : `\\$${amount}`;
                    const nameStr = `\\text{${item.name}}`;

                    // Left side equation: I_j = Job
                    const leftEq = `${varName} = ${nameStr}`;

                    // Center equation: I_j = $2000
                    const centerEq = `${varName} = ${amountStr}`;

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-md border ${bgColor} ${borderColor} ${textColor} transition-colors`}
                        >
                            {/* Left: Variable Definition */}
                            <div className="flex items-center w-1/3">
                                <span className="text-lg">
                                    <InlineMath math={leftEq} />
                                </span>
                                <span className="ml-2 text-xs opacity-70 italic">
                                    {item.formula === FormulaType.MONTHLY_SUM ? 'monthly' :
                                        item.formula === FormulaType.LUMP_SUM ? 'lump sum' : 'recurring'}
                                </span>
                            </div>

                            {/* Center: Value Assignment */}
                            <div className="flex items-center justify-center w-1/3">
                                <div className="px-3 py-1 bg-black/20 rounded text-lg font-mono">
                                    <InlineMath math={centerEq} />
                                </div>
                            </div>

                            {/* Right: Meta Info */}
                            <div className="flex items-center justify-end w-1/3 text-xs font-mono opacity-80 space-x-3">
                                <span>Starts {item.startDate}</span>
                                <span>On <span className="font-bold">{formatCurrency(item.amount || 0)}</span></span>
                                <span className="px-1.5 py-0.5 bg-black/20 rounded uppercase text-[10px] tracking-wider">
                                    {item.endDate ? 'Ends ' + item.endDate : 'Ongoing'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
