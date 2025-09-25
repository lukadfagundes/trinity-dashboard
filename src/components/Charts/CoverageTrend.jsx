import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const CoverageTrend = ({ runs }) => {
  const chartData = {
    labels: runs.map(run => new Date(run.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Overall Coverage',
        data: runs.map(run => run.metrics?.coverage?.overall || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3
      },
      {
        label: 'Python',
        data: runs.map(run => run.metrics?.coverage?.python || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'JavaScript',
        data: runs.map(run => run.metrics?.coverage?.javascript || 0),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.3
      },
      {
        label: 'Rust',
        data: runs.map(run => run.metrics?.coverage?.rust || 0),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.87)'
        }
      },
      title: {
        display: true,
        text: 'Coverage Trend Over Time',
        color: 'rgba(255, 255, 255, 0.87)'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          },
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }

  return (
    <div className="metric-card">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default CoverageTrend