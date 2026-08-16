export type PayFrequency = 'Weekly' | 'Fortnightly' | 'Monthly' | 'Bi-Monthly';

export type LeaveAccrualProfile =
  | 'Australian NES Full-Time'
  | 'Australian NES Part-Time (Pro-rata)'
  | 'Casual Employee'
  | 'Custom Company Policy';

// --- LEAVE ACCRUAL CALCULATOR TYPES ---
export interface LeaveAccrualInputs {
  employeeName: string;
  profile: LeaveAccrualProfile;
  payFrequency: PayFrequency;
  standardHoursPerDay: number;
  totalHoursForPeriod: number;
  ordinaryHours: number;
  publicHolidayHours: number;
  annualLeaveTaken: number;
  personalLeaveTaken: number;
  
  // Rate override toggle & custom values
  overrideDefaultRates: boolean;
  customAnnualLeaveAccrualRate: number;
  customPersonalLeaveAccrualRate: number;
  
  // Balances
  annualLeaveOpeningBalance: number;
  personalLeaveOpeningBalance: number;

  // Legacy/optional fields
  standardHoursPerWeek?: number;
  annualLeaveWeeksPerYear?: number;
  personalLeaveDaysPerYear?: number;
}

export interface LeaveAccrualResults {
  totalPaidHours: number;
  leaveWithoutPayHours: number;
  totalAccruableHours: number;
  
  // Annual Leave
  annualLeaveAccrualRate: number; // 4/52 = 0.0769230769
  annualLeaveAccrued: number;     // Total Paid Hours × Rate
  availableAnnualLeave: number;   // Opening + Accrued
  annualLeaveClosingBalance: number; // Available - Taken
  
  // Personal Leave
  personalLeaveAccrualRate: number; // 10/260 = 0.0384615385
  personalLeaveAccrued: number;     // Total Paid Hours × Rate
  availablePersonalLeave: number;   // Opening + Accrued
  personalLeaveClosingBalance: number; // Available - Taken
}

// --- PL OPENING BALANCE CALCULATOR TYPES ---
export interface EntitlementPeriodData {
  commencementDate: string; // YYYY-MM-DD or empty
  calculationDate: string;  // YYYY-MM-DD or empty
  annualEntitlement: number; // in hours (default 76.00 hrs)
  completedYears: number;   // full anniversaries
  remainingWeeks: number;   // weeks after last anniversary
}

export interface PLCalculatorInputs {
  employeeName: string;
  standardHoursPerDay: number;
  
  // Old Entitlement Period
  oldPeriod: EntitlementPeriodData;

  // New Entitlement Period
  newPeriod: EntitlementPeriodData;

  // Personal Leave Taken / Used
  leaveUsedPreMYOB: number;
  leaveUsedMYOB: number;
  leaveUsedXero: number;
  leaveUsedOther: number;

  // Xero PL Balance Checker
  currentOpeningBalanceXero: number;
  currentXeroBalance: number;
}

export interface PeriodAccrualResults {
  completedYears: number;
  annualEntitlement: number;
  weeklyAccrualRate: number;    // Annual Entitlement ÷ 52
  additionalYearHours: number;  // Completed Years × Annual Entitlement
  remainingWeeks: number;
  remainingWeeksHours: number;  // Remaining Weeks × Weekly Accrual Rate
  totalLeaveEarned: number;     // Additional Year Hours + Remaining Weeks Hours
}

export interface PLCalculatorResults {
  oldRate: PeriodAccrualResults;
  newRate: PeriodAccrualResults;
  grandTotalLeaveEarned: number; // Old Total + New Total
  totalLeaveUsed: number;        // Pre-MYOB + MYOB + Xero + Other
  targetBalance: number;         // Grand Total Leave Earned - Total Leave Used
  targetBalanceDays: number;     // Target Balance ÷ Standard Hours Per Day
  targetBalanceWeeks: number;    // Target Balance ÷ (Standard Hours Per Day × 5)
  xeroUpdatedBalance: number;    // Current Opening in Xero + Target Balance - Current Xero Balance
}

// --- APP & SETTINGS TYPES ---
export interface SettingsPreferences {
  defaultStandardHoursPerDay: number;
  defaultAnnualEntitlementHours: number;
  defaultAnnualLeaveWeeks: number;
  theme: 'System Default' | 'Light Theme' | 'Dark Theme' | 'Light' | 'Dark';
}

// --- STANDARD OT ADJUSTMENT CALCULATOR TYPES ---
export interface StandardOTAdjustmentInputs {
  employeeName: string;
  standardOrdinaryHours: number; // e.g. 38 or 44
  standardOT: number;            // e.g. 2
  lwopDays: number;              // e.g. 0, 1, 2, 0.5
}

export interface StandardOTAdjustmentResults {
  standardHoursPerDay: number;   // Standard Ordinary Hours ÷ 5
  lwopHours: number;             // LWOP Days × Standard Hours Per Day
  ordinaryHoursWorked: number;   // Standard Ordinary Hours − LWOP Hours
  attendancePercentage: number;  // Ordinary Hours Worked ÷ Standard Ordinary Hours
  adjustedStandardOT: number;    // Standard OT × Attendance Percentage
}

export type ActiveTab =
  | 'leave-accrual'
  | 'pl-opening-balance'
  | 'standard-ot-adjustment'
  | 'settings'
  | 'about'
  | 'privacy-policy';
