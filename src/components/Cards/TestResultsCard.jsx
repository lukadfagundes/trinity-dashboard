const TestResultsCard = ({ metrics }) => {
  const passRate = metrics?.tests?.total > 0
    ? ((metrics.tests.passed / metrics.tests.total) * 100).toFixed(1)
    : 0

  const getPassRateColor = (rate) => {
    if (rate >= 95) return 'text-trinity-green'
    if (rate >= 80) return 'text-trinity-yellow'
    return 'text-trinity-red'
  }

  const stacks = [
    { name: 'Python', passed: 42, failed: 0, icon: '🐍' },
    { name: 'JavaScript', passed: 156, failed: 2, icon: '📜' },
    { name: 'Rust', passed: 89, failed: 0, icon: '🦀' },
    { name: 'Dart', passed: 34, failed: 1, icon: '🎯' }
  ]

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Test Results</h3>
        <span className={`text-2xl font-bold ${getPassRateColor(passRate)}`}>
          {passRate}%
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Tests</span>
          <span className="text-white font-medium">{metrics?.tests?.total || 0}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-trinity-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 rounded p-2 border border-green-900/50">
          <p className="text-green-400 text-xs">Passed</p>
          <p className="text-white text-xl font-bold">{metrics?.tests?.passed || 0}</p>
        </div>
        <div className="bg-red-900/20 rounded p-2 border border-red-900/50">
          <p className="text-red-400 text-xs">Failed</p>
          <p className="text-white text-xl font-bold">{metrics?.tests?.failed || 0}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
        {stacks.map((stack) => (
          <div key={stack.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{stack.icon}</span>
              <span className="text-gray-300 text-sm">{stack.name}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-green-400">{stack.passed} ✓</span>
              {stack.failed > 0 && <span className="text-red-400">{stack.failed} ✗</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestResultsCard