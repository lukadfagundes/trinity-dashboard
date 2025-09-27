import { useEffect, useRef } from 'react'

const CoverageCard = ({ metrics, history = [] }) => {
  const canvasRef = useRef(null)

  // Check if we have no workflow data
  if (!metrics?.hasWorkflowData || metrics?.coverage === null) {
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Code Coverage</h3>
        </div>
        <div className="text-center py-6">
          <span className="text-3xl mb-2">📊</span>
          <p className="text-gray-400 mt-2">No coverage data available</p>
          <small className="text-gray-500 text-xs">Add coverage reporting to your workflows</small>
        </div>
      </div>
    )
  }

  const coverage = metrics?.coverage?.overall
  const previousCoverage = history.length > 1 ? history[history.length - 2]?.coverage?.overall : coverage
  const delta = coverage != null && previousCoverage != null ? (coverage - previousCoverage).toFixed(1) : null

  useEffect(() => {
    if (canvasRef.current && history.length > 0) {
      const ctx = canvasRef.current.getContext('2d')
      const width = canvasRef.current.width
      const height = canvasRef.current.height

      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.beginPath()

      const recentHistory = history.slice(-10)
      recentHistory.forEach((run, index) => {
        const x = (index / (recentHistory.length - 1)) * width
        const y = height - (run.coverage?.overall / 100) * height
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }
  }, [history])

  const getCoverageColor = (value) => {
    if (value >= 80) return 'text-trinity-green'
    if (value >= 60) return 'text-trinity-yellow'
    return 'text-trinity-red'
  }

  const languages = [
    { name: 'Python', coverage: metrics?.coverage?.python, color: 'bg-blue-500' },
    { name: 'JavaScript', coverage: metrics?.coverage?.javascript, color: 'bg-yellow-500' },
    { name: 'Rust', coverage: metrics?.coverage?.rust, color: 'bg-orange-500' },
  ].filter(lang => lang.coverage != null) // Only show languages with data

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Code Coverage</h3>
        <div className="flex items-center gap-2">
          {coverage != null ? (
            <>
              <span className={`text-2xl font-bold ${getCoverageColor(coverage)}`}>
                {coverage.toFixed(1)}%
              </span>
              {delta != null && delta !== '0.0' && (
                <span className={`text-sm ${Number(delta) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(delta) > 0 ? '+' : ''}{delta}%
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-400">-</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="w-full h-16 bg-gray-900/50 rounded"
        />
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <div key={lang.name}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-sm">{lang.name}</span>
              <span className="text-white text-sm font-medium">
                {lang.coverage != null ? `${lang.coverage.toFixed(1)}%` : '-'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${lang.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${lang.coverage != null ? lang.coverage : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Removed hardcoded coverage details - only show if data available */}
      {metrics?.coverage?.lines != null || metrics?.coverage?.branches != null || metrics?.coverage?.functions != null ? (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-center">
            {metrics?.coverage?.lines != null && (
              <div>
                <p className="text-gray-400 text-xs">Lines</p>
                <p className="text-white font-medium">{metrics.coverage.lines.toFixed(1)}%</p>
              </div>
            )}
            {metrics?.coverage?.branches != null && (
              <div>
                <p className="text-gray-400 text-xs">Branches</p>
                <p className="text-white font-medium">{metrics.coverage.branches.toFixed(1)}%</p>
              </div>
            )}
            {metrics?.coverage?.functions != null && (
              <div>
                <p className="text-gray-400 text-xs">Functions</p>
                <p className="text-white font-medium">{metrics.coverage.functions.toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CoverageCard