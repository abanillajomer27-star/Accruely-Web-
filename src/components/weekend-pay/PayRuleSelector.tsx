import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Settings2, Info } from 'lucide-react';
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

  const selectedRuleId = inputs.selectedRuleId || inputs.payRule || 'clerks-award';
  const currentRule = getAwardRuleById(selectedRuleId);

  const handleSelectRule = (ruleId: string) => {
    onChangeInput((prev) => ({
      ...prev,
      selectedRuleId: ruleId,
      payRule: ruleId,
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
              Applicable Award / Pay Rule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select the award rule to mathematically determine the overtime multiplier split.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Dropdown */}
      <div className="relative">
        <label
          htmlFor="pay-award-rule-dropdown"
          className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5"
        >
          Award Rule Preset
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
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-zinc-700 text-orange-800 dark:text-orange-200 rounded-md">
            {currentRule.badge}
          </span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {currentRule.description}
        </p>
      </div>
    </div>
  );
};
