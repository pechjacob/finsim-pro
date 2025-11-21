import React from 'react';
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
import { formatCurrency, formatDate } from '../utils';
import { Layout } from 'lucide-react';

interface FinancialChartProps {
  data: SimulationPoint[];
  granularity: Frequency;
  onGranularityChange: (g: Frequency) => void;
  startDate: string;
  endDate: string;
  onDateRangeChange: (start: string, end: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-xl">
        <p className="text-gray-300 text-xs mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-sm">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const FinancialChart: React.FC<FinancialChartProps> = ({
  data,
  granularity,
  onGranularityChange,
  startDate,
  endDate,
  onDateRangeChange
}) => {

  const displayData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Performance optimization for Daily view with large datasets
    if (granularity === Frequency.DAILY) {
        // If dataset is massive (e.g. > 2000 points ~ 6 years), downsample slightly to keep UI responsive
        if (data.length > 2000) {
             const step = Math.ceil(data.length / 2000);
             return data.filter((_, i) => i % step === 0);
        }
        return data;
    }

    // Filter based on granularity
    return data.filter((point, index) => {
        // Always keep first and last point to maintain the full time range visual
        if (index === 0 || index === data.length - 1) return true;

        const [y, m, d] = point.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);

        switch (granularity) {
            case Frequency.WEEKLY:
                // Return Mondays (Day 1)
                return dateObj.getDay() === 1;
            case Frequency.MONTHLY:
                // Return 1st of month
                return d === 1;
            case Frequency.QUARTERLY:
                // Return 1st of Jan, Apr, Jul, Oct
                return d === 1 && [1, 4, 7, 10].includes(m);
            case Frequency.YEARLY:
                // Return 1st of Jan
                return d === 1 && m === 1;
            default:
                return true;
        }
    });
  }, [data, granularity]);

  return (
    <div className="flex flex-col h-full bg-gray-950 relative">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
            <div className="flex space-x-4">
                 {Object.values(Frequency).map((freq) => (
                     <button
                        key={freq}
                        onClick={() => onGranularityChange(freq)}
                        className={`text-xs font-medium transition-colors ${granularity === freq ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                         {freq.charAt(0) + freq.slice(1).toLowerCase()}
                     </button>
                 ))}
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-400 text-xs">
                    <div className="flex items-center bg-gray-900 rounded px-2 py-1 border border-gray-800">
                        <span className="mr-2">From:</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => onDateRangeChange(e.target.value, endDate)}
                            className="bg-transparent text-white focus:outline-none w-24"
                        />
                    </div>
                    <span>—</span>
                    <div className="flex items-center bg-gray-900 rounded px-2 py-1 border border-gray-800">
                        <span className="mr-2">To:</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => onDateRangeChange(startDate, e.target.value)}
                            className="bg-transparent text-white focus:outline-none w-24"
                        />
                    </div>
                </div>

                <div className="flex items-center text-gray-400 text-xs font-bold tracking-wider border-l border-gray-800 pl-6">
                    <Layout size={14} className="mr-2" /> FINSIM PRO
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 w-full pt-14 pb-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={displayData}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={true} horizontal={true} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#6b7280" 
                        tick={{fill: '#6b7280', fontSize: 10}}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="#6b7280"
                        tick={{fill: '#6b7280', fontSize: 10}}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                        orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#60a5fa" 
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                        strokeWidth={2}
                    />
                    <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};