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
 * WEEKEND PAY CALCULATOR
 *
 * Supports:
 * 1. Ordinary Hours:
 *    Multiplier = Weekend Percentage ÷ 100
 *    Weekend Pay Rate = Ordinary Hourly Rate × Multiplier
 *    Total Weekend Pay = Weekend Pay Rate × Hours Worked
 * 2. Tiered Overtime:
 *    First Tier Hours = MIN(Total OT Hours, Threshold Hours)
 *    Remaining Hours = MAX(Total OT Hours - Threshold Hours, 0)
 *    First Tier Pay = Ordinary Rate × First OT Multiplier × First Tier Hours
 *    Higher Tier Pay = Ordinary Rate × Higher OT Multiplier × Remaining Hours
 *    Total Overtime Pay = First Tier Pay + Higher Tier Pay
 */
export function calculateWeekendPay(inputs: WeekendPayInputs): WeekendPayResults {
  const isTieredOvertime = inputs.workType === 'Overtime';
  const ordinaryRate = Math.max(0, Number(inputs.ordinaryHourlyRate) || 0);

  // --- ORDINARY HOURS CALCULATION ---
  const percentage = Math.max(0, Number(inputs.weekendRatePercentage) || 0);
  const hours = Math.max(0, Number(inputs.hoursWorked) || 0);
  const multiplier = percentage / 100;
  const weekendPayRate = ordinaryRate * multiplier;
  const totalOrdinaryPay = weekendPayRate * hours;

  // Formatted Ordinary Equation: $30.00 × 150% × 6.00 = $270.00
  const formattedOrdinary = `$${formatNum(ordinaryRate, 2)}`;
  const formattedPercent = `${percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2)}%`;
  const formattedHours = formatNum(hours, 2);
  const formattedOrdinaryTotal = `$${formatNum(totalOrdinaryPay, 2)}`;
  let breakdownEquation = `${formattedOrdinary} × ${formattedPercent} × ${formattedHours} = ${formattedOrdinaryTotal}`;

  // --- TIERED OVERTIME CALCULATION ---
  const firstOtRatePercentage = Math.max(0, Number(inputs.firstOtRatePercentage) || 0);
  const higherOtRatePercentage = Math.max(0, Number(inputs.higherOtRatePercentage) || 0);
  const higherRateThresholdHours = Math.max(0, Number(inputs.higherRateThresholdHours) || 0);
  const totalOvertimeHours = Math.max(0, Number(inputs.totalOtHours) || 0);

  const firstOtMultiplier = firstOtRatePercentage / 100;
  const higherOtMultiplier = higherOtRatePercentage / 100;

  const firstTierHourlyRate = ordinaryRate * firstOtMultiplier;
  const higherTierHourlyRate = ordinaryRate * higherOtMultiplier;

  const firstTierHours = Math.min(totalOvertimeHours, higherRateThresholdHours);
  const remainingHours = Math.max(totalOvertimeHours - higherRateThresholdHours, 0);

  const firstTierPay = ordinaryRate * firstOtMultiplier * firstTierHours;
  const higherTierPay = ordinaryRate * higherOtMultiplier * remainingHours;
  const totalOvertimePay = firstTierPay + higherTierPay;

  if (isTieredOvertime) {
    const formattedFirstPercent = `${
      firstOtRatePercentage % 1 === 0
        ? firstOtRatePercentage.toFixed(0)
        : firstOtRatePercentage.toFixed(2)
    }%`;
    const formattedHigherPercent = `${
      higherOtRatePercentage % 1 === 0
        ? higherOtRatePercentage.toFixed(0)
        : higherOtRatePercentage.toFixed(2)
    }%`;

    const firstEq = `${formattedOrdinary} × ${formattedFirstPercent} × ${formatNum(firstTierHours, 2)} = $${formatNum(firstTierPay, 2)}`;

    if (remainingHours > 0) {
      const higherEq = `${formattedOrdinary} × ${formattedHigherPercent} × ${formatNum(remainingHours, 2)} = $${formatNum(higherTierPay, 2)}`;
      breakdownEquation = `${firstEq} | ${higherEq} | Total: $${formatNum(totalOvertimePay, 2)}`;
    } else {
      breakdownEquation = `${firstEq} (Total: $${formatNum(totalOvertimePay, 2)})`;
    }
  }

  const totalWeekendPay = isTieredOvertime ? totalOvertimePay : totalOrdinaryPay;

  return {
    isTieredOvertime,
    multiplier,
    weekendPayRate,
    hoursWorked: hours,
    breakdownEquation,
    firstOtRatePercentage,
    firstOtMultiplier,
    firstTierHourlyRate,
    firstTierHours,
    firstTierPay,
    higherOtRatePercentage,
    higherOtMultiplier,
    higherTierHourlyRate,
    higherRateThresholdHours,
    remainingHours,
    higherTierPay,
    totalOvertimeHours,
    totalOvertimePay,
    totalWeekendPay,
  };
}

export function generateWeekendPayStatementText(
  inputs: WeekendPayInputs,
  results: WeekendPayResults
): string {
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (inputs.workType === 'Overtime') {
    const formattedFirstPercent = `${
      inputs.firstOtRatePercentage % 1 === 0
        ? inputs.firstOtRatePercentage.toFixed(0)
        : inputs.firstOtRatePercentage.toFixed(2)
    }%`;
    const formattedHigherPercent = `${
      inputs.higherOtRatePercentage % 1 === 0
        ? inputs.higherOtRatePercentage.toFixed(0)
        : inputs.higherOtRatePercentage.toFixed(2)
    }%`;

    return `==========================================
ACCRUELY - WEEKEND OVERTIME STATEMENT
Generated on: ${dateStr}
Reference: Australian Award / Agreement Tiered Overtime Calculation
==========================================

EMPLOYEE & SHIFT DETAILS
------------------------------------------
Employee:        ${inputs.employeeName || 'Unspecified Employee'}
Employee Type:   ${inputs.employeeType}
Day Worked:      ${inputs.dayWorked}
Work Type:       Overtime (Tiered Calculation)

RATE & THRESHOLD PARAMETERS
------------------------------------------
Ordinary Hourly Rate:    $${formatNum(inputs.ordinaryHourlyRate, 2)}/hr
First Overtime Rate:     ${formattedFirstPercent} (${results.firstOtMultiplier.toFixed(2)}× = $${formatNum(results.firstTierHourlyRate, 2)}/hr)
Higher Overtime Rate:    ${formattedHigherPercent} (${results.higherOtMultiplier.toFixed(2)}× = $${formatNum(results.higherTierHourlyRate, 2)}/hr)
Higher Rate Threshold:   ${formatNum(inputs.higherRateThresholdHours, 2)} hrs
Total Overtime Hours:    ${formatNum(inputs.totalOtHours, 2)} hrs

TIERED OVERTIME BREAKDOWN
------------------------------------------
First Tier:   $${formatNum(results.firstTierHourlyRate, 2)}/hr × ${formatNum(results.firstTierHours, 2)} hrs = $${formatNum(results.firstTierPay, 2)}
Higher Tier:  $${formatNum(results.higherTierHourlyRate, 2)}/hr × ${formatNum(results.remainingHours, 2)} hrs = $${formatNum(results.higherTierPay, 2)}

CALCULATION EQUATIONS
------------------------------------------
• First Tier:   $${formatNum(inputs.ordinaryHourlyRate, 2)} × ${formattedFirstPercent} × ${formatNum(results.firstTierHours, 2)} = $${formatNum(results.firstTierPay, 2)}
${
  results.remainingHours > 0
    ? `• Higher Tier:  $${formatNum(inputs.ordinaryHourlyRate, 2)} × ${formattedHigherPercent} × ${formatNum(results.remainingHours, 2)} = $${formatNum(results.higherTierPay, 2)}
• Total Sum:    $${formatNum(results.firstTierPay, 2)} + $${formatNum(results.higherTierPay, 2)} = $${formatNum(results.totalOvertimePay, 2)}`
    : `• Higher Tier:  Not applicable (Hours do not exceed ${formatNum(inputs.higherRateThresholdHours, 2)} hr threshold)`
}

TOTAL SUMMARY
==========================================
TOTAL OVERTIME PAY: $${formatNum(results.totalOvertimePay, 2)}
==========================================

NOTICE:
Overtime rates and thresholds can vary depending on the applicable modern award, enterprise agreement, employment arrangement, employee type and circumstances. Verify the applicable rate and threshold before processing payroll.

==========================================
Accruely • Australian Payroll Tools
==========================================`;
  }

  const formattedPercent = `${
    inputs.weekendRatePercentage % 1 === 0
      ? inputs.weekendRatePercentage.toFixed(0)
      : inputs.weekendRatePercentage.toFixed(2)
  }%`;

  return `==========================================
ACCRUELY - WEEKEND PAY STATEMENT
Generated on: ${dateStr}
Reference: Australian Award / Agreement Weekend Penalty Calculation
==========================================

EMPLOYEE & SHIFT DETAILS
------------------------------------------
Employee:        ${inputs.employeeName || 'Unspecified Employee'}
Employee Type:   ${inputs.employeeType}
Day Worked:      ${inputs.dayWorked}
Work Type:       ${inputs.workType}

RATE & HOURS BREAKDOWN
------------------------------------------
Ordinary Rate:    $${formatNum(inputs.ordinaryHourlyRate, 2)}/hr
Weekend Rate:     ${formattedPercent} (Multiplier: ${results.multiplier.toFixed(2)}×)
Weekend Pay Rate: $${formatNum(results.weekendPayRate, 2)}/hr
Hours Worked:     ${formatNum(inputs.hoursWorked, 2)} hrs

CALCULATION BREAKDOWN
------------------------------------------
${results.breakdownEquation}

TOTAL SUMMARY
==========================================
TOTAL WEEKEND PAY: $${formatNum(results.totalWeekendPay, 2)}
==========================================

==========================================
Accruely • Australian Payroll Tools
==========================================`;
}
