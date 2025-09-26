import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';

export function VolatilityHistory({ repository, timeRange = 90 }) {
  const [volatilityData, setVolatilityData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [topVolatileFiles, setTopVolatileFiles] = useState([]);

  useEffect(() => {
    async function fetchVolatilityData() {
      // Fetch commit history and calculate volatility
      const response = await fetch(`/api/volatility/${repository}?days=${timeRange}`);
      const data = await response.json();

      // Process data for visualization
      const processedData = processVolatilityMetrics(data);
      setVolatilityData(processedData);

      // Identify top volatile files
      const top = identifyTopVolatileFiles(data);
      setTopVolatileFiles(top);
    }

    fetchVolatilityData();
  }, [repository, timeRange]);

  function processVolatilityMetrics(data) {
    // Group changes by day
    const dailyChanges = {};

    data.commits.forEach(commit => {
      const date = new Date(commit.date).toLocaleDateString();

      if (!dailyChanges[date]) {
        dailyChanges[date] = {
          totalChanges: 0,
          uniqueFiles: new Set(),
          additions: 0,
          deletions: 0
        };
      }

      dailyChanges[date].totalChanges++;
      commit.files?.forEach(file => {
        dailyChanges[date].uniqueFiles.add(file.filename);
        dailyChanges[date].additions += file.additions || 0;
        dailyChanges[date].deletions += file.deletions || 0;
      });
    });

    // Convert to chart format
    const dates = Object.keys(dailyChanges).sort();

    return {
      labels: dates,
      datasets: [
        {
          label: 'Total Changes',
          data: dates.map(d => dailyChanges[d].totalChanges),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Unique Files',
          data: dates.map(d => dailyChanges[d].uniqueFiles.size),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Lines Changed',
          data: dates.map(d => dailyChanges[d].additions + dailyChanges[d].deletions),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          hidden: true
        }
      ]
    };
  }

  function identifyTopVolatileFiles(data) {
    const fileChangeCounts = {};

    data.commits.forEach(commit => {
      commit.files?.forEach(file => {
        if (!fileChangeCounts[file.filename]) {
          fileChangeCounts[file.filename] = {
            changes: 0,
            additions: 0,
            deletions: 0,
            lastChanged: commit.date
          };
        }

        fileChangeCounts[file.filename].changes++;
        fileChangeCounts[file.filename].additions += file.additions || 0;
        fileChangeCounts[file.filename].deletions += file.deletions || 0;
        fileChangeCounts[file.filename].lastChanged = commit.date;
      });
    });

    // Sort by change frequency
    return Object.entries(fileChangeCounts)
      .map(([filename, stats]) => ({ filename, ...stats }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10);
  }

  const chartOptions = {
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
        text: `Repository Volatility - Last ${timeRange} Days`,
        color: 'rgb(156, 163, 175)'
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            if (context.datasetIndex === 0) {
              return `Average: ${(context.raw / timeRange).toFixed(2)} changes/day`;
            }
            return '';
          }
        }
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Count',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgb(55, 65, 81)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Lines Changed',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Volatility History</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
        </div>

        {volatilityData && <Line data={volatilityData} options={chartOptions} />}
      </div>

      {/* Top Volatile Files */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Most Volatile Files</h3>

        <div className="space-y-2">
          {topVolatileFiles.map((file, index) => (
            <div
              key={file.filename}
              className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-500">
                  {index + 1}
                </span>
                <div>
                  <p className="font-mono text-sm text-white">{file.filename}</p>
                  <p className="text-xs text-gray-400">
                    Last changed: {new Date(file.lastChanged).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{file.changes} changes</p>
                  <p className="text-xs">
                    <span className="text-green-400">+{file.additions}</span>
                    {' / '}
                    <span className="text-red-400">-{file.deletions}</span>
                  </p>
                </div>

                {/* Volatility Indicator */}
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  file.changes > 20 ? 'bg-red-900 text-red-200' :
                  file.changes > 10 ? 'bg-yellow-900 text-yellow-200' :
                  'bg-green-900 text-green-200'
                }`}>
                  {file.changes > 20 ? '🔥 Hot' :
                   file.changes > 10 ? '⚖️ Active' :
                   '❄️ Stable'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">File Volatility Details</h3>

            <div className="space-y-3 text-sm">
              <div className="bg-gray-900 p-4 rounded">
                <p className="font-mono text-white mb-2">{selectedFile.filename}</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <span className="text-gray-400">Total Changes:</span>
                    <span className="ml-2 text-white font-semibold">{selectedFile.changes}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Modified:</span>
                    <span className="ml-2 text-white">
                      {new Date(selectedFile.lastChanged).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Lines Added:</span>
                    <span className="ml-2 text-green-400 font-semibold">+{selectedFile.additions}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Lines Removed:</span>
                    <span className="ml-2 text-red-400 font-semibold">-{selectedFile.deletions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 mb-2">Volatility Analysis:</p>
                <p className="text-white text-xs">
                  This file has been modified {selectedFile.changes} times in the last {timeRange} days,
                  averaging {(selectedFile.changes / timeRange * 30).toFixed(1)} changes per month.
                  {selectedFile.changes > 20 && ' This indicates high volatility and potential instability.'}
                  {selectedFile.changes <= 10 && ' This indicates good stability.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolatilityHistory;