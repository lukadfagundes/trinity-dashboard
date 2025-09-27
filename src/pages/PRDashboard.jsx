import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HistoryService } from '../services/historyService';
import { ReadinessScorer } from '../services/readinessScoring';
import { config } from '../services/config';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Readiness Score Component
function ReadinessScore({ score }) {
  const readiness = ReadinessScorer.getReadinessLevel(score);

  const colorClasses = {
    green: 'bg-green-500 text-white',
    lime: 'bg-lime-500 text-white',
    yellow: 'bg-yellow-500 text-black',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white'
  };

  const levelLabels = {
    excellent: 'Excellent',
    good: 'Good',
    acceptable: 'Acceptable',
    'needs-work': 'Needs Work',
    'not-ready': 'Not Ready'
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4">Merge Readiness</h2>

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(score / 100) * 352} 352`}
                className={`text-${readiness.color}-500`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{score}%</div>
                <div className={`text-sm ${colorClasses[readiness.color]} px-2 py-1 rounded mt-1`}>
                  {levelLabels[readiness.level]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Threshold</span>
          <span className="text-white">{config.getReadinessThreshold()}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className={score >= config.getReadinessThreshold() ? 'text-green-400' : 'text-red-400'}>
            {score >= config.getReadinessThreshold() ? 'Ready to Merge' : 'Not Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Metrics Card Component
function MetricsCard({ title, data }) {
  if (!data) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Coverage</span>
            <span className="text-sm font-medium text-white">
              {data.coverage?.overall?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.coverage?.overall >= 80 ? 'bg-green-500' :
                data.coverage?.overall >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${data.coverage?.overall || 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Test Pass Rate</span>
            <span className="text-sm font-medium text-white">
              {data.tests && data.tests.total > 0
                ? `${((data.tests.passed / data.tests.total) * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: data.tests && data.tests.total > 0
                  ? `${(data.tests.passed / data.tests.total) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Security Score</span>
            <span className="text-sm font-medium text-white">
              {data.security?.score || 0}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.security?.score >= 80 ? 'bg-green-500' :
                data.security?.score >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${data.security?.score || 0}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Tests:</span>{' '}
              <span className="text-white">
                {data.tests?.passed || 0}/{data.tests?.total || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Build:</span>{' '}
              <span className={data.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                {data.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// File Changes List Component
function FileChangesList({ files }) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">
        Changed Files ({files.length})
      </h3>

      <div className="space-y-2 max-h-64 overflow-auto">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <span className="font-mono text-sm text-gray-300 truncate flex-1">
              {file.filename || file.path}
            </span>
            <div className="flex items-center space-x-2 ml-2">
              {file.additions > 0 && (
                <span className="text-green-400 text-sm">+{file.additions}</span>
              )}
              {file.deletions > 0 && (
                <span className="text-red-400 text-sm">-{file.deletions}</span>
              )}
              <span className={`px-2 py-1 text-xs rounded ${
                file.status === 'added' ? 'bg-green-900 text-green-300' :
                file.status === 'deleted' ? 'bg-red-900 text-red-300' :
                file.status === 'modified' ? 'bg-yellow-900 text-yellow-300' :
                'bg-gray-700 text-gray-300'
              }`}>
                {file.status || 'modified'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main PRDashboard Component
export function PRDashboard() {
  const { prNumber } = useParams();
  const [prData, setPRData] = useState(null);
  const [mainData, setMainData] = useState(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch PR data - in a real implementation, this would fetch from GitHub API
        // For now, we'll simulate with history data
        const history = await HistoryService.fetchHistory('trinity-dashboard');

        // Find the latest data for this PR's branch (simulated)
        const prBranchData = history.find(entry =>
          entry.branch && entry.branch !== 'main' && entry.branch !== 'master'
        ) || history[0];

        // Find main branch data
        const mainBranchData = history.find(entry =>
          entry.branch === 'main' || entry.branch === 'master'
        ) || history[history.length - 1];

        if (prBranchData) {
          setPRData({
            ...prBranchData,
            title: `Pull Request #${prNumber}`,
            prNumber: prNumber
          });
        }

        if (mainBranchData) {
          setMainData(mainBranchData);
        }

        // Calculate readiness score
        if (prBranchData && mainBranchData) {
          const score = ReadinessScorer.calculateScore(prBranchData, mainBranchData);
          setReadinessScore(score);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching PR data:', err);
        setError('Failed to load PR data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [prNumber]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-2">Error Loading PR Dashboard</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                PR #{prNumber}: {prData?.title || 'Loading...'}
              </h1>
              <p className="text-gray-400 mt-1">
                Branch: {prData?.branch || 'unknown'} → main
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Author</div>
              <div className="text-white">{prData?.actor || 'Unknown'}</div>
            </div>
          </div>
        </div>

        {/* Readiness and Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ReadinessScore score={readinessScore} />
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricsCard title="This PR" data={prData} />
              <MetricsCard title="Main Branch" data={mainData} />
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coverage Details */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Lines</div>
                <div className="text-2xl font-bold text-white">
                  {prData?.coverage?.lines?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Statements</div>
                <div className="text-2xl font-bold text-white">
                  {prData?.coverage?.statements?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Functions</div>
                <div className="text-2xl font-bold text-white">
                  {prData?.coverage?.functions?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Branches</div>
                <div className="text-2xl font-bold text-white">
                  {prData?.coverage?.branches?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Security Analysis */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Security Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Critical</div>
                <div className={`text-2xl font-bold ${
                  prData?.security?.critical > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {prData?.security?.critical || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">High</div>
                <div className={`text-2xl font-bold ${
                  prData?.security?.high > 0 ? 'text-orange-500' : 'text-green-500'
                }`}>
                  {prData?.security?.high || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Medium</div>
                <div className={`text-2xl font-bold ${
                  prData?.security?.medium > 0 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {prData?.security?.medium || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Low</div>
                <div className="text-2xl font-bold text-blue-500">
                  {prData?.security?.low || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Changes */}
        {prData?.files && <FileChangesList files={prData.files} />}

        {/* Actions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Actions</h3>
              <p className="text-sm text-gray-400 mt-1">
                {readinessScore >= 80
                  ? 'This PR meets all quality requirements'
                  : `This PR needs improvements (score: ${readinessScore}%)`}
              </p>
            </div>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition">
                View on GitHub
              </button>
              <button
                className={`px-4 py-2 rounded transition ${
                  readinessScore >= 80
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={readinessScore < 80}
              >
                {readinessScore >= 80 ? 'Approve Merge' : 'Not Ready to Merge'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PRDashboard;