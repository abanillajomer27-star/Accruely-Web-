import React from 'react';
import { Menu, RotateCcw, ArrowLeft } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMenu: () => void;
  onReset: () => void;
  onBackToCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMenu,
  onReset,
  onBackToCalculator,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'settings':
        return 'Settings & Preferences';
      case 'about':
        return 'About Accruely';
      case 'calculator':
      default:
        return 'Leave Accrual Calculator';
    }
  };

  return (
    <header className="bg-orange-600 dark:bg-zinc-900 text-white shadow-md sticky top-0 z-30 border-b border-orange-700 dark:border-zinc-800 transition-colors">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-3">
          {activeTab !== 'calculator' ? (
            <button
              onClick={onBackToCalculator}
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

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {getTitle()}
          </h1>
        </div>

        {activeTab === 'calculator' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Inputs</span>
          </button>
        )}
      </div>
    </header>
  );
};
