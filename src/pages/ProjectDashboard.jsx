import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { fetchProjectData } from '../utils/dataFetcher'

const ProjectDashboard = () => {
  const { projectName } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const projectData = await fetchProjectData(projectName)
      setData(projectData)
      setLoading(false)
    }
    loadData()
  }, [projectName])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-green"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">Project: {projectName}</h2>
          <p className="text-gray-400">Detailed analytics and metrics for this project</p>
        </div>

        {data ? (
          <div className="metric-card">
            <h3 className="text-lg font-semibold text-white mb-4">Project Overview</h3>
            <p className="text-gray-400">Total runs: {data.runs?.length || 0}</p>
          </div>
        ) : (
          <div className="metric-card">
            <p className="text-gray-400">No data available for this project</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProjectDashboard