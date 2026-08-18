import React, { useState } from 'react';
import { Calendar, Clock, RotateCcw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { WeekendPayInputs, WeekendPayResults } from '../../types';

interface DailyTimesheetInputProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

/**
 * Extracts a clean decimal string from typed or pasted text
 * e.g. "4.98 hours" -> "4.98", "4,92 hrs" -> "4.92", "$1.00" -> "1.00"
 */
function cleanDecimalInput(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const normalized = trimmed
    .replace(/[$€£¥"'\s]/g, '')
    .replace(/hours?|hrs?|h$/gi, '')
    .replace(',', '.');
  
  const match = normalized.match(/^-?\d*(?:\.\d*)?/);
  return match && match[0] ? match[0] : normalized;
}

export const DailyTimesheetInput: React.FC<DailyTimesheetInputProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [showWeekdays, setShowWeekdays] = useState(Boolean(inputs.showWeekdayInputs));

  // Week 1 Values
  const w1Sat = inputs.w1Saturday !== undefined && inputs.w1Saturday !== null
    ? String(inputs.w1Saturday)
    : (inputs.saturdayHours !== undefined && inputs.saturdayHours !== null ? String(inputs.saturdayHours) : '');
  const w1Sun = inputs.w1Sunday !== undefined && inputs.w1Sunday !== null
    ? String(inputs.w1Sunday)
    : (inputs.sundayHours !== undefined && inputs.sundayHours !== null ? String(inputs.sundayHours) : '');

  const w1Mon = inputs.w1Monday !== undefined && inputs.w1Monday !== null ? String(inputs.w1Monday) : '';
  const w1Tue = inputs.w1Tuesday !== undefined && inputs.w1Tuesday !== null ? String(inputs.w1Tuesday) : '';
  const w1Wed = inputs.w1Wednesday !== undefined && inputs.w1Wednesday !== null ? String(inputs.w1Wednesday) : '';
  const w1Thu = inputs.w1Thursday !== undefined && inputs.w1Thursday !== null ? String(inputs.w1Thursday) : '';
  const w1Fri = inputs.w1Friday !== undefined && inputs.w1Friday !== null ? String(inputs.w1Friday) : '';

  // Week 2 Values
  const w2Sat = inputs.w2Saturday !== undefined && inputs.w2Saturday !== null ? String(inputs.w2Saturday) : '';
  const w2Sun = inputs.w2Sunday !== undefined && inputs.w2Sunday !== null ? String(inputs.w2Sunday) : '';

  const w2Mon = inputs.w2Monday !== undefined && inputs.w2Monday !== null ? String(inputs.w2Monday) : '';
  const w2Tue = inputs.w2Tuesday !== undefined && inputs.w2Tuesday !== null ? String(inputs.w2Tuesday) : '';
  const w2Wed = inputs.w2Wednesday !== undefined && inputs.w2Wednesday !== null ? String(inputs.w2Wednesday) : '';
  const w2Thu = inputs.w2Thursday !== undefined && inputs.w2Thursday !== null ? String(inputs.w2Thursday) : '';
  const w2Fri = inputs.w2Friday !== undefined && inputs.w2Friday !== null ? String(inputs.w2Friday) : '';

  const handleFieldChange = (field: keyof WeekendPayInputs, val: string) => {
    const cleaned = cleanDecimalInput(val);
    onChangeInput((prev) => {
      const updated: WeekendPayInputs = {
        ...prev,
        [field]: cleaned,
      };

      // Also mirror to legacy saturdayHours/sundayHours for Week 1
      if (field === 'w1Saturday') {
        updated.saturdayHours = cleaned;
        updated.w1SaturdayConfig = undefined;
        updated.saturdayConfig = undefined;
      }
      if (field === 'w1Sunday') {
        updated.sundayHours = cleaned;
        updated.w1SundayConfig = undefined;
        updated.sundayConfig = undefined;
      }
      if (field === 'w2Saturday') {
        updated.w2SaturdayConfig = undefined;
      }
      if (field === 'w2Sunday') {
        updated.w2SundayConfig = undefined;
      }

      return updated;
    });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    field: keyof WeekendPayInputs
  ) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData) {
      e.preventDefault();
      const cleaned = cleanDecimalInput(pasteData);
      handleFieldChange(field, cleaned);
    }
  };

  const handleClearAll = () => {
    onChangeInput((prev) => ({
      ...prev,
      w1Monday: '',
      w1Tuesday: '',
      w1Wednesday: '',
      w1Thursday: '',
      w1Friday: '',
      w1Saturday: '',
      w1Sunday: '',
      w2Monday: '',
      w2Tuesday: '',
      w2Wednesday: '',
      w2Thursday: '',
      w2Friday: '',
      w2Saturday: '',
      w2Sunday: '',
      saturdayHours: '',
      sundayHours: '',
      totalTimesheetHours: '',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }));
  };

  const hasAnyHours =
    w1Sat !== '' ||
    w1Sun !== '' ||
    w2Sat !== '' ||
    w2Sun !== '' ||
    w1Mon !== '' ||
    w1Tue !== '' ||
    w1Wed !== '' ||
    w1Thu !== '' ||
    w1Fri !== '' ||
    w2Mon !== '' ||
    w2Tue !== '' ||
    w2Wed !== '' ||
    w2Thu !== '' ||
    w2Fri !== '';

  return (
    <div
      id="original-weekend-timesheet-section"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                Fortnightly Timesheet Input
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 rounded-md">
                Fortnightly (2 Weeks)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Enter Saturday and Sunday hours for Week 1 and Week 2 as shown on the source timesheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextVal = !showWeekdays;
              setShowWeekdays(nextVal);
              onChangeInput((prev) => ({ ...prev, showWeekdayInputs: nextVal }));
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {showWeekdays ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide Weekdays</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Include Weekday Context (Mon–Fri)</span>
              </>
            )}
          </button>

          {hasAnyHours && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear all timesheet hours"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Missing information prompt if applicable */}
      {results.missingInformationNotice && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Notice: </strong>
            {results.missingInformationNotice}
          </div>
        </div>
      )}

      {/* Two-Week Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ===================== WEEK 1 ===================== */}
        <div className="p-4 rounded-xl border bg-orange-50/30 dark:bg-zinc-800/40 border-orange-200/70 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-200/50 dark:border-zinc-700/50 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-950 dark:text-orange-300">
              WEEK 1
            </span>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              Sat + Sun Primary Focus
            </span>
          </div>

          {/* Week 1 Weekend Focus (Saturday & Sunday) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Week 1 Saturday */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-orange-200/80 dark:border-zinc-700 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="w1-saturday-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Saturday</span>
                </label>
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded">
                  W1 Sat
                </span>
              </div>
              <div className="relative">
                <input
                  id="w1-saturday-input"
                  type="text"
                  inputMode="decimal"
                  value={w1Sat}
                  onChange={(e) => handleFieldChange('w1Saturday', e.target.value)}
                  onPaste={(e) => handlePaste(e, 'w1Saturday')}
                  placeholder="e.g. 4.98"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-lg text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>

            {/* Week 1 Sunday */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-orange-200/80 dark:border-zinc-700 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="w1-sunday-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Sunday</span>
                </label>
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded">
                  W1 Sun
                </span>
              </div>
              <div className="relative">
                <input
                  id="w1-sunday-input"
                  type="text"
                  inputMode="decimal"
                  value={w1Sun}
                  onChange={(e) => handleFieldChange('w1Sunday', e.target.value)}
                  onPaste={(e) => handlePaste(e, 'w1Sunday')}
                  placeholder="e.g. 1.00"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-lg text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>
          </div>

          {/* Optional Week 1 Weekdays (Mon-Fri) */}
          {showWeekdays && (
            <div className="pt-2 border-t border-orange-200/40 dark:border-zinc-800 space-y-2 animate-fadeIn">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide block">
                Week 1 Weekday Hours (Optional Context)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'w1Monday', label: 'Mon', val: w1Mon },
                  { id: 'w1Tuesday', label: 'Tue', val: w1Tue },
                  { id: 'w1Wednesday', label: 'Wed', val: w1Wed },
                  { id: 'w1Thursday', label: 'Thu', val: w1Thu },
                  { id: 'w1Friday', label: 'Fri', val: w1Fri },
                ].map((item) => (
                  <div key={item.id}>
                    <label
                      htmlFor={`${item.id}-input`}
                      className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block text-center mb-0.5"
                    >
                      {item.label}
                    </label>
                    <input
                      id={`${item.id}-input`}
                      type="text"
                      inputMode="decimal"
                      value={item.val}
                      onChange={(e) => handleFieldChange(item.id as keyof WeekendPayInputs, e.target.value)}
                      placeholder="0"
                      className="w-full px-1 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-bold text-zinc-900 dark:text-zinc-100 text-center outline-hidden focus:border-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===================== WEEK 2 ===================== */}
        <div className="p-4 rounded-xl border bg-orange-50/30 dark:bg-zinc-800/40 border-orange-200/70 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-200/50 dark:border-zinc-700/50 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-950 dark:text-orange-300">
              WEEK 2
            </span>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              Sat + Sun Primary Focus
            </span>
          </div>

          {/* Week 2 Weekend Focus (Saturday & Sunday) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Week 2 Saturday */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-orange-200/80 dark:border-zinc-700 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="w2-saturday-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Saturday</span>
                </label>
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded">
                  W2 Sat
                </span>
              </div>
              <div className="relative">
                <input
                  id="w2-saturday-input"
                  type="text"
                  inputMode="decimal"
                  value={w2Sat}
                  onChange={(e) => handleFieldChange('w2Saturday', e.target.value)}
                  onPaste={(e) => handlePaste(e, 'w2Saturday')}
                  placeholder="e.g. 4.92"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-lg text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>

            {/* Week 2 Sunday */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-orange-200/80 dark:border-zinc-700 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="w2-sunday-input"
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Sunday</span>
                </label>
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded">
                  W2 Sun
                </span>
              </div>
              <div className="relative">
                <input
                  id="w2-sunday-input"
                  type="text"
                  inputMode="decimal"
                  value={w2Sun}
                  onChange={(e) => handleFieldChange('w2Sunday', e.target.value)}
                  onPaste={(e) => handlePaste(e, 'w2Sunday')}
                  placeholder="e.g. 1.00"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-lg text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 text-right outline-hidden transition-all pr-8 shadow-xs"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>
          </div>

          {/* Optional Week 2 Weekdays (Mon-Fri) */}
          {showWeekdays && (
            <div className="pt-2 border-t border-orange-200/40 dark:border-zinc-800 space-y-2 animate-fadeIn">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide block">
                Week 2 Weekday Hours (Optional Context)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'w2Monday', label: 'Mon', val: w2Mon },
                  { id: 'w2Tuesday', label: 'Tue', val: w2Tue },
                  { id: 'w2Wednesday', label: 'Wed', val: w2Wed },
                  { id: 'w2Thursday', label: 'Thu', val: w2Thu },
                  { id: 'w2Friday', label: 'Fri', val: w2Fri },
                ].map((item) => (
                  <div key={item.id}>
                    <label
                      htmlFor={`${item.id}-input`}
                      className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block text-center mb-0.5"
                    >
                      {item.label}
                    </label>
                    <input
                      id={`${item.id}-input`}
                      type="text"
                      inputMode="decimal"
                      value={item.val}
                      onChange={(e) => handleFieldChange(item.id as keyof WeekendPayInputs, e.target.value)}
                      placeholder="0"
                      className="w-full px-1 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-bold text-zinc-900 dark:text-zinc-100 text-center outline-hidden focus:border-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

