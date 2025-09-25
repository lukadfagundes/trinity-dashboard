import axios from 'axios'

const BASE_URL = import.meta.env.DEV
  ? '/data'
  : '/trinity-dashboard/data'

export const fetchRunsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sample-runs.json`)
    return response.data
  } catch (error) {
    console.error('Error fetching runs data:', error)
    return null
  }
}

export const fetchProjectData = async (projectName) => {
  try {
    const data = await fetchRunsData()
    if (!data) return null

    const projectRuns = data.runs.filter(run =>
      run.branch === projectName || data.project === projectName
    )

    return {
      ...data,
      runs: projectRuns.length > 0 ? projectRuns : data.runs
    }
  } catch (error) {
    console.error('Error fetching project data:', error)
    return null
  }
}

export const fetchRunDetails = async (runId) => {
  try {
    const data = await fetchRunsData()
    if (!data) return null

    const run = data.runs.find(r => r.id === runId)
    return run || null
  } catch (error) {
    console.error('Error fetching run details:', error)
    return null
  }
}

export const calculateAggregateMetrics = (runs) => {
  if (!runs || runs.length === 0) return null

  const latestRun = runs[0]

  const avgCoverage = runs.reduce((acc, run) =>
    acc + (run.metrics?.coverage?.overall || 0), 0) / runs.length

  const totalTests = runs.reduce((acc, run) =>
    acc + (run.metrics?.tests?.total || 0), 0)

  const totalPassed = runs.reduce((acc, run) =>
    acc + (run.metrics?.tests?.passed || 0), 0)

  const totalVulnerabilities = runs.reduce((acc, run) => {
    const security = run.metrics?.security || {}
    return acc + Object.values(security).reduce((a, b) => a + b, 0)
  }, 0)

  return {
    coverage: {
      overall: avgCoverage,
      python: latestRun.metrics?.coverage?.python || 0,
      javascript: latestRun.metrics?.coverage?.javascript || 0,
      rust: latestRun.metrics?.coverage?.rust || 0
    },
    tests: {
      total: latestRun.metrics?.tests?.total || 0,
      passed: latestRun.metrics?.tests?.passed || 0,
      failed: latestRun.metrics?.tests?.failed || 0,
      passRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
    },
    security: latestRun.metrics?.security || {},
    totalRuns: runs.length,
    lastUpdate: latestRun.timestamp
  }
}