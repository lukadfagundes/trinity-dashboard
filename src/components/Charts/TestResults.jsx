import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const TestResults = ({ runs }) => {
  const chartData = {
    labels: runs.map(run => new Date(run.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Passed Tests',
        data: runs.map(run => run.metrics?.tests?.passed || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      },
      {
        label: 'Failed Tests',
        data: runs.map(run => run.metrics?.tests?.failed || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
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
        text: 'Test Execution Results',
        color: 'rgba(255, 255, 255, 0.87)'
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        stacked: true,
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default TestResults