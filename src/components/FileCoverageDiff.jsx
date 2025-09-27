import { useState, useEffect } from 'react';
import { config } from '../services/config';

/**
 * File Coverage Diff Component
 * Shows file-level coverage changes between PR and main branch
 */

export function FileCoverageDiff({ prNumber, prCoverage, mainCoverage }) {
  const [files, setFiles] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, improved, decreased, new
  const [sortBy, setSortBy] = useState('delta'); // name, coverage, delta

  useEffect(() => {
    if (!prCoverage || !mainCoverage) return;

    // Create a map of main branch coverage
    const mainFiles = {};
    if (mainCoverage.files) {
      mainCoverage.files.forEach(file => {
        mainFiles[file.name || file.path] = file.coverage || file.percentage || 0;
      });
    }

    // Calculate diffs for each file
    const filesWithDiff = [];

    if (prCoverage.files) {
      prCoverage.files.forEach(file => {
        const filePath = file.name || file.path;
        const prCov = file.coverage || file.percentage || 0;
        const mainCov = mainFiles[filePath] || 0;

        filesWithDiff.push({
          path: filePath,
          coverageBefore: mainCov,
          coverageAfter: prCov,
          delta: prCov - mainCov,
          isNew: !mainFiles.hasOwnProperty(filePath)
        });
      });
    }

    // Add files that were in main but not in PR (potentially deleted)
    Object.keys(mainFiles).forEach(filePath => {
      const existsInPR = filesWithDiff.some(f => f.path === filePath);
      if (!existsInPR) {
        filesWithDiff.push({
          path: filePath,
          coverageBefore: mainFiles[filePath],
          coverageAfter: 0,
          delta: -mainFiles[filePath],
          isDeleted: true
        });
      }
    });

    setFiles(filesWithDiff);
  }, [prCoverage, mainCoverage]);

  const filteredFiles = files.filter(file => {
    switch (filterType) {
      case 'improved':
        return file.delta > 0;
      case 'decreased':
        return file.delta < 0 && !file.isDeleted;
      case 'new':
        return file.isNew;
      default:
        return true;
    }
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.path.localeCompare(b.path);
      case 'coverage':
        return b.coverageAfter - a.coverageAfter;
      case 'delta':
      default:
        return Math.abs(b.delta) - Math.abs(a.delta);
    }
  });

  const stats = {
    total: files.length,
    improved: files.filter(f => f.delta > 0).length,
    decreased: files.filter(f => f.delta < 0 && !f.isDeleted).length,
    newFiles: files.filter(f => f.isNew).length,
    averageDelta: files.length > 0
      ? files.reduce((sum, f) => sum + f.delta, 0) / files.length
      : 0
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">File Coverage Changes</h3>
        <div className="flex items-center space-x-2">
          {/* Filter Buttons */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'improved', label: 'Improved', color: 'text-green-400' },
              { value: 'decreased', label: 'Decreased', color: 'text-red-400' },
              { value: 'new', label: 'New', color: 'text-blue-400' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`px-3 py-1 rounded text-sm transition ${
                  filterType === filter.value
                    ? 'bg-gray-700 text-white'
                    : `text-gray-400 hover:text-white ${filter.color || ''}`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 bg-gray-800 text-white border border-gray-700 rounded text-sm"
          >
            <option value="delta">Sort by Change</option>
            <option value="coverage">Sort by Coverage</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 rounded p-3">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Files</div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-2xl font-bold text-green-400">{stats.improved}</div>
          <div className="text-xs text-gray-400">Improved</div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-2xl font-bold text-red-400">{stats.decreased}</div>
          <div className="text-xs text-gray-400">Decreased</div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className={`text-2xl font-bold ${
            stats.averageDelta >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.averageDelta >= 0 ? '+' : ''}{stats.averageDelta.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Avg Change</div>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2 max-h-96 overflow-auto">
        {sortedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files match the selected filter
          </div>
        ) : (
          sortedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
            >
              {/* File Path */}
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center">
                  <span className="font-mono text-sm text-gray-300 truncate">
                    {file.path}
                  </span>
                  {file.isNew && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded">
                      NEW
                    </span>
                  )}
                  {file.isDeleted && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-900 text-red-300 rounded">
                      DELETED
                    </span>
                  )}
                </div>
              </div>

              {/* Coverage Change Visualization */}
              <div className="flex items-center space-x-4">
                {/* Before Coverage */}
                <div className="text-right">
                  <div className="text-xs text-gray-500">Before</div>
                  <div className="text-sm text-gray-400">
                    {file.coverageBefore.toFixed(1)}%
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* After Coverage */}
                <div className="text-right">
                  <div className="text-xs text-gray-500">After</div>
                  <div className={`text-sm font-medium ${
                    file.coverageAfter >= 80 ? 'text-green-400' :
                    file.coverageAfter >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {file.coverageAfter.toFixed(1)}%
                  </div>
                </div>

                {/* Delta Badge */}
                <div className={`px-2 py-1 rounded text-sm font-medium ${
                  file.delta > 0 ? 'bg-green-900 text-green-300' :
                  file.delta < 0 ? 'bg-red-900 text-red-300' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {file.delta > 0 ? '+' : ''}{file.delta.toFixed(1)}%
                </div>

                {/* Coverage Bar */}
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      file.coverageAfter >= 80 ? 'bg-green-500' :
                      file.coverageAfter >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${file.coverageAfter}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>≥{config.getReadinessThreshold()}% Coverage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
            <span>60-79% Coverage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>&lt;60% Coverage</span>
          </div>
        </div>
        <div>
          Showing {sortedFiles.length} of {files.length} files
        </div>
      </div>
    </div>
  );
}