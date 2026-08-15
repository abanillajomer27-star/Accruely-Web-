import React from 'react';
import { ChevronDown, Palette } from 'lucide-react';
import { SettingsPreferences } from '../types';

interface SettingsViewProps {
  settings: SettingsPreferences;
  onChangeSetting: <K extends keyof SettingsPreferences>(
    key: K,
    value: SettingsPreferences[K]
  ) => void;
  onOpenEditModal?: (
    title: string,
    key: keyof SettingsPreferences,
    value: number
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onChangeSetting,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-xl mx-auto">
      {/* APPLICATION THEME CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 transition-colors space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Application Theme
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Choose your preferred interface appearance. System Default automatically matches your device settings.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Theme Mode
          </label>
          <div className="relative min-w-[200px]">
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
              className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <option value="System Default">System Default</option>
              <option value="Light Theme">Light Theme</option>
              <option value="Dark Theme">Dark Theme</option>
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
