import { useEffect, useRef } from 'react'

const CoverageCard = ({ metrics, history = [] }) => {
  const canvasRef = useRef(null)
  const coverage = metrics?.coverage?.overall || 0
  const previousCoverage = history.length > 1 ? history[history.length - 2]?.coverage?.overall : coverage
  const delta = (coverage - previousCoverage).toFixed(1)

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
    { name: 'Python', coverage: metrics?.coverage?.python || 0, color: 'bg-blue-500' },
    { name: 'JavaScript', coverage: metrics?.coverage?.javascript || 0, color: 'bg-yellow-500' },
    { name: 'Rust', coverage: metrics?.coverage?.rust || 0, color: 'bg-orange-500' },
  ]

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Code Coverage</h3>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getCoverageColor(coverage)}`}>
            {coverage.toFixed(1)}%
          </span>
          {delta !== '0.0' && (
            <span className={`text-sm ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {delta > 0 ? '+' : ''}{delta}%
            </span>
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
                {lang.coverage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${lang.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${lang.coverage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-400 text-xs">Lines</p>
            <p className="text-white font-medium">85.2%</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Branches</p>
            <p className="text-white font-medium">78.9%</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Functions</p>
            <p className="text-white font-medium">91.3%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoverageCard