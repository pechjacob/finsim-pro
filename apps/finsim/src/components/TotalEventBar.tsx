import React, { useRef } from 'react';
import { formatCurrency } from '../utils';
import { GripVertical, Eye, LineChart } from 'lucide-react';

interface TotalEventBarProps {
    delta: number;
    endDate: string; // "MM-DD-YYYY" or similar
    color?: string;
    onColorChange?: (color: string) => void;
    isChartSeriesVisible?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    selectedCount?: number;
    totalCount?: number;
}

export const TotalEventBar: React.FC<TotalEventBarProps> = ({
    delta,
    endDate,
    color = '#60a5fa', // Default blue if not provided
    onColorChange,
    isChartSeriesVisible = true,
    isSelected = false,
    onToggleSelect,
    selectedCount = 0,
    totalCount = 0
}) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    // The "Total" active bar should conceptually span the entire timeline as it summarizes everything.
    // We use the same 'calc(100% - 80px)' width logic to align with the chart's time scale area,
    // assuming the other bars use this to offset the Y-axis space.

    // Calculate background and border based on selection
    const isSelectedBg = isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50';
    const checkboxBorder = isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-gray-500 group-hover:border-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.3)] bg-transparent';
    const checkboxText = isSelected ? 'text-blue-400' : 'text-transparent';

    return (
        <div
            className={`relative h-10 mx-2 mb-1 rounded-md border ${isSelected ? 'border-white' : 'border-gray-700'} overflow-hidden select-none shrink-0 group transition-colors ${isSelectedBg}`}
            onClick={() => onToggleSelect && onToggleSelect()}
        >
            {/* Full Width Track (Inactive background - dark to contrast with gradient) */}
            <div className="absolute inset-0 bg-gray-900/50" />

            {/* Plotting Area Container - Matches Chart Width (minus Right Axis space) */}
            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ width: 'calc(100% - 80px)', left: 0 }}>
                {/* Active Gradient Bar - Full width of the plotting area */}
                <div
                    className="absolute top-0 h-full transition-all duration-300 opacity-90"
                    style={{
                        width: '100%',
                        left: 0,
                        background: `linear-gradient(90deg, ${color}20, ${color}80, ${color})`
                    }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex items-center h-full px-4 w-full">
                {/* Checkbox */}
                <div className="mr-3 flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}>
                    <div className={`w-4 h-4 rounded border ${checkboxBorder} flex items-center justify-center transition-all duration-200`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`w-3 h-3 ${checkboxText}`}
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>

                {/* Icon (9 dots / Grip) */}
                <div className="mr-2 text-gray-600 group-hover:text-gray-400 transition-colors">
                    <GripVertical size={14} />
                </div>

                {/* Name */}
                <span className="font-bold text-sm text-white drop-shadow-sm mr-4">Total</span>

                {/* Selection Stats */}
                <span className="text-xs text-gray-400 font-mono hidden md:inline-block">
                    {selectedCount} of {totalCount} events selected
                </span>

                {/* Status Icons - Absolutely positioned for vertical alignment across bars */}
                <div className="absolute left-1/2 -translate-x-[200px] flex items-center space-x-1 z-10">
                    {/* Chart Visibility Icon */}
                    <div
                        className={`relative flex items-center justify-center w-7 h-6 rounded bg-black/40 transition-colors ${isChartSeriesVisible ? 'text-blue-400' : 'text-gray-500'}`}
                        title={isChartSeriesVisible ? "Total chart series visible" : "Total chart series hidden"}
                    >
                        <LineChart size={14} className={!isChartSeriesVisible ? 'opacity-60' : ''} />
                        {!isChartSeriesVisible && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded">
                                <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gray-500 origin-top-left rotate-[40deg] translate-x-[-2px] translate-y-[1px]" />
                            </div>
                        )}
                    </div>
                    {/* Simulation Visibility Icon - Always enabled for Total */}
                    <div
                        className="relative flex items-center justify-center w-7 h-6 rounded bg-black/40 transition-colors text-blue-400"
                        title="Total is always included in simulation"
                    >
                        <Eye size={14} />
                    </div>
                </div>

                {/* Center Delta */}
                <div className="flex-1 flex justify-center items-center absolute inset-0 pointer-events-none">
                    <div className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10 shadow-sm flex items-center space-x-1">
                        <span>{delta >= 0 ? '▲' : '▼'}</span>
                        <span>{formatCurrency(delta)}</span>
                    </div>
                </div>

                {/* Right Side: End Date + Badge */}
                <div className="flex items-center space-x-2 text-xs font-mono z-10 ml-auto text-white mr-2">
                    <span className="opacity-80 drop-shadow-sm mr-6">Ends {endDate}</span>
                    <span className="px-1.5 py-0.5 bg-gray-900/80 border border-gray-600 rounded uppercase text-[10px] tracking-wider text-gray-300 font-bold shadow-sm">
                        TOTAL
                    </span>
                </div>
            </div>

            {/* Color Indicator Strip - Full Height, Far Right */}
            {/* Clickable to trigger hidden color input */}
            <div
                className={`absolute right-0 top-0 bottom-0 w-3 transition-all z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.5)] ${isChartSeriesVisible ? `cursor-pointer hover:brightness-110 ${isSelected ? 'brightness-125' : ''}` : 'cursor-not-allowed grayscale opacity-50'}`}
                style={{ backgroundColor: color }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isChartSeriesVisible && onColorChange && colorInputRef.current) {
                        colorInputRef.current.click();
                    }
                }}
                title={isChartSeriesVisible ? "Click to change total series color" : "Enable chart series to change color"}
            />

            {/* Hidden Color Input */}
            {isChartSeriesVisible && onColorChange && (
                <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute opacity-0 pointer-events-none"
                    aria-label="Total series color picker"
                />
            )}
        </div>
    );
};
