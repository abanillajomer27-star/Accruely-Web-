import React from 'react';
import { Calendar, Clock, RotateCcw } from 'lucide-react';
import { WeekendPayInputs, WeekendPayResults } from '../../types';

interface DailyTimesheetInputProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

export const DailyTimesheetInput: React.FC<DailyTimesheetInputProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  // String value representation of Saturday and Sunday
  const satValue =
    inputs.saturdayHours !== undefined && inputs.saturdayHours !== null
      ? String(inputs.saturdayHours)
      : '';
  const sunValue =
    inputs.sundayHours !== undefined && inputs.sundayHours !== null
      ? String(inputs.sundayHours)
      : '';

  const handleSaturdayChange = (val: string) => {
    onChangeInput((prev) => ({
      ...prev,
      saturdayHours: val,
      totalTimesheetHours: val,
      // Clear legacy/manual overrides when editing raw timesheet
      saturdayConfig: undefined,
    }));
  };

  const handleSundayChange = (val: string) => {
    onChangeInput((prev) => ({
      ...prev,
      sundayHours: val,
      // Clear legacy/manual overrides when editing raw timesheet
      sundayConfig: undefined,
    }));
  };

  const handleClear = () => {
    onChangeInput((prev) => ({
      ...prev,
      saturdayHours: '',
      sundayHours: '',
      totalTimesheetHours: '',
      saturdayConfig: undefined,
      sundayConfig: undefined,
    }));
  };

  return (
    <div
      id="original-weekend-timesheet-section"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Original Weekend Timesheet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Enter total hours worked exactly as shown on the source timesheet (e.g. from Deputy).
            </p>
          </div>
        </div>

        {(satValue !== '' || sunValue !== '') && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear hours"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Saturday and Sunday Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saturday */}
        <div className="p-3.5 rounded-xl border bg-orange-50/40 dark:bg-zinc-800/60 border-orange-200/80 dark:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="saturday-hours-input"
              className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Saturday</span>
            </label>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">
              Weekend
            </span>
          </div>

          <div className="relative">
            <input
              id="saturday-hours-input"
              type="text"
              inputMode="decimal"
              value={satValue}
              onChange={(e) => handleSaturdayChange(e.target.value)}
              placeholder="e.g. 4.98"
              className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
              h
            </span>
          </div>
        </div>

        {/* Sunday */}
        <div className="p-3.5 rounded-xl border bg-orange-50/40 dark:bg-zinc-800/60 border-orange-200/80 dark:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="sunday-hours-input"
              className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Sunday</span>
            </label>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">
              Weekend
            </span>
          </div>

          <div className="relative">
            <input
              id="sunday-hours-input"
              type="text"
              inputMode="decimal"
              value={sunValue}
              onChange={(e) => handleSundayChange(e.target.value)}
              placeholder="e.g. 1.00"
              className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
              h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
