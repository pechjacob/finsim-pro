import { Frequency } from './types';

export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getDaysDifference = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const parseDate = (dateStr: string): Date => {
  // Handle potential timezone issues by treating inputs as noon UTC or simple splits
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const generateSmartTicks = (start: Date, end: Date, width: number): number[] => {
  const duration = end.getTime() - start.getTime();
  if (duration <= 0 || width <= 0) return [];

  const pixelsPerMs = width / duration;
  const targetSpacingPx = 80; // Target ~80px spacing for higher density
  const targetIntervalMs = targetSpacingPx / pixelsPerMs;

  // Define nice intervals in ms
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY; // Approx
  const THREE_MONTHS = 3 * ONE_MONTH;
  const ONE_YEAR = 365 * ONE_DAY;
  const FIVE_YEARS = 5 * ONE_YEAR;

  const intervals = [
    { label: 'day', ms: ONE_DAY },
    { label: 'week', ms: ONE_WEEK },
    { label: 'month', ms: ONE_MONTH },
    { label: '3months', ms: THREE_MONTHS },
    { label: 'year', ms: ONE_YEAR },
    { label: '5years', ms: FIVE_YEARS },
  ];

  // Find closest interval
  let selectedInterval = intervals[0];
  for (let i = 0; i < intervals.length; i++) {
    if (targetIntervalMs < intervals[i].ms) {
      // If target is smaller than this interval, pick this one or the previous one?
      // Actually we want the one that is closest to targetIntervalMs
      // But usually we want to snap up to ensure readability.
      // Let's just pick the first one that is >= targetIntervalMs/1.5 (allow some density)
      selectedInterval = intervals[i];
      break;
    }
    selectedInterval = intervals[i]; // Default to largest if we exceed
  }

  const ticks: number[] = [];
  let current = new Date(start);

  // Align start to the interval
  switch (selectedInterval.label) {
    case 'day':
      current.setHours(0, 0, 0, 0);
      break;
    case 'week':
      // Align to Monday
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      current.setDate(diff);
      current.setHours(0, 0, 0, 0);
      break;
    case 'month':
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
      break;
    case '3months':
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
      const m = current.getMonth();
      // 0, 3, 6, 9
      const quarterStartMonth = Math.floor(m / 3) * 3;
      current.setMonth(quarterStartMonth);
      break;
    case 'year':
      current.setMonth(0, 1);
      current.setHours(0, 0, 0, 0);
      break;
    case '5years':
      current.setMonth(0, 1);
      current.setHours(0, 0, 0, 0);
      const y = current.getFullYear();
      const remainder = y % 5;
      current.setFullYear(y - remainder);
      break;
  }

  // Iterate and add ticks
  while (current.getTime() <= end.getTime()) {
    if (current.getTime() >= start.getTime()) {
      ticks.push(current.getTime());
    }

    // Increment
    switch (selectedInterval.label) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      case '3months':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'year':
        current.setFullYear(current.getFullYear() + 1);
        break;
      case '5years':
        current.setFullYear(current.getFullYear() + 5);
        break;
    }
  }

  return ticks;
};

export const getSmartTickFormat = (start: Date, end: Date, width: number): (unixTime: number) => string => {
  const duration = end.getTime() - start.getTime();
  const pixelsPerMs = width / duration;
  const targetSpacingPx = 150;
  const targetIntervalMs = targetSpacingPx / pixelsPerMs;

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_YEAR = 365 * ONE_DAY;

  return (unixTime: number) => {
    const date = new Date(unixTime);

    if (targetIntervalMs >= ONE_YEAR) {
      return date.getFullYear().toString();
    } else if (targetIntervalMs >= 30 * ONE_DAY) {
      // Month Year
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // Sep '28
    } else {
      // Day Month Year
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' }); // 21 Sep '28
    }
  };
};

export const generateSmartYTicks = (min: number, max: number, height: number): { ticks: number[], domain: [number, number] } => {
  if (height <= 0) return { ticks: [], domain: [min, max] };

  // 1. Calculate visible range with padding
  const range = max - min;
  const padding = range * 0.1; // 10% padding total (5% top, 5% bottom)
  // Or user said 5-10% above/below. Let's do 5% each side.
  const niceMin = Math.floor(min - range * 0.05);
  const niceMax = Math.ceil(max + range * 0.05);

  // Ensure we don't go below 0 if original min was >= 0 (unless negative balance is expected)
  // Financial charts often allow negative, but if it's strictly positive, we might clamp.
  // For now, let's allow whatever.

  const visibleRange = niceMax - niceMin;
  if (visibleRange <= 0) return { ticks: [min], domain: [min, max] };

  // 2. Calculate desired tick count
  // Target ~40-50px per tick
  const targetTickCount = Math.max(3, Math.floor(height / 40));

  // 3. Calculate nice interval
  const roughInterval = visibleRange / targetTickCount;
  const magnitude = Math.floor(Math.log10(roughInterval));
  const normalizedInterval = roughInterval / Math.pow(10, magnitude);

  // Select nearest nice interval: [1, 2, 2.5, 5, 10]
  const niceMultipliers = [1, 2, 2.5, 5, 10];
  let closestMultiplier = niceMultipliers[0];
  let minDiff = Math.abs(normalizedInterval - niceMultipliers[0]);

  for (let i = 1; i < niceMultipliers.length; i++) {
    const diff = Math.abs(normalizedInterval - niceMultipliers[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestMultiplier = niceMultipliers[i];
    }
  }

  const niceInterval = closestMultiplier * Math.pow(10, magnitude);

  // 4. Generate ticks
  const startTick = Math.ceil(niceMin / niceInterval) * niceInterval;
  const ticks: number[] = [];

  for (let t = startTick; t <= niceMax; t += niceInterval) {
    ticks.push(t);
  }

  // Adjust domain to include the ticks nicely?
  // Recharts domain usually handles the rendering, but we want to force the domain to match our nice range?
  // Actually, usually we set domain to ['auto', 'auto'] or specific values.
  // If we pass `ticks`, Recharts uses them.
  // We should return the domain that covers these ticks + maybe a bit more if needed, 
  // but usually [niceMin, niceMax] is good.

  return { ticks, domain: [niceMin, niceMax] };
};

export const getSmartYTickFormatter = (maxVal: number): (val: number) => string => {
  return (val: number) => {
    if (val === 0) return '$0';

    const absVal = Math.abs(val);
    if (absVal >= 1000000) {
      return `$${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (absVal >= 1000) {
      return `$${(val / 1000).toFixed(0)}k`;
    } else {
      return `$${val.toFixed(0)}`;
    }
  };
};

export const calculateZoomPercentage = (currentRangeDays: number, maxRangeDays: number, minRangeDays: number = 7): number => {
  // 0% = viewing full range (MAX_RANGE_DAYS)
  // 100% = viewing minimum range (MIN_RANGE_DAYS)
  const percentage = ((maxRangeDays - currentRangeDays) / (maxRangeDays - minRangeDays)) * 100;
  return Math.max(0, Math.min(100, percentage));
};

export const calculateRangeFromPercentage = (zoomPercentage: number, maxRangeDays: number, minRangeDays: number = 7): number => {
  // Inverse of above - convert percentage back to days
  const ratio = zoomPercentage / 100;
  return maxRangeDays - (ratio * (maxRangeDays - minRangeDays));
};

export const calculateRangeOffsets = (focusDate: Date, visibleStart: Date, visibleEnd: Date): { daysBefore: number; daysAfter: number } => {
  const daysBefore = getDaysDifference(visibleStart, focusDate);
  const daysAfter = getDaysDifference(focusDate, visibleEnd);

  // Note: getDaysDifference returns absolute value. 
  // We want negative for before, positive for after.
  return {
    daysBefore: -Math.abs(daysBefore),
    daysAfter: Math.abs(daysAfter)
  };
};

export const constrainToBounds = (
  start: Date,
  end: Date,
  targetRangeDays: number,
  dataStart: Date,
  dataEnd: Date
): [Date, Date] => {
  let adjustedStart = new Date(start);
  let adjustedEnd = new Date(end);

  if (adjustedStart < dataStart) {
    adjustedStart = new Date(dataStart);
    adjustedEnd = addDays(adjustedStart, targetRangeDays);
  }

  if (adjustedEnd > dataEnd) {
    adjustedEnd = new Date(dataEnd);
    adjustedStart = addDays(adjustedEnd, -targetRangeDays);
  }

  // Final safety clamp (if range > data)
  if (adjustedStart < dataStart) adjustedStart = new Date(dataStart);
  if (adjustedEnd > dataEnd) adjustedEnd = new Date(dataEnd);

  return [adjustedStart, adjustedEnd];
};

export const aggregateData = (data: { date: string; balance: number }[], frequency: Frequency): { date: string; balance: number }[] => {
  if (frequency === Frequency.DAILY) return data;

  const aggregated: { date: string; balance: number }[] = [];
  let currentPeriodStart: Date | null = null;
  let lastPoint: { date: string; balance: number } | null = null;
  let isFirstPoint = true;

  data.forEach((point) => {
    const date = parseDate(point.date);
    let isNewPeriod = false;

    if (!currentPeriodStart) {
      currentPeriodStart = date;
    } else {
      switch (frequency) {
        case Frequency.WEEKLY:
          // Check if week number changed
          const onejan = new Date(date.getFullYear(), 0, 1);
          const weekNum = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);

          const startOneJan = new Date(currentPeriodStart.getFullYear(), 0, 1);
          const startWeekNum = Math.ceil((((currentPeriodStart.getTime() - startOneJan.getTime()) / 86400000) + startOneJan.getDay() + 1) / 7);

          if (weekNum !== startWeekNum || date.getFullYear() !== currentPeriodStart.getFullYear()) isNewPeriod = true;
          break;
        case Frequency.MONTHLY:
          if (date.getMonth() !== currentPeriodStart.getMonth() || date.getFullYear() !== currentPeriodStart.getFullYear()) isNewPeriod = true;
          break;
        case Frequency.QUARTERLY:
          const q1 = Math.floor(currentPeriodStart.getMonth() / 3);
          const q2 = Math.floor(date.getMonth() / 3);
          if (q1 !== q2 || date.getFullYear() !== currentPeriodStart.getFullYear()) isNewPeriod = true;
          break;
        case Frequency.YEARLY:
          if (date.getFullYear() !== currentPeriodStart.getFullYear()) isNewPeriod = true;
          break;
      }
    }

    // Always include the very first point (sim start date)
    if (isFirstPoint) {
      aggregated.push(point);
      isFirstPoint = false;
      lastPoint = point; // Track it as lastPoint but don't add it again later
    } else if (isNewPeriod && lastPoint) {
      // Only add lastPoint if it's not the same as the first point we already added
      if (aggregated[aggregated.length - 1].date !== lastPoint.date) {
        aggregated.push(lastPoint);
      }
      currentPeriodStart = date;
      lastPoint = point;
    } else {
      lastPoint = point;
    }
  });

  // Add the final point (sim end date) if it's not already added
  // Use explicit type guard pattern to help TypeScript
  if (lastPoint !== null && !isFirstPoint) {
    const finalPoint: { date: string; balance: number } = lastPoint;
    if (aggregated.length === 0) {
      aggregated.push(finalPoint);
    } else {
      const lastAggregated = aggregated[aggregated.length - 1];
      if (lastAggregated.date !== finalPoint.date) {
        aggregated.push(finalPoint);
      }
    }
  }

  return aggregated;
};
