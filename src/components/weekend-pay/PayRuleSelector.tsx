import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Settings2, Info, Check } from 'lucide-react';
import { WeekendPayInputs, WeekendPayResults } from '../../types';
import { AUSTRALIAN_AWARD_RULES, getAwardRuleById } from '../../utils/weekendRules';

interface PayRuleSelectorProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

export const PayRuleSelector: React.FC<PayRuleSelectorProps> = ({
  inputs,
  onChangeInput,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedRuleId = inputs.selectedRuleId || inputs.payRule || 'casual-loaded';
  const currentRule = getAwardRuleById(selectedRuleId);

  const handleSelectRule = (ruleId: string) => {
    onChangeInput((prev) => ({
      ...prev,
      selectedRuleId: ruleId,
      payRule: ruleId,
      // Clear manual custom overrides so rule defaults apply cleanly
      saturdayConfig: undefined,
      sundayConfig: undefined,
      saturdayCap: undefined,
      sundayCap: undefined,
    }));
  };

  const handleUpdateCap = (day: 'Saturday' | 'Sunday', val: string) => {
    onChangeInput((prev) => ({
      ...prev,
      ...(day === 'Saturday' ? { saturdayCap: val } : { sundayCap: val }),
      ...(currentRule.id.includes('casual') ? { casualShiftCap: val } : {}),
    }));
  };

  return (
    <div
      id="applicable-pay-rule-section"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Applicable Pay / Award Rule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select the employee's award rule to mathematically determine the weekend category split.
            </p>
          </div>
        </div>

        {currentRule.allowCustomThreshold && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Custom Threshold' : 'Adjust Threshold'}</span>
          </button>
        )}
      </div>

      {/* Single Simple Selection Area */}
      <div className="relative">
        <label
          htmlFor="pay-award-rule-dropdown"
          className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5"
        >
          Award / Pay Rule Preset
        </label>
        <div className="relative">
          <select
            id="pay-award-rule-dropdown"
            value={selectedRuleId}
            onChange={(e) => handleSelectRule(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-hidden transition-all cursor-pointer shadow-xs"
          >
            {AUSTRALIAN_AWARD_RULES.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.name} [{rule.badge}]
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Selected Rule Summary Banner */}
      <div className="p-3 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 text-xs space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>{currentRule.name}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-zinc-700 text-orange-800 dark:text-orange-200 rounded-md">
              {currentRule.calculationPeriod}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md">
              {currentRule.employeeType}
            </span>
          </div>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {currentRule.description}
        </p>
      </div>

      {/* Optional Custom Threshold Override Panel */}
      {showAdvanced && currentRule.allowCustomThreshold && (
        <div className="p-3.5 bg-orange-50/40 dark:bg-zinc-800/60 rounded-xl border border-orange-200/80 dark:border-zinc-700 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Custom Shift / Ordinary Cap Override
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Modify the ordinary threshold for this rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="custom-sat-cap-input"
                className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-1"
              >
                {currentRule.saturday.capLabel || 'Saturday Ordinary Cap (Hours)'}
              </label>
              <div className="relative">
                <input
                  id="custom-sat-cap-input"
                  type="text"
                  inputMode="decimal"
                  value={inputs.saturdayCap ?? String(currentRule.saturday.defaultCap ?? 4.14)}
                  onChange={(e) => handleUpdateCap('Saturday', e.target.value)}
                  placeholder="e.g. 4.14"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg text-xs font-bold text-zinc-900 dark:text-zinc-100 text-right pr-7 outline-hidden"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-sun-cap-input"
                className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-1"
              >
                {currentRule.sunday.capLabel || 'Sunday Ordinary Cap (Hours)'}
              </label>
              <div className="relative">
                <input
                  id="custom-sun-cap-input"
                  type="text"
                  inputMode="decimal"
                  value={inputs.sundayCap ?? String(currentRule.sunday.defaultCap ?? 4.14)}
                  onChange={(e) => handleUpdateCap('Sunday', e.target.value)}
                  placeholder="e.g. 4.14"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-orange-500 rounded-lg text-xs font-bold text-zinc-900 dark:text-zinc-100 text-right pr-7 outline-hidden"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                  h
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
