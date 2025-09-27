import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Cpu, Database, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import DashboardLayout from './Layout/DashboardLayout';
import performanceMetrics from '../utils/performanceMetrics';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(performanceMetrics.getMetrics());
  const [report, setReport] = useState(performanceMetrics.getReport());
  const [selectedCategory, setSelectedCategory] = useState('overview');

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMetrics.getMetrics());
      setReport(performanceMetrics.getReport());
    };

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    // Subscribe to real-time updates
    const unsubscribe = performanceMetrics.subscribe(() => {
      updateMetrics();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const healthColor = useMemo(() => {
    if (!report.health) return 'text-gray-500';
    switch (report.health.status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, [report.health]);

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Health Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Score</h3>
          <Activity className={`w-5 h-5 ${healthColor}`} />
        </div>
        <p className={`text-3xl font-bold ${healthColor}`}>
          {report.health?.score || 0}%
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {report.health?.status?.toUpperCase() || 'UNKNOWN'}
        </p>
      </div>

      {/* Average Render Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Render</h3>
          <Cpu className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {report.averages?.render?.avg?.toFixed(2) || 0}ms
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {report.averages?.render?.slowRenders || 0} slow renders
        </p>
      </div>

      {/* API Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">API Response</h3>
          <Database className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {report.averages?.api?.avg?.toFixed(0) || 0}ms
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {((1 - (report.averages?.api?.errorRate || 0)) * 100).toFixed(1)}% success
        </p>
      </div>

      {/* Memory Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory</h3>
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {report.averages?.memory?.current?.used || 0}MB
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {report.averages?.memory?.current?.percentage || 0}% of limit
        </p>
      </div>
    </div>
  );

  const renderRenderMetrics = () => {
    const data = metrics.renders.slice(-20);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Component Render Performance</h3>

        <div className="mb-6">
          <Line
            data={{
              labels: data.map((_, i) => `R${i + 1}`),
              datasets: [{
                label: 'Render Time (ms)',
                data: data.map(m => m.duration),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Duration (ms)'
                  }
                }
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Slow Renders</p>
            <p className="text-2xl font-bold">{report.averages?.render?.slowRenders || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Render Time</p>
            <p className="text-2xl font-bold">{report.averages?.render?.max?.toFixed(2) || 0}ms</p>
          </div>
        </div>
      </div>
    );
  };

  const renderApiMetrics = () => {
    const data = metrics.apiCalls.slice(-20);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">API Call Performance</h3>

        <div className="mb-6">
          <Bar
            data={{
              labels: data.map(m => m.endpoint.split('/').pop()),
              datasets: [{
                label: 'Response Time (ms)',
                data: data.map(m => m.duration),
                backgroundColor: data.map(m =>
                  m.status >= 400 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)'
                )
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Duration (ms)'
                  }
                }
              }
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Total Calls</p>
            <p className="text-2xl font-bold">{report.totals?.apiCalls || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-bold">
              {((report.averages?.api?.errorRate || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Slow Calls</p>
            <p className="text-2xl font-bold">{report.averages?.api?.slowCalls || 0}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMemoryMetrics = () => {
    const data = metrics.memory.slice(-10);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Memory Usage</h3>

        <div className="mb-6">
          <Line
            data={{
              labels: data.map((_, i) => `T${i + 1}`),
              datasets: [
                {
                  label: 'Used (MB)',
                  data: data.map(m => m.used),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Total (MB)',
                  data: data.map(m => m.total),
                  borderColor: 'rgb(156, 163, 175)',
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  borderDash: [5, 5],
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Memory (MB)'
                  }
                }
              }
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Current</p>
            <p className="text-2xl font-bold">{report.averages?.memory?.current?.used || 0}MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Peak</p>
            <p className="text-2xl font-bold">{report.averages?.memory?.max || 0}MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">% of Limit</p>
            <p className="text-2xl font-bold">
              {report.averages?.memory?.current?.percentage || 0}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthIssues = () => {
    const penalties = report.health?.penalties || [];
    const recentErrors = metrics.errors.slice(-5);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Health Issues</h3>

        {penalties.length > 0 ? (
          <div className="space-y-2 mb-6">
            {penalties.map((penalty, index) => (
              <div key={index} className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{penalty}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">No health issues detected</p>
        )}

        <h4 className="text-sm font-medium mb-2">Recent Errors</h4>
        {recentErrors.length > 0 ? (
          <div className="space-y-2">
            {recentErrors.map((error, index) => (
              <div key={index} className="text-xs">
                <span className="text-gray-500">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
                <span className="ml-2 text-red-500">{error.type}</span>
                <p className="text-gray-600 dark:text-gray-400 truncate">
                  {error.message || error.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent errors</p>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Performance Metrics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Session Duration: {Math.floor(report.sessionDuration / 60000)} minutes
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('overview')}
            className={`px-4 py-2 rounded ${
              selectedCategory === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedCategory('renders')}
            className={`px-4 py-2 rounded ${
              selectedCategory === 'renders'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Renders
          </button>
          <button
            onClick={() => setSelectedCategory('api')}
            className={`px-4 py-2 rounded ${
              selectedCategory === 'api'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            API
          </button>
          <button
            onClick={() => setSelectedCategory('memory')}
            className={`px-4 py-2 rounded ${
              selectedCategory === 'memory'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Memory
          </button>
          <button
            onClick={() => setSelectedCategory('health')}
            className={`px-4 py-2 rounded ${
              selectedCategory === 'health'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Health
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {selectedCategory === 'overview' && renderOverview()}
        {selectedCategory === 'renders' && renderRenderMetrics()}
        {selectedCategory === 'api' && renderApiMetrics()}
        {selectedCategory === 'memory' && renderMemoryMetrics()}
        {selectedCategory === 'health' && renderHealthIssues()}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <button
          onClick={() => {
            const data = performanceMetrics.export();
            console.log('[PerformanceMetrics] Exported data:', data);
            alert('Performance data exported to console');
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Export Metrics
        </button>
        <button
          onClick={() => {
            performanceMetrics.reset();
            alert('Performance metrics reset');
          }}
          className="ml-2 px-4 py-2 bg-red-200 rounded hover:bg-red-300"
        >
          Reset Metrics
        </button>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformanceDashboard;