import { PayrollCategoryItem } from '../types';

export interface RuleTierConfig {
  name: string;
  multiplier: number;
  ratePercentage: number;
  capHours?: number | null;
  isRemaining?: boolean;
}

export interface AwardPayRule {
  id: string;
  name: string;
  badge: string;
  employeeType: 'Casual' | 'Full-Time / Part-Time' | 'Award Specific' | 'General' | 'Custom';
  calculationPeriod: 'Daily Shift' | 'Weekly Threshold' | 'Fortnightly' | 'Award Cycle';
  description: string;
  exampleScenario?: string;
  
  // Saturday Rule
  saturday: {
    defaultCap?: number | null;
    capLabel?: string;
    tiers: RuleTierConfig[];
  };

  // Sunday Rule
  sunday: {
    defaultCap?: number | null;
    capLabel?: string;
    tiers: RuleTierConfig[];
  };

  allowCustomThreshold?: boolean;
}

export const AUSTRALIAN_AWARD_RULES: AwardPayRule[] = [
  {
    id: 'casual-loaded',
    name: 'Casual Employee — Shift Ordinary Cap & Overtime',
    badge: 'Casual / Loaded',
    employeeType: 'Casual',
    calculationPeriod: 'Daily Shift',
    description: 'Casual Hours (incl loading) up to the shift cap (e.g. 4.14h); remaining weekend hours allocate to Casual Overtime (first 3 hours) @ 1.5x.',
    exampleScenario: 'Jordan Miller: 4.98h Sat → 4.14h Casual Hours + 0.84h Casual OT 1.5x',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 4.14,
      capLabel: 'Casual Shift Cap (Sat)',
      tiers: [
        {
          name: 'Casual Hours (incl loading)',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 4.14,
        },
        {
          name: 'Casual Overtime (first 3 hours)',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 4.14,
      capLabel: 'Casual Shift Cap (Sun)',
      tiers: [
        {
          name: 'Casual Hours (incl loading)',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 4.14,
        },
        {
          name: 'Casual Overtime (first 3 hours)',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'fulltime-capacity',
    name: 'Full-Time / Part-Time — Ordinary Capacity & Overtime 1.5x',
    badge: 'Permanent / Threshold',
    employeeType: 'Full-Time / Part-Time',
    calculationPeriod: 'Weekly Threshold',
    description: 'Allocates ordinary hours up to the available threshold (e.g. 2.11h for Saturday, 0.69h for Sunday); excess hours allocate to Overtime 1.5x.',
    exampleScenario: 'Casey Morgan: 4.92h Sat → 2.11h Ordinary + 2.81h Overtime 1.5x',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 2.11,
      capLabel: 'Ordinary Capacity (Sat)',
      tiers: [
        {
          name: 'Ordinary Hours',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 2.11,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 0.69,
      capLabel: 'Ordinary Capacity (Sun)',
      tiers: [
        {
          name: 'Applicable Ordinary Category',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 0.69,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'sunday-overtime-split',
    name: 'Sunday Split — Ordinary Allowance & Overtime 1.5x',
    badge: 'Sunday Threshold',
    employeeType: 'Full-Time / Part-Time',
    calculationPeriod: 'Weekly Threshold',
    description: 'Allocates up to remaining ordinary capacity (e.g. 0.69h) to Applicable Ordinary Category, and balance to Overtime 1.5x.',
    exampleScenario: 'Taylor Brooks: 1.00h Sun → 0.69h Applicable Ordinary + 0.31h Overtime 1.5x',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 2.11,
      capLabel: 'Ordinary Capacity (Sat)',
      tiers: [
        {
          name: 'Ordinary Hours',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 2.11,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 0.69,
      capLabel: 'Ordinary Capacity (Sun)',
      tiers: [
        {
          name: 'Applicable Ordinary Category',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 0.69,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'standard-penalty',
    name: 'All Weekend Overtime / Penalty Rates (150% Sat / 200% Sun)',
    badge: '1.5x Sat / 2.0x Sun',
    employeeType: 'General',
    calculationPeriod: 'Daily Shift',
    description: 'Saturday pays 1.5x Saturday Penalty / Overtime. Sunday pays 2.0x Sunday Penalty / Overtime.',
    allowCustomThreshold: false,
    saturday: {
      tiers: [
        {
          name: 'Saturday Penalty (1.5x)',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      tiers: [
        {
          name: 'Sunday Penalty (2.0x)',
          multiplier: 2.0,
          ratePercentage: 200,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'clerks-award',
    name: 'Clerks Modern Award — Weekend Overtime (1.5x first 3h, then 2.0x)',
    badge: 'Clerks Award',
    employeeType: 'Award Specific',
    calculationPeriod: 'Daily Shift',
    description: 'Saturday: First 3 hours at 1.5x, remaining at 2.0x. Sunday: All hours at 2.0x double time.',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 3.0,
      capLabel: 'First Overtime Band (Hours)',
      tiers: [
        {
          name: 'Saturday Overtime 1.5x (first 3 hours)',
          multiplier: 1.5,
          ratePercentage: 150,
          capHours: 3.0,
        },
        {
          name: 'Saturday Overtime 2.0x (after 3 hours)',
          multiplier: 2.0,
          ratePercentage: 200,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      tiers: [
        {
          name: 'Sunday Overtime 2.0x',
          multiplier: 2.0,
          ratePercentage: 200,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'daily-7.6h',
    name: 'Daily Shift Cap (7.60h Ordinary Shift Threshold)',
    badge: '7.6h Daily Cap',
    employeeType: 'Full-Time / Part-Time',
    calculationPeriod: 'Daily Shift',
    description: 'First 7.60 hours of each shift allocate to Ordinary Hours; excess hours allocate to Overtime 1.5x.',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 7.6,
      capLabel: 'Daily Shift Cap (Sat)',
      tiers: [
        {
          name: 'Ordinary Hours',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 7.6,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 7.6,
      capLabel: 'Daily Shift Cap (Sun)',
      tiers: [
        {
          name: 'Ordinary Hours',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 7.6,
        },
        {
          name: 'Overtime 1.5x',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'retail-award',
    name: 'General Retail Industry Award — Weekend Work',
    badge: 'Retail Award',
    employeeType: 'Award Specific',
    calculationPeriod: 'Daily Shift',
    description: 'Saturday ordinary penalty (1.25x) up to 7.6h shift cap + overtime 1.5x. Sunday penalty (1.50x) for ordinary work.',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 7.6,
      capLabel: 'Saturday Shift Cap',
      tiers: [
        {
          name: 'Saturday Ordinary Work (1.25x)',
          multiplier: 1.25,
          ratePercentage: 125,
          capHours: 7.6,
        },
        {
          name: 'Saturday Overtime (1.5x)',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 7.6,
      capLabel: 'Sunday Shift Cap',
      tiers: [
        {
          name: 'Sunday Ordinary Work (1.50x)',
          multiplier: 1.5,
          ratePercentage: 150,
          capHours: 7.6,
        },
        {
          name: 'Sunday Overtime (2.0x)',
          multiplier: 2.0,
          ratePercentage: 200,
          isRemaining: true,
        },
      ],
    },
  },
  {
    id: 'custom',
    name: 'Custom Pay Rule / User Defined Categories',
    badge: 'Custom',
    employeeType: 'Custom',
    calculationPeriod: 'Daily Shift',
    description: 'Fully customizable category names, caps, and rate multipliers for bookkeeper-specific award requirements.',
    allowCustomThreshold: true,
    saturday: {
      defaultCap: 4.0,
      capLabel: 'Saturday Category 1 Cap',
      tiers: [
        {
          name: 'Category 1 (Base/Ord)',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 4.0,
        },
        {
          name: 'Category 2 (Overtime/Penalty)',
          multiplier: 1.5,
          ratePercentage: 150,
          isRemaining: true,
        },
      ],
    },
    sunday: {
      defaultCap: 4.0,
      capLabel: 'Sunday Category 1 Cap',
      tiers: [
        {
          name: 'Category 1 (Base/Ord)',
          multiplier: 1.0,
          ratePercentage: 100,
          capHours: 4.0,
        },
        {
          name: 'Category 2 (Overtime/Penalty)',
          multiplier: 2.0,
          ratePercentage: 200,
          isRemaining: true,
        },
      ],
    },
  },
];

export function getAwardRuleById(ruleId?: string): AwardPayRule {
  const found = AUSTRALIAN_AWARD_RULES.find((r) => r.id === ruleId);
  return found || AUSTRALIAN_AWARD_RULES[0];
}
