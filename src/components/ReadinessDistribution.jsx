import { useState, useEffect } from 'react';
import { HistoryService } from '../services/historyService';
import { ReadinessScorer } from '../services/readinessScoring';

/**
 * Readiness Distribution Component
 * Shows distribution of PR readiness scores
 */

export function ReadinessDistribution({ repository = 'trinity-dashboard' }) {
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prCount, setPrCount] = useState(100);

  useEffect(() => {
    async function fetchDistribution() {
      try {
        setLoading(true);
        const history = await HistoryService.fetchHistory(repository);

        // Filter to PR branches
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

        // Calculate readiness scores for PRs
        const prs = prHistory.slice(0, prCount).map(entry => ({
          branch: entry.branch,
          timestamp: entry.timestamp,
          readinessScore: ReadinessScorer.calculateScore(entry, mainData)
        }));

        // Create distribution bins
        const bins = {
          '0-60': { count: 0, label: '0-60%', color: 'bg-red-500' },
          '60-70': { count: 0, label: '60-70%', color: 'bg-orange-500' },
          '70-80': { count: 0, label: '70-80%', color: 'bg-yellow-500' },
          '80-90': { count: 0, label: '80-90%', color: 'bg-lime-500' },
          '90-100': { count: 0, label: '90-100%', color: 'bg-green-500' }
        };

        // Populate bins
        prs.forEach(pr => {
          const score = pr.readinessScore;
          if (score < 60) bins['0-60'].count++;
          else if (score < 70) bins['60-70'].count++;
          else if (score < 80) bins['70-80'].count++;
          else if (score < 90) bins['80-90'].count++;
          else bins['90-100'].count++;
        });

        // Calculate statistics
        const stats = calculateStatistics(prs);

        setDistribution({
          bins,
          prs,
          stats
        });
      } catch (error) {
        console.error('Error fetching distribution:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDistribution();
  }, [repository, prCount]);

  function calculateStatistics(prs) {
    if (prs.length === 0) {
      return {
        total: 0,
        passing: 0,
        failing: 0,
        average: 0,
        median: 0
      };
    }

    const scores = prs.map(pr => pr.readinessScore);
    const sortedScores = [...scores].sort((a, b) => a - b);

    return {
      total: prs.length,
      passing: scores.filter(s => s >= 80).length,
      failing: scores.filter(s => s < 80).length,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      median: sortedScores[Math.floor(sortedScores.length / 2)]
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

  if (!distribution || distribution.prs.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">PR Readiness Distribution</h3>
        <div className="text-center py-12 text-gray-500">
          No PR data available for distribution analysis
        </div>
      </div>
    );
  }

  const { bins, stats } = distribution;
  const maxCount = Math.max(...Object.values(bins).map(b => b.count));

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">PR Readiness Distribution</h3>
        <select
          value={prCount}
          onChange={(e) => setPrCount(parseInt(e.target.value))}
          className="px-3 py-1 bg-gray-800 text-white border border-gray-700 rounded text-sm"
        >
          <option value={50}>Last 50 PRs</option>
          <option value={100}>Last 100 PRs</option>
          <option value={200}>Last 200 PRs</option>
          <option value={500}>Last 500 PRs</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Total PRs</div>
          <div className="text-xl font-bold text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Passing</div>
          <div className="text-xl font-bold text-green-400">
            {stats.passing}
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Failing</div>
          <div className="text-xl font-bold text-red-400">
            {stats.failing}
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Average</div>
          <div className={`text-xl font-bold ${
            stats.average >= 80 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {stats.average.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400">Median</div>
          <div className={`text-xl font-bold ${
            stats.median >= 80 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {stats.median}%
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-800 rounded p-4">
        <div className="flex items-end justify-between h-48 mb-2">
          {Object.entries(bins).map(([range, data]) => (
            <div key={range} className="flex-1 flex flex-col items-center mx-1">
              <div className="w-full relative">
                {data.count > 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm text-white font-medium">
                    {data.count}
                  </div>
                )}
                <div
                  className={`${data.color} rounded-t transition-all`}
                  style={{
                    height: maxCount > 0 ? `${(data.count / maxCount) * 12}rem` : '1rem',
                    minHeight: data.count > 0 ? '0.5rem' : '0'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          {Object.entries(bins).map(([range, data]) => (
            <div key={range} className="flex-1 text-center mx-1">
              <div className="text-xs text-gray-400">{data.label}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? `${((data.count / stats.total) * 100).toFixed(0)}%` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pass/Fail Ratio */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Pass/Fail Ratio</h4>
        <div className="flex h-8 rounded overflow-hidden">
          {stats.passing > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${(stats.passing / stats.total) * 100}%` }}
            >
              {((stats.passing / stats.total) * 100).toFixed(0)}%
            </div>
          )}
          {stats.failing > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${(stats.failing / stats.total) * 100}%` }}
            >
              {((stats.failing / stats.total) * 100).toFixed(0)}%
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Passing (≥80%): {stats.passing}</span>
          <span>Failing (<80%): {stats.failing}</span>
        </div>
      </div>

      {/* Quality Insights */}
      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h4 className="text-sm font-medium text-white mb-2">Quality Insights</h4>
        <div className="space-y-2 text-sm">
          {stats.average >= 80 ? (
            <div className="flex items-center text-green-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Average score meets quality threshold
            </div>
          ) : (
            <div className="flex items-center text-yellow-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Average score below quality threshold
            </div>
          )}

          {bins['90-100'].count > bins['0-60'].count ? (
            <div className="flex items-center text-blue-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              More high-quality PRs than low-quality
            </div>
          ) : bins['0-60'].count > 0 && (
            <div className="flex items-center text-orange-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              {bins['0-60'].count} PRs need significant improvement
            </div>
          )}
        </div>
      </div>
    </div>
  );
}