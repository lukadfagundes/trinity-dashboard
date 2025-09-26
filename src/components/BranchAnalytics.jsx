import { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { HistoryService } from '../services/historyService';

/**
 * Branch Analytics Component
 * Provides detailed analytics and comparisons between branches
 */
export function BranchAnalytics({ repository = 'trinity-dashboard' }) {
  const [branches, setBranches] = useState(['main', 'dev', 'develop']);
  const [selectedBranches, setSelectedBranches] = useState(['main', 'dev']);
  const [history, setHistory] = useState([]);
  const [timeRange, setTimeRange] = useState(30); // days
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, [repository, timeRange]);

  async function loadHistoricalData() {
    setLoading(true);
    try {
      const data = await HistoryService.fetchHistory(repository, 'all');
      setHistory(data);

      // Extract unique branches
      const uniqueBranches = [...new Set(data.map(entry => entry.branch))];
      setBranches(uniqueBranches);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
    setLoading(false);
  }

  // Calculate rolling average
  function calculateRollingAverage(data, window = 7) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
      result.push(avg);
    }
    return result;
  }

  // Prepare timeline data for charts
  const timelineData = useMemo(() => {
    if (!history.length) return null;

    const now = new Date();
    const cutoff = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // Filter data by time range and selected branches
    const filteredData = history.filter(entry =>
      new Date(entry.timestamp) > cutoff &&
      selectedBranches.includes(entry.branch)
    );

    // Group by date and branch
    const grouped = {};
    filteredData.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = {};
      }
      if (!grouped[date][entry.branch]) {
        grouped[date][entry.branch] = [];
      }
      grouped[date][entry.branch].push(entry);
    });

    // Calculate daily averages
    const dates = Object.keys(grouped).sort();
    const datasets = selectedBranches.map(branch => {
      const branchColor = getBranchColor(branch);
      const data = dates.map(date => {
        const entries = grouped[date]?.[branch] || [];
        if (entries.length === 0) return null;

        const avgCoverage = entries.reduce((sum, e) => sum + (e.coverage?.overall || 0), 0) / entries.length;
        return avgCoverage;
      });

      const dataset = {
        label: branch,
        data: data,
        borderColor: branchColor,
        backgroundColor: `${branchColor}20`,
        tension: 0.1
      };

      // Add rolling average if enabled
      if (showRollingAverage) {
        const avgData = calculateRollingAverage(data.map(d => d || 0));
        return [
          dataset,
          {
            label: `${branch} (7-day avg)`,
            data: avgData,
            borderColor: branchColor,
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.1
          }
        ];
      }

      return dataset;
    }).flat();

    return {
      labels: dates,
      datasets
    };
  }, [history, selectedBranches, timeRange, showRollingAverage]);

  // Calculate distribution data
  const distributionData = useMemo(() => {
    if (!history.length) return null;

    const distributions = {};
    selectedBranches.forEach(branch => {
      const branchData = history.filter(entry => entry.branch === branch);

      const ranges = {
        '0-20%': 0,
        '20-40%': 0,
        '40-60%': 0,
        '60-80%': 0,
        '80-100%': 0
      };

      branchData.forEach(entry => {
        const coverage = entry.coverage?.overall || 0;
        if (coverage <= 20) ranges['0-20%']++;
        else if (coverage <= 40) ranges['20-40%']++;
        else if (coverage <= 60) ranges['40-60%']++;
        else if (coverage <= 80) ranges['60-80%']++;
        else ranges['80-100%']++;
      });

      distributions[branch] = ranges;
    });

    const labels = Object.keys(distributions[selectedBranches[0]] || {});
    const datasets = selectedBranches.map(branch => ({
      label: branch,
      data: labels.map(label => distributions[branch]?.[label] || 0),
      backgroundColor: getBranchColor(branch)
    }));

    return {
      labels,
      datasets
    };
  }, [history, selectedBranches]);

  // Get branch statistics
  const branchStats = useMemo(() => {
    const stats = {};

    branches.forEach(branch => {
      const branchData = history.filter(entry => entry.branch === branch);
      if (branchData.length === 0) {
        stats[branch] = { count: 0 };
        return;
      }

      const coverages = branchData.map(e => e.coverage?.overall || 0);
      const testPassRates = branchData.map(e =>
        e.tests?.total > 0 ? (e.tests.passed / e.tests.total) * 100 : 0
      );

      stats[branch] = {
        count: branchData.length,
        avgCoverage: coverages.reduce((a, b) => a + b, 0) / coverages.length,
        minCoverage: Math.min(...coverages),
        maxCoverage: Math.max(...coverages),
        avgTestPassRate: testPassRates.reduce((a, b) => a + b, 0) / testPassRates.length,
        lastUpdate: branchData[0].timestamp
      };
    });

    return stats;
  }, [history, branches]);

  function getBranchColor(branch) {
    const colors = {
      main: '#10B981',
      master: '#10B981',
      dev: '#3B82F6',
      develop: '#3B82F6',
      staging: '#F59E0B',
      production: '#EF4444'
    };
    return colors[branch] || '#8B5CF6';
  }

  function toggleBranchSelection(branch) {
    setSelectedBranches(prev => {
      if (prev.includes(branch)) {
        return prev.filter(b => b !== branch);
      }
      return [...prev, branch];
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading branch analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* Branch Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Branches to Compare
            </label>
            <div className="flex flex-wrap gap-2">
              {branches.map(branch => (
                <button
                  key={branch}
                  onClick={() => toggleBranchSelection(branch)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedBranches.includes(branch)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-1 bg-gray-800 text-white rounded-lg border border-gray-700"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Rolling Average Toggle */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showRollingAverage}
                onChange={(e) => setShowRollingAverage(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-400">Show 7-day average</span>
            </label>
          </div>
        </div>
      </div>

      {/* Branch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedBranches.map(branch => (
          <div key={branch} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{branch}</h3>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getBranchColor(branch) }}
              />
            </div>

            {branchStats[branch] ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Coverage:</span>
                  <span className="text-white">
                    {branchStats[branch].avgCoverage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coverage Range:</span>
                  <span className="text-white">
                    {branchStats[branch].minCoverage.toFixed(0)}% - {branchStats[branch].maxCoverage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Test Pass Rate:</span>
                  <span className="text-white">
                    {branchStats[branch].avgTestPassRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Points:</span>
                  <span className="text-white">{branchStats[branch].count}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline Chart */}
      {timelineData && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Coverage Timeline</h3>
          <div className="h-64">
            <Line
              data={timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#fff' }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  x: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF' }
                  },
                  y: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF' },
                    min: 0,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {distributionData && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Coverage Distribution</h3>
          <div className="h-64">
            <Bar
              data={distributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#fff' }
                  }
                },
                scales: {
                  x: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF' }
                  },
                  y: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF' }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchAnalytics;