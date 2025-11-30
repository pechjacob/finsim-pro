import React, { useState, useMemo, useEffect } from 'react';
import { Account, FinancialItem, Frequency, SimulationPoint, FormulaType } from './types';
import { Sidebar } from './components/Sidebar';
import { FinancialChart } from './components/FinancialChart';
import { LightweightFinancialChart } from './components/LightweightFinancialChart';
import { TimelineEvents } from './components/TimelineEvents';
import { runSimulation } from './services/simulation';
import { addDays, formatDate, generateUUID } from './utils';
import { Layout } from 'lucide-react';

// Feature flag: Set to true to use lightweight-charts, false for Recharts
const USE_LIGHTWEIGHT_CHARTS = true;

const INITIAL_ACCOUNT_ID = generateUUID();

const App: React.FC = () => {
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

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<FinancialItem | null>(null);

  // View Settings
  const today = new Date();
  const [simulationStartDate, setSimulationStartDate] = useState<string>(formatDate(today));
  const [simulationEndDate, setSimulationEndDate] = useState<string>(formatDate(addDays(today, 365 * 5))); // 5 years default
  const [visibleStartDate, setVisibleStartDate] = useState<string>(formatDate(today));
  const [visibleEndDate, setVisibleEndDate] = useState<string>(formatDate(addDays(today, 365 * 5)));
  const [granularity, setGranularity] = useState<Frequency>(Frequency.MONTHLY);
  const [isFlipped, setIsFlipped] = useState(false);

  // Computed
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  // Include draft item in displayed items for rendering
  const displayedItems = useMemo(() => {
    return draftItem ? [...items, draftItem] : items;
  }, [items, draftItem]);

  const { points: simulationData, itemTotals } = useMemo(() => {
    return runSimulation(activeAccount, displayedItems, simulationStartDate, simulationEndDate);
  }, [activeAccount, displayedItems, simulationStartDate, simulationEndDate]);

  // Handlers
  const handleUpsertItem = (item: FinancialItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [...prev, item];
    });
    setActiveItemId(item.id); // Focus the new/edited item
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (activeItemId === id) setActiveItemId(null);
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
    a.download = `finsim-export-${formatDate(new Date())}.json`;
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
    setActiveItemId(null);
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

  // Check if zoomed
  const isZoomed = visibleStartDate !== simulationStartDate || visibleEndDate !== simulationEndDate;

  const handleResetView = () => {
    setVisibleStartDate(simulationStartDate);
    setVisibleEndDate(simulationEndDate);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">

      {/* Left Sidebar */}
      <Sidebar
        account={activeAccount}
        items={items.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId)}
        activeItemId={activeItemId}
        onUpdateAccount={(acc) => setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a))}
        onUpsertItem={handleUpsertItem}
        onDeleteItem={handleDeleteItem}
        onDeleteAccount={handleDeleteAccount}
        onClose={() => {
          setActiveItemId(null);
          setDraftItem(null);
        }}
        accounts={accounts}
        onExport={handleExport}
        onImport={handleImport}
        hoverDate={hoverDate}
        draftItem={draftItem}
        onUpdateDraft={(item) => {
          setDraftItem(item);
          if (item) setActiveItemId(item.id);
          else setActiveItemId(null);
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
              onSimulationDateRangeChange={(s, e) => {
                setSimulationStartDate(s);
                setSimulationEndDate(e);
                // Reset visible range when simulation range changes
                setVisibleStartDate(s);
                setVisibleEndDate(e);
              }}
              onVisibleDateRangeChange={(s, e) => {
                setVisibleStartDate(s);
                setVisibleEndDate(e);
              }}
              onHover={setHoverDate}
            />
          )}
        </div>

        {/* Timeline/Events Area (Lower Split) */}
        <div className={`w-full flex flex-col transition-all duration-300 ease-in-out ${isTimelineCollapsed ? 'h-10 shrink-0' : 'h-[40%] shrink-0'}`}>
          <TimelineEvents
            items={displayedItems.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId)}
            activeItemId={activeItemId}
            onItemClick={(id) => {
              setActiveItemId(id);
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
        <div className="h-10 bg-gray-950 border-t border-gray-800 flex items-center px-2 space-x-1 shrink-0">
          {accounts.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setActiveAccountId(acc.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingAccountId(acc.id);
              }}
              className={`px-4 py-1.5 text-xs rounded-t-md font-medium transition-colors ${activeAccountId === acc.id
                ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700'
                : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
                }`}
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
        </div>

      </div>
    </div>
  );
};

export default App;