import React from 'react';
import { formatCurrency } from '../utils';
import { GripVertical } from 'lucide-react';

interface TotalEventBarProps {
    delta: number;
    endDate: string; // "MM-DD-YYYY" or similar
}

export const TotalEventBar: React.FC<TotalEventBarProps> = ({ delta, endDate }) => {
    // The "Total" active bar should conceptually span the entire timeline as it summarizes everything.
    // We use the same 'calc(100% - 80px)' width logic to align with the chart's time scale area,
    // assuming the other bars use this to offset the Y-axis space.

    return (
        <div className="relative h-10 mx-2 mb-1 rounded-md border border-gray-700 overflow-hidden select-none shrink-0 group">
            {/* Full Width Track (Inactive background - dark to contrast with gradient) */}
            <div className="absolute inset-0 bg-gray-900/50" />

            {/* Plotting Area Container - Matches Chart Width (minus Right Axis space) */}
            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ width: 'calc(100% - 80px)', left: 0 }}>
                {/* Active Gradient Bar - Full width of the plotting area */}
                <div
                    className="absolute top-0 h-full bg-gradient-to-r from-lime-400/80 via-emerald-400/80 to-purple-500/80 transition-all duration-300 opacity-90"
                    style={{ width: '100%', left: 0 }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex items-center h-full px-4 w-full">
                {/* Icon (9 dots / Grip) */}
                <div className="mr-2 text-gray-500">
                    <GripVertical size={14} />
                </div>

                {/* Name */}
                <span className="font-bold text-sm text-white drop-shadow-sm">Total</span>

                {/* Center Delta */}
                <div className="flex-1 flex justify-center items-center">
                    <div className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10 shadow-sm flex items-center space-x-1">
                        <span>{delta >= 0 ? '▲' : '▼'}</span>
                        <span>{formatCurrency(delta)}</span>
                    </div>
                </div>

                {/* Right Side: End Date + Badge */}
                <div className="flex items-center space-x-2 text-xs font-mono z-10 ml-auto text-white">
                    <span className="opacity-80 uppercase text-[10px] tracking-wider font-semibold drop-shadow-sm">Ends {endDate}</span>
                    <span className="px-1.5 py-0.5 bg-gray-900/80 border border-gray-600 rounded uppercase text-[10px] tracking-wider text-gray-300 font-bold shadow-sm">
                        TOTAL
                    </span>
                </div>
            </div>

            {/* Color Indicator Strip - Full Height, Far Right */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-lime-400 to-purple-500 shadow-sm z-20" />
        </div>
    );
};
