import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);

    this.setState(prevState => ({
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    if (window.logError) {
      window.logError({
        error: error.toString(),
        stack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    const errorData = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    const existingErrors = JSON.parse(localStorage.getItem('dashboard_errors') || '[]');
    existingErrors.push(errorData);

    if (existingErrors.length > 10) {
      existingErrors.shift();
    }

    localStorage.setItem('dashboard_errors', JSON.stringify(existingErrors));

    const apiErrors = parseInt(localStorage.getItem('api_errors') || '0');
    localStorage.setItem('api_errors', (apiErrors + 1).toString());
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDarkMode = document.documentElement.classList.contains('dark');

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
          <div className={`max-w-2xl w-full p-8 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Dashboard Error
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  An unexpected error occurred
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                The dashboard encountered an error while rendering. This has been logged for review.
              </p>
              {this.state.errorCount > 1 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  This error has occurred {this.state.errorCount} times
                </p>
              )}
            </div>

            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                Technical Details (click to expand)
              </summary>
              <div className="mt-3 space-y-3">
                {this.state.error && (
                  <div className={`p-3 rounded text-xs font-mono overflow-auto max-h-40 ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="font-semibold mb-1 text-red-600 dark:text-red-400">
                      Error Message:
                    </div>
                    {this.state.error.toString()}
                  </div>
                )}

                {this.state.error?.stack && (
                  <div className={`p-3 rounded text-xs font-mono overflow-auto max-h-40 ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="font-semibold mb-1 text-red-600 dark:text-red-400">
                      Stack Trace:
                    </div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className={`p-3 rounded text-xs font-mono overflow-auto max-h-40 ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="font-semibold mb-1 text-red-600 dark:text-red-400">
                      Component Stack:
                    </div>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-trinity-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reload Dashboard
              </button>

              <button
                onClick={this.handleReset}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Try Again Without Reload
              </button>

              <button
                onClick={this.handleClearStorage}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Clear Cache and Reload
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                If this error persists, please contact support with the technical details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}