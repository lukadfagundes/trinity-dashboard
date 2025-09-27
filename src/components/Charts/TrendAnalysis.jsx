import { Line } from 'react-chartjs-2';
import { useState, useMemo } from 'react';
import { config } from '../../services/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TrendAnalysis({ data }) {
  const [metric, setMetric] = useState('coverage');
  const [timeRange, setTimeRange] = useState('7d');

  const generateTimeLabels = (range) => {
    const labels = [];
    const now = new Date();

    switch(range) {
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now - i * 3600000);
          labels.push(date.getHours() + ':00');
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now - i * 86400000);
          labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i -= 3) {
          const date = new Date(now - i * 86400000);
          labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
        }
        break;
      case '90d':
        for (let i = 90; i >= 0; i -= 7) {
          const date = new Date(now - i * 86400000);
          labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
        }
        break;
      default:
        return labels;
    }

    return labels;
  };

  const extractMetricData = (runs, branch, metricType) => {
    if (!runs || runs.length === 0) return [];

    const branchRuns = runs.filter(run => run.branch === branch || !branch);
    const labels = generateTimeLabels(timeRange);

    // Extract actual metric data from runs instead of generating fake data
    return labels.map((label, index) => {
      const runIndex = Math.min(index, branchRuns.length - 1);
      if (runIndex < 0 || !branchRuns[runIndex]) return null;

      const run = branchRuns[runIndex];
      switch(metricType) {
        case 'coverage':
          return run.metrics?.coverage?.overall ?? null;
        case 'tests':
          return run.metrics?.tests?.passRate ?? null;
        case 'build':
          return run.metrics?.build?.success ? 100 : 0;
        default:
          return null;
      }
    });
  };

  const calculateMovingAverage = (dataPoints, window = 3) => {
    if (!dataPoints || dataPoints.length === 0) return [];

    return dataPoints.map((_, index) => {
      const start = Math.max(0, index - window + 1);
      const subset = dataPoints.slice(start, index + 1);
      return subset.reduce((a, b) => a + b, 0) / subset.length;
    });
  };

  const chartData = useMemo(() => {
    const mainData = extractMetricData(data, 'main', metric);
    const devData = extractMetricData(data, 'dev', metric);

    return {
      labels: generateTimeLabels(timeRange),
      datasets: [
        {
          label: 'Main Branch',
          data: mainData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Dev Branch',
          data: devData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Moving Average (Main)',
          data: calculateMovingAverage(mainData),
          borderColor: 'rgb(251, 146, 60)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3
        }
      ]
    };
  }, [data, metric, timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `${metric.toUpperCase()} Trend Analysis`,
        color: '#f3f4f6',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="bg-gray-900 dark:bg-trinity-dark-card p-6 rounded-lg border border-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white">Performance Trends</h3>

        <div className="flex gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-md border border-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="coverage">Coverage</option>
            <option value="tests">Test Pass Rate</option>
            <option value="build">Build Success</option>
            <option value="security">Security Score</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-md border border-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800 dark:bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-400">Current</div>
          <div className="text-lg font-semibold text-white">
            {chartData.datasets[0].data[chartData.datasets[0].data.length - 1]?.toFixed(1) || '0'}%
          </div>
        </div>
        <div className="bg-gray-800 dark:bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-400">Average</div>
          <div className="text-lg font-semibold text-white">
            {(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 dark:bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-400">Target</div>
          <div className="text-lg font-semibold text-trinity-green">{config.getReadinessThreshold()}%</div>
        </div>
      </div>
    </div>
  );
}