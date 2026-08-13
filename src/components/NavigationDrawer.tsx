import React from 'react';
import { Calculator, Settings, Info, X, LogOut } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  activeTab: ActiveTab;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onRequestExit?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
  onRequestExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 animate-slideRight overflow-hidden transition-colors">
        {/* Drawer Header */}
        <div className="bg-orange-600 dark:bg-zinc-800 text-white p-6 pt-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
            Accruely
          </h2>
          <p className="text-sm font-medium text-orange-100 dark:text-zinc-300 mb-2">
            Australian Leave Accrual Calculator
          </p>
          <p className="text-xs text-orange-200 dark:text-zinc-400">
            Made by Jomer Abanilla, CFMS
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 bg-white dark:bg-zinc-900 overflow-y-auto">
          <button
            onClick={() => {
              onSelectTab('calculator');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-full font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Calculator
              className={`w-5 h-5 ${
                activeTab === 'calculator' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span>Leave Accrual Calculator</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('settings');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-full font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Settings
              className={`w-5 h-5 ${
                activeTab === 'settings' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span>Settings & Preferences</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('about');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-full font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'about'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Info
              className={`w-5 h-5 ${
                activeTab === 'about' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span>About Accruely</span>
          </button>

          {onRequestExit && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
              <button
                onClick={() => {
                  onClose();
                  onRequestExit();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-full font-semibold text-base transition-all text-left cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                <span>Exit Accruely</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer info inside drawer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Accruely v1.0 • NES Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

