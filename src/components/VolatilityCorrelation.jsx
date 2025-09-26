import { Scatter, Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';

export function VolatilityCorrelation({ repository, branches = ['main', 'dev'] }) {
  const [correlationData, setCorrelationData] = useState(null);
  const [branchVolatility, setBranchVolatility] = useState({});
  const [smoothingWindow, setSmoothingWindow] = useState(7);
  const [correlation, setCorrelation] = useState(null);

  useEffect(() => {
    async function fetchAndAnalyze() {
      // Fetch PR readiness and volatility data
      const response = await fetch(`/api/correlation/${repository}`);
      const data = await response.json();

      // Calculate correlation
      const corr = calculateCorrelation(data);
      setCorrelation(corr);

      // Prepare scatter plot data
      const scatterData = prepareScatterData(data);
      setCorrelationData(scatterData);

      // Calculate per-branch volatility
      const branchData = calculateBranchVolatility(data, branches);
      setBranchVolatility(branchData);
    }

    fetchAndAnalyze();
  }, [repository, branches, smoothingWindow]);

  // Step 53: Volatility Correlation Analysis
  function calculateCorrelation(data) {
    if (!data || data.length < 2) {
      return {
        coefficient: 0,
        pValue: 1,
        significance: 'Insufficient data',
        interpretation: 'Need more data points'
      };
    }

    const volatilities = data.map(d => d.volatility || 0);
    const readiness = data.map(d => d.readinessScore || 0);

    const n = volatilities.length;
    const sumX = volatilities.reduce((a, b) => a + b, 0);
    const sumY = readiness.reduce((a, b) => a + b, 0);
    const sumXY = volatilities.reduce((sum, x, i) => sum + x * readiness[i], 0);
    const sumX2 = volatilities.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = readiness.reduce((sum, y) => sum + y * y, 0);

    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) {
      return {
        coefficient: 0,
        pValue: 1,
        significance: 'No variation',
        interpretation: 'No correlation (no variation in data)'
      };
    }

    const correlation = (n * sumXY - sumX * sumY) / denominator;

    // Calculate p-value (simplified)
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = 2 * (1 - normalCDF(Math.abs(t)));

    return {
      coefficient: correlation,
      pValue,
      significance: pValue < 0.05 ? 'Significant' : 'Not Significant',
      interpretation: getInterpretation(correlation)
    };
  }

  function getInterpretation(r) {
    const abs = Math.abs(r);
    const direction = r > 0 ? 'positive' : 'negative';

    if (abs < 0.1) return 'No correlation';
    if (abs < 0.3) return `Weak ${direction} correlation`;
    if (abs < 0.5) return `Moderate ${direction} correlation`;
    if (abs < 0.7) return `Strong ${direction} correlation`;
    return `Very strong ${direction} correlation`;
  }

  function prepareScatterData(data) {
    if (!data || data.length === 0) {
      return { datasets: [] };
    }

    return {
      datasets: [{
        label: 'Volatility vs Readiness',
        data: data.map(d => ({
          x: (d.volatility || 0) * 100,
          y: d.readinessScore || 0
        })),
        backgroundColor: data.map(d => {
          const vol = d.volatility || 0;
          const score = d.readinessScore || 0;
          if (score >= 80 && vol < 0.3) return 'rgba(34, 197, 94, 0.6)';  // Good
          if (score >= 80 && vol >= 0.3) return 'rgba(251, 146, 60, 0.6)'; // Risky
          if (score < 80 && vol < 0.3) return 'rgba(59, 130, 246, 0.6)';   // Improving
          return 'rgba(239, 68, 68, 0.6)'; // Problem
        }),
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  }

  // Step 54: Multi-Branch Volatility
  function calculateBranchVolatility(data, branches) {
    const result = {};

    branches.forEach(branch => {
      const branchData = data.filter(d => d.branch === branch);

      if (branchData.length === 0) {
        result[branch] = {
          raw: [],
          dates: [],
          smoothed: [],
          stats: { mean: 0, std: 0, trend: 0 }
        };
        return;
      }

      result[branch] = {
        raw: branchData.map(d => (d.volatility || 0) * 100),
        dates: branchData.map(d => new Date(d.date).toLocaleDateString()),
        smoothed: [],
        stats: {
          mean: 0,
          std: 0,
          trend: 0
        }
      };

      // Calculate smoothed data
      result[branch].smoothed = movingAverage(result[branch].raw, smoothingWindow);

      // Calculate statistics
      const mean = result[branch].raw.reduce((a, b) => a + b, 0) / result[branch].raw.length;
      const variance = result[branch].raw.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / result[branch].raw.length;
      const std = Math.sqrt(variance);

      // Calculate trend (linear regression slope)
      const n = result[branch].raw.length;
      const indices = Array.from({ length: n }, (_, i) => i);
      const sumX = indices.reduce((a, b) => a + b, 0);
      const sumY = result[branch].raw.reduce((a, b) => a + b, 0);
      const sumXY = indices.reduce((sum, x, i) => sum + x * result[branch].raw[i], 0);
      const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

      result[branch].stats = {
        mean: mean.toFixed(2),
        std: std.toFixed(2),
        trend: slope.toFixed(3)
      };
    });

    return result;
  }

  // Step 55: Smoothed Volatility Trends
  function movingAverage(data, window) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.ceil(window / 2));
      const subset = data.slice(start, end);
      const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
      result.push(avg);
    }

    return result;
  }

  function normalCDF(x) {
    // Approximation of normal CDF
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;

    const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t) * Math.exp(-x * x));

    return 0.5 * (1.0 + sign * y);
  }

  // Prepare line chart data for branch comparison
  function prepareBranchComparisonData() {
    const datasets = [];

    Object.entries(branchVolatility).forEach(([branch, data]) => {
      if (data.raw.length === 0) return;

      // Raw data
      datasets.push({
        label: `${branch} (raw)`,
        data: data.raw,
        borderColor: branch === 'main' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.1
      });

      // Smoothed data
      datasets.push({
        label: `${branch} (smoothed)`,
        data: data.smoothed,
        borderColor: branch === 'main' ? 'rgb(16, 185, 129)' : 'rgb(37, 99, 235)',
        backgroundColor: branch === 'main' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      });
    });

    const maxLength = Math.max(...Object.values(branchVolatility).map(b => b.dates.length));
    const labels = maxLength > 0 ? Object.values(branchVolatility)[0]?.dates || [] : [];

    return { labels, datasets };
  }

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Volatility vs Code Quality Correlation',
        color: 'rgb(156, 163, 175)'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'File Volatility (%)',
          color: 'rgb(156, 163, 175)'
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgb(55, 65, 81)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Readiness Score',
          color: 'rgb(156, 163, 175)'
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgb(55, 65, 81)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const multiLineOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      },
      title: {
        display: true,
        text: 'Branch Volatility Comparison',
        color: 'rgb(156, 163, 175)'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgb(55, 65, 81)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Volatility (%)',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgb(55, 65, 81)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const branchComparisonData = prepareBranchComparisonData();

  return (
    <div className="space-y-6">
      {/* Correlation Analysis */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Volatility Correlation Analysis</h3>

        {correlation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Correlation Coefficient</p>
              <p className="text-2xl font-bold text-white">{correlation.coefficient.toFixed(3)}</p>
              <p className="text-xs text-gray-500 mt-1">{correlation.interpretation}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Statistical Significance</p>
              <p className="text-2xl font-bold text-white">{correlation.significance}</p>
              <p className="text-xs text-gray-500 mt-1">p-value: {correlation.pValue.toFixed(4)}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Recommendation</p>
              <p className="text-sm text-white mt-2">
                {correlation.coefficient < -0.5
                  ? 'High volatility correlates with lower quality. Focus on stabilizing frequently changed files.'
                  : correlation.coefficient > 0.5
                  ? 'Volatility does not harm quality. Changes are well-managed.'
                  : 'No clear relationship between volatility and quality.'}
              </p>
            </div>
          </div>
        )}

        {correlationData && correlationData.datasets.length > 0 && (
          <Scatter data={correlationData} options={scatterOptions} />
        )}
      </div>

      {/* Branch Volatility Comparison */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Branch Volatility Trends</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Smoothing Window:</label>
            <select
              value={smoothingWindow}
              onChange={(e) => setSmoothingWindow(Number(e.target.value))}
              className="px-2 py-1 bg-gray-800 text-white border border-gray-700 rounded text-sm"
            >
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>

        {branchComparisonData.datasets.length > 0 && (
          <Line data={branchComparisonData} options={multiLineOptions} />
        )}

        {/* Branch Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Object.entries(branchVolatility).map(([branch, data]) => (
            <div key={branch} className="bg-gray-800 p-4 rounded">
              <h4 className="font-semibold text-white mb-2">{branch} Branch</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mean Volatility:</span>
                  <span className="text-white">{data.stats.mean}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Std Deviation:</span>
                  <span className="text-white">{data.stats.std}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trend:</span>
                  <span className={`font-semibold ${
                    parseFloat(data.stats.trend) > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {parseFloat(data.stats.trend) > 0 ? '📈 Increasing' : '📉 Decreasing'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h4 className="text-sm font-semibold text-white mb-2">Quadrant Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
            <span className="text-gray-400">Low Volatility, High Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 opacity-60"></div>
            <span className="text-gray-400">High Volatility, High Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></div>
            <span className="text-gray-400">Low Volatility, Low Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-60"></div>
            <span className="text-gray-400">High Volatility, Low Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolatilityCorrelation;