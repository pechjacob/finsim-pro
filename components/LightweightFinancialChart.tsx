import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';
import { RotateCcw, Minus, Plus } from 'lucide-react';
import { Frequency } from '../types';
import {
    formatDate,
    formatCurrency,
    getDaysDifference,
    calculateZoomPercentage,
    calculateRangeFromPercentage,
    calculateRangeOffsets,
    constrainToBounds,
    aggregateData
} from '../utils';

export interface BalanceDataPoint {
    date: string;
    balance: number;
}

interface LightweightFinancialChartProps {
    balanceData: BalanceDataPoint[];
    visibleStartDate: string;
    visibleEndDate: string;
    simulationStartDate: string;
    simulationEndDate: string;
    onVisibleDateRangeChange: (startDate: string, endDate: string) => void;
    onSimulationDateRangeChange: (startDate: string, endDate: string) => void;
    frequency: Frequency;
    onFrequencyChange: (frequency: Frequency) => void;
    onHover?: (date: string | null) => void;
}

// Format date as MM/DD/YYYY
const formatDateMMDDYYYY = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

const ZoomSlider = ({ percentage, onChange, isZoomed, onReset }: { percentage: number; onChange: (val: number) => void; isZoomed: boolean; onReset: () => void }) => {
    return (
        <div className="flex items-center space-x-0.5 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
                onClick={() => onChange(Math.max(0, percentage - 10))}
                disabled={percentage <= 0}
                className={`p-1 rounded transition-colors ${percentage > 0
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
                disabled={percentage >= 100}
                className={`p-1 rounded transition-colors ${percentage < 100
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed opacity-50'
                    }`}
            >
                <Plus size={14} />
            </button>

            <div className="relative w-6 h-6 flex items-center justify-center">
                <svg className="transform -rotate-90 absolute inset-0" width="24" height="24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#374151" strokeWidth="2" />
                    <circle
                        cx="12" cy="12" r="10" fill="none" stroke="#3b82f6" strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - percentage / 100)}`}
                        className="transition-all duration-300"
                    />
                </svg>
                <button
                    onClick={onReset}
                    className={`relative z-10 p-0.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    title="Reset Zoom"
                    aria-hidden={!isZoomed}
                >
                    <RotateCcw size={10} />
                </button>
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

export const LightweightFinancialChart: React.FC<LightweightFinancialChartProps> = ({
    balanceData,
    visibleStartDate,
    visibleEndDate,
    simulationStartDate,
    simulationEndDate,
    onVisibleDateRangeChange,
    onSimulationDateRangeChange,
    frequency,
    onFrequencyChange,
    onHover
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const isInitialized = useRef(false);

    const [focusDate, setFocusDate] = useState<Date | null>(null);
    const [zoomPercentage, setZoomPercentage] = useState(0);
    const [crosshairPosition, setCrosshairPosition] = useState<{ date: string; value: number } | null>(null);
    const [simLinePositions, setSimLinePositions] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });
    const [headerDateRange, setHeaderDateRange] = useState<{ from: string; to: string } | null>(null);

    // Convert balance data to lightweight-charts format
    const chartData = useMemo(() => {
        const aggregated = aggregateData(balanceData, frequency);
        return aggregated.map(point => ({
            time: point.date, // YYYY-MM-DD format
            value: point.balance
        }));
    }, [balanceData, frequency]);

    const simStart = useMemo(() => new Date(simulationStartDate), [simulationStartDate]);
    const simEnd = useMemo(() => new Date(simulationEndDate), [simulationEndDate]);

    // Calculate data bounds from aggregated data
    const { dataStart, dataEnd } = useMemo(() => {
        if (chartData.length === 0) return { dataStart: simStart, dataEnd: simEnd };
        // Parse dates from chartData which are YYYY-MM-DD strings
        const start = new Date(chartData[0].time as string);
        const end = new Date(chartData[chartData.length - 1].time as string);
        return { dataStart: start, dataEnd: end };
    }, [chartData, simStart, simEnd]);

    const maxRangeDays = useMemo(() => getDaysDifference(dataStart, dataEnd), [dataStart, dataEnd]);

    const isZoomed = useMemo(() => {
        const currentRange = getDaysDifference(new Date(visibleStartDate), new Date(visibleEndDate));
        // Use a larger tolerance (2.5 days) to account for sub-day precision differences and chart snapping
        // Only consider zoomed if current range is significantly SMALLER than max range
        return (maxRangeDays - currentRange) > 2.5;
    }, [visibleStartDate, visibleEndDate, maxRangeDays]);



    const { rangeBefore, rangeAfter } = useMemo(() => {
        if (!focusDate) return { rangeBefore: 0, rangeAfter: 0 };
        const { daysBefore, daysAfter } = calculateRangeOffsets(focusDate, new Date(visibleStartDate), new Date(visibleEndDate));
        return { rangeBefore: daysBefore, rangeAfter: daysAfter };
    }, [focusDate, visibleStartDate, visibleEndDate]);

    // Refs for callbacks to avoid stale closures in chart subscriptions
    const latestOnHover = useRef(onHover);
    const latestOnVisibleDateRangeChange = useRef(onVisibleDateRangeChange);
    const latestMaxRangeDays = useRef(maxRangeDays);

    useEffect(() => {
        latestOnHover.current = onHover;
        latestOnVisibleDateRangeChange.current = onVisibleDateRangeChange;
        latestMaxRangeDays.current = maxRangeDays;
    }, [onHover, onVisibleDateRangeChange, maxRangeDays]);

    // Ref for chartData to avoid stale closures in callbacks
    const latestChartData = useRef(chartData);
    useEffect(() => {
        latestChartData.current = chartData;
    }, [chartData]);

    // Helper to get coordinate for any date
    const getCoordinateForDate = useCallback((targetDateStr: string): number | null => {
        if (!chartRef.current || latestChartData.current.length === 0) return null;

        const timeScale = chartRef.current.timeScale();
        const data = latestChartData.current;

        // 1. Try exact match
        const exactCoord = timeScale.timeToCoordinate(targetDateStr);
        if (exactCoord !== null) return exactCoord;

        // 2. Check bounds and snap if close/outside (handling aggregation shifts)
        const targetDate = new Date(targetDateStr);
        const firstDate = new Date(data[0].time as string);
        const lastDate = new Date(data[data.length - 1].time as string);

        // If target is before first data point, snap to first point (e.g. Sim Start in Weekly view)
        if (targetDate < firstDate) {
            return timeScale.timeToCoordinate(data[0].time as string);
        }
        // If target is after last data point, snap to last point
        if (targetDate > lastDate) {
            return timeScale.timeToCoordinate(data[data.length - 1].time as string);
        }

        // 3. Find closest date in chartData (Binary Search)
        let low = 0;
        let high = data.length - 1;
        let closestIndex = 0;
        let minDiff = Infinity;
        const targetTime = targetDate.getTime();

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midDate = new Date(data[mid].time as string);
            const midTime = midDate.getTime();
            const diff = Math.abs(midTime - targetTime);

            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = mid;
            }

            if (midTime < targetTime) {
                low = mid + 1;
            } else if (midTime > targetTime) {
                high = mid - 1;
            } else {
                closestIndex = mid;
                break;
            }
        }

        // Use the coordinate of the closest point
        return timeScale.timeToCoordinate(data[closestIndex].time as string);
    }, []);

    const updateSimLines = useCallback(() => {
        if (!chartRef.current || !chartContainerRef.current) return;
        const startX = getCoordinateForDate(simulationStartDate);
        let endX = getCoordinateForDate(simulationEndDate);

        // Clamp endX to avoid drawing over the price scale (approx 80px width)
        if (endX !== null) {
            const chartWidth = chartContainerRef.current.clientWidth;
            const priceScaleWidth = 80; // Fixed width from config
            endX = Math.min(endX, chartWidth - priceScaleWidth);
        }

        setSimLinePositions({ start: startX, end: endX });
    }, [simulationStartDate, simulationEndDate, getCoordinateForDate]);

    // Ref for updateSimLines to be used in subscriptions
    const latestUpdateSimLines = useRef(updateSimLines);
    useEffect(() => {
        latestUpdateSimLines.current = updateSimLines;
        // Trigger update immediately when logic/data changes
        updateSimLines();
    }, [updateSimLines, chartData]);



    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });

                // Update sim lines on resize
                latestUpdateSimLines.current?.();
            }
        };

        // Helper to get coordinate for any date, handling missing points in aggregated data
        // REMOVED: Moved to component scope to access latestChartData ref

        // REMOVED: updateSimLines moved to component scope

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0a0e1a' },
                textColor: '#9ca3af',
            },
            localization: {
                timeFormatter: (timestamp: number) => {
                    // Ensure we have a valid timestamp
                    if (timestamp === undefined || timestamp === null || isNaN(timestamp)) return '';
                    const date = new Date(timestamp * 1000);
                    const month = date.toLocaleString('en-US', { month: 'short' });
                    const day = date.getDate();
                    const year = date.getFullYear();
                    return `${month} ${day} ${year}`;
                }
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            grid: {
                vertLines: { color: '#374151', style: LineStyle.Solid },
                horzLines: { color: '#374151', style: LineStyle.Solid },
            },
            crosshair: {
                mode: CrosshairMode.Magnet,
                vertLine: {
                    width: 1,
                    color: 'rgba(255, 255, 255, 0.3)',
                    style: LineStyle.Dashed,
                    labelVisible: true,
                    labelBackgroundColor: '#3b82f6',
                },
                horzLine: {
                    width: 1,
                    color: 'rgba(255, 255, 255, 0.3)',
                    style: LineStyle.Dashed,
                    labelVisible: true,
                    labelBackgroundColor: '#3b82f6',
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#374151',
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            rightPriceScale: {
                borderColor: '#374151',
                visible: true,
                borderVisible: true,
                minimumWidth: 80, // Fixed width for alignment with timeline
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: false,
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
                axisPressedMouseMove: false,
                axisDoubleClickReset: false,
            },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#60a5fa',
            topColor: 'rgba(59, 130, 246, 0.3)',
            bottomColor: 'rgba(59, 130, 246, 0)',
            lineWidth: 2,
            priceLineVisible: true,
            lastValueVisible: true,
        });

        chartRef.current = chart;
        seriesRef.current = areaSeries;

        // Subscribe to crosshair move
        chart.subscribeCrosshairMove((param) => {
            if (param.time && param.seriesData.size > 0) {
                const data = param.seriesData.get(areaSeries);
                if (data) {
                    const dateStr = param.time as string;
                    setCrosshairPosition({ date: dateStr, value: (data as any).value });
                    if (latestOnHover.current) {
                        latestOnHover.current(dateStr);
                    }
                }
            } else {
                setCrosshairPosition(null);
                if (latestOnHover.current) {
                    latestOnHover.current(null);
                }
            }
        });
        // Subscribe to visible range changes to sync back to parent
        // Subscribe to visible range changes to sync back to parent
        // Subscribe to visible range changes to sync back to parent
        chart.timeScale().subscribeVisibleTimeRangeChange(() => {
            // Ignore updates until we've set the initial range
            if (!isInitialized.current) return;

            // 1. Update Header Display (Snapped to Bars)
            const logicalRange = chart.timeScale().getVisibleLogicalRange();
            if (logicalRange) {
                const fromIndex = Math.max(0, Math.ceil(logicalRange.from));
                const toIndex = Math.min(latestChartData.current.length - 1, Math.floor(logicalRange.to));

                if (fromIndex <= toIndex && latestChartData.current.length > 0) {
                    const fromStr = latestChartData.current[fromIndex].time as string;
                    const toStr = latestChartData.current[toIndex].time as string;
                    setHeaderDateRange({ from: fromStr, to: toStr });
                }
            }

            // 2. Update Parent State (Exact Range for Smooth Panning)
            const timeRange = chart.timeScale().getVisibleRange();
            if (timeRange) {
                const fromStr = timeRange.from as string;
                const toStr = timeRange.to as string;

                if (latestOnVisibleDateRangeChange.current) {
                    latestOnVisibleDateRangeChange.current(fromStr, toStr);
                }

                const start = new Date(fromStr);
                const end = new Date(toStr);
                const rangeDays = getDaysDifference(start, end);
                const percentage = calculateZoomPercentage(rangeDays, latestMaxRangeDays.current);

                // Snap to nearest 5% if within 2.5% to avoid "weird" values like 8% or 18%
                // This corrects for small deviations due to chart bar alignment (especially in Monthly view)
                const snapped = Math.round(percentage / 5) * 5;
                if (Math.abs(percentage - snapped) < 2.5) {
                    setZoomPercentage(snapped);
                } else {
                    setZoomPercentage(percentage);
                }
            }

            // Update sim lines
            latestUpdateSimLines.current?.();
            setSimLinePositions(prev => prev); // Force re-render if needed
        });

        window.addEventListener('resize', handleResize);

        // Initial update of Sim lines to ensure they appear on load
        // Use setTimeout to ensure the chart is fully ready and data might be available
        setTimeout(() => {
            latestUpdateSimLines.current?.();
        }, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            isInitialized.current = false;
        };
    }, []); // Run once on mount

    // Update data separately
    useEffect(() => {
        if (seriesRef.current) {
            seriesRef.current.setData(chartData);
            // Ensure Sim lines are updated if chart is already ready when data loads
            if (chartRef.current) {
                // Use setTimeout to allow chart to process new data before calculating coordinates
                setTimeout(() => {
                    latestUpdateSimLines.current?.();
                }, 50);
            }
        }
    }, [chartData]);

    // Update visible range from props
    useEffect(() => {
        if (!chartRef.current) return;

        const currentRange = chartRef.current.timeScale().getVisibleRange();
        if (currentRange) {
            const currentFrom = new Date(currentRange.from as string).getTime();
            const currentTo = new Date(currentRange.to as string).getTime();

            const propFrom = new Date(visibleStartDate).getTime();
            const propTo = new Date(visibleEndDate).getTime();

            // Calculate difference in days
            const diffFrom = Math.abs(currentFrom - propFrom) / (1000 * 60 * 60 * 24);
            const diffTo = Math.abs(currentTo - propTo) / (1000 * 60 * 60 * 24);

            // If both are within 1 day of precision, don't force update
            // This prevents "snapping" when the chart is at a sub-day position but state is daily
            if (diffFrom < 1 && diffTo < 1) {
                return;
            }
        }

        const startTime = new Date(visibleStartDate).getTime() / 1000;
        const endTime = new Date(visibleEndDate).getTime() / 1000;

        try {
            chartRef.current.timeScale().setVisibleRange({ from: startTime, to: endTime });
            // Mark as initialized after first successful set
            if (!isInitialized.current) {
                // Small timeout to allow chart to settle? 
                // Actually, setVisibleRange is synchronous in applying to state, but rendering is async.
                // Let's set it immediately so subsequent callbacks are honored.
                setTimeout(() => {
                    isInitialized.current = true;
                }, 100);
            }
        } catch (e) {
            // Ignore if range is invalid
        }
    }, [visibleStartDate, visibleEndDate]);

    // Initialize focus date
    useEffect(() => {
        if (isZoomed && !focusDate) {
            const start = new Date(visibleStartDate).getTime();
            const end = new Date(visibleEndDate).getTime();
            setFocusDate(new Date(start + (end - start) / 2));
        } else if (!isZoomed) {
            setFocusDate(null);
        }
    }, [isZoomed, visibleStartDate, visibleEndDate, focusDate]);

    const handleZoomChange = useCallback((newPercentage: number) => {
        const newRangeDays = calculateRangeFromPercentage(newPercentage, maxRangeDays);

        const currentStart = new Date(visibleStartDate);
        const currentEnd = new Date(visibleEndDate);
        const currentFocus = focusDate || new Date(currentStart.getTime() + (currentEnd.getTime() - currentStart.getTime()) / 2);

        const msPerDay = 1000 * 60 * 60 * 24;
        const halfRangeMs = (newRangeDays * msPerDay) / 2;

        let newStart = new Date(currentFocus.getTime() - halfRangeMs);
        let newEnd = new Date(currentFocus.getTime() + halfRangeMs);

        [newStart, newEnd] = constrainToBounds(newStart, newEnd, newRangeDays, dataStart, dataEnd);

        setFocusDate(currentFocus);
        onVisibleDateRangeChange(formatDate(newStart), formatDate(newEnd));
    }, [focusDate, visibleStartDate, visibleEndDate, maxRangeDays, dataStart, dataEnd, onVisibleDateRangeChange]);

    const handleReset = useCallback(() => {
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
            setFocusDate(null);
            // We don't need to manually call onVisibleDateRangeChange here
            // because fitContent() will trigger subscribeVisibleTimeRangeChange
            // which will update the state automatically.
        }
    }, []);

    // Reset view when frequency changes to prevent invalid zoom state
    useEffect(() => {
        handleReset();
    }, [frequency, handleReset]);

    return (
        <div className="flex flex-col h-full bg-gray-950">
            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                    {/* Granularity Buttons */}
                    <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
                        {[Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY, Frequency.QUARTERLY, Frequency.YEARLY].map((freq) => (
                            <button
                                key={freq}
                                onClick={() => onFrequencyChange(freq)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${frequency === freq
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Visible Range Display */}
                    <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-700 h-8 justify-center w-[290px]">
                        <span className={`text-xs font-medium ${isZoomed ? 'text-orange-400' : 'text-gray-400'}`}>Zoomed:</span>
                        <div className="grid grid-cols-[85px_20px_85px] items-center text-white font-mono text-xs">
                            <span className="text-center">
                                {isZoomed && headerDateRange ? formatDateMMDDYYYY(new Date(headerDateRange.from)) : '-/-/-'}
                            </span>
                            <span className="text-center">-</span>
                            <span className="text-center">
                                {isZoomed && headerDateRange ? formatDateMMDDYYYY(new Date(headerDateRange.to)) : '-/-/-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reset Zoom - Centered */}


                <div className="flex items-center space-x-4">
                    {/* Zoom Slider */}
                    <ZoomSlider percentage={zoomPercentage} onChange={handleZoomChange} isZoomed={isZoomed} onReset={handleReset} />

                    {/* Simulation Dates */}
                    <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-700 h-8 justify-center mr-2">
                        <span className="text-xs text-lime-400">Sim:</span>
                        <div className="bg-white/10 rounded px-1 flex items-center justify-center h-5 hover:bg-lime-400/20 transition-colors cursor-pointer" onClick={() => document.getElementById('sim-start-date')?.showPicker()}>
                            <input
                                id="sim-start-date"
                                type="date"
                                value={simulationStartDate}
                                onChange={(e) => onSimulationDateRangeChange(e.target.value, simulationEndDate)}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.showPicker();
                                }}
                                className="bg-transparent text-white font-mono text-xs border-none outline-none p-0 w-[80px] text-center cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden selection:bg-transparent caret-transparent"
                            />
                        </div>
                        <span className="text-gray-400 text-xs">-</span>
                        <div className="bg-white/10 rounded px-1 flex items-center justify-center h-5 hover:bg-lime-400/20 transition-colors cursor-pointer" onClick={() => document.getElementById('sim-end-date')?.showPicker()}>
                            <input
                                id="sim-end-date"
                                type="date"
                                value={simulationEndDate}
                                onChange={(e) => onSimulationDateRangeChange(simulationStartDate, e.target.value)}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.showPicker();
                                }}
                                className="bg-transparent text-white font-mono text-xs border-none outline-none p-0 w-[80px] text-center cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden selection:bg-transparent caret-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative flex-1 overflow-hidden">
                {/* Focus/Range Overlay */}
                {isZoomed && focusDate && (
                    <div className="absolute top-2 left-2 z-10">
                        <ZoomInfoDisplay focusDate={focusDate} rangeBefore={rangeBefore} rangeAfter={rangeAfter} />
                    </div>
                )}

                <div
                    ref={chartContainerRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                {/* Sim Start Line */}
                {simLinePositions.start !== null && (
                    <div
                        className="absolute top-0 bottom-[30px] border-l border-lime-400 border-dashed w-px pointer-events-none z-50"
                        style={{ left: `${simLinePositions.start}px` }}
                    >
                        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-lime-400 bg-gray-900/80 px-1 rounded pointer-events-auto whitespace-nowrap">
                            Start
                        </span>
                    </div>
                )}
                {/* Sim End Line */}
                {simLinePositions.end !== null && (
                    <div
                        className="absolute top-0 bottom-[30px] border-l border-lime-400 border-dashed w-px pointer-events-none z-50"
                        style={{ left: `${simLinePositions.end}px` }}
                    >
                        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-lime-400 bg-gray-900/80 px-1 rounded pointer-events-auto whitespace-nowrap">
                            End
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
