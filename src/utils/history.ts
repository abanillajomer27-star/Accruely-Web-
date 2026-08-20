import {
  CalculationHistoryItem,
  CalculatorTabType,
  LeaveAccrualInputs,
  LeaveAccrualResults,
  PLCalculatorInputs,
  PLCalculatorResults,
  StandardOTAdjustmentInputs,
  StandardOTAdjustmentResults,
  WeekendPayInputs,
  WeekendPayResults,
} from '../types';
import { formatNum } from './calculator';

const STORAGE_KEY = 'accruely_calculation_history_v1';
const MAX_HISTORY_ITEMS = 100;

export const loadHistory = (): CalculationHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load calculation history:', err);
  }
  return [];
};

export const saveHistory = (items: CalculationHistoryItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch (err) {
    console.error('Failed to save calculation history:', err);
  }
};

export const addHistoryItem = (
  item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>
): CalculationHistoryItem[] => {
  const current = loadHistory();
  const newItem: CalculationHistoryItem = {
    ...item,
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // Prevent duplicate consecutive entries with identical inputs and summary
  const lastItem = current[0];
  if (
    lastItem &&
    lastItem.calculatorType === newItem.calculatorType &&
    lastItem.summary === newItem.summary &&
    JSON.stringify(lastItem.inputs) === JSON.stringify(newItem.inputs)
  ) {
    // If it was created within the last 30 seconds, don't spam duplicate
    const timeDiff = Math.abs(new Date().getTime() - new Date(lastItem.timestamp).getTime());
    if (timeDiff < 30000) {
      return current;
    }
  }

  const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updated);
  return updated;
};

export const deleteHistoryItem = (id: string): CalculationHistoryItem[] => {
  const current = loadHistory();
  const updated = current.filter((item) => item.id !== id);
  saveHistory(updated);
  return updated;
};

export const clearCalculatorHistory = (
  type?: CalculatorTabType | 'all'
): CalculationHistoryItem[] => {
  const current = loadHistory();
  let updated: CalculationHistoryItem[];
  if (type && type !== 'all') {
    updated = current.filter((item) => item.calculatorType !== type);
  } else {
    updated = [];
  }
  saveHistory(updated);
  return updated;
};

// --- FACTORY HELPERS FOR EACH CALCULATOR ---

export const buildLeaveAccrualHistory = (
  inputs: LeaveAccrualInputs,
  results: LeaveAccrualResults
): Omit<CalculationHistoryItem, 'id' | 'timestamp'> => {
  const empName = inputs.employeeName.trim() || 'Unnamed Employee';
  return {
    calculatorType: 'leave-accrual',
    calculatorTitle: 'Leave Accrual Calculator',
    employeeName: empName,
    summary: `${empName} • AL: +${formatNum(results.annualLeaveAccrued, 2)} hrs, PL: +${formatNum(results.personalLeaveAccrued, 2)} hrs`,
    keyMetrics: [
      { label: 'Paid Hours', value: `${formatNum(results.totalPaidHours, 2)} hrs` },
      { label: 'AL Accrued', value: `+${formatNum(results.annualLeaveAccrued, 4)} hrs` },
      { label: 'PL Accrued', value: `+${formatNum(results.personalLeaveAccrued, 4)} hrs` },
      { label: 'AL Closing', value: `${formatNum(results.annualLeaveClosingBalance, 2)} hrs` },
      { label: 'PL Closing', value: `${formatNum(results.personalLeaveClosingBalance, 2)} hrs` },
    ],
    inputs: JSON.parse(JSON.stringify(inputs)),
    results: JSON.parse(JSON.stringify(results)),
  };
};

export const buildPLOpeningBalanceHistory = (
  inputs: PLCalculatorInputs,
  results: PLCalculatorResults
): Omit<CalculationHistoryItem, 'id' | 'timestamp'> => {
  const empName = inputs.employeeName.trim() || 'Unnamed Employee';
  return {
    calculatorType: 'pl-opening-balance',
    calculatorTitle: 'PL Opening Balance Calculator',
    employeeName: empName,
    summary: `${empName} • Target: ${formatNum(results.targetBalance, 2)} hrs (${formatNum(results.targetBalanceDays, 2)} days)`,
    keyMetrics: [
      { label: 'Total Earned', value: `${formatNum(results.grandTotalLeaveEarned, 2)} hrs` },
      { label: 'Total Used', value: `${formatNum(results.totalLeaveUsed, 2)} hrs` },
      { label: 'Target Balance', value: `${formatNum(results.targetBalance, 2)} hrs` },
      { label: 'Target (Days)', value: `${formatNum(results.targetBalanceDays, 2)} days` },
    ],
    inputs: JSON.parse(JSON.stringify(inputs)),
    results: JSON.parse(JSON.stringify(results)),
  };
};

export const buildStandardOTHistory = (
  inputs: StandardOTAdjustmentInputs,
  results: StandardOTAdjustmentResults
): Omit<CalculationHistoryItem, 'id' | 'timestamp'> => {
  const empName = inputs.employeeName.trim() || 'Unnamed Employee';
  return {
    calculatorType: 'standard-ot-adjustment',
    calculatorTitle: 'Standard OT Adjustment Calculator',
    employeeName: empName,
    summary: `${empName} • Adj OT: ${formatNum(results.adjustedStandardOT, 2)} hrs (${formatNum(results.attendancePercentage, 1)}% attendance)`,
    keyMetrics: [
      { label: 'LWOP Days', value: `${inputs.lwopDays} days` },
      { label: 'Ordinary Worked', value: `${formatNum(results.ordinaryHoursWorked, 2)} hrs` },
      { label: 'Attendance', value: `${formatNum(results.attendancePercentage, 1)}%` },
      { label: 'Adjusted OT', value: `${formatNum(results.adjustedStandardOT, 2)} hrs` },
    ],
    inputs: JSON.parse(JSON.stringify(inputs)),
    results: JSON.parse(JSON.stringify(results)),
  };
};

export const buildWeekendPayHistory = (
  inputs: WeekendPayInputs,
  results: WeekendPayResults
): Omit<CalculationHistoryItem, 'id' | 'timestamp'> => {
  const empName = inputs.employeeName?.trim() || 'Jordan Miller';
  const totalHrs = results.totalTimesheetHours || Number(inputs.totalTimesheetHours) || 0;
  const ruleLabel = inputs.payRule === 'casual' ? 'Casual Shift' : inputs.payRule === 'all-overtime' ? 'All Overtime' : 'Weekly 38h';
  return {
    calculatorType: 'weekend-pay',
    calculatorTitle: 'Weekend Split OT Calculator',
    employeeName: empName,
    summary: `${empName} • ${formatNum(totalHrs, 2)} hrs • Gross $${formatNum(results.totalGrossPay, 2)}`,
    keyMetrics: [
      { label: 'Award Rule', value: ruleLabel },
      { label: 'Total Hours', value: `${formatNum(totalHrs, 2)} hrs` },
      { label: 'Hourly Rate', value: `$${formatNum(results.ordinaryHourlyRate, 2)}/hr` },
      { label: 'Gross Pay', value: `$${formatNum(results.totalGrossPay, 2)}` },
    ],
    inputs: JSON.parse(JSON.stringify(inputs)),
    results: JSON.parse(JSON.stringify(results)),
  };
};

// Group history by Today, Yesterday, and Earlier Dates
export interface HistoryDateGroup {
  label: string;
  items: CalculationHistoryItem[];
}

export const groupHistoryByDate = (
  items: CalculationHistoryItem[]
): HistoryDateGroup[] => {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups: { [key: string]: CalculationHistoryItem[] } = {};

  items.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    const dateStr = itemDate.toDateString();

    let groupLabel = dateStr;
    if (dateStr === todayStr) {
      groupLabel = 'Today';
    } else if (dateStr === yesterdayStr) {
      groupLabel = 'Yesterday';
    } else {
      groupLabel = itemDate.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }
    groups[groupLabel].push(item);
  });

  return Object.keys(groups).map((label) => ({
    label,
    items: groups[label],
  }));
};
