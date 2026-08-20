import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { ActiveTab } from '../types';
import { AccruelyLogo } from './AccruelyLogo';
import { getDisplayShortcut } from '../utils/shortcuts';

interface HeaderProps {
  activeTab: ActiveTab;
  isDrawerOpen?: boolean;
  onOpenMenu: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isDrawerOpen = false,
  onOpenMenu,
  onSelectTab,
  onOpenHistory,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 180); // short subtle delay
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleToggleClick = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
    onOpenMenu();
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'leave-accrual':
        return 'Leave Accrual Calculator';
      case 'pl-opening-balance':
        return 'PL Opening Balance Calculator';
      case 'standard-ot-adjustment':
        return 'Standard OT Adjustment Calculator';
      case 'weekend-pay':
        return 'Weekend Split OT Calculator';
      case 'settings':
        return 'Settings & Preferences';
      case 'about':
        return 'About Accruely';
      case 'privacy-policy':
        return 'Privacy Policy';
      default:
        return 'Accruely';
    }
  };

  const isCalculatorTab =
    activeTab === 'leave-accrual' ||
    activeTab === 'pl-opening-balance' ||
    activeTab === 'standard-ot-adjustment' ||
    activeTab === 'weekend-pay';

  return (
    <header className="bg-orange-600 dark:bg-zinc-900 text-white shadow-md sticky top-0 z-30 border-b border-orange-700 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {!isCalculatorTab ? (
            <button
              type="button"
              onClick={() => onSelectTab('leave-accrual')}
              aria-label="Back to calculator"
              title="Back to calculator"
              className="w-8 h-8 rounded-lg bg-white hover:bg-[#FFF3E6] active:bg-orange-100 text-zinc-700 hover:text-orange-950 border border-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={handleToggleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                aria-label={isDrawerOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={isDrawerOpen}
                aria-describedby="sidebar-toggle-tooltip"
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-all duration-150 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                  isDrawerOpen
                    ? 'bg-orange-700 dark:bg-orange-600 text-white border border-orange-800 dark:border-orange-500 shadow-inner'
                    : 'bg-white hover:bg-[#FFF3E6] active:bg-orange-100 text-zinc-700 hover:text-orange-950 border border-zinc-200/90 hover:border-orange-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700'
                }`}
              >
                {/* Karbon-style compact vertical split sidebar icon */}
                <svg
                  className="w-4 h-4 transition-colors"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                >
                  <rect
                    x="1.75"
                    y="2.25"
                    width="12.5"
                    height="11.5"
                    rx="2.25"
                    strokeWidth="1.35"
                  />
                  <path
                    d="M5.75 2.5V13.5"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Floating Dark Tooltip on hover/focus (hidden on touch devices) */}
              {showTooltip && (
                <div
                  id="sidebar-toggle-tooltip"
                  role="tooltip"
                  className="hidden md:block pointer-events-none absolute top-full left-0 mt-2 z-50 animate-fadeIn"
                >
                  <div className="relative bg-zinc-900 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-lg border border-zinc-700/80 whitespace-nowrap">
                    {/* Small upward triangle pointer */}
                    <div className="absolute -top-1 left-3 w-2 h-2 bg-zinc-900 border-t border-l border-zinc-700/80 transform rotate-45" />
                    <span className="relative z-10">
                      {isDrawerOpen ? 'Close sidebar' : 'Open sidebar'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accruely App Logo / Icon */}
          <div
            className="w-8 h-8 rounded-lg bg-white/15 dark:bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white shadow-xs p-1"
            title="Accruely"
          >
            <AccruelyLogo className="w-full h-full text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
              {getTitle()}
            </h1>
          </div>
        </div>

        {/* Right Action: History Button */}
        {onOpenHistory && isCalculatorTab && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label={`Open calculation history (${getDisplayShortcut('history')})`}
              title={`Calculation History (${getDisplayShortcut('history')})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <History className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
