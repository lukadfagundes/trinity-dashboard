const SecurityCard = ({ metrics }) => {
  const vulnerabilities = metrics?.security || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  const total = Object.values(vulnerabilities).reduce((a, b) => a + b, 0)

  const severityLevels = [
    { level: 'Critical', count: vulnerabilities.critical, color: 'bg-red-600', textColor: 'text-red-400' },
    { level: 'High', count: vulnerabilities.high, color: 'bg-orange-600', textColor: 'text-orange-400' },
    { level: 'Medium', count: vulnerabilities.medium, color: 'bg-yellow-600', textColor: 'text-yellow-400' },
    { level: 'Low', count: vulnerabilities.low, color: 'bg-blue-600', textColor: 'text-blue-400' }
  ]

  const getTrendIcon = () => {
    if (total === 0) return { icon: '✅', text: 'Secure', color: 'text-green-400' }
    if (vulnerabilities.critical > 0) return { icon: '🚨', text: 'Critical', color: 'text-red-400' }
    if (vulnerabilities.high > 0) return { icon: '⚠️', text: 'High Risk', color: 'text-orange-400' }
    return { icon: '📊', text: 'Monitor', color: 'text-yellow-400' }
  }

  const trend = getTrendIcon()

  const scanResults = [
    { name: 'npm audit', status: 'passed', lastRun: '2 min ago' },
    { name: 'pip-audit', status: 'passed', lastRun: '2 min ago' },
    { name: 'cargo audit', status: vulnerabilities.high > 0 ? 'failed' : 'passed', lastRun: '2 min ago' },
    { name: 'CodeQL', status: 'passed', lastRun: '5 min ago' }
  ]

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Security Status</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl">{trend.icon}</span>
          <span className={`font-medium ${trend.color}`}>{trend.text}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Vulnerabilities</span>
          <span className={`text-2xl font-bold ${total === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
            {total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {severityLevels.map((severity) => (
          <div
            key={severity.level}
            className={`bg-gray-900/50 rounded p-2 border ${
              severity.count > 0 ? 'border-gray-600' : 'border-gray-700'
            }`}
          >
            <p className={`text-xs ${severity.textColor}`}>{severity.level}</p>
            <p className="text-white text-lg font-bold">{severity.count}</p>
            {severity.count > 0 && (
              <div className="mt-1">
                <div className={`h-1 ${severity.color} rounded-full`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs font-medium mb-2">Recent Scans</p>
        {scanResults.map((scan) => (
          <div key={scan.name} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{scan.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{scan.lastRun}</span>
              <span className={`text-xs font-medium ${
                scan.status === 'passed' ? 'text-green-400' : 'text-red-400'
              }`}>
                {scan.status === 'passed' ? '✓' : '✗'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SecurityCard