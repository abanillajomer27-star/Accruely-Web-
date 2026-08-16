import React, { useState } from 'react';
import {
  Pencil,
  Share2,
  Clock,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  WeekendPayInputs,
  WeekendPayResults,
  EmployeeType,
  DayWorked,
  WorkType,
} from '../types';
import {
  formatNum,
  generateWeekendPayStatementText,
} from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';
import { ExportModal } from './ExportModal';

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
  fieldKey: keyof WeekendPayInputs | null;
  value: string | number;
  type: 'text' | 'number';
}

const EMPLOYEE_TYPES: EmployeeType[] = ['Full-time', 'Part-time', 'Casual'];
const DAYS_WORKED: DayWorked[] = ['Saturday', 'Sunday'];
const WORK_TYPES: WorkType[] = ['Ordinary Hours', 'Overtime'];

const PRESET_ORDINARY_RATES = [
  { label: '125% / 1.25×', value: 125 },
  { label: '150% / 1.50×', value: 150 },
  { label: '175% / 1.75×', value: 175 },
  { label: '200% / 2.00×', value: 200 },
  { label: '225% / 2.25×', value: 225 },
];

const PRESET_FIRST_OT_RATES = [
  { label: '150% (1.50×)', value: 150 },
  { label: '175% (1.75×)', value: 175 },
  { label: '200% (2.00×)', value: 200 },
];

const PRESET_HIGHER_OT_RATES = [
  { label: '200% (2.00×)', value: 200 },
  { label: '225% (2.25×)', value: 225 },
  { label: '250% (2.50×)', value: 250 },
];

const PRESET_THRESHOLDS = [
  { label: '2.00 hrs', value: 2.0 },
  { label: '3.00 hrs', value: 3.0 },
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

  const [showDescription, setShowDescription] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);

  const openEditModal = (
    title: string,
    fieldKey: keyof WeekendPayInputs,
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
      const numVal = Math.max(0, Number(newValue) || 0);
      return { ...prev, [key]: numVal };
    });

    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const isOvertime = inputs.workType === 'Overtime';
  const statementText = generateWeekendPayStatementText(inputs, results);

  const isCustomOrdinaryRate = !PRESET_ORDINARY_RATES.some(
    (p) => p.value === inputs.weekendRatePercentage
  );
  const isCustomFirstOtRate = !PRESET_FIRST_OT_RATES.some(
    (p) => p.value === inputs.firstOtRatePercentage
  );
  const isCustomHigherOtRate = !PRESET_HIGHER_OT_RATES.some(
    (p) => p.value === inputs.higherOtRatePercentage
  );
  const isCustomThreshold = !PRESET_THRESHOLDS.some(
    (p) => p.value === inputs.higherRateThresholdHours
  );

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* 1. CALCULATOR TITLE & COLLAPSIBLE DESCRIPTION CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Weekend Pay Calculator
              </h2>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {isOvertime ? 'Tiered Overtime Penalty Calculator' : 'Ordinary Penalty Rate & Shift Total'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDescription((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <span>{showDescription ? 'Hide description' : 'Show description'}</span>
            {showDescription ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showDescription && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2 animate-fadeIn">
            <p>
              Calculates weekend pay and tiered overtime using ordinary hourly rates, configurable penalty percentages, and threshold splitting.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Ordinary Hours:</strong> Multiplier = Percentage ÷ 100. Weekend Rate = Hourly Rate × Multiplier. Total = Weekend Rate × Hours Worked.
              </li>
              <li>
                <strong>Tiered Overtime:</strong> Automatically splits overtime hours across a configurable threshold (e.g. first 2 hours at 150%, then 200% thereafter).
              </li>
            </ul>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 italic">
              Overtime rates and thresholds can vary depending on the applicable modern award, enterprise agreement, employment arrangement, employee type and circumstances. Verify the applicable rate and threshold before processing payroll.
            </p>
          </div>
        )}
      </div>

      {/* 2. EMPLOYEE & SHIFT CONTEXT */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Shift & Employee Details
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Australian Context
          </span>
        </div>

        <div className="space-y-3">
          {/* Employee Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Employee Name
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
              className="flex items-center justify-between gap-2 px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm transition-all cursor-pointer sm:w-64"
            >
              <span className="truncate">{inputs.employeeName || 'Tap to enter'}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Employee Type Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Employee Type
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Informational / Contextual
              </span>
            </div>
            <div className="relative sm:w-64">
              <select
                value={inputs.employeeType}
                onChange={(e) =>
                  onChangeInput((prev) => ({
                    ...prev,
                    employeeType: e.target.value as EmployeeType,
                  }))
                }
                className="w-full appearance-none px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-9"
              >
                {EMPLOYEE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Day Worked Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Day Worked
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Saturday / Sunday penalty rules
              </span>
            </div>
            <div className="relative sm:w-64">
              <select
                value={inputs.dayWorked}
                onChange={(e) =>
                  onChangeInput((prev) => ({
                    ...prev,
                    dayWorked: e.target.value as DayWorked,
                  }))
                }
                className="w-full appearance-none px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-9"
              >
                {DAYS_WORKED.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Work Type Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Work Type
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Ordinary or Tiered Overtime
              </span>
            </div>
            <div className="relative sm:w-64">
              <select
                value={inputs.workType}
                onChange={(e) =>
                  onChangeInput((prev) => ({
                    ...prev,
                    workType: e.target.value as WorkType,
                  }))
                }
                className="w-full appearance-none px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-9"
              >
                {WORK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Overtime Notice (if WorkType is Overtime) */}
          {isOvertime && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs leading-relaxed animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p>
                Overtime rates and thresholds can vary depending on the applicable modern award, enterprise agreement, employment arrangement, employee type and circumstances. Verify the applicable rate and threshold before processing payroll.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. RATES & HOURS PARAMETERS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {isOvertime ? 'Tiered Overtime Parameters' : 'Rate & Hours Parameters'}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Paste & Edit Supported
          </span>
        </div>

        <div className="space-y-4">
          {/* Ordinary Hourly Rate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Ordinary Hourly Rate ($/hr)
              </label>
              <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                Base ordinary rate before penalty multipliers
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
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-orange-50/70 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-base transition-all cursor-pointer sm:w-48"
            >
              <span>${formatNum(inputs.ordinaryHourlyRate, 2)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* IF ORDINARY HOURS */}
          {!isOvertime && (
            <>
              {/* Weekend Rate Percentage Selection */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Weekend Rate Percentage
                  </label>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {inputs.weekendRatePercentage}% ({results.multiplier.toFixed(2)}×)
                  </span>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_ORDINARY_RATES.map((preset) => {
                    const active = inputs.weekendRatePercentage === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({
                            ...prev,
                            weekendRatePercentage: preset.value,
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          active
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}

                  {/* Custom Percentage Button */}
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        'Custom Weekend Rate (%)',
                        'weekendRatePercentage',
                        inputs.weekendRatePercentage,
                        'number'
                      )
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      isCustomOrdinaryRate
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    Custom {isCustomOrdinaryRate ? `(${inputs.weekendRatePercentage}%)` : '...'}
                  </button>
                </div>
              </div>

              {/* Hours Worked */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Hours Worked
                  </label>
                  <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                    Decimal hours allowed (e.g. 6, 6.5, 7.25)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openEditModal(
                      'Hours Worked',
                      'hoursWorked',
                      inputs.hoursWorked,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-orange-50/70 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-base transition-all cursor-pointer sm:w-48"
                >
                  <span>{formatNum(inputs.hoursWorked, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </>
          )}

          {/* IF OVERTIME (TIERED OVERTIME) */}
          {isOvertime && (
            <>
              {/* First Overtime Rate (%) */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      First Overtime Rate
                    </label>
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                      Applies up to the threshold (e.g. 150%)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {inputs.firstOtRatePercentage}% (${formatNum(results.firstTierHourlyRate, 2)}/hr)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_FIRST_OT_RATES.map((preset) => {
                    const active = inputs.firstOtRatePercentage === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({
                            ...prev,
                            firstOtRatePercentage: preset.value,
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          active
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        'First Overtime Rate (%)',
                        'firstOtRatePercentage',
                        inputs.firstOtRatePercentage,
                        'number'
                      )
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      isCustomFirstOtRate
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    Custom {isCustomFirstOtRate ? `(${inputs.firstOtRatePercentage}%)` : '...'}
                  </button>
                </div>
              </div>

              {/* Higher Overtime Rate (%) */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Higher Overtime Rate
                    </label>
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                      Applies after the threshold (e.g. 200%)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {inputs.higherOtRatePercentage}% (${formatNum(results.higherTierHourlyRate, 2)}/hr)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_HIGHER_OT_RATES.map((preset) => {
                    const active = inputs.higherOtRatePercentage === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({
                            ...prev,
                            higherOtRatePercentage: preset.value,
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          active
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        'Higher Overtime Rate (%)',
                        'higherOtRatePercentage',
                        inputs.higherOtRatePercentage,
                        'number'
                      )
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      isCustomHigherOtRate
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    Custom {isCustomHigherOtRate ? `(${inputs.higherOtRatePercentage}%)` : '...'}
                  </button>
                </div>
              </div>

              {/* Higher Rate Threshold (Configurable hours) */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Higher Rate Threshold (Hours)
                    </label>
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                      Higher rate applies after these initial hours
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {formatNum(inputs.higherRateThresholdHours, 2)} hrs
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_THRESHOLDS.map((preset) => {
                    const active = inputs.higherRateThresholdHours === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({
                            ...prev,
                            higherRateThresholdHours: preset.value,
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          active
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        'Higher Rate Threshold (Hours)',
                        'higherRateThresholdHours',
                        inputs.higherRateThresholdHours,
                        'number'
                      )
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      isCustomThreshold
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    Custom {isCustomThreshold ? `(${inputs.higherRateThresholdHours} hrs)` : '...'}
                  </button>
                </div>
              </div>

              {/* Total Overtime Hours */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Total Overtime Hours
                  </label>
                  <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                    Total shift overtime hours worked
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openEditModal(
                      'Total Overtime Hours',
                      'totalOtHours',
                      inputs.totalOtHours,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-orange-50/70 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-base transition-all cursor-pointer sm:w-48"
                >
                  <span>{formatNum(inputs.totalOtHours, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. TOTAL PAY RESULT CARD */}
      <div className="bg-orange-600 dark:bg-zinc-800 text-white rounded-2xl p-5 shadow-md transition-colors relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-orange-200 dark:text-zinc-400">
              {isOvertime ? 'Total Overtime Entitlement' : 'Final Weekend Entitlement'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5 text-white">
              ${formatNum(results.totalWeekendPay, 2)}
            </h3>
            <p className="text-xs text-orange-100 dark:text-zinc-300 mt-1 font-medium">
              {isOvertime
                ? `Total Overtime Pay (${inputs.dayWorked} • Tiered Calculation)`
                : `Total Weekend Pay (${inputs.dayWorked} • Ordinary Hours)`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share / Export</span>
          </button>
        </div>
      </div>

      {/* 5. CALCULATION BREAKDOWN & DETAILS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsBreakdownOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {isOvertime ? 'Tiered Overtime Breakdown' : 'Calculation Breakdown'}
            </h3>
          </div>
          <button
            type="button"
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {isBreakdownOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isBreakdownOpen && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
            {/* IF ORDINARY HOURS */}
            {!isOvertime && (
              <>
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Ordinary Rate
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      ${formatNum(inputs.ordinaryHourlyRate, 2)}/hr
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Weekend Rate
                    </span>
                    <span className="text-base font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 block">
                      {inputs.weekendRatePercentage}%
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {results.multiplier.toFixed(2)}× multiplier
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Weekend Pay Rate
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      ${formatNum(results.weekendPayRate, 2)}/hr
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Hours Worked
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      {formatNum(inputs.hoursWorked, 2)} hrs
                    </span>
                  </div>
                </div>

                {/* Formula Equation Box */}
                <div className="p-3.5 bg-orange-50 dark:bg-zinc-800/80 rounded-xl border border-orange-200 dark:border-zinc-700">
                  <div className="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-1">
                    Calculation Equation:
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-orange-950 dark:text-orange-200 select-all">
                    {results.breakdownEquation}
                  </div>
                </div>

                {/* Step-by-Step Breakdown */}
                <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 1:
                    </span>
                    <span>
                      Convert percentage into multiplier: {inputs.weekendRatePercentage}% ÷ 100 ={' '}
                      <strong>{results.multiplier.toFixed(2)}</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 2:
                    </span>
                    <span>
                      Calculate Weekend Hourly Pay Rate: ${formatNum(inputs.ordinaryHourlyRate, 2)} × {results.multiplier.toFixed(2)} ={' '}
                      <strong className="text-zinc-900 dark:text-zinc-100">${formatNum(results.weekendPayRate, 2)}/hour</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 3:
                    </span>
                    <span>
                      Calculate Total Weekend Pay: ${formatNum(results.weekendPayRate, 2)} × {formatNum(inputs.hoursWorked, 2)} hrs ={' '}
                      <strong className="text-orange-600 dark:text-orange-400">${formatNum(results.totalWeekendPay, 2)}</strong>
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* IF TIERED OVERTIME */}
            {isOvertime && (
              <>
                {/* 5-Metric Parameter Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Ordinary Rate
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      ${formatNum(inputs.ordinaryHourlyRate, 2)}/hr
                    </span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      First OT Rate
                    </span>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 block">
                      {inputs.firstOtRatePercentage}%
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      ${formatNum(results.firstTierHourlyRate, 2)}/hr
                    </span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Higher OT Rate
                    </span>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 block">
                      {inputs.higherOtRatePercentage}%
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      ${formatNum(results.higherTierHourlyRate, 2)}/hr
                    </span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Threshold
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      {formatNum(inputs.higherRateThresholdHours, 2)} hrs
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Applies after
                    </span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Total OT Hours
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      {formatNum(inputs.totalOtHours, 2)} hrs
                    </span>
                  </div>
                </div>

                {/* Tier Split Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* First Tier Card */}
                  <div className="p-4 bg-orange-50/70 dark:bg-zinc-800/80 rounded-xl border border-orange-200/90 dark:border-zinc-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-950 dark:text-orange-300">
                          First Tier (Up to {formatNum(inputs.higherRateThresholdHours, 2)} hrs)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-200/70 dark:bg-zinc-700 text-orange-900 dark:text-orange-300 rounded text-[10px] font-bold">
                        {inputs.firstOtRatePercentage}% ({results.firstOtMultiplier.toFixed(2)}×)
                      </span>
                    </div>

                    <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                      ${formatNum(results.firstTierHourlyRate, 2)}/hr × {formatNum(results.firstTierHours, 2)} hrs
                    </div>

                    <div className="pt-1 border-t border-orange-200/60 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">First Tier Pay:</span>
                      <span className="font-bold text-orange-700 dark:text-orange-400 text-sm">
                        ${formatNum(results.firstTierPay, 2)}
                      </span>
                    </div>
                  </div>

                  {/* Higher Tier Card */}
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    results.remainingHours > 0
                      ? 'bg-amber-50/70 dark:bg-zinc-800/80 border-amber-300 dark:border-zinc-700'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                          Higher Tier (Beyond {formatNum(inputs.higherRateThresholdHours, 2)} hrs)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-200/70 dark:bg-zinc-700 text-amber-900 dark:text-amber-300 rounded text-[10px] font-bold">
                        {inputs.higherOtRatePercentage}% ({results.higherOtMultiplier.toFixed(2)}×)
                      </span>
                    </div>

                    <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                      ${formatNum(results.higherTierHourlyRate, 2)}/hr × {formatNum(results.remainingHours, 2)} hrs
                    </div>

                    <div className="pt-1 border-t border-amber-200/60 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">Higher Tier Pay:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                        ${formatNum(results.higherTierPay, 2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calculation Equations Breakdown Box */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mathematical Breakdown:
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 space-y-1 select-all">
                    <div>
                      • First Tier: ${formatNum(inputs.ordinaryHourlyRate, 2)} × {inputs.firstOtRatePercentage}% × {formatNum(results.firstTierHours, 2)} ={' '}
                      <strong>${formatNum(results.firstTierPay, 2)}</strong>
                    </div>
                    {results.remainingHours > 0 ? (
                      <>
                        <div>
                          • Higher Tier: ${formatNum(inputs.ordinaryHourlyRate, 2)} × {inputs.higherOtRatePercentage}% × {formatNum(results.remainingHours, 2)} ={' '}
                          <strong>${formatNum(results.higherTierPay, 2)}</strong>
                        </div>
                        <div className="pt-1 text-orange-700 dark:text-orange-400 font-bold border-t border-zinc-200 dark:border-zinc-700">
                          • Total Overtime Pay: ${formatNum(results.firstTierPay, 2)} + ${formatNum(results.higherTierPay, 2)} = ${formatNum(results.totalOvertimePay, 2)}
                        </div>
                      </>
                    ) : (
                      <div className="text-zinc-500 dark:text-zinc-400 italic text-[11px]">
                        • Higher Tier: Not applicable (hours do not exceed the {formatNum(inputs.higherRateThresholdHours, 2)} hr threshold).
                      </div>
                    )}
                  </div>
                </div>

                {/* Step-by-Step Logic */}
                <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 1 (First Tier Hours):
                    </span>
                    <span>
                      MIN(Total OT Hours {formatNum(inputs.totalOtHours, 2)}, Threshold {formatNum(inputs.higherRateThresholdHours, 2)}) ={' '}
                      <strong>{formatNum(results.firstTierHours, 2)} hrs</strong> at ${formatNum(results.firstTierHourlyRate, 2)}/hr ={' '}
                      <strong>${formatNum(results.firstTierPay, 2)}</strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 2 (Higher Tier Hours):
                    </span>
                    <span>
                      MAX(Total OT Hours {formatNum(inputs.totalOtHours, 2)} − Threshold {formatNum(inputs.higherRateThresholdHours, 2)}, 0) ={' '}
                      <strong>{formatNum(results.remainingHours, 2)} hrs</strong> at ${formatNum(results.higherTierHourlyRate, 2)}/hr ={' '}
                      <strong>${formatNum(results.higherTierPay, 2)}</strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      Step 3 (Total Overtime Pay):
                    </span>
                    <span>
                      First Tier Pay (${formatNum(results.firstTierPay, 2)}) + Higher Tier Pay (${formatNum(results.higherTierPay, 2)}) ={' '}
                      <strong className="text-orange-600 dark:text-orange-400 text-sm">
                        ${formatNum(results.totalOvertimePay, 2)}
                      </strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Field Modal */}
      <EditFieldModal
        isOpen={modal.isOpen}
        title={modal.title}
        initialValue={modal.value}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModal}
      />

      {/* Export / Share Statement Modal */}
      <ExportModal
        isOpen={isExportOpen}
        title={isOvertime ? 'Weekend Overtime Statement' : 'Weekend Pay Statement'}
        statementText={statementText}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
