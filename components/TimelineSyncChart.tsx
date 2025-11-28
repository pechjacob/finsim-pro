import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { Frequency } from '../types';
import { aggregateData } from '../utils';

interface TimelineSyncChartProps {
    visibleStartDate: string;
    visibleEndDate: string;
    hoverDate: string | null;
    simulationPoints: { date: string; balance: number }[];
    frequency: Frequency;
}

export const TimelineSyncChart: React.FC<TimelineSyncChartProps> = ({
    visibleStartDate,
    visibleEndDate,
    hoverDate,
    simulationPoints,
    frequency
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    // Initialize chart
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'rgba(0, 0, 0, 0)' },
                textColor: 'transparent',
                attributionLogo: false,
            },
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: 'rgba(255, 255, 255, 0.3)',
                    style: LineStyle.Dashed,
                    labelVisible: false,
                },
                horzLine: { visible: false, labelVisible: false },
            },
            timeScale: {
                visible: false,
                borderColor: '#374151',
                fixLeftEdge: true,
                fixRightEdge: true,
                // Hide labels since we just want grid/crosshair
                timeVisible: false,
                secondsVisible: false,
            },
            rightPriceScale: {
                visible: true,
                minimumWidth: 80, // Match main chart
                borderVisible: false,
                ticksVisible: false,
            },
            handleScroll: false,
            handleScale: false,
        });

        // Dummy series to allow crosshair positioning
        const series = chart.addSeries(LineSeries, {
            visible: false,
            lastValueVisible: false,
            priceLineVisible: false,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !entries[0].contentRect) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []);

    // Update data
    useEffect(() => {
        if (!seriesRef.current || !simulationPoints) return;
        const aggregated = aggregateData(simulationPoints, frequency);
        // Convert dates to Unix timestamps (seconds) for consistency
        const data = aggregated.map(p => ({
            time: new Date(p.date).getTime() / 1000,
            value: 0
        }));
        seriesRef.current.setData(data);
    }, [simulationPoints, frequency]);

    // Sync Visible Range
    useLayoutEffect(() => {
        if (!chartRef.current) return;

        const startTime = new Date(visibleStartDate).getTime() / 1000;
        const endTime = new Date(visibleEndDate).getTime() / 1000;

        try {
            chartRef.current.timeScale().setVisibleRange({ from: startTime, to: endTime });
        } catch (e) {
            // Ignore invalid range
        }
    }, [visibleStartDate, visibleEndDate]);

    // Sync Crosshair
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current) return;

        if (hoverDate) {
            // Convert hoverDate to Unix timestamp (seconds) for consistency
            const hoverTime = new Date(hoverDate).getTime() / 1000;
            chartRef.current.setCrosshairPosition(0, hoverTime, seriesRef.current);
        } else {
            chartRef.current.clearCrosshairPosition();
        }
    }, [hoverDate]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        />
    );
};
