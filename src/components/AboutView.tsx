import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="bg-orange-600 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-md text-center transition-colors">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Accruely</h2>
        <p className="text-orange-100 dark:text-orange-400 text-base font-semibold mb-3">
          Australian Leave Accrual Calculator
        </p>
        <p className="text-xs text-orange-200 dark:text-zinc-400 font-medium">
          Made by Jomer Abanilla, CFMS
        </p>
      </div>

      {/* Core Application Principles */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Core Application Principles
          </h3>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              • Fast & Accurate Calculations
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 pl-3">
              Instant live recalculations following exact NES hourly accrual formulas without needing to press a calculate button.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              • Privacy-Focused & Offline-First
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 pl-3">
              All calculations stay 100% on your device. No cloud transmission, no user accounts required.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              • Powered Purely by Software Engineering
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 pl-3">
              No artificial intelligence approximations or network reliance — only precise mathematical business logic.
            </p>
          </div>
        </div>
      </div>

      {/* NES Reference */}
      <div className="bg-orange-50/70 dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-orange-200/80 dark:border-zinc-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 border-b border-orange-200/60 dark:border-zinc-800 pb-3">
          <Info className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            National Employment Standards (NES) Reference
          </h3>
        </div>

        <div className="space-y-3 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">• Annual Leave:</strong> 4 weeks per year for full-time and part-time employees (based on ordinary hours worked).
          </p>
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">• Personal/Carer's Leave:</strong> 10 days per year for full-time and part-time employees.
          </p>
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">• Casual Employees:</strong> Casual employees generally do not accrue paid annual or personal leave under the NES unless specified by an Award or Enterprise Agreement.
          </p>
        </div>
      </div>
    </div>
  );
};
