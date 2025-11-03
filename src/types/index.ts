import type { Ora } from 'ora';

export interface TimelineConfig {
  verbose?: boolean;
  includeMerges?: boolean;
  openChart?: boolean;
  chartType?: ChartType;
  chartOptions?: ChartCustomization;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'heatmap' | 'polarArea' | 'scatter' | 'bubble' | 'mixed';

export type MixedChartSubType = 'line' | 'bar';

export interface ChartCustomization {
  // Colors and Gradients
  colors?: string[];
  useGradient?: boolean;
  gradientColors?: {
    start: string;
    end: string;
  };
  
  // Borders
  borderWidth?: number;
  borderColor?: string | string[];
  
  // Animations
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  
  // Scales
  scaleType?: 'linear' | 'logarithmic' | 'time';
  beginAtZero?: boolean;
  showGridLines?: boolean;
  
  // Labels and Text
  showLabels?: boolean;
  labelFontSize?: number;
  labelColor?: string;
  
  // Tooltips
  showTooltips?: boolean;
  tooltipBackgroundColor?: string;
  
  // Legend
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  // Plugins
  enableExport?: boolean;
  enableAnnotations?: boolean;
  enableZoom?: boolean;
  
  // Mixed Chart specific
  mixedChartTypes?: {
    [datasetLabel: string]: MixedChartSubType;
  };
}

export type Platform = 'github' | 'gitlab' | 'bitbucket' | 'sourcehut';

export interface Repository {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  repository: string;
}

export interface RepoStats {
  name: string;
  commits: number;
  firstCommit: Date | null;
  lastCommit: Date | null;
  contributors: Set<string>;
}

export interface GitProvider {
  fetchRepositories(username: string): Promise<Repository[]>;
  fetchCommits(username: string, repoName: string, spinner?: Ora): Promise<Commit[]>;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface CommandOptions {
  platform?: Platform;
  username?: string;
  repos?: string;
  all?: boolean;
  type?: ChartType;
  chart?: ChartType;
  verbose?: boolean;
  quiet?: boolean;
  merge?: boolean;
  noMerge?: boolean;
  open?: boolean;
  // Chart Customization Options
  colors?: string;
  gradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  borderWidth?: number;
  borderColor?: string;
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  scaleType?: string;
  zero?: boolean;
  grid?: boolean;
  labels?: boolean;
  labelSize?: number;
  labelColor?: string;
  tooltips?: boolean;
  tooltipBg?: string;
  legend?: boolean;
  legendPosition?: string;
  // Plugins
  exportEnabled?: boolean;
  annotationsEnabled?: boolean;
  zoomEnabled?: boolean;
}
