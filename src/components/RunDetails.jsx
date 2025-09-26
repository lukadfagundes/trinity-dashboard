import { useState, useEffect } from 'react';
import { HistoryService } from '../services/historyService';

// Modal component for overlay
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Run Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Coverage breakdown component
function CoverageBreakdown({ data }) {
  if (!data) return <div className="text-gray-500">No coverage data available</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm text-gray-600">Lines</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.lines?.toFixed(1) || 0}%
        </div>
      </div>
      <div className="bg-green-50 p-3 rounded">
        <div className="text-sm text-gray-600">Statements</div>
        <div className="text-2xl font-bold text-green-600">
          {data.statements?.toFixed(1) || 0}%
        </div>
      </div>
      <div className="bg-purple-50 p-3 rounded">
        <div className="text-sm text-gray-600">Functions</div>
        <div className="text-2xl font-bold text-purple-600">
          {data.functions?.toFixed(1) || 0}%
        </div>
      </div>
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-sm text-gray-600">Branches</div>
        <div className="text-2xl font-bold text-yellow-600">
          {data.branches?.toFixed(1) || 0}%
        </div>
      </div>
    </div>
  );
}

// File list component
function FileList({ files }) {
  if (!files || files.length === 0) {
    return <div className="text-gray-500">No file-level coverage data</div>;
  }

  const sortedFiles = [...files].sort((a, b) => a.coverage - b.coverage);

  return (
    <div className="space-y-2 max-h-64 overflow-auto">
      {sortedFiles.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="font-mono text-sm truncate flex-1">{file.name}</span>
          <div className="flex items-center ml-4">
            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className={`h-2 rounded-full ${
                  file.coverage >= 80
                    ? 'bg-green-500'
                    : file.coverage >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${file.coverage}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {file.coverage.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Test suite results component
function TestSuiteResults({ suites }) {
  if (!suites || suites.length === 0) {
    return <div className="text-gray-500">No test suite data available</div>;
  }

  return (
    <div className="space-y-3">
      {suites.map((suite, index) => (
        <div key={index} className="border rounded p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{suite.name}</h4>
            <span className="text-sm text-gray-500">
              {suite.duration ? `${(suite.duration / 1000).toFixed(2)}s` : ''}
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {suite.passed} passed</span>
            {suite.failed > 0 && (
              <span className="text-red-600">✗ {suite.failed} failed</span>
            )}
            {suite.skipped > 0 && (
              <span className="text-gray-500">○ {suite.skipped} skipped</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Vulnerability list component
function VulnerabilityList({ vulnerabilities, summary }) {
  if (!summary) {
    return <div className="text-gray-500">No security scan data available</div>;
  }

  const levels = [
    { name: 'Critical', count: summary.critical || 0, color: 'red' },
    { name: 'High', count: summary.high || 0, color: 'orange' },
    { name: 'Medium', count: summary.medium || 0, color: 'yellow' },
    { name: 'Low', count: summary.low || 0, color: 'blue' },
    { name: 'Info', count: summary.info || 0, color: 'gray' }
  ];

  return (
    <div>
      <div className="flex gap-4 mb-4">
        {levels.map((level) => (
          <div
            key={level.name}
            className={`flex-1 text-center p-3 rounded bg-${level.color}-50`}
          >
            <div className={`text-2xl font-bold text-${level.color}-600`}>
              {level.count}
            </div>
            <div className="text-xs text-gray-600">{level.name}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-600">Security Score</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                summary.score >= 80
                  ? 'bg-green-500'
                  : summary.score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${summary.score || 0}%` }}
            />
          </div>
          <span className="font-bold">{summary.score || 0}/100</span>
        </div>
      </div>

      {vulnerabilities && vulnerabilities.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="font-medium">Vulnerability Details</h5>
          {vulnerabilities.slice(0, 5).map((vuln, index) => (
            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
              <span className={`font-medium text-${
                vuln.severity === 'critical' ? 'red' :
                vuln.severity === 'high' ? 'orange' :
                vuln.severity === 'medium' ? 'yellow' :
                'gray'
              }-600`}>
                [{vuln.severity}]
              </span>{' '}
              {vuln.title || vuln.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main RunDetails component
export function RunDetails({ runId, onClose }) {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await HistoryService.fetchRunDetails(runId);
        if (data) {
          setRun(data);
        } else {
          setError('Run details not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [runId]);

  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error loading run details</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </Modal>
    );
  }

  if (!run) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-12 text-gray-500">
          No data available for this run
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        {/* Run metadata */}
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-semibold mb-3">Run Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Repository:</span>{' '}
              <span className="font-medium">{run.repository}</span>
            </div>
            <div>
              <span className="text-gray-600">Branch:</span>{' '}
              <span className="font-medium">{run.branch}</span>
            </div>
            <div>
              <span className="text-gray-600">Commit:</span>{' '}
              <span className="font-mono">{run.commit}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>{' '}
              <span
                className={`font-medium ${
                  run.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {run.status}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Timestamp:</span>{' '}
              <span className="font-medium">
                {new Date(run.timestamp).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Health Score:</span>{' '}
              <span
                className={`font-medium ${
                  run.health?.score >= 80
                    ? 'text-green-600'
                    : run.health?.score >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {run.health?.score || 0}/100
              </span>
            </div>
          </div>
        </div>

        {/* Coverage Section */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Coverage Report</h3>
          <div className="space-y-4">
            <CoverageBreakdown data={run?.coverage} />
            <div>
              <h4 className="font-medium mb-2">File Coverage</h4>
              <FileList files={run?.coverage?.files} />
            </div>
          </div>
        </section>

        {/* Test Results */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Test Results</h3>
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-2xl font-bold">{run?.tests?.total || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {run?.tests?.passed || 0}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {run?.tests?.failed || 0}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-2xl font-bold text-gray-600">
                  {run?.tests?.skipped || 0}
                </div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>
          </div>
          <TestSuiteResults suites={run?.tests?.suites} />
        </section>

        {/* Security Scan */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Security Analysis</h3>
          <VulnerabilityList
            vulnerabilities={run?.security?.vulnerabilities}
            summary={run?.security}
          />
        </section>

        {/* Build Metrics */}
        {run?.build && (
          <section>
            <h3 className="text-xl font-semibold mb-3">Build Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-xl font-bold">
                  {run.build.duration ? `${run.build.duration}ms` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Size</div>
                <div className="text-xl font-bold">
                  {run.build.size ? `${(run.build.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Files</div>
                <div className="text-xl font-bold">{run.build.files || 0}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Warnings</div>
                <div className="text-xl font-bold text-yellow-600">
                  {run.build.warnings || 0}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}