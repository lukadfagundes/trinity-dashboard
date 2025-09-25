import { useState } from 'react';

const ErrorDisplay = ({ error, onRetry, details = null }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const getErrorType = () => {
    const message = getErrorMessage().toLowerCase();
    if (message.includes('rate limit')) return 'rate-limit';
    if (message.includes('auth') || message.includes('token')) return 'auth';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('not found') || message.includes('404')) return 'not-found';
    return 'generic';
  };

  const errorType = getErrorType();

  const errorConfig = {
    'rate-limit': {
      icon: '⏱️',
      title: 'API Rate Limited',
      color: 'yellow',
      suggestion: 'Please wait a few minutes before retrying. Data will be served from cache if available.'
    },
    'auth': {
      icon: '🔐',
      title: 'Authentication Error',
      color: 'red',
      suggestion: 'Check your GitHub token in the .env.local file and ensure it has the correct permissions.'
    },
    'network': {
      icon: '🌐',
      title: 'Network Error',
      color: 'orange',
      suggestion: 'Check your internet connection and try again.'
    },
    'not-found': {
      icon: '🔍',
      title: 'Resource Not Found',
      color: 'purple',
      suggestion: 'Verify the repository names in your configuration.'
    },
    'generic': {
      icon: '⚠️',
      title: 'Error',
      color: 'red',
      suggestion: 'An unexpected error occurred. Please try again or check the console for details.'
    }
  };

  const config = errorConfig[errorType];
  const colorClasses = {
    yellow: 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400',
    red: 'bg-red-900/20 border-red-900/50 text-red-400',
    orange: 'bg-orange-900/20 border-orange-900/50 text-orange-400',
    purple: 'bg-purple-900/20 border-purple-900/50 text-purple-400'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-trinity-darker p-4">
      <div className={`max-w-2xl w-full ${colorClasses[config.color]} border rounded-lg p-6`}>
        <div className="flex items-start space-x-4">
          <span className="text-4xl flex-shrink-0">{config.icon}</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{config.title}</h2>
            <p className="text-gray-300 mb-3">{getErrorMessage()}</p>
            <p className="text-sm text-gray-400 mb-4">{config.suggestion}</p>

            {details && (
              <div className="mb-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-trinity-blue hover:text-trinity-green transition-colors"
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </button>
                {showDetails && (
                  <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-400 overflow-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-trinity-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Retry</span>
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          If this problem persists, please check the{' '}
          <a href="https://github.com/trinity-method/trinity-dashboard/issues"
             className="text-trinity-blue hover:underline"
             target="_blank"
             rel="noopener noreferrer">
            GitHub Issues
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay;