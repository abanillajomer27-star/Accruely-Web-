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
} from './types';
import {
  calculateLeaveAccrual,
  calculatePLOpeningBalance,
  calculateStandardOTAdjustment,
  calculateWeekendPay,
} from './utils/calculator';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
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

  // Keyboard shortcut (Ctrl+\ or Cmd+\) to toggle sidebar drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculations
  const leaveAccrualResults: LeaveAccrualResults = calculateLeaveAccrual(leaveAccrualInputs);
  const plResults: PLCalculatorResults = calculatePLOpeningBalance(plInputs);
  const standardOTResults: StandardOTAdjustmentResults =
    calculateStandardOTAdjustment(standardOTInputs);
  const weekendPayResults: WeekendPayResults = calculateWeekendPay(weekendPayInputs);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col antialiased transition-colors duration-200">
      <Header
        activeTab={activeTab}
        isDrawerOpen={isDrawerOpen}
        onOpenMenu={() => setIsDrawerOpen((prev) => !prev)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        activeTab={activeTab}
        onClose={() => setIsDrawerOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-4 pt-4 sm:pt-6">
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
        <div className="max-w-xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <span>Accruely • Australian Payroll Tools</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
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
            About
          </button>
        </div>
      </footer>
    </div>
  );
}
