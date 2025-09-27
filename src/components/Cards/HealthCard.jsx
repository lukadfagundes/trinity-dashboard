import { useState } from 'react'

const HealthCard = ({ project, metrics }) => {
  const [expanded, setExpanded] = useState(false)

  // Check if we have no workflow data
  if (!metrics?.hasWorkflowData) {
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Health Status</h3>
          <div className="health-indicator bg-gray-500" />
        </div>
        <div className="text-center py-4">
          <span className="text-2xl mb-2">📊</span>
          <p className="text-gray-400 text-sm">No workflow data</p>
          <small className="text-gray-500">Configure GitHub Actions to see metrics</small>
        </div>
      </div>
    )
  }

  const getHealthStatus = () => {
    // Check if we have actual data
    const hasData = metrics?.coverage?.overall != null || metrics?.tests?.total != null || metrics?.security != null

    if (!hasData) {
      return { status: 'no-data', color: 'gray-500', text: 'No Data' }
    }

    const coverage = metrics?.coverage?.overall ?? 0
    const passRate = metrics?.tests?.total > 0
      ? (metrics.tests.passed / metrics.tests.total) * 100
      : 0
    const vulnerabilities = (metrics?.security?.critical || 0) + (metrics?.security?.high || 0)

    if (coverage >= 80 && passRate >= 95 && vulnerabilities === 0) {
      return { status: 'healthy', color: 'trinity-green', text: 'Healthy' }
    } else if (coverage >= 60 && passRate >= 80 && vulnerabilities <= 2) {
      return { status: 'warning', color: 'trinity-yellow', text: 'Warning' }
    } else {
      return { status: 'critical', color: 'trinity-red', text: 'Critical' }
    }
  }

  const health = getHealthStatus()

  return (
    <div
      className="metric-card cursor-pointer transform transition-transform hover:scale-105"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{project || 'Project'}</h3>
        <div className={`health-indicator bg-${health.color}`} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <div>
          <p className="text-gray-400 text-xs">Coverage</p>
          <p className="text-white text-xl font-bold">
            {metrics?.coverage?.overall != null
              ? `${metrics.coverage.overall.toFixed(1)}%`
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Tests</p>
          <p className="text-white text-xl font-bold">
            {metrics?.tests?.total != null
              ? `${metrics.tests.passed || 0}/${metrics.tests.total}`
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Issues</p>
          <p className="text-white text-xl font-bold">
            {metrics?.security != null
              ? ((metrics.security.critical || 0) +
                 (metrics.security.high || 0) +
                 (metrics.security.medium || 0) +
                 (metrics.security.low || 0))
              : '-'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium text-${health.color}`}>
          {health.text}
        </span>
        <span className="text-gray-400 text-xs">
          {expanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Python Coverage</span>
              <span className="text-white text-sm">{metrics?.coverage?.python != null ? `${metrics.coverage.python.toFixed(1)}%` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">JavaScript Coverage</span>
              <span className="text-white text-sm">{metrics?.coverage?.javascript != null ? `${metrics.coverage.javascript.toFixed(1)}%` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Rust Coverage</span>
              <span className="text-white text-sm">{metrics?.coverage?.rust != null ? `${metrics.coverage.rust.toFixed(1)}%` : '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthCard