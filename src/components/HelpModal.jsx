import { useEffect } from 'react';
import { getKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { config } from '../services/config';

export default function HelpModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { shortcuts, isMac } = getKeyboardShortcuts();

  const metricsInfo = [
    {
      name: 'Coverage',
      description: 'Percentage of code covered by automated tests. Higher values indicate better test coverage.',
      target: `${config.getReadinessThreshold()}% or higher`,
      color: 'text-green-500'
    },
    {
      name: 'Health Score',
      description: 'Composite score based on coverage, test pass rate, build success, and security metrics.',
      target: '75% or higher',
      color: 'text-blue-500'
    },
    {
      name: 'Build Success Rate',
      description: 'Percentage of successful builds over the selected time period.',
      target: '95% or higher',
      color: 'text-purple-500'
    },
    {
      name: 'Test Pass Rate',
      description: 'Percentage of tests that pass successfully.',
      target: '98% or higher',
      color: 'text-indigo-500'
    },
    {
      name: 'Security Score',
      description: 'Score based on vulnerability count and severity. Lower vulnerabilities mean higher score.',
      target: '90% or higher',
      color: 'text-red-500'
    }
  ];

  const features = [
    {
      title: 'Dark Mode',
      description: 'Toggle between light and dark themes for comfortable viewing.',
      shortcut: `${isMac ? '⌘' : 'Ctrl'} + D`
    },
    {
      title: 'Data Export',
      description: 'Export dashboard data in CSV, JSON, or HTML format.',
      shortcut: `${isMac ? '⌘' : 'Ctrl'} + E`
    },
    {
      title: 'Filtering',
      description: 'Filter data by date range, branches, repositories, and more.',
      shortcut: `${isMac ? '⌘' : 'Ctrl'} + F`
    },
    {
      title: 'Auto Refresh',
      description: 'Dashboard automatically refreshes every 60 seconds.',
      shortcut: 'Configurable in preferences'
    },
    {
      title: 'Performance Monitor',
      description: 'Track API calls, cache hits, and loading performance.',
      shortcut: `${isMac ? '⌘' : 'Ctrl'} + Shift + P`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Help</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Learn about features, shortcuts, and metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close help"
            >
              <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map(({ keys, action }) => (
                <div
                  key={keys}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <kbd className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 text-sm font-mono">
                    {keys}
                  </kbd>
                  <span className="text-gray-700 dark:text-gray-300 text-sm ml-3">{action}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Metrics Explained
            </h3>
            <div className="space-y-4">
              {metricsInfo.map((metric) => (
                <div
                  key={metric.name}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4"
                  style={{ borderLeftColor: metric.color.replace('text-', '#').replace('500', '') }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {metric.description}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${metric.color.replace('text-', 'text-')}`}>
                      Target: {metric.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {feature.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    {feature.shortcut}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tips & Tricks
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-trinity-blue mr-2">•</span>
                Click on repository headers to expand/collapse their details
              </li>
              <li className="flex items-start">
                <span className="text-trinity-green mr-2">•</span>
                Use filters to focus on specific branches or time periods
              </li>
              <li className="flex items-start">
                <span className="text-trinity-yellow mr-2">•</span>
                Export data for external analysis or reporting
              </li>
              <li className="flex items-start">
                <span className="text-trinity-red mr-2">•</span>
                Monitor rate limits to avoid API throttling
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Enable dark mode for comfortable viewing in low light
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need More Help?
            </h3>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                For additional support or to report issues, please visit:
              </p>
              <div className="mt-3 space-y-2">
                <a
                  href="https://github.com/trinity-method/trinity-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-trinity-blue hover:text-blue-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Dashboard Repository
                </a>
                <a
                  href="https://docs.github.com/en/rest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-trinity-blue hover:text-blue-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  GitHub API Documentation
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-trinity-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
}