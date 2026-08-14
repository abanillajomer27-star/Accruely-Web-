import React from 'react';
import { Menu, RotateCcw, ArrowLeft } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMenu: () => void;
  onReset: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMenu,
  onReset,
  onSelectTab,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'leave-accrual':
        return 'Leave Accrual Calculator';
      case 'pl-opening-balance':
        return 'PL Opening Balance Calculator';
      case 'settings':
        return 'Settings & Preferences';
      case 'about':
        return 'About Accruely';
      default:
        return 'Accruely';
    }
  };

  const isCalculatorTab = activeTab === 'leave-accrual' || activeTab === 'pl-opening-balance';

  return (
    <header className="bg-orange-600 dark:bg-zinc-900 text-white shadow-md sticky top-0 z-30 border-b border-orange-700 dark:border-zinc-800 transition-colors">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-3">
          {!isCalculatorTab ? (
            <button
              onClick={() => onSelectTab('pl-opening-balance')}
              aria-label="Back to calculator"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onOpenMenu}
              aria-label="Open menu"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-7 h-7" />
            </button>
          )}

          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
              {getTitle()}
            </h1>
            {isCalculatorTab && (
              <p className="text-[11px] text-orange-200 dark:text-zinc-400 font-medium">
                {activeTab === 'pl-opening-balance'
                  ? 'Dual Entitlement & Xero Reconciler'
                  : 'Pay Run & Period Accruals'}
              </p>
            )}
          </div>
        </div>

        {isCalculatorTab && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </header>
  );
};
