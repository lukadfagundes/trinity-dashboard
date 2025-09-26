import errorHandler from '../errorHandler';

describe('ErrorHandler', () => {
  let originalConsoleError;
  let originalConsoleWarn;
  let originalLocalStorage;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();

    originalLocalStorage = global.localStorage;
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;

    errorHandler.errorQueue = [];
    errorHandler.listeners.clear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    global.localStorage = originalLocalStorage;
  });

  describe('error logging', () => {
    it('should log errors to queue', () => {
      const error = { message: 'Test error', stack: 'Error stack' };

      errorHandler.logError(error);

      expect(errorHandler.errorQueue).toHaveLength(1);
      expect(errorHandler.errorQueue[0]).toMatchObject({
        message: 'Test error',
        stack: 'Error stack'
      });
    });

    it('should enrich errors with metadata', () => {
      const error = { message: 'Test error' };

      errorHandler.logError(error);

      const logged = errorHandler.errorQueue[0];
      expect(logged).toHaveProperty('timestamp');
      expect(logged).toHaveProperty('userAgent');
      expect(logged).toHaveProperty('url');
    });

    it('should limit queue size', () => {
      const maxSize = errorHandler.maxQueueSize;

      for (let i = 0; i < maxSize + 10; i++) {
        errorHandler.logError({ message: `Error ${i}` });
      }

      expect(errorHandler.errorQueue.length).toBe(maxSize);
      // First errors should be evicted
      expect(errorHandler.errorQueue[0].message).toBe('Error 10');
    });

    it('should persist errors to localStorage', () => {
      const error = { message: 'Persisted error' };

      errorHandler.logError(error);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'trinity_dashboard_errors',
        expect.any(String)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      expect(() => {
        errorHandler.logError({ message: 'Test error' });
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to persist error to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('error classification', () => {
    it('should identify critical errors', () => {
      const criticalErrors = [
        { message: 'Maximum update depth exceeded' },
        { message: 'Cannot read properties of null' },
        { reason: 'Cannot read properties of undefined' },
        { message: 'Network request failed' }
      ];

      criticalErrors.forEach(error => {
        expect(errorHandler.isCriticalError(error)).toBe(true);
      });
    });

    it('should handle critical errors specially', () => {
      const spy = jest.spyOn(errorHandler, 'handleCriticalError');

      errorHandler.handleError({
        message: 'Maximum update depth exceeded',
        stack: 'test stack'
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should not mark normal errors as critical', () => {
      const normalError = { message: 'Normal application error' };
      expect(errorHandler.isCriticalError(normalError)).toBe(false);
    });
  });

  describe('error listeners', () => {
    it('should add and notify listeners', () => {
      const listener = jest.fn();
      const unsubscribe = errorHandler.addListener(listener);

      const error = { message: 'Test error' };
      errorHandler.handleError(error);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Test error'
      }));

      unsubscribe();
    });

    it('should handle listener errors gracefully', () => {
      const badListener = jest.fn(() => {
        throw new Error('Listener error');
      });

      errorHandler.addListener(badListener);

      expect(() => {
        errorHandler.handleError({ message: 'Test' });
      }).not.toThrow();
    });

    it('should allow unsubscribing listeners', () => {
      const listener = jest.fn();
      const unsubscribe = errorHandler.addListener(listener);

      unsubscribe();
      errorHandler.handleError({ message: 'Test' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('error recovery', () => {
    it('should get recent errors', () => {
      errorHandler.logError({ message: 'Error 1' });
      errorHandler.logError({ message: 'Error 2' });
      errorHandler.logError({ message: 'Error 3' });

      const recent = errorHandler.getErrors({ limit: 2 });
      expect(recent).toHaveLength(2);
      expect(recent[0].message).toBe('Error 2');
      expect(recent[1].message).toBe('Error 3');
    });

    it('should filter errors by type', () => {
      errorHandler.errorQueue = [
        { type: 'console-error', message: 'Console error' },
        { type: 'unhandled-rejection', message: 'Promise rejection' },
        { type: 'console-error', message: 'Another console error' }
      ];

      const filtered = errorHandler.getErrors({ type: 'console-error' });
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.type === 'console-error')).toBe(true);
    });

    it('should clear all errors', () => {
      errorHandler.logError({ message: 'Error to clear' });
      expect(errorHandler.errorQueue).toHaveLength(1);

      errorHandler.clearErrors();

      expect(errorHandler.errorQueue).toHaveLength(0);
      expect(localStorage.removeItem).toHaveBeenCalledWith('trinity_dashboard_errors');
    });

    it('should generate error report', () => {
      errorHandler.logError({ message: 'Error 1' });
      errorHandler.logError({ message: 'Error 2' });

      const report = errorHandler.generateReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('errorCount', 2);
      expect(report).toHaveProperty('errors');
      expect(report).toHaveProperty('environment');
      expect(report.errors).toHaveLength(2);
    });
  });

  describe('console interception', () => {
    it('should be initialized properly', () => {
      const handler = new errorHandler.constructor();
      handler.initialize();

      expect(handler.isInitialized).toBe(true);
    });

    it('should handle warnings selectively', () => {
      errorHandler.logWarning = jest.fn();

      const ignoredWarning = { message: 'React Hook useEffect has missing dependencies' };
      const normalWarning = { message: 'Normal warning' };

      expect(errorHandler.shouldLogWarning([ignoredWarning.message])).toBe(false);
      expect(errorHandler.shouldLogWarning([normalWarning.message])).toBe(true);
    });
  });
});