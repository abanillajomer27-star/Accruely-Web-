import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText } from 'lucide-react';
import { PLCalculatorInputs, PLCalculatorResults } from '../types';
import { generatePLStatementText } from '../utils/calculator';

interface ExportModalProps {
  isOpen: boolean;
  inputs: PLCalculatorInputs;
  results: PLCalculatorResults;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  inputs,
  results,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const statementText = generatePLStatementText(inputs, results);

  const handleCopy = () => {
    navigator.clipboard.writeText(statementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
        {/* Header */}
        <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold">PL Opening Balance Statement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-5 flex-1 overflow-y-auto bg-orange-50/50 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
            Statement Text Preview:
          </p>
          <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto select-all border border-zinc-800">
            {statementText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-orange-200/60 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-100/80 dark:bg-zinc-800 hover:bg-orange-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl shadow transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Statement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
