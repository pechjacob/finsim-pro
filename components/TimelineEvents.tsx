import React, { useState, useMemo } from 'react';
import { FinancialItem, FormulaType, SimulationPoint, Frequency } from '../types';
import { formatCurrency } from '../utils';
import { calculateTotalDelta } from '../services/simulation';
import { ChevronUp, ChevronDown, GripVertical, Trash2, Eye, EyeOff, RotateCcw, Filter } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { TimelineSyncChart } from './TimelineSyncChart';

interface TimelineEventsProps {
    items: FinancialItem[];
    activeItemId: string | null;
    onItemClick: (id: string) => void;
    viewStartDate: string;
    viewEndDate: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    simulationPoints: SimulationPoint[];
    itemTotals: Record<string, number>;
    onReorderItems: (itemId: string, newIndex: number) => void;
    onDeleteAllItems: () => void;
    onToggleAllItems: (itemIds?: string[]) => void;
    hoverDate?: string | null;
    isZoomed?: boolean;
    onResetView?: () => void;
    frequency: Frequency;
}

interface SortableEventItemProps {
    item: FinancialItem;
    isActive: boolean;
    onItemClick: (id: string) => void;
    viewStartDate: string;
    viewEndDate: string;
    itemTotals: Record<string, number>;
    simulationPoints: SimulationPoint[];
}

const SortableEventItem: React.FC<SortableEventItemProps> = ({
    item,
    isActive,
    onItemClick,
    viewStartDate,
    viewEndDate,
    itemTotals,
    simulationPoints
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Calculate delta
    const delta = itemTotals[item.id] !== undefined ? itemTotals[item.id] : calculateTotalDelta(item, viewStartDate, viewEndDate);
    const deltaFormatted = formatCurrency(delta);
    const isLumpSum = item.formula === FormulaType.LUMP_SUM;

    // Visual styling
    let barColor = 'bg-gray-700';
    let textColor = 'text-gray-200';
    let borderClass = 'border-gray-700';
    let sign = '+';

    if (item.type === 'income') {
        barColor = isActive ? 'bg-green-700' : 'bg-green-800/60';
        borderClass = isActive ? 'border-green-400' : 'border-green-900';
        textColor = 'text-green-100';
        sign = '+';
    } else if (item.type === 'expense') {
        barColor = isActive ? 'bg-red-700' : 'bg-red-800/60';
        borderClass = isActive ? 'border-red-400' : 'border-red-900';
        textColor = 'text-red-100';
        sign = '-';
    } else if (item.type === 'effect') {
        barColor = isActive ? 'bg-purple-700' : 'bg-purple-800/60';
        borderClass = isActive ? 'border-purple-400' : 'border-purple-900';
        textColor = 'text-purple-100';
        sign = '+';
    }

    // Calculate bar width and position based on view range
    const viewStart = new Date(viewStartDate).getTime();
    const viewEnd = new Date(viewEndDate).getTime();
    const viewDuration = viewEnd - viewStart;

    const itemStart = new Date(item.startDate).getTime();
    // For ongoing items, we can clamp to viewEnd for display purposes, or just let it go to 100%
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

    // Lump Sum Handling: Make it a thin line if duration is 0 (or very small)
    const isLumpSumOrSingleDay = widthPercent < 0.5; // Threshold for "single point"

    // Styling for the active bar portion
    const activeBarStyle: React.CSSProperties = {
        left: `${leftPercent}%`,
        width: (isLumpSum || isLumpSumOrSingleDay) ? '4px' : `${widthPercent}%`,
        position: 'absolute',
        height: '100%',
        top: 0,
        zIndex: 0, // Behind text
        borderRadius: 'inherit',
    };

    // Styling for the inactive track (grayed out) - spans full width now
    const trackStyle: React.CSSProperties = {
        backgroundColor: 'rgba(31, 41, 55, 0.4)', // Gray-800 with opacity
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0, // Behind plotting area
    };

    // Subtitle text logic
    let frequencyText = 'monthly';
    if (item.formula === FormulaType.RECURRING_SUM) {
        if (item.recurrenceDays) {
            if (item.recurrenceDays === 1) frequencyText = 'daily';
            else if (item.recurrenceDays === 7) frequencyText = 'weekly';
            else if (item.recurrenceDays === 30) frequencyText = 'monthly';
            else if (item.recurrenceDays === 91) frequencyText = 'quarterly';
            else if (item.recurrenceDays === 365) frequencyText = 'annually';
            else {
                // Custom recurrence display
                let unit = 'days';
                let count = item.recurrenceDays;

                if (item.recurrenceDays % 365 === 0) {
                    unit = 'years';
                    count = item.recurrenceDays / 365;
                } else if (item.recurrenceDays % 91 === 0) {
                    unit = 'quarters';
                    count = item.recurrenceDays / 91;
                } else if (item.recurrenceDays % 30 === 0) {
                    unit = 'months';
                    count = item.recurrenceDays / 30;
                } else if (item.recurrenceDays % 7 === 0) {
                    unit = 'weeks';
                    count = item.recurrenceDays / 7;
                }

                frequencyText = `Every ${count} ${unit}`;
            }
        } else {
            frequencyText = 'recurring';
        }
    }
    if (isLumpSum) frequencyText = 'lump sum';

    // Center badge logic
    let centerDisplay = '';
    let startDateFormatted = '';
    let beginningBalanceFormatted = '';

    // Format start date for display
    const [y, m, d] = item.startDate.split('-');
    startDateFormatted = `${m}-${d}-${y}`;

    // Calculate beginning balance for the item
    const point = simulationPoints?.find(p => p.date === item.startDate);
    let beginningBalance = 0;

    // Use item-specific start balance from itemStartBalances map
    // This shows the balance BEFORE this item applies
    beginningBalance = point?.itemStartBalances?.[item.id] ?? 0;

    beginningBalanceFormatted = formatCurrency(beginningBalance);

    // Set center display
    centerDisplay = delta > 0 ? `Δ +${deltaFormatted}` : `∇ ${deltaFormatted}`;
    if (delta === 0) centerDisplay = 'Δ $0';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative h-10 w-full border-b ${borderClass} group transition-colors ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'} ${item.isEnabled === false ? 'opacity-50 grayscale' : ''}`}
            onClick={() => onItemClick(item.id)}
        >
            {/* Full Width Track */}
            <div style={trackStyle} />

            {/* Plotting Area Container - Matches Chart Width */}
            {/* Width calc: 100% - 80px (YAxis width) */}
            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ width: 'calc(100% - 80px)', left: 0 }}>
                {/* Active Bar Portion */}
                <div className={`${barColor} transition-all duration-300`} style={activeBarStyle} />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex items-center h-full px-4 w-full">
                <div className="mr-2 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400">
                    <GripVertical size={14} />
                </div>

                {/* Left Info */}
                <div className="flex items-center space-x-2 z-10">
                    <span className={`font-bold text-sm ${textColor}`}>{item.name}</span>
                    <span className="text-xs opacity-70 italic text-white">
                        {item.type === 'effect'
                            ? (item.formula === FormulaType.SIMPLE_INTEREST
                                ? `+${item.interestRate}% simple interest applied ${(item.compoundingPeriod || 'ANNUALLY').toLowerCase()}`
                                : `+${item.interestRate}% compounded ${item.compoundingFrequency || 1} times per ${(item.compoundingPeriod || 'MONTHLY').toLowerCase().replace('ly', '')}`)
                            : `${sign}${formatCurrency(item.amount || 0)} ${frequencyText}`
                        }
                    </span>
                </div>

                {/* Center delta */}
                <div className="flex-1 flex justify-center items-center pointer-events-none">
                    <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                        {centerDisplay}
                    </span>
                </div>

                {/* Right side: start date, beginning balance, end date */}
                <div className="flex items-center space-x-2 text-xs opacity-80 text-white z-10 ml-auto">
                    {isLumpSum ? (
                        <>
                            <span>On {startDateFormatted}</span>
                            <span className="text-xs opacity-70 italic mx-1">Added To</span>
                            <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                                {beginningBalanceFormatted}
                            </span>
                        </>
                    ) : (
                        <>
                            <span>Starts {startDateFormatted}</span>
                            <span className="text-xs opacity-70 italic">On</span>
                            <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-white shadow-sm">
                                {beginningBalanceFormatted}
                            </span>
                            {/* End date */}
                            <span>{item.endDate ? `Ends ${item.endDate.split('-')[1]}-${item.endDate.split('-')[2]}-${item.endDate.split('-')[0]}` : 'Ongoing'}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TimelineEvents: React.FC<TimelineEventsProps> = ({
    items,
    activeItemId,
    onItemClick,
    viewStartDate,
    viewEndDate,
    isCollapsed,
    onToggleCollapse,
    simulationPoints,
    itemTotals = {},
    onReorderItems,
    onDeleteAllItems,
    onToggleAllItems,
    hoverDate,
    isZoomed,
    onResetView,
    frequency
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before activating drag
            },
        })
    );

    const [filterType, setFilterType] = useState<'income' | 'expense' | 'effect' | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = sortedItems.findIndex(item => item.id === active.id);
        const newIndex = sortedItems.findIndex(item => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            onReorderItems(active.id as string, newIndex);
        }
    };

    // Sort items by order field (with fallback for items without order)
    const sortedItems = [...items].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        // Fallback: sort by type then name
        if (a.type === 'income' && b.type !== 'income') return -1;
        if (a.type === 'expense' && b.type !== 'expense') return 1;
        return a.name.localeCompare(b.name);
    });

    const filteredItems = useMemo(() => {
        if (!filterType) return sortedItems;
        return sortedItems.filter(item => item.type === filterType);
    }, [sortedItems, filterType]);

    const handleToggleVisibleItems = () => {
        onToggleAllItems(filteredItems.map(i => i.id));
    };

    return (
        <div className="bg-gray-900 w-full border-t border-gray-800 flex flex-col h-full relative transition-all">
            {/* Header Row mimicking spreadsheet/timeline header */}
            <div
                onClick={onToggleCollapse}
                className={`sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-4 h-10 text-xs text-gray-500 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center cursor-pointer hover:bg-gray-800 transition-colors shrink-0`}
            >
                <div className="flex items-center gap-2">
                    {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="font-bold uppercase tracking-wider">Event Timeline</span>
                    {!isCollapsed && !activeItemId && <span className="text-gray-600 font-normal normal-case ml-4">Select an event or effect to edit</span>}
                </div>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        {filterType && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFilterType(null);
                                }}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                                title="Reset Filter"
                            >
                                <RotateCcw size={14} />
                            </button>
                        )}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFilterOpen(!isFilterOpen);
                                }}
                                className={`flex items-center gap-1 bg-gray-800 text-gray-300 border ${filterType ? 'border-blue-500 text-blue-400' : 'border-gray-700'} rounded px-2 py-1 hover:bg-gray-700 transition-colors`}
                                title="Filter Events"
                            >
                                <Filter size={14} />
                                <span className="text-xs font-medium mx-1">
                                    {filterType ? (filterType.charAt(0).toUpperCase() + filterType.slice(1)) : 'All Events'}
                                </span>
                                <ChevronDown size={12} />
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsFilterOpen(false);
                                        }}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded shadow-xl z-40 py-1 flex flex-col">
                                        {[
                                            { label: 'All Events', value: null },
                                            { label: 'Income', value: 'income' },
                                            { label: 'Expense', value: 'expense' },
                                            { label: 'Effects', value: 'effect' }
                                        ].map((option) => (
                                            <button
                                                key={option.label}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFilterType(option.value as any);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`text-left px-3 py-1.5 text-xs hover:bg-gray-700 ${filterType === option.value ? 'text-blue-400 font-medium' : 'text-gray-300'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibleItems();
                            }}
                            className="text-gray-500 hover:text-blue-400 transition-colors p-1"
                            title="Enable/Disable All Events"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete all events?')) {
                                    onDeleteAllItems();
                                }
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                            title="Delete All Events"
                        >
                            <Trash2 size={14} />
                        </button>
                        <span>Delta in View</span>
                    </div>
                )}
            </div>

            {!isCollapsed && (
                <div className="flex-1 relative overflow-hidden flex flex-col h-full">
                    {/* Background Sync Chart */}
                    <TimelineSyncChart
                        visibleStartDate={viewStartDate}
                        visibleEndDate={viewEndDate}
                        hoverDate={hoverDate || null}
                        simulationPoints={simulationPoints}
                        frequency={frequency}
                    />

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={filteredItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="py-2 space-y-1 overflow-y-auto flex-1 relative z-10">
                                {filteredItems.map(item => (
                                    <SortableEventItem
                                        key={item.id}
                                        item={item}
                                        isActive={item.id === activeItemId}
                                        onItemClick={onItemClick}
                                        viewStartDate={viewStartDate}
                                        viewEndDate={viewEndDate}
                                        itemTotals={itemTotals}
                                        simulationPoints={simulationPoints}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}


        </div>
    );
};