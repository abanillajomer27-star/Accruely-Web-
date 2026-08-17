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
} from '../types';

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
 * REBUILT WEEKEND PAY & PENALTY RATE CALCULATOR ENGINE
 *
 * Core Principles:
 * 1. Bookkeeper enters ONE total number of hours worked (e.g. 7.60, 15.20, 10.50, 2.75).
 * 2. Does NOT assume a universal award rule (e.g. 2-hr vs 3-hr threshold or overtime vs ordinary).
 * 3. Automatically distributes/splits the total hours across configurable rate tiers (e.g. First 2.00 hrs @ 150%, Remaining @ 200%).
 * 4. Calculates exact decimal pay per tier and total pay.
 * 5. Reconciles allocated hours against original timesheet hours (ensures Difference = 0.00).
 * 6. Supports optional minimum engagement/payment comparison.
 * 7. Supports optional shift start/end duration reconciliation.
 */
export function calculateWeekendPay(inputs: WeekendPayInputs): WeekendPayResults {
  const ordinaryHourlyRate = Math.max(0, parseFormattedNumber(inputs.ordinaryHourlyRate) || 0);
  const totalHoursWorked = Math.max(
    0,
    parseFormattedNumber(inputs.totalHoursWorked ?? inputs.splitTotalHours ?? inputs.hoursWorked ?? 0)
  );

  const rateTreatment = inputs.rateTreatment || 'Use one applicable rate';
  const awardReference = (inputs.awardReference || '').trim();

  // Minimum engagement handling
  const applyMinimumPayment = Boolean(inputs.applyMinimumPayment);
  const minHoursParam = Math.max(0, Number(inputs.minimumHours) || 0);
  const isMinimumPaymentApplied = applyMinimumPayment && minHoursParam > totalHoursWorked;
  const payableHours = isMinimumPaymentApplied ? minHoursParam : totalHoursWorked;
  const minimumShortfallHours = isMinimumPaymentApplied
    ? Math.round((minHoursParam - totalHoursWorked) * 10000) / 10000
    : 0;

  // Active tiers
  const rawTiers =
    inputs.tiers && inputs.tiers.length > 0
      ? inputs.tiers
      : inputs.splitTiers && inputs.splitTiers.length > 0
      ? inputs.splitTiers
      : [
          { id: 'tier-1', name: 'First 2.00 hours', capHours: 2.0, ratePercentage: 150 },
          { id: 'tier-2', name: 'Remaining hours', capHours: null, ratePercentage: 200 },
        ];

  let remainingPool = payableHours;
  let totalAllocatedHours = 0;
  let totalWeekendPay = 0;
  const tierResults: SplitTierResult[] = [];
  const calculationSteps: string[] = [];

  rawTiers.forEach((tier, index) => {
    const isLast = index === rawTiers.length - 1;
    const cap = tier.capHours;
    let allocated = 0;

    if (cap === null || isLast) {
      allocated = Math.max(0, remainingPool);
      remainingPool = 0;
    } else {
      const numericCap = Math.max(0, Number(cap) || 0);
      allocated = Math.min(Math.max(0, remainingPool), numericCap);
      remainingPool = Math.max(0, remainingPool - allocated);
    }

    allocated = Math.round(allocated * 10000) / 10000;

    const ratePercentage = Math.max(0, Number(tier.ratePercentage) || 0);
    const tierMultiplier = ratePercentage / 100;
    const tierHourlyRate = Math.round(ordinaryHourlyRate * tierMultiplier * 10000) / 10000;
    const tierPay = Math.round(allocated * tierHourlyRate * 100) / 100;

    totalAllocatedHours += allocated;
    totalWeekendPay += tierPay;

    const formattedPercent = `${
      ratePercentage % 1 === 0 ? ratePercentage.toFixed(0) : ratePercentage.toFixed(2)
    }%`;

    let label = tier.name;
    if (!label) {
      if (cap !== null && !isLast) {
        label = `First ${formatNum(cap, 2)} hrs @ ${formattedPercent}`;
      } else {
        label = `Remaining hrs @ ${formattedPercent}`;
      }
    }

    const equation = `${formatNum(allocated, 2)} hrs @ ${formattedPercent} ($${formatNum(tierHourlyRate, 2)}/hr) = $${formatNum(tierPay, 2)}`;
    const step = `$${formatNum(ordinaryHourlyRate, 2)} × ${formattedPercent} = $${formatNum(tierHourlyRate, 2)}/hr | $${formatNum(tierHourlyRate, 2)} × ${formatNum(allocated, 2)} hrs = $${formatNum(tierPay, 2)}`;

    tierResults.push({
      id: tier.id || `tier-${index + 1}`,
      tierIndex: index + 1,
      label,
      capHours: isLast ? null : cap,
      ratePercentage,
      multiplier: tierMultiplier,
      tierHourlyRate,
      allocatedHours: allocated,
      tierPay,
      equation,
    });

    calculationSteps.push(step);
  });

  totalAllocatedHours = Math.round(totalAllocatedHours * 10000) / 10000;
  totalWeekendPay = Math.round(totalWeekendPay * 100) / 100;

  const hoursDifference =
    Math.round(Math.abs(payableHours - totalAllocatedHours) * 10000) / 10000;
  const isReconciled = hoursDifference < 0.0001;

  // Shift duration reconciliation (optional)
  let calculatedShiftDuration: number | null = null;
  let shiftDifference: number | null = null;
  if (inputs.enableShiftTimes && inputs.shiftStartTime && inputs.shiftEndTime) {
    calculatedShiftDuration = calculateShiftDuration(
      inputs.shiftStartTime,
      inputs.shiftEndTime,
      inputs.unpaidBreakMinutes || 0
    );
    if (calculatedShiftDuration !== null) {
      shiftDifference =
        Math.round(Math.abs(totalHoursWorked - calculatedShiftDuration) * 10000) / 10000;
    }
  }

  // Legacy fields for backward compatibility
  const splitHoursResult: SplitHoursResult = {
    totalInputHours: totalHoursWorked,
    totalAllocatedHours,
    hoursDifference,
    isReconciled,
    totalSplitPay: totalWeekendPay,
    tierResults,
  };

  return {
    dayWorked: inputs.dayWorked || 'Saturday',
    workType: inputs.workType || 'Overtime',
    rateTreatment,
    awardReference,
    ordinaryHourlyRate,
    totalHoursWorked,
    payableHours,
    isMinimumPaymentApplied,
    minimumHours: minHoursParam,
    minimumShortfallHours,
    tierResults,
    totalAllocatedHours,
    hoursDifference,
    isReconciled,
    totalWeekendPay,
    calculationSteps,
    calculatedShiftDuration,
    shiftDifference,
    // Backward compatibility
    calculationType: 'Split Hours',
    isTieredOvertime: inputs.workType === 'Overtime',
    multiplier: tierResults[0]?.multiplier || 1.5,
    weekendPayRate: tierResults[0]?.tierHourlyRate || ordinaryHourlyRate * 1.5,
    hoursWorked: totalHoursWorked,
    breakdownEquation: tierResults.map((t) => t.equation).join(' | '),
    firstOtRatePercentage: tierResults[0]?.ratePercentage || 150,
    firstOtMultiplier: tierResults[0]?.multiplier || 1.5,
    firstTierHourlyRate: tierResults[0]?.tierHourlyRate || ordinaryHourlyRate * 1.5,
    firstTierHours: tierResults[0]?.allocatedHours || 0,
    firstTierPay: tierResults[0]?.tierPay || 0,
    higherOtRatePercentage: tierResults[1]?.ratePercentage || 200,
    higherOtMultiplier: tierResults[1]?.multiplier || 2.0,
    higherTierHourlyRate: tierResults[1]?.tierHourlyRate || ordinaryHourlyRate * 2.0,
    higherRateThresholdHours: Number(tierResults[0]?.capHours) || 2.0,
    remainingHours: tierResults[1]?.allocatedHours || 0,
    higherTierPay: tierResults[1]?.tierPay || 0,
    totalOvertimeHours: totalHoursWorked,
    totalOvertimePay: totalWeekendPay,
    splitHoursResult,
  };
}

/**
 * Generates an auditable, bookkeeper-friendly statement text for the Weekend Pay Calculator.
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

  const tierLines = results.tierResults
    .map(
      (t) =>
        `  • ${t.label.padEnd(28)} : ${formatNum(t.allocatedHours, 2).padStart(6)} hrs (${formatDecimalToHoursMinutes(t.allocatedHours)}) @ ${String(t.ratePercentage).padStart(3)}% ($${formatNum(t.tierHourlyRate, 2)}/hr) = $${formatNum(t.tierPay, 2)}`
    )
    .join('\n');

  const formulaLines = results.tierResults
    .map(
      (t) =>
        `  $${formatNum(results.ordinaryHourlyRate, 2)} × ${t.ratePercentage}% = $${formatNum(t.tierHourlyRate, 2)}/hr | $${formatNum(t.tierHourlyRate, 2)} × ${formatNum(t.allocatedHours, 2)} hrs = $${formatNum(t.tierPay, 2)}`
    )
    .join('\n');

  const awardText = results.awardReference ? `Award / Agreement: ${results.awardReference}\n` : '';
  const minPaymentText = results.isMinimumPaymentApplied
    ? `Minimum Engagement Applied: Yes (Worked ${formatNum(results.totalHoursWorked, 2)} hrs, Paid ${formatNum(results.payableHours, 2)} hrs; Top-up: ${formatNum(results.minimumShortfallHours, 2)} hrs)\n`
    : '';

  return `==========================================
ACCRUELY - WEEKEND PAY & PENALTY RATE STATEMENT
Generated on: ${dateStr}
Reference: Australian Award & Agreement Rate Reconciliation
==========================================

EMPLOYEE & SHIFT INFORMATION
------------------------------------------
Employee Name:       ${inputs.employeeName || 'Unspecified Employee'}
Employee Type:       ${inputs.employeeType}
Day Worked:          ${results.dayWorked}
Work Classification: ${results.workType}
Rate Treatment:      ${results.rateTreatment}
${awardText}Ordinary Rate:       $${formatNum(results.ordinaryHourlyRate, 2)}/hr
Total Timesheet:     ${formatNum(results.totalHoursWorked, 2)} hrs (${formatDecimalToHoursMinutes(results.totalHoursWorked)})
${minPaymentText}
RATE STRUCTURE BREAKDOWN
------------------------------------------
${tierLines}

CALCULATION DETAILS (AUDIT TRAIL)
------------------------------------------
${formulaLines}
Total Calculated Pay = $${formatNum(results.totalWeekendPay, 2)}

HOURS RECONCILIATION
------------------------------------------
Original Timesheet Hours: ${formatNum(results.totalHoursWorked, 2)} hrs
Total Allocated Hours:    ${formatNum(results.totalAllocatedHours, 2)} hrs
Reconciliation Variance:  ${formatNum(results.hoursDifference, 2)} hrs ${results.isReconciled ? '✓ (100% Reconciled)' : '⚠ (Variance Detected)'}

SUMMARY
==========================================
TOTAL PAYABLE HOURS: ${formatNum(results.totalAllocatedHours, 2)} hrs
TOTAL PAY:           $${formatNum(results.totalWeekendPay, 2)}
==========================================

NOTICE & DISCLAIMER:
Weekend and overtime rates vary by modern award, enterprise agreement, employee type and circumstances. Accruely calculates the rate structure you enter; it does not determine which award or rate applies. Verify the applicable industrial instrument before processing payroll.

==========================================
Accruely • Australian Payroll Tools
==========================================`;
}
