import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { parseFormattedNumber } from '../utils/calculator';

interface EditFieldModalProps {
  isOpen: boolean;
  title: string;
  initialValue: string | number;
  type?: 'text' | 'number' | 'date';
  step?: string;
  min?: number | string;
  onClose: () => void;
  onSave: (value: string | number) => void;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  isOpen,
  title,
  initialValue,
  type = 'number',
  step = 'any',
  min,
  onClose,
  onSave,
}) => {
  const [val, setVal] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setVal(initialValue !== undefined && initialValue !== null ? String(initialValue) : '');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'number') {
      const num = parseFormattedNumber(val);
      onSave(num);
    } else {
      onSave(val);
    }
    onClose();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const pastedData = e.clipboardData.getData('text');
      if (pastedData) {
        // Allow default paste, but user can paste "$1,250.50" or "150%" or "7.5"
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scaleUp transition-colors border border-orange-200/50 dark:border-zinc-800">
        {/* Header */}
        <div className="bg-orange-600 dark:bg-zinc-800 text-white px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Enter Value:
            </label>
            <input
              type={type === 'number' ? 'text' : type}
              inputMode={type === 'number' ? 'decimal' : undefined}
              step={step}
              min={min}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onPaste={handlePaste}
              placeholder={type === 'number' ? 'e.g. 30.00 or 1,250.50' : ''}
              className="w-full px-4 py-3 bg-orange-50/60 dark:bg-zinc-800 border-2 border-orange-200 dark:border-zinc-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none text-zinc-900 dark:text-zinc-100 font-bold text-lg transition-all"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
