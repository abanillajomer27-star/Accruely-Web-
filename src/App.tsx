import React, { useState, useEffect } from 'react';
import {
  LeaveAccrualInputs,
  LeaveAccrualResults,
  PLCalculatorInputs,
  PLCalculatorResults,
  SettingsPreferences,
  ActiveTab,
} from './types';
import {
  calculateLeaveAccrual,
  calculatePLOpeningBalance,
} from './utils/calculator';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { LeaveAccrualCalculatorView } from './components/LeaveAccrualCalculatorView';
import { PLOpeningBalanceCalculatorView } from './components/PLOpeningBalanceCalculatorView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { EditFieldModal } from './components/EditFieldModal';
import { ExitConfirmationModal } from './components/ExitConfirmationModal';

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

const DEFAULT_SETTINGS: SettingsPreferences = {
  defaultStandardHoursPerDay: 7.6,
  defaultAnnualEntitlementHours: 76.0,
  defaultAnnualLeaveWeeks: 4.0,
  theme: 'System Default',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pl-opening-balance');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

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

  const [settingsModal, setSettingsModal] = useState<{
    isOpen: boolean;
    title: string;
    key: keyof SettingsPreferences | null;
    value: number;
  }>({
    isOpen: false,
    title: '',
    key: null,
    value: 7.6,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('accruely_leave_accrual_inputs', JSON.stringify(leaveAccrualInputs));
  }, [leaveAccrualInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_pl_inputs', JSON.stringify(plInputs));
  }, [plInputs]);

  useEffect(() => {
    localStorage.setItem('accruely_settings', JSON.stringify(settings));
  }, [settings]);

  // Web Browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Do you want to close Accruely?';
      return 'Do you want to close Accruely?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Android Back Button / Back Gesture / History popstate handler
  useEffect(() => {
    window.history.pushState({ app: 'accruely' }, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState({ app: 'accruely' }, '', window.location.href);
      setIsExitModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
    }
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    if ((navigator as any).app && typeof (navigator as any).app.exitApp === 'function') {
      (navigator as any).app.exitApp();
      return;
    }
    try {
      window.close();
    } catch (e) {
      // fallback
    }
    window.location.href = 'about:blank';
  };

  // Calculations
  const leaveAccrualResults: LeaveAccrualResults = calculateLeaveAccrual(leaveAccrualInputs);
  const plResults: PLCalculatorResults = calculatePLOpeningBalance(plInputs);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col antialiased transition-colors duration-200">
      <Header
        activeTab={activeTab}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onReset={handleResetActiveCalculator}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        activeTab={activeTab}
        onClose={() => setIsDrawerOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onRequestExit={() => setIsExitModalOpen(true)}
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

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onChangeSetting={handleChangeSetting}
            onOpenEditModal={(title, key, val) =>
              setSettingsModal({
                isOpen: true,
                title,
                key,
                value: val,
              })
            }
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Settings Modal */}
      <EditFieldModal
        isOpen={settingsModal.isOpen}
        title={settingsModal.title}
        initialValue={settingsModal.value}
        type="number"
        onClose={() => setSettingsModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={(val) => {
          if (settingsModal.key) {
            handleChangeSetting(settingsModal.key, Number(val));
          }
        }}
      />

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onConfirmExit={handleConfirmExit}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
}
