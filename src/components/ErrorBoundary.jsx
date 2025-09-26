import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorHistory: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorDetails = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorHistory: [...prevState.errorHistory, errorDetails].slice(-5),
    }));

    this.logErrorToService(errorDetails);

    if (this.state.errorCount >= 3) {
      this.handleCriticalError();
    }
  }

  logErrorToService = (errorDetails) => {
    console.error('Error Boundary caught an error:', errorDetails);

    if (window.errorHandler) {
      window.errorHandler.logError(errorDetails);
    }

    if (process.env.NODE_ENV === 'production') {
      // Future: Send to error tracking service
    }
  };

  handleCriticalError = () => {
    console.error('Critical error threshold reached. Application may be unstable.');

    if (window.errorHandler) {
      window.errorHandler.handleCriticalError(this.state.errorHistory);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    window.history.pushState(null, '', '/');
    window.location.reload();
  };

  handleSoftReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-red-500 text-white p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-red-100 mt-1">
                      An unexpected error has occurred in the application
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    We apologize for the inconvenience. The error has been logged and our team
                    will investigate the issue.
                  </p>

                  {this.state.errorCount > 1 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> This error has occurred {this.state.errorCount} times
                        in this session. If the problem persists, please try refreshing the page.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={this.handleReset}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg
                               hover:bg-blue-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </button>

                    <button
                      onClick={this.handleSoftReset}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg
                               hover:bg-gray-600 transition-colors"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                </div>

                {isDevelopment && this.state.error && (
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-3">
                      <Bug className="w-5 h-5 text-red-500 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Developer Information
                      </h2>
                    </div>

                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs
                                  overflow-x-auto">
                      <div className="mb-4">
                        <div className="text-red-400 font-semibold mb-1">Error Message:</div>
                        <div className="text-gray-300">{this.state.error.toString()}</div>
                      </div>

                      <div className="mb-4">
                        <div className="text-red-400 font-semibold mb-1">Component Stack:</div>
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </div>

                      <div className="mb-4">
                        <div className="text-red-400 font-semibold mb-1">Error Stack:</div>
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>

                      {this.state.errorHistory.length > 1 && (
                        <div>
                          <div className="text-red-400 font-semibold mb-1">
                            Error History ({this.state.errorHistory.length} errors):
                          </div>
                          <div className="space-y-2">
                            {this.state.errorHistory.map((err, index) => (
                              <div key={index} className="text-gray-400 text-xs">
                                {err.timestamp}: {err.message.substring(0, 100)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>This detailed information is only visible in development mode.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;