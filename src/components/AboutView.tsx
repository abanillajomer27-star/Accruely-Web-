import React from 'react';
import { CheckCircle2, Info, Calculator, Scale, Clock, ShieldCheck } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="bg-orange-600 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-md text-center transition-colors">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Accruely</h2>
        <p className="text-orange-100 dark:text-orange-400 text-base font-semibold mb-3">
          Australian Leave & Opening Balance Calculator Suite
        </p>
        <p className="text-xs text-orange-200 dark:text-zinc-400 font-medium">
          Made by Jomer Abanilla, CFMS
        </p>
      </div>

      {/* PL OPENING BALANCE CALCULATOR EXPLANATION */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <Scale className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            PL Opening Balance Calculator & Xero Checker
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              • Dual Entitlement Periods (Old Rate & New Rate)
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 pl-3">
              Designed for bookkeeping reconciliations and payroll migrations where an employee's entitlement changed (e.g. from part-time to full-time). Calculates service periods independently.
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
            <div className="pl-3 space-y-1 font-mono text-xs text-zinc-800 dark:text-zinc-300 bg-orange-100/60 dark:bg-zinc-800 p-3 rounded-xl mt-1">
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
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Standard Leave Accrual Calculator
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <p>
            Calculates routine leave accruals during pay cycles based on:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-700 dark:text-zinc-300">
            <li><strong>Total Accruable Hours:</strong> Ordinary Hours + Public Holiday Hours + Annual Leave Taken + Personal Leave Taken.</li>
            <li><strong>Annual Leave (AL):</strong> 4 weeks per year standard (0.076923 hrs/hr worked).</li>
            <li><strong>Personal / Carer's Leave (PL):</strong> 10 days per year standard (0.038462 hrs/hr worked).</li>
            <li><strong>Closing Balances:</strong> Opening Balance + Accrued − Taken.</li>
          </ul>
        </div>
      </div>

      {/* STANDARD OT ADJUSTMENT CALCULATOR EXPLANATION */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Standard OT Adjustment Calculator
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <p>
            Designed for companies that prorate fixed regular overtime entitlements when an employee takes unpaid leave (Leave Without Pay / LWOP).
          </p>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              • Calculation Formulas
            </h4>
            <div className="pl-3 space-y-1 font-mono text-xs text-zinc-800 dark:text-zinc-300 bg-orange-100/60 dark:bg-zinc-800 p-3 rounded-xl mt-1">
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

      {/* NES Reference */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            National Employment Standards (NES) Compliance
          </h3>
        </div>

        <div className="space-y-3 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">• Fair Work Standards:</strong> All calculations strictly adhere to Australian Fair Work Commission and NES rules for progressive accrual across continuous service.
          </p>
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">• Progressive Accumulation:</strong> Personal/carer's leave accumulates from year to year without expiring, ensuring accurate reconciliation during payroll migrations.
          </p>
        </div>
      </div>
    </div>
  );
};
