import { useEffect, useState } from 'react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    cacheHits: 0,
    cacheHitRate: 0,
    avgLoadTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    lastUpdate: null
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const apiCalls = parseInt(localStorage.getItem('api_calls') || '0');
      const cacheHits = parseInt(localStorage.getItem('cache_hits') || '0');
      const errors = parseInt(localStorage.getItem('api_errors') || '0');
      const totalLoadTime = parseFloat(localStorage.getItem('total_load_time') || '0');
      const loadCount = parseInt(localStorage.getItem('load_count') || '1');

      const totalRequests = apiCalls + cacheHits;
      const cacheHitRate = totalRequests > 0 ? ((cacheHits / totalRequests) * 100) : 0;
      const avgLoadTime = loadCount > 0 ? (totalLoadTime / loadCount) : 0;
      const errorRate = apiCalls > 0 ? ((errors / apiCalls) * 100) : 0;

      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
      }

      setMetrics({
        apiCalls,
        cacheHits,
        cacheHitRate: cacheHitRate.toFixed(1),
        avgLoadTime: avgLoadTime.toFixed(0),
        errorRate: errorRate.toFixed(1),
        memoryUsage,
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      const currentTotal = parseFloat(localStorage.getItem('total_load_time') || '0');
      const currentCount = parseInt(localStorage.getItem('load_count') || '0');

      localStorage.setItem('total_load_time', (currentTotal + loadTime).toString());
      localStorage.setItem('load_count', (currentCount + 1).toString());
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('/api/')) {
          const currentTotal = parseFloat(localStorage.getItem('total_load_time') || '0');
          const currentCount = parseInt(localStorage.getItem('load_count') || '0');

          localStorage.setItem('total_load_time', (currentTotal + entry.duration).toString());
          localStorage.setItem('load_count', (currentCount + 1).toString());
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  if (!isVisible && process.env.NODE_ENV !== 'development') return null;

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-400';
    if (value <= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCacheRateColor = (rate) => {
    const value = parseFloat(rate);
    if (value >= 70) return 'text-green-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono shadow-lg border border-gray-700 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="text-green-400 font-semibold">Performance Monitor</div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white ml-2"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>API Calls:</span>
          <span className="text-blue-400">{metrics.apiCalls}</span>
        </div>

        <div className="flex justify-between">
          <span>Cache Hits:</span>
          <span className="text-green-400">{metrics.cacheHits}</span>
        </div>

        <div className="flex justify-between">
          <span>Cache Rate:</span>
          <span className={getCacheRateColor(metrics.cacheHitRate)}>
            {metrics.cacheHitRate}%
          </span>
        </div>

        <div className="flex justify-between">
          <span>Avg Load:</span>
          <span className={getStatusColor(metrics.avgLoadTime, { good: 500, warning: 1000 })}>
            {metrics.avgLoadTime}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span>Error Rate:</span>
          <span className={getStatusColor(metrics.errorRate, { good: 1, warning: 5 })}>
            {metrics.errorRate}%
          </span>
        </div>

        {metrics.memoryUsage > 0 && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getStatusColor(metrics.memoryUsage, { good: 50, warning: 75 })}>
              {metrics.memoryUsage}%
            </span>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-gray-700">
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="text-gray-400">{metrics.lastUpdate}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
        <div className="text-center">Ctrl+Shift+P to toggle</div>
      </div>

      {metrics.cacheHitRate < 40 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-yellow-400 text-xs">
            ⚠ Low cache hit rate detected
          </div>
        </div>
      )}

      {metrics.errorRate > 10 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-red-400 text-xs">
            ⚠ High error rate detected
          </div>
        </div>
      )}
    </div>
  );
}