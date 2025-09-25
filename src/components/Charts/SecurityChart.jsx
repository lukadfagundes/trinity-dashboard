import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const SecurityChart = ({ metrics }) => {
  const vulnerabilities = metrics?.security || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  const chartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          vulnerabilities.critical,
          vulnerabilities.high,
          vulnerabilities.medium,
          vulnerabilities.low
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.87)',
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Vulnerability Distribution',
        color: 'rgba(255, 255, 255, 0.87)'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return context.label + ': ' + context.parsed + ' (' + percentage + '%)'
          }
        }
      }
    }
  }

  const totalVulnerabilities = Object.values(vulnerabilities).reduce((a, b) => a + b, 0)

  return (
    <div className="metric-card">
      {totalVulnerabilities === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold text-green-400">All Secure!</h3>
          <p className="text-gray-400 text-sm mt-2">No vulnerabilities detected</p>
        </div>
      ) : (
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      )}
    </div>
  )
}

export default SecurityChart