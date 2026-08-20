import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Share2,
  Calendar,
  X,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Info,
} from 'lucide-react';
import {
  PLCalculatorInputs,
  PLCalculatorResults,
} from '../types';
import {
  formatNum,
  calculateCompletedYearsAndWeeks,
  formatDateDisplay,
} from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';
import { PLOpeningBalanceExportModal } from './PLOpeningBalanceExportModal';

interface PLOpeningBalanceCalculatorViewProps {
  inputs: PLCalculatorInputs;
  results: PLCalculatorResults;
  onChangeInput: (updater: (prev: PLCalculatorInputs) => PLCalculatorInputs) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  fieldPath: string | null;
  value: string | number;
  type: 'text' | 'number' | 'date';
}

export const PLOpeningBalanceCalculatorView: React.FC<PLOpeningBalanceCalculatorViewProps> = ({
  inputs,
  results,
  onChangeInput,
}) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    fieldPath: null,
    value: '',
    type: 'number',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const handleExportEvent = () => setIsExportOpen(true);
    window.addEventListener('accruely:open-export', handleExportEvent);
    return () => window.removeEventListener('accruely:open-export', handleExportEvent);
  }, []);

  const handleReset = () => {
    onChangeInput(() => ({
      employeeName: 'John Smith',
      standardHoursPerDay: 7.6,
      oldPeriod: {
        commencementDate: '',
        calculationDate: '',
        annualEntitlement: 76.0,
        completedYears: 0,
        remainingWeeks: 0,
      },
      newPeriod: {
        commencementDate: '',
        calculationDate: '',
        annualEntitlement: 76.0,
        completedYears: 0,
        remainingWeeks: 0,
      },
      leaveUsedPreMYOB: 0,
      leaveUsedMYOB: 0,
      leaveUsedXero: 0,
      leaveUsedOther: 0,
      currentOpeningBalanceXero: 0,
      currentXeroBalance: 0,
    }));
  };

  const openEditModal = (
    title: string,
    fieldPath: string,
    value: string | number,
    type: 'text' | 'number' | 'date' = 'number'
  ) => {
    setModal({
      isOpen: true,
      title,
      fieldPath,
      value,
      type,
    });
  };

  const handleSaveModal = (val: string | number) => {
    if (!modal.fieldPath) return;

    onChangeInput((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as PLCalculatorInputs;
      const path = modal.fieldPath!;

      if (path === 'employeeName') {
        next.employeeName = String(val);
      } else if (path === 'standardHoursPerDay') {
        next.standardHoursPerDay = Number(val) || 7.6;
      } else if (path === 'oldPeriod.annualEntitlement') {
        next.oldPeriod.annualEntitlement = Number(val) || 0;
      } else if (path === 'oldPeriod.completedYears') {
        next.oldPeriod.completedYears = Number(val) || 0;
      } else if (path === 'oldPeriod.remainingWeeks') {
        next.oldPeriod.remainingWeeks = Number(val) || 0;
      } else if (path === 'newPeriod.annualEntitlement') {
        next.newPeriod.annualEntitlement = Number(val) || 0;
      } else if (path === 'newPeriod.completedYears') {
        next.newPeriod.completedYears = Number(val) || 0;
      } else if (path === 'newPeriod.remainingWeeks') {
        next.newPeriod.remainingWeeks = Number(val) || 0;
      } else if (path === 'leaveUsedPreMYOB') {
        next.leaveUsedPreMYOB = Number(val) || 0;
      } else if (path === 'leaveUsedMYOB') {
        next.leaveUsedMYOB = Number(val) || 0;
      } else if (path === 'leaveUsedXero') {
        next.leaveUsedXero = Number(val) || 0;
      } else if (path === 'leaveUsedOther') {
        next.leaveUsedOther = Number(val) || 0;
      } else if (path === 'currentOpeningBalanceXero') {
        next.currentOpeningBalanceXero = Number(val) || 0;
      } else if (path === 'currentXeroBalance') {
        next.currentXeroBalance = Number(val) || 0;
      }

      return next;
    });
  };

  // Handlers for dates in Old Period
  const handleOldCommencementChange = (dateVal: string) => {
    onChangeInput((prev) => {
      const next = { ...prev, oldPeriod: { ...prev.oldPeriod, commencementDate: dateVal } };
      if (dateVal && next.oldPeriod.calculationDate) {
        const derived = calculateCompletedYearsAndWeeks(dateVal, next.oldPeriod.calculationDate);
        if (derived) {
          next.oldPeriod.completedYears = derived.completedYears;
          next.oldPeriod.remainingWeeks = derived.remainingWeeks;
        }
      }
      return next;
    });
  };

  const handleOldCalculationDateChange = (dateVal: string) => {
    onChangeInput((prev) => {
      const next = { ...prev, oldPeriod: { ...prev.oldPeriod, calculationDate: dateVal } };
      if (next.oldPeriod.commencementDate && dateVal) {
        const derived = calculateCompletedYearsAndWeeks(next.oldPeriod.commencementDate, dateVal);
        if (derived) {
          next.oldPeriod.completedYears = derived.completedYears;
          next.oldPeriod.remainingWeeks = derived.remainingWeeks;
        }
      }
      return next;
    });
  };

  const handleClearOldDates = () => {
    onChangeInput((prev) => ({
      ...prev,
      oldPeriod: {
        ...prev.oldPeriod,
        commencementDate: '',
        calculationDate: '',
      },
    }));
  };

  // Handlers for dates in New Period
  const handleNewCommencementChange = (dateVal: string) => {
    onChangeInput((prev) => {
      const next = { ...prev, newPeriod: { ...prev.newPeriod, commencementDate: dateVal } };
      if (dateVal && next.newPeriod.calculationDate) {
        const derived = calculateCompletedYearsAndWeeks(dateVal, next.newPeriod.calculationDate);
        if (derived) {
          next.newPeriod.completedYears = derived.completedYears;
          next.newPeriod.remainingWeeks = derived.remainingWeeks;
        }
      }
      return next;
    });
  };

  const handleNewCalculationDateChange = (dateVal: string) => {
    onChangeInput((prev) => {
      const next = { ...prev, newPeriod: { ...prev.newPeriod, calculationDate: dateVal } };
      if (next.newPeriod.commencementDate && dateVal) {
        const derived = calculateCompletedYearsAndWeeks(next.newPeriod.commencementDate, dateVal);
        if (derived) {
          next.newPeriod.completedYears = derived.completedYears;
          next.newPeriod.remainingWeeks = derived.remainingWeeks;
        }
      }
      return next;
    });
  };

  const handleClearNewDates = () => {
    onChangeInput((prev) => ({
      ...prev,
      newPeriod: {
        ...prev.newPeriod,
        commencementDate: '',
        calculationDate: '',
      },
    }));
  };

  const isOldDateDerived = Boolean(inputs.oldPeriod.commencementDate && inputs.oldPeriod.calculationDate);
  const isNewDateDerived = Boolean(inputs.newPeriod.commencementDate && inputs.newPeriod.calculationDate);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* TOP ACTIONS / RESET */}
      <div className="flex justify-end items-center">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 hover:text-zinc-900 dark:hover:text-white"
          title="Reset PL Opening Balance Calculator"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. EMPLOYEE & SERVICE PARAMETERS */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>1. EMPLOYEE & SERVICE PARAMETERS</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Entitlement Periods & Hours
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-6">
          {/* General Information Sub-Header */}
          <div className="bg-white/80 dark:bg-zinc-800/60 rounded-xl p-4 border border-orange-200/70 dark:border-zinc-700/80">
            <h3 className="text-sm font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wider mb-3">
              General Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee Name */}
              <div className="flex flex-col justify-between gap-1.5">
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Employee Name
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
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-semibold text-sm transition-all cursor-pointer w-full"
                >
                  <span className="truncate">
                    {inputs.employeeName || 'Tap to enter'}
                  </span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Standard Hours Per Day */}
              <div className="flex flex-col justify-between gap-1.5">
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Standard Hours Per Day
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Standard Hours Per Day',
                      'standardHoursPerDay',
                      inputs.standardHoursPerDay,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm transition-all cursor-pointer w-full"
                >
                  <span>{formatNum(inputs.standardHoursPerDay, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* OLD & NEW ENTITLEMENT PERIODS IN TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* OLD ENTITLEMENT PERIOD */}
            <div className="bg-white/80 dark:bg-zinc-800/60 rounded-xl p-4 sm:p-5 border border-orange-200/70 dark:border-zinc-700/80 space-y-3.5 h-full">
              <div className="flex items-center justify-between border-b border-orange-200/50 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    OLD ENTITLEMENT PERIOD
                  </h3>
                </div>
                {(inputs.oldPeriod.commencementDate || inputs.oldPeriod.calculationDate) && (
                  <button
                    onClick={handleClearOldDates}
                    className="flex items-center gap-1 text-xs text-orange-700 dark:text-orange-400 hover:underline font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear dates</span>
                  </button>
                )}
              </div>

              {/* Commencement Date (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Commencement Date (Old Rate) <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative min-w-[180px]">
                  <input
                    type="date"
                    value={inputs.oldPeriod.commencementDate || ''}
                    onChange={(e) => handleOldCommencementChange(e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50/70 dark:bg-zinc-900 border border-orange-200 hover:border-orange-400 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculation Date (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Calculation Date (Old Rate) <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative min-w-[180px]">
                  <input
                    type="date"
                    value={inputs.oldPeriod.calculationDate || ''}
                    onChange={(e) => handleOldCalculationDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50/70 dark:bg-zinc-900 border border-orange-200 hover:border-orange-400 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Completed Years (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Completed Years (Old Rate)
                </label>
                <button
                  id="btn-edit-old-completed-years-sec1"
                  onClick={() =>
                    openEditModal(
                      'Completed Years (Old Rate)',
                      'oldPeriod.completedYears',
                      inputs.oldPeriod.completedYears,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.oldPeriod.completedYears, 2)} yrs</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Remaining Weeks (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Remaining Weeks (Old Rate)
                </label>
                <button
                  id="btn-edit-old-remaining-weeks-sec1"
                  onClick={() =>
                    openEditModal(
                      'Remaining Weeks (Old Rate)',
                      'oldPeriod.remainingWeeks',
                      inputs.oldPeriod.remainingWeeks,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.oldPeriod.remainingWeeks, 4)} wks</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Annual Personal Leave Entitlement (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Annual Personal Leave Entitlement (Old Rate)
                </label>
                <button
                  id="btn-edit-old-annual-entitlement-sec1"
                  onClick={() =>
                    openEditModal(
                      'Annual Personal Leave Entitlement (Old Rate) (hrs)',
                      'oldPeriod.annualEntitlement',
                      inputs.oldPeriod.annualEntitlement,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.oldPeriod.annualEntitlement, 2)} hrs</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* NEW ENTITLEMENT PERIOD */}
            <div className="bg-white/80 dark:bg-zinc-800/60 rounded-xl p-4 sm:p-5 border border-orange-200/70 dark:border-zinc-700/80 space-y-3.5 h-full">
              <div className="flex items-center justify-between border-b border-orange-200/50 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    NEW ENTITLEMENT PERIOD
                  </h3>
                </div>
                {(inputs.newPeriod.commencementDate || inputs.newPeriod.calculationDate) && (
                  <button
                    onClick={handleClearNewDates}
                    className="flex items-center gap-1 text-xs text-orange-700 dark:text-orange-400 hover:underline font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear dates</span>
                  </button>
                )}
              </div>

              {/* Commencement Date (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Commencement Date (New Rate) <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative min-w-[180px]">
                  <input
                    type="date"
                    value={inputs.newPeriod.commencementDate || ''}
                    onChange={(e) => handleNewCommencementChange(e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50/70 dark:bg-zinc-900 border border-orange-200 hover:border-orange-400 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculation Date (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Calculation Date (New Rate) <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative min-w-[180px]">
                  <input
                    type="date"
                    value={inputs.newPeriod.calculationDate || ''}
                    onChange={(e) => handleNewCalculationDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50/70 dark:bg-zinc-900 border border-orange-200 hover:border-orange-400 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Completed Years (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Completed Years (New Rate)
                </label>
                <button
                  id="btn-edit-new-completed-years-sec1"
                  onClick={() =>
                    openEditModal(
                      'Completed Years (New Rate)',
                      'newPeriod.completedYears',
                      inputs.newPeriod.completedYears,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.newPeriod.completedYears, 2)} yrs</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Remaining Weeks (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Remaining Weeks (New Rate)
                </label>
                <button
                  id="btn-edit-new-remaining-weeks-sec1"
                  onClick={() =>
                    openEditModal(
                      'Remaining Weeks (New Rate)',
                      'newPeriod.remainingWeeks',
                      inputs.newPeriod.remainingWeeks,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.newPeriod.remainingWeeks, 4)} wks</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Annual Personal Leave Entitlement (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Annual Personal Leave Entitlement (New Rate)
                </label>
                <button
                  id="btn-edit-new-annual-entitlement-sec1"
                  onClick={() =>
                    openEditModal(
                      'Annual Personal Leave Entitlement (New Rate) (hrs)',
                      'newPeriod.annualEntitlement',
                      inputs.newPeriod.annualEntitlement,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-xs sm:text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.newPeriod.annualEntitlement, 2)} hrs</span>
                  <Pencil className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SERVICE & LEAVE ACCRUED */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>2. SERVICE & LEAVE ACCRUED</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Old & New Rate Calculation
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-6">
          {/* OLD & NEW RATE SECTIONS IN TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* OLD RATE SECTION */}
            <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 space-y-3 h-full">
              <div className="flex items-center justify-between border-b border-orange-200/60 dark:border-zinc-700 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    OLD RATE
                  </h3>
                </div>
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md">
                  Entitlement: {formatNum(inputs.oldPeriod.annualEntitlement, 2)} hrs/yr
                </span>
              </div>

              {/* Completed Years of Service (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Completed Years of Service
                  </span>
                  {isOldDateDerived && (
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Auto-calculated from full anniversaries
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    openEditModal(
                      'Completed Years of Service (Old Rate)',
                      'oldPeriod.completedYears',
                      inputs.oldPeriod.completedYears,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(results.oldRate.completedYears, 2)} yrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Additional Year Hours (Old Rate) (auto-calculated) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Additional Year Hours (automatic)
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.oldRate.additionalYearHours, 4)} hrs
                </div>
              </div>

              {/* Remaining Weeks (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Remaining Weeks
                  </span>
                  {isOldDateDerived && (
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Weeks after last anniversary
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    openEditModal(
                      'Remaining Weeks (Old Rate)',
                      'oldPeriod.remainingWeeks',
                      inputs.oldPeriod.remainingWeeks,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(results.oldRate.remainingWeeks, 4)} wks</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Weekly Accrual Rate (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Weekly Accrual Rate (Entitlement ÷ 52)
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.oldRate.weeklyAccrualRate, 4)} hrs/wk
                </div>
              </div>

              {/* Remaining Weeks Hours (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Remaining Weeks Hours
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.oldRate.remainingWeeksHours, 4)} hrs
                </div>
              </div>

              {/* Total Leave Earned (Old Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-200/60 dark:border-zinc-700/80 bg-orange-100/50 dark:bg-zinc-800/90 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-xl">
                <span className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-300">
                  Total Leave Earned (Old Rate)
                </span>
                <span className="text-base sm:text-lg font-extrabold text-orange-950 dark:text-zinc-100 text-right">
                  {formatNum(results.oldRate.totalLeaveEarned, 4)} hrs
                </span>
              </div>
            </div>

            {/* NEW RATE SECTION */}
            <div className="bg-white/90 dark:bg-zinc-800/80 rounded-xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 space-y-3 h-full">
              <div className="flex items-center justify-between border-b border-orange-200/60 dark:border-zinc-700 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    NEW RATE
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900 px-2.5 py-1 rounded-md">
                  Entitlement: {formatNum(inputs.newPeriod.annualEntitlement, 2)} hrs/yr
                </span>
              </div>

              {/* Completed Years of Service (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Completed Years of Service
                  </span>
                  {isNewDateDerived && (
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Auto-calculated from full anniversaries
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    openEditModal(
                      'Completed Years of Service (New Rate)',
                      'newPeriod.completedYears',
                      inputs.newPeriod.completedYears,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(results.newRate.completedYears, 2)} yrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Additional Year Hours (New Rate) (auto-calculated) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Additional Year Hours (automatic)
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.newRate.additionalYearHours, 4)} hrs
                </div>
              </div>

              {/* Remaining Weeks (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Remaining Weeks
                  </span>
                  {isNewDateDerived && (
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Weeks after last anniversary
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    openEditModal(
                      'Remaining Weeks (New Rate)',
                      'newPeriod.remainingWeeks',
                      inputs.newPeriod.remainingWeeks,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(results.newRate.remainingWeeks, 4)} wks</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Weekly Accrual Rate (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Weekly Accrual Rate (Entitlement ÷ 52)
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.newRate.weeklyAccrualRate, 4)} hrs/wk
                </div>
              </div>

              {/* Remaining Weeks Hours (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Remaining Weeks Hours
                </span>
                <div className="px-4 py-2 bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-200/70 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base text-right min-w-[140px]">
                  {formatNum(results.newRate.remainingWeeksHours, 4)} hrs
                </div>
              </div>

              {/* Total Leave Earned (New Rate) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-200/60 dark:border-zinc-700/80 bg-orange-100/50 dark:bg-zinc-800/90 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-xl">
                <span className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-300">
                  Total Leave Earned (New Rate)
                </span>
                <span className="text-base sm:text-lg font-extrabold text-orange-950 dark:text-zinc-100 text-right">
                  {formatNum(results.newRate.totalLeaveEarned, 4)} hrs
                </span>
              </div>
            </div>
          </div>

          {/* GRAND TOTAL LEAVE EARNED */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-200" />
                <h3 className="text-base sm:text-lg font-extrabold tracking-wide uppercase">
                  Grand Total Leave Earned
                </h3>
              </div>
              <p className="text-xs text-orange-100 opacity-90 mt-0.5">
                Old Total ({formatNum(results.oldRate.totalLeaveEarned, 2)} hrs) + New Total ({formatNum(results.newRate.totalLeaveEarned, 2)} hrs)
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {formatNum(results.grandTotalLeaveEarned, 4)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. PERSONAL LEAVE TAKEN & TARGET ENTITLEMENT BALANCE IN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 3. PERSONAL LEAVE TAKEN / USED */}
        <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors h-full flex flex-col justify-between">
          <div>
            {/* Banner Header */}
            <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
              <span>3. PERSONAL LEAVE TAKEN / USED</span>
              <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
                Historical System Deductions
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Pre-MYOB */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Leave Used (Pre-MYOB)
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Personal Leave Used (Pre-MYOB) (hrs)',
                      'leaveUsedPreMYOB',
                      inputs.leaveUsedPreMYOB,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.leaveUsedPreMYOB, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* MYOB */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Leave Used (MYOB)
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Personal Leave Used (MYOB) (hrs)',
                      'leaveUsedMYOB',
                      inputs.leaveUsedMYOB,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.leaveUsedMYOB, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Xero */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Leave Used (Xero)
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Personal Leave Used (Xero) (hrs)',
                      'leaveUsedXero',
                      inputs.leaveUsedXero,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.leaveUsedXero, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Other */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Leave Used (Other)
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Personal Leave Used (Other) (hrs)',
                      'leaveUsedOther',
                      inputs.leaveUsedOther,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm sm:text-base transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.leaveUsedOther, 2)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Total Personal Leave Used - Highlighted */}
          <div className="p-4 bg-orange-100/80 dark:bg-zinc-800/90 border-t border-orange-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-300">
              Total Personal Leave Used
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-orange-950 dark:text-zinc-100 text-right">
              {formatNum(results.totalLeaveUsed, 4)} hrs
            </span>
          </div>
        </div>

        {/* 4. TARGET ENTITLEMENT BALANCE */}
        <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors h-full flex flex-col justify-between">
          <div>
            {/* Banner Header */}
            <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase">
              4. TARGET ENTITLEMENT BALANCE
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Big Target Balance Highlight Box */}
              <div className="p-5 bg-white dark:bg-zinc-800/90 rounded-2xl border-2 border-orange-300 dark:border-orange-600/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                    Target Personal Leave Balance
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Grand Total Earned ({formatNum(results.grandTotalLeaveEarned, 2)} hrs) − Total Used ({formatNum(results.totalLeaveUsed, 2)} hrs)
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-4xl font-black text-orange-950 dark:text-zinc-50 tracking-tight">
                    {formatNum(results.targetBalance, 4)} <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">hrs</span>
                  </span>
                </div>
              </div>

              {/* Days & Weeks Equivalents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white/80 dark:bg-zinc-800/60 rounded-xl border border-orange-200/60 dark:border-zinc-700">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Equivalent Days ({inputs.standardHoursPerDay} hrs/day)
                  </span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {formatNum(results.targetBalanceDays, 2)} <span className="text-sm font-medium text-zinc-500">days</span>
                  </span>
                </div>

                <div className="p-4 bg-white/80 dark:bg-zinc-800/60 rounded-xl border border-orange-200/60 dark:border-zinc-700">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Equivalent Weeks ({inputs.standardHoursPerDay * 5} hrs/wk)
                  </span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {formatNum(results.targetBalanceWeeks, 2)} <span className="text-sm font-medium text-zinc-500">weeks</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. XERO PL BALANCE CHECKER */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl shadow-sm border border-orange-200/80 dark:border-zinc-800 overflow-hidden transition-colors">
        {/* Banner Header */}
        <div className="bg-orange-600 dark:bg-orange-700 text-white px-5 py-3 font-bold text-base tracking-wider uppercase flex items-center justify-between">
          <span>5. XERO PL BALANCE CHECKER</span>
          <span className="text-xs font-normal normal-case opacity-90 hidden sm:inline">
            Opening Balance Adjustment
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Prominent Updated Box */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-gradient-to-br from-amber-500 via-orange-600 to-orange-700 text-white rounded-2xl shadow-md flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-100">
                    Updated Balance (Enter this into Xero)
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-orange-200" />
                </div>
                <div className="pt-3">
                  <span className="text-3xl sm:text-5xl font-black tracking-tight text-white block">
                    {formatNum(results.xeroUpdatedBalance, 4)} <span className="text-lg sm:text-2xl font-bold text-orange-200">hrs</span>
                  </span>
                  <span className="text-xs text-orange-100 opacity-90 font-medium block mt-1">
                    Target Personal Leave: {formatNum(results.targetBalance, 2)} hrs
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-orange-100 opacity-85 pt-2 border-t border-orange-400/40">
                Formula: Current Opening in Xero + Target Balance − Current Xero Balance
              </p>
            </div>

            {/* Breakdown Fields */}
            <div className="lg:col-span-6 bg-white/90 dark:bg-zinc-800/80 rounded-2xl p-4 sm:p-5 border border-orange-200/80 dark:border-zinc-700 flex flex-col justify-center space-y-3">
              {/* Current Opening Balance in Xero (editable) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Current Opening Balance in Xero
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Current Opening Balance in Xero (hrs)',
                      'currentOpeningBalanceXero',
                      inputs.currentOpeningBalanceXero,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.currentOpeningBalanceXero, 4)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>

              {/* Target Balance (linked from Target Entitlement Balance) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Target Balance
                  </label>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">(Linked)</span>
                </div>
                <div className="px-4 py-2 bg-orange-100/60 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-orange-400 font-extrabold text-sm text-right min-w-[140px]">
                  {formatNum(results.targetBalance, 4)} hrs
                </div>
              </div>

              {/* Current Xero Balance (editable) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Current Xero Balance
                </label>
                <button
                  onClick={() =>
                    openEditModal(
                      'Current Xero Balance (hrs)',
                      'currentXeroBalance',
                      inputs.currentXeroBalance,
                      'number'
                    )
                  }
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-orange-100/80 border border-orange-200 hover:border-orange-400 dark:bg-zinc-800 dark:border-zinc-700 rounded-xl text-orange-950 dark:text-zinc-100 font-bold text-sm transition-all cursor-pointer min-w-[140px]"
                >
                  <span>{formatNum(inputs.currentXeroBalance, 4)} hrs</span>
                  <Pencil className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share / Export Action Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>Export & Share PL Statement</span>
        </button>
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
      <PLOpeningBalanceExportModal
        isOpen={isExportOpen}
        inputs={inputs}
        results={results}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
