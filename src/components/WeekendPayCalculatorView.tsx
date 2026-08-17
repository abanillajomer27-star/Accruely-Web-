import React, { useState, useRef } from 'react';
import {
  DollarSign,
  FileText,
  RotateCcw,
  Printer,
  X,
  Copy,
  Check,
  Calculator,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
} from '../types';
import { generateWeekendPayStatementText } from '../utils/calculator';
import { ScenarioPresets } from './weekend-pay/ScenarioPresets';
import { DailyTimesheetInput } from './weekend-pay/DailyTimesheetInput';
import { PayRuleSelector } from './weekend-pay/PayRuleSelector';
import { WeekendSplitBreakdown } from './weekend-pay/WeekendSplitBreakdown';

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
  const [copiedStatement, setCopiedStatement] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleResetDefaults = () => {
    onChangeInput(() => ({
      mode: 'single',
      saturdayHours: '4.98',
      sundayHours: '1.00',
      totalTimesheetHours: '5.98',
      selectedRuleId: 'casual-loaded',
      payRule: 'casual-loaded',
      saturdayCap: '4.14',
      sundayCap: '4.14',
      casualShiftCap: '4.14',
      saturdayConfig: undefined,
      sundayConfig: undefined,
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

  const statementText = generateWeekendPayStatementText(inputs, results);

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statementText);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Weekend Pay Calculator
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 rounded-md">
                  Rule-Driven Timesheet Split
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Split Saturday and Sunday timesheet hours using the applicable payroll/award rule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
              title="Reset to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RECONCILIATION TEST SCENARIOS */}
      <ScenarioPresets onChangeInput={onChangeInput} />

      {/* 3. ORIGINAL WEEKEND TIMESHEET */}
      <DailyTimesheetInput
        inputs={inputs}
        results={results}
        onChangeInput={onChangeInput}
      />

      {/* 4. APPLICABLE PAY / AWARD RULE */}
      <PayRuleSelector
        inputs={inputs}
        results={results}
        onChangeInput={onChangeInput}
      />

      {/* 5. CALCULATE ACTION BUTTON */}
      <div className="flex justify-center pt-1">
        <button
          id="calculate-weekend-split-button"
          type="button"
          onClick={handleCalculateClick}
          className="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Calculator className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>CALCULATE SPLIT</span>
        </button>
      </div>

      {/* 6. WEEKEND SPLIT BREAKDOWN */}
      <div ref={resultsRef}>
        <WeekendSplitBreakdown
          inputs={inputs}
          results={results}
          onChangeInput={onChangeInput}
        />
      </div>

      {/* 7. IMPORTANT AUSTRALIAN PAYROLL DISCLAIMER */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
        <p>
          <strong className="text-zinc-800 dark:text-zinc-200">Notice: </strong>
          Weekend and overtime entitlements can vary by award, agreement and employment arrangement. Select the applicable rule and verify the result before processing payroll.
        </p>
      </div>

      {/* 8. EXPORT STATEMENT MODAL */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
            <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold">Weekend Split & Reconciliation Statement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto bg-orange-50/50 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                Statement Text Preview:
              </p>
              <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto select-all border border-zinc-800">
                {statementText}
              </pre>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-orange-200/60 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrintStatement}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-100/80 dark:bg-zinc-800 hover:bg-orange-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyStatement}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl shadow transition-all cursor-pointer ${
                  copiedStatement
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {copiedStatement ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Statement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
