import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
  DaySplitResult,
  DayCategorySplitItem,
  PayrollCategoryItem,
} from '../../types';
import { formatNum, parseFormattedNumber } from '../../utils/calculator';
import { getAwardRuleById } from '../../utils/weekendRules';

interface WeekendSplitBreakdownProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

export const WeekendSplitBreakdown: React.FC<WeekendSplitBreakdownProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openExplainers, setOpenExplainers] = useState<Record<string, boolean>>({});

  const rule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule);

  const toggleExplainer = (key: string) => {
    setOpenExplainers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy helper for a day's allocation
  const handleCopyDay = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle manual category hours override for a specific day
  const handleCategoryHourChange = (
    dayKey: string,
    catId: string,
    val: string,
    currentSplits: DayCategorySplitItem[]
  ) => {
    const updatedCategories: PayrollCategoryItem[] = currentSplits.map((item) => {
      const isTarget = item.id === catId;
      const hoursVal = isTarget ? val : String(item.allocatedHours);
      return {
        id: item.id,
        name: item.name,
        hours: hoursVal,
        multiplier: item.multiplier,
        ratePercentage: item.ratePercentage,
        allocationType: 'manual',
      };
    });

    onChangeInput((prev) => {
      const configKey =
        dayKey === 'w1Saturday'
          ? 'w1SaturdayConfig'
          : dayKey === 'w1Sunday'
          ? 'w1SundayConfig'
          : dayKey === 'w2Saturday'
          ? 'w2SaturdayConfig'
          : 'w2SundayConfig';

      return {
        ...prev,
        [configKey]: {
          dayName: dayKey.includes('Saturday') ? 'Saturday' : 'Sunday',
          categories: updatedCategories,
        },
      };
    });
  };

  // Reset manual overrides for a day
  const handleResetDayOverride = (dayKey: string) => {
    onChangeInput((prev) => {
      const configKey =
        dayKey === 'w1Saturday'
          ? 'w1SaturdayConfig'
          : dayKey === 'w1Sunday'
          ? 'w1SundayConfig'
          : dayKey === 'w2Saturday'
          ? 'w2SaturdayConfig'
          : 'w2SundayConfig';

      return {
        ...prev,
        [configKey]: undefined,
      };
    });
  };

  const isDayManuallyOverridden = (dayKey: string): boolean => {
    if (dayKey === 'w1Saturday') {
      return Boolean(inputs.w1SaturdayConfig?.categories?.length || inputs.saturdayConfig?.categories?.length);
    }
    if (dayKey === 'w1Sunday') {
      return Boolean(inputs.w1SundayConfig?.categories?.length || inputs.sundayConfig?.categories?.length);
    }
    if (dayKey === 'w2Saturday') {
      return Boolean(inputs.w2SaturdayConfig?.categories?.length);
    }
    if (dayKey === 'w2Sunday') {
      return Boolean(inputs.w2SundayConfig?.categories?.length);
    }
    return false;
  };

  // Fortnight Totals
  const totalFortnightTimesheet = results.totalFortnightTimesheetHours ?? results.totalTimesheetHours ?? 0;
  const totalFortnightAllocated = results.totalFortnightAllocatedHours ?? results.totalAllocatedHours ?? 0;
  const fortnightDifference = Math.abs(results.fortnightHoursDifference ?? results.hoursDifference ?? 0);
  const isFortnightReconciled = results.isFortnightReconciled ?? results.isReconciled ?? true;

  const w1Sat = results.w1SaturdayBreakdown || results.saturdayBreakdown;
  const w1Sun = results.w1SundayBreakdown || results.sundayBreakdown;
  const w2Sat = results.w2SaturdayBreakdown;
  const w2Sun = results.w2SundayBreakdown;

  // Empty state check
  if (totalFortnightTimesheet === 0) {
    return (
      <div
        id="weekend-split-breakdown-empty-state"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs text-center space-y-2"
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Awaiting Fortnightly Timesheet Input
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Enter Saturday and/or Sunday timesheet hours for Week 1 and Week 2 above to calculate the deterministic category split and verify reconciliation.
        </p>
      </div>
    );
  }

  // Render Explainer Card for a Day
  const renderExplainer = (day: DaySplitResult) => {
    const basis = day.calculationBasis;
    return (
      <div className="mt-3 p-3.5 bg-orange-50/60 dark:bg-zinc-800/80 rounded-xl border border-orange-200/80 dark:border-zinc-700 text-xs space-y-2 animate-fadeIn">
        <div className="flex items-center gap-1.5 font-bold text-orange-950 dark:text-orange-300">
          <HelpCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span>Calculation Basis — {day.fullLabel || day.dayName}</span>
        </div>

        <div className="space-y-1 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] leading-relaxed">
          <p>
            <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Payroll Period: </span>
            {basis?.payrollPeriod || 'Fortnightly'} ({basis?.week || `Week ${day.weekNumber || 1}`})
          </p>
          <p>
            <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Employment Type: </span>
            {basis?.employmentType || rule.employeeType}
          </p>
          <p>
            <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Selected Award / Rule: </span>
            {basis?.selectedRule || rule.name}
          </p>
          <p>
            <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Original Timesheet Shift: </span>
            {formatNum(day.timesheetHours, 2)} h
          </p>
          {basis?.threshold !== undefined && basis.threshold !== null && (
            <p>
              <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Shift / Threshold Cap: </span>
              {formatNum(basis.threshold, 2)} h
            </p>
          )}

          <div className="pt-1.5 border-t border-orange-200/60 dark:border-zinc-700">
            <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
              Deterministic Allocation Formula:
            </span>
            {day.categorySplits?.map((c, i) => (
              <div key={i} className="pl-2">
                • {c.name}: {formatNum(c.allocatedHours, 2)} h
                {c.multiplier && c.multiplier !== 1 ? ` (@ ${c.multiplier}x rate)` : ''}
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-orange-200/60 dark:border-zinc-700 flex flex-wrap justify-between gap-2">
            <span>Calculated Total: {formatNum(day.totalAllocated, 2)} h</span>
            <span>Variance: {formatNum(Math.abs(day.difference ?? 0), 2)} h</span>
            <span
              className={
                day.isReconciled
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-red-700 dark:text-red-400 font-bold'
              }
            >
              {day.isReconciled ? '✓ Mathematically Reconciled' : '⚠ Variance detected'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render individual Day Card
  const renderDayCard = (day: DaySplitResult, dayKey: string) => {
    const isEdited = isDayManuallyOverridden(dayKey);
    const isOpen = Boolean(openExplainers[dayKey]);
    const hasHours = day.timesheetHours > 0;

    return (
      <div
        key={dayKey}
        id={`${dayKey}-breakdown-card`}
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          hasHours
            ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs'
            : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {day.fullLabel || `${day.weekLabel || ''} — ${day.dayName}`} — {formatNum(day.timesheetHours, 2)} h
              </h4>
              {isEdited && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded">
                  Edited
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Original Timesheet Input
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isEdited && (
              <button
                type="button"
                onClick={() => handleResetDayOverride(dayKey)}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reset to rule calculation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {hasHours && (
              <button
                type="button"
                onClick={() => {
                  const lines = day.categorySplits
                    ? day.categorySplits
                        .map((c) => `${c.name}: ${formatNum(c.allocatedHours, 2)} h`)
                        .join('\n')
                    : '';
                  handleCopyDay(
                    dayKey,
                    `${day.fullLabel || day.dayName} (${formatNum(day.timesheetHours, 2)} h):\n${lines}\nTotal: ${formatNum(day.totalAllocated, 2)} h`
                  );
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copy day split"
              >
                {copiedKey === dayKey ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Category Breakdown Table */}
        {day.categorySplits && day.categorySplits.length > 0 ? (
          <div className="space-y-2.5">
            <div className="space-y-2">
              {day.categorySplits.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="flex items-center justify-between gap-3 text-xs py-1.5 px-2.5 rounded-lg bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800/80"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex-1 truncate pr-1">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={String(cat.allocatedHours)}
                      onChange={(e) =>
                        handleCategoryHourChange(
                          dayKey,
                          cat.id,
                          e.target.value,
                          day.categorySplits || []
                        )
                      }
                      className="w-18 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-md font-mono font-black text-right text-zinc-900 dark:text-zinc-100 text-xs outline-hidden"
                      title="Click to manually edit category hours"
                    />
                    <span className="text-[11px] font-bold text-zinc-400">h</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotals & Differences */}
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 px-2">
                <span>Total Allocated</span>
                <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {formatNum(day.totalAllocated, 2)} h
                </span>
              </div>

              <div className="flex items-center justify-between font-bold text-zinc-500 dark:text-zinc-400 px-2">
                <span>Difference / Variance</span>
                <span
                  className={`font-mono font-bold ${
                    day.isReconciled ? 'text-zinc-600 dark:text-zinc-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {day.difference !== 0
                    ? day.difference > 0
                      ? `+${formatNum(day.difference, 2)}`
                      : formatNum(day.difference, 2)
                    : '0.00'}{' '}
                  h
                </span>
              </div>
            </div>

            {/* Dynamic Status Indicator */}
            <div className="pt-2">
              {!hasHours ? (
                <div className="p-2 rounded-xl text-center text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                  No hours entered
                </div>
              ) : day.isReconciled ? (
                <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>✓ RECONCILED</span>
                </div>
              ) : (
                <div className="p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>🔴 VARIANCE: {formatNum(Math.abs(day.difference ?? 0), 2)} h</span>
                </div>
              )}
            </div>

            {/* How was this split calculated? toggle */}
            {hasHours && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleExplainer(dayKey)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1 px-1 rounded transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    <span>How was this split calculated?</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isOpen && renderExplainer(day)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-zinc-400">
            No breakdown available
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="weekend-split-breakdown-section" className="space-y-5">
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
        <div>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Fortnightly Weekend Split Breakdown
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Separated by week to preserve shift integrity and avoid combining fortnights.
          </p>
        </div>
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
          Rule: {rule.name}
        </span>
      </div>

      {/* Week 1 Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-950 dark:text-orange-300">
            Week 1 Shifts
          </span>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {w1Sat && renderDayCard(w1Sat, 'w1Saturday')}
          {w1Sun && renderDayCard(w1Sun, 'w1Sunday')}
        </div>
      </div>

      {/* Week 2 Grid (rendered if Week 2 has inputs or active) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-950 dark:text-orange-300">
            Week 2 Shifts
          </span>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {w2Sat && renderDayCard(w2Sat, 'w2Saturday')}
          {w2Sun && renderDayCard(w2Sun, 'w2Sunday')}
        </div>
      </div>

      {/* COMBINED FORTNIGHT RECONCILIATION SUMMARY */}
      <div
        id="weekend-total-reconciliation-card"
        className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs"
      >
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Fortnight Timesheet
            </span>
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatNum(totalFortnightTimesheet, 2)} h
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Fortnight Allocated
            </span>
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatNum(totalFortnightAllocated, 2)} h
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Fortnight Variance
            </span>
            <span
              className={`text-sm font-black font-mono ${
                isFortnightReconciled ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatNum(fortnightDifference, 2)} h
            </span>
          </div>
        </div>

        <div className="sm:self-center shrink-0">
          {totalFortnightTimesheet === 0 ? (
            <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
              Ready for Input
            </span>
          ) : isFortnightReconciled ? (
            <span className="px-3.5 py-2 rounded-xl font-black text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>✓ FORTNIGHT RECONCILED</span>
            </span>
          ) : (
            <span className="px-3.5 py-2 rounded-xl font-black text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>🔴 VARIANCE ({formatNum(fortnightDifference, 2)} h)</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

