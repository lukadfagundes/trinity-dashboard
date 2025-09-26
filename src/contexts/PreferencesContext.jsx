import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const PreferencesContext = createContext();

const defaultPreferences = {
  autoRefresh: true,
  refreshInterval: 60000,
  compactView: false,
  showNotifications: true,
  defaultTimeRange: '7d',
  defaultBranches: ['main', 'dev'],
  colorBlindMode: false,
  showPerformanceMonitor: false,
  chartAnimations: true,
  expandAllSections: false,
  defaultMetric: 'coverage',
  dateFormat: 'relative',
  theme: 'auto'
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    return defaultPreferences;
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      setHasChanges(true);
      return updated;
    });
  }, []);

  const updateMultiplePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      setHasChanges(true);
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  }, []);

  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [preferences]);

  const importPreferences = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const validated = { ...defaultPreferences, ...imported };
          setPreferences(validated);
          setHasChanges(true);
          resolve(validated);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  const getPreference = useCallback((key) => {
    return preferences[key] ?? defaultPreferences[key];
  }, [preferences]);

  const isDefault = useCallback((key) => {
    return preferences[key] === defaultPreferences[key];
  }, [preferences]);

  const getChangedPreferences = useCallback(() => {
    const changed = {};
    Object.keys(preferences).forEach(key => {
      if (preferences[key] !== defaultPreferences[key]) {
        changed[key] = preferences[key];
      }
    });
    return changed;
  }, [preferences]);

  useEffect(() => {
    if (preferences.colorBlindMode) {
      document.documentElement.classList.add('color-blind-mode');
    } else {
      document.documentElement.classList.remove('color-blind-mode');
    }
  }, [preferences.colorBlindMode]);

  useEffect(() => {
    const handleExportEvent = () => exportPreferences();
    window.addEventListener('export-preferences', handleExportEvent);
    return () => window.removeEventListener('export-preferences', handleExportEvent);
  }, [exportPreferences]);

  const contextValue = useMemo(() => ({
    preferences,
    updatePreference,
    updateMultiplePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    getPreference,
    isDefault,
    getChangedPreferences,
    hasChanges,
    defaultPreferences
  }), [
    preferences,
    updatePreference,
    updateMultiplePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences,
    getPreference,
    isDefault,
    getChangedPreferences,
    hasChanges
  ]);

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};