import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';
import { ActiveTab } from '../types';

interface PrivacyPolicyViewProps {
  onBackToCalculator?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBackToCalculator }) => {
  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-2xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-orange-600 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-md text-center transition-colors">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur-xs">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
          Privacy Policy
        </h2>
        <p className="text-orange-100 dark:text-zinc-300 text-sm sm:text-base font-medium">
          Accruely • Australian Payroll Tools
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-zinc-200/80 dark:border-zinc-800 space-y-6 transition-colors">
        <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Privacy & Data Practices
          </h3>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Accruely is a payroll calculation tool. Currently, Accruely does not require users to create an account or log in. Calculator information entered by users is processed within the website and is not intentionally stored on an Accruely server.
          </p>

          <p>
            Accruely does not currently sell or share user-entered calculator information with third parties. If this changes in the future, this Privacy Policy will be updated accordingly.
          </p>
        </div>

        {/* Local Processing Highlight Box */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-3">
          <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">
              Client-Side Calculation
            </p>
            <p>
              Calculations and temporary inputs are computed locally inside your browser session for privacy and speed.
            </p>
          </div>
        </div>
      </div>

      {/* Back action */}
      {onBackToCalculator && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onBackToCalculator}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Calculator</span>
          </button>
        </div>
      )}
    </div>
  );
};
