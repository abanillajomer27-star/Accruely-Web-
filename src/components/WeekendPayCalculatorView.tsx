import React, { useState, useRef, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  RotateCcw,
  Calculator,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
} from '../types';
import { DailyTimesheetInput } from './weekend-pay/DailyTimesheetInput';
import { PayRuleSelector } from './weekend-pay/PayRuleSelector';
import { WeekendSplitBreakdown } from './weekend-pay/WeekendSplitBreakdown';
import { WeekendPayExportModal } from './WeekendPayExportModal';

interface WeekendPayCalculatorViewProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (
    updater: (prev: WeekendPayInputs) => WeekendPayInputs
  ) => void;
}

export const WeekendPayCalculatorView: React.FC<WeekendPayCalculatorViewProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleExportEvent = () => setIsExportOpen(true);
    window.addEventListener('accruely:open-export', handleExportEvent);
    return () => window.removeEventListener('accruely:open-export', handleExportEvent);
  }, []);

  const handleResetDefaults = () => {
    onChangeInput(() => ({
      mode: 'single',
      w1Monday: '',
      w1Tuesday: '',
      w1Wednesday: '',
      w1Thursday: '',
      w1Friday: '',
      w1Saturday: '4.98',
      w1Sunday: '1.00',
      w2Monday: '',
      w2Tuesday: '',
      w2Wednesday: '',
      w2Thursday: '',
      w2Friday: '',
      w2Saturday: '4.92',
      w2Sunday: '1.00',
      saturdayHours: '4.98',
      sundayHours: '1.00',
      totalTimesheetHours: '11.90',
      selectedRuleId: 'casual-loaded',
      payRule: 'casual-loaded',
      saturdayCap: '4.14',
      sundayCap: '4.14',
      casualShiftCap: '4.14',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }));
  };

  const handleCalculateClick = () => {
    setIsCalculating(true);
    // Force a deterministic trigger/re-evaluation
    onChangeInput((prev) => ({ ...prev }));
    setTimeout(() => {
      setIsCalculating(false);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* TOP ACTIONS / RESET */}
      <div className="flex justify-end items-center">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 hover:text-zinc-900 dark:hover:text-white"
          title="Reset Weekend Split OT Calculator"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* TWO COLUMN RESPONSIVE GRID FOR DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TIMESHEET & RULE SELECTOR */}
        <div className="lg:col-span-6 space-y-6">
          {/* 2. ORIGINAL WEEKEND TIMESHEET */}
          <DailyTimesheetInput
            inputs={inputs}
            results={results}
            onChangeInput={onChangeInput}
          />

          {/* 3. APPLICABLE PAY / AWARD RULE */}
          <PayRuleSelector
            inputs={inputs}
            results={results}
            onChangeInput={onChangeInput}
          />

          {/* 4. CALCULATE ACTION BUTTON */}
          <div className="flex justify-center pt-1">
            <button
              id="calculate-weekend-split-button"
              type="button"
              onClick={handleCalculateClick}
              className="w-full px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Calculator className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>CALCULATE SPLIT</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SPLIT BREAKDOWN & EXPORT */}
        <div className="lg:col-span-6 space-y-6">
          {/* 5. WEEKEND SPLIT BREAKDOWN */}
          <div ref={resultsRef}>
            <WeekendSplitBreakdown
              inputs={inputs}
              results={results}
              onChangeInput={onChangeInput}
            />
          </div>

          {/* 6. ACTION BUTTON: EXPORT / SHARE */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
            >
              <FileText className="w-5 h-5 text-orange-100" />
              <span>Export / Share Weekend Split</span>
            </button>
          </div>

          {/* 7. IMPORTANT AUSTRALIAN PAYROLL DISCLAIMER */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            <p>
              <strong className="text-zinc-800 dark:text-zinc-200">Notice: </strong>
              Weekend and overtime entitlements can vary by award, agreement and employment arrangement. Select the applicable rule and verify the result before processing payroll.
            </p>
          </div>
        </div>
      </div>

      {/* 8. EXPORT STATEMENT MODAL */}
      <WeekendPayExportModal
        isOpen={isExportOpen}
        inputs={inputs}
        results={results}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
