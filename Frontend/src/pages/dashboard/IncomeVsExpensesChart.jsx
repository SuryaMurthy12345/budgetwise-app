import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IncomeVsExpensesChart = ({ monthlyData }) => {
  const totalIncome = (monthlyData.startingBalance || 0) + (monthlyData.totalCredits || 0);

  const data = {
    labels: ['Income', 'Expenses', 'Remaining'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [
          totalIncome,
          monthlyData.totalExpenses,
          monthlyData.remainingBalance,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',  // Green for Income
          'rgba(239, 68, 68, 0.7)',  // Red for Expenses
          'rgba(99, 102, 241, 0.7)', // Indigo for Remaining
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  return <Bar options={options} data={data} />;
};

export default IncomeVsExpensesChart;