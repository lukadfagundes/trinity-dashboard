import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GitHubProvider } from './contexts/GitHubContext'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Analytics from './pages/Analytics'
import ProjectDashboard from './pages/ProjectDashboard'
import RunDetails from './pages/RunDetails'
import PRDashboard from './pages/PRDashboard'
import PerformanceDashboard from './components/PerformanceDashboard'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <GitHubProvider>
        <Router basename={import.meta.env.VITE_BASE_PATH || '/'}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/project/:projectName" element={<ProjectDashboard />} />
            <Route path="/runs/:runId" element={<RunDetails />} />
            <Route path="/pr/:prNumber" element={<PRDashboard />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
          </Routes>
        </Router>
      </GitHubProvider>
    </ErrorBoundary>
  )
}

export default App