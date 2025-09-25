import { useEffect } from 'react';

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e) => {
      const target = e.target;
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.tagName === 'SELECT' ||
                          target.isContentEditable;

      if (isInputField && e.key !== 'Escape') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('quick-search');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          window.dispatchEvent(new CustomEvent('open-search'));
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('refresh-data'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-dark-mode'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('export-data'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-preferences'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-filters'));
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-performance-monitor'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('show-help'));
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !isInputField) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('show-help'));
      }

      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-modal'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-compact-view'));
      }

      if (e.key >= '1' && e.key <= '9' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        window.dispatchEvent(new CustomEvent('switch-tab', { detail: { index: tabIndex } }));
      }

      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate-previous'));
      }

      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate-next'));
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('export-preferences'));
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('reset-preferences'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('undo-action'));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInputField) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('select-all'));
      }
    };

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? 'metaKey' : 'ctrlKey';

    window.__keyboardShortcuts = {
      modifierKey,
      isMac,
      shortcuts: [
        { keys: `${isMac ? '⌘' : 'Ctrl'} + K`, action: 'Quick search', event: 'open-search' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + R`, action: 'Refresh data', event: 'refresh-data' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + D`, action: 'Toggle dark mode', event: 'toggle-dark-mode' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + E`, action: 'Export data', event: 'export-data' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + ,`, action: 'Open preferences', event: 'open-preferences' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + F`, action: 'Toggle filters', event: 'toggle-filters' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + Shift + P`, action: 'Performance monitor', event: 'toggle-performance-monitor' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + H`, action: 'Show help', event: 'show-help' },
        { keys: `?`, action: 'Show help', event: 'show-help' },
        { keys: `Esc`, action: 'Close modal/dialog', event: 'close-modal' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + B`, action: 'Toggle sidebar', event: 'toggle-sidebar' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + \\`, action: 'Toggle compact view', event: 'toggle-compact-view' },
        { keys: `${isMac ? '⌘' : 'Ctrl'} + 1-9`, action: 'Switch tabs', event: 'switch-tab' },
        { keys: `Alt + ↑`, action: 'Navigate previous', event: 'navigate-previous' },
        { keys: `Alt + ↓`, action: 'Navigate next', event: 'navigate-next' }
      ]
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      delete window.__keyboardShortcuts;
    };
  }, []);
}

export function getKeyboardShortcuts() {
  return window.__keyboardShortcuts || {
    shortcuts: [],
    modifierKey: 'ctrlKey',
    isMac: false
  };
}

export function registerShortcut(key, handler, options = {}) {
  const { ctrl = true, shift = false, alt = false, meta = false } = options;

  const handleKeyPress = (e) => {
    const keyMatch = e.key.toLowerCase() === key.toLowerCase();
    const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true;
    const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
    const altMatch = alt ? e.altKey : !e.altKey;
    const metaMatch = meta ? e.metaKey : true;

    if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
      e.preventDefault();
      handler(e);
    }
  };

  window.addEventListener('keydown', handleKeyPress);

  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}

export function useShortcut(key, handler, deps = [], options = {}) {
  useEffect(() => {
    return registerShortcut(key, handler, options);
  }, deps);
}