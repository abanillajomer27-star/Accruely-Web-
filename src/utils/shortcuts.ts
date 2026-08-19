/**
 * Accruely Keyboard Shortcut Utilities
 * Detects platform (macOS vs Windows/Linux) and generates appropriate shortcut labels.
 */

export const isMacOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
};

export const getModifierKey = (): string => {
  return isMacOS() ? '⌘' : 'Ctrl';
};

export const getModifierName = (): string => {
  return isMacOS() ? '⌘ Command' : 'Ctrl';
};

export interface ShortcutDefinition {
  id: string;
  action: string;
  key: string;
  windowsKey: string;
  macKey: string;
  description: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'toggle-sidebar',
    action: 'Toggle Navigation',
    key: '\\',
    windowsKey: 'Ctrl + \\',
    macKey: '⌘ + \\',
    description: 'Opens or closes the calculator sidebar',
  },
  {
    id: 'calculate',
    action: 'Calculate / Save',
    key: 'Enter',
    windowsKey: 'Ctrl + Enter',
    macKey: '⌘ + Enter',
    description: 'Refreshes calculation and saves to history',
  },
  {
    id: 'reset',
    action: 'Reset Calculator',
    key: 'R',
    windowsKey: 'Ctrl + Shift + R',
    macKey: '⌘ + Shift + R',
    description: 'Resets the current calculator to default inputs',
  },
  {
    id: 'history',
    action: 'Open History',
    key: 'H',
    windowsKey: 'Ctrl + Shift + H',
    macKey: '⌘ + Shift + H',
    description: 'Opens calculation history (safe non-conflicting shortcut)',
  },
  {
    id: 'export',
    action: 'Export / Share',
    key: 'E',
    windowsKey: 'Ctrl + Shift + E',
    macKey: '⌘ + Shift + E',
    description: 'Opens the live Excel / PDF export dialog',
  },
];

export const getDisplayShortcut = (id: string): string => {
  const shortcut = SHORTCUTS.find((s) => s.id === id);
  if (!shortcut) return '';
  return isMacOS() ? shortcut.macKey : shortcut.windowsKey;
};
