import React, { useState, useMemo, useEffect } from 'react';
import { Account, FinancialItem, Frequency, SimulationPoint, FormulaType } from './types';
import { Sidebar } from './components/Sidebar';
import { FinancialChart } from './components/FinancialChart';
import { TimelineEvents } from './components/TimelineEvents';
import { runSimulation } from './services/simulation';
import { addDays, formatDate, generateUUID } from './utils';
import { Layout } from 'lucide-react';

const INITIAL_ACCOUNT_ID = generateUUID();

const App: React.FC = () => {
  // State
  const [accounts, setAccounts] = useState<Account[]>([
    { id: INITIAL_ACCOUNT_ID, name: 'Checking', initialBalance: 0 }
  ]);
  const [activeAccountId, setActiveAccountId] = useState<string>(INITIAL_ACCOUNT_ID);
  
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

  // View Settings
  const today = new Date();
  const [viewStartDate, setViewStartDate] = useState<string>(formatDate(today));
  const [viewEndDate, setViewEndDate] = useState<string>(formatDate(addDays(today, 365 * 5))); // 5 years default
  const [granularity, setGranularity] = useState<Frequency>(Frequency.MONTHLY);

  // Computed
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
  
  const simulationData: SimulationPoint[] = useMemo(() => {
    return runSimulation(activeAccount, items, viewStartDate, viewEndDate);
  }, [activeAccount, items, viewStartDate, viewEndDate]);

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
  };

  const handleExport = () => {
    const data = { accounts, items, version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finsim-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

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
          if(json.accounts.length > 0) setActiveAccountId(json.accounts[0].id);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
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
        onClose={() => setActiveItemId(null)}
        accounts={accounts}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Chart Area (Upper Split) */}
        <div className="flex-1 w-full border-b border-gray-800 min-h-0">
           <FinancialChart 
              data={simulationData}
              granularity={granularity}
              onGranularityChange={setGranularity}
              startDate={viewStartDate}
              endDate={viewEndDate}
              onDateRangeChange={(s, e) => {
                  setViewStartDate(s);
                  setViewEndDate(e);
              }}
           />
        </div>

        {/* Timeline/Events Area (Lower Split) */}
        <div className={`w-full flex flex-col bg-gray-900 transition-all duration-300 ease-in-out ${isTimelineCollapsed ? 'h-10 shrink-0' : 'h-[40%] shrink-0'}`}>
             <TimelineEvents 
                items={items.filter(i => i.accountId === activeAccountId || i.toAccountId === activeAccountId)}
                activeItemId={activeItemId}
                onItemClick={setActiveItemId}
                viewStartDate={viewStartDate}
                viewEndDate={viewEndDate}
                isCollapsed={isTimelineCollapsed}
                onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
             />
        </div>

        {/* Bottom Tabs */}
        <div className="h-10 bg-gray-950 border-t border-gray-800 flex items-center px-2 space-x-1 shrink-0">
            {accounts.map(acc => (
                <button
                    key={acc.id}
                    onClick={() => setActiveAccountId(acc.id)}
                    className={`px-4 py-1.5 text-xs rounded-t-md font-medium transition-colors ${
                        activeAccountId === acc.id 
                        ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700' 
                        : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
                    }`}
                >
                    {acc.name}
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