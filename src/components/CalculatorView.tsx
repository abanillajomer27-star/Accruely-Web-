import React, { useState } from 'react';
import { Pencil, Share2, ChevronDown, Info } from 'lucide-react';
import { CalculatorInputs, CalculatorResults, AccrualProfile, PayFrequency } from '../types';
import { formatNum, getDefaultHoursForPayFrequency } from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';
import { ExportModal } from './ExportModal';

interface CalculatorViewProps {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  onChangeInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  key: keyof CalculatorInputs | null;
  value: string | number;
  type: 'text' | 'number';
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    key: null,
    value: '',
    type: 'number',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);

  const openEditModal = (
    title: string,
    key: keyof CalculatorInputs,
    value: string | number,
    type: 'text' | 'number' = 'number'
  ) => {
    setModal({
      isOpen: true,
      title,
      key,
      value,
      type,
    });
  };

  const handleSaveModal = (val: string | number) => {
    if (modal.key) {
      onChangeInput(modal.key, val as any);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfile = e.target.value as AccrualProfile;
    onChangeInput('profile', newProfile);
  };

  const handlePayFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFreq = e.target.value as PayFrequency;
    onChangeInput('payFrequency', newFreq);
    const stdHours = getDefaultHoursForPayFrequency(newFreq, inputs.standardHoursPerDay);
    onChangeInput('ordinaryHours', stdHours);
    onChangeInput('totalHoursForPeriod', stdHours);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. INPUTS SECTION CARD */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase">
          INPUTS
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Employee */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Employee
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Employee Name',
                  'employeeName',
                  inputs.employeeName || '',
                  'text'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm sm:text-base transition-all cursor-pointer min-w-[180px]"
            >
              <span className="truncate">
                {inputs.employeeName || 'Tap to enter'}
              </span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Leave Accrual Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Leave Accrual Profile
            </label>
            <div className="relative min-w-[220px]">
              <select
                value={inputs.profile}
                onChange={handleProfileChange}
                className="w-full appearance-none px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm sm:text-base pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Australian NES Full-Time">
                  Australian NES Full-Time
                </option>
                <option value="Australian NES Part-Time (Pro-rata)">
                  Australian NES Part-Time (Pro-rata)
                </option>
                <option value="Casual Employee">Casual Employee</option>
                <option value="Custom Company Policy">
                  Custom Company Policy
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-orange-600 dark:text-orange-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Profile Info Box matching screenshot */}
          <div className="p-3.5 bg-white/80 border border-orange-200/60 dark:bg-zinc-800/80 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium">
            {inputs.profile === 'Australian NES Full-Time' &&
              'Standard leave entitlements under the National Employment Standards.'}
            {inputs.profile === 'Australian NES Part-Time (Pro-rata)' &&
              'Pro-rata annual & personal leave entitlements based on actual hours worked.'}
            {inputs.profile === 'Casual Employee' &&
              'Casual employees generally do not accrue paid annual or personal leave under the NES.'}
            {inputs.profile === 'Custom Company Policy' &&
              'Custom company policy rates applied for annual and personal leave.'}
          </div>

          {/* Custom Company Policy options if selected */}
          {inputs.profile === 'Custom Company Policy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-orange-100/60 dark:bg-zinc-800 rounded-xl border border-orange-200 dark:border-zinc-700">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Annual Leave (weeks/yr):
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.customWeeksAnnualLeave ?? 4}
                  onChange={(e) =>
                    onChangeInput('customWeeksAnnualLeave', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-orange-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Personal Leave (days/yr):
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.customDaysPersonalLeave ?? 10}
                  onChange={(e) =>
                    onChangeInput('customDaysPersonalLeave', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-orange-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* Pay Frequency */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pay Frequency
            </label>
            <div className="relative min-w-[180px]">
              <select
                value={inputs.payFrequency}
                onChange={handlePayFrequencyChange}
                className="w-full appearance-none px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm sm:text-base pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
                <option value="Bi-Monthly">Bi-Monthly</option>
              </select>
              <ChevronDown className="w-4 h-4 text-orange-600 dark:text-orange-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Standard hours per day */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Standard hours per day
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Standard hours per day',
                  'standardHoursPerDay',
                  inputs.standardHoursPerDay,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.standardHoursPerDay, 2)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Ordinary Hours worked this pay */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ordinary Hours worked this pay
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Ordinary Hours worked this pay',
                  'ordinaryHours',
                  inputs.ordinaryHours,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.ordinaryHours, 2)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Public Holiday Hours this pay */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Public Holiday Hours this pay
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Public Holiday Hours this pay',
                  'publicHolidayHours',
                  inputs.publicHolidayHours,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.publicHolidayHours, 2)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Annual leave taken this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Annual leave taken this pay (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Annual leave taken this pay (hrs)',
                  'annualLeaveTaken',
                  inputs.annualLeaveTaken,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.annualLeaveTaken, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Personal leave taken this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Personal leave taken this pay (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Personal leave taken this pay (hrs)',
                  'personalLeaveTaken',
                  inputs.personalLeaveTaken,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.personalLeaveTaken, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Total paid hours this pay (Read-only output box) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-orange-200/60 dark:border-zinc-800">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Total paid hours this pay
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.totalPaidHours, 4)}
            </div>
          </div>

          {/* Leave Without Pay Hours */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Leave Without Pay Hours
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.leaveWithoutPayHours, 4)}
            </div>
          </div>

          {/* Total Hours for the pay period */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-200/60 dark:border-zinc-800">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Total Hours for the pay period
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Total Hours for the pay period',
                  'totalHoursForPeriod',
                  inputs.totalHoursForPeriod,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.totalHoursForPeriod, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Override Default Rates Toggle */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <label className="text-sm sm:text-base font-bold text-orange-900 dark:text-orange-400">
              Override Default Rates
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={inputs.overrideDefaultRates}
              onClick={() =>
                onChangeInput('overrideDefaultRates', !inputs.overrideDefaultRates)
              }
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                inputs.overrideDefaultRates ? 'bg-orange-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inputs.overrideDefaultRates ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Accrual Rates when Override is active */}
          {inputs.overrideDefaultRates && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-orange-100/80 dark:bg-zinc-800 border border-orange-300 dark:border-zinc-700 rounded-xl animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-orange-950 dark:text-orange-300 mb-1">
                  Custom AL Accrual Rate (hrs/hr):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={inputs.customAlRate}
                  onChange={(e) =>
                    onChangeInput('customAlRate', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-orange-300 dark:border-zinc-700 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-950 dark:text-orange-300 mb-1">
                  Custom PL Accrual Rate (hrs/hr):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={inputs.customPlRate}
                  onChange={(e) =>
                    onChangeInput('customPlRate', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-orange-300 dark:border-zinc-700 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ANNUAL LEAVE SECTION CARD */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-emerald-700 dark:bg-emerald-800 text-white px-5 py-3 font-bold text-base tracking-wider uppercase">
          ANNUAL LEAVE
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Opening annual leave balance (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Opening annual leave balance (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Opening annual leave balance (hrs)',
                  'openingAnnualLeave',
                  inputs.openingAnnualLeave,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.openingAnnualLeave, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Accrual rate (AL hrs per hr worked) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Accrual rate (AL hrs per hr worked)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.alAccrualRate, 4)}
            </div>
          </div>

          {/* Annual leave accrued this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Annual leave accrued this pay (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.alAccruedThisPay, 4)}
            </div>
          </div>

          {/* Available annual leave this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Available annual leave this pay (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.alAvailable, 4)}
            </div>
          </div>

          {/* Less: annual leave taken (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Less: annual leave taken (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(inputs.annualLeaveTaken, 4)}
            </div>
          </div>

          {/* Closing annual leave balance (hrs) - Highlighted Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-200/60 dark:border-zinc-800">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Closing annual leave balance (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Override Annual Leave Balance (hrs)',
                  'openingAnnualLeave',
                  inputs.openingAnnualLeave,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 hover:border-orange-400 rounded-xl text-orange-950 dark:text-orange-200 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(results.alClosingBalance, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL LEAVE SECTION CARD */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-purple-800 dark:bg-purple-900 text-white px-5 py-3 font-bold text-base tracking-wider uppercase">
          PERSONAL LEAVE
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Opening personal leave balance (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Opening personal leave balance (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Opening personal leave balance (hrs)',
                  'openingPersonalLeave',
                  inputs.openingPersonalLeave,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(inputs.openingPersonalLeave, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>

          {/* Accrual rate (PL hrs per hr worked) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Accrual rate (PL hrs per hr worked)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.plAccrualRate, 4)}
            </div>
          </div>

          {/* Personal leave accrued this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Personal leave accrued this pay (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.plAccruedThisPay, 4)}
            </div>
          </div>

          {/* Available personal leave this pay (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Available personal leave this pay (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(results.plAvailable, 4)}
            </div>
          </div>

          {/* Less: personal leave taken (hrs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Less: personal leave taken (hrs)
            </label>
            <div className="px-4 py-2 bg-white/80 dark:bg-zinc-800/80 border border-orange-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
              {formatNum(inputs.personalLeaveTaken, 4)}
            </div>
          </div>

          {/* Closing personal leave balance (hrs) - Highlighted Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-200/60 dark:border-zinc-800">
            <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Closing personal leave balance (hrs)
            </label>
            <button
              onClick={() =>
                openEditModal(
                  'Override Personal Leave Balance (hrs)',
                  'openingPersonalLeave',
                  inputs.openingPersonalLeave,
                  'number'
                )
              }
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 hover:border-orange-400 rounded-xl text-orange-950 dark:text-orange-200 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
            >
              <span>{formatNum(results.plClosingBalance, 4)}</span>
              <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. EXPORT / SHARE LEAVE STATEMENT BUTTON */}
      <button
        onClick={() => setIsExportOpen(true)}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-lg rounded-2xl shadow-md transition-all cursor-pointer dark:bg-orange-600 dark:hover:bg-orange-700"
      >
        <Share2 className="w-6 h-6" />
        <span>Export / Share Leave Statement</span>
      </button>

      {/* 5. CALCULATIONS (How it works) SECTION CARD */}
      <div className="bg-zinc-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-zinc-800">
        <h3 className="text-xl font-extrabold tracking-wide text-orange-400 mb-5 pb-2 border-b border-zinc-800">
          CALCULATIONS (How it works)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Total paid hours this pay
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = Ordinary + Public Holiday + AL Taken + PL Taken
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ {formatNum(inputs.ordinaryHours, 2)} + {formatNum(inputs.publicHolidayHours, 2)} + {formatNum(inputs.annualLeaveTaken, 2)} + {formatNum(inputs.personalLeaveTaken, 2)}
              </p>
              <p className="text-orange-300 font-bold text-sm font-mono mt-0.5">
                = {formatNum(results.totalPaidHours, 2)}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Leave Without Pay Hours
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = Total Hours for pay period - Total paid hours
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ {formatNum(inputs.totalHoursForPeriod, 2)} - {formatNum(results.totalPaidHours, 2)} = {formatNum(results.leaveWithoutPayHours, 2)}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Accrual rate (AL)
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = {formatNum(results.alAccrualRate, 4)} ({(results.alAccrualRate * 100).toFixed(2)}%)
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ 4 weeks / 52 weeks = {formatNum(results.alAccrualRate, 4)}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Accrual rate (PL)
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = {formatNum(results.plAccrualRate, 4)} ({(results.plAccrualRate * 100).toFixed(2)}%)
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ 10 days / 260 days = {formatNum(results.plAccrualRate, 4)}
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Annual leave accrued this pay (hrs)
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = Total paid hours × Accrual rate (AL)
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ {formatNum(results.totalPaidHours, 2)} × {formatNum(results.alAccrualRate, 4)} = {formatNum(results.alAccruedThisPay, 4)}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Available annual leave this pay (hrs)
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = Opening balance + Accrued this pay
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ {formatNum(inputs.openingAnnualLeave, 4)} + {formatNum(results.alAccruedThisPay, 4)} = {formatNum(results.alAvailable, 4)}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-base mb-1">
                • Closing annual leave balance (hrs)
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm font-mono">
                = Available annual leave - Annual leave taken
              </p>
              <p className="text-zinc-400 text-xs font-mono mt-1">
                ↳ {formatNum(results.alAvailable, 4)} - {formatNum(inputs.annualLeaveTaken, 4)} = {formatNum(results.alClosingBalance, 4)}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-zinc-400 text-xs font-medium italic">
                • Same mathematical logic applies to Personal Leave section.
              </p>
            </div>
          </div>
        </div>
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

      {/* Export Statement Modal */}
      <ExportModal
        isOpen={isExportOpen}
        inputs={inputs}
        results={results}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
