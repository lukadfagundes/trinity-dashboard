import { config } from '../services/config';
import { useState, useEffect } from 'react';
import { HistoryService } from '../services/historyService';
import { ReadinessScorer } from '../services/readinessScoring';

/**
 * Readiness Trend Component
 * Shows PR readiness scores over time
 */

export function ReadinessTrend({ repository = config.getRepo() }) {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    async function fetchReadinessHistory() {
      try {
        setLoading(true);
        const history = await HistoryService.fetchHistory(repository);

        // Filter to PR branches (not main/master)
        const prHistory = history.filter(entry =>
          entry.branch &&
          entry.branch !== 'main' &&
          entry.branch !== 'master' &&
          entry.branch !== 'develop'
        );

        // Get main branch data for comparison
        const mainHistory = history.filter(entry =>
          entry.branch === 'main' || entry.branch === 'master'
        );

        const mainData = mainHistory[0] || {};

        // Calculate readiness scores for each PR entry
        const scoredHistory = prHistory.slice(0, timeRange).map(entry => ({
          timestamp: entry.timestamp,
          date: new Date(entry.timestamp).toLocaleDateString(),
          branch: entry.branch,
          score: ReadinessScorer.calculateScore(entry, mainData)
        }));

        // Prepare chart data
        const chartData = {
          labels: scoredHistory.map(h => h.date).reverse(),
          datasets: [
            {
              label: 'Readiness Score',
              data: scoredHistory.map(h => h.score).reverse(),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Threshold',
              data: Array(scoredHistory.length).fill(80),
              borderColor: 'rgb(239, 68, 68)',
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        };

        setTrendData({
          chartData,
          scoredHistory,
          stats: calculateStats(scoredHistory)
        });
      } catch (error) {
        console.error('Error fetching readiness history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReadinessHistory();
  }, [repository, timeRange]);

  function calculateStats(history) {
    if (history.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        passingRate: 0,
        trend: 'neutral'
      };
    }

    const scores = history.map(h => h.score);
    const passingScores = scores.filter(s => s >= 80);

    // Calculate trend (last 10 vs previous 10)
    let trend = 'neutral';
    if (history.length >= 20) {
      const recent = scores.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const previous = scores.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
      if (recent > previous + 2) trend = 'improving';
      else if (recent < previous - 2) trend = 'declining';
    }

    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
      passingRate: (passingScores.length / scores.length) * 100,
      trend
    };
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trendData || trendData.scoredHistory.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">PR Readiness Trend</h3>
        <div className="text-center py-12 text-gray-500">
          No PR history available for trend analysis
        </div>
      </div>
    );
  }

  const { stats } = trendData;

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">PR Readiness Trend</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="px-3 py-1 bg-gray-800 text-white border border-gray-700 rounded text-sm"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Average</div>
          <div className={`text-xl font-bold ${
            stats.average >= 80 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {stats.average.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Min</div>
          <div className={`text-xl font-bold ${
            stats.min >= 80 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.min}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Max</div>
          <div className="text-xl font-bold text-green-400">
            {stats.max}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Pass Rate</div>
          <div className={`text-xl font-bold ${
            stats.passingRate >= 70 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {stats.passingRate.toFixed(0)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Trend</div>
          <div className={`text-xl font-bold ${
            stats.trend === 'improving' ? 'text-green-400' :
            stats.trend === 'declining' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {stats.trend === 'improving' ? '↑' :
             stats.trend === 'declining' ? '↓' :
             '→'}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800 rounded p-4" style={{ height: '300px' }}>
        <SimpleLineChart data={trendData.chartData} />
      </div>

      {/* Recent PRs List */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Recent PRs</h4>
        <div className="space-y-2 max-h-32 overflow-auto">
          {trendData.scoredHistory.slice(0, 5).map((pr, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-400 truncate flex-1">
                {pr.branch}
              </span>
              <span className="text-gray-500 mx-2">
                {new Date(pr.timestamp).toLocaleDateString()}
              </span>
              <span className={`font-medium ${
                pr.score >= 80 ? 'text-green-400' : 'text-red-400'
              }`}>
                {pr.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple line chart component (without external dependencies)
function SimpleLineChart({ data }) {
  if (!data || !data.labels || !data.datasets) {
    return <div className="text-gray-500">No data to display</div>;
  }

  const maxValue = Math.max(
    ...data.datasets.flatMap(d => d.data),
    100
  );

  const width = 100;
  const height = 100;
  const padding = 10;

  // Calculate points for main dataset
  const mainDataset = data.datasets[0];
  const points = mainDataset.data.map((value, index) => {
    const x = padding + (index / (mainDataset.data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (value / maxValue) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(value => {
        const y = height - padding - (value / maxValue) * (height - 2 * padding);
        return (
          <g key={value}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgb(55, 65, 81)"
              strokeWidth="0.5"
            />
            <text
              x={padding - 2}
              y={y + 1}
              className="text-xs fill-gray-500"
              textAnchor="end"
              fontSize="3"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Threshold line */}
      <line
        x1={padding}
        y1={height - padding - (config.getReadinessThreshold() / maxValue) * (height - 2 * padding)}
        x2={width - padding}
        y2={height - padding - (config.getReadinessThreshold() / maxValue) * (height - 2 * padding)}
        stroke="rgb(239, 68, 68)"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />

      {/* Main line */}
      <path
        d={pathData}
        fill="none"
        stroke="rgb(59, 130, 246)"
        strokeWidth="1"
      />

      {/* Data points */}
      {mainDataset.data.map((value, index) => {
        const x = padding + (index / (mainDataset.data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (value / maxValue) * (height - 2 * padding);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="1"
            fill="rgb(59, 130, 246)"
          />
        );
      })}
    </svg>
  );
}