class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 50;
    this.criticalThreshold = 5;
    this.listeners = new Set();
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) {
      console.warn('ErrorHandler already initialized');
      return;
    }

    this.setupGlobalHandlers();
    this.setupConsoleInterception();
    this.isInitialized = true;

    console.log('ErrorHandler initialized successfully');
  }

  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'uncaught-error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled-rejection',
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
      });
    });
  }

  setupConsoleInterception() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      this.logError({
        type: 'console-error',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (this.shouldLogWarning(args)) {
        this.logWarning({
          type: 'console-warning',
          message: args.join(' '),
          timestamp: new Date().toISOString(),
        });
      }
      originalWarn.apply(console, args);
    };
  }

  shouldLogWarning(args) {
    const message = args.join(' ');
    const ignoredWarnings = [
      'React Hook useEffect has missing dependencies',
      'componentWillReceiveProps has been renamed',
    ];

    return !ignoredWarnings.some(warning => message.includes(warning));
  }

  handleError(errorInfo) {
    this.addToQueue(errorInfo);
    this.notifyListeners(errorInfo);
    this.persistError(errorInfo);

    if (this.isCriticalError(errorInfo)) {
      this.handleCriticalError([errorInfo]);
    }
  }

  logError(errorInfo) {
    const enrichedError = {
      ...errorInfo,
      timestamp: errorInfo.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.addToQueue(enrichedError);
    this.persistError(enrichedError);
  }

  logWarning(warningInfo) {
    const enrichedWarning = {
      ...warningInfo,
      level: 'warning',
      timestamp: warningInfo.timestamp || new Date().toISOString(),
    };

    this.addToQueue(enrichedWarning);
  }

  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo);

    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  persistError(errorInfo) {
    try {
      const storageKey = 'trinity_dashboard_errors';
      const existingErrors = JSON.parse(localStorage.getItem(storageKey) || '[]');

      existingErrors.push(errorInfo);

      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20);
      }

      localStorage.setItem(storageKey, JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to persist error to localStorage:', e);
    }
  }

  isCriticalError(errorInfo) {
    const criticalPatterns = [
      'Maximum update depth exceeded',
      'ResizeObserver loop limit exceeded',
      'Cannot read properties of null',
      'Cannot read properties of undefined',
      'Network request failed',
    ];

    const message = errorInfo.message || errorInfo.reason || '';
    return criticalPatterns.some(pattern => message.includes(pattern));
  }

  handleCriticalError(errorHistory) {
    console.error('CRITICAL ERROR DETECTED', errorHistory);

    const recentErrors = this.errorQueue.slice(-10);

    this.notifyListeners({
      type: 'critical-error',
      errorHistory: recentErrors,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'production') {
      // Future: Send to monitoring service
    }
  }

  getErrors(options = {}) {
    const { limit = 10, type = null } = options;

    let errors = [...this.errorQueue];

    if (type) {
      errors = errors.filter(e => e.type === type);
    }

    return errors.slice(-limit);
  }

  clearErrors() {
    this.errorQueue = [];
    localStorage.removeItem('trinity_dashboard_errors');
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(errorInfo) {
    this.listeners.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      errorCount: this.errorQueue.length,
      errors: this.getErrors({ limit: 20 }),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    return report;
  }

  exportErrors() {
    const report = this.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

const errorHandler = new ErrorHandler();

export default errorHandler;