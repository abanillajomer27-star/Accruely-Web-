import React, { useState } from 'react';
import { User, Calculator, Scale, Clock, ShieldCheck, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export const AboutView: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<{
    plOpeningBalance: boolean;
    leaveAccrual: boolean;
    standardOt: boolean;
    weekendPay: boolean;
  }>({
    plOpeningBalance: false,
    leaveAccrual: false,
    standardOt: false,
    weekendPay: false,
  });

  const toggleCard = (key: keyof typeof expandedCards) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-3xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-orange-600 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-md text-center transition-colors">
        <h2 className="text-3xl font-extrabold tracking-tight mb-1.5">Accruely</h2>
        <p className="text-orange-100 dark:text-zinc-300 text-base font-semibold">
          Australian Payroll Tools
        </p>
      </div>

      {/* ABOUT THE CREATOR */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            About the Creator
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Accruely was created by <strong>Jomer Abanilla, CFMS</strong>, a Financial Management graduate from the University of Rizal System – Binangonan in the Philippines.
          </p>
          <p>
            With experience in Australian bookkeeping and accounting, Jomer encountered practical challenges that bookkeepers and accountants often face when working with payroll, leave accruals, employee entitlements, and payroll-system transitions.
          </p>
          <p>
            Accruely started as a passion project designed to help bookkeeping and accounting professionals make these tasks easier to understand, calculate, check, and reconcile.
          </p>
          <p>
            The goal is to provide practical payroll and entitlement tools that help professionals reduce manual calculations, identify discrepancies, and work more efficiently.
          </p>
        </div>
      </div>

      {/* FAIR WORK & NATIONAL EMPLOYMENT STANDARDS REFERENCE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Fair Work & National Employment Standards Reference
          </h3>
        </div>

        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Accruely is designed with Australian employment standards, Fair Work guidelines, and National Employment Standards (NES) principles in mind.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Progressive Accrual:</strong> Personal/carer&apos;s leave and annual leave accumulate progressively during a year of service according to ordinary hours of work.
            </li>
            <li>
              <strong>Cumulative Balances:</strong> Unused personal/carer&apos;s leave accumulates from year to year without expiring, ensuring precise historical reconciliations during payroll migrations.
            </li>
          </ul>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            <em>Disclaimer:</em> Accruely is an independent calculation and reconciliation tool built for bookkeeping and accounting professionals. It is not an official product of the Fair Work Ombudsman or the Australian Government.
          </p>
        </div>
      </div>

      {/* 1. PL OPENING BALANCE CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Scale className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">
                PL Opening Balance Calculator & Xero Checker
              </h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Dual Entitlement & Xero Reconciler
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleCard('plOpeningBalance')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-expanded={expandedCards.plOpeningBalance}
          >
            <span>{expandedCards.plOpeningBalance ? 'Hide description' : 'Show description'}</span>
            {expandedCards.plOpeningBalance ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {expandedCards.plOpeningBalance && (
          <div className="mt-4 pt-1 space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed animate-fadeIn">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Designed for bookkeeping reconciliations and payroll migrations where an employee&apos;s entitlement changed (e.g. from part-time to full-time) across multiple service periods. Calculates cumulative NES personal leave entitlements, accounts for historical leave taken, and determines the updated opening balance for Xero payroll transitions.
            </p>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Dual Entitlement Periods (Old Rate & New Rate)
              </h4>
              <p className="text-zinc-700 dark:text-zinc-300 pl-3">
                Designed for bookkeeping reconciliations and payroll migrations where an employee&apos;s entitlement changed (e.g. from part-time to full-time). Calculates service periods independently.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Full Anniversary Logic
              </h4>
              <p className="text-zinc-700 dark:text-zinc-300 pl-3">
                Completed Years strictly counts full anniversaries. Remaining Weeks represents only the fractional weeks elapsed after the last completed anniversary.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Mathematical Formulas
              </h4>
              <div className="pl-3 space-y-1 font-mono text-xs text-zinc-800 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/70 p-3 rounded-xl mt-1 border border-zinc-200/60 dark:border-zinc-700/60">
                <div>Additional Year Hours = Completed Years × Annual Entitlement</div>
                <div>Weekly Accrual Rate = Annual Entitlement ÷ 52</div>
                <div>Remaining Weeks Hours = Remaining Weeks × Weekly Accrual Rate</div>
                <div>Total Leave Earned = Additional Year Hours + Remaining Weeks Hours</div>
                <div>Grand Total Leave Earned = Old Rate Total + New Rate Total</div>
                <div>Target Balance = Grand Total Leave Earned − Total Leave Used</div>
                <div className="text-orange-700 dark:text-orange-400 font-bold">
                  Xero Updated Balance = Current Opening in Xero + Target Balance − Current Xero Balance
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. LEAVE ACCRUAL CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">
                Standard Leave Accrual Calculator
              </h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Pay Run & Period Accruals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleCard('leaveAccrual')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-expanded={expandedCards.leaveAccrual}
          >
            <span>{expandedCards.leaveAccrual ? 'Hide description' : 'Show description'}</span>
            {expandedCards.leaveAccrual ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {expandedCards.leaveAccrual && (
          <div className="mt-4 pt-1 space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed animate-fadeIn">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Calculates routine pay-run leave accruals based on Australian National Employment Standards (NES) or custom company policies. Computes progressive annual leave (4 weeks per year) and personal/carer&apos;s leave (10 days per year) accruals from total paid hours worked.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Calculates routine leave accruals during pay cycles based on:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-700 dark:text-zinc-300">
              <li><strong>Total Accruable Hours:</strong> Ordinary Hours + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken.</li>
              <li><strong>Annual Leave (AL):</strong> 4 weeks per year standard (0.076923 hrs/hr worked).</li>
              <li><strong>Personal / Carer&apos;s Leave (PL):</strong> 10 days per year standard (0.038462 hrs/hr worked).</li>
              <li><strong>Closing Balances:</strong> Opening Balance + Accrued − Taken.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. STANDARD OT ADJUSTMENT CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">
                Standard OT Adjustment Calculator
              </h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Prorated Standard OT for LWOP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleCard('standardOt')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-expanded={expandedCards.standardOt}
          >
            <span>{expandedCards.standardOt ? 'Hide description' : 'Show description'}</span>
            {expandedCards.standardOt ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {expandedCards.standardOt && (
          <div className="mt-4 pt-1 space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed animate-fadeIn">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Calculates prorated standard fixed overtime when an employee takes unpaid leave (Leave Without Pay / LWOP). Adjusts standard overtime entitlement based on attendance percentage during the pay period.
            </p>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Calculation Formulas
              </h4>
              <div className="pl-3 space-y-1 font-mono text-xs text-zinc-800 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/70 p-3 rounded-xl mt-1 border border-zinc-200/60 dark:border-zinc-700/60">
                <div>Standard Hours Per Day = Standard Ordinary Hours ÷ 5</div>
                <div>LWOP Hours = LWOP Days × Standard Hours Per Day</div>
                <div>Ordinary Hours Worked = Standard Ordinary Hours − LWOP Hours</div>
                <div>Attendance Percentage = Ordinary Hours Worked ÷ Standard Ordinary Hours</div>
                <div className="text-orange-700 dark:text-orange-400 font-bold">
                  Adjusted Standard OT = Standard OT × Attendance Percentage
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Quick Employment Presets
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
                <li><strong>76-Hour Employee:</strong> 38 Standard Ordinary Hours, 2 Standard OT (7.6 hrs/day).</li>
                <li><strong>88-Hour Employee:</strong> 44 Standard Ordinary Hours, 2 Standard OT (8.8 hrs/day).</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4. WEEKEND PAY CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">
                Weekend Pay Calculator
              </h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Penalty Rates & Shift Pay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleCard('weekendPay')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-expanded={expandedCards.weekendPay}
          >
            <span>{expandedCards.weekendPay ? 'Hide description' : 'Show description'}</span>
            {expandedCards.weekendPay ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {expandedCards.weekendPay && (
          <div className="mt-4 pt-1 space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed animate-fadeIn">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              A simple and practical tool for Australian bookkeepers and accountants to split weekend or overtime timesheet hours between penalty rates, calculate gross pay, and optionally cross-check against payroll software (Xero, MYOB, Deputy).
            </p>

            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Automatic Hour Splitting:</strong> Enter the total timesheet hours (e.g. 7.60 hrs) and the first rate cap (e.g. 2.00 hrs @ 150%). Accruely automatically calculates the remaining hours (5.60 hrs @ 200%).
              </li>
              <li>
                <strong>Direct Pay Calculation:</strong> Computes the exact pay for each rate tier using <code>Hourly Rate × Rate Multiplier × Hours</code> (e.g. $45.00 × 1.50 × 2.00 = $135.00, $45.00 × 2.00 × 5.60 = $504.00, Total = $639.00).
              </li>
              <li>
                <strong>Optional Payroll Check:</strong> Paste the gross pay calculated by your payroll system to verify against Accruely&apos;s mathematical result (showing MATCH or DIFFERENCE).
              </li>
              <li>
                <strong>Flexible Tier Structure:</strong> Add intermediate penalty tiers as needed with the &ldquo;Add Rate&rdquo; control.
              </li>
            </ul>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                • Calculation Formulas
              </h4>
              <div className="pl-3 space-y-1 font-mono text-xs text-zinc-800 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/70 p-3 rounded-xl mt-1 border border-zinc-200/60 dark:border-zinc-700/60">
                <div>Tier Multiplier = Rate Percentage ÷ 100</div>
                <div>Tier Hourly Rate = Ordinary Hourly Rate × Tier Multiplier</div>
                <div>Tier Pay = Allocated Hours × Tier Hourly Rate</div>
                <div>Remaining Hours = Total Hours − Sum of Capped Tiers</div>
                <div className="text-orange-700 dark:text-orange-400 font-bold">
                  Total Weekend Pay = Sum of all Tier Pays
                </div>
                <div>Payroll Difference = Payroll Amount − Total Weekend Pay</div>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <em>Notice:</em> Weekend and overtime rates can vary depending on the applicable Award, agreement and circumstances. Accruely calculates the rates entered by the user. Verify the applicable payroll rule before processing payroll.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
