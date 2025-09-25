import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { fetchRunDetails } from '../utils/dataFetcher'

const RunDetails = () => {
  const { runId } = useParams()
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const runData = await fetchRunDetails(runId)
      setRun(runData)
      setLoading(false)
    }
    loadData()
  }, [runId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-green"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!run) {
    return (
      <DashboardLayout>
        <div className="metric-card">
          <p className="text-gray-400">Run not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Run Details: {runId}</h2>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              run.status === 'success'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-red-900/50 text-red-400'
            }`}>
              {run.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Branch</p>
              <p className="text-white font-medium">{run.branch}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Commit</p>
              <p className="text-white font-medium font-mono">{run.commit.slice(0, 7)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Timestamp</p>
              <p className="text-white font-medium">
                {new Date(run.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Coverage</p>
              <p className="text-white font-medium">
                {run.metrics?.coverage?.overall?.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="metric-card">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Overall</span>
                <span className="text-white font-medium">
                  {run.metrics?.coverage?.overall?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Python</span>
                <span className="text-white font-medium">
                  {run.metrics?.coverage?.python?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">JavaScript</span>
                <span className="text-white font-medium">
                  {run.metrics?.coverage?.javascript?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rust</span>
                <span className="text-white font-medium">
                  {run.metrics?.coverage?.rust?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tests</span>
                <span className="text-white font-medium">{run.metrics?.tests?.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Passed</span>
                <span className="text-green-400 font-medium">{run.metrics?.tests?.passed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Failed</span>
                <span className="text-red-400 font-medium">{run.metrics?.tests?.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pass Rate</span>
                <span className="text-white font-medium">
                  {((run.metrics?.tests?.passed / run.metrics?.tests?.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3 className="text-lg font-semibold text-white mb-4">Security Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-900/20 rounded p-3 border border-red-900/50">
              <p className="text-red-400 text-sm">Critical</p>
              <p className="text-white text-2xl font-bold">{run.metrics?.security?.critical || 0}</p>
            </div>
            <div className="bg-orange-900/20 rounded p-3 border border-orange-900/50">
              <p className="text-orange-400 text-sm">High</p>
              <p className="text-white text-2xl font-bold">{run.metrics?.security?.high || 0}</p>
            </div>
            <div className="bg-yellow-900/20 rounded p-3 border border-yellow-900/50">
              <p className="text-yellow-400 text-sm">Medium</p>
              <p className="text-white text-2xl font-bold">{run.metrics?.security?.medium || 0}</p>
            </div>
            <div className="bg-blue-900/20 rounded p-3 border border-blue-900/50">
              <p className="text-blue-400 text-sm">Low</p>
              <p className="text-white text-2xl font-bold">{run.metrics?.security?.low || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RunDetails