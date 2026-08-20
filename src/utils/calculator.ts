import {
  LeaveAccrualInputs,
  LeaveAccrualResults,
  PLCalculatorInputs,
  PLCalculatorResults,
  PeriodAccrualResults,
  StandardOTAdjustmentInputs,
  StandardOTAdjustmentResults,
  WeekendPayInputs,
  WeekendPayResults,
  SplitTierResult,
  SplitHoursResult,
  WeekendCalculatorMode,
  CategoryResultItem,
  DayWorked,
  DaySplitResult,
  PayrollCategoryItem,
  DayCategorySplitItem,
  OvertimeRateSplit,
} from '../types';
import { getAwardRuleById } from './weekendRules';

/**
 * Calculates completed full years of service and remaining weeks after the last anniversary.
 * Rule: Completed Years means FULL completed anniversaries only.
 * If the calculation date has not yet reached the anniversary date, it does not count another year.
 * Remaining Weeks represents the weeks after the last completed anniversary (Days since last anniversary ÷ 7).
 * Pure calendar-date arithmetic with zero timezone or DST offsets.
 */
function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function parseCalendarDate(s?: string): { y: number; m: number; d: number } | null {
  if (!s || typeof s !== 'string') return null;
  const trimmed = s.trim();
  if (!trimmed) return null;

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { y, m, d };
      }
    }
  }

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { y, m, d };
      }
    }
  }

  const dt = new Date(trimmed);
  if (!isNaN(dt.getTime())) {
    return {
      y: dt.getFullYear(),
      m: dt.getMonth() + 1,
      d: dt.getDate(),
    };
  }

  return null;
}

export function calculateCompletedYearsAndWeeks(
  startDateStr?: string,
  calcDateStr?: string
): { completedYears: number; remainingWeeks: number } | null {
  if (!startDateStr || !calcDateStr) return null;

  const start = parseCalendarDate(startDateStr);
  const end = parseCalendarDate(calcDateStr);

  if (!start || !end) return null;

  // If end date is before start date
  if (
    end.y < start.y ||
    (end.y === start.y && (end.m < start.m || (end.m === start.m && end.d < start.d)))
  ) {
    return { completedYears: 0, remainingWeeks: 0 };
  }

  // 1. Calculate full completed anniversary years only
  let years = end.y - start.y;
  if (end.m < start.m || (end.m === start.m && end.d < start.d)) {
    years -= 1;
  }
  const completedYears = Math.max(0, years);

  // 2. Determine exact last anniversary date
  const annY = start.y + completedYears;
  const annM = start.m;
  let annD = start.d;

  // Handle Feb 29 on non-leap years (clamps to Feb 28 matching Android LocalDate)
  if (annM === 2 && annD === 29 && !isLeapYear(annY)) {
    annD = 28;
  }

  // 3. Count exact calendar days between last anniversary and calculation date
  const ms = Date.UTC(end.y, end.m - 1, end.d) - Date.UTC(annY, annM - 1, annD);
  const daysDiff = Math.max(0, Math.round(ms / 86400000));

  // 4. Remaining Weeks = Days since last anniversary ÷ 7 (Full precision)
  const remainingWeeks = daysDiff / 7;

  return {
    completedYears,
    remainingWeeks,
  };
}

/**
 * Calculates leave accruals for a single entitlement period (Old Rate or New Rate).
 */
export function calculatePeriodAccrual(
  annualEntitlement: number,
  completedYears: number,
  remainingWeeks: number
): PeriodAccrualResults {
  const entitlement = Number(annualEntitlement) || 0;
  const years = Number(completedYears) || 0;
  const weeks = Number(remainingWeeks) || 0;

  // Weekly Accrual Rate = Annual PL Entitlement ÷ 52
  const weeklyAccrualRate = entitlement / 52;

  // Additional Year Hours = Completed Years × Annual PL Entitlement
  const additionalYearHours = years * entitlement;

  // Remaining Weeks Hours = Remaining Weeks × Weekly Accrual Rate
  const remainingWeeksHours = weeks * weeklyAccrualRate;

  // Total Leave Earned = Additional Year Hours + Remaining Weeks Hours
  const totalLeaveEarned = additionalYearHours + remainingWeeksHours;

  return {
    completedYears: years,
    annualEntitlement: entitlement,
    weeklyAccrualRate,
    additionalYearHours,
    remainingWeeks: weeks,
    remainingWeeksHours,
    totalLeaveEarned,
  };
}

/**
 * Main calculation engine for PL Opening Balance Calculator & Xero PL Balance Checker.
 */
export function calculatePLOpeningBalance(inputs: PLCalculatorInputs): PLCalculatorResults {
  const stdHoursPerDay = Number(inputs.standardHoursPerDay) > 0 ? Number(inputs.standardHoursPerDay) : 7.6;

  // Use the inputs' completedYears and remainingWeeks directly (allowing direct editing)
  const oldYears = Number(inputs.oldPeriod.completedYears) || 0;
  const oldWeeks = Number(inputs.oldPeriod.remainingWeeks) || 0;

  const newYears = Number(inputs.newPeriod.completedYears) || 0;
  const newWeeks = Number(inputs.newPeriod.remainingWeeks) || 0;

  // Calculate Old Rate & New Rate
  const oldRate = calculatePeriodAccrual(inputs.oldPeriod.annualEntitlement, oldYears, oldWeeks);
  const newRate = calculatePeriodAccrual(inputs.newPeriod.annualEntitlement, newYears, newWeeks);

  // Grand Total Leave Earned = Old Rate Total + New Rate Total
  const grandTotalLeaveEarned = oldRate.totalLeaveEarned + newRate.totalLeaveEarned;

  // Personal Leave Taken / Used
  const leaveUsedPreMYOB = Number(inputs.leaveUsedPreMYOB) || 0;
  const leaveUsedMYOB = Number(inputs.leaveUsedMYOB) || 0;
  const leaveUsedXero = Number(inputs.leaveUsedXero) || 0;
  const leaveUsedOther = Number(inputs.leaveUsedOther) || 0;

  const totalLeaveUsed = leaveUsedPreMYOB + leaveUsedMYOB + leaveUsedXero + leaveUsedOther;

  // Target Balance = Grand Total Leave Earned - Total Personal Leave Used
  const targetBalance = grandTotalLeaveEarned - totalLeaveUsed;

  // Equivalent in Days and Weeks
  const targetBalanceDays = targetBalance / stdHoursPerDay;
  const targetBalanceWeeks = targetBalance / (stdHoursPerDay * 5);

  // Xero PL Balance Checker:
  // Updated Balance = Current Opening Balance in Xero + Target Balance - Current Xero Balance
  const currentOpeningXero = Number(inputs.currentOpeningBalanceXero) || 0;
  const currentXeroBal = Number(inputs.currentXeroBalance) || 0;
  const xeroUpdatedBalance = currentOpeningXero + targetBalance - currentXeroBal;

  return {
    oldRate,
    newRate,
    grandTotalLeaveEarned,
    totalLeaveUsed,
    targetBalance,
    targetBalanceDays,
    targetBalanceWeeks,
    xeroUpdatedBalance,
  };
}

/**
 * Calculation engine for the standard Leave Accrual Calculator (pay run accruals).
 * Uses exact precision internally with no intermediate rounding.
 */
export function calculateLeaveAccrual(inputs: LeaveAccrualInputs): LeaveAccrualResults {
  const ordinaryHours = Number(inputs.ordinaryHours) || 0;
  const publicHolidayHours = Number(inputs.publicHolidayHours) || 0;
  const annualLeaveTaken = Number(inputs.annualLeaveTaken) || 0;
  const personalLeaveTaken = Number(inputs.personalLeaveTaken) || 0;
  const totalHoursForPeriod = Number(inputs.totalHoursForPeriod) || 0;

  // Total Paid Hours = Ordinary Hours + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken
  const totalPaidHours = ordinaryHours + publicHolidayHours + annualLeaveTaken + personalLeaveTaken;

  // Leave Without Pay Hours = Total Hours For The Pay Period - Total Paid Hours
  const leaveWithoutPayHours = Math.max(0, totalHoursForPeriod - totalPaidHours);

  // Accrual Rates (Internal full precision)
  let annualLeaveAccrualRate = 0;
  let personalLeaveAccrualRate = 0;

  if (inputs.overrideDefaultRates) {
    annualLeaveAccrualRate = Number(inputs.customAnnualLeaveAccrualRate) || 0;
    personalLeaveAccrualRate = Number(inputs.customPersonalLeaveAccrualRate) || 0;
  } else {
    switch (inputs.profile) {
      case 'Casual Employee':
        annualLeaveAccrualRate = 0;
        personalLeaveAccrualRate = 0;
        break;
      case 'Custom Company Policy':
        annualLeaveAccrualRate = Number(inputs.customAnnualLeaveAccrualRate) || 0;
        personalLeaveAccrualRate = Number(inputs.customPersonalLeaveAccrualRate) || 0;
        break;
      case 'Australian NES Full-Time':
      case 'Australian NES Part-Time (Pro-rata)':
      default:
        // Australian NES Full-Time Annual Leave: 4 weeks ÷ 52 weeks = 0.0769230769...
        annualLeaveAccrualRate = 4 / 52;
        // Australian NES Personal Leave: 10 days ÷ 260 working days = 0.0384615385...
        personalLeaveAccrualRate = 10 / 260;
        break;
    }
  }

  // Annual Leave Calculations
  const annualLeaveOpeningBalance = Number(inputs.annualLeaveOpeningBalance) || 0;
  const annualLeaveAccrued = totalPaidHours * annualLeaveAccrualRate;
  const availableAnnualLeave = annualLeaveOpeningBalance + annualLeaveAccrued;
  const annualLeaveClosingBalance = availableAnnualLeave - annualLeaveTaken;

  // Personal Leave Calculations
  const personalLeaveOpeningBalance = Number(inputs.personalLeaveOpeningBalance) || 0;
  const personalLeaveAccrued = totalPaidHours * personalLeaveAccrualRate;
  const availablePersonalLeave = personalLeaveOpeningBalance + personalLeaveAccrued;
  const personalLeaveClosingBalance = availablePersonalLeave - personalLeaveTaken;

  return {
    totalPaidHours,
    leaveWithoutPayHours,
    totalAccruableHours: totalPaidHours,
    annualLeaveAccrualRate,
    annualLeaveAccrued,
    availableAnnualLeave,
    annualLeaveClosingBalance,
    personalLeaveAccrualRate,
    personalLeaveAccrued,
    availablePersonalLeave,
    personalLeaveClosingBalance,
  };
}

/**
 * Formats a number with specified decimal places.
 */
export function formatNum(val: number, decimals: number = 4): string {
  if (isNaN(val) || val === null || val === undefined) return (0).toFixed(decimals);
  return Number(val).toFixed(decimals);
}

/**
 * Formats a date string (YYYY-MM-DD) to Australian display format (DD/MM/YYYY)
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateStr;
}

/**
 * Generates statement text for PL Opening Balance Calculator.
 */
export function generatePLStatementText(
  inputs: PLCalculatorInputs,
  results: PLCalculatorResults
): string {
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `==========================================
ACCRUELY - PERSONAL LEAVE OPENING BALANCE STATEMENT
Generated on: ${dateStr}
Reference: Australian National Employment Standards (NES)
==========================================

EMPLOYEE & GENERAL INFORMATION
------------------------------------------
Employee: ${inputs.employeeName || 'Unspecified Employee'}
Standard Hours Per Day: ${formatNum(inputs.standardHoursPerDay, 2)} hrs

OLD ENTITLEMENT PERIOD (OLD RATE)
------------------------------------------
Commencement Date: ${formatDateDisplay(inputs.oldPeriod.commencementDate) || 'Not specified'}
Calculation Date:  ${formatDateDisplay(inputs.oldPeriod.calculationDate) || 'Not specified'}
Annual Entitlement: ${formatNum(inputs.oldPeriod.annualEntitlement, 2)} hrs
Completed Years of Service: ${formatNum(results.oldRate.completedYears, 2)}
Additional Year Hours:      ${formatNum(results.oldRate.additionalYearHours, 4)} hrs
Remaining Weeks:            ${formatNum(results.oldRate.remainingWeeks, 4)} wks
Weekly Accrual Rate:        ${formatNum(results.oldRate.weeklyAccrualRate, 4)} hrs/wk
Remaining Weeks Hours:      ${formatNum(results.oldRate.remainingWeeksHours, 4)} hrs
TOTAL LEAVE EARNED (OLD):   ${formatNum(results.oldRate.totalLeaveEarned, 4)} hrs

NEW ENTITLEMENT PERIOD (NEW RATE)
------------------------------------------
Commencement Date: ${formatDateDisplay(inputs.newPeriod.commencementDate) || 'Not specified'}
Calculation Date:  ${formatDateDisplay(inputs.newPeriod.calculationDate) || 'Not specified'}
Annual Entitlement: ${formatNum(inputs.newPeriod.annualEntitlement, 2)} hrs
Completed Years of Service: ${formatNum(results.newRate.completedYears, 2)}
Additional Year Hours:      ${formatNum(results.newRate.additionalYearHours, 4)} hrs
Remaining Weeks:            ${formatNum(results.newRate.remainingWeeks, 4)} wks
Weekly Accrual Rate:        ${formatNum(results.newRate.weeklyAccrualRate, 4)} hrs/wk
Remaining Weeks Hours:      ${formatNum(results.newRate.remainingWeeksHours, 4)} hrs
TOTAL LEAVE EARNED (NEW):   ${formatNum(results.newRate.totalLeaveEarned, 4)} hrs

------------------------------------------
GRAND TOTAL LEAVE EARNED:   ${formatNum(results.grandTotalLeaveEarned, 4)} hrs
------------------------------------------

PERSONAL LEAVE TAKEN / USED
------------------------------------------
Pre-MYOB:       ${formatNum(inputs.leaveUsedPreMYOB, 2)} hrs
MYOB:           ${formatNum(inputs.leaveUsedMYOB, 2)} hrs
Xero:           ${formatNum(inputs.leaveUsedXero, 2)} hrs
Other:          ${formatNum(inputs.leaveUsedOther, 2)} hrs
TOTAL USED:     ${formatNum(results.totalLeaveUsed, 4)} hrs

------------------------------------------
TARGET ENTITLEMENT BALANCE
------------------------------------------
Target Balance: ${formatNum(results.targetBalance, 4)} hrs
Equivalent in Days:  ${formatNum(results.targetBalanceDays, 2)} days
Equivalent in Weeks: ${formatNum(results.targetBalanceWeeks, 2)} weeks

------------------------------------------
XERO PL BALANCE CHECKER
------------------------------------------
Current Opening Balance in Xero: ${formatNum(inputs.currentOpeningBalanceXero, 4)} hrs
Target Balance:                  ${formatNum(results.targetBalance, 4)} hrs
Current Xero Balance:            ${formatNum(inputs.currentXeroBalance, 4)} hrs
------------------------------------------
UPDATED OPENING BALANCE:         ${formatNum(results.xeroUpdatedBalance, 4)} hrs

==========================================
Accruely - Made by Jomer Abanilla, CFMS
==========================================`;
}

/**
 * Generates statement text for Leave Accrual Calculator matching Android export format.
 */
export function generateLeaveAccrualStatementText(
  inputs: LeaveAccrualInputs,
  results: LeaveAccrualResults
): string {
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `==========================================
ACCRUELY - LEAVE ACCRUAL STATEMENT
Generated on: ${dateStr}
Reference: Australian National Employment Standards (NES)
==========================================

EMPLOYEE & PAY RUN DETAILS
------------------------------------------
Employee: ${inputs.employeeName || 'Unspecified Employee'}
Leave Accrual Profile: ${inputs.profile}
Pay Frequency: ${inputs.payFrequency}
Standard Hours Per Day: ${formatNum(inputs.standardHoursPerDay, 2)} hrs
Total Hours For The Pay Period: ${formatNum(inputs.totalHoursForPeriod, 2)} hrs

HOURS WORKED & TAKEN
------------------------------------------
Ordinary Hours Worked:       ${formatNum(inputs.ordinaryHours, 2)} hrs
Public Holiday Hours:        ${formatNum(inputs.publicHolidayHours, 2)} hrs
Annual Leave Taken:          ${formatNum(inputs.annualLeaveTaken, 2)} hrs
Personal Leave Taken:        ${formatNum(inputs.personalLeaveTaken, 2)} hrs
TOTAL PAID HOURS:            ${formatNum(results.totalPaidHours, 2)} hrs
LEAVE WITHOUT PAY HOURS:     ${formatNum(results.leaveWithoutPayHours, 2)} hrs

ANNUAL LEAVE (AL)
------------------------------------------
Accrual Rate:                ${formatNum(results.annualLeaveAccrualRate, 6)} hrs per paid hr
Opening Balance:             ${formatNum(inputs.annualLeaveOpeningBalance, 4)} hrs
Annual Leave Accrued This Pay: +${formatNum(results.annualLeaveAccrued, 4)} hrs
Available Annual Leave:      ${formatNum(results.availableAnnualLeave, 4)} hrs
Less: Annual Leave Taken:    −${formatNum(inputs.annualLeaveTaken, 2)} hrs
CLOSING ANNUAL LEAVE BALANCE:${formatNum(results.annualLeaveClosingBalance, 4)} hrs

PERSONAL / CARER'S LEAVE (PL)
------------------------------------------
Accrual Rate:                ${formatNum(results.personalLeaveAccrualRate, 6)} hrs per paid hr
Opening Balance:             ${formatNum(inputs.personalLeaveOpeningBalance, 4)} hrs
Personal Leave Accrued This Pay: +${formatNum(results.personalLeaveAccrued, 4)} hrs
Available Personal Leave:    ${formatNum(results.availablePersonalLeave, 4)} hrs
Less: Personal Leave Taken:  −${formatNum(inputs.personalLeaveTaken, 2)} hrs
CLOSING PERSONAL LEAVE BALANCE: ${formatNum(results.personalLeaveClosingBalance, 4)} hrs

==========================================
Accruely - Made by Jomer Abanilla, CFMS
==========================================`;
}

/**
 * STANDARD OT ADJUSTMENT CALCULATOR
 * 
 * Rules:
 * Standard Hours Per Day = Standard Ordinary Hours ÷ 5
 * LWOP Hours = LWOP Days × Standard Hours Per Day
 * Ordinary Hours Worked = Standard Ordinary Hours − LWOP Hours
 * Attendance Percentage = Ordinary Hours Worked ÷ Standard Ordinary Hours
 * Adjusted Standard OT = Standard OT × Attendance Percentage
 */
export function calculateStandardOTAdjustment(
  inputs: StandardOTAdjustmentInputs
): StandardOTAdjustmentResults {
  const standardOrdinaryHours = Math.max(0, inputs.standardOrdinaryHours || 0);
  const standardOT = Math.max(0, inputs.standardOT || 0);
  const lwopDays = Math.max(0, inputs.lwopDays || 0);

  // Standard Hours Per Day = Standard Ordinary Hours ÷ 5
  const standardHoursPerDay = standardOrdinaryHours > 0 ? standardOrdinaryHours / 5 : 0;

  // LWOP Hours = LWOP Days × Standard Hours Per Day
  const lwopHours = lwopDays * standardHoursPerDay;

  // Ordinary Hours Worked = Standard Ordinary Hours − LWOP Hours
  const ordinaryHoursWorked = Math.max(0, standardOrdinaryHours - lwopHours);

  // Attendance Percentage = Ordinary Hours Worked ÷ Standard Ordinary Hours
  const attendancePercentage =
    standardOrdinaryHours > 0 ? ordinaryHoursWorked / standardOrdinaryHours : 0;

  // Adjusted Standard OT = Standard OT × Attendance Percentage
  const adjustedStandardOT = standardOT * attendancePercentage;

  return {
    standardHoursPerDay,
    lwopHours,
    ordinaryHoursWorked,
    attendancePercentage,
    adjustedStandardOT,
  };
}

export function generateStandardOTAdjustmentStatementText(
  inputs: StandardOTAdjustmentInputs,
  results: StandardOTAdjustmentResults
): string {
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `==========================================
ACCRUELY - STANDARD OT ADJUSTMENT STATEMENT
Generated on: ${dateStr}
Reference: Company Policy - Prorated Standard OT with LWOP
==========================================

EMPLOYEE DETAILS
------------------------------------------
Employee: ${inputs.employeeName || 'Unspecified Employee'}

INPUT PARAMETERS
------------------------------------------
Standard Ordinary Hours:   ${formatNum(inputs.standardOrdinaryHours, 2)} hrs/week
Standard Overtime (OT):    ${formatNum(inputs.standardOT, 2)} hrs
Leave Without Pay (LWOP):  ${formatNum(inputs.lwopDays, 2)} days

CALCULATION BREAKDOWN
------------------------------------------
Standard Hours Per Day:    ${formatNum(results.standardHoursPerDay, 2)} hrs/day (${formatNum(inputs.standardOrdinaryHours, 2)} ÷ 5)
LWOP Hours Deducted:       ${formatNum(results.lwopHours, 2)} hrs (${formatNum(inputs.lwopDays, 2)} × ${formatNum(results.standardHoursPerDay, 2)})
Ordinary Hours Worked:     ${formatNum(results.ordinaryHoursWorked, 2)} hrs (${formatNum(inputs.standardOrdinaryHours, 2)} − ${formatNum(results.lwopHours, 2)})
Attendance Rate:           ${(results.attendancePercentage * 100).toFixed(2)}% (${formatNum(results.ordinaryHoursWorked, 2)} ÷ ${formatNum(inputs.standardOrdinaryHours, 2)})

FINAL ADJUSTED OVERTIME
==========================================
ADJUSTED STANDARD OT:      ${formatNum(results.adjustedStandardOT, 2)} hrs (${formatNum(inputs.standardOT, 2)} × ${(results.attendancePercentage * 100).toFixed(2)}%)
==========================================

==========================================
Accruely • Australian Payroll Tools
==========================================`;
}

/**
 * Formats decimal hours into a human-readable hours and minutes string (e.g. 7.60 -> "7h 36m", 7.50 -> "7h 30m").
 * Australian payroll uses decimal hours for calculation; this helper provides clear time interpretation.
 */
export function formatDecimalToHoursMinutes(decimalHours: number): string {
  if (isNaN(decimalHours) || decimalHours === null || decimalHours === undefined) return '0h 0m';
  const isNegative = decimalHours < 0;
  const absVal = Math.abs(decimalHours);
  const hours = Math.floor(absVal);
  const minutes = Math.round((absVal - hours) * 60);
  if (minutes >= 60) {
    return `${isNegative ? '-' : ''}${hours + 1}h 0m`;
  }
  return `${isNegative ? '-' : ''}${hours}h ${minutes}m`;
}

/**
 * Calculates net shift duration in decimal hours from start time, end time, and unpaid break.
 */
export function calculateShiftDuration(
  startTime?: string,
  endTime?: string,
  unpaidBreakMinutes: number = 0
): number | null {
  if (!startTime || !endTime) return null;
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');
  if (startParts.length !== 2 || endParts.length !== 2) return null;

  const startH = parseInt(startParts[0], 10);
  const startM = parseInt(startParts[1], 10);
  const endH = parseInt(endParts[0], 10);
  const endM = parseInt(endParts[1], 10);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return null;

  let startTotalMins = startH * 60 + startM;
  let endTotalMins = endH * 60 + endM;

  // Handle overnight shift crossing midnight
  if (endTotalMins < startTotalMins) {
    endTotalMins += 24 * 60;
  }

  const breakMins = Math.max(0, unpaidBreakMinutes || 0);
  const netMins = Math.max(0, endTotalMins - startTotalMins - breakMins);
  const decimalHours = Math.round((netMins / 60) * 10000) / 10000;
  return decimalHours;
}

/**
 * Safely parses numbers from user text or clipboard paste,
 * handling currency symbols ($ € £ ¥), commas, percent signs (%), units, and whitespace.
 */
export function parseFormattedNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (!input || typeof input !== 'string') return 0;

  // Clean string: remove $, €, £, ¥, commas, %, spaces
  let cleaned = input.trim().replace(/[$€£¥,%\s]/g, '');
  // Keep numbers, decimal point, and minus sign
  cleaned = cleaned.replace(/[^0-9.-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * AUSTRALIAN PAYROLL WEEKEND OVERTIME SPLITTING ENGINE
 *
 * For Australian bookkeepers and accountants splitting Saturday and Sunday
 * overtime hours into their respective Award rate categories (1.5x, 2.0x, 2.25x etc.).
 *
 * Mathematical rules:
 * - Saturday: Splits into first tier (e.g. 1.5x up to 3h / 2h threshold) and second tier (e.g. 2.0x after threshold)
 * - Sunday: Applies Sunday award rule (e.g. 2.0x Double Time for all hours, or award specific)
 * - Retains exact decimal precision from entered hours without artificial distortion.
 */
export function calculateWeekendPay(inputs: WeekendPayInputs): WeekendPayResults {
  const mode: WeekendCalculatorMode = inputs.mode || 'single';
  const employeeName = (inputs.employeeName || 'John Smith').trim();
  const payPeriod = inputs.payPeriod || 'Fortnightly';
  const ordinaryHourlyRate = Math.max(0, parseFormattedNumber(inputs.ordinaryHourlyRate) || 0);

  // 1. Parse Saturday & Sunday Overtime Hours
  let satHoursRaw = 0;
  if (inputs.saturdayHours !== undefined && inputs.saturdayHours !== null && inputs.saturdayHours !== '') {
    satHoursRaw = parseFormattedNumber(inputs.saturdayHours) || 0;
  } else if (inputs.w1Saturday !== undefined && inputs.w1Saturday !== null && inputs.w1Saturday !== '') {
    satHoursRaw = parseFormattedNumber(inputs.w1Saturday) || 0;
  }

  let sunHoursRaw = 0;
  if (inputs.sundayHours !== undefined && inputs.sundayHours !== null && inputs.sundayHours !== '') {
    sunHoursRaw = parseFormattedNumber(inputs.sundayHours) || 0;
  } else if (inputs.w1Sunday !== undefined && inputs.w1Sunday !== null && inputs.w1Sunday !== '') {
    sunHoursRaw = parseFormattedNumber(inputs.w1Sunday) || 0;
  }

  // Fallback for single total input if only totalTimesheetHours was supplied
  if (satHoursRaw === 0 && sunHoursRaw === 0 && inputs.totalTimesheetHours) {
    const totalSingle = Math.max(0, parseFormattedNumber(inputs.totalTimesheetHours) || 0);
    const dayStr = (inputs.dayWorked || '').toString().toLowerCase();
    if (dayStr.includes('sun')) {
      sunHoursRaw = totalSingle;
    } else {
      satHoursRaw = totalSingle;
    }
  }

  const satHours = Math.max(0, satHoursRaw);
  const sunHours = Math.max(0, sunHoursRaw);
  const totalWeekendHours = Math.round((satHours + sunHours) * 10000) / 10000;

  // 2. Fetch Selected Award Overtime Rule
  const selectedRuleId = inputs.selectedRuleId || inputs.payRule || 'clerks-award';
  const awardRule = getAwardRuleById(selectedRuleId);

  // Determine Saturday Split Parameters
  let satThreshold = awardRule.saturday.firstThresholdHours;
  let satFirstMult = awardRule.saturday.firstMultiplier;
  let satFirstLabel = awardRule.saturday.firstLabel;
  let satFirstRatePct = awardRule.saturday.firstRatePercentage;
  let satSecondMult = awardRule.saturday.secondMultiplier ?? 2.0;
  let satSecondLabel = awardRule.saturday.secondLabel ?? '2.0x (Double time)';
  let satSecondRatePct = awardRule.saturday.secondRatePercentage ?? 200;

  if (selectedRuleId === 'custom') {
    if (inputs.customSatThreshold !== undefined && inputs.customSatThreshold !== '') {
      satThreshold = Math.max(0, parseFormattedNumber(inputs.customSatThreshold) || 0);
    }
    if (inputs.customSatFirstMultiplier !== undefined && inputs.customSatFirstMultiplier !== '') {
      satFirstMult = parseFormattedNumber(inputs.customSatFirstMultiplier) || 1.5;
      satFirstRatePct = Math.round(satFirstMult * 100);
      satFirstLabel = `${satFirstMult}x Overtime`;
    }
    if (inputs.customSatSecondMultiplier !== undefined && inputs.customSatSecondMultiplier !== '') {
      satSecondMult = parseFormattedNumber(inputs.customSatSecondMultiplier) || 2.0;
      satSecondRatePct = Math.round(satSecondMult * 100);
      satSecondLabel = `${satSecondMult}x Overtime`;
    }
  }

  // Determine Sunday Split Parameters
  let sunThreshold = awardRule.sunday.firstThresholdHours;
  let sunFirstMult = awardRule.sunday.firstMultiplier;
  let sunFirstLabel = awardRule.sunday.firstLabel;
  let sunFirstRatePct = awardRule.sunday.firstRatePercentage;
  let sunSecondMult = awardRule.sunday.secondMultiplier ?? 2.0;
  let sunSecondLabel = awardRule.sunday.secondLabel ?? '2.0x (Double time)';
  let sunSecondRatePct = awardRule.sunday.secondRatePercentage ?? 200;

  if (selectedRuleId === 'custom') {
    if (inputs.customSunMultiplier !== undefined && inputs.customSunMultiplier !== '') {
      sunFirstMult = parseFormattedNumber(inputs.customSunMultiplier) || 2.0;
      sunFirstRatePct = Math.round(sunFirstMult * 100);
      sunFirstLabel = `${sunFirstMult}x Overtime`;
    }
  }

  // 3. Compute Saturday Overtime Splits
  const saturdaySplits: OvertimeRateSplit[] = [];
  if (satThreshold !== null && satThreshold !== undefined && satThreshold > 0) {
    const tier1Hours = Math.min(satHours, satThreshold);
    const tier2Hours = Math.max(0, Math.round((satHours - satThreshold) * 10000) / 10000);
    const tier1HourlyRate = Math.round(ordinaryHourlyRate * satFirstMult * 10000) / 10000;
    const tier2HourlyRate = Math.round(ordinaryHourlyRate * satSecondMult * 10000) / 10000;
    const tier1Pay = Math.round(tier1Hours * tier1HourlyRate * 100) / 100;
    const tier2Pay = Math.round(tier2Hours * tier2HourlyRate * 100) / 100;

    saturdaySplits.push({
      id: 'sat-split-1',
      label: `${satFirstMult}x (First ${formatNum(satThreshold, 1)} hrs)`,
      rateName: satFirstLabel,
      multiplier: satFirstMult,
      ratePercentage: satFirstRatePct,
      hours: tier1Hours,
      hourlyRate: tier1HourlyRate,
      pay: tier1Pay,
      formula: `${formatNum(tier1Hours, 2)} hrs @ ${satFirstMult}x`,
    });

    saturdaySplits.push({
      id: 'sat-split-2',
      label: `${satSecondMult}x (After ${formatNum(satThreshold, 1)} hrs)`,
      rateName: satSecondLabel,
      multiplier: satSecondMult,
      ratePercentage: satSecondRatePct,
      hours: tier2Hours,
      hourlyRate: tier2HourlyRate,
      pay: tier2Pay,
      formula: `${formatNum(tier2Hours, 2)} hrs @ ${satSecondMult}x`,
    });
  } else {
    // Flat rate for Saturday
    const hourlyRate = Math.round(ordinaryHourlyRate * satFirstMult * 10000) / 10000;
    const pay = Math.round(satHours * hourlyRate * 100) / 100;
    saturdaySplits.push({
      id: 'sat-split-1',
      label: `${satFirstMult}x (All Saturday Hours)`,
      rateName: satFirstLabel,
      multiplier: satFirstMult,
      ratePercentage: satFirstRatePct,
      hours: satHours,
      hourlyRate,
      pay,
      formula: `${formatNum(satHours, 2)} hrs @ ${satFirstMult}x`,
    });
  }

  // 4. Compute Sunday Overtime Splits
  const sundaySplits: OvertimeRateSplit[] = [];
  if (sunThreshold !== null && sunThreshold !== undefined && sunThreshold > 0) {
    const tier1Hours = Math.min(sunHours, sunThreshold);
    const tier2Hours = Math.max(0, Math.round((sunHours - sunThreshold) * 10000) / 10000);
    const tier1HourlyRate = Math.round(ordinaryHourlyRate * sunFirstMult * 10000) / 10000;
    const tier2HourlyRate = Math.round(ordinaryHourlyRate * sunSecondMult * 10000) / 10000;
    const tier1Pay = Math.round(tier1Hours * tier1HourlyRate * 100) / 100;
    const tier2Pay = Math.round(tier2Hours * tier2HourlyRate * 100) / 100;

    sundaySplits.push({
      id: 'sun-split-1',
      label: `${sunFirstMult}x (First ${formatNum(sunThreshold, 1)} hrs)`,
      rateName: sunFirstLabel,
      multiplier: sunFirstMult,
      ratePercentage: sunFirstRatePct,
      hours: tier1Hours,
      hourlyRate: tier1HourlyRate,
      pay: tier1Pay,
      formula: `${formatNum(tier1Hours, 2)} hrs @ ${sunFirstMult}x`,
    });

    sundaySplits.push({
      id: 'sun-split-2',
      label: `${sunSecondMult}x (After ${formatNum(sunThreshold, 1)} hrs)`,
      rateName: sunSecondLabel,
      multiplier: sunSecondMult,
      ratePercentage: sunSecondRatePct,
      hours: tier2Hours,
      hourlyRate: tier2HourlyRate,
      pay: tier2Pay,
      formula: `${formatNum(tier2Hours, 2)} hrs @ ${sunSecondMult}x`,
    });
  } else {
    // Flat rate for Sunday (Standard 2.0x double time)
    const hourlyRate = Math.round(ordinaryHourlyRate * sunFirstMult * 10000) / 10000;
    const pay = Math.round(sunHours * hourlyRate * 100) / 100;
    sundaySplits.push({
      id: 'sun-split-1',
      label: `${sunFirstMult}x (All Sunday Hours)`,
      rateName: sunFirstLabel,
      multiplier: sunFirstMult,
      ratePercentage: sunFirstRatePct,
      hours: sunHours,
      hourlyRate,
      pay,
      formula: `${formatNum(sunHours, 2)} hrs @ ${sunFirstMult}x`,
    });
  }

  // 5. Aggregate Combined Payroll Rate Allocations (e.g. Total 1.5x Overtime, Total 2.0x Overtime)
  const combinedMap = new Map<number, { ratePercentage: number; label: string; hours: number; pay: number }>();

  const allSplits = [...saturdaySplits, ...sundaySplits];
  allSplits.forEach((sp) => {
    if (sp.hours > 0 || allSplits.length <= 3) {
      const existing = combinedMap.get(sp.multiplier);
      if (existing) {
        existing.hours = Math.round((existing.hours + sp.hours) * 10000) / 10000;
        existing.pay = Math.round(((existing.pay || 0) + (sp.pay || 0)) * 100) / 100;
      } else {
        combinedMap.set(sp.multiplier, {
          ratePercentage: sp.ratePercentage,
          label: `${sp.multiplier}x Overtime (${sp.ratePercentage}%)`,
          hours: sp.hours,
          pay: sp.pay || 0,
        });
      }
    }
  });

  const combinedSplits: OvertimeRateSplit[] = [];
  let combinedIdx = 1;
  let totalGrossPay = 0;

  // Sort multipliers ascending (e.g. 1.5x before 2.0x)
  const sortedMultipliers = Array.from(combinedMap.keys()).sort((a, b) => a - b);
  sortedMultipliers.forEach((mult) => {
    const data = combinedMap.get(mult)!;
    const hourlyRate = Math.round(ordinaryHourlyRate * mult * 10000) / 10000;
    const pay = Math.round(data.hours * hourlyRate * 100) / 100;
    totalGrossPay += pay;

    combinedSplits.push({
      id: `combined-split-${combinedIdx}`,
      label: `${mult}x Overtime`,
      rateName: data.label,
      multiplier: mult,
      ratePercentage: data.ratePercentage,
      hours: data.hours,
      hourlyRate,
      pay,
      formula: `${formatNum(data.hours, 2)} hrs @ ${mult}x`,
    });
    combinedIdx++;
  });

  totalGrossPay = Math.round(totalGrossPay * 100) / 100;

  // 6. Reconciliation and Equations
  const totalAllocatedHours = Math.round(
    ([...saturdaySplits, ...sundaySplits].reduce((sum, sp) => sum + sp.hours, 0)) * 10000
  ) / 10000;
  const hoursDifference = Math.round((totalWeekendHours - totalAllocatedHours) * 10000) / 10000;
  const isReconciled = Math.abs(hoursDifference) < 0.0001;

  const satEquation = saturdaySplits
    .filter((s) => s.hours > 0 || saturdaySplits.length <= 1)
    .map((s) => `${s.multiplier}x: ${formatNum(s.hours, 2)}h`)
    .join(' + ');

  const sunEquation = sundaySplits
    .filter((s) => s.hours > 0 || sundaySplits.length <= 1)
    .map((s) => `${s.multiplier}x: ${formatNum(s.hours, 2)}h`)
    .join(' + ');

  const reconciledEquation = `Sat (${satEquation || '0.00h'}) + Sun (${sunEquation || '0.00h'}) = ${formatNum(totalAllocatedHours, 2)} hrs`;

  // Backward compatibility object structures for modals & reports
  const categoryResults: CategoryResultItem[] = combinedSplits.map((c, i) => ({
    id: `cat-${i + 1}`,
    name: c.rateName,
    allocatedHours: c.hours,
    multiplier: c.multiplier,
    ratePercentage: c.ratePercentage,
    hourlyRate: c.hourlyRate || 0,
    categoryPay: c.pay || 0,
    formula: c.formula || `${formatNum(c.hours, 2)} hrs @ ${c.multiplier}x`,
  }));

  const tierResults: SplitTierResult[] = combinedSplits.map((c, i) => ({
    id: `tier-${i + 1}`,
    tierIndex: i + 1,
    label: c.label,
    capHours: null,
    ratePercentage: c.ratePercentage,
    multiplier: c.multiplier,
    tierHourlyRate: c.hourlyRate || 0,
    allocatedHours: c.hours,
    tierPay: c.pay || 0,
    equation: `${formatNum(c.hours, 2)} hrs @ ${c.multiplier}x`,
  }));

  const satDaySplit: DaySplitResult = {
    dayKey: 'saturday',
    weekNumber: 1,
    dayName: 'Saturday',
    fullLabel: 'Saturday Overtime',
    timesheetHours: satHours,
    categorySplits: saturdaySplits.map((s) => ({
      id: s.id,
      name: s.rateName,
      hours: s.hours,
      allocatedHours: s.hours,
      multiplier: s.multiplier,
      ratePercentage: s.ratePercentage,
      hourlyRate: s.hourlyRate,
      pay: s.pay,
    })),
    ordinaryHours: 0,
    overtimeHours: satHours,
    totalAllocated: satHours,
    difference: 0,
    isReconciled: true,
    ruleDescription: awardRule.description,
  };

  const sunDaySplit: DaySplitResult = {
    dayKey: 'sunday',
    weekNumber: 1,
    dayName: 'Sunday',
    fullLabel: 'Sunday Overtime',
    timesheetHours: sunHours,
    categorySplits: sundaySplits.map((s) => ({
      id: s.id,
      name: s.rateName,
      hours: s.hours,
      allocatedHours: s.hours,
      multiplier: s.multiplier,
      ratePercentage: s.ratePercentage,
      hourlyRate: s.hourlyRate,
      pay: s.pay,
    })),
    ordinaryHours: 0,
    overtimeHours: sunHours,
    totalAllocated: sunHours,
    difference: 0,
    isReconciled: true,
    ruleDescription: awardRule.description,
  };

  return {
    employeeName,
    payPeriod,
    awardRuleId: awardRule.id,
    awardRuleName: awardRule.name,
    awardRuleShortName: awardRule.shortName,
    awardRuleBadge: awardRule.badge,
    awardRuleDescription: awardRule.description,
    saturdayHours: satHours,
    sundayHours: sunHours,
    totalWeekendHours,
    saturdaySplits,
    sundaySplits,
    combinedSplits,
    isReconciled,
    reconciledEquation,

    mode,
    totalTimesheetHours: totalWeekendHours,
    totalAllocatedHours,
    hoursDifference,
    reconciliationStatus: isReconciled ? 'reconciled' : 'under-allocated',
    statusMessage: isReconciled ? '✓ RECONCILED' : 'Variance',

    totalFortnightTimesheetHours: totalWeekendHours,
    totalFortnightAllocatedHours: totalAllocatedHours,
    fortnightHoursDifference: hoursDifference,
    isFortnightReconciled: isReconciled,
    activeDayBreakdowns: [satDaySplit, sunDaySplit],

    w1SaturdayBreakdown: satDaySplit,
    w1SundayBreakdown: sunDaySplit,
    saturdayBreakdown: satDaySplit,
    sundayBreakdown: sunDaySplit,
    dailyBreakdowns: [satDaySplit, sunDaySplit],

    categoryResults,
    tierResults,

    weekendTotalHours: totalWeekendHours,
    weekendOrdinaryHours: 0,
    weekendOvertimeHours: totalWeekendHours,
    totalWeekOrdinaryHours: 0,
    totalWeekOvertimeHours: totalWeekendHours,

    hasPayCalculation: ordinaryHourlyRate > 0,
    ordinaryHourlyRate,
    totalGrossPay,

    dayWorked: 'Weekend',
    totalWeekendPay: totalGrossPay,
    totalHoursWorked: totalWeekendHours,
    payableHours: totalWeekendHours,
    isMinimumPaymentApplied: false,
    minimumHours: 0,
    minimumShortfallHours: 0,
    calculationType: 'Split Hours',
    isTieredOvertime: true,
    multiplier: combinedSplits[0]?.multiplier || 1.5,
    weekendPayRate: combinedSplits[0]?.hourlyRate || ordinaryHourlyRate * 1.5,
    hoursWorked: totalWeekendHours,
    breakdownEquation: reconciledEquation,
    firstOtRatePercentage: saturdaySplits[0]?.ratePercentage || 150,
    firstOtMultiplier: saturdaySplits[0]?.multiplier || 1.5,
    firstTierHourlyRate: saturdaySplits[0]?.hourlyRate || ordinaryHourlyRate * 1.5,
    firstTierHours: saturdaySplits[0]?.hours || 0,
    firstTierPay: saturdaySplits[0]?.pay || 0,
    higherOtRatePercentage: saturdaySplits[1]?.ratePercentage || 200,
    higherOtMultiplier: saturdaySplits[1]?.multiplier || 2.0,
    higherTierHourlyRate: saturdaySplits[1]?.hourlyRate || ordinaryHourlyRate * 2.0,
    higherRateThresholdHours: satThreshold || 0,
    remainingHours: saturdaySplits[1]?.hours || 0,
    higherTierPay: saturdaySplits[1]?.pay || 0,
    totalOvertimeHours: totalWeekendHours,
    totalOvertimePay: totalGrossPay,
  };
}

/**
 * Generates an auditable, bookkeeper-friendly statement text for weekend overtime splitting & reconciliation.
 */
export function generateWeekendPayStatementText(
  inputs: WeekendPayInputs,
  results: WeekendPayResults
): string {
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const empName = results.employeeName || inputs.employeeName || 'John Smith';
  const payPeriod = results.payPeriod || inputs.payPeriod || 'Fortnightly';
  const rule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule);

  let satLines = '';
  if (results.saturdayHours > 0) {
    satLines = results.saturdaySplits
      .map((s) => `  • ${s.label.padEnd(28)}: ${formatNum(s.hours, 2)} hrs (${s.rateName})`)
      .join('\n');
  } else {
    satLines = '  • No Saturday overtime hours entered';
  }

  let sunLines = '';
  if (results.sundayHours > 0) {
    sunLines = results.sundaySplits
      .map((s) => `  • ${s.label.padEnd(28)}: ${formatNum(s.hours, 2)} hrs (${s.rateName})`)
      .join('\n');
  } else {
    sunLines = '  • No Sunday overtime hours entered';
  }

  const combinedLines = results.combinedSplits
    .map((c) => `  • ${c.label.padEnd(24)}: ${formatNum(c.hours, 2)} hrs`)
    .join('\n');

  return `==================================================
ACCRUELY — WEEKEND SPLIT OT RECONCILIATION
==================================================
Employee Name:  ${empName}
Pay Period:     ${payPeriod}
Award Rule:     ${rule.name}
Badge:          [${rule.badge}]
Date Generated: ${dateStr}
--------------------------------------------------
SATURDAY OVERTIME (${formatNum(results.saturdayHours, 2)} hrs total)
${satLines}

SUNDAY OVERTIME (${formatNum(results.sundayHours, 2)} hrs total)
${sunLines}
--------------------------------------------------
PAYROLL OVERTIME MULTIPLIER ALLOCATION
${combinedLines || '  (No overtime hours)'}
--------------------------------------------------
Total Weekend OT Hours: ${formatNum(results.totalWeekendHours, 2)} hrs
Reconciliation Status:  ${results.isReconciled ? '✓ RECONCILED (100% MATCHED)' : 'VARIANCE DETECTED'}
==================================================
Rule Summary: ${rule.description}
==================================================
Accruely • Australian Payroll Overtime Splitting Tool
==================================================`;
}
