const TestResultsCard = ({ metrics }) => {
  // Check if we have no workflow data
  if (!metrics?.hasWorkflowData || metrics?.tests === null) {
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
        </div>
        <div className="text-center py-6">
          <span className="text-3xl mb-2">🧪</span>
          <p className="text-gray-400 mt-2">No test data available</p>
          <small className="text-gray-500 text-xs">Configure test reporting in GitHub Actions</small>
        </div>
      </div>
    )
  }

  const passRate = metrics?.tests?.total > 0
    ? ((metrics.tests.passed / metrics.tests.total) * 100).toFixed(1)
    : null

  const getPassRateColor = (rate) => {
    if (rate >= 95) return 'text-trinity-green'
    if (rate >= 80) return 'text-trinity-yellow'
    return 'text-trinity-red'
  }

  // Only show stack breakdown if we have actual data
  const stacks = metrics?.tests?.breakdown || []

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Test Results</h3>
        <span className={`text-2xl font-bold ${passRate != null ? getPassRateColor(passRate) : 'text-gray-400'}`}>
          {passRate != null ? `${passRate}%` : '-'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Tests</span>
          <span className="text-white font-medium">{metrics?.tests?.total != null ? metrics.tests.total : '-'}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-trinity-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${passRate != null ? passRate : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 rounded p-2 border border-green-900/50">
          <p className="text-green-400 text-xs">Passed</p>
          <p className="text-white text-xl font-bold">{metrics?.tests?.passed != null ? metrics.tests.passed : '-'}</p>
        </div>
        <div className="bg-red-900/20 rounded p-2 border border-red-900/50">
          <p className="text-red-400 text-xs">Failed</p>
          <p className="text-white text-xl font-bold">{metrics?.tests?.failed != null ? metrics.tests.failed : '-'}</p>
        </div>
      </div>

      {stacks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
          {stacks.map((stack) => (
            <div key={stack.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stack.icon && <span>{stack.icon}</span>}
                <span className="text-gray-300 text-sm">{stack.name}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-400">{stack.passed} ✓</span>
                {stack.failed > 0 && <span className="text-red-400">{stack.failed} ✗</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestResultsCard