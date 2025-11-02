import { createCanvas } from 'canvas';
import {
  Chart,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  RadialLinearScale,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import fs from 'fs';
import { getColorByIndex } from './utils/colors.js';

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  MatrixController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  MatrixElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export async function generateChart(username, platform, datasets, totalCommits = 0, chartType = 'line') {
  const filename = `timeline-${chartType}.png`;
  
  switch (chartType) {
    case 'line':
      await generateLineChart(username, platform, datasets, totalCommits, filename);
      break;
    case 'bar':
      await generateBarChart(username, platform, datasets, totalCommits, filename);
      break;
    case 'pie':
      await generatePieChart(username, platform, datasets, totalCommits, filename);
      break;
    case 'doughnut':
      await generateDoughnutChart(username, platform, datasets, totalCommits, filename);
      break;
    case 'radar':
      await generateRadarChart(username, platform, datasets, totalCommits, filename);
      break;
    case 'heatmap':
      await generateHeatmap(username, platform, datasets, totalCommits, filename);
      break;
    default:
      await generateLineChart(username, platform, datasets, totalCommits, filename);
  }
}

async function generateLineChart(username, platform, datasets, totalCommits, filename) {
  // Merge all labels (unique sorted dates)
  const allDates = [
    ...new Set(datasets.flatMap((d) => d.labels || [])),
  ].sort((a, b) => new Date(a) - new Date(b));

  // Calculate date range
  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];
  const daysDiff = Math.ceil((new Date(lastDate) - new Date(firstDate)) / (1000 * 60 * 60 * 24));

  // Canvas setup with better sizing
  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background color
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDates,
      datasets: datasets.map(({ labels, ...rest }, index) => ({
        ...rest,
        borderColor: getColorByIndex(index, 'vibrant'),
        backgroundColor: getColorByIndex(index, 'vibrant') + '33', // Add transparency
      })),
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Commit Timeline`,
            `${totalCommits} commits across ${datasets.length} repositories (${daysDiff} days)`
          ],
          font: {
            size: 18,
            weight: 'bold',
          },
          padding: 20,
        },
        legend: {
          display: datasets.length <= 15,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
          },
          bodyFont: {
            size: 12,
          },
        },
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: 'Date',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 10,
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        y: {
          title: { 
            display: true, 
            text: 'Number of Commits',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 11,
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateBarChart(username, platform, datasets, totalCommits, filename) {
  // Calculate total commits per repository
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: ds.data.reduce((sum, val) => sum + val, 0)
  })).sort((a, b) => b.commits - a.commits);

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        label: 'Total Commits',
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => getColorByIndex(i, 'vibrant')),
        borderColor: repoData.map((_, i) => getColorByIndex(i, 'vibrant')),
        borderWidth: 2,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Commit Comparison`,
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          display: false,
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          formatter: (value) => value,
          font: { weight: 'bold', size: 11 },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Repository', font: { size: 14, weight: 'bold' } },
          ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 },
        },
        y: {
          title: { display: true, text: 'Total Commits', font: { size: 14, weight: 'bold' } },
          beginAtZero: true,
          ticks: { precision: 0, font: { size: 11 } },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generatePieChart(username, platform, datasets, totalCommits, filename) {
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: ds.data.reduce((sum, val) => sum + val, 0)
  })).sort((a, b) => b.commits - a.commits);

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => getColorByIndex(i, 'vibrant')),
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Contribution Distribution`,
            `${totalCommits} total commits across ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          position: 'right',
          labels: { boxWidth: 15, padding: 10, font: { size: 11 } },
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 12 },
          formatter: (value, ctx) => {
            const percentage = ((value / totalCommits) * 100).toFixed(1);
            return percentage > 3 ? `${percentage}%` : '';
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateDoughnutChart(username, platform, datasets, totalCommits, filename) {
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: ds.data.reduce((sum, val) => sum + val, 0)
  })).sort((a, b) => b.commits - a.commits);

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => getColorByIndex(i, 'vibrant')),
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Repository Breakdown`,
            `${totalCommits} commits • ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          position: 'right',
          labels: { boxWidth: 15, padding: 10, font: { size: 11 } },
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 12 },
          formatter: (value, ctx) => {
            const percentage = ((value / totalCommits) * 100).toFixed(1);
            return percentage > 3 ? `${percentage}%` : '';
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateRadarChart(username, platform, datasets, totalCommits, filename) {
  // Take top 6 repositories for radar chart
  const topRepos = datasets
    .map(ds => ({
      name: ds.label,
      commits: ds.data.reduce((sum, val) => sum + val, 0),
      data: ds.data,
      labels: ds.labels,
    }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 6);

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: topRepos.map(r => r.name),
      datasets: [{
        label: 'Commits',
        data: topRepos.map(r => r.commits),
        backgroundColor: getColorByIndex(0, 'vibrant') + '33',
        borderColor: getColorByIndex(0, 'vibrant'),
        borderWidth: 2,
        pointBackgroundColor: getColorByIndex(0, 'vibrant'),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: getColorByIndex(0, 'vibrant'),
      }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Repository Comparison`,
            `Top ${topRepos.length} repositories by commits`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            font: { size: 11 },
          },
          pointLabels: {
            font: { size: 12, weight: 'bold' },
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateHeatmap(username, platform, datasets, totalCommits, filename) {
  // Aggregate all commits by date
  const commitsByDate = {};
  datasets.forEach(ds => {
    ds.labels.forEach((date, idx) => {
      commitsByDate[date] = (commitsByDate[date] || 0) + ds.data[idx];
    });
  });

  // Create matrix data for heatmap (last 365 days)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // 365 days including today

  const heatmapData = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const commits = commitsByDate[dateStr] || 0;
    
    heatmapData.push({
      x: Math.floor(i / 7), // week number
      y: i % 7, // day of week
      v: commits,
    });
  }

  const maxCommits = Math.max(...heatmapData.map(d => d.v));

  const width = 1600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'matrix',
    data: {
      datasets: [{
        label: 'Commits',
        data: heatmapData,
        backgroundColor: (ctx) => {
          const value = ctx.raw.v;
          if (value === 0) return '#ebedf0';
          const intensity = value / maxCommits;
          if (intensity < 0.25) return '#9be9a8';
          if (intensity < 0.5) return '#40c463';
          if (intensity < 0.75) return '#30a14e';
          return '#216e39';
        },
        borderWidth: 1,
        borderColor: '#ffffff',
        width: ({ chart }) => (chart.chartArea || {}).width / 53 - 2,
        height: ({ chart }) => (chart.chartArea || {}).height / 7 - 2,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Activity Heatmap`,
            `Last 365 days • ${totalCommits} total commits`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (ctx) => `${ctx.raw.v} commits`,
          },
        },
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          offset: false,
          ticks: {
            stepSize: 4,
            callback: (value) => `Week ${value}`,
          },
          grid: {
            display: false,
          },
        },
        y: {
          type: 'linear',
          offset: false,
          reverse: false,
          ticks: {
            stepSize: 1,
            callback: (value) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value],
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}
