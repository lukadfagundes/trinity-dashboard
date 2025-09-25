import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GitHubProvider } from './contexts/GitHubContext'
import Dashboard from './pages/Dashboard'
import ProjectDashboard from './pages/ProjectDashboard'
import RunDetails from './pages/RunDetails'

function App() {
  return (
    <GitHubProvider>
      <Router basename="/trinity-dashboard">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:projectName" element={<ProjectDashboard />} />
          <Route path="/runs/:runId" element={<RunDetails />} />
        </Routes>
      </Router>
    </GitHubProvider>
  )
}

export default App