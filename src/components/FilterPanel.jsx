import { useState, useEffect } from 'react';

export default function FilterPanel({ onFilterChange, availableRepos = [], availableBranches = [] }) {
  const [filters, setFilters] = useState({
    dateRange: 'last7days',
    branches: ['main', 'dev'],
    status: 'all',
    minCoverage: 0,
    repositories: [],
    showFailedOnly: false
  });

  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleBranch = (branch) => {
    setFilters(prev => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter(b => b !== branch)
        : [...prev.branches, branch]
    }));
  };

  const toggleRepository = (repo) => {
    setFilters(prev => ({
      ...prev,
      repositories: prev.repositories.includes(repo)
        ? prev.repositories.filter(r => r !== repo)
        : [...prev.repositories, repo]
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'last7days',
      branches: ['main', 'dev'],
      status: 'all',
      minCoverage: 0,
      repositories: [],
      showFailedOnly: false
    });
  };

  return (
    <div className="bg-white dark:bg-trinity-dark-card p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="last24h">Last 24 Hours</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {filters.dateRange === 'custom' && (
            <div className="mt-2 space-y-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Branches
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {['main', 'master', 'dev', 'develop', 'staging', 'production', ...availableBranches]
              .filter((branch, index, self) => self.indexOf(branch) === index)
              .map(branch => (
                <label key={branch} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.branches.includes(branch)}
                    onChange={() => toggleBranch(branch)}
                    className="mr-2 rounded border-gray-300 text-trinity-blue focus:ring-trinity-blue"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{branch}</span>
                </label>
              ))}
          </div>
        </div>

        {availableRepos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repositories
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableRepos.map(repo => (
                <label key={repo} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.repositories.length === 0 || filters.repositories.includes(repo)}
                    onChange={() => toggleRepository(repo)}
                    className="mr-2 rounded border-gray-300 text-trinity-blue focus:ring-trinity-blue"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{repo}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Build Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
            <option value="running">Running</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Coverage: {filters.minCoverage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minCoverage}
            onChange={(e) => updateFilter('minCoverage', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showFailedOnly}
              onChange={(e) => updateFilter('showFailedOnly', e.target.checked)}
              className="mr-2 rounded border-gray-300 text-trinity-blue focus:ring-trinity-blue"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Failed Runs Only</span>
          </label>
        </div>

        <button
          onClick={() => onFilterChange(filters)}
          className="w-full bg-trinity-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}