import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Account, FinancialItem, FormulaType, CompoundingPeriod } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { Trash2, Plus, X, Save, Download, Upload, ChevronLeft, ChevronRight, Eye, EyeOff, TrendingUp, TrendingDown, Percent, Receipt, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { getVersionString } from '../version';

interface SidebarProps {
    account: Account;
    items: FinancialItem[];
    selectedItemIds: Set<string>;
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
    isFlipped?: boolean;
    finalBalance?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
    account,
    items,
    selectedItemIds,
    // onUpdateAccount, // Unused
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
    viewEndDate,
    isFlipped = false,
    finalBalance = 0
}) => {
    // const [localName, setLocalName] = useState(account.name); // Unused
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getDefaultStartDate = () => {
        const todayStr = formatDate(new Date());
        if (todayStr >= viewStartDate && todayStr <= viewEndDate) {
            return todayStr;
        }
        return viewStartDate;
    };

    // Only show active item if exactly ONE item is selected
    const activeItem = selectedItemIds.size === 1
        ? items.find(i => i.id === Array.from(selectedItemIds)[0])
        : null;

    const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
    const [originalItem, setOriginalItem] = useState<FinancialItem | null>(null);

    // Cascading menu state
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<'events' | 'effects' | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (category: 'events' | 'effects', rect: DOMRect) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setSubmenuPosition({ top: rect.top, left: rect.right });
        setHoveredCategory(category);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCategory(null);
        }, 100);
    };

    // useEffect(() => {
    //     setLocalName(account.name);
    // }, [account]);

    useEffect(() => {
        if (draftItem) {
            // If we have a draft item, we are in creation mode.
            // We don't set editingItem here because we use draftItem directly.
            setIsCollapsed(false);
            setEditingItem(null);
            setOriginalItem(null);
        } else if (activeItem) {
            // Only update if we switched to a DIFFERENT item, or if we weren't editing anything before
            if (!editingItem || editingItem.id !== activeItem.id) {
                setEditingItem({ ...activeItem });
                setOriginalItem({ ...activeItem }); // Store original for revert
                // Automatically expand if an item is selected for editing
                setIsCollapsed(false);
            }
        } else {
            setEditingItem(null);
            setOriginalItem(null);
        }
    }, [activeItem, draftItem]);



    const handleSaveItem = () => {
        if (draftItem) {
            // Treat undefined as 0 when saving
            const itemToSave = {
                ...draftItem,
                amount: draftItem.amount ?? 0,
                interestRate: draftItem.interestRate ?? 0
            };
            onUpsertItem(itemToSave);
            if (onUpdateDraft) onUpdateDraft(null);
        } else if (editingItem) {
            // Treat undefined as 0 when saving
            const itemToSave = {
                ...editingItem,
                amount: editingItem.amount ?? 0,
                interestRate: editingItem.interestRate ?? 0
            };
            onUpsertItem(itemToSave);
            setOriginalItem(null); // Clear original since we saved
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
                // Treat undefined amounts as 0 for preview
                const previewItem = {
                    ...newItem,
                    amount: newItem.amount ?? 0,
                    interestRate: newItem.interestRate ?? 0
                };
                setEditingItem(newItem); // Keep undefined for input handle
                onUpsertItem(previewItem); // Update immediately for preview
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
                                } else if (originalItem) {
                                    // Revert to original values if closing without saving
                                    onUpsertItem(originalItem);
                                }
                                onClose();
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
                                onFocus={() => {
                                    if (!item.endDate) {
                                        updateItem({ ...item, endDate: viewEndDate });
                                    }
                                }}
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
                        value={isEffect ? (item.interestRate ?? '') : (item.amount ?? '')}
                        onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
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

    // Formula View Content (Back Face)
    const renderFormulaView = () => {
        // Filter enabled items and sort them to match TimelineEvents order
        const activeItems = items.filter(i => i.isEnabled !== false);
        const sortedItems = [...activeItems].sort((a, b) => {
            const orderA = a.order ?? 999999;
            const orderB = b.order ?? 999999;
            if (orderA !== orderB) return orderA - orderB;
            if (a.type === 'income' && b.type !== 'income') return -1;
            if (a.type === 'expense' && b.type !== 'expense') return 1;
            return a.name.localeCompare(b.name);
        });

        // Calculate time duration in months
        const startDate = new Date(viewStartDate);
        const endDate = new Date(viewEndDate);
        const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

        // Get initial balance
        const initialBalance = account.initialBalance || 0;

        // Helper to get variable name and color
        const getItemMeta = (item: FinancialItem) => {
            const firstChar = item.name.charAt(0).toLowerCase();
            if (item.type === 'income') return { var: `I_{${firstChar}}`, color: 'text-green-400', valColor: 'text-green-400' };
            if (item.type === 'expense') return { var: `E_{${firstChar}}`, color: 'text-red-400', valColor: 'text-red-400' };
            return { var: `L_{${firstChar}}`, color: 'text-blue-400', valColor: 'text-blue-400' };
        };

        return (
            <div className="flex flex-col h-full p-4 text-gray-200">
                <h2 className="text-lg font-bold mb-6 text-gray-100">Account Value Formula</h2>

                <div className="mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4 font-mono text-sm leading-relaxed">
                        V(t) = Vo
                        {sortedItems.map((item) => {
                            const { var: varName, color } = getItemMeta(item);
                            const isLumpSum = item.formula === FormulaType.LUMP_SUM;
                            const isActive = selectedItemIds.has(item.id);
                            return (
                                <span key={item.id}>
                                    {' + '}
                                    <span className={`${color} ${isActive ? 'bg-white/20 px-1 rounded' : ''}`}>
                                        <InlineMath math={varName} />
                                    </span>
                                    {!isLumpSum && ' · t'}
                                </span>
                            );
                        })}
                    </div>
                    <div className="space-y-2 text-sm text-gray-400 pl-2">
                        <p><span className="font-mono text-gray-300">Vo</span> = Initial balance</p>
                        <p><span className="font-mono text-gray-300">t</span> = time in months</p>
                        {sortedItems.map(item => {
                            const { var: varName, color } = getItemMeta(item);
                            const isActive = selectedItemIds.has(item.id);
                            return (
                                <p key={item.id} className={isActive ? 'bg-white/10 px-2 py-0.5 rounded' : ''}>
                                    <span className={`inline-block ${color}`}>
                                        <InlineMath math={varName} />
                                    </span>
                                    {' = '}{item.name}
                                </p>
                            );
                        })}
                    </div>
                </div>

                <h2 className="text-lg font-bold mb-4 text-gray-100">Expanded Calculation</h2>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 font-mono text-sm mb-6 leading-relaxed">
                    V({months}) = {initialBalance}
                    {sortedItems.map((item) => {
                        const { color } = getItemMeta(item);
                        const isLumpSum = item.formula === FormulaType.LUMP_SUM;
                        const isExpense = item.type === 'expense';
                        const amount = item.amount || 0;
                        const isActive = selectedItemIds.has(item.id);

                        return (
                            <span key={item.id}>
                                {isExpense ? ' - ' : ' + '}
                                <span className={isActive ? 'bg-white/20 px-1 rounded' : ''}>
                                    <span className={color}>{amount}</span>
                                </span>
                                {!isLumpSum && ` · ${months}`}
                            </span>
                        );
                    })}
                </div>

                <div className="mt-auto border-t border-gray-800 pt-6">
                    <p className="text-xs text-blue-400 mb-2">Final Value at t = {months} months</p>
                    <p className="text-3xl font-bold text-blue-500">{formatCurrency(finalBalance)}</p>
                </div>
            </div>
        );
    };

    return (
        <div className={`relative h-full shrink-0 perspective-1000 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-80'}`}>
            <motion.div
                className="relative h-full overflow-visible"
                initial={false}
                animate={{
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : 320
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face (Standard Sidebar) */}
                    <div
                        className="absolute w-full h-full bg-gray-900 border-r border-gray-800 backface-hidden"
                        style={{ backfaceVisibility: 'hidden', pointerEvents: isFlipped ? 'none' : 'auto' }}
                    >
                        <div className="flex h-full relative">
                            <div className="flex-1 flex flex-col text-gray-200 overflow-y-auto overflow-x-visible scrollbar-hide p-4">
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


                                <div className="relative">
                                    {/* Main Add New Button */}
                                    <button
                                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                        className="group w-full px-4 py-2.5 bg-gradient-to-r from-lime-400 via-purple-400 to-pink-500 hover:from-lime-500 hover:via-purple-500 hover:to-pink-600 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Plus size={16} />
                                        <span>Add New</span>
                                        <ChevronDown size={14} className={`transition-transform group-hover:text-white ${isAddMenuOpen ? 'rotate-[-90deg]' : 'rotate-0'}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isAddMenuOpen && (
                                        <>
                                            {/* Background overlay */}
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => {
                                                    setIsAddMenuOpen(false);
                                                    setHoveredCategory(null);
                                                }}
                                            />

                                            {/* Main dropdown */}
                                            <div className="absolute left-0 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-40 overflow-visible">
                                                {/* Events */}
                                                <div
                                                    className="relative group"
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        handleMouseEnter('events', rect);
                                                    }}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <div className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${hoveredCategory === 'events' ? 'bg-gray-700' : 'hover:bg-gray-700'
                                                        }`}>
                                                        <span className="text-sm font-medium text-gray-200">Events</span>
                                                        {hoveredCategory === 'events' ? (
                                                            <ChevronDown size={16} className="text-white" />
                                                        ) : (
                                                            <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
                                                        )}
                                                    </div>

                                                    {/* Events Submenu */}
                                                    {hoveredCategory === 'events' && createPortal(
                                                        <div
                                                            className="submenu-events fixed w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-[9999]"
                                                            style={{ top: submenuPosition.top, left: submenuPosition.left }}
                                                            onMouseEnter={() => handleMouseEnter('events', { top: submenuPosition.top, right: submenuPosition.left } as DOMRect)}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            {/* Income */}
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
                                                                    setIsAddMenuOpen(false);
                                                                    setHoveredCategory(null);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-700 transition-colors group"
                                                            >
                                                                <TrendingUp size={16} className="text-green-400 group-hover:text-green-300" />
                                                                <span className="text-sm font-medium text-green-400 group-hover:text-green-300">Income</span>
                                                            </button>

                                                            {/* Expense */}
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
                                                                    setIsAddMenuOpen(false);
                                                                    setHoveredCategory(null);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-700 transition-colors group"
                                                            >
                                                                <TrendingDown size={16} className="text-red-400 group-hover:text-red-300" />
                                                                <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Expense</span>
                                                            </button>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </div>

                                                {/* Effects */}
                                                <div
                                                    className="relative group"
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        handleMouseEnter('effects', rect);
                                                    }}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <div className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${hoveredCategory === 'effects' ? 'bg-gray-700' : 'hover:bg-gray-700'
                                                        }`}>
                                                        <span className="text-sm font-medium text-gray-200">Effects</span>
                                                        {hoveredCategory === 'effects' ? (
                                                            <ChevronDown size={16} className="text-white" />
                                                        ) : (
                                                            <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
                                                        )}
                                                    </div>

                                                    {/* Effects Submenu */}
                                                    {hoveredCategory === 'effects' && createPortal(
                                                        <div
                                                            className="submenu-effects fixed w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-[9999]"
                                                            style={{ top: submenuPosition.top, left: submenuPosition.left }}
                                                            onMouseEnter={() => handleMouseEnter('effects', { top: submenuPosition.top, right: submenuPosition.left } as DOMRect)}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            {/* Interest */}
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
                                                                    setIsAddMenuOpen(false);
                                                                    setHoveredCategory(null);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-700 transition-colors group"
                                                            >
                                                                <Percent size={16} className="text-purple-400 group-hover:text-purple-300" />
                                                                <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300">Interest</span>
                                                            </button>

                                                            {/* Taxes (Placeholder) */}
                                                            <button
                                                                onClick={() => {
                                                                    // No action for now
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-gray-700 transition-colors group cursor-not-allowed opacity-60"
                                                                disabled
                                                            >
                                                                <Receipt size={16} className="text-yellow-500" />
                                                                <span className="text-sm font-medium text-yellow-500">Taxes</span>
                                                            </button>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>


                                {renderItemForm()}

                                <div className="mt-auto pt-10 text-xs text-gray-600 flex flex-col gap-1">
                                    <p>FinSim Pro v{getVersionString()}</p>
                                    <a
                                        href={
                                            import.meta.env.DEV
                                                ? "http://localhost:3000/finsim-pro/docs"
                                                : "/finsim-pro/docs"
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-400"
                                    >
                                        Documentation
                                    </a>

                                    {import.meta.env.DEV && (
                                        <a
                                            href="https://pechjacob.github.io/finsim-pro/app"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-400 flex items-center gap-1"
                                        >
                                            Github
                                        </a>
                                    )}
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
                    </div>

                    {/* Back Face (Formula View) */}
                    <div
                        className="absolute w-full h-full bg-gray-900 border-r border-gray-800 backface-hidden"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            pointerEvents: isFlipped ? 'auto' : 'none'
                        }}
                    >
                        <div className="flex h-full relative">
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                {renderFormulaView()}
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
                    </div>
                </motion.div>
            </motion.div>

            {isCollapsed && (
                <div
                    className="absolute top-0 left-0 w-12 bg-gray-900 border-r border-gray-800 h-full flex flex-col items-center justify-center py-4 shrink-0 transition-all duration-300 cursor-pointer hover:bg-gray-800 group"
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
            )}
        </div>
    );
};
