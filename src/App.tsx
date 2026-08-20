import React, { useState, useEffect } from 'react';
import {
  LeaveAccrualInputs,
  LeaveAccrualResults,
  PLCalculatorInputs,
  PLCalculatorResults,
  StandardOTAdjustmentInputs,
  StandardOTAdjustmentResults,
  WeekendPayInputs,
  WeekendPayResults,
  SettingsPreferences,
  ActiveTab,
  CalculationHistoryItem,
  CalculatorTabType,
} from './types';
import {
  calculateLeaveAccrual,
  calculatePLOpeningBalance,
  calculateStandardOTAdjustment,
  calculateWeekendPay,
} from './utils/calculator';
import {
  loadHistory,
  addHistoryItem,
  deleteHistoryItem,
  clearCalculatorHistory,
  buildLeaveAccrualHistory,
  buildPLOpeningBalanceHistory,
  buildStandardOTHistory,
  buildWeekendPayHistory,
} from './utils/history';
import { isShortcutMatch } from './utils/shortcuts';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HistoryModal } from './components/HistoryModal';
import { LeaveAccrualCalculatorView } from './components/LeaveAccrualCalculatorView';
import { PLOpeningBalanceCalculatorView } from './components/PLOpeningBalanceCalculatorView';
import { StandardOTAdjustmentCalculatorView } from './components/StandardOTAdjustmentCalculatorView';
import { WeekendPayCalculatorView } from './components/WeekendPayCalculatorView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';

const DEFAULT_LEAVE_ACCRUAL_INPUTS: LeaveAccrualInputs = {
  employeeName: 'John Smith',
  profile: 'Australian NES Full-Time',
  payFrequency: 'Fortnightly',
  standardHoursPerDay: 7.6,
  totalHoursForPeriod: 76.0,
  ordinaryHours: 76.0,
  publicHolidayHours: 0,
  annualLeaveTaken: 0,
  personalLeaveTaken: 0,
  overrideDefaultRates: false,
  customAnnualLeaveAccrualRate: 0.0769230769,
  customPersonalLeaveAccrualRate: 0.0384615385,
  annualLeaveOpeningBalance: 0,
  personalLeaveOpeningBalance: 0,
};

const DEFAULT_PL_INPUTS: PLCalculatorInputs = {
  employeeName: 'John Smith',
  standardHoursPerDay: 7.6,
  oldPeriod: {
    commencementDate: '',
    calculationDate: '',
    annualEntitlement: 76.0,
    completedYears: 0,
    remainingWeeks: 0,
  },
  newPeriod: {
    commencementDate: '',
    calculationDate: '',
    annualEntitlement: 76.0,
    completedYears: 0,
    remainingWeeks: 0,
  },
  leaveUsedPreMYOB: 0,
  leaveUsedMYOB: 0,
  leaveUsedXero: 0,
  leaveUsedOther: 0,
  currentOpeningBalanceXero: 0,
  currentXeroBalance: 0,
};

const DEFAULT_STANDARD_OT_INPUTS: StandardOTAdjustmentInputs = {
  employeeName: 'John Smith',
  standardOrdinaryHours: 38,
  standardOT: 2,
  lwopDays: 0,
};

const DEFAULT_WEEKEND_PAY_INPUTS: WeekendPayInputs = {
  mode: 'single',
  saturdayHours: '4.98',
  sundayHours: '1.00',
  totalTimesheetHours: '5.98',
  totalHoursWorked: '5.98',
  dayWorked: 'Weekend',
  selectedRuleId: 'casual-loaded',
  payRule: 'casual-loaded',
  saturdayCap: '4.14',
  sundayCap: '4.14',
  casualShiftCap: '4.14',
  splitMode: 'automatic',
  ordinaryHourlyRate: 45.0,
  enablePayCalculation: true,
  payrollAmount: '',
};

const DEFAULT_SETTINGS: SettingsPreferences = {
  defaultStandardHoursPerDay: 7.6,
  defaultAnnualEntitlementHours: 76.0,
  defaultAnnualLeaveWeeks: 4.0,
  theme: 'System Default',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('leave-accrual');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Leave Accrual Inputs
  const [leaveAccrualInputs, setLeaveAccrualInputs] = useState<LeaveAccrualInputs>(() => {
    const saved = localStorage.getItem('accruely_leave_accrual_inputs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_LEAVE_ACCRUAL_INPUTS;
  });

  // PL Opening Balance Inputs
  const [plInputs, setPlInputs] = useState<PLCalculatorInputs>(() => {
    const saved = localStorage.getItem('accruely_pl_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.oldPeriod && parsed.newPeriod) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_PL_INPUTS;
  });

  // Standard OT Adjustment Inputs
  const [standardOTInputs, setStandardOTInputs] = useState<StandardOTAdjustmentInputs>(() => {
    const saved = localStorage.getItem('accruely_standard_ot_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.standardOrdinaryHours === 'number') {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_STANDARD_OT_INPUTS;
  });

  // Weekend Pay Inputs
  const [weekendPayInputs, setWeekendPayInputs] = useState<WeekendPayInputs>(() => {
    const saved = localStorage.getItem('accruely_weekend_pay_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (typeof parsed.ordinaryHourlyRate === 'number' ||
            typeof parsed.totalTimesheetHours === 'number' ||
            typeof parsed.totalHoursWorked === 'number')
        ) {
          const loadedCategories =
            parsed.categories && parsed.categories.length > 0
              ? parsed.categories
              : DEFAULT_WEEKEND_PAY_INPUTS.categories;

          return {
            ...DEFAULT_WEEKEND_PAY_INPUTS,
            ...parsed,
            totalTimesheetHours:
              parsed.totalTimesheetHours ?? parsed.totalHoursWorked ?? 4.98,
            totalHoursWorked:
              parsed.totalTimesheetHours ?? parsed.totalHoursWorked ?? 4.98,
            categories: loadedCategories,
          };
        }
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_WEEKEND_PAY_INPUTS;
  });

  // Settings
  const [settings, setSettings] = useState<SettingsPreferences>(() => {
    const saved = localStorage.getItem('accruely_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  // History & Shortcuts state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => loadHistory());
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('accruely_leave_accrual_inputs', JSON.stringify(leaveAccrualInputs));
  }, [leaveAccrualInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_pl_inputs', JSON.stringify(plInputs));
  }, [plInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_standard_ot_inputs', JSON.stringify(standardOTInputs));
  }, [standardOTInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_weekend_pay_inputs', JSON.stringify(weekendPayInputs));
  }, [weekendPayInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply Theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const root = document.documentElement;
      const themeChoice = settings.theme;

      let isDark = false;
      if (themeChoice === 'Dark' || themeChoice === 'Dark Theme') {
        isDark = true;
      } else if (themeChoice === 'Light' || themeChoice === 'Light Theme') {
        isDark = false;
      } else {
        // System Default
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();

    const handleSystemThemeChange = () => {
      if (settings.theme === 'System Default' || !settings.theme) {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(handleSystemThemeChange);
      }
    };
  }, [settings.theme, settings]);

  const handleChangeSetting = <K extends keyof SettingsPreferences>(
    key: K,
    value: SettingsPreferences[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetActiveCalculator = () => {
    if (activeTab === 'leave-accrual') {
      setLeaveAccrualInputs({
        ...DEFAULT_LEAVE_ACCRUAL_INPUTS,
        annualLeaveWeeksPerYear: settings.defaultAnnualLeaveWeeks || 4.0,
      });
    } else if (activeTab === 'pl-opening-balance') {
      const stdHours = settings.defaultStandardHoursPerDay || 7.6;
      const annualEntitlement = settings.defaultAnnualEntitlementHours || 76.0;

      setPlInputs({
        ...DEFAULT_PL_INPUTS,
        standardHoursPerDay: stdHours,
        oldPeriod: {
          commencementDate: '',
          calculationDate: '',
          annualEntitlement,
          completedYears: 0,
          remainingWeeks: 0,
        },
        newPeriod: {
          commencementDate: '',
          calculationDate: '',
          annualEntitlement,
          completedYears: 0,
          remainingWeeks: 0,
        },
      });
    } else if (activeTab === 'standard-ot-adjustment') {
      setStandardOTInputs(DEFAULT_STANDARD_OT_INPUTS);
    } else if (activeTab === 'weekend-pay') {
      setWeekendPayInputs(DEFAULT_WEEKEND_PAY_INPUTS);
    }
  };

  // Calculations
  const leaveAccrualResults: LeaveAccrualResults = calculateLeaveAccrual(leaveAccrualInputs);
  const plResults: PLCalculatorResults = calculatePLOpeningBalance(plInputs);
  const standardOTResults: StandardOTAdjustmentResults =
    calculateStandardOTAdjustment(standardOTInputs);
  const weekendPayResults: WeekendPayResults = calculateWeekendPay(weekendPayInputs);

  // Save active calculation snapshot into History
  const saveCurrentCalculatorToHistory = (showToast = true) => {
    let newItem: Omit<CalculationHistoryItem, 'id' | 'timestamp'> | null = null;

    if (activeTab === 'leave-accrual') {
      newItem = buildLeaveAccrualHistory(leaveAccrualInputs, leaveAccrualResults);
    } else if (activeTab === 'pl-opening-balance') {
      newItem = buildPLOpeningBalanceHistory(plInputs, plResults);
    } else if (activeTab === 'standard-ot-adjustment') {
      newItem = buildStandardOTHistory(standardOTInputs, standardOTResults);
    } else if (activeTab === 'weekend-pay') {
      newItem = buildWeekendPayHistory(weekendPayInputs, weekendPayResults);
    }

    if (newItem) {
      const updated = addHistoryItem(newItem);
      setHistory(updated);
      if (showToast) {
        setShortcutFeedback('Saved calculation to history');
        setTimeout(() => setShortcutFeedback(null), 2500);
      }
    }
  };

  // Restore calculation from History
  const handleRestoreCalculation = (item: CalculationHistoryItem) => {
    if (item.calculatorType === 'leave-accrual') {
      setLeaveAccrualInputs(item.inputs as LeaveAccrualInputs);
      setActiveTab('leave-accrual');
    } else if (item.calculatorType === 'pl-opening-balance') {
      setPlInputs(item.inputs as PLCalculatorInputs);
      setActiveTab('pl-opening-balance');
    } else if (item.calculatorType === 'standard-ot-adjustment') {
      setStandardOTInputs(item.inputs as StandardOTAdjustmentInputs);
      setActiveTab('standard-ot-adjustment');
    } else if (item.calculatorType === 'weekend-pay') {
      setWeekendPayInputs(item.inputs as WeekendPayInputs);
      setActiveTab('weekend-pay');
    }
    setIsHistoryOpen(false);
    setShortcutFeedback(`Restored ${item.calculatorTitle}`);
    setTimeout(() => setShortcutFeedback(null), 2500);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = (type?: CalculatorTabType | 'all') => {
    const updated = clearCalculatorHistory(type);
    setHistory(updated);
  };

  // Debounced auto-save calculation to history when inputs change
  useEffect(() => {
    const isCalculator =
      activeTab === 'leave-accrual' ||
      activeTab === 'pl-opening-balance' ||
      activeTab === 'standard-ot-adjustment' ||
      activeTab === 'weekend-pay';

    if (!isCalculator) return;

    const timer = setTimeout(() => {
      let item: Omit<CalculationHistoryItem, 'id' | 'timestamp'> | null = null;
      if (activeTab === 'leave-accrual') {
        item = buildLeaveAccrualHistory(leaveAccrualInputs, leaveAccrualResults);
      } else if (activeTab === 'pl-opening-balance') {
        item = buildPLOpeningBalanceHistory(plInputs, plResults);
      } else if (activeTab === 'standard-ot-adjustment') {
        item = buildStandardOTHistory(standardOTInputs, standardOTResults);
      } else if (activeTab === 'weekend-pay') {
        item = buildWeekendPayHistory(weekendPayInputs, weekendPayResults);
      }

      if (item) {
        const updated = addHistoryItem(item);
        setHistory(updated);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    leaveAccrualInputs,
    plInputs,
    standardOTInputs,
    weekendPayInputs,
  ]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Ctrl + \ or Cmd + \
      if (isShortcutMatch(e, 'toggle-sidebar')) {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
        return;
      }

      // Open History: Ctrl + Shift + H or Cmd + Shift + H
      if (isShortcutMatch(e, 'history')) {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }

      // Reset active calculator: Ctrl + Shift + R or Cmd + Shift + R
      if (isShortcutMatch(e, 'reset')) {
        e.preventDefault();
        handleResetActiveCalculator();
        setShortcutFeedback('Reset current calculator');
        setTimeout(() => setShortcutFeedback(null), 2500);
        return;
      }

      // Calculate / Save snapshot: Ctrl + Enter or Cmd + Enter
      if (isShortcutMatch(e, 'calculate')) {
        e.preventDefault();
        saveCurrentCalculatorToHistory(true);
        return;
      }

      // Export: Ctrl + Shift + E or Cmd + Shift + E
      if (isShortcutMatch(e, 'export')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('accruely:open-export'));
        return;
      }

      // Escape key to close open modals or sidebar
      if (e.key === 'Escape') {
        if (isHistoryOpen) {
          setIsHistoryOpen(false);
        } else if (isDrawerOpen) {
          setIsDrawerOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isHistoryOpen,
    isDrawerOpen,
    activeTab,
    leaveAccrualInputs,
    leaveAccrualResults,
    plInputs,
    plResults,
    standardOTInputs,
    standardOTResults,
    weekendPayInputs,
    weekendPayResults,
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col antialiased transition-colors duration-200">
      <Header
        activeTab={activeTab}
        isDrawerOpen={isDrawerOpen}
        onOpenMenu={() => setIsDrawerOpen((prev) => !prev)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        activeTab={activeTab}
        onClose={() => setIsDrawerOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        activeCalculatorTab={
          activeTab === 'leave-accrual' ||
          activeTab === 'pl-opening-balance' ||
          activeTab === 'standard-ot-adjustment' ||
          activeTab === 'weekend-pay'
            ? activeTab
            : 'leave-accrual'
        }
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreCalculation}
        onDelete={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Floating shortcut feedback toast */}
      {shortcutFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-none">
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-lg border border-zinc-700/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{shortcutFeedback}</span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'leave-accrual' && (
          <LeaveAccrualCalculatorView
            inputs={leaveAccrualInputs}
            results={leaveAccrualResults}
            onChangeInput={setLeaveAccrualInputs}
          />
        )}

        {activeTab === 'pl-opening-balance' && (
          <PLOpeningBalanceCalculatorView
            inputs={plInputs}
            results={plResults}
            onChangeInput={setPlInputs}
          />
        )}

        {activeTab === 'standard-ot-adjustment' && (
          <StandardOTAdjustmentCalculatorView
            inputs={standardOTInputs}
            results={standardOTResults}
            onChangeInput={setStandardOTInputs}
          />
        )}

        {activeTab === 'weekend-pay' && (
          <WeekendPayCalculatorView
            inputs={weekendPayInputs}
            results={weekendPayResults}
            onChangeInput={setWeekendPayInputs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onChangeSetting={handleChangeSetting}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'privacy-policy' && (
          <PrivacyPolicyView
            onBackToCalculator={() => setActiveTab('weekend-pay')}
          />
        )}
      </main>

      {/* Website Footer */}
      <footer className="mt-auto py-5 border-t border-zinc-200/80 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Accruely</span>
            <span>•</span>
            <span>Australian Payroll Tools</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('privacy-policy')}
              className={`font-medium transition-colors cursor-pointer ${
                activeTab === 'privacy-policy'
                  ? 'text-orange-600 dark:text-orange-400 underline underline-offset-2'
                  : 'hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Privacy Policy
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`font-medium transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'text-orange-600 dark:text-orange-400 underline underline-offset-2'
                  : 'hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              About Accruely
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
