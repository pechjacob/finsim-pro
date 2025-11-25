import React, { useState, useEffect } from 'react';
import { Account, FinancialItem, FormulaType, CompoundingPeriod } from '../types';
import { formatDate } from '../utils';
import { Trash2, Plus, X, Save, HelpCircle, Download, Upload, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface SidebarProps {
    account: Account;
    items: FinancialItem[];
    activeItemId: string | null;
    onUpdateAccount: (account: Account) => void;
    onUpsertItem: (item: FinancialItem) => void;
    onDeleteItem: (id: string) => void;
    onDeleteAccount: (id: string) => void;
    onClose: () => void;
    accounts: Account[]; // Needed for transfers
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    draftItem?: FinancialItem | null;
    onUpdateDraft?: (item: FinancialItem | null) => void;
    viewStartDate: string;
    viewEndDate: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    account,
    items,
    activeItemId,
    onUpdateAccount,
    onUpsertItem,
    onDeleteItem,
    onDeleteAccount,
    onClose,
    accounts,
    onExport,
    onImport,
    draftItem,
    onUpdateDraft,
    viewStartDate,
    viewEndDate
}) => {
    const [localName, setLocalName] = useState(account.name);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getDefaultStartDate = () => {
        const todayStr = formatDate(new Date());
        if (todayStr >= viewStartDate && todayStr <= viewEndDate) {
            return todayStr;
        }
        return viewStartDate;
    };

    const activeItem = items.find(i => i.id === activeItemId);
    const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

    useEffect(() => {
        setLocalName(account.name);
    }, [account]);

    useEffect(() => {
        if (draftItem) {
            // If we have a draft item, we are in creation mode.
            // We don't set editingItem here because we use draftItem directly.
            setIsCollapsed(false);
            setEditingItem(null);
        } else if (activeItem) {
            setEditingItem({ ...activeItem });
            // Automatically expand if an item is selected for editing
            setIsCollapsed(false);
        } else {
            setEditingItem(null);
        }
    }, [activeItem, draftItem]);

    const handleSaveAccount = () => {
        onUpdateAccount({ ...account, name: localName });
    };

    const handleSaveItem = () => {
        if (draftItem) {
            onUpsertItem(draftItem);
            if (onUpdateDraft) onUpdateDraft(null);
        } else if (editingItem) {
            onUpsertItem(editingItem);
        }
        onClose();
    };

    const renderItemForm = () => {
        const item = draftItem || editingItem;
        if (!item) return null;

        const isEffect = item.type === 'effect';
        const isLumpSum = item.formula === FormulaType.LUMP_SUM;

        const updateItem = (newItem: FinancialItem) => {
            if (draftItem && onUpdateDraft) {
                onUpdateDraft(newItem);
            } else {
                setEditingItem(newItem);
                onUpsertItem(newItem); // Propagate changes immediately
            }
        };

        return (
            <div className="space-y-4 mt-4 p-4 bg-gray-850 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                        {isEffect ? 'Effect Details' : 'Event Details'}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => updateItem({ ...item, isEnabled: item.isEnabled === false ? true : false })}
                            className={`${item.isEnabled !== false ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-400'}`}
                            title={item.isEnabled !== false ? 'Disable' : 'Enable'}
                        >
                            {item.isEnabled !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        {!draftItem && (
                            <button
                                onClick={() => onDeleteItem(item.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (draftItem && onUpdateDraft) {
                                    onUpdateDraft(null);
                                } else {
                                    onClose();
                                }
                            }}
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
                        value={item.name}
                        onChange={(e) => updateItem({ ...item, name: e.target.value })}
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
                                    onClick={() => updateItem({ ...item, type: t as any })}
                                    className={`flex-1 text-xs py-1 rounded capitalize ${item.type === t ? (t === 'income' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100') : 'text-gray-400 hover:text-gray-200'}`}
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
                            value={item.startDate}
                            min={viewStartDate}
                            max={viewEndDate}
                            onChange={(e) => updateItem({ ...item, startDate: e.target.value, endDate: undefined })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Starts</label>
                            <input
                                type="date"
                                value={item.startDate}
                                min={viewStartDate}
                                max={viewEndDate}
                                onChange={(e) => updateItem({ ...item, startDate: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Ends (Optional)</label>
                            <input
                                type="date"
                                value={item.endDate || ''}
                                min={item.startDate || viewStartDate}
                                max={viewEndDate}
                                onChange={(e) => updateItem({ ...item, endDate: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Formula */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">{isEffect ? 'Formula' : 'Occurrence'}</label>
                    <select
                        value={item.formula === FormulaType.RECURRING_SUM ? (item.isCustomRecurrence ? 'custom' : item.recurrenceDays === 1 ? 'daily' : item.recurrenceDays === 7 ? 'weekly' : item.recurrenceDays === 91 ? 'quarterly' : item.recurrenceDays === 365 ? 'yearly' : 'custom') : item.formula}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'daily') {
                                updateItem({ ...item, formula: FormulaType.RECURRING_SUM, recurrenceDays: 1, isCustomRecurrence: false });
                            } else if (value === 'weekly') {
                                updateItem({ ...item, formula: FormulaType.RECURRING_SUM, recurrenceDays: 7, isCustomRecurrence: false });
                            } else if (value === 'quarterly') {
                                updateItem({ ...item, formula: FormulaType.RECURRING_SUM, recurrenceDays: 91, isCustomRecurrence: false });
                            } else if (value === 'yearly') {
                                updateItem({ ...item, formula: FormulaType.RECURRING_SUM, recurrenceDays: 365, isCustomRecurrence: false });
                            } else if (value === 'custom') {
                                updateItem({ ...item, formula: FormulaType.RECURRING_SUM, recurrenceDays: item.recurrenceDays || 30, isCustomRecurrence: true });
                            } else {
                                updateItem({ ...item, formula: value as FormulaType });
                            }
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                    >
                        {isEffect ? (
                            <>
                                <option value={FormulaType.COMPOUNDING}>Compounding Interest</option>
                                <option value={FormulaType.SIMPLE_INTEREST}>Simple Interest</option>
                            </>
                        ) : (
                            <>
                                <option value={FormulaType.LUMP_SUM}>Once</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value={FormulaType.MONTHLY_SUM}>Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                                <option value="custom">Custom</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Effect Specifics: Period & Frequency */}
                {
                    isEffect && (
                        <>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Period</label>
                                    <select
                                        value={item.compoundingPeriod || CompoundingPeriod.MONTHLY}
                                        onChange={(e) => updateItem({ ...item, compoundingPeriod: e.target.value as CompoundingPeriod })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                    >
                                        {Object.values(CompoundingPeriod).map(p => (
                                            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                {item.compoundingPeriod === CompoundingPeriod.CUSTOM && (
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Every X Days</label>
                                        <input
                                            type="number"
                                            value={item.compoundingCustomDays || 1}
                                            onChange={(e) => updateItem({ ...item, compoundingCustomDays: parseInt(e.target.value) })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                )}

                                {item.formula !== FormulaType.SIMPLE_INTEREST && (
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Frequency per {item.compoundingPeriod === CompoundingPeriod.CUSTOM
                                                ? 'Custom Period'
                                                : (item.compoundingPeriod || CompoundingPeriod.MONTHLY).charAt(0) + (item.compoundingPeriod || CompoundingPeriod.MONTHLY).slice(1).toLowerCase().replace('ly', '')}
                                        </label>
                                        <input
                                            type="number"
                                            value={item.compoundingFrequency || 1}
                                            onChange={(e) => updateItem({ ...item, compoundingFrequency: parseInt(e.target.value) })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )
                }

                {/* Formula Specifics */}
                {
                    !isEffect && item.formula === FormulaType.RECURRING_SUM && item.isCustomRecurrence && (
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Period</label>
                                <select
                                    value={
                                        item.recurrenceDays === 1 ? '1' :
                                            item.recurrenceDays === 7 ? '7' :
                                                item.recurrenceDays === 30 ? '30' :
                                                    item.recurrenceDays === 91 ? '91' :
                                                        item.recurrenceDays === 365 ? '365' :
                                                            item.recurrenceDays && item.recurrenceDays % 365 === 0 ? '365' :
                                                                item.recurrenceDays && item.recurrenceDays % 91 === 0 ? '91' :
                                                                    item.recurrenceDays && item.recurrenceDays % 30 === 0 ? '30' :
                                                                        item.recurrenceDays && item.recurrenceDays % 7 === 0 ? '7' :
                                                                            '1'
                                    }
                                    onChange={(e) => {
                                        const periodDays = parseInt(e.target.value);
                                        // Reset frequency to 1 when changing period to avoid confusion
                                        updateItem({ ...item, recurrenceDays: periodDays });
                                    }}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="1">Daily</option>
                                    <option value="7">Weekly</option>
                                    <option value="30">Monthly</option>
                                    <option value="91">Quarterly</option>
                                    <option value="365">Annually</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Every X {
                                        item.recurrenceDays === 1 ? 'Days' :
                                            item.recurrenceDays === 7 ? 'Weeks' :
                                                item.recurrenceDays === 30 ? 'Months' :
                                                    item.recurrenceDays === 91 ? 'Quarters' :
                                                        item.recurrenceDays === 365 ? 'Years' :
                                                            item.recurrenceDays && item.recurrenceDays % 365 === 0 ? 'Years' :
                                                                item.recurrenceDays && item.recurrenceDays % 91 === 0 ? 'Quarters' :
                                                                    item.recurrenceDays && item.recurrenceDays % 30 === 0 ? 'Months' :
                                                                        item.recurrenceDays && item.recurrenceDays % 7 === 0 ? 'Weeks' :
                                                                            'Days'
                                    }
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        item.recurrenceDays === 1 ? 1 :
                                            item.recurrenceDays === 7 ? 1 :
                                                item.recurrenceDays === 30 ? 1 :
                                                    item.recurrenceDays === 91 ? 1 :
                                                        item.recurrenceDays === 365 ? 1 :
                                                            item.recurrenceDays && item.recurrenceDays % 365 === 0 ? item.recurrenceDays / 365 :
                                                                item.recurrenceDays && item.recurrenceDays % 91 === 0 ? item.recurrenceDays / 91 :
                                                                    item.recurrenceDays && item.recurrenceDays % 30 === 0 ? item.recurrenceDays / 30 :
                                                                        item.recurrenceDays && item.recurrenceDays % 7 === 0 ? item.recurrenceDays / 7 :
                                                                            item.recurrenceDays || 1
                                    }
                                    onChange={(e) => {
                                        const frequency = Math.max(1, parseInt(e.target.value) || 1);
                                        const currentPeriodDays =
                                            item.recurrenceDays === 1 ? 1 :
                                                item.recurrenceDays === 7 ? 7 :
                                                    item.recurrenceDays === 30 ? 30 :
                                                        item.recurrenceDays === 91 ? 91 :
                                                            item.recurrenceDays === 365 ? 365 :
                                                                item.recurrenceDays && item.recurrenceDays % 365 === 0 ? 365 :
                                                                    item.recurrenceDays && item.recurrenceDays % 91 === 0 ? 91 :
                                                                        item.recurrenceDays && item.recurrenceDays % 30 === 0 ? 30 :
                                                                            item.recurrenceDays && item.recurrenceDays % 7 === 0 ? 7 :
                                                                                1;
                                        updateItem({ ...item, recurrenceDays: currentPeriodDays * frequency });
                                    }}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )
                }

                {/* Amount / Rate */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">
                        {isEffect ? 'Interest Rate (%)' : 'Amount ($)'}
                    </label>
                    <input
                        type="number"
                        step={isEffect ? "0.1" : "1"}
                        value={isEffect ? (item.interestRate || 0) : (item.amount || 0)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isEffect) {
                                updateItem({ ...item, interestRate: val });
                            } else {
                                updateItem({ ...item, amount: val });
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
            </div >
        );
    };

    if (isCollapsed) {
        return (
            <div
                className="w-12 bg-gray-900 border-r border-gray-800 h-full flex flex-col items-center justify-center py-4 shrink-0 transition-all duration-300 cursor-pointer hover:bg-gray-800 group"
                onClick={() => setIsCollapsed(false)}
                title="Expand Sidebar"
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="text-gray-400 group-hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </div>
                    <div className="whitespace-nowrap text-gray-500 font-bold text-xs tracking-widest [writing-mode:vertical-rl] rotate-180 select-none">
                        ACCOUNT MANAGER
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-gray-900 border-r border-gray-800 h-full flex shrink-0 transition-all duration-300 relative">
            <div className="flex-1 flex flex-col text-gray-200 overflow-y-auto scrollbar-hide p-4">
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xs font-bold text-gray-500 tracking-wider">ACCOUNT: <span className="text-gray-300">{account.name}</span></h2>
                        <div className="flex items-center space-x-3">
                            {accounts.length > 1 && (
                                <button
                                    onClick={() => onDeleteAccount(account.id)}
                                    className="flex items-center text-xs text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete Account"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button onClick={onExport} className="flex items-center text-xs text-gray-400 hover:text-white transition-colors" title="Export Data">
                                <Download size={14} />
                            </button>
                            <label className="flex items-center text-xs text-gray-400 hover:text-white transition-colors cursor-pointer" title="Import Data">
                                <Upload size={14} />
                                <input type="file" className="hidden" onChange={onImport} accept=".json" />
                            </label>

                        </div>
                    </div>


                </div>

                <div className="border-t border-gray-800 my-2"></div>

                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => {
                            if (onUpdateDraft) {
                                onUpdateDraft({
                                    id: crypto.randomUUID(),
                                    accountId: account.id,
                                    name: 'New Income',
                                    type: 'income',
                                    startDate: getDefaultStartDate(),
                                    formula: FormulaType.MONTHLY_SUM,
                                    amount: 1000
                                });
                            }
                        }}
                        className="text-left flex items-center text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                    >
                        <Plus size={14} className="mr-1" /> Add Income
                    </button>
                    <button
                        onClick={() => {
                            if (onUpdateDraft) {
                                onUpdateDraft({
                                    id: crypto.randomUUID(),
                                    accountId: account.id,
                                    name: 'New Expense',
                                    type: 'expense',
                                    startDate: getDefaultStartDate(),
                                    formula: FormulaType.MONTHLY_SUM,
                                    amount: 500
                                });
                            }
                        }}
                        className="text-left flex items-center text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                    >
                        <Plus size={14} className="mr-1" /> Add Expense
                    </button>
                    <button
                        onClick={() => {
                            if (onUpdateDraft) {
                                onUpdateDraft({
                                    id: crypto.randomUUID(),
                                    accountId: account.id,
                                    name: 'New Effect',
                                    type: 'effect',
                                    startDate: getDefaultStartDate(),
                                    formula: FormulaType.COMPOUNDING,
                                    interestRate: 5,
                                    compoundingPeriod: CompoundingPeriod.MONTHLY,
                                    compoundingFrequency: 1
                                });
                            }
                        }}
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
            <div
                onClick={() => setIsCollapsed(true)}
                className="w-3 h-full cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center z-20 group border-l border-gray-800"
                title="Collapse Sidebar"
            >
                <div className="text-gray-700 group-hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                </div>
            </div>
        </div>
    );
};
