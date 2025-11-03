import {
  Chart,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  ScatterController,
  BubbleController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  RadialLinearScale,
  LinearScale,
  CategoryScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import fs from 'fs';
import { getColorByIndex } from '../../utils/colors.js';
import { ensureCanvasWorks } from '../../utils/canvas-fix.js';
import { mergeChartOptions, getAnimationConfig, getScaleConfig, getLegendConfig, getTooltipConfig } from './chartOptions.js';
import type { ChartDataset as TimelineChartDataset, ChartType, ChartCustomization } from '../../types/index.js';

// Internal render dataset type (timeline datasets include optional labels/data)
export type RenderDataset = {
  label: string;
  labels?: string[];
  data?: number[];
  [key: string]: any;
};

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  ScatterController,
  BubbleController,
  MatrixController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  MatrixElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export async function generateChart(
  username: string,
  platform: string,
  datasets: RenderDataset[] | TimelineChartDataset[],
  totalCommits = 0,
  chartType: ChartType | string = 'line',
  customization?: ChartCustomization
): Promise<string> {
  // Ensure canvas is working before generating charts
  await ensureCanvasWorks();

  // Merge user customization with defaults
  const chartOptions = mergeChartOptions(customization);

  // Create charts directory if it doesn't exist
  const chartsDir = 'charts';
  if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true });
  }

  const filename = `${chartsDir}/timeline-${chartType}.png`;

  // IMPORTANT: Use the actual chartType parameter, not hardcoded 'line'
  console.log(`[DEBUG] Generating ${chartType} chart...`);

  switch (chartType) {
    case 'line':
      await generateLineChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'bar':
      await generateBarChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'pie':
      await generatePieChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'doughnut':
      await generateDoughnutChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'radar':
      await generateRadarChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'heatmap':
      await generateHeatmap(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'polarArea':
      await generatePolarAreaChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'scatter':
      await generateScatterChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'bubble':
      await generateBubbleChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    case 'mixed':
      await generateMixedChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
      break;
    default:
      console.log(`[WARN] Unknown chart type '${chartType}', falling back to line chart`);
      await generateLineChart(username, platform, datasets as RenderDataset[], totalCommits, filename, chartOptions);
  }
  
  return filename;
}

async function generateLineChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  // Import canvas dynamically (typed as any to avoid canvas-specific types here)
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Merge all labels (unique sorted dates)
  const allDates = [
    ...new Set(datasets.flatMap((d) => d.labels || [])),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (allDates.length === 0) {
    throw new Error('No data available to generate line chart');
  }

  // Calculate date range
  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];
  const daysDiff = Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24));

  // Canvas setup with better sizing
  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  // Background color
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDates,
      datasets: datasets.map(({ labels, ...rest }: RenderDataset, index: number) => {
        const color = chartOptions.colors[index] || getColorByIndex(index, 'vibrant');
        return {
          ...rest,
          data: rest.data || [],
          borderColor: color,
          backgroundColor: color + '33', // Add transparency
          borderWidth: chartOptions.borderWidth,
          tension: 0.3,
        };
      }),
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
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
        legend: getLegendConfig({ ...chartOptions, showLegend: datasets.length <= 15 && chartOptions.showLegend }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          ...getScaleConfig(chartOptions, 'x'),
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
        },
        y: {
          ...getScaleConfig(chartOptions, 'y'),
          title: { 
            display: true, 
            text: 'Number of Commits',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          ticks: {
            precision: 0,
            font: {
              size: 11,
            },
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

async function generateBarChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Calculate total commits per repository
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0
  })).filter(r => r.commits > 0).sort((a, b) => b.commits - a.commits);

  if (repoData.length === 0) {
    throw new Error('No data available to generate bar chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        label: 'Total Commits',
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => chartOptions.colors[i] || getColorByIndex(i, 'vibrant')),
        borderColor: repoData.map((_, i) => chartOptions.colors[i] || getColorByIndex(i, 'vibrant')),
        borderWidth: chartOptions.borderWidth,
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Commit Comparison`,
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: {
          display: false,
        },
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: chartOptions.showLabels,
          anchor: 'end',
          align: 'top',
          formatter: (value) => value,
          font: { weight: 'bold', size: chartOptions.labelFontSize },
          color: chartOptions.labelColor,
        },
      },
      scales: {
        x: {
          ...getScaleConfig(chartOptions, 'x'),
          title: { display: true, text: 'Repository', font: { size: 14, weight: 'bold' } },
          ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 },
        },
        y: {
          ...getScaleConfig(chartOptions, 'y'),
          title: { display: true, text: 'Total Commits', font: { size: 14, weight: 'bold' } },
          ticks: { precision: 0, font: { size: 11 } },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generatePieChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0
  })).filter(r => r.commits > 0).sort((a, b) => b.commits - a.commits);

  if (repoData.length === 0) {
    throw new Error('No data available to generate pie chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => chartOptions.colors[i] || getColorByIndex(i, 'vibrant')),
        borderWidth: chartOptions.borderWidth,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Contribution Distribution`,
            `${totalCommits} total commits across ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, legendPosition: 'right' }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: chartOptions.labelFontSize },
          formatter: (value, ctx) => {
            const percentage = ((value / totalCommits) * 100).toFixed(1);
            return parseFloat(percentage) > 3 ? `${percentage}%` : '';
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateDoughnutChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0
  })).filter(r => r.commits > 0).sort((a, b) => b.commits - a.commits);

  if (repoData.length === 0) {
    throw new Error('No data available to generate doughnut chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => chartOptions.colors[i] || getColorByIndex(i, 'vibrant')),
        borderWidth: chartOptions.borderWidth,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Repository Breakdown`,
            `${totalCommits} commits • ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, legendPosition: 'right' }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: chartOptions.labelFontSize },
          formatter: (value, ctx) => {
            const percentage = ((value / totalCommits) * 100).toFixed(1);
            return parseFloat(percentage) > 3 ? `${percentage}%` : '';
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateRadarChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Take top 6 repositories for radar chart
  const topRepos = datasets
    .map(ds => ({
      name: ds.label,
      commits: Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0,
      data: ds.data || [],
      labels: ds.labels || [],
    }))
    .filter(r => r.commits > 0)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 6);

  if (topRepos.length === 0) {
    throw new Error('No data available to generate radar chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: topRepos.map(r => r.name),
      datasets: [{
        label: 'Commits',
        data: topRepos.map(r => r.commits),
        backgroundColor: (chartOptions.colors[0] || getColorByIndex(0, 'vibrant')) + '33',
        borderColor: chartOptions.colors[0] || getColorByIndex(0, 'vibrant'),
        borderWidth: chartOptions.borderWidth,
        pointBackgroundColor: chartOptions.colors[0] || getColorByIndex(0, 'vibrant'),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartOptions.colors[0] || getColorByIndex(0, 'vibrant'),
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
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
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: false,
        },
      },
      scales: {
        r: {
          beginAtZero: chartOptions.beginAtZero,
          ticks: {
            font: { size: 11 },
          },
          pointLabels: {
            font: { size: chartOptions.labelFontSize, weight: 'bold' },
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateHeatmap(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Aggregate all commits by date
  const commitsByDate = {};
  datasets.forEach(ds => {
    if (ds.labels && ds.data && Array.isArray(ds.labels) && Array.isArray(ds.data)) {
      ds.labels.forEach((date, idx) => {
        if (date && ds.data[idx]) {
          commitsByDate[date] = (commitsByDate[date] || 0) + ds.data[idx];
        }
      });
    }
  });

  if (Object.keys(commitsByDate).length === 0) {
    throw new Error('No data available to generate heatmap');
  }

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

  const maxCommits = Math.max(...heatmapData.map(d => d.v), 1); // At least 1 to avoid division by zero

  const width = 1600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'matrix',
    data: {
      datasets: [{
        label: 'Commits',
        data: heatmapData,
        backgroundColor: (context: any) => {
          if (!context || !context.raw || context.raw.v === undefined) return '#ebedf0';
          const value = context.raw.v as number;
          if (value === 0) return '#ebedf0';
          const intensity = value / maxCommits;
          if (intensity < 0.25) return '#9be9a8';
          if (intensity < 0.5) return '#40c463';
          if (intensity < 0.75) return '#30a14e';
          return '#216e39';
        },
        borderWidth: 1,
        borderColor: '#ffffff',
        width: ({ chart }: any) => {
          const chartArea = chart.chartArea || { width: 1400 };
          return Math.max((chartArea.width as number) / 53 - 2, 10);
        },
        height: ({ chart }: any) => {
          const chartArea = chart.chartArea || { height: 300 };
          return Math.max((chartArea.height as number) / 7 - 2, 10);
        },
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
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
        tooltip: getTooltipConfig(chartOptions),
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

async function generatePolarAreaChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  const repoData = datasets.map(ds => ({
    name: ds.label,
    commits: Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0
  })).filter(r => r.commits > 0).sort((a, b) => b.commits - a.commits);

  if (repoData.length === 0) {
    throw new Error('No data available to generate polar area chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: repoData.map(r => r.name),
      datasets: [{
        data: repoData.map(r => r.commits),
        backgroundColor: repoData.map((_, i) => chartOptions.colors[i] || getColorByIndex(i, 'vibrant')),
        borderWidth: chartOptions.borderWidth,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Repository Activity`,
            `${totalCommits} total commits across ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, legendPosition: 'right' }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: chartOptions.labelFontSize },
          formatter: (value, ctx) => {
            const percentage = ((value / totalCommits) * 100).toFixed(1);
            return parseFloat(percentage) > 3 ? `${percentage}%` : '';
          },
        },
      },
      scales: {
        r: {
          beginAtZero: chartOptions.beginAtZero,
          ticks: {
            display: chartOptions.showGridLines,
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateScatterChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Convert timeline data to scatter points
  const scatterData = datasets.map((ds, index) => {
    const points = (ds.labels || []).map((date, i) => ({
      x: new Date(date).getTime(),
      y: ds.data?.[i] || 0,
    }));
    
    return {
      label: ds.label,
      data: points,
      backgroundColor: chartOptions.colors[index] || getColorByIndex(index, 'vibrant'),
      borderColor: chartOptions.colors[index] || getColorByIndex(index, 'vibrant'),
      borderWidth: chartOptions.borderWidth,
    };
  });

  if (scatterData.length === 0) {
    throw new Error('No data available to generate scatter chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: scatterData,
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Commit Scatter Plot`,
            `${totalCommits} commits across ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, showLegend: datasets.length <= 10 && chartOptions.showLegend }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
          title: {
            display: true,
            text: 'Date',
            font: { size: 14, weight: 'bold' },
          },
          grid: {
            display: chartOptions.showGridLines,
          },
        },
        y: {
          ...getScaleConfig(chartOptions, 'y'),
          title: {
            display: true,
            text: 'Commits',
            font: { size: 14, weight: 'bold' },
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateBubbleChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Convert timeline data to bubble points
  // x = date, y = commits that day, r = total commits in repo
  const bubbleData = datasets.map((ds, index) => {
    const totalRepoCommits = Array.isArray(ds.data) ? ds.data.reduce((sum, val) => sum + (val || 0), 0) : 0;
    const points = (ds.labels || []).map((date, i) => ({
      x: new Date(date).getTime(),
      y: ds.data?.[i] || 0,
      r: Math.max(5, Math.min(20, totalRepoCommits / 10)), // Scale bubble size
    }));
    
    return {
      label: ds.label,
      data: points,
      backgroundColor: (chartOptions.colors[index] || getColorByIndex(index, 'vibrant')) + '66',
      borderColor: chartOptions.colors[index] || getColorByIndex(index, 'vibrant'),
      borderWidth: chartOptions.borderWidth,
    };
  });

  if (bubbleData.length === 0) {
    throw new Error('No data available to generate bubble chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: bubbleData,
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Commit Bubble Chart`,
            `${totalCommits} commits • Bubble size represents repository activity`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, showLegend: datasets.length <= 10 && chartOptions.showLegend }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
          title: {
            display: true,
            text: 'Date',
            font: { size: 14, weight: 'bold' },
          },
          grid: {
            display: chartOptions.showGridLines,
          },
        },
        y: {
          ...getScaleConfig(chartOptions, 'y'),
          title: {
            display: true,
            text: 'Commits',
            font: { size: 14, weight: 'bold' },
          },
        },
      },
    },
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

async function generateMixedChart(
  username: string,
  platform: string,
  datasets: RenderDataset[],
  totalCommits: number,
  filename: string,
  chartOptions: Required<ChartCustomization>
): Promise<void> {
  const canvasModule = (await import('canvas')) as any;
  const createCanvas: (w: number, h: number) => any = canvasModule.createCanvas;
  
  // Merge all labels (unique sorted dates)
  const allDates = [
    ...new Set(datasets.flatMap((d) => d.labels || [])),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (allDates.length === 0) {
    throw new Error('No data available to generate mixed chart');
  }

  const width = 1600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx: any = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Create mixed type datasets - alternate between line and bar
  const mixedDatasets = datasets.map(({ labels, ...rest }: RenderDataset, index: number) => {
    const chartType = chartOptions.mixedChartTypes[rest.label] || (index % 2 === 0 ? 'line' : 'bar');
    const color = chartOptions.colors[index] || getColorByIndex(index, 'vibrant');
    
    return {
      ...rest,
      type: chartType,
      data: rest.data || [],
      borderColor: color,
      backgroundColor: chartType === 'line' ? color + '33' : color,
      borderWidth: chartOptions.borderWidth,
      tension: 0.3,
      fill: chartType === 'line' ? false : true,
    };
  });

  new Chart(ctx, {
    type: 'line', // Base type
    data: {
      labels: allDates,
      datasets: mixedDatasets as any,
    },
    options: {
      responsive: false,
      ...getAnimationConfig(chartOptions),
      plugins: {
        title: {
          display: chartOptions.showLabels,
          text: [
            `${username}'s ${platform.charAt(0).toUpperCase() + platform.slice(1)} Mixed Commit Chart`,
            `${totalCommits} commits across ${datasets.length} repositories`
          ],
          font: { size: 18, weight: 'bold' },
          padding: 20,
        },
        legend: getLegendConfig({ ...chartOptions, showLegend: datasets.length <= 15 && chartOptions.showLegend }),
        tooltip: getTooltipConfig(chartOptions),
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          ...getScaleConfig(chartOptions, 'x'),
          title: {
            display: true,
            text: 'Date',
            font: { size: 14, weight: 'bold' },
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            font: { size: 10 },
          },
        },
        y: {
          ...getScaleConfig(chartOptions, 'y'),
          title: {
            display: true,
            text: 'Number of Commits',
            font: { size: 14, weight: 'bold' },
          },
          ticks: {
            precision: 0,
            font: { size: 11 },
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
