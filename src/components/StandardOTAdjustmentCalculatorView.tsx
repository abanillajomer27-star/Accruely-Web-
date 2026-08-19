import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Share2,
  Calculator,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import {
  StandardOTAdjustmentInputs,
  StandardOTAdjustmentResults,
} from '../types';
import {
  formatNum,
  generateStandardOTAdjustmentStatementText,
} from '../utils/calculator';
import { EditFieldModal } from './EditFieldModal';
import { StandardOTAdjustmentExportModal } from './StandardOTAdjustmentExportModal';

interface StandardOTAdjustmentCalculatorViewProps {
  inputs: StandardOTAdjustmentInputs;
  results: StandardOTAdjustmentResults;
  onChangeInput: (
    updater: (prev: StandardOTAdjustmentInputs) => StandardOTAdjustmentInputs
  ) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  fieldKey: keyof StandardOTAdjustmentInputs | null;
  value: string | number;
  type: 'text' | 'number';
}

export const StandardOTAdjustmentCalculatorView: React.FC<
  StandardOTAdjustmentCalculatorViewProps
> = ({ inputs, results, onChangeInput }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    fieldKey: null,
    value: '',
    type: 'number',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);

  useEffect(() => {
    const handleExportEvent = () => setIsExportOpen(true);
    window.addEventListener('accruely:open-export', handleExportEvent);
    return () => window.removeEventListener('accruely:open-export', handleExportEvent);
  }, []);

  const handleReset = () => {
    onChangeInput(() => ({
      employeeName: 'John Smith',
      standardOrdinaryHours: 38,
      standardOT: 2,
      lwopDays: 0,
    }));
  };

  const openEditModal = (
    title: string,
    fieldKey: keyof StandardOTAdjustmentInputs,
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

  // Quick Preset Handlers
  const applyPreset76 = () => {
    onChangeInput((prev) => ({
      ...prev,
      standardOrdinaryHours: 38,
      standardOT: 2,
    }));
  };

  const applyPreset88 = () => {
    onChangeInput((prev) => ({
      ...prev,
      standardOrdinaryHours: 44,
      standardOT: 2,
    }));
  };

  const isPreset76Active =
    inputs.standardOrdinaryHours === 38 && inputs.standardOT === 2;
  const isPreset88Active =
    inputs.standardOrdinaryHours === 44 && inputs.standardOT === 2;

  const statementText = generateStandardOTAdjustmentStatementText(inputs, results);

  const attendancePercentDisplay = (results.attendancePercentage * 100).toFixed(2);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* TOP ACTIONS / RESET */}
      <div className="flex justify-end items-center">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 hover:text-zinc-900 dark:hover:text-white"
          title="Reset Standard OT Adjustment Calculator"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. QUICK PRESETS */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Quick Presets
          </h2>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3.5 leading-relaxed">
          Select standard weekly employment hours to auto-populate standard ordinary hours and standard overtime:
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={applyPreset76}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
              isPreset76Active
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 dark:border-orange-500 shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50'
            }`}
          >
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              76-Hour Employee
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              38h Ord / 2h OT (7.6h/day)
            </span>
            {isPreset76Active && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                <CheckCircle2 className="w-3 h-3" /> Active Preset
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={applyPreset88}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
              isPreset88Active
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 dark:border-orange-500 shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50'
            }`}
          >
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              88-Hour Employee
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              44h Ord / 2h OT (8.8h/day)
            </span>
            {isPreset88Active && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                <CheckCircle2 className="w-3 h-3" /> Active Preset
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. EMPLOYEE & INPUT PARAMETERS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Input Parameters
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Prorated for LWOP
          </span>
        </div>

        {/* Employee Name */}
        <div
          onClick={() =>
            openEditModal('Employee Name', 'employeeName', inputs.employeeName, 'text')
          }
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-orange-50/60 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              Employee Name
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {inputs.employeeName || 'John Smith'}
            </span>
          </div>
          <button
            type="button"
            className="p-1.5 text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Standard Ordinary Hours */}
        <div
          onClick={() =>
            openEditModal(
              'Standard Ordinary Hours',
              'standardOrdinaryHours',
              inputs.standardOrdinaryHours
            )
          }
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-orange-50/60 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              Standard Ordinary Hours (Weekly)
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatNum(inputs.standardOrdinaryHours, 2)} hrs
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Standard Hours/Day: {formatNum(results.standardHoursPerDay, 2)} hrs (÷ 5 days)
            </span>
          </div>
          <button
            type="button"
            className="p-1.5 text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Standard Overtime (OT) */}
        <div
          onClick={() =>
            openEditModal('Standard Overtime (OT)', 'standardOT', inputs.standardOT)
          }
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-orange-50/60 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              Standard Overtime (OT)
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatNum(inputs.standardOT, 2)} hrs
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Fixed regular weekly overtime entitlement
            </span>
          </div>
          <button
            type="button"
            className="p-1.5 text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* LWOP Days */}
        <div
          onClick={() =>
            openEditModal('Leave Without Pay (LWOP) Days', 'lwopDays', inputs.lwopDays)
          }
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-orange-50/60 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              Leave Without Pay (LWOP) Days
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatNum(inputs.lwopDays, 2)} {inputs.lwopDays === 1 ? 'day' : 'days'}
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 block mt-0.5 font-medium">
              LWOP Hours: {formatNum(results.lwopHours, 2)} hrs ({formatNum(inputs.lwopDays, 2)} × {formatNum(results.standardHoursPerDay, 2)})
            </span>
          </div>
          <button
            type="button"
            className="p-1.5 text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. HERO RESULT: ADJUSTED STANDARD OT */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-600 to-amber-700 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Final Result
            </span>
            <span className="px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-xs">
              Attendance: {attendancePercentDisplay}%
            </span>
          </div>

          <div className="mt-1 mb-4">
            <span className="text-xs text-orange-100 font-medium block">
              Adjusted Standard Overtime
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {formatNum(results.adjustedStandardOT, 2)}
              </span>
              <span className="text-lg font-bold text-orange-200">hrs</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-center">
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
              <span className="text-[10px] text-orange-200 block uppercase font-medium">
                LWOP Hours
              </span>
              <span className="text-sm font-bold text-white">
                {formatNum(results.lwopHours, 2)}h
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
              <span className="text-[10px] text-orange-200 block uppercase font-medium">
                Ordinary Worked
              </span>
              <span className="text-sm font-bold text-white">
                {formatNum(results.ordinaryHoursWorked, 2)}h
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
              <span className="text-[10px] text-orange-200 block uppercase font-medium">
                Original OT
              </span>
              <span className="text-sm font-bold text-white">
                {formatNum(inputs.standardOT, 2)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STEP-BY-STEP CALCULATION BREAKDOWN */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                Calculation Breakdown
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Mathematical steps and formula verification
              </p>
            </div>
          </div>
          {isBreakdownOpen ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {isBreakdownOpen && (
          <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm">
            {/* Step 1 */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                <span>1. Standard Hours Per Day</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {formatNum(results.standardHoursPerDay, 2)} hrs/day
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                = {formatNum(inputs.standardOrdinaryHours, 2)} (Standard Ordinary Hours) ÷ 5
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                <span>2. LWOP Hours Deducted</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {formatNum(results.lwopHours, 2)} hrs
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                = {formatNum(inputs.lwopDays, 2)} days × {formatNum(results.standardHoursPerDay, 2)} hrs/day
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                <span>3. Ordinary Hours Worked</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {formatNum(results.ordinaryHoursWorked, 2)} hrs
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                = {formatNum(inputs.standardOrdinaryHours, 2)} (Std Hours) − {formatNum(results.lwopHours, 2)} (LWOP Hours)
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                <span>4. Attendance Percentage</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {attendancePercentDisplay}%
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                = {formatNum(results.ordinaryHoursWorked, 2)} ÷ {formatNum(inputs.standardOrdinaryHours, 2)}
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-orange-950 dark:text-orange-200">
                <span>5. Adjusted Standard OT</span>
                <span className="text-base text-orange-600 dark:text-orange-400">
                  {formatNum(results.adjustedStandardOT, 2)} hrs
                </span>
              </div>
              <p className="text-xs text-orange-800/80 dark:text-orange-300 font-mono">
                = {formatNum(inputs.standardOT, 2)} (Standard OT) × {attendancePercentDisplay}% (Attendance)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. EXPORT / SHARE ACTION */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
        >
          <Share2 className="w-5 h-5 text-orange-100" />
          <span>Export / Share Statement</span>
        </button>
      </div>

      {/* EDIT MODAL */}
      <EditFieldModal
        isOpen={modal.isOpen}
        title={modal.title}
        initialValue={modal.value}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModal}
      />

      {/* EXPORT MODAL */}
      <StandardOTAdjustmentExportModal
        isOpen={isExportOpen}
        inputs={inputs}
        results={results}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
