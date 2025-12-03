import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { SimulationPoint, Frequency } from '../types';
import {
    formatDate,
    formatCurrency,
    generateSmartTicks,
    getSmartTickFormat,
    getDaysDifference,
    generateSmartYTicks,
    getSmartYTickFormatter,
    calculateZoomPercentage,
    calculateRangeFromPercentage,
    calculateRangeOffsets,
    constrainToBounds
} from '../utils';
import { RotateCcw, Minus, Plus } from 'lucide-react';

interface FinancialChartProps {
    data: SimulationPoint[];
    granularity: Frequency;
    onGranularityChange: (g: Frequency) => void;
    simulationStartDate: string;
    simulationEndDate: string;
    visibleStartDate: string;
    visibleEndDate: string;
    onVisibleDateRangeChange: (start: string, end: string) => void;
    onHover?: (date: string | null) => void;
}

// Format date as MM/DD/YYYY
const formatDateMMDDYYYY = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Label is now a timestamp (number), but handle string just in case
        const formattedLabel = (() => {
            if (typeof label === 'number') {
                const date = new Date(label);
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                const y = date.getFullYear();
                return `${m}-${d}-${y}`;
            }
            // Fallback for string 'YYYY-MM-DD'
            if (typeof label === 'string' && label.includes('-')) {
                const [y, m, d] = label.split('-');
                return `${m}-${d}-${y}`;
            }
            return String(label);
        })();
        return (
            <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-xl">
                <p className="text-gray-300 text-xs mb-1">{formattedLabel}</p>
                <p className="text-blue-400 font-bold text-sm">
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const ZoomSlider = ({ percentage, onChange, isZoomed }: { percentage: number; onChange: (val: number) => void; isZoomed: boolean }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
                onClick={() => onChange(Math.max(0, percentage - 10))}
                disabled={!isZoomed}
                className={`p-1 rounded transition-colors ${isZoomed
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed opacity-50'
                    }`}
            >
                <Minus size={14} />
            </button>

            <div className="w-12 text-center font-mono text-xs text-blue-400">
                {Math.round(percentage)}%
            </div>

            <button
                onClick={() => onChange(Math.min(100, percentage + 10))}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            >
                <Plus size={14} />
            </button>

            {/* Circular Indicator */}
            <div className="relative w-6 h-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray={`${(percentage / 100) * 62.83} 62.83`}
                        className="transition-all duration-300 ease-out"
                    />
                </svg>
            </div>
        </div>
    );
};

const ZoomInfoDisplay = ({ focusDate, rangeBefore, rangeAfter }: { focusDate: Date | null, rangeBefore: number, rangeAfter: number }) => {
    if (!focusDate) return null;
    return (
        <div className="bg-gray-900/30 backdrop-blur-[2px] border border-gray-700/50 rounded p-2 shadow-lg">
            <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                    <span className="text-orange-400 font-medium">Focus:</span>
                    <span className="text-white font-mono">
                        {focusDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </span>
                </div>
                <div className="w-px h-3 bg-gray-700"></div>
                <div className="flex items-center space-x-1">
                    <span className="text-blue-400 font-medium">Range:</span>
                    <span className="text-white font-mono">
                        {rangeBefore} / +{rangeAfter} Day(s)
                    </span>
                </div>
            </div>
        </div>
    );
};

export const FinancialChart: React.FC<FinancialChartProps> = ({
    data,
    granularity,
    onGranularityChange,
    simulationStartDate,
    simulationEndDate,
    visibleStartDate,
    visibleEndDate,
    onVisibleDateRangeChange,
    onHover
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number>(0);
    const [focusDate, setFocusDate] = useState<Date | null>(null);
    const [chartWidth, setChartWidth] = useState<number>(0);
    const [chartHeight, setChartHeight] = useState<number>(0);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const dragStartDateRef = useRef<number>(0);
    const dragDurationRef = useRef<number>(0);

    const [crosshairState, setCrosshairState] = useState<{
        x: number;
        y: number;
        visible: boolean;
        timestamp: number;
        value: number;
        formattedDate: string;
        formattedValue: string;
    } | null>(null);

    // Filter data based on visible range
    const displayData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const start = new Date(visibleStartDate).getTime();
        const end = new Date(visibleEndDate).getTime();

        // Filter by date range first
        const filteredByDate = data.filter(point => {
            const t = new Date(point.date).getTime();
            return t >= start && t <= end;
        });

        // Performance optimization for Daily view with large datasets
        if (granularity === Frequency.DAILY) {
            if (filteredByDate.length > 2000) {
                const step = Math.ceil(filteredByDate.length / 2000);
                return filteredByDate.filter((_, i) => i % step === 0);
            }
        }

        // Filter based on granularity
        return filteredByDate.filter((point, index) => {
            // Always keep first and last point of the visible range
            if (index === 0 || index === filteredByDate.length - 1) return true;

            const [y, m, d] = point.date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);

            switch (granularity) {
                case Frequency.WEEKLY: return dateObj.getDay() === 1;
                case Frequency.MONTHLY: return d === 1;
                case Frequency.QUARTERLY: return d === 1 && [1, 4, 7, 10].includes(m);
                case Frequency.YEARLY: return d === 1 && m === 1;
                default: return true;
            }
        });
    }, [data, granularity, visibleStartDate, visibleEndDate]);

    const displayDataWithTimestamp = useMemo(() => {
        return displayData.map(point => {
            const [y, m, d] = point.date.split('-').map(Number);
            return {
                ...point,
                timestamp: new Date(y, m - 1, d).getTime()
            };
        });
    }, [displayData]);

    // Calculate zoom percentage and offsets for display
    const { zoomPercentage, rangeBefore, rangeAfter } = useMemo(() => {
        const start = new Date(visibleStartDate);
        const end = new Date(visibleEndDate);
        const simStart = new Date(simulationStartDate);
        const simEnd = new Date(simulationEndDate);

        const currentRangeDays = getDaysDifference(start, end);
        const maxRangeDays = getDaysDifference(simStart, simEnd);

        const percentage = calculateZoomPercentage(currentRangeDays, maxRangeDays);

        // Use current focusDate if set, otherwise center
        const center = focusDate || new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
        const offsets = calculateRangeOffsets(center, start, end);

        return {
            zoomPercentage: percentage,
            rangeBefore: offsets.daysBefore,
            rangeAfter: offsets.daysAfter
        };
    }, [visibleStartDate, visibleEndDate, simulationStartDate, simulationEndDate, focusDate]);

    const isZoomed = zoomPercentage > 0;

    // Initialize focus date if needed
    useEffect(() => {
        if (!isZoomed) {
            setFocusDate(null);
        } else if (!focusDate) {
            const start = new Date(visibleStartDate).getTime();
            const end = new Date(visibleEndDate).getTime();
            setFocusDate(new Date(start + (end - start) / 2));
        }
    }, [isZoomed, visibleStartDate, visibleEndDate]);

    // Handle Zoom Slider Change
    const handleZoomChange = useCallback((newPercentage: number) => {
        const simStart = new Date(simulationStartDate);
        const simEnd = new Date(simulationEndDate);
        const maxRangeDays = getDaysDifference(simStart, simEnd);

        const newRangeDays = calculateRangeFromPercentage(newPercentage, maxRangeDays);

        // Determine focus date (use current or center)
        const currentStart = new Date(visibleStartDate);
        const currentEnd = new Date(visibleEndDate);
        const currentFocus = focusDate || new Date(currentStart.getTime() + (currentEnd.getTime() - currentStart.getTime()) / 2);

        // Calculate half range (symmetric)
        // Convert days to ms
        const msPerDay = 1000 * 60 * 60 * 24;
        const halfRangeMs = (newRangeDays * msPerDay) / 2;

        let newStart = new Date(currentFocus.getTime() - halfRangeMs);
        let newEnd = new Date(currentFocus.getTime() + halfRangeMs);

        // Constrain
        [newStart, newEnd] = constrainToBounds(newStart, newEnd, newRangeDays, simStart, simEnd);

        // Update focus if it shifted? Ideally we keep it, but if we hit bounds, effective focus shifts.
        // But for the slider, we just update the view.
        // We should set the focus date to the one we used.
        setFocusDate(currentFocus);

        onVisibleDateRangeChange(formatDate(newStart), formatDate(newEnd));
    }, [simulationStartDate, simulationEndDate, visibleStartDate, visibleEndDate, focusDate, onVisibleDateRangeChange]);

    // Pan Handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!chartContainerRef.current) return;

        const { top, left, width, height } = chartContainerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;
        const clientWidth = width;
        const clientHeight = height;

        const TOP_PADDING = 40; // Header height approx
        const BOTTOM_PADDING = 20; // Axis height approx
        const RIGHT_PADDING = 20; // Right padding
        const CHART_RIGHT_MARGIN = 30; // AreaChart margin.right

        // Ignore clicks in header/top padding
        if (offsetY < TOP_PADDING) return;

        // Ignore clicks in bottom padding
        if (offsetY > clientHeight - BOTTOM_PADDING) return;

        // Ignore clicks in right padding/margin
        if (offsetX > clientWidth - (RIGHT_PADDING + CHART_RIGHT_MARGIN)) return;

        setIsDragging(true);
        setDragStartX(e.clientX);
        dragStartDateRef.current = new Date(visibleStartDate).getTime();
        dragDurationRef.current = new Date(visibleEndDate).getTime() - new Date(visibleStartDate).getTime();
        setCrosshairState(null); // Hide crosshair when dragging starts
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = chartContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        // --- Dragging Logic ---
        if (isDragging) {
            const totalDeltaX = dragStartX - e.clientX;
            const duration = dragDurationRef.current;
            const timePerPixel = duration / width;
            const timeShift = totalDeltaX * timePerPixel;

            let newStart = dragStartDateRef.current + timeShift;
            let newEnd = newStart + duration;

            const simStart = new Date(simulationStartDate).getTime();
            const simEnd = new Date(simulationEndDate).getTime();

            if (newStart < simStart) {
                newStart = simStart;
                newEnd = newStart + duration;
            }
            if (newEnd > simEnd) {
                newEnd = simEnd;
                newStart = newEnd - duration;
            }

            onVisibleDateRangeChange(formatDate(new Date(newStart)), formatDate(new Date(newEnd)));

            const newCenter = newStart + (newEnd - newStart) / 2;
            setFocusDate(new Date(newCenter));
            return;
        }

        // --- Crosshair Logic ---
        if (x < 0 || x > width || y < 40 || y > height - 20) {
            setCrosshairState(null);
            return;
        }

        const currentStart = new Date(visibleStartDate).getTime();
        const currentEnd = new Date(visibleEndDate).getTime();
        const duration = currentEnd - currentStart;
        const timeAtCursor = currentStart + (x / width) * duration;

        let nearestPoint = null;
        let minDiff = Infinity;

        for (const point of displayDataWithTimestamp) {
            const diff = Math.abs(point.timestamp - timeAtCursor);
            if (diff < minDiff) {
                minDiff = diff;
                nearestPoint = point;
            }
        }

        if (nearestPoint) {
            let min = Infinity;
            let max = -Infinity;
            if (displayDataWithTimestamp.length === 0) {
                min = 0; max = 10000;
            } else {
                for (const p of displayDataWithTimestamp) {
                    if (p.balance < min) min = p.balance;
                    if (p.balance > max) max = p.balance;
                }
            }
            if (min === max) { min -= 1000; max += 1000; }

            const range = max - min;
            const niceMin = Math.floor(min - range * 0.05);
            const niceMax = Math.ceil(max + range * 0.05);
            const yDomainMin = niceMin;
            const yDomainMax = niceMax;

            const valueRatio = (nearestPoint.balance - yDomainMin) / (yDomainMax - yDomainMin);
            const snappedY = height - (valueRatio * height);

            setCrosshairState({
                x: (nearestPoint.timestamp - currentStart) / duration * width,
                y: snappedY,
                visible: true,
                timestamp: nearestPoint.timestamp,
                value: nearestPoint.balance,
                formattedDate: formatDate(new Date(nearestPoint.timestamp)),
                formattedValue: formatCurrency(nearestPoint.balance)
            });

            // Notify parent of hover
            if (onHover) {
                onHover(formatDate(new Date(nearestPoint.timestamp)));
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setCrosshairState(null);
        if (onHover) onHover(null);
    };

    // Zoom Logic (Wheel)
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const container = chartContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const width = rect.width;
        const cursorRatio = Math.max(0, Math.min(1, cursorX / width));

        const currentStart = new Date(visibleStartDate).getTime();
        const currentEnd = new Date(visibleEndDate).getTime();
        const currentDuration = currentEnd - currentStart;

        let newDuration = currentDuration / Math.exp(-e.deltaY * 0.001);

        // Calculate new bounds anchored to cursor
        const anchorTime = currentStart + currentDuration * cursorRatio;
        let newStart = anchorTime - newDuration * cursorRatio;
        let newEnd = newStart + newDuration;

        // Constrain to data bounds
        const simStart = new Date(simulationStartDate);
        const simEnd = new Date(simulationEndDate);

        let [constrainedNewStart, constrainedNewEnd] = constrainToBounds(
            new Date(newStart),
            new Date(newEnd),
            newDuration / (1000 * 60 * 60 * 24), // Convert ms to days for utility
            simStart,
            simEnd
        );

        // Update focus date to the anchor point
        setFocusDate(new Date(anchorTime));

        onVisibleDateRangeChange(formatDate(constrainedNewStart), formatDate(constrainedNewEnd));
    };

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', onWheel);
        };
    }, []);

    // Track chart container dimensions for tick generation
    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setChartWidth(width);
                setChartHeight(height);
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const ticks = useMemo(() => {
        return generateSmartTicks(new Date(visibleStartDate), new Date(visibleEndDate), chartWidth);
    }, [visibleStartDate, visibleEndDate, chartWidth]);

    const tickFormatter = useMemo(() => {
        return getSmartTickFormat(new Date(visibleStartDate), new Date(visibleEndDate), chartWidth);
    }, [visibleStartDate, visibleEndDate, chartWidth]);

    const { yTicks, yDomain, yTickFormatter } = useMemo(() => {
        let min = Infinity;
        let max = -Infinity;

        if (displayDataWithTimestamp.length === 0) {
            min = 0;
            max = 10000;
        } else {
            for (const point of displayDataWithTimestamp) {
                if (point.balance < min) min = point.balance;
                if (point.balance > max) max = point.balance;
            }
        }

        if (min === max) {
            min -= 1000;
            max += 1000;
        }

        const { ticks, domain } = generateSmartYTicks(min, max, chartHeight);
        const formatter = getSmartYTickFormatter(domain[1]);

        return { yTicks: ticks, yDomain: domain, yTickFormatter: formatter };
    }, [displayDataWithTimestamp, chartHeight]);

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 relative z-20">
                <div className="flex items-center space-x-4">
                    {/* Granularity / Views */}
                    <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
                        {[Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY, Frequency.QUARTERLY, Frequency.YEARLY].map((g) => (
                            <button
                                key={g}
                                onClick={() => onGranularityChange(g)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${granularity === g
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                    }`}
                            >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Reset Zoom - Maintains space when hidden */}
                    <button
                        onClick={() => {
                            onVisibleDateRangeChange(simulationStartDate, simulationEndDate);
                            setFocusDate(null);
                        }}
                        className={`p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-all ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        title="Reset Zoom"
                        aria-hidden={!isZoomed}
                    >
                        <RotateCcw size={16} />
                    </button>

                    {/* Zoom Slider */}
                    <ZoomSlider percentage={zoomPercentage} onChange={handleZoomChange} isZoomed={isZoomed} />
                </div>

                <div className="flex items-center space-x-4">
                    {/* Visible Range Display */}
                    <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-700 h-8 justify-center">
                        <span className="text-gray-400 text-xs">Zoomed:</span>
                        <span className="text-white font-mono text-xs">
                            {isZoomed
                                ? `${formatDateMMDDYYYY(new Date(visibleStartDate))} - ${formatDateMMDDYYYY(new Date(visibleEndDate))}`
                                : '-/-/- - -/-/-'
                            }
                        </span>
                    </div>

                    {/* Simulation Dates - Text display with click handlers */}
                    <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-700 h-8 justify-center">
                        <span className="text-gray-400 text-xs">Sim:</span>
                        <span className="text-white font-mono text-xs">
                            {formatDateMMDDYYYY(new Date(simulationStartDate))} - {formatDateMMDDYYYY(new Date(simulationEndDate))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div
                ref={chartContainerRef}
                className={`flex-1 relative min-h-0 w-full focus-visible:outline-none focus-visible:ring-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
            >
                {/* Zoom Info Overlay */}
                <div className="absolute top-2 left-2 z-10">
                    <ZoomInfoDisplay focusDate={focusDate} rangeBefore={rangeBefore} rangeAfter={rangeAfter} />
                </div>

                {/* Crosshair Overlay */}
                {crosshairState && crosshairState.visible && (
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                        <line
                            x1={crosshairState.x}
                            y1={0}
                            x2={crosshairState.x}
                            y2={chartHeight}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                        <line
                            x1={0}
                            y1={crosshairState.y}
                            x2={chartWidth}
                            y2={crosshairState.y}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                        {/* Circle removed as requested */}
                        <g transform={`translate(${crosshairState.x}, ${chartHeight - 20})`}>
                            <rect x="-40" y="0" width="80" height="20" rx="4" fill="#1f2937" stroke="#374151" />
                            <text x="0" y="14" textAnchor="middle" fill="white" fontSize="10" className="font-mono">{crosshairState.formattedDate}</text>
                        </g>
                        <g transform={`translate(${chartWidth - 50}, ${crosshairState.y - 10})`}>
                            <rect x="0" y="0" width="50" height="20" rx="4" fill="#1f2937" stroke="#374151" />
                            <text x="25" y="14" textAnchor="middle" fill="white" fontSize="10" className="font-mono">{crosshairState.formattedValue}</text>
                        </g>
                    </svg>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={displayDataWithTimestamp}
                        margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            stroke="#374151"
                            strokeWidth={1}
                            horizontalPoints={yTicks}
                            verticalPoints={ticks}
                        />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={tickFormatter}
                            ticks={ticks}
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            allowDataOverflow={true}
                        />
                        <YAxis
                            domain={yDomain}
                            ticks={yTicks}
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={yTickFormatter}
                            orientation="right"
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#60a5fa"
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />

                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};