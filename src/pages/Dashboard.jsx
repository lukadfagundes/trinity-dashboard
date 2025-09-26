import { useState, useMemo } from 'react'
import { useGitHub } from '../contexts/GitHubContext'
import DashboardLayout from '../components/Layout/DashboardLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'
import RateLimitIndicator from '../components/RateLimitIndicator'
import ProjectSection from '../components/ProjectSection'

const Dashboard = () => {
  const { data, loading, error, lastUpdate, refresh, refreshing } = useGitHub();
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Extract unique branches from all repositories
  const availableBranches = useMemo(() => {
    if (!data || data.length === 0) return [];

    const branches = new Set(['all']);
    data.forEach(repo => {
      if (repo.runs && Array.isArray(repo.runs)) {
        repo.runs.forEach(run => {
          if (run.head_branch) {
            branches.add(run.head_branch);
          }
        });
      }
    });

    return Array.from(branches);
  }, [data]);

  // Filter data by selected branch
  const filteredData = useMemo(() => {
    if (!data || selectedBranch === 'all') return data;

    return data.map(repo => ({
      ...repo,
      runs: repo.runs?.filter(run => run.head_branch === selectedBranch) || []
    })).filter(repo => repo.runs && repo.runs.length > 0);
  }, [data, selectedBranch]);

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error && (!data || data.length === 0)) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Trinity DevOps Dashboard</h2>
              <p className="text-gray-400">
                Real-time monitoring and analytics for Trinity Method projects
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {availableBranches.length > 1 && (
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-trinity-blue focus:outline-none"
                >
                  {availableBranches.map(branch => (
                    <option key={branch} value={branch}>
                      {branch === 'all' ? 'All Branches' : branch}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={refresh}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  refreshing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-trinity-blue text-white hover:bg-blue-600'
                }`}
              >
                {refreshing ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Refreshing...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </span>
                )}
              </button>

              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  <span>Last updated: </span>
                  <span className="font-medium">
                    {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && data && data.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
            <p className="text-yellow-400">
              <span className="font-medium">Warning:</span> {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {filteredData && filteredData.length > 0 ? (
              <div className="space-y-6">
                {filteredData.map((repoData) => (
                  <ProjectSection key={repoData.repo} data={repoData} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Data Available
                </h3>
                <p className="text-gray-400 mb-4">
                  Configure your GitHub token and repositories to start monitoring
                </p>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-trinity-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Get GitHub Token
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <RateLimitIndicator />

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Repositories</span>
                  <span className="text-white font-medium">{data?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Runs</span>
                  <span className="text-white font-medium">
                    {data?.reduce((sum, repo) => sum + (repo.runs?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Healthy Projects</span>
                  <span className="text-green-400 font-medium">
                    {data?.filter(repo => repo.health?.level === 'healthy').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Warnings</span>
                  <span className="text-yellow-400 font-medium">
                    {data?.filter(repo => repo.health?.level === 'warning').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Critical</span>
                  <span className="text-red-400 font-medium">
                    {data?.filter(repo => repo.health?.level === 'critical').length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-3">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Owner: </span>
                  <span className="text-white">
                    {import.meta.env.VITE_GITHUB_OWNER || 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Repositories: </span>
                  <div className="mt-1">
                    {import.meta.env.VITE_GITHUB_REPOS ? (
                      import.meta.env.VITE_GITHUB_REPOS.split(',').map(repo => (
                        <span
                          key={repo}
                          className="inline-block px-2 py-1 mr-1 mb-1 bg-gray-800 text-white text-xs rounded"
                        >
                          {repo.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Not configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
              <div className="space-y-2">
                <a
                  href="https://docs.github.com/en/rest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-trinity-blue hover:text-trinity-green transition-colors"
                >
                  GitHub API Documentation →
                </a>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-trinity-blue hover:text-trinity-green transition-colors"
                >
                  Manage GitHub Tokens →
                </a>
                <a
                  href="https://github.com/trinity-method/trinity-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-trinity-blue hover:text-trinity-green transition-colors"
                >
                  Dashboard Repository →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;