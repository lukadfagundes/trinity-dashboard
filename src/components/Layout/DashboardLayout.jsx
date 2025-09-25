import { useState, useEffect } from 'react'

const DashboardLayout = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-trinity-darker">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-trinity-blue to-trinity-green bg-clip-text text-transparent">
                  Trinity Dashboard
                </h1>
              </div>
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Overview
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Projects
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Analytics
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              Trinity Method DevOps Dashboard v1.0.0
            </span>
            <span className="text-gray-400 text-sm">
              Powered by React + Tailwind + Chart.js
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout