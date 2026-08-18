import React from 'react';
import { Play } from 'lucide-react';
import { WeekendPayInputs } from '../../types';

interface ScenarioPresetsProps {
  onChangeInput: (updater: (prev: WeekendPayInputs) => WeekendPayInputs) => void;
}

export const PRESET_SCENARIOS = [
  {
    id: 'scenario-1-fortnight-casual',
    name: 'Fortnightly Casual Shift',
    title: 'Full Fortnight Timesheet',
    subtitle: 'W1 Sat 4.98h, Sun 1.00h + W2 Sat 4.92h, Sun 1.00h (Casual Loaded)',
    badge: 'Fortnight Casual',
    apply: (prev: WeekendPayInputs): WeekendPayInputs => ({
      ...prev,
      mode: 'single',
      selectedRuleId: 'casual-loaded',
      payRule: 'casual-loaded',
      w1Saturday: '4.98',
      w1Sunday: '1.00',
      w2Saturday: '4.92',
      w2Sunday: '1.00',
      saturdayHours: '4.98',
      sundayHours: '1.00',
      totalTimesheetHours: '11.90',
      saturdayCap: '4.14',
      casualShiftCap: '4.14',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }),
  },
  {
    id: 'scenario-2-jordan-miller',
    name: 'Jordan Miller',
    title: 'Jordan Miller (4.98h Sat)',
    subtitle: 'W1 Sat 4.98h → 4.14h Casual (incl loading) + 0.84h Casual OT 1.5x',
    badge: 'Casual Shift Cap',
    apply: (prev: WeekendPayInputs): WeekendPayInputs => ({
      ...prev,
      mode: 'single',
      selectedRuleId: 'casual-loaded',
      payRule: 'casual-loaded',
      w1Saturday: '4.98',
      w1Sunday: '',
      w2Saturday: '',
      w2Sunday: '',
      saturdayHours: '4.98',
      sundayHours: '',
      totalTimesheetHours: '4.98',
      saturdayCap: '4.14',
      casualShiftCap: '4.14',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }),
  },
  {
    id: 'scenario-3-casey-morgan',
    name: 'Casey Morgan',
    title: 'Casey Morgan (4.92h Sat)',
    subtitle: 'W2 Sat 4.92h → 2.11h Ordinary Hours + 2.81h Overtime 1.5x',
    badge: 'Permanent Capacity',
    apply: (prev: WeekendPayInputs): WeekendPayInputs => ({
      ...prev,
      mode: 'single',
      selectedRuleId: 'fulltime-capacity',
      payRule: 'fulltime-capacity',
      w1Saturday: '',
      w1Sunday: '',
      w2Saturday: '4.92',
      w2Sunday: '',
      saturdayHours: '4.92',
      sundayHours: '',
      totalTimesheetHours: '4.92',
      saturdayCap: '2.11',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }),
  },
  {
    id: 'scenario-4-clerks-award',
    name: 'Clerks Modern Award',
    title: 'Clerks Award (4.50h Sat)',
    subtitle: 'W1 Sat 4.50h → 3.00h Overtime 1.5x + 1.50h Overtime 2.0x',
    badge: 'Clerks Modern Award',
    apply: (prev: WeekendPayInputs): WeekendPayInputs => ({
      ...prev,
      mode: 'single',
      selectedRuleId: 'clerks-award',
      payRule: 'clerks-award',
      w1Saturday: '4.50',
      w1Sunday: '',
      w2Saturday: '',
      w2Sunday: '',
      saturdayHours: '4.50',
      sundayHours: '',
      totalTimesheetHours: '4.50',
      saturdayCap: '3.00',
      saturdayConfig: undefined,
      sundayConfig: undefined,
      w1SaturdayConfig: undefined,
      w1SundayConfig: undefined,
      w2SaturdayConfig: undefined,
      w2SundayConfig: undefined,
    }),
  },
];

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({ onChangeInput }) => {
  return (
    <div
      id="test-scenarios-bar"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          Reconciliation Test Scenarios
        </h3>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Click any preset to test the deterministic mathematical split
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRESET_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onChangeInput(scenario.apply)}
            className="p-3 text-left rounded-xl bg-orange-50/40 hover:bg-orange-100/70 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700/80 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-orange-950 dark:text-orange-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {scenario.title}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {scenario.subtitle}
              </div>
            </div>
            <div className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 uppercase tracking-wider">
              <Play className="w-3 h-3 fill-current" />
              <span>Load Case</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
