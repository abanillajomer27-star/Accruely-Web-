import React, { useState, useEffect } from 'react';
import {
  CalculatorInputs,
  SettingsPreferences,
  ActiveTab,
  PayFrequency,
} from './types';
import { calculateLeaveAccruals, getDefaultHoursForPayFrequency } from './utils/calculator';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CalculatorView } from './components/CalculatorView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { EditFieldModal } from './components/EditFieldModal';
import { ExitConfirmationModal } from './components/ExitConfirmationModal';

const DEFAULT_INPUTS: CalculatorInputs = {
  employeeName: 'John Smith',
  profile: 'Australian NES Full-Time',
  payFrequency: 'Weekly',
  standardHoursPerDay: 7.6,
  ordinaryHours: 38.0,
  publicHolidayHours: 0.0,
  annualLeaveTaken: 0.0,
  personalLeaveTaken: 0.0,
  totalHoursForPeriod: 38.0,
  overrideDefaultRates: false,
  customAlRate: 0.0769,
  customPlRate: 0.0385,
  openingAnnualLeave: 0.0,
  openingPersonalLeave: 0.0,
};

const DEFAULT_SETTINGS: SettingsPreferences = {
  defaultStandardHoursPerDay: 7.6,
  defaultPayFrequency: 'Weekly',
  theme: 'System Default',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const saved = localStorage.getItem('accruely_inputs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_INPUTS;
  });

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

  // Save inputs to localStorage
  useEffect(() => {
    localStorage.setItem('accruely_inputs', JSON.stringify(inputs));
  }, [inputs]);

  // Web Browser beforeunload event (Tab / Window closing warning)
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
    // Push an initial history entry
    window.history.pushState({ app: 'accruely' }, '', window.location.href);

    const handlePopState = () => {
      // Re-push history entry so back button doesn't leave without confirmation
      window.history.pushState({ app: 'accruely' }, '', window.location.href);
      setIsExitModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Apply Theme & Save Settings
  useEffect(() => {
    localStorage.setItem('accruely_settings', JSON.stringify(settings));

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

  const handleChangeInput = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChangeSetting = <K extends keyof SettingsPreferences>(
    key: K,
    value: SettingsPreferences[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetInputs = () => {
    const stdHours = settings.defaultStandardHoursPerDay || 7.6;
    const freq: PayFrequency = settings.defaultPayFrequency || 'Weekly';
    const periodHours = getDefaultHoursForPayFrequency(freq, stdHours);

    setInputs({
      ...DEFAULT_INPUTS,
      standardHoursPerDay: stdHours,
      payFrequency: freq,
      ordinaryHours: periodHours,
      totalHoursForPeriod: periodHours,
    });
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    // 1. Android Capacitor / Cordova exit
    if ((navigator as any).app && typeof (navigator as any).app.exitApp === 'function') {
      (navigator as any).app.exitApp();
      return;
    }
    // 2. Try window.close()
    try {
      window.close();
    } catch (e) {
      // fallback
    }
    // 3. Fallback blank page
    window.location.href = 'about:blank';
  };

  const results = calculateLeaveAccruals(inputs);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col antialiased transition-colors duration-200">
      <Header
        activeTab={activeTab}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onReset={handleResetInputs}
        onBackToCalculator={() => setActiveTab('calculator')}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        activeTab={activeTab}
        onClose={() => setIsDrawerOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onRequestExit={() => setIsExitModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-4 pt-4 sm:pt-6">
        {activeTab === 'calculator' && (
          <CalculatorView
            inputs={inputs}
            results={results}
            onChangeInput={handleChangeInput}
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
};
