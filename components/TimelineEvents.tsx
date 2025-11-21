import React from 'react';
import { FinancialItem, FormulaType } from '../types';
import { formatCurrency } from '../utils';
import { calculateTotalDelta } from '../services/simulation';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimelineEventsProps {
  items: FinancialItem[];
  activeItemId: string | null;
  onItemClick: (id: string) => void;
  viewStartDate: string;
  viewEndDate: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const TimelineEvents: React.FC<TimelineEventsProps> = ({
  items,
  activeItemId,
  onItemClick,
  viewStartDate,
  viewEndDate,
  isCollapsed,
  onToggleCollapse
}) => {
    
  // We sort items to keep layout consistent: Job first, then Rent, etc.
  // Or just by date. Let's sort by type then name.
  const sortedItems = [...items].sort((a, b) => {
      if (a.type === 'income' && b.type !== 'income') return -1;
      if (a.type === 'expense' && b.type !== 'expense') return 1;
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-gray-900 w-full border-t border-gray-800 flex flex-col h-full relative transition-all">
        {/* Header Row mimicking spreadsheet/timeline header */}
        <div 
            onClick={onToggleCollapse}
            className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-4 h-10 text-xs text-gray-500 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors shrink-0"
        >
            <div className="flex items-center gap-2">
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="font-bold uppercase tracking-wider">Event Timeline</span>
            </div>
            {!isCollapsed && <span>Delta in View</span>}
        </div>

        {!isCollapsed && (
            <div className="p-2 space-y-1 overflow-y-auto flex-1">
                {sortedItems.map(item => {
                    const isActive = item.id === activeItemId;
                    
                    // Calculate delta
                    const delta = calculateTotalDelta(item, viewStartDate, viewEndDate);
                    const deltaFormatted = formatCurrency(delta);
                    const isPositive = delta > 0;
                    const isLumpSum = item.formula === FormulaType.LUMP_SUM;

                    // Visual styling
                    let barColor = 'bg-gray-700';
                    let textColor = 'text-gray-200';
                    let borderClass = 'border-gray-700';

                    if (item.type === 'income') {
                        barColor = isActive ? 'bg-green-700' : 'bg-green-800/60';
                        borderClass = isActive ? 'border-green-400' : 'border-green-900';
                        textColor = 'text-green-100';
                    } else if (item.type === 'expense') {
                        barColor = isActive ? 'bg-red-700' : 'bg-red-800/60';
                        borderClass = isActive ? 'border-red-400' : 'border-red-900';
                        textColor = 'text-red-100';
                    } else if (item.type === 'effect') {
                        barColor = isActive ? 'bg-purple-700' : 'bg-purple-800/60';
                        borderClass = isActive ? 'border-purple-400' : 'border-purple-900';
                        textColor = 'text-purple-100';
                    }

                    // Subtitle text logic
                    let frequencyText = 'monthly';
                    if (item.formula === FormulaType.RECURRING_SUM) frequencyText = 'recurring';
                    if (isLumpSum) frequencyText = 'lump sum';

                    // Center badge logic
                    let centerDisplay = '';
                    if (item.type === 'effect') {
                        centerDisplay = 'Compounding...';
                    } else if (isLumpSum) {
                        // Format MM-DD-YYYY
                        const [y, m, d] = item.startDate.split('-');
                        centerDisplay = `${m}-${d}-${y}`;
                    } else {
                        centerDisplay = delta > 0 ? `Δ +${deltaFormatted}` : `∇ ${deltaFormatted}`;
                    }

                    return (
                        <div 
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            className={`relative h-10 w-full rounded cursor-pointer transition-all border ${borderClass} ${barColor} flex items-center px-4 justify-between hover:opacity-90`}
                        >
                            {/* Left Info */}
                            <div className="flex items-center space-x-2 z-10">
                                <span className={`font-bold text-sm ${textColor}`}>{item.name}</span>
                                <span className="text-xs opacity-70 italic text-white">
                                    {item.type === 'effect' 
                                        ? `+${item.interestRate}% compound` 
                                        : `${isPositive ? '+' : '-'}${formatCurrency(item.amount || 0)} ${frequencyText}`
                                    }
                                </span>
                            </div>

                            {/* Center Calculator visualization (Simulated delta or Date for Lump Sum) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                                    {centerDisplay}
                                </span>
                            </div>

                            {/* Right Date Info (Just visually showing range end if exists) */}
                            <div className="text-xs opacity-60 text-white z-10">
                                {!isLumpSum && (item.endDate ? `Ends ${item.endDate}` : 'Ongoing')}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};