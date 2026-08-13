import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onConfirmExit,
  onCancel,
  title = 'Exit Accruely',
  message = 'Do you want to exit Accruely?',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp border border-orange-200/60 dark:border-zinc-800 transition-colors">
        {/* Header */}
        <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500/30 dark:bg-orange-500/20 rounded-xl text-white">
            <AlertTriangle className="w-5 h-5 text-amber-200 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold tracking-wide">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>

          <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg sm:text-xl">
            {message}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Any unsaved temporary edits will be lost if you leave the session.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              NO
            </button>
            <button
              type="button"
              onClick={onConfirmExit}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
            >
              YES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
