import React from 'react';
import { User, Calculator, Scale, Clock, ShieldCheck } from 'lucide-react';

export const AboutView: React.FC = () => {
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
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 italic">
              Accruely was created by Jomer Abanilla, CFMS.
            </p>
          </div>
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

      {/* PL OPENING BALANCE CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <Scale className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            PL Opening Balance Calculator & Xero Checker
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
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
      </div>

      {/* LEAVE ACCRUAL CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Standard Leave Accrual Calculator
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Calculates routine leave accruals during pay cycles based on:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-700 dark:text-zinc-300">
            <li><strong>Total Accruable Hours:</strong> Ordinary Hours + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken.</li>
            <li><strong>Annual Leave (AL):</strong> 4 weeks per year standard (0.076923 hrs/hr worked).</li>
            <li><strong>Personal / Carer&apos;s Leave (PL):</strong> 10 days per year standard (0.038462 hrs/hr worked).</li>
            <li><strong>Closing Balances:</strong> Opening Balance + Accrued − Taken.</li>
          </ul>
        </div>
      </div>

      {/* STANDARD OT ADJUSTMENT CALCULATOR EXPLANATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Standard OT Adjustment Calculator
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Designed for companies that prorate fixed regular overtime entitlements when an employee takes unpaid leave (Leave Without Pay / LWOP).
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
      </div>
    </div>
  );
};
