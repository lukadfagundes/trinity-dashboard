/**
 * Performance Metrics Utility
 * Comprehensive performance monitoring for trinity-dashboard
 * Tracks render times, API latencies, memory usage, and user interactions
 */

class PerformanceMetrics {
  constructor() {
    this.metrics = {
      renders: [],
      apiCalls: [],
      interactions: [],
      memory: [],
      navigation: [],
      errors: []
    };
    this.maxMetrics = 100;
    this.listeners = new Set();
    this.sessionStart = Date.now();
    this.initializeObservers();
  }

  initializeObservers() {
    if (typeof window === 'undefined') return;

    // Navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationTiming(entry);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('[PerformanceMetrics] Navigation observer setup failed:', e);
      }

      // Long tasks observer
      try {
        const taskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              this.recordLongTask(entry);
            }
          }
        });
        taskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('[PerformanceMetrics] Long task observer setup failed:', e);
      }
    }

    // Memory monitoring
    if ('memory' in performance) {
      this.startMemoryMonitoring();
    }

    // Error tracking
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  startMemoryMonitoring() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        this.recordMemory({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  recordNavigationTiming(entry) {
    const timing = {
      timestamp: Date.now(),
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive,
      fetchStart: entry.fetchStart,
      responseEnd: entry.responseEnd,
      duration: entry.duration
    };

    this.addMetric('navigation', timing);
  }

  recordLongTask(entry) {
    this.addMetric('interactions', {
      type: 'longtask',
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    });
  }

  recordMemory(memoryInfo) {
    const metric = {
      timestamp: Date.now(),
      used: Math.round(memoryInfo.usedJSHeapSize / 1048576),
      total: Math.round(memoryInfo.totalJSHeapSize / 1048576),
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576),
      percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100)
    };

    this.addMetric('memory', metric);
  }

  recordRender(componentName, duration, props = {}) {
    const metric = {
      timestamp: Date.now(),
      component: componentName,
      duration,
      propsCount: Object.keys(props).length,
      slow: duration > 16 // More than one frame
    };

    this.addMetric('renders', metric);
  }

  recordApiCall(endpoint, duration, status, method = 'GET') {
    const metric = {
      timestamp: Date.now(),
      endpoint,
      duration,
      status,
      method,
      slow: duration > 1000
    };

    this.addMetric('apiCalls', metric);
  }

  recordInteraction(type, target, duration) {
    const metric = {
      timestamp: Date.now(),
      type,
      target,
      duration,
      slow: duration > 100
    };

    this.addMetric('interactions', metric);
  }

  handleError(event) {
    this.addMetric('errors', {
      timestamp: Date.now(),
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }

  handlePromiseRejection(event) {
    this.addMetric('errors', {
      timestamp: Date.now(),
      type: 'unhandledrejection',
      reason: event.reason?.toString() || 'Unknown',
      promise: event.promise
    });
  }

  addMetric(category, metric) {
    if (!this.metrics[category]) {
      this.metrics[category] = [];
    }

    this.metrics[category].push(metric);

    // Trim to max size
    if (this.metrics[category].length > this.maxMetrics) {
      this.metrics[category] = this.metrics[category].slice(-this.maxMetrics);
    }

    this.notifyListeners(category, metric);
  }

  getMetrics(category = null) {
    if (category) {
      return this.metrics[category] || [];
    }
    return this.metrics;
  }

  getAverages() {
    const averages = {};

    // Render averages
    if (this.metrics.renders.length > 0) {
      const renderTimes = this.metrics.renders.map(m => m.duration);
      averages.render = {
        avg: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes),
        slowRenders: this.metrics.renders.filter(m => m.slow).length
      };
    }

    // API call averages
    if (this.metrics.apiCalls.length > 0) {
      const apiTimes = this.metrics.apiCalls.map(m => m.duration);
      averages.api = {
        avg: apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length,
        min: Math.min(...apiTimes),
        max: Math.max(...apiTimes),
        slowCalls: this.metrics.apiCalls.filter(m => m.slow).length,
        errorRate: this.metrics.apiCalls.filter(m => m.status >= 400).length / this.metrics.apiCalls.length
      };
    }

    // Memory averages
    if (this.metrics.memory.length > 0) {
      const memoryUsage = this.metrics.memory.map(m => m.used);
      averages.memory = {
        avg: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
        min: Math.min(...memoryUsage),
        max: Math.max(...memoryUsage),
        current: this.metrics.memory[this.metrics.memory.length - 1]
      };
    }

    // Interaction averages
    if (this.metrics.interactions.length > 0) {
      const interactionTimes = this.metrics.interactions.map(m => m.duration);
      averages.interactions = {
        avg: interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length,
        min: Math.min(...interactionTimes),
        max: Math.max(...interactionTimes),
        slowInteractions: this.metrics.interactions.filter(m => m.slow).length
      };
    }

    // Error rate
    averages.errorRate = {
      total: this.metrics.errors.length,
      rate: this.metrics.errors.length / ((Date.now() - this.sessionStart) / 60000) // Errors per minute
    };

    return averages;
  }

  getReport() {
    const averages = this.getAverages();
    const sessionDuration = Date.now() - this.sessionStart;

    return {
      sessionDuration,
      averages,
      totals: {
        renders: this.metrics.renders.length,
        apiCalls: this.metrics.apiCalls.length,
        interactions: this.metrics.interactions.length,
        errors: this.metrics.errors.length
      },
      health: this.calculateHealthScore(averages)
    };
  }

  calculateHealthScore(averages) {
    let score = 100;
    const penalties = [];

    // Render performance
    if (averages.render) {
      if (averages.render.avg > 16) {
        score -= 10;
        penalties.push('Slow average render time');
      }
      if (averages.render.slowRenders > 10) {
        score -= 15;
        penalties.push('Too many slow renders');
      }
    }

    // API performance
    if (averages.api) {
      if (averages.api.avg > 1000) {
        score -= 10;
        penalties.push('Slow API responses');
      }
      if (averages.api.errorRate > 0.05) {
        score -= 20;
        penalties.push('High API error rate');
      }
    }

    // Memory usage
    if (averages.memory && averages.memory.current) {
      if (averages.memory.current.percentage > 80) {
        score -= 15;
        penalties.push('High memory usage');
      }
    }

    // Error rate
    if (averages.errorRate) {
      if (averages.errorRate.rate > 1) {
        score -= 20;
        penalties.push('High error rate');
      }
    }

    return {
      score: Math.max(0, score),
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      penalties
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(category, metric) {
    this.listeners.forEach(callback => {
      try {
        callback(category, metric);
      } catch (error) {
        console.error('[PerformanceMetrics] Listener error:', error);
      }
    });
  }

  reset() {
    this.metrics = {
      renders: [],
      apiCalls: [],
      interactions: [],
      memory: [],
      navigation: [],
      errors: []
    };
    this.sessionStart = Date.now();
  }

  export() {
    return {
      timestamp: Date.now(),
      sessionStart: this.sessionStart,
      metrics: this.metrics,
      report: this.getReport()
    };
  }
}

// Singleton instance
const performanceMetrics = new PerformanceMetrics();

export default performanceMetrics;

// React hook
export function usePerformanceMonitor(componentName) {
  if (typeof window === 'undefined') return performanceMetrics;

  const renderStart = { current: performance.now() };

  // Use setTimeout to simulate useEffect behavior
  setTimeout(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceMetrics.recordRender(componentName, renderTime);
    renderStart.current = performance.now();
  }, 0);

  return performanceMetrics;
}

// API call wrapper
export function measureApiCall(endpoint, method, apiCallFunction) {
  return async (...args) => {
    const startTime = performance.now();
    try {
      const result = await apiCallFunction(...args);
      const duration = performance.now() - startTime;
      performanceMetrics.recordApiCall(endpoint, duration, 200, method);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const status = error.response?.status || 500;
      performanceMetrics.recordApiCall(endpoint, duration, status, method);
      throw error;
    }
  };
}

// Interaction wrapper
export function measureInteraction(type, target) {
  const startTime = performance.now();
  return () => {
    const duration = performance.now() - startTime;
    performanceMetrics.recordInteraction(type, target, duration);
  };
}