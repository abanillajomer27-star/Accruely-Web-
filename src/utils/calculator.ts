import { CalculatorInputs, CalculatorResults, PayFrequency } from '../types';

// Accrual Rates strictly following Excel formulas:
// AL Accrual Rate: =4*38/52/38 = 4 / 52 = 0.07692307692307693
// PL Accrual Rate: =2*38/52/38 = 2 / 52 = 0.038461538461538464
export const STANDARD_AL_RATE = (4 * 38) / 52 / 38;
export const STANDARD_PL_RATE = (2 * 38) / 52 / 38;

export function getDefaultHoursForPayFrequency(
  freq: PayFrequency,
  stdHoursPerDay: number = 7.6
): number {
  const weekly = stdHoursPerDay * 5;
  switch (freq) {
    case 'Weekly':
      return weekly;
    case 'Fortnightly':
    case 'Bi-Monthly':
      return weekly * 2;
    case 'Monthly':
      return (weekly * 52) / 12;
    default:
      return weekly;
  }
}

export function calculateLeaveAccruals(inputs: CalculatorInputs): CalculatorResults {
  const ordinaryHours = Number(inputs.ordinaryHours) || 0;
  const publicHolidayHours = Number(inputs.publicHolidayHours) || 0;
  const annualLeaveTaken = Number(inputs.annualLeaveTaken) || 0;
  const personalLeaveTaken = Number(inputs.personalLeaveTaken) || 0;

  // Total Paid Hours = Ordinary Hours Worked + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken
  // Workbook formula: =D8+D9+D10+D11
  const totalPaidHours = ordinaryHours + publicHolidayHours + annualLeaveTaken + personalLeaveTaken;

  // Total Hours for Pay Period
  const totalPeriodHours =
    inputs.totalHoursForPeriod !== undefined && inputs.totalHoursForPeriod !== null && !isNaN(Number(inputs.totalHoursForPeriod))
      ? Number(inputs.totalHoursForPeriod)
      : getDefaultHoursForPayFrequency(inputs.payFrequency, inputs.standardHoursPerDay);

  // Leave Without Pay = Total Hours For The Pay Period - Total Paid Hours
  // Workbook formula: =D14-D12
  const leaveWithoutPayHours = totalPeriodHours - totalPaidHours;

  // Determine accrual rates
  let alAccrualRate = STANDARD_AL_RATE;
  let plAccrualRate = STANDARD_PL_RATE;

  if (inputs.overrideDefaultRates) {
    alAccrualRate = Number(inputs.customAlRate) || 0;
    plAccrualRate = Number(inputs.customPlRate) || 0;
  } else {
    switch (inputs.profile) {
      case 'Australian NES Full-Time':
      case 'Australian NES Part-Time (Pro-rata)':
        alAccrualRate = STANDARD_AL_RATE;
        plAccrualRate = STANDARD_PL_RATE;
        break;
      case 'Casual Employee':
        alAccrualRate = 0;
        plAccrualRate = 0;
        break;
      case 'Custom Company Policy':
        const customWeeks = inputs.customWeeksAnnualLeave ?? 4;
        const customDays = inputs.customDaysPersonalLeave ?? 10;
        alAccrualRate = (customWeeks * 38) / 52 / 38;
        plAccrualRate = ((customDays / 5) * 38) / 52 / 38;
        break;
      default:
        alAccrualRate = STANDARD_AL_RATE;
        plAccrualRate = STANDARD_PL_RATE;
    }
  }

  // Annual Leave Calculations
  // Workbook: AL Accrued = Total Paid Hours * Accrual Rate (=D12*D18)
  const alAccruedThisPay = totalPaidHours * alAccrualRate;

  // Available AL = Opening AL Balance + AL Accrued (=D17+D19)
  const openingAnnualLeave = Number(inputs.openingAnnualLeave) || 0;
  const alAvailable = openingAnnualLeave + alAccruedThisPay;

  // Closing AL = Available AL - AL Taken (=D20-D21)
  const alClosingBalance = alAvailable - annualLeaveTaken;

  // Personal Leave Calculations
  // Workbook: PL Accrued = Total Paid Hours * PL Accrual Rate (=D12*D26)
  const plAccruedThisPay = totalPaidHours * plAccrualRate;

  // Available PL = Opening PL Balance + PL Accrued (=D25+D27)
  const openingPersonalLeave = Number(inputs.openingPersonalLeave) || 0;
  const plAvailable = openingPersonalLeave + plAccruedThisPay;

  // Closing PL = Available PL - PL Taken (=D28-D29)
  const plClosingBalance = plAvailable - personalLeaveTaken;

  return {
    totalPaidHours,
    leaveWithoutPayHours,
    alAccrualRate,
    plAccrualRate,
    alAccruedThisPay,
    alAvailable,
    alClosingBalance,
    plAccruedThisPay,
    plAvailable,
    plClosingBalance,
  };
}

export function formatNum(val: number, decimals: number = 4): string {
  if (isNaN(val) || val === null || val === undefined) return (0).toFixed(decimals);
  return Number(val).toFixed(decimals);
}

export function generateLeaveStatementText(
  inputs: CalculatorInputs,
  results: CalculatorResults
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

EMPLOYEE DETAILS
------------------------------------------
Employee: ${inputs.employeeName || 'Unspecified Employee'}
Leave Profile: ${inputs.profile}
Pay Frequency: ${inputs.payFrequency}
Standard Hours/Day: ${inputs.standardHoursPerDay} hrs

PAY PERIOD SUMMARY
------------------------------------------
Ordinary Hours Worked: ${formatNum(inputs.ordinaryHours)} hrs
Public Holiday Hours:   ${formatNum(inputs.publicHolidayHours)} hrs
Annual Leave Taken:     ${formatNum(inputs.annualLeaveTaken)} hrs
Personal Leave Taken:   ${formatNum(inputs.personalLeaveTaken)} hrs
------------------------------------------
TOTAL PAID HOURS:       ${formatNum(results.totalPaidHours)} hrs
Leave Without Pay:      ${formatNum(results.leaveWithoutPayHours)} hrs

ANNUAL LEAVE SUMMARY
------------------------------------------
Opening Balance:        ${formatNum(inputs.openingAnnualLeave)} hrs
Accrual Rate:           ${formatNum(results.alAccrualRate)} hrs/hr worked (${(results.alAccrualRate * 100).toFixed(2)}%)
Accrued This Pay:       ${formatNum(results.alAccruedThisPay)} hrs
Available This Pay:     ${formatNum(results.alAvailable)} hrs
Less Leave Taken:       ${formatNum(inputs.annualLeaveTaken)} hrs
------------------------------------------
CLOSING ANNUAL LEAVE BALANCE: ${formatNum(results.alClosingBalance)} hrs

PERSONAL / CARER'S LEAVE SUMMARY
------------------------------------------
Opening Balance:        ${formatNum(inputs.openingPersonalLeave)} hrs
Accrual Rate:           ${formatNum(results.plAccrualRate)} hrs/hr worked (${(results.plAccrualRate * 100).toFixed(2)}%)
Accrued This Pay:       ${formatNum(results.plAccruedThisPay)} hrs
Available This Pay:     ${formatNum(results.plAvailable)} hrs
Less Leave Taken:       ${formatNum(inputs.personalLeaveTaken)} hrs
------------------------------------------
CLOSING PERSONAL LEAVE BALANCE: ${formatNum(results.plClosingBalance)} hrs

==========================================
Accruely - Made by Jomer Abanilla, CFMS
==========================================`;
}
