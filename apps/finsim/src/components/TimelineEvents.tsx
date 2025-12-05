import React, { useState, useMemo } from 'react';
import { FinancialItem, FormulaType, SimulationPoint, Frequency } from '../types';
import { formatCurrency } from '../utils';
import { calculateTotalDelta } from '../services/simulation';
import {
    ChevronDown,
    ChevronUp,
    Filter,
    LineChart,
    Search,
    Trash2,
    Eye,
    CheckSquare,
    FlipHorizontal as FlipIcon,
    RotateCcw,
    GripVertical
} from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { TimelineSyncChart } from './TimelineSyncChart';
import { motion } from 'framer-motion';
import { FormulaDisplay } from './FormulaDisplay';

interface TimelineEventsProps {
    items: FinancialItem[];
    selectedItemIds: Set<string>;
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
    simulationStartDate: string;
    simulationEndDate: string;
    isFlipped: boolean;
    onFlip: () => void;
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
            className={`relative h-10 mx-2 mb-1 rounded-md border ${borderClass} overflow-hidden group transition-colors ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'} ${item.isEnabled === false ? 'opacity-50 grayscale' : ''}`}
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
                <div className="mr-2 cursor-grab active:cursor-grabbing text-gray-600 group-hover:text-gray-400 transition-colors">
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
                <div className={`flex items-center space-x-2 text-xs font-mono opacity-80 ${textColor} z-10 ml-auto`}>
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
                            <span className="px-1.5 py-0.5 bg-black/20 rounded uppercase text-[10px] tracking-wider">
                                {item.endDate ? `Ends ${item.endDate.split('-')[1]}-${item.endDate.split('-')[2]}-${item.endDate.split('-')[0]}` : 'Ongoing'}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TimelineEvents: React.FC<TimelineEventsProps> = ({
    items,
    selectedItemIds,
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
    frequency,
    isFlipped,
    onFlip,
    simulationStartDate,
    simulationEndDate
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before activating drag
            },
        })
    );

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [filterType, setFilterType] = useState<'income' | 'expense' | 'effect' | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isZoomTrackingEnabled, setIsZoomTrackingEnabled] = useState(true);

    // Keyboard shortcut for search
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Calculate effective view range based on zoom tracking state
    const isChartZoomed = isZoomed || (viewStartDate !== simulationStartDate || viewEndDate !== simulationEndDate);

    const effectiveStartDate = (isZoomTrackingEnabled && isChartZoomed) ? viewStartDate : simulationStartDate;
    const effectiveEndDate = (isZoomTrackingEnabled && isChartZoomed) ? viewEndDate : simulationEndDate;

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
        let result = sortedItems;

        if (searchQuery) {
            result = result.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        } else if (filterType) {
            result = result.filter(item => item.type === filterType);
        }

        return result;
    }, [sortedItems, filterType, searchQuery]);

    const zoomToggle = (
        <div
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${!isChartZoomed
                ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                : (isZoomTrackingEnabled
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'bg-lime-600 hover:bg-lime-500') + ' cursor-pointer'
                }`}
            onClick={(e) => {
                e.stopPropagation();
                if (isChartZoomed) {
                    setIsZoomTrackingEnabled(!isZoomTrackingEnabled);
                }
            }}
            title={!isChartZoomed ? "Zoom to use" : isZoomTrackingEnabled ? "Zoom Tracking Enabled" : "Zoom Tracking Disabled"}
        >
            <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 flex items-center justify-center ${isZoomTrackingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            >
                <Search size={10} className={isZoomTrackingEnabled ? "text-purple-600" : "text-lime-600"} />
            </div>
        </div>
    );



    return (
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'h-10' : 'h-full'}`} style={{ perspective: 1000 }}>
            <motion.div
                className="flex-1 relative overflow-hidden"
                initial={false}
                animate={{
                    opacity: isCollapsed ? 0 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <motion.div
                    className="absolute w-full h-full"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face: Timeline */}
                    <div
                        className="absolute w-full h-full bg-gray-900 border-t border-gray-800 shadow-xl flex flex-col"
                        style={{ backfaceVisibility: 'hidden', pointerEvents: isFlipped ? 'none' : 'auto' }}
                    >
                        {/* Timeline Header */}
                        <div
                            className="flex items-center justify-between px-4 h-10 bg-gray-900 hover:bg-gray-800 border-b border-gray-800 shrink-0 z-30 relative cursor-pointer group transition-colors"
                            onClick={onToggleCollapse}
                        >
                            <div className="flex items-center space-x-2 flex-1 mr-4">
                                <div className="text-gray-500 group-hover:text-white transition-colors shrink-0">
                                    <ChevronDown size={16} />
                                </div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                                    Event Timeline
                                </span>

                                {/* Moved Zoom and Flip here */}
                                <div className="flex items-center space-x-2 mx-2">
                                    {zoomToggle}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onFlip(); }}
                                        className={`p-1.5 rounded-md transition-colors ${isFlipped ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                                        title={isFlipped ? "Switch to Timeline" : "Switch to Formula View"}
                                    >
                                        <FlipIcon size={16} />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative ml-2 flex-1 max-w-md group/search" onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={14} className="text-gray-500 group-focus-within/search:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="block w-full pl-10 pr-12 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Select Event/Effect to Edit"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                        <div className="flex items-center space-x-0.5">
                                            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded">⌘</kbd>
                                            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded">K</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-0 shrink-0">
                                {/* Select All Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Select all filtered items (or deselect all if all are selected)
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        filteredItems.forEach(i => {
                                            if (allSelected) {
                                                // Deselect all
                                                if (selectedItemIds.has(i.id)) onItemClick(i.id);
                                            } else {
                                                // Select all unselected
                                                if (!selectedItemIds.has(i.id)) onItemClick(i.id);
                                            }
                                        });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="flex items-center justify-center h-[26px] w-[26px] rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                    title={(() => {
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        const someSelected = filteredItems.some(i => selectedItemIds.has(i.id));
                                        return allSelected ? "Deselect All" : (someSelected ? "Select All" : "Select All");
                                    })()}
                                >
                                    {(() => {
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        const someSelected = filteredItems.some(i => selectedItemIds.has(i.id));

                                        if (allSelected) {
                                            return <CheckSquare size={22} />;
                                        } else if (someSelected) {
                                            // Indeterminate state (dash)
                                            return (
                                                <div className="relative flex items-center justify-center w-[22px] h-[22px] border-2 border-current rounded-[3px]">
                                                    <div className="w-3 h-0.5 bg-current rounded-full" />
                                                </div>
                                            );
                                        } else {
                                            // Empty box
                                            return <div className="w-[22px] h-[22px] border-2 border-current rounded-[3px]" />;
                                        }
                                    })()}
                                </button>

                                {/* Filter Dropdown */}
                                <div className="relative group">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsFilterOpen(!isFilterOpen);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className={`flex items-center justify-between space-x-1 text-xs px-2 h-[26px] rounded border transition-colors w-24 ${(searchQuery || filterType)
                                            ? 'bg-blue-900/30 border-blue-500/50 text-blue-200 hover:bg-blue-900/50 hover:text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-1 overflow-hidden">
                                            <Filter size={12} className="shrink-0" />
                                            <span className="truncate">
                                                {searchQuery ? 'Search' : (filterType ? (filterType.charAt(0).toUpperCase() + filterType.slice(1)) : 'All Events')}
                                            </span>
                                        </div>
                                    </button>

                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-50" onClick={(e) => {
                                                e.stopPropagation();
                                                setIsFilterOpen(false);
                                            }} />
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-gray-900 border border-gray-700 rounded shadow-xl z-[60] py-1 flex flex-col">
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

                                {/* Reset Icon */}
                                <div className={`flex items-center justify-center w-[26px] h-[26px] ${(searchQuery || filterType) ? 'visible' : 'invisible'}`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery('');
                                            setFilterType(null);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Reset Filter & Search"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>

                                {/* Chart Icon (Placeholder) */}
                                <div className="text-gray-500 p-1 ml-2">
                                    <LineChart size={16} />
                                </div>

                                {/* Visibility Toggle (Eye Icon) - Only works on selected items */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedItemIds.size === 0) return;
                                        // Get selected items and toggle their visibility
                                        const selectedItems = filteredItems.filter(i => selectedItemIds.has(i.id));
                                        onToggleAllItems(selectedItems.map(i => i.id));
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    disabled={selectedItemIds.size === 0}
                                    className={`p-1.5 rounded-md transition-colors ml-1 ${selectedItemIds.size > 0
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        : 'text-gray-600 cursor-not-allowed'
                                        }`}
                                    title={selectedItemIds.size > 0 ? "Toggle Visibility of Selected" : "Select items to toggle visibility"}
                                >
                                    <Eye size={16} />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAllItems();
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-red-400 focus:outline-none ml-1"
                                    title="Delete All Events"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="text-xs text-gray-500 font-mono ml-4">
                                    Delta in View
                                </div>
                            </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
                            <div className="absolute inset-0 pointer-events-none z-0">
                                <TimelineSyncChart
                                    viewStartDate={effectiveStartDate}
                                    viewEndDate={effectiveEndDate}
                                    simulationPoints={simulationPoints}
                                    hoverDate={hoverDate}
                                    frequency={frequency}
                                />
                            </div>
                            <div className="relative z-10">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <SortableContext
                                        items={filteredItems.map(item => item.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="pb-4 pt-1">
                                            {filteredItems.map((item) => (
                                                <SortableEventItem
                                                    key={item.id}
                                                    item={item}
                                                    isActive={selectedItemIds.has(item.id)}
                                                    onItemClick={onItemClick}
                                                    viewStartDate={effectiveStartDate}
                                                    viewEndDate={effectiveEndDate}
                                                    itemTotals={itemTotals}
                                                    simulationPoints={simulationPoints}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>

                    {/* Back Face: Formula View */}
                    <div
                        className="absolute w-full h-full bg-gray-900 border-t border-gray-800 shadow-xl flex flex-col"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            pointerEvents: isFlipped ? 'auto' : 'none'
                        }}
                    >
                        {/* Formula View Header */}
                        <div
                            className="flex items-center justify-between px-4 h-10 bg-gray-900 hover:bg-gray-800 border-b border-gray-800 shrink-0 z-30 relative cursor-pointer group transition-colors"
                            onClick={onToggleCollapse}
                        >
                            <div className="flex items-center space-x-2 flex-1 mr-4">
                                <div className="text-gray-500 group-hover:text-white transition-colors shrink-0">
                                    <ChevronDown size={16} />
                                </div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                                    Event Timeline
                                </span>

                                {/* Moved Zoom and Flip here */}
                                <div className="flex items-center space-x-2 mx-2">
                                    {zoomToggle}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onFlip(); }}
                                        className={`p-1.5 rounded-md transition-colors ${isFlipped ? 'bg-blue-900/50 text-blue-400 hover:bg-blue-900/80 hover:text-blue-300' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                                        title={isFlipped ? "Switch to Timeline" : "Switch to Formula View"}
                                    >
                                        <FlipIcon size={16} />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative ml-2 flex-1 max-w-md group/search" onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={14} className="text-gray-500 group-focus-within/search:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-12 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Select Event/Effect to Edit"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                        <div className="flex items-center space-x-0.5">
                                            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded">⌘</kbd>
                                            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded">K</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-0 shrink-0">
                                {/* Select All Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Select all filtered items (or deselect all if all are selected)
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        filteredItems.forEach(i => {
                                            if (allSelected) {
                                                // Deselect all
                                                if (selectedItemIds.has(i.id)) onItemClick(i.id);
                                            } else {
                                                // Select all unselected
                                                if (!selectedItemIds.has(i.id)) onItemClick(i.id);
                                            }
                                        });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="flex items-center justify-center h-[26px] w-[26px] rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                    title={(() => {
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        const someSelected = filteredItems.some(i => selectedItemIds.has(i.id));
                                        return allSelected ? "Deselect All" : (someSelected ? "Select All" : "Select All");
                                    })()}
                                >
                                    {(() => {
                                        const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));
                                        const someSelected = filteredItems.some(i => selectedItemIds.has(i.id));

                                        if (allSelected) {
                                            return <CheckSquare size={22} />;
                                        } else if (someSelected) {
                                            // Indeterminate state (dash)
                                            return (
                                                <div className="relative flex items-center justify-center w-[22px] h-[22px] border-2 border-current rounded-[3px]">
                                                    <div className="w-3 h-0.5 bg-current rounded-full" />
                                                </div>
                                            );
                                        } else {
                                            // Empty box
                                            return <div className="w-[22px] h-[22px] border-2 border-current rounded-[3px]" />;
                                        }
                                    })()}
                                </button>

                                {/* Filter Dropdown */}
                                <div className="relative group">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className={`flex items-center justify-between space-x-1 text-xs px-2 h-[26px] rounded border transition-colors w-24 ${isFilterOpen || filterType
                                            ? 'bg-blue-900/30 border-blue-500/50 text-blue-200 hover:bg-blue-900/50 hover:text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-1 overflow-hidden">
                                            <Filter size={12} className="shrink-0" />
                                            <span className="truncate">{filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'All Events'}</span>
                                        </div>
                                        {isFilterOpen ? <ChevronUp size={12} className="shrink-0" /> : <ChevronDown size={12} className="shrink-0" />}
                                    </button>

                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-50" onClick={(e) => { e.stopPropagation(); setIsFilterOpen(false); }} />
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-gray-900 border border-gray-700 rounded shadow-xl z-[60] py-1 flex flex-col">
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

                                {/* Reset Icon */}
                                <div className={`flex items-center justify-center w-[26px] h-[26px] ${(searchQuery || filterType) ? 'visible' : 'invisible'}`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery('');
                                            setFilterType(null);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Reset Filter & Search"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>

                                {/* Chart Icon (Placeholder) */}
                                <div className="text-gray-500 p-1 ml-2">
                                    <LineChart size={16} />
                                </div>

                                {/* Visibility Toggle (Eye Icon) - Only works on selected items */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedItemIds.size === 0) return;
                                        // Get selected items and toggle their visibility
                                        const selectedItems = filteredItems.filter(i => selectedItemIds.has(i.id));
                                        onToggleAllItems(selectedItems.map(i => i.id));
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    disabled={selectedItemIds.size === 0}
                                    className={`p-1.5 rounded-md transition-colors ml-1 ${selectedItemIds.size > 0
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        : 'text-gray-600 cursor-not-allowed'
                                        }`}
                                    title={selectedItemIds.size > 0 ? "Toggle Visibility of Selected" : "Select items to toggle visibility"}
                                >
                                    <Eye size={16} />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAllItems();
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-red-400 focus:outline-none ml-1"
                                    title="Delete All Events"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="text-xs text-gray-500 font-mono ml-4">
                                    Delta in View
                                </div>
                            </div>
                        </div>

                        {/* Formula Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            {/* Crosshair overlay */}
                            <div className="absolute inset-0 pointer-events-none z-0">
                                <TimelineSyncChart
                                    viewStartDate={effectiveStartDate}
                                    viewEndDate={effectiveEndDate}
                                    hoverDate={hoverDate}
                                    simulationPoints={simulationPoints}
                                    frequency={frequency}
                                />
                            </div>

                            <FormulaDisplay
                                items={filteredItems}
                                selectedItemIds={selectedItemIds}
                                onItemClick={onItemClick}
                                viewStartDate={effectiveStartDate}
                                viewEndDate={effectiveEndDate}
                                simulationPoints={simulationPoints}
                                itemTotals={itemTotals}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Collapsed Header */}
            {
                isCollapsed && (
                    <div
                        className="flex items-center justify-between px-4 h-10 bg-gray-900 border-t border-gray-800 shadow-xl hover:bg-gray-800 border-b border-gray-800 shrink-0 z-30 relative cursor-pointer group transition-colors"
                        onClick={onToggleCollapse}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="text-gray-500 group-hover:text-white transition-colors">
                                <ChevronUp size={16} />
                            </div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Event Timeline
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            Delta in View
                        </div>
                    </div>
                )
            }
        </div >
    );
};