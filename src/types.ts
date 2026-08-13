export type PayFrequency = 'Weekly' | 'Fortnightly' | 'Monthly' | 'Bi-Monthly';

export type AccrualProfile =
  | 'Australian NES Full-Time'
  | 'Australian NES Part-Time (Pro-rata)'
  | 'Casual Employee'
  | 'Custom Company Policy';

export interface CalculatorInputs {
  employeeName: string;
  profile: AccrualProfile;
  payFrequency: PayFrequency;
  standardHoursPerDay: number;
  ordinaryHours: number;
  publicHolidayHours: number;
  annualLeaveTaken: number;
  personalLeaveTaken: number;
  totalHoursForPeriod: number;
  overrideDefaultRates: boolean;
  customAlRate: number;
  customPlRate: number;
  openingAnnualLeave: number;
  openingPersonalLeave: number;
  customWeeksAnnualLeave?: number;
  customDaysPersonalLeave?: number;
}

export interface CalculatorResults {
  totalPaidHours: number;
  leaveWithoutPayHours: number;
  alAccrualRate: number;
  plAccrualRate: number;
  alAccruedThisPay: number;
  alAvailable: number;
  alClosingBalance: number;
  plAccruedThisPay: number;
  plAvailable: number;
  plClosingBalance: number;
}

export interface SettingsPreferences {
  defaultStandardHoursPerDay: number;
  defaultPayFrequency: PayFrequency;
  theme: 'System Default' | 'Light Theme' | 'Dark Theme' | 'Light' | 'Dark';
}

export type ActiveTab = 'calculator' | 'settings' | 'about';
