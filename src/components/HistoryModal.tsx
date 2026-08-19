import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  RotateCcw,
  Clock,
  Calculator,
  Scale,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { CalculationHistoryItem, CalculatorTabType } from '../types';
import { groupHistoryByDate } from '../utils/history';
import { getDisplayShortcut } from '../utils/shortcuts';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  currentCalculatorType: CalculatorTabType;
  onRestoreCalculation: (item: CalculationHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: (type?: CalculatorTabType) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentCalculatorType,
  onRestoreCalculation,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | CalculatorTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [restoredNotification, setRestoredNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesType = selectedFilter === 'all' || item.calculatorType === selectedFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.calculatorTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const grouped = groupHistoryByDate(filteredHistory);

  const getCalculatorIcon = (type: CalculatorTabType) => {
    switch (type) {
      case 'leave-accrual':
        return <Calculator className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'pl-opening-balance':
        return <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'standard-ot-adjustment':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'weekend-pay':
        return <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const handleRestore = (item: CalculationHistoryItem) => {
    onRestoreCalculation(item);
    setRestoredNotification(`Restored "${item.calculatorTitle}" for ${item.employeeName}`);
    setTimeout(() => {
      setRestoredNotification(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] z-10 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Calculation History
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {getDisplayShortcut('history')}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Review, restore, or clear saved payroll calculations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close history modal"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restore Notification Toast */}
        {restoredNotification && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{restoredNotification}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by employee, summary, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Clear All / Clear Type Button */}
            {history.length > 0 && (
              <div className="shrink-0 flex items-center gap-1.5">
                {confirmClearAll ? (
                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="text-[11px] font-semibold text-red-700 dark:text-red-300 px-1.5">
                      Clear {selectedFilter === 'all' ? 'all' : 'this'} history?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearHistory(selectedFilter === 'all' ? undefined : selectedFilter);
                        setConfirmClearAll(false);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear {selectedFilter === 'all' ? 'All' : 'Filtered'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('leave-accrual')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'leave-accrual'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Leave Accrual ({history.filter((h) => h.calculatorType === 'leave-accrual').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('pl-opening-balance')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'pl-opening-balance'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              PL Opening ({history.filter((h) => h.calculatorType === 'pl-opening-balance').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('standard-ot-adjustment')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'standard-ot-adjustment'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Standard OT ({history.filter((h) => h.calculatorType === 'standard-ot-adjustment').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('weekend-pay')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'weekend-pay'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Weekend Split ({history.filter((h) => h.calculatorType === 'weekend-pay').length})
            </button>
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                No calculation history found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No calculations match your search criteria. Try a different term.'
                  : 'As you perform calculations across Accruely, completed snapshots will be saved here automatically for fast retrieval.'}
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                  {group.label}
                </div>

                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isExpanded = expandedItemId === item.id;
                    const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        className={`bg-zinc-50/90 dark:bg-zinc-800/60 border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 hover:border-orange-200 dark:hover:border-zinc-700 ${
                          isExpanded
                            ? 'border-orange-300 dark:border-orange-500/50 bg-orange-50/30 dark:bg-zinc-800'
                            : 'border-zinc-200/80 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-2 bg-white dark:bg-zinc-700 rounded-xl shadow-2xs shrink-0 mt-0.5">
                              {getCalculatorIcon(item.calculatorType)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {item.employeeName}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-200/70 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 rounded-md">
                                  {item.calculatorTitle.replace(' Calculator', '')}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                  {timeFormatted}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 font-medium truncate">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRestore(item)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-xl border border-orange-200/80 dark:border-orange-800/80 transition-all cursor-pointer shadow-2xs"
                              title="Restore calculation into calculator"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Restore</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                              title={isExpanded ? 'Hide details' : 'View details'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteHistoryItem(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete this history item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metric summary badges */}
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 flex flex-wrap gap-2">
                          {item.keyMetrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-zinc-700/60 border border-zinc-200/80 dark:border-zinc-700 rounded-lg text-[11px]"
                            >
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                {m.label}:
                              </span>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {m.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Expanded details snapshot */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700 text-xs space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">
                              <span>Saved Snapshot Details</span>
                              <span>ID: {item.id.substring(0, 12)}...</span>
                            </div>
                            <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 max-h-36 overflow-y-auto space-y-1">
                              <div>
                                <span className="text-zinc-400">Calculator:</span>{' '}
                                {item.calculatorTitle}
                              </div>
                              <div>
                                <span className="text-zinc-400">Recorded At:</span>{' '}
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                              <div>
                                <span className="text-zinc-400">Employee:</span>{' '}
                                {item.employeeName}
                              </div>
                              {item.keyMetrics.map((k, i) => (
                                <div key={i}>
                                  <span className="text-zinc-400">{k.label}:</span> {k.value}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleRestore(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore This Calculation</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Privacy & Storage Notice */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Stored locally and privately on your browser. Zero cloud tracking.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
