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

// --- WEEKEND PAY CALCULATOR TYPES ---
export type WeekendPayPeriod = 'Weekly' | 'Fortnightly' | 'Bi-Weekly' | 'Monthly';

export type EmployeeType = 'Full-time' | 'Part-time' | 'Casual' | 'Other / Custom';
export type DayWorked = 'Saturday' | 'Sunday';
export type WorkType =
  | 'Ordinary Weekend Hours'
  | 'Overtime'
  | 'Custom / Split Rate'
  | 'Ordinary Hours';
export type WeekendCalculationType = 'Standard' | 'Split Hours';
export type RateTreatment =
  | 'Use one applicable rate'
  | 'Use the higher applicable rate'
  | 'Custom rule';

export interface OvertimeRateSplit {
  id: string;
  label: string;
  rateName: string;
  multiplier: number;
  ratePercentage: number;
  hours: number;
  hourlyRate?: number;
  pay?: number;
  formula?: string;
}

export interface PayrollCategoryItem {
  id: string;
  name: string;
  hours: number | string;
  allocationType?: 'manual' | 'auto-remaining' | 'auto-cap';
  capHours?: number | string | null;
  multiplier?: number | string; // e.g. 1.0, 1.5, 2.0
  ratePercentage?: number | string; // e.g. 100, 150, 200
  effectiveRate?: number;
  categoryPay?: number;
}

export interface DayTimesheetEntry {
  id: string;
  dayName: string;
  hours: number | string;
  isOrdinary?: boolean;
  notes?: string;
}

export type WeekendCalculatorMode = 'single' | 'weekly';

export interface SplitTierConfig {
  id: string;
  name?: string;
  capHours: number | null; // null represents "Remaining hours"
  ratePercentage: number;
}

export interface SplitTierResult {
  id: string;
  tierIndex: number;
  label: string;
  capHours: number | null;
  ratePercentage: number;
  multiplier: number;
  tierHourlyRate: number;
  allocatedHours: number;
  tierPay: number;
  equation: string;
}

export interface SplitHoursResult {
  totalInputHours: number;
  totalAllocatedHours: number;
  hoursDifference: number;
  isReconciled: boolean;
  totalSplitPay: number;
  tierResults: SplitTierResult[];
}

export interface CategoryResultItem {
  id: string;
  name: string;
  allocatedHours: number;
  multiplier: number;
  ratePercentage: number;
  hourlyRate: number;
  categoryPay: number;
  formula: string;
}

export interface DayCategorySplitItem {
  id: string;
  name: string;
  hours: number | string;
  allocatedHours: number;
  multiplier?: number;
  ratePercentage?: number;
  hourlyRate?: number;
  pay?: number;
}

export interface WeekendDayConfig {
  dayName: 'Saturday' | 'Sunday' | string;
  ruleMode?: 'capacity-38h' | 'custom-categories';
  categories?: PayrollCategoryItem[];
}

export interface WeekendPayInputs {
  // Primary Australian Payroll Overtime Splitting Inputs
  employeeName?: string;
  payPeriod?: WeekendPayPeriod | string;
  selectedRuleId?: string;
  saturdayHours?: number | string;
  sundayHours?: number | string;

  // Custom Award Overtime Configuration (if selectedRuleId === 'custom')
  customSatThreshold?: number | string;
  customSatFirstMultiplier?: number | string;
  customSatSecondMultiplier?: number | string;
  customSunMultiplier?: number | string;

  // Optional Rate Calculation
  enablePayCalculation?: boolean;
  ordinaryHourlyRate?: number | string;

  // Backward compatibility fields
  mode?: WeekendCalculatorMode;
  employmentTypeFilter?: string;
  showWeekdayInputs?: boolean;
  w1Monday?: number | string;
  w1Tuesday?: number | string;
  w1Wednesday?: number | string;
  w1Thursday?: number | string;
  w1Friday?: number | string;
  w1Saturday?: number | string;
  w1Sunday?: number | string;
  w2Monday?: number | string;
  w2Tuesday?: number | string;
  w2Wednesday?: number | string;
  w2Thursday?: number | string;
  w2Friday?: number | string;
  w2Saturday?: number | string;
  w2Sunday?: number | string;
  saturdayCap?: string;
  sundayCap?: string;
  totalTimesheetHours?: number | string;
  dayWorked?: DayWorked | string;
  weeklyDays?: DayTimesheetEntry[];
  weeklyOrdinaryThreshold?: number | string;
  useOrdinaryThreshold?: boolean;
  payRule?: 'casual' | 'weekly-38h' | 'daily-shift' | 'all-overtime' | 'custom' | string;
  casualShiftCap?: string;
  saturdayConfig?: WeekendDayConfig;
  sundayConfig?: WeekendDayConfig;
  w1SaturdayConfig?: WeekendDayConfig;
  w1SundayConfig?: WeekendDayConfig;
  w2SaturdayConfig?: WeekendDayConfig;
  w2SundayConfig?: WeekendDayConfig;
  categories?: PayrollCategoryItem[];
  splitMode?: 'manual' | 'automatic';
  payrollAmount?: number | null | string;
  totalHoursWorked?: number | string;
  tiers?: SplitTierConfig[];
  employeeType?: EmployeeType;
  workType?: WorkType;
  rateTreatment?: RateTreatment;
  awardReference?: string;
  applyMinimumPayment?: boolean;
  minimumHours?: number;
  enableShiftTimes?: boolean;
  shiftStartTime?: string;
  shiftEndTime?: string;
  unpaidBreakMinutes?: number;
  calculationType?: WeekendCalculationType;
  weekendRatePercentage?: number;
  hoursWorked?: number;
  firstOtRatePercentage?: number;
  higherOtRatePercentage?: number;
  higherRateThresholdHours?: number;
  totalOtHours?: number;
  splitTotalHours?: number;
  splitTiers?: SplitTierConfig[];
}

export interface DayCalculationBasis {
  payrollPeriod: string;
  week: string;
  day: string;
  employmentType: string;
  selectedRule: string;
  originalHours: number;
  threshold?: number | null;
  allocationText: string;
  variance: number;
  isReconciled: boolean;
}

export interface DaySplitResult {
  dayKey?: string;
  weekNumber?: 1 | 2;
  weekLabel?: string;
  dayName: string;
  fullLabel?: string;
  timesheetHours: number;
  categorySplits?: DayCategorySplitItem[];
  ordinaryHours: number;
  overtimeHours: number;
  totalAllocated: number;
  difference?: number;
  isReconciled: boolean;
  ruleDescription?: string;
  calculationBasis?: DayCalculationBasis;
}

export interface WeekendPayResults {
  // Primary Weekend Overtime Split Results
  employeeName: string;
  payPeriod: WeekendPayPeriod | string;
  awardRuleId: string;
  awardRuleName: string;
  awardRuleShortName: string;
  awardRuleBadge: string;
  awardRuleDescription: string;
  saturdayHours: number;
  sundayHours: number;
  totalWeekendHours: number;
  saturdaySplits: OvertimeRateSplit[];
  sundaySplits: OvertimeRateSplit[];
  combinedSplits: OvertimeRateSplit[];
  isReconciled: boolean;
  reconciledEquation: string;

  mode: WeekendCalculatorMode;
  totalTimesheetHours: number;
  totalAllocatedHours: number;
  hoursDifference: number;
  reconciliationStatus: 'reconciled' | 'under-allocated' | 'over-allocated';
  statusMessage: string;

  // Fortnight reconciliation summaries
  totalFortnightTimesheetHours?: number;
  totalFortnightAllocatedHours?: number;
  fortnightHoursDifference?: number;
  isFortnightReconciled?: boolean;
  activeDayBreakdowns?: DaySplitResult[];
  missingInformationNotice?: string;

  // Specific day breakdowns (Fortnightly)
  w1SaturdayBreakdown?: DaySplitResult;
  w1SundayBreakdown?: DaySplitResult;
  w2SaturdayBreakdown?: DaySplitResult;
  w2SundayBreakdown?: DaySplitResult;

  // Categories & results
  categoryResults: CategoryResultItem[];

  // Weekly details (if applicable)
  weeklyTotalHours?: number;
  weekdayOrdinaryTotal?: number;
  remainingOrdinaryCapacity?: number;
  weekendTotalHours?: number;
  weekendOrdinaryHours?: number;
  weekendOvertimeHours?: number;
  totalWeekOrdinaryHours?: number;
  totalWeekOvertimeHours?: number;
  
  // Specific day breakdowns
  saturdayBreakdown?: DaySplitResult;
  sundayBreakdown?: DaySplitResult;
  dailyBreakdowns?: DaySplitResult[];

  // Optional pay calculation
  hasPayCalculation: boolean;
  ordinaryHourlyRate: number;
  totalGrossPay: number;
  
  // Optional Payroll Check
  payrollAmountEntered?: number | null;
  payrollDifference?: number | null;
  isPayrollMatched?: boolean | null;

  // Backward compatibility fields
  dayWorked?: DayWorked | string;
  tierResults?: SplitTierResult[];
  totalWeekendPay?: number;
  calculationSteps?: string[];
  totalHoursWorked?: number;
  workType?: WorkType;
  rateTreatment?: RateTreatment;
  awardReference?: string;
  payableHours?: number;
  isMinimumPaymentApplied?: boolean;
  minimumHours?: number;
  minimumShortfallHours?: number;
  calculatedShiftDuration?: number | null;
  shiftDifference?: number | null;
  calculationType?: WeekendCalculationType;
  isTieredOvertime?: boolean;
  multiplier?: number;
  weekendPayRate?: number;
  hoursWorked?: number;
  breakdownEquation?: string;
  firstOtRatePercentage?: number;
  firstOtMultiplier?: number;
  firstTierHourlyRate?: number;
  firstTierHours?: number;
  firstTierPay?: number;
  higherOtRatePercentage?: number;
  higherOtMultiplier?: number;
  higherTierHourlyRate?: number;
  higherRateThresholdHours?: number;
  remainingHours?: number;
  higherTierPay?: number;
  totalOvertimeHours?: number;
  totalOvertimePay?: number;
  splitHoursResult?: SplitHoursResult;
}

export type ActiveTab =
  | 'leave-accrual'
  | 'pl-opening-balance'
  | 'standard-ot-adjustment'
  | 'weekend-pay'
  | 'settings'
  | 'about'
  | 'privacy-policy';

export type CalculatorTabType =
  | 'leave-accrual'
  | 'pl-opening-balance'
  | 'standard-ot-adjustment'
  | 'weekend-pay';

export interface HistoryKeyMetric {
  label: string;
  value: string;
}

export interface CalculationHistoryItem {
  id: string;
  calculatorType: CalculatorTabType;
  calculatorTitle: string;
  timestamp: string; // ISO string
  employeeName: string;
  summary: string;
  keyMetrics: HistoryKeyMetric[];
  inputs: LeaveAccrualInputs | PLCalculatorInputs | StandardOTAdjustmentInputs | WeekendPayInputs;
  results: LeaveAccrualResults | PLCalculatorResults | StandardOTAdjustmentResults | WeekendPayResults;
}
