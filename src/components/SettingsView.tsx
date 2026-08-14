import React from 'react';
import { Pencil, ChevronDown, Info } from 'lucide-react';
import { SettingsPreferences } from '../types';

interface SettingsViewProps {
  settings: SettingsPreferences;
  onChangeSetting: <K extends keyof SettingsPreferences>(
    key: K,
    value: SettingsPreferences[K]
  ) => void;
  onOpenEditModal: (
    title: string,
    key: keyof SettingsPreferences,
    value: number
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onChangeSetting,
  onOpenEditModal,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* CALCULATOR DEFAULTS CARD */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase">
          CALCULATOR DEFAULTS
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Default Standard Hours Per Day */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Default Standard Hours Per Day
            </label>
            <button
              onClick={() =>
                onOpenEditModal(
                  'Default Standard Hours Per Day',
                  'defaultStandardHoursPerDay',
                  settings.defaultStandardHoursPerDay
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{settings.defaultStandardHoursPerDay.toFixed(2)} hrs</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Default Annual Personal Leave Entitlement */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Default Annual Entitlement (hrs)
            </label>
            <button
              onClick={() =>
                onOpenEditModal(
                  'Default Annual Personal Leave Entitlement (hrs)',
                  'defaultAnnualEntitlementHours',
                  settings.defaultAnnualEntitlementHours || 76.0
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{(settings.defaultAnnualEntitlementHours || 76.0).toFixed(2)} hrs</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Application Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Application Theme
            </label>
            <div className="relative min-w-[180px]">
              <select
                value={
                  settings.theme === 'Light'
                    ? 'Light Theme'
                    : settings.theme === 'Dark'
                    ? 'Dark Theme'
                    : settings.theme || 'System Default'
                }
                onChange={(e) =>
                  onChangeSetting('theme', e.target.value as any)
                }
                className="w-full appearance-none px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm sm:text-base pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="System Default">System Default</option>
                <option value="Light Theme">Light Theme</option>
                <option value="Dark Theme">Dark Theme</option>
              </select>
              <ChevronDown className="w-4 h-4 text-orange-600 dark:text-orange-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Fair Work Ombudsman Reference Notice */}
      <div className="bg-orange-100/60 dark:bg-zinc-900 border border-orange-200 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
        <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-zinc-900 dark:text-zinc-100">
          <h4 className="font-bold text-base text-orange-900 dark:text-orange-400">
            Fair Work Ombudsman & NES Reference
          </h4>
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 font-medium">
            This tool follows the Australian National Employment Standards (NES) for calculating
            personal leave entitlements across multiple service periods and opening balance adjustments.
          </p>
        </div>
      </div>
    </div>
  );
};
