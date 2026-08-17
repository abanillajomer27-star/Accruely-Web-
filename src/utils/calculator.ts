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
 * TIMESHEET SPLIT & RECONCILIATION CALCULATOR ENGINE
 *
 * For Australian bookkeepers and accountants reviewing timesheets from systems
 * like Deputy, MYOB, Excel, etc., and transferring/reconciling them into Xero.
 *
 * Answers:
 * "I have X total hours on the timesheet. How do I split those hours between the
 * applicable payroll categories, and do all my split hours reconcile back to the original timesheet total?"
 */
export function calculateWeekendPay(inputs: WeekendPayInputs): WeekendPayResults {
  const mode: WeekendCalculatorMode = inputs.mode || 'single';
  const ordinaryHourlyRate = Math.max(0, parseFormattedNumber(inputs.ordinaryHourlyRate) || 0);

  // 1. Determine Saturday and Sunday Timesheet Hours
  let satHours = 0;
  let sunHours = 0;
  let weeklyTotalHours = 0;
  let weekdayOrdinaryTotal = 0;

  if (inputs.saturdayHours !== undefined && inputs.saturdayHours !== null && inputs.saturdayHours !== '') {
    satHours = Math.max(0, parseFormattedNumber(inputs.saturdayHours) || 0);
  }
  if (inputs.sundayHours !== undefined && inputs.sundayHours !== null && inputs.sundayHours !== '') {
    sunHours = Math.max(0, parseFormattedNumber(inputs.sundayHours) || 0);
  }

  // Fallback to weeklyDays if provided and sat/sun were not directly set
  const days = inputs.weeklyDays && inputs.weeklyDays.length > 0 ? inputs.weeklyDays : [];
  const dailyBreakdowns: DaySplitResult[] = [];

  if (days.length > 0) {
    days.forEach((day) => {
      const hrs = Math.max(0, parseFormattedNumber(day.hours) || 0);
      weeklyTotalHours += hrs;
      const nameLower = (day.dayName || '').toLowerCase().trim();

      if (nameLower.includes('sat')) {
        if (inputs.saturdayHours === undefined || inputs.saturdayHours === null || inputs.saturdayHours === '') {
          satHours += hrs;
        }
      } else if (nameLower.includes('sun')) {
        if (inputs.sundayHours === undefined || inputs.sundayHours === null || inputs.sundayHours === '') {
          sunHours += hrs;
        }
      } else {
        weekdayOrdinaryTotal += hrs;
      }
    });
  }

  // Fallback if totalTimesheetHours was supplied for single day
  if (satHours === 0 && sunHours === 0 && inputs.totalTimesheetHours) {
    const totalSingle = Math.max(0, parseFormattedNumber(inputs.totalTimesheetHours) || 0);
    const dayStr = (inputs.dayWorked || '').toString().toLowerCase();
    if (dayStr.includes('sun')) {
      sunHours = totalSingle;
    } else {
      satHours = totalSingle;
    }
  }

  satHours = Math.round(satHours * 10000) / 10000;
  sunHours = Math.round(sunHours * 10000) / 10000;
  const weekendTotalHours = Math.round((satHours + sunHours) * 10000) / 10000;

  // 2. Fetch Selected Rule Engine
  const selectedRuleId = inputs.selectedRuleId || inputs.payRule || 'casual-loaded';
  const awardRule = getAwardRuleById(selectedRuleId);

  // Helper to build categories and allocate for a shift from rule or custom configs
  const allocateForDay = (
    dayTotalHours: number,
    dayName: 'Saturday' | 'Sunday',
    configuredCats?: PayrollCategoryItem[],
    customCapOverride?: string
  ): { splits: DayCategorySplitItem[]; totalAllocated: number; ordHours: number; otHours: number } => {
    if (dayTotalHours <= 0 && (!configuredCats || configuredCats.length === 0)) {
      const ruleConfig = dayName === 'Saturday' ? awardRule.saturday : awardRule.sunday;
      const emptySplits: DayCategorySplitItem[] = ruleConfig.tiers.map((tier, idx) => ({
        id: `${dayName.toLowerCase()}-split-${idx}`,
        name: tier.name,
        hours: 0,
        allocatedHours: 0,
        multiplier: tier.multiplier,
        ratePercentage: tier.ratePercentage,
        hourlyRate: Math.round(ordinaryHourlyRate * tier.multiplier * 10000) / 10000,
        pay: 0,
      }));
      return { splits: emptySplits, totalAllocated: 0, ordHours: 0, otHours: 0 };
    }

    // If user provided custom categories / manual edit for this day
    if (configuredCats && configuredCats.length > 0) {
      let running = dayTotalHours;
      const splits: DayCategorySplitItem[] = [];
      let ordHours = 0;
      let otHours = 0;

      configuredCats.forEach((cat, idx) => {
        const isLast = idx === configuredCats.length - 1;
        let allocated = 0;

        if (cat.allocationType === 'auto-remaining' || (isLast && (cat.hours === undefined || cat.hours === null || cat.hours === ''))) {
          allocated = Math.max(0, running);
          running = 0;
        } else if (cat.capHours !== null && cat.capHours !== undefined && cat.capHours !== '') {
          const cap = Math.max(0, parseFormattedNumber(cat.capHours) || 0);
          allocated = Math.min(Math.max(0, running), cap);
          running = Math.max(0, Math.round((running - allocated) * 10000) / 10000);
        } else {
          const direct = Math.max(0, parseFormattedNumber(cat.hours) || 0);
          allocated = direct;
          running = Math.max(0, Math.round((running - allocated) * 10000) / 10000);
        }

        allocated = Math.round(allocated * 10000) / 10000;
        const mult =
          cat.multiplier !== undefined && cat.multiplier !== null && cat.multiplier !== ''
            ? parseFormattedNumber(cat.multiplier) || 1.0
            : (parseFormattedNumber(cat.ratePercentage) || 100) / 100;
        const ratePct = cat.ratePercentage !== undefined ? Number(cat.ratePercentage) : Math.round(mult * 100);
        const hourlyRate = Math.round(ordinaryHourlyRate * mult * 10000) / 10000;
        const pay = Math.round(allocated * hourlyRate * 100) / 100;

        if (cat.name.toLowerCase().includes('ordinary') || (cat.name.toLowerCase().includes('casual') && !cat.name.toLowerCase().includes('overtime'))) {
          ordHours += allocated;
        } else {
          otHours += allocated;
        }

        splits.push({
          id: cat.id || `${dayName.toLowerCase()}-split-${idx}`,
          name: cat.name,
          hours: allocated,
          allocatedHours: allocated,
          multiplier: mult,
          ratePercentage: ratePct,
          hourlyRate,
          pay,
        });
      });

      const totalAllocated = Math.round(splits.reduce((s, c) => s + c.allocatedHours, 0) * 10000) / 10000;
      return { splits, totalAllocated, ordHours, otHours };
    }

    // Otherwise, allocate using the selected Award Rule tiers
    const ruleDay = dayName === 'Saturday' ? awardRule.saturday : awardRule.sunday;
    let running = dayTotalHours;
    const splits: DayCategorySplitItem[] = [];
    let ordHours = 0;
    let otHours = 0;

    ruleDay.tiers.forEach((tier, idx) => {
      let allocated = 0;
      const isLast = idx === ruleDay.tiers.length - 1;

      if (tier.isRemaining || isLast) {
        allocated = Math.max(0, running);
        running = 0;
      } else {
        let cap = tier.capHours ?? null;
        if (customCapOverride !== undefined && customCapOverride !== null && customCapOverride !== '') {
          cap = parseFormattedNumber(customCapOverride);
        }
        if (cap !== null && cap >= 0) {
          allocated = Math.min(Math.max(0, running), cap);
          running = Math.max(0, Math.round((running - allocated) * 10000) / 10000);
        } else {
          allocated = Math.max(0, running);
          running = 0;
        }
      }

      allocated = Math.round(allocated * 10000) / 10000;
      const mult = tier.multiplier;
      const ratePct = tier.ratePercentage;
      const hourlyRate = Math.round(ordinaryHourlyRate * mult * 10000) / 10000;
      const pay = Math.round(allocated * hourlyRate * 100) / 100;

      if (tier.name.toLowerCase().includes('ordinary') || (tier.name.toLowerCase().includes('casual') && !tier.name.toLowerCase().includes('overtime'))) {
        ordHours += allocated;
      } else {
        otHours += allocated;
      }

      splits.push({
        id: `${dayName.toLowerCase()}-rule-tier-${idx}`,
        name: tier.name,
        hours: allocated,
        allocatedHours: allocated,
        multiplier: mult,
        ratePercentage: ratePct,
        hourlyRate,
        pay,
      });
    });

    const totalAllocated = Math.round(splits.reduce((s, c) => s + c.allocatedHours, 0) * 10000) / 10000;
    return { splits, totalAllocated, ordHours, otHours };
  };

  // Saturday Allocation
  const satCapOverride = inputs.saturdayCap ?? (selectedRuleId.includes('casual') ? inputs.casualShiftCap : undefined);
  const satConfigCats = inputs.saturdayConfig?.categories;
  const satAllocResult = allocateForDay(satHours, 'Saturday', satConfigCats, satCapOverride);

  const satDiff = Math.round((satHours - satAllocResult.totalAllocated) * 10000) / 10000;
  const saturdayBreakdown: DaySplitResult = {
    dayName: 'Saturday',
    timesheetHours: satHours,
    categorySplits: satAllocResult.splits,
    ordinaryHours: satAllocResult.ordHours,
    overtimeHours: satAllocResult.otHours,
    totalAllocated: satAllocResult.totalAllocated,
    difference: satDiff,
    isReconciled: Math.abs(satDiff) < 0.0001,
  };

  // Sunday Allocation
  const sunCapOverride = inputs.sundayCap ?? (selectedRuleId.includes('casual') ? inputs.casualShiftCap : undefined);
  const sunConfigCats = inputs.sundayConfig?.categories;
  const sunAllocResult = allocateForDay(sunHours, 'Sunday', sunConfigCats, sunCapOverride);

  const sunDiff = Math.round((sunHours - sunAllocResult.totalAllocated) * 10000) / 10000;
  const sundayBreakdown: DaySplitResult = {
    dayName: 'Sunday',
    timesheetHours: sunHours,
    categorySplits: sunAllocResult.splits,
    ordinaryHours: sunAllocResult.ordHours,
    overtimeHours: sunAllocResult.otHours,
    totalAllocated: sunAllocResult.totalAllocated,
    difference: sunDiff,
    isReconciled: Math.abs(sunDiff) < 0.0001,
  };

  const totalTimesheetHours = weekendTotalHours > 0 ? weekendTotalHours : (parseFormattedNumber(inputs.totalTimesheetHours) || 0);

  const totalAllocatedHours = Math.round((satAllocResult.totalAllocated + sunAllocResult.totalAllocated) * 10000) / 10000;
  const hoursDifference = Math.round((totalTimesheetHours - totalAllocatedHours) * 10000) / 10000;
  const isReconciled = Math.abs(hoursDifference) < 0.0001 && saturdayBreakdown.isReconciled && sundayBreakdown.isReconciled;

  let reconciliationStatus: 'reconciled' | 'under-allocated' | 'over-allocated' = 'reconciled';
  let statusMessage = '✓ RECONCILED';

  if (!isReconciled && totalTimesheetHours > 0) {
    if (hoursDifference > 0) {
      reconciliationStatus = 'under-allocated';
      statusMessage = `${formatNum(hoursDifference, 2)} h variance remaining`;
    } else {
      reconciliationStatus = 'over-allocated';
      statusMessage = `${formatNum(Math.abs(hoursDifference), 2)} h over-allocated`;
    }
  }

  // Build aggregated Category Results
  const categoryResults: CategoryResultItem[] = [];
  const tierResults: SplitTierResult[] = [];
  let totalGrossPay = 0;
  const calculationSteps: string[] = [];

  const allSplits = [...satAllocResult.splits, ...sunAllocResult.splits];
  const catMap = new Map<string, { allocated: number; mult: number; ratePct: number }>();

  allSplits.forEach((sp) => {
    if (sp.allocatedHours > 0 || allSplits.length <= 2) {
      const existing = catMap.get(sp.name);
      if (existing) {
        existing.allocated += sp.allocatedHours;
      } else {
        catMap.set(sp.name, {
          allocated: sp.allocatedHours,
          mult: sp.multiplier ?? 1.0,
          ratePct: sp.ratePercentage ?? 100,
        });
      }
    }
  });

  let catIdx = 1;
  catMap.forEach((data, name) => {
    const allocated = Math.round(data.allocated * 10000) / 10000;
    const hourlyRate = Math.round(ordinaryHourlyRate * data.mult * 10000) / 10000;
    const categoryPay = Math.round(allocated * hourlyRate * 100) / 100;
    totalGrossPay += categoryPay;

    const formula =
      ordinaryHourlyRate > 0
        ? `$${formatNum(ordinaryHourlyRate, 2)} × ${formatNum(allocated, 2)} hrs × ${data.mult}x = $${formatNum(categoryPay, 2)}`
        : `${formatNum(allocated, 2)} hrs`;

    categoryResults.push({
      id: `cat-${catIdx}`,
      name,
      allocatedHours: allocated,
      multiplier: data.mult,
      ratePercentage: data.ratePct,
      hourlyRate,
      categoryPay,
      formula,
    });

    tierResults.push({
      id: `tier-${catIdx}`,
      tierIndex: catIdx,
      label: name,
      capHours: null,
      ratePercentage: data.ratePct,
      multiplier: data.mult,
      tierHourlyRate: hourlyRate,
      allocatedHours: allocated,
      tierPay: categoryPay,
      equation: `${formatNum(allocated, 2)} hrs @ ${data.mult}x = $${formatNum(categoryPay, 2)}`,
    });

    if (ordinaryHourlyRate > 0) {
      calculationSteps.push(formula);
    }
    catIdx++;
  });

  totalGrossPay = Math.round(totalGrossPay * 100) / 100;
  const hasPayCalculation = ordinaryHourlyRate > 0;

  return {
    mode,
    totalTimesheetHours,
    totalAllocatedHours,
    hoursDifference,
    isReconciled,
    reconciliationStatus,
    statusMessage,
    categoryResults,
    weeklyTotalHours,
    weekdayOrdinaryTotal,
    remainingOrdinaryCapacity: 0,
    weekendTotalHours,
    weekendOrdinaryHours: satAllocResult.ordHours + sunAllocResult.ordHours,
    weekendOvertimeHours: satAllocResult.otHours + sunAllocResult.otHours,
    totalWeekOrdinaryHours: satAllocResult.ordHours + sunAllocResult.ordHours,
    totalWeekOvertimeHours: satAllocResult.otHours + sunAllocResult.otHours,
    saturdayBreakdown,
    sundayBreakdown,
    dailyBreakdowns,
    hasPayCalculation,
    ordinaryHourlyRate,
    totalGrossPay,
    payrollAmountEntered: null,
    payrollDifference: null,
    isPayrollMatched: null,
    dayWorked: 'Weekend',
    tierResults,
    totalWeekendPay: totalGrossPay,
    calculationSteps,
    totalHoursWorked: totalTimesheetHours,
    workType: inputs.workType || 'Overtime',
    rateTreatment: inputs.rateTreatment || 'Use one applicable rate',
    awardReference: inputs.awardReference || '',
    payableHours: totalTimesheetHours,
    isMinimumPaymentApplied: false,
    minimumHours: 0,
    minimumShortfallHours: 0,
    calculationType: 'Split Hours',
    isTieredOvertime: true,
    multiplier: categoryResults[0]?.multiplier || 1.0,
    weekendPayRate: categoryResults[0]?.hourlyRate || ordinaryHourlyRate,
    hoursWorked: totalTimesheetHours,
    breakdownEquation: categoryResults.map((c) => `${c.name}: ${formatNum(c.allocatedHours, 2)}h`).join(' | '),
    firstOtRatePercentage: categoryResults[0]?.ratePercentage || 100,
    firstOtMultiplier: categoryResults[0]?.multiplier || 1.0,
    firstTierHourlyRate: categoryResults[0]?.hourlyRate || ordinaryHourlyRate,
    firstTierHours: categoryResults[0]?.allocatedHours || 0,
    firstTierPay: categoryResults[0]?.categoryPay || 0,
    higherOtRatePercentage: categoryResults[1]?.ratePercentage || 150,
    higherOtMultiplier: categoryResults[1]?.multiplier || 1.5,
    higherTierHourlyRate: categoryResults[1]?.hourlyRate || ordinaryHourlyRate * 1.5,
    higherRateThresholdHours: Number(categoryResults[0]?.allocatedHours) || 0,
    remainingHours: categoryResults[1]?.allocatedHours || 0,
    higherTierPay: categoryResults[1]?.categoryPay || 0,
    totalOvertimeHours: totalTimesheetHours,
    totalOvertimePay: totalGrossPay,
  };
}

/**
 * Generates an auditable, bookkeeper-friendly statement text for timesheet splitting & reconciliation.
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

  const rule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule);

  const satBreakdown = results.saturdayBreakdown;
  const sunBreakdown = results.sundayBreakdown;

  let satText = '';
  if (satBreakdown && satBreakdown.timesheetHours > 0) {
    const lines = satBreakdown.categorySplits && satBreakdown.categorySplits.length > 0
      ? satBreakdown.categorySplits.map(c => `  • ${c.name.padEnd(34)}: ${formatNum(c.allocatedHours, 2)} h`).join('\n')
      : `  • Total: ${formatNum(satBreakdown.timesheetHours, 2)} h`;
    const recon = satBreakdown.isReconciled ? '✓ RECONCILED' : `⚠ VARIANCE (${formatNum(Math.abs(satBreakdown.difference ?? 0), 2)} h)`;
    satText = `
Saturday — ${formatNum(satBreakdown.timesheetHours, 2)} h:
${lines}
  ----------------------------------------
  Total Allocated : ${formatNum(satBreakdown.totalAllocated, 2)} h
  Difference      : ${formatNum(Math.abs(satBreakdown.difference ?? 0), 2)} h
  Status          : ${recon}
`;
  }

  let sunText = '';
  if (sunBreakdown && sunBreakdown.timesheetHours > 0) {
    const lines = sunBreakdown.categorySplits && sunBreakdown.categorySplits.length > 0
      ? sunBreakdown.categorySplits.map(c => `  • ${c.name.padEnd(34)}: ${formatNum(c.allocatedHours, 2)} h`).join('\n')
      : `  • Total: ${formatNum(sunBreakdown.timesheetHours, 2)} h`;
    const recon = sunBreakdown.isReconciled ? '✓ RECONCILED' : `⚠ VARIANCE (${formatNum(Math.abs(sunBreakdown.difference ?? 0), 2)} h)`;
    sunText = `
Sunday — ${formatNum(sunBreakdown.timesheetHours, 2)} h:
${lines}
  ----------------------------------------
  Total Allocated : ${formatNum(sunBreakdown.totalAllocated, 2)} h
  Difference      : ${formatNum(Math.abs(sunBreakdown.difference ?? 0), 2)} h
  Status          : ${recon}
`;
  }

  const satHrs = satBreakdown ? satBreakdown.timesheetHours : 0;
  const sunHrs = sunBreakdown ? sunBreakdown.timesheetHours : 0;
  const totalHrs = results.totalTimesheetHours;
  const totalAlloc = results.totalAllocatedHours;
  const diff = Math.abs(results.hoursDifference);
  const reconStatus = results.isReconciled ? '✓ RECONCILED' : `⚠ VARIANCE: ${formatNum(diff, 2)} h`;

  return `==========================================
ACCRUELY - WEEKEND PAY & TIMESHEET SPLIT
Generated on: ${dateStr}
Award / Pay Rule: ${rule.name} (${rule.badge})
==========================================
ORIGINAL WEEKEND TIMESHEET
Saturday: ${formatNum(satHrs, 2)} h
Sunday:   ${formatNum(sunHrs, 2)} h
Total:    ${formatNum(totalHrs, 2)} h
------------------------------------------
WEEKEND SPLIT BREAKDOWN
${satText}${sunText}
------------------------------------------
TOTAL RECONCILIATION SUMMARY
Original Timesheet:  ${formatNum(totalHrs, 2)} h
Total Allocated:     ${formatNum(totalAlloc, 2)} h
Difference:          ${formatNum(diff, 2)} h
Status:              ${reconStatus}
==========================================
Notice: Weekend and overtime entitlements can vary by award, agreement and employment arrangement. Select the applicable rule and verify the result before processing payroll.
==========================================
Accruely • Australian Payroll Tools
==========================================`;
}
