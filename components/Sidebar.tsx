import React, { useState, useEffect } from 'react';
import { Account, FinancialItem, FormulaType } from '../types';
import { Trash2, Plus, X, Save, HelpCircle, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  account: Account;
  items: FinancialItem[];
  activeItemId: string | null;
  onUpdateAccount: (account: Account) => void;
  onUpsertItem: (item: FinancialItem) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
  accounts: Account[]; // Needed for transfers
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  account,
  items,
  activeItemId,
  onUpdateAccount,
  onUpsertItem,
  onDeleteItem,
  onClose,
  accounts,
  onExport,
  onImport
}) => {
  const [localName, setLocalName] = useState(account.name);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const activeItem = items.find(i => i.id === activeItemId);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

  useEffect(() => {
    setLocalName(account.name);
  }, [account]);

  useEffect(() => {
    if (activeItem) {
      setEditingItem({ ...activeItem });
      // Automatically expand if an item is selected for editing
      setIsCollapsed(false);
    } else {
        setEditingItem(null);
    }
  }, [activeItem]);

  const handleSaveAccount = () => {
    onUpdateAccount({ ...account, name: localName });
  };

  const handleSaveItem = () => {
    if (editingItem) {
      onUpsertItem(editingItem);
    }
  };

  const renderItemForm = () => {
    if (!editingItem) return <div className="text-gray-500 text-sm mt-10 text-center">Select an event or effect to edit</div>;

    const isEffect = editingItem.type === 'effect';
    const isLumpSum = editingItem.formula === FormulaType.LUMP_SUM;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-850 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                {isEffect ? 'Effect Details' : 'Event Details'}
            </h3>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => onDeleteItem(editingItem.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-200"
                    title="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={editingItem.name}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Type Selector (if not effect) */}
        {!isEffect && (
            <div>
                 <label className="block text-xs text-gray-400 mb-1">Type</label>
                 <div className="flex space-x-2 bg-gray-900 p-1 rounded border border-gray-700">
                     {['income', 'expense'].map(t => (
                         <button
                            key={t}
                            onClick={() => setEditingItem({...editingItem, type: t as any})}
                            className={`flex-1 text-xs py-1 rounded capitalize ${editingItem.type === t ? (t === 'income' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100') : 'text-gray-400 hover:text-gray-200'}`}
                         >
                             {t}
                         </button>
                     ))}
                 </div>
            </div>
        )}

        {/* Dates */}
        {isLumpSum ? (
             <div>
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <input
                    type="date"
                    value={editingItem.startDate}
                    onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value, endDate: undefined })}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                />
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Starts</label>
                    <input
                        type="date"
                        value={editingItem.startDate}
                        onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Ends (Optional)</label>
                    <input
                        type="date"
                        value={editingItem.endDate || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                    />
                </div>
            </div>
        )}

        {/* Formula */}
        <div>
            <label className="block text-xs text-gray-400 mb-1">Formula</label>
            <select
                value={editingItem.formula}
                onChange={(e) => setEditingItem({ ...editingItem, formula: e.target.value as FormulaType })}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
            >
                {isEffect ? (
                     <option value={FormulaType.COMPOUNDING}>Compounding Interest</option>
                ) : (
                    <>
                        <option value={FormulaType.LUMP_SUM}>One Time (Lump Sum)</option>
                        <option value={FormulaType.MONTHLY_SUM}>Monthly Sum</option>
                        <option value={FormulaType.RECURRING_SUM}>Recurring (Every X Days)</option>
                    </>
                )}
            </select>
        </div>

        {/* Formula Specifics */}
        {!isEffect && editingItem.formula === FormulaType.RECURRING_SUM && (
            <div>
                <label className="block text-xs text-gray-400 mb-1">Every X Days</label>
                <input
                    type="number"
                    value={editingItem.recurrenceDays || 7}
                    onChange={(e) => setEditingItem({ ...editingItem, recurrenceDays: parseInt(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                />
            </div>
        )}

        {/* Amount / Rate */}
        <div>
            <label className="block text-xs text-gray-400 mb-1">
                {isEffect ? 'Annual Interest Rate (%)' : 'Amount ($)'}
            </label>
            <input
                type="number"
                step={isEffect ? "0.1" : "1"}
                value={isEffect ? (editingItem.interestRate || 0) : (editingItem.amount || 0)}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isEffect) {
                        setEditingItem({ ...editingItem, interestRate: val });
                    } else {
                        setEditingItem({ ...editingItem, amount: val });
                    }
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
            />
        </div>

        {/* Actions */}
        <div className="pt-4">
            <button 
                onClick={handleSaveItem}
                className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold rounded shadow transition-colors flex items-center justify-center gap-2"
            >
                <Save size={14} /> Save Changes
            </button>
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
        <div className="w-12 bg-gray-900 border-r border-gray-800 h-full flex flex-col items-center py-4 shrink-0 transition-all duration-300">
            <button 
                onClick={() => setIsCollapsed(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                title="Expand Sidebar"
            >
                <ChevronRight size={20} />
            </button>
            <div className="mt-auto mb-4 whitespace-nowrap text-gray-500 font-bold text-xs tracking-widest [writing-mode:vertical-rl] rotate-180 select-none">
                EVENT MANAGER
            </div>
        </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 h-full flex flex-col text-gray-200 overflow-y-auto scrollbar-hide p-4 shrink-0 transition-all duration-300">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account</h2>
             <div className="flex items-center space-x-3">
                 <button onClick={onExport} className="flex items-center text-xs text-gray-400 hover:text-white transition-colors" title="Export Data">
                    <Download size={14} />
                 </button>
                 <label className="flex items-center text-xs text-gray-400 hover:text-white transition-colors cursor-pointer" title="Import Data">
                    <Upload size={14} />
                    <input type="file" className="hidden" onChange={onImport} accept=".json"/>
                 </label>
                 <button 
                    onClick={() => setIsCollapsed(true)}
                    className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
                    title="Collapse Sidebar"
                 >
                    <ChevronLeft size={14} />
                 </button>
             </div>
        </div>
        
        
      </div>
      
      <div className="border-t border-gray-800 my-2"></div>

      <div className="flex flex-col space-y-2">
         <button 
            onClick={() => onUpsertItem({
                id: crypto.randomUUID(),
                accountId: account.id,
                name: 'New Income',
                type: 'income',
                startDate: new Date().toISOString().split('T')[0],
                formula: FormulaType.MONTHLY_SUM,
                amount: 1000
            })}
            className="text-left flex items-center text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
         >
             <Plus size={14} className="mr-1" /> Add Income
         </button>
         <button 
            onClick={() => onUpsertItem({
                id: crypto.randomUUID(),
                accountId: account.id,
                name: 'New Expense',
                type: 'expense',
                startDate: new Date().toISOString().split('T')[0],
                formula: FormulaType.MONTHLY_SUM,
                amount: 500
            })}
            className="text-left flex items-center text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
         >
             <Plus size={14} className="mr-1" /> Add Expense
         </button>
         <button 
            onClick={() => onUpsertItem({
                id: crypto.randomUUID(),
                accountId: account.id,
                name: 'New Investment',
                type: 'effect',
                startDate: new Date().toISOString().split('T')[0],
                formula: FormulaType.COMPOUNDING,
                interestRate: 5
            })}
            className="text-left flex items-center text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
         >
             <Plus size={14} className="mr-1" /> Add Interest Effect
         </button>
      </div>

      {renderItemForm()}
      
      <div className="mt-auto pt-10 text-xs text-gray-600 flex flex-col gap-1">
        <p>FinSim Pro v1.0.0</p>
        <a href="#" className="hover:text-blue-400">Documentation</a>
        <a href="#" className="hover:text-blue-400">Support</a>
        <a href="#" className="hover:text-blue-400 flex items-center gap-1">
            Github
        </a>
      </div>
    </div>
  );
};
