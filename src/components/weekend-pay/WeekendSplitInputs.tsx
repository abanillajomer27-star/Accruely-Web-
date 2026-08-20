import React from 'react';
import {
  User,
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
  WeekendPayPeriod,
} from '../../types';
import { AUSTRALIAN_AWARD_RULES, getAwardRuleById } from '../../utils/weekendRules';

interface WeekendSplitInputsProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (
    updater: (prev: WeekendPayInputs) => WeekendPayInputs
  ) => void;
  onCalculate: () => void;
  isCalculating?: boolean;
}

const PAY_PERIOD_OPTIONS: WeekendPayPeriod[] = [
  'Weekly',
  'Fortnightly',
  'Bi-Weekly',
  'Monthly',
];

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

export const WeekendSplitInputs: React.FC<WeekendSplitInputsProps> = ({
  inputs,
  results,
  onChangeInput,
  onCalculate,
  isCalculating,
}) => {
  const employeeName = inputs.employeeName ?? 'John Smith';
  const payPeriod: WeekendPayPeriod = (inputs.payPeriod as WeekendPayPeriod) || 'Fortnightly';
  const selectedRuleId = inputs.selectedRuleId || inputs.payRule || 'clerks-award';
  const currentRule = getAwardRuleById(selectedRuleId);

  const satHours = inputs.saturdayHours !== undefined && inputs.saturdayHours !== null
    ? String(inputs.saturdayHours)
    : (inputs.w1Saturday !== undefined && inputs.w1Saturday !== null ? String(inputs.w1Saturday) : '3.84');

  const sunHours = inputs.sundayHours !== undefined && inputs.sundayHours !== null
    ? String(inputs.sundayHours)
    : (inputs.w1Sunday !== undefined && inputs.w1Sunday !== null ? String(inputs.w1Sunday) : '1.00');

  const ordinaryRate = inputs.ordinaryHourlyRate !== undefined && inputs.ordinaryHourlyRate !== null
    ? String(inputs.ordinaryHourlyRate)
    : '';

  const handleNameChange = (val: string) => {
    onChangeInput((prev) => ({ ...prev, employeeName: val }));
  };

  const handlePayPeriodChange = (period: WeekendPayPeriod) => {
    onChangeInput((prev) => ({ ...prev, payPeriod: period }));
  };

  const handleRuleChange = (ruleId: string) => {
    onChangeInput((prev) => ({
      ...prev,
      selectedRuleId: ruleId,
      payRule: ruleId,
    }));
  };

  const handleSatChange = (val: string) => {
    const cleaned = cleanDecimalInput(val);
    onChangeInput((prev) => ({
      ...prev,
      saturdayHours: cleaned,
      w1Saturday: cleaned,
    }));
  };

  const handleSunChange = (val: string) => {
    const cleaned = cleanDecimalInput(val);
    onChangeInput((prev) => ({
      ...prev,
      sundayHours: cleaned,
      w1Sunday: cleaned,
    }));
  };

  const handleRateChange = (val: string) => {
    const cleaned = cleanDecimalInput(val);
    onChangeInput((prev) => ({
      ...prev,
      ordinaryHourlyRate: cleaned,
      enablePayCalculation: Boolean(cleaned && Number(cleaned) > 0),
    }));
  };

  const handlePasteHours = (
    e: React.ClipboardEvent<HTMLInputElement>,
    field: 'saturdayHours' | 'sundayHours'
  ) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData) {
      e.preventDefault();
      const cleaned = cleanDecimalInput(pasteData);
      if (field === 'saturdayHours') {
        handleSatChange(cleaned);
      } else {
        handleSunChange(cleaned);
      }
    }
  };

  const setExamplePreset = (sat: string, sun: string, ruleId: string) => {
    onChangeInput((prev) => ({
      ...prev,
      saturdayHours: sat,
      w1Saturday: sat,
      sundayHours: sun,
      w1Sunday: sun,
      selectedRuleId: ruleId,
      payRule: ruleId,
    }));
  };

  return (
    <div
      id="weekend-split-ot-inputs-card"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* 1. EMPLOYEE NAME */}
      <div>
        <label
          htmlFor="weekend-ot-employee-name"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
        >
          <User className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span>1. Employee Name</span>
        </label>
        <input
          id="weekend-ot-employee-name"
          type="text"
          value={employeeName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. John Smith"
          className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-hidden transition-all shadow-2xs"
        />
      </div>

      {/* 2. AWARD RULE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="weekend-ot-award-rule-select"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>2. Award Rule</span>
          </label>
          <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-800/50">
            {currentRule.badge}
          </span>
        </div>

        <div className="relative">
          <select
            id="weekend-ot-award-rule-select"
            value={selectedRuleId}
            onChange={(e) => handleRuleChange(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-hidden transition-all cursor-pointer shadow-2xs"
          >
            {AUSTRALIAN_AWARD_RULES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — [{r.badge}]
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          {currentRule.description}
        </p>

        {/* Custom Award Configuration if 'custom' selected */}
        {selectedRuleId === 'custom' && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Sat First Tier Threshold (hrs)
              </label>
              <input
                type="text"
                value={inputs.customSatThreshold ?? '3.0'}
                onChange={(e) =>
                  onChangeInput((p) => ({ ...p, customSatThreshold: cleanDecimalInput(e.target.value) }))
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Sat 1st Tier Rate (e.g. 1.5)
              </label>
              <input
                type="text"
                value={inputs.customSatFirstMultiplier ?? '1.5'}
                onChange={(e) =>
                  onChangeInput((p) => ({ ...p, customSatFirstMultiplier: cleanDecimalInput(e.target.value) }))
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Sat 2nd Tier Rate (e.g. 2.0)
              </label>
              <input
                type="text"
                value={inputs.customSatSecondMultiplier ?? '2.0'}
                onChange={(e) =>
                  onChangeInput((p) => ({ ...p, customSatSecondMultiplier: cleanDecimalInput(e.target.value) }))
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Sun Rate Multiplier (e.g. 2.0)
              </label>
              <input
                type="text"
                value={inputs.customSunMultiplier ?? '2.0'}
                onChange={(e) =>
                  onChangeInput((p) => ({ ...p, customSunMultiplier: cleanDecimalInput(e.target.value) }))
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. PAY PERIOD */}
      <div>
        <label
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
        >
          <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span>3. Pay Period</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PAY_PERIOD_OPTIONS.map((period) => {
            const isSelected = payPeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => handlePayPeriodChange(period)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-orange-600 border-orange-600 text-white shadow-2xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 & 5. SATURDAY & SUNDAY OT HOURS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saturday OT Hours */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="weekend-ot-saturday-hours"
              className="flex items-center gap-1.5 text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase"
            >
              <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>4. Saturday OT</span>
            </label>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Hours (decimal)
            </span>
          </div>

          <div className="relative">
            <input
              id="weekend-ot-saturday-hours"
              type="text"
              inputMode="decimal"
              value={satHours}
              onChange={(e) => handleSatChange(e.target.value)}
              onPaste={(e) => handlePasteHours(e, 'saturdayHours')}
              placeholder="e.g. 3.84"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-base font-mono font-black text-zinc-900 dark:text-zinc-100 outline-hidden transition-all shadow-2xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
              hrs
            </span>
          </div>

          {/* Quick preset pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {['3.84', '4.98', '7.27', '8.00'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSatChange(preset)}
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
              >
                {preset}h
              </button>
            ))}
          </div>
        </div>

        {/* Sunday OT Hours */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="weekend-ot-sunday-hours"
              className="flex items-center gap-1.5 text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase"
            >
              <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>5. Sunday OT</span>
            </label>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Hours (decimal)
            </span>
          </div>

          <div className="relative">
            <input
              id="weekend-ot-sunday-hours"
              type="text"
              inputMode="decimal"
              value={sunHours}
              onChange={(e) => handleSunChange(e.target.value)}
              onPaste={(e) => handlePasteHours(e, 'sundayHours')}
              placeholder="e.g. 1.00"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-base font-mono font-black text-zinc-900 dark:text-zinc-100 outline-hidden transition-all shadow-2xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
              hrs
            </span>
          </div>

          {/* Quick preset pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {['0.00', '1.00', '2.50', '4.00'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSunChange(preset)}
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
              >
                {preset}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Ordinary Base Rate */}
      <div>
        <label
          htmlFor="weekend-ot-ordinary-rate"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
        >
          <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ordinary Hourly Rate (Optional $/hr)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
            $
          </span>
          <input
            id="weekend-ot-ordinary-rate"
            type="text"
            inputMode="decimal"
            value={ordinaryRate}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="0.00 (optional to calculate gross pay)"
            className="w-full pl-7 pr-12 py-2 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 outline-hidden transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-zinc-400 pointer-events-none">
            AUD/hr
          </span>
        </div>
      </div>

      {/* 6. SPLIT OT ACTION BUTTON */}
      <div className="pt-2">
        <button
          id="split-weekend-ot-button"
          type="button"
          onClick={onCalculate}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white text-base font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer tracking-wide uppercase"
        >
          <Zap className={`w-5 h-5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>6. SPLIT OT</span>
        </button>
      </div>

      {/* Quick Example Templates */}
      <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span>Quick Examples:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExamplePreset('3.84', '1.00', 'clerks-award')}
            className="text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer"
          >
            Clerks (3.84h Sat + 1h Sun)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setExamplePreset('7.27', '0.00', 'retail-award')}
            className="text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer"
          >
            Retail (7.27h Sat)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setExamplePreset('4.98', '2.00', 'construction-award')}
            className="text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer"
          >
            Building (4.98h Sat)
          </button>
        </div>
      </div>
    </div>
  );
};
