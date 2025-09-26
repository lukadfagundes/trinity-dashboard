import { useState, useEffect } from 'react';
import { HistoryService } from '../services/historyService';

// Metric row component
function MetricRow({ label, value, comparisonValue, inverse = false }) {
  const delta = value - comparisonValue;
  const deltaPercent = comparisonValue > 0 ? ((delta / comparisonValue) * 100) : 0;

  const isPositive = inverse ? delta < 0 : delta > 0;
  const colorClass = isPositive ? 'text-green-600' : delta !== 0 ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-semibold">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {label.includes('%') || label.includes('Score') ? '%' : ''}
        </span>
        {comparisonValue !== undefined && delta !== 0 && (
          <span className={`text-xs ${colorClass}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(deltaPercent).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Branch card component
function BranchCard({ branch, metrics, isMain = false }) {
  const bgColor = isMain ? 'bg-blue-50 border-blue-200' : 'bg-gray-50';
  const headerColor = isMain ? 'bg-blue-100' : 'bg-gray-100';

  return (
    <div className={`border rounded-lg overflow-hidden ${bgColor}`}>
      <div className={`px-4 py-3 ${headerColor}`}>
        <h3 className="text-lg font-bold">
          {branch}
          {isMain && <span className="ml-2 text-sm font-normal text-blue-600">(Main)</span>}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Last updated: {new Date(metrics.lastUpdate).toLocaleString()}
        </p>
      </div>

      <div className="p-4 space-y-1">
        <MetricRow
          label="Coverage"
          value={metrics.coverage}
          comparisonValue={isMain ? undefined : metrics.mainCoverage}
        />
        <MetricRow
          label="Test Pass Rate"
          value={metrics.testPassRate}
          comparisonValue={isMain ? undefined : metrics.mainTestPassRate}
        />
        <MetricRow
          label="Security Score"
          value={metrics.securityScore}
          comparisonValue={isMain ? undefined : metrics.mainSecurityScore}
        />
        <MetricRow
          label="Health Score"
          value={metrics.healthScore}
          comparisonValue={isMain ? undefined : metrics.mainHealthScore}
        />
        <div className="pt-2 mt-2 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Runs</span>
            <span className="font-medium">{metrics.totalRuns}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comparison chart component
function ComparisonChart({ branches, metrics }) {
  const maxValue = Math.max(
    ...Object.values(metrics).flatMap(m => [
      m.coverage || 0,
      m.testPassRate || 0,
      m.securityScore || 0,
      m.healthScore || 0
    ])
  );

  const metricTypes = [
    { key: 'coverage', label: 'Coverage', color: 'bg-blue-500' },
    { key: 'testPassRate', label: 'Test Pass Rate', color: 'bg-green-500' },
    { key: 'securityScore', label: 'Security Score', color: 'bg-purple-500' },
    { key: 'healthScore', label: 'Health Score', color: 'bg-orange-500' }
  ];

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Visual Comparison</h3>

      <div className="space-y-6">
        {metricTypes.map(({ key, label, color }) => (
          <div key={key}>
            <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
            <div className="space-y-2">
              {branches.map(branch => {
                const value = metrics[branch]?.[key] || 0;
                const width = maxValue > 0 ? (value / maxValue) * 100 : 0;

                return (
                  <div key={branch} className="flex items-center">
                    <span className="w-20 text-sm text-gray-600">{branch}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 ml-2 relative">
                      <div
                        className={`${color} rounded-full h-6 flex items-center justify-end pr-2`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {value.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main BranchComparison component
export function BranchComparison({
  branches = ['main', 'dev'],
  repository = 'trinity-dashboard'
}) {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBranchMetrics() {
      try {
        setLoading(true);
        const history = await HistoryService.fetchHistory(repository);
        const comparison = HistoryService.getBranchComparison(history);

        // Add main branch metrics to other branches for comparison
        const mainMetrics = comparison['main'] || comparison[branches[0]];

        const enrichedMetrics = {};
        branches.forEach(branch => {
          enrichedMetrics[branch] = {
            ...(comparison[branch] || {
              coverage: 0,
              testPassRate: 0,
              securityScore: 0,
              healthScore: 0,
              lastUpdate: new Date().toISOString(),
              totalRuns: 0
            })
          };

          // Add main branch values for comparison
          if (branch !== 'main' && mainMetrics) {
            enrichedMetrics[branch].mainCoverage = mainMetrics.coverage;
            enrichedMetrics[branch].mainTestPassRate = mainMetrics.testPassRate;
            enrichedMetrics[branch].mainSecurityScore = mainMetrics.securityScore;
            enrichedMetrics[branch].mainHealthScore = mainMetrics.healthScore;
          }
        });

        setMetrics(enrichedMetrics);
        setError(null);
      } catch (err) {
        console.error('Error fetching branch metrics:', err);
        setError('Failed to load branch comparison data');
      } finally {
        setLoading(false);
      }
    }

    fetchBranchMetrics();
  }, [branches, repository]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Error loading branch comparison</div>
        <div className="text-gray-600 text-sm">{error}</div>
      </div>
    );
  }

  const calculateDelta = (baseBranch, targetBranch, metric) => {
    const baseValue = metrics[baseBranch]?.[metric] || 0;
    const targetValue = metrics[targetBranch]?.[metric] || 0;
    return targetValue - baseValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Branch Comparison</h2>
        <div className="text-sm text-gray-600">
          Comparing {branches.length} branches
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <BranchCard
            key={branch}
            branch={branch}
            metrics={metrics[branch] || {}}
            isMain={branch === 'main'}
          />
        ))}
      </div>

      {/* Visual Comparison Chart */}
      <ComparisonChart branches={branches} metrics={metrics} />

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {branches.map(branch => {
            const branchMetrics = metrics[branch] || {};
            const avgScore = (
              (branchMetrics.coverage || 0) +
              (branchMetrics.testPassRate || 0) +
              (branchMetrics.securityScore || 0) +
              (branchMetrics.healthScore || 0)
            ) / 4;

            return (
              <div key={branch} className="text-center">
                <div className="text-gray-600">{branch}</div>
                <div className="text-2xl font-bold mt-1">
                  {avgScore.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}