import React, { useState, useMemo, useCallback } from 'react';
import { Account, FinancialItem, Frequency, FormulaType } from '../types';
import { Sidebar } from '../components/Sidebar';
import { FinancialChart } from '../components/FinancialChart';
import { LightweightFinancialChart } from '../components/LightweightFinancialChart';
import { TimelineEvents } from '../components/TimelineEvents';
import { runSimulation } from '../services/simulation';
import { addDays, formatDate, generateUUID } from '../utils';
import { Settings, Bug } from 'lucide-react';
import { RightPanel } from '../components/RightPanel';
import { getFullVersionString } from '../version';

// Feature flag: Set to true to use lightweight-charts, false for Recharts
const USE_LIGHTWEIGHT_CHARTS = true;

const INITIAL_ACCOUNT_ID = generateUUID();

const AppPage: React.FC = () => {
  // State
  const [accounts, setAccounts] = useState<Account[]>([
    { id: INITIAL_ACCOUNT_ID, name: 'Checking', initialBalance: 0 }
  ]);
  const [activeAccountId, setActiveAccountId] = useState<string>(INITIAL_ACCOUNT_ID);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const [items, setItems] = useState<FinancialItem[]>([
    {
      id: generateUUID(),
      accountId: INITIAL_ACCOUNT_ID,
      name: 'Job',
      type: 'income',
      amount: 2000,
      formula: FormulaType.MONTHLY_SUM,
      startDate: formatDate(new Date()), // Start today
    },
    {
      id: generateUUID(),
      accountId: INITIAL_ACCOUNT_ID,
      name: 'Rent',
      type: 'expense',
      amount: 1500,
      formula: FormulaType.MONTHLY_SUM,
      startDate: formatDate(new Date()),
    }
  ]);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<FinancialItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(true); // Debug mode toggle state

  // View Settings
  const today = new Date();
  const [simulationStartDate, setSimulationStartDate] = useState<string>(formatDate(today));
  const [simulationEndDate, setSimulationEndDate] = useState<string>(formatDate(addDays(today, 365 * 5))); // 5 years default
  const [visibleStartDate, setVisibleStartDate] = useState<string>(formatDate(today));
  const [visibleEndDate, setVisibleEndDate] = useState<string>(formatDate(addDays(today, 365 * 5)));
  const [granularity, setGranularity] = useState<Frequency>(Frequency.MONTHLY);
  const [isFlipped, setIsFlipped] = useState(false);
  // Initialize from localStorage, persist on change
  const [showIndividualSeries, setShowIndividualSeries] = useState(() => {
    const saved = localStorage.getItem('showIndividualSeries');
    return saved !== null ? JSON.parse(saved) : true; // Default to ON when no saved value
  });

  // Persist showIndividualSeries preference
  React.useEffect(() => {
    localStorage.setItem('showIndividualSeries', JSON.stringify(showIndividualSeries));
  }, [showIndividualSeries]);

  // Computed
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  // Create a stable key for items that excludes chartColor
  // This prevents simulation from rerunning when only chartColor changes
  const itemsKeyWithoutColor = useMemo(() => {
    return items.map(item => {
      const { chartColor, ...rest } = item;
      return JSON.stringify(rest);
    }).join('|');
  }, [items]);

  // Run simulation for displayed items (enabled or draft)
  const simulationResult = useMemo(() => {
    const displayedItems = items.filter((item) => {
      if (draftItem && item.id === draftItem.id) return true;
      return item.accountId === activeAccountId && item.isEnabled !== false;
    });
    return runSimulation(activeAccount, displayedItems, simulationStartDate, simulationEndDate);
  }, [activeAccount, itemsKeyWithoutColor, simulationStartDate, simulationEndDate, draftItem, activeAccountId]);

  const simulationData = simulationResult.points;
  const simulationPoints = simulationResult.points; // Full points with itemContributions
  const itemTotals = simulationResult.itemTotals;

  // Include draft item in displayed items for timeline rendering
  const displayedItems = useMemo(() => {
    return draftItem ? [...items, draftItem] : items;
  }, [items, draftItem]);

  // Handlers
  const handleUpsertItem = (item: FinancialItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [...prev, item];
    });
    setSelectedItemIds(new Set([item.id])); // Focus the new/edited item
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDraftItem(null); // Clear draft when deleting
  };

  const handleDeleteAccount = (id: string) => {
    // Remove all items belonging to this account
    setItems(prev => prev.filter(i => i.accountId !== id && i.toAccountId !== id));
    // Remove the account
    setAccounts(prev => prev.filter(a => a.id !== id));
    // If this was the active account, switch to another
    if (activeAccountId === id && accounts.length > 1) {
      const remaining = accounts.filter(a => a.id !== id);
      if (remaining.length > 0) setActiveAccountId(remaining[0].id);
    }
  };

  const handleExport = () => {
    const data = { accounts, items, version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finsim -export -${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVisibleDateRangeChange = React.useCallback((start: string, end: string) => {
    setVisibleStartDate(start);
    setVisibleEndDate(end);
  }, []);

  const handleSimulationDateRangeChange = React.useCallback((start: string, end: string) => {
    setSimulationStartDate(start);
    setSimulationEndDate(end);
    setVisibleStartDate(start);
    setVisibleEndDate(end);
  }, []);


  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.accounts && json.items) {
          setAccounts(json.accounts);
          setItems(json.items);
          if (json.accounts.length > 0) setActiveAccountId(json.accounts[0].id);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleReorderItems = (itemId: string, newIndex: number) => {
    setItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;

      // Get items for the active account
      const accountItems = prev.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId);
      const otherItems = prev.filter(i => !(i.accountId === activeAccountId || i.toAccountId === activeAccountId));

      // Sort account items by current order
      const sortedAccountItems = [...accountItems].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        return orderA - orderB;
      });

      // Find old index in sorted list
      const oldIndex = sortedAccountItems.findIndex(i => i.id === itemId);
      if (oldIndex === -1) return prev;

      // Remove item from old position
      sortedAccountItems.splice(oldIndex, 1);

      // Insert at new position
      sortedAccountItems.splice(newIndex, 0, item);

      // Update order values
      const reorderedAccountItems = sortedAccountItems.map((item, idx) => ({ ...item, order: idx }));

      // Combine with other account items
      return [...otherItems, ...reorderedAccountItems];
    });
  };

  const handleDeleteAllItems = () => {
    setItems(prev => prev.filter(i => !(i.accountId === activeAccountId || i.toAccountId === activeAccountId)));
    setSelectedItemIds(new Set());
  };

  const handleDeleteItems = (ids: string[]) => {
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
    if (draftItem && ids.includes(draftItem.id)) {
      setDraftItem(null);
    }
  };

  const handleToggleAllItems = (itemIds?: string[]) => {
    const idsToToggle = itemIds || items.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId).map(i => i.id);
    const anyDisabled = idsToToggle.some(id => {
      const item = items.find(i => i.id === id);
      return item && item.isEnabled === false;
    });
    const newState = anyDisabled ? true : false;
    setItems(prev => prev.map(i => idsToToggle.includes(i.id) ? { ...i, isEnabled: newState } : i));
  };

  // Memoize filtered items to prevent creating new array on every render
  const displayedChartItems = useMemo(() => {
    return items.filter(i => i.accountId === activeAccountId && i.isEnabled !== false);
  }, [items, activeAccountId]);

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 font-sans overflow-hidden relative">

      {/* Left Sidebar */}
      <Sidebar
        account={activeAccount}
        items={items.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId)}
        selectedItemIds={selectedItemIds}
        onUpdateAccount={(acc) => setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a))}
        onUpsertItem={handleUpsertItem}
        onDeleteItem={handleDeleteItem}
        onDeleteAccount={handleDeleteAccount}
        onClose={() => {
          setSelectedItemIds(new Set());
          setDraftItem(null);
        }}
        accounts={accounts}
        onExport={handleExport}
        onImport={handleImport}
        draftItem={draftItem}
        onUpdateDraft={(item) => {
          setDraftItem(item);
          if (item) setSelectedItemIds(new Set([item.id]));
          else setSelectedItemIds(new Set());
        }}
        viewStartDate={simulationStartDate}
        viewEndDate={simulationEndDate}
        isFlipped={isFlipped}
        finalBalance={simulationData.length > 0 ? simulationData[simulationData.length - 1].balance : 0}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* Chart Area (Upper Split) */}
        <div className="flex-1 w-full border-b border-gray-800 min-h-0">
          {USE_LIGHTWEIGHT_CHARTS ? (
            <LightweightFinancialChart
              balanceData={React.useMemo(() => simulationData.map(p => ({ date: p.date, balance: p.balance })), [simulationData])}
              visibleStartDate={visibleStartDate}
              visibleEndDate={visibleEndDate}
              simulationStartDate={simulationStartDate}
              simulationEndDate={simulationEndDate}
              onVisibleDateRangeChange={handleVisibleDateRangeChange}
              onSimulationDateRangeChange={handleSimulationDateRangeChange}
              frequency={granularity}
              onFrequencyChange={setGranularity}
              onHover={setHoverDate}
              items={displayedChartItems}
              simulationPoints={simulationPoints}
              showIndividualSeries={showIndividualSeries}
            />
          ) : (
            <FinancialChart
              data={simulationData}
              granularity={granularity}
              onGranularityChange={setGranularity}
              simulationStartDate={simulationStartDate}
              simulationEndDate={simulationEndDate}
              visibleStartDate={visibleStartDate}
              visibleEndDate={visibleEndDate}
              onVisibleDateRangeChange={(s, e) => {
                setVisibleStartDate(s);
                setVisibleEndDate(e);
              }}
              onHover={setHoverDate}
            />
          )}
        </div>

        {/* Timeline/Events Area (Lower Split) */}
        <div className={`w - full flex flex - col transition - all duration - 300 ease -in -out ${isTimelineCollapsed ? 'h-10 shrink-0' : 'h-[40%] shrink-0'} `}>
          <TimelineEvents
            items={displayedItems.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId)}
            selectedItemIds={selectedItemIds}
            onItemClick={(id) => {
              setSelectedItemIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) {
                  next.delete(id);
                } else {
                  next.add(id);
                }
                return next;
              });
              // Clear draft when clicking a different item
              if (draftItem && draftItem.id !== id) {
                setDraftItem(null);
              }
            }}
            viewStartDate={visibleStartDate}
            viewEndDate={visibleEndDate}
            isCollapsed={isTimelineCollapsed}
            onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
            simulationPoints={simulationData}
            itemTotals={itemTotals}
            onReorderItems={handleReorderItems}
            onDeleteAllItems={handleDeleteAllItems}
            onDeleteItems={handleDeleteItems}
            onToggleAllItems={handleToggleAllItems}
            hoverDate={hoverDate}
            frequency={granularity}
            simulationStartDate={simulationStartDate}
            simulationEndDate={simulationEndDate}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>

        {/* Bottom Tabs */}
        <div className="h-10 bg-gray-950 border-t border-gray-800 flex items-center px-2 space-x-1 shrink-0 relative z-[105]">
          {accounts.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setActiveAccountId(acc.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingAccountId(acc.id);
              }}
              className={`px - 4 py - 1.5 text - xs rounded - t - md font - medium transition - colors ${activeAccountId === acc.id
                ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700'
                : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
                } `}
            >
              {editingAccountId === acc.id ? (
                <input
                  autoFocus
                  type="text"
                  defaultValue={acc.name}
                  className="bg-gray-800 text-white text-xs px-1 py-0.5 rounded outline-none border border-blue-500 w-20"
                  onBlur={(e) => {
                    const newName = e.target.value.trim() || acc.name;
                    setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, name: newName } : a));
                    setEditingAccountId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                acc.name
              )}
            </button>
          ))}
          <button
            onClick={() => {
              const newId = generateUUID();
              setAccounts([...accounts, { id: newId, name: 'Untitled', initialBalance: 0 }]);
              setActiveAccountId(newId);
            }}
            className="px-2 py-1 text-gray-600 hover:text-gray-300 transition-colors"
          >
            +
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Debug Panel Toggle (Dev Only) */}
          {import.meta.env.DEV && (
            <button
              onClick={() => {
                setIsDebugOpen(!isDebugOpen);
                setIsSettingsOpen(false);
              }}
              className={`p - 1.5 rounded transition - colors ${isDebugOpen ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-900'
                } ${isDebugMode ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                } `}
              title={`Debug Panel(${isDebugMode ? 'On' : 'Off'})`}
            >
              <Bug size={16} />
            </button>
          )}

          {/* Settings Panel Toggle */}
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsDebugOpen(false);
            }}
            className={`p - 1.5 rounded transition - colors ${isSettingsOpen ? 'text-green-400 bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-green-400 hover:bg-gray-900'} `}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

      </div>

      {/* Settings Panel */}
      <RightPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="SETTINGS"
      >
        <div className="space-y-6">
          {/* Chart Display Section */}
          <div>
            <div className="text-sm font-medium text-gray-300 mb-3 pb-2 border-b border-gray-700">
              Chart Display
            </div>

            {/* Multi-Series Toggle */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex-1">
                <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Show Individual Event Series
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Display income and expenses as separate colored areas on the chart
                </p>
              </div>
              <button
                onClick={() => setShowIndividualSeries(!showIndividualSeries)}
                className={`relative w-14 h-7 rounded-full transition-all ml-4 flex-shrink-0 ${showIndividualSeries ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                aria-label={`Toggle individual series ${showIndividualSeries ? 'off' : 'on'}`}
              >
                <span
                  className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition-transform ${showIndividualSeries ? 'translate-x-7' : 'translate-x-0'
                    }`}
                />
              </button>
            </label>
          </div>
        </div>
      </RightPanel>

      {/* Debug Panel */}
      <RightPanel
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        title={(
          <div className="flex items-center w-full">
            <span>DEBUG</span>
            {/* Debug Mode Slider Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDebugMode(!isDebugMode);
              }}
              className={`relative w - 20 h - 6 rounded - full transition - all ml - auto ${isDebugMode
                ? 'bg-green-500/30'
                : 'bg-red-500/30'
                } `}
              title={`Debug Mode: ${isDebugMode ? 'On' : 'Off'} `}
            >
              {/* Slider */}
              <div
                className={`absolute top - 0.5 h - 5 w - 10 rounded - full transition - all duration - 200 flex items - center justify - center gap - 1 font - medium text - [10px] ${isDebugMode
                  ? 'right-0.5 bg-green-500 text-white'
                  : 'left-0.5 bg-red-500 text-white'
                  } `}
              >
                <Bug size={10} />
                <span>{isDebugMode ? 'ON' : 'OFF'}</span>
              </div>
            </button>
          </div>
        )}
      >
        <div className="space-y-4 text-xs font-mono">
          {/* Version Info */}
          <div>
            <div className="text-gray-500 mb-1">Version</div>
            <div className="bg-gray-800 p-2 rounded">{getFullVersionString()}</div>
          </div>

          <div>
            <div className="text-gray-500 mb-1">Active Account ID</div>
            <div className="bg-gray-800 p-2 rounded break-all">{activeAccountId}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Simulation Range</div>
            <div className="bg-gray-800 p-2 rounded">
              {simulationStartDate} {'->'} {simulationEndDate}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Visible Range</div>
            <div className="bg-gray-800 p-2 rounded">
              {visibleStartDate} {'->'} {visibleEndDate}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Item Count</div>
            <div className="bg-gray-800 p-2 rounded">{items.length}</div>
          </div>
        </div>
      </RightPanel>
    </div>
  );
};

export default AppPage;