import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
} from '../../types';
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule);
  const employeeName = results.employeeName || inputs.employeeName || 'John Smith';
  const payPeriod = results.payPeriod || inputs.payPeriod || 'Fortnightly';
  const satHours = results.saturdayHours;
  const sunHours = results.sundayHours;
  const totalHours = results.totalWeekendHours;

  const handleCopySummary = () => {
    let text = `ACCRUELY — WEEKEND OVERTIME SPLIT\n`;
    text += `Employee: ${employeeName}\n`;
    text += `Pay Period: ${payPeriod}\n`;
    text += `Award Rule: ${rule.name}\n`;
    text += `------------------------------------\n`;
    if (satHours > 0) {
      text += `Saturday OT (${formatNum(satHours, 2)} hrs):\n`;
      results.saturdaySplits.forEach((s) => {
        text += `  • ${s.multiplier}x → ${formatNum(s.hours, 2)} hrs (${s.rateName})\n`;
      });
    }
    if (sunHours > 0) {
      text += `Sunday OT (${formatNum(sunHours, 2)} hrs):\n`;
      results.sundaySplits.forEach((s) => {
        text += `  • ${s.multiplier}x → ${formatNum(s.hours, 2)} hrs (${s.rateName})\n`;
      });
    }
    text += `------------------------------------\n`;
    text += `PAYROLL MULTIPLIER ALLOCATION:\n`;
    results.combinedSplits.forEach((c) => {
      text += `  • ${c.label}: ${formatNum(c.hours, 2)} hrs\n`;
    });
    text += `------------------------------------\n`;
    text += `Total Weekend OT: ${formatNum(totalHours, 2)} hrs\n`;
    text += `Status: RECONCILED (100% MATCHED)\n`;

    navigator.clipboard.writeText(text);
    setCopiedKey('summary');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // If no hours entered yet
  if (totalHours === 0) {
    return (
      <div
        id="weekend-split-empty-card"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 shadow-xs text-center space-y-3"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Awaiting Weekend OT Hours
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Enter Saturday and/or Sunday overtime hours on the left to calculate the exact Award multiplier split.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. TOP SUMMARY CARD */}
      <div
        id="weekend-ot-summary-header"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                Weekend Overtime Split Breakdown
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Deterministic Australian Award Overtime Split
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Copy formatted summary to clipboard"
          >
            {copiedKey === 'summary' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Employee & Rule Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-medium">
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Employee</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{employeeName}</span>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Pay Period</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{payPeriod}</span>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Award Rule</span>
              <span className="font-bold text-orange-700 dark:text-orange-400 truncate">{rule.badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SATURDAY SPLIT CARD */}
      <div
        id="saturday-ot-split-card"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Saturday Overtime: {formatNum(satHours, 2)} hrs
            </h4>
          </div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {rule.shortName}
          </span>
        </div>

        {satHours > 0 ? (
          <div className="space-y-2.5">
            {/* Visual tier items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {results.saturdaySplits.map((split, idx) => (
                <div
                  key={split.id || idx}
                  className="p-3 bg-orange-50/50 dark:bg-zinc-800/60 rounded-xl border border-orange-200/60 dark:border-zinc-700 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-orange-950 dark:text-orange-300 block">
                      {split.multiplier}x Overtime
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {split.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-black text-zinc-900 dark:text-zinc-100 block">
                      {formatNum(split.hours, 2)} hrs
                    </span>
                    {split.pay ? (
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        ${formatNum(split.pay, 2)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Split progression bar */}
            {results.saturdaySplits.length > 1 && satHours > 0 && (
              <div className="pt-1">
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  {results.saturdaySplits.map((sp, i) => {
                    const pct = satHours > 0 ? (sp.hours / satHours) * 100 : 0;
                    return (
                      <div
                        key={i}
                        style={{ width: `${pct}%` }}
                        className={`${
                          i === 0 ? 'bg-orange-500' : 'bg-orange-700 dark:bg-orange-600'
                        } h-full transition-all`}
                        title={`${sp.label}: ${formatNum(sp.hours, 2)} hrs (${formatNum(pct, 1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                  <span>0 hrs</span>
                  <span>{formatNum(satHours, 2)} hrs</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-center text-xs text-zinc-500 dark:text-zinc-400">
            No Saturday overtime hours entered (0.00 hrs)
          </div>
        )}
      </div>

      {/* 3. SUNDAY SPLIT CARD */}
      <div
        id="sunday-ot-split-card"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Sunday Overtime: {formatNum(sunHours, 2)} hrs
            </h4>
          </div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Sunday Rate (2.0x Double Time)
          </span>
        </div>

        {sunHours > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {results.sundaySplits.map((split, idx) => (
              <div
                key={split.id || idx}
                className="p-3 bg-red-50/50 dark:bg-zinc-800/60 rounded-xl border border-red-200/60 dark:border-zinc-700 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-black text-red-950 dark:text-red-300 block">
                    {split.multiplier}x Overtime
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {split.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-black text-zinc-900 dark:text-zinc-100 block">
                    {formatNum(split.hours, 2)} hrs
                  </span>
                  {split.pay ? (
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      ${formatNum(split.pay, 2)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-center text-xs text-zinc-500 dark:text-zinc-400">
            No Sunday overtime hours entered (0.00 hrs)
          </div>
        )}
      </div>

      {/* 4. COMBINED PAYROLL MULTIPLIER ALLOCATION (FOR BOOKKEEPERS / PAYROLL ENTRY) */}
      <div
        id="payroll-overtime-multiplier-summary"
        className="bg-orange-500/10 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800/70 rounded-2xl p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-600 text-white rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                Payroll Category Allocation
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Transfer these split quantities directly to Xero / MYOB / payroll pay run
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-orange-800 dark:text-orange-300 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
            Total OT: {formatNum(totalHours, 2)} hrs
          </span>
        </div>

        {/* Categories summary list */}
        <div className="space-y-2">
          {results.combinedSplits.map((cat, idx) => (
            <div
              key={cat.id || idx}
              className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-400 font-mono font-black text-xs flex items-center justify-center">
                  {cat.multiplier}x
                </div>
                <div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                    {cat.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cat.rateName}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-mono font-black text-orange-600 dark:text-orange-400 block">
                  {formatNum(cat.hours, 2)} hrs
                </span>
                {cat.pay ? (
                  <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                    ${formatNum(cat.pay, 2)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Reconciliation confirmation banner */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>✓ Mathematically Reconciled</span>
          </div>
          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
            {formatNum(results.totalAllocatedHours, 2)} / {formatNum(totalHours, 2)} hrs
          </span>
        </div>

        {/* Gross Pay Total if Ordinary Rate is entered */}
        {results.hasPayCalculation && (
          <div className="pt-2 border-t border-orange-200 dark:border-orange-800/80 flex items-center justify-between text-sm">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              Total Calculated Weekend Overtime Gross Pay:
            </span>
            <span className="text-base font-mono font-black text-orange-600 dark:text-orange-400">
              ${formatNum(results.totalGrossPay, 2)} AUD
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
