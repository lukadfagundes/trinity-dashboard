import { useState, useEffect } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import HealthCard from '../components/Cards/HealthCard'
import TestResultsCard from '../components/Cards/TestResultsCard'
import CoverageCard from '../components/Cards/CoverageCard'
import SecurityCard from '../components/Cards/SecurityCard'
import CoverageTrend from '../components/Charts/CoverageTrend'
import TestResults from '../components/Charts/TestResults'
import SecurityChart from '../components/Charts/SecurityChart'
import { fetchRunsData, calculateAggregateMetrics } from '../utils/dataFetcher'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const runsData = await fetchRunsData()
        setData(runsData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    loadData()

    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-green mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6">
          <p className="text-red-400">Error loading dashboard: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const aggregateMetrics = calculateAggregateMetrics(data?.runs || [])
  const latestRun = data?.runs?.[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">Trinity DevOps Dashboard</h2>
          <p className="text-gray-400">
            Real-time monitoring and analytics for Trinity Method projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthCard
            project={data?.project}
            metrics={latestRun?.metrics}
          />
          <TestResultsCard metrics={latestRun?.metrics} />
          <CoverageCard
            metrics={latestRun?.metrics}
            history={data?.runs || []}
          />
          <SecurityCard metrics={latestRun?.metrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CoverageTrend runs={data?.runs || []} />
          <TestResults runs={data?.runs?.slice(0, 5) || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SecurityChart metrics={latestRun?.metrics} />
          </div>

          <div className="lg:col-span-2">
            <div className="metric-card">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
              <div className="space-y-2">
                {data?.runs?.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        run.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-white text-sm font-medium">{run.id}</p>
                        <p className="text-gray-400 text-xs">{run.branch} • {run.commit.slice(0, 7)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">
                        {run.metrics?.coverage?.overall.toFixed(1)}% coverage
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(run.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.projects?.map((project) => (
            <div key={project.name} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{project.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  project.status === 'active'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-gray-900/50 text-gray-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {project.lastRun ? `Last run: ${project.lastRun}` : 'No runs yet'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard