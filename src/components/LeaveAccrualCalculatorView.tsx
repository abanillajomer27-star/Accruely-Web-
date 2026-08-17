import React, { useState } from 'react';
import {
  Pencil,
  Share2,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  FileText,
  Copy,
  Printer,
  X,
  Check,
  Calendar,
} from 'lucide-react';
import {
  LeaveAccrualInputs,
  LeaveAccrualResults,
  LeaveAccrualProfile,
  PayFrequency,
} from '../types';
import {
  formatNum,
  generateLeaveAccrualStatementText,
} from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';

interface LeaveAccrualCalculatorViewProps {
  inputs: LeaveAccrualInputs;
  results: LeaveAccrualResults;
  onChangeInput: (updater: (prev: LeaveAccrualInputs) => LeaveAccrualInputs) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  fieldKey: keyof LeaveAccrualInputs | null;
  value: string | number;
  type: 'text' | 'number';
}

const PROFILES: LeaveAccrualProfile[] = [
  'Australian NES Full-Time',
  'Australian NES Part-Time (Pro-rata)',
  'Casual Employee',
  'Custom Company Policy',
];

const PAY_FREQUENCIES: PayFrequency[] = [
  'Weekly',
  'Fortnightly',
  'Monthly',
  'Bi-Monthly',
];

export const LeaveAccrualCalculatorView: React.FC<LeaveAccrualCalculatorViewProps> = ({
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
  const [copied, setCopied] = useState(false);

  const openEditModal = (
    title: string,
    fieldKey: keyof LeaveAccrualInputs,
    value: string | number,
    type: 'text' | 'number' = 'number'
  ) => {
    setModal({
      isOpen: true,
      title,
      fieldKey,
      value,
      type,
    });
  };

  const handleSaveModal = (val: string | number) => {
    if (!modal.fieldKey) return;

    onChangeInput((prev) => {
      const next = { ...prev };
      const key = modal.fieldKey!;

      if (key === 'employeeName') {
        next.employeeName = String(val);
      } else if (key === 'standardHoursPerDay') {
        const stdHours = Number(val) || 7.6;
        next.standardHoursPerDay = stdHours;
        // Optionally update total hours based on pay frequency if user hadn't customized
      } else if (key === 'totalHoursForPeriod') {
        next.totalHoursForPeriod = Number(val) || 0;
      } else if (key === 'ordinaryHours') {
        next.ordinaryHours = Number(val) || 0;
      } else if (key === 'publicHolidayHours') {
        next.publicHolidayHours = Number(val) || 0;
      } else if (key === 'annualLeaveTaken') {
        next.annualLeaveTaken = Number(val) || 0;
      } else if (key === 'personalLeaveTaken') {
        next.personalLeaveTaken = Number(val) || 0;
      } else if (key === 'customAnnualLeaveAccrualRate') {
        next.customAnnualLeaveAccrualRate = Number(val) || 0;
      } else if (key === 'customPersonalLeaveAccrualRate') {
        next.customPersonalLeaveAccrualRate = Number(val) || 0;
      } else if (key === 'annualLeaveOpeningBalance') {
        next.annualLeaveOpeningBalance = Number(val) || 0;
      } else if (key === 'personalLeaveOpeningBalance') {
        next.personalLeaveOpeningBalance = Number(val) || 0;
      }

      return next;
    });
  };

  const handleProfileChange = (profile: LeaveAccrualProfile) => {
    onChangeInput((prev) => {
      const next = { ...prev, profile };
      if (profile === 'Casual Employee') {
        next.customAnnualLeaveAccrualRate = 0;
        next.customPersonalLeaveAccrualRate = 0;
      } else if (profile === 'Australian NES Full-Time' || profile === 'Australian NES Part-Time (Pro-rata)') {
        next.customAnnualLeaveAccrualRate = 4 / 52;
        next.customPersonalLeaveAccrualRate = 10 / 260;
      }
      return next;
    });
  };

  const handlePayFrequencyChange = (payFrequency: PayFrequency) => {
    onChangeInput((prev) => {
      const stdPerDay = prev.standardHoursPerDay || 7.6;
      let newTotalHours = prev.totalHoursForPeriod;

      if (payFrequency === 'Weekly') {
        newTotalHours = stdPerDay * 5;
      } else if (payFrequency === 'Fortnightly') {
        newTotalHours = stdPerDay * 10;
      } else if (payFrequency === 'Monthly') {
        newTotalHours = Number(((stdPerDay * 5 * 52) / 12).toFixed(2));
      } else if (payFrequency === 'Bi-Monthly') {
        newTotalHours = Number(((stdPerDay * 5 * 52) / 24).toFixed(2));
      }

      return {
        ...prev,
        payFrequency,
        totalHoursForPeriod: newTotalHours,
        ordinaryHours: newTotalHours,
      };
    });
  };

  const handleToggleOverrideRates = () => {
    onChangeInput((prev) => ({
      ...prev,
      overrideDefaultRates: !prev.overrideDefaultRates,
      customAnnualLeaveAccrualRate: prev.customAnnualLeaveAccrualRate || 4 / 52,
      customPersonalLeaveAccrualRate: prev.customPersonalLeaveAccrualRate || 10 / 260,
    }));
  };

  const statementText = generateLeaveAccrualStatementText(inputs, results);

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const stdPerDay = inputs.standardHoursPerDay || 7.6;
  const stdPerWeek = stdPerDay * 5;

  return (
    <div className="space-y-6 pb-12">
      {/* CALCULATOR TITLE CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Standard Leave Accrual Calculator
            </h2>
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Australian National Employment Standards (NES)
            </span>
          </div>
        </div>
      </div>

      {/* 1. EMPLOYEE & PAY RUN DETAILS */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>EMPLOYEE & PAY RUN DETAILS</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Profile & Hours Breakdown
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-6">
          {/* General Employee & Profile Parameters */}
          <div className="space-y-3.5">
            {/* Employee Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Employee Name
              </label>
              <button
                id="btn-edit-employee-name"
                onClick={() =>
                  openEditModal(
                    'Employee Name',
                    'employeeName',
                    inputs.employeeName || '',
                    'text'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm sm:text-base transition-all cursor-pointer min-w-[200px]"
              >
                <span className="truncate">
                  {inputs.employeeName || 'Tap to enter'}
                </span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Leave Accrual Profile Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Leave Accrual Profile
              </label>
              <div className="relative min-w-[220px]">
                <select
                  id="select-leave-accrual-profile"
                  value={inputs.profile}
                  onChange={(e) =>
                    handleProfileChange(e.target.value as LeaveAccrualProfile)
                  }
                  className="w-full appearance-none px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-10"
                >
                  {PROFILES.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-orange-700 dark:text-orange-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Pay Frequency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pay Frequency
              </label>
              <div className="relative min-w-[180px]">
                <select
                  id="select-pay-frequency"
                  value={inputs.payFrequency}
                  onChange={(e) =>
                    handlePayFrequencyChange(e.target.value as PayFrequency)
                  }
                  className="w-full appearance-none px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer pr-10"
                >
                  {PAY_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-orange-700 dark:text-orange-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Standard Hours Per Day */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Standard Hours Per Day
              </label>
              <button
                id="btn-edit-std-hours"
                onClick={() =>
                  openEditModal(
                    'Standard Hours Per Day',
                    'standardHoursPerDay',
                    inputs.standardHoursPerDay,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.standardHoursPerDay, 2)} hrs</span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Total Hours For The Pay Period */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Total Hours For The Pay Period
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Scheduled pay period baseline
                </span>
              </div>
              <button
                id="btn-edit-total-hours-period"
                onClick={() =>
                  openEditModal(
                    'Total Hours For The Pay Period',
                    'totalHoursForPeriod',
                    inputs.totalHoursForPeriod,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.totalHoursForPeriod, 2)} hrs</span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-orange-200/60 dark:border-zinc-800" />

          {/* Sub-Card: Hours Worked & Leave Taken */}
          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 space-y-3.5">
            <div className="flex items-center justify-between border-b border-orange-200/60 dark:border-zinc-700 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  HOURS WORKED & LEAVE TAKEN
                </h3>
              </div>
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md">
                This Pay Run
              </span>
            </div>

            {/* Ordinary Hours Worked */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Ordinary Hours Worked
              </label>
              <button
                id="btn-edit-ordinary-hours"
                onClick={() =>
                  openEditModal(
                    'Ordinary Hours Worked',
                    'ordinaryHours',
                    inputs.ordinaryHours,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.ordinaryHours, 2)} hrs</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Public Holiday Hours */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Public Holiday Hours
              </label>
              <button
                id="btn-edit-holiday-hours"
                onClick={() =>
                  openEditModal(
                    'Public Holiday Hours',
                    'publicHolidayHours',
                    inputs.publicHolidayHours,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.publicHolidayHours, 2)} hrs</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Annual Leave Taken */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Annual Leave Taken
              </label>
              <button
                id="btn-edit-al-taken"
                onClick={() =>
                  openEditModal(
                    'Annual Leave Taken (hrs)',
                    'annualLeaveTaken',
                    inputs.annualLeaveTaken,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.annualLeaveTaken, 2)} hrs</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Personal Leave Taken */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Personal Leave Taken
              </label>
              <button
                id="btn-edit-pl-taken"
                onClick={() =>
                  openEditModal(
                    'Personal Leave Taken (hrs)',
                    'personalLeaveTaken',
                    inputs.personalLeaveTaken,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.personalLeaveTaken, 2)} hrs</span>
                <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Total Paid Hours Highlight */}
            <div className="p-3.5 bg-orange-100/70 dark:bg-zinc-900/90 rounded-xl border border-orange-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
              <div>
                <span className="text-xs sm:text-sm font-bold text-orange-950 dark:text-orange-300 block">
                  Total Paid Hours
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Ordinary + Holiday + AL Taken + PL Taken
                </span>
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-orange-950 dark:text-zinc-100 text-right">
                {formatNum(results.totalPaidHours, 2)} hrs
              </span>
            </div>

            {/* Leave Without Pay Hours Highlight */}
            <div className="p-3.5 bg-zinc-100/80 dark:bg-zinc-900/70 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                  Leave Without Pay Hours
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Total Hours For Period − Total Paid Hours
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200 text-right">
                {formatNum(results.leaveWithoutPayHours, 2)} hrs
              </span>
            </div>
          </div>

          {/* Sub-Card: Override Default Rates Toggle */}
          <div className="bg-white/80 dark:bg-zinc-800/60 rounded-xl p-4 border border-orange-200/70 dark:border-zinc-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Override Default Rates
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Manually customize the accrual rate per paid hour
                </p>
              </div>
              <button
                id="btn-toggle-override-rates"
                onClick={handleToggleOverrideRates}
                className="text-orange-600 dark:text-orange-400 hover:opacity-80 transition-opacity cursor-pointer p-1"
                aria-label="Toggle Override Default Rates"
              >
                {inputs.overrideDefaultRates ? (
                  <ToggleRight className="w-8 h-8 text-orange-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-zinc-400" />
                )}
              </button>
            </div>

            {inputs.overrideDefaultRates && (
              <div className="pt-2 space-y-3 border-t border-orange-200/60 dark:border-zinc-700 animate-fadeIn">
                {/* Custom AL Rate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Custom Annual Leave Accrual Rate (hrs/paid hr)
                  </label>
                  <button
                    id="btn-edit-custom-al-rate"
                    onClick={() =>
                      openEditModal(
                        'Custom Annual Leave Accrual Rate',
                        'customAnnualLeaveAccrualRate',
                        inputs.customAnnualLeaveAccrualRate,
                        'number'
                      )
                    }
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                  >
                    <span>{formatNum(inputs.customAnnualLeaveAccrualRate, 6)}</span>
                    <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                  </button>
                </div>

                {/* Custom PL Rate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Custom Personal Leave Accrual Rate (hrs/paid hr)
                  </label>
                  <button
                    id="btn-edit-custom-pl-rate"
                    onClick={() =>
                      openEditModal(
                        'Custom Personal Leave Accrual Rate',
                        'customPersonalLeaveAccrualRate',
                        inputs.customPersonalLeaveAccrualRate,
                        'number'
                      )
                    }
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                  >
                    <span>{formatNum(inputs.customPersonalLeaveAccrualRate, 6)}</span>
                    <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ANNUAL LEAVE (AL) SECTION */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>ANNUAL LEAVE</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Rate: {formatNum(results.annualLeaveAccrualRate, 6)} hrs/hr
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 space-y-3">
            {/* Opening Annual Leave Balance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Opening Annual Leave Balance
              </label>
              <button
                id="btn-edit-al-opening"
                onClick={() =>
                  openEditModal(
                    'Opening Annual Leave Balance (hrs)',
                    'annualLeaveOpeningBalance',
                    inputs.annualLeaveOpeningBalance,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.annualLeaveOpeningBalance, 4)} hrs</span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Accrual Rate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Accrual Rate
              </span>
              <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                {formatNum(results.annualLeaveAccrualRate, 6)} hrs/hr
              </div>
            </div>

            {/* Annual Leave Accrued This Pay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Annual Leave Accrued This Pay
              </span>
              <div className="px-4 py-2 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base text-right min-w-[140px]">
                +{formatNum(results.annualLeaveAccrued, 4)} hrs
              </div>
            </div>

            {/* Available Annual Leave */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Available Annual Leave
              </span>
              <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                {formatNum(results.availableAnnualLeave, 4)} hrs
              </div>
            </div>

            {/* Less: Annual Leave Taken */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Less: Annual Leave Taken
              </span>
              <div className="px-4 py-2 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold text-sm sm:text-base text-right min-w-[140px]">
                −{formatNum(inputs.annualLeaveTaken, 2)} hrs
              </div>
            </div>

            {/* Closing Annual Leave Balance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-orange-200/60 dark:border-zinc-700/80 bg-orange-100/60 dark:bg-zinc-800/90 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-xl">
              <div>
                <span className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-300 block">
                  Closing Annual Leave Balance
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  ≈ {formatNum(results.annualLeaveClosingBalance / stdPerDay, 2)} days | {formatNum(results.annualLeaveClosingBalance / stdPerWeek, 2)} weeks
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-orange-950 dark:text-zinc-100 text-right">
                {formatNum(results.annualLeaveClosingBalance, 4)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL / CARER'S LEAVE (PL) SECTION */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>PERSONAL LEAVE</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Rate: {formatNum(results.personalLeaveAccrualRate, 6)} hrs/hr
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 space-y-3">
            {/* Opening Personal Leave Balance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Opening Personal Leave Balance
              </label>
              <button
                id="btn-edit-pl-opening"
                onClick={() =>
                  openEditModal(
                    'Opening Personal Leave Balance (hrs)',
                    'personalLeaveOpeningBalance',
                    inputs.personalLeaveOpeningBalance,
                    'number'
                  )
                }
                className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
              >
                <span>{formatNum(inputs.personalLeaveOpeningBalance, 4)} hrs</span>
                <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              </button>
            </div>

            {/* Accrual Rate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Accrual Rate
              </span>
              <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                {formatNum(results.personalLeaveAccrualRate, 6)} hrs/hr
              </div>
            </div>

            {/* Personal Leave Accrued This Pay */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Personal Leave Accrued This Pay
              </span>
              <div className="px-4 py-2 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base text-right min-w-[140px]">
                +{formatNum(results.personalLeaveAccrued, 4)} hrs
              </div>
            </div>

            {/* Available Personal Leave */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Available Personal Leave
              </span>
              <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                {formatNum(results.availablePersonalLeave, 4)} hrs
              </div>
            </div>

            {/* Less: Personal Leave Taken */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Less: Personal Leave Taken
              </span>
              <div className="px-4 py-2 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold text-sm sm:text-base text-right min-w-[140px]">
                −{formatNum(inputs.personalLeaveTaken, 2)} hrs
              </div>
            </div>

            {/* Closing Personal Leave Balance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-orange-200/60 dark:border-zinc-700/80 bg-orange-100/60 dark:bg-zinc-800/90 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-xl">
              <div>
                <span className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-300 block">
                  Closing Personal Leave Balance
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  ≈ {formatNum(results.personalLeaveClosingBalance / stdPerDay, 2)} days | {formatNum(results.personalLeaveClosingBalance / stdPerWeek, 2)} weeks
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-orange-950 dark:text-zinc-100 text-right">
                {formatNum(results.personalLeaveClosingBalance, 4)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTION BUTTON: EXPORT/SHARE */}
      <div className="flex justify-center pt-2">
        <button
          id="btn-export-share-leave-statement"
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
        >
          <Share2 className="w-5 h-5 text-orange-100" />
          <span>Export / Share Leave Statement</span>
        </button>
      </div>

      {/* 5. CALCULATIONS (HOW IT WORKS) SECTION */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-100" />
            <span>CALCULATIONS (HOW IT WORKS)</span>
          </div>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Australian NES Standards
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 border border-orange-200/80 dark:border-zinc-700 space-y-2">
            <div className="font-bold text-orange-950 dark:text-orange-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-orange-600" />
              <span>Total Paid Hours & Leave Without Pay</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-800 dark:text-zinc-200 font-mono text-xs">
              <li><strong>Total Paid Hours</strong> = Ordinary Hours + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken</li>
              <li><strong>Leave Without Pay Hours</strong> = Total Hours For The Pay Period − Total Paid Hours</li>
            </ul>
          </div>

          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 border border-orange-200/80 dark:border-zinc-700 space-y-2">
            <div className="font-bold text-orange-950 dark:text-orange-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-orange-600" />
              <span>Australian NES Accrual Rates (Internal Precision)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-800 dark:text-zinc-200 font-mono text-xs">
              <li>
                <strong>Australian NES Full-Time Annual Leave Accrual Rate</strong> = 4 weeks ÷ 52 weeks = <span className="font-bold text-orange-600 dark:text-orange-400">0.0769230769</span> hrs per paid hour (1/13)
              </li>
              <li>
                <strong>Australian NES Personal Leave Accrual Rate</strong> = 10 days ÷ 260 working days = <span className="font-bold text-orange-600 dark:text-orange-400">0.0384615385</span> hrs per paid hour (1/26)
              </li>
            </ul>
          </div>

          <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 border border-orange-200/80 dark:border-zinc-700 space-y-2">
            <div className="font-bold text-orange-950 dark:text-orange-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-orange-600" />
              <span>Leave Balances & Accrual Equations</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-800 dark:text-zinc-200 font-mono text-xs">
              <li><strong>Annual Leave Accrued</strong> = Total Paid Hours × Annual Leave Accrual Rate</li>
              <li><strong>Available Annual Leave</strong> = Opening Annual Leave Balance + Annual Leave Accrued</li>
              <li><strong>Closing Annual Leave Balance</strong> = Available Annual Leave − Annual Leave Taken</li>
              <li className="pt-1"><strong>Personal Leave Accrued</strong> = Total Paid Hours × Personal Leave Accrual Rate</li>
              <li><strong>Available Personal Leave</strong> = Opening Personal Leave Balance + Personal Leave Accrued</li>
              <li><strong>Closing Personal Leave Balance</strong> = Available Personal Leave − Personal Leave Taken</li>
            </ul>
          </div>
        </div>
      </div>

      {/* EDIT FIELD MODAL */}
      <EditFieldModal
        isOpen={modal.isOpen}
        title={modal.title}
        initialValue={modal.value}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModal}
      />

      {/* EXPORT / SHARE LEAVE STATEMENT MODAL */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
            {/* Header */}
            <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold">Leave Accrual Statement</h3>
              </div>
              <button
                onClick={() => setIsExportOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="p-5 flex-1 overflow-y-auto bg-orange-50/50 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                Statement Text Preview:
              </p>
              <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto select-all border border-zinc-800">
                {statementText}
              </pre>
            </div>

            {/* Actions */}
            <div className="p-4 bg-orange-100/50 dark:bg-zinc-900 border-t border-orange-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handlePrintStatement}
                className="px-4 py-2.5 rounded-xl border border-orange-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-orange-950 dark:text-zinc-200 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={handleCopyStatement}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {copied ? (
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
