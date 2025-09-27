import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { TrendingUp, Users, GitPullRequest, AlertCircle, Code, Activity, Calendar } from 'lucide-react';
import githubApi from '../services/githubApi';
import { config } from '../services/config';
import { theme } from '../config/theme';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    commitActivity: [],
    contributors: [],
    languages: {},
    pullRequests: { open: 0, closed: 0, merged: 0 },
    issues: { open: 0, closed: 0 },
    codeFrequency: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const owner = import.meta.env.VITE_GITHUB_OWNER;
      const repos = import.meta.env.VITE_GITHUB_REPOS?.split(',') || [];

      if (repos.length === 0) {
        throw new Error('No repositories configured');
      }

      // Fetch data for the first repository as primary
      const primaryRepo = repos[0].trim();

      // Fetch commit activity
      const commitActivityResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/stats/commit_activity`
      );

      // Fetch contributors
      const contributorsResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/contributors?per_page=${config.getMaxContributors()}`
      );

      // Fetch languages
      const languagesResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/languages`
      );

      // Fetch pull requests
      const pullsOpenResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/pulls?state=open&per_page=${config.getApiPageSize()}`
      );
      const pullsClosedResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/pulls?state=closed&per_page=${config.getApiPageSize()}`
      );

      // Fetch issues
      const issuesOpenResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/issues?state=open&per_page=${config.getApiPageSize()}`
      );
      const issuesClosedResponse = await githubApi.get(
        `/repos/${owner}/${primaryRepo}/issues?state=closed&per_page=${config.getApiPageSize()}`
      );

      setAnalyticsData({
        commitActivity: commitActivityResponse.data || [],
        contributors: contributorsResponse.data || [],
        languages: languagesResponse.data || {},
        pullRequests: {
          open: pullsOpenResponse.data?.length || 0,
          closed: pullsClosedResponse.data?.filter(pr => !pr.merged_at).length || 0,
          merged: pullsClosedResponse.data?.filter(pr => pr.merged_at).length || 0
        },
        issues: {
          open: issuesOpenResponse.data?.filter(issue => !issue.pull_request).length || 0,
          closed: issuesClosedResponse.data?.filter(issue => !issue.pull_request).length || 0
        },
        codeFrequency: []
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const prepareCommitChartData = () => {
    const weeks = analyticsData.commitActivity.slice(-12); // Last 12 weeks

    return {
      labels: weeks.map((week) => {
        if (week && week.week) {
          const date = new Date(week.week * 1000);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return 'N/A';
      }),
      datasets: [
        {
          label: 'Commits',
          data: weeks.map(week => week?.total || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const prepareLanguageChartData = () => {
    const languages = Object.entries(analyticsData.languages).slice(0, 5);
    const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);

    return {
      labels: languages.map(([lang]) => lang),
      datasets: [
        {
          data: languages.map(([, bytes]) => ((bytes / total) * 100).toFixed(1)),
          backgroundColor: theme.charts.colors.primary,
          borderWidth: 0
        }
      ]
    };
  };

  const preparePRChartData = () => {
    return {
      labels: ['Open', 'Closed', 'Merged'],
      datasets: [
        {
          label: 'Pull Requests',
          data: [
            analyticsData.pullRequests.open,
            analyticsData.pullRequests.closed,
            analyticsData.pullRequests.merged
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ]
        }
      ]
    };
  };

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
        <ErrorDisplay error={error} onRetry={fetchAnalyticsData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
              <p className="text-gray-400">
                Repository insights and performance metrics
              </p>
            </div>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-trinity-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Contributors</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {analyticsData.contributors.length}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Open PRs</span>
              <GitPullRequest className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {analyticsData.pullRequests.open}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Open Issues</span>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {analyticsData.issues.open}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Languages</span>
              <Code className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.keys(analyticsData.languages).length}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commit Activity */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Commit Activity (Last 12 Weeks)
            </h3>
            {analyticsData.commitActivity.length > 0 ? (
              <Line
                data={prepareCommitChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">No commit data available</p>
            )}
          </div>

          {/* Language Distribution */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-purple-400" />
              Language Distribution
            </h3>
            {Object.keys(analyticsData.languages).length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={prepareLanguageChartData()}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No language data available</p>
            )}
          </div>

          {/* Pull Request Status */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <GitPullRequest className="w-5 h-5 mr-2 text-green-400" />
              Pull Request Status
            </h3>
            <Bar
              data={preparePRChartData()}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>

          {/* Top Contributors */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Top Contributors
            </h3>
            <div className="space-y-3">
              {analyticsData.contributors.slice(0, 5).map((contributor, index) => (
                <div key={contributor.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <a
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-trinity-blue transition-colors"
                    >
                      {contributor.login}
                    </a>
                  </div>
                  <span className="text-trinity-green font-medium">
                    {contributor.contributions} commits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issues and PRs Summary */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Issues & Pull Requests Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{analyticsData.pullRequests.open}</p>
              <p className="text-sm text-gray-400">Open PRs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{analyticsData.pullRequests.merged}</p>
              <p className="text-sm text-gray-400">Merged PRs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{analyticsData.pullRequests.closed}</p>
              <p className="text-sm text-gray-400">Closed PRs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{analyticsData.issues.open}</p>
              <p className="text-sm text-gray-400">Open Issues</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{analyticsData.issues.closed}</p>
              <p className="text-sm text-gray-400">Closed Issues</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;