import React, { useState } from 'react';
import {
  Pencil,
  Clock,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Split,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Printer,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
  EmployeeType,
  DayWorked,
  WorkType,
  RateTreatment,
  SplitTierConfig,
} from '../types';
import {
  formatNum,
  formatDecimalToHoursMinutes,
  calculateShiftDuration,
  generateWeekendPayStatementText,
} from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';

interface WeekendPayCalculatorViewProps {
  inputs: WeekendPayInputs;
  results: WeekendPayResults;
  onChangeInput: (
    updater: (prev: WeekendPayInputs) => WeekendPayInputs
  ) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  fieldKey: string | null;
  value: string | number;
  type: 'text' | 'number';
}

const EMPLOYEE_TYPES: EmployeeType[] = [
  'Full-time',
  'Part-time',
  'Casual',
  'Other / Custom',
];

const DAYS_WORKED: DayWorked[] = ['Saturday', 'Sunday'];

const WORK_TYPES: WorkType[] = [
  'Ordinary Weekend Hours',
  'Overtime',
  'Custom / Split Rate',
];

const RATE_TREATMENTS: RateTreatment[] = [
  'Use one applicable rate',
  'Use the higher applicable rate',
  'Custom rule',
];

const PRESET_TIER_STRUCTURES = [
  {
    id: 'preset-2h-150-200',
    name: 'First 2 hrs @ 150%, then 200%',
    description: 'Common Saturday / Overtime structure (e.g. 2h @ 1.50×, remaining @ 2.00×)',
    tiers: [
      { id: 't1', name: 'First 2.00 hours', capHours: 2.0, ratePercentage: 150 },
      { id: 't2', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
    ],
  },
  {
    id: 'preset-3h-150-200',
    name: 'First 3 hrs @ 150%, then 200%',
    description: '3-Hour threshold structure (e.g. 3h @ 1.50×, remaining @ 2.00×)',
    tiers: [
      { id: 't1', name: 'First 3.00 hours', capHours: 3.0, ratePercentage: 150 },
      { id: 't2', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
    ],
  },
  {
    id: 'preset-all-150',
    name: 'All hours @ 150%',
    description: 'Flat 150% penalty rate across all shift hours (1.50×)',
    tiers: [
      { id: 't1', name: 'All shift hours', capHours: null, ratePercentage: 150 },
    ],
  },
  {
    id: 'preset-all-200',
    name: 'All hours @ 200%',
    description: 'Flat double-time penalty across all shift hours (2.00× / Sunday common)',
    tiers: [
      { id: 't1', name: 'All shift hours', capHours: null, ratePercentage: 200 },
    ],
  },
  {
    id: 'preset-4tier',
    name: '4-Tier Progressive (125% → 150% → 175% → 200%)',
    description: 'Multi-threshold agreement: 2h @ 125%, 3h @ 150%, 4h @ 175%, remaining @ 200%',
    tiers: [
      { id: 't1', name: 'First 2.00 hours', capHours: 2.0, ratePercentage: 125 },
      { id: 't2', name: 'Next 3.00 hours', capHours: 3.0, ratePercentage: 150 },
      { id: 't3', name: 'Next 4.00 hours', capHours: 4.0, ratePercentage: 175 },
      { id: 't4', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
    ],
  },
];

const COMMON_TIMESHEET_HOURS = [
  { label: '7.60 hrs', hours: 7.6, human: '7h 36m' },
  { label: '15.20 hrs', hours: 15.2, human: '15h 12m' },
  { label: '10.50 hrs', hours: 10.5, human: '10h 30m' },
  { label: '2.75 hrs', hours: 2.75, human: '2h 45m' },
  { label: '6.00 hrs', hours: 6.0, human: '6h 0m' },
  { label: '8.00 hrs', hours: 8.0, human: '8h 0m' },
];

export const WeekendPayCalculatorView: React.FC<WeekendPayCalculatorViewProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    fieldKey: null,
    value: '',
    type: 'number',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [isShiftSectionOpen, setIsShiftSectionOpen] = useState(Boolean(inputs.enableShiftTimes));
  const [isFormulasExpanded, setIsFormulasExpanded] = useState(true);

  // Active tiers with safe fallback
  const tiers =
    inputs.tiers && inputs.tiers.length > 0
      ? inputs.tiers
      : [
          { id: 't1', name: 'First 2.00 hours', capHours: 2.0, ratePercentage: 150 },
          { id: 't2', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
        ];

  const openEditModal = (
    title: string,
    fieldKey: string,
    currentValue: string | number,
    type: 'text' | 'number' = 'number'
  ) => {
    setModal({
      isOpen: true,
      title,
      fieldKey,
      value: currentValue,
      type,
    });
  };

  const handleSaveModal = (newValue: string | number) => {
    if (!modal.fieldKey) return;
    const key = modal.fieldKey;

    onChangeInput((prev) => {
      if (key === 'employeeName') {
        return { ...prev, employeeName: String(newValue) };
      }
      if (key === 'awardReference') {
        return { ...prev, awardReference: String(newValue) };
      }

      // Handle Tier name edit
      if (key.startsWith('tier-name-')) {
        const idx = parseInt(key.replace('tier-name-', ''), 10);
        const currentTiers = [...(prev.tiers || tiers)];
        if (currentTiers[idx]) {
          currentTiers[idx] = { ...currentTiers[idx], name: String(newValue) };
        }
        return { ...prev, tiers: currentTiers };
      }

      // Handle Tier hour cap edit
      if (key.startsWith('tier-cap-')) {
        const idx = parseInt(key.replace('tier-cap-', ''), 10);
        const capVal = Math.max(0.01, Number(newValue) || 0);
        const currentTiers = [...(prev.tiers || tiers)];
        if (currentTiers[idx]) {
          currentTiers[idx] = { ...currentTiers[idx], capHours: capVal };
        }
        return { ...prev, tiers: currentTiers };
      }

      // Handle Tier rate percentage edit
      if (key.startsWith('tier-rate-')) {
        const idx = parseInt(key.replace('tier-rate-', ''), 10);
        const rateVal = Math.max(0, Number(newValue) || 0);
        const currentTiers = [...(prev.tiers || tiers)];
        if (currentTiers[idx]) {
          currentTiers[idx] = { ...currentTiers[idx], ratePercentage: rateVal };
        }
        return { ...prev, tiers: currentTiers };
      }

      const numVal = Math.max(0, Number(newValue) || 0);
      return { ...prev, [key]: numVal };
    });

    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleApplyPreset = (presetTiers: SplitTierConfig[]) => {
    onChangeInput((prev) => ({
      ...prev,
      tiers: JSON.parse(JSON.stringify(presetTiers)),
    }));
  };

  const handleAddTier = () => {
    onChangeInput((prev) => {
      const current = prev.tiers && prev.tiers.length > 0 ? [...prev.tiers] : [...tiers];
      // Convert the last tier to a capped tier if it was uncapped
      if (current.length > 0) {
        const lastIdx = current.length - 1;
        if (current[lastIdx].capHours === null) {
          current[lastIdx] = {
            ...current[lastIdx],
            name: `Tier ${lastIdx + 1} (First 3.00 hrs)`,
            capHours: 3.0,
          };
        }
      }
      // Add new uncapped remaining tier
      current.push({
        id: `tier-${Date.now()}`,
        name: 'Remaining hours',
        capHours: null,
        ratePercentage: 200,
      });
      return { ...prev, tiers: current };
    });
  };

  const handleRemoveTier = (index: number) => {
    onChangeInput((prev) => {
      const current = prev.tiers && prev.tiers.length > 0 ? [...prev.tiers] : [...tiers];
      if (current.length <= 1) return prev;
      current.splice(index, 1);
      // Ensure the last tier is uncapped (remaining hours)
      if (current.length > 0) {
        current[current.length - 1] = {
          ...current[current.length - 1],
          name: current[current.length - 1].name || 'Remaining hours',
          capHours: null,
        };
      }
      return { ...prev, tiers: current };
    });
  };

  const handleResetDefaults = () => {
    onChangeInput((prev) => ({
      ...prev,
      employeeName: 'John Smith',
      employeeType: 'Full-time',
      dayWorked: 'Saturday',
      workType: 'Overtime',
      rateTreatment: 'Use one applicable rate',
      awardReference: '',
      ordinaryHourlyRate: 30.0,
      totalHoursWorked: 7.6,
      tiers: [
        { id: 't1', name: 'First 2.00 hours', capHours: 2.0, ratePercentage: 150 },
        { id: 't2', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
      ],
      applyMinimumPayment: false,
      minimumHours: 3.0,
      enableShiftTimes: false,
      shiftStartTime: '08:00',
      shiftEndTime: '16:06',
      unpaidBreakMinutes: 30,
    }));
  };

  // Shift duration helper
  const shiftDuration = calculateShiftDuration(
    inputs.shiftStartTime,
    inputs.shiftEndTime,
    inputs.unpaidBreakMinutes || 0
  );

  const handleApplyShiftHoursToTimesheet = () => {
    if (shiftDuration !== null && shiftDuration > 0) {
      onChangeInput((prev) => ({
        ...prev,
        totalHoursWorked: shiftDuration,
      }));
    }
  };

  const statementText = generateWeekendPayStatementText(inputs, results);

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statementText);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* 1. TITLE & QUICK ACTIONS HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Weekend Pay & Penalty Rate Calculator
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 rounded-md">
                  Automatic Hour Splitting
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Automatically splits timesheet hours across configurable award penalty tiers and reconciles total hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
              title="Reset to default calculation settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STEP 1: SHIFT & INDUSTRIAL INSTRUMENT CONTEXT */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Step 1: Shift & Classification Context
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Australian Industrial Context
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Day Selection Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Day Worked
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Select Saturday or Sunday
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:w-72 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
              {DAYS_WORKED.map((day) => {
                const active = inputs.dayWorked === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onChangeInput((prev) => ({ ...prev, dayWorked: day }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      active
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Type Selection Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Work Classification
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Ordinary weekend work vs Overtime vs Custom Split
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:w-96 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
              {WORK_TYPES.map((type) => {
                const active = inputs.workType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeInput((prev) => ({ ...prev, workType: type }))}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {type === 'Ordinary Weekend Hours'
                      ? 'Ordinary Weekend'
                      : type === 'Custom / Split Rate'
                      ? 'Custom Split'
                      : 'Overtime'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate Treatment / Overlapping Rule Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Rate Interaction / Treatment
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                How overlapping penalty/overtime rates are applied
              </span>
            </div>
            <div className="relative sm:w-72">
              <select
                value={inputs.rateTreatment || 'Use one applicable rate'}
                onChange={(e) =>
                  onChangeInput((prev) => ({
                    ...prev,
                    rateTreatment: e.target.value as RateTreatment,
                  }))
                }
                className="w-full appearance-none px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-9"
              >
                {RATE_TREATMENTS.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Employee Type & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Employee Type
              </label>
              <div className="relative">
                <select
                  value={inputs.employeeType}
                  onChange={(e) =>
                    onChangeInput((prev) => ({
                      ...prev,
                      employeeType: e.target.value as EmployeeType,
                    }))
                  }
                  className="w-full appearance-none px-3 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-8"
                >
                  {EMPLOYEE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                Selection is for payroll context. Casual rates may incorporate casual loading depending on the award.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Employee Name (Optional)
              </label>
              <button
                type="button"
                onClick={() =>
                  openEditModal(
                    'Employee Name',
                    'employeeName',
                    inputs.employeeName || '',
                    'text'
                  )
                }
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-all cursor-pointer text-left"
              >
                <span className="truncate">{inputs.employeeName || 'Tap to enter employee name'}</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Applicable Award / Agreement Reference (Optional) */}
          <div className="pt-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Applicable Award / Agreement (Optional Reference)
            </label>
            <button
              type="button"
              onClick={() =>
                openEditModal(
                  'Applicable Modern Award or Agreement',
                  'awardReference',
                  inputs.awardReference || '',
                  'text'
                )
              }
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-all cursor-pointer text-left"
            >
              <span className="truncate text-zinc-600 dark:text-zinc-300">
                {inputs.awardReference || 'e.g. Nurses Award 2020, Fast Food Award 2020, Enterprise Agreement, Custom'}
              </span>
              <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Payroll Contextual Guidance Note */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl flex items-start gap-2 text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p>
              Weekend penalties and overtime may interact differently depending on the applicable modern award or agreement. Confirm the applicable rule and rate hierarchy before finalizing payroll.
            </p>
          </div>
        </div>
      </div>

      {/* 3. STEP 2: CORE RATES & TOTAL TIMESHEET HOURS (THE MAIN SPLIT ENGINE) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Step 2: Ordinary Rate & Timesheet Hours
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Paste & Edit Supported
          </span>
        </div>

        <div className="space-y-4">
          {/* Ordinary Hourly Rate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <div>
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Ordinary Hourly Rate ($/hr)
              </label>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                Base ordinary rate before penalty or overtime multipliers
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                openEditModal(
                  'Ordinary Hourly Rate ($/hr)',
                  'ordinaryHourlyRate',
                  inputs.ordinaryHourlyRate,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-orange-300 hover:border-orange-500 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-extrabold text-base transition-all cursor-pointer sm:w-56 shadow-xs"
            >
              <span>${formatNum(inputs.ordinaryHourlyRate, 2)} / hr</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Total Hours Worked (Decimal Hours with hh:mm conversion) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-orange-50/70 dark:bg-zinc-800/80 rounded-xl border border-orange-200 dark:border-zinc-700">
            <div>
              <label className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Split className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Total Timesheet Hours Worked
              </label>
              <span className="block text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Enter total weekend hours. Accruely will automatically distribute these hours across your rate tiers.
              </span>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                type="button"
                onClick={() =>
                  openEditModal(
                    'Total Timesheet Hours Worked',
                    'totalHoursWorked',
                    inputs.totalHoursWorked,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border-2 border-orange-500 hover:border-orange-600 rounded-xl text-orange-950 dark:text-orange-300 font-black text-lg transition-all cursor-pointer sm:w-56 shadow-sm"
              >
                <span>{formatNum(inputs.totalHoursWorked, 2)} hrs</span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
              <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400">
                = {formatDecimalToHoursMinutes(inputs.totalHoursWorked)} (hours & minutes)
              </span>
            </div>
          </div>

          {/* Quick Timesheet Hour Chips (Common Australian Timesheet values) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Quick Select / Test Hours (Decimal → Time):
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Decimal 7.60 = 7h 36m
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
              {COMMON_TIMESHEET_HOURS.map((chip) => {
                const active = Math.abs(inputs.totalHoursWorked - chip.hours) < 0.001;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => onChangeInput((prev) => ({ ...prev, totalHoursWorked: chip.hours }))}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 font-medium'
                    }`}
                  >
                    <div className="text-xs">{chip.label}</div>
                    <div className={`text-[10px] ${active ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      {chip.human}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. STEP 3: CONFIGURABLE RATE TIERS & AUTOMATIC SPLITTING */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Step 3: Rate Tier Structure ({tiers.length} Active Tiers)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Customizable Thresholds & Rates
          </span>
        </div>

        <div className="space-y-4">
          {/* Preset Templates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Rate Structure Templates
              </label>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Click to load structure (freely editable)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_TIER_STRUCTURES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.tiers)}
                  className="p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-zinc-50 hover:bg-orange-50/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 group"
                >
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tier List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Tiers & Automatic Hour Allocation
              </label>
              <button
                type="button"
                onClick={handleAddTier}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer border border-orange-200 dark:border-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {tiers.map((tier, idx) => {
                const isLast = idx === tiers.length - 1;
                const tierRes = results.tierResults[idx];
                const calculatedAllocated = tierRes?.allocatedHours ?? 0;
                const calculatedPay = tierRes?.tierPay ?? 0;
                const calculatedRate = tierRes?.tierHourlyRate ?? (inputs.ordinaryHourlyRate * (tier.ratePercentage / 100));

                return (
                  <div
                    key={tier.id || idx}
                    className="p-3.5 bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/90 dark:border-zinc-700/80 rounded-xl space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {tier.name || (isLast ? 'Remaining Hours' : `First ${formatNum(tier.capHours, 2)} Hours`)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  `Tier ${idx + 1} Description`,
                                  `tier-name-${idx}`,
                                  tier.name || (isLast ? 'Remaining hours' : `First ${formatNum(tier.capHours, 2)} hours`),
                                  'text'
                                )
                              }
                              className="text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                              title="Edit tier label"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Effective Rate: <strong className="text-zinc-800 dark:text-zinc-200">${formatNum(calculatedRate, 2)}/hr</strong> ({tier.ratePercentage}% / {(tier.ratePercentage / 100).toFixed(2)}×)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                        {/* Hour Cap button (if not last) */}
                        {!isLast ? (
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                `Tier ${idx + 1} Hour Threshold`,
                                `tier-cap-${idx}`,
                                tier.capHours || 2.0,
                                'number'
                              )
                            }
                            className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 hover:border-orange-400 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Cap: {formatNum(tier.capHours, 2)} hrs</span>
                            <Pencil className="w-3 h-3 text-orange-600" />
                          </button>
                        ) : (
                          <span className="px-2.5 py-1.5 bg-zinc-200/70 dark:bg-zinc-700/60 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                            Remaining / Uncapped
                          </span>
                        )}

                        {/* Rate Percentage button */}
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              `Tier ${idx + 1} Rate Percentage (%)`,
                              `tier-rate-${idx}`,
                              tier.ratePercentage,
                              'number'
                            )
                          }
                          className="px-2.5 py-1.5 bg-orange-50 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-xs font-bold text-orange-950 dark:text-orange-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{tier.ratePercentage}%</span>
                          <Pencil className="w-3 h-3 text-orange-600" />
                        </button>

                        {/* Delete button (for intermediate tiers) */}
                        {tiers.length > 1 && !isLast && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Tier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tier Allocation Bar & Subtotal Calculation */}
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 dark:text-zinc-400">Allocated:</span>
                        <strong className="text-orange-600 dark:text-orange-400 font-mono text-sm">
                          {formatNum(calculatedAllocated, 2)} hrs
                        </strong>
                        <span className="text-[11px] text-zinc-400">
                          ({formatDecimalToHoursMinutes(calculatedAllocated)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                          ${formatNum(calculatedRate, 2)}/hr × {formatNum(calculatedAllocated, 2)} hrs =
                        </span>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                          ${formatNum(calculatedPay, 2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. STEP 4: MINIMUM PAYMENT / ENGAGEMENT (OPTIONAL) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inputs.applyMinimumPayment}
              onChange={(e) =>
                onChangeInput((prev) => ({
                  ...prev,
                  applyMinimumPayment: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-zinc-300 cursor-pointer"
            />
            <div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Apply Minimum Payment / Engagement Rule (Optional)
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                Ensures payable hours meet minimum engagement requirements (e.g. 2h, 3h, or 4h minimums).
              </span>
            </div>
          </label>
        </div>

        {inputs.applyMinimumPayment && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Minimum Engagement Requirement (Hours)
                </label>
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">
                  Accruely does not hardcode a universal rule; enter the threshold required by the award.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  openEditModal(
                    'Minimum Engagement Requirement (Hours)',
                    'minimumHours',
                    inputs.minimumHours || 3.0,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-50 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs transition-all cursor-pointer sm:w-48"
              >
                <span>{formatNum(inputs.minimumHours, 2)} hrs ({formatDecimalToHoursMinutes(inputs.minimumHours)})</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Minimum Payment Comparison Alert */}
            {results.isMinimumPaymentApplied ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-amber-900 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Minimum Engagement Applied: </strong>
                  Employee worked {formatNum(results.totalHoursWorked, 2)} hrs, but is entitled to pay for{' '}
                  {formatNum(results.payableHours, 2)} hrs under the minimum engagement rule. Shortfall top-up of{' '}
                  {formatNum(results.minimumShortfallHours, 2)} hrs was allocated.
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-900 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Worked hours ({formatNum(results.totalHoursWorked, 2)} hrs) meet or exceed the minimum requirement (
                  {formatNum(inputs.minimumHours, 2)} hrs).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. STEP 5: SHIFT START & FINISH TIME CALCULATOR (OPTIONAL EXPANDABLE) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <button
          type="button"
          onClick={() => {
            const next = !isShiftSectionOpen;
            setIsShiftSectionOpen(next);
            onChangeInput((prev) => ({ ...prev, enableShiftTimes: next }));
          }}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Shift Start & Finish Time Calculator (Optional)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Calculate net decimal hours from shift clock times and verify against timesheet hours.
              </p>
            </div>
          </div>
          {isShiftSectionOpen ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {isShiftSectionOpen && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Start Time (24h)
                </label>
                <input
                  type="time"
                  value={inputs.shiftStartTime || '08:00'}
                  onChange={(e) =>
                    onChangeInput((prev) => ({ ...prev, shiftStartTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Finish Time (24h)
                </label>
                <input
                  type="time"
                  value={inputs.shiftEndTime || '16:06'}
                  onChange={(e) =>
                    onChangeInput((prev) => ({ ...prev, shiftEndTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Unpaid Break (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={inputs.unpaidBreakMinutes ?? 30}
                  onChange={(e) =>
                    onChangeInput((prev) => ({
                      ...prev,
                      unpaidBreakMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {shiftDuration !== null && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Calculated Net Shift Duration: <span className="text-orange-600 dark:text-orange-400 font-mono text-sm">{formatNum(shiftDuration, 2)} hrs</span> ({formatDecimalToHoursMinutes(shiftDuration)})
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {inputs.shiftStartTime} to {inputs.shiftEndTime} with {inputs.unpaidBreakMinutes || 0}m break.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyShiftHoursToTimesheet}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Use Shift Hours ({formatNum(shiftDuration, 2)} hrs)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. STEP 6: HOURS RECONCILIATION & FINAL PAY CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        {/* Hours Reconciliation Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            results.isReconciled
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              : 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                results.isReconciled
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}
            >
              {results.isReconciled ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-extrabold flex items-center gap-2">
                <span>
                  {results.isReconciled
                    ? 'Hours Fully Reconciled (100% Matched)'
                    : 'Discrepancy Detected in Hour Allocation'}
                </span>
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                Original Timesheet: <strong>{formatNum(results.totalHoursWorked, 2)} hrs</strong> | Allocated:{' '}
                <strong>{formatNum(results.totalAllocatedHours, 2)} hrs</strong> | Difference:{' '}
                <strong>{formatNum(results.hoursDifference, 2)} hrs</strong>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black ${
                results.isReconciled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              Variance: {formatNum(results.hoursDifference, 2)} hrs
            </span>
          </div>
        </div>

        {/* Tier Breakdown Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Allocated Tier Breakdown
            </h4>
            <span className="text-[11px] text-zinc-400">
              Ordinary Rate: ${formatNum(results.ordinaryHourlyRate, 2)}/hr
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3 text-right">Allocated Hours</th>
                  <th className="py-2.5 px-3 text-right">Rate %</th>
                  <th className="py-2.5 px-3 text-right">Rate ($/hr)</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                {results.tierResults.map((t, idx) => (
                  <tr
                    key={t.id || idx}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.label}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                      {formatNum(t.allocatedHours, 2)} hrs{' '}
                      <span className="text-[10px] font-normal text-zinc-400">
                        ({formatDecimalToHoursMinutes(t.allocatedHours)})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {t.ratePercentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ${formatNum(t.tierHourlyRate, 2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${formatNum(t.tierPay, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-50/60 dark:bg-zinc-800/90 font-bold border-t-2 border-orange-200 dark:border-zinc-700 text-xs">
                <tr>
                  <td className="py-3 px-3 uppercase text-zinc-800 dark:text-zinc-200">
                    Total Reconciled
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-orange-600 dark:text-orange-400 font-extrabold">
                    {formatNum(results.totalAllocatedHours, 2)} hrs
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-400">—</td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-400">—</td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-900 dark:text-zinc-100 font-extrabold text-sm">
                    ${formatNum(results.totalWeekendPay, 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grand Total Weekend Pay Card */}
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 dark:from-zinc-800 dark:to-zinc-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-orange-100 dark:text-zinc-400 block mb-1">
                Total Weekend Pay Calculated
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                ${formatNum(results.totalWeekendPay, 2)}
              </div>
              <div className="text-xs text-orange-100 dark:text-zinc-400 mt-1 font-medium">
                {results.dayWorked} • {results.workType} • {formatNum(results.totalAllocatedHours, 2)} hrs ({formatDecimalToHoursMinutes(results.totalAllocatedHours)})
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="px-4 py-2 bg-white text-orange-950 font-bold rounded-xl text-xs shadow hover:bg-orange-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Export Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step-by-Step Transparent Formulas (Audit Trail) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsFormulasExpanded(!isFormulasExpanded)}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 py-1 cursor-pointer"
          >
            <span>Calculation Details & Step-by-Step Formulas (Audit Trail)</span>
            {isFormulasExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isFormulasExpanded && (
            <div className="mt-2 p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono space-y-1.5 shadow-inner border border-zinc-800 animate-fadeIn">
              <div className="text-[11px] text-zinc-400 border-b border-zinc-800 pb-1 mb-2 font-sans font-bold">
                Formula Steps: Base Rate × Rate % = Hourly Tier Rate | Hourly Rate × Allocated Hours = Subtotal
              </div>
              {results.calculationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold shrink-0">Tier {idx + 1}:</span>
                  <span className="text-zinc-200">{step}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800 text-emerald-400 font-bold flex justify-between">
                <span>Grand Total Weekend Pay:</span>
                <span>${formatNum(results.totalWeekendPay, 2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer / Award Notice */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <strong className="text-zinc-700 dark:text-zinc-300">Important Payroll Notice:</strong> Weekend and overtime rates vary depending on the applicable modern award, enterprise agreement, employee type and circumstances. Accruely calculates the rate structure you enter; it does not determine which award or rate applies. Verify the applicable industrial instrument before processing payroll.
        </div>
      </div>

      {/* 8. EXPORT STATEMENT MODAL */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-base sm:text-lg font-bold">
                  Weekend Pay & Split Hours Statement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statement Text Preview */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-orange-50/30 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                Auditable Payroll Statement Preview:
              </p>
              <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto select-all border border-zinc-800">
                {statementText}
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrintStatement}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleCopyStatement}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow transition-colors cursor-pointer"
                >
                  {copiedExport ? (
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
        </div>
      )}

      {/* EDIT FIELD MODAL */}
      <EditFieldModal
        isOpen={modal.isOpen}
        title={modal.title}
        initialValue={modal.value}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModal}
      />
    </div>
  );
};
