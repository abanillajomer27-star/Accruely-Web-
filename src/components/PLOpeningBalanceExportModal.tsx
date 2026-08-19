import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Copy,
  Printer,
  Check,
  Download,
  Share2,
} from 'lucide-react';
import { PLCalculatorInputs, PLCalculatorResults } from '../types';
import { generatePLStatementText } from '../utils/calculator';
import {
  exportPLOpeningBalanceToExcel,
  exportPLOpeningBalanceToPDF,
} from '../utils/plOpeningBalanceExport';

interface PLOpeningBalanceExportModalProps {
  isOpen: boolean;
  inputs: PLCalculatorInputs;
  results: PLCalculatorResults;
  onClose: () => void;
}

export const PLOpeningBalanceExportModal: React.FC<PLOpeningBalanceExportModalProps> = ({
  isOpen,
  inputs,
  results,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!isOpen) return null;

  const statementText = generatePLStatementText(inputs, results);

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(statementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const handleExcelExport = () => {
    try {
      setIsExportingExcel(true);
      exportPLOpeningBalanceToExcel(inputs, results);
    } catch (err) {
      console.error('Failed to export Excel:', err);
    } finally {
      setTimeout(() => setIsExportingExcel(false), 800);
    }
  };

  const handlePDFExport = () => {
    try {
      setIsExportingPDF(true);
      exportPLOpeningBalanceToPDF(inputs, results);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
        {/* Header */}
        <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Export PL Opening Balance Workpaper</h3>
              <p className="text-[11px] text-orange-100 dark:text-zinc-400">
                {inputs.employeeName || 'John Smith'} • Dual Entitlement & Xero Reconciler
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="p-4 sm:p-5 bg-orange-50/40 dark:bg-zinc-900/60 border-b border-orange-100 dark:border-zinc-800">
          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
            Choose Export Format
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExcelExport}
              disabled={isExportingExcel}
              className="flex flex-col items-start p-3.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-600 rounded-xl transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                Excel (.xlsx)
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                Live workbook with working Excel formulas
              </span>
            </button>

            {/* PDF Export Button */}
            <button
              type="button"
              onClick={handlePDFExport}
              disabled={isExportingPDF}
              className="flex flex-col items-start p-3.5 bg-white dark:bg-zinc-800 hover:bg-orange-50/70 dark:hover:bg-orange-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-600 rounded-xl transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 rounded-lg group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-700 dark:group-hover:text-orange-300">
                PDF Document
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                Formatted workpaper for payroll sign-off
              </span>
            </button>
          </div>
        </div>

        {/* Text Statement Preview */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Statement Text Summary
            </span>
          </div>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto select-all border border-zinc-800">
            {statementText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-orange-200/60 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrintStatement}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleCopyStatement}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
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
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
