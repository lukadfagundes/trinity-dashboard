import { useState } from 'react';
import HealthCard from './Cards/HealthCard';
import TestResultsCard from './Cards/TestResultsCard';
import CoverageCard from './Cards/CoverageCard';
import SecurityCard from './Cards/SecurityCard';
import CoverageTrend from './Charts/CoverageTrend';
import TestResults from './Charts/TestResults';
import SecurityChart from './Charts/SecurityChart';

const ProjectSection = ({ data }) => {
  const [expanded, setExpanded] = useState(true);

  if (!data) return null;

  const { repo, runs, stats, metrics, health, error } = data;
  const latestRun = runs?.[0];

  const getHealthIcon = () => {
    if (error) return '❌';
    if (!health) return '❓';
    switch (health.level) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '📊';
    }
  };

  const getHealthColor = () => {
    if (error) return 'text-red-500';
    if (!health) return 'text-gray-500';
    switch (health.level) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="mb-8 border-b border-gray-800 pb-8">
      <div
        className="flex items-center justify-between mb-6 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white group-hover:text-trinity-blue transition-colors">
            {repo}
          </h2>
          <span className={`text-2xl ${getHealthColor()}`}>{getHealthIcon()}</span>
          {health && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              health.level === 'healthy' ? 'bg-green-900/50 text-green-400' :
              health.level === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-red-900/50 text-red-400'
            }`}>
              {health.score}% Health
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {stats && (
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{stats.stars || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
                <span>{stats.language}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>{stats.branches || 0} branches</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>{stats.openPRs || 0} open PRs</span>
              </span>
            </div>
          )}

          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-4">
          <p className="text-red-400">
            <span className="font-medium">Error loading repository data:</span> {error}
          </p>
        </div>
      )}

      {expanded && !error && (
        <div className="space-y-6 animate-fadeIn">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <HealthCard project={repo} metrics={metrics} />
              <TestResultsCard metrics={metrics} />
              <CoverageCard metrics={metrics} history={runs || []} />
              <SecurityCard metrics={metrics} />
            </div>
          )}

          {runs && runs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CoverageTrend runs={runs} />
              <TestResults runs={runs.slice(0, 5)} />
            </div>
          )}

          {latestRun && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SecurityChart metrics={latestRun.metrics} />
              </div>

              <div className="lg:col-span-2">
                <div className="metric-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
                  <div className="space-y-2">
                    {runs.slice(0, 5).map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            run.status === 'success' ? 'bg-green-500' :
                            run.status === 'failed' ? 'bg-red-500' :
                            run.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                            'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {run.workflowName || run.id}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {run.branch} • {run.commit} • {run.actor}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-sm">
                            {run.metrics?.coverage?.overall?.toFixed(1) || 0}% coverage
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(run.timestamp).toLocaleTimeString()}
                          </p>
                          {run.duration && (
                            <p className="text-gray-500 text-xs">
                              Duration: {run.duration}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!runs || runs.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-gray-400">No workflow runs found for this repository</p>
              <p className="text-gray-500 text-sm mt-2">
                Make sure GitHub Actions are enabled and have run at least once
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSection;