import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Copy, Check, Sparkles } from 'lucide-react';
import { WeekendPayInputs, WeekendPayResults } from '../../types';
import { formatNum } from '../../utils/calculator';
import { getAwardRuleById } from '../../utils/weekendRules';

interface WeekendSplitBreakdownProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

export const WeekendSplitBreakdown: React.FC<WeekendSplitBreakdownProps> = ({
  inputs,
  results,
}) => {
  const [copiedDay, setCopiedDay] = React.useState<string | null>(null);

  const sat = results.saturdayBreakdown;
  const sun = results.sundayBreakdown;

  const satHours = sat?.timesheetHours ?? 0;
  const sunHours = sun?.timesheetHours ?? 0;
  const totalTimesheet = results.totalTimesheetHours ?? 0;

  const rule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule);

  // Copy helper for a day's allocation
  const handleCopyDay = (dayName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDay(dayName);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  // If no hours are entered on Saturday and Sunday
  if (satHours === 0 && sunHours === 0 && totalTimesheet === 0) {
    return (
      <div
        id="weekend-split-breakdown-empty-state"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs text-center space-y-2"
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Awaiting Weekend Timesheet Input
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Enter your Saturday and/or Sunday timesheet hours above to calculate the exact category split and verify reconciliation.
        </p>
      </div>
    );
  }

  return (
    <div
      id="weekend-split-breakdown-section"
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          Weekend Split Breakdown
        </h3>
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          Rule: {rule.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SATURDAY BREAKDOWN */}
        {sat && (
          <div
            id="saturday-breakdown-card"
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              satHours > 0
                ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                : 'bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-80'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  Saturday — {formatNum(sat.timesheetHours, 2)} h
                </h4>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Original Timesheet
                </span>
              </div>

              {satHours > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const lines = sat.categorySplits
                      ? sat.categorySplits.map((c) => `${c.name}: ${formatNum(c.allocatedHours, 2)} h`).join('\n')
                      : '';
                    handleCopyDay('Saturday', `Saturday (${formatNum(sat.timesheetHours, 2)} h):\n${lines}\nTotal: ${formatNum(sat.totalAllocated, 2)} h`);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copy Saturday split"
                >
                  {copiedDay === 'Saturday' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Category Breakdown Table */}
            {sat.categorySplits && sat.categorySplits.length > 0 ? (
              <div className="space-y-2.5">
                {sat.categorySplits.map((cat, idx) => (
                  <div
                    key={cat.id || idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/50"
                  >
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {cat.name}
                    </span>
                    <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {formatNum(cat.allocatedHours, 2)} h
                    </span>
                  </div>
                ))}

                {/* Subtotals & Differences */}
                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 px-2">
                    <span>Total Allocated</span>
                    <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {formatNum(sat.totalAllocated, 2)} h
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold text-zinc-500 dark:text-zinc-400 px-2">
                    <span>Difference</span>
                    <span className="font-mono">
                      {formatNum(Math.abs(sat.difference ?? 0), 2)} h
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  {satHours === 0 ? (
                    <div className="p-2 rounded-xl text-center text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                      No Saturday hours entered
                    </div>
                  ) : sat.isReconciled ? (
                    <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>✓ RECONCILED</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>⚠ VARIANCE: {formatNum(Math.abs(sat.difference ?? 0), 2)} h</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-zinc-400">
                No breakdown available
              </div>
            )}
          </div>
        )}

        {/* SUNDAY BREAKDOWN */}
        {sun && (
          <div
            id="sunday-breakdown-card"
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              sunHours > 0
                ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                : 'bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-80'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  Sunday — {formatNum(sun.timesheetHours, 2)} h
                </h4>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Original Timesheet
                </span>
              </div>

              {sunHours > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const lines = sun.categorySplits
                      ? sun.categorySplits.map((c) => `${c.name}: ${formatNum(c.allocatedHours, 2)} h`).join('\n')
                      : '';
                    handleCopyDay('Sunday', `Sunday (${formatNum(sun.timesheetHours, 2)} h):\n${lines}\nTotal: ${formatNum(sun.totalAllocated, 2)} h`);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copy Sunday split"
                >
                  {copiedDay === 'Sunday' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Category Breakdown Table */}
            {sun.categorySplits && sun.categorySplits.length > 0 ? (
              <div className="space-y-2.5">
                {sun.categorySplits.map((cat, idx) => (
                  <div
                    key={cat.id || idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-50/80 dark:bg-zinc-800/50"
                  >
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {cat.name}
                    </span>
                    <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {formatNum(cat.allocatedHours, 2)} h
                    </span>
                  </div>
                ))}

                {/* Subtotals & Differences */}
                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 px-2">
                    <span>Total Allocated</span>
                    <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {formatNum(sun.totalAllocated, 2)} h
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold text-zinc-500 dark:text-zinc-400 px-2">
                    <span>Difference</span>
                    <span className="font-mono">
                      {formatNum(Math.abs(sun.difference ?? 0), 2)} h
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  {sunHours === 0 ? (
                    <div className="p-2 rounded-xl text-center text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                      No Sunday hours entered
                    </div>
                  ) : sun.isReconciled ? (
                    <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>✓ RECONCILED</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>⚠ VARIANCE: {formatNum(Math.abs(sun.difference ?? 0), 2)} h</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-zinc-400">
                No breakdown available
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMBINED TOTAL RECONCILIATION SUMMARY */}
      <div
        id="weekend-total-reconciliation-card"
        className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Original Timesheet
            </span>
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatNum(totalTimesheet, 2)} h
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Total Allocated
            </span>
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatNum(results.totalAllocatedHours, 2)} h
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Difference
            </span>
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatNum(Math.abs(results.hoursDifference), 2)} h
            </span>
          </div>
        </div>

        <div className="sm:self-center shrink-0">
          {totalTimesheet === 0 ? (
            <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
              Ready for Input
            </span>
          ) : results.isReconciled ? (
            <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>✓ RECONCILED</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>⚠ VARIANCE ({formatNum(Math.abs(results.hoursDifference), 2)} h)</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
