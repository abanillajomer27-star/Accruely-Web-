export interface AwardOvertimeRule {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  industry: string;
  description: string;
  saturday: {
    firstThresholdHours: number | null; // e.g. 3.0 (null if flat rate)
    firstMultiplier: number; // e.g. 1.5
    firstLabel: string; // e.g. "1.5x (Time and a half)"
    firstRatePercentage: number; // 150
    secondMultiplier?: number; // e.g. 2.0
    secondLabel?: string; // e.g. "2.0x (Double time)"
    secondRatePercentage?: number; // 200
  };
  sunday: {
    firstThresholdHours?: number | null;
    firstMultiplier: number; // e.g. 2.0
    firstLabel: string; // e.g. "2.0x (Double time)"
    firstRatePercentage: number; // 200
    secondMultiplier?: number;
    secondLabel?: string;
    secondRatePercentage?: number;
  };
}

export const AUSTRALIAN_AWARD_RULES: AwardOvertimeRule[] = [
  {
    id: 'clerks-award',
    name: 'Clerks — Private Sector Award 2020',
    shortName: 'Clerks Award (3h @ 1.5x, then 2.0x | Sun 2.0x)',
    badge: '1.5x (3h) → 2.0x | Sun 2.0x',
    industry: 'Administration & Professional',
    description: 'Saturday: First 3 hours at 1.5x (time & a half), thereafter 2.0x (double time). Sunday: All overtime at 2.0x.',
    saturday: {
      firstThresholdHours: 3.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x (Double time)',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'construction-award',
    name: 'Building & Construction General On-Site Award',
    shortName: 'Building & Construction (2h @ 1.5x, then 2.0x | Sun 2.0x)',
    badge: '1.5x (2h) → 2.0x | Sun 2.0x',
    industry: 'Construction & Trades',
    description: 'Saturday: First 2 hours at 1.5x (time & a half), thereafter 2.0x (double time). Sunday: All overtime at 2.0x.',
    saturday: {
      firstThresholdHours: 2.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x (Double time)',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'hospitality-award',
    name: 'Hospitality Industry (General) Award 2020',
    shortName: 'Hospitality Award (2h @ 1.5x, then 2.0x | Sun 2.0x)',
    badge: '1.5x (2h) → 2.0x | Sun 2.0x',
    industry: 'Hospitality & Accommodation',
    description: 'Saturday: First 2 hours at 1.5x overtime, remaining at 2.0x double time. Sunday: All overtime at 2.0x double time.',
    saturday: {
      firstThresholdHours: 2.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x (Double time)',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'retail-award',
    name: 'General Retail Industry Award 2020',
    shortName: 'General Retail (3h @ 1.5x, then 2.0x | Sun 2.0x)',
    badge: '1.5x (3h) → 2.0x | Sun 2.0x',
    industry: 'Retail & Wholesale',
    description: 'Saturday: First 3 hours at 1.5x overtime, remaining at 2.0x double time. Sunday: All overtime at 2.0x double time.',
    saturday: {
      firstThresholdHours: 3.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x (Double time)',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'manufacturing-award',
    name: 'Manufacturing & Associated Industries Award',
    shortName: 'Manufacturing Award (3h @ 1.5x, then 2.0x | Sun 2.0x)',
    badge: '1.5x (3h) → 2.0x | Sun 2.0x',
    industry: 'Manufacturing & Engineering',
    description: 'Saturday: First 3 hours at 1.5x, thereafter 2.0x. Sunday: All overtime at 2.0x.',
    saturday: {
      firstThresholdHours: 3.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x (Double time)',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'double-time-all',
    name: 'Double Time Weekend Overtime (All 2.0x)',
    shortName: 'All Weekend Overtime @ 2.0x (Double Time)',
    badge: '2.0x Sat & Sun',
    industry: 'Specialized & Continuous Operations',
    description: 'All Saturday and Sunday overtime hours are paid at 2.0x (Double time).',
    saturday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'flat-1.5-2.0',
    name: 'Standard Weekend Overtime (Sat 1.5x / Sun 2.0x)',
    shortName: 'Flat Weekend OT (Sat 1.5x / Sun 2.0x)',
    badge: '1.5x Sat / 2.0x Sun',
    industry: 'General Standard',
    description: 'All Saturday overtime at flat 1.5x; all Sunday overtime at flat 2.0x.',
    saturday: {
      firstThresholdHours: null,
      firstMultiplier: 1.5,
      firstLabel: '1.5x (Time & a half)',
      firstRatePercentage: 150,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x (Double time)',
      firstRatePercentage: 200,
    },
  },
  {
    id: 'casual-loaded',
    name: 'Casual Overtime (+25% Loaded: 1.75x / 2.25x)',
    shortName: 'Casual Loaded OT (3h @ 1.75x, then 2.25x | Sun 2.25x)',
    badge: '1.75x (3h) → 2.25x | Sun 2.25x',
    industry: 'Casual Employment (25% loading)',
    description: 'Saturday: First 3 hours at 1.75x (150% + 25%), remaining at 2.25x (200% + 25%). Sunday: All overtime at 2.25x.',
    saturday: {
      firstThresholdHours: 3.0,
      firstMultiplier: 1.75,
      firstLabel: '1.75x (Casual 1.5x + Loading)',
      firstRatePercentage: 175,
      secondMultiplier: 2.25,
      secondLabel: '2.25x (Casual 2.0x + Loading)',
      secondRatePercentage: 225,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.25,
      firstLabel: '2.25x (Casual Double Time)',
      firstRatePercentage: 225,
    },
  },
  {
    id: 'custom',
    name: 'Custom Award Overtime Rule',
    shortName: 'Custom Overtime Rule (User Defined)',
    badge: 'Custom Split',
    industry: 'Custom Agreement',
    description: 'Define custom thresholds and rate multipliers for company-specific EBA or Award requirements.',
    saturday: {
      firstThresholdHours: 3.0,
      firstMultiplier: 1.5,
      firstLabel: '1.5x Overtime',
      firstRatePercentage: 150,
      secondMultiplier: 2.0,
      secondLabel: '2.0x Overtime',
      secondRatePercentage: 200,
    },
    sunday: {
      firstThresholdHours: null,
      firstMultiplier: 2.0,
      firstLabel: '2.0x Overtime',
      firstRatePercentage: 200,
    },
  },
];

export function getAwardRuleById(ruleId?: string): AwardOvertimeRule {
  if (!ruleId) return AUSTRALIAN_AWARD_RULES[0];
  
  // Normalization for backward compatibility
  const normalizedId = ruleId.toLowerCase();
  if (normalizedId.includes('clerk')) return AUSTRALIAN_AWARD_RULES[0];
  if (normalizedId.includes('construct') || normalizedId.includes('trade')) return AUSTRALIAN_AWARD_RULES[1];
  if (normalizedId.includes('hospit') || normalizedId.includes('restaur')) return AUSTRALIAN_AWARD_RULES[2];
  if (normalizedId.includes('retail')) return AUSTRALIAN_AWARD_RULES[3];
  if (normalizedId.includes('manufac')) return AUSTRALIAN_AWARD_RULES[4];
  if (normalizedId.includes('double') || normalizedId === 'all-overtime') return AUSTRALIAN_AWARD_RULES[5];
  if (normalizedId.includes('penalty') || normalizedId.includes('standard') || normalizedId.includes('flat')) return AUSTRALIAN_AWARD_RULES[6];
  if (normalizedId.includes('casual')) return AUSTRALIAN_AWARD_RULES[7];
  if (normalizedId.includes('custom')) return AUSTRALIAN_AWARD_RULES[8];

  const found = AUSTRALIAN_AWARD_RULES.find((r) => r.id === ruleId);
  return found || AUSTRALIAN_AWARD_RULES[0];
}
