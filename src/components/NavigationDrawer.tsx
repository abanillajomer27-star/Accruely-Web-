import React from 'react';
import { Calculator, Scale, Clock, DollarSign, Settings, Info, ShieldCheck, X } from 'lucide-react';
import { ActiveTab } from '../types';
import { AccruelyLogo } from './AccruelyLogo';

interface NavigationDrawerProps {
  isOpen: boolean;
  activeTab: ActiveTab;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
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

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 dark:bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <AccruelyLogo className="w-full h-full text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-none">
                Accruely
              </h2>
              <p className="text-xs font-medium text-orange-100 dark:text-zinc-300 mt-1">
                Australian Payroll Tools
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Calculators
          </div>

          {/* Leave Accrual Calculator */}
          <button
            onClick={() => {
              onSelectTab('leave-accrual');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'leave-accrual'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Calculator
              className={`w-5 h-5 ${
                activeTab === 'leave-accrual' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span className="text-sm font-bold">Leave Accrual Calculator</span>
          </button>

          {/* PL Opening Balance Calculator */}
          <button
            onClick={() => {
              onSelectTab('pl-opening-balance');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'pl-opening-balance'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Scale
              className={`w-5 h-5 ${
                activeTab === 'pl-opening-balance' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span className="text-sm font-bold">PL Opening Balance</span>
          </button>

          {/* Standard OT Adjustment Calculator */}
          <button
            onClick={() => {
              onSelectTab('standard-ot-adjustment');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'standard-ot-adjustment'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Clock
              className={`w-5 h-5 ${
                activeTab === 'standard-ot-adjustment' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">Standard OT Adjustment</span>
            </div>
          </button>

          {/* Weekend Pay Calculator */}
          <button
            onClick={() => {
              onSelectTab('weekend-pay');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-base transition-all text-left cursor-pointer ${
              activeTab === 'weekend-pay'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <DollarSign
              className={`w-5 h-5 ${
                activeTab === 'weekend-pay' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">Weekend Pay Calculator</span>
              <span className="px-1.5 py-0.5 bg-orange-600 text-white dark:bg-orange-500 rounded text-[9px] font-bold uppercase">
                NEW
              </span>
            </div>
          </button>

          <div className="pt-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Preferences & Support
          </div>

          <button
            onClick={() => {
              onSelectTab('settings');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all text-left cursor-pointer ${
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all text-left cursor-pointer ${
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

          <button
            onClick={() => {
              onSelectTab('privacy-policy');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all text-left cursor-pointer ${
              activeTab === 'privacy-policy'
                ? 'bg-orange-100 text-orange-950 dark:bg-zinc-800 dark:text-orange-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck
              className={`w-5 h-5 ${
                activeTab === 'privacy-policy' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            <span>Privacy Policy</span>
          </button>
        </nav>

        {/* Footer info inside drawer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Accruely v2.0 • NES Compliant
          </p>
        </div>
      </div>
    </div>
  );
};
